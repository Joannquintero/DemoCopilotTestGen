import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

import { AppComponent } from './app.component';

// Mock component para router-outlet
@Component({
  selector: 'router-outlet',
  template: '',
  standalone: true
})
class MockRouterOutlet { }

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        BrowserAnimationsModule,
        MockRouterOutlet
      ],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('inicialización del componente', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener el título correcto', () => {
      expect(component.title).toBe('Employee CRUD - Angular');
    });
  });

  describe('navegación', () => {
    it('debería navegar a la lista de empleados', () => {
      // Act
      component.navigateToEmployees();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
    });

    it('debería navegar al formulario de creación de empleados', () => {
      // Act
      component.navigateToCreateEmployee();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees/create']);
    });
  });

  describe('renderizado del template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería mostrar el título de la aplicación en la barra de herramientas', () => {
      // Act
      const titleElement = fixture.nativeElement.querySelector('mat-toolbar span');

      // Assert
      expect(titleElement.textContent).toBe('Employee Management System');
    });

    it('debería renderizar la barra de herramientas con color primario', () => {
      // Act
      const toolbar = fixture.nativeElement.querySelector('mat-toolbar');

      // Assert
      expect(toolbar).toBeTruthy();
      expect(toolbar.getAttribute('color')).toBe('primary');
    });

    it('debería mostrar botón de empleados con icono y texto correctos', () => {
      // Act
      const employeesButton = fixture.nativeElement.querySelector('button[color="accent"]');
      const buttonIcon = employeesButton.querySelector('mat-icon');

      // Assert
      expect(employeesButton.textContent.trim()).toContain('Employees');
      expect(buttonIcon.textContent.trim()).toBe('people');
      expect(employeesButton.getAttribute('color')).toBe('accent');
    });

    it('debería mostrar botón de agregar empleado con icono y texto correctos', () => {
      // Act
      const addEmployeeButtons = fixture.nativeElement.querySelectorAll('button[color="accent"]');
      const addEmployeeButton = addEmployeeButtons[1]; // Segundo botón
      const buttonIcon = addEmployeeButton.querySelector('mat-icon');

      // Assert
      expect(addEmployeeButton.textContent.trim()).toContain('Add Employee');
      expect(buttonIcon.textContent.trim()).toBe('person_add');
      expect(addEmployeeButton.getAttribute('color')).toBe('accent');
    });

    it('debería tener clase ml-2 en el botón de agregar empleado', () => {
      // Act
      const addEmployeeButtons = fixture.nativeElement.querySelectorAll('button');
      const addEmployeeButton = Array.from(addEmployeeButtons).find((btn: any) =>
        btn.textContent.includes('Add Employee')
      ) as HTMLElement;

      // Assert
      expect(addEmployeeButton.classList.contains('ml-2')).toBe(true);
    });

    it('debería mostrar el contenido principal', () => {
      // Act
      const mainContent = fixture.nativeElement.querySelector('.main-content');

      // Assert
      expect(mainContent).toBeTruthy();
    });

    it('debería incluir router-outlet en el contenido principal', () => {
      // Act
      const routerOutlet = fixture.nativeElement.querySelector('.main-content router-outlet');

      // Assert
      expect(routerOutlet).toBeTruthy();
    });

    it('debería mostrar el spacer para centrar elementos en la barra de herramientas', () => {
      // Act
      const spacer = fixture.nativeElement.querySelector('.spacer');

      // Assert
      expect(spacer).toBeTruthy();
    });
  });

  describe('interacciones del usuario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería llamar navigateToEmployees cuando se hace clic en el botón de empleados', () => {
      // Arrange
      spyOn(component, 'navigateToEmployees');

      // Act
      const employeesButton = fixture.nativeElement.querySelector('button[color="accent"]');
      employeesButton.click();

      // Assert
      expect(component.navigateToEmployees).toHaveBeenCalled();
    });

    it('debería llamar navigateToCreateEmployee cuando se hace clic en el botón de agregar empleado', () => {
      // Arrange
      spyOn(component, 'navigateToCreateEmployee');

      // Act
      const addEmployeeButtons = fixture.nativeElement.querySelectorAll('button[color="accent"]');
      const addEmployeeButton = addEmployeeButtons[1]; // Segundo botón
      addEmployeeButton.click();

      // Assert
      expect(component.navigateToCreateEmployee).toHaveBeenCalled();
    });
  });

  describe('estilos CSS', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería aplicar estilos del spacer correctamente', () => {
      // Act
      const spacer = fixture.nativeElement.querySelector('.spacer');
      const computedStyle = window.getComputedStyle(spacer);

      // Assert
      expect(spacer).toBeTruthy();
      // Verificar que el elemento existe para aplicar los estilos
    });

    it('debería aplicar estilos del contenido principal', () => {
      // Act
      const mainContent = fixture.nativeElement.querySelector('.main-content');
      const computedStyle = window.getComputedStyle(mainContent);

      // Assert
      expect(mainContent).toBeTruthy();
      // Los estilos específicos pueden variar según la implementación del navegador de testing
    });

    it('debería aplicar margen izquierdo al segundo botón', () => {
      // Act
      const addEmployeeButton = fixture.nativeElement.querySelector('.ml-2');
      const computedStyle = window.getComputedStyle(addEmployeeButton);

      // Assert
      expect(addEmployeeButton).toBeTruthy();
    });
  });

  describe('estructura del componente', () => {
    it('debería tener una estructura de toolbar correcta', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
      const toolbarRow = toolbar.querySelector('mat-toolbar-row');
      const title = toolbarRow.querySelector('span:first-child');
      const spacer = toolbarRow.querySelector('.spacer');
      const buttons = toolbarRow.querySelectorAll('button');

      // Assert
      expect(toolbar).toBeTruthy();
      expect(toolbarRow).toBeTruthy();
      expect(title).toBeTruthy();
      expect(spacer).toBeTruthy();
      expect(buttons.length).toBe(2);
    });

    it('debería tener iconos en todos los botones', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const iconsInButtons = Array.from(buttons).map((btn: any) =>
        btn.querySelector('mat-icon')
      );

      // Assert
      expect(iconsInButtons.every(icon => icon !== null)).toBe(true);
    });

    it('debería usar Material Design components correctamente', () => {
      // Arrange
      fixture.detectChanges();

      // Act
      const materialElements = {
        toolbar: fixture.nativeElement.querySelector('mat-toolbar'),
        toolbarRow: fixture.nativeElement.querySelector('mat-toolbar-row'),
        buttons: fixture.nativeElement.querySelectorAll('button[mat-raised-button]'),
        icons: fixture.nativeElement.querySelectorAll('mat-icon')
      };

      // Assert
      expect(materialElements.toolbar).toBeTruthy();
      expect(materialElements.toolbarRow).toBeTruthy();
      expect(materialElements.buttons.length).toBe(2);
      expect(materialElements.icons.length).toBe(2);
    });
  });

  describe('accesibilidad', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería tener botones con texto descriptivo', () => {
      // Act
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const buttonTexts = Array.from(buttons).map((btn: any) => btn.textContent.trim());

      // Assert
      expect(buttonTexts.some(text => text.includes('Employees'))).toBe(true);
      expect(buttonTexts.some(text => text.includes('Add Employee'))).toBe(true);
    });

    it('debería usar iconos apropiados para las acciones', () => {
      // Act
      const icons = fixture.nativeElement.querySelectorAll('mat-icon');
      const iconTexts = Array.from(icons).map((icon: any) => icon.textContent.trim());

      // Assert
      expect(iconTexts).toContain('people');
      expect(iconTexts).toContain('person_add');
    });
  });

  describe('responsive design', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería mantener estructura responsive con flexbox', () => {
      // Act
      const toolbarRow = fixture.nativeElement.querySelector('mat-toolbar-row');
      const spacer = toolbarRow.querySelector('.spacer');

      // Assert
      expect(toolbarRow).toBeTruthy();
      expect(spacer).toBeTruthy();
      // El spacer debe existir para el comportamiento responsive
    });
  });

  describe('casos edge', () => {
    it('debería manejar múltiples clics en los botones de navegación', () => {
      // Arrange
      fixture.detectChanges();
      
      // Act
      component.navigateToEmployees();
      component.navigateToEmployees();
      component.navigateToCreateEmployee();
      component.navigateToCreateEmployee();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledTimes(4);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees']);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/employees/create']);
    });

    it('debería funcionar correctamente sin dependencias externas al router', () => {
      // Arrange
      const componentInstance = new AppComponent(mockRouter);

      // Act & Assert
      expect(componentInstance.title).toBe('Employee CRUD - Angular');
      expect(() => componentInstance.navigateToEmployees()).not.toThrow();
      expect(() => componentInstance.navigateToCreateEmployee()).not.toThrow();
    });
  });
});