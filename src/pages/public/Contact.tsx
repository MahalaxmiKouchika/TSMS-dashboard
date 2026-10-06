import React, { useState, useEffect } from 'react';
import { SchoolProfile } from '../../types';
import { MapPin, Phone, Mail, Globe, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    fetch('/api/public/school').then(r => r.json()).then(d => { if (d.success) setSchool(d.data); }).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Get In Touch</span>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Contact Information</h1>
        <p className="text-slate-600 text-sm">We welcome inquiries from parents, alumni, and community visitors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-xl font-bold font-serif text-slate-900">{school?.school_name}</h3>
            
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>{school?.address}, {school?.city}, {school?.district}, {school?.state} - {school?.pincode}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>{school?.contact_number}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>{school?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>{school?.website}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p><strong>School Code:</strong> {school?.school_code}</p>
              <p><strong>UDISE Code:</strong> {school?.udise_code}</p>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            {submitted ? (
              <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <h3 className="font-bold text-xl text-emerald-900">Inquiry Sent Successfully</h3>
                <p className="text-sm text-emerald-700">Thank you for reaching out. Our administration office will get back to you shortly.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold font-serif text-slate-900 mb-4">Send Us a Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Your Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 Phone Number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Your inquiry or message..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
