import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import { Video as VideoIcon } from 'lucide-react';

export const Videos: React.FC = () => {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/gallery?type=video')
      .then(res => res.json())
      .then(data => {
        if (data.success) setVideos(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Video Portal</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">School Video Showcase</h1>
        <p className="text-slate-600 text-sm">Watch documentaries, annual day cultural events, science project presentations, and sports highlights.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No videos found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((vid) => (
            <div key={vid.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
              <div className="aspect-[16/9] bg-slate-900">
                {vid.url.includes('youtube') || vid.url.includes('youtu.be') ? (
                  <iframe
                    src={vid.url.replace('watch?v=', 'embed/')}
                    title={vid.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video src={vid.url} controls className="w-full h-full object-cover"></video>
                )}
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-bold text-lg text-slate-900">{vid.title}</h3>
                {vid.caption && <p className="text-sm text-slate-600">{vid.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
