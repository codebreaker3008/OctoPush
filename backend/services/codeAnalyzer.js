const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Code analysis service
async function analyzeCode(code, language) {
  try {
    const analysis = {
      issues: [],
      metrics: {
        linesOfCode: 0,
        complexity: 0,
        maintainabilityIndex: 0,
        technicalDebt: 0,
        overallScore: 0
      },
      analysis: {
        strengths: [],
        areasForImprovement: [],
        skillLevel: 'intermediate',
        nextSteps: []
      }
    };

    // Calculate basic metrics
    analysis.metrics.linesOfCode = countLinesOfCode(code);
    analysis.metrics.complexity = calculateComplexity(code, language);
    analysis.metrics.maintainabilityIndex = calculateMaintainabilityIndex(code, language);

    // Analyze based on language
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'jsx':
        await analyzeJavaScript(code, analysis);
        break;
      case 'python':
        await analyzePython(code, analysis);
        break;
      case 'java':
        await analyzeJava(code, analysis);
        break;
      case 'cpp':
      case 'c++':
        await analyzeCpp(code, analysis);
        break;
      default:
        await analyzeGeneric(code, analysis);
    }

    // Calculate overall score based on issues
    analysis.metrics.overallScore = calculateOverallScore(analysis.issues);

    return analysis;
  } catch (error) {
    console.error('Code analysis error:', error);
    // Return basic analysis even if parsing fails
    return {
      issues: [{
        line: 1,
        column: 1,
        severity: 'error',
        category: 'syntax',
        title: 'Parsing Error',
        description: 'Unable to parse the code. Please check for syntax errors.',
        explanation: 'The code contains syntax errors that prevent proper analysis.',
        suggestedFix: 'Review the code for syntax errors and try again.',
        resources: [],
        codeSnippet: { original: code.substring(0, 100), suggested: '' },
        impact: 'high'
      }],
      metrics: {
        linesOfCode: countLinesOfCode(code),
        complexity: 1,
        maintainabilityIndex: 50,
        technicalDebt: 0,
        overallScore: 30
      },
      analysis: {
        strengths: [],
        areasForImprovement: ['Fix syntax errors'],
        skillLevel: 'beginner',
        nextSteps: ['Review language syntax', 'Use a code editor with syntax highlighting']
      }
    };
  }
}

// JavaScript specific analysis
async function analyzeJavaScript(code, analysis) {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    });

    const issues = [];
    const visitors = {
      // Check for var usage
      VariableDeclaration(path) {
        if (path.node.kind === 'var') {
          issues.push({
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: 'warning',
            category: 'best-practice',
            title: 'Use let/const instead of var',
            description: 'Using var can lead to unexpected behavior due to hoisting',
            explanation: 'var declarations are hoisted to the function scope, which can cause confusion. Use let for variables that change and const for constants.',
            suggestedFix: `Replace 'var' with 'let' or 'const'`,
            resources: [
              {
                title: 'MDN: let vs var',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let',
                type: 'documentation'
              }
            ],
            codeSnippet: {
              original: code.slice(path.node.start, path.node.end),
              suggested: code.slice(path.node.start, path.node.end).replace('var', 'const')
            },
            impact: 'medium'
          });
        }
      },

      // Check for missing semicolons
      ExpressionStatement(path) {
        const line = code.split('\n')[path.node.loc?.start.line - 1] || '';
        if (!line.trim().endsWith(';') && !line.trim().endsWith('}')) {
          issues.push({
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: 'info',
            category: 'style',
            title: 'Missing semicolon',
            description: 'Semicolons help prevent automatic semicolon insertion issues',
            explanation: 'While JavaScript has automatic semicolon insertion, explicit semicolons make code more predictable and prevent edge case bugs.',
            suggestedFix: 'Add semicolon at the end of the statement',
            resources: [],
            codeSnippet: {
              original: line.trim(),
              suggested: line.trim() + ';'
            },
            impact: 'low'
          });
        }
      },

      // Check for function complexity
      FunctionDeclaration(path) {
        const complexity = calculateFunctionComplexity(path);
        if (complexity > 10) {
          issues.push({
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: 'warning',
            category: 'maintainability',
            title: 'High function complexity',
            description: `Function has cyclomatic complexity of ${complexity}`,
            explanation: 'Complex functions are harder to test and maintain. Consider breaking this function into smaller, more focused functions.',
            suggestedFix: 'Break this function into smaller functions',
            resources: [
              {
                title: 'Refactoring: Extract Method',
                url: 'https://refactoring.guru/extract-method',
                type: 'tutorial'
              }
            ],
            codeSnippet: {
              original: path.node.id?.name || 'anonymous function',
              suggested: 'Consider extracting helper functions'
            },
            impact: 'high'
          });
        }
      },

      // Check for console.log statements
      CallExpression(path) {
        if (path.node.callee.type === 'MemberExpression' &&
            path.node.callee.object.name === 'console' &&
            path.node.callee.property.name === 'log') {
          issues.push({
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: 'suggestion',
            category: 'best-practice',
            title: 'Console.log in production code',
            description: 'Remove console.log statements before production',
            explanation: 'Console statements should be removed from production code as they can impact performance and expose sensitive information.',
            suggestedFix: 'Remove console.log or replace with proper logging',
            resources: [],
            codeSnippet: {
              original: 'console.log(...)',
              suggested: '// Use proper logging library or remove'
            },
            impact: 'low'
          });
        }
      }
    };

    traverse(ast, visitors);
    analysis.issues = issues;

    // Add strengths and improvements
    if (issues.length === 0) {
      analysis.analysis.strengths.push('Clean code with no major issues detected');
    }
    if (issues.filter(i => i.severity === 'error').length === 0) {
      analysis.analysis.strengths.push('No syntax errors');
    }
    if (issues.some(i => i.category === 'best-practice')) {
      analysis.analysis.areasForImprovement.push('Follow JavaScript best practices');
    }

  } catch (error) {
    console.error('JavaScript analysis error:', error);
    // Add generic syntax error
    analysis.issues.push({
      line: 1,
      column: 1,
      severity: 'error',
      category: 'syntax',
      title: 'JavaScript Syntax Error',
      description: 'Unable to parse JavaScript code',
      explanation: 'The JavaScript code contains syntax errors that prevent analysis.',
      suggestedFix: 'Check for missing brackets, semicolons, or other syntax issues',
      resources: [],
      codeSnippet: { original: code.substring(0, 50), suggested: '' },
      impact: 'high'
    });
  }
}

// Python specific analysis
async function analyzePython(code, analysis) {
  const lines = code.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();

    // Check indentation (basic check)
    if (line.length > 0 && line[0] === ' ' && line.indexOf(' ') % 4 !== 0) {
      issues.push({
        line: lineNum,
        column: 1,
        severity: 'warning',
        category: 'style',
        title: 'Inconsistent indentation',
        description: 'Python recommends 4 spaces for indentation',
        explanation: 'PEP 8 recommends using 4 spaces per indentation level for better readability.',
        suggestedFix: 'Use 4 spaces for each indentation level',
        resources: [
          {
            title: 'PEP 8 - Style Guide',
            url: 'https://pep8.org/',
            type: 'documentation'
          }
        ],
        codeSnippet: { original: line, suggested: line.replace(/^ +/, match => ' '.repeat(Math.ceil(match.length / 4) * 4)) },
        impact: 'low'
      });
    }

    // Check for long lines
    if (line.length > 79) {
      issues.push({
        line: lineNum,
        column: 80,
        severity: 'info',
        category: 'style',
        title: 'Line too long',
        description: `Line is ${line.length} characters long (max recommended: 79)`,
        explanation: 'Long lines can be harder to read. Consider breaking them into multiple lines.',
        suggestedFix: 'Break long line into multiple lines',
        resources: [],
        codeSnippet: { original: line.substring(70), suggested: '\\n    # continuation' },
        impact: 'low'
      });
    }

    // Check for print statements
    if (trimmedLine.includes('print(')) {
      issues.push({
        line: lineNum,
        column: line.indexOf('print(') + 1,
        severity: 'suggestion',
        category: 'best-practice',
        title: 'Print statement in code',
        description: 'Consider using logging instead of print statements',
        explanation: 'For production code, use the logging module instead of print statements for better control over output.',
        suggestedFix: 'Replace with logging.info() or similar',
        resources: [
          {
            title: 'Python Logging HOWTO',
            url: 'https://docs.python.org/3/howto/logging.html',
            type: 'tutorial'
          }
        ],
        codeSnippet: { original: trimmedLine, suggested: trimmedLine.replace('print(', 'logging.info(') },
        impact: 'low'
      });
    }
  });

  analysis.issues = issues;
}

// Java specific analysis
async function analyzeJava(code, analysis) {
  const lines = code.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();

    // Check for System.out.println
    if (trimmedLine.includes('System.out.println')) {
      issues.push({
        line: lineNum,
        column: line.indexOf('System.out.println') + 1,
        severity: 'suggestion',
        category: 'best-practice',
        title: 'System.out.println in code',
        description: 'Consider using a logging framework instead',
        explanation: 'For production code, use logging frameworks like Log4j or SLF4J instead of System.out.println.',
        suggestedFix: 'Replace with proper logging',
        resources: [
          {
            title: 'Java Logging Best Practices',
            url: 'https://www.baeldung.com/java-logging-intro',
            type: 'tutorial'
          }
        ],
        codeSnippet: { original: trimmedLine, suggested: 'logger.info("message");' },
        impact: 'low'
      });
    }

    // Check for missing braces
    if (trimmedLine.match(/^(if|for|while|else)\s*\([^)]*\)\s*[^{]/)) {
      issues.push({
        line: lineNum,
        column: 1,
        severity: 'warning',
        category: 'style',
        title: 'Missing braces for control statement',
        description: 'Always use braces for control statements',
        explanation: 'Using braces even for single statements prevents bugs when code is modified later.',
        suggestedFix: 'Add braces around the statement',
        resources: [],
        codeSnippet: { original: trimmedLine, suggested: trimmedLine + ' {' },
        impact: 'medium'
      });
    }
  });

  analysis.issues = issues;
}

// C++ specific analysis
async function analyzeCpp(code, analysis) {
  const lines = code.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();

    // Check for using namespace std
    if (trimmedLine.includes('using namespace std')) {
      issues.push({
        line: lineNum,
        column: 1,
        severity: 'warning',
        category: 'best-practice',
        title: 'Avoid "using namespace std"',
        description: 'This can cause naming conflicts in larger programs',
        explanation: 'Using the entire std namespace can lead to naming conflicts. Use specific declarations instead.',
        suggestedFix: 'Use specific declarations like "using std::cout;"',
        resources: [
          {
            title: 'Why "using namespace std" is bad practice',
            url: 'https://stackoverflow.com/questions/1452721/why-is-using-namespace-std-considered-bad-practice',
            type: 'article'
          }
        ],
        codeSnippet: { original: trimmedLine, suggested: 'using std::cout; using std::endl;' },
        impact: 'medium'
      });
    }

    // Check for memory leaks potential
    if (trimmedLine.includes('new ') && !code.includes('delete')) {
      issues.push({
        line: lineNum,
        column: line.indexOf('new ') + 1,
        severity: 'error',
        category: 'security',
        title: 'Potential memory leak',
        description: 'new without corresponding delete',
        explanation: 'Every new should have a corresponding delete to prevent memory leaks.',
        suggestedFix: 'Add corresponding delete statement or use smart pointers',
        resources: [
          {
            title: 'C++ Smart Pointers',
            url: 'https://www.cplusplus.com/reference/memory/',
            type: 'documentation'
          }
        ],
        codeSnippet: { original: trimmedLine, suggested: 'Use std::unique_ptr or std::shared_ptr' },
        impact: 'high'
      });
    }
  });

  analysis.issues = issues;
}

// Generic analysis for unsupported languages
async function analyzeGeneric(code, analysis) {
  const lines = code.split('\n');
  const issues = [];

  // Basic checks that apply to most languages
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for very long lines
    if (line.length > 120) {
      issues.push({
        line: lineNum,
        column: 121,
        severity: 'info',
        category: 'style',
        title: 'Long line',
        description: `Line is ${line.length} characters long`,
        explanation: 'Very long lines can be hard to read and review.',
        suggestedFix: 'Consider breaking into multiple lines',
        resources: [],
        codeSnippet: { original: line.substring(100), suggested: '' },
        impact: 'low'
      });
    }

    // Check for trailing whitespace
    if (line !== line.trimEnd()) {
      issues.push({
        line: lineNum,
        column: line.trimEnd().length + 1,
        severity: 'info',
        category: 'style',
        title: 'Trailing whitespace',
        description: 'Line has trailing whitespace characters',
        explanation: 'Trailing whitespace can cause issues with version control and some editors.',
        suggestedFix: 'Remove trailing whitespace',
        resources: [],
        codeSnippet: { original: line, suggested: line.trimEnd() },
        impact: 'low'
      });
    }
  });

  analysis.issues = issues;
  analysis.analysis.areasForImprovement.push('Language-specific analysis not available');
}

// Helper functions
function countLinesOfCode(code) {
  return code.split('\n').filter(line => line.trim().length > 0).length;
}

function calculateComplexity(code, language) {
  // Simplified complexity calculation
  const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', '&&', '||'];
  let complexity = 1; // Base complexity

  complexityKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });

  return Math.min(complexity, 20); // Cap at 20
}

function calculateMaintainabilityIndex(code, language) {
  const loc = countLinesOfCode(code);
  const complexity = calculateComplexity(code, language);
  
  // Simplified maintainability index
  // Higher is better (0-100 scale)
  let index = 100 - (complexity * 2) - (loc * 0.1);
  return Math.max(0, Math.min(100, index));
}

function calculateFunctionComplexity(functionPath) {
  let complexity = 1;
  
  functionPath.traverse({
    IfStatement: () => complexity++,
    ConditionalExpression: () => complexity++,
    ForStatement: () => complexity++,
    WhileStatement: () => complexity++,
    DoWhileStatement: () => complexity++,
    SwitchCase: () => complexity++,
    CatchClause: () => complexity++,
    LogicalExpression: (path) => {
      if (path.node.operator === '&&' || path.node.operator === '||') {
        complexity++;
      }
    }
  });
  
  return complexity;
}

function calculateOverallScore(issues) {
  let score = 100;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'error':
        score -= 20;
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
}

module.exports = {
  analyzeCode
};