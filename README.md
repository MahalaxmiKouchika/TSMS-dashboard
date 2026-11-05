<div align="center">
<img src="assets/banner.svg" alt="TSMS Dashboard banner" width="100%"/>
<br/>
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1200&color=818CF8&center=true&vCenter=true&width=760&lines=Public+school+portal+%2B+secure+admin+dashboard;Bulk+import+students+from+Excel+in+seconds;Academic-year+aware+records+and+galleries;PostgreSQL+or+zero-setup+SQLite;Every+admin+action+is+audit+logged" alt="Typing animation describing the project" />
</a>
<br/><br/>
 
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-optional-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-fallback-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
 
![Node](https://img.shields.io/badge/node-%E2%89%A5%2018-339933?logo=nodedotjs&logoColor=white)
![Status](https://img.shields.io/badge/status-active-success)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)
![Made with love](https://img.shields.io/badge/made%20with-%E2%9D%A4-red)
 
<br/>
[**🚀 Quick Start**](#-quick-start) &nbsp;•&nbsp;
[**🏗 Architecture**](#-system-architecture) &nbsp;•&nbsp;
[**✨ Features**](#-application-features) &nbsp;•&nbsp;
[**🔄 Workflow**](#-application-workflow) &nbsp;•&nbsp;
[**🔮 Roadmap**](#-future-improvements) &nbsp;•&nbsp;
[**💬 Support**](#-support)
 
</div>
---
 
## 📖 Table of Contents
 
<details open>
<summary><b>Click to expand or collapse</b></summary>
1. [Project Overview](#-project-overview)
2. [At a Glance](#-at-a-glance)
3. [System Architecture](#-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Repository Structure](#-repository-structure)
6. [Application Features](#-application-features)
7. [Screenshots](#-screenshots)
8. [Database Schema](#-database-schema)
9. [API Reference](#-api-reference)
10. [Quick Start](#-quick-start)
11. [Environment Variables](#-environment-variables)
12. [Application Workflow](#-application-workflow)
13. [Future Improvements](#-future-improvements)
14. [Contributing](#-contributing)
15. [Disclaimer](#-disclaimer)
16. [Author](#-author)
17. [Support](#-support)
</details>
---
 
## 📌 Project Overview
 
**TSMS Dashboard** is a full-stack school information and digital media portal for **Telangana Model School, Navipet** (Nizamabad district, Telangana). It has two sides that share one codebase and one server:
 
<table>
<tr>
<td width="50%" valign="top">
### 🌐 Public Portal
For parents, students, and visitors.
 
- Read about the school, mission, and vision
- Browse the student and staff directories
- Look up a student by ID
- Explore events, photo and video galleries
- Read notices and celebrate achievements
</td>
<td width="50%" valign="top">
### 🔐 Admin Dashboard
For the school administrator.
 
- Manage school profile and academic years
- Add students manually or import from Excel
- Manage staff, events, media, notices, achievements
- Review every action in the audit log
- Changes appear on the public site instantly
</td>
</tr>
</table>
**Problem it solves:** many schools keep records in scattered spreadsheets and share news through notice boards or messaging groups. TSMS gives the school one searchable, always-available portal that the administrator updates once.
 
---
 
## 📊 At a Glance
 
| 🧩 | 🗂 | 🔌 | 🛡 | 🗃 |
| :---: | :---: | :---: | :---: | :---: |
| **13** public and admin modules | **12** database tables | **40+** API endpoints | **5** failed logins before lockout | **2** database engines supported |
 
---
 
## 🏗 System Architecture
 
<div align="center">
  <img src="assets/architecture.svg" alt="Animated system architecture diagram" width="100%"/>
</div>
<br/>
The app is a **single-server, three-layer architecture**. In development, Express serves the API and mounts Vite as middleware, so one command runs everything. In production, Express serves the pre-built React bundle from `dist/`.
 
| Layer | Responsibility |
| --- | --- |
| **Presentation** (`src/`) | React 19 single-page app with React Router. Public pages share a navbar and footer. Admin pages sit behind `AdminLayout`, which redirects unauthenticated users to the login page. |
| **API** (`server/routes/`) | `public.ts` exposes read-only endpoints. `admin.ts` exposes create, update, and delete endpoints behind JWT middleware (except login, logout, and the session check). |
| **Data** (`server/db.ts`) | Picks PostgreSQL or SQLite at startup and exposes the same `dbQuery`, `dbGet`, and `dbRun` helpers. Creates tables and seeds the school profile and academic years on first run. |
 
<details>
<summary><b>📐 View the detailed component diagram</b></summary>
```mermaid
flowchart TB
    subgraph Client["Browser (React SPA)"]
        PUB["Public pages"]
        ADM["Admin pages"]
        AUTH["AuthContext"]
    end
 
    subgraph Server["Express Server (server.ts)"]
        PR["/api/public/*"]
        AR["/api/admin/*"]
        MW["verifyAdminToken (JWT)"]
        UP["Multer uploads"]
        XL["SheetJS Excel parser"]
        STATIC["/uploads static files"]
    end
 
    subgraph Data["Data layer (server/db.ts)"]
        HELPER["dbQuery, dbGet, dbRun"]
        PG[("PostgreSQL")]
        SQ[("SQLite via sql.js")]
    end
 
    PUB --> PR
    ADM --> AUTH
    ADM --> AR
    AR --> MW
    MW --> UP
    MW --> XL
    PR --> HELPER
    MW --> HELPER
    HELPER --> PG
    HELPER -. fallback .-> SQ
    UP --> STATIC
```
 
</details>
---
 
## 🧰 Tech Stack
 
| Category | Technology |
| --- | --- |
| **Frontend** | React 19, React Router DOM 7, TypeScript |
| **Build tool** | Vite 8 with `@vitejs/plugin-react` |
| **Styling** | Tailwind CSS 4 (`@tailwindcss/vite`) |
| **Icons and motion** | Lucide React, Motion |
| **Backend** | Node.js, Express 4 |
| **Authentication** | `jsonwebtoken` (JWT), `bcryptjs`, HTTP-only cookies |
| **File uploads** | Multer |
| **Excel handling** | SheetJS (`xlsx`) |
| **Database** | PostgreSQL (`pg`) or embedded SQLite (`sql.js`) |
| **Tooling** | `tsx`, `esbuild`, `dotenv`, `cors` |
| **Package managers** | npm (`package-lock.json`) or Bun (`bun.lock`) |
 
---
 
## 📂 Repository Structure
 
<details open>
<summary><b>Click to expand or collapse</b></summary>
```
TSMS-dashboard/
├── assets/                    # README banner and architecture animations
├── server.ts                  # Express entry (API + Vite middleware / static hosting)
├── server/
│   ├── db.ts                  # DB connection, tables, seeding, query helpers
│   ├── middleware/
│   │   └── auth.ts            # JWT verification (cookie or Bearer token)
│   └── routes/
│       ├── public.ts          # Public read-only API  (/api/public)
│       └── admin.ts           # Protected admin API   (/api/admin)
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Route definitions (public + admin)
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── index.css              # Tailwind entry
│   ├── context/
│   │   └── AuthContext.tsx    # Admin session state (login / logout / me)
│   ├── components/
│   │   ├── PublicLayout.tsx   # Layout for public pages
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AdminLayout.tsx    # Auth guard + sidebar layout
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   └── pages/
│       ├── public/            # Home, About, Students, StudentSearch, Staff,
│       │                      # Events, EventDetail, Gallery, Videos,
│       │                      # Notices, Achievements, Contact
│       └── admin/             # AdminLogin, AdminDashboard, SchoolSettings,
│                              # AcademicYears, StudentList, StudentImport,
│                              # ImportHistory, StaffManagement, EventManagement,
│                              # MediaManagement, NoticeManagement,
│                              # AchievementManagement, AuditLogs
├── index.html                 # HTML shell with SEO and Open Graph tags
├── vite.config.ts             # Vite + React + Tailwind config
├── tsconfig.json
├── package.json
├── .env.example               # Environment variable template
├── data/                      # (auto-created) SQLite database file
└── uploads/                   # (auto-created) uploaded images, PDFs, spreadsheets
```
 
> `data/` and `uploads/` are created on first run and excluded from Git via `.gitignore`.
 
</details>
---
 
## ✨ Application Features
 
### 🌐 Public Portal
 
| Page | Route | What it offers |
| --- | --- | --- |
| 🏠 **Home** | `/` | Hero banner, live statistics, latest notices, upcoming events, recent achievements |
| ℹ️ **About** | `/about` | School profile, mission, vision, management type, medium of instruction, UDISE and school codes |
| 🎓 **Students** | `/students` | Paginated directory with class, section, academic year, and name filters |
| 🔍 **Student ID Search** | `/students/search` | Instant lookup by Student ID showing only non-sensitive fields |
| 👩‍🏫 **Staff** | `/staff` | Staff directory with All, Teaching, and Non-teaching tabs |
| 📅 **Events** | `/events`, `/events/:id` | Event listing and detail pages with linked photos and videos |
| 🖼 **Gallery** | `/gallery` | Photo gallery filterable by event and academic year |
| 🎬 **Videos** | `/videos` | Video gallery with embedded YouTube playback |
| 📢 **Notices** | `/notices` | Published circulars and announcements with attachments |
| 🏆 **Achievements** | `/achievements` | Academic, sports, cultural, government, school, student, and teacher categories |
| ✉️ **Contact** | `/contact` | School contact details and an enquiry form |
 
> 🔒 **Privacy by design:** public endpoints return only student ID, name, class, section, gender, academic year, and status. Date of birth, admission number, and parent names are never exposed publicly.
 
### 🔐 Admin Dashboard
 
| Module | Route | Capabilities |
| --- | --- | --- |
| 📈 **Dashboard** | `/admin/dashboard` | Totals for students, teaching staff, all staff, events, plus recent imports |
| 🏫 **School Profile** | `/admin/school` | Edit name, codes, address, contacts, mission, vision, logo, banner |
| 🗓 **Academic Years** | `/admin/academic-years` | Create years and activate one as current |
| 🎓 **Student List** | `/admin/students` | Search, filter, add, edit, delete students |
| 📥 **Import Excel** | `/admin/students/import` | Template download, upload, preview, validate, confirm |
| 🕘 **Import History** | `/admin/students/import-history` | Past imports with added, updated, and error counts |
| 👥 **Staff** | `/admin/staff` | Manage teaching and non-teaching staff |
| 📅 **Events** | `/admin/events` | Date, location, cover image, publish status |
| 🖼 **Gallery** | `/admin/gallery` | Upload photos, add videos, link to events and years |
| 📢 **Notices** | `/admin/notices` | Publish notices with attachments and expiry dates |
| 🏆 **Achievements** | `/admin/achievements` | Record achievements by category and year |
| 🧾 **Audit Logs** | `/admin/audit-logs` | The 100 most recent actions with timestamp and IP |
 
### 🛡 Security Features
 
| Feature | Detail |
| --- | --- |
| 🔑 **Password hashing** | bcrypt with 10 salt rounds |
| 🍪 **Session cookie** | JWT (12-hour expiry) in an HTTP-only, SameSite=Strict cookie, `Secure` in production |
| 🚦 **Rate limiting** | 5 failed logins per IP within 15 minutes triggers a temporary block |
| 💪 **Password policy** | 12+ characters with upper, lower, number, special character; common passwords rejected |
| 🧱 **Protected routes** | Admin API behind JWT middleware, admin UI redirects to login |
| 📎 **Upload controls** | 10 MB limit and file-type filtering (images, PDF, Excel, CSV) |
| 🧾 **Audit trail** | Logins, password changes, and every create, update, and delete |
| 💉 **SQL injection defense** | Parameterized queries throughout |
 
---
 
## 🖼 Screenshots
 
> Add your own screenshots to a `docs/screenshots/` folder and uncomment the table below.
 
<!--
<table>
<tr>
<td align="center"><img src="docs/screenshots/home.png" width="100%"/><br/><sub><b>Home</b></sub></td>
<td align="center"><img src="docs/screenshots/students.png" width="100%"/><br/><sub><b>Student Directory</b></sub></td>
</tr>
<tr>
<td align="center"><img src="docs/screenshots/admin-dashboard.png" width="100%"/><br/><sub><b>Admin Dashboard</b></sub></td>
<td align="center"><img src="docs/screenshots/excel-import.png" width="100%"/><br/><sub><b>Excel Import Preview</b></sub></td>
</tr>
</table>
-->
 
---
 
## 🗄 Database Schema
 
Tables are created automatically on first start, on either PostgreSQL or SQLite.
 
| Table | Purpose |
| --- | --- |
| `admin_users` | Single administrator account (ID, bcrypt hash, login metadata) |
| `schools` | School profile (one record) |
| `academic_years` | Year name, start and end dates, `is_active` flag |
| `students` | Student records linked to an academic year |
| `staff` | Teaching and non-teaching staff |
| `events` | School events linked to an academic year |
| `media` | Photos and videos, optionally linked to an event |
| `notices` | Notices and circulars with publish and expiry fields |
| `achievements` | Achievements with category and academic year |
| `student_imports` | One row per Excel import (counts and status) |
| `student_import_errors` | Row-level errors recorded during imports |
| `audit_logs` | Administrative activity log |
 
```mermaid
erDiagram
    academic_years ||--o{ students : has
    academic_years ||--o{ events : has
    academic_years ||--o{ media : has
    academic_years ||--o{ achievements : has
    academic_years ||--o{ student_imports : has
    events ||--o{ media : contains
    student_imports ||--o{ student_import_errors : logs
```
 
---
 
## 🔌 API Reference
 
<details>
<summary><b>🌐 Public API: <code>/api/public</code> (no authentication)</b></summary>
<br/>
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/school` | School profile |
| GET | `/statistics` | Counts for the active academic year |
| GET | `/students/search?studentId=` | Look up one student by ID |
| GET | `/students` | Directory with `page`, `limit`, `class`, `section`, `academic_year_id`, `search` |
| GET | `/staff?type=` | Active staff, optionally `teaching` or `non-teaching` |
| GET | `/events`, `/events/:id` | Published events and details with media |
| GET | `/gallery` | Photos and videos |
| GET | `/notices` | Published, non-expired notices |
| GET | `/achievements` | Achievements |
 
</details>
<details>
<summary><b>🔐 Admin API: <code>/api/admin</code> (JWT required unless noted)</b></summary>
<br/>
| Area | Endpoints |
| --- | --- |
| **Session** | `POST /login`, `POST /logout`, `GET /me`, `POST /change-password` |
| **Uploads** | `POST /upload` |
| **School** | `GET /school`, `PUT /school` |
| **Academic years** | `GET /academic-years`, `POST /academic-years`, `POST /academic-years/:id/activate` |
| **Students** | `GET`, `POST`, `PUT /:id`, `DELETE /:id` on `/students` |
| **Excel import** | `GET /students/template`, `POST /students/import-preview`, `POST /students/import-confirm`, `GET /students/import-history` |
| **Staff** | `GET`, `POST`, `PUT /:id`, `DELETE /:id` on `/staff` |
| **Events** | `GET`, `POST`, `PUT /:id`, `DELETE /:id` on `/events` |
| **Media** | `GET`, `POST`, `DELETE /:id` on `/media` |
| **Notices** | `GET`, `POST`, `PUT /:id`, `DELETE /:id` on `/notices` |
| **Achievements** | `GET`, `POST`, `DELETE /:id` on `/achievements` |
| **Audit** | `GET /audit-logs` |
 
</details>
Health check: `GET /api/health` returns `{ "status": "ok", "timestamp": "..." }`.
 
---
 
## 🚀 Quick Start
 
### Prerequisites
 
- **Node.js 18+** (20+ recommended) and **npm**
- *(Optional)* a **PostgreSQL** database. Without one, the app uses an embedded SQLite file automatically.
### 1️⃣ Clone and install
 
```bash
git clone https://github.com/<your-username>/TSMS-dashboard.git
cd TSMS-dashboard
npm install
```
 
### 2️⃣ Configure environment
 
```bash
cp .env.example .env
```
 
```env
ADMIN_INITIAL_ID=your-admin-id
ADMIN_INITIAL_PASSWORD=a-strong-password-here
JWT_SECRET=a-long-random-string
# DATABASE_URL=postgresql://user:password@host:5432/dbname   # optional
```
 
> ⚠️ If `ADMIN_INITIAL_ID` and `ADMIN_INITIAL_PASSWORD` are missing, no administrator is created and you cannot log in.
 
### 3️⃣ Start the development server
 
```bash
npm run dev
```
 
| 🔗 URL | What you get |
| --- | --- |
| `http://localhost:3000/` | Public website |
| `http://localhost:3000/admin/login` | Admin login |
 
On first run the app creates `data/` and `uploads/`, builds all tables, and seeds the school profile and two academic years (2025-26 and 2026-27, with 2026-27 active). With SQLite it also adds a few sample staff and student records so pages are not empty.
 
### 4️⃣ Build for production
 
<details>
<summary><b>🐧 macOS / Linux</b></summary>
```bash
npm run build
NODE_ENV=production npm run preview
```
 
</details>
<details>
<summary><b>🪟 Windows PowerShell</b></summary>
```powershell
npm run build
$env:NODE_ENV="production"; npm run preview
```
 
</details>
### 🧾 Available scripts
 
| Command | Description |
| --- | --- |
| `npm run dev` | Start API and Vite dev server together (port 3000) |
| `npm run build` | Production build (client and server bundle) |
| `npm run preview` | Run the production server (`node server.js`) |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run clean` | Remove `dist/` and `server.js` |
 
### 🐘 Using PostgreSQL
 
Set `DATABASE_URL` in `.env`. The server tries PostgreSQL first and falls back to SQLite if the connection fails, so check the console to confirm which database is active.
 
---
 
## ⚙️ Environment Variables
 
| Variable | Required | Description |
| --- | :---: | --- |
| `ADMIN_INITIAL_ID` | ✅ | Administrator login ID, created or updated on every startup |
| `ADMIN_INITIAL_PASSWORD` | ✅ | Administrator password, stored as a bcrypt hash |
| `JWT_SECRET` | ✅ | Secret for signing admin session tokens. Always set your own value. |
| `DATABASE_URL` | ➖ | PostgreSQL connection string. If omitted, SQLite is used. |
| `PORT` | ➖ | Server port (default `3000`) |
| `NODE_ENV` | ➖ | Set to `production` to serve the built frontend and enable secure cookies |
| `SESSION_SECRET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET`, `CORS_ORIGIN` | 🕒 | In `.env.example` for future use and not read by the current code |
 
> 🚫 Never commit your `.env` file. It is already listed in `.gitignore`.
 
---
 
## 🔄 Application Workflow
 
### 1. Visitor journey
 
```mermaid
flowchart LR
    A([Visitor opens site]) --> B[Home page<br/>school info, stats, notices, events]
    B --> C{What do they want?}
    C -->|Find a student| D[Student ID search<br/>or filtered directory]
    C -->|Meet the staff| E[Staff directory]
    C -->|See school life| F[Events, Gallery, Videos]
    C -->|Read updates| G[Notices and Achievements]
    C -->|Get in touch| H[Contact page]
```
 
### 2. Administrator journey
 
```mermaid
flowchart TD
    A([Admin opens /admin/login]) --> B[Submit ID and password]
    B --> C{Valid and under<br/>rate limit?}
    C -->|No| D[Error shown, attempt counted]
    C -->|Yes| E[JWT issued in HTTP-only cookie]
    E --> F[Dashboard overview]
    F --> G[Manage content<br/>students, staff, events, media,<br/>notices, achievements, profile]
    G --> H[Change saved to database]
    H --> I[Action written to audit log]
    H --> J[Public site shows updated content]
    F --> K[Logout clears session]
```
 
### 3. Excel student import
 
```mermaid
sequenceDiagram
    participant A as Admin
    participant UI as Import Page
    participant API as Express API
    participant DB as Database
 
    A->>UI: Download template
    UI->>API: GET /students/template
    API-->>A: student_import_template.xlsx
    A->>UI: Choose academic year, upload filled file
    UI->>API: POST /students/import-preview
    API->>API: Parse sheet, check required fields,<br/>detect duplicates, mark Insert or Update
    API-->>UI: Summary, first 50 valid rows, error list
    A->>UI: Review and confirm
    UI->>API: POST /students/import-confirm
    API->>DB: Insert new rows, update existing<br/>(matched on Student ID and year)
    API->>DB: Save import record and row errors
    API->>DB: Write audit log entry
    API-->>UI: Added, updated, error counts
```
 
| | Columns |
| --- | --- |
| **Required** | `Student ID`, `Student Name`, `Class`, `Section` |
| **Optional** | `Gender`, `Date of Birth`, `Admission Number`, `Father Name`, `Mother Name`, `Status` |
 
### 4. Academic year lifecycle
 
```mermaid
flowchart LR
    A[Create year<br/>e.g. 2027-28] --> B[Activate it]
    B --> C[Only one year<br/>is active at a time]
    C --> D[Public statistics follow<br/>the active year]
    C --> E[Older records keep<br/>their year, history preserved]
```
 
---
 
## 🔮 Future Improvements
 
<details open>
<summary><b>✨ Features</b></summary>
- [ ] Connect the Contact page enquiry form to the backend (store messages or send email)
- [ ] Attendance tracking and class-wise reports
- [ ] Exam results and report card management
- [ ] Parent and student login with a personal view of their own records
- [ ] Multiple administrator accounts with role-based access (admin, teacher, data entry)
- [ ] Bilingual interface (English and Telugu)
- [ ] SMS or WhatsApp notifications for notices and events
- [ ] Export students, staff, and audit logs to Excel or PDF
- [ ] Image upload for achievements and staff directly from forms, with thumbnail generation
- [ ] Edit support for achievements and media entries
- [ ] Dark mode for the public site
</details>
<details open>
<summary><b>🛠 Engineering and security</b></summary>
- [ ] Require `JWT_SECRET` at startup instead of using a fallback value
- [ ] Remove or restrict diagnostic endpoints before deployment
- [ ] Restrict CORS to a configured origin (`CORS_ORIGIN`)
- [ ] Add Helmet security headers and persistent, distributed rate limiting
- [ ] Validate uploads by file content (magic bytes), not extension and MIME type alone
- [ ] Wrap Excel imports in a database transaction to prevent partial imports
- [ ] Move uploads to cloud storage such as S3 or Supabase Storage
- [ ] Add automated tests (unit, API, end-to-end) and a CI pipeline
- [ ] Add Docker and `docker-compose` for one-command deployment
- [ ] Add pagination and search to the audit log and import history
</details>
---
 
## 🤝 Contributing
 
Contributions, bug reports, and ideas are welcome.
 
1. **Fork** the repository
2. **Create** a branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "Add your feature"`
4. **Push** the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request
Please run `npm run lint` before submitting.
 
---
 
## ⚠️ Disclaimer
 
- This is an **independent software project** and is **not an official website** of the Telangana Model Schools, the Government of Telangana, or any government body unless explicitly stated by the school administration.
- Sample data seeded by the application (names, contact details, email, and website URLs) is **placeholder data for demonstration only**. Replace it with verified information before real use.
- The portal handles **student personal information**. Anyone deploying it is responsible for complying with applicable data protection and child privacy laws and school policies, for choosing strong credentials, and for securing the server, database, and backups.
- The software is provided **"as is"**, without warranty of any kind. The author is not liable for any loss, damage, or data exposure arising from its use.
- Review the security items under [Future Improvements](#-future-improvements) before exposing the application to the public internet.
---
 
## 👩‍💻 Author
 
<div align="center">
**Mahalakshmi**
B.Tech Computer Science Engineering Student, Institute of Aeronautical Engineering, Hyderabad
 
[![GitHub](https://img.shields.io/badge/GitHub-your--username-181717?style=for-the-badge&logo=github)](https://github.com/your-github-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/your-linkedin-profile)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your-email@example.com)
 
</div>
---
 
## 💬 Support
 
If you run into problems or have suggestions:
 
1. **Check the console.** The server logs which database is active and reports startup warnings, such as missing admin credentials.
2. **Open an issue** on GitHub with the steps to reproduce, your Node.js version, and any error messages.
<details>
<summary><b>🧯 Common fixes</b></summary>
| Problem | Fix |
| --- | --- |
| Cannot log in | Confirm `ADMIN_INITIAL_ID` and `ADMIN_INITIAL_PASSWORD` are set in `.env`, then restart the server |
| Port already in use | Set a different `PORT` in `.env` |
| Data looks different than expected | The app may have fallen back to SQLite because `DATABASE_URL` failed to connect |
| Excel import rejected | Use the downloadable template and fill `Student ID`, `Student Name`, `Class`, and `Section` on every row |
 
</details>
<div align="center">
### ⭐ If this project helped you, please give it a star!
 
<br/>
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,18&height=120&section=footer" width="100%" alt="Footer wave"/>
**Made with ❤️ for rural education in Telangana**
 
</div>
 
