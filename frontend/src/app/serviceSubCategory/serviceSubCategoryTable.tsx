"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  id: number;
  categoryName: string;
}

interface SubCategory {
  id: number;
  serviceSubCatId: string;
  subCategoryName: string;
  categoryId: number;
  category: Category;
}

const ServiceSubCategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceSubCatId: "",
    categoryId: 0,
    subCategoryName: "",
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/servicecategory");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/servicesubcategory");
      const filtered = response.data.filter(
        (sub: SubCategory) => sub.category?.categoryName && sub.subCategoryName
      );
      setSubCategories(filtered);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(`http://128.199.19.28:8000/servicesubcategory/${id}`);
        alert("Subcategory deleted successfully!");
        fetchSubCategories();
      } catch (error) {
        alert("Failed to delete subcategory.");
      }
    }
  };

  const handleSubmit = async () => {
    const { serviceSubCatId, categoryId, subCategoryName } = formData;
    if (!serviceSubCatId || !categoryId || !subCategoryName) {
      alert("Please fill all fields.");
      return;
    }

    try {
      if (selectedSubCategory) {
        await axios.put(`http://128.199.19.28:8000/servicesubcategory/${selectedSubCategory.id}`, {
          serviceSubCatId,
          categoryId,
          subCategoryName,
        });
        alert("Subcategory updated successfully!");
      } else {
        await axios.post("http://128.199.19.28:8000/servicesubcategory", {
          serviceSubCatId,
          serviceCategoryId: categoryId,
          subCategoryName,
        });
        alert("Subcategory created successfully!");
      }

      fetchSubCategories();
      setIsCreateModalOpen(false);
      setIsUpdateModalOpen(false);
      setFormData({ categoryId: 0, subCategoryName: "", serviceSubCatId: "" });
    } catch (error) {
      alert("Failed to create or update subcategory.");
    }
  };

  const openCreateModal = () => {
    setSelectedSubCategory(null);
    setFormData({ categoryId: 0, subCategoryName: "", serviceSubCatId: "" });
    setIsCreateModalOpen(true);
  };

  const openUpdateModal = (sub: SubCategory) => {
    setSelectedSubCategory(sub);
    setFormData({
      serviceSubCatId: sub.serviceSubCatId,
      categoryId: sub.category.id,
      subCategoryName: sub.subCategoryName,
    });
    setIsUpdateModalOpen(true);
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Search & Sort Logic
  const filtered = subCategories.filter(
    (sub) =>
      sub.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.serviceSubCatId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.category?.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aVal = a[key as keyof SubCategory];
    let bVal = b[key as keyof SubCategory];
    if (key === "category") {
      aVal = a.category.categoryName;
      bVal = b.category.categoryName;
    }
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = sorted.slice(indexOfFirst, indexOfLast);

  const paginate = (page: number) => setCurrentPage(page);

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-6 overflow-auto lg:ml-72">
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={openCreateModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Subcategory
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
          <table className="min-w-[1100px] w-full text-center border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "serviceSubCatId"
                        ? { key: "serviceSubCatId", direction: prev.direction === "asc" ? "desc" : "asc" }
                        : { key: "serviceSubCatId", direction: "asc" }
                    )
                  }
                  className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  Subcategory ID ⬍
                </th>
                <th
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "category"
                        ? { key: "category", direction: prev.direction === "asc" ? "desc" : "asc" }
                        : { key: "category", direction: "asc" }
                    )
                  }
                  className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  Category Name ⬍
                </th>
                <th
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "subCategoryName"
                        ? { key: "subCategoryName", direction: prev.direction === "asc" ? "desc" : "asc" }
                        : { key: "subCategoryName", direction: "asc" }
                    )
                  }
                  className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  Subcategory Name ⬍
                </th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.length > 0 ? (
                current.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 border-t border-gray-200">
                    <td className="border px-4 py-2">{sub.serviceSubCatId}</td>
                    <td className="border px-4 py-2">{sub.category.categoryName}</td>
                    <td className="border px-4 py-2">{sub.subCategoryName}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => openUpdateModal(sub)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-gray-500 text-center">
                    No subcategories available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(Math.ceil(filtered.length / itemsPerPage))].map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-4 py-2 rounded ${
                currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
              } hover:bg-blue-400`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create/Update Modal */}
      {(isCreateModalOpen || isUpdateModalOpen) && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {isUpdateModalOpen ? "Edit Subcategory" : "Add Subcategory"}
            </h2>
            <input
              type="text"
              value={formData.serviceSubCatId}
              onChange={(e) => setFormData({ ...formData, serviceSubCatId: e.target.value })}
              placeholder="Subcategory ID"
              className="border p-2 rounded mb-2 w-full"
            />
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              className="border p-2 rounded mb-2 w-full"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.subCategoryName}
              onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
              placeholder="Subcategory Name"
              className="border p-2 rounded mb-2 w-full"
            />
            <div className="mt-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              >
                {isUpdateModalOpen ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsUpdateModalOpen(false);
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSubCategoryTable;
