import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeService } from '../../services/employee.service';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../../models/employee.model';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let mockEmployeeService: jasmine.SpyObj<EmployeeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

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

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', [
      'getEmployeeById',
      'createEmployee',
      'updateEmployee'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        params: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        EmployeeFormComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    mockEmployeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockEmployeeService.getEmployeeById.and.returnValue(of(mockEmployee));
    mockEmployeeService.createEmployee.and.returnValue(of(mockEmployee));
    mockEmployeeService.updateEmployee.and.returnValue(of(mockEmployee));
  });

  describe('inicialización del componente', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar el formulario con valores vacíos para nuevo empleado', () => {
      // Arrange & Act
      fixture.detectChanges();

      // Assert
      expect(component.employeeForm.get('firstName')?.value).toBe('');
      expect(component.employeeForm.get('lastName')?.value).toBe('');
      expect(component.employeeForm.get('email')?.value).toBe('');
      expect(component.employeeForm.get('position')?.value).toBe('');
      expect(component.employeeForm.get('hireDate')?.value).toBe('');
      expect(component.employeeForm.get('salary')?.value).toBe(0);
      expect(component.isEditing).toBe(false);
    });

    it('debería establecer modo edición cuando hay ID en la ruta', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = { id: '1' };

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.isEditing).toBe(true);
      expect(component.employeeId).toBe(1);
      expect(mockEmployeeService.getEmployeeById).toHaveBeenCalledWith(1);
    });

    it('debería cargar datos del empleado en modo edición', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = { id: '1' };

      // Act
      fixture.detectChanges();

      // Assert
      expect(mockEmployeeService.getEmployeeById).toHaveBeenCalledWith(1);
      expect(component.employeeForm.get('firstName')?.value).toBe(mockEmployee.firstName);
      expect(component.employeeForm.get('lastName')?.value).toBe(mockEmployee.lastName);
      expect(component.employeeForm.get('email')?.value).toBe(mockEmployee.email);
      expect(component.employeeForm.get('position')?.value).toBe(mockEmployee.position);
      expect(component.employeeForm.get('salary')?.value).toBe(mockEmployee.salary);
    });
  });

  describe('validación del formulario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería ser inválido cuando los campos requeridos están vacíos', () => {
      // Arrange & Act
      const form = component.employeeForm;

      // Assert
      expect(form.valid).toBe(false);
      expect(form.get('firstName')?.hasError('required')).toBe(true);
      expect(form.get('lastName')?.hasError('required')).toBe(true);
      expect(form.get('email')?.hasError('required')).toBe(true);
      expect(form.get('position')?.hasError('required')).toBe(true);
      expect(form.get('hireDate')?.hasError('required')).toBe(true);
    });

    it('debería validar formato de email', () => {
      // Arrange
      const emailControl = component.employeeForm.get('email');

      // Act
      emailControl?.setValue('email-invalido');

      // Assert
      expect(emailControl?.hasError('email')).toBe(true);
      expect(component.employeeForm.valid).toBe(false);
    });

    it('debería ser válido cuando todos los campos requeridos están llenos correctamente', () => {
      // Arrange
      const form = component.employeeForm;

      // Act
      form.patchValue({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@test.com',
        position: 'Desarrollador',
        hireDate: new Date('2023-01-15'),
        salary: 50000
      });

      // Assert
      expect(form.valid).toBe(true);
    });

    it('debería validar salario mínimo', () => {
      // Arrange
      const salaryControl = component.employeeForm.get('salary');

      // Act
      salaryControl?.setValue(-1000);

      // Assert
      expect(salaryControl?.hasError('min')).toBe(true);
    });

    it('debería permitir salario de cero', () => {
      // Arrange
      const salaryControl = component.employeeForm.get('salary');

      // Act
      salaryControl?.setValue(0);

      // Assert
      expect(salaryControl?.hasError('min')).toBe(false);
    });
  });

  describe('envío del formulario para crear empleado', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería crear empleado exitosamente con datos válidos', () => {
      // Arrange
      const formData = {
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@test.com',
        position: 'Diseñadora',
        hireDate: new Date('2023-03-01'),
        salary: 45000
      };
      
      component.employeeForm.patchValue(formData);

      // Act
      component.onSubmit();

      // Assert
      const expectedCreateDto: CreateEmployeeDto = {
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@test.com',
        position: 'Diseñadora',
        hireDate: formData.hireDate,
        salary: 45000
      };

      expect(mockEmployeeService.createEmployee).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('debería manejar salario cero como valor por defecto', () => {
      // Arrange
      const formData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        position: 'Tester',
        hireDate: new Date('2023-03-01'),
        salary: null
      };
      
      component.employeeForm.patchValue(formData);

      // Act
      component.onSubmit();

      // Assert
      const createCall = mockEmployeeService.createEmployee.calls.first();
      expect(createCall.args[0].salary).toBe(0);
    });

    it('debería manejar errores al crear empleado', () => {
      // Arrange
      mockEmployeeService.createEmployee.and.returnValue(throwError(() => new Error('Error de servidor')));
      spyOn(console, 'error');

      component.employeeForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        position: 'Tester',
        hireDate: new Date('2023-03-01'),
        salary: 40000
      });

      // Act
      component.onSubmit();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error creating employee:', jasmine.any(Error));
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('no debería enviar si el formulario es inválido', () => {
      // Arrange - formulario vacío es inválido
      expect(component.employeeForm.valid).toBe(false);

      // Act
      component.onSubmit();

      // Assert
      expect(mockEmployeeService.createEmployee).not.toHaveBeenCalled();
      expect(mockEmployeeService.updateEmployee).not.toHaveBeenCalled();
    });
  });

  describe('envío del formulario para actualizar empleado', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.params = { id: '1' };
      fixture.detectChanges();
    });

    it('debería actualizar empleado exitosamente con datos válidos', () => {
      // Arrange
      const updatedData = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez',
        email: 'juan.carlos.perez@test.com',
        position: 'Senior Developer',
        hireDate: new Date('2023-01-15'),
        salary: 60000
      };
      
      component.employeeForm.patchValue(updatedData);

      // Act
      component.onSubmit();

      // Assert
      const expectedUpdateDto: UpdateEmployeeDto = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez',
        email: 'juan.carlos.perez@test.com',
        position: 'Senior Developer',
        hireDate: updatedData.hireDate,
        salary: 60000
      };

      expect(mockEmployeeService.updateEmployee).toHaveBeenCalledWith(1, expectedUpdateDto);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('debería manejar errores al actualizar empleado', () => {
      // Arrange
      mockEmployeeService.updateEmployee.and.returnValue(throwError(() => new Error('Error de validación')));
      spyOn(console, 'error');

      component.employeeForm.patchValue({
        firstName: 'Juan Carlos',
        lastName: 'Pérez',
        email: 'juan.carlos.perez@test.com',
        position: 'Senior Developer',
        hireDate: new Date('2023-01-15'),
        salary: 60000
      });

      // Act
      component.onSubmit();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error updating employee:', jasmine.any(Error));
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('carga de datos del empleado', () => {
    it('debería manejar errores al cargar datos del empleado', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = { id: '999' };
      mockEmployeeService.getEmployeeById.and.returnValue(throwError(() => new Error('Empleado no encontrado')));
      spyOn(console, 'error');

      // Act
      fixture.detectChanges();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error loading employee:', jasmine.any(Error));
    });

    it('debería cargar y mapear correctamente la fecha de contratación', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = { id: '1' };
      const employeeWithStringDate = {
        ...mockEmployee,
        hireDate: '2023-01-15T00:00:00.000Z' as any
      };
      mockEmployeeService.getEmployeeById.and.returnValue(of(employeeWithStringDate));

      // Act
      fixture.detectChanges();

      // Assert
      const hireDateValue = component.employeeForm.get('hireDate')?.value;
      expect(hireDateValue).toBeInstanceOf(Date);
    });
  });

  describe('navegación y cancelación', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería navegar de vuelta a la lista al cancelar', () => {
      // Act
      component.onCancel();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });
  });

  describe('renderizado del template', () => {
    it('debería mostrar el título correcto para nuevo empleado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const titleElement = fixture.nativeElement.querySelector('mat-card-title');

      // Assert
      expect(titleElement.textContent.trim()).toBe('Agregar Nuevo Empleado');
    });

    it('debería mostrar el título correcto para edición de empleado', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = { id: '1' };
      fixture.detectChanges();

      // Act
      const titleElement = fixture.nativeElement.querySelector('mat-card-title');

      // Assert
      expect(titleElement.textContent.trim()).toBe('Editar Empleado');
    });

    it('debería mostrar el texto correcto en el botón para nuevo empleado', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const submitButton = fixture.nativeElement.querySelector('button[color="primary"]');

      // Assert
      expect(submitButton.textContent.trim()).toBe('Crear Empleado');
    });

    it('debería mostrar el texto correcto en el botón para edición', () => {
      // Arrange
      mockActivatedRoute.snapshot.params = { id: '1' };
      fixture.detectChanges();

      // Act
      const submitButton = fixture.nativeElement.querySelector('button[color="primary"]');

      // Assert
      expect(submitButton.textContent.trim()).toBe('Actualizar Empleado');
    });

    it('debería deshabilitar el botón de envío cuando el formulario es inválido', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const submitButton = fixture.nativeElement.querySelector('button[color="primary"]');

      // Assert
      expect(submitButton.disabled).toBe(true);
    });

    it('debería habilitar el botón de envío cuando el formulario es válido', () => {
      // Arrange
      fixture.detectChanges();
      component.employeeForm.patchValue({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@test.com',
        position: 'Desarrollador',
        hireDate: new Date('2023-01-15'),
        salary: 50000
      });
      fixture.detectChanges();

      // Act
      const submitButton = fixture.nativeElement.querySelector('button[color="primary"]');

      // Assert
      expect(submitButton.disabled).toBe(false);
    });

    it('debería mostrar mensajes de error de validación', () => {
      // Arrange
      fixture.detectChanges();
      
      // Act - tocar los campos para activar la validación
      const firstNameControl = component.employeeForm.get('firstName');
      firstNameControl?.markAsTouched();
      firstNameControl?.setValue('');
      fixture.detectChanges();

      // Assert
      const errorElement = fixture.nativeElement.querySelector('mat-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent.trim()).toBe('El nombre es obligatorio');
    });

    it('debería mostrar error de email inválido', () => {
      // Arrange
      fixture.detectChanges();
      
      // Act
      const emailControl = component.employeeForm.get('email');
      emailControl?.markAsTouched();
      emailControl?.setValue('email-invalido');
      fixture.detectChanges();

      // Assert
      const errorElements = fixture.nativeElement.querySelectorAll('mat-error');
      const emailErrorElement = Array.from(errorElements).find(
        (el: any) => el.textContent.includes('Ingrese un correo electrónico válido')
      );
      expect(emailErrorElement).toBeTruthy();
    });
  });

  describe('interacciones del usuario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería llamar onSubmit cuando se hace clic en el botón de envío', () => {
      // Arrange
      spyOn(component, 'onSubmit');
      component.employeeForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        position: 'Tester',
        hireDate: new Date('2023-03-01'),
        salary: 40000
      });
      fixture.detectChanges();

      // Act
      const submitButton = fixture.nativeElement.querySelector('button[color="primary"]');
      submitButton.click();

      // Assert
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('debería llamar onCancel cuando se hace clic en el botón cancelar', () => {
      // Arrange
      spyOn(component, 'onCancel');

      // Act
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const cancelButton = Array.from(buttons).find((btn: any) => 
        btn.textContent.trim().includes('Cancelar')
      ) as HTMLElement;
      
      if (cancelButton) {
        cancelButton.click();
      }

      // Assert
      expect(component.onCancel).toHaveBeenCalled();
    });
  });
});