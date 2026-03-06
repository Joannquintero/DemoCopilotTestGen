import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto, PaginatedResult } from '../models/employee.model';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://localhost:53392/api/employees';

  const mockEmployee: Employee = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    email: 'juan.perez@test.com',
    position: 'Desarrollador',
    salary: 50000,
    hireDate: new Date('2023-01-15'),
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  };

  const mockEmployees: Employee[] = [
    mockEmployee,
    {
      id: 2,
      firstName: 'María',
      lastName: 'García',
      fullName: 'María García',
      email: 'maria.garcia@test.com',
      position: 'Diseñadora',
      salary: 45000,
      hireDate: new Date('2023-02-10'),
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-02-10')
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('inicialización del servicio', () => {
    it('debería ser creado', () => {
      expect(service).toBeTruthy();
    });

    it('debería inicializar los signals con valores por defecto', () => {
      // Arrange & Act - evaluar signals como funciones
      const employees = service.employees();
      const loading = service.loading();
      const error = service.error();

      // Assert
      expect(employees).toEqual([]);
      expect(loading).toBe(false);
      expect(error).toBeNull();
    });
  });

  describe('getEmployees', () => {
    it('debería obtener todos los empleados exitosamente', () => {
      // Arrange
      let result: Employee[] = [];

      // Act
      service.getEmployees().subscribe(employees => {
        result = employees;
      });

      // Assert - verificar que se establece loading en true
      expect(service.loading()).toBe(true);
      expect(service.error()).toBeNull();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockEmployees);

      expect(result).toEqual(mockEmployees);
      expect(service.employees()).toEqual(mockEmployees);
      expect(service.loading()).toBe(false);
    });

    it('debería manejar errores al obtener empleados', () => {
      // Arrange
      const errorMessage = 'Error del servidor';

      // Act
      service.getEmployees().subscribe({
        next: () => {},
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Assert
      const req = httpMock.expectOne(baseUrl);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });

      expect(service.error()).toBe('Failed to load employees');
      expect(service.loading()).toBe(false);
      expect(service.employees()).toEqual([]);
    });
  });

  describe('getEmployeeById', () => {
    it('debería obtener un empleado específico por ID', () => {
      // Arrange
      const employeeId = 1;
      let result: Employee | undefined;

      // Act
      service.getEmployeeById(employeeId).subscribe(employee => {
        result = employee;
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/${employeeId}`);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockEmployee);
      expect(result).toEqual(mockEmployee);
    });

    it('debería manejar errores al obtener empleado por ID', () => {
      // Arrange
      const employeeId = 999;

      // Act
      service.getEmployeeById(employeeId).subscribe({
        next: () => {},
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/${employeeId}`);
      req.flush('Empleado no encontrado', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getEmployeesByPosition', () => {
    it('debería obtener empleados filtrados por cargo', () => {
      // Arrange
      const position = 'Desarrollador';
      const filteredEmployees = [mockEmployee];
      let result: Employee[] = [];

      // Act
      service.getEmployeesByPosition(position).subscribe(employees => {
        result = employees;
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/by-position/${position}`);
      expect(req.request.method).toBe('GET');
      
      req.flush(filteredEmployees);
      expect(result).toEqual(filteredEmployees);
    });
  });

  describe('getPaginatedEmployees', () => {
    it('debería obtener empleados paginados con parámetros correctos', () => {
      // Arrange
      const page = 1;
      const pageSize = 10;
      const mockPaginatedResult: PaginatedResult<Employee> = {
        items: mockEmployees,
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };
      let result: PaginatedResult<Employee> | undefined;

      // Act
      service.getPaginatedEmployees(page, pageSize).subscribe(paginatedResult => {
        result = paginatedResult;
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/paginated?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      
      req.flush(mockPaginatedResult);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('getEmployeeCount', () => {
    it('debería obtener el conteo total de empleados', () => {
      // Arrange
      const expectedCount = 25;
      let result: number = 0;

      // Act
      service.getEmployeeCount().subscribe(count => {
        result = count;
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/count`);
      expect(req.request.method).toBe('GET');
      
      req.flush(expectedCount);
      expect(result).toBe(expectedCount);
    });
  });

  describe('createEmployee', () => {
    it('debería crear un nuevo empleado exitosamente', () => {
      // Arrange
      const newEmployeeDto: CreateEmployeeDto = {
        firstName: 'Ana',
        lastName: 'Rodríguez',
        email: 'ana.rodriguez@test.com',
        position: 'Analista',
        salary: 48000,
        hireDate: new Date('2023-03-01')
      };

      const createdEmployee: Employee = {
        id: 3,
        ...newEmployeeDto,
        fullName: 'Ana Rodríguez',
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date('2023-03-01')
      };

      // Primero establecer algunos empleados existentes
      service['_employees'].set([mockEmployee]);
      let result: Employee | undefined;

      // Act
      service.createEmployee(newEmployeeDto).subscribe(employee => {
        result = employee;
      });

      // Assert - verificar loading state
      expect(service.loading()).toBe(true);
      expect(service.error()).toBeNull();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEmployeeDto);
      
      req.flush(createdEmployee);

      expect(result).toEqual(createdEmployee);
      expect(service.employees()).toContain(createdEmployee);
      expect(service.loading()).toBe(false);
    });

    it('debería manejar errores al crear empleado', () => {
      // Arrange
      const newEmployeeDto: CreateEmployeeDto = {
        firstName: 'Ana',
        lastName: 'Rodríguez',
        email: 'invalid-email',
        position: 'Analista',
        salary: 48000,
        hireDate: new Date('2023-03-01')
      };

      // Act
      service.createEmployee(newEmployeeDto).subscribe({
        next: () => {},
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Assert
      const req = httpMock.expectOne(baseUrl);
      req.flush('Datos inválidos', { status: 400, statusText: 'Bad Request' });

      expect(service.error()).toBe('Failed to create employee');
      expect(service.loading()).toBe(false);
    });
  });

  describe('updateEmployee', () => {
    it('debería actualizar un empleado exitosamente', () => {
      // Arrange
      const employeeId = 1;
      const updateEmployeeDto: UpdateEmployeeDto = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez',
        email: 'juan.carlos.perez@test.com',
        position: 'Senior Developer',
        salary: 60000,
        hireDate: new Date('2023-01-15')
      };

      const updatedEmployee: Employee = {
        id: employeeId,
        ...updateEmployeeDto,
        fullName: 'Juan Carlos Pérez',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-06-01')
      };

      // Establecer empleados existentes
      service['_employees'].set([mockEmployee, mockEmployees[1]]);
      let result: Employee | undefined;

      // Act
      service.updateEmployee(employeeId, updateEmployeeDto).subscribe(employee => {
        result = employee;
      });

      // Assert
      expect(service.loading()).toBe(true);
      expect(service.error()).toBeNull();

      const req = httpMock.expectOne(`${baseUrl}/${employeeId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateEmployeeDto);
      
      req.flush(updatedEmployee);

      expect(result).toEqual(updatedEmployee);
      expect(service.employees().find(emp => emp.id === employeeId)).toEqual(updatedEmployee);
      expect(service.loading()).toBe(false);
    });

    it('debería manejar errores al actualizar empleado', () => {
      // Arrange
      const employeeId = 1;
      const updateEmployeeDto: UpdateEmployeeDto = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez',
        email: 'invalid-email',
        position: 'Senior Developer',
        salary: 60000,
        hireDate: new Date('2023-01-15')
      };

      // Act
      service.updateEmployee(employeeId, updateEmployeeDto).subscribe({
        next: () => {},
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/${employeeId}`);
      req.flush('Error de validación', { status: 400, statusText: 'Bad Request' });

      expect(service.error()).toBe('Failed to update employee');
      expect(service.loading()).toBe(false);
    });
  });

  describe('deleteEmployee', () => {
    it('debería eliminar un empleado exitosamente', () => {
      // Arrange
      const employeeId = 1;
      service['_employees'].set([mockEmployee, mockEmployees[1]]);
      let deletionCompleted = false;

      // Act
      service.deleteEmployee(employeeId).subscribe(() => {
        deletionCompleted = true;
      });

      // Assert
      expect(service.loading()).toBe(true);
      expect(service.error()).toBeNull();

      const req = httpMock.expectOne(`${baseUrl}/${employeeId}`);
      expect(req.request.method).toBe('DELETE');
      
      req.flush(null);

      expect(deletionCompleted).toBe(true);
      expect(service.employees().find(emp => emp.id === employeeId)).toBeUndefined();
      expect(service.employees().length).toBe(1);
      expect(service.loading()).toBe(false);
    });

    it('debería manejar errores al eliminar empleado', () => {
      // Arrange
      const employeeId = 999;

      // Act
      service.deleteEmployee(employeeId).subscribe({
        next: () => {},
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/${employeeId}`);
      req.flush('Empleado no encontrado', { status: 404, statusText: 'Not Found' });

      expect(service.error()).toBe('Failed to delete employee');
      expect(service.loading()).toBe(false);
    });
  });

  describe('métodos de utilidad', () => {
    it('debería refrescar la lista de empleados', () => {
      // Arrange
      spyOn(service, 'getEmployees').and.callThrough();

      // Act
      service.refreshEmployees();

      // Assert
      expect(service.getEmployees).toHaveBeenCalled();
      
      // Manejar la request HTTP pendiente
      const req = httpMock.expectOne(baseUrl);
      req.flush(mockEmployees);
    });

    it('debería limpiar el error', () => {
      // Arrange
      service['_error'].set('Error de prueba');
      expect(service.error()).toBe('Error de prueba');

      // Act
      service.clearError();

      // Assert
      expect(service.error()).toBeNull();
    });
  });

  describe('manejo reactivo de signals', () => {
    it('debería mantener estados reactivos correctamente durante operaciones múltiples', () => {
      // Arrange
      const newEmployeeDto: CreateEmployeeDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        position: 'Tester',
        salary: 40000,
        hireDate: new Date()
      };

      // Act - primera operación: obtener empleados
      service.getEmployees().subscribe();
      
      let req = httpMock.expectOne(baseUrl);
      req.flush([mockEmployee]);

      expect(service.employees()).toEqual([mockEmployee]);
      expect(service.loading()).toBe(false);

      // Act - segunda operación: crear empleado
      service.createEmployee(newEmployeeDto).subscribe();
      
      expect(service.loading()).toBe(true);
      
      req = httpMock.expectOne(baseUrl);
      const newEmployee = { ...newEmployeeDto, id: 2, fullName: 'Test User', createdAt: new Date(), updatedAt: new Date() };
      req.flush(newEmployee);

      // Assert - verificar que el signal se actualiza correctamente
      expect(service.employees().length).toBe(2);
      expect(service.employees()).toContain(newEmployee);
      expect(service.loading()).toBe(false);
    });
  });
});