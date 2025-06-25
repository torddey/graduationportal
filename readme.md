# Graduation Portal

A comprehensive graduation registration and management system for GIMPA.

---

## Features

### Student
- OTP-based authentication
- Eligibility check and registration
- Download confirmation as PDF
- Profile management

### Admin
- Superadmin/admin roles (superadmin can create admins)
- Secure OTP login for admins
- Upload eligible students via CSV (uploader tracked)
- Export students/registrations/all data as CSV
- Dashboard with stats and real-time updates
- Audit logs for sensitive actions
- Ceremony and registration settings management
- Only superadmin can create new admins or view all admins

### General
- Real-time updates (Socket.IO)
- Audit logging for compliance

---

## Project Structure

```
Graduation/
  backend/
    src/
      db/           # Schema, migrations, seed scripts
      middleware/   # Auth middleware (role-based)
      routes/       # API endpoints (admin, registration, csv, auth, ...)
      types/        # TypeScript types
      utils/        # Logger
    migrations/     # SQL migration scripts
    uploads/        # Uploaded CSVs
    package.json
    SETUP.md
  frontend/
    src/
      components/   # React components (admin, auth, layout, student, ui)
      contexts/     # AuthContext (role-aware)
      hooks/        # Custom hooks
      pages/        # Main/admin pages
      services/     # API service wrappers
      types/        # TypeScript types
      utils/        # Utilities
    package.json
    index.html
  README.md
```

---

## Database Schema

- **students**: Student info, eligibility, contact
- **registrations**: Graduation registration, confirmation ID, form data
- **audit_logs**: Action logs (exports, downloads, settings changes)
- **admin_users**: Admin credentials, role (`admin` or `superadmin`)
- **admin_otps**: OTPs for admin login
- **otps**: OTPs for student login
- **eligible_uploads**: CSV upload tracking (includes uploader)
- **settings**: Ceremony and registration settings

---

## Setup & Installation

1. **Clone the Repository**
   ```sh
   git clone <repo-url>
   cd Graduation
   ```

2. **Backend**
   ```sh
   cd backend
   npm install
   # Create .env (see below)
   node run-migration.js
   npm run dev
   ```

3. **Frontend**
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Variables**
   - See `.env.example` in each directory for required variables.

---

## API Highlights

- `POST /api/auth/request-otp` — Request OTP (student/admin)
- `POST /api/auth/verify-otp` — Verify OTP (student/admin)
- `POST /api/admin/admins` — Create new admin (superadmin only)
- `GET /api/admin/admins` — List all admins (superadmin only)
- `POST /api/admin/upload-eligible` — Upload eligible students (CSV, uploader tracked)
- `GET /api/admin/audit-logs` — Audit logs
- `GET /api/admin/settings` — Get settings
- `POST /api/admin/settings` — Update settings

---

## Security Notes

- **Role-based access:** Only superadmins can create/view admins.
- **Audit logging:** All sensitive actions (uploads, exports, settings) are logged with the actor.
- **OTP authentication:** Used for both students and admins.
- **JWT:** Used for session management.

---

## Author

Evans Ampofo Torddey
