import {
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE,
  MOCK_CREATE_DTO,
  MOCK_PAGINATED_RESULT,
} from '../../test/fixtures/employeeFixtures';

/**
 * Mock de axios que define las funciones mock inline.
 * ts-jest no soporta la convención de babel-jest para variables 'mock*',
 * por lo que definimos todo dentro de la factory de jest.mock().
 */
const mockMethods = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('axios', () => {
  return {
    __esModule: true,
    default: {
      create: () => ({
        get: mockMethods.get,
        post: mockMethods.post,
        put: mockMethods.put,
        delete: mockMethods.delete,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      }),
    },
  };
});

// Importar después del mock para que use la versión mockeada
import { employeeService } from '../employeeService';

describe('employeeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmployees', () => {
    it('debe retornar la lista completa de empleados', async () => {
      mockMethods.get.mockResolvedValueOnce({ data: MOCK_EMPLOYEES });

      const result = await employeeService.getEmployees();

      expect(mockMethods.get).toHaveBeenCalledWith('/employees');
      expect(result).toEqual(MOCK_EMPLOYEES);
    });

    it('debe retornar un arreglo vacío cuando no hay empleados', async () => {
      mockMethods.get.mockResolvedValueOnce({ data: [] });

      const result = await employeeService.getEmployees();

      expect(result).toEqual([]);
    });

    it('debe propagar el error cuando la petición falla', async () => {
      const networkError = new Error('Network Error');
      mockMethods.get.mockRejectedValueOnce(networkError);

      await expect(employeeService.getEmployees()).rejects.toThrow('Network Error');
    });
  });

  describe('getEmployeeById', () => {
    it('debe retornar el empleado correspondiente al ID proporcionado', async () => {
      mockMethods.get.mockResolvedValueOnce({ data: MOCK_EMPLOYEE });

      const result = await employeeService.getEmployeeById(1);

      expect(mockMethods.get).toHaveBeenCalledWith('/employees/1');
      expect(result).toEqual(MOCK_EMPLOYEE);
    });

    it('debe propagar el error cuando el empleado no existe', async () => {
      const notFoundError = new Error('Employee not found');
      mockMethods.get.mockRejectedValueOnce(notFoundError);

      await expect(employeeService.getEmployeeById(999)).rejects.toThrow(
        'Employee not found'
      );
    });
  });

  describe('getEmployeesByPosition', () => {
    it('debe retornar empleados filtrados por cargo', async () => {
      const devEmployees = MOCK_EMPLOYEES.filter((e) =>
        e.position.includes('Desarrollador')
      );
      mockMethods.get.mockResolvedValueOnce({ data: devEmployees });

      const result =
        await employeeService.getEmployeesByPosition('Desarrollador');

      expect(mockMethods.get).toHaveBeenCalledWith(
        '/employees/by-position/Desarrollador'
      );
      expect(result).toEqual(devEmployees);
    });
  });

  describe('getPaginatedEmployees', () => {
    it('debe retornar resultados paginados con metadatos', async () => {
      mockMethods.get.mockResolvedValueOnce({ data: MOCK_PAGINATED_RESULT });

      const result = await employeeService.getPaginatedEmployees(1, 10);

      expect(mockMethods.get).toHaveBeenCalledWith('/employees/paginated', {
        params: { page: 1, pageSize: 10 },
      });
      expect(result).toEqual(MOCK_PAGINATED_RESULT);
      expect(result.totalCount).toBe(3);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getEmployeeCount', () => {
    it('debe retornar el número total de empleados', async () => {
      mockMethods.get.mockResolvedValueOnce({ data: 42 });

      const result = await employeeService.getEmployeeCount();

      expect(mockMethods.get).toHaveBeenCalledWith('/employees/count');
      expect(result).toBe(42);
    });
  });

  describe('createEmployee', () => {
    it('debe crear un empleado y retornar los datos creados', async () => {
      const createdEmployee = { ...MOCK_EMPLOYEE, id: 4 };
      mockMethods.post.mockResolvedValueOnce({ data: createdEmployee });

      const result = await employeeService.createEmployee(MOCK_CREATE_DTO);

      expect(mockMethods.post).toHaveBeenCalledWith(
        '/employees',
        MOCK_CREATE_DTO
      );
      expect(result).toEqual(createdEmployee);
    });

    it('debe propagar el error cuando la creación falla por datos inválidos', async () => {
      const validationError = new Error('Validation failed');
      mockMethods.post.mockRejectedValueOnce(validationError);

      await expect(
        employeeService.createEmployee(MOCK_CREATE_DTO)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('updateEmployee', () => {
    it('debe actualizar el empleado y retornar los datos actualizados', async () => {
      const updatedData = { ...MOCK_EMPLOYEE, firstName: 'Juan Carlos' };
      mockMethods.put.mockResolvedValueOnce({ data: updatedData });

      const updateDto = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        position: 'Desarrollador Senior',
        salary: 75000,
        hireDate: '2023-06-15',
      };

      const result = await employeeService.updateEmployee(1, updateDto);

      expect(mockMethods.put).toHaveBeenCalledWith('/employees/1', updateDto);
      expect(result).toEqual(updatedData);
    });
  });

  describe('deleteEmployee', () => {
    it('debe eliminar el empleado sin retornar datos', async () => {
      mockMethods.delete.mockResolvedValueOnce({ data: undefined });

      await expect(
        employeeService.deleteEmployee(1)
      ).resolves.toBeUndefined();

      expect(mockMethods.delete).toHaveBeenCalledWith('/employees/1');
    });

    it('debe propagar el error cuando la eliminación falla', async () => {
      const deleteError = new Error('Cannot delete employee');
      mockMethods.delete.mockRejectedValueOnce(deleteError);

      await expect(employeeService.deleteEmployee(1)).rejects.toThrow(
        'Cannot delete employee'
      );
    });
  });
});
