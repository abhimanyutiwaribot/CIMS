import express from "express";
import { adminLogin, createAdmin, getIssues, updateIssueStatus, verifyIssue, getUsers } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
// Change this import to use the correct path
import { sendNotification } from "../services/notificationService.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/create", createAdmin);
router.get("/issues", protectRoute, getIssues);
router.patch("/issues/:id/status", protectRoute, updateIssueStatus);
router.post("/issues/:id/verify", protectRoute, verifyIssue);
router.get("/users", protectRoute, getUsers);

router.post("/test-notification/:userId", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    console.log('User found:', user); // Debug log

    if (!user || !user.expoPushToken) {
      return res.status(404).json({ 
        message: "User not found or no push token",
        userId: req.params.userId,
        hasUser: !!user,
        hasToken: !!user?.expoPushToken
      });
    }

    const testMessage = {
      title: "Test Notification",
      body: "This is a test notification from admin panel",
      data: { 
        type: "TEST", 
        screen: "Home",
        testData: "This is a test" 
      }
    };

    console.log('Sending notification with token:', user.expoPushToken);  // Debug log

    const result = await sendNotification(
      user.expoPushToken,
      testMessage.title,
      testMessage.body,
      testMessage.data
    );

    console.log('Notification result:', result);  // Debug log

    res.status(200).json({ 
      message: "Test notification sent",
      result: result 
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this new route to check user's push token
router.get("/user-token/:userId", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      hasToken: !!user.expoPushToken,
      token: user.expoPushToken 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
