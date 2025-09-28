const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  line: Number,
  column: Number,
  severity: {
    type: String,
    enum: ['error', 'warning', 'info', 'suggestion'],
    required: true
  },
  category: {
    type: String,
    enum: ['syntax', 'style', 'performance', 'security', 'maintainability', 'best-practice'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  suggestedFix: {
    type: String,
    required: true
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['documentation', 'tutorial', 'article', 'video']
    }
  }],
  codeSnippet: {
    original: String,
    suggested: String
  },
  impact: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  learningObjective: String
});

const codeReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  
  filename: String,
  issues: [issueSchema],
  metrics: {
    linesOfCode: Number,
    complexity: Number,
    maintainabilityIndex: Number,
    technicalDebt: Number,
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  analysis: {
    strengths: [String],
    areasForImprovement: [String],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    nextSteps: [String]
  },
  learningPath: [{
    skill: String,
    currentLevel: String,
    targetLevel: String,
    resources: [{
      title: String,
      url: String,
      estimatedTime: String
    }],
    practiceExercises: [String]
  }],
  feedback: {
    helpful: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String
  },
  processingTime: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
    maestroPowered: {
    type: Boolean,
    default: false
  },
  distributedProcessing: {
    type: Boolean,
    default: false
  },
  maestroInsights: [{
    type: String
  }],
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1
  },
  nodesUsed: {
    type: Number,
    default: 1
  },
  errorMessage: String
}, {
  timestamps: true
});

// Index for efficient queries
codeReviewSchema.index({ user: 1, createdAt: -1 });
codeReviewSchema.index({ language: 1, createdAt: -1 });
codeReviewSchema.index({ 'metrics.overallScore': -1 });

// Calculate overall score based on issues
codeReviewSchema.methods.calculateOverallScore = function() {
  if (this.issues.length === 0) return 100;
  
  let score = 100;
  this.issues.forEach(issue => {
    switch (issue.severity) {
      case 'error':
        score -= 15;
        break;
      case 'warning':
        score -= 10;
        break;
      case 'info':
        score -= 5;
        break;
      case 'suggestion':
        score -= 2;
        break;
    }
  });
  
  return Math.max(0, score);
};

// Get summary statistics
codeReviewSchema.methods.getSummary = function() {
  const severityCounts = {
    error: 0,
    warning: 0,
    info: 0,
    suggestion: 0
  };
  
  const categoryCounts = {};
  
  this.issues.forEach(issue => {
    severityCounts[issue.severity]++;
    categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
  });
  
  return {
    totalIssues: this.issues.length,
    severityCounts,
    categoryCounts,
    overallScore: this.metrics.overallScore || this.calculateOverallScore()
  };
};

module.exports = mongoose.model('CodeReview', codeReviewSchema);