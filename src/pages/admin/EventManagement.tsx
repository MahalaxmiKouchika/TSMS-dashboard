import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { SchoolEvent, AcademicYear } from '../../types';
import { Calendar, Plus, Edit2, Trash2, X } from 'lucide-react';

export const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    academic_year_id: '',
    location: '',
    cover_image: '',
    status: 'Published'
  });

  const fetchEvents = () => {
    fetch('/api/admin/events', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setEvents(data.data); });
  };

  useEffect(() => {
    fetchEvents();
    fetch('/api/admin/academic-years', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAcademicYears(data.data);
          const active = data.data.find((ay: any) => ay.is_active);
          if (active) setFormData(prev => ({ ...prev, academic_year_id: String(active.id) }));
        }
      });
  }, []);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: new Date().toISOString().split('T')[0],
      academic_year_id: academicYears[0] ? String(academicYears[0].id) : '',
      location: '',
      cover_image: '',
      status: 'Published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: SchoolEvent) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      description: ev.description || '',
      event_date: ev.event_date,
      academic_year_id: String(ev.academic_year_id),
      location: ev.location || '',
      cover_image: ev.cover_image || '',
      status: ev.status
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events';
    const method = editingEvent ? 'PUT' : 'POST';

    fetch(url, {
      method,
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
          fetchEvents();
        }
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete event record?')) {
      fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(data => { if (data.success) fetchEvents(); });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="School Events Management" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 font-serif">Events List ({events.length})</h3>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Event Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Location</th>
                <th className="p-4">Academic Year</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{ev.title}</td>
                  <td className="p-4 text-slate-600">{ev.event_date}</td>
                  <td className="p-4 text-slate-600">{ev.location || 'N/A'}</td>
                  <td className="p-4 text-slate-600">{ev.academic_year}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(ev)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(ev.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-xl font-bold font-serif text-slate-900">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Event Title</label>
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
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Event Date</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Academic Year</label>
                  <select
                    value={formData.academic_year_id}
                    onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    required
                  >
                    {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.year_name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
