/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  Auth,
  User,
} from 'firebase/auth';
import { Donation, Volunteer, Project } from '../types';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

function getFirebasePublicConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
}

export function isGoogleWorkspaceConfigured(): boolean {
  const cfg = getFirebasePublicConfig();
  return Boolean(cfg.apiKey && cfg.projectId && cfg.appId);
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

function getGoogleAuthClient(): Auth | null {
  if (!isGoogleWorkspaceConfigured()) return null;
  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(getFirebasePublicConfig());
  }
  if (!cachedAuth) {
    cachedAuth = getAuth(cachedApp);
  }
  return cachedAuth;
}

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory access token cache (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
  owners?: { displayName: string; emailAddress: string }[];
}

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
    rowCount: number;
    columnCount: number;
  }[];
}

interface RawGoogleSheetItem {
  properties: {
    sheetId: number;
    title: string;
    gridProperties?: {
      rowCount?: number;
      columnCount?: number;
    };
  };
}

export type SheetCellValue = string | number | boolean | null | undefined;

export const initGoogleAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  const auth = getGoogleAuthClient();
  if (!auth) {
    if (onFailure) onFailure();
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else if (user && !isSigningIn) {
      if (onFailure) onFailure();
    } else {
      cachedAccessToken = null;
      if (onFailure) onFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  const auth = getGoogleAuthClient();
  if (!auth) {
    throw new Error(
      'Google Workspace integration is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.'
    );
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Could not retrieve access token from Google sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    return {
      user: result.user,
      accessToken: cachedAccessToken,
    };
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async (): Promise<void> => {
  const auth = getGoogleAuthClient();
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
};

export const getGoogleAccessToken = (): string | null => cachedAccessToken;

export const listDriveSpreadsheets = async (): Promise<DriveSpreadsheetFile[]> => {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not signed in to Google or missing access token.');

  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
  );
  const fields = encodeURIComponent('files(id,name,modifiedTime,webViewLink,owners)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=20`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Google Spreadsheets (${res.status})`
    );
  }

  const data = await res.json();
  return (data.files || []) as DriveSpreadsheetFile[];
};

export const getSpreadsheetMetadata = async (spreadsheetId: string): Promise<SheetMetadata> => {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not signed in to Google or missing access token.');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,properties.title,sheets.properties`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch spreadsheet metadata (${res.status})`
    );
  }

  const data = await res.json();
  const rawSheets = (data.sheets || []) as RawGoogleSheetItem[];
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    sheets: rawSheets.map((s) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      rowCount: s.properties.gridProperties?.rowCount || 0,
      columnCount: s.properties.gridProperties?.columnCount || 0,
    })),
  };
};

export const getSpreadsheetValues = async (
  spreadsheetId: string,
  range: string
): Promise<{ range: string; values: string[][] }> => {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not signed in to Google or missing access token.');

  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodedRange}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to read spreadsheet values (${res.status})`
    );
  }

  const data = await res.json();
  return {
    range: data.range,
    values: data.values || [],
  };
};

export const createSpreadsheet = async (
  title: string,
  headers?: string[],
  initialRows?: SheetCellValue[][]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not signed in to Google or missing access token.');

  const body: { properties: { title: string } } = {
    properties: { title },
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Spreadsheet (${res.status})`
    );
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId as string;
  const spreadsheetUrl =
    (data.spreadsheetUrl as string) || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const rowsToInsert: SheetCellValue[][] = [];
  if (headers && headers.length > 0) {
    rowsToInsert.push(headers);
  }
  if (initialRows && initialRows.length > 0) {
    rowsToInsert.push(...initialRows);
  }

  if (rowsToInsert.length > 0) {
    await appendSpreadsheetValues(spreadsheetId, 'Sheet1!A1', rowsToInsert);
  }

  return { spreadsheetId, spreadsheetUrl };
};

export const appendSpreadsheetValues = async (
  spreadsheetId: string,
  range: string,
  values: SheetCellValue[][]
): Promise<{ updatedRows: number; updatedRange: string }> => {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not signed in to Google or missing access token.');

  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to append values to spreadsheet (${res.status})`
    );
  }

  const data = await res.json();
  return {
    updatedRows: data.updates?.updatedRows || values.length,
    updatedRange: data.updates?.updatedRange || range,
  };
};

export const exportDonationsToSheet = async (
  donations: Donation[],
  existingSpreadsheetId?: string,
  sheetTitle: string = `NGO Donations Ledger (${new Date().toLocaleDateString()})`
): Promise<{ spreadsheetId: string; url: string; rowsCount: number }> => {
  const headers = [
    'Donation ID',
    'Date & Time',
    'Donor Name',
    'Email Address',
    'Amount (INR)',
    'Payment Method',
    'Campaign / Cause',
    '80G Receipt Number',
    'Tax Exemption Status',
    'Payment Status',
  ];

  const rows: SheetCellValue[][] = donations.map((d) => [
    d.id,
    d.createdAt,
    d.donorName,
    d.donorEmail,
    d.amount,
    d.paymentGateway,
    d.campaignTitle || 'General Fund',
    d.receiptNumber || 'N/A',
    d.taxExemptionEligible ? '80G Verified' : 'Standard',
    d.status,
  ]);

  if (existingSpreadsheetId) {
    await appendSpreadsheetValues(existingSpreadsheetId, 'Sheet1!A1', rows);
    return {
      spreadsheetId: existingSpreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${existingSpreadsheetId}/edit`,
      rowsCount: rows.length,
    };
  }

  const created = await createSpreadsheet(sheetTitle, headers, rows);
  return {
    spreadsheetId: created.spreadsheetId,
    url: created.spreadsheetUrl,
    rowsCount: rows.length,
  };
};

export const exportVolunteersToSheet = async (
  volunteers: Volunteer[],
  existingSpreadsheetId?: string,
  sheetTitle: string = `NGO Volunteer Roster (${new Date().toLocaleDateString()})`
): Promise<{ spreadsheetId: string; url: string; rowsCount: number }> => {
  const headers = [
    'Volunteer ID',
    'Application Date',
    'Full Name',
    'Email',
    'Phone',
    'Primary Skills',
    'Availability',
    'Location',
    'Status',
  ];

  const rows: SheetCellValue[][] = volunteers.map((v) => [
    v.id,
    v.joinedDate,
    v.name,
    v.email,
    v.phone,
    v.skills.join(', '),
    v.availability,
    v.location,
    v.status,
  ]);

  if (existingSpreadsheetId) {
    await appendSpreadsheetValues(existingSpreadsheetId, 'Sheet1!A1', rows);
    return {
      spreadsheetId: existingSpreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${existingSpreadsheetId}/edit`,
      rowsCount: rows.length,
    };
  }

  const created = await createSpreadsheet(sheetTitle, headers, rows);
  return {
    spreadsheetId: created.spreadsheetId,
    url: created.spreadsheetUrl,
    rowsCount: rows.length,
  };
};

export const exportProjectsToSheet = async (
  projects: Project[],
  existingSpreadsheetId?: string,
  sheetTitle: string = `NGO Projects & Budgets (${new Date().toLocaleDateString()})`
): Promise<{ spreadsheetId: string; url: string; rowsCount: number }> => {
  const headers = [
    'Project ID',
    'Title',
    'Sector / Category',
    'Target Budget (INR)',
    'Funds Raised (INR)',
    'Direct Beneficiaries',
    'Location / District',
    'Status',
    'Completion %',
  ];

  const rows: SheetCellValue[][] = projects.map((p) => [
    p.id,
    p.title,
    p.category,
    p.budget,
    p.amountRaised,
    p.beneficiariesCount,
    p.location,
    p.status,
    p.budget > 0 ? `${Math.round((p.amountRaised / p.budget) * 100)}%` : '0%',
  ]);

  if (existingSpreadsheetId) {
    await appendSpreadsheetValues(existingSpreadsheetId, 'Sheet1!A1', rows);
    return {
      spreadsheetId: existingSpreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${existingSpreadsheetId}/edit`,
      rowsCount: rows.length,
    };
  }

  const created = await createSpreadsheet(sheetTitle, headers, rows);
  return {
    spreadsheetId: created.spreadsheetId,
    url: created.spreadsheetUrl,
    rowsCount: rows.length,
  };
};
