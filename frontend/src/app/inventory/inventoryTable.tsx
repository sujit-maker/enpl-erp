"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Trash2 } from "lucide-react";
import { VendorCombobox } from "@/components/ui/VendorCombobox";
import { ProductCombobox } from "@/components/ui/ProductCombobox";
import SerialCombobox from "@/components/ui/SerialCombobox";

interface Inventory {
  id?: number;
  productId: number;
  serialNumber: string;
  macAddress: string;
  vendorId: number;
  purchaseDate: string;
  purchaseInvoice: string;
}

interface Vendor {
  id: number;
  vendorName: string;
}

interface Product {
  id: number;
  productName: string;
}

const initialFormState: Inventory = {
  productId: 0,
  serialNumber: "",
  macAddress: "",
  vendorId: 0,
  purchaseDate: "",
  purchaseInvoice: "",
};

const InventoryTable: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Inventory>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchVendors();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [inventoryList, searchQuery]);

  const fetchInventory = async () => {
    const res = await axios.get("http://localhost:8000/inventory");
    setInventoryList(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:8000/products");
    setProducts(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get("http://localhost:8000/vendors");
    setVendors(res.data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (formData.id) {
        await axios.put(`http://localhost:8000/inventory/${formData.id}`, formData);
        alert("Inventory updated!");
      } else {
        await axios.post("http://localhost:8000/inventory", formData);
        alert("Inventory created!");
      }
      setFormData(initialFormState);
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error("Save error:", err);
      alert("Something went wrong!");
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("Delete this inventory item?")) return;
    await axios.delete(`http://localhost:8000/inventory/${id}`);
    fetchInventory();
  };

  const openModal = (data?: Inventory) => {
    setFormData(data || initialFormState);
    setIsModalOpen(true);
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = inventoryList.filter((inv) => {
      const product = products.find(p => p.id === inv.productId)?.productName || "";
      const vendor = vendors.find(v => v.id === inv.vendorId)?.vendorName || "";
      return (
        inv.serialNumber.toLowerCase().includes(lowerQuery) ||
        inv.macAddress.toLowerCase().includes(lowerQuery) ||
        product.toLowerCase().includes(lowerQuery) ||
        vendor.toLowerCase().includes(lowerQuery)
      );
    });
    setFilteredInventory(filtered);
  };

  return (
    <div className="flex-1 p-4 lg:ml-72 mt-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <div className="flex gap-2">
       
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Inventory
          </button>
          
        </div>
        <input
            type="text"
            placeholder="Search Inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full md:w-64"
          />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Serial Number</th>
              <th className="p-2 border">MAC Address</th>
              <th className="p-2 border">Vendor</th>
              <th className="p-2 border">Purchase Date</th>
              <th className="p-2 border">Invoice</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-2 border">{products.find(p => p.id === inv.productId)?.productName || "N/A"}</td>
                <td className="p-2 border">{inv.serialNumber}</td>
                <td className="p-2 border">{inv.macAddress}</td>
                <td className="p-2 border">{vendors.find(v => v.id === inv.vendorId)?.vendorName || "N/A"}</td>
                <td className="p-2 border">{inv.purchaseDate.slice(0, 10)}</td>
                <td className="p-2 border">{inv.purchaseInvoice}</td>
                <td className="p-2 border text-center space-x-2">
                  <button onClick={() => openModal(inv)} className="text-blue-600 hover:text-blue-800">
                    <PencilLine size={18} />
                  </button>
                  <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-bold mb-4">
              {formData.id ? "Edit Inventory" : "Add Inventory"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProductCombobox
  selectedValue={formData.productId ?? 0}
  onSelect={(value) => setFormData({ ...formData, productId: value })}
  placeholder="Select Product"
/>


              <VendorCombobox
  selectedValue={formData.vendorId ?? 0}
  onSelect={(value) => setFormData({ ...formData, vendorId: value })}
  placeholder="Select Vendor"
/>


<input
                type="text"
                name="serialNumber"
                placeholder="Serial Number"
                value={formData.serialNumber}
                onChange={handleChange}
                className="border p-2 rounded"
              />


              <input
                type="text"
                name="macAddress"
                placeholder="MAC Address"
                value={formData.macAddress}
                onChange={handleChange}
                className="border p-2 rounded"
              />

<div className="mb-4">
  <label htmlFor="purchaseDate" className="block text-sm font-semibold">
    Purchase Date
  </label>
  <input
    type="date"
    name="purchaseDate"
    value={formData.purchaseDate}
    onChange={handleChange}
    className="border p-2 rounded"
  />
</div>


<div className="mb-4">
  <label htmlFor="purchaseInvoice" className="block text-sm font-semibold">
    Purchase Invoice
  </label>
  <input
    type="text"
    name="purchaseInvoice"
    placeholder="Purchase Invoice"
    value={formData.purchaseInvoice}
    onChange={handleChange}
    className="border p-2 rounded"
  />
</div>

            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {formData.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
