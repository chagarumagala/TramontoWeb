import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Tools = () => {
  const [tools, setTools] = useState([]);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDescription, setNewToolDescription] = useState('');
  const [newToolLink, setNewToolLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingTool, setAddingTool] = useState(false);
  const [deletingTool, setDeletingTool] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/tools/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTools(response.data.tools);
      console.log(response.data);
    } catch (err) {
      console.error('Error fetching tools:', err.response?.data);
      setErrorMessage('Failed to load tools.');
    } finally {
      setLoading(false);
    }
  };

  const addTool = async (e) => {
    e.preventDefault();
    if (!newToolName.trim()) return;

    setAddingTool(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post('http://127.0.0.1:8000/tools/create/', {
        name: newToolName.trim(),
        description: newToolDescription.trim(),
        link: newToolLink.trim(),
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(response.data);
      // Add the new tool to the list without refreshing
      setTools((prev) => [...prev, response.data]);

      // Clear form and show success message
      setNewToolName('');
      setNewToolDescription('');
      setNewToolLink('');
      setSuccessMessage('Tool created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating tool:', err);
      setErrorMessage('Failed to create tool.');
    } finally {
      setAddingTool(false);
    }
  };
  const deleteTool = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) {
      return;
    }

    setDeletingTool(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/tools/${toolId}/delete/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Remove the tool from the list without refreshing
      setTools((prev) => prev.filter((tool) => tool.id !== toolId));
      setSuccessMessage('Tool deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting tool:', err);
      setErrorMessage('Failed to delete tool.');
    } finally {
      setDeletingTool(false);
    }
  };
  if (loading) {
    return <div className="p-6">Loading tools...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-left">Tools</h1>
      <p className="text-left mb-4">
        Manage your tools here. You can create, view, and edit tools.
      </p>

      {/* Add Tool Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Tool</h2>
        <form onSubmit={addTool} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Tool Name</label>
            <input
              type="text"
              value={newToolName}
              onChange={(e) => setNewToolName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tool name"
              required
              disabled={addingTool}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={newToolDescription}
              onChange={(e) => setNewToolDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tool description"
              rows="3"
              disabled={addingTool}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">link</label>
            <input
              type="text"
              value={newToolLink}
              onChange={(e) => setNewToolLink(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tool name"
              required
              disabled={addingTool}
            />
          </div>
          <button
            type="submit"
            disabled={addingTool || !newToolName.trim()}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingTool ? 'Adding...' : 'Add Tool'}
          </button>
        </form>
      </div>

      {/* Tools Table */}
      {tools.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-500 text-left">
            No tools available. Create your first tool to get started!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left">link</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{tool.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{tool.description || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {tool.link || 'N/A'}
                    </a>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => deleteTool(tool.id)}
                      disabled={deletingTool}
                      className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingTool ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Tools;