import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, Heart } from 'lucide-react';

interface ArticleDetailViewProps {
  articleId: string;
  onBack: () => void;
  onOpenDonate: () => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  articleId,
  onBack,
  onOpenDonate
}) => {
  const { articles } = useDatabase();
  const article = articles.find((a) => a.id === articleId) || articles[0];

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl p-12 text-center">
        <p className="text-slate-500">Article not found.</p>
        <button onClick={onBack} className="mt-4 text-emerald-600 font-bold">
          ← Back to News
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Stories
      </button>

      {/* Header */}
      <div className="space-y-4">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
          {article.category.replace('_', ' ')}
        </span>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-y border-slate-100 py-3">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-emerald-600" /> By {article.author} ({article.authorRole})
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> {article.publishedAt}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" /> {article.readTimeMinutes} min read
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="overflow-hidden rounded-3xl shadow-xl">
        <img
          src={article.coverImage}
          alt={article.title}
          className="h-96 w-full object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
        <p className="font-serif italic text-lg text-slate-900 border-l-4 border-emerald-500 pl-4 py-1">
          {article.excerpt}
        </p>

        <p>{article.content}</p>

        <p>
          "The transformation has been remarkable," explains local village council representative Sunita Devi. "When families have reliable water and school electricity, girls stay enrolled through secondary grades instead of spending four hours fetching pond water."
        </p>

        <p>
          Through community-led monitoring dashboards and quarterly maintenance funds, the project achieves an audited 99.2% continuous uptime across all installed water filtration stations.
        </p>
      </div>

      {/* Tags & Bottom Action */}
      <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((t, i) => (
            <span
              key={i}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              #{t}
            </span>
          ))}
        </div>

        <button
          onClick={onOpenDonate}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition"
        >
          <Heart className="h-4 w-4 fill-white" />
          Support Grassroots Impact
        </button>
      </div>
    </div>
  );
};
