const mongoose = require('mongoose');

const skillProgressSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  experience: {
    type: Number,
    default: 0
  },
  lastPracticed: Date,
  achievements: [{
    name: String,
    unlockedAt: Date,
    description: String
  }]
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  overallLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  totalExperience: {
    type: Number,
    default: 0
  },
  skills: [skillProgressSchema],
  weeklyGoals: {
    reviewsTarget: {
      type: Number,
      default: 5
    },
    currentWeekReviews: {
      type: Number,
      default: 0
    },
    weekStartDate: {
      type: Date,
      default: Date.now
    }
  },
  monthlyStats: [{
    month: String,
    year: Number,
    reviewsCompleted: Number,
    issuesFixed: Number,
    skillPointsEarned: Number,
    averageScore: Number,
    topCategories: [String]
  }],
  learningPath: [{
    skill: String,
    currentLevel: String,
    targetLevel: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    estimatedTimeToComplete: String,
    milestones: [{
      title: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date,
      resources: [String]
    }]
  }],
  recommendations: [{
    type: {
      type: String,
      enum: ['skill', 'practice', 'resource', 'challenge']
    },
    title: String,
    description: String,
    priority: Number,
    createdAt: {
      type: Date,
      default: Date.now
    },
    dismissed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Update skill progress
progressSchema.methods.updateSkillProgress = function(skillName, experienceGained) {
  let skill = this.skills.find(s => s.skill === skillName);
  
  if (!skill) {
    skill = {
      skill: skillName,
      level: 'beginner',
      experience: 0,
      achievements: []
    };
    this.skills.push(skill);
  }
  
  skill.experience += experienceGained;
  skill.lastPracticed = new Date();
  
  // Level up logic
  const levelThresholds = {
    beginner: 0,
    intermediate: 100,
    advanced: 300,
    expert: 600
  };
  
  for (const [level, threshold] of Object.entries(levelThresholds).reverse()) {
    if (skill.experience >= threshold) {
      const oldLevel = skill.level;
      skill.level = level;
      
      // Add achievement if leveled up
      if (oldLevel !== level) {
        skill.achievements.push({
          name: `${skillName} ${level.charAt(0).toUpperCase() + level.slice(1)}`,
          unlockedAt: new Date(),
          description: `Reached ${level} level in ${skillName}`
        });
      }
      break;
    }
  }
  
  this.totalExperience += experienceGained;
};

// Update weekly goals
progressSchema.methods.updateWeeklyProgress = function() {
  const now = new Date();
  const weekStart = new Date(this.weeklyGoals.weekStartDate);
  const weeksDiff = Math.floor((now - weekStart) / (7 * 24 * 60 * 60 * 1000));
  
  if (weeksDiff >= 1) {
    // Reset weekly counter
    this.weeklyGoals.currentWeekReviews = 0;
    this.weeklyGoals.weekStartDate = now;
  }
  
  this.weeklyGoals.currentWeekReviews += 1;
};

// Add monthly stats
progressSchema.methods.addMonthlyStats = function(reviewData) {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  
  let monthlyStats = this.monthlyStats.find(m => m.month === month && m.year === year);
  
  if (!monthlyStats) {
    monthlyStats = {
      month,
      year,
      reviewsCompleted: 0,
      issuesFixed: 0,
      skillPointsEarned: 0,
      averageScore: 0,
      topCategories: []
    };
    this.monthlyStats.push(monthlyStats);
  }
  
  monthlyStats.reviewsCompleted += 1;
  monthlyStats.issuesFixed += reviewData.issuesFixed || 0;
  monthlyStats.skillPointsEarned += reviewData.pointsEarned || 0;
  
  // Update average score
  const totalReviews = monthlyStats.reviewsCompleted;
  const currentAvg = monthlyStats.averageScore || 0;
  monthlyStats.averageScore = ((currentAvg * (totalReviews - 1)) + reviewData.score) / totalReviews;
};

// Generate recommendations
progressSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  
  // Skill-based recommendations
  this.skills.forEach(skill => {
    if (skill.level === 'beginner' && skill.experience > 50) {
      recommendations.push({
        type: 'skill',
        title: `Level up your ${skill.skill} skills`,
        description: `You're close to reaching intermediate level in ${skill.skill}`,
        priority: 8
      });
    }
  });
  
  // Practice recommendations based on weak areas
  if (this.weeklyGoals.currentWeekReviews < this.weeklyGoals.reviewsTarget) {
    recommendations.push({
      type: 'practice',
      title: 'Stay on track with your weekly goal',
      description: `Complete ${this.weeklyGoals.reviewsTarget - this.weeklyGoals.currentWeekReviews} more reviews this week`,
      priority: 7
    });
  }
  
  this.recommendations = recommendations;
};

module.exports = mongoose.model('Progress', progressSchema);