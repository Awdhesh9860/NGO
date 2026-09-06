import React from 'react';
import { ArrowRight, BookOpen, Sparkles, MapPin } from 'lucide-react';

interface SuccessStoriesSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({ onNavigate }) => {
  const stories = [
    {
      id: 'story-1',
      category: 'Education Support',
      name: 'Ravi',
      title: 'From Risk of Dropping Out to Engineering College',
      location: 'Eastern Rural District',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
      quote: 'When my father lost his work, I was preparing to leave school in 9th grade. The after-school study center provided textbooks, tuition mentors, and exam fee sponsorship. Today, I am in my second year of computer engineering.',
      impactTag: 'First in Family at College'
    },
    {
      id: 'story-2',
      category: 'Women Livelihood',
      name: 'Meera',
      title: 'Starting a Home Tailoring Micro-Business',
      location: 'Sundarpur Village',
      image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80',
      quote: 'After completing the certified six-month vocational stitching workshop, I received a micro-starter sewing kit. I now earn enough every month to pay for both of my children’s school fees and medical checkups.',
      impactTag: 'Steady Monthly Income'
    }
  ];

  return (
    <section id="success-stories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Human Stories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Stories of Hope & Transformation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real journeys told with honesty, agency, and deep human dignity.
          </p>
        </div>

        <button
          onClick={() => onNavigate('stories')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>Read All Stories</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-xs hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full">
                  {story.category}
                </span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                  {story.impactTag}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {story.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "{story.quote}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>{story.location}</span>
              </div>
              <button
                onClick={() => onNavigate('stories')}
                className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Read Journey</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
