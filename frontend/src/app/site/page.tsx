import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import SiteTable from './SiteTable';

export default function Users() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <SiteTable />
    </main>
  </div>
  );
}
