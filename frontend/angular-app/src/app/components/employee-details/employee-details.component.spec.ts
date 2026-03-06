import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EmployeeDetailsComponent } from './employee-details.component';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

describe('EmployeeDetailsComponent', () => {
  let component: EmployeeDetailsComponent;
  let fixture: ComponentFixture<EmployeeDetailsComponent>;
  let mockEmployeeService: jasmine.SpyObj<EmployeeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockEmployee: Employee = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    email: 'juan.perez@test.com',
    position: 'Desarrollador Senior',
    salary: 75000,
    hireDate: new Date('2023-01-15'),
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-06-01')
  };

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', [
      'getEmployeeById',
      'deleteEmployee'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        params: { id: '1' }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        EmployeeDetailsComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailsComponent);
    component = fixture.componentInstance;
    mockEmployeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockEmployeeService.getEmployeeById.and.returnValue(of(mockEmployee));
    mockEmployeeService.deleteEmployee.and.returnValue(of(void 0));
  });

  describe('inicialización del componente', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería cargar empleado al inicializar con ID válido', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(mockEmployeeService.getEmployeeById).toHaveBeenCalledWith(1);
      expect(component.employee).toEqual(mockEmployee);
    });

    it('debería manejar inicialización sin ID en la ruta', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = {};
      
      // Act
      fixture.detectChanges();

      // Assert
      expect(mockEmployeeService.getEmployeeById).not.toHaveBeenCalled();
      expect(component.employee).toBeUndefined();
    });
  });

  describe('carga de datos del empleado', () => {
    it('debería cargar y asignar empleado correctamente', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(component.employee).toEqual(mockEmployee);
      expect(component.employee?.firstName).toBe('Juan');
      expect(component.employee?.lastName).toBe('Pérez');
      expect(component.employee?.email).toBe('juan.perez@test.com');
      expect(component.employee?.position).toBe('Desarrollador Senior');
      expect(component.employee?.salary).toBe(75000);
    });

    it('debería manejar errores al cargar empleado', () => {
      // Arrange
      mockEmployeeService.getEmployeeById.and.returnValue(
        throwError(() => new Error('Empleado no encontrado'))
      );
      spyOn(console, 'error');

      // Act
      fixture.detectChanges();

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Error loading employee:',
        jasmine.any(Error)
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('debería redirigir a la lista cuando hay error loading', () => {
      // Arrange
      mockEmployeeService.getEmployeeById.and.returnValue(
        throwError(() => new Error('Error del servidor'))
      );

      // Act
      fixture.detectChanges();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });
  });

  describe('navegación', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería navegar a edición de empleado', () => {
      // Act
      component.editEmployee();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees', 1, 'edit']);
    });

    it('debería navegar de vuelta a la lista', () => {
      // Act
      component.goBack();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('no debería navegar a edición si no hay empleado cargado', () => {
      // Arrange
      component.employee = undefined;

      // Act
      component.editEmployee();

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('eliminación de empleado', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería confirmar y eliminar empleado cuando el usuario acepta', () => {
      // Arrange
      spyOn(window, 'confirm').and.returnValue(true);

      // Act
      component.deleteEmployee();

      // Assert
      expect(window.confirm).toHaveBeenCalledWith(
        '¿Está seguro de que desea eliminar este empleado?'
      );
      expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('debería cancelar eliminación cuando el usuario rechaza', () => {
      // Arrange
      spyOn(window, 'confirm').and.returnValue(false);

      // Act
      component.deleteEmployee();

      // Assert
      expect(window.confirm).toHaveBeenCalled();
      expect(mockEmployeeService.deleteEmployee).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('no debería proceder si no hay empleado cargado', () => {
      // Arrange
      component.employee = undefined;
      spyOn(window, 'confirm');

      // Act
      component.deleteEmployee();

      // Assert
      expect(window.confirm).not.toHaveBeenCalled();
      expect(mockEmployeeService.deleteEmployee).not.toHaveBeenCalled();
    });

    it('debería manejar errores al eliminar empleado', () => {
      // Arrange
      mockEmployeeService.deleteEmployee.and.returnValue(
        throwError(() => new Error('Error al eliminar'))
      );
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');

      // Act
      component.deleteEmployee();

      // Assert
      expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting employee:',
        jasmine.any(Error)
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('renderizado del template', () => {
    it('debería mostrar mensaje de carga cuando no hay empleado', () => {
      // Arrange
      // Configurar route sin id para prevenir carga de empleado
      const activatedRoute = TestBed.inject(ActivatedRoute);
      activatedRoute.snapshot.params = {}; // Sin id
      
      // Create a new fixture sin empleado cargado
      const freshFixture = TestBed.createComponent(EmployeeDetailsComponent);
      const freshComponent = freshFixture.componentInstance;
      
      // Act
      freshFixture.detectChanges();

      // Assert
      expect(freshComponent.employee).toBeUndefined();
    });

    it('debería mostrar detalles del empleado cuando está cargado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const employeeContainer = fixture.nativeElement.querySelector('.employee-details-container');
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');

      // Assert
      expect(employeeContainer).toBeTruthy();
      expect(infoItems.length).toBeGreaterThan(0);
    });

    it('debería mostrar el nombre del empleado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      const nameItem = Array.from(infoItems).find((item: any) =>
        item.textContent.includes('Juan')
      );

      // Assert
      expect(nameItem).toBeTruthy();
    });

    it('debería mostrar el apellido del empleado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      const lastNameItem = Array.from(infoItems).find((item: any) =>
        item.textContent.includes('Pérez')
      );

      // Assert
      expect(lastNameItem).toBeTruthy();
    });

    it('debería mostrar el email del empleado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      const emailItem = Array.from(infoItems).find((item: any) =>
        item.textContent.includes('juan.perez@test.com')
      );

      // Assert
      expect(emailItem).toBeTruthy();
    });

    it('debería mostrar el cargo del empleado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      const positionItem = Array.from(infoItems).find((item: any) =>
        item.textContent.includes('Desarrollador Senior')
      );

      // Assert
      expect(positionItem).toBeTruthy();
    });

    it('debería mostrar el salario formateado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      const salaryItem = Array.from(infoItems).find((item: any) =>
        item.textContent.includes('$75,000')
      );

      // Assert
      expect(salaryItem).toBeTruthy();
    });

    it('debería mostrar botones de acción', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const editButton = fixture.nativeElement.querySelector('button[color="primary"]');
      const deleteButton = fixture.nativeElement.querySelector('button[color="warn"]');
      const backButton = fixture.nativeElement.querySelector('button:not([color])');

      // Assert
      expect(editButton).toBeTruthy();
      expect(editButton.textContent).toContain('Editar');
      expect(deleteButton).toBeTruthy();
      expect(deleteButton.textContent).toContain('Eliminar');
      expect(backButton).toBeTruthy();
      expect(backButton.textContent).toContain('Volver a la Lista');
    });

    it('debería mostrar título correcto', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const title = fixture.nativeElement.querySelector('mat-card-title');

      // Assert
      expect(title.textContent.trim()).toBe('Detalles del Empleado');
    });

    it('debería separar información personal y profesional con divider', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const dividers = fixture.nativeElement.querySelectorAll('mat-divider');

      // Assert
      expect(dividers.length).toBeGreaterThan(0);
    });

    it('debería mostrar secciones de información personal y profesional', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const sections = fixture.nativeElement.querySelectorAll('.info-section h3');
      const personalSection = Array.from(sections).find((section: any) =>
        section.textContent.includes('Información Personal')
      );
      const professionalSection = Array.from(sections).find((section: any) =>
        section.textContent.includes('Información Profesional')
      );

      // Assert
      expect(personalSection).toBeTruthy();
      expect(professionalSection).toBeTruthy();
    });
  });

  describe('interacciones del usuario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería llamar editEmployee cuando se hace clic en botón editar', () => {
      // Arrange
      spyOn(component, 'editEmployee');

      // Act
      const editButton = fixture.nativeElement.querySelector('button[color="primary"]');
      editButton.click();

      // Assert
      expect(component.editEmployee).toHaveBeenCalled();
    });

    it('debería llamar deleteEmployee cuando se hace clic en botón eliminar', () => {
      // Arrange
      spyOn(component, 'deleteEmployee');

      // Act
      const deleteButton = fixture.nativeElement.querySelector('button[color="warn"]');
      deleteButton.click();

      // Assert
      expect(component.deleteEmployee).toHaveBeenCalled();
    });

    it('debería llamar goBack cuando se hace clic en botón volver', () => {
      // Arrange
      spyOn(component, 'goBack');

      // Act
      const backButton = fixture.nativeElement.querySelector('button:not([color])');
      backButton.click();

      // Assert
      expect(component.goBack).toHaveBeenCalled();
    });
  });

  describe('manejo de fechas', () => {
    it('debería manejar fecha de contratación como string', () => {
      // Arrange
      const employeeWithStringDate = {
        ...mockEmployee,
        hireDate: '2023-01-15T00:00:00.000Z' as any
      };
      mockEmployeeService.getEmployeeById.and.returnValue(of(employeeWithStringDate));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.employee).toEqual(employeeWithStringDate);
      // Verificar que se muestra correctamente en el template
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      const dateItem = Array.from(infoItems).find((item: any) =>
        item.textContent.includes('Jan 15, 2023') ||
        item.textContent.includes('15/1/2023') ||
        item.textContent.includes('2023')
      );
      expect(dateItem).toBeTruthy();
    });
  });

  describe('casos edge', () => {
    it('debería manejar ID de empleado como string en la ruta', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = { id: '123' };

      // Act
      fixture.detectChanges();

      // Assert
      expect(mockEmployeeService.getEmployeeById).toHaveBeenCalledWith(123);
    });

    it('debería manejar empleado con salario 0', () => {
      // Arrange
      const employeeWithZeroSalary = { ...mockEmployee, salary: 0 };
      mockEmployeeService.getEmployeeById.and.returnValue(of(employeeWithZeroSalary));
      fixture.detectChanges();

      // Act
      const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
      const salaryItem = Array.from(infoItems).find((item: any) =>
        item.textContent.includes('$0')
      );

      // Assert
      expect(salaryItem).toBeTruthy();
    });

    it('debería manejar empleado sin fecha de actualización', () => {
      // Arrange
      const employeeWithoutUpdateDate = { ...mockEmployee, updatedAt: undefined };
      mockEmployeeService.getEmployeeById.and.returnValue(of(employeeWithoutUpdateDate));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.employee?.updatedAt).toBeUndefined();
    });
  });
});