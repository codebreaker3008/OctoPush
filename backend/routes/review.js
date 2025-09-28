const express = require('express');
const CodeReview = require('../models/CodeReview');
const User = require('../models/User');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const { analyzeCode } = require('../services/codeAnalyzer');
const { generateEducationalContent } = require('../services/aiService');

const router = express.Router();

// Submit code for review
router.post('/analyze', auth, async (req, res) => {
  try {
    const { title, language, code, filename } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    // Create initial review record
    const review = new CodeReview({
      user: req.userId,
      title: title || 'Untitled Review',
      language: language.toLowerCase(),
      code,
      filename,
      status: 'processing'
    });

    await review.save();

    // Start async analysis with Maestro integration
    processCodeAnalysis(review._id, code, language, req.userId);

    res.json({
      message: 'Code analysis started',
      reviewId: review._id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ error: 'Failed to start analysis' });
  }
});

// Get review results
router.get('/results/:reviewId', auth, async (req, res) => {
  try {
    const review = await CodeReview.findOne({
      _id: req.params.reviewId,
      user: req.userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      review,
      summary: review.getSummary()
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get user's review history
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await CodeReview.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title language createdAt status metrics.overallScore issues');

    const total = await CodeReview.countDocuments({ user: req.userId });

    res.json({
      reviews: reviews.map(review => ({
        ...review.toObject(),
        summary: review.getSummary()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Mark issue as resolved
router.put('/resolve-issue/:reviewId/:issueId', auth, async (req, res) => {
  try {
    const review = await CodeReview.findOne({
      _id: req.params.reviewId,
      user: req.userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const issue = review.issues.id(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Mark issue as resolved (add resolved field)
    issue.resolved = true;
    issue.resolvedAt = new Date();
    await review.save();

    // Update user stats
    const user = await User.findById(req.userId);
    user.stats.issuesFixed += 1;
    user.stats.skillPoints += getPointsForIssue(issue);
    await user.save();

    // Update progress
    const progress = await Progress.findOne({ user: req.userId });
    if (progress) {
      progress.updateSkillProgress(issue.category, getExperienceForIssue(issue));
      await progress.save();
    }

    res.json({
      message: 'Issue marked as resolved',
      pointsEarned: getPointsForIssue(issue)
    });
  } catch (error) {
    console.error('Resolve issue error:', error);
    res.status(500).json({ error: 'Failed to resolve issue' });
  }
});

// Submit feedback for review
router.post('/feedback/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comments, helpful } = req.body;

    const review = await CodeReview.findOne({
      _id: req.params.reviewId,
      user: req.userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.feedback = {
      rating: rating || review.feedback.rating,
      comments: comments || review.feedback.comments,
      helpful: helpful !== undefined ? helpful : review.feedback.helpful
    };

    await review.save();

    res.json({
      message: 'Feedback submitted successfully',
      feedback: review.feedback
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get learning resources for specific issue
router.get('/resources/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { language, level } = req.query;

    const resources = await generateLearningResources(category, language, level);

    res.json({
      category,
      resources
    });
  } catch (error) {
    console.error('Resources fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// 🚀 UPDATED: Async function to process code analysis with Maestro
async function processCodeAnalysis(reviewId, code, language, userId) {
  try {
    const review = await CodeReview.findById(reviewId);
    if (!review) return;

    // Get user context for personalized analysis
    const user = await User.findById(userId);
    const userContext = {
      skillLevel: user?.skillLevel || 'beginner',
      focusAreas: user?.preferences?.focusAreas || ['readability'],
      primaryLanguage: user?.primaryLanguage || language
    };

    console.log('🔍 Starting code analysis with user context:', userContext);

    // 🎯 MAESTRO INTEGRATION: Enhanced code analysis
    const analysis = await analyzeCode(code, language, userContext);
    
    console.log('📊 Analysis completed:', {
      analyzedBy: analysis.analyzedBy,
      issuesFound: analysis.issues?.length || 0,
      maestroPowered: analysis.maestroPowered || false
    });
    
    // Generate educational content
    const educationalContent = await generateEducationalContent(analysis, language);

    // Update review with results (enhanced with Maestro data)
    review.issues = analysis.issues.map((issue, index) => ({
      ...issue,
      explanation: educationalContent.explanations[index] || issue.explanation,
      resources: educationalContent.resources[issue.category] || []
    }));

    review.metrics = analysis.metrics;
    review.analysis = analysis.analysis;
    review.learningPath = analysis.learningPath || educationalContent.learningPath;
    review.metrics.overallScore = review.calculateOverallScore();
    review.status = 'completed';
    review.processingTime = Date.now() - review.createdAt.getTime();

    // 🚀 MAESTRO DATA: Add Maestro-specific fields
    if (analysis.maestroPowered) {
      review.maestroPowered = true;
      review.distributedProcessing = analysis.distributedProcessing;
      review.maestroInsights = analysis.analysis?.maestroInsights || [];
      review.confidenceScore = analysis.confidenceScore;
      review.nodesUsed = analysis.distributedNodes;
      
      console.log('⚡ Maestro enhancement applied:', {
        distributedProcessing: analysis.distributedProcessing,
        nodesUsed: analysis.distributedNodes,
        processingTime: analysis.processingTime
      });
    }

    await review.save();

    // Update user stats
    if (user) {
      user.updateStats({
        issuesFixed: 0,
        pointsEarned: Math.floor(review.metrics.overallScore / 10)
      });
      
      // Award badges based on achievements
      checkAndAwardBadges(user, review);
      
      // 🏆 MAESTRO BADGE: Award special badge for Maestro-powered analysis
      if (analysis.maestroPowered && !user.badges.find(b => b.name === 'Maestro Pioneer')) {
        user.addBadge({
          name: 'Maestro Pioneer',
          description: 'Used advanced distributed computing for code analysis',
          icon: '⚡'
        });
      }
      
      await user.save();
    }

    // Update progress tracking
    const progress = await Progress.findOne({ user: review.user });
    if (progress) {
      progress.updateWeeklyProgress();
      progress.addMonthlyStats({
        issuesFixed: 0,
        pointsEarned: Math.floor(review.metrics.overallScore / 10),
        score: review.metrics.overallScore
      });
      progress.generateRecommendations();
      await progress.save();
    }

    console.log('✅ Code analysis completed successfully for review:', reviewId);

  } catch (error) {
    console.error('❌ Code analysis processing error:', error);
    await CodeReview.findByIdAndUpdate(reviewId, { 
      status: 'error',
      errorMessage: error.message 
    });
  }
}

// Helper function to calculate points for resolving an issue
function getPointsForIssue(issue) {
  const severityPoints = {
    error: 20,
    warning: 15,
    info: 10,
    suggestion: 5
  };
  return severityPoints[issue.severity] || 5;
}

// Helper function to calculate experience for resolving an issue
function getExperienceForIssue(issue) {
  const severityExp = {
    error: 15,
    warning: 10,
    info: 7,
    suggestion: 3
  };
  return severityExp[issue.severity] || 3;
}

// 🎖️ UPDATED: Helper function to check and award badges (including Maestro badges)
function checkAndAwardBadges(user, review) {
  const badges = [];

  // First review badge
  if (user.stats.totalReviews === 1) {
    badges.push({
      name: 'First Steps',
      description: 'Completed your first code review',
      icon: '🎯'
    });
  }

  // Perfect score badge
  if (review.metrics.overallScore === 100) {
    badges.push({
      name: 'Perfect Code',
      description: 'Achieved a perfect score of 100',
      icon: '⭐'
    });
  }

  // 🚀 MAESTRO BADGES: Special badges for Maestro usage
  if (review.maestroPowered) {
    // High confidence badge
    if (review.confidenceScore && review.confidenceScore > 0.9) {
      badges.push({
        name: 'AI Confidence',
        description: 'Received high-confidence analysis from Maestro AI',
        icon: '🎖️'
      });
    }

    // Distributed processing badge
    if (review.nodesUsed && review.nodesUsed > 1) {
      badges.push({
        name: 'Distributed Power',
        description: `Analysis distributed across ${review.nodesUsed} compute nodes`,
        icon: '🌐'
      });
    }
  }

  // Language specialist badge
  const languageReviews = user.stats.languageBreakdown?.[review.language] || 0;
  if (languageReviews >= 10) {
    badges.push({
      name: `${review.language.charAt(0).toUpperCase() + review.language.slice(1)} Specialist`,
      description: `Completed 10+ reviews in ${review.language}`,
      icon: '🏆'
    });
  }

  badges.forEach(badge => user.addBadge(badge));
}

// Helper function to generate learning resources
async function generateLearningResources(category, language, level) {
  const resourceMap = {
    syntax: [
      {
        title: `${language} Syntax Guide`,
        url: `https://developer.mozilla.org/docs/${language}/syntax`,
        type: 'documentation'
      }
    ],
    performance: [
      {
        title: 'Performance Best Practices',
        url: 'https://web.dev/performance',
        type: 'tutorial'
      }
    ],
    security: [
      {
        title: 'Security Guidelines',
        url: 'https://owasp.org/www-project-top-ten/',
        type: 'documentation'
      }
    ]
  };

  return resourceMap[category] || [];
}

module.exports = router;