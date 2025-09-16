import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const accessToken = localStorage.getItem('access_token'); // Get the token from localStorage
        const response = await axios.get('http://127.0.0.1:8000/tests/', {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Pass the token in the Authorization header
          },
        });
        setTests(response.data); // Set the tests data
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again.');
      }
    };

    fetchTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Tests</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{test.title}</h2>
            <p className="text-gray-700 mb-2">{test.description}</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Knowledge:</strong> {test.knowledge}</li>
              <li><strong>Aggressivity:</strong> {test.aggressivity}</li>
              <li><strong>Approach:</strong> {test.approach}</li>
              <li><strong>Starting Point:</strong> {test.starting_point}</li>
              <li><strong>Vector:</strong> {test.vector}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}