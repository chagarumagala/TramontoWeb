import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewChecklist = () => {
  const { checklistId } = useParams();
  const [checklist, setChecklist] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);  // Add this state

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChecklist();
  }, [checklistId]);
  const deleteChecklist = async () => {
    if (!window.confirm(`Are you sure you want to delete the checklist "${checklist?.name}"? This will also delete all items in this checklist. This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setErrorMessage('');

    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/checklists/${checklistId}/delete/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Navigate back to checklists page
      navigate('/checklists');
    } catch (err) {
      console.error('Error deleting checklist:', err);
      setErrorMessage('Failed to delete checklist.');
      setDeleting(false);
    }
  };
  const fetchChecklist = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/checklists/${checklistId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setChecklist(response.data);
      setErrorMessage('');
    } catch (err) {
      console.error('Error fetching checklist:', err);
      setErrorMessage('Failed to load checklist.');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setAdding(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post(`http://127.0.0.1:8000/checklists/${checklistId}/add-item/`, {
        name: newItemName.trim(),
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Add the new item to the checklist without refreshing
      setChecklist(prev => ({
        ...prev,
        items: [...prev.items, response.data]
      }));

      // Clear form and show success message
      setNewItemName('');
      setSuccessMessage('Item added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding item:', err);
      setErrorMessage('Failed to add item.');
    } finally {
      setAdding(false);
    }
  };

  const deleteItem = async (itemId) => {

    try {
      const accessToken = localStorage.getItem('access_token');
      const url = `http://127.0.0.1:8000/checklists/checklist-items/${itemId}/delete/`; 
    
    const response = await axios.delete(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }); 
      // Remove item from checklist without refreshing
      setChecklist(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));

      setSuccessMessage('Item deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setErrorMessage('Failed to delete item.');
    }
  };

  if (loading) return <div className="p-6">Loading checklist...</div>;
  if (errorMessage && !checklist) return <div className="p-6 text-red-500">{errorMessage}</div>;

  return (
    <div className="p-6 pt-20">
        <h1 className="text-2xl font-bold mb-4 text-left">Create New Checklist</h1> 
        <h1 className="text-2xl font-bold mb-4 text-left">Create New Checklist</h1> 
      <div className="flex justify-between items-start mb-6">



        <div>
        
          <h1 className="text-2xl font-bold text-left">{checklist?.name}</h1>
          {checklist?.description && (
            <p className="text-gray-600 mt-2">{checklist.description}</p>
          )}
        </div>
        <button
          onClick={() => navigate('/checklists')}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Checklists
        </button>
        <button
            onClick={deleteChecklist}
            disabled={deleting}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete Checklist'}
          </button>
      </div>
          
      {/* Messages */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Add Item Form */}
      <div className="bg-white-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
        <form onSubmit={addItem} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter item"
              required
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newItemName.trim()}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>

      {/* Items List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Checklist Items ({checklist?.items?.length || 0})
        </h2>
        
        {checklist?.items?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No items in this checklist yet.</p>
            <p className="text-gray-400 text-sm">Add some items using the form above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checklist?.items?.map((item, index) => (
              <div key={item.id} className="flex items-start justify-between bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-sm bg-gray-200 rounded-full px-2 py-1 min-w-[24px] text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-700 ml-4 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  name="Delete item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewChecklist;