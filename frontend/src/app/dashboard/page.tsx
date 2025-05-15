import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import Dashboard from './dashboard';
export default function Department() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 p-4">
        <Dashboard />
      </main>
    </div>
  );
}
