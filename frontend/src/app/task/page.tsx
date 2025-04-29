import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import TaskTable from './TasktTable';

export default function Vendors() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <TaskTable />
    </main>
  </div>
  );
}
