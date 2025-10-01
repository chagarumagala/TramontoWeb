import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateTest({ isEditMode = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [knowledge, setKnowledge] = useState('black-box');
  const [finalDate, setFinalDate] = useState('');
  const [aggressivity, setAggressivity] = useState('medium');
  const [approach, setApproach] = useState('covert');
  const [startingPoint, setStartingPoint] = useState('external');
  const [vector, setVector] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { testId } = useParams(); // Get test ID from URL

  // Fetch existing test data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchTest = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.get(`http://127.0.0.1:8000/tests/${testId}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const test = response.data;
          setTitle(test.title);
          setDescription(test.description); 
          setFinalDate(test.final_date);
          setKnowledge(test.knowledge);
          setAggressivity(test.aggressivity);
          setApproach(test.approach);
          setStartingPoint(test.starting_point);
          setCompleted(test.completed);
        } catch (err) {
          console.error('Error fetching test:', err.response?.data);
          setErrorMessage('Failed to load test details.');
        }
      };

      fetchTest();
    }
  }, [isEditMode, testId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const accessToken = localStorage.getItem('access_token');
      if (isEditMode) {
        // Update existing test
        await axios.put(
          `http://127.0.0.1:8000/tests/${testId}/update/`,
          {
            title,
            description,
            final_date: finalDate,
            knowledge,
            aggressivity,
            approach,
            starting_point: startingPoint,
            vector:vector.join(','),
            completed,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
          
        );
        
        setSuccessMessage('Test updated successfully!');
      } else {
        // Create new test
        await axios.post(
          'http://127.0.0.1:8000/tests/create/',
          {
            title,
            description,
            final_date: finalDate,
            knowledge,
            aggressivity,
            approach,
            starting_point: startingPoint,
            vector:vector.join(','),
            completed,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setSuccessMessage('Test created successfully!');
      }
      navigate('/tests'); // Redirect to tests page
    } catch (err) {
      console.error('Error submitting test:', err.response?.data);
      setErrorMessage('Failed to submit test.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEditMode ? 'Edit Test' : 'Create Test'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white-700">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white-700">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
          <div className="mb-4">
        <label className="block text-gray-700 mb-2">Final Date</label>
        <input
          type="date"
          value={finalDate}
          onChange={(e) => setFinalDate(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={new Date().toISOString().split('T')[0]} // Set the minimum date to today
        />
      </div>
  <label className="block text-white-700">Knowledge:</label>
  <div className="space-y-2">
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="knowledge"
        value="black-box"
        checked={knowledge === 'black-box'}
        onChange={(e) => setKnowledge(e.target.value)}
        className="form-radio"
      />
      <span>Black-box</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="knowledge"
        value="white-box"
        checked={knowledge === 'white-box'}
        onChange={(e) => setKnowledge(e.target.value)}
        className="form-radio"
      />
      <span>White-box</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="knowledge"
        value="grey-box"
        checked={knowledge === 'grey-box'}
        onChange={(e) => setKnowledge(e.target.value)}
        className="form-radio"
      />
      <span>Grey-box</span>
    </label>
  </div>
</div>

<div>
  <label className="block text-white-700">Aggressivity:</label>
  <div className="space-y-2">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="aggressivity"
        value="low"
        checked={aggressivity === 'low'}
        onChange={(e) => setAggressivity(e.target.value)}
        className="form-radio"
      />
      <span>Low</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="aggressivity"
        value="medium"
        checked={aggressivity === 'medium'}
        onChange={(e) => setAggressivity(e.target.value)}
        className="form-radio"
      />
      <span>Medium</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="aggressivity"
        value="high"
        checked={aggressivity === 'high'}
        onChange={(e) => setAggressivity(e.target.value)}
        className="form-radio"
      />
      <span>High</span>
    </label>
  </div>
</div>

<div>
  <label className="block text-white-700">Approach:</label>
  <div className="space-y-2">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="approach"
        value="covert"
        checked={approach === 'covert'}
        onChange={(e) => setApproach(e.target.value)}
        className="form-radio"
      />
      <span>Covert</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="approach"
        value="overt"
        checked={approach === 'overt'}
        onChange={(e) => setApproach(e.target.value)}
        className="form-radio"
      />
      <span>Overt</span>
    </label>
  </div>
</div>

<div>
  <label className="block text-white-700">Starting Point:</label>
  <div className="space-y-2">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="starting_point"
        value="internal"
        checked={startingPoint === 'internal'}
        onChange={(e) => setStartingPoint(e.target.value)}
        className="form-radio"
      />
      <span>Internal</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="starting_point"
        value="external"
        checked={startingPoint === 'external'}
        onChange={(e) => setStartingPoint(e.target.value)}
        className="form-radio"
      />
      <span>External</span>
    </label>
  </div>
</div>
<div>
  <label className="block text-white-700">Vector:</label>
  <div className="space-y-2">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        value="network"
        checked={vector.includes('network')}
        onChange={(e) => {
          if (e.target.checked) {
            // Reset vector and add the current value
            setVector([...vector, e.target.value]); // Add value
          } else {
            // Clear vector if the checkbox is unchecked
            setVector(vector.filter((item) => item !== e.target.value)); // Remove value
          }
        }}
        className="form-checkbox"
      />
      <span>Network</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        value="web"
        checked={vector.includes('web')}
        onChange={(e) => {
          if (e.target.checked) {
            // Reset vector and add the current value
            setVector([...vector, e.target.value]); // Add value
          } else {
            // Clear vector if the checkbox is unchecked
            setVector(vector.filter((item) => item !== e.target.value)); // Remove value
          }
        }}
        className="form-checkbox"
      />
      <span>Web</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        value="social"
        checked={vector.includes('social')}
        onChange={(e) => {
          if (e.target.checked) {
            // Reset vector and add the current value
            setVector([...vector, e.target.value]); // Add value
          } else {
            // Clear vector if the checkbox is unchecked
            setVector(vector.filter((item) => item !== e.target.value)); // Remove value
          }
        }}
        className="form-checkbox"
      />
      <span>Social</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        value="physical"
        checked={vector.includes('physical')}
        onChange={(e) => {
          if (e.target.checked) {
            // Reset vector and add the current value
            setVector([...vector, e.target.value]); // Add value
          } else {
            // Clear vector if the checkbox is unchecked
            setVector(vector.filter((item) => item !== e.target.value)); // Remove value
          }
        }}
        className="form-checkbox"
      />
      <span>Physical</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        value="wireless"
        checked={vector.includes('wireless')}
        onChange={(e) => {
          if (e.target.checked) {
            // Reset vector and add the current value
            setVector([...vector, e.target.value]); // Add value
          } else {
            // Clear vector if the checkbox is unchecked
            setVector(vector.filter((item) => item !== e.target.value)); // Remove value
          }
        }}
        className="form-checkbox"
      />
      <span>Wireless</span>
    </label>
  </div>
</div>
          {/* Add other fields (knowledge, aggressivity, etc.) here */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            {isEditMode ? 'Update Test' : 'Create Test'}
          </button>
        </form>
        {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
      </div>
    </div>
  );
}