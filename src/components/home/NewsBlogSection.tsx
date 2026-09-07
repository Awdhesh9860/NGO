import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { CMSArticle } from '../../types';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';

interface NewsBlogSectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const NewsBlogSection: React.FC<NewsBlogSectionProps> = ({ onNavigate }) => {
  const { articles } = useDatabase();

  return (
    <section id="news-blog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            News & Field Dispatches
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Latest News & Field Updates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Articles and insights covering education, rural healthcare, clean environment, and community welfare.
          </p>
        </div>

        <button
          onClick={() => onNavigate('news')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>View All News & Blog</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((art: CMSArticle) => (
          <div
            key={art.id}
            onClick={() => onNavigate('article-detail', art.id)}
            className="group cursor-pointer bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-200 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-44 overflow-hidden bg-slate-100 relative">
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md">
                  {art.category.replace('_', ' ')}
                </span>
              </div>

              <div className="p-6 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {art.readTimeMinutes} min read
                  </span>
                  <span>{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US') : 'Recent'}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">By {art.author}</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Read Story</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
