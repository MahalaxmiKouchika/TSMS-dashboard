import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { SchoolProfile } from '../../types';
import { Building2, Save, CheckCircle } from 'lucide-react';

export const SchoolSettings: React.FC = () => {
  const [school, setSchool] = useState<Partial<SchoolProfile>>({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/school', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSchool(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    fetch('/api/admin/school', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(school)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess('School profile updated successfully.');
        } else {
          setError(data.message || 'Failed to update school profile.');
        }
      })
      .catch(() => setError('Network error occurred.'));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading school settings...</div>;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="School Profile & Settings" />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">School Name</label>
              <input
                type="text"
                value={school.school_name || ''}
                onChange={(e) => setSchool({ ...school, school_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">School Code</label>
              <input
                type="text"
                value={school.school_code || ''}
                onChange={(e) => setSchool({ ...school, school_code: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">UDISE Code</label>
              <input
                type="text"
                value={school.udise_code || ''}
                onChange={(e) => setSchool({ ...school, udise_code: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Principal Name</label>
              <input
                type="text"
                value={school.principal_name || ''}
                onChange={(e) => setSchool({ ...school, principal_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">School Description</label>
              <textarea
                rows={3}
                value={school.description || ''}
                onChange={(e) => setSchool({ ...school, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Address</label>
              <input
                type="text"
                value={school.address || ''}
                onChange={(e) => setSchool({ ...school, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">City / Town</label>
              <input
                type="text"
                value={school.city || ''}
                onChange={(e) => setSchool({ ...school, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">District</label>
              <input
                type="text"
                value={school.district || ''}
                onChange={(e) => setSchool({ ...school, district: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">State & PIN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={school.state || ''}
                  onChange={(e) => setSchool({ ...school, state: e.target.value })}
                  placeholder="State"
                  className="w-2/3 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
                <input
                  type="text"
                  value={school.pincode || ''}
                  onChange={(e) => setSchool({ ...school, pincode: e.target.value })}
                  placeholder="PIN"
                  className="w-1/3 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Contact Number</label>
              <input
                type="text"
                value={school.contact_number || ''}
                onChange={(e) => setSchool({ ...school, contact_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Dashboard / Homepage Hero Background Image URL</label>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={school.school_banner || ''}
                  onChange={(e) => setSchool({ ...school, school_banner: e.target.value })}
                  placeholder="https://... or upload image"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex-shrink-0 transition">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const data = new FormData();
                        data.append('file', file);
                        fetch('/api/admin/upload', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
                          body: data
                        })
                          .then(r => r.json())
                          .then(resp => {
                            if (resp.success) {
                              setSchool({ ...school, school_banner: resp.data.url });
                            }
                          });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {school.school_banner && (
                <div className="mt-3 aspect-[16/5] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={school.school_banner} alt="Background Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save School Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
