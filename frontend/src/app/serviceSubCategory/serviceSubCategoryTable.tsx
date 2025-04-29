"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId: number;
  category: Category;
}

interface Category {
  id: number;
  categoryName: string;
}

const ServiceSubCategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: 0, // Initially empty
    subCategoryName: "",
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

  // ✅ Fetch categories for the dropdown
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/servicecategory");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ✅ Fetch subcategories for the table
  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/servicesubcategory");
      const filteredSubCategories = response.data.filter(
        (subCategory: SubCategory) => subCategory.category?.categoryName && subCategory.subCategoryName
      );
      setSubCategories(filteredSubCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };
  
  const handleDelete = async (subCategoryId: number) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(`http://localhost:8000/servicesubcategory/${subCategoryId}`);
        alert("Subcategory deleted successfully!");
        fetchSubCategories(); // Re-fetch subcategories to update the table
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        alert("Failed to delete subcategory.");
      }
    }
  };

  // ✅ Create or Update a subcategory
  const handleSubmit = async () => {
    const { categoryId, subCategoryName } = formData;

    if (!categoryId || !subCategoryName) {
      alert("Please select a category and enter a subcategory name.");
      return;
    }

    try {
      if (selectedSubCategory) {
        // Updating existing subcategory
        await axios.put(`http://localhost:8000/servicesubcategory/${selectedSubCategory.id}`, {
          categoryId,
          subCategoryName,
        });
        alert("Subcategory updated successfully!");
      } else {
        // Creating new subcategory
        await axios.post("http://localhost:8000/servicesubcategory", {
            serviceCategoryId: categoryId,
          subCategoryName,
        });
        alert("Subcategory created successfully!");
      }

      fetchSubCategories(); // Refresh table after updating/creating
      setIsCreateModalOpen(false);
      setIsUpdateModalOpen(false);
      setFormData({ categoryId: 0, subCategoryName: "" });
    } catch (error) {
      console.error("Error handling subcategory:", error);
      alert("Failed to create or update subcategory.");
    }
  };

  // ✅ Open Create Modal
  const openCreateModal = () => {
    setFormData({ categoryId: 0, subCategoryName: "" });
    setIsCreateModalOpen(true);
  };

  // ✅ Open Update Modal with selected subcategory details
  const openUpdateModal = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setFormData({
      categoryId: subCategory.category.id,
      subCategoryName: subCategory.subCategoryName,
    });
    setIsUpdateModalOpen(true);
  };

  // ✅ Fetch data when component mounts
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

    // Pagination logic
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentSubcategories = subCategories.slice(indexOfFirstUser, indexOfLastUser);
  
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
        </div>

        <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
          <table className="min-w-[500px] w-full text-center border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Id</th>
                <th className="border border-gray-300 p-2">Category Name</th>
                <th className="border border-gray-300 p-2">Sub Category Name</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSubcategories.length > 0 ? (
                currentSubcategories.map((subCategory) => (
                  <tr key={subCategory.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">{subCategory.id}</td>
                    <td className="border border-gray-300 p-2">
                      {subCategory.category.categoryName}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {subCategory.subCategoryName}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => openUpdateModal(subCategory)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subCategory.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-gray-500">
                    No subcategories available.
                  </td>
                </tr>
              )}
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
          {[...Array(Math.ceil(subCategories.length / itemsPerPage))].map((_, index) => (
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
            disabled={currentPage === Math.ceil(subCategories.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create/Update Subcategory Modal */}
      {(isCreateModalOpen || isUpdateModalOpen) && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {isUpdateModalOpen ? "Edit Subcategory" : "Add Subcategory"}
            </h2>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              className="border p-2 rounded mb-2 w-full"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
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
                {isUpdateModalOpen ? "Update Subcategory" : "Create Subcategory"}
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
