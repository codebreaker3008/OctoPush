const express = require('express');
const CodeReview = require('../models/CodeReview');
const User = require('../models/User');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const progress = await Progress.findOne({ user: req.userId });
    
    if (!user || !progress) {
      return res.status(404).json({ error: 'User data not found' });
    }

    // Get recent reviews for trends
    const recentReviews = await CodeReview.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('metrics.overallScore createdAt language issues');

    // Calculate trends
    const scoreHistory = recentReviews.map(review => ({
      date: review.createdAt,
      score: review.metrics.overallScore,
      language: review.language
    })).reverse();

    // Language distribution
    const languageStats = {};
    recentReviews.forEach(review => {
      languageStats[review.language] = (languageStats[review.language] || 0) + 1;
    });

    // Issue category breakdown
    const categoryStats = {};
    recentReviews.forEach(review => {
      review.issues.forEach(issue => {
        categoryStats[issue.category] = (categoryStats[issue.category] || 0) + 1;
      });
    });

    // Weekly progress
    const weeklyProgress = calculateWeeklyProgress(recentReviews);

    res.json({
      user: {
        name: user.name,
        skillLevel: user.skillLevel,
        stats: user.stats,
        badges: user.badges.slice(-5) // Recent badges
      },
      progress: {
        overallLevel: progress.overallLevel,
        totalExperience: progress.totalExperience,
        weeklyGoals: progress.weeklyGoals,
        skills: progress.skills.slice(0, 5) // Top skills
      },
      analytics: {
        scoreHistory,
        languageStats,
        categoryStats,
        weeklyProgress,
        trends: calculateTrends(scoreHistory)
      },
      recommendations: progress.recommendations.slice(0, 3)
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get detailed progress analytics
router.get('/progress', auth, async (req, res) => {
  try {
    const { timeframe = '30d', skill } = req.query;
    const progress = await Progress.findOne({ user: req.userId });

    if (!progress) {
      return res.status(404).json({ error: 'Progress data not found' });
    }

    // Get reviews within timeframe
    const startDate = getStartDate(timeframe);
    const reviews = await CodeReview.find({
      user: req.userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Skill-specific analytics
    let skillProgress = null;
    if (skill) {
      skillProgress = progress.skills.find(s => s.skill === skill);
    }

    // Calculate improvement metrics
    const improvementMetrics = calculateImprovementMetrics(reviews);

    res.json({
      timeframe,
      skillProgress,
      improvementMetrics,
      monthlyStats: progress.monthlyStats.slice(-6), // Last 6 months
      learningPath: progress.learningPath,
      achievements: getAllAchievements(progress),
      recommendations: progress.recommendations
    });
  } catch (error) {
    console.error('Progress analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
});

// Get comparative analytics
router.get('/compare', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Get anonymized comparative data
    const userLevel = user.skillLevel;
    const comparativeData = await getComparativeData(userLevel, user.primaryLanguage);

    res.json({
      userLevel,
      userStats: {
        averageScore: await calculateUserAverageScore(req.userId),
        totalReviews: user.stats.totalReviews,
        issuesFixed: user.stats.issuesFixed,
        skillPoints: user.stats.skillPoints
      },
      comparative: comparativeData,
      percentiles: await calculatePercentiles(req.userId, userLevel)
    });
  } catch (error) {
    console.error('Comparative analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch comparative data' });
  }
});

// Get learning insights
router.get('/insights', auth, async (req, res) => {
  try {
    const reviews = await CodeReview.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    const insights = {
      strengths: identifyStrengths(reviews),
      weaknesses: identifyWeaknesses(reviews),
      patterns: identifyPatterns(reviews),
      suggestions: generateSuggestions(reviews)
    };

    res.json({ insights });
  } catch (error) {
    console.error('Learning insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Helper functions
function calculateWeeklyProgress(reviews) {
  const weeklyData = {};
  const now = new Date();
  
  // Initialize last 4 weeks
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekKey = `Week ${4-i}`;
    weeklyData[weekKey] = {
      reviews: 0,
      averageScore: 0,
      totalScore: 0
    };
  }

  reviews.forEach(review => {
    const reviewDate = new Date(review.createdAt);
    const weeksDiff = Math.floor((now - reviewDate) / (7 * 24 * 60 * 60 * 1000));
    
    if (weeksDiff < 4) {
      const weekKey = `Week ${4-weeksDiff}`;
      if (weeklyData[weekKey]) {
        weeklyData[weekKey].reviews += 1;
        weeklyData[weekKey].totalScore += review.metrics.overallScore;
        weeklyData[weekKey].averageScore = 
          weeklyData[weekKey].totalScore / weeklyData[weekKey].reviews;
      }
    }
  });

  return weeklyData;
}

function calculateTrends(scoreHistory) {
  if (scoreHistory.length < 2) return null;

  const recentScores = scoreHistory.slice(-5);
  const earlierScores = scoreHistory.slice(-10, -5);

  const recentAvg = recentScores.reduce((sum, item) => sum + item.score, 0) / recentScores.length;
  const earlierAvg = earlierScores.length > 0 
    ? earlierScores.reduce((sum, item) => sum + item.score, 0) / earlierScores.length
    : recentAvg;

  const trend = recentAvg - earlierAvg;

  return {
    direction: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable',
    change: Math.abs(trend).toFixed(1),
    confidence: Math.min(100, scoreHistory.length * 10)
  };
}

function getStartDate(timeframe) {
  const now = new Date();
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function calculateImprovementMetrics(reviews) {
  if (reviews.length < 2) return null;

  const firstHalf = reviews.slice(0, Math.floor(reviews.length / 2));
  const secondHalf = reviews.slice(Math.floor(reviews.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.metrics.overallScore, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.metrics.overallScore, 0) / secondHalf.length;

  return {
    improvement: secondHalfAvg - firstHalfAvg,
    firstPeriodAverage: firstHalfAvg.toFixed(1),
    secondPeriodAverage: secondHalfAvg.toFixed(1),
    totalReviews: reviews.length
  };
}

async function getComparativeData(userLevel, primaryLanguage) {
  const aggregation = await CodeReview.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $match: {
        'userInfo.skillLevel': userLevel,
        'userInfo.primaryLanguage': primaryLanguage
      }
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$metrics.overallScore' },
        totalReviews: { $sum: 1 },
        averageIssues: { $avg: { $size: '$issues' } }
      }
    }
  ]);

  return aggregation[0] || {
    averageScore: 75,
    totalReviews: 100,
    averageIssues: 5
  };
}

async function calculateUserAverageScore(userId) {
  const result = await CodeReview.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, averageScore: { $avg: '$metrics.overallScore' } } }
  ]);

  return result[0]?.averageScore || 0;
}

async function calculatePercentiles(userId, userLevel) {
  const userAvg = await calculateUserAverageScore(userId);
  
  // Simplified percentile calculation
  const allScores = await CodeReview.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $match: {
        'userInfo.skillLevel': userLevel
      }
    },
    {
      $group: {
        _id: '$user',
        averageScore: { $avg: '$metrics.overallScore' }
      }
    },
    {
      $sort: { averageScore: 1 }
    }
  ]);

  const userPosition = allScores.findIndex(u => u.averageScore >= userAvg);
  const percentile = userPosition >= 0 ? Math.floor((userPosition / allScores.length) * 100) : 50;

  return {
    overall: percentile,
    skillLevel: percentile
  };
}

function identifyStrengths(reviews) {
  const categoryScores = {};
  
  reviews.forEach(review => {
    review.issues.forEach(issue => {
      if (!categoryScores[issue.category]) {
        categoryScores[issue.category] = { total: 0, count: 0 };
      }
      categoryScores[issue.category].total += issue.severity === 'error' ? 0 : 
                                            issue.severity === 'warning' ? 1 : 2;
      categoryScores[issue.category].count += 1;
    });
  });

  const strengths = Object.entries(categoryScores)
    .map(([category, data]) => ({
      category,
      score: data.total / data.count
    }))
    .filter(item => item.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return strengths;
}

function identifyWeaknesses(reviews) {
  const categoryIssues = {};
  
  reviews.forEach(review => {
    review.issues.forEach(issue => {
      categoryIssues[issue.category] = (categoryIssues[issue.category] || 0) + 1;
    });
  });

  const weaknesses = Object.entries(categoryIssues)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return weaknesses;
}

function identifyPatterns(reviews) {
  // Identify recurring patterns in code issues
  const patterns = [];
  
  // Check for consistent improvement over time
  if (reviews.length >= 5) {
    const recentScores = reviews.slice(0, 3).map(r => r.metrics.overallScore);
    const olderScores = reviews.slice(-3).map(r => r.metrics.overallScore);
    
    const recentAvg = recentScores.reduce((a, b) => a + b) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b) / olderScores.length;
    
    if (recentAvg > olderAvg + 10) {
      patterns.push({
        type: 'improvement',
        description: 'Consistent improvement in code quality over time',
        confidence: 'high'
      });
    }
  }

  return patterns;
}

function generateSuggestions(reviews) {
  const suggestions = [];
  
  // Analyze most common issues
  const commonIssues = {};
  reviews.forEach(review => {
    review.issues.forEach(issue => {
      commonIssues[issue.category] = (commonIssues[issue.category] || 0) + 1;
    });
  });

  const topIssue = Object.entries(commonIssues)
    .sort(([,a], [,b]) => b - a)[0];

  if (topIssue) {
    suggestions.push({
      type: 'focus_area',
      title: `Focus on ${topIssue[0]} improvements`,
      description: `This is your most common issue category with ${topIssue[1]} occurrences`,
      priority: 'high'
    });
  }

  return suggestions;
}

function getAllAchievements(progress) {
  const achievements = [];
  
  progress.skills.forEach(skill => {
    achievements.push(...skill.achievements);
  });

  return achievements.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
}

module.exports = router;