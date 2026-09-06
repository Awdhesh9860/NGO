import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Search,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  Lock,
  ArrowRight,
  Sparkles,
  X,
  ExternalLink
} from 'lucide-react';

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  year: string | number;
  fileSize: string;
  fileUrl: string;
  description: string;
  downloadCount: number;
  createdAt: string;
  auditedBy?: string;
}

interface DocumentsViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onNavigate }) => {
  const { reports, settings } = useDatabase();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'ANNUAL_REPORT', label: 'Annual Reports' },
    { id: 'FINANCIAL_AUDIT', label: 'Financial & Audit' },
    { id: 'PROJECT_EVALUATION', label: 'Project Reports' },
    { id: 'LEGAL_REGISTRATION', label: 'Legal & Tax Certificates' },
    { id: 'POLICY', label: 'Governance & Policies' }
  ];

  // Additional governance documents
  const allDocuments: DocumentItem[] = [
    ...reports.map((r, i) => ({
      id: r.id,
      title: r.title,
      category: r.category === 'annual_report' ? 'ANNUAL_REPORT' : r.category === 'financial_audit' ? 'FINANCIAL_AUDIT' : 'POLICY',
      year: r.year,
      fileSize: r.fileSize || '1.2 MB',
      fileUrl: r.fileUrl || '#',
      description: r.summary || 'Official transparency disclosure and audited balance sheet for stakeholder inspection.',
      downloadCount: 180 + i * 45,
      createdAt: r.publishedDate || '2024-03-31',
      auditedBy: r.auditedBy
    })),
    {
      id: 'doc-legal-1',
      title: 'Official Non-Profit Society Registration Certificate',
      category: 'LEGAL_REGISTRATION',
      year: 2024,
      fileSize: '1.4 MB',
      fileUrl: '#',
      description: 'Official incorporation and state non-profit certificate under registration number [Registration Number].',
      downloadCount: 420,
      createdAt: '2024-01-15'
    },
    {
      id: 'doc-legal-2',
      title: 'Tax Exemption & Deduction Authorization (80G / 501c3)',
      category: 'LEGAL_REGISTRATION',
      year: 2024,
      fileSize: '1.1 MB',
      fileUrl: '#',
      description: 'Tax commissioner certificate validating donor tax deductibility under [Tax Exemption Number].',
      downloadCount: 890,
      createdAt: '2024-02-10'
    },
    {
      id: 'doc-pol-1',
      title: 'Child Safeguarding & Protection Policy',
      category: 'POLICY',
      year: 2025,
      fileSize: '850 KB',
      fileUrl: '#',
      description: 'Zero-tolerance code of conduct and safety guidelines governing all staff, volunteers, and project partners working around minors.',
      downloadCount: 310,
      createdAt: '2025-01-05'
    },
    {
      id: 'doc-pol-2',
      title: 'Anti-Corruption, Fraud Prevention & Whistleblower Policy',
      category: 'POLICY',
      year: 2025,
      fileSize: '780 KB',
      fileUrl: '#',
      description: 'Guidelines ensuring transparent procurement, dual-authorization financial sign-offs, and anonymous whistleblower protections.',
      downloadCount: 220,
      createdAt: '2025-01-12'
    }
  ];

  const filteredDocs = allDocuments.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || doc.year.toString() === selectedYear;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesYear && matchesSearch;
  });

  const handleDownload = (doc: DocumentItem) => {
    showToast(`Downloading "${doc.title}"...`, 'success');
    // Create a mock blob download
    const element = document.createElement('a');
    const file = new Blob([
      `Document Title: ${doc.title}\nCategory: ${doc.category}\nYear: ${doc.year}\nSummary: ${doc.description}\nIssued by: Hope Horizon Foundation\nRegistration: [Registration Number]\nStatus: Verified & Audited`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_${doc.year}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Full Public Accountability
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Documents, Audits & Transparency
          </h1>
          {/* 2. Why Transparency Matters */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We believe donors, community members, and volunteers have the right to inspect every report, audit statement, and policy document we maintain.
          </p>
        </div>
      </section>

      {/* Trust Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
            <span className="text-2xl font-black text-emerald-600">100% Verified</span>
            <p className="text-xs font-bold text-slate-800">Independent Auditor Reviewed</p>
            <p className="text-[11px] text-slate-400">Audited every financial year</p>
          </div>
          <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
            <span className="text-2xl font-black text-blue-600">Tax Exempt</span>
            <p className="text-xs font-bold text-slate-800">[Tax Exemption / 80G Certified]</p>
            <p className="text-[11px] text-slate-400">Valid & registered non-profit</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-purple-600">Open Access</span>
            <p className="text-xs font-bold text-slate-800">Free Public Downloads</p>
            <p className="text-[11px] text-slate-400">No login or fee required</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        {/* 11. Search & Filter Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>

            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 10. Documents Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-md bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 text-[10px] uppercase">
                    {doc.category.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 font-mono">Year {doc.year}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{doc.title}</h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {doc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {doc.fileSize} &bull; PDF
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePreviewDoc(doc)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                    title="View Document Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 12 & 13. Transparency Statement & Contact */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-600" />
            Our Transparency Pledge
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every donation received and every rupee spent is recorded in our accounting system. We maintain independent chartered accountant audits, state filings, and public documentation. If you need historical records or specific project receipts, our compliance officer is available to provide certified copies upon written request.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <span>Official Non-Profit Society Reg: <strong>[Registration Number]</strong></span>
            <span>&bull;</span>
            <span>Compliance Desk: <strong>compliance@hopehorizon.org</strong></span>
          </div>
        </section>
      </div>

      {/* Document Preview Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <button
              onClick={() => setActivePreviewDoc(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                {activePreviewDoc.category.replace('_', ' ')}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500 font-mono">Year {activePreviewDoc.year}</span>
            </div>

            <h2 className="text-xl font-black text-slate-900">{activePreviewDoc.title}</h2>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <p><strong>Description:</strong> {activePreviewDoc.description}</p>
              <p><strong>Issuing Authority:</strong> Board of Trustees / Certified Independent Chartered Accountant</p>
              <p><strong>Format:</strong> Verified PDF &bull; {activePreviewDoc.fileSize}</p>
              <p><strong>Legal Verification:</strong> Compliant under [Registration Number]</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownload(activePreviewDoc);
                  setActivePreviewDoc(null);
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Download Certified Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
