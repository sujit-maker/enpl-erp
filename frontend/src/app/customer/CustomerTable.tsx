"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { FaEdit, FaSearch, FaTrashAlt } from "react-icons/fa";

interface CustomerContact {
  title: string;
  firstName: string;
  lastName: string;
  contactPhoneNumber: string;
  contactEmailId: string;
  designation: string;
  department: string;
  landlineNumber: string;
}

interface BankDetail {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

interface Customer {
  id?: number;
  customerCode: string;
  customerName: string;
  registerAddress: string;
  gstNo: string;
  gstpdf: string;
  businessType: string;
  state: string;
  city: string;
  emailId: string;
  website: string;
  products: string[];
  creditTerms: string;
  creditLimit: string;
  remark: string;
  contacts: CustomerContact[];
  bankDetails: BankDetail[];
}

const emptyContact: CustomerContact = {
  title: "",
  firstName: "",
  lastName: "",
  contactPhoneNumber: "",
  contactEmailId: "",
  designation: "",
  department: "",
  landlineNumber: "",
};

const emptyBank: BankDetail = {
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
};

const initialFormState: Customer = {
  customerCode: "",
  customerName: "",
  registerAddress: "",
  gstNo: "",
  gstpdf: "",
  businessType: "",
  state: "",
  city: "",
  emailId: "",
  website: "",
  products: [],
  creditTerms: "",
  creditLimit: "",
  remark: "",
  contacts: [emptyContact],
  bankDetails: [emptyBank],
};

const CustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [gstpdfFile, setGstPdfFile] = useState<File | null>(null);
  const [existingGstFileName, setExistingGstFileName] = useState<string | null>(
    null
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<Customer>(initialFormState);

  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:8000/customers");
    setCustomers(res.data);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/category");
      const names = response.data.map((c: any) => c.categoryName);
      setCategories(names);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCustomers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    _field: string,
    index?: number,
    type?: string
  ) => {
    const { name, value } = e.target;

    if (type === "contact" && index !== undefined) {
      const updated = formData.contacts.map((c, i) =>
        i === index ? { ...c, [name]: value } : c
      );
      setFormData((prev) => ({ ...prev, contacts: updated }));
    } else if (type === "bank" && index !== undefined) {
      const updated = formData.bankDetails.map((b, i) =>
        i === index ? { ...b, [name]: value } : b
      );
      setFormData((prev) => ({ ...prev, bankDetails: updated }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addContact = () =>
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { ...emptyContact }],
    }));

  const removeContact = (index: number) => {
    const updated = [...formData.contacts];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, contacts: updated }));
  };

  const addBank = () =>
    setFormData((prev) => ({
      ...prev,
      bankDetails: [...prev.bankDetails, { ...emptyBank }],
    }));

  const removeBank = (index: number) => {
    const updated = [...formData.bankDetails];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, bankDetails: updated }));
  };

  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setGstPdfFile(null);
    setExistingGstFileName(customer.gstpdf || null);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    const confirm = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirm) return;
    try {
      await axios.delete(`http://localhost:8000/customers/${id}`);
      alert("Customer deleted successfully!");
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer.");
    }
  };
 
  const handleCreate = async () => {
    const required = [
      "customerName",
      "registerAddress",
      "gstNo",
      "businessType",
      "state",
      "city",
      "emailId",
      "website",
      "remark",
      "creditTerms",
      "creditLimit",
    ];
  
    const missing = required.filter(
      (f) => !formData[f as keyof Customer]?.toString().trim()
    );
  
    if (missing.length > 0) {
      alert(`Missing fields: ${missing.join(", ")}`);
      return;
    }
  
    const validContacts = formData.contacts.filter(
      (c) =>
        c.firstName.trim() || c.lastName.trim() || c.contactPhoneNumber.trim()
    );

    const validBanks = formData.bankDetails.filter(
      (b) => b.accountNumber.trim() || b.ifscCode.trim() || b.bankName.trim()
    );
  
    if (validContacts.length === 0) {
      alert("Add at least one valid contact.");
      return;
    }
  
    try {
      const form = new FormData();
  
      // Append individual fields
      form.append("registerAddress", formData.registerAddress);
      form.append("gstNo", formData.gstNo);
      form.append("customerName", formData.customerName);
      form.append("businessType", formData.businessType);
      form.append("state", formData.state);
      form.append("city", formData.city);
      form.append("emailId", formData.emailId);
      form.append("website", formData.website);
      form.append("remark", formData.remark);
      form.append("creditTerms", formData.creditTerms.toString());
      form.append("creditLimit", formData.creditLimit.toString());
  
      // Append JSON-encoded nested data
      form.append("contacts", JSON.stringify(validContacts));
      form.append("bankDetails", JSON.stringify(validBanks));
      form.append("products", JSON.stringify(formData.products));

      // Append the GST certificate file with the correct field name
      if (gstpdfFile) {
        form.append("gstCertificate", gstpdfFile);
      }
 
      // Create or update
      if (formData.id) {
        await axios.put(
          `http://localhost:8000/customers/${formData.id}`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.post("http://localhost:8000/customers", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert(
        formData.id
          ? "Customer updated successfully!"
          : "Customer created successfully!"
      );
      setFormData(initialFormState);
      setGstPdfFile(null);
      setIsCreateModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error("Error creating/updating customer:", err);
      alert("Failed to submit. Please try again.");
    }
  };
                     
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.emailId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  return (
    <div className="flex-1 p-6 overflow-auto lg:ml-72">

    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-5 mt-16">
        <button
          onClick={() => {
            setIsCreateModalOpen(true);
            setFormData((prev) => ({
              ...initialFormState,
              products: prev.products,
            }));
          }}
    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300 w-full md:w-auto"
        >
          Add Customer
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
    
      <div className="w-full overflow-x-auto">
  <table className="min-w-[800px] w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
    <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
      <tr>
        <th className="p-2 border">Customer ID</th>
        <th className="p-2 border">Customer Name</th>
        <th className="p-2 border">Contacts</th>
        <th className="p-2 border">Bank Details</th>
        <th className="p-2 border">Products</th>
        <th className="p-2 border">GST No</th>
        <th className="p-2 border">GST Certificate</th>
        <th className="p-2 border">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredCustomers.map((cust) => (
        <tr key={cust.id} className="border-b">
          <td className="p-2 border">{cust.customerCode}</td>
          <td className="p-2 border">{cust.customerName}</td>
          <td className="p-2 border">
            {cust.contacts
              .map((c) => `${c.firstName} ${c.lastName}`)
              .join(", ")}
          </td>
          <td className="p-2 border">
            {cust.bankDetails
              .map((b) => `${b.accountNumber} (${b.ifscCode})`)
              .join(", ") || "No Bank Details"}
          </td>
          <td className="p-2 border text-red-800">
            {Array.isArray(cust.products)
              ? cust.products.map((p) => p).join(", ")
              : ""}
          </td>
          <td className="p-2 border">{cust.gstNo}</td>
          <td className="p-2 border text-blue-900">
            {cust.gstpdf ? (
              <a
                href={`http://localhost:8000/gst/${cust.gstpdf}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View PDF
              </a>
            ) : (
              "No PDF"
            )}
          </td>
          <td className="px-4 py-2 text-center space-x-2">
            <button
              onClick={() => handleEdit(cust)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(cust.id)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
              title="Delete"
            >
              <FaTrashAlt />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
<div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl animate-fadeIn">
            <div className="overflow-auto max-h-[90vh]">
                <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
                  {formData.id ? "Edit Customer" : "Create Customer"}
                </h3>
                <div className="mt-4">
                  <label className="font-semibold block mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange(e, "businessType")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Business Type</option>
                    <option value="SOHO">SOHO</option>
                    <option value="SMB">SMB</option>
                    <option value="ENT">ENT</option>
                    <option value="EDU">EDU</option>
                    <option value="NPO">NPO</option>
                    <option value="GOV">GOV</option>
                    <option value="Reseller">Reseller</option>
                  </select>
                </div>

                {/* Basic Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {[
                    "customerName",
                    "registerAddress",
                    "state",
                    "city",
                    "gstNo",
                    "emailId",
                    "creditTerms",
                    "creditLimit",
                    "website",
                    "remark",
                  ].map((field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field.replace(/([A-Z])/g, " $1")}
                      value={(formData as any)[field] || ""}
                      onChange={(e) => handleInputChange(e, field)}
                      className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ))}
                </div>

                <div className="mt-4">
                  <label className="font-semibold block mb-2">
                    GST Certificate (PDF)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === "application/pdf") {
                        setGstPdfFile(file);
                        setExistingGstFileName(null); // hide old name if new file is selected
                      } else {
                        alert("Please upload a valid PDF file.");
                      }
                    }}
                    className="block w-full border p-2 rounded"
                  />
                  {/* Show newly selected file name */}
                  {gstpdfFile && (
                    <p className="text-sm text-green-700 mt-1">
                      {gstpdfFile.name}
                    </p>
                  )}

                  {/* Show existing file name from backend if no new file selected */}
                  {!gstpdfFile && existingGstFileName && (
                    <a
                      href={`http://localhost:8000/gst/${existingGstFileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-700 mt-1 block underline"
                    >
                      View Existing GST Certificate
                    </a>
                  )}
                </div>

                <div className="mt-6">
                  <label className="font-semibold block mb-2">Products</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="inline-flex items-center"
                      >
                        <input
                          type="checkbox"
                          value={category}
                          checked={formData.products.includes(category)}
                          onChange={(e) => {
                            const { checked, value } = e.target;
                            setFormData((prev) => ({
                              ...prev,
                              products: checked
                                ? [...prev.products, value]
                                : prev.products.filter((p) => p !== value),
                            }));
                          }}
                          className="mr-2"
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contacts */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Contacts</h4>
                    <button onClick={addContact} className="text-blue-600">
                      <Plus size={20} />
                    </button>
                  </div>
                  {formData.contacts.map((contact, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 items-center"
                    >
                      {Object.keys(emptyContact).map((key) => (
                        <input
                          key={key}
                          name={key}
                          placeholder={key.replace(/([A-Z])/g, " $1")}
                          value={(contact as any)[key]}
                          onChange={(e) =>
                            handleInputChange(e, key, i, "contact")
                          }
                          className="border p-2 rounded-lg"
                        />
                      ))}
                      <button
                        onClick={() => removeContact(i)}
                        className="text-red-600 font-bold"
                      >
                        &minus;
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bank Details */}
                <div className="mt-6">
                  <div className="flex justify-between items-center  mb-2">
                    <h4 className="font-semibold">Bank Details</h4>

                    <button onClick={addBank} className="text-blue-600">
                      <Plus size={20} />
                    </button>
                  </div>

                  {formData.bankDetails.map((bank, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 items-center"
                    >
                      {Object.keys(emptyBank).map((key) => (
                        <input
                          key={key}
                          name={key}
                          placeholder={key.replace(/([A-Z])/g, " $1")}
                          value={(bank as any)[key]}
                          onChange={(e) => handleInputChange(e, key, i, "bank")}
                          className="border p-2 rounded-lg"
                        />
                      ))}
                      <button
                        onClick={() => removeBank(i)}
                        className="text-red-600 font-bold"
                      >
                        &minus;
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setFormData(initialFormState);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                  >
                    {formData.id ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default CustomerTable;
