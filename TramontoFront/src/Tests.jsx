import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from "flowbite-react";
export default function ViewAllTests() {
  const [tests, setTests] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/tests/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setTests(response.data);
      } catch (err) {
        console.error('Error fetching tests:', err.response?.data);
        setErrorMessage('Failed to load tests.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Show loading state
  if (loading) {
    return <div className="p-6">Loading tests...</div>;
  }

  // Show error state
  if (errorMessage) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-left">Tests</h1>
        <p className="text-red-500 mb-4">{errorMessage}</p>
        <button
          onClick={() => navigate('/tests/create')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Create New Test
        </button>
      </div>
    );
  }

  // Main content - always show header and button
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-left">Tests</h1>
      <p className="text-left mb-4">
        Manage your tests here. You can create, view, and delete tests as needed.
      </p>
      
      <Button
        onClick={() => navigate('/tests/create')}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition mb-6"
      >
        Create New Test
      </Button>

      {/* Tests List or Empty State */}
      {tests.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-500 text-left">
            No tests available yet. Create your first test to get started!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Completed</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    <Link
                      to={`/tests/${test.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {test.title}
                    </Link>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{test.description || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {test.completed ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}