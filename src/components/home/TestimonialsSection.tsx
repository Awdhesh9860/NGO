import React from 'react';
import { Quote, Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 'test-1',
      role: 'Community Elder & Beneficiary',
      name: 'Rameshwar Ji',
      location: 'Sundarpur Hamlet',
      quote: 'The team did not simply drill a borewell and depart. They spent weeks training five young village volunteers on how to maintain the solar pump. For the past two years, our children have not suffered from contaminated water illness.',
      badgeColor: 'text-emerald-700 bg-emerald-50'
    },
    {
      id: 'test-2',
      role: 'Weekend Volunteer & Mentor',
      name: 'Pooja Narang',
      location: 'City Education Center',
      quote: 'Volunteering with this NGO taught me what true humility and genuine dedication look like. There is zero performative fluff — just sincere, honest field coordinators teaching kids and solving real ground problems with heart.',
      badgeColor: 'text-teal-700 bg-teal-50'
    },
    {
      id: 'test-3',
      role: 'Monthly Sustaining Donor',
      name: 'Marcus & Elena Sterling',
      location: 'Monthly Giving Circle',
      quote: 'We receive transparent quarterly email reports with exact receipts and ground photos without ever having to ask. Knowing that 88% goes straight to the frontline programs gives us total confidence to support every month.',
      badgeColor: 'text-blue-700 bg-blue-50'
    }
  ];

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Voices of Trust
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          What People Say About Us
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Unfiltered feedback from local community members, grassroots volunteers, and regular donors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-4 shadow-xs hover:border-emerald-200 hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Quote className="h-7 w-7 text-emerald-600/30" />
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                  {item.role}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "{item.quote}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                <span className="text-[11px] text-slate-400">{item.location}</span>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
