export interface Position {
  id: number;
  name: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreatePositionDto {
  name: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  department: string;
  isActive: boolean;
}

export interface UpdatePositionDto {
  id: number;
  name?: string;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
  department?: string;
  isActive?: boolean;
}