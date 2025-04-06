import bcrypt from "bcryptjs";
import Admin from "../models/admin.model.js";
import Issue from "../models/issue.model.js";
import { generateToken } from "../libs/utils.js";
import { getIO } from '../services/socketService.js';  // Add this import
import User from "../models/user.model.js";
import { sendNotification, NOTIFICATION_TYPES, createNotificationMessage } from '../services/notificationService.js';

const validateStatusProgression = (currentStatus, newStatus) => {
  const validProgressions = {
    'verified': ['in_progress'],
    'in_progress': ['resolved'],
    'resolved': [],
    'rejected': []
  };

  return validProgressions[currentStatus]?.includes(newStatus) || false;
};

const validateStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'pending_verification': ['verified', 'rejected'],
    'verified': ['in_progress'],
    'in_progress': ['resolved'],
    'resolved': [], // No further transitions allowed
    'rejected': []  // No further transitions allowed
  };

  // If current status is a final state, don't allow transitions
  if (currentStatus === 'resolved' || currentStatus === 'rejected') {
    return false;
  }

  return validTransitions[currentStatus]?.includes(newStatus);
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token without passing res
    const token = generateToken(admin._id);
    res.status(200).json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      token
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      id: admin._id,
      name: admin.name,
      email: admin.email
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email')
      .select('title description priority status location createdAt user imageUrl');

    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Error fetching issues' });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const issue = await Issue.findById(id)
      .populate('user', 'fullName email expoPushToken');
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if status transition is valid
    if (!validateStatusTransition(issue.status, status)) {
      return res.status(400).json({ 
        message: `Cannot update status from ${issue.status} to ${status}` 
      });
    }

    // Add the update to updates array
    issue.updates.push({
      message: notes || `Status updated to ${status}`,
      status: status,
      updatedBy: req.user.id,
      date: new Date()
    });

    // Update the status
    issue.status = status;
    const updatedIssue = await issue.save();
    await updatedIssue.populate('updates.updatedBy', 'name');

    // Send notification to user
    if (updatedIssue.user.expoPushToken) {
      const notificationMessage = createNotificationMessage(
        NOTIFICATION_TYPES.STATUS_UPDATE,
        updatedIssue
      );
      
      console.log('Sending status notification to:', updatedIssue.user.expoPushToken);
      
      const result = await sendNotification(
        updatedIssue.user.expoPushToken,
        notificationMessage.title,
        notificationMessage.body,
        notificationMessage.data
      );
      
      console.log('Notification result:', result);
    }

    const io = getIO();
    io.emit('issueUpdate', {
      type: 'STATUS_UPDATE',
      issue: updatedIssue
    });

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ message: 'Error updating issue' });
  }
};

export const verifyIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, verificationNotes } = req.body;

    const issue = await Issue.findById(id)
      .populate('user', 'fullName email expoPushToken'); // Make sure we populate expoPushToken
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.isVerified = isVerified;
    issue.verificationNotes = verificationNotes;
    issue.status = isVerified ? 'verified' : 'rejected';

    // Add verification update
    issue.updates.push({
      message: verificationNotes,
      status: isVerified ? 'verified' : 'rejected',
      updatedBy: req.user.id,
      date: new Date()
    });

    const updatedIssue = await issue.save();
    await updatedIssue.populate('updates.updatedBy', 'name');

    // Send notification to user based on verification status
    if (updatedIssue.user.expoPushToken) {
      const notificationType = isVerified ? 
        NOTIFICATION_TYPES.ISSUE_VERIFIED : 
        NOTIFICATION_TYPES.ISSUE_REJECTED;
      
      const notificationMessage = createNotificationMessage(
        notificationType,
        updatedIssue
      );

      console.log('Sending verification notification:', {
        token: updatedIssue.user.expoPushToken,
        type: notificationType
      });

      await sendNotification(
        updatedIssue.user.expoPushToken,
        notificationMessage.title,
        notificationMessage.body,
        notificationMessage.data
      );
    }

    // Emit socket event
    const io = getIO();
    io.emit('issueUpdate', {
      type: isVerified ? 'ISSUE_VERIFIED' : 'ISSUE_REJECTED',
      issue: updatedIssue
    });

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error verifying issue:', error);
    res.status(500).json({ message: 'Error verifying issue' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'issues',
          localField: '_id',
          foreignField: 'user',
          as: 'reports'
        }
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          profilePic: 1,
          createdAt: 1,
          isActive: 1,
          reportCount: { $size: '$reports' }
        }
      }
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.title = title;
    issue.description = description;

    const updatedIssue = await issue.save();
    await updatedIssue.populate('user', 'fullName email');

    // Emit socket event
    const io = getIO();
    io.emit('issueUpdate', {
      type: 'ISSUE_EDIT',
      issue: updatedIssue
    });

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ message: 'Error updating issue' });
  }
};
