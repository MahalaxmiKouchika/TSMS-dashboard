import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { Achievement, AcademicYear } from '../../types';
import { Trophy, Plus, Trash2, X } from 'lucide-react';

export const AchievementManagement: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    achievement_date: new Date().toISOString().split('T')[0],
    category: 'academic' as any,
    image_url: '',
    academic_year_id: ''
  });

  const fetchAchievements = () => {
    fetch('/api/admin/achievements', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } })
      .then(r => r.json()).then(d => { if (d.success) setAchievements(d.data); });
  };

  useEffect(() => {
    fetchAchievements();
    fetch('/api/admin/academic-years', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } })
      .then(r => r.json()).then(d => { if (d.success) { setAcademicYears(d.data); const active = d.data.find((ay: any) => ay.is_active); if (active) setFormData(prev => ({ ...prev, academic_year_id: String(active.id) })); } });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/admin/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      body: JSON.stringify(formData)
    }).then(r => r.json()).then(d => { if (d.success) { setIsModalOpen(false); fetchAchievements(); } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete achievement?')) {
      fetch(`/api/admin/achievements/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } })
        .then(r => r.json()).then(d => { if (d.success) fetchAchievements(); });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="School Achievements Management" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 font-serif">Achievements List ({achievements.length})</h3>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Academic Year</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {achievements.map((ach) => (
                <tr key={ach.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{ach.title}</td>
                  <td className="p-4"><span className="uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-bold">{ach.category}</span></td>
                  <td className="p-4 text-slate-600">{ach.achievement_date}</td>
                  <td className="p-4 text-slate-600">{ach.academic_year}</td>
                  <td className="p-4 text-right"><button onClick={() => handleDelete(ach.id)} className="p-2 rounded-lg bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-serif text-slate-900">Add Achievement</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white">
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="government">Government</option>
                    <option value="school">School</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Academic Year</label>
                  <select value={formData.academic_year_id} onChange={e => setFormData({ ...formData, academic_year_id: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white" required>
                    {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.year_name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                <input type="date" value={formData.achievement_date} onChange={e => setFormData({ ...formData, achievement_date: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required></textarea>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow">Save Achievement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
