import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

interface CreateUserModalProps {
  show: boolean;
  onHide: () => void;
  fetchUsers: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show,
  onHide,
  fetchUsers,
}) => {
  const [username, setUsername] = useState<string>("");
  const { userId } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [emailId, setEmailId] = useState<string>("");
  const [departmentIds, setDepartmentIds] = useState<number[]>([]); 
  const [departments, setDepartments] = useState<
    { id: number; departmentName: string }[]
  >([]);
  const [userType, setUserType] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:8000/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loggedInUserType = localStorage.getItem("userType");
    const loggedInUserId = userId;

    try {
      const loggedInUserField =
        loggedInUserType === "HOD"
          ? { hodId: loggedInUserId }
          : loggedInUserType === "MANAGER"
          ? { managerId: loggedInUserId }
          : {};

      const newUser = {
        username,
        firstName,
        lastName,
        contactNumber,
        emailId,
        departmentIds, 
        userType,
        password,
        ...loggedInUserField,
      };

      await axios.post("http://localhost:8000/users", newUser);

      fetchUsers();
      onHide();
      resetForm();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const resetForm = () => {
    setUsername("");
    setFirstName("");
    setLastName("");
    setContactNumber("");
    setEmailId("");
    setDepartmentIds([]); 
    setUserType("");
    setPassword("");
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.value);
    setDepartmentIds((prev) =>
      e.target.checked ? [...prev, id] : prev.filter((department) => department !== id)
    );
  };

  return (
    <div
  className={`fixed inset-0 bg-gray-600 bg-opacity-50 mt-3 flex justify-center items-center z-50 transition-opacity ${
    show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  }`}
>
  <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 md:p-8 max-h-[80vh] overflow-y-auto">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800">Add New User</h3>
      <button onClick={onHide} className="text-gray-500 hover:text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* User form fields */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="p-3 border border-gray-300 rounded-md mt-1"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="text"
            className="p-3 border border-gray-300 rounded-md mt-1"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="password"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            className="p-3 border border-gray-300 rounded-md mt-1"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            className="p-3 border border-gray-300 rounded-md mt-1"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Contact Number</label>
          <input
            type="tel"
            className="p-3 border border-gray-300 rounded-md mt-1"
            placeholder="Enter contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Email ID</label>
          <input
            type="email"
            className="p-3 border border-gray-300 rounded-md mt-1"
            placeholder="Enter email ID"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">User Type</label>
          <select
            className="p-3 border border-gray-300 rounded-md mt-1"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            <option value="" disabled>
              Select User Type
            </option>
            <option value="HOD">HOD</option>
            <option value="MANAGER">MANAGER</option>
            <option value="EXECUTIVE">EXECUTIVE</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col mt-4">
        <label className="text-sm font-medium text-gray-700">Department</label>
        {userType === "HOD" || userType === "MANAGER" ? (
          <div className="space-y-2">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={dept.id}
                  checked={departmentIds.includes(dept.id)}
                  onChange={handleDepartmentChange}
                  className="mr-2"
                />
                <label>{dept.departmentName}</label>
              </div>
            ))}
          </div>
        ) : (
          <select
            value={departmentIds[0] || ""}
            onChange={(e) => setDepartmentIds([Number(e.target.value)])}
            className="p-3 border border-gray-300 rounded-md mt-1"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={handleClose}
          className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Add User
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default CreateUserModal;
