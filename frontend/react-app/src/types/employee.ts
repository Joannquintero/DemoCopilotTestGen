export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  position: string;
  salary: number;
  hireDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: number;
  hireDate: string;
}

export interface UpdateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: number;
  hireDate: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  details?: string[];
  timeStamp: string;
}