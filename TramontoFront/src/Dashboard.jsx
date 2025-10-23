import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    pending_tests: 0,
    completed_tests: 0,
    total_vulns: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/dashboard/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStats(response.data);
      console.log('Fetched stats:', response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-center">aaaaaaaaa</h2>

      <div className="max-w-7xl mx-auto px-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Total Tests Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center space-x-6">
            <div className="bg-blue-100 rounded-full p-4">
              <img 
                src="/src/components/pending.png" 
                alt="Total Tests" 
                className="w-26 h-26"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />

            </div>
            <div>
            <div class="dividerv"/>

            <p className="text-4xl font-bold text-green-600">{stats.pending_tests}</p> 
            
              <h3 className="text-gray-600 pl-7 text-lg font-medium">pending tests</h3>
            </div>
          </div>

          {/* Completed Tests Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center space-x-6">
            <div className="bg-green-100 rounded-full p-4">
              <img 
                src="/src/components/completed.png" 
                alt="Completed Tests" 
                className="w-26 h-26"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            </div>
            <div>
            <div class="dividerv"/>

            <p className="text-4xl text-center font-bold text-blue-600">{stats.completed_tests}</p>

              <h3 className="text-gray-600 text-center text-lg font-medium">Completed Tests</h3>
  
            </div>
          </div>

          {/* Total Vulnerabilities Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center space-x-6">
            <div className="bg-red-100 rounded-full p-4">
              <img 
                src="/src/components/vulns.png" 
                alt="Vulnerabilities" 
                className="w-26 h-26"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            </div>
            <div> 
            <div class="dividerv"/>

            <p className="text-4xl font-bold text-red-600">{stats.total_vulns}</p>
              <h3 className="text-gray-600 text-lg font-medium">Vulnerabilities found</h3>
            </div>
          </div>
        </div>
        <div class="dividerv"/>
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-12 text-white">
          <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Image Section */}
            <div className="flex-shrink-0">
              <img 
                src="/src/components/logologo.png" 
                alt="Tramonto Application" 
                className="w-32 h-32 lg:w-48 lg:h-48 rounded-lg object-cover shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-32 h-32 lg:w-48 lg:h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg" 
                style={{display: 'none'}}
              >
                <span className="text-6xl lg:text-8xl">🛡️</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 text-center lg:text-left">
            <div class="dividerv"/>

              <h2 className="text-3xl text-gray-300 lg:text-4xl font-bold mb-4 ">
                Tramonto Penetration Testing Platform
              </h2>
              <p className="text-gray-300 text-lg lg:text-xl leading-relaxed mb-6">
              Tramonto Framework is a structured methodology designed to standardize
               and optimize the process of penetration testing. It guides security
                professionals through every phase of an assessment, from planning
                 and adequacy to execution, verification, and reporting, ensuring
                  consistency, organization, and repeatability. By defining clear 
                  steps, documentation practices, and collaboration mechanisms, 
                  Tramonto helps testers produce reliable and professional reports
                   while promoting knowledge sharing and continuous improvement 
                   within cybersecurity teams.
              </p>
               
            </div>

            {/* PDF Download Section */}
            <div className="flex-shrink-0">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-red-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Explore Tramonto</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Read the original paper that outlines the methodology
                  </p>
                </div>
                <a 
                  href="/src/components/Tramonto.pdf" 
                  download="Tramonto.pdf"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-400"
                >
                  <div class="dividerv"/>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="dividerv"/>
                  <span className="font-semibold">Download PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;