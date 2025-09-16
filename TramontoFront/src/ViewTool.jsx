import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewTool = () => {
  const { toolId } = useParams(); // Get the tool ID from the URL
  const [tool, setTool] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get(`http://127.0.0.1:8000/tools/${toolId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setTool(response.data);
      } catch (err) {
        console.error('Error fetching tool:', err.response?.data);
        setErrorMessage('Failed to load tool details.');
      }
    };

    fetchTool();
  }, [toolId]);

  if (errorMessage) {
    return <p className="text-red-500 text-center">{errorMessage}</p>;
  }

  if (!tool) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{tool.name}</h2>
        <p><strong>Description:</strong> {tool.description || 'No description provided.'}</p>
        <p><strong>Link:</strong> {tool.link ? <a href={tool.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">{tool.link}</a> : 'No link provided.'}</p>
        <button
          onClick={() => navigate('/tools')}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Back to Tools
        </button>
      </div>
    </div>
  );
};

export default ViewTool;