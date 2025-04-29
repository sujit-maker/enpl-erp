import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import DepartmentTable from './departmentTable';
export default function Department() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 p-4">
        <DepartmentTable />
      </main>
    </div>
  );
}
