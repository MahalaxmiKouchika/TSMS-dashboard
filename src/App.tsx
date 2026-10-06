import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/AdminLayout';

import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Students } from './pages/public/Students';
import { StudentSearch } from './pages/public/StudentSearch';
import { Staff } from './pages/public/Staff';
import { Events } from './pages/public/Events';
import { EventDetail } from './pages/public/EventDetail';
import { Gallery } from './pages/public/Gallery';
import { Videos } from './pages/public/Videos';
import { Notices } from './pages/public/Notices';
import { Achievements } from './pages/public/Achievements';
import { Contact } from './pages/public/Contact';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SchoolSettings } from './pages/admin/SchoolSettings';
import { StudentList } from './pages/admin/StudentList';
import { StudentImport } from './pages/admin/StudentImport';
import { ImportHistory } from './pages/admin/ImportHistory';
import { AcademicYears } from './pages/admin/AcademicYears';
import { StaffManagement } from './pages/admin/StaffManagement';
import { EventManagement } from './pages/admin/EventManagement';
import { MediaManagement } from './pages/admin/MediaManagement';
import { NoticeManagement } from './pages/admin/NoticeManagement';
import { AchievementManagement } from './pages/admin/AchievementManagement';
import { AuditLogs } from './pages/admin/AuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/search" element={<StudentSearch />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/school" element={<SchoolSettings />} />
            <Route path="/admin/students" element={<StudentList />} />
            <Route path="/admin/students/import" element={<StudentImport />} />
            <Route path="/admin/students/import-history" element={<ImportHistory />} />
            <Route path="/admin/academic-years" element={<AcademicYears />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/events" element={<EventManagement />} />
            <Route path="/admin/gallery" element={<MediaManagement />} />
            <Route path="/admin/notices" element={<NoticeManagement />} />
            <Route path="/admin/achievements" element={<AchievementManagement />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
