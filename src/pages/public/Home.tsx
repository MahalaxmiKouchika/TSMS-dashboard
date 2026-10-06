import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Search, Users, Calendar, Award, 
  ArrowRight, ShieldCheck, BookOpen, ChevronRight, Bell 
} from 'lucide-react';
import { DashboardStatistics, SchoolProfile, SchoolEvent, Notice, Achievement } from '../../types';

export const Home: React.FC = () => {
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/public/school').then(r => r.json()).then(d => { if (d.success) setSchool(d.data); }).catch(() => {});
    fetch('/api/public/statistics').then(r => r.json()).then(d => { if (d.success) setStats(d.data); }).catch(() => {});
    fetch('/api/public/notices').then(r => r.json()).then(d => { if (d.success) setNotices(d.data.slice(0, 4)); }).catch(() => {});
    fetch('/api/public/events').then(r => r.json()).then(d => { if (d.success) setEvents(d.data.slice(0, 3)); }).catch(() => {});
    fetch('/api/public/achievements').then(r => r.json()).then(d => { if (d.success) setAchievements(d.data.slice(0, 3)); }).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/students/search?studentId=${encodeURIComponent(searchId.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section 
        className="relative text-white overflow-hidden py-20 lg:py-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${school?.school_banner || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/95 to-slate-950/85"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-800/80 text-amber-300 text-xs font-semibold border border-indigo-700">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Official Public Information Portal
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight leading-tight">
                {school?.school_name || 'Telangana Model School, Navipet'}
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                {school?.description || 'Empowering generations with values, academic distinction, and holistic excellence since 1988.'}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/students/search"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition shadow-lg"
                >
                  <Search className="w-5 h-5" /> Verify Student ID
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-900/80 text-white font-semibold hover:bg-indigo-800 transition border border-indigo-700"
                >
                  Explore School <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Student ID Search Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/20 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Student Directory Lookup</h3>
                    <p className="text-xs text-slate-300">Enter Student ID to check records</p>
                  </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Student ID</label>
                    <input
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="e.g. SCH2026001"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" /> Search Student Record
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.totalStudents || 842}</span>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold flex-shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.teachingStaff || 38}</span>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Teaching Staff</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.totalStaff || 50}</span>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold flex-shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">{stats?.activeAcademicYear || '2026-27'}</span>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Year</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notices & Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Announcements</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">Latest Notices & Circulars</h2>
          </div>
          <Link to="/notices" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                    <Bell className="w-3 h-3" /> Notice
                  </span>
                  <span className="text-xs text-slate-500">{notice.notice_date}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{notice.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{notice.description}</p>
              </div>
              <Link to="/notices" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                Read circular <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Principal Welcome & School Summary */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-100 rounded-3xl transform -rotate-2"></div>
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-xl aspect-[4/3] flex items-center justify-center text-white p-8">
                  <div className="text-center space-y-3">
                    <GraduationCap className="w-16 h-16 text-amber-400 mx-auto" />
                    <h4 className="font-bold text-xl font-serif">Dr. R. Sharma</h4>
                    <p className="text-xs text-slate-300">Principal & Academic Director</p>
                    <p className="text-xs italic text-slate-400">"Education is the manifestation of perfection already in man."</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Leadership Message</span>
              <h2 className="text-3xl font-bold text-slate-900 font-serif">Welcome to VidyaVikas Public Portal</h2>
              <p className="text-slate-600 leading-relaxed">
                Our institution stands as a beacon of academic excellence and holistic character formation. We believe in providing robust opportunities for every student through modern science laboratories, digital learning tools, sports championships, and cultural enrichment.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Our Mission</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{school?.mission || 'Providing accessible, value-based education.'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Our Vision</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{school?.vision || 'Building lifelong learners and responsible citizens.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events & Achievements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upcoming Events */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Activities</span>
                <h2 className="text-2xl font-bold text-slate-900 font-serif">School Events</h2>
              </div>
              <Link to="/events" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View All</Link>
            </div>

            <div className="space-y-4">
              {events.map((ev) => (
                <div key={ev.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">{ev.event_date}</span>
                    <h3 className="font-bold text-slate-900">{ev.title}</h3>
                    <p className="text-xs text-slate-500">{ev.location || 'School Campus'}</p>
                  </div>
                  <Link to={`/events/${ev.id}`} className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Accolades</span>
                <h2 className="text-2xl font-bold text-slate-900 font-serif">School Achievements</h2>
              </div>
              <Link to="/achievements" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View All</Link>
            </div>

            <div className="space-y-4">
              {achievements.map((ach) => (
                <div key={ach.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">{ach.category}</span>
                    <h3 className="font-bold text-slate-900 mt-1">{ach.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
