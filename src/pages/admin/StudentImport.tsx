import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../components/AdminHeader';
import { AcademicYear } from '../../types';
import { FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

export const StudentImport: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/academic-years', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAcademicYears(data.data);
          const active = data.data.find((ay: any) => ay.is_active);
          if (active) setSelectedYearId(String(active.id));
        }
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedYearId) {
      setError('Please select an academic year and upload an Excel file.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('academic_year_id', selectedYearId);

    fetch('/api/admin/students/import-preview', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPreviewData(data.data);
          setStep('preview');
        } else {
          setError(data.message || 'Failed to parse Excel file.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error during file parsing.');
        setLoading(false);
      });
  };

  const handleConfirmImport = () => {
    if (!previewData) return;
    setLoading(true);
    setError('');

    fetch('/api/admin/students/import-confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({
        file_path: previewData.file_path,
        file_name: previewData.file_name,
        academic_year_id: selectedYearId
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setImportResult(data.data);
          setStep('success');
        } else {
          setError(data.message || 'Import transaction failed.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error during import confirmation.');
        setLoading(false);
      });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
      <AdminHeader title="Excel Student Roster Import" />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200 space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Upload Academic Year Student Excel</h3>
                <p className="text-slate-600 text-xs mt-1">Upload .xlsx, .xls or .csv file to bulk import student records securely.</p>
              </div>
              <a
                href="/api/admin/students/template"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition border border-indigo-100"
              >
                <Download className="w-4 h-4" /> Download Official Template
              </a>
            </div>

            <form onSubmit={handlePreview} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Target Academic Year</label>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  {academicYears.map(ay => (
                    <option key={ay.id} value={ay.id}>Academic Year: {ay.year_name} {ay.is_active ? '(Active)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Excel / CSV File</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4 hover:border-indigo-600 transition bg-slate-50">
                  <FileSpreadsheet className="w-12 h-12 text-indigo-600 mx-auto" />
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-sm">
                      <Upload className="w-4 h-4" /> Browse Excel File
                      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">{file ? file.name : 'No file selected (.xlsx, .xls, .csv)'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Validating Roster...' : 'Validate & Preview'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Preview & Validation */}
        {step === 'preview' && previewData && (
          <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200 space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Import Validation & Preview</h3>
                <p className="text-slate-600 text-xs mt-1">Review validation results before committing transaction to PostgreSQL.</p>
              </div>
              <button
                onClick={() => setStep('upload')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="w-4 h-4" /> Choose Different File
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Rows</span>
                <h4 className="text-2xl font-bold text-slate-900 mt-1">{previewData.total_rows}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-700 uppercase">Valid Records</span>
                <h4 className="text-2xl font-bold text-emerald-900 mt-1">{previewData.valid_rows}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <span className="text-xs font-semibold text-indigo-700 uppercase">New / Updates</span>
                <h4 className="text-2xl font-bold text-indigo-900 mt-1">+{previewData.new_records} / {previewData.update_records}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <span className="text-xs font-semibold text-red-700 uppercase">Errors</span>
                <h4 className="text-2xl font-bold text-red-900 mt-1">{previewData.error_count}</h4>
              </div>
            </div>

            {/* Error Log if any */}
            {previewData.errors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Row Validation Errors ({previewData.errors.length})
                </h4>
                <div className="bg-red-50/60 rounded-xl p-4 border border-red-200 max-h-48 overflow-y-auto space-y-2 text-xs text-red-800">
                  {previewData.errors.map((err: any, idx: number) => (
                    <div key={idx} className="flex justify-between border-b border-red-200 pb-1">
                      <span>Row {err.row} (ID: {err.student_id}): <strong>{err.error}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Student Data Preview (First 50 Rows)</h4>
              <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Section</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.preview_data.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-indigo-600">{row.student_id}</td>
                        <td className="p-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="p-3">{row.class_name}</td>
                        <td className="p-3">{row.section}</td>
                        <td className="p-3">{row.gender}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-semibold ${row.action === 'Insert' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            {row.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={loading || previewData.valid_rows === 0}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Committing Transaction...' : 'Confirm & Import to Database'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && importResult && (
          <div className="bg-white p-12 rounded-3xl shadow-xs border border-slate-200 text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-slate-900">Import Completed Successfully</h3>
            <p className="text-slate-600 text-sm">
              The student roster has been securely imported into the PostgreSQL database. Public statistics and student search have been updated automatically.
            </p>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 text-left text-xs">
              <div>
                <span className="text-slate-500 uppercase">Processed</span>
                <strong className="block text-slate-900 text-base">{importResult.total}</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Added</span>
                <strong className="block text-emerald-600 text-base">+{importResult.added}</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Updated</span>
                <strong className="block text-indigo-600 text-base">{importResult.updated}</strong>
              </div>
            </div>

            <button
              onClick={() => { setFile(null); setStep('upload'); setPreviewData(null); }}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md text-sm"
            >
              Import Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
