import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import ServiceSubCategoryTable from './serviceSubCategoryTable';

export default function ServiceSubCategory() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <ServiceSubCategoryTable />
    </main>
  </div>
  );
}
