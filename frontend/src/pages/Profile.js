import React, { useState, useEffect } from 'react';
import { User, Settings, Award, Save } from 'lucide-react';
import { authAPI } from '../services/api';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    skillLevel: '',
    primaryLanguage: '',
    preferences: {
      languages: [],
      focusAreas: [],
      difficultyLevel: ''
    },
    weeklyGoals: {
      reviewsTarget: 5
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.user.name,
        skillLevel: response.data.user.skillLevel,
        primaryLanguage: response.data.user.primaryLanguage,
        preferences: response.data.user.preferences,
        weeklyGoals: response.data.progress?.weeklyGoals || { reviewsTarget: 5 }
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updatePreferences({
        languages: formData.preferences.languages,
        focusAreas: formData.preferences.focusAreas,
        difficultyLevel: formData.preferences.difficultyLevel,
        skillLevel: formData.skillLevel
      });

      if (formData.weeklyGoals.reviewsTarget !== profile.progress?.weeklyGoals?.reviewsTarget) {
        await authAPI.updateGoals({
          reviewsTarget: parseInt(formData.weeklyGoals.reviewsTarget)
        });
      }

      setEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const languages = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust'];
  const focusAreas = ['performance', 'security', 'readability', 'maintainability', 'testing'];

  return (
  <div className="max-w-4xl mx-auto space-y-8 pt-24">
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <User className="mr-2" />
          Profile Settings
        </h1>
        <button
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          {editing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <p className="text-gray-900">{profile?.user.email}</p>
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Level
            </label>
            {editing ? (
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            ) : (
              <p className="text-gray-900 capitalize">{profile?.user.skillLevel}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Language
            </label>
            {editing ? (
              <select
                name="primaryLanguage"
                value={formData.primaryLanguage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 capitalize">{profile?.user.primaryLanguage}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages of Interest
              </label>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => (
                  <label key={lang} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.languages.includes(lang)}
                      onChange={(e) => {
                        const newLanguages = e.target.checked
                          ? [...formData.preferences.languages, lang]
                          : formData.preferences.languages.filter(l => l !== lang);
                        handleArrayChange('languages', newLanguages);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map(area => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.focusAreas.includes(area)}
                      onChange={(e) => {
                        const newAreas = e.target.checked
                          ? [...formData.preferences.focusAreas, area]
                          : formData.preferences.focusAreas.filter(a => a !== area);
                        handleArrayChange('focusAreas', newAreas);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Review Goal
              </label>
              <input
                type="number"
                name="weeklyGoals.reviewsTarget"
                value={formData.weeklyGoals.reviewsTarget}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Number of code reviews per week</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Award className="mr-2" />
          Your Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile?.user.stats.totalReviews || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {profile?.user.stats.issuesFixed || 0}
            </div>
            <div className="text-sm text-gray-600">Issues Fixed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {profile?.user.stats.skillPoints || 0}
            </div>
            <div className="text-sm text-gray-600">Skill Points</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {profile?.user.stats.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {profile?.user.badges && profile.user.badges.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="mr-2" />
            Your Badges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.user.badges.map((badge, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl mr-3">{badge.icon}</span>
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

export default Profile;