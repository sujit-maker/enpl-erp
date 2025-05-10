"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Trash2 } from "lucide-react";
import { VendorCombobox } from "@/components/ui/VendorCombobox";
import { ProductCombobox } from "@/components/ui/ProductCombobox";

interface ProductInventory {
  productId: number;
  serialNumber: string;
  macAddress: string;
  warrantyPeriod: string;
  purchaseRate: string;
}

interface Inventory {
  id?: number;
  vendorId: number;
  creditTerms?: string;
  invoiceNetAmount?: string;
  gstAmount?: string;
  dueDate?: string;
  invoiceGrossAmount?: string;
  purchaseDate: string;
  purchaseInvoice: string;
  status?: string;
  duration?: string;
  products: ProductInventory[];
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
  vendorId: 0,
  purchaseDate: "",
  purchaseInvoice: "",
  status: "In Stock",
  dueDate: "",
  creditTerms: "",
  invoiceNetAmount: "",
  gstAmount: "",
  invoiceGrossAmount: "",
  products: [],
};

const PurchaseInvoiceTable: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Inventory>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

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
    const inventoryWithDuration = res.data.map((item: Inventory) => {
      const purchaseDate = new Date(item.purchaseDate);
      const today = new Date();
      const diffDays = Math.floor(
        (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        ...item,
        duration: `${diffDays} day${diffDays !== 1 ? "s" : ""}`,
      };
    });
    setInventoryList(inventoryWithDuration);
  };

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:8000/products");
    setProducts(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get("http://localhost:8000/vendors");
    setVendors(res.data);
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();

    const filtered = inventoryList.filter((inv) => {
      const vendorName =
        vendors.find((v) => v.id === inv.vendorId)?.vendorName?.toLowerCase() ||
        "";

      const inventoryMatch =
        inv.purchaseInvoice?.toLowerCase().includes(lowerQuery) ||
        inv.purchaseDate?.toLowerCase().includes(lowerQuery) ||
        inv.creditTerms?.toLowerCase().includes(lowerQuery) ||
        inv.invoiceNetAmount?.toLowerCase().includes(lowerQuery) ||
        inv.gstAmount?.toLowerCase().includes(lowerQuery) ||
        inv.invoiceGrossAmount?.toLowerCase().includes(lowerQuery) ||
        inv.status?.toLowerCase().includes(lowerQuery) ||
        vendorName.includes(lowerQuery);

      const productMatch = inv.products.some((product) => {
        return (
          product.serialNumber?.toLowerCase().includes(lowerQuery) ||
          product.macAddress?.toLowerCase().includes(lowerQuery) ||
          product.warrantyPeriod?.toLowerCase().includes(lowerQuery) ||
          product.purchaseRate?.toLowerCase().includes(lowerQuery)
        );
      });

      return inventoryMatch || productMatch;
    });

    setFilteredInventory(filtered);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate due date if purchaseDate and creditTerms are present
      const { purchaseDate, creditTerms } = updated;
      if (purchaseDate && creditTerms && !isNaN(Number(creditTerms))) {
        const date = new Date(purchaseDate);
        date.setDate(date.getDate() + parseInt(creditTerms));
        updated.dueDate = date.toISOString().split("T")[0]; // format as YYYY-MM-DD
      }

      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        products: formData.products.map((product) => ({
          productId: product.productId,
          serialNumber: product.serialNumber,
          macAddress: product.macAddress,
          warrantyPeriod: product.warrantyPeriod,
          purchaseRate: product.purchaseRate,
        })),
      };

      if (formData.id) {
        await axios.put(
          `http://localhost:8000/inventory/${formData.id}`,
          payload
        );
        alert("Inventory updated!");
      } else {
        await axios.post("http://localhost:8000/inventory", payload);
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
    if (data) {
      const clonedProducts = (data.products || []).map((p) => ({ ...p }));
      setFormData({ ...data, products: clonedProducts });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 p-4 lg:ml-72 mt-20">
    

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border text-sm">
          <thead className="bg-gray-100 text-center">
            <tr>
                  
              <th className="p-2 border">Purchased From</th>
              <th className="p-2 border">Purchased Date</th>
              <th className="p-2 border">P.Invoice No</th>
              <th className="p-2 border">Credit Terms </th>
              <th className="p-2 border">Invoice Amount</th>
              <th className="p-2 border">GST Amount</th>
              <th className="p-2 border">Gross Amount</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map((inv) =>
              inv.products.map((product, index) => (
                <tr key={`${inv.id}-${product.serialNumber}-${index}`}>
                  <td className="p-2 border text-center">
                    {vendors.find((v) => v.id === inv.vendorId)?.vendorName}
                  </td>
                  <td className="p-2 border text-center">
                    {inv.purchaseDate?.slice(0, 10)}
                  </td>
                  <td className="p-2 border text-center ">{inv.purchaseInvoice}</td>
                  <td className="p-2 border text-center">{inv.creditTerms}</td>
                  <td className="p-2 border text-center">{inv.invoiceNetAmount}</td>
                  <td className="p-2 border text-center">{inv.gstAmount}</td>
                  <td className="p-2 border text-center">{inv.invoiceGrossAmount}</td>
                  <td className="p-2 border text-center">{inv.dueDate?.slice(0, 10)}</td>
                  <td className="p-2 border text-center">{inv.status}</td>
                  <td className="p-2 border text-center">{inv.duration}</td>
                   <td className="p-2 border text-center space-x-2">
                    <button
                      onClick={() => openModal(inv)}
                      className="text-blue-600"
                    >
                      <PencilLine size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : ""
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
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">
              {formData.id ? "Edit Inventory" : "Add Inventory"}
            </h2>

            {/* Inventory Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <label className="block font-semibold mb-2">
                  Purchase Invoice No
                </label>
                <input
                  type="text"
                  name="purchaseInvoice"
                  placeholder=" Purchase Invoice No"
                  value={formData.purchaseInvoice}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="block font-semibold mb-2">
                  Purchase Invoice Date
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="block font-semibold mb-2">Vendor Name</label>
                <VendorCombobox
                  selectedValue={formData.vendorId}
                  onSelect={(val) =>
                    setFormData((prev) => ({ ...prev, vendorId: val }))
                  }
                  placeholder="Select Vendor"
                />
              </div>
              <div className="flex flex-col">
                <label className="block font-semibold mb-2">Credit Terms</label>
                <input
                  type="text"
                  name="creditTerms"
                  placeholder="Credit Terms"
                  value={formData.creditTerms}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="block font-semibold mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="block font-semibold mb-2">Net Amount</label>
                <input
                  type="text"
                  name="invoiceNetAmount"
                  placeholder="Net Amount"
                  value={formData.invoiceNetAmount}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="block font-semibold mb-2">GST Amount</label>
                <input
                  type="text"
                  name="gstAmount"
                  placeholder="GST Amount"
                  value={formData.gstAmount}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="block font-semibold mb-2">Gross Amount</label>
                <input
                  type="text"
                  name="invoiceGrossAmount"
                  placeholder="Gross Amount"
                  value={formData.invoiceGrossAmount}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-4">
              {/* Product Inputs (Dynamic Rows) */}
              <div className="col-span-2">
                <label className="block font-semibold mb-2">Products</label>
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 border p-2 rounded relative"
                  >
                    <ProductCombobox
                      selectedValue={product.productId}
                      onSelect={(value) =>
                        setFormData((prev) => {
                          const updated = [...prev.products];
                          updated[index].productId = value;
                          return { ...prev, products: updated };
                        })
                      }
                      placeholder="Select Product"
                    />

                    <input
                      type="text"
                      name="serialNumber"
                      placeholder="Serial Number"
                      value={product.serialNumber}
                      onChange={(e) => {
                        const updated = [...formData.products];
                        updated[index].serialNumber = e.target.value;
                        setFormData({ ...formData, products: updated });
                      }}
                      className="border p-2 rounded"
                    />

                    <input
                      type="text"
                      name="macAddress"
                      placeholder="MAC Address"
                      value={product.macAddress}
                      onChange={(e) => {
                        const updated = [...formData.products];
                        updated[index].macAddress = e.target.value;
                        setFormData({ ...formData, products: updated });
                      }}
                      className="border p-2 rounded"
                    />

                    <input
                      type="text"
                      name="warrantyPeriod"
                      placeholder="Warranty Period (Days)"
                      value={product.warrantyPeriod}
                      onChange={(e) => {
                        const updated = [...formData.products];
                        updated[index].warrantyPeriod = e.target.value;
                        setFormData({ ...formData, products: updated });
                      }}
                      className="border p-2 rounded"
                    />

                    <input
                      type="text"
                      name="purchaseRate"
                      placeholder="Purchase Rate"
                      value={product.purchaseRate}
                      onChange={(e) => {
                        const updated = [...formData.products];
                        updated[index].purchaseRate = e.target.value;
                        setFormData({ ...formData, products: updated });
                      }}
                      className="border p-2 rounded"
                    />

                    {/* Remove Product Row Button */}
                    <button
                      onClick={() => {
                        const updated = [...formData.products];
                        updated.splice(index, 1);
                        setFormData({ ...formData, products: updated });
                      }}
                      className="absolute top-0 right-0 text-red-600 font-bold px-2"
                      type="button"
                      title="Remove product"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add New Product Button */}
                <button
                  type="button"
                  className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      products: [
                        ...prev.products,
                        {
                          productId: 0,
                          serialNumber: "",
                          macAddress: "",
                          warrantyPeriod: "",
                          purchaseRate: "",
                        },
                      ],
                    }))
                  }
                >
                  + Add Product
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoiceTable;
