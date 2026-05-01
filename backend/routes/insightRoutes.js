import express from 'express';
import { getInsights, generateAIInsights } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInsights);
router.get('/ai', protect, generateAIInsights);

export default router;
