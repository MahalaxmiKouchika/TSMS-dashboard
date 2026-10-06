import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { AuditLog } from '../../types';
import { ShieldAlert } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } })
      .then(r => r.json()).then(d => { if (d.success) setLogs(d.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Administrative Audit Logs" />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 font-serif flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" /> Admin Activity Trail
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin Email</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading audit logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No audit logs found.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-600">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-4 font-semibold text-slate-900">{log.admin_email}</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">{log.action}</span></td>
                      <td className="p-4 text-slate-700">{log.details}</td>
                      <td className="p-4 text-slate-500 font-mono">{log.ip_address}</td>
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
