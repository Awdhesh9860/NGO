import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Search, X, FolderKanban, Heart, Calendar, FileText, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSelectResult?: (type: string, id: string) => void;
  onNavigate?: (view: string, id?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen = true,
  onClose,
  onSelectResult,
  onNavigate
}) => {
  const handleSelect = (type: string, id: string) => {
    if (onSelectResult) {
      onSelectResult(type, id);
    } else if (onNavigate) {
      onNavigate(type, id);
    }
    onClose();
  };
  const { programs, projects, campaigns, events, articles, reports } = useDatabase();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredPrograms = trimmed
    ? programs.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredProjects = trimmed
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.location.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredCampaigns = trimmed
    ? campaigns.filter(
        (c) =>
          c.title.toLowerCase().includes(trimmed) ||
          c.description.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredEvents = trimmed
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(trimmed) ||
          e.location.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredArticles = trimmed
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(trimmed) ||
          a.excerpt.toLowerCase().includes(trimmed) ||
          a.tags.some((t) => t.toLowerCase().includes(trimmed))
      )
    : [];

  const filteredReports = trimmed
    ? reports.filter(
        (r) =>
          r.title.toLowerCase().includes(trimmed) ||
          r.summary.toLowerCase().includes(trimmed)
      )
    : [];

  const totalResults =
    filteredPrograms.length +
    filteredProjects.length +
    filteredCampaigns.length +
    filteredEvents.length +
    filteredArticles.length +
    filteredReports.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Search Input Box */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search programs, projects, disaster appeals, audit reports, events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!trimmed && (
            <div className="py-8 text-center text-slate-400">
              <Search className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">Type to search projects, campaigns, transparency reports, and blogs.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Clean Water', 'Child Education', 'Floods', 'Audit 2025', '80G Tax', 'Volunteer'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {trimmed && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">No results found for "{query}".</p>
              <p className="text-xs text-slate-400 mt-1">Try keywords like education, water, flood, report, or event.</p>
            </div>
          )}

          {/* Campaigns */}
          {filteredCampaigns.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Campaigns ({filteredCampaigns.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredCampaigns.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect('campaign', c.id)}
                    className="w-full flex items-center justify-between rounded-xl p-2.5 text-left hover:bg-emerald-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{c.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Goal: ${c.targetAmount.toLocaleString('en-US')} • Raised: ${c.raisedAmount.toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Projects ({filteredProjects.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect('project', p.id)}
                    className="w-full flex items-center justify-between rounded-xl p-2.5 text-left hover:bg-emerald-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{p.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Location: {p.location} • Status: {p.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reports */}
          {filteredReports.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Transparency Reports ({filteredReports.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect('transparency', r.id)}
                    className="w-full flex items-center justify-between rounded-xl p-2.5 text-left hover:bg-emerald-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{r.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Year: {r.year} • Audited by: {r.auditedBy || 'Statutory Panel'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {filteredEvents.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Events ({filteredEvents.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleSelect('event', e.id)}
                    className="w-full flex items-center justify-between rounded-xl p-2.5 text-left hover:bg-emerald-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{e.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Date: {e.date} • {e.location}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
