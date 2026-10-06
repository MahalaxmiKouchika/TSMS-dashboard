import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminStudent, AcademicYear } from '../../types';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    gender: 'Male',
    dob: '',
    class_name: 'Class 8',
    section: 'A',
    admission_number: '',
    father_name: '',
    mother_name: '',
    academic_year_id: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState('');

  const fetchStudents = () => {
    setLoading(true);
    let url = '/api/admin/students?limit=100';
    if (selectedYear) url += `&academic_year_id=${selectedYear}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setStudents(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/admin/academic-years', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAcademicYears(data.data);
          const active = data.data.find((ay: any) => ay.is_active);
          if (active && !selectedYear) {
            setSelectedYear(String(active.id));
            setFormData(prev => ({ ...prev, academic_year_id: String(active.id) }));
          }
        }
      });
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchStudents();
    }
  }, [selectedYear, search]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      student_id: '',
      name: '',
      gender: 'Male',
      dob: '',
      class_name: 'Class 8',
      section: 'A',
      admission_number: '',
      father_name: '',
      mother_name: '',
      academic_year_id: selectedYear || (academicYears[0] ? String(academicYears[0].id) : ''),
      status: 'Active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: AdminStudent) => {
    setEditingStudent(st);
    setFormData({
      student_id: st.student_id,
      name: st.name,
      gender: st.gender,
      dob: st.dob || '',
      class_name: st.class,
      section: st.section,
      admission_number: st.admission_number || '',
      father_name: st.father_name || '',
      mother_name: st.mother_name || '',
      academic_year_id: String(st.academic_year_id),
      status: st.status
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const url = editingStudent ? `/api/admin/students/${editingStudent.id}` : '/api/admin/students';
    const method = editingStudent ? 'PUT' : 'POST';

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
          fetchStudents();
        } else {
          setFormError(data.message || 'Failed to save student.');
        }
      })
      .catch(() => setFormError('Network error occurred.'));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) fetchStudents();
        });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Student Directory Management" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            >
              {academicYears.map(ay => (
                <option key={ay.id} value={ay.id}>Academic Year: {ay.year_name} {ay.is_active ? '(Active)' : ''}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Student
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Class & Section</th>
                  <th className="p-4">Admission No.</th>
                  <th className="p-4">Parents</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">Loading student records...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No students found.</td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-indigo-600">{st.student_id}</td>
                      <td className="p-4 font-semibold text-slate-900">{st.name}</td>
                      <td className="p-4 text-slate-700">{st.class} - {st.section}</td>
                      <td className="p-4 text-slate-600">{st.admission_number || 'N/A'}</td>
                      <td className="p-4 text-xs text-slate-500">F: {st.father_name || '-'}<br/>M: {st.mother_name || '-'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold text-xs">
                          {st.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-serif text-slate-900">
                {editingStudent ? 'Edit Student Record' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Student ID</label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    placeholder="e.g. SCH2026001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Student Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Class</label>
                  <select
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Father Name</label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
