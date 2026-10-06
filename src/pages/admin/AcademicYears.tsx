import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { AcademicYear } from '../../types';
import { Calendar, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export const AcademicYears: React.FC = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearName, setYearName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchYears = () => {
    setLoading(true);
    fetch('/api/admin/academic-years', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setYears(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    fetch('/api/admin/academic-years', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({ year_name: yearName, start_date: startDate, end_date: endDate, is_active: isActive ? 1 : 0 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess('Academic year created successfully.');
          setYearName('');
          setStartDate('');
          setEndDate('');
          setIsActive(false);
          fetchYears();
        } else {
          setError(data.message || 'Failed to create academic year.');
        }
      })
      .catch(() => setError('Network error occurred.'));
  };

  const handleActivate = (id: number) => {
    fetch(`/api/admin/academic-years/${id}/activate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) fetchYears();
      });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Academic Year Management" />

      <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Create Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200 space-y-6">
          <h3 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Create New Academic Year
          </h3>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {success}
            </div>
          )}

          <form onSubmit={handleCreateYear} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Academic Year Name</label>
              <input
                type="text"
                value={yearName}
                onChange={(e) => setYearName(e.target.value)}
                placeholder="e.g. 2027-28"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Year
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 font-serif">Configured Academic Years</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {years.map((ay) => (
                  <tr key={ay.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900 font-serif text-base">{ay.year_name}</td>
                    <td className="p-4 text-slate-600">{ay.start_date || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{ay.end_date || 'N/A'}</td>
                    <td className="p-4">
                      {ay.is_active === 1 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Active Public Year
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Archived / Historical
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {ay.is_active !== 1 && (
                        <button
                          onClick={() => handleActivate(ay.id)}
                          className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition"
                        >
                          Set as Active
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
