import express from 'express';
import {
  analyzeDeadlineText,
  chatAssistant,
  getChatHistory,
  clearChatHistory
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/deadline-detection', analyzeDeadlineText);
router.post('/assistant', chatAssistant);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
