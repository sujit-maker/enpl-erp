"use client"
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Department {
  id: number;
  departmentName: string;
}

const DepartmentTable: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Department>({
    id: 0,
    departmentName: "",
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://128.199.19.28:8000/departments");
      setDepartments(response.data.reverse());
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = async () => {
    if (!formData.departmentName) {
      alert("Department name is required!");
      return;
    }

    try {
      await axios.post("http://128.199.19.28:8000/departments", formData);
      alert("Department added successfully!");
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  const handleUpdate = async () => {
    if (!formData.departmentName) {
      alert("Department name is required!");
      return;
    }

    try {
      await axios.put(
        `http://128.199.19.28:8000/departments/${formData.id}`,
        formData
      );
      alert("Department updated successfully!");
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  const handleDelete = useCallback(
    async (id: number) => {
      if (window.confirm("Are you sure you want to delete this department?")) {
        try {
          await axios.delete(`http://128.199.19.28:8000/departments/${id}`);
          alert("Department deleted successfully!");
          fetchDepartments();
        } catch (error) {
          console.error("Error deleting department:", error);
        }
      }
    },
    [fetchDepartments]
  );

  const openModal = (department?: Department) => {
    if (department) {
      setFormData(department);
      setIsEditing(true);
    } else {
      setFormData({ id: 0, departmentName: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: 0, departmentName: "" });
  };

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-3 overflow-auto lg:ml-72 "> 
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
  onClick={() => openModal()}
  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
>
   Add Department
</button>

        </div>

        <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
         <table className="w-full text-sm text-gray-700 bg-white rounded-xl shadow-md overflow-hidden">
  <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
    <tr>
      <th className="py-3 px-4 text-center">ID</th>
      <th className="py-3 px-4 text-center">Department Name</th>
      <th className="py-3 px-4 text-center">Actions</th>
    </tr>
  </thead>
  <tbody>
    {departments.map((department) => (
      <tr
        key={department.id}
        className="hover:bg-blue-50 transition-colors duration-200"
      >
        <td className="px-4 py-2 text-center">{department.id}</td>
        <td className="px-4 py-2 text-center">{department.departmentName}</td>
        <td className="px-4 py-2 text-center space-x-2">
          <button
            onClick={() => openModal(department)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(department.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition-transform transform hover:scale-110"
          >
            <FaTrashAlt />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
  <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
    <h2 className="text-xl font-semibold mb-4 text-indigo-600">
      {isEditing ? "Edit Department" : "Add Department"}
    </h2>
    <input
      name="departmentName"
      value={formData.departmentName}
      onChange={(e) =>
        setFormData({ ...formData, departmentName: e.target.value })
      }
      placeholder="Department Name"
      className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300"
    />
    <div className="flex justify-end gap-2">
      <button
        onClick={isEditing ? handleUpdate : handleAdd}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition"
      >
        Save
      </button>
      <button
        onClick={closeModal}
        className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-xl transition"
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

export default DepartmentTable;
