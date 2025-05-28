"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Dialog } from "@headlessui/react";
import { AppSidebar } from "../components/app-sidebar";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import { CustomerCombobox } from "@/components/ui/CustomerCombobox";
import { FiMoreVertical } from "react-icons/fi";
import { FaReply } from "react-icons/fa";


interface Customer {
  id: number;
  customerName: string;
}

interface Site {
  id: number;
  siteName: string;
}

type Ticket = {
  id: number;
  ticketId: string;
  title: string;
  description: string;
  customerId: number;
  siteId: number;
  status: string;
  createdAt: string;
  createdById: number;
  assignedToId: number | null;
  categoryName: string;
  subCategoryName: string;
  serviceCategoryName: string[];
  contactPerson: string;
  mobileNo: number;
  proposedDate?: string;
  priority: string;
  customer?: {
    id: number;
    customerName: string;
  };
  site?: {
    id: number;
    siteName: string;
  }
};

type Message = {
  id: number;
  content: string;
  senderId: number;
  sender?: {
    id: number;
    username: string;
  };
  ticketId: number;
  createdAt: string;
  status?: string;

};

export default function TicketPage() {
  const { userId } = useAuth();
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);  // For table
  const [sites, setSites] = useState<Site[]>([]); // For form dropdown
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    customerId: 0,
    siteId: 0,
    title: "",
    description: "",
    categoryName: "",
    subCategoryName: "",
    serviceCategoryName: [] as string[],
    contactPerson: "",
    mobileNo: "",
    proposedDate: "",
    priority: "MEDIUM",
    manCustm: "",
    manSite: "",
  });

  useEffect(() => {
    fetchCustomers();
    fetchAllSites();
  }, []);

  useEffect(() => {
    if (userId) fetchTickets();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);




  const headers = [
    { label: "Creation Date", key: "creationDate" },
    { label: "Support Ticket ID", key: "ticketId" },
    { label: "Category", key: "categoryName" },
    { label: "Sub Category", key: "subCategoryName" },
    { label: "Customer Name", key: "customerName" },
    { label: "Site Name", key: "siteName" },
    { label: "Proposed Date & Time", key: "proposedDate" },
    { label: "Priority", key: "priority" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();
    return (
      ticket.createdAt.toLowerCase().includes(query) ||
      ticket.ticketId.toLowerCase().includes(query) ||
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query) ||
      ticket.categoryName.toLowerCase().includes(query) ||
      ticket.subCategoryName.toLowerCase().includes(query) ||
      ticket.status.toLowerCase().includes(query) ||
      ticket.priority.toLowerCase().includes(query) ||
      customers
        .find((c) => c.id === ticket.customerId)
        ?.customerName.toLowerCase()
        .includes(query) ||
      sites
        .find((s) => s.id === ticket.siteId)
        ?.siteName.toLowerCase()
        .includes(query)
    );
  });

  const sortedTickets = React.useMemo(() => {
    if (!sortField) return filteredTickets;

    return [...filteredTickets].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "customerName") {
        aValue =
          customers.find((c) => c.id === a.customerId)?.customerName || "";
        bValue =
          customers.find((c) => c.id === b.customerId)?.customerName || "";
      } else if (sortField === "siteName") {
        aValue = sites.find((s) => s.id === a.siteId)?.siteName || "";
        bValue = sites.find((s) => s.id === b.siteId)?.siteName || "";
      } else {
        aValue = a[sortField as keyof Ticket] ?? "";
        bValue = b[sortField as keyof Ticket] ?? "";
      }

      // For dates (assuming ISO strings)
      if (sortField.toLowerCase().includes("date")) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      // For strings and other fields
      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredTickets, sortField, sortOrder, customers, sites]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;

  const currentTickets = sortedTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const totalPages = Math.ceil(sortedTickets.length / ticketsPerPage);

  const fetchTickets = async () => {
    try {
      if (!userId) {
        setTickets([]);
        return;
      }

      const res = await axios.get(
        `http://128.199.19.28:8000/tickets/user/${userId}`
      );
      setTickets(res.data.reverse()); // Reverse to show latest first
      console.log("Logged-in userId:", userId);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      setTickets([]);
    }
  };

  const fetchCustomers = async () => {
    const res = await axios.get("http://128.199.19.28:8000/customers");
    setCustomers(res.data);
  };

  const fetchAllSites = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/sites");
      setAllSites(response.data); // ✅ Only for table
    } catch (error) {
      console.log("Error fetching all sites:", error);
    }
  };

  const fetchSitesByCustomer = async (customerId: number) => {
    const res = await axios.get(
      `http://128.199.19.28:8000/sites/customer/${customerId}`
    );
    setSites(res.data);
  };

  const fetchTicketDetails = async (id: number) => {
    const res = await axios.get(`http://128.199.19.28:8000/tickets/${id}`);
    setSelectedTicket(res.data);
    const msgRes = await axios.get(`http://128.199.19.28:8000/message/${id}`);
    setMessages(msgRes.data);
  };

  const handleCustomerChange = (customerId: number) => {
    setForm({ ...form, customerId, siteId: 0 }); 
    if (customerId) fetchSitesByCustomer(customerId);
    else setSites([]); 
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.post("http://128.199.19.28:8000/tickets", {
      ...form,
      createdBy: userId,
      assignedTo: 61,
      proposedDate: new Date(form.proposedDate),
      serviceCategoryName: form.serviceCategoryName.join(","),
    });
    alert("ticket created successfully");

    setForm({
      customerId: 0,
      siteId: 0,
      title: "",
      description: "",
      categoryName: "",
      subCategoryName: "",
      serviceCategoryName: [],
      contactPerson: "",
      mobileNo: "",
      proposedDate: "",
      priority: "",
      manCustm: "",
      manSite: "",
    });
    setTicketModalOpen(false);
    fetchTickets();
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      // Send message
      await axios.post("http://128.199.19.28:8000/message", {
        content: newMessage,
        senderId: userId,
        ticketId: selectedTicket.id,
      });

      // If the user replying is the assignedTo user & ticket is still OPEN, set to IN_PROGRESS
      if (
        selectedTicket.assignedToId === userId &&
        selectedTicket.status === "OPEN"
      ) {
        await axios.patch(`http://128.199.19.28:8000/tickets/${selectedTicket.id}`, {
          status: "IN_PROGRESS",
        });
      }

      setNewMessage("");
      await fetchTicketDetails(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    axios.get(`http://128.199.19.28:8000/users/${userId}`).then((res) => {
      setCurrentUser(res.data);
    });
  }, [userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isChatModalOpen && selectedTicket) {
      // Poll every 3 seconds
      interval = setInterval(() => {
        fetchTicketDetails(selectedTicket.id);
      }, 3000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isChatModalOpen, selectedTicket]);

  const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
      <label className="font-medium text-gray-600">{label}</label>
      <p className="text-gray-800">{value}</p>
    </div>
  );

  const getNextStatus = (status: string) => {
    switch (status) {
      case "OPEN":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "RESOLVED";
      case "RESOLVED":
        return "CLOSED";
      case "CLOSED":
        return "REOPENED";
      case "REOPENED":
        return "IN_PROGRESS";
      default:
        return null;
    }
  };



  return (
    <>
      <div className="flex h-screen mt-3">
        <div className="flex-1 p-3 overflow-auto lg:ml-72 ">
          <div className="flex justify-between items-center mb-5 mt-16">
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
              onClick={() => setTicketModalOpen(true)}
            >
              Add Ticket
            </button>
            <input
              type="text"
              placeholder="Search tickets..."
              className="border p-2 rounded w-1/3"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Ticket Modal */}
          <Dialog
            open={isTicketModalOpen}
            onClose={() => setTicketModalOpen(false)}
            className="relative z-50"
          >
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
            {/* Centered Scrollable Modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
              <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
                <Dialog.Title className="text-lg font-semibold mb-4">Create New Ticket</Dialog.Title>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}

                    <select
                      className="border p-2 rounded"
                      value={form.categoryName}
                      onChange={(e) => {
                        const selectedCategory = e.target.value;
                        setForm({
                          ...form,
                          categoryName: selectedCategory,
                          subCategoryName: "",
                        });
                      }}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="PreSales">PreSales</option>
                      <option value="On-Site Visit">On-Site Visit</option>
                      <option value="Remote Support">Remote Support</option>
                      <option value="Others">Others</option>
                    </select>



                    {/* SubCategory */}
                    <select
                      className="border p-2 rounded"
                      value={form.subCategoryName}
                      onChange={(e) =>
                        setForm({ ...form, subCategoryName: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Sub Category</option>
                      {form.categoryName === "PreSales" && (
                        <>
                          <option value="BoM">BoM</option>
                          <option value="SiteSurvey">SiteSurvey</option>
                          <option value="Projects">Projects</option>
                        </>
                      )}
                      {form.categoryName === "On-Site Visit" && (
                        <>
                          <option value="Consultancy">Consultancy</option>
                          <option value="Demo">Demo</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Installation">Installation</option>
                          <option value="Support">Support</option>
                          <option value="Handover">Handover</option>
                        </>
                      )}
                      {form.categoryName === "Remote Support" && (
                        <>
                          <option value="Consultancy">Consultancy</option>
                          <option value="Installation">Installation</option>
                          <option value="Support">Support</option>
                        </>
                      )}
                      {form.categoryName === "Others" && (
                        <>
                          <option value="Reporting">Reporting</option>
                          <option value="Customer Escilations">Customer Escilations</option>
                          <option value="Internal Complaints">Internal Complaints</option>
                          <option value="Others">Others</option>
                        </>
                      )}
                    </select>

                    {/* Show all remaining fields ONLY if category !== "Others" */}
                    {form.categoryName !== "Others" && (
                      <>
                        {form.categoryName !== "PreSales" && (
                          <>
                            <CustomerCombobox
                              selectedValue={form.customerId}
                              onSelect={(value) => handleCustomerChange(value)}
                              placeholder="Select Customer"
                            />
                            <select
                              value={form.siteId || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  siteId: parseInt(e.target.value, 10),
                                })
                              }
                              className="border p-2 rounded w-full"
                            >
                              <option value="">Select Site</option>
                              {sites.map((site) => (
                                <option key={site.id} value={site.id}>
                                  {site.siteName}
                                </option>
                              ))}
                            </select>
                          </>
                        )}

                        {form.categoryName === "PreSales" && (
                          <>
                            <div className="flex flex-col">
                              <label className="mb-1 font-medium text-sm">Customer Name</label>
                              <input
                                type="text"
                                placeholder="Customer Name"
                                className="border p-2 rounded"
                                value={form.manCustm || ""}
                                onChange={(e) =>
                                  setForm({ ...form, manCustm: e.target.value })
                                }
                                required
                              />
                            </div>

                            <div className="flex flex-col">
                              <label className="mb-1 font-medium text-sm">Site Address</label>
                              <input
                                type="text"
                                placeholder="Site Name"
                                className="border p-2 rounded"
                                value={form.manSite || ""}
                                onChange={(e) =>
                                  setForm({ ...form, manSite: e.target.value })
                                }
                                required
                              />
                            </div>
                          </>
                        )}

                        <div className="flex flex-col">
                          <label>Contact Person</label>
                          <input
                            type="text"
                            className="border p-2 rounded"
                            value={form.contactPerson}
                            onChange={(e) =>
                              setForm({ ...form, contactPerson: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label>Mobile No</label>
                          <input
                            type="text"
                            className="border p-2 rounded"
                            value={form.mobileNo}
                            onChange={(e) =>
                              setForm({ ...form, mobileNo: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex flex-col">
                          <label>Proposed Date</label>
                          <input
                            type="datetime-local"
                            className="border p-2 rounded"
                            value={form.proposedDate}
                            onChange={(e) =>
                              setForm({ ...form, proposedDate: e.target.value })
                            }
                          />
                        </div>

                        <div className="border p-4 rounded col-span-full">
                          <label className="block font-semibold mb-2">Service Categories</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              "Consultancy",
                              "Networking",
                              "WiFi",
                              "CCTV",
                              "PBX",
                              "ACC",
                              "Passive Infra",
                              "OpenWi",
                              "OpenWan",
                              "Software",
                            ].map((category) => (
                              <label
                                key={category}
                                className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded"
                              >
                                <input
                                  type="checkbox"
                                  value={category}
                                  checked={form.serviceCategoryName.includes(category)}
                                  onChange={(e) => {
                                    const { checked, value } = e.target;
                                    setForm((prev) => ({
                                      ...prev,
                                      serviceCategoryName: checked
                                        ? [...prev.serviceCategoryName, value]
                                        : prev.serviceCategoryName.filter((item) => item !== value),
                                    }));
                                  }}
                                />
                                <span>{category}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Always visible: Subject, Priority, Description */}
                    <div className="flex flex-col">
                      <label>Subject</label>
                      <input
                        type="text"
                        className="border p-2 rounded"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label>Priority</label>
                      <select
                        className="border p-2 rounded"
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        required
                      >
                        <option value="">Select Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="flex flex-col col-span-full">
                      <label>Description</label>
                      <textarea
                        rows={4}
                        className="border p-2 rounded"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                      />
                    </div>
                  </div>


                  {/* Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setTicketModalOpen(false)}
                      className="bg-gray-200 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Create Ticket
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>


          <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
            <table className="w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
                <tr>
                  {headers.map(({ label, key }) => (
                    <th
                      key={key}
                      className={`py-3 px-4 text-center ${key !== "actions" ? "cursor-pointer select-none" : ""
                        }`}
                      onClick={() => {
                        if (key === "actions") return;
                        if (sortField === key) {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortField(key);
                          setSortOrder("asc");
                        }
                        setCurrentPage(1);
                      }}
                    >
                      <div className="flex items-center justify-center space-x-1 select-none">
                        <span>{label}</span>
                        {key !== "actions" && (
                          <span className="flex flex-col text-xs leading-[10px]">
                            <span
                              style={{
                                color:
                                  sortField === key && sortOrder === "asc"
                                    ? "black"
                                    : "lightgray",
                                lineHeight: 0,
                              }}
                            >
                              ▲
                            </span>
                            <span
                              style={{
                                color:
                                  sortField === key && sortOrder === "desc"
                                    ? "black"
                                    : "lightgray",
                                lineHeight: 0,
                              }}
                            >
                              ▼
                            </span>
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-2 text-center">
                      {format(
                        new Date(ticket.createdAt),
                        "MMM dd, yyyy hh:mm a"
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">{ticket.ticketId}</td>
                    <td className="px-4 py-2 text-center">
                      {ticket.categoryName}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {ticket.subCategoryName}
                    </td>
                    <td className="p-3 text-center">
                      {
                        customers.find((c) => c.id === ticket.customerId)
                          ?.customerName || "N/A"
                      }
                    </td>
                    <td className="p-3">
                      {allSites.find((s) => s.id === ticket.siteId)?.siteName || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {ticket.proposedDate
                        ? format(new Date(ticket.proposedDate), "MMM dd, yyyy hh:mm a")
                        : "N/A"}
                    </td>

                    <td className="px-4 py-2 text-center text-red-700">
                      {ticket.priority}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${ticket.status === "OPEN"
                          ? "bg-green-100 text-green-800"
                          : ticket.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : ticket.status === "CLOSED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="relative p-3 text-center z-50">
                      {/* Reply Button */}
                      <button
                        onClick={async () => {
                          await fetchTicketDetails(ticket.id);
                          setChatModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        title="Reply"
                      >
                        <FaReply />
                      </button>

                      {/* Three-dot Menu Button */}
                      <div className="inline-block relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === ticket.id ? null : ticket.id)
                          }
                          className="text-gray-600 hover:text-black"
                          title="Actions"
                        >
                          <FiMoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === ticket.id && (
                          <div
                            className="absolute top-0 right-8 bg-white border border-gray-300 shadow-lg rounded z-50"
                            style={{
                              minWidth: '150px',
                              whiteSpace: 'nowrap',
                              backgroundColor: '#fff',
                            }}
                          >
                            {getNextStatus(ticket.status) && (
                              <div
                                onClick={async () => {
                                  await axios.patch(`http://128.199.19.28:8000/tickets/${ticket.id}`, {
                                    status: getNextStatus(ticket.status),
                                  });
                                  fetchTickets();
                                  setOpenMenuId(null);
                                }}
                                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                              >
                                Mark {getNextStatus(ticket.status)?.replace("_", " ")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <AppSidebar />

        {/* Chat Modal */}
        <Dialog
          open={isChatModalOpen}
          onClose={() => setChatModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden shadow-xl">

              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <Dialog.Title className="text-lg font-semibold">
                  Ticket Chat: {selectedTicket?.ticketId}
                </Dialog.Title>
                <button
                  onClick={() => setChatModalOpen(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors text-xl"
                >
                  &times;
                </button>
              </div>

              {/* Ticket Info */}
              <div className="px-6 py-4 overflow-y-auto border-b max-h-[250px]">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <InfoItem label="Ticket ID" value={selectedTicket?.ticketId} />
                  <InfoItem label="Title" value={selectedTicket?.title} />
                  <InfoItem label="Customer" value={customers.find((c) => c.id === selectedTicket?.customerId)?.customerName} />
                  <InfoItem label="Site" value={allSites.find((s) => s.id === selectedTicket?.siteId)?.siteName} />
                  <InfoItem label="Category" value={selectedTicket?.categoryName} />
                  <InfoItem label="Subcategory" value={selectedTicket?.subCategoryName} />
                  <InfoItem label="Service Categories" value={selectedTicket?.serviceCategoryName} />
                  <InfoItem label="Contact Person" value={selectedTicket?.contactPerson} />
                  <InfoItem label="Mobile No" value={selectedTicket?.mobileNo} />
                  <InfoItem label="Proposed Date" value={selectedTicket?.proposedDate ? format(new Date(selectedTicket.proposedDate), "Pp") : "N/A"} />
                  <InfoItem label="Priority" value={selectedTicket?.priority} />
                  <div className="col-span-2">
                    <label className="font-medium text-gray-600">Description</label>
                    <p className="text-gray-800">{selectedTicket?.description}</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[75%] ${msg.senderId === userId ? "ml-auto text-right" : ""}`}
                  >
                    <div className={`p-3 rounded-lg ${msg.senderId === userId ? "bg-blue-100" : "bg-gray-200"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                        <span>{format(new Date(msg.createdAt), "Pp")}</span>
                        <span className="bg-yellow-200 text-black px-2 py-0.5 rounded-full text-xs">
                          {msg.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        — {msg.sender?.username || (msg.senderId === userId ? "You" : `User ${msg.senderId}`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4 flex gap-2 items-center">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />

                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

      </div>
    </>
  );
}
