import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import CategoryTable from './CategoryTable';

export default function Customers() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <CategoryTable />
    </main>
  </div>
  );
}
