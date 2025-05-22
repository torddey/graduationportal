import { Router } from 'express';
import db from '../db'; 

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add more routes here

export default router;