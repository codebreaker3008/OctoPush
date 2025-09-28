const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, skillLevel, primaryLanguage, preferences } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      skillLevel: skillLevel || 'beginner',
      primaryLanguage: primaryLanguage || 'javascript',
      preferences: preferences || {
        languages: ['javascript'],
        focusAreas: ['readability', 'best-practice'],
        difficultyLevel: 'basic'
      }
    });

    await user.save();

    // Create progress tracking for user
    const progress = new Progress({
      user: user._id,
      overallLevel: skillLevel || 'beginner'
    });
    await progress.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillLevel: user.skillLevel,
        primaryLanguage: user.primaryLanguage,
        preferences: user.preferences,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillLevel: user.skillLevel,
        primaryLanguage: user.primaryLanguage,
        preferences: user.preferences,
        stats: user.stats,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const progress = await Progress.findOne({ user: req.userId });

    res.json({
      user,
      progress
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { languages, focusAreas, difficultyLevel, skillLevel } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update preferences
    if (languages) user.preferences.languages = languages;
    if (focusAreas) user.preferences.focusAreas = focusAreas;
    if (difficultyLevel) user.preferences.difficultyLevel = difficultyLevel;
    if (skillLevel) user.skillLevel = skillLevel;

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillLevel: user.skillLevel,
        primaryLanguage: user.primaryLanguage,
        preferences: user.preferences,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Update weekly goals
router.put('/goals', auth, async (req, res) => {
  try {
    const { reviewsTarget } = req.body;

    const progress = await Progress.findOne({ user: req.userId });
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    progress.weeklyGoals.reviewsTarget = reviewsTarget;
    await progress.save();

    res.json({
      message: 'Goals updated successfully',
      weeklyGoals: progress.weeklyGoals
    });
  } catch (error) {
    console.error('Goals update error:', error);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});

// Verify token
router.get('/verify', auth, (req, res) => {
  res.json({ valid: true, userId: req.userId });
});

module.exports = router;