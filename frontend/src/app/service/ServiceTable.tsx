"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Service {
  id: number;
  serviceSkuId: string;
  serviceName: string;
  serviceDescription: string;
  SAC: string;
  categoryId: number;
  subCategoryId: number;
}

interface Category {
  id: number;
  categoryName: string;
  subCategories: { id: number; subCategoryName: string }[];
}

const ServiceTable: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<
    { id: number; subCategoryName: string }[]
  >([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [formData, setFormData] = useState({
    serviceSkuId: "",
    serviceName: "",
    serviceDescription: "",
    SAC: "",
    serviceCategoryId: 0,
    serviceSubCategoryId: 0,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:8000/service");
      setServices(response.data.reverse());
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/servicecategory");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = (categoryId: string) => {
    const category = categories.find((cat) => cat.id.toString() === categoryId);
    const validSubCategories = category
      ? category.subCategories.filter(
          (sub) => sub.subCategoryName && sub.subCategoryName.trim() !== ""
        )
      : [];
    setSubCategories(validSubCategories);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = e.target.value;
    setCategoryId(selectedCategoryId);
    fetchSubCategories(selectedCategoryId);
    setSubCategoryId("");
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubCategoryId(e.target.value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      const newService = {
        ...formData,
        serviceCategoryId: +categoryId, // 🔁 FIXED
        serviceSubCategoryId: +subCategoryId, // 🔁 FIXED
      };
      await axios.post("http://localhost:8000/service", newService);
      alert("Service added successfully!");
      setIsCreateModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleUpdate = async () => {
    if (selectedService) {
      try {
        const updatedService = {
          ...formData,
          serviceCategoryId: +categoryId,
          serviceSubCategoryId: +subCategoryId,
        };
        await axios.put(
          `http://localhost:8000/service/${selectedService.id}`,
          updatedService
        );
        alert("Service updated successfully!");
        setIsUpdateModalOpen(false);
        fetchServices();
      } catch (error) {
        console.error("Error updating service:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await axios.delete(`http://localhost:8000/service/${id}`);
        alert("Service deleted successfully!");
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const filteredServices = services.filter((service) =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.serviceSkuId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
  
    const aVal = a[key as keyof typeof a];
    const bVal = b[key as keyof typeof b];
  
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
  
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }
  
    return 0;
  });
  
  const currentServices = sortedServices.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen mt-20">
      <div className="flex-1 p-6 overflow-auto lg:ml-72 ">
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={() => {
              setFormData({
                serviceSkuId: "",
                serviceName: "",
                serviceDescription: "",
                SAC: "",
                serviceCategoryId: 0,
                serviceSubCategoryId: 0,
              });
              setIsCreateModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Service
          </button>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />
        </div>

        <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
          <table className="min-w-[1100px] w-full text-center border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
              <th
  onClick={() =>
    setSortConfig((prev) =>
      prev?.key === "serviceSkuId"
        ? { key: "serviceSkuId", direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key: "serviceSkuId", direction: "asc" }
    )
  }
  className="cursor-pointer hover:bg-gray-100 px-4 py-2"
>
  SKU ID ⬍
</th>
                <th
  onClick={() =>
    setSortConfig((prev) =>
      prev?.key === "serviceName"
        ? { key: "serviceName", direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key: "serviceName", direction: "asc" }
    )
  }
  className="cursor-pointer hover:bg-gray-100 px-4 py-2"
>
  Service Name ⬍
</th>
                <th className="border border-gray-300 px-4 py-2">
                  Description
                </th>


                <th className="border border-gray-300 px-4 py-2">SAC</th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">
                    {service.serviceSkuId}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.serviceName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.serviceDescription}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.SAC}
                  </td>

                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setFormData({
                          serviceSkuId: service.serviceSkuId,
                          serviceName: service.serviceName,
                          serviceDescription: service.serviceDescription,
                          SAC: service.SAC,
                          serviceCategoryId: service.categoryId || 0,
                          serviceSubCategoryId: service.subCategoryId || 0,
                        });
                        setCategoryId(service.categoryId.toString());
                        setSubCategoryId(service.subCategoryId.toString());
                        setIsUpdateModalOpen(true);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {[...Array(Math.ceil(filteredServices.length / itemsPerPage))].map(
            (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-700"
                } hover:bg-blue-400`}
              >
                {index + 1}
              </button>
            )
          )}
          <button
            onClick={() => paginate(currentPage + 1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            disabled={currentPage === Math.ceil(services.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <Modal
          title="Add Service"
          formData={formData}
          categories={categories}
          subCategories={subCategories}
          categoryId={categoryId}
          subCategoryId={subCategoryId}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onSubCategoryChange={handleSubCategoryChange}
          onSave={handleCreate}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isUpdateModalOpen && selectedService && (
        <Modal
          title="Update Service"
          formData={formData}
          categories={categories}
          subCategories={subCategories}
          categoryId={categoryId}
          subCategoryId={subCategoryId}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onSubCategoryChange={handleSubCategoryChange}
          onSave={handleUpdate}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      )}
    </div>
  );
};

const Modal: React.FC<{
  title: string;
  formData: any;
  categories: Category[];

  subCategories: { id: number; subCategoryName: string }[];
  categoryId: string;
  subCategoryId: string;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: () => void;
  onClose: () => void;
}> = ({
  title,
  formData,
  categories,
  subCategories,
  categoryId,
  subCategoryId,
  onInputChange,
  onCategoryChange,
  onSubCategoryChange,
  onSave,
  onClose,
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg w-96">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <input
        name="serviceSkuId"
        value={formData.serviceSkuId}
        onChange={onInputChange}
        placeholder="Service SKU ID"
        className="w-full mb-3 p-2 border rounded"
      />

      <select
        value={categoryId}
        onChange={onCategoryChange}
        className="w-full mb-3 p-2 border rounded"
        required
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.categoryName}
          </option>
        ))}
      </select>

      <select
        value={subCategoryId}
        onChange={onSubCategoryChange}
        className="w-full mb-3 p-2 border rounded"
        required
      >
        <option value="">Select Subcategory</option>
        {subCategories.map((subCategory) => (
          <option key={subCategory.id} value={subCategory.id}>
            {subCategory.subCategoryName}
          </option>
        ))}
      </select>

      <input
        name="serviceName"
        value={formData.serviceName}
        onChange={onInputChange}
        placeholder="Service Name"
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        name="serviceDescription"
        value={formData.serviceDescription}
        onChange={onInputChange}
        placeholder="Description"
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        name="SAC"
        value={formData.SAC}
        onChange={onInputChange}
        placeholder="SAC"
        className="w-full mb-3 p-2 border rounded"
      />

      <div className="flex justify-end space-x-2">
        <button
          onClick={onSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default ServiceTable;
