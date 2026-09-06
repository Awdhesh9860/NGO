import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Send,
  Camera,
  MapPin,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StaffPortal: React.FC = () => {
  const { projects, campaigns, updateMilestoneStatus, addCampaignUpdate } = useDatabase();
  const { currentUser } = useAuth();

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !updateTitle || !updateContent) return;

    addCampaignUpdate(selectedCampaignId, {
      title: updateTitle,
      content: updateContent,
      author: currentUser?.name || 'Field Coordinator'
    });

    setUpdateSuccess(true);
    setUpdateTitle('');
    setUpdateContent('');

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold text-emerald-300 uppercase border border-emerald-500/30">
                Frontline Operations Desk
              </span>
              <span className="text-xs text-slate-400">
                Lead: <strong className="text-white">{currentUser?.role.replace('_', ' ')}</strong>
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black">{currentUser?.name || 'David Chen'}</h1>
            <p className="text-xs text-slate-300">Field Project Management & Beneficiary Telemetry</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs text-center min-w-32 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Projects In Care</span>
            <span className="text-2xl font-black text-white">{projects.length} Field Sites</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Milestones + Post Live Field Update */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Project Milestones Sign-off */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Field Project Milestones</h3>
              <p className="text-xs text-slate-500">Toggle milestone completion to sync with donor impact feeds.</p>
            </div>
            <FolderKanban className="h-6 w-6 text-emerald-600" />
          </div>

          <div className="space-y-6">
            {projects.map((proj) => (
              <div key={proj.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    {proj.location}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {proj.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => updateMilestoneStatus(proj.id, m.id, !m.completed)}
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                            m.completed
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <div>
                          <p className={`font-semibold ${m.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {m.title}
                          </p>
                          <span className="text-[10px] text-slate-500">{m.description}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                        {m.targetDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Broadcast Live Ground Zero Update */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Ground Zero Update</h3>
                <p className="text-xs text-slate-500">Pushes directly to public campaign & donor feed.</p>
              </div>
              <Camera className="h-5 w-5 text-emerald-600" />
            </div>

            {updateSuccess && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center justify-between">
                <span>Update published to public feed!</span>
                <button onClick={() => setUpdateSuccess(false)} className="font-bold text-emerald-800">
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handlePostUpdate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 bg-white outline-none"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Update Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Pipeline Pressure Test Succeeded"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Field Narrative & Metric *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Details of today's field deployment, testing numbers, beneficiary feedback..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition"
              >
                <Send className="h-4 w-4" />
                Publish Ground Dispatch
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
