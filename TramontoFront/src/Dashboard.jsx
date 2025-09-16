import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <div className="text-2xl font-bold text-center">TRAMONTO</div>
        <nav className="space-y-2">
          <Link to="/dashboard" className="text-red-500 font-semibold">Dashboard</Link>
          <Link to="/tests" className="hover:text-red-500">Tests</Link>
          <Link to="/viewprofile" className="hover:text-red-500">view Profile</Link>
          <div>Clients</div>
          <div>Labels</div>
          <div>Manage</div>
          <div>Permissions</div>
          <div>Reports</div>
          <Link to="/tools" className="hover:text-red-500">Tools</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
      </main>
    </div>
  );
}