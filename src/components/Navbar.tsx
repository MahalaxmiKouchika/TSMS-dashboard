import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Search, Menu, X, Shield, Phone, Mail } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('Telangana Model School, Navipet');
  const [schoolLogo, setSchoolLogo] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/public/school')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          if (data.data.school_name) setSchoolName(data.data.school_name);
          if (data.data.school_logo) setSchoolLogo(data.data.school_logo);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Students', path: '/students' },
    { name: 'Search ID', path: '/students/search' },
    { name: 'Staff', path: '/staff' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Videos', path: '/videos' },
    { name: 'Notices', path: '/notices' },
    { name: 'Achievements', path: '/achievements' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-100">
      {/* Top Bar */}
      <div className="bg-indigo-900 text-indigo-100 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400" /> +91 40 2345 6789</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> info@vidyavikas.edu</span>
            <span>UDISE Code: 36240102304</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/admin/login" className="flex items-center gap-1 hover:text-amber-300 font-medium transition">
              <Shield className="w-3.5 h-3.5" /> Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition">
              {schoolLogo ? (
                <img src={schoolLogo} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
              ) : (
                <GraduationCap className="w-7 h-7 text-amber-300" />
              )}
            </div>
            <div>
              <span className="block font-bold text-sm sm:text-base lg:text-lg text-slate-900 tracking-tight font-serif leading-tight">{schoolName}</span>
              <span className="block text-xs font-medium text-slate-500 uppercase tracking-widest">Public Information Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/students/search"
              className="ml-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
            >
              <Search className="w-4 h-4" /> Search Student
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden space-x-2">
            <Link
              to="/students/search"
              className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
              title="Search Student"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium transition ${
                isActive(link.path)
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center px-4">
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Shield className="w-4 h-4" /> Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
