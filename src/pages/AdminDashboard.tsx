import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { DashboardLayout } from '../components/dashboard/Layout';
import { UserManagement } from '../components/admin/UserManagement';
import { SystemSettings } from '../components/admin/SystemSettings';
import { ActivityLogs } from '../components/admin/ActivityLogs';
import { useRole } from '../hooks/useRole';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { role, loading: roleLoading } = useRole();

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden-500" />
      </div>
    );
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="security">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <h2 className="text-xl font-semibold">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Authentication</h3>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="twoFactor" className="rounded border-gray-300" />
                    <label htmlFor="twoFactor">Require two-factor authentication for all users</label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Session Management</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Session Timeout (minutes)</label>
                      <input type="number" className="mt-1 block w-full rounded-md border-gray-300" min="5" max="120" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Max Login Attempts</label>
                      <input type="number" className="mt-1 block w-full rounded-md border-gray-300" min="3" max="10" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Password Policy</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="uppercase" className="rounded border-gray-300" />
                      <label htmlFor="uppercase">Require uppercase letters</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="numbers" className="rounded border-gray-300" />
                      <label htmlFor="numbers">Require numbers</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="special" className="rounded border-gray-300" />
                      <label htmlFor="special">Require special characters</label>
                    </div>
                  </div>
                </div>

                <button className="px-4 py-2 bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors">
                  Save Security Settings
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <ActivityLogs />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}