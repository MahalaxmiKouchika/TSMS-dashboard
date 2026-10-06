import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, GraduationCap, Calendar, 
  Image as ImageIcon, Video, Bell, Trophy, FileSpreadsheet, 
  History, ShieldAlert, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout, admin } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'School Profile', path: '/admin/school', icon: Building2 },
    { name: 'Academic Years', path: '/admin/academic-years', icon: Calendar },
    { name: 'Student List', path: '/admin/students', icon: GraduationCap },
    { name: 'Import Excel', path: '/admin/students/import', icon: FileSpreadsheet },
    { name: 'Import History', path: '/admin/students/import-history', icon: History },
    { name: 'Staff Management', path: '/admin/staff', icon: Users },
    { name: 'Events Management', path: '/admin/events', icon: Calendar },
    { name: 'Photo & Video Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Notices & Circulars', path: '/admin/notices', icon: Bell },
    { name: 'Achievements', path: '/admin/achievements', icon: Trophy },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <span className="block font-bold text-white text-lg font-serif">Admin Portal</span>
        <span className="block text-xs text-amber-400 mt-0.5 font-medium">School Management</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between mb-3">
          <div className="truncate">
            <span className="block text-xs font-semibold text-white truncate">{admin?.full_name || 'Administrator'}</span>
            <span className="block text-[11px] text-slate-400 truncate">{admin?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-semibold transition border border-red-500/30"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
};
