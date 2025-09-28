import React, { useState, useEffect } from 'react';
import { ChevronDown, Zap, Shield, Globe } from 'lucide-react';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Blazing performance" },
    { icon: Shield, title: "Secure", desc: "Enterprise-grade security" },
    { icon: Globe, title: "Global", desc: "Worldwide accessibility" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-800/30 via-transparent to-cyan-800/30"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      
      {/* Mouse follower */}
      <div 
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-100 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: 'scale(0.8)'
        }}
      ></div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-40 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="backdrop-blur-xl bg-white/5 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Brand
                </div>
                <div className="hidden md:flex space-x-8">
                  {['Home', 'Features', 'About', 'Contact'].map((item, i) => (
                    <a key={item} href="#" className="relative group text-gray-300 hover:text-white transition-colors duration-300">
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className={`transition-all duration-1500 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Build the
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  Future
                </span>
              </h1>
            </div>
            
            <div className={`transition-all duration-1500 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience next-generation technology that transforms ideas into reality with unprecedented speed and precision.
              </p>
            </div>
            
            <div className={`transition-all duration-1500 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                
                
                
              </div>
            </div>

            {/* Scroll indicator */}
            <div className={`transition-all duration-1500 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-sm text-gray-400 mb-2">Scroll to explore</span>
                <ChevronDown size={24} className="text-purple-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose Us
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Cutting-edge features designed to elevate your experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-400/30 transition-all duration-300 hover:-translate-y-2">
                    <feature.icon size={48} className="text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-gray-300">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-3xl blur-2xl"></div>
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12">
                <h3 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Ready to Get Started?
                </h3>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of users who are already building the future
                </p>
                
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ayush Kumar 
            </div>
            <p className="text-gray-400">
              © 2025 Ayush Kumar . Building the future, one innovation at a time.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;