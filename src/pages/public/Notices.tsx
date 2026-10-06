import React, { useState, useEffect } from 'react';
import { Notice } from '../../types';
import { Bell, Calendar, Download } from 'lucide-react';

export const Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/notices')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotices(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Official Circulars</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Notices & Announcements</h1>
        <p className="text-slate-600 text-sm">Stay informed with the latest administrative circulars, exam schedules, and holiday notifications.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No active notices found.</div>
      ) : (
        <div className="space-y-6">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 hover:border-indigo-300 transition">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  <Bell className="w-3.5 h-3.5" /> Circular
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {notice.notice_date}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{notice.title}</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{notice.description}</p>
              
              {notice.attachment_url && (
                <div className="pt-2">
                  <a
                    href={notice.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition border border-indigo-100"
                  >
                    <Download className="w-4 h-4" /> Download Attachment
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
