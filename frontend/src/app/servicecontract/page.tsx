import React from 'react';
import ServiceContractTable from './ServiceContractTable';
import { AppSidebar } from '../components/app-sidebar';

export default function ServiceContracts() {
  return (
    <div className="flex h-screen">
      <AppSidebar/>
    <main className="flex-1 p-4">
      <ServiceContractTable />
    </main>
  </div>
  );
}
