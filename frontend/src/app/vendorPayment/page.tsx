import React from 'react';
import { AppSidebar } from '../components/app-sidebar';
import VendorPaymentTable from './vendorPaymentTable';

export default function VendorPayment() {
  return (
    <div className="flex h-screen">
    <AppSidebar />
    <main className="flex-1 p-4">
      <VendorPaymentTable/>
    </main>
  </div>
  );
}
