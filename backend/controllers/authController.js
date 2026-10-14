import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

const generateToken = (id, name, email) => {
  const secret = process.env.JWT_SECRET || 'returnguard_super_secret_jwt_key_2026';
  return jwt.sign({ id, name, email }, secret, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    let existingUser;
    if (isDBConnected()) {
      try {
        existingUser = await User.findOne({ email: cleanEmail });
      } catch (e) {
        existingUser = await memoryStore.findUserByEmail(cleanEmail);
      }
    } else {
      existingUser = await memoryStore.findUserByEmail(cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (isDBConnected()) {
      try {
        user = await User.create({
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword
        });
      } catch (e) {
        user = await memoryStore.createUser({
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword
        });
      }
    } else {
      user = await memoryStore.createUser({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword
      });
    }

    const token = generateToken(user._id, user.name, user.email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user;
    if (isDBConnected()) {
      try {
        user = await User.findOne({ email: cleanEmail });
      } catch (e) {
        user = await memoryStore.findUserByEmail(cleanEmail);
      }
    } else {
      user = await memoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.name, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let user;
    if (isDBConnected()) {
      try {
        user = await User.findById(req.user.id).select('-password');
      } catch (e) {
        user = await memoryStore.findUserById(req.user.id);
      }
    } else {
      user = await memoryStore.findUserById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    let user;
    if (isDBConnected()) {
      try {
        user = await User.findByIdAndUpdate(
          req.user.id,
          { name: name.trim() },
          { new: true }
        ).select('-password');
      } catch (e) {
        user = await memoryStore.updateUser(req.user.id, { name: name.trim() });
      }
    } else {
      user = await memoryStore.updateUser(req.user.id, { name: name.trim() });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};
