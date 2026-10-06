import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { MediaItem, SchoolEvent, AcademicYear } from '../../types';
import { Image as ImageIcon, Plus, Trash2, X, Upload } from 'lucide-react';

export const MediaManagement: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    media_type: 'photo' as 'photo' | 'video',
    url: '',
    thumbnail_url: '',
    event_id: '',
    academic_year_id: '',
    caption: ''
  });

  const fetchMedia = () => {
    fetch('/api/admin/media', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setMediaList(data.data); });
  };

  useEffect(() => {
    fetchMedia();
    fetch('/api/admin/events', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } }).then(r => r.json()).then(d => { if (d.success) setEvents(d.data); });
    fetch('/api/admin/academic-years', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } }).then(r => r.json()).then(d => { if (d.success) setAcademicYears(d.data); });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const data = new FormData();
      data.append('file', file);

      fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
        body: data
      })
        .then(res => res.json())
        .then(resp => {
          if (resp.success) {
            setFormData(prev => ({ ...prev, url: resp.data.url, thumbnail_url: resp.data.url }));
          }
        });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/admin/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsModalOpen(false);
          fetchMedia();
        }
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete media item?')) {
      fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(data => { if (data.success) fetchMedia(); });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Photo & Video Gallery Management" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 font-serif">Media Items ({mediaList.length})</h3>
          <button
            onClick={() => {
              setFormData({ title: '', media_type: 'photo', url: '', thumbnail_url: '', event_id: '', academic_year_id: '', caption: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Upload Media
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Event</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mediaList.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden">
                      <img src={m.thumbnail_url || m.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">{m.title}</td>
                  <td className="p-4"><span className="uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold">{m.media_type}</span></td>
                  <td className="p-4 text-slate-600">{m.event_title || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                  </td>
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
              <h3 className="text-xl font-bold font-serif text-slate-900">Upload Media</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Media Type</label>
                  <select
                    value={formData.media_type}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Event Association</label>
                  <select
                    value={formData.event_id}
                    onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="">-- None --</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">File Upload / URL</label>
                <input type="file" onChange={handleFileUpload} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value, thumbnail_url: e.target.value })}
                  placeholder="Or enter direct URL / YouTube link"
                  className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Caption</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow">Save Media</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
