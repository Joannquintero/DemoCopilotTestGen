import { Employee, CreateEmployeeDto, PaginatedResult } from '../../types/employee';

/**
 * Datos de prueba reutilizables para los tests.
 * Centralizados aquí para evitar duplicación y facilitar el mantenimiento.
 */

export const MOCK_EMPLOYEE: Employee = {
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
};

export const MOCK_EMPLOYEE_2: Employee = {
  id: 2,
  firstName: 'María',
  lastName: 'García',
  fullName: 'María García',
  email: 'maria.garcia@example.com',
  position: 'Diseñadora UX',
  salary: 65000,
  hireDate: '2023-08-20T00:00:00',
  createdAt: '2023-08-20T09:00:00',
};

export const MOCK_EMPLOYEE_3: Employee = {
  id: 3,
  firstName: 'Carlos',
  lastName: 'López',
  fullName: 'Carlos López',
  email: 'carlos.lopez@example.com',
  position: 'Desarrollador Junior',
  salary: 45000,
  hireDate: '2024-01-10T00:00:00',
  createdAt: '2024-01-10T08:00:00',
};

export const MOCK_EMPLOYEES: Employee[] = [
  MOCK_EMPLOYEE,
  MOCK_EMPLOYEE_2,
  MOCK_EMPLOYEE_3,
];

export const MOCK_CREATE_DTO: CreateEmployeeDto = {
  firstName: 'Ana',
  lastName: 'Martínez',
  email: 'ana.martinez@example.com',
  position: 'QA Engineer',
  salary: 55000,
  hireDate: '2024-03-01',
};

export const MOCK_PAGINATED_RESULT: PaginatedResult<Employee> = {
  items: MOCK_EMPLOYEES,
  totalCount: 3,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

export const MOCK_EMPTY_EMPLOYEES: Employee[] = [];
