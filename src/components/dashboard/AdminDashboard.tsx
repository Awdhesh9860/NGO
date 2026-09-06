import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { Donation, Project, Campaign, Volunteer, Certificate, AuditLog } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import { CertificateViewModal } from '../common/CertificateViewModal';
import { SecurityAuditCenter } from './SecurityAuditCenter';
import {
  LayoutDashboard,
  DollarSign,
  FolderKanban,
  Heart,
  Users,
  Award,
  FileText,
  ShieldCheck,
  Activity,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Edit,
  Eye,
  Settings,
  Mail,
  Tag
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenDonate: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenDonate }) => {
  const {
    donations,
    projects,
    campaigns,
    volunteerApplications,
    certificates,
    auditLogs,
    reports,
    articles,
    settings,
    subscribers,
    updateVolunteerStatus,
    issueCertificate,
    addDonation,
    addProject,
    addCampaign,
    addReport,
    addAuditLog
  } = useDatabase();

  const { currentUser, hasPermission, allUsers } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedReceiptDonation, setSelectedReceiptDonation] = useState<Donation | null>(null);
  const [selectedViewCert, setSelectedViewCert] = useState<Certificate | null>(null);

  // Search and filter states
  const [donationSearch, setDonationSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'donor' | 'volunteer' | 'both'>('all');

  // Modal / Form states
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [showIssueCertModal, setShowIssueCertModal] = useState(false);
  const [certTargetVolunteer, setCertTargetVolunteer] = useState<Volunteer | null>(null);

  // New Donation form state
  const [newDonationData, setNewDonationData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    panOrTaxId: '',
    amount: '',
    campaignTitle: 'General Social Welfare Fund',
    paymentGateway: 'bank_transfer' as any,
    notes: 'Offline wire contribution entered by admin'
  });

  // New Project form state
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    category: 'Water Security',
    location: '',
    fundingGoal: '',
    description: '',
    managerName: currentUser?.name || 'David Chen'
  });

  // New Campaign form state
  const [newCampaignData, setNewCampaignData] = useState({
    title: '',
    category: 'Disaster Relief',
    targetAmount: '',
    description: '',
    isUrgent: true,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80'
  });

  // Issue Certificate form state
  const [newCertData, setNewCertData] = useState({
    recipientName: '',
    recipientEmail: '',
    title: 'Certificate of Outstanding Volunteer Service',
    description: 'For dedicated frontline service supporting rural education and clean water deployments.',
    type: 'VOLUNTEER' as any
  });

  // Totals calculations
  const totalDonationsAmount = donations.reduce((acc, d) => acc + d.amount, 0);
  const totalBeneficiaries = projects.reduce((acc, p) => acc + p.beneficiariesCount, 0);
  const totalVolunteersCount = volunteerApplications.length;
  const pendingVolunteersCount = volunteerApplications.filter((v) => v.status === 'applied' || v.status === 'under_review').length;

  // Handlers
  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonationData.donorName || !newDonationData.amount) return;

    const created = addDonation({
      donorName: newDonationData.donorName,
      donorEmail: newDonationData.donorEmail || 'supporter@community.org',
      donorPhone: newDonationData.donorPhone,
      panOrTaxId: newDonationData.panOrTaxId || undefined,
      isAnonymous: false,
      amount: parseFloat(newDonationData.amount) || 0,
      currency: settings.currencyCode,
      donationType: 'one-time',
      campaignTitle: newDonationData.campaignTitle,
      paymentGateway: newDonationData.paymentGateway,
      transactionId: `manual_tx_${Math.random().toString(36).substring(2, 9)}`,
      taxExemptionEligible: true,
      notes: newDonationData.notes
    });

    setShowAddDonationModal(false);
    setSelectedReceiptDonation(created);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.title || !newProjectData.fundingGoal) return;

    addProject({
      title: newProjectData.title,
      programId: 'prog-1',
      category: newProjectData.category,
      location: newProjectData.location || 'Grassroots District',
      fundingGoal: parseFloat(newProjectData.fundingGoal) || 10000,
      amountRaised: 0,
      beneficiariesCount: 250,
      description: newProjectData.description,
      managerName: newProjectData.managerName,
      images: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
      ],
      milestones: [
        {
          id: 'm-1',
          title: 'Initial Land & Community Survey',
          targetDate: '2025-10-15',
          completed: false,
          description: 'Community approval and site engineering assessment.'
        }
      ]
    });

    setShowAddProjectModal(false);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignData.title || !newCampaignData.targetAmount) return;

    addCampaign({
      title: newCampaignData.title,
      category: newCampaignData.category,
      targetAmount: parseFloat(newCampaignData.targetAmount) || 25000,
      raisedAmount: 0,
      donorCount: 0,
      description: newCampaignData.description,
      image: newCampaignData.image,
      isUrgent: newCampaignData.isUrgent,
      updates: []
    });

    setShowAddCampaignModal(false);
  };

  const handleIssueCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertData.recipientName) return;

    const cert = issueCertificate({
      recipientName: newCertData.recipientName,
      recipientEmail: newCertData.recipientEmail || 'volunteer@hopehorizon.org',
      type: newCertData.type,
      certificateType: 'Volunteer Service',
      organizationName: 'Smart Computer Academy',
      title: newCertData.title,
      description: newCertData.description,
      issuedBy: currentUser?.name || 'Dr. Evelyn Vance',
      issuerRole: currentUser?.role.replace('_', ' ') || 'Executive Trustee'
    });

    setShowIssueCertModal(false);
    setSelectedViewCert(cert);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase border border-emerald-500/30">
              Enterprise Governance Control
            </span>
            <span className="text-xs text-slate-400">
              Role: <strong className="text-white">{currentUser?.role.replace('_', ' ')}</strong>
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
            NGO Operational Management Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time audit telemetry, donations ledger, volunteer rosters, and certificate issuance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {hasPermission('donations.view_all') && (
            <button
              onClick={() => setShowAddDonationModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
            >
              <Plus className="h-4 w-4" /> Log Offline Donation
            </button>
          )}
          {hasPermission('projects.manage') && (
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <Plus className="h-4 w-4" /> New Field Project
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Raised
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            ${totalDonationsAmount.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{donations.length} 80G receipts issued</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Projects
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            {projects.length}
          </p>
          <div className="mt-1 text-[11px] text-slate-500">
            {totalBeneficiaries.toLocaleString()} souls impacted
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Volunteer Force
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            {totalVolunteersCount}
          </p>
          <div className="mt-1 text-[11px] font-semibold text-amber-600">
            {pendingVolunteersCount} pending approval review
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Verified Certificates
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            {certificates.length}
          </p>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
            100% Cryptographically verified
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Activity', icon: Activity },
          { id: 'donations', label: 'Donations & 80G Receipts', icon: DollarSign },
          { id: 'projects', label: 'Projects & Milestones', icon: FolderKanban },
          { id: 'campaigns', label: 'Crowdfunding Appeals', icon: Heart },
          { id: 'volunteers', label: 'Volunteer Applications', icon: Users },
          { id: 'leads', label: 'Newsletter & Leads', icon: Mail },
          { id: 'certificates', label: 'Issued Certificates', icon: Award },
          { id: 'transparency', label: 'Audits & Reports', icon: FileText },
          { id: 'audit_logs', label: 'Security & Audit Logs', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & RECENT ACTIVITY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Recent Activity Feed */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Real-Time Operational Audit Feed</h3>
              <span className="text-xs text-slate-500 font-mono">Live Immutable Ledger</span>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.userName}</span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-mono uppercase">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-400 shrink-0 ml-4">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: NGO Health Status */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Statutory Compliance Status</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 text-emerald-900">
                  <span className="font-semibold">Section 80G Exemption</span>
                  <span className="font-bold">Active Valid</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50 text-blue-900">
                  <span className="font-semibold">FCRA Foreign Giving</span>
                  <span className="font-bold">Approved</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-purple-50 text-purple-900">
                  <span className="font-semibold">MCA CSR-1 Registration</span>
                  <span className="font-bold">Verified</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-6 text-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Staff & User Accounts
              </h4>
              <p className="text-xs text-slate-300">
                Total authenticated users across 9 RBAC roles: <strong>{allUsers.length} active</strong>
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {allUsers.slice(0, 6).map((u) => (
                  <span key={u.id} className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    {u.name.split(' ')[0]} ({u.role.split('_')[0]})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DONATIONS & 80G RECEIPTS */}
      {activeTab === 'donations' && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Donations & 80G Tax Receipts Ledger</h3>
              <p className="text-xs text-slate-500">Every donation generates a statutory tax exemption receipt.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search donor or receipt..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddDonationModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Offline
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-y border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Donor Name & Email</th>
                  <th className="py-3 px-4">PAN / Tax ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations
                  .filter(
                    (d) =>
                      d.donorName.toLowerCase().includes(donationSearch.toLowerCase()) ||
                      d.receiptNumber.toLowerCase().includes(donationSearch.toLowerCase())
                  )
                  .map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.receiptNumber}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{d.donorName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{d.donorEmail}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{d.panOrTaxId || '—'}</td>
                      <td className="py-3 px-4 font-black text-emerald-700">
                        {d.currency} {d.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 truncate max-w-xs">{d.campaignTitle || 'General Impact'}</td>
                      <td className="py-3 px-4 capitalize font-medium">{d.paymentGateway}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceiptDonation(d)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                        >
                          <Printer className="h-3 w-3" />
                          View 80G
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS & MILESTONES */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Field Projects & Milestone Management</h3>
              <p className="text-xs text-slate-500">Track budgets, milestone sign-offs, and field leads.</p>
            </div>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Create New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                    {proj.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">{proj.location}</span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>

                <div className="space-y-1.5 rounded-2xl bg-slate-50 p-3.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>Budget Raised</span>
                    <span className="text-emerald-700 font-bold">
                      ${proj.amountRaised.toLocaleString()} / ${proj.fundingGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${Math.min(100, (proj.amountRaised / proj.fundingGoal) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Milestones ({proj.milestones.filter((m) => m.completed).length}/{proj.milestones.length})
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {proj.milestones.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5">
                          {m.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={m.completed ? 'line-through text-slate-400' : ''}>{m.title}</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{m.targetDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CROWDFUNDING APPEALS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Fundraising Campaigns & Emergency Appeals</h3>
              <p className="text-xs text-slate-500">Manage campaign targets, live updates, and donor counts.</p>
            </div>
            <button
              onClick={() => setShowAddCampaignModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Launch New Appeal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800 uppercase">
                    {camp.category}
                  </span>
                  {camp.isUrgent && (
                    <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Urgent
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900">{camp.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{camp.description}</p>

                <div className="space-y-1.5 rounded-2xl bg-slate-50 p-3.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-emerald-700">${camp.raisedAmount.toLocaleString()}</span>
                    <span className="text-slate-500">${camp.targetAmount.toLocaleString()} Goal</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${Math.min(100, (camp.raisedAmount / camp.targetAmount) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-right">{camp.donorCount} Donors Participated</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: VOLUNTEER MANAGEMENT */}
      {activeTab === 'volunteers' && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Volunteer Applications & Roster</h3>
              <p className="text-xs text-slate-500">Review applicant qualifications, approve placement, and issue certificates.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search volunteer name or skill..."
                value={volunteerSearch}
                onChange={(e) => setVolunteerSearch(e.target.value)}
                className="rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-y border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Skills & Availability</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volunteerApplications
                  .filter(
                    (v) =>
                      v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
                      v.skills.some((s) => s.toLowerCase().includes(volunteerSearch.toLowerCase()))
                  )
                  .map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{v.name}</span>
                        <span className="text-[11px] text-slate-400">{v.joinedDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-mono">{v.email}</p>
                        <p className="text-slate-400">{v.phone}</p>
                      </td>
                      <td className="py-3 px-4">{v.location}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {v.skills.map((s, i) => (
                            <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              {s}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{v.availability}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            v.status === 'approved' || v.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {(v.status === 'applied' || v.status === 'under_review') && (
                          <>
                            <button
                              onClick={() => updateVolunteerStatus(v.id, 'approved')}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateVolunteerStatus(v.id, 'rejected')}
                              className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(v.status === 'approved' || v.status === 'active') && (
                          <button
                            onClick={() => {
                              setCertTargetVolunteer(v);
                              setNewCertData({
                                recipientName: v.name,
                                recipientEmail: v.email,
                                title: 'Certificate of Outstanding Humanitarian Service',
                                description: `In recognition of dedicated service and expertise in ${v.skills.join(', ')}.`,
                                type: 'VOLUNTEER'
                              });
                              setShowIssueCertModal(true);
                            }}
                            className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-700"
                          >
                            Issue Certificate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CERTIFICATES MANAGEMENT */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cryptographically Verified Certificates</h3>
              <p className="text-xs text-slate-500">Every certificate contains a unique public verification hash.</p>
            </div>
            <button
              onClick={() => {
                setNewCertData({
                  recipientName: '',
                  recipientEmail: '',
                  title: 'Certificate of Outstanding Recognition',
                  description: 'Awarded for extraordinary philanthropy and grassroots dedication.',
                  type: 'DONOR'
                });
                setShowIssueCertModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800 shadow-xs"
            >
              <Award className="h-4 w-4" /> Issue New Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded">
                    {cert.certificateNumber}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{cert.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Presented to: <strong className="text-slate-900">{cert.recipientName}</strong></p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {cert.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">Hash: {cert.verificationCode}</span>
                  <button
                    onClick={() => setSelectedViewCert(cert)}
                    className="flex items-center gap-1 font-bold text-amber-800 hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" /> View / Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDITS & REPORTS */}
      {activeTab === 'transparency' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Statutory Audit Reports Repository</h3>
              <p className="text-xs text-slate-500">Manage downloadable disclosures and quarterly FCRA returns.</p>
            </div>
            <button
              onClick={() => {
                addReport({
                  title: 'Quarterly Field Audited Utilization Statement Q1 2025',
                  year: '2025',
                  category: 'ANNUAL_AUDIT',
                  fileUrl: '/documents/Q1-2025-Audit.pdf',
                  fileSize: '3.1 MB',
                  publishedDate: '2025-06-30',
                  auditedBy: 'Deloitte Haskins & Sells',
                  summary: 'Direct field spend audited at 88.4% with zero material variances.'
                });
              }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Publish Audit Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep) => (
              <div key={rep.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">{rep.title}</span>
                  <span className="text-emerald-700">FY {rep.year}</span>
                </div>
                <p className="text-slate-500">{rep.summary}</p>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Auditor: {rep.auditedBy || 'Statutory Panel'}</span>
                  <span>{rep.fileSize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: NEWSLETTER & LEADS CAPTURE */}
      {activeTab === 'leads' && (
        <div id="admin-leads-management" className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Subscribers</span>
              <p className="mt-2 text-2xl font-black text-slate-900">{subscribers.length}</p>
              <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Verified lead pipeline</div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Donor Leads</span>
              <p className="mt-2 text-2xl font-black text-emerald-900">
                {subscribers.filter((s) => s.interest === 'donor' || s.interest === 'both').length}
              </p>
              <div className="mt-1 text-[11px] text-emerald-700">80G tax receipt prospects</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Volunteer Leads</span>
              <p className="mt-2 text-2xl font-black text-amber-900">
                {subscribers.filter((s) => s.interest === 'volunteer' || s.interest === 'both').length}
              </p>
              <div className="mt-1 text-[11px] text-amber-700">Fieldwork & mentorship pool</div>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Active Rate</span>
              <p className="mt-2 text-2xl font-black text-indigo-900">
                {subscribers.length > 0
                  ? Math.round(
                      (subscribers.filter((s) => s.status === 'active').length / subscribers.length) * 100
                    )
                  : 100}
                %
              </p>
              <div className="mt-1 text-[11px] text-indigo-700">Zero spam, opt-in consent</div>
            </div>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="admin-subscriber-search-input"
                type="text"
                placeholder="Search leads by email, name or tag..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Filter:</span>
              {(['all', 'donor', 'volunteer', 'both'] as const).map((fil) => (
                <button
                  key={fil}
                  id={`admin-lead-filter-${fil}`}
                  onClick={() => setSubscriberFilter(fil)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition shrink-0 ${
                    subscriberFilter === fil
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {fil === 'both' ? 'All Updates' : fil === 'all' ? 'All Leads' : `${fil}s`}
                </button>
              ))}

              <button
                id="admin-leads-export-csv-btn"
                onClick={() => {
                  const csvRows = [
                    ['Email', 'Full Name', 'Phone', 'Interest', 'Frequency', 'Status', 'Lead Tags', 'Subscribed At', 'Source'],
                    ...subscribers.map((s) => [
                      s.email,
                      s.fullName || '',
                      s.phone || '',
                      s.interest,
                      s.frequency,
                      s.status,
                      (s.leadTags || []).join('; '),
                      s.subscribedAt,
                      s.source || 'footer'
                    ])
                  ];
                  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `hopehorizon_newsletter_leads_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs ml-auto shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Lead / Contact</th>
                    <th className="px-4 py-3.5">Interest & Cadence</th>
                    <th className="px-4 py-3.5">Lead Tags</th>
                    <th className="px-4 py-3.5">Source & Joined</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {subscribers
                    .filter((sub) => {
                      if (subscriberFilter !== 'all' && sub.interest !== subscriberFilter) {
                        return false;
                      }
                      if (!subscriberSearch) return true;
                      const q = subscriberSearch.toLowerCase();
                      return (
                        sub.email.toLowerCase().includes(q) ||
                        (sub.fullName && sub.fullName.toLowerCase().includes(q)) ||
                        (sub.leadTags && sub.leadTags.some((t) => t.toLowerCase().includes(q)))
                      );
                    })
                    .map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{sub.email}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            {sub.fullName && <span>{sub.fullName}</span>}
                            {sub.phone && <span>• {sub.phone}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                sub.interest === 'donor'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.interest === 'volunteer'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {sub.interest === 'donor'
                                ? 'Donor Prospect'
                                : sub.interest === 'volunteer'
                                ? 'Volunteer Prospect'
                                : 'All Dispatches'}
                            </span>
                            <span className="text-[11px] text-slate-400 capitalize">({sub.frequency})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {sub.leadTags && sub.leadTags.length > 0 ? (
                              sub.leadTags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 font-medium"
                                >
                                  <Tag className="h-2.5 w-2.5 text-slate-400" />
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-800 capitalize font-medium">{sub.source || 'footer'}</div>
                          <div className="text-[10px] text-slate-400">{sub.subscribedAt ? sub.subscribedAt.split('T')[0] : 'Recent'}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              sub.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                sub.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {sub.status === 'active' ? 'Subscribed' : 'Unsubscribed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SECURITY & AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <SecurityAuditCenter />
      )}

      {/* MODAL: ADD DONATION */}
      {showAddDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Log Manual / Offline Donation</h3>
            <form onSubmit={handleCreateDonation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Donor Name *</label>
                  <input
                    type="text"
                    required
                    value={newDonationData.donorName}
                    onChange={(e) => setNewDonationData({ ...newDonationData, donorName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={newDonationData.amount}
                    onChange={(e) => setNewDonationData({ ...newDonationData, amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email (for 80G receipt)</label>
                  <input
                    type="email"
                    value={newDonationData.donorEmail}
                    onChange={(e) => setNewDonationData({ ...newDonationData, donorEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PAN / Tax ID</label>
                  <input
                    type="text"
                    value={newDonationData.panOrTaxId}
                    onChange={(e) => setNewDonationData({ ...newDonationData, panOrTaxId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation Campaign</label>
                <select
                  value={newDonationData.campaignTitle}
                  onChange={(e) => setNewDonationData({ ...newDonationData, campaignTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                >
                  <option value="General Social Welfare & Impact Fund">General Social Welfare & Impact Fund</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDonationModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Save & Issue 80G Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New Grassroots Field Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Aquifer Plant in Jodhpur District"
                  value={newProjectData.title}
                  onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newProjectData.category}
                    onChange={(e) => setNewProjectData({ ...newProjectData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="Water Security">Water Security</option>
                    <option value="Girls Education">Girls Education</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Funding Budget ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="35000"
                    value={newProjectData.fundingGoal}
                    onChange={(e) => setNewProjectData({ ...newProjectData, fundingGoal: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Field Location</label>
                <input
                  type="text"
                  placeholder="e.g. Thar Desert, Rajasthan, India"
                  value={newProjectData.location}
                  onChange={(e) => setNewProjectData({ ...newProjectData, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CAMPAIGN */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Launch New Urgent Crowdfunding Appeal</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Flood Rescue Fund"
                  value={newCampaignData.title}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCampaignData.category}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Education">Education</option>
                    <option value="Water Security">Water Security</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Goal ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={newCampaignData.targetAmount}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, targetAmount: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Narrative Summary</label>
                <textarea
                  rows={3}
                  value={newCampaignData.description}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Launch Appeal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE CERTIFICATE */}
      {showIssueCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Issue Verified Digital Certificate</h3>
            <form onSubmit={handleIssueCert} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recipient Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newCertData.recipientName}
                  onChange={(e) => setNewCertData({ ...newCertData, recipientName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Certificate Award Title *</label>
                <input
                  type="text"
                  required
                  value={newCertData.title}
                  onChange={(e) => setNewCertData({ ...newCertData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Citation / Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newCertData.description}
                  onChange={(e) => setNewCertData({ ...newCertData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueCertModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-700 px-5 py-2 font-bold text-white hover:bg-amber-800"
                >
                  Generate & Sign Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT MODAL */}
      {selectedReceiptDonation && (
        <ReceiptModal
          donation={selectedReceiptDonation}
          onClose={() => setSelectedReceiptDonation(null)}
        />
      )}

      {/* VIEW CERTIFICATE MODAL */}
      {selectedViewCert && (
        <CertificateViewModal
          certificate={selectedViewCert}
          onClose={() => setSelectedViewCert(null)}
        />
      )}
    </div>
  );
};
