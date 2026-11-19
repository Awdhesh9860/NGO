import crypto from 'crypto';
import { ValidationError } from '@/lib/error-handler';
import { toMinorUnits } from '@/lib/money';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getDerivedKey(): Buffer {
  const secret =
    process.env.FINANCIAL_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'dev-only-financial-encryption-key-do-not-use-in-prod';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive bank account numbers or vendor banking details using AES-256-GCM.
 * Returns base64-encoded payload: `v1:<iv>:<authTag>:<ciphertext>`.
 */
export function encryptFinancialSecret(plaintext: string): string {
  const normalized = plaintext.trim();
  if (!normalized) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getDerivedKey(), iv);
  const encrypted = Buffer.concat([cipher.update(normalized, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypts AES-256-GCM financial secret payloads created by `encryptFinancialSecret`.
 */
export function decryptFinancialSecret(payload?: string | null): string {
  if (!payload) return '';
  const parts = payload.split(':');
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new ValidationError('Invalid encrypted financial credential format');
  }
  const iv = Buffer.from(parts[1], 'base64');
  const authTag = Buffer.from(parts[2], 'base64');
  const ciphertext = Buffer.from(parts[3], 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, getDerivedKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Masks sensitive bank account numbers so full numbers are never exposed in general APIs or tables.
 * Example: "123456789012" -> "••••••••9012"
 */
export function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\s+/g, '');
  if (digits.length <= 4) {
    return '••••';
  }
  const visible = digits.slice(-4);
  const maskCount = Math.max(4, Math.min(12, digits.length - 4));
  return `${'•'.repeat(maskCount)}${visible}`;
}

/**
 * Protects CSV exports from spreadsheet formula injection (=, +, -, @, \t, \r).
 */
export function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  const escaped = safe.replace(/"/g, '""');
  return `"${escaped}"`;
}

export interface ParsedBankStatementRow {
  transactionDate: Date;
  description: string;
  reference: string;
  debitMinor: number;
  creditMinor: number;
  runningBalanceMinor?: number;
  rowFingerprint: string;
  rawRowSnapshot: string;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseAmountToMinor(raw: string | undefined, currency: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[₹$€£,\s]/g, '').trim();
  if (!cleaned || cleaned === '-') return 0;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) {
    throw new ValidationError(`Invalid numeric amount "${raw}" in bank statement CSV`);
  }
  return toMinorUnits(num, currency);
}

/**
 * Validates and parses bank statement CSV rows.
 * Expected header columns (case-insensitive, flexible aliases):
 * date / transaction_date, description / narration, reference / ref, debit / withdrawal, credit / deposit, balance (optional)
 * Enforces row limit and rejects formula payloads or invalid dates.
 */
export function parseBankStatementCsv(
  csvContent: string,
  currency = 'INR',
  maxRows = 1000
): ParsedBankStatementRow[] {
  if (!csvContent || !csvContent.trim()) {
    throw new ValidationError('Bank statement CSV content cannot be empty');
  }
  if (csvContent.length > 5 * 1024 * 1024) {
    throw new ValidationError('Bank statement CSV exceeds maximum 5 MB import limit');
  }
  // Reject binary/null-byte uploads masquerading as CSV
  if (/\0/.test(csvContent)) {
    throw new ValidationError('Invalid CSV content: binary data detected');
  }

  const lines = csvContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new ValidationError('Bank statement CSV must include a header row and at least one transaction row');
  }
  if (lines.length - 1 > maxRows) {
    throw new ValidationError(`CSV import exceeds maximum ${maxRows} rows per batch`);
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const findCol = (aliases: string[]): number => {
    const exact = headers.findIndex((h) => aliases.includes(h));
    if (exact >= 0) return exact;
    return headers.findIndex((h) => aliases.some((a) => a.length >= 3 && h.includes(a)));
  };

  const dateIdx = findCol(['transactiondate', 'date', 'valuedate', 'txndate']);
  const descIdx = findCol(['description', 'narration', 'particulars', 'memo']);
  const refIdx = findCol(['reference', 'ref', 'utr', 'chequeno', 'txnid']);
  const debitIdx = findCol(['debit', 'withdrawal', 'dr']);
  const creditIdx = findCol(['credit', 'deposit', 'cr']);
  const balIdx = findCol(['balance', 'runningbalance', 'closingbalance']);

  if (dateIdx < 0 || descIdx < 0 || (debitIdx < 0 && creditIdx < 0)) {
    throw new ValidationError(
      'CSV header must include Date, Description (or Narration), and Debit/Credit columns'
    );
  }

  const rows: ParsedBankStatementRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const cols = splitCsvLine(rawLine);
    const dateRaw = cols[dateIdx] || '';
    const parsedDate = new Date(dateRaw);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError(`Invalid transaction date "${dateRaw}" on CSV row ${i + 1}`);
    }

    const description = (cols[descIdx] || '').replace(/^[=+\-@]+/, '').trim();
    if (!description) {
      throw new ValidationError(`Missing description on CSV row ${i + 1}`);
    }
    const reference = (refIdx >= 0 ? cols[refIdx] || '' : '').replace(/^[=+\-@]+/, '').trim();
    const debitMinor = debitIdx >= 0 ? parseAmountToMinor(cols[debitIdx], currency) : 0;
    const creditMinor = creditIdx >= 0 ? parseAmountToMinor(cols[creditIdx], currency) : 0;

    if (debitMinor === 0 && creditMinor === 0) {
      throw new ValidationError(`Row ${i + 1} must have either a positive debit or positive credit amount`);
    }
    if (debitMinor > 0 && creditMinor > 0) {
      throw new ValidationError(`Row ${i + 1} cannot contain both debit and credit values simultaneously`);
    }

    const runningBalanceMinor =
      balIdx >= 0 && cols[balIdx] && cols[balIdx].trim() !== ''
        ? parseAmountToMinor(cols[balIdx], currency)
        : undefined;

    const fingerprintInput = [
      parsedDate.toISOString().slice(0, 10),
      description.toLowerCase(),
      reference.toLowerCase(),
      String(debitMinor),
      String(creditMinor),
      runningBalanceMinor !== undefined ? String(runningBalanceMinor) : '',
    ].join('|');

    const rowFingerprint = crypto.createHash('sha256').update(fingerprintInput).digest('hex');

    rows.push({
      transactionDate: parsedDate,
      description,
      reference,
      debitMinor,
      creditMinor,
      runningBalanceMinor,
      rowFingerprint,
      rawRowSnapshot: rawLine.slice(0, 1000),
    });
  }

  return rows;
}
