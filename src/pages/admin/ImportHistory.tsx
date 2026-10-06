import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { ImportHistoryItem } from '../../types';
import { History, FileSpreadsheet } from 'lucide-react';

export const ImportHistory: React.FC = () => {
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/students/import-history', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setHistory(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Student Import History & Audit Trail" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 font-serif flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" /> Past Excel Rosters Uploaded
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Import Date</th>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Total Rows</th>
                  <th className="p-4">Added</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4">Errors</th>
                  <th className="p-4">Imported By</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">Loading import history...</td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">No import records found.</td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-600">{new Date(item.created_at).toLocaleString()}</td>
                      <td className="p-4 font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> {item.file_name}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{item.academic_year}</td>
                      <td className="p-4 text-slate-700">{item.total_rows}</td>
                      <td className="p-4 text-emerald-600 font-bold">+{item.added_count}</td>
                      <td className="p-4 text-indigo-600 font-bold">{item.updated_count}</td>
                      <td className="p-4 text-red-600 font-bold">{item.error_count}</td>
                      <td className="p-4 text-slate-500">{item.imported_by}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold">{item.status}</span>
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
