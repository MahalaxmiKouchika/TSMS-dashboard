import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import { Image as ImageIcon, Video, Calendar, Eye } from 'lucide-react';

export const Gallery: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [tab, setTab] = useState<'all' | 'photo' | 'video'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    let url = '/api/public/gallery';
    if (tab !== 'all') url += `?type=${tab}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMediaList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Digital Media Portal</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Photo & Video Gallery</h1>
        <p className="text-slate-600 text-sm">Explore moments captured from campus life, annual days, laboratory sessions, and sports meets.</p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex bg-slate-200/80 p-1.5 rounded-xl space-x-1">
          <button
            onClick={() => setTab('all')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Media
          </button>
          <button
            onClick={() => setTab('photo')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'photo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Photos
          </button>
          <button
            onClick={() => setTab('video')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'video' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Videos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading gallery...</div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No media found in gallery.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaList.map((item) => (
            <div
              key={item.id}
              onClick={() => item.media_type === 'photo' && setSelectedImage(item)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer hover:shadow-md transition"
            >
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                <img
                  src={item.thumbnail_url || item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <Eye className="w-8 h-8" />
                </div>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold uppercase">
                  {item.media_type}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                {item.event_title && <p className="text-xs text-indigo-600 font-medium">Event: {item.event_title}</p>}
                {item.caption && <p className="text-xs text-slate-500 line-clamp-1">{item.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/60 text-white font-bold flex items-center justify-center hover:bg-slate-900 transition"
            >
              ✕
            </button>
            <div className="aspect-[16/9] bg-black flex items-center justify-center">
              <img src={selectedImage.url} alt={selectedImage.title} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-xl font-bold text-slate-900">{selectedImage.title}</h3>
              {selectedImage.caption && <p className="text-sm text-slate-600">{selectedImage.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
