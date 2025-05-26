  "use client";
  import React, { useEffect, useState } from "react";
  import {
    BiCategory,
    BiStoreAlt,
    BiTask,
    BiSolidDashboard,
  } from "react-icons/bi";
  import {
    ChevronDown,
    ChevronUp,
    Menu,
    X,
    LogOut,
    LucideSettings,
  } from "lucide-react";
  import { FaRegAddressBook, FaTicketAlt, FaUser } from "react-icons/fa";
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

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BiSolidDashboard },
    { title: "Departments", url: "/department", icon: BiStoreAlt },
    ...(userType === "SUPERADMIN"
      ? [{ title: "User Management", url: "/users", icon: FaUser }]
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
      {/* Header with Logout */}
      <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-400 p-4 shadow-lg flex justify-between items-center text-white">
        <button onClick={toggleSidebar} className="md:hidden">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-xl font-semibold">Inventory Management</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl shadow-md"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        } pt-20 overflow-y-auto shadow-xl`}
      >
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.url}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-indigo-600 transition duration-200 group"
              >
                <item.icon className="w-6 h-6 group-hover:text-white text-indigo-300" />
                {isSidebarOpen && <span>{item.title}</span>}
              </a>
            </li>
          ))}

          {/* Dropdown Groups */}
          {[
            {
              label: "Address Book",
              icon: <FaRegAddressBook className="w-6 h-6" />,
              open: addressBookOpen,
              setOpen: setAddressBookOpen,
              items: [
                { label: "Vendors", url: "/vendor" },
                { label: "Customers", url: "/customer" },
                { label: "Customer Sites", url: "/site" },
              ],
            },
            {
              label: "Services",
              icon: <LucideSettings className="w-6 h-6" />,
              open: serviceOpen,
              setOpen: setServiceOpen,
              items: [
                { label: "Service Category", url: "/serviceCategory" },
                { label: "Service SubCategory", url: "/serviceSubCategory" },
                { label: "Service SKU", url: "/service" },
                { label: "Service Contracts", url: "/servicecontract" },
              ],
            },
            
            {
              label: "Inventory",
              icon: <BiCategory className="w-6 h-6" />,
              open: inventoryOpen,
              setOpen: setInventoryOpen,
              items: [
                { label: "Product Category", url: "/category" },
                { label: "Product SubCategory", url: "/subCategory" },
                { label: "Product SKU", url: "/product" },
                { label: "Inventory", url: "/inventory" },
                { label: "Purchase Invoice", url: "/purchaseInvoice" },
                { label: "Material Outward", url: "/material" },
                { label: "Vendors Payment", url: "/vendorPayment" },
              ],
            },
          ].map((section, i) => (
            <li key={i}>
              <button
                onClick={() => section.setOpen(!section.open)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-indigo-600 transition duration-200"
              >
                <div className="flex items-center gap-4">
                  {section.icon}
                  {isSidebarOpen && <span>{section.label}</span>}
                </div>
                {isSidebarOpen && (
                  <span>{section.open ? <ChevronUp /> : <ChevronDown />}</span>
                )}
              </button>
              {section.open && (
                <ul className="ml-8 mt-1 space-y-1 text-indigo-200">
                  {section.items.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        className="block px-2 py-1 hover:bg-indigo-700 hover:text-white rounded transition"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          
          {/* Task Management */}
          <li>
            <a
              href="/task"
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-indigo-600 transition duration-200"
            >
              <BiTask className="w-7 h-7 text-indigo-300 group-hover:text-white" />
              {isSidebarOpen && <span>Task Management</span>}
            </a>
          </li>

           <li>
            <a
              href="/ticket"
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-indigo-600 transition duration-200"
            >
              <FaTicketAlt className="w-7 h-7 text-indigo-300 group-hover:text-white" />
              {isSidebarOpen && <span>Support Ticket</span>}
            </a>
          </li>
            
        </ul>
      </div>
    </div>
  );
}
