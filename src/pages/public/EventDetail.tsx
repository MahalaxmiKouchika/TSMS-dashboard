import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SchoolEvent } from '../../types';
import { Calendar, MapPin, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/events/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setEvent(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading event details...</div>;
  if (!event) return <div className="text-center py-20 text-slate-700">Event not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-6">
        {event.cover_image && (
          <div className="aspect-[21/9] bg-slate-100 overflow-hidden">
            <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5" /> {event.event_date}
              </span>
              <h1 className="text-3xl font-bold font-serif text-slate-900 mt-2">{event.title}</h1>
            </div>
            {event.location && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 text-amber-500" /> {event.location}
              </span>
            )}
          </div>

          <div className="text-slate-700 text-base leading-relaxed space-y-4">
            <p>{event.description}</p>
          </div>

          {/* Event Media Photos */}
          {event.media && event.media.length > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" /> Event Photo Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.media.map((m) => (
                  <div key={m.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3]">
                    <img src={m.url} alt={m.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
