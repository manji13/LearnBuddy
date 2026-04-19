const User = require('../../Model/User Management/UserModel.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'learnbuddy_secret_123', {
    expiresIn: '30d',
  });
};

// Setup Nodemailer transporter 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// @desc    Register a new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, campus, faculty, password, role, profileImage, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ message: 'CAPTCHA token is missing. Are you a bot?' });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    
    const captchaResponse = await axios.post(verifyUrl);

    if (!captchaResponse.data.success) {
      return res.status(400).json({ message: 'CAPTCHA verification failed. Please try again.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const assignedRole = role === 'Employee' || role === 'Admin' ? role : 'Student';

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      campus,
      faculty, // Saved to DB
      password,
      profileImage,
      role: assignedRole
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/signin
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.campus = req.body.campus || user.campus;
      user.faculty = req.body.faculty || user.faculty; 
      user.role = req.body.role || user.role; 
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/auth/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/auth/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Analytics for Charts
// @route   GET /api/auth/analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Only fetch students for the enrollment charts
    const students = await User.find({ role: 'Student' });

    const campusCounts = {};
    const facultyCounts = {};

    students.forEach(student => {
      if (student.campus) {
        campusCounts[student.campus] = (campusCounts[student.campus] || 0) + 1;
      }
      if (student.faculty) {
        facultyCounts[student.faculty] = (facultyCounts[student.faculty] || 0) + 1;
      }
    });

    const campusData = Object.keys(campusCounts).map(key => ({ name: key, count: campusCounts[key] }));
    const facultyData = Object.keys(facultyCounts).map(key => ({ name: key, count: facultyCounts[key] }));

    res.json({ campusData, facultyData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// FORGOT PASSWORD FLOW
// ==========================================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'LearnBuddy - Password Reset OTP',
      text: `Your password reset OTP is: ${otp}. It is valid for 10 minutes. Do not share this with anyone.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to your email.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};