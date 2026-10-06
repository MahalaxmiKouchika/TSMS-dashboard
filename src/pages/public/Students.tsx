import React, { useState, useEffect } from 'react';
import { PublicStudent } from '../../types';
import { Search, Filter, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<PublicStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchStudents = () => {
    setLoading(true);
    let url = `/api/public/students?page=${page}&limit=25`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (className) url += `&class=${encodeURIComponent(className)}`;
    if (section) url += `&section=${encodeURIComponent(section)}`;
    if (academicYearId) url += `&academic_year_id=${academicYearId}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotalRecords(data.pagination.total);
          if (data.filters && data.filters.academic_years) {
            setAcademicYears(data.filters.academic_years);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [page, className, section, academicYearId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const classesList = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const sectionsList = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Public Directory</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Student Directory</h1>
        <p className="text-slate-600 text-sm">Browse permitted student records and enrollment status across academic years.</p>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={className}
              onChange={(e) => { setClassName(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            >
              <option value="">All Classes</option>
              {classesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={section}
              onChange={(e) => { setSection(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            >
              <option value="">All Sections</option>
              {sectionsList.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={academicYearId}
              onChange={(e) => { setAcademicYearId(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            >
              <option value="">All Academic Years</option>
              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.year_name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </form>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Showing students directory ({totalRecords} total records)</span>
          <span>Page {page} of {totalPages || 1}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Student ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class & Section</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Academic Year</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading students directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No student records found matching filters.</td>
                </tr>
              ) : (
                students.map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-indigo-600">{st.student_id}</td>
                    <td className="p-4 font-semibold text-slate-900">{st.name}</td>
                    <td className="p-4 text-slate-700">{st.class} - {st.section}</td>
                    <td className="p-4 text-slate-600">{st.gender}</td>
                    <td className="p-4 text-slate-600 font-medium">{st.academic_year || '2026-27'}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages || 1}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
