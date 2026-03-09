import { Employee, CreateEmployeeDto, UpdateEmployeeDto, PaginatedResult } from '../types/employee';

// Mock data
const mockEmployees: Employee[] = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    email: 'juan.perez@example.com',
    position: 'Desarrollador Senior',
    salary: 75000,
    hireDate: '2023-06-15T00:00:00',
    createdAt: '2023-06-15T10:30:00',
    updatedAt: '2024-01-10T14:20:00',
  },
  {
    id: 2,
    firstName: 'María',
    lastName: 'García',
    fullName: 'María García',
    email: 'maria.garcia@example.com',
    position: 'Diseñadora UX',
    salary: 65000,
    hireDate: '2023-08-20T00:00:00',
    createdAt: '2023-08-20T09:00:00',
    updatedAt: '2023-08-20T09:00:00',
  },
  {
    id: 3,
    firstName: 'Carlos',
    lastName: 'López',
    fullName: 'Carlos López',
    email: 'carlos.lopez@example.com',
    position: 'Desarrollador Junior',
    salary: 45000,
    hireDate: '2024-01-10T00:00:00',
    createdAt: '2024-01-10T08:00:00',
    updatedAt: '2024-01-10T08:00:00',
  },
  {
    id: 4,
    firstName: 'Ana',
    lastName: 'Martínez',
    fullName: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    position: 'QA Engineer',
    salary: 55000,
    hireDate: '2024-02-15T00:00:00',
    createdAt: '2024-02-15T09:00:00',
    updatedAt: '2024-02-15T09:00:00',
  },
  {
    id: 5,
    firstName: 'Roberto',
    lastName: 'Silva',
    fullName: 'Roberto Silva',
    email: 'roberto.silva@example.com',
    position: 'DevOps Engineer',
    salary: 80000,
    hireDate: '2023-03-10T00:00:00',
    createdAt: '2023-03-10T10:00:00',
    updatedAt: '2023-03-10T10:00:00',
  },
];

let employees = mockEmployees.map(emp => ({ ...emp }));
let nextId = 6;

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockEmployeeService = {
  // Get all employees
  getEmployees: async (): Promise<Employee[]> => {
    await delay(500); // Simulate network delay
    return [...employees];
  },

  // Get employee by ID
  getEmployeeById: async (id: number): Promise<Employee> => {
    await delay(300);
    const employee = employees.find(emp => emp.id === id);
    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    return { ...employee };
  },

  // Get employees by position
  getEmployeesByPosition: async (position: string): Promise<Employee[]> => {
    await delay(400);
    return employees.filter(emp => 
      emp.position.toLowerCase().includes(position.toLowerCase())
    );
  },

  // Get paginated employees
  getPaginatedEmployees: async (page: number, pageSize: number): Promise<PaginatedResult<Employee>> => {
    await delay(500);
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEmployees = employees.slice(startIndex, endIndex);
    
    return {
      items: paginatedEmployees,
      totalCount: employees.length,
      page,
      pageSize,
      totalPages: Math.ceil(employees.length / pageSize),
    };
  },

  // Create employee
  createEmployee: async (employeeData: CreateEmployeeDto): Promise<Employee> => {
    await delay(600);
    
    const newEmployee: Employee = {
      id: nextId++,
      ...employeeData,
      fullName: `${employeeData.firstName} ${employeeData.lastName}`,
      hireDate: employeeData.hireDate + 'T00:00:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    employees.push(newEmployee);
    return { ...newEmployee };
  },

  // Update employee
  updateEmployee: async (id: number, employeeData: UpdateEmployeeDto): Promise<Employee> => {
    await delay(500);
    
    const employeeIndex = employees.findIndex(emp => emp.id === id);
    if (employeeIndex === -1) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    const existingEmployee = employees[employeeIndex]!;
    const updatedEmployee: Employee = {
      ...existingEmployee,
      ...employeeData,
      fullName: `${employeeData.firstName} ${employeeData.lastName}`,
      updatedAt: new Date().toISOString(),
    };
    
    employees[employeeIndex] = updatedEmployee;
    return { ...updatedEmployee };
  },

  // Delete employee
  deleteEmployee: async (id: number): Promise<void> => {
    await delay(400);
    
    const employeeIndex = employees.findIndex(emp => emp.id === id);
    if (employeeIndex === -1) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    employees.splice(employeeIndex, 1);
  },

  // Reset to initial state (useful for testing)
  reset: (): void => {
    employees = mockEmployees.map(emp => ({ ...emp }));
    nextId = 6;
  },
};