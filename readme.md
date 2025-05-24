# GIMPA Graduation Portal

A full-stack web application for GIMPA students to register for graduation, featuring secure OTP-based authentication, admin management, and audit logging.

---

## Features

- **Student Login:** Secure login using student ID and OTP verification.
- **Graduation Registration:** Eligible students can submit graduation registration forms.
- **Admin Dashboard:** Admins can view registrations, upload eligible students, and audit logs.
- **Audit Logging:** All critical actions are logged for transparency.
- **PostgreSQL Database:** All data is securely stored in a PostgreSQL database.
- **JWT Authentication:** Secure session management using JSON Web Tokens.

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL

---

## Project Structure

```
backend/
  src/
    db/                # Database schema and seed scripts
    middleware/        # Express middleware (e.g., JWT auth)
    routes/            # Express route handlers (auth, registration, admin)
    ...
  .env                 # Backend environment variables

frontend/
  src/
    services/          # API service wrappers (auth, registration, admin)
    contexts/          # React context providers (AuthContext)
    components/        # React components
    pages/             # Page components (Login, Registration, Admin)
    ...
  .env                 # Frontend environment variables
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL

### 1. Clone the Repository

```sh
git clone https://github.com/torddey/graduation-portal.git
cd graduation
```

### 2. Setup the Database

- Create a PostgreSQL database (e.g., `graduation_db`).
- Create a user (e.g., `myuser`) with a password and grant privileges.
- Apply the schema:

```sh
psql -U myusername -d graduation_db -f backend/src/db/schema.sql
```

- (Optional) Seed the database:

```sh
cd backend
npm install
npm run seed
```

### 3. Configure Environment Variables

#### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://yourusername:yourpassword@localhost:5432/graduation_db
PORT=5000
JWT_SECRET=your_jwt_secret
```

#### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Backend

```sh
cd backend
npm install
npm run dev
```

### 5. Start the Frontend

```sh
cd frontend
npm install
npm run dev
```

---

## Usage

- Visit [http://localhost:5173](http://localhost:5173) to access the portal.
- Students can log in with their student ID and OTP.
- Admins can log in via the admin dashboard for management features.

---

## Development Notes

- **OTP Handling:** OTPs are generated and validated on the backend only. The frontend never stores OTPs.
- **JWT:** Tokens are stored in localStorage after successful login.
- **Database:** All tables and constraints are defined in `backend/src/db/schema.sql`.

---

## License

MIT

---

