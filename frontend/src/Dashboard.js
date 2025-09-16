import React from 'react';
import { Card, CardContent } from './components/Card'; // Replace with actual paths if needed
import { Button } from './components/Button'; // Replace with actual paths if needed
import { Clock, CheckCircle, Calendar } from 'lucide-react';
import './App.css';
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <div className="text-2xl font-bold text-center">TRAMONTO</div>
        <nav className="space-y-2">
          <div className="text-red-500 font-semibold">Dashboard</div>
          <div>Clients</div>
          <div>Labels</div>
          <div>Tests</div>
          <div>Manage</div>
          <div>Permissions</div>
          <div>Reports</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-semibold">Dashboard</div>
          <div className="flex items-center space-x-4">
            <span>EN</span>
            <div className="flex items-center space-x-1">
              <span></span>
              <span>Placeholder User</span> {/* Replace with dynamic user data */}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-red-500 text-white">
            <CardContent className="flex flex-col items-center p-4">
              <Clock size={32} />
              <div className="text-xl font-bold">15</div> {/* Replace with dynamic data */}
              <div>Pending tests</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500 text-white">
            <CardContent className="flex flex-col items-center p-4">
              <CheckCircle size={32} />
              <div className="text-xl font-bold">34</div> {/* Replace with dynamic data */}
              <div>Completed tests</div>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white">
            <CardContent className="flex flex-col items-center p-4">
              <Calendar size={32} />
              <div className="text-xl font-bold">41</div> {/* Replace with dynamic data */}
              <div>Reports submitted</div>
            </CardContent>
          </Card>
        </div>

        {/* Download Section */}
        <div className="bg-white p-6 shadow rounded text-center">
          <div className="text-4xl text-red-600"></div>
          <Button className="mt-4">Click here to download</Button>
          <p className="mt-2 text-gray-600">
            Explore Tramonto! Download the guide and start your testing journey.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-medium">Start a test</div>
              <p className="text-gray-500">Start now your test using Tramonto</p>
              <Button className="mt-4">Start</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-medium">Access your reports</div>
              <p className="text-gray-500">Here you can view the reports of your previous tests</p>
              <Button className="mt-4">Access</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-medium">Manage your clients</div>
              <p className="text-gray-500">Manage your clients' information simply and quickly</p>
              <Button className="mt-4">Manage</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}