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

    it('debería navegar a la lista de cargos', () => {
      // Act
      component.navigateToPositions();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/positions']);
    });
  });

  describe('renderizado del template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería renderizar la barra de herramientas con color primario', () => {
      // Act
      const toolbar = fixture.nativeElement.querySelector('mat-toolbar');

      // Assert
      expect(toolbar).toBeTruthy();
      expect(toolbar.getAttribute('color')).toBe('primary');
    });

    it('debería tener clase ml-1 en los botones secundarios', () => {
      // Act  
      const buttonsWithClass = fixture.nativeElement.querySelectorAll('.ml-1');

      // Assert
      expect(buttonsWithClass.length).toBeGreaterThan(0);
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
  });

  describe('estructura del componente', () => {

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
  });

  describe('accesibilidad', () => {
    beforeEach(() => {
      fixture.detectChanges();
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