export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  position: string;
  salary: number;
  hireDate: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: number;
  hireDate: Date;
}

export interface UpdateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: number;
  hireDate: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}