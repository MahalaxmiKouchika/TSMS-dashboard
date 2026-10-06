import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SchoolEvent } from '../../types';
import { Calendar, MapPin, ArrowRight, Filter } from 'lucide-react';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    fetch('/api/public/events')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Sort events chronologically descending by event_date
          const sorted = data.data.sort((a: SchoolEvent, b: SchoolEvent) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
          setEvents(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Extract unique academic years for filtering
  const academicYears = Array.from(new Set(events.map(ev => ev.academic_year || '2026-27')));

  const filteredEvents = selectedYear === 'all' 
    ? events 
    : events.filter(ev => (ev.academic_year || '2026-27') === selectedYear);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">School Calendar</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Events & Occasions</h1>
        <p className="text-slate-600 text-sm">Explore our vibrant co-curricular activities, national celebrations, and academic exhibitions sorted year-wise.</p>
      </div>

      {/* Year Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter by Academic Year:
        </span>
        <button
          onClick={() => setSelectedYear('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${selectedYear === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          All Years ({events.length})
        </button>
        {academicYears.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${selectedYear === year ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Academic Year {year}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No events found for this academic year.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div>
                {ev.cover_image && (
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img src={ev.cover_image} alt={ev.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" /> {ev.event_date}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded">
                      {ev.academic_year || '2026-27'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{ev.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3">{ev.description}</p>
                  {ev.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> {ev.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Link to={`/events/${ev.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                  View Event Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
