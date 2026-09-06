import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Heart,
  Users,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  HelpCircle,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: 'Full-time' | 'Part-time' | 'Fellowship' | 'Internship';
  location: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
}

const OPENINGS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Community Field Coordinator',
    department: 'Field Operations',
    type: 'Full-time',
    location: '[Project Location]',
    summary: 'Coordinate daily project activities, meet with village committees, and ensure clean water and education programs run smoothly.',
    responsibilities: [
      'Conduct weekly field visits to community project sites',
      'Liaise with village councils and local volunteer teams',
      'Collect simple monitoring data and project feedback',
      'Assist with logistics for medical camps and distribution drives'
    ],
    qualifications: [
      'High school diploma or degree in social sciences, education, or related field',
      'Strong listening and communication skills in local languages',
      'Empathy, honesty, and willingness to travel to rural areas',
      'Valid driving license for field travel'
    ]
  },
  {
    id: 'job-2',
    title: 'Digital Literacy Instructor',
    department: 'Education',
    type: 'Full-time',
    location: '[Project Location]',
    summary: 'Teach basic computer typing, office documents, and internet literacy to high school students and young adult trainees.',
    responsibilities: [
      'Conduct interactive, practical computer classes for batches of 15 students',
      'Maintain computer lab hardware, software updates, and internet connectivity',
      'Track student attendance, practical assignments, and test scores',
      'Organize resume preparation and basic job interview practice'
    ],
    qualifications: [
      'Diploma or degree in computer applications, IT, or equivalent experience',
      'Patience and enthusiasm for teaching beginners with no prior computer exposure',
      'Fluency in local language and working English'
    ]
  },
  {
    id: 'job-3',
    title: 'Youth Social Work Fellow (6-Month Fellowship)',
    department: 'Community Programs',
    type: 'Fellowship',
    location: '[Project Location]',
    summary: 'A paid 6-month hands-on fellowship for recent graduates passionate about grassroots community development and non-profit management.',
    responsibilities: [
      'Work alongside senior field coordinators on grassroots programs',
      'Document human stories, case studies, and volunteer feedback',
      'Support after-school reading circles and children’s clubs',
      'Present an end-of-fellowship project report to the board'
    ],
    qualifications: [
      'Recent graduate (undergraduate or masters) in any discipline',
      'Curiosity, open mindset, and strong desire to serve communities',
      'Basic smartphone photography and writing skills'
    ]
  },
  {
    id: 'job-4',
    title: 'Communications & Documentation Intern',
    department: 'Communications',
    type: 'Internship',
    location: 'Hybrid / [Project Location]',
    summary: 'Help create transparent field stories, newsletters, and social media photo updates showing our projects in action.',
    responsibilities: [
      'Draft simple field newsletters and project updates in clear English',
      'Organize and caption photographs from project field teams',
      'Assist in compiling quarterly impact summaries for donors',
      'Participate in community outreach drives'
    ],
    qualifications: [
      'Student or recent graduate interested in non-profit communication',
      'Good writing skills with simple, jargon-free vocabulary',
      'Familiarity with Canva or basic photo layout tools is a plus'
    ]
  }
];

interface CareersViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const CareersView: React.FC<CareersViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [targetPosition, setTargetPosition] = useState<string>('Community Field Coordinator');
  const [applicantMessage, setApplicantMessage] = useState<string>('');
  const [resumeLink, setResumeLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim()) {
      showToast('Please provide your name and email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasApplied(true);
      showToast('Application received! Our team will contact you within 5 business days.', 'success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
            Join Our Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Build a Career With Purpose
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Work with honest people who care deeply about community impact. Whether you are a field specialist, educator, or student intern, your everyday work will improve lives.
          </p>
        </div>
      </section>

      {/* 2 & 3. Why Work With Us & Our Culture */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Humility & Respect</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We listen first. We treat every community member, student, and fellow employee with absolute dignity.
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Ground Impact</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No endless bureaucracy. You will be on the ground seeing the direct positive outcome of your daily work.
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Learning & Mentorship</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We invest in our people through skills development, leadership coaching, and collaborative team culture.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* 4. Current Openings & Internships */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Open Roles
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Current Open Positions & Fellowships
            </h2>
            <p className="text-xs text-slate-500">
              Find an opportunity matching your skills, location, and passion for community service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPENINGS.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 hover:border-emerald-300 transition shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-emerald-50 text-emerald-800 font-bold px-3 py-1">
                      {job.department}
                    </span>
                    <span className="text-slate-500 font-medium">{job.type}</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{job.title}</h3>

                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{job.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{job.summary}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Key Responsibilities:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {job.responsibilities.slice(0, 2).map((resp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setTargetPosition(job.title);
                      const el = document.getElementById('apply-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Apply for Role</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Questions? Ask Us
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Application Process */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center">
            Our Simple 4-Step Hiring Process
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Application Form</h3>
              <p className="text-xs text-slate-500">
                Submit your simple details and tell us why community service matters to you.
              </p>
            </div>

            <div className="p-4 space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">Warm Phone Chat</h3>
              <p className="text-xs text-slate-500">
                A 20-minute conversation to discuss your background, interests, and availability.
              </p>
            </div>

            <div className="p-4 space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Field Site Visit</h3>
              <p className="text-xs text-slate-500">
                Spend half a day with our field coordinator at a real project to see our work firsthand.
              </p>
            </div>

            <div className="p-4 space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">Welcome to Team</h3>
              <p className="text-xs text-slate-500">
                Formal offer, respectful compensation, and hands-on orientation with our leadership.
              </p>
            </div>
          </div>
        </section>

        {/* 10. Application Form */}
        <section id="apply-form" className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Fast & Simple
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Submit Your Application
            </h2>
            <p className="text-xs text-slate-500">
              No long cover letters required. Just share your background honestly.
            </p>
          </div>

          {hasApplied ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="h-12 w-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Application Successfully Submitted!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you for applying to join our team. Our hiring team will review your details and reach out within 5 working days.
              </p>
              <button
                onClick={() => setHasApplied(false)}
                className="mt-2 text-xs font-bold text-emerald-800 underline"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 / Phone"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Role You Are Applying For *
                  </label>
                  <select
                    value={targetPosition}
                    onChange={(e) => setTargetPosition(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500 bg-white"
                  >
                    {OPENINGS.map((j) => (
                      <option key={j.id} value={j.title}>
                        {j.title} ({j.type})
                      </option>
                    ))}
                    <option value="General Volunteer / Other">Other General Role</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Resume / LinkedIn / Portfolio Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or LinkedIn profile URL"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Why do you want to work with our NGO? (2–3 sentences)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your interest in community work..."
                  value={applicantMessage}
                  onChange={(e) => setApplicantMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 text-xs font-bold transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Sending Application...' : 'Send Application'}</span>
              </button>
            </form>
          )}
        </section>

        {/* 11. FAQ */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            Careers FAQ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
            <div>
              <strong className="text-slate-900 block mb-1">Are internships and fellowships paid?</strong>
              <p>Yes. All full-time fellows and interns receive a fair monthly stipend to cover living and travel expenses.</p>
            </div>
            <div>
              <strong className="text-slate-900 block mb-1">Can I volunteer while working elsewhere?</strong>
              <p>Absolutely! We have weekend and evening volunteer opportunities. Check out our Volunteer page for details.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
