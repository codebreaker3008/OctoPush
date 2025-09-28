import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Code, User, BarChart3, LogOut, Sparkles } from "lucide-react";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
      : "text-gray-300 hover:text-white hover:bg-white/10";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-purple-500/10"
          : "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 opacity-50"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center space-x-3 text-xl font-bold text-white hover:scale-105 transition-all duration-300"
          >
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:to-cyan-500 transition-all duration-300 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-purple-500/50">
              <Code
                size={20}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-cyan-300 transition-all duration-300">
              AI Code Mentor
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`group flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(
                    "/dashboard"
                  )}`}
                >
                  <BarChart3
                    size={16}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/review"
                  className={`group flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(
                    "/review"
                  )}`}
                >
                  <Code
                    size={16}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <span>Review Code</span>
                </Link>

                <Link
                  to="/profile"
                  className={`group flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(
                    "/profile"
                  )}`}
                >
                  <User
                    size={16}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={onLogout}
                  className="group flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all duration-300 hover:scale-105"
                >
                  <LogOut
                    size={16}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`group rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 border border-white/20 hover:border-purple-400/50 hover:bg-white/10 ${isActive(
                    "/login"
                  )}`}
                >
                  <span className="group-hover:text-white transition-colors duration-300">
                    Login
                  </span>
                </Link>

                <Link
                  to="/register"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                >
                  <span className="relative z-10 flex items-center space-x-1">
                    <Sparkles
                      size={14}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                    <span>Sign Up</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
