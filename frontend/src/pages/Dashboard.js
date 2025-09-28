import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Code,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trophy,
  Star,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { api } from "../services/api";

const Dashboard = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/analytics/dashboard");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3B82F6", "#EF4444", "#F59E0B", "#10B981", "#8B5CF6"];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    return trend.direction === "improving" ? (
      <ArrowUp className="h-4 w-4 text-green-500" />
    ) : trend.direction === "declining" ? (
      <ArrowDown className="h-4 w-4 text-red-500" />
    ) : null;
  };

  return (
  <div className="mx-auto max-w-7xl space-y-8 pt-24">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {analytics.user.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your coding progress and insights
        </p>
      </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Total Reviews */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.user.stats.totalReviews}
              </p>
            </div>
            <Code className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(analytics.analytics.trends)}
            <span className="ml-1 text-sm text-gray-600">
              {analytics.analytics.trends
                ? `${analytics.analytics.trends.change}% this period`
                : "No trend data"}
            </span>
          </div>
        </div>

        {/* Issues Resolved */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issues Resolved</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.user.stats.issuesFixed}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Keep up the great work!
          </p>
        </div>

        {/* Skill Points */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Skill Points</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.user.stats.skillPoints}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Level: {analytics.user.skillLevel}
          </p>
        </div>

        {/* Current Streak */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.user.stats.currentStreak}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Best: {analytics.user.stats.longestStreak} days
          </p>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
          <Target className="mr-2" />
          Weekly Goals
        </h2>

        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Reviews this week</span>
            <span>
              {analytics.progress.weeklyGoals.currentWeekReviews} /{" "}
              {analytics.progress.weeklyGoals.reviewsTarget}
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{
                width: `${Math.min(
                  100,
                  (analytics.progress.weeklyGoals.currentWeekReviews /
                    analytics.progress.weeklyGoals.reviewsTarget) *
                    100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {analytics.progress.weeklyGoals.currentWeekReviews >=
          analytics.progress.weeklyGoals.reviewsTarget ? (
            <span className="font-medium text-green-600">
              🎉 Goal achieved! Great work!
            </span>
          ) : (
            <span>
              {analytics.progress.weeklyGoals.reviewsTarget -
                analytics.progress.weeklyGoals.currentWeekReviews}{" "}
              more reviews to reach your goal
            </span>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Progress Chart */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <TrendingUp className="mr-2" />
            Progress Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.analytics.scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString()
                }
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString()
                }
                formatter={(value) => [`${value}/100`, "Score"]}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Language Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(
                  analytics.analytics.languageStats
                ).map(([lang, count]) => ({
                  name: lang,
                  value: count,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                dataKey="value"
              >
                {Object.keys(analytics.analytics.languageStats).map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Issue Categories */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Common Issue Categories
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(
              analytics.analytics.categoryStats
            ).map(([category, count]) => ({
              category:
                category.charAt(0).toUpperCase() + category.slice(1),
              count,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills and Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Skills */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <Award className="mr-2" />
            Your Skills
          </h2>
          <div className="space-y-4">
            {analytics.progress.skills.slice(0, 5).map((skill, index) => (
              <div key={index}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium capitalize">
                    {skill.skill.replace("-", " ")}
                  </span>
                  <span className="capitalize text-gray-600">
                    {skill.level}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-600"
                    style={{
                      width: `${Math.min(100, skill.experience)}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {skill.experience}/100 XP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <BookOpen className="mr-2" />
            Recommendations
          </h2>
          <div className="space-y-4">
            {analytics.recommendations.length > 0 ? (
              analytics.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 bg-blue-50 p-4"
                >
                  <h3 className="font-medium text-blue-900">{rec.title}</h3>
                  <p className="mt-1 text-sm text-blue-800">
                    {rec.description}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${
                      rec.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : rec.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {rec.priority} priority
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Star className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>No recommendations yet.</p>
                <p className="text-sm">
                  Complete more reviews to get personalized suggestions!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {analytics.user.badges.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <Trophy className="mr-2" />
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {analytics.user.badges.slice(0, 6).map((badge, index) => (
              <div
                key={index}
                className="flex items-center rounded-lg bg-yellow-50 p-3"
              >
                <span className="mr-3 text-2xl">{badge.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{badge.name}</h3>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
