'use client';
import React, { useEffect, useState } from 'react';
import { FaUsers, FaStore, FaBoxes, FaSitemap, FaProductHunt, FaPage4, FaSwatchbook, FaInvision, FaAmazon, FaMoneyBill, FaDemocrat, FaOutdent } from 'react-icons/fa';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    vendors: 0,
    customers: 0,
    sites:0,
    products: 0,
    purchaseRate:0,
    soldPurchaseRate:0,
    restPurchaseRate:0,
    purchaseInvoice:0,
    dueAmount:0,
    demoOut:0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [vendorsRes, customersRes, sitesRes, productsRes,purchaseRateRes,soldPurchaseRateRes,restPurchaseRateRes,purchaseInvoiceRes,dueAmountRes,demoOutRes] = await Promise.all([
          fetch('http://128.199.19.28:8000/vendors/count'),
          fetch('http://128.199.19.28:8000/customers/count'),
          fetch('http://128.199.19.28:8000/sites/count'),
          fetch('http://128.199.19.28:8000/products/count'),
          fetch('http://128.199.19.28:8000/inventory/purchaseRate/count'),
          fetch('http://128.199.19.28:8000/inventory/sold/purchaseRate'),
          fetch('http://128.199.19.28:8000/inventory/rest/sold'),
          fetch('http://128.199.19.28:8000/inventory/count/purchaseInvoice'),
          fetch('http://128.199.19.28:8000/inventory/count/dueAmount'),
          fetch('http://128.199.19.28:8000/inventory/count/demo'),
        ]);

        const [vendors, customers,sites, products,purchaseRate, soldPurchaseRate,restPurchaseRate,purchaseInvoice,dueAmount,demoOut] = await Promise.all([
          vendorsRes.json(),
          customersRes.json(),
          sitesRes.json(),
          productsRes.json(),
          purchaseRateRes.json(),
          soldPurchaseRateRes.json(),
          restPurchaseRateRes.json(),
          purchaseInvoiceRes.json(),
          dueAmountRes.json(),
          demoOutRes.json()
        ]);

        setCounts({ vendors, customers, sites, products,purchaseRate, soldPurchaseRate,restPurchaseRate,purchaseInvoice,dueAmount,demoOut });
      } catch (error) {
        console.error('Failed to fetch counts', error);
      }
    };

    fetchCounts();
  }, []);

  const cards = [
    {
      label: 'Total No. of Vendors',
      count: counts.vendors,
      icon: <FaUsers className="text-4xl text-indigo-500" />,
      bg: 'bg-indigo-200',
    },
    {
      label: 'Total No. of Customers',
      count: counts.customers,
      icon: <FaStore className="text-4xl text-green-500" />,
      bg: 'bg-green-200',
    },
    {
      label: 'Total No. of Sites',
      count: counts.sites,
      icon: <FaSitemap className="text-4xl text-blue-500" />,
      bg: 'bg-blue-200',
    },
    {
      label: 'Total No. of Products',
      count: counts.products,
      icon: <FaBoxes className="text-4xl text-orange-500" />,
      bg: 'bg-orange-200',
    },
    {
      label: 'Total Inventory Purchase Value',
      count: counts.purchaseRate,
      icon: <FaProductHunt className="text-4xl text-yellow-500" />,
      bg: 'bg-yellow-200',
    },
     {
      label: 'Total Inventory Sold Value',
      count: counts.soldPurchaseRate,
      icon: <FaPage4 className="text-4xl text-red-500" />,
      bg: 'bg-red-200',
    },
    {
      label: 'Total Inventory Stock Value',
      count: counts.restPurchaseRate,
      icon: <FaSwatchbook className="text-4xl text-red-500" />,
      bg: 'bg-red-200',
    },
    {
      label: 'Total No. of Purchase Invoices',
      count: counts.purchaseInvoice,
      icon: <FaInvision className="text-4xl text-red-500" />,
      bg: 'bg-gray-400',
    },
    {
      label: 'Total Purchase Invoice Due Amount',
      count: counts.dueAmount,
      icon: <FaMoneyBill className="text-4xl text-red-500" />,
      bg: 'bg-green-200',
    },
    {
      label: 'Total No. of Inventory on Demo',
      count: counts.demoOut,
      icon: <FaOutdent className="text-4xl text-red-500" />,
      bg: 'bg-purple-400',
    },
  ];

  return (
    <div className="p-6 pl-64 min-h-screen bg-gray-50"> {/* pl-64 to offset sidebar */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-lg p-6 hover:scale-105 transition-transform duration-300 ${card.bg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">{card.label}</h2>
                <p className="text-3xl font-bold text-gray-900">{card.count}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
