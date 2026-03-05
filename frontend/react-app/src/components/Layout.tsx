import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
                Employee Management System
              </Link>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/employees')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Employees
              </button>
              <button
                onClick={() => navigate('/employees/create')}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 text-center">
          <p>&copy; 2026 Employee Management System. Built with React 19 + TypeScript + Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;