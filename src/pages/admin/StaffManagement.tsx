import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { Staff } from '../../types';
import { Users, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    photo_url: '',
    designation: '',
    department: '',
    qualification: '',
    experience_years: 5,
    staff_type: 'teaching' as 'teaching' | 'non-teaching',
    joining_year: '2018',
    status: 'Active',
    bio: ''
  });

  const fetchStaff = () => {
    setLoading(true);
    fetch('/api/admin/staff', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setStaffList(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      photo_url: '',
      designation: '',
      department: '',
      qualification: '',
      experience_years: 5,
      staff_type: 'teaching',
      joining_year: '2020',
      status: 'Active',
      bio: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Staff) => {
    setEditingStaff(st);
    setFormData({
      name: st.name,
      photo_url: st.photo_url || '',
      designation: st.designation,
      department: st.department || '',
      qualification: st.qualification || '',
      experience_years: st.experience_years,
      staff_type: st.staff_type,
      joining_year: st.joining_year || '',
      status: st.status,
      bio: st.bio || ''
    });
    setIsModalOpen(true);
  };

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
            setFormData(prev => ({ ...prev, photo_url: resp.data.url }));
          }
        });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingStaff ? `/api/admin/staff/${editingStaff.id}` : '/api/admin/staff';
    const method = editingStaff ? 'PUT' : 'POST';

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
          fetchStaff();
        }
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete staff member record?')) {
      fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(data => { if (data.success) fetchStaff(); });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Staff & Faculty Management" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 font-serif">Staff Directory ({staffList.length})</h3>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
                        {st.photo_url ? <img src={st.photo_url} alt="" className="w-full h-full object-cover" /> : st.name.charAt(0)}
                      </div>
                      {st.name}
                    </td>
                    <td className="p-4 text-slate-700">{st.designation}</td>
                    <td className="p-4 text-slate-600">{st.department}</td>
                    <td className="p-4"><span className="capitalize px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold">{st.staff_type}</span></td>
                    <td className="p-4 text-slate-600">{st.experience_years} Years</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(st)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(st.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-serif text-slate-900">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Staff Type</label>
                  <select
                    value={formData.staff_type}
                    onChange={(e) => setFormData({ ...formData, staff_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="teaching">Teaching Faculty</option>
                    <option value="non-teaching">Non-Teaching Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Photo Upload</label>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Bio / Quote</label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
