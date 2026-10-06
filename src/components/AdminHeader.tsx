import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminHeader: React.FC<{ title: string }> = ({ title }) => {
  const { admin } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition border border-indigo-100"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Public Site
        </Link>
        <div className="flex items-center space-x-2 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            {admin?.admin_identifier ? admin.admin_identifier.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:inline">{admin?.admin_identifier}</span>
        </div>
      </div>
    </header>
  );
};
