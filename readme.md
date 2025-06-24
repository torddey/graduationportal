# Graduation Portal

A comprehensive graduation registration and management system for GIMPA (Ghana Institute of Management and Public Administration).

---

## Table of Contents
- [Features](#features)
- [User Stories](#user-stories)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Scripts](#scripts)
- [Code Linting & Project Hygiene](#code-linting--project-hygiene)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Frontend Overview](#frontend-overview)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Student
- Secure authentication (OTP-based)
- Eligibility checking
- Graduation registration form
- Download graduation confirmation as PDF
- Profile management

### Admin
- Upload eligible students via CSV
- Export students, registrations, or all data as CSV
- Dashboard with statistics and real-time updates
- Audit logs for sensitive actions (exports, downloads, settings)
- Manage ceremony and registration settings

### General
- Real-time updates via WebSocket
- Professional PDF generation (confirmation)
- Audit logging for compliance

---

## User Stories

### As a Student
- I want to log in securely using my student ID and OTP so that I can access the graduation portal.
- I want to check if I am eligible to register for graduation so that I know if I can participate in the ceremony.
- I want to fill out a graduation registration form so that my details are recorded for the ceremony.
- I want to download my graduation confirmation as a PDF so that I have official proof of my registration.
- I want to view and update my profile information so that my contact details are always correct.

### As an Admin
- I want to log in securely to the admin dashboard so that I can manage the graduation process.
- I want to upload a CSV file of eligible students so that only qualified students can register.
- I want to export lists of students and registrations as CSV files so that I can analyze or archive the data.
- I want to view real-time statistics and analytics on the dashboard so that I can monitor registration progress.
- I want to review audit logs so that I can track important actions and ensure compliance.
- I want to update ceremony and registration settings so that deadlines and event details are always current.

### As a System User (General)
- I want all my actions (such as downloads and exports) to be logged so that there is a record for security and compliance.
- I want the system to be fast and responsive, with real-time updates, so that I always see the latest information.

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Real-time:** Socket.IO
- **File Processing:** csv-parse, csv-stringify, PDFKit
- **Authentication:** JWT, bcrypt, OTP

---

## Project Structure

```
Graduation/
  backend/
    src/
      db/           # Database schema, migrations, seed scripts
      middleware/    # Express middleware (auth)
      routes/        # API endpoints (admin, registration, csv, auth, ...)
      types/         # TypeScript types
      utils/         # Logger utility
    migrations/      # SQL migration scripts
    uploads/         # Uploaded CSV files
    package.json     # Backend dependencies & scripts
    SETUP.md         # Backend setup guide
  frontend/
    src/
      components/    # React components (admin, auth, layout, student, ui)
      contexts/      # React context providers (AuthContext)
      hooks/         # Custom React hooks (useSocket)
      pages/         # Main and admin pages
      services/      # API service wrappers
      types/         # TypeScript types
      utils/         # Utility functions (socket monitor)
    package.json     # Frontend dependencies & scripts
    index.html       # App entry point
  README.md          # Project documentation
```

---

## Database Schema

- **students**: Student info, eligibility, contact
- **registrations**: Graduation registration, confirmation ID, form data
- **audit_logs**: Action logs (exports, downloads, settings changes)
- **admin_users**: Admin credentials
- **otps**: One-time passwords for student login
- **eligible_uploads**: CSV upload tracking
- **settings**: Ceremony and registration settings

**Confirmation ID Format:**
- `GIMPA` + 6-digit timestamp + 3-digit random (e.g., `GIMPA123456789`)
- Short, readable, unique, and professional

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL
- npm or yarn

### 1. Clone the Repository
```sh
git clone <repo-url>
cd Graduation
```

### 2. Backend Setup
```sh
cd backend
npm install
# Create .env (see below)
npm run dev
```

### 3. Frontend Setup
```sh
cd frontend
npm install
# Create .env (see below)
npm run dev
```

### 4. Database Setup
- Create a PostgreSQL database (e.g., `graduation_db`)
- Update connection string in `backend/.env`
- Apply schema:
  ```sh
  psql -U <user> -d graduation_db -f backend/src/db/schema.sql
  ```
- Run migration (if needed):
  ```sh
  cd backend
  npm run migrate
  ```
- Seed initial data:
  ```sh
  npm run seed
  ```

---

## Scripts

### Backend (`backend/package.json`)
- `dev`: Start backend in dev mode (TypeScript)
- `build`: Compile TypeScript
- `start`: Run compiled backend
- `seed`: Seed database with initial data
- `migrate`: Run confirmation ID migration

### Frontend (`frontend/package.json`)
- `dev`: Start frontend in dev mode
- `build`: Build frontend for production
- `lint`: Lint code
- `preview`: Preview production build

---

## Code Linting & Project Hygiene

### Linting
- **ESLint** is used for both backend and frontend to enforce code quality and consistency.
- Linting is configured for TypeScript and modern JavaScript best practices.
- The `dist/` directory is ignored from linting via a `.eslintignore` file in the backend.

#### To lint and auto-fix issues:
- **Backend:**
  ```sh
  cd backend
  npm run lint
  # or for auto-fix:
  npx eslint --fix --ext .ts,.tsx .
  ```
- **Frontend:**
  ```sh
  cd frontend
  npm run lint
  # or for auto-fix:
  npx eslint --fix --ext .ts,.tsx .
  ```

#### Notes:
- Add new rules or ignore files as needed in `eslint.config.js` or `.eslintignore`.
- Keep code clean by removing unused imports, variables, and files regularly.
- Run linting before committing or pushing changes to maintain code quality.

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://username:password@localhost:5432/graduation_db
JWT_SECRET=your_jwt_secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## API Endpoints

### Admin
- `GET /api/admin/export/students` — Export all students (CSV)
- `GET /api/admin/export/registrations` — Export all registrations (CSV)
- `GET /api/admin/export/all` — Export all data (CSV)
- `GET /api/admin/dashboard-stats` — Dashboard statistics
- `GET /api/admin/audit-logs` — Audit logs
- `GET /api/admin/settings` — Get ceremony/registration settings
- `POST /api/admin/settings` — Update settings

### Student
- `POST /api/registration/submit` — Submit graduation registration
- `GET /api/registration/status/:studentId` — Get registration status
- `GET /api/registration/export/:studentId` — Download confirmation (PDF)

### CSV
- `POST /api/csv/upload-eligible` — Upload eligible students (CSV)

### Auth
- `POST /api/auth/login` — Login (admin/student)
- `POST /api/auth/verify-otp` — Verify OTP (student)

---

## Frontend Overview

### Main Pages (`src/pages/`)
- `HomePage`: Landing page
- `LoginPage`: Student/admin login
- `RegistrationPage`: Student registration
- `ConfirmationPage`: Registration confirmation & PDF download
- `ProfilePage`: Student profile
- `NoticePage`: Notices/alerts
- `NotFoundPage`: 404
- `admin/AdminDashboard`: Admin dashboard
- `admin/AdminAnalytics`: Analytics & stats
- `admin/AdminUpload`: CSV upload
- `admin/AdminSettings`: Ceremony/settings management

### Key Components
- `admin/`: DashboardStats, ExportDropdown, CsvUploader, AuditLogTable, RegisteredStudentsTable
- `auth/`: LoginForm, AdminRoute, ProtectedRoute
- `layout/`: Header, Footer
- `student/`: DownloadButton
- `ui/`: Button, Checkbox, Select, LoadingSpinner, ConnectionStatus, TextInput, TextArea

### Services & Utilities
- `services/`: API wrappers (auth, registration, admin, email, eligibility)
- `contexts/`: AuthContext for global auth state
- `hooks/`: useSocket for real-time updates
- `utils/`: socketMonitor for connection health
- `types/`: TypeScript types for Student, RegistrationForm, User

---

## Security Notes
- **JWT**: Used for authentication, stored in localStorage (frontend)
- **OTP**: One-time passwords for student login, never stored on frontend
- **Audit Logs**: All exports, downloads, and settings changes are logged
- **Environment**: Never commit `.env` files; use strong secrets and rotate regularly
- **CORS**: Configurable via backend `.env`

---

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Author
Evans Ampofo Torddey
