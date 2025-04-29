import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import SubCategoryTable from './SubCategoryTable';

export default function Customers() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 p-4">
        <SubCategoryTable />
      </main>
    </div>
  );
}
