# Graduation Portal

A comprehensive graduation registration system for GIMPA (Ghana Institute of Management and Public Administration).

## Features

### Student Features
- Student authentication and eligibility checking
- Graduation ceremony registration
- Registration confirmation and tracking
- Profile management

### Admin Features
- **CSV Upload**: Upload eligible students via CSV files
- **Export Data**: Export various datasets as CSV files
  - Export Students: All eligible students data
  - Export Registrations: All graduation registrations with form details
  - Export All Data: Complete dataset with registration status
- Dashboard with statistics and audit logs
- Real-time data updates via WebSocket

## Export Feature

The admin dashboard now includes a comprehensive export functionality that allows administrators to download data in CSV format:

### Available Export Options

1. **Export Students**
   - Exports all eligible students data
   - Includes: Student ID, Name, Email, Program, Phone, Address, Eligibility Status, Created Date

2. **Export Registrations**
   - Exports all graduation registrations with detailed form data
   - Includes: Confirmation ID, Student details, Contact information, Emergency contacts, Guest count, Special requirements

3. **Export All Data**
   - Exports complete dataset with registration status
   - Includes: Student information with registration status and confirmation details

### How to Use

1. Navigate to the Admin Dashboard
2. Click the "Export Data" dropdown button
3. Select the desired export type
4. The CSV file will automatically download with a timestamped filename

### Export Logging

All export activities are automatically logged in the audit system for tracking and compliance purposes.

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
1. Create a PostgreSQL database
2. Update database connection in `backend/src/db/db.ts`
3. Run the schema: `backend/src/db/schema.sql`
4. Seed initial data: `npm run seed`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/graduation_db
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Admin Export Endpoints
- `GET /api/admin/export/students` - Export students data
- `GET /api/admin/export/registrations` - Export registrations data  
- `GET /api/admin/export/all` - Export all data

### Other Endpoints
- `POST /api/csv/upload-eligible` - Upload eligible students CSV
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/audit-logs` - Get audit logs
- `POST /api/registration/submit` - Submit graduation registration

## Technologies Used

- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Real-time**: Socket.IO
- **File Processing**: csv-parse, csv-stringify
- **Authentication**: JWT, bcrypt

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

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

