import React, { useState, useEffect } from 'react';
import { Achievement } from '../../types';
import { Trophy, Award } from 'lucide-react';

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/achievements')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAchievements(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Excellence & Accolades</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">School Achievements</h1>
        <p className="text-slate-600 text-sm">Celebrating board examination records, district sports triumphs, and government recognitions.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No achievements recorded.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((ach) => (
            <div key={ach.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              {ach.image_url && (
                <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img src={ach.image_url} alt={ach.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md uppercase">
                    <Trophy className="w-3.5 h-3.5" /> {ach.category}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{ach.achievement_date}</span>
                </div>
                <h3 className="font-bold text-xl text-slate-900">{ach.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{ach.description}</p>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-indigo-600">
                Academic Year: {ach.academic_year || '2026-27'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
