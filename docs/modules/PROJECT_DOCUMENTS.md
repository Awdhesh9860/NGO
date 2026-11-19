# Project Documents & Media Module

**Module Ownership:** Operations & Storage Squad (`src/features/project-documents/`, `src/integrations/storage/local.provider.ts`, `src/server/database/models/ProjectDocument.ts`, `src/app/api/v1/projects/[id]/documents/route.ts`)  
**Phase:** 07 — Enterprise Program & Project Management

## 1. Storage Architecture
Uses the pluggable `IStorageProvider` adapter boundary (`src/integrations/storage/storage.adapter.ts`) implemented by `ManagedStorageProvider` (`src/integrations/storage/local.provider.ts`).
- Only metadata (`fileName`, `storageKey`, `fileUrl`, `mimeType`, `fileSizeBytes`, `category`, `visibility`) is persisted in MongoDB — large file binaries are never stored in MongoDB documents.
- Every download link returned by `/api/v1/projects/[id]/documents` is a short-lived HMAC-signed URL (`getSignedDownloadUrl`, default 15 minutes).

## 2. File Validation & Categories
- **Categories:** `PROPOSAL`, `APPROVAL`, `AGREEMENT`, `REPORT`, `PROGRESS_PHOTO`, `COMPLETION_REPORT`, `SUPPORTING`.
- **Allowed MIME Types:** PDF, DOC/DOCX, XLS/XLSX, CSV, JPEG, PNG, WEBP.
- **Max Size:** 15 MB (`15 * 1024 * 1024` bytes).

## 3. Visibility Authorization
- `INTERNAL`: Accessible to authenticated project team members & viewers within the same tenant.
- `RESTRICTED`: Restricted to users holding `project_documents.manage` or `projects.approve` (or `SUPER_ADMIN`).
- `PUBLIC_APPROVED`: Publishing requires `content.publish` or `projects.approve`; only `PUBLIC_APPROVED` `PROGRESS_PHOTO` assets are projected to public project detail APIs.
