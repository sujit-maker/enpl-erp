"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { CustomerCombobox } from "@/components/ui/CustomerCombobox";
import { VendorCombobox } from "@/components/ui/VendorCombobox";
import SerialCombobox from "@/components/ui/SerialCombobox";
import MacAddressCombobox from "@/components/ui/MacAddressCombobox";

interface Vendor {
  id: number;
  vendorName: string;
}

interface Customer {
  id: number;
  customerName: string;
}

interface Product {
  id: number;
  productName: string;
}

interface InventoryItem {
  id: number;
  serialNumber: string;
  macAddress: string;
  productId: number;
  product: Product;
  vendorId: number;
  vendor: Vendor;
}

interface FormData {
  id?: number;
  deliveryType: string;
  refNumber?: string;
  customerId?: number;
  productId?: number;
  inventoryId?: number;
  vendorId?: number;
}

interface DeliveryItem {
  serialNumber: string;
  macAddress: string;
  productId: number;
  inventoryId?: number;
  productName?: string;
  vendorId?: number;
  customerId?: number;

}

const initialFormData: FormData = {
  deliveryType: "",
  refNumber: "",
  customerId: 0,
  vendorId: 0,
  productId: 0,
  
};

const MaterialDeliveryForm: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [items, setItems] = useState<DeliveryItem[]>([
    { serialNumber: "", macAddress: "", productId: 0 },
  ]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryList, setDeliveryList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isSaleOrDemo =
    formData.deliveryType === "Sale" || formData.deliveryType === "Demo";
  const isPurchaseReturn = formData.deliveryType === "Purchase Return";

  useEffect(() => {
    axios
      .get("http://localhost:8000/customers")
      .then((res) => setCustomers(res.data));
    axios
      .get("http://localhost:8000/vendors")
      .then((res) => setVendors(res.data));
    axios
      .get("http://localhost:8000/products")
      .then((res) => setProducts(res.data));
    axios
      .get("http://localhost:8000/inventory")
      .then((res) => setInventory(res.data));
    fetchDeliveries(); // Fetch deliveries on component mount
  }, []);

  useEffect(() => {
    // Fetching inventory with associated product and vendor data
    axios.get("http://localhost:8000/inventory").then((res) => {
      setInventoryList(res.data);
    });
  }, []);

  const fetchDeliveries = async () => {
    const res = await axios.get("http://localhost:8000/material-delivery");
    setDeliveryList(res.data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "customerId" || name === "vendorId" ? parseInt(value) : value,
    }));
  };

  const handleItemChange = (index: number, field: keyof DeliveryItem, value: string) => {
    const updatedItems = [...items];
    (updatedItems[index][field] as string) = value;

    // Auto-fill productId and inventoryId if serialNumber or macAddress is selected
    if (field === "serialNumber" || field === "macAddress") {
      const found = inventory.find(
        (inv) =>
          inv.serialNumber === updatedItems[index].serialNumber ||
          inv.macAddress === updatedItems[index].macAddress
      );

      if (found) {
        updatedItems[index].productId = found.productId;
        updatedItems[index].inventoryId = found.id;
        updatedItems[index].serialNumber = found.serialNumber;
        updatedItems[index].macAddress = found.macAddress;
      }
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { serialNumber: "", macAddress: "", productId: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handleSave = async () => {
    const isEdit = !!formData.id;
  
    // Map items array to include required fields
    const payload = {
      ...formData,
      customerId: isSaleOrDemo ? formData.customerId : undefined,
      vendorId: isPurchaseReturn ? formData.vendorId : undefined,
      materialDeliveryItems: items // Ensure this field includes all required item data
        .filter((item) => item.inventoryId) // Ensure items with inventoryId are included
        .map((item) => ({
          inventoryId: item.inventoryId,
          serialNumber: item.serialNumber, // Map serialNumber to serialNumber
          macAddress: item.macAddress, // Map macAddress properly
          productId: item.productId, // Ensure productId is mapped correctly
          productName: item.productName || "Unknown", // Default value for missing productName
        })),
    };
  
  
    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:8000/material-delivery/${formData.id}`,
          payload
        );
        alert("Delivery updated!");
      } else {
        await axios.post("http://localhost:8000/material-delivery", payload);
        alert("Delivery created!");
      }
  
      // Reset form and table after successful submission
      setFormData(initialFormData);
      setItems([{ serialNumber: "", macAddress: "", productId: 0 }]);
      fetchDeliveries();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error saving delivery");
    }
  };
  

  const openModal = (delivery?: any) => {
    if (delivery) {
      const enrichedItems = (delivery.materialDeliveryItems || []).map(
        (item: any) => ({
          inventoryId: item.inventoryId || 0,
          serialNumber: item.inventory?.serialNumber || "",
          macAddress: item.inventory?.macAddress || "",
          productId: item.inventory?.productId || 0,
        })
      );

      setFormData({
        id: delivery.id,
        deliveryType: delivery.deliveryType,
        refNumber: delivery.refNumber,
        customerId: delivery.customerId || 0,
        vendorId: delivery.vendorId || 0,
      });

      setItems(enrichedItems); 
    } else {
      setFormData(initialFormData);
      setItems([{ serialNumber: "", macAddress: "", productId: 0 }]); // Reset the items if creating new
    }

    setIsModalOpen(true);
  };

  const handleDelete = (id: any): void => {
    if (confirm("Are you sure you want to delete this delivery?")) {
      axios
        .delete(`http://localhost:8000/material-delivery/${id}`)
        .then(() => {
          alert("Delivery deleted!");
          fetchDeliveries(); // Refresh deliveries list after deletion
        })
        .catch((error) => {
          console.error(error);
          alert("Error deleting delivery");
        });
    }
  };

  return (
    <>
      <div className="flex-1 p-6 overflow-auto lg:ml-72">
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Delivery
          </button>
          <input
            type="text"
            placeholder="Search deliveries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-center border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Delivery Type</th>
                <th className="border p-2">Delivery Challan</th>
                <th className="border p-2">Ref Number</th>
                <th className="border p-2">Customer Name</th>
                <th className="border p-2">Vendor Name</th>
                <th className="border p-2">Serial Number</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">MAC Address</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveryList
                .filter((delivery) => {
                  const lowerSearch = search.toLowerCase();
                  return (
                    delivery.refNumber?.toLowerCase().includes(lowerSearch) ||
                    delivery.customer?.customerName
                      ?.toLowerCase()
                      .includes(lowerSearch) ||
                    delivery.vendor?.vendorName
                      ?.toLowerCase()
                      .includes(lowerSearch)
                  );
                })
                .map((delivery) => (
                  <tr key={delivery.id}>
                    <td className="border p-2">{delivery.deliveryType}</td>
                    <td className="border p-2">{delivery.deliveryChallan}</td>
                    <td className="border p-2">{delivery.refNumber}</td>
                    <td className="border p-2">
                      {delivery.customer?.customerName || "N/A"}
                    </td>
                    <td className="border p-2">
                      {delivery.vendor?.vendorName || "N/A"}
                    </td>

                    <td className="border p-2">
                      {delivery.materialDeliveryItems
                        ?.map(
                          (item: any, idx: number) =>
                            item.inventory?.serialNumber
                        )
                        .join(", ") || "-"}
                    </td>

                    <td className="border p-2">
                      {delivery.materialDeliveryItems
                        ?.map(
                          (item: any, idx: number) => item.product?.productName
                        )
                        .join(", ") || "-"}
                    </td>

                    <td className="border p-2">
                      {delivery.materialDeliveryItems
                        ?.map(
                          (item: any, idx: number) => item.inventory?.macAddress
                        )
                        .join(", ") || "-"}
                    </td>

                    <td className="border p-2">
                      <button
                        onClick={() => openModal(delivery)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(delivery.id)}
                        className="text-red-600 ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
              {/* Modal Title */}
              <h3 className="text-lg font-bold mb-4">
                {formData.id ? "Edit Delivery" : "Add Delivery"}
              </h3>

              {/* Form Inputs for Create and Edit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option value="">Select Delivery Type</option>
                  <option value="Sale">Sale</option>
                  <option value="Demo">Demo</option>
                  <option value="Purchase Return">Purchase Return</option>
                </select>

                <input
                  type="text"
                  name="refNumber"
                  placeholder="Reference Number"
                  value={formData.refNumber || ""}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />

                {isSaleOrDemo && (
                  <CustomerCombobox
                    selectedValue={formData.customerId ?? 0}
                    onSelect={(value) =>
                      setFormData({ ...formData, customerId: value })
                    }
                    placeholder="Select Customer"
                  />
                )}

                {isPurchaseReturn && (
                  <VendorCombobox
                    selectedValue={formData.vendorId ?? 0}
                    onSelect={(value) =>
                      setFormData({ ...formData, vendorId: value })
                    }
                    placeholder="Select Vendor"
                  />
                )}
              </div>

              {/* Items Section */}
              <div className="mt-6 space-y-4">
  {items.map((item, index) => (
    <div key={index} className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <SerialCombobox
          selectedValue={item.inventoryId || 0}
          onSelect={(value) => {
            const selectedInventory = inventoryList.find(
              (inv) => inv.id === value
            );
            if (selectedInventory) {
              const updatedItems = [...items];
              updatedItems[index] = {
                serialNumber: selectedInventory.serialNumber,
                macAddress: selectedInventory.macAddress,
                productId: selectedInventory.productId,
                inventoryId: selectedInventory.id,
              };
              setItems(updatedItems);
            }
          }}
          onInputChange={(value) =>
            handleItemChange(index, "serialNumber", value)
          }
          placeholder="Select Serial Number"
        />
      </div>

      <MacAddressCombobox
        selectedValue={
          inventoryList.find((inv) => inv.macAddress === item.macAddress)?.id ||
          0
        }
        onSelect={(value) => {
          const selectedInventory = inventoryList.find(
            (inv) => inv.id === value
          );
          if (selectedInventory) {
            const updated = [...items];
            updated[index] = {
              ...updated[index],
              macAddress: selectedInventory.macAddress,
              serialNumber: selectedInventory.serialNumber,
              productId: selectedInventory.productId,
              inventoryId: selectedInventory.id,
            };
            setItems(updated);
          }
        }}
        onInputChange={(value) =>
          handleItemChange(index, "macAddress", value)
        }
        placeholder="Select MAC Address"
      />

      <input
        type="text"
        readOnly
        value={
          products.find((p) => p.id === item.productId)?.productName || ""
        }
        placeholder="Product Name"
        className="border p-2 rounded bg-gray-100 text-gray-800 flex-1 min-w-[250px]"
      />

      <button
        onClick={addItem}
        className="text-green-600 font-bold text-2xl px-2"
      >
        +
      </button>
      {items.length > 1 && (
        <button
          onClick={() => removeItem(index)}
          className="text-red-600 font-bold text-2xl px-2"
        >
          −
        </button>
      )}
    </div>
  ))}
</div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  {formData.id ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MaterialDeliveryForm;
