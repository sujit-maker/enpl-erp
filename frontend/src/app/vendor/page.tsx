import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import VendorTable from './VendorTable';

export default function Vendors() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <VendorTable />
    </main>
  </div>
  );
}
