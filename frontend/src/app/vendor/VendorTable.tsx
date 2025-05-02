"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { Trash2, PencilLine } from "lucide-react";


interface VendorContact {
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

interface Vendor {
  id?: number;
  vendorCode?: string; // Assuming this is the field for the vendor code
  vendorName: string;
  registerAddress: string;
  gstNo: string;
  contactName: string;
  contactNumber: string;
  emailId: string;
  gstpdf?: string; // Assuming this is the field for the GST PDF file name
  website: string;
  products: string[];
  creditTerms: string;
  creditLimit: string;
  remark: string;
  contacts: VendorContact[];
  bankDetails: BankDetail[];
}

const emptyContact: VendorContact = {
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

const initialFormState: Vendor = {
  vendorName: "",
  registerAddress: "",
  gstNo: "",
  contactName: "",
  contactNumber: "",
  emailId: "",
  website: "",
  products: [],
  creditTerms: "",
  creditLimit: "",
  remark: "",
  contacts: [emptyContact],
  bankDetails: [emptyBank],
};

const VendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [gstPdfFile, setGstPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Vendor>(initialFormState);

  const fetchVendors = async () => {
    const response = await axios.get("http://128.199.19.28:8000/vendors");
    setVendors(response.data);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/category");
      const names = response.data.map((c: any) => c.categoryName);
      setCategories(names);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchCategories(); // Fetch category names on mount
  }, []);
  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    index?: number,
    type?: string
  ) => {
    const { name, value } = e.target;

    if (type === "contact" && index !== undefined) {
      const updated = [...formData.contacts];
      updated[index][name as keyof VendorContact] = value;
      setFormData((prev) => ({ ...prev, contacts: updated }));
    } else if (type === "bank" && index !== undefined) {
      const updated = [...formData.bankDetails];
      updated[index][name as keyof BankDetail] = value;
      setFormData((prev) => ({ ...prev, bankDetails: updated }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addContact = () =>
    setFormData((prev) => ({ ...prev, contacts: [...prev.contacts, emptyContact] }));
  const removeContact = (index: number) => {
    const updated = [...formData.contacts];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, contacts: updated }));
  };

  const addBank = () =>
    setFormData((prev) => ({ ...prev, bankDetails: [...prev.bankDetails, emptyBank] }));
  const removeBank = (index: number) => {
    const updated = [...formData.bankDetails];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, bankDetails: updated }));
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData(vendor); 
    setIsCreateModalOpen(true);  
  };
  
  const handleDelete = async (id?: number) => {
    if (!id) return;
    const confirm = window.confirm("Are you sure you want to delete this vendor?");
    if (!confirm) return;
  
    try {
      await axios.delete(`http://128.199.19.28:8000/vendors/${id}`);
      alert("Vendor deleted successfully!");
      fetchVendors();
    } catch (err) {
      console.error("Error deleting vendor:", err);
      alert("Failed to delete vendor.");
    }
  };
  

  const handleCreate = async () => {
    // List of required top-level fields
    const requiredFields = [
      "vendorName",
      "registerAddress",
      "gstNo",
      "contactName",
      "contactNumber",
      "emailId",
      "creditTerms",
      "creditLimit",
    ];
  
    // Check if any required field is empty
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof Vendor]?.toString().trim()
    );
  
    if (missingFields.length > 0) {
      alert(`Please fill out the following fields: ${missingFields.join(", ")}`);
      return;
    }
  
    // At least one contact must be valid
    const validContacts = formData.contacts.filter(
      (c) => c.firstName.trim() || c.lastName.trim() || c.contactPhoneNumber.trim()
    );
    if (validContacts.length === 0) {
      alert("Please add at least one valid contact.");
      return;
    }
  
    // At least one bank detail must be valid
    const validBanks = formData.bankDetails.filter(
      (b) => b.accountNumber.trim() || b.ifscCode.trim() || b.bankName.trim()
    );
    if (validBanks.length === 0) {
      alert("Please add at least one valid bank detail.");
      return;
    }
  

  
    try {
      if (formData.id) {
        await axios.put(`http://128.199.19.28:8000/vendors/${formData.id}`, {
          ...formData,
          contacts: validContacts,
          bankDetails: validBanks,
        });
      } else {
        const payload = new FormData();

payload.append("vendorName", formData.vendorName);
payload.append("registerAddress", formData.registerAddress);
payload.append("gstNo", formData.gstNo);
payload.append("contactName", formData.contactName);
payload.append("contactNumber", formData.contactNumber);
payload.append("emailId", formData.emailId);
payload.append("website", formData.website);
payload.append("creditTerms", formData.creditTerms);
payload.append("creditLimit", formData.creditLimit);
payload.append("remark", formData.remark);
payload.append("products", JSON.stringify(formData.products));
payload.append("contacts", JSON.stringify(validContacts));
payload.append("bankDetails", JSON.stringify(validBanks));

if (gstPdfFile) {
  payload.append("gstCertificate", gstPdfFile); // 👈 This must match 'gstCertificate' field in your backend FileInterceptor
}

await axios.post("http://128.199.19.28:8000/vendors", payload, {
  headers: { "Content-Type": "multipart/form-data" },
});

      }
      
      alert(formData.id ? "Vendor updated successfully!" : "Vendor created successfully!");
      setFormData(initialFormState);
      setIsCreateModalOpen(false);
      fetchVendors();
    } catch (err) {
      console.error("Error creating vendor:", err);
      alert("Failed to create vendor. Please try again.");
    }
  };
  

  return (
      <div className="flex-1 p-6 overflow-auto lg:ml-72 "> 
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
          
          onClick={() => {
            setFormData(initialFormState); // clear form
            setIsCreateModalOpen(true);
          }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Vendor
          </button>
        </div>

      <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
      <table className="min-w-[700px] w-full text-center border-collapse border border-gray-200"> 
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Vendor ID</th>
              <th className="p-2 border">Vendor Name</th>
              <th className="p-2 border">First Name</th>
              <th className="p-2 border">Last Name</th>
             
              <th className="p-2 border">Products</th>
              <th className="p-2 border">GST Certificate</th>


              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="border-b">
                <td className="p-2 border">{vendor.vendorCode}</td>
                <td className="p-2 border">{vendor.vendorName}</td>
                <td className="p-2 border">
                  {vendor.contacts.map((c) => c.firstName).join(", ")}
                </td>
                <td className="p-2 border">
                  {vendor.contacts.map((c) => c.lastName).join(", ")}
                </td>
                <td className="p-2 border  text-yellow-800">
  {Array.isArray(vendor.products)
    ? vendor.products.map((p) => p).join(", ")
    : ""}
</td>
<td className="p-2 border text-blue-900">
  {vendor.gstpdf ? (
    <a href={`http://128.199.19.28:8000/gst/${vendor.gstpdf}`} target="_blank" rel="noopener noreferrer">
      View PDF
    </a>
  ) : (
    "No PDF"
  )}
</td>

<td className="p-2 border flex justify-center gap-3 items-center">
  <button
    onClick={() => handleEdit(vendor)}
    className="text-blue-500 hover:text-blue-700"
    title="Edit"
  >
    <PencilLine size={18} />
  </button>
  <button
    onClick={() => handleDelete(vendor.id)}
    className="text-red-500 hover:text-red-700"
    title="Delete"
  >
    <Trash2 size={18} />
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 ml-48 mt-20  bg-gray bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
          <div className="overflow-auto max-h-[90vh]">
            <div className="min-w-[800px] p-6">
          <h3 className="text-lg font-bold mb-4 text-center">
  {formData.id ? "Edit Vendor" : "Create Vendor"}
</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "vendorName",
                "registerAddress",
                "gstNo",
                "contactName",
                "contactNumber",
                "emailId",
                "website",
                "creditTerms",
                "creditLimit",
                "remark",
              ].map((field) => (
                <input
                  key={field}
                  name={field}
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  value={(formData as any)[field]}
                  onChange={(e) => handleInputChange(e, field)}
                  className="border p-2 rounded"
                />
              ))}
            </div>
            <div className="mt-4">
  <label className="font-semibold block mb-2">GST Certificate (PDF)</label>
  <input
    type="file"
    accept="application/pdf"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        setGstPdfFile(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }}
    className="block w-full border p-2 rounded"
  />
  {gstPdfFile && (
    <p className="text-sm text-green-700 mt-1">{gstPdfFile.name}</p>
  )}
</div>

<div className="mt-6">
  <label className="font-semibold block mb-2">Products</label>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {categories.map((category) => (
      <label key={category} className="inline-flex items-center">
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



            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Contacts</h4>
                <button onClick={addContact} className="text-blue-600">
                  <Plus size={20} />
                </button>
              </div>
              {formData.contacts.map((contact, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 items-center">
                  {Object.keys(emptyContact).map((key) => (
                    <input
                      key={key}
                      name={key}
                      placeholder={key.replace(/([A-Z])/g, " $1")}
                      value={(contact as any)[key]}
                      onChange={(e) => handleInputChange(e, key, i, "contact")}
                      className="border p-2 rounded"
                    />
                  ))}
                  <button onClick={() => removeContact(i)} className="text-red-600">
                    -
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Bank Details</h4>
                <button onClick={addBank} className="text-blue-600">
                  <Plus size={20} />
                </button>
              </div>
              {formData.bankDetails.map((bank, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2 items-center">
                  {Object.keys(emptyBank).map((key) => (
                    <input
                      key={key}
                      name={key}
                      placeholder={key.replace(/([A-Z])/g, " $1")}
                      value={(bank as any)[key]}
                      onChange={(e) => handleInputChange(e, key, i, "bank")}
                      className="border p-2 rounded"
                    />
                  ))}
                  <button onClick={() => removeBank(i)} className="text-red-600">
                    -
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-500 text-white"
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
  </div>
      )}
    </div>
  );
};

export default VendorTable;