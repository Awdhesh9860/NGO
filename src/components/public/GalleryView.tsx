import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Search,
  X,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Filter,
  Play
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'projects' | 'events' | 'community' | 'volunteers' | 'campaigns' | 'videos';
  imageUrl: string;
  videoUrl?: string;
  date: string;
  location: string;
  alt: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'School Learning Kit Distribution',
    category: 'projects',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    date: 'August 2025',
    location: '[Project Location]',
    alt: 'Smiling children receiving notebooks and school bags in classroom',
    description: 'Volunteers distributing study materials, backpacks, and geometry boxes to primary school students.'
  },
  {
    id: 'gal-2',
    title: 'Solar Water Pump Installation',
    category: 'projects',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
    date: 'June 2025',
    location: '[Project Location]',
    alt: 'Clean water running from village tap powered by solar panels',
    description: 'Community members celebrating the launch of a new solar aquifer tap bringing clean water to over 300 households.'
  },
  {
    id: 'gal-3',
    title: 'Annual Community Health Camp',
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    date: 'July 2025',
    location: '[Project Location]',
    alt: 'Doctor doing general checkup for elderly villager',
    description: 'Volunteer doctors providing free eye exams, dental checkups, and pediatric vitamins.'
  },
  {
    id: 'gal-4',
    title: 'Women Tailoring & Skill Graduation',
    category: 'community',
    imageUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&auto=format&fit=crop&q=80',
    date: 'May 2025',
    location: '[Project Location]',
    alt: 'Women proudly displaying their hand-sewn garments and certificates',
    description: 'Twenty women completing our 6-month certified sewing and micro-business development training.'
  },
  {
    id: 'gal-5',
    title: 'Youth Volunteer Weekend Clean-Up',
    category: 'volunteers',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80',
    date: 'September 2025',
    location: '[Project Location]',
    alt: 'Volunteers with gloves and bags cleaning community park',
    description: 'Over 45 college students participating in our weekend neighborhood tree planting and waste-collection drive.'
  },
  {
    id: 'gal-6',
    title: 'Winter Warmth Blanket Drive',
    category: 'campaigns',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80',
    date: 'December 2024',
    location: '[Project Location]',
    alt: 'Volunteer handing thick blanket to a family during winter',
    description: 'Delivering 1,200 warm woolen blankets and jackets to families living in high-altitude cold belts.'
  },
  {
    id: 'gal-7',
    title: 'Computer Lab Inauguration',
    category: 'projects',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    date: 'March 2025',
    location: '[Project Location]',
    alt: 'Students learning computer typing and basic software',
    description: 'Opening a new 15-seat digital literacy center for rural school students to practice typing and homework.'
  },
  {
    id: 'gal-8',
    title: 'Field Team Video Journal',
    category: 'videos',
    imageUrl: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    date: 'October 2025',
    location: '[Project Location]',
    alt: 'Field worker explaining the water filter project to camera',
    description: 'Watch a 3-minute video showing our field workers testing groundwater quality before installing filters.'
  }
];

interface GalleryViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'projects', label: 'Projects' },
    { id: 'events', label: 'Events' },
    { id: 'community', label: 'Community Activities' },
    { id: 'volunteers', label: 'Volunteers' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'videos', label: 'Video Gallery' }
  ];

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
            Our Visual Journey
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Moments of Hope & Action
          </h1>
          {/* 2. Gallery Introduction */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            See the honest, day-to-day moments of our work. Photographs and videos captured by our volunteers, staff, and community members on the ground.
          </p>
        </div>
      </section>

      {/* 10. Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search moments, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <ImageIcon className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Photos Found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or selecting a different album tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveLightboxItem(item)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col justify-between"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.alt}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.category === 'videos' && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/90 text-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="h-5 w-5 fill-emerald-600 ml-0.5" />
                      </div>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setActiveLightboxItem(null)}
              className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Media Area */}
            <div className="relative h-80 sm:h-[420px] bg-black">
              {activeLightboxItem.category === 'videos' && activeLightboxItem.videoUrl ? (
                <iframe
                  src={activeLightboxItem.videoUrl}
                  title={activeLightboxItem.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={activeLightboxItem.imageUrl}
                  alt={activeLightboxItem.alt}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Metadata and Description */}
            <div className="p-6 sm:p-8 space-y-3 bg-white">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-3 py-0.5 uppercase tracking-wide text-[10px]">
                  {activeLightboxItem.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {activeLightboxItem.location}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {activeLightboxItem.date}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeLightboxItem.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeLightboxItem.description}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Shared for transparency and public awareness.
                </span>
                <button
                  onClick={() => {
                    setActiveLightboxItem(null);
                    onNavigate('donate');
                  }}
                  className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-500 transition"
                >
                  Support This Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
