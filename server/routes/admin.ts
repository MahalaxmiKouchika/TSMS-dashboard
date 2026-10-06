import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { dbQuery, dbGet, dbRun, getDbMode } from '../db.ts';
import { verifyAdminToken, AdminAuthRequest } from '../middleware/auth.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vidyavikas_secret_key_2026';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|xls|xlsx|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel') || file.mimetype.includes('csv');
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, Excel (.xlsx, .xls) and CSV files are allowed!'));
  }
});

async function logAudit(admin_identifier: string, action: string, details: string, ip: string) {
  try {
    await dbRun(
      `INSERT INTO audit_logs (admin_identifier, action, details, ip_address) VALUES (?, ?, ?, ?)`,
      [admin_identifier, action, details, ip || '127.0.0.1']
    );
  } catch (e) {
    console.error('Audit log failed:', e);
  }
}

// ==================== AUTHENTICATION ====================
const loginAttempts = new Map<string, { count: number, timestamp: number }>();

router.post('/login', async (req, res) => {
  try {
    const { admin_identifier, password } = req.body;
    const ip = req.ip || '127.0.0.1';
    const now = Date.now();
    const attempt = loginAttempts.get(ip);
    
    if (attempt) {
      if (now - attempt.timestamp < 15 * 60 * 1000) {
        if (attempt.count >= 5) {
          return res.status(429).json({ success: false, message: 'Too many unsuccessful login attempts. Please try again later.' });
        }
      } else {
        loginAttempts.delete(ip);
      }
    }

    if (!admin_identifier || !password) {
      return res.status(401).json({ success: false, message: 'Invalid administrator ID or password.' });
    }

    const admin = await dbGet('SELECT * FROM admin_users WHERE id = 1');
    if (!admin || admin.admin_identifier !== admin_identifier.trim()) {
      const current = loginAttempts.get(ip) || { count: 0, timestamp: now };
      loginAttempts.set(ip, { count: current.count + 1, timestamp: now });
      return res.status(401).json({ success: false, message: 'Invalid administrator ID or password.' });
    }

    const isMatch = bcrypt.compareSync(password, String(admin.password_hash));
    if (!isMatch) {
      const current = loginAttempts.get(ip) || { count: 0, timestamp: now };
      loginAttempts.set(ip, { count: current.count + 1, timestamp: now });
      return res.status(401).json({ success: false, message: 'Invalid administrator ID or password.' });
    }

    loginAttempts.delete(ip);

    const tokenPayload = { id: admin.id, admin_identifier: admin.admin_identifier };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

    await logAudit(String(admin.admin_identifier), 'ADMIN_LOGIN', 'Admin logged in successfully', ip);

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          admin_identifier: admin.admin_identifier
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/debug-db', async (req, res) => {
  try {
    const admin = await dbGet('SELECT * FROM admin_users WHERE id = 1');
    const mode = getDbMode();
    const isMatch = admin ? bcrypt.compareSync('tsms@navipet', String(admin.password_hash)) : false;
    res.json({
      success: true,
      mode,
      hasAdmin: !!admin,
      idMatches: admin ? admin.admin_identifier === 'tsms@admin' : false,
      identifierInDb: admin ? admin.admin_identifier : null,
      passwordMatches: isMatch
    });
  } catch(e: any) {
    res.json({ success: false, error: e.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.use(verifyAdminToken);

router.get('/me', async (req: AdminAuthRequest, res: Response) => {
  try {
    const admin = await dbGet('SELECT id, admin_identifier FROM admin_users WHERE id = 1');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    res.json({ success: true, data: admin });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/change-password', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }
    
    if (new_password.length < 12 || !/[A-Z]/.test(new_password) || !/[a-z]/.test(new_password) || !/[0-9]/.test(new_password) || !/[^A-Za-z0-9]/.test(new_password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.' });
    }

    const commonPasswords = ['123456', 'password', 'admin123', 'school123', 'government'];
    if (commonPasswords.some(p => new_password.toLowerCase().includes(p))) {
      return res.status(400).json({ success: false, message: 'Password is too common or easily guessable.' });
    }

    const admin = await dbGet('SELECT password_hash FROM admin_users WHERE id = 1');
    if (!bcrypt.compareSync(current_password, String(admin.password_hash))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(new_password, salt);
    
    const timeFunc = getDbMode() === 'postgres' ? 'CURRENT_TIMESTAMP' : "datetime('now')";
    await dbRun(`UPDATE admin_users SET password_hash = ?, password_changed_at = ${timeFunc} WHERE id = 1`, [hash]);
    
    await logAudit(req.admin!.admin_identifier, 'PASSWORD_CHANGED', 'Administrator password changed', req.ip || '127.0.0.1');

    res.clearCookie('admin_token');
    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Apply verification middleware to all other admin routes
router.use(verifyAdminToken);

// ==================== FILE UPLOAD ROUTE ====================
router.post('/upload', upload.single('file'), async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url: fileUrl, filename: req.file.originalname } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== SCHOOL INFORMATION ====================
router.get('/school', async (req: AdminAuthRequest, res: Response) => {
  try {
    const school = await dbGet('SELECT * FROM schools WHERE id = 1');
    res.json({ success: true, data: school });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/school', async (req: AdminAuthRequest, res: Response) => {
  try {
    const {
      school_name, school_logo, school_banner, description, school_code, udise_code,
      address, city, mandal, district, state, pincode, established_year, school_type,
      management_type, medium_of_instruction, principal_name, contact_number, email,
      website, mission, vision
    } = req.body;

    await dbRun(`
      UPDATE schools SET
        school_name = ?, school_logo = ?, school_banner = ?, description = ?, school_code = ?,
        udise_code = ?, address = ?, city = ?, mandal = ?, district = ?, state = ?, pincode = ?,
        established_year = ?, school_type = ?, management_type = ?, medium_of_instruction = ?,
        principal_name = ?, contact_number = ?, email = ?, website = ?, mission = ?, vision = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      school_name, school_logo, school_banner, description, school_code, udise_code,
      address, city, mandal, district, state, pincode, established_year, school_type,
      management_type, medium_of_instruction, principal_name, contact_number, email,
      website, mission, vision
    ]);

    await logAudit(req.admin!.email, 'UPDATE_SCHOOL', 'Updated school profile information', String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'School profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== ACADEMIC YEARS ====================
router.get('/academic-years', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery('SELECT * FROM academic_years ORDER BY year_name DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/academic-years', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { year_name, start_date, end_date, is_active } = req.body;
    if (!year_name) {
      return res.status(400).json({ success: false, message: 'Academic year name is required (e.g. 2027-28).' });
    }

    if (is_active) {
      await dbRun('UPDATE academic_years SET is_active = 0');
    }

    await dbRun(
      'INSERT INTO academic_years (year_name, start_date, end_date, is_active) VALUES (?, ?, ?, ?)',
      [year_name.trim(), start_date, end_date, is_active ? 1 : 0]
    );

    await logAudit(req.admin!.email, 'CREATE_ACADEMIC_YEAR', `Created academic year ${year_name}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Academic year created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/academic-years/:id/activate', async (req: AdminAuthRequest, res: Response) => {
  try {
    const yearId = req.params.id;
    await dbRun('UPDATE academic_years SET is_active = 0');
    await dbRun('UPDATE academic_years SET is_active = 1 WHERE id = ?', [yearId]);

    await logAudit(req.admin!.email, 'ACTIVATE_ACADEMIC_YEAR', `Activated academic year ID ${yearId}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Academic year activated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== STUDENTS CRUD ====================
router.get('/students', async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const academicYearId = req.query.academic_year_id as string;
    const search = req.query.search as string;
    const className = req.query.class as string;

    let query = `
      SELECT s.*, a.year_name as academic_year
      FROM students s
      LEFT JOIN academic_years a ON s.academic_year_id = a.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM students s WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (academicYearId) {
      query += ` AND s.academic_year_id = ?`;
      countQuery += ` AND s.academic_year_id = ?`;
      params.push(academicYearId);
      countParams.push(academicYearId);
    }
    if (className) {
      query += ` AND s.class_name = ?`;
      countQuery += ` AND s.class_name = ?`;
      params.push(className);
      countParams.push(className);
    }
    if (search) {
      query += ` AND (s.name LIKE ? OR s.student_id LIKE ? OR s.admission_number LIKE ?)`;
      countQuery += ` AND (s.name LIKE ? OR s.student_id LIKE ? OR s.admission_number LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
      countParams.push(term, term, term);
    }

    query += ` ORDER BY s.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [studentsRes, countRes] = await Promise.all([
      dbQuery(query, params),
      dbQuery(countQuery, countParams)
    ]);

    const total = Number(countRes.rows[0]?.total || 0);

    res.json({
      success: true,
      data: studentsRes.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/students', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { student_id, name, gender, dob, class_name, section, admission_number, father_name, mother_name, academic_year_id, status } = req.body;
    if (!student_id || !name || !class_name || !section || !academic_year_id) {
      return res.status(400).json({ success: false, message: 'Student ID, Name, Class, Section, and Academic Year are required.' });
    }

    const existing = await dbGet('SELECT id FROM students WHERE student_id = ? AND academic_year_id = ?', [student_id.trim(), academic_year_id]);
    if (existing) {
      return res.status(400).json({ success: false, message: `Student ID ${student_id} already exists for this academic year.` });
    }

    await dbRun(
      `INSERT INTO students (student_id, name, gender, dob, class_name, section, admission_number, father_name, mother_name, academic_year_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id.trim(), name, gender || 'Male', dob || null, class_name, section, admission_number || null, father_name || null, mother_name || null, academic_year_id, status || 'Active']
    );

    await logAudit(req.admin!.admin_identifier, 'CREATE_STUDENT', `Added student ${student_id} - ${name}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Student added successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/students/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { student_id, name, gender, dob, class_name, section, admission_number, father_name, mother_name, academic_year_id, status } = req.body;

    await dbRun(
      `UPDATE students SET student_id = ?, name = ?, gender = ?, dob = ?, class_name = ?, section = ?, admission_number = ?, father_name = ?, mother_name = ?, academic_year_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [student_id, name, gender, dob || null, class_name, section, admission_number || null, father_name || null, mother_name || null, academic_year_id, status, id]
    );

    await logAudit(req.admin!.admin_identifier, 'UPDATE_STUDENT', `Updated student ID ${student_id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Student updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/students/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    await dbRun('DELETE FROM students WHERE id = ?', [id]);

    await logAudit(req.admin!.admin_identifier, 'DELETE_STUDENT', `Deleted student record ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== EXCEL TEMPLATE & IMPORT ====================
router.get('/students/template', async (req: AdminAuthRequest, res: Response) => {
  try {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Student ID', 'Student Name', 'Gender', 'Date of Birth', 'Class', 'Section', 'Admission Number', 'Father Name', 'Mother Name', 'Status'],
      ['SCH2026101', 'Rahul Sharma', 'Male', '2012-05-12', 'Class 8', 'A', 'ADM2026101', 'Anil Sharma', 'Sunita Sharma', 'Active'],
      ['SCH2026102', 'Priya Patel', 'Female', '2012-08-20', 'Class 8', 'B', 'ADM2026102', 'Mahesh Patel', 'Geetha Patel', 'Active']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'StudentsTemplate');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/students/import-preview', upload.single('file'), async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });
    }
    const academicYearId = req.body.academic_year_id;
    if (!academicYearId) {
      return res.status(400).json({ success: false, message: 'Academic Year ID is required for import.' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded file contains no rows.' });
    }

    const existingRes = await dbQuery('SELECT student_id FROM students WHERE academic_year_id = ?', [academicYearId]);
    const existingSet = new Set(existingRes.rows.map(s => s.student_id));
    const seenInFile = new Set();

    const validRows: any[] = [];
    const errors: any[] = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const studentId = String(row['Student ID'] || row['student_id'] || '').trim();
      const name = String(row['Student Name'] || row['name'] || '').trim();
      const gender = String(row['Gender'] || row['gender'] || 'Male').trim();
      const dob = String(row['Date of Birth'] || row['dob'] || '').trim();
      const className = String(row['Class'] || row['class_name'] || '').trim();
      const section = String(row['Section'] || row['section'] || '').trim();
      const admissionNumber = String(row['Admission Number'] || row['admission_number'] || '').trim();
      const fatherName = String(row['Father Name'] || row['father_name'] || '').trim();
      const motherName = String(row['Mother Name'] || row['mother_name'] || '').trim();
      const status = String(row['Status'] || row['status'] || 'Active').trim();

      let rowError = '';
      if (!studentId) rowError = 'Student ID is missing.';
      else if (!name) rowError = 'Student Name is missing.';
      else if (!className) rowError = 'Class is missing.';
      else if (!section) rowError = 'Section is missing.';
      else if (seenInFile.has(studentId)) rowError = `Duplicate Student ID in file: ${studentId}`;
      else seenInFile.add(studentId);

      if (rowError) {
        errors.push({ row: rowNum, student_id: studentId || 'N/A', error: rowError, raw: row });
      } else {
        const isUpdate = existingSet.has(studentId);
        validRows.push({
          student_id: studentId,
          name,
          gender,
          dob,
          class_name: className,
          section,
          admission_number: admissionNumber,
          father_name: fatherName,
          mother_name: motherName,
          status,
          action: isUpdate ? 'Update' : 'Insert'
        });
      }
    });

    const summary = {
      file_path: req.file.path,
      file_name: req.file.originalname,
      total_rows: rows.length,
      valid_rows: validRows.length,
      error_count: errors.length,
      new_records: validRows.filter(r => r.action === 'Insert').length,
      update_records: validRows.filter(r => r.action === 'Update').length,
      errors,
      preview_data: validRows.slice(0, 50)
    };

    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/students/import-confirm', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { file_path, file_name, academic_year_id } = req.body;
    if (!file_path || !academic_year_id) {
      return res.status(400).json({ success: false, message: 'Missing file path or academic year.' });
    }

    if (!fs.existsSync(file_path)) {
      return res.status(400).json({ success: false, message: 'Import file no longer exists. Please re-upload.' });
    }

    const workbook = XLSX.readFile(file_path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    let added = 0;
    let updated = 0;
    let errors = 0;

    const importLogRes = await dbGet(
      `INSERT INTO student_imports (file_name, academic_year_id, total_rows, added_count, updated_count, error_count, status, imported_by)
       VALUES (?, ?, ?, 0, 0, 0, 'Processing', ?) RETURNING id`,
      [file_name, academic_year_id, rows.length, req.admin!.admin_identifier]
    );
    const importId = importLogRes?.id || Number((await dbGet('SELECT last_insert_rowid() as id')).id || 1);

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const studentId = String(row['Student ID'] || row['student_id'] || '').trim();
      const name = String(row['Student Name'] || row['name'] || '').trim();
      const gender = String(row['Gender'] || row['gender'] || 'Male').trim();
      const dob = String(row['Date of Birth'] || row['dob'] || '').trim();
      const className = String(row['Class'] || row['class_name'] || '').trim();
      const section = String(row['Section'] || row['section'] || '').trim();
      const admissionNumber = String(row['Admission Number'] || row['admission_number'] || '').trim();
      const fatherName = String(row['Father Name'] || row['father_name'] || '').trim();
      const motherName = String(row['Mother Name'] || row['mother_name'] || '').trim();
      const status = String(row['Status'] || row['status'] || 'Active').trim();

      if (!studentId || !name || !className || !section) {
        errors++;
        await dbRun(
          `INSERT INTO student_import_errors (import_id, row_number, student_id, error_message, raw_data) VALUES (?, ?, ?, ?, ?)`,
          [importId, idx + 2, studentId, 'Missing required fields', JSON.stringify(row)]
        );
        continue;
      }

      const existing = await dbGet('SELECT id FROM students WHERE student_id = ? AND academic_year_id = ?', [studentId, academic_year_id]);
      if (existing) {
        await dbRun(
          `UPDATE students SET name = ?, gender = ?, dob = ?, class_name = ?, section = ?, admission_number = ?, father_name = ?, mother_name = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [name, gender, dob || null, className, section, admissionNumber || null, fatherName || null, motherName || null, status, existing.id]
        );
        updated++;
      } else {
        await dbRun(
          `INSERT INTO students (student_id, name, gender, dob, class_name, section, admission_number, father_name, mother_name, academic_year_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [studentId, name, gender, dob || null, className, section, admissionNumber || null, fatherName || null, motherName || null, academic_year_id, status]
        );
        added++;
      }
    }

    await dbRun(
      `UPDATE student_imports SET added_count = ?, updated_count = ?, error_count = ?, status = 'Completed' WHERE id = ?`,
      [added, updated, errors, importId]
    );

    try { fs.unlinkSync(file_path); } catch (e) {}

    await logAudit(req.admin!.admin_identifier, 'IMPORT_STUDENTS', `Imported Excel for year ID ${academic_year_id}: Added ${added}, Updated ${updated}`, String(req.ip || '127.0.0.1'));

    res.json({
      success: true,
      message: 'Student import completed successfully.',
      data: { total: rows.length, added, updated, errors }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/students/import-history', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery(`
      SELECT si.*, a.year_name as academic_year 
      FROM student_imports si 
      LEFT JOIN academic_years a ON si.academic_year_id = a.id 
      ORDER BY si.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== STAFF MANAGEMENT ====================
router.get('/staff', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery('SELECT * FROM staff ORDER BY name ASC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/staff', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { name, photo_url, designation, department, qualification, experience_years, staff_type, joining_year, status, bio } = req.body;
    if (!name || !designation || !staff_type) {
      return res.status(400).json({ success: false, message: 'Name, designation, and staff type are required.' });
    }

    await dbRun(
      `INSERT INTO staff (name, photo_url, designation, department, qualification, experience_years, staff_type, joining_year, status, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, photo_url || null, designation, department || null, qualification || null, experience_years || 0, staff_type, joining_year || null, status || 'Active', bio || null]
    );

    await logAudit(req.admin!.admin_identifier, 'CREATE_STAFF', `Added staff member ${name}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Staff member added successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/staff/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { name, photo_url, designation, department, qualification, experience_years, staff_type, joining_year, status, bio } = req.body;

    await dbRun(
      `UPDATE staff SET name = ?, photo_url = ?, designation = ?, department = ?, qualification = ?, experience_years = ?, staff_type = ?, joining_year = ?, status = ?, bio = ? WHERE id = ?`,
      [name, photo_url || null, designation, department || null, qualification || null, experience_years, staff_type, joining_year || null, status, bio || null, id]
    );

    await logAudit(req.admin!.admin_identifier, 'UPDATE_STAFF', `Updated staff member ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Staff updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/staff/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    await dbRun('DELETE FROM staff WHERE id = ?', [id]);

    await logAudit(req.admin!.admin_identifier, 'DELETE_STAFF', `Deleted staff ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Staff deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== EVENTS MANAGEMENT ====================
router.get('/events', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery('SELECT e.*, a.year_name as academic_year FROM events e LEFT JOIN academic_years a ON e.academic_year_id = a.id ORDER BY e.event_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/events', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { title, description, event_date, academic_year_id, location, cover_image, status } = req.body;
    if (!title || !event_date) {
      return res.status(400).json({ success: false, message: 'Event title and date are required.' });
    }

    await dbRun(
      `INSERT INTO events (title, description, event_date, academic_year_id, location, cover_image, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, event_date, academic_year_id, location || null, cover_image || null, status || 'Published']
    );

    await logAudit(req.admin!.admin_identifier, 'CREATE_EVENT', `Created event ${title}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Event created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/events/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { title, description, event_date, academic_year_id, location, cover_image, status } = req.body;
    await dbRun(
      `UPDATE events SET title = ?, description = ?, event_date = ?, academic_year_id = ?, location = ?, cover_image = ?, status = ? WHERE id = ?`,
      [title, description || null, event_date, academic_year_id, location || null, cover_image || null, status, id]
    );

    await logAudit(req.admin!.admin_identifier, 'UPDATE_EVENT', `Updated event ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Event updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/events/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    await dbRun('DELETE FROM events WHERE id = ?', [id]);

    await logAudit(req.admin!.admin_identifier, 'DELETE_EVENT', `Deleted event ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== MEDIA / GALLERY ====================
router.get('/media', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery('SELECT m.*, e.title as event_title, a.year_name as academic_year FROM media m LEFT JOIN events e ON m.event_id = e.id LEFT JOIN academic_years a ON m.academic_year_id = a.id ORDER BY m.id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/media', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { title, media_type, url, thumbnail_url, event_id, academic_year_id, caption } = req.body;
    if (!title || !media_type || !url) {
      return res.status(400).json({ success: false, message: 'Title, media type, and URL are required.' });
    }

    await dbRun(
      `INSERT INTO media (title, media_type, url, thumbnail_url, event_id, academic_year_id, caption) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, media_type, url, thumbnail_url || null, event_id || null, academic_year_id || null, caption || null]
    );

    await logAudit(req.admin!.admin_identifier, 'UPLOAD_MEDIA', `Added media ${title}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Media uploaded successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/media/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    await dbRun('DELETE FROM media WHERE id = ?', [id]);

    await logAudit(req.admin!.admin_identifier, 'DELETE_MEDIA', `Deleted media ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Media deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== NOTICES ====================
router.get('/notices', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery('SELECT * FROM notices ORDER BY notice_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/notices', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { title, description, notice_date, attachment_url, is_published, expiry_date } = req.body;
    if (!title || !description || !notice_date) {
      return res.status(400).json({ success: false, message: 'Title, description, and notice date are required.' });
    }

    await dbRun(
      `INSERT INTO notices (title, description, notice_date, attachment_url, is_published, expiry_date) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, notice_date, attachment_url || null, is_published ? 1 : 0, expiry_date || null]
    );

    await logAudit(req.admin!.admin_identifier, 'CREATE_NOTICE', `Created notice ${title}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Notice created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/notices/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { title, description, notice_date, attachment_url, is_published, expiry_date } = req.body;
    await dbRun(
      `UPDATE notices SET title = ?, description = ?, notice_date = ?, attachment_url = ?, is_published = ?, expiry_date = ? WHERE id = ?`,
      [title, description, notice_date, attachment_url || null, is_published ? 1 : 0, expiry_date || null, id]
    );

    await logAudit(req.admin!.admin_identifier, 'UPDATE_NOTICE', `Updated notice ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Notice updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/notices/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    await dbRun('DELETE FROM notices WHERE id = ?', [id]);

    await logAudit(req.admin!.admin_identifier, 'DELETE_NOTICE', `Deleted notice ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== ACHIEVEMENTS ====================
router.get('/achievements', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery('SELECT ac.*, a.year_name as academic_year FROM achievements ac LEFT JOIN academic_years a ON ac.academic_year_id = a.id ORDER BY ac.achievement_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/achievements', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { title, description, achievement_date, category, image_url, academic_year_id } = req.body;
    if (!title || !description || !achievement_date || !category) {
      return res.status(400).json({ success: false, message: 'Title, description, date, and category are required.' });
    }

    await dbRun(
      `INSERT INTO achievements (title, description, achievement_date, category, image_url, academic_year_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, achievement_date, category, image_url || null, academic_year_id]
    );

    await logAudit(req.admin!.admin_identifier, 'CREATE_ACHIEVEMENT', `Added achievement ${title}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Achievement added successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/achievements/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    await dbRun('DELETE FROM achievements WHERE id = ?', [id]);

    await logAudit(req.admin!.admin_identifier, 'DELETE_ACHIEVEMENT', `Deleted achievement ID ${id}`, String(req.ip || '127.0.0.1'));
    res.json({ success: true, message: 'Achievement deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await dbQuery('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
