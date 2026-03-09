import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { createWrapper, createTestQueryClient } from '../../test/testUtils';
import { employeeService } from '../../services/employeeService';
import {
  useEmployees,
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useEmployeeCount,
  employeeKeys,
} from '../useEmployee';
import {
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE,
  MOCK_CREATE_DTO,
} from '../../test/fixtures/employeeFixtures';

/**
 * Mock del servicio de empleados completo.
 * Permite controlar las respuestas de cada método individualmente.
 */
jest.mock('../../services/employeeService', () => ({
  employeeService: {
    getEmployees: jest.fn(),
    getEmployeeById: jest.fn(),
    getEmployeesByPosition: jest.fn(),
    getPaginatedEmployees: jest.fn(),
    getEmployeeCount: jest.fn(),
    createEmployee: jest.fn(),
    updateEmployee: jest.fn(),
    deleteEmployee: jest.fn(),
  },
}));

const mockedService = employeeService as jest.Mocked<typeof employeeService>;

describe('Hooks de empleados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('employeeKeys', () => {
    it('debe generar las claves de query correctas', () => {
      expect(employeeKeys.all).toEqual(['employees']);
      expect(employeeKeys.lists()).toEqual(['employees', 'list']);
      expect(employeeKeys.detail(1)).toEqual(['employees', 'detail', 1]);
      expect(employeeKeys.details()).toEqual(['employees', 'detail']);
    });

    it('debe generar claves con filtros para listas filtradas', () => {
      const filters = { position: 'Dev' };
      expect(employeeKeys.list(filters)).toEqual([
        'employees',
        'list',
        { filters },
      ]);
    });
  });

  describe('useEmployees', () => {
    it('debe retornar la lista de empleados al cargar exitosamente', async () => {
      mockedService.getEmployees.mockResolvedValueOnce(MOCK_EMPLOYEES);

      const { result } = renderHook(() => useEmployees(), {
        wrapper: createWrapper(),
      });

      // Verificar estado inicial de carga
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_EMPLOYEES);
      expect(mockedService.getEmployees).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores cuando la petición falla', async () => {
      // Usar mockRejectedValue para que todos los reintentos fallen
      mockedService.getEmployees.mockRejectedValue(
        new Error('Error de red')
      );

      // QueryClient con retryDelay: 0 para que los reintentos no esperen
      const errorQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            retryDelay: 0,
            gcTime: 0,
          },
        },
      });

      const { result } = renderHook(() => useEmployees(), {
        wrapper: createWrapper({ queryClient: errorQueryClient }),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useEmployee', () => {
    it('debe retornar un empleado individual por su ID', async () => {
      mockedService.getEmployeeById.mockResolvedValueOnce(MOCK_EMPLOYEE);

      const { result } = renderHook(() => useEmployee(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_EMPLOYEE);
      expect(mockedService.getEmployeeById).toHaveBeenCalledWith(1);
    });

    it('no debe ejecutar la petición cuando el ID es 0 (deshabilitado)', async () => {
      const { result } = renderHook(() => useEmployee(0), {
        wrapper: createWrapper(),
      });

      // La query no debe ejecutarse cuando id es falsy
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedService.getEmployeeById).not.toHaveBeenCalled();
    });
  });

  describe('useEmployeeCount', () => {
    it('debe retornar el conteo total de empleados', async () => {
      mockedService.getEmployeeCount.mockResolvedValueOnce(42);

      const { result } = renderHook(() => useEmployeeCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(42);
    });
  });

  describe('useCreateEmployee', () => {
    it('debe crear un empleado e invalidar las queries relacionadas', async () => {
      const newEmployee = { ...MOCK_EMPLOYEE, id: 10 };
      mockedService.createEmployee.mockResolvedValueOnce(newEmployee);

      const queryClient = createTestQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper({ queryClient }),
      });

      await result.current.mutateAsync(MOCK_CREATE_DTO);

      expect(mockedService.createEmployee).toHaveBeenCalledWith(
        MOCK_CREATE_DTO
      );
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it('debe manejar errores de creación correctamente', async () => {
      mockedService.createEmployee.mockRejectedValueOnce(
        new Error('Error de validación')
      );

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useCreateEmployee(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync(MOCK_CREATE_DTO)
      ).rejects.toThrow('Error de validación');

      consoleSpy.mockRestore();
    });
  });

  describe('useUpdateEmployee', () => {
    it('debe actualizar un empleado e invalidar las queries', async () => {
      const updatedEmployee = {
        ...MOCK_EMPLOYEE,
        firstName: 'Juan Carlos',
      };
      mockedService.updateEmployee.mockResolvedValueOnce(updatedEmployee);

      const queryClient = createTestQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateEmployee(), {
        wrapper: createWrapper({ queryClient }),
      });

      const updatePayload = {
        id: 1,
        employee: {
          firstName: 'Juan Carlos',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          position: 'Desarrollador Senior',
          salary: 75000,
          hireDate: '2023-06-15',
        },
      };

      await result.current.mutateAsync(updatePayload);

      expect(mockedService.updateEmployee).toHaveBeenCalledWith(
        1,
        updatePayload.employee
      );
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('useDeleteEmployee', () => {
    it('debe eliminar un empleado e invalidar las queries', async () => {
      mockedService.deleteEmployee.mockResolvedValueOnce(undefined);

      const queryClient = createTestQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteEmployee(), {
        wrapper: createWrapper({ queryClient }),
      });

      await result.current.mutateAsync(1);

      expect(mockedService.deleteEmployee).toHaveBeenCalledWith(1);
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it('debe manejar errores de eliminación correctamente', async () => {
      mockedService.deleteEmployee.mockRejectedValueOnce(
        new Error('No se puede eliminar')
      );

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useDeleteEmployee(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(1)).rejects.toThrow(
        'No se puede eliminar'
      );

      consoleSpy.mockRestore();
    });
  });
});
