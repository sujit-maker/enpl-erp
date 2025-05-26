"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { FaReply } from "react-icons/fa";
import { Dialog } from "@headlessui/react";
import { AppSidebar } from "../components/app-sidebar";
import React from "react";
import { useAuth } from "../hooks/useAuth";

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
  proposedDate: string;
  priority: string;
  site: Site;
};

type Message = {
  id: number;
  content: string;
  senderId: number;
  ticketId: number;
  createdAt: string;
  status?: string;
};

export default function TicketPage() {
  const { userId } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]); // For table
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
  });

  useEffect(() => {
    fetchCustomers();
    fetchAllSites();
  }, []);

  useEffect(() => {
    if (userId) fetchTickets();
  }, [userId]);

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
        `http://localhost:8000/tickets/user/${userId}`
      );
      setTickets(res.data);
      console.log("Logged-in userId:", userId);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      setTickets([]);
    }
  };

  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:8000/customers");
    setCustomers(res.data);
  };

  const fetchAllSites = async () => {
    try {
      const response = await axios.get("http://localhost:8000/sites");
      setAllSites(response.data); // ✅ Only for table
    } catch (error) {
      console.log("Error fetching all sites:", error);
    }
  };

  const fetchSitesByCustomer = async (customerId: number) => {
    const res = await axios.get(
      `http://localhost:8000/sites/customer/${customerId}`
    );
    setSites(res.data);
  };

  const fetchTicketDetails = async (id: number) => {
    const res = await axios.get(`http://localhost:8000/tickets/${id}`);
    console.log("Ticket details response:", res.data); // Add this line

    setSelectedTicket(res.data);
    const msgRes = await axios.get(`http://localhost:8000/message/${id}`);
    setMessages(msgRes.data);
  };

  const handleCustomerChange = (customerId: number) => {
    setForm({ ...form, customerId, siteId: 0 }); // reset site
    if (customerId) fetchSitesByCustomer(customerId);
    else setSites([]); // clear site dropdown if no customer selected
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.post("http://localhost:8000/tickets", {
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
    });
    setTicketModalOpen(false);
    fetchTickets();
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    console.log("Sending message:", {
      content: newMessage,
      senderId: userId,
      ticketId: selectedTicket.id,
    });

    try {
      await axios.post("http://localhost:8000/message", {
        content: newMessage,
        senderId: userId,
        ticketId: selectedTicket.id,
      });

      setNewMessage("");
      fetchTicketDetails(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      console.error("Error sending message:", error);
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
                setCurrentPage(1); // reset to page 1 on search
              }}
            />
          </div>
          <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
            <table className="w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
                <tr>
                  {headers.map(({ label, key }) => (
                    <th
                      key={key}
                      className={`py-3 px-4 text-center ${
                        key !== "actions" ? "cursor-pointer select-none" : ""
                      }`}
                      onClick={() => {
                        if (key === "actions") return; // no sorting for actions
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
                    <td className="p-3">
                      {
                        customers.find((c) => c.id === ticket.customerId)
                          ?.customerName
                      }
                    </td>
                    <td className="p-3">
                      {allSites.find((s) => s.id === ticket.siteId)?.siteName}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {format(
                        new Date(ticket.proposedDate),
                        "MMM dd, yyyy hh:mm a"
                      )}
                    </td>
                    <td className="px-4 py-2 text-center text-red-700">
                      {ticket.priority}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          ticket.status === "OPEN"
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

                    <td className="p-3">
                      <button
                        onClick={async () => {
                          await fetchTicketDetails(ticket.id);
                          setChatModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Reply"
                      >
                        <FaReply />
                      </button>
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
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
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
              <Dialog.Title className="text-lg font-semibold mb-4">
                Create New Ticket
              </Dialog.Title>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  >
                    <option value="">Select Category</option>
                    <option value="PreSales">PreSales</option>
                    <option value="On-Site Visit">On-Site Visit</option>
                    <option value="Remote Support">Remote Support</option>
                    <option value="Others">Others</option>
                  </select>

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
                        <option value="Customer Escilations">
                          Customer Escilations
                        </option>
                        <option value="Internal Complaints">
                          Internal Complaints
                        </option>
                        <option value="Others">Others</option>
                      </>
                    )}
                  </select>

                  <div className="border p-4 rounded">
                    <label className="block font-semibold mb-2">
                      Service Categories
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
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
                      ].map((category: string) => (
                        <label
                          key={category}
                          className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded"
                        >
                          <input
                            type="checkbox"
                            value={category}
                            checked={form.serviceCategoryName.includes(
                              category
                            )}
                            onChange={(e) => {
                              const { checked, value } = e.target;
                              setForm((prev) => ({
                                ...prev,
                                serviceCategoryName: checked
                                  ? [...prev.serviceCategoryName, value]
                                  : prev.serviceCategoryName.filter(
                                      (item: string) => item !== value
                                    ),
                              }));
                            }}
                          />
                          <span>{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col"></div>
                  <select
                    value={form.customerId || ""}
                    onChange={(e) =>
                      handleCustomerChange(parseInt(e.target.value, 10))
                    }
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customerName}
                      </option>
                    ))}
                  </select>

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

                  <div className="flex flex-col">
                    <label htmlFor="">Title</label>
                    <input
                      type="text"
                      placeholder="Title"
                      className="border p-2 rounded"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Contact Person"
                      className="border p-2 rounded"
                      value={form.contactPerson}
                      onChange={(e) =>
                        setForm({ ...form, contactPerson: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Mobile No"
                      className="border p-2 rounded"
                      value={form.mobileNo}
                      onChange={(e) =>
                        setForm({ ...form, mobileNo: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="">Proposed Date</label>
                    <input
                      type="datetime-local"
                      className="border p-2 rounded"
                      value={form.proposedDate}
                      onChange={(e) =>
                        setForm({ ...form, proposedDate: e.target.value })
                      }
                    />
                  </div>
                  <select
                    className="border p-2 rounded"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option value="">Select Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <textarea
                  placeholder="Description"
                  className="w-full border p-2 rounded mt-3"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />

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

        {/* Chat Modal */}
        <Dialog
          open={isChatModalOpen}
          onClose={() => setChatModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-2xl h-[500px] overflow-y-auto">
              <Dialog.Title className="text-lg font-semibold mb-2">
                Ticket Chat: {selectedTicket?.ticketId}
              </Dialog.Title>

              <div className="space-y-2 mb-4">
                {messages.map((m) => (
                  <div key={m.id} className="border p-2 rounded bg-gray-50">
                    <div className="text-xs text-gray-500">
                      {format(new Date(m.createdAt), "dd MMM yyyy hh:mm a")}
                    </div>
                    <div>{m.content}</div>
                    <div className="text-xs text-red-800">{m.status}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded p-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                {selectedTicket && (
                  <select
                    className="border rounded p-2"
                    value={selectedTicket?.status || ""}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      if (!selectedTicket) {
                        console.error("No valid ticket selected");
                        return;
                      }

                      try {
                        await axios.patch(
                          `http://localhost:8000/tickets/${selectedTicket.id}`,
                          { status: newStatus }
                        );

                        const updated = await axios.get(
                          `http://localhost:8000/tickets/${selectedTicket.id}`
                        );

                        setSelectedTicket(updated.data);
                        fetchTickets();
                      } catch (err) {
                        console.error("Error updating status", err);
                      }
                    }}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                )}

                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
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
