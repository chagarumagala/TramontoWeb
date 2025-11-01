import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateVuln({ isEditMode = false }) {
  const [vuln,setVuln]=useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(true);
  const [code, setCode] = useState('');
  const [tools, setTools] = useState([]); // List of all tool
  const [selectedTools, setSelectedTools] = useState([]); // Selected tool IDs
  const [expected_results, setExpectedResults] = useState('');
  const [actual_results, setActualResults] = useState('');
  const [attack_vector, setAttackVector] = useState('N');
    const [attack_complexity, setAttackComplexity] = useState('L');
    const [privileges_required, setPrivilegesRequired] = useState('N');
    const [user_interaction, setUserInteraction] = useState('N');
    const [scope, setScope] = useState('U');
    const [confidentiality, setConfidentiality] = useState('N');
    const [integrity, setIntegrity] = useState('N');
    const [availability, setAvailability] = useState('N');
  const [recommendation, setRecommendation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { testId } = useParams(); // Get test ID from URL
 const{vulnId} = useParams();
  // Fetch existing test data if in edit mode
  useEffect(() => {
    
    if (isEditMode) {
      const fetchVuln = async () => {
        try { 
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.get(`http://127.0.0.1:8000/vulnerabilities/${vulnId}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const vuln = response.data;
          setVuln(vuln.vuln);
            setDescription(vuln.description);
            setSuccess(vuln.success);
            setRecommendation(vuln.recommendation);
            setExpectedResults(vuln.expected_results);
            setActualResults(vuln.actual_results);
            setAttackVector(vuln.attack_vector);
            setAttackComplexity(vuln.attack_complexity);
            setPrivilegesRequired(vuln.privileges_required);
            setUserInteraction(vuln.user_interaction);
            setScope(vuln.scope);
            setConfidentiality(vuln.confidentiality);
            setIntegrity(vuln.integrity);
            setAvailability(vuln.availability);

          setCode(vuln.code);
        } catch (err) {
          console.error('Error fetching vuln:', err.response?.data);
          setErrorMessage('Failed to load vuln details.');
        }
      };

      fetchVuln();
    }
    const fetchTools = async () => {
        try { 
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.get('http://127.0.0.1:8000/tools/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }); 
          setTools(response.data.tools);
        } catch (err) {
          console.error('Error fetching tools:', err.response?.data);
        }
      };
    fetchTools();
  }, [isEditMode, vulnId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('access_token');
      if (isEditMode) {
        // Update existing test
        await axios.put(
          `http://127.0.0.1:8000/tests/${testId}/vulnerabilities/${vulnId}/edit/`,
          {
            vuln,
            description,
            success,
            code ,
            attack_vector ,
            attack_complexity  ,
            expected_results,
            actual_results,
            privileges_required ,
            user_interaction ,
            scope,
            confidentiality ,
            integrity ,
            availability ,
            tools:selectedTools,
            recommendation
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
          
        );
        
        setSuccessMessage('vuln updated successfully!');
      } else {
        // Create new test
        await axios.post(
          `http://127.0.0.1:8000/tests/${testId}/vulnerabilities/create/`,
          {
            vuln,
            description,
            success,
            code ,
            attack_vector ,
            attack_complexity  ,
            expected_results,
            actual_results,
            privileges_required ,
            user_interaction ,
            scope,
            confidentiality ,
            integrity ,
            availability ,
            tools:selectedTools,
            recommendation,
            test_id: testId
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setSuccessMessage('vuln created successfully!');
      }
      navigate(`/tests/${testId}`, { state: { activeTab: 'vulnerabilities' } }); // Redirect to tests page
    } catch (err) {
      console.error('Error submitting vuln:', err.response?.data);
      setErrorMessage('Failed to submit vuln.');
    }
  };
  const handleToolSelection = (toolId) => {
    console.log('Toggling tool:', toolId);
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId) // Remove if already selected
        : [...prev, toolId] // Add if not selected
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEditMode ? 'Edit Vulnerability' : 'Create Vulnerability'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white-700">Title:</label>
            <input
              type="text"
              value={vuln}
              onChange={(e) => setVuln(e.target.value)}
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
          <div className="mb-4">
  <label className="flex items-center space-x-2">
  <span className="text-gray-700 ">Was the exploit successful?  </span>
    <input
      type="checkbox"
      checked={success}
      onChange={(e) => setSuccess(e.target.checked)}
      className="form-checkbox h-5 w-5 text-blue-600 ml-5"
    />
    
  </label>
</div>
        
      {success && (
        <>
          <div>
            <label className="block text-white-700">CVE code:</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white-700">expected result:</label>
            <textarea
              value={expected_results}
              onChange={(e) => setExpectedResults(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-white-700">actual result:</label>
            <textarea
              value={actual_results}
              onChange={(e) => setActualResults(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-white-700">recommendation:</label>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        <div>
        <label className="block text-white-700">Attack Vector:</label>
        <div className="space-y-2">
            <label className="flex items-white space-x-2">
            <input
                type="radio"
                name="attack_vector"
                value="N"
                checked={attack_vector === 'N'}
                onChange={(e) => setAttackVector(e.target.value)}
                className="form-radio"
            />
            <span>Network</span>
            </label>
            <label className="flex items-white space-x-2">
            <input
                type="radio"
                name="attack_vector"
                value="A"
                checked={attack_vector === 'A'}
                onChange={(e) => setAttackVector(e.target.value)}
                className="form-radio"
            />
            <span>Adjacent network</span>
            </label>
            <label className="flex items-white space-x-2">
            <input
                type="radio"
                name="attack_vector"
                value="L"
                checked={attack_vector === 'L'}
                onChange={(e) => setAttackVector(e.target.value)}
                className="form-radio"
            />
            <span>Local</span>
            </label>
            <label className="flex items-white space-x-2">
            <input
                type="radio"
                name="attack_vector"
                value="P"
                checked={attack_vector === 'P'}
                onChange={(e) => setAttackVector(e.target.value)}
                className="form-radio"
            />
            <span>Physical</span>
            </label>
        </div>
        </div>
        <div>
  <label className="block text-white-700">Attack Complexity:</label>
  <div className="space-y-2">
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="attack_complexity"
        value="L"
        checked={attack_complexity === 'L'}
        onChange={(e) => setAttackComplexity(e.target.value)}
        className="form-radio"
      />
      <span>Low</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="attack_complexity"
        value="H"
        checked={attack_complexity === 'H'}
        onChange={(e) => setAttackComplexity(e.target.value)}
        className="form-radio"
      />
      <span>High</span>
    </label>
  </div>
</div>
<div>
  <label className="block text-white-700">Privileges Required:</label>
  <div className="space-y-2">
  <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="privileges_required"
        value="N"
        checked={privileges_required === 'N'}
        onChange={(e) => setPrivilegesRequired(e.target.value)}
        className="form-radio"
      />
      <span>None</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="privileges_required"
        value="L"
        checked={privileges_required === 'L'}
        onChange={(e) => setPrivilegesRequired(e.target.value)}
        className="form-radio"
      />
      <span>Low</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="privileges_required"
        value="H"
        checked={privileges_required === 'H'}
        onChange={(e) => setPrivilegesRequired(e.target.value)}
        className="form-radio"
      />
      <span>High</span>
    </label>
  </div>
</div>
<div>
  <label className="block text-white-700">User Interaction:</label>
  <div className="space-y-2">
  <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="user_interaction"
        value="N"
        checked={user_interaction === 'N'}
        onChange={(e) => setUserInteraction(e.target.value)}
        className="form-radio"
      />
      <span>None</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="user_interaction"
        value="R"
        checked={user_interaction === 'R'}
        onChange={(e) => setUserInteraction(e.target.value)}
        className="form-radio"
      />
      <span>Required</span>
    </label>
    </div>
    </div>
    <div>
  <label className="block text-white-700">Scope:</label>
  <div className="space-y-2">
  <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="scope"
        value="U"
        checked={scope === 'U'}
        onChange={(e) => setScope(e.target.value)}
        className="form-radio"
      />
      <span>Unchanged</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="scope"
        value="C"
        checked={scope === 'C'}
        onChange={(e) => setScope(e.target.value)}
        className="form-radio"
      />
      <span>Changed</span>
    </label>
    </div>
    </div>
    <div>
  <label className="block text-white-700">Confidentiality Impact:</label>
  <div className="space-y-2">
  <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="confidentiality"
        value="N"
        checked={confidentiality === 'N'}
        onChange={(e) => setConfidentiality(e.target.value)}
        className="form-radio"
      />
      <span>None</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="confidentiality"
        value="L"
        checked={confidentiality === 'L'}
        onChange={(e) => setConfidentiality(e.target.value)}
        className="form-radio"
      />
      <span>Low</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="confidentiality"
        value="H"
        checked={confidentiality === 'H'}
        onChange={(e) => setConfidentiality(e.target.value)}
        className="form-radio"
      />
      <span>High</span>
    </label>
    </div>
    </div>
    <div>
  <label className="block text-white-700">Integrity Impact:</label>
  <div className="space-y-2">
  <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="integrity"
        value="N"
        checked={integrity === 'N'}
        onChange={(e) => setIntegrity(e.target.value)}
        className="form-radio"
      />
      <span>None</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="integrity"
        value="L"
        checked={integrity === 'L'}
        onChange={(e) => setIntegrity(e.target.value)}
        className="form-radio"
      />
      <span>Low</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="integrity"
        value="H"
        checked={integrity === 'H'}
        onChange={(e) => setIntegrity(e.target.value)}
        className="form-radio"
      />
      <span>High</span>
    </label>
    </div>
    </div>
    <div>
  <label className="block text-white-700">Availability Impact:</label>
  <div className="space-y-2">
  <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="availability"
        value="N"
        checked={availability === 'N'}
        onChange={(e) => setAvailability(e.target.value)}
        className="form-radio"
      />
      <span>None</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="availability"
        value="L"
        checked={availability === 'L'}
        onChange={(e) => setAvailability(e.target.value)}
        className="form-radio"
      />
      <span>Low</span>
    </label>
    <label className="flex items-white space-x-2">
      <input
        type="radio"
        name="availability"
        value="H"
        checked={availability === 'H'}
        onChange={(e) => setAvailability(e.target.value)}
        className="form-radio"
      />
      <span>High</span>
    </label>
    </div>
    </div>
    <div className="mb-4">
        <label className="block text-gray-700 mb-2">Associated Tools</label>
        <div className="space-y-2">
          {tools.map((tool) => (
            <label key={tool.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={tool.id}
                checked={selectedTools.includes(tool.id)}
                onChange={() => handleToolSelection(tool.id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>{tool.name}</span>
            </label>
          ))}
        </div>
      </div>
    </>

)}
 
          {/* Add other fields (knowledge, aggressivity, etc.) here */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            {isEditMode ? 'Update Vulnerability' : 'Create Vulnerability'}
          </button>
        </form>
        {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
      </div>
    </div>
  );
}