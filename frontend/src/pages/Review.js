import React, { useState } from 'react';
import { Upload, Code, CheckCircle, BookOpen, ArrowRight, Zap, Target, Star, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const Review = ({ user }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('issues');

  const languages = [
    { 
      value: 'javascript', 
      label: 'JavaScript', 
      icon: '🟨',
      example: `function getUserData(userId) {
    console.log("Fetching user...");
    var user = users.find(u => u.id == userId);
    if(user) {
        return {
            name: user.name,
            email: user.email
        }
    }
}`
    },
    { 
      value: 'python', 
      label: 'Python', 
      icon: '🐍',
      example: `def calculate_average(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    print("Total:", total)
    return total/len(numbers)`
    },
    { 
      value: 'java', 
      label: 'Java', 
      icon: '☕',
      example: `public class UserManager {
    public void validateUser(String email) {
        if(email.contains("@"))
            System.out.println("Valid email");
            processUser(email);
    }
}`
    },
    { 
      value: 'cpp', 
      label: 'C++', 
      icon: '⚡',
      example: `#include <iostream>
using namespace std;

void printArray(int arr[], int size) {
    for(int i = 0; i < size; i++)
        cout << arr[i] << " ";
    cout << endl;
}`
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await api.post('/review/analyze', {
        title: title || 'Untitled Review',
        language,
        code
      });

      const reviewId = response.data.reviewId;
      pollForResults(reviewId);
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
    }
  };

  const pollForResults = async (reviewId) => {
    try {
      const response = await api.get(`/review/results/${reviewId}`);
      const reviewData = response.data;

      if (reviewData.review.status === 'completed') {
        setResults(reviewData);
        setIsAnalyzing(false);
      } else if (reviewData.review.status === 'error') {
        setIsAnalyzing(false);
        console.error('Analysis failed');
      } else {
        setTimeout(() => pollForResults(reviewId), 2000);
      }
    } catch (error) {
      console.error('Results polling error:', error);
      setIsAnalyzing(false);
    }
  };

  const handleMarkResolved = async (issueId) => {
    if (!results) return;

    try {
      await api.put(`/review/resolve-issue/${results.review._id}/${issueId}`);
      
      setResults(prev => ({
        ...prev,
        review: {
          ...prev.review,
          issues: prev.review.issues.map(issue => 
            issue._id === issueId ? { ...issue, resolved: true } : issue
          )
        }
      }));
    } catch (error) {
      console.error('Error marking issue as resolved:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'from-red-500 to-red-600';
      case 'warning': return 'from-yellow-500 to-yellow-600';
      case 'info': return 'from-blue-500 to-blue-600';
      case 'suggestion': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'syntax': return '🔧';
      case 'style': return '🎨';
      case 'performance': return '⚡';
      case 'security': return '🔒';
      case 'maintainability': return '🏗️';
      default: return '💡';
    }
  };

  const currentLanguage = languages.find(l => l.value === language);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative">
              <Code className="h-12 w-12 text-blue-500" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Code Review Mentor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your code with intelligent analysis that teaches you why issues matter and how to become a better developer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code Input Section */}
          <div className="card animate-fade-in-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Submit Your Code</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="input-group">
                <label className="form-label">Project Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., User Authentication Function"
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="form-label">Programming Language</label>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setLanguage(lang.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        language === lang.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{lang.icon}</span>
                        <span className="font-semibold text-gray-900">{lang.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Your Code</label>
                <div className="relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Paste your ${currentLanguage?.label} code here...\n\nExample:\n${currentLanguage?.example}`}
                    rows={16}
                    className="code-editor w-full resize-none"
                    required
                  />
                  {!code && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center text-gray-400">
                        <Upload className="h-12 w-12 mx-auto mb-2" />
                        <p>Paste your code or drag & drop a file</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !code.trim()}
                className="btn btn-primary w-full text-lg py-4 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="loading-spinner"></div>
                    <span>Analyzing Code...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span>Analyze Code</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="card animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {isAnalyzing && (
              <div className="text-center py-16">
                <div className="relative mb-6">
                  <div className="loading-spinner w-16 h-16 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI is analyzing your code</h3>
                <p className="text-gray-600 mb-4">Our advanced algorithms are reviewing your code for quality, security, and learning opportunities...</p>
                <div className="progress-bar">
                  <div className="progress-fill w-3/4"></div>
                </div>
              </div>
            )}

            {!isAnalyzing && !results && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready for Analysis</h3>
                <p className="text-gray-600">Submit your code to get instant, educational feedback and personalized learning recommendations.</p>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Multi-language support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Educational explanations</span>
                  </div>
                </div>
              </div>
            )}

            {results && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
                      <p className="text-gray-600">Found {results.summary.totalIssues} areas for improvement</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-1 ${
                      results.review.metrics.overallScore >= 80 ? 'text-green-500' :
                      results.review.metrics.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {results.review.metrics.overallScore}/100
                    </div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                </div>
                {results.review.maestroPowered && (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 text-white">
          <Zap className="h-5 w-5" />
          <div>
            <div className="font-semibold">⚡ Powered by Maestro Distributed Computing</div>
            <div className="text-sm opacity-90">
              Analysis performed across multiple nodes in {results.review.processingTime}ms
            </div>
          </div>
        </div>
      </div>
    )}

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="stat-card">
                    <div className="stat-number text-2xl">{results.summary.totalIssues}</div>
                    <div className="stat-label">Issues Found</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number text-2xl">{results.review.metrics.linesOfCode}</div>
                    <div className="stat-label">Lines of Code</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number text-2xl">{results.review.metrics.complexity}</div>
                    <div className="stat-label">Complexity</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { key: 'issues', label: 'Issues', count: results.summary.totalIssues },
                      { key: 'learning', label: 'Learning Path', count: results.review.learningPath?.length || 0 },
                      { key: 'metrics', label: 'Metrics', count: null }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                        {tab.count !== null && (
                          <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'issues' && (
                  <div className="space-y-4">
                    {results.review.issues.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Excellent work!</h3>
                        <p className="text-gray-600">No issues found in your code. Keep up the great coding practices!</p>
                      </div>
                    ) : (
                      results.review.issues.map((issue, index) => (
                        <div 
                          key={index} 
                          className={`issue-card ${issue.severity} ${issue.resolved ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                                <div className={`badge bg-gradient-to-r ${getSeverityColor(issue.severity)} text-white`}>
                                  {issue.severity.toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-500">Line {issue.line}</span>
                                {issue.resolved && (
                                  <div className="badge badge-success">
                                    ✅ Resolved
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="text-lg font-bold text-gray-900 mb-2">{issue.title}</h4>
                              <p className="text-gray-600 mb-4">{issue.description}</p>
                              
                              {issue.explanation && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                  <div className="flex items-start gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="font-semibold text-blue-900 mb-1">Why this matters:</div>
                                      <div className="text-blue-800 text-sm">{issue.explanation}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {issue.suggestedFix && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                                  <div className="flex items-start gap-2">
                                    <Zap className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="font-semibold text-green-900 mb-1">How to fix:</div>
                                      <div className="text-green-800 text-sm">{issue.suggestedFix}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {issue.resources && issue.resources.length > 0 && (
                                <div className="mt-4">
                                  <div className="text-sm font-semibold text-gray-700 mb-2">📚 Learning Resources:</div>
                                  <div className="space-y-2">
                                    {issue.resources.map((resource, idx) => (
                                      <a
                                        key={idx}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm p-2 bg-blue-50 rounded-lg transition-colors"
                                      >
                                        <span>{resource.title}</span>
                                        <ArrowRight className="h-3 w-3" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {!issue.resolved && (
                              <button
                                onClick={() => handleMarkResolved(issue._id)}
                                className="btn btn-success ml-4 flex-shrink-0"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'learning' && (
                  <div className="space-y-6">
                    {results.review.learningPath && results.review.learningPath.length > 0 ? (
                      results.review.learningPath.map((path, index) => (
                        <div key={index} className="card border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 capitalize flex items-center gap-2">
                              <Target className="h-5 w-5 text-blue-500" />
                              {path.skill.replace('-', ' ')}
                            </h3>
                            <div className={`badge ${
                              path.priority === 'high' ? 'badge-error' :
                              path.priority === 'medium' ? 'badge-warning' : 'badge-success'
                            }`}>
                              {path.priority} priority
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Current Level</div>
                              <div className="font-semibold text-gray-900 capitalize">{path.currentLevel}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Target Level</div>
                              <div className="font-semibold text-gray-900 capitalize">{path.targetLevel}</div>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{path.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              ⏱️ Estimated time: {path.estimatedTimeToComplete}
                            </div>
                            <div className="text-sm text-blue-600">
                              📊 {path.issueCount} issues in this category
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Great job!</h3>
                        <p className="text-gray-600">Your code looks excellent. Keep practicing to maintain your skills!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="stat-card">
                      <div className="stat-number">{results.review.metrics.complexity}</div>
                      <div className="stat-label">Code Complexity</div>
                      <p className="text-xs text-gray-500 mt-1">Lower is better</p>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-number">{results.review.metrics.maintainabilityIndex}</div>
                      <div className="stat-label">Maintainability Index</div>
                      <p className="text-xs text-gray-500 mt-1">Higher is better (0-100)</p>
                    </div>

                    {results.review.analysis && (
                      <div className="md:col-span-2 space-y-4">
                        {results.review.analysis.strengths.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Strengths:
                            </h5>
                            <ul className="text-green-700 text-sm space-y-1">
                              {results.review.analysis.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {results.review.analysis.areasForImprovement.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Areas for Improvement:
                            </h5>
                            <ul className="text-yellow-700 text-sm space-y-1">
                              {results.review.analysis.areasForImprovement.map((area, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;