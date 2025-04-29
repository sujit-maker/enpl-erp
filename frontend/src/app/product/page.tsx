import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import ProductTable from './ProductTable';

export default function Products() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <ProductTable />
    </main>
  </div>
  );
}
