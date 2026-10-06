export interface SchoolProfile {
  id: number;
  school_name: string;
  school_logo: string;
  school_banner: string;
  description: string;
  school_code: string;
  udise_code: string;
  address: string;
  city: string;
  mandal: string;
  district: string;
  state: string;
  pincode: string;
  established_year: string;
  school_type: string;
  management_type: string;
  medium_of_instruction: string;
  principal_name: string;
  contact_number: string;
  email: string;
  website: string;
  mission: string;
  vision: string;
  updated_at: string;
}

export interface AcademicYear {
  id: number;
  year_name: string;
  is_active: number;
  start_date: string;
  end_date: string;
}

export interface PublicStudent {
  student_id: string;
  name: string;
  class: string;
  section: string;
  gender: string;
  academic_year: string;
  status: string;
}

export interface AdminStudent extends PublicStudent {
  id: number;
  dob: string;
  admission_number: string;
  father_name: string;
  mother_name: string;
  academic_year_id: number;
}

export interface Staff {
  id: number;
  name: string;
  photo_url: string;
  designation: string;
  department: string;
  qualification: string;
  experience_years: number;
  staff_type: 'teaching' | 'non-teaching';
  joining_year: string;
  status: string;
  bio: string;
}

export interface SchoolEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  academic_year_id: number;
  academic_year: string;
  location: string;
  cover_image: string;
  status: string;
  media?: MediaItem[];
}

export interface MediaItem {
  id: number;
  title: string;
  media_type: 'photo' | 'video';
  url: string;
  thumbnail_url: string;
  event_id: number;
  event_title?: string;
  academic_year_id: number;
  academic_year?: string;
  caption: string;
  created_at: string;
}

export interface Notice {
  id: number;
  title: string;
  description: string;
  notice_date: string;
  attachment_url: string;
  is_published: number;
  expiry_date: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  achievement_date: string;
  category: 'academic' | 'sports' | 'cultural' | 'government' | 'school' | 'student' | 'teacher';
  image_url: string;
  academic_year_id: number;
  academic_year: string;
}

export interface ImportHistoryItem {
  id: number;
  file_name: string;
  academic_year_id: number;
  academic_year: string;
  total_rows: number;
  added_count: number;
  updated_count: number;
  error_count: number;
  status: string;
  imported_by: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  admin_identifier: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface DashboardStatistics {
  activeAcademicYear: string;
  totalStudents: number;
  teachingStaff: number;
  nonTeachingStaff: number;
  totalStaff: number;
  totalEvents: number;
  totalNotices: number;
}
