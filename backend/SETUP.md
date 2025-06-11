# Backend Setup Guide

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/graduation_db

# JWT Secret for authentication
JWT_SECRET=your-secret-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Database Setup

1. Create a PostgreSQL database named `graduation_db`
2. Update the `DATABASE_URL` in your `.env` file with your database credentials
3. Run the schema setup: `npm run db:setup`
4. Run the migration to add download tracking: `node run-migration.js`

## Running the Application

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for database access
- Rotate JWT secrets regularly in production
- Use environment-specific configurations for different deployment stages 