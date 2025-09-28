import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
// Components
import Navbar from './components/Common/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Review from './pages/Review';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Services
import { api } from './services/api';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/verify');
          if (response.data.valid) {
            const profileResponse = await api.get('/auth/profile');
            login(profileResponse.data.user, token);
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [login]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Navbar user={user} onLogout={logout} />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  user ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  user ? <Navigate to="/dashboard" replace /> : <Register onLogin={login} />
                } 
              />
              <Route 
                path="/review" 
                element={
                  user ? <Review user={user} /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  user ? <Dashboard user={user} /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  user ? <Profile user={user} /> : <Navigate to="/login" replace />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;