'use client';

import React, { useState } from 'react';
import { ProjectDocumentItem } from '@/features/projects/services/project-api.service';
import { DOCUMENT_CATEGORIES, DOCUMENT_VISIBILITIES } from '../schemas/document.schema';
import { EmptyState, PermissionGate } from '@/features/admin';
import { FileText, Upload, Trash2, Download, Lock, Globe } from 'lucide-react';

export interface ProjectDocumentsPanelProps {
  documents: ProjectDocumentItem[];
  onUpload: (data: {
    title: string;
    category: (typeof DOCUMENT_CATEGORIES)[number];
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    visibility: (typeof DOCUMENT_VISIBILITIES)[number];
    description?: string;
  }) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
}

export function ProjectDocumentsPanel({ documents, onUpload, onDelete }: ProjectDocumentsPanelProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof DOCUMENT_CATEGORIES)[number]>('PROPOSAL');
  const [visibility, setVisibility] = useState<(typeof DOCUMENT_VISIBILITIES)[number]>('INTERNAL');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: number } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile({ name: f.name, type: f.type || 'application/pdf', size: Math.max(1, f.size) });
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    try {
      setUploading(true);
      await onUpload({
        title,
        category,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        fileSizeBytes: selectedFile.size,
        visibility,
        description: description || undefined,
      });
      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <PermissionGate anyPermissions={['project_documents.manage', 'projects.manage']}>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b] p-4 space-y-3"
        >
          <p className="font-bold text-slate-900 dark:text-white">Register Project Document Metadata</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title *"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as (typeof DOCUMENT_CATEGORIES)[number])}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as (typeof DOCUMENT_VISIBILITIES)[number])}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1d17] px-3 py-2"
            >
              <option value="INTERNAL">Internal (Project Team)</option>
              <option value="RESTRICTED">Restricted (Managers / Approvers)</option>
              <option value="PUBLIC_APPROVED">Public Approved (Photos / Public Reports)</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="flex-1 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-emerald-700"
            />
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087F5B] px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{uploading ? 'Uploading…' : 'Upload Document'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Validated MIME allowlist (PDF, DOCX, XLSX, CSV, JPEG, PNG, WEBP) • Max 15 MB • Stored via IStorageProvider with signed download URLs.
          </p>
        </form>
      </PermissionGate>

      {documents.length === 0 ? (
        <EmptyState
          title="No project documents uploaded"
          description="Attach proposals, MoUs, approval records, field photos, and completion reports securely."
          icon={<FileText className="h-6 w-6" />}
        />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-[#1d332b] rounded-2xl border border-[#e2ece6] dark:border-[#1d332b] bg-white dark:bg-[#12221b]">
          {documents.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-700 dark:text-emerald-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{doc.title}</p>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {doc.category.replace(/_/g, ' ')}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold">
                      {doc.visibility === 'PUBLIC_APPROVED' ? (
                        <Globe className="h-2.5 w-2.5 text-sky-600" />
                      ) : (
                        <Lock className="h-2.5 w-2.5 text-amber-600" />
                      )}
                      {doc.visibility}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {doc.fileName} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB •{' '}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={doc.signedDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500"
                >
                  <Download className="h-3 w-3" />
                  <span>Signed Link</span>
                </a>
                <PermissionGate anyPermissions={['project_documents.manage', 'projects.manage']}>
                  <button
                    type="button"
                    onClick={() => onDelete(doc.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
