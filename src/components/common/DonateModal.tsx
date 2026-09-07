import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { Donation } from '../../types';
import {
  X,
  Heart,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Sparkles,
  Receipt,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  isOpen?: boolean;
  onClose: () => void;
  defaultCampaignId?: string;
  campaignId?: string;
  onDonationComplete?: (donation: Donation) => void;
  onSuccess?: (donation: Donation) => void;
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen = true,
  onClose,
  defaultCampaignId,
  campaignId,
  onDonationComplete,
  onSuccess
}) => {
  const { campaigns, addDonation, settings } = useDatabase();
  const { currentUser } = useAuth();

  const activeCampaignId = campaignId || defaultCampaignId || '';
  const handleSuccess = onSuccess || onDonationComplete;

  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(activeCampaignId);
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(currentUser?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(currentUser?.email || '');
  const [donorPhone, setDonorPhone] = useState<string>(currentUser?.phone || '');
  const [panOrTaxId, setPanOrTaxId] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'razorpay' | 'cashfree' | 'bank_transfer'>('stripe');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const newDonation = addDonation({
        donorName: isAnonymous ? 'Generous Supporter' : (donorName || 'Generous Supporter'),
        donorEmail: donorEmail || 'supporter@community.org',
        donorPhone: donorPhone,
        panOrTaxId: panOrTaxId || undefined,
        isAnonymous,
        amount: currentAmount,
        currency: settings.currencyCode,
        donationType,
        frequency: donationType === 'recurring' ? frequency : undefined,
        campaignId: selectedCampaign?.id,
        campaignTitle: selectedCampaign?.title,
        paymentGateway,
        transactionId: `tx_${paymentGateway}_${Math.random().toString(36).substring(2, 11)}`,
        taxExemptionEligible: true,
        notes: `Online contribution to ${selectedCampaign ? selectedCampaign.title : 'General Relief'}`
      });

      setIsProcessing(false);
      setCompletedDonation(newDonation);

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error('Confetti error', err);
      }

      if (handleSuccess) {
        handleSuccess(newDonation);
      }
    }, 1000);
  };

  const resetAndClose = () => {
    setCompletedDonation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white">
          <button
            onClick={resetAndClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-300 fill-red-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Tax-Deductible Contribution
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold">
            {completedDonation ? 'Thank You For Your Generosity!' : 'Support HopeHorizon NGO'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            {completedDonation
              ? 'Your contribution is already allocated and making real impact on the ground.'
              : '88% of every dollar goes directly into life-saving programs with full 80G tax benefit.'}
          </p>
        </div>

        {/* Success View */}
        {completedDonation ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Donation Successful</h3>
            <p className="mt-1 text-sm text-slate-600">
              Receipt <span className="font-mono font-bold text-slate-800">{completedDonation.receiptNumber}</span> has been issued.
            </p>

            <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-left">
              <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                <span className="text-xs text-slate-600">Amount Contributed</span>
                <span className="text-lg font-black text-emerald-700">
                  {completedDonation.currency} {completedDonation.amount.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 text-xs text-slate-600">
                <span>Designation</span>
                <span className="font-medium text-slate-800">
                  {completedDonation.campaignTitle || 'General Welfare Fund'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs text-slate-600">
                <span>Payment Gateway</span>
                <span className="capitalize text-slate-800">{completedDonation.paymentGateway}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetAndClose}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Donation Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Frequency Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setDonationType('one-time')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  donationType === 'one-time'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One-Time Gift
              </button>
              <button
                type="button"
                onClick={() => setDonationType('recurring')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1 ${
                  donationType === 'recurring'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Monthly Recurring (Most Impact)
              </button>
            </div>

            {/* Campaign Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Designate Contribution To
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              >
                <option value="">Where Needed Most (General Impact & Disaster Fund)</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Choose Amount ({settings.currencySymbol})
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetClick(amt)}
                    className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                      amount === amt && !customAmount
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  placeholder="Or enter custom amount ($)"
                  value={customAmount}
                  onChange={handleCustomChange}
                  min="5"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>

            {/* Tax Exemption Note */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Eligible for 50% Tax Deduction (80G / 501c3)
              </span>
              <span className="font-bold text-emerald-700">
                Tax Savings: ~${(currentAmount * 0.3).toFixed(0)}
              </span>
            </div>

            {/* Donor Information */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Donor & Tax Receipt Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Legal Name"
                  required={!isAnonymous}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none disabled:bg-slate-100"
                />
                <input
                  type="email"
                  placeholder="Email Address (for receipt)"
                  required
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="PAN / Tax ID (for 80G certificate)"
                  value={panOrTaxId}
                  onChange={(e) => setPanOrTaxId(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Make my donation anonymous on the public donor wall</span>
              </label>
            </div>

            {/* Payment Gateway Selector */}
            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Secure Payment Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentGateway('stripe')}
                  className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                    paymentGateway === 'stripe'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-slate-700" />
                  <span className="text-[11px] font-bold">Stripe / Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('razorpay')}
                  className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                    paymentGateway === 'razorpay'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-blue-600" />
                  <span className="text-[11px] font-bold">Razorpay / UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('cashfree')}
                  className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                    paymentGateway === 'cashfree'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-teal-600" />
                  <span className="text-[11px] font-bold">Cashfree</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('bank_transfer')}
                  className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                    paymentGateway === 'bank_transfer'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building className="h-4 w-4 mb-1 text-slate-700" />
                  <span className="text-[11px] font-bold">Bank Wire</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || currentAmount <= 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing Secure Giving...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Give ${currentAmount.toLocaleString('en-US')} {donationType === 'recurring' ? '/ month' : 'Now'}
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              256-bit SSL encrypted. Direct audited NGO allocation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
