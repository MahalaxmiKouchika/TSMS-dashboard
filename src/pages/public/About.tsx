import React, { useState, useEffect } from 'react';
import { SchoolProfile } from '../../types';
import { Building2, Award, BookOpen, MapPin, Phone, Mail, Globe } from 'lucide-react';

export const About: React.FC = () => {
  const [school, setSchool] = useState<SchoolProfile | null>(null);

  useEffect(() => {
    fetch('/api/public/school').then(r => r.json()).then(d => { if (d.success) setSchool(d.data); }).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">About Our Institution</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900">{school?.school_name || 'VidyaVikas Public School'}</h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Established in {school?.established_year || '1988'}, our school is dedicated to delivering inclusive, top-tier public education, fostering moral integrity, intellectual curiosity, and community leadership.
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Institution Identity</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><strong>School Code:</strong> {school?.school_code}</li>
            <li><strong>UDISE Code:</strong> {school?.udise_code}</li>
            <li><strong>Established:</strong> {school?.established_year}</li>
            <li><strong>School Type:</strong> {school?.school_type}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Academic Structure</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><strong>Management:</strong> {school?.management_type}</li>
            <li><strong>Medium:</strong> {school?.medium_of_instruction}</li>
            <li><strong>Headmaster/Principal:</strong> {school?.principal_name}</li>
            <li><strong>Curriculum:</strong> State Board / National Framework</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Location & Contact</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><strong>Address:</strong> {school?.address}, {school?.city}</li>
            <li><strong>District:</strong> {school?.district}, {school?.state} - {school?.pincode}</li>
            <li><strong>Phone:</strong> {school?.contact_number}</li>
            <li><strong>Email:</strong> {school?.email}</li>
          </ul>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-md space-y-4">
          <h3 className="text-2xl font-bold font-serif text-amber-300">Our Mission</h3>
          <p className="text-indigo-100 leading-relaxed text-base">
            {school?.mission || 'To provide accessible, high-quality, value-based education empowering every rural and urban student to achieve excellence.'}
          </p>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-md space-y-4">
          <h3 className="text-2xl font-bold font-serif text-amber-300">Our Vision</h3>
          <p className="text-slate-300 leading-relaxed text-base">
            {school?.vision || 'Building a community of lifelong learners, critical thinkers, and responsible citizens equipped for the digital era.'}
          </p>
        </div>
      </div>
    </div>
  );
};
