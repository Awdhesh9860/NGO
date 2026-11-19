# Vendor & Accounts Payable Bill Management

**Models**: `Vendor.ts`, `VendorBill.ts`  
**Service**: `src/server/services/expense-vendor.service.ts`  
**API**: `/api/v1/finance/vendors`, `/api/v1/finance/vendors/[id]`, `/api/v1/finance/vendors/[id]/bills`  
**Admin UI**: `/dashboard/admin/finance/vendors`

---

## 1. Vendor Registry & Banking Protection
- Each vendor receives a tenant-scoped `vendorCode` (`VND-YYYY-XXXXXX`), vendor type, contact info, optional legal tax identifier, and status (`ACTIVE` | `INACTIVE` | `SUSPENDED`).
- **Bank Detail Encryption & Masking**: Optional vendor payout account numbers are encrypted at rest via AES-256-GCM (`encryptFinancialSecret`) in a `select: false` column (`bankAccountEncrypted`). General API responses return only `bankAccountMasked` (last 4 digits) and only when the viewer holds `finance.vendors.manage`.

## 2. Vendor Bill Controls
- Tracks `billNumber`, `billDate`, `dueDate`, integer minor `subtotalMinor`, `taxAmountMinor`, `totalAmountMinor`, `paidAmountMinor`, `approvalStatus`, and `paymentStatus`.
- **Duplicate Bill Prevention**: Enforced both in service validation (`findDuplicateVendorBill`) and via compound unique MongoDB index `{ organizationId, vendorId, billNumber }`, returning `409 Conflict`.
- **Vendor Outstanding Summary**: `getVendorDetail()` computes exact integer `outstandingBalanceMinor = totalBilledMinor - totalPaidMinor`.
