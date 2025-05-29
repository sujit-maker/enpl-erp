"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://128.199.19.28:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("userType", data.userType);

      toast.success("Successfully logged in!");
      setTimeout(() => {
        router.push(
          ["HOD", "MANAGER", "EXECUTIVE", "SUPERADMIN"].includes(data.userType)
            ? "/dashboard"
            : "/"
        );
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.message);
      toast.error(error.message || "Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out">
        {/* Logo + Company Name */}
        <div className="flex items-center justify-center mb-6 space-x-3">
          <img
            src="https://media.licdn.com/dms/image/v2/C4E0BAQFx4JPxv8Cpjw/company-logo_200_200/company-logo_200_200/0/1673094179431/enplindia_logo?e=2147483647&v=beta&t=V1Ld3Ja-zCXFg7y1VlqEliyXmh1qVQoUTkAIo-7O4YM"
            alt="ENPL Logo"
            className="w-10 h-10 rounded-full shadow-md"
          />
          <h1 className="text-2xl font-bold text-indigo-700">ENPL India</h1>
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Welcome Back</h2>

        {errorMessage && (
          <p className="text-center text-red-500 mb-4 text-sm">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            Log In
          </button>
        </form>
      </div>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
}
