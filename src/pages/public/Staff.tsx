import React, { useState, useEffect } from 'react';
import { Staff as StaffType } from '../../types';
import { Users, Award, BookOpen } from 'lucide-react';

export const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [tab, setTab] = useState<'all' | 'teaching' | 'non-teaching'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/api/public/staff';
    if (tab !== 'all') url += `?type=${tab}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStaffList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Faculty & Staff</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Our Dedicated Educators & Staff</h1>
        <p className="text-slate-600 text-sm">Meet the experienced professionals shaping young minds and maintaining institutional excellence.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-200/80 p-1.5 rounded-xl space-x-1">
          <button
            onClick={() => setTab('all')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Staff
          </button>
          <button
            onClick={() => setTab('teaching')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'teaching' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Teaching Faculty
          </button>
          <button
            onClick={() => setTab('non-teaching')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'non-teaching' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Non-Teaching Staff
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading staff directory...</div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No staff members found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staffList.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl overflow-hidden flex-shrink-0">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{member.designation}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p><strong>Department:</strong> {member.department || 'General'}</p>
                  <p><strong>Qualification:</strong> {member.qualification}</p>
                  <p><strong>Experience:</strong> {member.experience_years} Years</p>
                  {member.bio && <p className="italic text-slate-500 pt-1">"{member.bio}"</p>}
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Joined {member.joining_year || '2015'}</span>
                <span className="capitalize px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">{member.staff_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
