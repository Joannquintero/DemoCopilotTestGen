import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import EmployeeDetails from './components/EmployeeDetails';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<EmployeeList />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/create" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="*" element={<EmployeeList />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;