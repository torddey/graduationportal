import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import registrationRoutes from './routes/registration';
import eligibilityRoutes from './routes/eligibility';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import emailRoutes from './routes/email';
import csvRoutes from './routes/csv';
import studentsRoutes from './routes/students';
import auditLogsRoutes from './routes/auditlogs';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure Socket.IO with more robust settings
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 120000,
  pingInterval: 30000,
  connectTimeout: 60000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  path: '/socket.io/',
  serveClient: false,
  cookie: false
});

// Add connection logging middleware
io.use((socket, next) => {
  const clientIp = socket.handshake.address;
  logger.socket(`New connection attempt from ${clientIp}`);
  logger.debug({
    query: socket.handshake.query,
    headers: socket.handshake.headers,
    namespace: socket.nsp.name
  }, { category: 'Socket.IO' });
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);
app.use('/api/registration', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/csv', csvRoutes);
app.use('/api/auditlogs', auditLogsRoutes);
app.use('/api/admin', adminRoutes);

// WebSocket connection with enhanced logging
io.on('connection', (socket) => {
  const clientIp = socket.handshake.address;
  logger.socket(`Client connected: ${socket.id} from ${clientIp} on namespace ${socket.nsp.name}`);
  logger.socket(`Client transport: ${socket.conn.transport.name}`);

  // Send initial connection success with more details
  socket.emit('connection-success', { 
    id: socket.id,
    timestamp: new Date().toISOString(),
    transport: socket.conn.transport.name,
    namespace: socket.nsp.name,
    reconnection: true,
    pingInterval: 30000,
    pingTimeout: 120000
  });

  // Handle disconnection with more detailed logging
  socket.on('disconnect', (reason) => {
    logger.socket(`Client disconnected: ${socket.id}, reason: ${reason}`, 'warn');
    logger.debug({
      lastTransport: socket.conn.transport.name,
      timestamp: new Date().toISOString()
    }, { category: 'Socket.IO' });
    
    if (!['client namespace disconnect', 'transport close', 'ping timeout', 'transport error'].includes(reason)) {
      logger.socket(`Unexpected disconnect for client ${socket.id}, reason: ${reason}`, 'error');
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.socket(`Error for client ${socket.id}: ${error.message}`, 'error');
  });

  // Handle reconnection attempts
  socket.on('reconnect_attempt', (attemptNumber) => {
    logger.socket(`Client ${socket.id} attempting to reconnect (attempt ${attemptNumber})`, 'warn');
  });

  // Handle transport upgrades
  socket.conn.on('upgrade', (transport) => {
    logger.socket(`Client ${socket.id} upgraded transport to ${transport.name}`, 'info');
  });

  // Handle transport errors
  socket.conn.on('error', (error) => {
    logger.socket(`Transport error for client ${socket.id}: ${error.message}`, 'error');
  });

  // Handle packet events for debugging
  socket.conn.on('packet', (packet) => {
    if (packet.type === 'ping') {
      logger.debug(`Received ping from client ${socket.id}`, { category: 'Socket.IO' });
    }
  });
});

// Export the Socket.IO instance for use in other files
export { io };

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.server(`Running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Graduation API is running');
});

export default app;