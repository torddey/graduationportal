import { Router } from 'express';
import db from '../db/db'; 
import { Server } from 'socket.io';
import http from 'http';
import app from '../app'; 

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with frontend's URL in production
  },
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Export the server and Socket.IO instance
export { server, io };

export default router;