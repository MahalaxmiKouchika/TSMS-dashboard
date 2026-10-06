import pkg from 'pg';
const { Pool } = pkg;
import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'portal.sqlite');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

let pgPool: pkg.Pool | null = null;
let sqliteDb: Database | null = null;
let dbMode: 'postgres' | 'sqlite' = 'sqlite';

export async function initDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pgPool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      await pgPool.query('SELECT 1');
      dbMode = 'postgres';
      console.log('Connected to PostgreSQL database successfully.');
      await createPostgresTables(pgPool);
      await seedPostgresData(pgPool);
      return;
    } catch (err) {
      console.warn('PostgreSQL connection failed or unavailable. Falling back to embedded SQLite database.', err);
      pgPool = null;
    }
  }

  // Fallback to SQLite
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqliteDb = new SQL.Database(fileBuffer);
    createSqliteTables(sqliteDb);
    seedSqliteData(sqliteDb);
  } else {
    sqliteDb = new SQL.Database();
    createSqliteTables(sqliteDb);
    seedSqliteData(sqliteDb);
    saveSqliteDatabase();
  }
  dbMode = 'sqlite';
  console.log('Running on embedded SQLite database.');
}

export function saveSqliteDatabase() {
  if (!sqliteDb || dbMode !== 'sqlite') return;
  const data = sqliteDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function getDbMode() {
  return dbMode;
}

// Unified Query Execution Helper
export async function dbQuery(text: string, params: any[] = []): Promise<{ rows: any[] }> {
  if (dbMode === 'postgres' && pgPool) {
    // Convert ? placeholders to $1, $2 for postgres if necessary, or assume standard queries
    let pgText = text;
    if (text.includes('?')) {
      let idx = 1;
      pgText = text.replace(/\?/g, () => `$${idx++}`);
    }
    const res = await pgPool.query(pgText, params);
    return { rows: res.rows };
  } else {
    // SQLite via sql.js
    let sqliteText = text;
    // Convert $1, $2 to ?
    sqliteText = text.replace(/\$\d+/g, '?');
    const stmt = sqliteDb!.prepare(sqliteText);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return { rows };
  }
}

export async function dbGet(text: string, params: any[] = []): Promise<any> {
  const res = await dbQuery(text, params);
  return res.rows[0] || null;
}

export async function dbRun(text: string, params: any[] = []): Promise<any> {
  if (dbMode === 'postgres' && pgPool) {
    let pgText = text;
    if (text.includes('?')) {
      let idx = 1;
      pgText = text.replace(/\?/g, () => `$${idx++}`);
    }
    return await pgPool.query(pgText, params);
  } else {
    let sqliteText = text.replace(/\$\d+/g, '?');
    sqliteDb!.run(sqliteText, params);
    saveSqliteDatabase();
    return { rowCount: 1 };
  }
}

// Table Creation & Seeding
async function createPostgresTables(pool: pkg.Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      admin_identifier TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      password_changed_at TIMESTAMP,
      last_login_at TIMESTAMP,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS schools (
      id SERIAL PRIMARY KEY,
      school_name TEXT NOT NULL,
      school_logo TEXT,
      school_banner TEXT,
      description TEXT,
      school_code TEXT,
      udise_code TEXT,
      address TEXT,
      city TEXT,
      mandal TEXT,
      district TEXT,
      state TEXT,
      pincode TEXT,
      established_year TEXT,
      school_type TEXT,
      management_type TEXT,
      medium_of_instruction TEXT,
      principal_name TEXT,
      contact_number TEXT,
      email TEXT,
      website TEXT,
      mission TEXT,
      vision TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academic_years (
      id SERIAL PRIMARY KEY,
      year_name TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      student_id TEXT NOT NULL,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      dob TEXT,
      class_name TEXT NOT NULL,
      section TEXT NOT NULL,
      admission_number TEXT,
      father_name TEXT,
      mother_name TEXT,
      academic_year_id INTEGER REFERENCES academic_years(id),
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      photo_url TEXT,
      designation TEXT NOT NULL,
      department TEXT,
      qualification TEXT,
      experience_years INTEGER DEFAULT 0,
      staff_type TEXT CHECK(staff_type IN ('teaching', 'non-teaching')) NOT NULL,
      joining_year TEXT,
      status TEXT DEFAULT 'Active',
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      academic_year_id INTEGER REFERENCES academic_years(id),
      location TEXT,
      cover_image TEXT,
      status TEXT DEFAULT 'Published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS media (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      media_type TEXT CHECK(media_type IN ('photo', 'video')) NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      event_id INTEGER REFERENCES events(id),
      academic_year_id INTEGER REFERENCES academic_years(id),
      caption TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS notices (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      notice_date TEXT NOT NULL,
      attachment_url TEXT,
      is_published INTEGER DEFAULT 1,
      expiry_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      achievement_date TEXT NOT NULL,
      category TEXT CHECK(category IN ('academic', 'sports', 'cultural', 'government', 'school', 'student', 'teacher')) NOT NULL,
      image_url TEXT,
      academic_year_id INTEGER REFERENCES academic_years(id)
    );
    CREATE TABLE IF NOT EXISTS student_imports (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      academic_year_id INTEGER REFERENCES academic_years(id),
      total_rows INTEGER DEFAULT 0,
      added_count INTEGER DEFAULT 0,
      updated_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Completed',
      imported_by TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS student_import_errors (
      id SERIAL PRIMARY KEY,
      import_id INTEGER REFERENCES student_imports(id),
      row_number INTEGER,
      student_id TEXT,
      error_message TEXT,
      raw_data TEXT
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      admin_identifier TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function createSqliteTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      admin_identifier TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      password_changed_at DATETIME,
      last_login_at DATETIME,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_name TEXT NOT NULL,
      school_logo TEXT,
      school_banner TEXT,
      description TEXT,
      school_code TEXT,
      udise_code TEXT,
      address TEXT,
      city TEXT,
      mandal TEXT,
      district TEXT,
      state TEXT,
      pincode TEXT,
      established_year TEXT,
      school_type TEXT,
      management_type TEXT,
      medium_of_instruction TEXT,
      principal_name TEXT,
      contact_number TEXT,
      email TEXT,
      website TEXT,
      mission TEXT,
      vision TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academic_years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year_name TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      dob TEXT,
      class_name TEXT NOT NULL,
      section TEXT NOT NULL,
      admission_number TEXT,
      father_name TEXT,
      mother_name TEXT,
      academic_year_id INTEGER,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      photo_url TEXT,
      designation TEXT NOT NULL,
      department TEXT,
      qualification TEXT,
      experience_years INTEGER DEFAULT 0,
      staff_type TEXT CHECK(staff_type IN ('teaching', 'non-teaching')) NOT NULL,
      joining_year TEXT,
      status TEXT DEFAULT 'Active',
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      academic_year_id INTEGER,
      location TEXT,
      cover_image TEXT,
      status TEXT DEFAULT 'Published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      media_type TEXT CHECK(media_type IN ('photo', 'video')) NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      event_id INTEGER,
      academic_year_id INTEGER,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      notice_date TEXT NOT NULL,
      attachment_url TEXT,
      is_published INTEGER DEFAULT 1,
      expiry_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      achievement_date TEXT NOT NULL,
      category TEXT CHECK(category IN ('academic', 'sports', 'cultural', 'government', 'school', 'student', 'teacher')) NOT NULL,
      image_url TEXT,
      academic_year_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS student_imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      academic_year_id INTEGER,
      total_rows INTEGER DEFAULT 0,
      added_count INTEGER DEFAULT 0,
      updated_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Completed',
      imported_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS student_import_errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      import_id INTEGER,
      row_number INTEGER,
      student_id TEXT,
      error_message TEXT,
      raw_data TEXT
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_identifier TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function seedPostgresData(pool: pkg.Pool) {
  // Always ensure school details are updated to Telangana Model School Navipe
  await pool.query(`
    INSERT INTO schools (id, school_name, school_banner, school_code, udise_code, address, city, mandal, district, state, pincode, established_year, school_type, management_type, medium_of_instruction, principal_name, contact_number, email, website, mission, vision)
    VALUES (1, 'Telangana Model School, Navipet', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600', 'TMSNAVIPET2026', '36240102304', 'Navipet Mandal', 'Navipet', 'Navipet', 'Nizamabad', 'Telangana', '503245', '2010', 'Co-Educational Model School (Class 6 to 12)', 'State Government - Telangana Model Schools', 'English Medium', 'Principal, TS Model School Navipet', '+91 8462 234567', 'info@tsmodelchoolnavipet.edu', 'https://tsmodelchoolnavipet.edu', 'To empower rural and talented students with world-class English-medium education, digital literacy, and holistic development free of cost under Telangana Model School initiative.', 'Excellence in academics, science, sports, and moral values for every rural child.')
    ON CONFLICT (id) DO UPDATE SET 
      school_name = EXCLUDED.school_name,
      school_banner = EXCLUDED.school_banner,
      school_code = EXCLUDED.school_code,
      udise_code = EXCLUDED.udise_code,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      mandal = EXCLUDED.mandal,
      district = EXCLUDED.district,
      state = EXCLUDED.state,
      pincode = EXCLUDED.pincode,
      established_year = EXCLUDED.established_year,
      school_type = EXCLUDED.school_type,
      management_type = EXCLUDED.management_type,
      medium_of_instruction = EXCLUDED.medium_of_instruction,
      principal_name = EXCLUDED.principal_name,
      contact_number = EXCLUDED.contact_number,
      email = EXCLUDED.email,
      website = EXCLUDED.website,
      mission = EXCLUDED.mission,
      vision = EXCLUDED.vision
  `);

  const adminId = process.env.ADMIN_INITIAL_ID;
  const adminPwd = process.env.ADMIN_INITIAL_PASSWORD;
  if (adminId && adminPwd) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPwd, salt);
    await pool.query(`
      INSERT INTO admin_users (id, admin_identifier, password_hash) 
      VALUES (1, $1, $2) 
      ON CONFLICT (id) DO UPDATE SET 
        admin_identifier = EXCLUDED.admin_identifier, 
        password_hash = EXCLUDED.password_hash
    `, [adminId, hash]);
    console.log('Secure single administrator initialized/updated (PostgreSQL).');
  } else {
    console.warn('WARNING: No administrator exists and ADMIN_INITIAL_ID/ADMIN_INITIAL_PASSWORD are not set in .env.');
  }
  await pool.query(`INSERT INTO academic_years (year_name, is_active, start_date, end_date) VALUES ('2025-26', 0, '2025-06-01', '2026-04-30') ON CONFLICT (year_name) DO NOTHING`);
  await pool.query(`INSERT INTO academic_years (year_name, is_active, start_date, end_date) VALUES ('2026-27', 1, '2026-06-01', '2027-04-30') ON CONFLICT (year_name) DO NOTHING`);
}

function seedSqliteData(db: Database) {
  db.run(`
    INSERT OR REPLACE INTO schools (id, school_name, school_banner, school_code, udise_code, address, city, mandal, district, state, pincode, established_year, school_type, management_type, medium_of_instruction, principal_name, contact_number, email, website, mission, vision)
    VALUES (1, 'Telangana Model School, Navipet', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600', 'TMSNAVIPET2026', '36240102304', 'Navipet Mandal', 'Navipet', 'Navipet', 'Nizamabad', 'Telangana', '503245', '2010', 'Co-Educational Model School (Class 6 to 12)', 'State Government - Telangana Model Schools', 'English Medium', 'Principal, TS Model School Navipet', '+91 8462 234567', 'info@tsmodelchoolnavipet.edu', 'https://tsmodelchoolnavipet.edu', 'To empower rural and talented students with world-class English-medium education, digital literacy, and holistic development free of cost under Telangana Model School initiative.', 'Excellence in academics, science, sports, and moral values for every rural child.')
  `);
  saveSqliteDatabase();

  const adminId = process.env.ADMIN_INITIAL_ID;
  const adminPwd = process.env.ADMIN_INITIAL_PASSWORD;
  if (adminId && adminPwd) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPwd, salt);
    // Force update the admin credentials
    db.run(`INSERT OR REPLACE INTO admin_users (id, admin_identifier, password_hash) VALUES (1, ?, ?)`, [adminId, hash]);
    console.log('Secure single administrator initialized/updated (SQLite).');
  } else {
    console.warn('WARNING: No administrator exists and ADMIN_INITIAL_ID/ADMIN_INITIAL_PASSWORD are not set in .env.');
  }
  saveSqliteDatabase();
  db.run(`INSERT OR IGNORE INTO academic_years (id, year_name, is_active, start_date, end_date) VALUES (1, '2025-26', 0, '2025-06-01', '2026-04-30')`);
  db.run(`INSERT OR IGNORE INTO academic_years (id, year_name, is_active, start_date, end_date) VALUES (2, '2026-27', 1, '2026-06-01', '2027-04-30')`);

  const staffMembers = [
    ['Dr. R. Sharma', 'Principal', 'Administration', 'Ph.D. in Education', 22, 'teaching', '2004', 'Active', 'Dedicated educator with over 22 years of academic leadership.'],
    ['Mrs. S. Vimala', 'Vice-Principal', 'Mathematics', 'M.Sc., B.Ed.', 18, 'teaching', '2008', 'Active', 'Passionate about making mathematics intuitive and engaging.'],
    ['Mr. Rajesh Kumar', 'Senior Teacher', 'Physical Science', 'M.Sc. Physics', 12, 'teaching', '2014', 'Active', 'Incharges of science laboratory and Atal Tinkering lab.'],
  ];
  for (const s of staffMembers) {
    db.run(`INSERT INTO staff (name, designation, department, qualification, experience_years, staff_type, joining_year, status, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, s);
  }

  const studentsSample = [
    ['SCH2026001', 'Aarav Patel', 'Male', '2012-04-15', 'Class 8', 'A', 'ADM2026001', 'Ramesh Patel', 'Sunita Patel', 2, 'Active'],
    ['SCH2026002', 'Ananya Reddy', 'Female', '2012-09-22', 'Class 8', 'A', 'ADM2026002', 'Kiran Reddy', 'Padma Reddy', 2, 'Active'],
    ['SCH2026003', 'Mohammed Faizan', 'Male', '2011-01-10', 'Class 9', 'B', 'ADM2026003', 'Abdul Faizan', 'Yasmin Begum', 2, 'Active'],
  ];
  for (const st of studentsSample) {
    db.run(`INSERT INTO students (student_id, name, gender, dob, class_name, section, admission_number, father_name, mother_name, academic_year_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, st);
  }
}
