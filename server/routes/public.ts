import { Router } from 'express';
import { dbQuery, dbGet } from '../db.ts';

const router = Router();
import bcrypt from 'bcryptjs';
import { getDbMode } from '../db.ts';

router.get('/test-db', async (req, res) => {
  try {
    const admin = await dbGet('SELECT * FROM admin_users WHERE id = 1');
    const mode = getDbMode();
    const isMatch = admin ? bcrypt.compareSync('tsms@navipet', String(admin.password_hash)) : false;
    res.json({
      success: true,
      mode,
      hasAdmin: !!admin,
      adminIdentifier: admin ? admin.admin_identifier : null,
      passwordMatches: isMatch
    });
  } catch (err: any) {
    res.json({ success: false, error: err.message });
  }
});

// 1. School Information
router.get('/school', async (req, res) => {
  try {
    const school = await dbGet('SELECT * FROM schools WHERE id = 1');
    if (!school) {
      return res.status(404).json({ success: false, message: 'School profile not found' });
    }
    res.json({ success: true, data: school });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Statistics (Active Academic Year)
router.get('/statistics', async (req, res) => {
  try {
    const activeYear = await dbGet('SELECT * FROM academic_years WHERE is_active = 1');
    const yearId = activeYear ? activeYear.id : null;

    let totalStudents = 0;
    if (yearId) {
      const studentCount = await dbGet('SELECT COUNT(*) as count FROM students WHERE academic_year_id = ? AND status = ?', [yearId, 'Active']);
      totalStudents = Number(studentCount?.count || 0);
    } else {
      const studentCount = await dbGet('SELECT COUNT(*) as count FROM students WHERE status = ?', ['Active']);
      totalStudents = Number(studentCount?.count || 0);
    }

    const teachingStaff = Number((await dbGet('SELECT COUNT(*) as count FROM staff WHERE staff_type = ? AND status = ?', ['teaching', 'Active']))?.count || 0);
    const nonTeachingStaff = Number((await dbGet('SELECT COUNT(*) as count FROM staff WHERE staff_type = ? AND status = ?', ['non-teaching', 'Active']))?.count || 0);
    const totalStaff = teachingStaff + nonTeachingStaff;

    const totalEvents = Number((await dbGet('SELECT COUNT(*) as count FROM events WHERE status = ?', ['Published']))?.count || 0);
    const totalNotices = Number((await dbGet('SELECT COUNT(*) as count FROM notices WHERE is_published = 1'))?.count || 0);

    res.json({
      success: true,
      data: {
        activeAcademicYear: activeYear ? activeYear.year_name : '2026-27',
        totalStudents,
        teachingStaff,
        nonTeachingStaff,
        totalStaff,
        totalEvents,
        totalNotices
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Student Search by Student ID
router.get('/students/search', async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({ success: false, message: 'Student ID search parameter is required' });
    }

    const student = await dbGet(`
      SELECT s.student_id, s.name, s.gender, s.class_name, s.section, s.status, a.year_name as academic_year
      FROM students s
      LEFT JOIN academic_years a ON s.academic_year_id = a.id
      WHERE LOWER(s.student_id) = LOWER(?)
    `, [studentId.trim()]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student ID not found in the public records.' });
    }

    res.json({
      success: true,
      data: {
        student_id: student.student_id,
        name: student.name,
        class: student.class_name,
        section: student.section,
        gender: student.gender,
        academic_year: student.academic_year,
        status: student.status
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Student Directory with Filters & Pagination
router.get('/students', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;
    const className = req.query.class as string;
    const section = req.query.section as string;
    const academicYearId = req.query.academic_year_id as string;
    const search = req.query.search as string;

    let query = `
      SELECT s.student_id, s.name, s.gender, s.class_name, s.section, s.status, a.year_name as academic_year
      FROM students s
      LEFT JOIN academic_years a ON s.academic_year_id = a.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM students s WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (className) {
      query += ` AND s.class_name = ?`;
      countQuery += ` AND s.class_name = ?`;
      params.push(className);
      countParams.push(className);
    }
    if (section) {
      query += ` AND s.section = ?`;
      countQuery += ` AND s.section = ?`;
      params.push(section);
      countParams.push(section);
    }
    if (academicYearId) {
      query += ` AND s.academic_year_id = ?`;
      countQuery += ` AND s.academic_year_id = ?`;
      params.push(academicYearId);
      countParams.push(academicYearId);
    }
    if (search) {
      query += ` AND (s.name LIKE ? OR s.student_id LIKE ?)`;
      countQuery += ` AND (s.name LIKE ? OR s.student_id LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
      countParams.push(term, term);
    }

    query += ` ORDER BY s.class_name, s.section, s.name LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [studentsRes, countRes, ayRes] = await Promise.all([
      dbQuery(query, params),
      dbQuery(countQuery, countParams),
      dbQuery('SELECT id, year_name, is_active FROM academic_years ORDER BY year_name DESC')
    ]);

    const students = studentsRes.rows.map(st => ({
      student_id: st.student_id,
      name: st.name,
      class: st.class_name,
      section: st.section,
      gender: st.gender,
      academic_year: st.academic_year,
      status: st.status
    }));

    const total = Number(countRes.rows[0]?.total || 0);

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        academic_years: ayRes.rows
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Staff Directory
router.get('/staff', async (req, res) => {
  try {
    const staffType = req.query.type as string;
    let query = `SELECT id, name, photo_url, designation, department, qualification, experience_years, staff_type, joining_year, bio FROM staff WHERE status = 'Active'`;
    const params: any[] = [];
    if (staffType) {
      query += ` AND staff_type = ?`;
      params.push(staffType);
    }
    query += ` ORDER BY experience_years DESC, name ASC`;
    const result = await dbQuery(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Events
router.get('/events', async (req, res) => {
  try {
    const result = await dbQuery(`
      SELECT e.*, a.year_name as academic_year 
      FROM events e 
      LEFT JOIN academic_years a ON e.academic_year_id = a.id 
      WHERE e.status = 'Published' 
      ORDER BY e.event_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const [event, media] = await Promise.all([
      dbGet(`
        SELECT e.*, a.year_name as academic_year 
        FROM events e 
        LEFT JOIN academic_years a ON e.academic_year_id = a.id 
        WHERE e.id = ?
      `, [eventId]),
      dbQuery('SELECT * FROM media WHERE event_id = ?', [eventId])
    ]);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: { ...event, media: media.rows } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Photo & Video Gallery
router.get('/gallery', async (req, res) => {
  try {
    const mediaType = req.query.type as string;
    let query = `
      SELECT m.*, e.title as event_title, a.year_name as academic_year
      FROM media m
      LEFT JOIN events e ON m.event_id = e.id
      LEFT JOIN academic_years a ON m.academic_year_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (mediaType) {
      query += ` AND m.media_type = ?`;
      params.push(mediaType);
    }
    query += ` ORDER BY m.created_at DESC`;
    const result = await dbQuery(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Notices
router.get('/notices', async (req, res) => {
  try {
    const result = await dbQuery(`
      SELECT * FROM notices 
      WHERE is_published = 1 
      ORDER BY notice_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Achievements
router.get('/achievements', async (req, res) => {
  try {
    const category = req.query.category as string;
    let query = `
      SELECT ac.*, a.year_name as academic_year
      FROM achievements ac
      LEFT JOIN academic_years a ON ac.academic_year_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (category) {
      query += ` AND ac.category = ?`;
      params.push(category);
    }
    query += ` ORDER BY ac.achievement_date DESC`;
    const result = await dbQuery(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
