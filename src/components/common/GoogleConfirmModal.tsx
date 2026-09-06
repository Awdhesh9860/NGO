/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, FileSpreadsheet, Check, X, AlertTriangle } from 'lucide-react';

interface GoogleConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  targetName?: string;
  itemsCount?: number;
  actionType: 'create' | 'append' | 'update' | 'delete';
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GoogleConfirmModal: React.FC<GoogleConfirmModalProps> = ({
  isOpen,
  title,
  description,
  targetName,
  itemsCount,
  actionType,
  isProcessing = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <header className="flex items-start gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              actionType === 'delete'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {actionType === 'delete' ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <FileSpreadsheet className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Google Workspace Data Confirmation
            </p>
          </div>
        </header>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p className="leading-relaxed">{description}</p>

          {(targetName || itemsCount !== undefined) && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs">
              {targetName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Target Sheet / File:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">
                    {targetName}
                  </span>
                </div>
              )}
              {itemsCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Rows Affected:</span>
                  <span className="font-bold text-emerald-700">{itemsCount} row(s)</span>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-slate-400 italic">
            This action will modify or create files in your personal or organizational Google Drive with your explicit consent.
          </p>
        </div>

        <footer className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 ${
              actionType === 'delete'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isProcessing ? (
              <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Confirm & Proceed'}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};
