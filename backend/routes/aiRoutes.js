import express from 'express';
import { generateAIInsights } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, generateAIInsights);

export default router;
