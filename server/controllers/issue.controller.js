import Issue from "../models/issue.model.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import { analyzeIssue } from '../services/aiService.js';
// import { io } from '../server.js';
import { getIO } from '../services/socketService.js';

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file'); // Ensure single file upload

// Report Issue Controller
export const reportIssue = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      latitude, 
      longitude, 
      imageUrl
    } = req.body;
    console.log("Request body:", req.body);
    console.log("User from request:", req.user);

    // Check if user exists in request (should be set by auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!title || !description || !priority || !latitude || !longitude) {
      return res.status(400).json({ 
        message: "Please provide all required fields" 
      });
    }

    // Get AI analysis for both text and image
    let aiAnalysisResult = null;
    try {
      aiAnalysisResult = await analyzeIssue({ title, description });
    } catch (aiError) {
      console.error('AI Analysis failed:', aiError);
      // Continue without AI analysis if it fails
    }

    const newIssue = new Issue({
      user: req.user.id,  // Get user ID from auth middleware
      title,
      description,
      priority,
      imageUrl: imageUrl || null,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      aiAnalysis: aiAnalysisResult ? {
        incidentType: aiAnalysisResult.issue_type,
        confidence: aiAnalysisResult.confidence,
        textAnalysis: {
          issueType: aiAnalysisResult.issue_type,
          severity: aiAnalysisResult.severity,
          confidence: aiAnalysisResult.confidence
        }
      } : null
    });

    console.log("Creating issue:", newIssue);
    const savedIssue = await newIssue.save();
    
    // Emit socket event with populated user data
    const populatedIssue = await Issue.findById(savedIssue._id)
      .populate('user', 'fullName');
    
    const io = getIO();
    io.emit('issueUpdate', {
      type: 'NEW_ISSUE',
      issue: populatedIssue
    });

    res.status(201).json(savedIssue);
    
  } catch (error) {
    console.error('Error in reportIssue:', error);
    res.status(400).json({ 
      message: "Error creating issue", 
      error: error.message 
    });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching reports for user:", userId);

    const reports = await Issue.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('title description priority imageUrl location createdAt status updates')
      .populate('updates.updatedBy', 'name');  // Populate the admin name for updates

    console.log("Found reports:", reports.length);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

export const getIssueDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching issue with ID:', id); // Debug log

    const issue = await Issue.findById(id)
      .populate('user', 'fullName profilePic')
      .populate('updates.updatedBy', 'name');  // Populate admin name for updates

    if (!issue) {
      console.log('Issue not found'); // Debug log
      return res.status(404).json({ message: "Issue not found" });
    }

    console.log('Found issue:', issue); // Debug log
    res.status(200).json(issue);
  } catch (error) {
    console.error("Error fetching issue details:", error);
    res.status(500).json({ message: "Error fetching issue details" });
  }
};

export const getNearbyIssues = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query; // radius in kilometers

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // convert to meters
        }
      }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'fullName')
    .select('title description status priority location createdAt imageUrl');

    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching nearby issues:', error);
    res.status(500).json({ message: 'Error fetching nearby issues' });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'fullName');

    const io = getIO();
    io.emit('issueUpdate', {
      type: 'STATUS_UPDATE',
      issue: updatedIssue
    });

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ message: 'Error updating issue status' });
  }
};