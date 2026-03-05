import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../services/employeeService';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../types/employee';

// Query keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
};

// Queries
export const useEmployees = () => {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: employeeService.getEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getEmployeeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useEmployeesByPosition = (position: string) => {
  return useQuery({
    queryKey: [...employeeKeys.lists(), { position }],
    queryFn: () => employeeService.getEmployeesByPosition(position),
    enabled: !!position,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePaginatedEmployees = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: [...employeeKeys.lists(), { page, pageSize }],
    queryFn: () => employeeService.getPaginatedEmployees(page, pageSize),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useEmployeeCount = () => {
  return useQuery({
    queryKey: [...employeeKeys.all, 'count'],
    queryFn: employeeService.getEmployeeCount,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEmployee: CreateEmployeeDto) => employeeService.createEmployee(newEmployee),
    onSuccess: (newEmployee) => {
      // Update the employees list cache
      queryClient.setQueryData<Employee[]>(employeeKeys.lists(), (old) => {
        return old ? [...old, newEmployee] : [newEmployee];
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.all, 'count'] });
    },
    onError: (error) => {
      console.error('Failed to create employee:', error);
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employee }: { id: number; employee: UpdateEmployeeDto }) =>
      employeeService.updateEmployee(id, employee),
    onSuccess: (updatedEmployee, { id }) => {
      // Update the employees list cache
      queryClient.setQueryData<Employee[]>(employeeKeys.lists(), (old) => {
        return old ? old.map(emp => emp.id === id ? updatedEmployee : emp) : [updatedEmployee];
      });
      
      // Update the specific employee cache
      queryClient.setQueryData(employeeKeys.detail(id), updatedEmployee);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update employee:', error);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.deleteEmployee(id),
    onSuccess: (_, id) => {
      // Remove from the employees list cache
      queryClient.setQueryData<Employee[]>(employeeKeys.lists(), (old) => {
        return old ? old.filter(emp => emp.id !== id) : [];
      });
      
      // Remove the specific employee cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.all, 'count'] });
    },
    onError: (error) => {
      console.error('Failed to delete employee:', error);
    },
  });
};