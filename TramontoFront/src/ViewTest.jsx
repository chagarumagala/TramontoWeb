import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function ViewTest() {
  const { testId } = useParams(); // Get the test ID from the URL
  const [test, setTest] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [emailToAdd, setEmailToAdd] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get(`http://127.0.0.1:8000/tests/${testId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setTest(response.data);
      } catch (err) {
        console.error('Error fetching test:', err.response?.data);
        setErrorMessage('Failed to load test details.');
      }
    };

    fetchTest();
  }, [testId]);
  const handleAddUser = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post(
        `http://127.0.0.1:8000/tests/${testId}/add-user/`,
        { email: emailToAdd },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSuccessMessage(response.data.message);
      setErrorMessage('');
    } catch (err) {
      console.error('Error adding user to test:', err.response?.data);
      setErrorMessage('Failed to add user to the test.');
      setSuccessMessage('');
    }
  };
  const handleDelete = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/tests/${testId}/delete/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      navigate('/tests'); // Redirect to the tests list page after deletion
    } catch (err) {
      console.error('Error deleting test:', err.response?.data);
      setErrorMessage('Failed to delete test.');
    }
  };

  if (errorMessage) {
    return <p className="text-red-500 text-center">{errorMessage}</p>;
  }

  if (!test) {
    return <p className="text-center">Loading test details...</p>;
  }
  const isCreator = test.creator.id === parseInt(test.user_id, 10); // Check if the logged-in user is the creator

  return (
    <div className="min-h-screen flex items-left justify-left bg-white-100">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">{test.title}</h2>
        <p><strong>Description:</strong> {test.description}</p>
        <p><strong>Knowledge:</strong> {test.knowledge}</p>
        <p><strong>Aggressivity:</strong> {test.aggressivity}</p>
        <p><strong>Approach:</strong> {test.approach}</p>
        <p><strong>Starting Point:</strong> {test.starting_point}</p>
        <p><strong>Vectors:</strong> {test.vector}</p>
        <p><strong>Completed:</strong> {test.completed ? 'Yes' : 'No'}</p>
        <p><strong>Creator:</strong> {test.creator.name}</p>
        <p><strong>Testers:</strong></p>
        <ul>
          {test.testers.map((tester) => (
            <li key={tester.id}>{tester.name}</li>
          ))}
        </ul>
        {isCreator && ( // Render Edit and Delete buttons only for the creator
          <div className="mt-4">
            <button
              onClick={() => navigate(`/tests/${testId}/update`)} // Navigate to the edit page
              className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition mb-2"
            >
              Edit Test
            </button>
            <button
              onClick={handleDelete} // Call the delete handler
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Delete Test
            </button>
            <h2 className="text-lg font-bold mb-2">Add User to Test</h2>
          <input
            type="email"
            placeholder="Enter user email"
            value={emailToAdd}
            onChange={(e) => setEmailToAdd(e.target.value)}
            className="border px-4 py-2 rounded-lg mb-2"
          />
          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add User
          </button>
          {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          </div>
        )}
        <button
          onClick={() => navigate('/tests')}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition mt-4"
        >
          Back to Tests
        </button>
      </div>
    </div>
  );
}