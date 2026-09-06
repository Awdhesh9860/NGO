import React from 'react';
import { ArrowRight, Eye, Camera } from 'lucide-react';

interface FieldGallerySectionProps {
  onNavigate: (view: string, id?: string) => void;
}

export const FieldGallerySection: React.FC<FieldGallerySectionProps> = ({ onNavigate }) => {
  const photos = [
    {
      title: 'School Classroom Support',
      category: 'Education',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Solar Safe Water Station',
      category: 'Clean Water',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Mobile Doctor & Health Camp',
      category: 'Healthcare',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Women Vocational Tailoring',
      category: 'Livelihoods',
      image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <section id="field-gallery" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Visual Proof
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Moments From the Ground
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dignified photographs from our schools, clean water taps, and community health camps.
          </p>
        </div>

        <button
          onClick={() => onNavigate('gallery')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>View Full Photo Gallery</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {photos.map((item) => (
          <div
            key={item.title}
            onClick={() => onNavigate('gallery')}
            className="h-48 sm:h-56 rounded-3xl overflow-hidden cursor-pointer group relative bg-slate-100 shadow-xs"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 px-2 py-0.5 rounded text-white inline-block mb-1">
                {item.category}
              </span>
              <p className="text-xs font-bold truncate">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
