const axios = require('axios');

// AI-powered educational content generation
async function generateEducationalContent(analysis, language) {
  try {
    // For demo purposes, we'll use mock data
    // In production, integrate with OpenAI GPT-4 or similar
    
    const educationalContent = {
      explanations: {},
      resources: {},
      learningPath: []
    };

    // Generate explanations for each issue
    analysis.issues.forEach((issue, index) => {
      educationalContent.explanations[index] = generateDetailedExplanation(issue, language);
    });

    // Generate learning resources by category
    const categories = [...new Set(analysis.issues.map(issue => issue.category))];
    categories.forEach(category => {
      educationalContent.resources[category] = generateLearningResources(category, language);
    });

    // Generate personalized learning path
    educationalContent.learningPath = generateLearningPath(analysis, language);

    return educationalContent;
  } catch (error) {
    console.error('AI service error:', error);
    return {
      explanations: {},
      resources: {},
      learningPath: []
    };
  }
}

// Generate detailed explanations for issues
function generateDetailedExplanation(issue, language) {
  const explanationTemplates = {
    syntax: {
      javascript: {
        title: "Understanding JavaScript Syntax",
        content: `This syntax error occurs because JavaScript has specific rules for how code should be written. ${issue.description} 
        
**Why this matters:**
- Syntax errors prevent your code from running at all
- Modern development tools can catch these early
- Consistent syntax makes code more readable

**Learning approach:**
1. Use a code editor with syntax highlighting
2. Practice writing small code snippets
3. Read the error messages carefully - they often tell you exactly what's wrong

**Related concepts to explore:**
- JavaScript language fundamentals
- Code editor features and extensions
- Debugging techniques`
      },
      python: {
        title: "Python Syntax Fundamentals",
        content: `Python syntax errors are usually related to indentation, missing colons, or incorrect statement structure. ${issue.description}

**Key Python syntax rules:**
- Indentation matters! Use 4 spaces consistently
- Colons (:) are required after if, for, while, def, class statements
- Matching parentheses, brackets, and quotes

**Practice exercises:**
1. Write simple if-else statements
2. Create basic functions with proper indentation
3. Practice using Python's interactive shell`
      }
    },
    style: {
      javascript: {
        title: "JavaScript Code Style Best Practices",
        content: `Code style isn't just about looking pretty - it makes your code more maintainable and readable by other developers. ${issue.description}

**Why consistent style matters:**
- Reduces cognitive load when reading code
- Makes team collaboration easier
- Helps catch potential bugs early
- Shows professionalism in your code

**Industry standards:**
- Use semicolons consistently
- Choose between single or double quotes and stick with it  
- Use meaningful variable names
- Keep indentation consistent (2 or 4 spaces)

**Tools to help:**
- ESLint for automatic style checking
- Prettier for automatic formatting
- VS Code extensions for real-time feedback`
      }
    },
    performance: {
      javascript: {
        title: "JavaScript Performance Optimization",
        content: `Performance issues can make your application slow and provide poor user experience. ${issue.description}

**Common performance problems:**
- Unnecessary loops and iterations
- Memory leaks from unclosed resources
- DOM manipulations in loops
- Large bundle sizes

**Optimization strategies:**
1. Use efficient algorithms and data structures
2. Minimize DOM manipulation
3. Implement lazy loading
4. Use browser developer tools to profile performance

**Next steps:**
- Learn about Big O notation
- Study browser rendering process
- Practice with performance measurement tools`
      }
    },
    security: {
      general: {
        title: "Security Considerations in Code",
        content: `Security vulnerabilities can expose your application to attacks. ${issue.description}

**Common security issues:**
- Input validation failures
- Cross-site scripting (XSS)
- SQL injection vulnerabilities
- Insecure data storage

**Security best practices:**
1. Always validate and sanitize user input
2. Use parameterized queries for databases
3. Implement proper authentication and authorization
4. Keep dependencies up to date

**Learning resources:**
- OWASP Top 10 security risks
- Secure coding practices for your language
- Security testing methodologies`
      }
    }
  };

  const categoryTemplate = explanationTemplates[issue.category];
  if (categoryTemplate) {
    const languageTemplate = categoryTemplate[language] || categoryTemplate.general || categoryTemplate[Object.keys(categoryTemplate)[0]];
    return languageTemplate.content;
  }

  return `This ${issue.severity} issue is related to ${issue.category}. ${issue.description} 

Focus on understanding why this issue occurs and how to prevent it in future code. Practice writing similar code structures and pay attention to the patterns that work well.`;
}

// Generate learning resources by category
function generateLearningResources(category, language) {
  const resourceDatabase = {
    syntax: {
      javascript: [
        {
          title: "MDN JavaScript Guide",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
          type: "documentation",
          estimatedTime: "2-4 hours"
        },
        {
          title: "JavaScript.info - Language Basics",
          url: "https://javascript.info/first-steps",
          type: "tutorial",
          estimatedTime: "3-5 hours"
        },
        {
          title: "Syntax Error Debugging",
          url: "https://www.youtube.com/watch?v=DuWc6HFRhis",
          type: "video",
          estimatedTime: "30 minutes"
        }
      ],
      python: [
        {
          title: "Python.org Tutorial",
          url: "https://docs.python.org/3/tutorial/",
          type: "documentation",
          estimatedTime: "3-6 hours"
        },
        {
          title: "Python Syntax Cheat Sheet",
          url: "https://www.pythoncheatsheet.org/",
          type: "article",
          estimatedTime: "1 hour"
        }
      ]
    },
    style: {
      javascript: [
        {
          title: "Airbnb JavaScript Style Guide",
          url: "https://github.com/airbnb/javascript",
          type: "documentation",
          estimatedTime: "1-2 hours"
        },
        {
          title: "Prettier - Code Formatter",
          url: "https://prettier.io/docs/en/index.html",
          type: "tutorial",
          estimatedTime: "30 minutes"
        },
        {
          title: "ESLint Getting Started",
          url: "https://eslint.org/docs/user-guide/getting-started",
          type: "tutorial",
          estimatedTime: "45 minutes"
        }
      ],
      python: [
        {
          title: "PEP 8 - Style Guide for Python Code",
          url: "https://pep8.org/",
          type: "documentation",
          estimatedTime: "1 hour"
        },
        {
          title: "Black - Python Code Formatter",
          url: "https://black.readthedocs.io/en/stable/",
          type: "tutorial",
          estimatedTime: "30 minutes"
        }
      ]
    },
    performance: [
      {
        title: "Web Performance Optimization",
        url: "https://developers.google.com/web/fundamentals/performance",
        type: "tutorial",
        estimatedTime: "2-4 hours"
      },
      {
        title: "JavaScript Performance Tips",
        url: "https://www.w3schools.com/js/js_performance.asp",
        type: "article",
        estimatedTime: "45 minutes"
      },
      {
        title: "Chrome DevTools Performance",
        url: "https://developers.google.com/web/tools/chrome-devtools/evaluate-performance",
        type: "tutorial",
        estimatedTime: "1 hour"
      }
    ],
    security: [
      {
        title: "OWASP Top 10",
        url: "https://owasp.org/www-project-top-ten/",
        type: "documentation",
        estimatedTime: "2-3 hours"
      },
      {
        title: "Secure Coding Practices",
        url: "https://wiki.owasp.org/index.php/Secure_Coding_Practices_Checklist",
        type: "article",
        estimatedTime: "1-2 hours"
      }
    ],
    maintainability: [
      {
        title: "Clean Code Principles",
        url: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html",
        type: "article",
        estimatedTime: "1 hour"
      },
      {
        title: "Refactoring Techniques",
        url: "https://refactoring.guru/refactoring/techniques",
        type: "tutorial",
        estimatedTime: "2-3 hours"
      }
    ]
  };

  const categoryResources = resourceDatabase[category];
  if (!categoryResources) return [];

  if (typeof categoryResources === 'object' && categoryResources[language]) {
    return categoryResources[language];
  } else if (Array.isArray(categoryResources)) {
    return categoryResources;
  }

  return [];
}

// Generate personalized learning path
function generateLearningPath(analysis, language) {
  const learningPath = [];
  
  // Analyze the most common issue categories
  const categoryCount = {};
  analysis.issues.forEach(issue => {
    categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
  });

  // Sort categories by frequency
  const sortedCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3); // Top 3 categories

  sortedCategories.forEach(([category, count], index) => {
    const priority = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
    const skillLevel = determineSkillLevel(category, analysis.issues.filter(i => i.category === category));
    
    learningPath.push({
      skill: category,
      currentLevel: skillLevel.current,
      targetLevel: skillLevel.target,
      priority,
      estimatedTimeToComplete: getEstimatedTime(category, skillLevel.current, skillLevel.target),
      milestones: generateMilestones(category, language),
      description: getCategoryDescription(category),
      issueCount: count
    });
  });

  // Add general programming skills if needed
  if (analysis.metrics.complexity > 10) {
    learningPath.push({
      skill: 'code-organization',
      currentLevel: 'beginner',
      targetLevel: 'intermediate',
      priority: 'medium',
      estimatedTimeToComplete: '2-3 weeks',
      milestones: [
        {
          title: 'Learn about functions and modularity',
          completed: false,
          resources: ['https://javascript.info/function-basics']
        },
        {
          title: 'Practice refactoring complex code',
          completed: false,
          resources: ['https://refactoring.guru/refactoring']
        }
      ],
      description: 'Breaking down complex code into manageable pieces',
      issueCount: 1
    });
  }

  return learningPath;
}

// Helper functions
function determineSkillLevel(category, issues) {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  
  if (errorCount > 2) {
    return { current: 'beginner', target: 'intermediate' };
  } else if (warningCount > 3) {
    return { current: 'intermediate', target: 'advanced' };
  } else {
    return { current: 'advanced', target: 'expert' };
  }
}

function getEstimatedTime(category, currentLevel, targetLevel) {
  const timeMap = {
    'beginner-intermediate': {
      syntax: '1-2 weeks',
      style: '3-5 days',
      performance: '2-3 weeks',
      security: '3-4 weeks',
      maintainability: '2-3 weeks'
    },
    'intermediate-advanced': {
      syntax: '1 week',
      style: '1-2 weeks',
      performance: '3-4 weeks',
      security: '4-6 weeks',
      maintainability: '3-4 weeks'
    },
    'advanced-expert': {
      syntax: '3-5 days',
      style: '1 week',
      performance: '4-6 weeks',
      security: '6-8 weeks',
      maintainability: '4-6 weeks'
    }
  };

  const levelKey = `${currentLevel}-${targetLevel}`;
  return timeMap[levelKey]?.[category] || '2-3 weeks';
}

function generateMilestones(category, language) {
  const milestoneMap = {
    syntax: [
      {
        title: 'Master basic syntax rules',
        completed: false,
        resources: [`https://developer.mozilla.org/docs/${language}/syntax`]
      },
      {
        title: 'Practice error identification',
        completed: false,
        resources: ['https://javascript.info/debugging-chrome']
      },
      {
        title: 'Use development tools effectively',
        completed: false,
        resources: ['https://developers.google.com/web/tools/chrome-devtools']
      }
    ],
    style: [
      {
        title: 'Learn style guide standards',
        completed: false,
        resources: ['https://github.com/airbnb/javascript']
      },
      {
        title: 'Set up automatic formatting',
        completed: false,
        resources: ['https://prettier.io/docs/en/install.html']
      },
      {
        title: 'Configure linting tools',
        completed: false,
        resources: ['https://eslint.org/docs/user-guide/getting-started']
      }
    ],
    performance: [
      {
        title: 'Understand performance metrics',
        completed: false,
        resources: ['https://web.dev/performance-scoring/']
      },
      {
        title: 'Learn optimization techniques',
        completed: false,
        resources: ['https://developers.google.com/web/fundamentals/performance']
      },
      {
        title: 'Practice performance testing',
        completed: false,
        resources: ['https://developers.google.com/web/tools/lighthouse']
      }
    ],
    security: [
      {
        title: 'Study common vulnerabilities',
        completed: false,
        resources: ['https://owasp.org/www-project-top-ten/']
      },
      {
        title: 'Learn secure coding practices',
        completed: false,
        resources: ['https://wiki.owasp.org/index.php/Secure_Coding_Practices_Checklist']
      },
      {
        title: 'Implement security testing',
        completed: false,
        resources: ['https://owasp.org/www-project-zap/']
      }
    ],
    maintainability: [
      {
        title: 'Study clean code principles',
        completed: false,
        resources: ['https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html']
      },
      {
        title: 'Practice refactoring techniques',
        completed: false,
        resources: ['https://refactoring.guru/refactoring/techniques']
      },
      {
        title: 'Learn design patterns',
        completed: false,
        resources: ['https://refactoring.guru/design-patterns']
      }
    ]
  };

  return milestoneMap[category] || [];
}

function getCategoryDescription(category) {
  const descriptions = {
    syntax: 'Understanding and writing correct code structure',
    style: 'Following consistent coding conventions and formatting',
    performance: 'Writing efficient code that runs fast and uses resources wisely',
    security: 'Protecting applications from vulnerabilities and attacks',
    maintainability: 'Writing code that is easy to read, modify, and extend',
    'best-practice': 'Following industry standards and proven methodologies'
  };

  return descriptions[category] || 'Improving general programming skills';
}

// Mock OpenAI integration (replace with actual API call in production)
async function callOpenAIAPI(prompt, maxTokens = 500) {
  // In production, replace this with actual OpenAI API call
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }
  
  // Fallback mock response
  return "This is a mock AI response. In production, this would be generated by GPT-4 based on the code analysis.";
}

// Generate AI-powered code suggestions
async function generateCodeSuggestions(issue, code, language) {
  const prompt = `As a senior developer, provide specific suggestions for fixing this ${language} code issue:

Issue: ${issue.title}
Description: ${issue.description}
Code snippet: ${issue.codeSnippet.original}

Please provide:
1. A clear explanation of why this is problematic
2. Step-by-step fix instructions
3. An improved code example
4. Best practices to prevent this in the future

Keep the response educational and beginner-friendly.`;

  const aiResponse = await callOpenAIAPI(prompt);
  
  return aiResponse || `To fix this ${issue.category} issue: ${issue.suggestedFix}. 

This is important because it affects code ${issue.impact === 'high' ? 'significantly' : 'moderately'}. 

Practice writing similar code patterns and pay attention to ${language} best practices to avoid this issue in the future.`;
}

// Generate personalized study plan
async function generateStudyPlan(userProfile, recentIssues) {
  const prompt = `Create a personalized learning plan for a ${userProfile.skillLevel} ${userProfile.primaryLanguage} developer.

Recent issues found:
${recentIssues.map(issue => `- ${issue.category}: ${issue.title}`).join('\n')}

User preferences: ${userProfile.preferences.focusAreas.join(', ')}

Please provide a 4-week study plan with:
1. Week-by-week goals
2. Specific resources and exercises
3. Practice projects
4. Success metrics

Format as a structured plan.`;

  const aiResponse = await callOpenAIAPI(prompt, 800);
  
  return aiResponse || generateDefaultStudyPlan(userProfile, recentIssues);
}

function generateDefaultStudyPlan(userProfile, recentIssues) {
  return `# 4-Week Learning Plan for ${userProfile.skillLevel} ${userProfile.primaryLanguage} Developer

## Week 1: Foundation Review
- Review ${userProfile.primaryLanguage} syntax and basic concepts
- Practice writing clean, readable code
- Set up development environment with linting tools

## Week 2: Address Common Issues
- Focus on the most frequent issues found in your code
- Practice specific patterns and techniques
- Complete coding exercises targeting weak areas

## Week 3: Advanced Concepts
- Learn intermediate-to-advanced ${userProfile.primaryLanguage} features
- Study design patterns and best practices
- Work on a small project applying new knowledge

## Week 4: Integration and Review
- Build a complete project showcasing learned skills
- Conduct code reviews and get feedback
- Plan next learning objectives

## Success Metrics:
- Reduce code issues by 50%
- Improve average code quality score
- Complete all practice exercises
- Build and deploy one project`;
}

module.exports = {
  generateEducationalContent,
  generateCodeSuggestions,
  generateStudyPlan,
  callOpenAIAPI
};