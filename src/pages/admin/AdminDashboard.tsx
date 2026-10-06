import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { DashboardStatistics } from '../../types';
import { Users, GraduationCap, Calendar, Bell, FileSpreadsheet, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/public/statistics').then(r => r.json()),
      fetch('/api/admin/students/import-history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      }).then(r => r.json())
    ])
      .then(([statsRes, importRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (importRes.success) setImports(importRes.data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Admin Overview Dashboard" />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.totalStudents || 0}</h3>
              <span className="text-xs text-indigo-600 font-medium mt-1 inline-block">Active Academic Year</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teaching Staff</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.teachingStaff || 0}</h3>
              <span className="text-xs text-amber-600 font-medium mt-1 inline-block">Qualified Educators</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.totalStaff || 0}</h3>
              <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Teaching & Non-Teaching</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Year</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.activeAcademicYear || '2026-27'}</h3>
              <span className="text-xs text-violet-600 font-medium mt-1 inline-block">Current Active Cycle</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Actions / Workflows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-950 font-serif">Yearly Student Import</h3>
            <p className="text-xs text-slate-600">Upload the next academic year student Excel roster with automatic row validation and preview.</p>
            <Link
              to="/admin/students/import"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Import Excel Roster <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-950 font-serif">Student Directory</h3>
            <p className="text-xs text-slate-600">Manually add, edit, archive or search student records across all academic years.</p>
            <Link
              to="/admin/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <GraduationCap className="w-4 h-4" /> Manage Students <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-950 font-serif">School Profile & Config</h3>
            <p className="text-xs text-slate-600">Update school name, logo, UDISE code, address, principal name, and contact details.</p>
            <Link
              to="/admin/school"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" /> School Settings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Import History */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 font-serif">Recent Import Activity</h3>
            <Link to="/admin/students/import-history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View All History</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Total Rows</th>
                  <th className="p-4">Added</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4">Errors</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {imports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">No recent imports found.</td>
                  </tr>
                ) : (
                  imports.map((imp) => (
                    <tr key={imp.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-600">{new Date(imp.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-slate-900">{imp.file_name}</td>
                      <td className="p-4 text-slate-600">{imp.academic_year}</td>
                      <td className="p-4 text-slate-700">{imp.total_rows}</td>
                      <td className="p-4 text-emerald-600 font-bold">+{imp.added_count}</td>
                      <td className="p-4 text-indigo-600 font-bold">{imp.updated_count}</td>
                      <td className="p-4 text-red-600 font-bold">{imp.error_count}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold">{imp.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
