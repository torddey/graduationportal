import { Router } from 'express';
import db from '../db/db';
import { io } from '../app';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;