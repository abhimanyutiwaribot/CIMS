import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";
import User from '../models/user.model.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register Route
export const signup = async (req, res) => {
  const { fullName, email, password, profileImage } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePicUrl = "";

    if(req.file){
      const uploadResponse = await cloudinary.uploader.upload_stream(
        { folder: "profile_pictures" },
        (error, result) => {
          if (error){
            console.log("Cloudinary upload error:", error);
            return res.status(500).json({
              message: "Image upload failed"
            });
          }
          profilePicUrl = result.secure_url;
        }
      );
      uploadResponse.end(req.file.buffer);
    }

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      profilePic: profileImage,
    });

    if (newUser) {
      // generate jwt token here
      const token = generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      token,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic ,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    // No need to validate token here since protectRoute middleware already does that
    // Just send success response
    res.status(200).json({ message: "Logged out successfully" });
    console.log("logout successfully")
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};