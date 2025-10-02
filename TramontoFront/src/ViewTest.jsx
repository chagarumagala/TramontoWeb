import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function ViewTest() {
  const { testId } = useParams(); // Get the test ID from the URL
  const [test, setTest] = useState(null);
  const [activeTab, setActiveTab] = useState('test'); // Default to "Test Information" tab

  const [errorMessage, setErrorMessage] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [checklist, setChecklist] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [loadingItemIds, setLoadingItemIds] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);

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
        setVulnerabilities(response.data.vulnerabilities || []);
        if (response.data.checklist) {
          setChecklist(response.data.checklist);
          setChecklistItems(response.data.checklist.items || []);
        }
      } catch (err) {
        console.error('Error fetching test:', err.response?.data);
        setErrorMessage('Failed to load test details.');
      }
    };
    const fetchChecklists = async () => { 
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/checklists/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }); 
        const filteredChecklists = response.data.filter((checklist) => !checklist.clone);
        setChecklists(filteredChecklists); 
        
      } catch (err) {
        console.error('Error fetching checklists:', err.response?.data);
        setErrorMessage('Failed to load checklists.');
      }
    };

    fetchTest();
    fetchChecklists();
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
  const handleDeleteChecklist = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.delete(`http://127.0.0.1:8000/tests/${testId}/remove-checklist/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      setSuccessMessage(response.data.message);
      setErrorMessage('');
      setTest((prev) => ({
        ...prev,
        checklist: null, // Remove the checklist from the test state
      }));
      setChecklist(null); // Clear the checklist state
      setChecklistItems([]); // Clear the checklist items state
    } catch (err) {
      console.error('Error deleting checklist:', err.response?.data);
      setErrorMessage('Failed to delete checklist.');
    }
  };
  const handleRelateChecklist = async () => {
    if (!selectedChecklist) {
      setErrorMessage('Please select a checklist.');
      return;
    }
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post(
        `http://127.0.0.1:8000/tests/${testId}/relate-checklist/`,
        { checklist_id: selectedChecklist },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      setSuccessMessage(response.data.message);
      setErrorMessage('');
      window.location.reload();

    } catch (err) {
      console.error('Error relating checklist to test:', err.response?.data);
      setErrorMessage('Failed to relate checklist to the test.');
      setSuccessMessage('');
    }
  };
  const handleDeleteVulnerability = async (vulnId) => {
    if (!window.confirm('Are you sure you want to delete this vulnerability?')) {
      return;
    }
  
    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/vulnerabilities/${vulnId}/delete/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      // Remove the vulnerability from the state
      setVulnerabilities((prev) => prev.filter((vuln) => vuln.id !== vulnId));
    } catch (err) {
      console.error('Error deleting vulnerability:', err.response?.data);
      alert('Failed to delete vulnerability.');
    }
  };
  
  const toggleItemCompletion = async (itemId, currentStatus) => {
    try {
      setLoadingItemIds((prev) => [...prev, itemId]);

      const accessToken = localStorage.getItem('access_token');
      await axios.patch(
        `http://127.0.0.1:8000/checklist-items/${itemId}/toggle-completion/`,
        { completed: !currentStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ); 
      // Update the item's completed status locally
      setChecklistItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, completed: !currentStatus } : item
        )
      );
    } catch (err) {
      console.error('Error toggling item completion:', err.response?.data);
      setErrorMessage('Failed to update item status.');
    }
  };
  const reloadPage = () => {
    window.location.reload();
  };

  if (errorMessage) {
    return <p className="text-red-500 text-center">{errorMessage}</p>;
  }

  if (!test) {
    return <p className="text-center">Loading test details...</p>;
  }
  const isCreator = test.creator.id === parseInt(test.user_id, 10); // Check if the logged-in user is the creator

  return (
    
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{test.title}</h2>
      <div className="flex border-b border-gray-300 mb-4">
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 ${
            activeTab === 'test' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
        >
          Test Information
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 ${
            activeTab === 'checklist' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
        >
          Checklist
        </button>
        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`px-4 py-2 ${
            activeTab === 'vulnerabilities' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
        >
          Vulnerabilities
        </button>
      </div>
      
      <div className="flex-1">
      {activeTab === 'test' && (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">{test.title}</h2> 
        <p><strong>Description:</strong> {test.description}</p>
        <p><strong>initial date:</strong> {test.initial_date}</p>
        <p><strong>final date:</strong> {test.final_date}</p>
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
              className="border px-4 py-2 rounded-lg mb-2 text-white"
            >
              Edit Test
            </button>
            <button
              onClick={handleDelete} // Call the delete handler
              className="border px-4 py-2 rounded-lg mb-2 text-white"
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
        )}
        {activeTab === 'checklist' && (
          <div>
      {!test.checklist && (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Relate a Checklist</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Checklist</label>
            <select
              value={selectedChecklist}
              onChange={(e) => setSelectedChecklist(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Checklist --</option>
              {checklists.map((checklist) => (
                <option key={checklist.id} value={checklist.id}>
                  {checklist.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRelateChecklist}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Relate Checklist
          </button>
        </div>
      </div>
      )}
      {test.checklist && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-6"> {test.checklist.name}</h2>
          
           <ul className="space-y-4">
            {test.checklist.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center">
                <span
        className={`block ${item.completed ? 'line-through text-gray-500' : ''}`}
        style={{
          maxWidth: '30%', // Limit the width of the text
          wordWrap: 'break-word', // Break long words
          overflowWrap: 'break-word', // Ensure text wraps properly
        }}
      >
        {item.name}
      </span>
                <button
                  onClick={() => toggleItemCompletion(item.id, item.completed)}
                  className={`py-1 px-3 rounded-lg ${
                    item.completed
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  } transition`}
                >
                {loadingItemIds.includes(item.id) ? 'Updating...' : item.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
              </li>
            ))}
            <button
            onClick={reloadPage}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            update Checklist
          </button>
          <button
            onClick={handleDeleteChecklist}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            remove Checklist
          </button>
          </ul>
        </div>
      )}
      </div>
        )}
        {activeTab === 'vulnerabilities' && (
          <div>
      <div className="mt-6">
        <div classname="flex w-full justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-4">Vulnerabilities Found</h2>
          <button
            onClick={() => navigate(`/tests/${testId}/vulnerabilities/create`)}
            className="border px-4 py-2 rounded-lg mb-2 text-white"
          >
            Add vulnerability
          </button>
        </div>
        {vulnerabilities.length > 0 ? (
        
          <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Name</th>
                    <th className="border border-gray-300 px-4 py-2">Description</th> 
                    <th className="border border-gray-300 px-4 py-2">Vector</th>
                    <th className="border border-gray-300 px-4 py-2">Recommendation</th>
                    <th className="border border-gray-300 px-4 py-2">Tools</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerabilities.map((vuln) => (
                    <tr key={vuln.id} className="hover:bg-gray-50"> 
                      <td className="border border-gray-300 px-4 py-2">
                        <span
                          className={`font-semibold ${
                            vuln.success === false ? 'text-red-500' : ''
                          }`}
                        >
                          {vuln.vuln}
                        </span>
                      </td>
          
                      <td className="border border-gray-300 px-4 py-2">{vuln.description}</td>
          
                       
          
                      <td className="border border-gray-300 px-4 py-2">
                        {vuln.success ? vuln.vector : 'N/A'}
                      </td>
          
                      <td className="border border-gray-300 px-4 py-2">
                        {vuln.success ? vuln.recommendation : 'N/A'}
                      </td>
          
                      <td className="border border-gray-300 px-4 py-2">
                        {vuln.tools && vuln.tools.length > 0 ? (
                          vuln.tools.map((tool, index) => (
                            <React.Fragment key={tool.id}>
                              <a
                                href={tool.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {tool.name}
                              </a>
                              {index < vuln.tools.length - 1 && ', '}
                            </React.Fragment>
                          ))
                        ) : (
                          'No tools'
                        )}
                      </td>
          
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => navigate(`/tests/${testId}/vulnerabilities/${vuln.id}/edit`)}
                          className="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVulnerability(vuln.id)}
                          className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        ) : (
          <p>No vulnerabilities found for this test.</p>
        )}
      </div>
      </div>
        )}
    </div>
    
    </div>
  );
}