import User from '../models/user.model.js';
import Issue from "../models/issue.model.js";

export const getProfile = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;
    console.log("Fetching profile for user ID:", userId);

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("Found user:", user);
    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching stats for user:", userId);

    // Get user's reports count
    const issues = await Issue.find({ user: userId });
    const resolved = issues.filter(issue => issue.status === 'resolved');
    const pending = issues.filter(issue => issue.status === 'pending');

    // Calculate profile completion
    const user = await User.findById(userId);
    const requiredFields = ['fullName', 'email', 'profilePic'];
    const completedFields = requiredFields.filter(field => user[field]);
    const profileCompletion = Math.round((completedFields.length / requiredFields.length) * 100);

    const stats = {
      total: issues.length,
      resolved: resolved.length,
      pending: pending.length,
      profileCompletion
    };

    console.log("User stats:", stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic } = req.body;
    const userId = req.user.id;

    // Only update the fields that were sent in the request
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (profilePic) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,  // Only updates the specified fields
      { new: true }  // Returns the updated document
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, { fcmToken });
    res.status(200).json({ message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating FCM token' });
  }
};

export const updateNotificationToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { expoPushToken },
      { new: true }
    );

    res.status(200).json({ message: 'Notification token updated' });
  } catch (error) {
    console.error('Error updating notification token:', error);
    res.status(500).json({ message: 'Error updating notification token' });
  }
};

export const updatePushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;
    
    console.log('Updating push token for user:', req.user.id); // Debug log
    console.log('New token:', expoPushToken); // Debug log

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { expoPushToken },
      { new: true }
    );

    if (!updatedUser) {
      console.log('User not found:', req.user.id); // Debug log
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Token updated successfully:', updatedUser.expoPushToken); // Debug log
    res.status(200).json({ message: 'Push token updated successfully' });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ message: 'Error updating push token' });
  }
};