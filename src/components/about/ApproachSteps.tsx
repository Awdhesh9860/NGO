import React from 'react';
import {
  Ear,
  FileCheck,
  Users,
  Hammer,
  BarChart3,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export const ApproachSteps: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Listen',
      desc: 'We spend time in the village, listen to mothers and elders, and understand true community needs.',
      icon: Ear
    },
    {
      num: '2',
      title: 'Plan',
      desc: 'We design clear, sensible, low-cost solutions that can be run and kept running easily.',
      icon: FileCheck
    },
    {
      num: '3',
      title: 'Work Together',
      desc: 'We form local committees of village youth and parents to co-lead the work alongside us.',
      icon: Users
    },
    {
      num: '4',
      title: 'Take Action',
      desc: 'We turn plans into honest ground work: setting up classrooms, clean water taps, and clinics.',
      icon: Hammer
    },
    {
      num: '5',
      title: 'Measure',
      desc: 'We track every child attending class, water test results, and publish open financial accounts.',
      icon: BarChart3
    },
    {
      num: '6',
      title: 'Improve',
      desc: 'We listen to community feedback regularly and continually improve our programs.',
      icon: RefreshCw
    }
  ];

  return (
    <section id="our-approach" className="bg-slate-50/70 border-y border-slate-200/60 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Our Working Method
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How We Work
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A responsible six-step model designed to foster long-term community ownership.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-xs hover:border-emerald-300 hover:shadow-lg transition duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
