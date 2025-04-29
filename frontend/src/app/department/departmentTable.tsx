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
      const response = await axios.get("http://localhost:8000/departments");
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
      await axios.post("http://localhost:8000/departments", formData);
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
        `http://localhost:8000/departments/${formData.id}`,
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
          await axios.delete(`http://localhost:8000/departments/${id}`);
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Department
          </button>
        </div>

        <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
          <table className="min-w-[400px] w-full text-center border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300">Id</th>
                <th className="border border-gray-300">
                  Department Name
                </th>
                <th className="border border-gray-300  py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      <Skeleton height={20} width={50} />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Skeleton height={20} width={150} />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Skeleton height={20} width={100} />
                    </td>
                  </tr>
                ))
              ) : departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">
                      {department.id}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {department.departmentName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => openModal(department)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                      >
                        <FaEdit className="inline-block" />
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrashAlt className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-gray-500">
                    No departments available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 md:w-1/3">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Department" : "Add Department"}
            </h2>
            <input
  name="departmentName"
  value={formData.departmentName}
  onChange={(e) =>
    setFormData({ ...formData, departmentName: e.target.value })
  }
  placeholder="Department Name"
  className="w-full mb-3 p-2 border rounded"
/>

            <div className="flex justify-end">
              <button
                onClick={isEditing ? handleUpdate : handleAdd}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              >
                Save
              </button>
              <button
                onClick={closeModal}
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

export default DepartmentTable;
