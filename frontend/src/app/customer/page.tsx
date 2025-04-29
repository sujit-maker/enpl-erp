import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import CustomerTable from './CustomerTable';

export default function Customers() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <CustomerTable />
    </main>
  </div>
  );
}
