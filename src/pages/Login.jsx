import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This will be connected to backend later
    // For now, we'll just simulate a successful login
    login({
      name: formData.email.split('@')[0], // Using email username as name for demo
      email: formData.email
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Login</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input 
            className="w-full px-3 py-2 border rounded" 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input 
            className="w-full px-3 py-2 border rounded" 
            type="password" 
            id="password" 
            name="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login; 