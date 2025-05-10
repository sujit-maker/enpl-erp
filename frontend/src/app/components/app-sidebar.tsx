  "use client";
  import React, { useEffect, useState } from "react";
  import {
    BiUserCircle,
    BiCategory,
    BiStoreAlt,
    BiTask,
    BiSolidDashboard,
    BiServer,
  } from "react-icons/bi";
  import { ChevronDown, ChevronUp, Menu, Settings, X, LogOut } from "lucide-react";
  import { FaRegAddressBook, FaLock } from "react-icons/fa";
  import { useAuth } from "../hooks/useAuth";
  import { useRouter } from "next/navigation";
  
  export function AppSidebar() {
  const { userType } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
 
  const resetDropdowns = () => {
    setInventoryOpen(false);
    setServiceOpen(false);
    setAddressBookOpen(false);
  };
  
   // Define menu items
  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BiSolidDashboard },
    { title: "Departments", url: "/department", icon: BiStoreAlt },
    ...(userType === "SUPERADMIN"
      ? [{ title: "User Management", url: "/users", icon: BiUserCircle }]
      : []),
  ];

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      resetDropdowns();
    }
    setIsSidebarOpen(!isSidebarOpen);
  };
  

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-gray-900 text-white p-4 shadow-md w-full fixed top-0 left-0 z-50">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-gray-300"
          aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center">
          
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Sidebar */}
            <div
        className={`fixed top-0 left-0 z-40 h-full bg-gray-800 text-white transition-transform duration-300 ${
          isSidebarOpen ? "w-64" : "w-36"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-gray-900">
          <button
            onClick={toggleSidebar}
            className="text-white md:hidden flex hover:text-gray-300"
            aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>


        <div
        className={`fixed top-0 left-0 z-40 h-full bg-gray-800 text-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Menu Items */}
        <ul className="mt-28 space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.url}
                className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"
                aria-label={item.title}
              >
                <item.icon className="w-6 h-6 hover:text-gray-400" />
                {isSidebarOpen && <span className="ml-4">{item.title}</span>}
              </a>
            </li>
          ))}

          {/* Address Book Dropdown  */}
          <li>
            <button
              onClick={() => setAddressBookOpen(!addressBookOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg"
              aria-expanded={addressBookOpen ? "true" : "false"}
              aria-controls="address-book-dropdown"
            >
              <div className="flex items-center">
                <FaRegAddressBook className="w-6 h-6 hover:text-gray-400" />
                {isSidebarOpen && <span className="ml-4">Address Book</span>}
              </div>
              <span>
                {addressBookOpen ? <ChevronUp /> : <ChevronDown />}
              </span>
            </button>
            {addressBookOpen && (
              <ul id="address-book-dropdown" className="pl-8 mt-1 space-y-1 text-gray-400">
                <li>
                  <a
                    href="/vendor"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Vendors"
                  >
                    Vendors
                  </a>
                </li>
                <li>
                  <a
                    href="/customer"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Customers"
                  >
                    Customers
                  </a>
                </li>
                <li>
                  <a
                    href="/site"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Customer Sites"
                  >
                   Customer Sites
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Service Management Dropdown */}
          <li>
            <button
              onClick={() => setServiceOpen(!serviceOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg"
              aria-expanded={serviceOpen ? "true" : "false"}
              aria-controls="service-dropdown"
            >
              <div className="flex items-center">
                <Settings className="w-6 h-6 hover:text-gray-400" />
                {isSidebarOpen && <span className="ml-4">Service Management</span>}
              </div>
              <span>
                {serviceOpen ? <ChevronUp /> : <ChevronDown />}
              </span>
            </button>
            {serviceOpen && (
              <ul id="service-dropdown" className="pl-8 mt-1 space-y-1 text-gray-400">
                
                <li>
                  <a
                    href="/serviceCategory"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Service Category"
                  >
                    Service Category
                  </a>
                </li>
                <li>
                  <a
                    href="/serviceSubCategory"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Service SubCategory"
                  >
                    Service SubCategory
                  </a>
                </li>
                <li>
                  <a
                    href="/service"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Service Management"
                  >
                    Service SKU
                  </a>
                </li>
                <li>
                  <a
                    href="/servicecontract"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Service Contracts"
                  >
                    Service Contracts
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Inventory Dropdown */}
          <li>
            <button
              onClick={() => setInventoryOpen(!inventoryOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-700 rounded-lg"
              aria-expanded={inventoryOpen ? "true" : "false"}
              aria-controls="inventory-dropdown"
            >
              <div className="flex items-center">
                <BiCategory className="w-6 h-6 hover:text-gray-400" />
                {isSidebarOpen && <span className="ml-4">Inventory Management</span>}
              </div>
              <span>
                {inventoryOpen ? <ChevronUp /> : <ChevronDown />}
              </span>
            </button>
            {inventoryOpen && (
              <ul id="inventory-dropdown" className="pl-8 mt-1 space-y-1 text-gray-400">
                <li>
                  <a
                    href="/category"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Product Category"
                  >
                    Product Category
                  </a>
                </li>
                <li>
                  <a
                    href="/subCategory"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Product SubCategory"
                  >
                  Product SubCategory
                  </a>
                </li>
                <li>
                  <a
                    href="/product"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Product SKU"
                  >
                    Product SKU
                  </a>
                </li>
                <li>
                  <a
                    href="/inventory"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Inventory"
                  >
                    Inventory
                  </a>
                </li>
                <li>
                  <a
                    href="/purchaseInvoice"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Purchase Invoice"
                  >
                    Purchase Invoice
                  </a>
                </li>
                <li>
                  <a
                    href="/material"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Material Delivery"
                  >
                    Material Outward
                  </a>
                </li>
                <li>
                  <a
                    href="/vendorPayment"
                    className="block px-2 py-1 hover:bg-gray-700 hover:text-white rounded"
                    aria-label="Material Delivery"
                  >
                    Vendors Payment
                  </a>
                </li>
              </ul>
            )}
          </li>

       
          

          {/* Task Management */}
          <li>
            <a
              href="/task"
              className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"
              aria-label="Task Management"
            >
              <BiTask className="w-6 h-6 hover:text-gray-400" />
              {isSidebarOpen && <span className="ml-4">Task Management</span>}
            </a>
          </li>
        </ul>
        </div>
      </div>
    </div>
  );
}
