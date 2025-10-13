import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  const handleLogout = () => {
    // Clear all authentication tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear any other user-related data if needed
    localStorage.removeItem('user_id');
    
    // Redirect to login page
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 fixed h-full left-0 top-0 z-40">
        <div className="p-4">
          <h4 className="text-2xl font-bold mb-6">Tramonto</h4>
          <h4 className="text-2xl font-bold mb-6">Tramonto</h4>
          <nav className="space-y-4">
            <Link to="/dashboard" className="block py-7 px-7 rounded hover:bg-gray-700 hover:text-red-400 transition-colors">
              Dashboard
            </Link>
            <Link to="/tests" className="block py-2 px-3 rounded hover:bg-gray-700 hover:text-red-400 transition-colors">
              Tests
            </Link>
            <Link to="/tools" className="block py-2 px-3 rounded hover:bg-gray-700 hover:text-red-400 transition-colors">
              Tools
            </Link>
            <Link to="/checklists" className="block py-2 px-3 rounded hover:bg-gray-700 hover:text-red-400 transition-colors">
              Checklists
            </Link>
            <Link to="/manage" className="block py-2 px-3 rounded hover:bg-gray-700 hover:text-red-400 transition-colors">
              Manage
            </Link>
            <Link to="/permissions" className="block py-2 px-3 rounded hover:bg-gray-700 hover:text-red-400 transition-colors">
              Permissions
            </Link>
            <Link to="/reports" className="block py-2 px-3 rounded hover:bg-gray-700 hover:text-red-400 transition-colors">
              Reports
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-gray-900 text-white pt-24 flex items-center shadow-md fixed top-0 left-0 right-0 z-50">
          <div className="flex justify-between items-center w-full pl-0">
            <button
              className="lg:hidden text-white focus:outline-none ml-4"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
            <div className="ml-4">
      <img 
        src="/src/components/logo.png" 
        alt="Tramonto Logo<br>" 
        className="h-10 w-auto"
      />
    </div>
            <div className="flex items-center space-x-4 mr-6">
            <button
          onClick={() => navigate('/viewprofile')}
          className="w-full bg-grey-500 text-white py-2 rounded-lg hover:bg-blue-600 transition mt-4"
        >
          Profile
        </button>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-24 bg-white-100 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Header;