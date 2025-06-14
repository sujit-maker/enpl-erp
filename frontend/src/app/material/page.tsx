import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import MaterialDeliveryTable from './materialTable';

export default function Material() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <MaterialDeliveryTable />
    </main>
  </div>
  );
}
