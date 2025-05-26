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

dotenv.config();

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with your frontend's URL in production
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);
app.use('/api/registration', registrationRoutes); 
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/csv', csvRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Export the Socket.IO instance for use in other files
export { io };

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Graduation API is running');
});

export default app; 