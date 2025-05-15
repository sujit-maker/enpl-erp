"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSearch, FaTrashAlt } from "react-icons/fa";

interface SubCategory {
  id: number;
  subCategoryName: string;
  subCategoryId: string;
  categoryId: number;
  category: Category;
}

interface Category {
  id: number;
  categoryId: string;
  categoryName: string;
}

const SubCategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setselectedCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: 0, // Initially empty
    subCategoryName: "",
    subCategorySuffix: "", // Added for suffix inpu
    subCategoryId: "",
  });
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ Fetch categories for the dropdown
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ✅ Fetch subcategories for the table
  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/subcategory");
      const filteredSubCategories = response.data.filter(
        (subCategory: SubCategory) =>
          subCategory.category?.categoryName && subCategory.subCategoryName
      );
      setSubCategories(filteredSubCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleDelete = async (subCategoryId: number) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(
          `http://128.199.19.28:8000/subcategory/${subCategoryId}`
        );
        alert("Subcategory deleted successfully!");
        fetchSubCategories(); // Re-fetch subcategories to update the table
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        alert("Failed to delete subcategory.");
      }
    }
  };

  //  Create or Update a subcategory
  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      categoryId: 0,
      subCategoryName: "",
      subCategoryId: "",
      subCategorySuffix: "",
    });
    setIsCreateModalOpen(true);
  };

  // Open Update Modal with selected subcategory details
  const openUpdateModal = (subCategory: SubCategory) => {
  const fullId = subCategory.subCategoryId;
  const categoryCode = subCategory.category.categoryId; // e.g., "MATCH"
  
  const suffix =
    fullId.startsWith(`${categoryCode}-`) && fullId.length > categoryCode.length + 1
      ? fullId.slice(categoryCode.length + 1) // grab only what's after `${categoryCode}-`
      : "";

  setSelectedSubCategory(subCategory);
  setFormData({
    categoryId: subCategory.category.id,
    subCategoryName: subCategory.subCategoryName,
    subCategoryId: subCategory.subCategoryId,
    subCategorySuffix: suffix,
  });
  setIsUpdateModalOpen(true);
};


  // ✅ Corrected handleSubmit function for creating or updating subcategories
  const handleSubmit = async () => {
    const { categoryId, subCategoryName, subCategorySuffix } = formData;

    if (!categoryId || !subCategoryName) {
      alert("Please select a category and enter a subcategory name.");
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryCode = selectedCategory?.categoryId || "";
    const newSubCategoryId = `${categoryCode}-${subCategorySuffix}`;
    try {
      if (selectedSubCategory) {
        // Updating existing subcategory
        await axios.put(
          `http://128.199.19.28:8000/subcategory/${selectedSubCategory.id}`,
          {
            categoryId,
            subCategoryName,
          }
        );
        alert("Subcategory updated successfully!");
      } else {
        // Creating new subcategory
        await axios.post("http://128.199.19.28:8000/subcategory", {
          categoryId,
          subCategoryName,
          subCategoryId: newSubCategoryId,
        });
        alert("Subcategory created successfully!");
      }

      fetchSubCategories();
      setIsCreateModalOpen(false);
      setIsUpdateModalOpen(false);
      setFormData({
        categoryId: 0,
        subCategoryName: "",
        subCategoryId: "",
        subCategorySuffix: "",
      });
    } catch (error) {
      console.error("Error handling subcategory:", error);
      alert("Failed to create or update subcategory.");
    }
  };

  // ✅ Fetch data when component mounts
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Pagination logic
  const filteredCategories = subCategories.filter(
    (subCategory) =>
      subCategory.subCategoryName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subCategory.category.categoryName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentSubcategories = filteredCategories.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-6 overflow-auto lg:ml-72">
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={openCreateModal}
             className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
          >
            Add Product Subcategory
          </button>
         <div className="relative w-full md:w-64">
                   <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                     <FaSearch />
                   </span>
                   <input
                     type="text"
                     placeholder="Search..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
                   />
                 </div>
        </div>

        <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
      <table className="w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
  <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Sub Category Id</th>
                <th className="border border-gray-300 p-2">Category Name</th>
                <th className="border border-gray-300 p-2">
                  Sub Category Name
                </th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSubcategories.length > 0 ? (
                currentSubcategories.map((subCategory) => (
                  <tr
                    key={subCategory.subCategoryId}
                    className="hover:bg-gray-100"
                  >
                    <td className="border border-gray-300 p-2">
                      {subCategory.subCategoryId}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {subCategory.category.categoryName}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {subCategory.subCategoryName}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
  <div className="flex justify-center items-center gap-3">
    <button
      onClick={() => openUpdateModal(subCategory)}
      className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
      title="Edit"
    >
      <FaEdit />
    </button>
    <button
      onClick={() => handleDelete(subCategory.id)}
      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
      title="Delete"
    >
      <FaTrashAlt />
    </button>
  </div>
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
          {[...Array(Math.ceil(filteredCategories.length / itemsPerPage))].map(
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
            disabled={
              currentPage ===
              Math.ceil(filteredCategories.length / itemsPerPage)
            }
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

            <div className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
              {/* Category Select */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    const selectedCategoryId = parseInt(e.target.value);
                    const selectedCategory = categories.find(
                      (c) => c.id === selectedCategoryId
                    );
                    const categoryCode = selectedCategory?.categoryId || "";

                    setFormData((prev) => ({
                      ...prev,
                      categoryId: selectedCategoryId,
                      subCategorySuffix: "",
                      subCategoryId: "",
                    }));
                  }}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Code (Suffix) */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Manual SubCategory Id
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={formData.subCategorySuffix || ""}
                  onChange={(e) => {
                    const suffix = e.target.value.trim().toUpperCase();
                    const selectedCategory = categories.find(
                      (c) => c.id === formData.categoryId
                    );
                    const categoryCode = selectedCategory?.categoryId || "";

                    setFormData((prev) => ({
                      ...prev,
                      subCategorySuffix: suffix,
                      subCategoryId:
                        categoryCode && suffix
                          ? `${categoryCode}-${suffix}`
                          : "",
                    }));
                  }}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Read-only Subcategory ID */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Generated Subcategory ID
                </label>
                <input
                  type="text"
                  value={formData.subCategoryId || ""}
                  readOnly
                  className="w-full border p-2 rounded bg-gray-100 text-gray-600"
                  placeholder="Auto-generated ID"
                />
              </div>

              {/* Subcategory Name (Manual Input) */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Subcategory Name"
                  value={formData.subCategoryName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subCategoryName: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              >
                {isUpdateModalOpen
                  ? "Update Subcategory"
                  : "Create Subcategory"}
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

export default SubCategoryTable;
