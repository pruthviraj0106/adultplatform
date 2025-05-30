import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useUser } from '../context/UserContext';

const Navigation = () => {
  const { user, logout } = useUser();

  return (
    <nav className="bg-gray-900 px-4 md:px-8 lg:px-16 py-4">
      <div className="flex justify-between items-center">
        <Link to="/">
          <h1 className="text-3xl font-bold text-pink-600">
            Adult Content Platform
          </h1>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white">Welcome, {user.name}</span>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-green-500 text-gray-900 hover:bg-green-500 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 