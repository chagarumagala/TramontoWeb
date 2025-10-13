import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './Login';
import Dashboard from './Dashboard';
import Tests from './Tests';
import EditProfile from './EditProfile';
import ViewProfile from './ViewProfile';
import CreateTest from './CreateTest';
import ViewTest from './ViewTest';
import CreateProfile from './CreateProfile';
import Tools from './Tools';
import CreateTool from './CreateTool';
import ViewTool from './ViewTool';
import Header from './Header';
import Checklists from './Checklists';
import CreateChecklist from './CreateChecklist';
import ViewChecklist from './ViewChecklist';
import CreateVuln from './CreateVuln';
import Chatroom from './Chatroom';
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (no Header/Sidebar) */}
        <Route path="/" element={<Login />} />
        <Route path="/api/register" element={<CreateProfile />} />

        {/* Protected routes wrapped by Header (includes sidebar + <Outlet />) */}
        <Route element={<Header />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/viewprofile" element={<ViewProfile />} />
          <Route path="/tests/create" element={<CreateTest />} />
          <Route path="/tests/:testId" element={<ViewTest />} />
          <Route path="/tests/:testId/update" element={<CreateTest isEditMode={true} />} />
          <Route path="/tests/:testId/delete" element={<ViewTest />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/create" element={<CreateTool />} />
          <Route path="/tools/:toolId" element={<ViewTool />} />
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/checklists/create" element={<CreateChecklist />} />
          <Route path="/checklists/:checklistId" element={<ViewChecklist />} />
          <Route path="/tests/:testId/vulnerabilities/create" element={<CreateVuln />} />
          <Route path="/tests/:testId/vulnerabilities/:vulnId/edit" element={<CreateVuln isEditMode={true}/>} />
          <Route path="/tests/:testId/chat" element={<Chatroom />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
