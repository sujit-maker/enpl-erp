"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface SubCategory {
  id: number;
  subCategoryName: string;
}

interface Category {
  id: number;
  categoryName: string;
  subCategories: SubCategory[];
}

const CategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    subCategories: [{ subCategoryName: "" }],
  });

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/category");
      setCategories(response.data.reverse());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:8000/category/${id}`);
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
      await axios.post("http://localhost:8000/category", {
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
      await axios.put(`http://localhost:8000/category/${selectedCategory.id}`, {
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

    // Pagination logic
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstUser, indexOfLastUser);
  
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen mt-3">
    <div className="flex-1 p-6 overflow-auto lg:ml-72 "> 
      <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              setFormData({ categoryName: "", subCategories: [{ subCategoryName: "" }] });
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Category
          </button>
        </div>

        <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
          <table className="min-w-[400px] w-full text-center border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Id</th>
                <th className="border border-gray-300 p-2">Category Name</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.length > 0 ? (
                currentCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">{category.id}</td>
                    <td className="border border-gray-300 p-2">{category.categoryName}</td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setFormData({
                            categoryName: category.categoryName,
                            subCategories: category.subCategories.map((sub) => ({
                              subCategoryName: sub.subCategoryName,
                            })),
                          });
                          setIsUpdateModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
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
                  <td colSpan={4} className="p-3 text-gray-500">
                    No categories available.
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
          {[...Array(Math.ceil(categories.length / itemsPerPage))].map((_, index) => (
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
            disabled={currentPage === Math.ceil(categories.length / itemsPerPage)}
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

export default CategoryTable;
