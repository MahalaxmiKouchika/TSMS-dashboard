import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    fetch('/api/public/school')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSchool(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About School */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
                <GraduationCap className="w-6 h-6 text-amber-300" />
              </div>
              <span className="font-bold text-lg text-white font-serif">{school?.school_name || 'VidyaVikas Public School'}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {school?.description || 'Dedicated to imparting foundational values, academic rigor, and holistic growth for every student.'}
            </p>
            <div className="text-xs text-slate-400">
              <p>School Code: <strong className="text-white">{school?.school_code}</strong></p>
              <p>UDISE Code: <strong className="text-white">{school?.udise_code}</strong></p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-amber-400 transition">About School</Link></li>
              <li><Link to="/students" className="hover:text-amber-400 transition">Student Directory</Link></li>
              <li><Link to="/students/search" className="hover:text-amber-400 transition">Verify Student ID</Link></li>
              <li><Link to="/staff" className="hover:text-amber-400 transition">Staff Directory</Link></li>
              <li><Link to="/events" className="hover:text-amber-400 transition">School Events</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-400 transition">Photo & Video Gallery</Link></li>
            </ul>
          </div>

          {/* Portals & Notices */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Information & Notices</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/notices" className="hover:text-amber-400 transition">Latest Notices & Circulars</Link></li>
              <li><Link to="/achievements" className="hover:text-amber-400 transition">School Achievements</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition">Contact & Location</Link></li>
              <li className="pt-2">
                <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium text-xs bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
                  <Shield className="w-3.5 h-3.5" /> Authorized Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="flex items-start space-x-3 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
              <span>{school?.address}, {school?.city}, {school?.district}, {school?.state} - {school?.pincode}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{school?.contact_number}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{school?.email}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {school?.school_name || 'VidyaVikas Public School'}. All rights reserved. Official Public Information & Digital Media Portal.</p>
        </div>
      </div>
    </footer>
  );
};
