"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilLine, Trash2 } from "lucide-react";
import { CustomerCombobox } from "@/components/ui/CustomerCombobox";
import SiteCombobox from "@/components/ui/SiteCombobox";

interface Customer {
  id: number;
  customerName: string;
}

interface Site {
  id: number;
  siteName: string;
  customerId: number;
}

interface ContractInventory {
  inventoryType: string;
  productName: string;
  inventoryName: string;
  serialno: string;
  macAddress: string;
  dateOfPurchase: string;
  remark: string;
}

interface ServiceContract {
  id: number;
  customerId: number;
  siteId: number;
  relmanager: string;
  startDate: string;
  endDate: string;
  serviceCategory: string;
  visitSite: number;
  maintenanceVisit: number;
  contractDescription: string;
  Customer: Customer;
  Site: Site;
  contractInventories: ContractInventory[];
}

interface FormData {
  customerId: number;
  siteId: number;
  relmanager: string;
  startDate: string;
  endDate: string;
  serviceCategory: string;
  visitSite: number;
  maintenanceVisit: number;
  contractDescription: string;
  contractInventories: ContractInventory[];
}

const ServiceContractTable: React.FC = () => {
  const [contracts, setContracts] = useState<ServiceContract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sites, setSites] = useState<Site[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<ServiceContract | null>(null);
  const [formData, setFormData] = useState<FormData>({
    customerId: 0,
    siteId: 0,
    relmanager: "",
    startDate: "",
    endDate: "",
    serviceCategory: "",
    visitSite: 0,
    maintenanceVisit: 0,
    contractDescription: "",
    contractInventories: [
      {
        inventoryType: "",
        inventoryName: "",
        productName: "",
        serialno: "",
        macAddress: "",
        dateOfPurchase: "",
        remark: "",
      },
    ],
  });

  const fetchContracts = async () => {
    try {
      const response = await axios.get(
        "http://128.199.19.28:8000/servicecontracts"
      );
      setContracts(response.data.reverse());
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/sites");
      setSites(response.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const customer = contract.Customer?.customerName?.toLowerCase() || "";
    const site = contract.Site?.siteName?.toLowerCase() || "";
    const manager = contract.relmanager.toLowerCase();
    const category = contract.serviceCategory.toLowerCase();
    const product =
      contract.contractInventories[0]?.productName?.toLowerCase() || "";

    return (
      customer.includes(searchText.toLowerCase()) ||
      site.includes(searchText.toLowerCase()) ||
      manager.includes(searchText.toLowerCase()) ||
      category.includes(searchText.toLowerCase()) ||
      product.includes(searchText.toLowerCase())
    );
  });

  useEffect(() => {
    fetchContracts();
    fetchCustomers();
    fetchSites();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number,
    fieldName?: keyof ContractInventory
  ) => {
    const { name, value } = e.target;
    if (index !== undefined && fieldName) {
      const updatedInventories = [...formData.contractInventories];
      updatedInventories[index][fieldName] = value;
      setFormData((prev) => ({
        ...prev,
        contractInventories: updatedInventories,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: [
          "customerId",
          "siteId",
          "visitSite",
          "maintenanceVisit",
        ].includes(name)
          ? Number(value)
          : value,
      }));
    }
  };

  const addInventoryField = () => {
    setFormData((prev) => ({
      ...prev,
      contractInventories: [
        ...prev.contractInventories,
        {
          inventoryType: "",
          inventoryName: "",
          productName: "",
          serialno: "",
          macAddress: "",
          dateOfPurchase: "",
          remark: "",
        },
      ],
    }));
  };

  const removeInventoryField = (index: number) => {
    const updated = [...formData.contractInventories];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      contractInventories: updated,
    }));
  };

  const handleCreate = async () => {
    try {
      await axios.post("http://128.199.19.28:8000/servicecontracts", formData);
      alert("Contract created successfully!");
      setIsCreateModalOpen(false);
      fetchContracts();
    } catch (error) {
      console.error("Error creating contract:", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedContract) return;

    // Helper function to format dates as yyyy-MM-dd
    const formatDate = (date: string) => {
      const d = new Date(date);
      return d.toISOString().split("T")[0]; // Extract yyyy-MM-dd from the ISO string
    };

    // Reformat the dates
    const updatedFormData = {
      ...formData,
      visitSite: Number(formData.visitSite),
      maintenanceVisit: Number(formData.maintenanceVisit),
      startDate: formatDate(formData.startDate), // Reformat startDate
      endDate: formatDate(formData.endDate), // Reformat endDate
    };

    try {
      const response = await axios.put(
        `http://128.199.19.28:8000/servicecontracts/${selectedContract.id}`,
        updatedFormData
      );
      alert("Contract updated successfully!");
      setIsUpdateModalOpen(false);
      setSelectedContract(null); // Reset after update
      fetchContracts(); // Fetch the updated contracts
    } catch (error) {
      console.error("Error updating contract:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    try {
      await axios.delete(`http://128.199.19.28:8000/servicecontracts/${id}`);
      alert("Deleted successfully!");
      fetchContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);
    }
  };

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-6 overflow-auto lg:ml-72">
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={() => {
              setFormData({
                customerId: 0,
                siteId: 0,
                relmanager: "",
                startDate: "",
                endDate: "",
                serviceCategory: "",
                visitSite: 0,
                maintenanceVisit: 0,
                contractDescription: "",
                contractInventories: [
                  {
                    inventoryType: "",
                    inventoryName: "",
                    productName: "",
                    serialno: "",
                    macAddress: "",
                    dateOfPurchase: "",
                    remark: "",
                  },
                ],
              });
              setIsCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
          >
            Add Service Contract
          </button>
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
              <tr>
                <th className="p-2 border">Relationship Manager</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Site</th>
                <th className="p-2 border">Service Category</th>
                <th className="p-2 border">No of Visit Site</th>
                <th className="p-2 border">No of Maintenance Visit</th>
                <th className="p-2 border">Contract Description</th>
                <th className="p-2 border">Product Name</th>
                <th className="p-2 border">Start - End</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-100">
                  <td className="p-2 border">{contract.relmanager}</td>
                  <td className="p-2 border">
                    {contract.Customer?.customerName}
                  </td>
                  <td className="p-2 border">{contract.Site?.siteName}</td>
                  <td className="p-2 border">{contract.serviceCategory}</td>
                  <td className="p-2 border">{contract.visitSite}</td>
                  <td className="p-2 border">{contract.maintenanceVisit}</td>
                  <td className="p-2 border">{contract.contractDescription}</td>
                  <td className="p-2 border">
                    {contract.contractInventories.length > 0
                      ? contract.contractInventories[0].productName
                      : "-"}
                  </td>

                  <td className="p-2 border">
                    {new Date(contract.startDate).toLocaleDateString()} -{" "}
                    {new Date(contract.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedContract(contract);
                          setFormData({
                            ...contract,
                            visitSite: contract.visitSite,
                            maintenanceVisit: contract.maintenanceVisit,
                            contractInventories:
                              contract.contractInventories || [],
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="text-blue-600"
                      >
                        <PencilLine size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(contract.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(isCreateModalOpen || isUpdateModalOpen) && (
        <Modal
          title={
            isCreateModalOpen
              ? "Add Service Contract"
              : "Update Service Contract"
          }
          formData={formData}
          customers={customers}
          sites={sites}
          onInputChange={handleInputChange}
          onAddInventory={addInventoryField}
          onRemoveInventory={removeInventoryField}
          onSave={isCreateModalOpen ? handleCreate : handleUpdate}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsUpdateModalOpen(false);
          }}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

const Modal: React.FC<{
  title: string;
  formData: FormData;
  customers: Customer[];
  sites: Site[];
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number,
    fieldName?: keyof ContractInventory
  ) => void;
  onAddInventory: () => void;
  onRemoveInventory: (index: number) => void;
  onSave: () => void;
  onClose: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>; // Add this
}> = ({
  title,
  formData,
  sites,
  onInputChange,
  onAddInventory,
  onRemoveInventory,
  onSave,
  onClose,
  setFormData,
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-auto">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <label htmlFor="customerId" className="block mb-1 font-medium">
        Customer
      </label>
      <CustomerCombobox
        selectedValue={formData.customerId} // Make sure this is passed correctly
        onSelect={(value) => setFormData({ ...formData, customerId: value })} // Ensure this updates formData
        placeholder="Select Customer"
      />

      <label htmlFor="siteId" className="block mb-1 font-medium">
        Site
      </label>
      <SiteCombobox
        selectedValue={formData.siteId} // Make sure this is passed correctly
        onSelect={(value) => setFormData({ ...formData, siteId: value })} // Ensure this updates formData
        placeholder="Select Site"
      />

      <label htmlFor="relmanager" className="block mb-1 font-medium">
        Relationship Manager
      </label>
      <input
        id="relmanager"
        name="relmanager"
        value={formData.relmanager}
        onChange={onInputChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <label htmlFor="serviceCategory" className="block mb-1 font-medium">
        Service Category
      </label>
      <select
        id="serviceCategory"
        name="serviceCategory"
        value={formData.serviceCategory}
        onChange={onInputChange}
        className="w-full mb-3 p-2 border rounded"
      >
        <option value="">Select</option>
        <option value="Networks">Networks</option>
        <option value="PBX">PBX</option>
        <option value="CCTV">CCTV</option>
        <option value="Access Control">Access Control</option>
        <option value="OpenWan">OpenWan</option>
        <option value="OpenWi">OpenWi</option>
        <option value="OpenLogix">OpenLogix</option>
      </select>

      <label htmlFor="startDate" className="block mb-1 font-medium">
        Start Date
      </label>
      <input
        id="startDate"
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={onInputChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <label htmlFor="endDate" className="block mb-1 font-medium">
        End Date
      </label>
      <input
        id="endDate"
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={onInputChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <label htmlFor="visitSite" className="block mb-1 font-medium">
        Number of Site Visits
      </label>
      <input
        id="visitSite"
        type="number"
        name="visitSite"
        value={formData.visitSite}
        onChange={onInputChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <label htmlFor="maintenanceVisit" className="block mb-1 font-medium">
        Number of maintenanceVisit
      </label>
      <input
        id="maintenanceVisit"
        type="number"
        name="maintenanceVisit"
        value={formData.maintenanceVisit}
        onChange={onInputChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <label htmlFor="contractDescription" className="block mb-1 font-medium">
        contractDescription
      </label>
      <input
        id="contractDescription"
        name="contractDescription"
        value={formData.contractDescription}
        onChange={onInputChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <label className="block mb-2 font-medium text-sm text-gray-700">
        Contract Inventories
      </label>
      {formData.contractInventories.map((inv, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 items-end bg-gray-50 p-4 rounded shadow-sm"
        >
          <input
            type="text"
            placeholder="Serial Number"
            value={inv.serialno}
            onChange={(e) => onInputChange(e, index, "serialno")}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="Inventory Type"
            value={inv.inventoryType}
            onChange={(e) => onInputChange(e, index, "inventoryType")}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="Inventory Name"
            value={inv.inventoryName}
            onChange={(e) => onInputChange(e, index, "inventoryName")}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="Product Name"
            value={inv.productName}
            onChange={(e) => onInputChange(e, index, "productName")}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="MAC Address"
            value={inv.macAddress}
            onChange={(e) => onInputChange(e, index, "macAddress")}
            className="p-2 border rounded w-full"
          />
          <input
            type="date"
            placeholder="Date of Purchase"
            value={inv.dateOfPurchase}
            onChange={(e) => onInputChange(e, index, "dateOfPurchase")}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="remark"
            value={inv.remark}
            onChange={(e) => onInputChange(e, index, "remark")}
            className="p-2 border rounded w-full"
          />
          <button
            type="button"
            onClick={() => onRemoveInventory(index)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="flex justify-end mb-3">
        <button
          onClick={onAddInventory}
          className="text-blue-600 mt-2 hover:underline"
        >
          + Add Service Contract
        </button>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
        <button
          onClick={onSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);

export default ServiceContractTable;
