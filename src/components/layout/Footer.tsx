import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { NewsletterSubscriptionForm } from '../common/NewsletterSubscriptionForm';
import {
  Heart,
  ShieldCheck,
  Award,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Globe2
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDonate = () => {} }) => {
  const { settings } = useDatabase();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      {/* Upper Newsletter & Lead Capture Banner */}
      <div id="footer-newsletter-banner" className="border-b border-slate-800 bg-slate-900/70 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mission, Certification & Lead Pathways */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Certified 80G Tax-Exempt NGO</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Stay Connected With Our Ground Work
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Receive simple updates on how lives are changing: transparent photo updates for donors, and weekend camp alerts for volunteers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <Heart className="h-4 w-4 shrink-0" />
                  <span>For Donors</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Instant 80G tax receipts, ground video proof & honest spending sheets.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>For Volunteers</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Weekend school teaching, food relief drives & medical camps near you.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Validated Newsletter Form Component */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-md">
              <div className="mb-4">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Stay in Touch
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  Get Our Monthly News & Stories
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  No spam ever. Just honest stories of children helped and upcoming drives you can join.
                </p>
              </div>

              <NewsletterSubscriptionForm
                variant="footer"
                defaultInterest="both"
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Directory */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Identity & Compliance */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Heart className="h-5 w-5 fill-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white">{settings.ngoName}</span>
                <p className="text-[11px] text-slate-400">Reg No: {settings.registrationNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              A legally incorporated, statutory public charitable trust dedicated to sustainable clean water access, rural girls' education, rapid frontline disaster response, and women's economic sovereignty.
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-[11px] space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">80G Exemption Order:</span>
                <span className="font-mono text-slate-300 font-semibold">{settings.taxExemption80GNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FCRA Registration:</span>
                <span className="font-mono text-slate-300 font-semibold">{settings.fcraRegistrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NGO Darpan ID:</span>
                <span className="font-mono text-slate-300 font-semibold">{settings.darpanId}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('verify-certificate')}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition"
              >
                <Award className="h-3.5 w-3.5" />
                Certificate Verification Portal
              </button>
            </div>
          </div>

          {/* Col 2: Programs & Impact */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Programs & Impact
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate('programs')} className="hover:text-emerald-400 transition">
                  Universal Child Education
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs')} className="hover:text-emerald-400 transition">
                  Clean Water & Sanitation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-emerald-400 transition">
                  Grassroots Field Projects
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('campaigns')} className="hover:text-emerald-400 transition">
                  Active Relief Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('impact')} className="hover:text-emerald-400 transition text-emerald-400 font-medium">
                  Verified Impact Metrics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('stories')} className="hover:text-emerald-400 transition">
                  Real Success Stories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-emerald-400 transition">
                  Ground Photo Gallery
                </button>
              </li>
              <li>
                <button onClick={onOpenDonate} className="font-semibold text-emerald-400 hover:underline">
                  Donate Online (80G Tax-Exempt)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Transparency & Community */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Transparency & Get Involved
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate('donor-register')} className="text-emerald-400 font-bold hover:underline transition flex items-center gap-1">
                  <span>Register as Donor (80G Tax-Exempt)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('transparency')} className="hover:text-emerald-400 transition">
                  Audited Governance Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('documents')} className="hover:text-emerald-400 transition text-emerald-400 font-medium">
                  Public Documents & Audit Reports
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('volunteers')} className="hover:text-emerald-400 transition">
                  Volunteer Application & Roster
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('membership')} className="hover:text-emerald-400 transition">
                  Annual NGO Membership
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('partners')} className="hover:text-emerald-400 transition">
                  Our Supportive Partners
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('csr')} className="hover:text-emerald-400 transition">
                  Corporate CSR Partnerships
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('careers')} className="hover:text-emerald-400 transition">
                  Careers & Fellowships
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-emerald-400 transition">
                  Events & Global Summits
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Legal */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Headquarters & Legal
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{settings.headquartersAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{settings.primaryPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-[11px]">{settings.primaryEmail}</span>
              </div>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => onNavigate('contact')}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 font-bold text-white transition text-[11px]"
                >
                  Contact Desk
                </button>
                <button
                  onClick={() => onNavigate('faq')}
                  className="rounded-lg border border-slate-700 hover:border-slate-500 px-3 py-1.5 font-bold text-slate-300 transition text-[11px]"
                >
                  Help & FAQs
                </button>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-1.5">
              <p className="font-semibold text-slate-300 text-[11px]">Compliance & Policies:</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <button onClick={() => onNavigate('legal', 'privacy')} className="hover:text-slate-300">
                  Privacy Policy
                </button>
                <button onClick={() => onNavigate('legal', 'terms')} className="hover:text-slate-300">
                  Terms & Conditions
                </button>
                <button onClick={() => onNavigate('legal', 'refund')} className="hover:text-slate-300">
                  Donation & Refund Policy
                </button>
                <button onClick={() => onNavigate('legal', 'volunteer-code')} className="hover:text-slate-300">
                  Volunteer Code
                </button>
                <button onClick={() => onNavigate('faq')} className="hover:text-slate-300">
                  Supporter FAQs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.ngoName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Secured with 256-Bit TLS</span>
            <span>•</span>
            <span>Deloitte Audited</span>
            <span>•</span>
            <span>Open Source Transparency</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
