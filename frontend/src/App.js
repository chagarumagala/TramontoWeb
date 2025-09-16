import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login'; // Import the Login component
import Dashboard from './Dashboard';
import './App.css';
import Tests from './Tests'; // Import the Tests component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tests" element={<Tests />} />
      </Routes>
    </Router>
  );
}

export default App;