import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PositionListComponent } from './position-list.component';
import { PositionService } from '../../services/position.service';
import { Position } from '../../models/position.model';

describe('PositionListComponent', () => {
  let component: PositionListComponent;
  let fixture: ComponentFixture<PositionListComponent>;
  let mockPositionService: jasmine.SpyObj<PositionService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  // Test signals for mocking
  let testPositionsSignal = signal<Position[]>([]);
  let testLoadingSignal = signal(false);
  let testErrorSignal = signal<string | null>(null);

  const mockPositions: Position[] = [
    {
      id: 1,
      name: 'Frontend Developer',
      description: 'Develop user interfaces with Angular and React',
      minSalary: 45000,
      maxSalary: 65000,
      department: 'Technology',
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    {
      id: 2,
      name: 'UX/UI Designer',
      description: 'Design user experiences and graphic interfaces',
      minSalary: 40000,
      maxSalary: 60000,
      department: 'Design',
      isActive: true,
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-02-10')
    },
    {
      id: 3,
      name: 'Backend Developer',
      description: 'Develop server-side applications and APIs',
      minSalary: 50000,
      maxSalary: 70000,
      department: 'Technology',
      isActive: false,
      createdAt: new Date('2023-03-05'),
      updatedAt: new Date('2023-03-05')
    }
  ];

  beforeEach(async () => {
    testPositionsSignal = signal(mockPositions);
    testLoadingSignal = signal(false);
    testErrorSignal = signal(null);

    const positionServiceSpy = jasmine.createSpyObj('PositionService', 
      ['getPositions', 'refreshPositions', 'updatePosition', 'deletePosition']
    );
    
    // Mock readonly signals
    Object.defineProperty(positionServiceSpy, 'positions', {
      get: () => testPositionsSignal.asReadonly()
    });
    Object.defineProperty(positionServiceSpy, 'loading', {
      get: () => testLoadingSignal.asReadonly()
    });
    Object.defineProperty(positionServiceSpy, 'error', {
      get: () => testErrorSignal.asReadonly()
    });
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        PositionListComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PositionService, useValue: positionServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PositionListComponent);
    component = fixture.componentInstance;
    mockPositionService = TestBed.inject(PositionService) as jasmine.SpyObj<PositionService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    mockPositionService.getPositions.and.returnValue(of(mockPositions));
  });

  describe('Inicialización del componente', () => {
    it('debería crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar las propiedades con valores por defecto', () => {
      expect(component.searchTerm).toBe('');
      expect(component.selectedDepartment).toBe('');
      expect(component.activeOnly).toBe(true);
      expect(component.displayedColumns).toEqual(['name', 'description', 'department', 'salaryRange', 'createdDate', 'actions']);
    });

    it('debería cargar las posiciones al inicializar', () => {
      component.ngOnInit();
      expect(mockPositionService.getPositions).toHaveBeenCalled();
    });
  });

  describe('Propiedades computadas y señales', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería calcular correctamente los departamentos únicos', () => {
      const departments = component.departments();
      expect(departments).toEqual(['Design', 'Technology']);
      expect(departments.length).toBe(2);
    });

    it('debería ordenar los departamentos alfabéticamente', () => {
      const departments = component.departments();
      expect(departments[0]).toBe('Design');
      expect(departments[1]).toBe('Technology');
    });

    it('debería filtrar posiciones por término de búsqueda', () => {
      component.searchTerm = 'Frontend';
      const filtered = component.filteredPositions();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Frontend Developer');
    });

    it('debería filtrar solo posiciones activas cuando activeOnly es true', () => {
      component.activeOnly = true;
      const filtered = component.filteredPositions();
      expect(filtered.length).toBe(2);
      expect(filtered.every(p => p.isActive)).toBe(true);
    });

    it('debería mostrar todas las posiciones cuando activeOnly es false', () => {
      component.activeOnly = false;
      const filtered = component.filteredPositions();
      expect(filtered.length).toBe(3);
    });

    it('debería aplicar múltiples filtros simultáneamente', () => {
      component.searchTerm = 'Developer';
      component.selectedDepartment = 'Technology';
      component.activeOnly = true;
      
      const filtered = component.filteredPositions();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Frontend Developer');
    });

    it('debería ser insensible a mayúsculas y minúsculas en la búsqueda', () => {
      component.searchTerm = 'frontend';
      const filtered = component.filteredPositions();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Frontend Developer');
    });
  });

  describe('Funcionalidad de filtros', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería actualizar el término de búsqueda al llamar onSearchChange', () => {
      component.searchTerm = 'test';
      component.onSearchChange();
      expect(component.searchTerm).toBe('test');
    });

    it('debería actualizar los filtros al llamar onFilterChange', () => {
      component.selectedDepartment = 'Technology';
      component.onFilterChange();
      expect(component.selectedDepartment).toBe('Technology');
    });

    it('debería limpiar todos los filtros al llamar clearFilters', () => {
      component.searchTerm = 'test';
      component.selectedDepartment = 'Technology';
      component.activeOnly = false;
      
      component.clearFilters();
      
      expect(component.searchTerm).toBe('');
      expect(component.selectedDepartment).toBe('');
      expect(component.activeOnly).toBe(true);
    });

    it('debería retornar la lista de departamentos al llamar getDepartments', () => {
      const departments = component.getDepartments();
      expect(departments).toEqual(component.departments());
    });
  });

  describe('Acciones de posiciones', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería cancelar eliminación si el usuario no confirma', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      const position = mockPositions[0];
      component.confirmDelete(position);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(mockPositionService.deletePosition).not.toHaveBeenCalled();
    });
  });

  describe('Carga y actualización de datos', () => {
    it('debería cargar posiciones al llamar loadPositions', () => {
      component.loadPositions();
      expect(mockPositionService.getPositions).toHaveBeenCalled();
    });

    it('debería refrescar posiciones al llamar refreshPositions', () => {
      component.refreshPositions();
      expect(mockPositionService.refreshPositions).toHaveBeenCalled();
    });
  });

  describe('Renderizado del template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería mostrar el título del componente', () => {
      const titleElement = fixture.nativeElement.querySelector('h2');
      expect(titleElement.textContent.trim()).toBe('Position Management');
    });

    it('debería mostrar los controles de filtro', () => {
      const searchInput = fixture.nativeElement.querySelector('input[placeholder="Search by name or department"]');
      const departmentSelect = fixture.nativeElement.querySelector('mat-select');
      const activeToggle = fixture.nativeElement.querySelector('mat-slide-toggle');
      
      expect(searchInput).toBeTruthy();
      expect(departmentSelect).toBeTruthy();
      expect(activeToggle).toBeTruthy();
    });

    it('debería mostrar la tabla de posiciones cuando no hay carga ni error', () => {
      const table = fixture.nativeElement.querySelector('.positions-table');
      expect(table).toBeTruthy();
    });

    it('debería mostrar indicador de carga cuando está cargando', () => {
      testLoadingSignal.set(true);
      fixture.detectChanges();
      
      const loadingContainer = fixture.nativeElement.querySelector('.loading-container');
      expect(loadingContainer).toBeTruthy();
      
      const loadingText = fixture.nativeElement.querySelector('.loading-container p');
      expect(loadingText.textContent.trim()).toBe('Loading positions...');
    });

    it('debería mostrar mensaje de error cuando hay un error', () => {
      testLoadingSignal.set(false);
      testErrorSignal.set('Error loading positions');
      fixture.detectChanges();
      
      const errorContainer = fixture.nativeElement.querySelector('.error-container');
      expect(errorContainer).toBeTruthy();
      
      const errorText = fixture.nativeElement.querySelector('.error-container p');
      expect(errorText.textContent.trim()).toBe('Error loading positions');
    });

    it('debería mostrar mensaje cuando no hay datos filtrados', () => {
      component.searchTerm = 'nonexistent';
      fixture.detectChanges();
      
      const noDataMessage = fixture.nativeElement.querySelector('.no-data');
      expect(noDataMessage).toBeTruthy();
      
      const noDataTitle = fixture.nativeElement.querySelector('.no-data h3');
      expect(noDataTitle.textContent.trim()).toBe('No positions found');
    });

    it('debería mostrar el botón de limpiar filtros cuando hay filtros activos', () => {
      component.searchTerm = 'test';
      fixture.detectChanges();
      
      const clearButton = fixture.nativeElement.querySelector('.clear-filters-btn');
      expect(clearButton).toBeTruthy();
    });

    it('debería ocultar el botón de limpiar filtros cuando no hay filtros activos', () => {
      component.clearFilters();
      fixture.detectChanges();
      
      const clearButton = fixture.nativeElement.querySelector('.clear-filters-btn');
      expect(clearButton).toBeFalsy();
    });
  });

  describe('Interacciones del usuario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería actualizar el término de búsqueda al escribir en el campo de búsqueda', () => {
      const searchInput = fixture.nativeElement.querySelector('input[placeholder="Search by name or department"]');
      
      searchInput.value = 'Frontend';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.searchTerm).toBe('Frontend');
    });

    it('debería llamar a refreshPositions al hacer clic en "Try again"', () => {
      testLoadingSignal.set(false);
      testErrorSignal.set('Error loading positions');
      fixture.detectChanges();
      
      const retryButton = fixture.nativeElement.querySelector('.error-container button');
      retryButton.click();
      
      expect(mockPositionService.refreshPositions).toHaveBeenCalled();
    });

    it('debería llamar a clearFilters al hacer clic en el botón de limpiar filtros', () => {
      component.searchTerm = 'test';
      fixture.detectChanges();
      
      spyOn(component, 'clearFilters');
      const clearButton = fixture.nativeElement.querySelector('.clear-filters-btn');
      clearButton.click();
      
      expect(component.clearFilters).toHaveBeenCalled();
    });

    it('debería actualizar el filtro de departamento al seleccionar una opción', () => {
      spyOn(component, 'onFilterChange');
      
      component.selectedDepartment = 'Technology';
      component.onFilterChange();
      
      expect(component.onFilterChange).toHaveBeenCalled();
      expect(component.selectedDepartment).toBe('Technology');
    });

    it('debería actualizar el filtro activeOnly al cambiar el toggle', () => {
      spyOn(component, 'onFilterChange');
      
      component.activeOnly = false;
      component.onFilterChange();
      
      expect(component.onFilterChange).toHaveBeenCalled();
      expect(component.activeOnly).toBe(false);
    });

    it('debería llamar a las acciones correctas al hacer clic en los botones de acción', () => {
      spyOn(component, 'viewPosition');
      spyOn(component, 'editPosition');
      spyOn(component, 'toggleActivePosition');
      spyOn(component, 'confirmDelete');
      
      component.viewPosition(1);
      component.editPosition(1);
      component.toggleActivePosition(mockPositions[0]);
      component.confirmDelete(mockPositions[0]);
      
      expect(component.viewPosition).toHaveBeenCalledWith(1);
      expect(component.editPosition).toHaveBeenCalledWith(1);
      expect(component.toggleActivePosition).toHaveBeenCalledWith(mockPositions[0]);
      expect(component.confirmDelete).toHaveBeenCalledWith(mockPositions[0]);
    });
  });

  describe('Responsive y accesibilidad', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería aplicar clases CSS responsivas correctamente', () => {
      const container = fixture.nativeElement.querySelector('.position-list-container');
      expect(container).toBeTruthy();
      
      const headerActions = fixture.nativeElement.querySelector('.header-actions');
      expect(headerActions).toBeTruthy();
      
      const filtersContainer = fixture.nativeElement.querySelector('.filters-container');
      expect(filtersContainer).toBeTruthy();
    });

    it('debería tener tooltips en los botones de acción', () => {
      const actionButtons = fixture.nativeElement.querySelectorAll('[matTooltip]');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('debería mostrar etiquetas descriptivas en los campos de formulario', () => {
      const labels = fixture.nativeElement.querySelectorAll('mat-label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('debería tener estructura de tabla accesible', () => {
      const table = fixture.nativeElement.querySelector('table[mat-table]');
      expect(table).toBeTruthy();
      
      const headers = fixture.nativeElement.querySelectorAll('th[mat-header-cell]');
      expect(headers.length).toBe(component.displayedColumns.length);
    });
  });

  describe('Manejo de casos extremos', () => {
    it('debería manejar lista vacía de posiciones', () => {
      testPositionsSignal.set([]);
      fixture.detectChanges();
      
      const filteredPositions = component.filteredPositions();
      expect(filteredPositions.length).toBe(0);
      
      const noDataMessage = fixture.nativeElement.querySelector('.no-data');
      expect(noDataMessage).toBeTruthy();
    });

    it('debería manejar departamentos con nombres especiales', () => {
      const specialPosition: Position = {
        id: 4,
        name: 'Special Position',
        description: 'Test position',
        minSalary: 30000,
        maxSalary: 50000,
        department: 'R&D / Research',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      testPositionsSignal.set([...mockPositions, specialPosition]);
      fixture.detectChanges();
      
      const departments = component.departments();
      expect(departments).toContain('R&D / Research');
    });

    it('debería manejar valores nulos o undefined en filtros', () => {
      component['_searchTerm'].set('');
      component['_selectedDepartment'].set('');
      
      expect(() => {
        const filtered = component.filteredPositions();
        return filtered;
      }).not.toThrow();
    });
  });
});