import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import ServiceTable from './ServiceTable';

export default function Services() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <ServiceTable />
    </main>
  </div>
  );
}
