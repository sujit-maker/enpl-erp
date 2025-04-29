import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import ServiceContractTable from './ServiceContractTable';

export default function Users() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
        <ServiceContractTable/>
    </main>
  </div>
  );
}
