import React from 'react';
import { DashboardLayout } from '../components/dashboard/Layout';
import { AccountSettings } from '../components/dashboard/AccountSettings';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
        <AccountSettings />
      </div>
    </DashboardLayout>
  );
}