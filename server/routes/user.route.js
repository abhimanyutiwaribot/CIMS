import express from 'express';
import { getProfile, getUserStats, updateProfile, updateNotificationToken, updatePushToken } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ensure all routes are defined before export
router.get('/profile', protectRoute, getProfile);
router.get('/stats', protectRoute, getUserStats);  // Make sure this line exists
router.patch('/profile', protectRoute, updateProfile);  // Allows partial updates to user profile
router.post('/notification-token', protectRoute, updatePushToken);

export default router;
