import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { BookOpen, Calendar, Clock, ArrowRight, Tag, Search } from 'lucide-react';

interface NewsBlogViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const NewsBlogView: React.FC<NewsBlogViewProps> = ({ onNavigate }) => {
  const { articles } = useDatabase();
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const allTags = ['ALL', 'WATER_SECURITY', 'GIRLS_EDUCATION', 'DISASTER_RELIEF', 'TRANSPARENCY'];

  const filteredArticles = articles.filter(
    (a) => selectedTag === 'ALL' || a.category === selectedTag || a.tags.includes(selectedTag.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
      {/* Banner */}
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white shadow-xl">
        <span className="inline-block rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Stories, Dispatches & Policy Updates
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
          News, Field Stories & Research
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          In-depth reports from our frontline leads, community interviews, and empirical policy briefs.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`rounded-xl px-4 py-2 transition ${
              selectedTag === tag
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tag === 'ALL' ? 'All Stories' : tag.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => onNavigate('article-detail', art.id)}
            className="group cursor-pointer rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
          >
            <div>
              <div className="h-52 overflow-hidden">
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px]">
                    {art.category.replace('_', ' ')}
                  </span>
                  <span>{art.readTimeMinutes} min read</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>

                <div className="flex flex-wrap gap-1 pt-2">
                  {art.tags.map((t, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
              <span>By <strong>{art.author}</strong></span>
              <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                Read Story <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
