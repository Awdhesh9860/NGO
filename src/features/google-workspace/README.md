# Google Workspace Integration Feature Module
**Module Path**: `src/features/google-workspace`  
**Domain**: Firebase Auth + Google Drive & Sheets Live Synchronization  

## Responsibilities
- Client-side OAuth authentication with Google Workspace scopes.
- In-memory access token management (never leaked to localStorage).
- Live discovery of Google Drive spreadsheets.
- Export of Donations, Volunteers, and Projects into Google Spreadsheets.
- In-app preview of remote Google Spreadsheet data.

## Public Exports (`index.ts`)
- `signInWithGoogle`, `signOutGoogle`: Google OAuth lifecycle handlers.
- `GoogleSheetsHub`: Interactive spreadsheet export and preview widget.
- `GoogleSheetsView`: Dedicated public route view controller.
