import React, { useState } from 'react';
import {
  Heart,
  Quote,
  GraduationCap,
  Users,
  Briefcase,
  Droplets,
  Trees,
  ArrowRight,
  CheckCircle2,
  X,
  MapPin
} from 'lucide-react';

interface Story {
  id: string;
  category: 'education' | 'women' | 'community' | 'health' | 'livelihood';
  personName: string;
  location: string;
  photoUrl: string;
  title: string;
  summary: string;
  fullStory: string;
  before: string;
  after: string;
  relatedProgram: string;
}

const STORIES: Story[] = [
  {
    id: 'story-1',
    category: 'education',
    personName: '[Student Name]',
    location: '[Project Location]',
    photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    title: 'From Daily Struggle to Diploma Holder',
    summary: 'When his family faced hard times, [Student Name] was about to drop out of school. With our after-school study group and examination fee assistance, he graduated high school and enrolled in technical college.',
    fullStory: '[Student Name] lives in [Project Location]. In 9th grade, his family struggled to afford the exam fees and school uniform. Our community volunteers connected him with the local after-school center, where he received study materials, daily tutoring, and mentor support. He completed his secondary exams with distinction and is now studying electrical engineering. He visits the center on weekends to help younger students with math.',
    before: 'Risk of school dropout due to financial hardship and lack of study materials.',
    after: 'Graduated secondary school with distinction, enrolled in college, and tutors younger children.',
    relatedProgram: 'Rural Youth Education Initiative'
  },
  {
    id: 'story-2',
    category: 'women',
    personName: '[Artisan Name]',
    location: '[Project Location]',
    photoUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&auto=format&fit=crop&q=80',
    title: 'Gaining Independence Through Tailoring',
    summary: 'After taking our 6-month certified sewing and basic business course, [Artisan Name] started her own neighborhood tailoring shop, supporting her two children through school.',
    fullStory: '[Artisan Name] joined our self-help group in [Project Location]. Through the center, she received free hands-on sewing lessons, bookkeeping classes, and a seed sewing machine. Today, she takes custom clothing orders for families in three surrounding villages and employs another local woman to assist with finishing garments.',
    before: 'No independent income source and limited opportunities for home-based work.',
    after: 'Runs an active micro-tailoring unit, earns steady income, and employs an assistant.',
    relatedProgram: "Women's Vocational Skill Initiative"
  },
  {
    id: 'story-3',
    category: 'health',
    personName: '[Village Elder Name]',
    location: '[Project Location]',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
    title: 'Clean Water Brings Health Back to Our Village',
    summary: 'Our community was sick every summer from contaminated pond water. The solar-powered aquifer filter has made waterborne fever a thing of the past.',
    fullStory: '[Village Elder Name] has lived in [Project Location] for over 60 years. In past years, diarrhea and waterborne illnesses were common among children and elders. With the community collaborating on maintenance, our team installed a solar deep-aquifer filtration unit. Over 280 families now draw safe drinking water every single day without walking miles.',
    before: 'Families walked 3 miles daily to collect untreated pond water prone to contamination.',
    after: 'Safe, tested potable water available at the village center every morning and evening.',
    relatedProgram: 'Solar Aquifer Clean Water Mission'
  },
  {
    id: 'story-4',
    category: 'livelihood',
    personName: '[Youth Trainee Name]',
    location: '[Project Location]',
    photoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    title: 'Learning Computers and Finding a Career',
    summary: 'Having never touched a keyboard before, [Youth Trainee Name] learned typing, office spreadsheets, and customer data entry, securing a job at a regional service office.',
    fullStory: 'In [Project Location], many young people lacked access to computers. [Youth Trainee Name] attended our 90-day digital foundation course. Through consistent practice, he attained 42 words per minute typing speed and basic document preparation skills. He was recently hired as an administrative assistant at a regional distribution facility.',
    before: 'Zero prior computer experience and limited local employment avenues.',
    after: 'Employed full-time in administrative operations with steady monthly income.',
    relatedProgram: 'Youth Digital Skills Academy'
  }
];

interface SuccessStoriesViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenDonate?: (campaignId?: string) => void;
}

export const SuccessStoriesView: React.FC<SuccessStoriesViewProps> = ({ onNavigate, onOpenDonate = () => {} }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'education', label: 'Education' },
    { id: 'women', label: 'Women Empowerment' },
    { id: 'health', label: 'Health & Safe Water' },
    { id: 'livelihood', label: 'Livelihood & Skills' }
  ];

  const filteredStories = STORIES.filter(
    (s) => selectedCategory === 'all' || s.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <Heart className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
            Human Journeys
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Stories of Courage & Hope
          </h1>
          {/* 2. Introduction */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Real change happens person by person, family by family. We share these stories with deep respect for the dignity, strength, and perseverance of the people we work with.
          </p>
        </div>
      </section>

      {/* 3. Featured Story Spotlight */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={STORIES[0].photoUrl}
              alt={STORIES[0].title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Featured Journey &bull; Education
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {STORIES[0].title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {STORIES[0].summary}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {STORIES[0].location}
              </span>
              <span>&bull;</span>
              <span>{STORIES[0].personName}</span>
            </div>
            <button
              onClick={() => setActiveStory(STORIES[0])}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Read Full Story</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories & Story Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={story.photoUrl}
                    alt={story.title}
                    className="h-full w-full object-cover transition hover:scale-105 duration-300"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {story.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    <span>{story.location}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {story.summary}
                  </p>

                  {/* 9. Dignified Before & After Reflection */}
                  <div className="rounded-xl bg-slate-50 p-3 space-y-1 text-[11px] text-slate-600 border border-slate-100">
                    <p><strong>Outcome:</strong> {story.after}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">{story.personName}</span>
                <button
                  onClick={() => setActiveStory(story)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Read Story</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 11 & 12. Related Projects & CTA */}
        <section className="mt-12 rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black">
            Help Us Write the Next Story
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Your support gives another child school books, another mother a vocational skill, and another village safe clean water.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('donate')}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>Donate to Change a Life</span>
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3 text-xs font-bold transition"
            >
              Explore Our Projects
            </button>
          </div>
        </section>
      </div>

      {/* Story Detail Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                {activeStory.category}
              </span>
              <span>&bull;</span>
              <span>{activeStory.location}</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900">{activeStory.title}</h2>

            <div className="h-60 rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={activeStory.photoUrl}
                alt={activeStory.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>{activeStory.fullStory}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Challenge Faced:</span>
                <p className="text-slate-600">{activeStory.before}</p>
              </div>
              <div>
                <span className="font-bold text-emerald-800 block mb-1">Positive Outcome:</span>
                <p className="text-slate-600">{activeStory.after}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Program: <strong>{activeStory.relatedProgram}</strong>
              </span>
              <button
                onClick={() => {
                  setActiveStory(null);
                  onNavigate('donate');
                }}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-500 transition"
              >
                Support Similar Programs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
