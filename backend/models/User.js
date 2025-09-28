const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  primaryLanguage: {
    type: String,
    default: 'javascript'
  },
  preferences: {
    languages: [{
      type: String
    }],
    focusAreas: [{
      type: String,
      enum: ['performance', 'security', 'readability', 'maintainability', 'testing', 'best-practice']
    }],
    difficultyLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced'],
      default: 'basic'
    }
  },
  stats: {
    totalReviews: {
      type: Number,
      default: 0
    },
    issuesFixed: {
      type: Number,
      default: 0
    },
    skillPoints: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastReviewDate: Date
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: Date,
    icon: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update stats method
userSchema.methods.updateStats = function(reviewData) {
  this.stats.totalReviews += 1;
  this.stats.issuesFixed += reviewData.issuesFixed || 0;
  this.stats.skillPoints += reviewData.pointsEarned || 0;
  
  // Update streak
  const today = new Date().toDateString();
  const lastReview = this.stats.lastReviewDate ? 
    this.stats.lastReviewDate.toDateString() : null;
  
  if (lastReview === today) {
    // Same day, no streak change
  } else if (lastReview === new Date(Date.now() - 86400000).toDateString()) {
    // Yesterday, continue streak
    this.stats.currentStreak += 1;
  } else {
    // Reset streak
    this.stats.currentStreak = 1;
  }
  
  this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
  this.stats.lastReviewDate = new Date();
};

// Add badge method
userSchema.methods.addBadge = function(badgeData) {
  const existingBadge = this.badges.find(badge => badge.name === badgeData.name);
  if (!existingBadge) {
    this.badges.push({
      ...badgeData,
      earnedAt: new Date()
    });
  }
};

module.exports = mongoose.model('User', userSchema);