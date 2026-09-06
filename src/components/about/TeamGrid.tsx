import React, { useState } from 'react';
import { Users, ArrowRight, CheckCircle2, Filter } from 'lucide-react';

interface TeamGridProps {
  onNavigate: (view: string, id?: string) => void;
  showAll?: boolean;
}

export const TeamGrid: React.FC<TeamGridProps> = ({ onNavigate, showAll = false }) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const teamMembers = [
    {
      name: 'Priya Patel',
      role: 'Community Outreach Lead',
      department: 'Community',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      bio: 'Works directly with village mothers and self-help groups to facilitate educational enrollment and health drives.'
    },
    {
      name: 'Rohan Verma',
      role: 'Education Coordinator',
      department: 'Education',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      bio: 'Manages curriculum materials, digital tablets, and evening tutors across rural classroom centers.'
    },
    {
      name: 'Dr. Sunita Rao',
      role: 'Mobile Health Lead',
      department: 'Healthcare',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      bio: 'Conducts regular health screening clinics, distributes maternal vitamins, and coordinates specialist care referrals.'
    },
    {
      name: 'Vikram Singh',
      role: 'Water Systems Engineer',
      department: 'Operations',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Inspects solar pump infrastructure, tests water purity levels, and trains local village maintenance technicians.'
    },
    {
      name: 'Ananya Roy',
      role: 'Donor & Field Reporting Associate',
      department: 'Operations',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Prepares transparent monthly project updates, photographic milestone proof, and donor tax exemption receipts.'
    },
    {
      name: 'Kunal Joshi',
      role: 'Youth Volunteer Mentor',
      department: 'Community',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      bio: 'Welcomes new volunteers, schedules orientation sessions, and organizes weekend community planting drives.'
    }
  ];

  const filteredMembers = showAll && selectedDept !== 'all'
    ? teamMembers.filter((m) => m.department.toLowerCase() === selectedDept.toLowerCase())
    : showAll
    ? teamMembers
    : teamMembers.slice(0, 4);

  return (
    <section id="our-team" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            People Behind the Mission
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            Our Dedicated Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Grassroots social workers, educators, health staff, and coordinators working side-by-side with communities.
          </p>
        </div>

        {!showAll && (
          <button
            onClick={() => onNavigate('about-team')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <span>Meet Our Entire Team</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showAll && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </span>
          {['all', 'Community', 'Education', 'Healthcare', 'Operations'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedDept === dept
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.name}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-xs hover:border-emerald-300 hover:shadow-lg transition duration-200 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {member.department}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{member.name}</h3>
                <p className="text-xs font-semibold text-slate-500">{member.role}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {member.bio}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Frontline Staff Member</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
