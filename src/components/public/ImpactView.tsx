import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Heart,
  GraduationCap,
  Droplets,
  Users,
  Briefcase,
  Trees,
  CheckCircle2,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Compass
} from 'lucide-react';

interface ImpactViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: (campaignId?: string) => void;
}

export const ImpactView: React.FC<ImpactViewProps> = ({ onNavigate, onOpenDonate = () => {} }) => {
  const { programs, projects, reports } = useDatabase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Verified Community Outcomes
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Real Impact. Real Lives.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We measure our work not by the promises we make, but by the tangible changes people experience in their daily lives.
          </p>
        </div>
      </section>

      {/* 2 & 3. Impact Overview & Key Numbers (Trust Bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600">10,000+</span>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">People Reached</p>
            <p className="text-[11px] text-slate-400">Directly supported</p>
          </div>
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-blue-600">50+</span>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Communities</p>
            <p className="text-[11px] text-slate-400">Villages & settlements</p>
          </div>
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-teal-600">25+</span>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Projects Completed</p>
            <p className="text-[11px] text-slate-400">On-time and audited</p>
          </div>
          <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <span className="text-3xl sm:text-4xl font-black text-purple-600">100+</span>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Volunteers</p>
            <p className="text-[11px] text-slate-400">Serving on the ground</p>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <span className="text-3xl sm:text-4xl font-black text-amber-600">15+</span>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Years of Service</p>
            <p className="text-[11px] text-slate-400">Continuous commitment</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-20">
        {/* 7 to 11. Sector Specific Impacts */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Sector Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How We Help Across Key Areas
            </h2>
            <p className="text-sm text-slate-600">
              Every program has clear goals, monthly checks, and community feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 7. Education Impact */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Education Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We believe learning opens doors. We provide notebooks, pencils, school fees, and after-school tuition so children stay in class.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>[Impact Number] Children Enrolled</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>[Impact Number] Classrooms Built or Repaired</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>[Impact Number] Learning Kits Given</span>
                </li>
              </ul>
            </div>

            {/* 8. Health & Clean Water Impact */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Health & Safe Water</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clean water prevents sickness. We build community water filters and hold free health checkup camps with qualified doctors.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>[Impact Number] Liters of Safe Water / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>[Impact Number] Free Health Checkups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>[Impact Number] Hygiene Kits Distributed</span>
                </li>
              </ul>
            </div>

            {/* 9. Livelihood & Skills */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Skills & Livelihood</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We train young people and adults with practical computer skills, tailoring, and electrical basics so they can earn a stable income.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  <span>[Impact Number] Youth Trained</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  <span>[Impact Number] Job Placements Assisted</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  <span>[Impact Number] Small Toolkits Awarded</span>
                </li>
              </ul>
            </div>

            {/* 10. Women Empowerment */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Women Empowerment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When women have skills and independence, entire families rise. We support self-help savings groups and small home business training.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-600" />
                  <span>[Impact Number] Women in Self-Help Groups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-600" />
                  <span>[Impact Number] Micro-Enterprise Seed Grants</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-600" />
                  <span>[Impact Number] Financial Literacy Workshops</span>
                </li>
              </ul>
            </div>

            {/* 11. Environment Impact */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Trees className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Environment & Clean Energy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We plant trees, introduce solar-powered lights in community centers, and teach waste management in local schools.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>[Impact Number] Trees Planted</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>[Impact Number] Solar Units Installed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>[Impact Number] Community Clean-Up Drives</span>
                </li>
              </ul>
            </div>

            {/* Community Support */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-lg transition">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Community Emergency Relief</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                During floods, cold waves, or emergencies, our volunteer teams deliver dry food, warm blankets, and shelter supplies fast.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>[Impact Number] Emergency Food Kits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>[Impact Number] Warm Blankets Distributed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>[Impact Number] Temporary Shelters Assisted</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 12. Success Stories Highlight */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Human Stories
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Lives Changed, One Story at a Time
              </h2>
            </div>
            <button
              onClick={() => onNavigate('stories')}
              className="mt-3 sm:mt-0 font-bold text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Read All Stories</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Education
              </span>
              <h3 className="text-base font-bold text-slate-900">
                [Person Name]'s Journey to College
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                "[Person Name] from [Project Location] was about to drop out in 9th grade because his family could not afford examination fees. With our after-school study center and learning kit support, he passed with high marks and is now pursuing his diploma."
              </p>
              <p className="text-[11px] text-slate-400 italic">
                Supported by our Rural Youth Education Initiative
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                Livelihood
              </span>
              <h3 className="text-base font-bold text-slate-900">
                [Person Name] Starts a Small Sewing Center
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                "After attending our six-month vocational stitching training, [Person Name] received a micro-toolkit and opened a small home tailoring shop in [Project Location]. She now earns enough each month to support her two daughters' schooling."
              </p>
              <p className="text-[11px] text-slate-400 italic">
                Supported by our Women's Livelihood Program
              </p>
            </div>
          </div>
        </section>

        {/* 13 & 14. Project Results & Annual Impact Reports */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Transparency & Reports
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Download Our Annual Impact Reports
            </h2>
            <p className="text-sm text-slate-600">
              We publish complete reports with real project photographs, budget sheets, and auditor stamps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.slice(0, 3).map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:border-emerald-300 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {rep.category}
                    </span>
                    <span>Year {rep.year}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{rep.summary}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{rep.fileSize} &bull; PDF</span>
                  <button
                    onClick={() => onNavigate('transparency')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>View Report</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 15 & 16. Transparency & Final CTA */}
        <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Support Our Work
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white max-w-2xl mx-auto">
            Help Us Bring Hope to More Communities.
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Every contribution enables us to reach another child, another classroom, and another village in need.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('donate')}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 text-xs font-bold transition shadow-lg flex items-center gap-2"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>Donate Now</span>
            </button>
            <button
              onClick={() => onNavigate('volunteers')}
              className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-7 py-3.5 text-xs font-bold transition flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Become a Volunteer</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
