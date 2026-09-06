/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import { GoogleConfirmModal } from '../common/GoogleConfirmModal';
import {
  signInWithGoogle,
  signOutGoogle,
  getGoogleAccessToken,
  initGoogleAuth,
  listDriveSpreadsheets,
  getSpreadsheetMetadata,
  getSpreadsheetValues,
  appendSpreadsheetValues,
  createSpreadsheet,
  exportDonationsToSheet,
  exportVolunteersToSheet,
  exportProjectsToSheet,
  DriveSpreadsheetFile,
  SheetMetadata,
  WORKSPACE_SCOPES
} from '../../services/googleWorkspace';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  Table,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Database,
  Users,
  Heart,
  Briefcase,
  Layers,
  Clock,
  Eye,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface GoogleSheetsHubProps {
  onNavigate?: (view: string, id?: string) => void;
  compact?: boolean;
}

export const GoogleSheetsHub: React.FC<GoogleSheetsHubProps> = ({ onNavigate, compact = false }) => {
  const { donations, volunteerApplications, projects } = useDatabase();
  const { success, error, info } = useToast();

  // Google Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Drive files & selection
  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | null>(null);
  const [customSpreadsheetInput, setCustomSpreadsheetInput] = useState<string>('');

  // Active sheet inspection
  const [activeMetadata, setActiveMetadata] = useState<SheetMetadata | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('Sheet1');
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState<boolean>(false);

  // New row input state
  const [showAddRow, setShowAddRow] = useState<boolean>(false);
  const [newRowValues, setNewRowValues] = useState<string>('');

  // Confirmation Modal state for mutating actions (REQUIRED BY SKILL)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetName?: string;
    itemsCount?: number;
    actionType: 'create' | 'append' | 'update' | 'delete';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'create',
    onConfirm: async () => {}
  });
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Initialize listener on mount
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasToken(!!token);
      },
      () => {
        setGoogleUser(null);
        setHasToken(false);
      }
    );

    // Also check current memory token
    const token = getGoogleAccessToken();
    if (token) {
      setHasToken(true);
    }

    return () => unsubscribe();
  }, []);

  // When token becomes available, fetch Drive spreadsheets automatically
  useEffect(() => {
    if (hasToken) {
      handleLoadDriveSpreadsheets();
    }
  }, [hasToken]);

  // Load Google Drive spreadsheets
  const handleLoadDriveSpreadsheets = async () => {
    setIsLoadingDrive(true);
    try {
      const files = await listDriveSpreadsheets();
      setSpreadsheets(files);
      if (files.length > 0 && !selectedSpreadsheetId) {
        handleSelectSpreadsheet(files[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching drive spreadsheets:', err);
      // Non-blocking notification
      if (err.message && !err.message.includes('Not signed in')) {
        error('Could not load Google Spreadsheets', err.message);
      }
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await signInWithGoogle();
      setGoogleUser(result.user);
      setHasToken(true);
      success('Connected to Google Workspace', `Signed in as ${result.user.displayName || result.user.email}`);
    } catch (err: any) {
      console.error('Sign in failure:', err);
      error('Google Sign In Failed', err.message || 'Please check popup permissions.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Google Sign Out Handler
  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogle();
      setGoogleUser(null);
      setHasToken(false);
      setSpreadsheets([]);
      setActiveMetadata(null);
      setSheetRows([]);
      setSelectedSpreadsheetId(null);
      info('Disconnected from Google', 'Access token removed from memory.');
    } catch (err: any) {
      error('Sign Out Failed', err.message);
    }
  };

  // Select spreadsheet to inspect
  const handleSelectSpreadsheet = async (sheetId: string) => {
    setSelectedSpreadsheetId(sheetId);
    setIsLoadingRows(true);
    try {
      const meta = await getSpreadsheetMetadata(sheetId);
      setActiveMetadata(meta);
      const firstTab = meta.sheets[0]?.title || 'Sheet1';
      setSelectedTab(firstTab);
      await loadSheetValues(sheetId, `${firstTab}!A1:Z50`);
    } catch (err: any) {
      console.error('Error loading spreadsheet:', err);
      error('Failed to load Sheet', err.message);
    } finally {
      setIsLoadingRows(false);
    }
  };

  // Load sheet cell values
  const loadSheetValues = async (sheetId: string, range: string) => {
    setIsLoadingRows(true);
    try {
      const res = await getSpreadsheetValues(sheetId, range);
      setSheetRows(res.values || []);
    } catch (err: any) {
      console.error('Error loading values:', err);
      error('Could not read cells', err.message);
    } finally {
      setIsLoadingRows(false);
    }
  };

  // Tab change in inspector
  const handleTabChange = async (tabTitle: string) => {
    if (!selectedSpreadsheetId) return;
    setSelectedTab(tabTitle);
    await loadSheetValues(selectedSpreadsheetId, `${tabTitle}!A1:Z50`);
  };

  // Quick Exporter 1: Donations
  const triggerExportDonations = () => {
    if (!hasToken) {
      error('Google Sign In Required', 'Please connect your Google account first.');
      return;
    }

    const count = donations.length;
    const title = `NGO Donations & 80G Receipts Ledger (${new Date().toLocaleDateString()})`;

    setConfirmModal({
      isOpen: true,
      title: 'Create Google Sheet for Donations?',
      description: `This will create a new Google Sheet named "${title}" in your Google Drive and populate it with verified donor records and 80G receipts.`,
      targetName: title,
      itemsCount: count,
      actionType: 'create',
      onConfirm: async () => {
        const res = await exportDonationsToSheet(donations, undefined, title);
        success('Exported to Google Sheets!', `Created new spreadsheet with ${res.rowsCount} donation records.`);
        await handleLoadDriveSpreadsheets();
        handleSelectSpreadsheet(res.spreadsheetId);
      }
    });
  };

  // Quick Exporter 2: Volunteers
  const triggerExportVolunteers = () => {
    if (!hasToken) {
      error('Google Sign In Required', 'Please connect your Google account first.');
      return;
    }

    const count = volunteerApplications.length;
    const title = `NGO Volunteers & Field Coordinators (${new Date().toLocaleDateString()})`;

    setConfirmModal({
      isOpen: true,
      title: 'Create Google Sheet for Volunteers?',
      description: `This will create a new Google Sheet named "${title}" in your Google Drive with volunteer contact details, assigned programs, and verification statuses.`,
      targetName: title,
      itemsCount: count,
      actionType: 'create',
      onConfirm: async () => {
        const res = await exportVolunteersToSheet(volunteerApplications, undefined, title);
        success('Exported to Google Sheets!', `Created new spreadsheet with ${res.rowsCount} volunteer entries.`);
        await handleLoadDriveSpreadsheets();
        handleSelectSpreadsheet(res.spreadsheetId);
      }
    });
  };

  // Quick Exporter 3: Projects
  const triggerExportProjects = () => {
    if (!hasToken) {
      error('Google Sign In Required', 'Please connect your Google account first.');
      return;
    }

    const count = projects.length;
    const title = `NGO Projects & Budgets Ledger (${new Date().toLocaleDateString()})`;

    setConfirmModal({
      isOpen: true,
      title: 'Create Google Sheet for Projects & Budgets?',
      description: `This will create a new Google Sheet named "${title}" in your Google Drive detailing project budgets, funds raised, and completion percentages.`,
      targetName: title,
      itemsCount: count,
      actionType: 'create',
      onConfirm: async () => {
        const res = await exportProjectsToSheet(projects, undefined, title);
        success('Exported to Google Sheets!', `Created new spreadsheet with ${res.rowsCount} project rows.`);
        await handleLoadDriveSpreadsheets();
        handleSelectSpreadsheet(res.spreadsheetId);
      }
    });
  };

  // Append a custom row to the currently selected sheet
  const handleAppendRow = () => {
    if (!selectedSpreadsheetId || !newRowValues.trim()) {
      error('Empty row', 'Please enter comma-separated values for the new row.');
      return;
    }

    const rowArray = newRowValues.split(',').map((v) => v.trim());
    const sheetName = activeMetadata?.title || 'Selected Spreadsheet';

    setConfirmModal({
      isOpen: true,
      title: 'Append Row to Google Sheet?',
      description: `This will append 1 new row into tab "${selectedTab}" of "${sheetName}".`,
      targetName: `${sheetName} (${selectedTab})`,
      itemsCount: 1,
      actionType: 'append',
      onConfirm: async () => {
        await appendSpreadsheetValues(selectedSpreadsheetId, `${selectedTab}!A1`, [rowArray]);
        success('Row Appended', 'Successfully added 1 row to your Google Sheet.');
        setNewRowValues('');
        setShowAddRow(false);
        await loadSheetValues(selectedSpreadsheetId, `${selectedTab}!A1:Z50`);
      }
    });
  };

  // Connect custom sheet ID or URL
  const handleConnectCustomSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSpreadsheetInput.trim()) return;

    let id = customSpreadsheetInput.trim();
    // Support pasting full URL like https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
    const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      id = match[1];
    }

    handleSelectSpreadsheet(id);
    setCustomSpreadsheetInput('');
  };

  // Confirm Modal executor
  const handleExecuteModalConfirm = async () => {
    setIsProcessingAction(true);
    try {
      await confirmModal.onConfirm();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error('Action failed:', err);
      error('Operation Failed', err.message || 'Could not complete Google Sheets action.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filteredSpreadsheets = spreadsheets.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileSpreadsheet className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Google Sheets Integration & Data Sync
                </h1>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                  Live API
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Connect your Google account with permission to automatically create, view, and sync NGO donation ledgers, volunteer rosters, and project progress in Google Spreadsheets and Google Drive.
              </p>
            </div>
          </div>

          {/* Google Auth Status / Actions */}
          <div className="flex items-center gap-3">
            {!hasToken ? (
              <div className="flex flex-col items-end gap-1.5">
                {/* Official Google Sign-In Button format as required by Skill */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="gsi-material-button shadow-xs"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                    </span>
                    <span style={{ display: 'none' }}>Sign in with Google</span>
                  </div>
                </button>
                <span className="text-[10px] text-slate-400">
                  Enables Drive & Sheets API scopes with user consent
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
                {googleUser?.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="h-9 w-9 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {googleUser?.email?.charAt(0).toUpperCase() || 'G'}
                  </div>
                )}

                <div className="space-y-0.5 text-left pr-2">
                  <p className="text-xs font-bold text-slate-900 leading-none">
                    {googleUser?.displayName || 'Google Account Connected'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-none truncate max-w-[160px]">
                    {googleUser?.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  title="Disconnect Google Account"
                  className="rounded-xl p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Permission Info Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span>Authorized Scopes:</span>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
            drive.file
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
            drive.readonly
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
            spreadsheets
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
            spreadsheets.readonly
          </span>
          <span className="text-[11px] text-slate-400 ml-auto">
            In-memory security: Access tokens are never stored in browser storage
          </span>
        </div>
      </div>

      {/* 2. 1-Click NGO Templates Section */}
      <section aria-labelledby="templates-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="templates-heading" className="text-base sm:text-lg font-bold text-slate-900">
              1-Click NGO Export Templates
            </h2>
            <p className="text-xs text-slate-500">
              Instantly create ready-to-use Google Spreadsheets in your Google Drive with verified NGO state.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Template Card 1: Donations */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                {donations.length} Verified Records
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Donations & 80G Tax Ledger</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Export donor names, payment methods, transaction timestamps, and 80G tax receipt serials into a clean accounting spreadsheet.
              </p>
            </div>

            <button
              onClick={triggerExportDonations}
              className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Export Donations to Google Sheet</span>
            </button>
          </div>

          {/* Template Card 2: Volunteers */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                {volunteerApplications.length} Applicants
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Volunteer & Staff Roster</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Export volunteer contacts, skill categories, weekly availability, and district assignments for field operations coordination.
              </p>
            </div>

            <button
              onClick={triggerExportVolunteers}
              className="w-full rounded-2xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Export Volunteers to Google Sheet</span>
            </button>
          </div>

          {/* Template Card 3: Projects */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                {projects.length} Field Projects
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Projects & Budgets Tracker</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Export field programs, funding milestones, beneficiary counts, and project completion metrics for trustee reviews.
              </p>
            </div>

            <button
              onClick={triggerExportProjects}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Export Projects to Google Sheet</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Google Drive Spreadsheets Browser & Custom Link */}
      <section aria-labelledby="browser-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 id="browser-heading" className="text-base sm:text-lg font-bold text-slate-900">
              Google Drive Spreadsheets
            </h2>
            <p className="text-xs text-slate-500">
              Select any spreadsheet from your Google Drive or link an existing Google Sheet URL.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleConnectCustomSheet} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste Spreadsheet ID or URL..."
                value={customSpreadsheetInput}
                onChange={(e) => setCustomSpreadsheetInput(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-emerald-500 w-48 sm:w-64"
              />
              <button
                type="submit"
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
              >
                Load
              </button>
            </form>

            <button
              onClick={handleLoadDriveSpreadsheets}
              disabled={!hasToken || isLoadingDrive}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Drive files grid */}
        {!hasToken ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center space-y-3">
            <FolderOpen className="h-10 w-10 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-700">Google Drive Not Connected</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sign in with your Google account above to browse spreadsheets stored in your Google Drive and inspect rows in real time.
              </p>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer inline-flex items-center gap-2"
            >
              <span>Connect Google Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : isLoadingDrive ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-2">
            <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Scanning your Google Drive for spreadsheets...</p>
          </div>
        ) : spreadsheets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
            <FileSpreadsheet className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">
              No Google Spreadsheets found in your Drive. Use one of the 1-Click Export templates above to create your first sheet!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spreadsheets.slice(0, 6).map((file) => {
              const isSelected = selectedSpreadsheetId === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => handleSelectSpreadsheet(file.id)}
                  className={`rounded-2xl border p-4 transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileSpreadsheet
                        className={`h-5 w-5 shrink-0 ${
                          isSelected ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {file.name}
                      </span>
                    </div>

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-emerald-600 transition p-1"
                        title="Open in Google Sheets (New Tab)"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>
                      {file.modifiedTime
                        ? `Updated ${new Date(file.modifiedTime).toLocaleDateString()}`
                        : 'Drive Spreadsheet'}
                    </span>
                    <span
                      className={`font-bold ${
                        isSelected ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {isSelected ? 'Active Sheet' : 'Inspect →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Active Spreadsheet Inspector & Live Row Preview */}
      {selectedSpreadsheetId && (
        <section aria-labelledby="inspector-heading" className="space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Table className="h-4 w-4" />
                  </span>
                  <h3 id="inspector-heading" className="text-base font-bold text-slate-900 truncate">
                    {activeMetadata?.title || 'Selected Spreadsheet'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {selectedSpreadsheetId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${selectedSpreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  <span>Open in Google Sheets</span>
                </a>

                <button
                  onClick={() => setShowAddRow(!showAddRow)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Append Row</span>
                </button>
              </div>
            </header>

            {/* Tab Selector if multi-sheet */}
            {activeMetadata?.sheets && activeMetadata.sheets.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-500 mr-1">Sheets:</span>
                {activeMetadata.sheets.map((sheet) => (
                  <button
                    key={sheet.sheetId}
                    onClick={() => handleTabChange(sheet.title)}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                      selectedTab === sheet.title
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                    }`}
                  >
                    {sheet.title} ({sheet.rowCount} rows)
                  </button>
                ))}
              </div>
            )}

            {/* Expandable Add Row Form */}
            {showAddRow && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Add New Row to &ldquo;{selectedTab}&rdquo;
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Enter comma-separated cell values
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="e.g. DON-2026-999, 2026-09-06, Rahul Verma, rahul@gmail.com, 5000, UPI, Clean Water Fund"
                    value={newRowValues}
                    onChange={(e) => setNewRowValues(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAppendRow}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
                    >
                      Save Row to Sheet
                    </button>
                    <button
                      onClick={() => setShowAddRow(false)}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 px-3 py-2 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cells Table Render */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              {isLoadingRows ? (
                <div className="p-12 text-center space-y-2">
                  <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Fetching cells from Google Sheets API...</p>
                </div>
              ) : sheetRows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  This sheet tab is currently empty. Use the &ldquo;Append Row&rdquo; button above or one of the 1-Click Export templates.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3 w-10 text-center text-slate-400 font-mono text-[10px]">
                        #
                      </th>
                      {sheetRows[0].map((col, idx) => (
                        <th key={idx} className="p-3 font-bold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sheetRows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 text-center text-slate-400 font-mono text-[10px]">
                          {rIdx + 2}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-700 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <footer className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span>
                Showing {Math.max(0, sheetRows.length - 1)} row(s) loaded from Google Sheets API
              </span>
              <button
                onClick={() =>
                  selectedSpreadsheetId &&
                  loadSheetValues(selectedSpreadsheetId, `${selectedTab}!A1:Z50`)
                }
                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reload Cells</span>
              </button>
            </footer>
          </div>
        </section>
      )}

      {/* Mandatory User Confirmation Modal (REQUIRED BY SKILL FOR MUTATING WORKSPACE OPERATIONS) */}
      <GoogleConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        targetName={confirmModal.targetName}
        itemsCount={confirmModal.itemsCount}
        actionType={confirmModal.actionType}
        isProcessing={isProcessingAction}
        onConfirm={handleExecuteModalConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
