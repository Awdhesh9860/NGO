import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDatabase } from '../../context/DatabaseContext';
import { UserRole } from '../../types';
import {
  Heart,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  Shield,
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';

interface DonorRegisterPageProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: (campaignId?: string) => void;
}

export const DonorRegisterPage: React.FC<DonorRegisterPageProps> = ({
  onNavigate,
  onOpenDonate
}) => {
  const { register, login } = useAuth();
  const { showToast } = useToast();
  const { recordAuditLog } = useDatabase();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Form State
  const [donorType, setDonorType] = useState<'individual' | 'corporate' | 'patron'>('individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [country, setCountry] = useState('India');
  
  // Tax & 80G Information
  const [panNumber, setPanNumber] = useState('');
  const [taxAddress, setTaxAddress] = useState('');
  const [wants80GReceipt, setWants80GReceipt] = useState(true);
  
  // Giving Preferences
  const [primaryCauses, setPrimaryCauses] = useState<string[]>([
    'Clean Water & Sanitation',
    'Child Education & Scholarships'
  ]);
  const [givingFrequency, setGivingFrequency] = useState<'monthly' | 'one_time' | 'annual'>('monthly');
  const [pledgedAmount, setPledgedAmount] = useState<number>(5000);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [employerMatch, setEmployerMatch] = useState(false);

  // Security & Credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available causes to select
  const availableCauses = [
    { id: 'water', label: 'Clean Water & Sanitation', desc: 'Solar deep borewells & community RO filters' },
    { id: 'edu', label: 'Child Education & Scholarships', desc: 'STEM labs, digital smart classrooms, uniforms' },
    { id: 'health', label: 'Mobile Healthcare & Diagnostics', desc: 'Rural vans providing free screenings & medicines' },
    { id: 'women', label: 'Women Micro-Enterprises', desc: 'Vocational tailoring, handloom & financial literacy' },
    { id: 'relief', label: 'Emergency & Flood Relief Ops', desc: 'Immediate rations, shelter kits & clean water pouches' },
    { id: 'solar', label: 'Green Energy & Solar Microgrids', desc: 'Off-grid lighting for tribal hamlets' }
  ];

  const toggleCause = (label: string) => {
    if (primaryCauses.includes(label)) {
      setPrimaryCauses(primaryCauses.filter((c) => c !== label));
    } else {
      setPrimaryCauses([...primaryCauses, label]);
    }
  };

  // 80G Tax Exemption Calculation Simulator (50% deduction)
  const estimatedTaxSavings = Math.round(pledgedAmount * 0.5 * 0.3); // 30% tax bracket assumption
  const impactSummary =
    pledgedAmount >= 50000
      ? 'Funds a complete village digital classroom or solar borewell unit for 200+ villagers'
      : pledgedAmount >= 15000
      ? 'Sponsors full-year tuition and nutritional meals for 3 rural students'
      : pledgedAmount >= 5000
      ? 'Provides 100 sterile water filtration kits for flood-impacted families'
      : 'Supplies essential school backpacks and stationery to 10 children';

  const handleStepNext = () => {
    if (currentStep === 1) {
      if (!fullName.trim()) {
        showToast('Please enter your full name', 'error');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        showToast('Please provide a valid email address', 'error');
        return;
      }
      if (!phone.trim()) {
        showToast('Please provide a contact phone number', 'error');
        return;
      }
    }

    if (currentStep === 2) {
      if (wants80GReceipt && panNumber.trim().length > 0 && panNumber.trim().length !== 10) {
        showToast('Indian PAN cards are exactly 10 alphanumeric characters (e.g., ABCDE1234F)', 'warning');
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      showToast('Please agree to the HopeHorizon donor charter and privacy terms', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters for security', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Register new user as DONOR
      register({
        name: fullName,
        email: email,
        role: 'DONOR',
        department: donorType === 'corporate' ? `CSR - ${organizationName}` : 'Philanthropic Benefactor',
        phone: phone,
        panNumber: panNumber || undefined,
        givingInterests: primaryCauses,
        givingFrequency: givingFrequency,
        isAnonymous: isAnonymous
      });

      recordAuditLog(
        'usr-new-donor',
        fullName,
        'DONOR',
        'DONOR_ONBOARDED',
        'DonorRegistry',
        `New donor onboarding completed (${donorType}). Pledged frequency: ${givingFrequency}, PAN registered: ${panNumber ? 'YES' : 'NO'}`
      );

      showToast(`Welcome to HopeHorizon, ${fullName}! Your Donor account is active.`, 'success');
      
      // Auto sign in and navigate to donor dashboard
      onNavigate('dashboard');
    }, 600);
  };

  return (
    <div id="donor-register-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Philanthropic Patron Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Register as an Official HopeHorizon Donor
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Gain transparent access to our 100% tax-exempt 80G certificates, live field progress trackers, project milestones, and impact portfolios.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-500">Already a registered donor?</span>
            <button
              onClick={() => onNavigate('login')}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:border-emerald-600 hover:text-emerald-700 transition shadow-2xs"
            >
              Sign In to Account &rarr;
            </button>
          </div>
        </div>

        {/* PROGRESS STEPPER BAR */}
        <div className="mb-8 rounded-2xl bg-white p-4 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { step: 1, title: 'Identity & Profile', icon: User },
              { step: 2, title: '80G Tax Exemption', icon: FileText },
              { step: 3, title: 'Causes & Cadence', icon: Heart },
              { step: 4, title: 'Security & Access', icon: Lock }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isPassed = currentStep > item.step;

              return (
                <div
                  key={item.step}
                  onClick={() => isPassed && setCurrentStep(item.step)}
                  className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition ${
                    isPassed ? 'cursor-pointer hover:bg-slate-50' : ''
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Step 0{item.step}</p>
                    <p
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-slate-900' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID (Left Form 7 Cols, Right Tax/Privileges Sidebar 5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT FORM WORKSPACE (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            
            {/* STEP 1: IDENTITY & DONOR PROFILE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Donor Profile & Category</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your giving entity type and tell us how we should address your receipts and certificates.
                  </p>
                </div>

                {/* Donor Type Switcher */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'individual', label: 'Individual', desc: 'Personal tax exemption', icon: User },
                    { id: 'corporate', label: 'Corporate CSR', desc: 'Company 80G / Schedule VII', icon: Building },
                    { id: 'patron', label: 'Family Patron', desc: 'Endowment & Foundation', icon: Award }
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = donorType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setDonorType(type.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                        <h4 className="text-xs font-bold text-slate-900">{type.label}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{type.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>{donorType === 'corporate' ? 'Primary Contact Person' : 'Full Name'} *</span>
                      <span className="text-[10px] text-slate-400">As shown on Tax Identity</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Awdhesh Kumar"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                    />
                  </div>

                  {donorType === 'corporate' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Company / Entity Registered Name *</label>
                      <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="e.g. Acme Technologies India Pvt Ltd"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="donor@example.com"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">City / State</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai, Maharashtra"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Country of Residence</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden bg-white"
                      >
                        <option value="India">India (Section 80G Eligible)</option>
                        <option value="United States">United States (501(c)(3) Eligible)</option>
                        <option value="United Kingdom">United Kingdom (Gift Aid)</option>
                        <option value="Singapore">Singapore / International</option>
                        <option value="Canada">Canada</option>
                        <option value="UAE">United Arab Emirates</option>
                        <option value="Other">Other Global Citizen</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
                  >
                    <span>Proceed to Tax Exemption</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: 80G TAX EXEMPTION DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">80G Tax Exemption & Statutory Compliance</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Under statutory NGO provisions, providing your PAN enables instant 50% tax deduction on all donations under Section 80G (India) / Form 10BE filing.
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-950 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Government Certified Exemption: AAATH0987BF20214</p>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      All donations made to HopeHorizon Foundation are 50% tax-exempt under Section 80G. Automated certificates are generated and filed on the Income Tax Portal annually.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                        Income Tax PAN / Tax ID (Optional for International)
                      </span>
                      <span className="text-[10px] text-slate-400">10 characters (e.g. ABCDE1234F)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full font-mono uppercase tracking-wider rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Official Billing / Postal Address</label>
                    <textarea
                      rows={3}
                      value={taxAddress}
                      onChange={(e) => setTaxAddress(e.target.value)}
                      placeholder="Required for the official 80G receipt header..."
                      className="w-full rounded-2xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wants80GReceipt}
                        onChange={(e) => setWants80GReceipt(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Auto-Generate & Dispatch 80G Certificates</p>
                        <p className="text-[11px] text-slate-500">
                          Receive instant downloadable PDF receipts after every successful contribution.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-100">
                      <input
                        type="checkbox"
                        checked={employerMatch}
                        onChange={(e) => setEmployerMatch(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Corporate Gift Matching Eligibility</p>
                        <p className="text-[11px] text-slate-500">
                          My employer or corporate foundation matches employee philanthropic donations (1:1 / 2:1).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleStepBack}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
                  >
                    <span>Proceed to Causes</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CAUSES & GIVING CADENCE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Giving Preferences & Causes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Personalize the initiatives you wish to support and configure your preferred giving cadence.
                  </p>
                </div>

                {/* Causes Selection Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Choose Primary Causes to Follow (Multiple)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableCauses.map((cause) => {
                      const isSelected = primaryCauses.includes(cause.label);
                      return (
                        <div
                          key={cause.id}
                          onClick={() => toggleCause(cause.label)}
                          className={`p-3 rounded-2xl border cursor-pointer transition ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">{cause.label}</h4>
                            <div
                              className={`h-4 w-4 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{cause.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Giving Cadence */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700">Preferred Giving Cadence</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'monthly', label: 'Monthly Sustainer', desc: 'Highest impact efficiency' },
                      { id: 'one_time', label: 'One-Time Supporter', desc: 'Flexible as you wish' },
                      { id: 'annual', label: 'Annual Patron', desc: 'Major project sponsor' }
                    ].map((cadence) => {
                      const isSelected = givingFrequency === cadence.id;
                      return (
                        <button
                          key={cadence.id}
                          type="button"
                          onClick={() => setGivingFrequency(cadence.id as any)}
                          className={`p-3 rounded-2xl border text-left transition ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{cadence.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{cadence.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Pledged Contribution Tier */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Target Support Pledge (INR / Equivalent)</span>
                    <span className="text-xs font-bold text-emerald-700">₹{pledgedAmount.toLocaleString()}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 5000, 15000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPledgedAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold transition ${
                          pledgedAmount === amt
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Anonymous Public Ledger</p>
                      <p className="text-[11px] text-slate-500">
                        Hide my name on the public donor leaderboards and project donor walls (receipts remain valid).
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleStepBack}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
                  >
                    <span>Final Step: Security</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SECURITY & ACCOUNT CREATION */}
            {currentStep === 4 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Security Credentials & Confirmation</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Set a robust password to access your donor dashboard, tax certificates, and giving statements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Create Account Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-11 text-sm text-slate-900 focus:border-emerald-600 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enable2FA}
                        onChange={(e) => setEnable2FA(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Enable Two-Factor Authentication (2FA)</p>
                        <p className="text-[11px] text-slate-500">
                          Adds an extra layer of biometric or authenticator security to your giving portfolio.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                      />
                      <p className="text-xs text-slate-600">
                        I confirm that all contributions are from legitimate funds and agree to HopeHorizon's{' '}
                        <button
                          type="button"
                          onClick={() => onNavigate('legal')}
                          className="font-bold text-emerald-700 underline"
                        >
                          Donor Charter & 80G Terms
                        </button>
                        .
                      </p>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleStepBack}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button
                    id="btn-submit-donor-register"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition cursor-pointer"
                  >
                    {isSubmitting ? (
                      'Creating Donor Workspace...'
                    ) : (
                      <>
                        <span>Complete Donor Registration</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* RIGHT SIDEBAR: 80G TAX BENEFIT & DONOR PRIVILEGES (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live 80G Tax Exemption Benefit Simulator Card */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 sm:p-7 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" /> Section 80G Benefit
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">100% Legal</span>
              </div>

              <h3 className="text-lg font-black text-white">Your Estimated Tax Savings</h3>
              <p className="text-xs text-slate-300 mt-1">
                Donations to HopeHorizon qualify for 50% deduction under Section 80G of the Income Tax Act.
              </p>

              <div className="my-6 rounded-2xl bg-white/10 p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-200">
                  <span>Selected Pledge Amount:</span>
                  <span className="font-bold text-white text-sm">₹{pledgedAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span>Eligible 80G Deduction (50%):</span>
                  <span className="font-bold text-emerald-400">₹{(pledgedAmount * 0.5).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Estimated Direct Tax Saved:</span>
                  <span className="text-base font-black text-amber-400">~₹{estimatedTaxSavings.toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-950/60 border border-emerald-700/50 p-3 text-xs text-slate-200">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Real-World Tangible Impact:
                </p>
                <p className="mt-1 text-[11px] text-slate-300">{impactSummary}</p>
              </div>
            </div>

            {/* Donor Privileges & Transparency Guarantee */}
            <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900">Your Registered Donor Privileges</h4>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Automated Form 10BE Filing</p>
                    <p className="text-[11px] text-slate-500">Immediate download of digitally signed PDF receipts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Real-Time Fund Tracking</p>
                    <p className="text-[11px] text-slate-500">Live project breakdown showing every dollar deployed in villages.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Quarterly Impact Briefings</p>
                    <p className="text-[11px] text-slate-500">Direct invitations to program lead webinars and field photo logs.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
