"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface SubCategory {
  id: number;
  subCategoryName: string;
}

interface Category {
  id: number;
  serviceCatId: string;
  categoryName: string;
  subCategories: SubCategory[];
}

const ServiceCategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    serviceCatId: "",
    categoryName: "",
    subCategories: [{ subCategoryName: "" }],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/servicecategory");
      setCategories(response.data.reverse());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:8000/servicecategory/${id}`);
        alert("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Ensure there are no dependent entries.");
      }
    }
  };

  const handleCreate = async () => {
    const { categoryName } = formData;

    if (!categoryName) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await axios.post("http://localhost:8000/servicecategory", {
        serviceCatId: formData.serviceCatId,
        categoryName: formData.categoryName,
        subCategories: formData.subCategories,
      });
      alert("Category created successfully!");
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      await axios.put(`http://localhost:8000/servicecategory/${selectedCategory.id}`, {
        serviceCatId: formData.serviceCatId,
        categoryName: formData.categoryName,
        subCategories: formData.subCategories,
      });
      alert("Category updated successfully!");
      setIsUpdateModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter and sort logic
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.serviceCatId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aVal = a[key as keyof Category];
    const bVal = b[key as keyof Category];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentCategories = sortedCategories.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-6 overflow-auto lg:ml-72">
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              setFormData({ categoryName: "", subCategories: [{ subCategoryName: "" }], serviceCatId: "" });
            }}
             className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
          >
            Add Service Category
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
             <table className="w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
  <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
              <tr className="bg-gray-100 text-gray-700">
                <th
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "serviceCatId"
                        ? { key: "serviceCatId", direction: prev.direction === "asc" ? "desc" : "asc" }
                        : { key: "serviceCatId", direction: "asc" }
                    )
                  }
                  className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  Service Cat Id ⬍
                </th>
                <th
                  onClick={() =>
                    setSortConfig((prev) =>
                      prev?.key === "categoryName"
                        ? { key: "categoryName", direction: prev.direction === "asc" ? "desc" : "asc" }
                        : { key: "categoryName", direction: "asc" }
                    )
                  }
                  className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  Category Name ⬍
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.length > 0 ? (
                currentCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 border-t border-gray-200">
                    <td className="border px-4 py-2">{category.serviceCatId}</td>
                    <td className="border px-4 py-2">{category.categoryName}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setFormData({
                            serviceCatId: category.serviceCatId,
                            categoryName: category.categoryName,
                            subCategories: category.subCategories.map((sub) => ({
                              subCategoryName: sub.subCategoryName,
                            })),
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-3 text-gray-500 text-center">
                    No categories available.
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
          {[...Array(Math.ceil(filteredCategories.length / itemsPerPage))].map((_, index) => (
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
            disabled={currentPage === Math.ceil(filteredCategories.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add Category</h2>

            <input
              type="text"
              value={formData.serviceCatId}
              onChange={(e) => setFormData({ ...formData, serviceCatId: e.target.value })}
              placeholder="Service Category Id"
              className="border p-2 rounded mb-2 w-full"
            />

            <input
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="Category Name"
              className="border p-2 rounded mb-2 w-full"
            />

            <div className="mt-4">
              <button
                onClick={handleCreate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>

            <input
              type="text"
              value={formData.serviceCatId}
              onChange={(e) => setFormData({ ...formData, serviceCatId: e.target.value })}
              placeholder="Service Cat Id"
              className="border p-2 rounded mb-2 w-full"
            />

            <input
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="Category Name"
              className="border p-2 rounded mb-2 w-full"
            />

            <div className="mt-4">
              <button
                onClick={handleUpdate}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
              >
                Update
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
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

export default ServiceCategoryTable;
