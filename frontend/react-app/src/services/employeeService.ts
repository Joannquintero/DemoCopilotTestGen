import axios from 'axios';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto, PaginatedResult } from '../types/employee';
import { mockEmployeeService } from './mockEmployeeService';

const API_BASE_URL = 'https://localhost:53392/api';
const USE_MOCK = process.env.NODE_ENV === 'development'; // Use mock in development

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const employeeService = {
  // Get all employees
  getEmployees: async (): Promise<Employee[]> => {
    if (USE_MOCK) {
      return mockEmployeeService.getEmployees();
    }
    const response = await apiClient.get<Employee[]>('/employees');
    return response.data;
  },

  // Get employee by id
  getEmployeeById: async (id: number): Promise<Employee> => {
    if (USE_MOCK) {
      return mockEmployeeService.getEmployeeById(id);
    }
    const response = await apiClient.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  // Get employees by position
  getEmployeesByPosition: async (position: string): Promise<Employee[]> => {
    if (USE_MOCK) {
      return mockEmployeeService.getEmployeesByPosition(position);
    }
    const response = await apiClient.get<Employee[]>(`/employees/by-position/${position}`);
    return response.data;
  },

  // Get paginated employees
  getPaginatedEmployees: async (page: number, pageSize: number): Promise<PaginatedResult<Employee>> => {
    if (USE_MOCK) {
      return mockEmployeeService.getPaginatedEmployees(page, pageSize);
    }
    const response = await apiClient.get<PaginatedResult<Employee>>('/employees/paginated', {
      params: { page, pageSize }
    });
    return response.data;
  },

  // Get employee count
  getEmployeeCount: async (): Promise<number> => {
    if (USE_MOCK) {
      const employees = await mockEmployeeService.getEmployees();
      return employees.length;
    }
    const response = await apiClient.get<number>('/employees/count');
    return response.data;
  },

  // Create employee
  createEmployee: async (employee: CreateEmployeeDto): Promise<Employee> => {
    if (USE_MOCK) {
      return mockEmployeeService.createEmployee(employee);
    }
    const response = await apiClient.post<Employee>('/employees', employee);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id: number, employee: UpdateEmployeeDto): Promise<Employee> => {
    if (USE_MOCK) {
      return mockEmployeeService.updateEmployee(id, employee);
    }
    const response = await apiClient.put<Employee>(`/employees/${id}`, employee);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return mockEmployeeService.deleteEmployee(id);
    }
    await apiClient.delete(`/employees/${id}`);
  },
};

export default employeeService;