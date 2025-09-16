import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ViewProfile() {
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Hook to navigate between pages

  const fetchProfile = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/viewprofile/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err.response?.data);
      setErrorMessage('Failed to load profile information.');
    }
  };

  useEffect(() => {
    fetchProfile(); // Fetch profile data when the component is mounted
  }, []);

  if (errorMessage) {
    return <p className="text-red-500 text-center">{errorMessage}</p>;
  }

  if (!profile) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold">Name:</label>
            <p className="text-gray-800">{profile.name}</p>
          </div>
          <div>
            <label className="block text-gray-700 font-bold">Email:</label>
            <p className="text-gray-800">{profile.email}</p>
          </div>
          <div>
            <label className="block text-gray-700 font-bold">Cnpj:</label>
            <p className="text-gray-800">{profile.cnpj}</p>
          </div>
          <div>
            <label className="block text-gray-700 font-bold">Company name:</label>
            <p className="text-gray-800">{profile.company_name}</p>
          </div>
          <div>
            <label className="block text-gray-700 font-bold">Phone:</label>
            <p className="text-gray-800">{profile.phone}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/editprofile')} // Navigate to Edit Profile page
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}