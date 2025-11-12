import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { sendOTPEmail } from "../lib/email.js";
import crypto from "crypto";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
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
  
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
      });
  
      if (newUser) {
        // generate jwt token here
        generateToken(newUser._id, res);
        await newUser.save();
  
        res.status(201).json({
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
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
  
      generateToken(user._id, res);
  
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } catch (error) {
      console.log("Error in login controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  export const logout = (req, res) => {
    try {
      res.cookie("jwt", "", { maxAge: 0 });  //jwt =cookie naame, ""=clearout string,max=0:expire immediately
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.log("Error in logout controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  export const updateProfile = async (req, res) => {
    try {
      const { profilePic, bio, status, privacy } = req.body;
      const userId = req.user._id;
  
      const updateData = {};
      
      if (profilePic) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "chat_app_profiles",
          resource_type: "auto"
        });
        updateData.profilePic = uploadResponse.secure_url;
      }
      
      if (bio !== undefined) updateData.bio = bio;
      if (status !== undefined) updateData.status = status;
      if (privacy) updateData.privacy = privacy;
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select("-password");
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error in update profile:", error.message);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };

  export const blockUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;

      const user = await User.findById(currentUserId);
      if (user.blockedUsers.includes(userId)) {
        return res.status(400).json({ message: "User already blocked" });
      }

      user.blockedUsers.push(userId);
      await user.save();

      res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
      console.error("Error in blockUser:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  export const unblockUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;

      const user = await User.findById(currentUserId);
      user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
      await user.save();

      res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
      console.error("Error in unblockUser:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  export const checkAuth = (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.log("Error in checkAuth controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.resetPasswordOTP = otp;
      user.resetPasswordExpires = otpExpires;
      await user.save();

      await sendOTPEmail(email, otp);

      res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      console.log("Error in forgotPassword controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  export const resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      const user = await User.findOne({ 
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.log("Error in resetPassword controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };