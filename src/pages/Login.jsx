import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Login</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input className="w-full px-3 py-2 border rounded" type="email" id="email" name="email" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input className="w-full px-3 py-2 border rounded" type="password" id="password" name="password" required />
        </div>
        <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login; 