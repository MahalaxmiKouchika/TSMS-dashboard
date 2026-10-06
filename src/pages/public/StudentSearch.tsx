import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, GraduationCap, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PublicStudent } from '../../types';

export const StudentSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('studentId') || '';
  const [studentIdInput, setStudentIdInput] = useState(queryId);
  const [student, setStudent] = useState<PublicStudent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const searchStudent = (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError('');
    setStudent(null);
    setSearched(true);

    fetch(`/api/public/students/search?studentId=${encodeURIComponent(idToSearch.trim())}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudent(data.data);
        } else {
          setError(data.message || 'Student ID not found in official records.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error occurred while searching student record.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (queryId) {
      setStudentIdInput(queryId);
      searchStudent(queryId);
    }
  }, [queryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchStudent(studentIdInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Student ID Verification</h1>
        <p className="text-slate-600 text-sm">
          Enter your official Student ID to verify enrollment status, class assignment, and academic records securely.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Student ID Number</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. SCH2026001"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Searching...' : 'Verify'}
              </button>
            </div>
          </div>
        </form>

        {/* Results Area */}
        {searched && !loading && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            {error ? (
              <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base">Record Not Found</h4>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : student ? (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span className="font-bold text-emerald-900 text-lg">Official Student Record Verified</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full uppercase">
                    {student.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Student ID</span>
                    <strong className="text-slate-900 text-base font-mono">{student.student_id}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Student Name</span>
                    <strong className="text-slate-900 text-base">{student.name}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Class & Section</span>
                    <strong className="text-slate-900 text-base">{student.class} - Section {student.section}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Gender</span>
                    <strong className="text-slate-900 text-base">{student.gender}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Academic Year</span>
                    <strong className="text-slate-900 text-base">{student.academic_year || '2026-27'}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>This record is officially verified against the VidyaVikas Public School PostgreSQL database. Confidential details are restricted for privacy.</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
