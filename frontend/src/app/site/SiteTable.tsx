"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Trash2 } from "lucide-react";
import { FaSearch } from "react-icons/fa";

interface Customer {
  id: number;
  customerName: string;
}

interface Site {
  id: number;
  customerId: number;
  siteCode: string;
  siteName: string;
  siteAddress: string;
  state: string;
  city: string;
  gstNo: string;
  gstpdf: string;
  contactName: string[];
  contactNumber: string[];
  emailId: string[];
  Customer: Customer;
}

interface FormData {
  siteName: string;
  siteAddress: string;
  state: string;
  city: string;
  gstNo: string;
  gstpdf: string;
  contactName: string[];
  contactNumber: string[];
  emailId: string[];
  customerId: number;
}

const SiteTable: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [gstPdfFile, setGstPdfFile] = useState<File | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState<FormData>({
    siteName: "",
    siteAddress: "",
    state: "",
    city: "",
    gstNo: "",
    gstpdf: "",
    contactName: [""],
    contactNumber: [""],
    emailId: [""],
    customerId: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSites = async () => {
    try {
      const response = await axios.get("http://localhost:8000/sites");
      setSites(response.data.reverse());
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const filteredSites = sites.filter(
    (site) =>
      site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.Customer.customerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      site.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.gstNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.siteAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: (prevData[name as keyof FormData] as string[]).map(
          (item, idx) => (idx === index ? value : item)
        ),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: name === "customerId" ? Number(value) : value,
      }));
    }
  };

  const handleAddField = () => {
    setFormData((prevData) => ({
      ...prevData,
      contactName: [...prevData.contactName, ""],
      contactNumber: [...prevData.contactNumber, ""],
      emailId: [...prevData.emailId, ""],
    }));
  };

  const handleRemoveField = (
    field: "contactName" | "contactNumber" | "emailId",
    index: number
  ) => {
    const updatedField = [...(formData[field] as string[])];
    updatedField.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      [field]: updatedField,
    }));
  };

  const handleCreate = async () => {
    // Define required fields
    const requiredFields = [
      "siteName",
      "siteAddress",
      "state",
      "city",
      "gstNo",
    ];

    // Find missing fields
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]?.toString().trim()
    );

    if (missingFields.length > 0) {
      alert(
        `Please fill out the following fields: ${missingFields.join(", ")}`
      );
      return;
    }

    const data = new FormData();

    for (const key in formData) {
      const value = (formData as any)[key];

      if (Array.isArray(value)) {
        value.forEach((v: string) => {
          data.append(`${key}[]`, v);
        });
      } else if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    }

    if (gstPdfFile) {
      data.append("gstpdf", gstPdfFile, gstPdfFile.name);
    }

    try {
      await axios.post("http://localhost:8000/sites", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Site added successfully!");
      setIsCreateModalOpen(false);
      setGstPdfFile(null); 
      fetchSites();
    } catch (error) {
      console.error("Error adding site:", error);
      alert("Failed to add site. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedSite) return;

    const data = new FormData();

    for (const key in formData) {
      const value = (formData as any)[key];

      if (Array.isArray(value)) {
        value.forEach((v: string) => {
          data.append(`${key}[]`, v);
        });
      } else if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    }

    if (gstPdfFile) {
      data.append("gstpdf", gstPdfFile, gstPdfFile.name);
    }

    try {
      await axios.put(
        `http://localhost:8000/sites/${selectedSite.id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Site updated successfully!");
      setIsUpdateModalOpen(false);
      setGstPdfFile(null);
      fetchSites();
    } catch (error) {
      console.error("Error updating site:", error);
      alert("Failed to update site.");
    }
  };


  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this site?")) {
      try {
        await axios.delete(`http://localhost:8000/sites/${id}`);
        alert("Site deleted successfully!");
        fetchSites();
      } catch (error) {
        console.error("Error deleting site:", error);
      }
    }
  };

  useEffect(() => {
    fetchSites();
    fetchCustomers();
  }, []);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSites = filteredSites.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-6 overflow-auto lg:ml-72">
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={() => {
              setFormData({
                siteName: "",
                siteAddress: "",
                state: "",
                city: "",
                gstNo: "",
                gstpdf: "",
                contactName: [""],
                contactNumber: [""],
                emailId: [""],
                customerId: 0,
              });
              setIsCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
          >
            Add Customer Site
          </button>
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
              <tr>
                <th className="border border-gray-200 p-4">Site ID</th>
                <th className="px-6 py-3 text-left">Site Name</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Site Address</th>
                <th className="px-6 py-3 text-left">State</th>
                <th className="px-6 py-3 text-left">City</th>
                <th className="px-6 py-3 text-left">GST PDF</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentSites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-100">
                  <td className="border px-6 py-3">{site.siteCode}</td>
                  <td className="border px-6 py-3">{site.siteName}</td>
                  <td className="border px-6 py-3">
                    {site.Customer.customerName}
                  </td>
                  <td className="border px-6 py-3">{site.siteAddress}</td>
                  <td className="border px-6 py-3">{site.state}</td>
                  <td className="border px-6 py-3">{site.city}</td>
                  <td className="p-2 border text-blue-900">
                    {site.gstpdf ? (
                      <a
                        href={`http://localhost:8000/gst/${site.gstpdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View PDF
                      </a>
                    ) : (
                      "No PDF"
                    )}
                  </td>
                  <td className="border px-6 py-3 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedSite(site);
                          setFormData({
                            siteName: site.siteName,
                            siteAddress: site.siteAddress,
                            state: site.state,
                            city: site.city,
                            gstNo: site.gstNo,
                            gstpdf: site.gstpdf,
                            contactName: [...site.contactName],
                            contactNumber: [...site.contactNumber],
                            emailId: [...site.emailId],
                            customerId: site.customerId,
                          });
                          setGstPdfFile(null);
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
                        title="Edit"
                      >
                        <PencilLine size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(site.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Prev
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(sites.length / itemsPerPage)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {(isCreateModalOpen || isUpdateModalOpen) && (
        <Modal
          title={isCreateModalOpen ? "Add Customer Site" : "Update Site"}
          formData={formData}
          customers={customers}
          gstPdfFile={gstPdfFile}
          setGstPdfFile={setGstPdfFile}
          onInputChange={handleInputChange}
          onAddField={handleAddField}
          onRemoveField={handleRemoveField}
          onSave={isCreateModalOpen ? handleCreate : handleUpdate}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsUpdateModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const Modal: React.FC<{
  title: string;
  formData: FormData;
  customers: Customer[];
  gstPdfFile: File | null; 
  setGstPdfFile: React.Dispatch<React.SetStateAction<File | null>>; 
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => void;
  onAddField: () => void;
  onRemoveField: (
    field: "contactName" | "contactNumber" | "emailId",
    index: number
  ) => void;
  onSave: () => void;
  onClose: () => void;
}> = ({
  title,
  formData,
  customers,
  gstPdfFile,
  setGstPdfFile,
  onInputChange,
  onAddField,
  onRemoveField,
  onSave,
  onClose,
}) => (
   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
<div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <select
          name="customerId"
          value={formData.customerId}
          onChange={onInputChange}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.customerName}
            </option>
          ))}
        </select>

        <input
          name="siteName"
          value={formData.siteName}
          onChange={onInputChange}
          placeholder="Site Name"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="siteAddress"
          value={formData.siteAddress}
          onChange={onInputChange}
          placeholder="Site Address"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="state"
          value={formData.state}
          onChange={onInputChange}
          placeholder="State"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="city"
          value={formData.city}
          onChange={onInputChange}
          placeholder="City"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="gstNo"
          value={formData.gstNo}
          onChange={onInputChange}
          placeholder="GST No"
          className="w-full mb-3 p-2 border rounded"
        />

        <div className="mt-4">
          <label htmlFor="gstPdfFile" className="font-semibold block mb-2">
            GST Certificate (PDF)
          </label>
          <input
            id="gstPdfFile"
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]; 
              if (file) {
                if (file.type === "application/pdf") {
                  setGstPdfFile(file); 
                } else {
                  alert("Please upload a valid PDF file.");
                  e.target.value = ""; 
                }
              }
            }}
            className="block w-full border border-gray-300 p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {gstPdfFile && (
            <p className="text-sm text-green-700 mt-1">
              Selected: {gstPdfFile.name}
            </p>
          )}
        </div>


        {formData.contactName.map((_, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              name="contactName"
              value={formData.contactName[index]}
              onChange={(e) => onInputChange(e, index)}
              placeholder="Contact Name"
              className="w-1/3 p-2 border rounded"
            />
            <input
              name="contactNumber"
              value={formData.contactNumber[index]}
              onChange={(e) => onInputChange(e, index)}
              placeholder="Contact Number"
              className="w-1/3 p-2 border rounded"
            />
            <input
              name="emailId"
              value={formData.emailId[index]}
              onChange={(e) => onInputChange(e, index)}
              placeholder="Email ID"
              className="w-1/3 p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => {
                onRemoveField("contactName", index);
                onRemoveField("contactNumber", index);
                onRemoveField("emailId", index);
              }}
              className="text-red-500"
            >
              - Remove
            </button>
          </div>
        ))}

        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={onAddField}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Add Contact
          </button>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

export default SiteTable;
