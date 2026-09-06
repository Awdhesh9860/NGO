import React from 'react';
import {
  Building2,
  Handshake,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PartnersViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <Handshake className="h-3.5 w-3.5 text-emerald-400" />
            Working Hand in Hand
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Stronger Together
          </h1>
          {/* 2. Partner Introduction */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We work with companies, community groups, schools, and institutions who share our commitment to honest, measurable change. Together, we accomplish what none of us could do alone.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* 3. CSR Partners */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Corporate Social Responsibility
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Corporate & CSR Partners
            </h2>
            <p className="text-xs text-slate-500">
              Companies supporting solar water infrastructure, school digitization, and employee volunteering.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-2 hover:border-emerald-300 transition shadow-xs"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-xs font-bold">
                  [Logo]
                </div>
                <span className="font-bold text-xs text-slate-800">[CSR Partner Organization {item}]</span>
                <span className="text-[10px] text-slate-400 font-medium">Water & Education Grant</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Community Partners */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Grassroots Collaboration
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Local Community & Panchayat Partners
            </h2>
            <p className="text-xs text-slate-500">
              Community elders, village development committees, and youth clubs who guide every project from the ground up.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">[Local Village Council Partner]</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Collaborates on site selection and maintenance oversight for community solar water wells in [Project Location].
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">[Women's Federation Partner]</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connects over 24 grassroots self-help groups with tailoring training and micro-finance literacy sessions.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">[Youth Volunteer Coalition]</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Local college student ambassadors organizing weekend sports, library reading circles, and tree plantation drives.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Institutional & Educational Partners */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Academic & Health Institutions
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Institutional Partners
            </h2>
            <p className="text-xs text-slate-500">
              Colleges, vocational institutes, and community health centers providing student internships and doctor clinics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">[Vocational Training Institute Partner]</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provides state-certified curricula, examination testing, and recognized certificates for our computer education trainees.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">[Community Hospital & Health Network]</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sends volunteer pediatricians and general physicians to our quarterly rural medical camps, providing free prescription medicines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Partner Stories */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            How Partnerships Create Lasting Change
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">Clean Water for 12 Villages</span>
              <p>
                "Working with [CSR Partner Company], we installed 12 solar aquifer deep wells in less than eight months. Their team visited the sites alongside our volunteers to inspect groundwater testing records."
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="font-bold text-slate-900 text-sm block">Digital Literacy in 5 High Schools</span>
              <p>
                "In collaboration with [Institutional Partner], over 600 rural high school students now practice keyboard typing, internet research, and basic document formatting every week."
              </p>
            </div>
          </div>
        </section>

        {/* 8. Become a Partner CTA */}
        <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Join Our Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Let's Build Meaningful Impact Together
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Whether through CSR funding, employee volunteering, equipment donations, or community programs, we welcome partners who value transparency and action.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('csr')}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Explore CSR Partnerships</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3 text-xs font-bold transition"
            >
              Contact Partnership Desk
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
