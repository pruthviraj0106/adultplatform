import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, logout } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      logout();
      
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      
      const data = await res.json();
      console.log('Login response:', data); // Debug log

      if (!data.success) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }
      
      if (data.user) {
        login(data.user);
        setLoading(false);
        setError(null);
        navigate("/");
      } else {
        setError("Invalid response from server");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
            <input 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <button 
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:opacity-50" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 