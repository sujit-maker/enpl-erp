import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import UserTable from './userTable';

export default function Users() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 p-4">
        <UserTable />
      </main>
    </div>
  );
}
