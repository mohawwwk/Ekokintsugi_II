import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ showBack = false, title = 'EkoKintsugi' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBack ? (
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
            </Link>
          )}
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden xs:flex">
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-primary-600 font-bold">
              {user.role}
            </span>
          </div>
          
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          
          <button 
            onClick={handleLogout} 
            className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
