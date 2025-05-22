import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import registrationRoutes from './routes/registration';
import eligibilityRoutes from './routes/eligibility';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import emailRoutes from './routes/email';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', router);
app.use('/api/registration', registrationRoutes); 
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Graduation API is running');
});