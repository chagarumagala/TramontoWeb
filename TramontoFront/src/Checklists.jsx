import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Checklists = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/checklists/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setChecklists(response.data);
    } catch (err) {
      console.error('Error fetching checklists:', err);
      setErrorMessage('Failed to load checklists.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading checklists...</div>;
  if (errorMessage) return <div className="p-6 text-red-500">{errorMessage}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-left">Checklists</h1>
      <h1 className="text-2xl font-bold mb-4 text-left">Checklists</h1>
      <p className="text-left mb-4">
        Manage your checklists here. You can create, view, and edit checklists.
      </p>
      
      <button
        onClick={() => navigate('/checklists/create')}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition mt-4 mb-6"
      >
        Create New Checklist
      </button>

      {checklists.length === 0 ? (
        <p className="text-gray-500">No checklists available. Create your first checklist!</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {checklists.map((checklist) => (
            <li
              key={checklist.id}
              className="flex justify-between items-center border-b pb-4"
            >
              <Link
                to={`/checklists/${checklist.id}`}
                className="text-blue-500 hover:underline text-lg font-semibold"
              >
                {checklist.name}
              </Link>
              <div className="text-right">
                <p className="text-gray-700">{checklist.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Checklists;