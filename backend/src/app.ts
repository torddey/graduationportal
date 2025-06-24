/// <reference path="./types/socket.d.ts" />
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import registrationRoutes from "./routes/registration";
import eligibilityRoutes from "./routes/eligibility";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import emailRoutes from "./routes/email";
import csvRoutes from "./routes/csv";
import studentsRoutes from "./routes/students";
import auditLogsRoutes from "./routes/auditlogs";
import { logger } from "./utils/logger";
import db from "./db/db"; // Your existing db connection
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Configure Socket.IO with more robust settings
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingTimeout: 120000,
  pingInterval: 30000,
  connectTimeout: 60000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
  path: "/socket.io/",
  serveClient: false,
  cookie: false,
});

// Add connection logging middleware
io.use((socket, next) => {
  logger.socket("Socket.IO middleware called", "debug");
  const clientIp = socket.handshake.address;
  logger.socket(`New connection attempt from ${clientIp}`);
  logger.debug(
    {
      query: socket.handshake.query,
      headers: socket.handshake.headers,
      namespace: socket.nsp.name,
    },
    { category: "Socket.IO" },
  );

  // JWT authentication for socket
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      socket.user = decoded; // Attach user info to socket
      logger.socket(`Socket authenticated as user: ${JSON.stringify(decoded)}`);
    } catch (err) {
      logger.socket(
        "Socket authentication failed: " +
          (err instanceof Error ? err.message : String(err)),
        "warn",
      );
      // Optionally: return next(new Error('Authentication error'));
    }
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(httpLogger);

// Routes
app.use("/api", router);
app.use("/api/registration", registrationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/csv", csvRoutes);
app.use("/api/auditlogs", auditLogsRoutes);
app.use("/api/admin", adminRoutes);

// WebSocket connection with enhanced logging
io.on("connection", (socket) => {
  const clientIp = socket.handshake.address;
  logger.socket(
    `Client connected: ${socket.id} from ${clientIp} on namespace ${socket.nsp.name}`,
  );
  logger.socket(`Client transport: ${socket.conn.transport.name}`);

  // Send initial connection success with more details
  socket.emit("connection-success", {
    id: socket.id,
    timestamp: new Date().toISOString(),
    transport: socket.conn.transport.name,
    namespace: socket.nsp.name,
    reconnection: true,
    pingInterval: 30000,
    pingTimeout: 120000,
  });

  // Handle disconnection with more detailed logging
  socket.on("disconnect", (reason) => {
    logger.socket(
      `Client disconnected: ${socket.id}, reason: ${reason}`,
      "warn",
    );
    logger.debug(
      {
        lastTransport: socket.conn.transport.name,
        timestamp: new Date().toISOString(),
      },
      { category: "Socket.IO" },
    );

    if (
      ![
        "client namespace disconnect",
        "transport close",
        "ping timeout",
        "transport error",
      ].includes(reason)
    ) {
      logger.socket(
        `Unexpected disconnect for client ${socket.id}, reason: ${reason}`,
        "error",
      );
    }
  });

  // Handle errors
  socket.on("error", (error) => {
    logger.socket(`Error for client ${socket.id}: ${error.message}`, "error");
  });

  // Handle reconnection attempts
  socket.on("reconnect_attempt", (attemptNumber) => {
    logger.socket(
      `Client ${socket.id} attempting to reconnect (attempt ${attemptNumber})`,
      "warn",
    );
  });

  // Handle transport upgrades
  socket.conn.on("upgrade", (transport) => {
    logger.socket(
      `Client ${socket.id} upgraded transport to ${transport.name}`,
      "info",
    );
  });

  // Handle transport errors
  socket.conn.on("error", (error) => {
    logger.socket(
      `Transport error for client ${socket.id}: ${error.message}`,
      "error",
    );
  });

  // Handle packet events for debugging
  socket.conn.on("packet", (packet) => {
    if (packet.type === "ping") {
      logger.debug(`Received ping from client ${socket.id}`, {
        category: "Socket.IO",
      });
    }
  });
});

// One-time database setup function
async function setupDatabase() {
  const setupSql = `
    DROP TABLE IF EXISTS schema_migrations, admin_otps, download_tracking, eligible_uploads, otps, admin_users, audit_logs, registrations, students, settings CASCADE;

    CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        student_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        school VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
        program VARCHAR(100) NOT NULL,
        course VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
        phone VARCHAR(20),
        address VARCHAR(255),
        postalCode VARCHAR(20),
        city VARCHAR(100),
        country VARCHAR(100),
        eligibility_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE registrations (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(student_id),
        school VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
        program VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
        course VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
        confirmation_id VARCHAR(20) UNIQUE,
        form_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id),
        dignitaries TEXT,
        special_requirements TEXT
    );
    CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        user_name VARCHAR(100),
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE otps (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_active_otp UNIQUE (student_id)
    );
    CREATE TABLE eligible_uploads (
        id SERIAL PRIMARY KEY,
        uploaded_by VARCHAR(100),
        upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        file_name VARCHAR(255),
        errors_count INTEGER DEFAULT 0
    );
    CREATE TABLE settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE download_tracking (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(student_id),
        confirmation_id VARCHAR(20) NOT NULL,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        UNIQUE(student_id)
    );
    CREATE TABLE admin_otps (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_active_admin_otp UNIQUE (admin_id)
    );

    -- Seed data
    INSERT INTO students (student_id, name, email, program, phone, eligibility_status) VALUES
    (123456, 'John Doe', 'john.doe@st.gimpa.edu.gh', 'BSc Computer Science', '+233123456789', true),
    (234567, 'Jane Smith', 'jane.smith@st.gimpa.edu.gh', 'BSc Information Technology', '+233234567890', true);
    
    INSERT INTO admin_users (username, password_hash, email) VALUES
    ('admin', '$2b$10$wH8QwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'admin@gimpa.edu.gh');

    INSERT INTO audit_logs (action, user_name, details) VALUES
    ('STUDENT_UPLOAD', 'admin', 'Uploaded 100 eligible students'),
    ('LOGIN_ATTEMPT', 'john.doe', 'Successful login'),
    ('REGISTRATION', '123456', 'Graduation registration completed');
    
    INSERT INTO settings (key, value, description) VALUES
    ('registration_deadline', '2025-07-04T23:59:59', 'Registration deadline for graduation ceremony'),
    ('gown_return_deadline', '2025-08-08T23:59:59', 'Deadline for returning graduation gowns'),
    ('gown_collection_deadline', '2025-05-10T14:00:00', 'Deadline for collecting graduation gowns'),
    ('ceremony_date', '2025-05-15T10:00:00', 'Date and time of graduation ceremony'),
    ('ceremony_location', 'GIMPA Main Campus Auditorium', 'Location of graduation ceremony')
    ON CONFLICT (key) DO NOTHING;
  `;
  try {
    await db.query(setupSql);
    logger.info("Database setup completed successfully.");
  } catch (error) {
    logger.error(
      `Database setup failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
  // await setupDatabase(); // DO NOT run setup on every start, this wipes the database!
  logger.server(`Running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Graduation API is running");
});

export default app;
export { io };
