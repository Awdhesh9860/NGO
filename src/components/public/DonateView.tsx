import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useToast } from '../../context/ToastContext';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
  Sparkles,
  PieChart,
  DollarSign,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Donation } from '../../types';

interface DonateViewProps {
  onNavigate: (view: string, id?: string) => void;
  onDonationSuccess?: (donation: Donation) => void;
}

export const DonateView: React.FC<DonateViewProps> = ({ onNavigate, onDonationSuccess }) => {
  const { campaigns, projects, addDonation, settings } = useDatabase();
  const { showToast } = useToast();

  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [destinationType, setDestinationType] = useState<'general' | 'campaign' | 'project'>('general');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');

  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [donorNotes, setDonorNotes] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'bank_transfer'>('card');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);

  // Suggested preset amounts
  const inrPresets = [500, 1000, 2500, 5000];
  const usdPresets = [25, 50, 100, 250];
  const currentPresets = currency === 'INR' ? inrPresets : usdPresets;
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const effectiveAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  const handleSelectPreset = (amount: number) => {
    setIsCustom(false);
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (val: string) => {
    setIsCustom(true);
    setCustomAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (effectiveAmount < (currency === 'INR' ? 100 : 5)) {
      showToast(`Please enter an amount of at least ${currencySymbol}${currency === 'INR' ? 100 : 5}.`, 'error');
      return;
    }

    if (!isAnonymous && (!donorName.trim() || !donorEmail.trim())) {
      showToast('Please provide your name and email address.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedCampaign = campaigns.find((c) => c.id === selectedDestinationId);
      const selectedProject = projects.find((p) => p.id === selectedDestinationId);

      const recorded = addDonation({
        donorName: isAnonymous ? 'Kind Anonymous Supporter' : donorName,
        donorEmail: isAnonymous ? 'anonymous@hopehorizon.org' : donorEmail,
        donorPhone: donorPhone || undefined,
        panOrTaxId: panNumber || undefined,
        isAnonymous,
        amount: effectiveAmount,
        currency: currency === 'INR' ? 'INR' : 'USD',
        donationType: donationType === 'monthly' ? 'recurring' : 'one-time',
        frequency: donationType === 'monthly' ? 'monthly' : undefined,
        campaignId: destinationType === 'campaign' ? selectedDestinationId : undefined,
        campaignTitle: destinationType === 'campaign' ? selectedCampaign?.title : undefined,
        paymentGateway: paymentMethod === 'upi' ? 'cashfree' : paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'razorpay',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        taxExemptionEligible: true,
        notes: donorNotes || (destinationType === 'project' ? `Designated for Project: ${selectedProject?.title || selectedDestinationId}` : undefined)
      });

      setCompletedDonation(recorded);
      setIsSubmitting(false);

      if (onDonationSuccess) {
        onDonationSuccess(recorded);
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast('Thank you for your generous gift!', 'success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <Heart className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
            Every Gift Changes a Life
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Give Hope. Change Lives.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your gift helps children go to school, gives families clean water, and trains young people with job skills. Simple, honest, and 100% transparent.
          </p>
        </div>
      </section>

      {/* Main Donation Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-20">
        {completedDonation ? (
          /* Success Receipt Card */
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 shadow-xl text-center max-w-2xl mx-auto space-y-6">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Thank You for Your Generosity!
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Your support makes a real and lasting difference in someone's life today.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3 font-mono text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-bold text-slate-900">{completedDonation.receiptNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Amount Donated:</span>
                <span className="font-bold text-emerald-700 text-base">
                  {currencySymbol}{completedDonation.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Donor Name:</span>
                <span className="font-bold text-slate-900">{completedDonation.donorName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction ID:</span>
                <span>{completedDonation.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Exemption:</span>
                <span className="text-emerald-700 font-semibold">[Tax Exemption / 80G Eligible where applicable]</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setCompletedDonation(null)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 text-xs font-bold transition"
              >
                Make Another Gift
              </button>
              <button
                onClick={() => onNavigate('transparency')}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>See Where Donations Go</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Interactive Donation Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 5 & 6. One-Time vs Recurring Donation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Donation Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setDonationType('one-time')}
                      className={`py-2.5 text-xs font-bold rounded-xl transition ${
                        donationType === 'one-time'
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      One-Time Gift
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationType('monthly')}
                      className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                        donationType === 'monthly'
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Monthly Support
                    </button>
                  </div>
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select Currency
                  </label>
                  <div className="flex gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('INR');
                        setSelectedAmount(1000);
                        setIsCustom(false);
                      }}
                      className={`px-3 py-1 rounded-lg transition ${
                        currency === 'INR' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      INR (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('USD');
                        setSelectedAmount(50);
                        setIsCustom(false);
                      }}
                      className={`px-3 py-1 rounded-lg transition ${
                        currency === 'USD' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                {/* 4. Choose Donation Amount */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Choose an Amount
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {currentPresets.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSelectPreset(amt)}
                        className={`py-3 rounded-2xl border text-sm font-black transition ${
                          !isCustom && selectedAmount === amt
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                        }`}
                      >
                        {currencySymbol}{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Field */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Or enter a custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      className={`w-full rounded-2xl border pl-8 pr-4 py-3 text-sm font-semibold transition outline-none ${
                        isCustom
                          ? 'border-emerald-600 bg-emerald-50/40 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* 7 & 8. Support Campaign or Project */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Where Should Your Gift Go?
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationType('general');
                        setSelectedDestinationId('');
                      }}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        destinationType === 'general'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Where Needed Most
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationType('campaign');
                        if (campaigns.length > 0) setSelectedDestinationId(campaigns[0].id);
                      }}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        destinationType === 'campaign'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Support a Campaign
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationType('project');
                        if (projects.length > 0) setSelectedDestinationId(projects[0].id);
                      }}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        destinationType === 'project'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Support a Project
                    </button>
                  </div>

                  {destinationType === 'campaign' && (
                    <select
                      value={selectedDestinationId}
                      onChange={(e) => setSelectedDestinationId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 mt-2"
                    >
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  )}

                  {destinationType === 'project' && (
                    <select
                      value={selectedDestinationId}
                      onChange={(e) => setSelectedDestinationId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 mt-2"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 9. Anonymous Donation Option */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="anonymous-check"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="anonymous-check" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Make this donation anonymous (hide my name from public donor lists)
                  </label>
                </div>

                {/* 10. Donor Information */}
                {!isAnonymous && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Details
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required={!isAnonymous}
                          placeholder="Your Full Name *"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required={!isAnonymous}
                          placeholder="Your Email Address *"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number (Optional)"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="PAN / Tax ID (Optional for receipt)"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. Secure Payment Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-600" />
                    Secure Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Credit / Debit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === 'upi'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === 'netbanking'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Net Banking
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  <span>
                    {isSubmitting
                      ? 'Processing Secure Donation...'
                      : `Donate ${currencySymbol}${effectiveAmount.toLocaleString()} Now`}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 256-bit SSL Secure
                  </span>
                  <span>&bull;</span>
                  <span>Instant Receipt</span>
                  <span>&bull;</span>
                  <span>[Tax Exemption where applicable]</span>
                </div>
              </form>
            </div>

            {/* Right: Why Support Matters & Transparency (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 2. Why Your Support Matters */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Why Your Support Matters
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We keep things simple and honest. We do not spend money on fancy offices. We bring help directly to families who need it most.
                </p>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong>{currencySymbol}{currency === 'INR' ? '500' : '25'}</strong> provides school books and pencils for one child for three months.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong>{currencySymbol}{currency === 'INR' ? '1,000' : '50'}</strong> gives a family clean drinking water filters.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong>{currencySymbol}{currency === 'INR' ? '2,500' : '100'}</strong> supports job training materials for a young adult.
                    </span>
                  </div>
                </div>
              </div>

              {/* 13. How Donations Are Used */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-emerald-600" />
                  How Every Rupee / Dollar is Used
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Direct Community Programs</span>
                      <span className="font-bold text-emerald-700">88%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Monitoring & Quality Assurance</span>
                      <span className="font-bold text-teal-700">7%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: '7%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">General Administration</span>
                      <span className="font-bold text-slate-700">5%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '5%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Every year our accounts are reviewed and published for the public to read.
                </p>
              </div>

              {/* 12. Tax Information where legally applicable */}
              <div className="bg-emerald-50/60 rounded-3xl border border-emerald-100 p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Tax Receipt & Exemption
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Donations may be eligible for tax exemption under <strong>[Tax Exemption / 80G / 501(c)(3) where applicable]</strong>. Your official digital receipt is issued immediately after your gift.
                </p>
              </div>

              {/* 14. Transparency Link */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Want to read our audit reports?</span>
                <button
                  onClick={() => onNavigate('transparency')}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  View Reports <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 15. Donation FAQ */}
        <section className="mt-16 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 text-center">
            Common Questions About Giving
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Where does my donation go?</h3>
              <p className="text-slate-600">
                88% goes directly to field programs like schooling, clean water, and community health. The rest covers field monitoring and simple operational costs.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Can I donate anonymously?</h3>
              <p className="text-slate-600">
                Yes! Just check the "Make this donation anonymous" box, and your name will never be displayed publicly.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Will I get a tax receipt?</h3>
              <p className="text-slate-600">
                Yes. A digital receipt is generated instantly upon payment and can be downloaded or emailed to you.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Can I support a specific project?</h3>
              <p className="text-slate-600">
                Yes. You can choose "Support a Project" or "Support a Campaign" from the form above.
              </p>
            </div>
          </div>
        </section>

        {/* 16. Final CTA */}
        <section className="mt-12 rounded-3xl bg-slate-900 p-8 sm:p-12 text-center text-white space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black">
            Together, We Can Change Someone's Tomorrow.
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            If you have any questions before giving, or wish to arrange a bank transfer or CSR gift, please talk to our team anytime.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-bold">
            <button
              onClick={() => onNavigate('contact')}
              className="rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-slate-200 hover:bg-slate-700 transition"
            >
              Contact Our Team
            </button>
            <button
              onClick={() => onNavigate('transparency')}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-500 transition"
            >
              Review Financial Transparency
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
