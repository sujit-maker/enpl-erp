"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateUserModal from "./CreateUserModal";
import UpdateUserModal from "./UpdateUserModal";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  emailId: string;
  departments: Department[];
  userType: string;
}

interface Department {
  id: number;
  departmentName: string;
}

  const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; 

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/users");
      setUsers(response.data.reverse());
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://128.199.19.28:8000/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://128.199.19.28:8000/users/${id}`);
      alert("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setShowUpdateModal(true);
  };

  const getDepartmentName = (departments: Department[]) => {
    return departments.length > 0
      ? departments.map((dept) => dept.departmentName).join(", ")
      : "Unknown";
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen mt-3">
      <div className="flex-1 p-6 overflow-auto lg:ml-72">
        <div className="flex justify-between items-center mb-5 mt-16">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add User
          </button>
        </div>

        {/* Responsive Scrollable Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto" style={{ maxWidth: "100vw" }}>
            <table className="min-w-[800px] w-full text-center border-collapse border border-gray-600">
              <thead className="bg-gray-300">
                <tr>
                  <th className="border border-gray-300 p-2">Username</th>
                  <th className="border border-gray-300 p-2">Department</th>
                  <th className="border border-gray-300 p-2">User Type</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers
                  .filter((user) => user.username !== "admin")
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-2">{user.username}</td>
                      <td className="border border-gray-300 p-2">
                        {user.departments.length > 0
                          ? getDepartmentName(user.departments)
                          : "Loading..."}
                      </td>
                      <td className="border border-gray-300 p-2">{user.userType}</td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            <FaEdit className="inline-block" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            <FaTrashAlt className="inline-block" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {/* Page Numbers */}
          {[...Array(Math.ceil(users.length / itemsPerPage))].map((_, index) => (
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
            disabled={currentPage === Math.ceil(users.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      <CreateUserModal
        show={isCreateModalOpen}
        onHide={() => setIsCreateModalOpen(false)}
        fetchUsers={fetchUsers}
      />
      {showUpdateModal && (
        <UpdateUserModal
          show={showUpdateModal}
          onHide={() => setShowUpdateModal(false)}
          userId={selectedUserId}
          fetchUsers={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserTable;
