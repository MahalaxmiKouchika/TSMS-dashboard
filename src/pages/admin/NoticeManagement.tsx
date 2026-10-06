import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { Notice } from '../../types';
import { Bell, Plus, Trash2, X } from 'lucide-react';

export const NoticeManagement: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notice_date: new Date().toISOString().split('T')[0],
    attachment_url: '',
    is_published: 1,
    expiry_date: ''
  });

  const fetchNotices = () => {
    fetch('/api/admin/notices', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setNotices(d.data); });
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      body: JSON.stringify(formData)
    }).then(r => r.json()).then(d => { if (d.success) { setIsModalOpen(false); fetchNotices(); } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete notice?')) {
      fetch(`/api/admin/notices/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } })
        .then(r => r.json()).then(d => { if (d.success) fetchNotices(); });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Notices & Circulars Management" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 font-serif">Notices List ({notices.length})</h3>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Create Notice
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notices.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{n.title}</td>
                  <td className="p-4 text-slate-600">{n.notice_date}</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">Published</span></td>
                  <td className="p-4 text-right"><button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button></td>
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
              <h3 className="text-xl font-bold font-serif text-slate-900">Create Notice</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notice Date</label>
                <input type="date" value={formData.notice_date} onChange={e => setFormData({ ...formData, notice_date: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required></textarea>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow">Save Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
