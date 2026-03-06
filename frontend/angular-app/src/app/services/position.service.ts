import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Position, CreatePositionDto, UpdatePositionDto } from '../models/position.model';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  // Dummy data for positions
  private dummyPositions: Position[] = [
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
      isActive: true,
      createdAt: new Date('2023-03-05'),
      updatedAt: new Date('2023-03-05')
    },
    {
      id: 4,
      name: 'Project Manager',
      description: 'Manage and coordinate development projects',
      minSalary: 55000,
      maxSalary: 80000,
      department: 'Management',
      isActive: false,
      createdAt: new Date('2023-04-12'),
      updatedAt: new Date('2023-04-12')
    },
    {
      id: 5,
      name: 'QA Tester',
      description: 'Test software quality and functionality',
      minSalary: 35000,
      maxSalary: 50000,
      department: 'Quality',
      isActive: true,
      createdAt: new Date('2023-05-20'),
      updatedAt: new Date('2023-05-20')
    },
    {
      id: 6,
      name: 'DevOps Engineer',
      description: 'Manage deployment and infrastructure',
      minSalary: 60000,
      maxSalary: 85000,
      department: 'Technology',
      isActive: true,
      createdAt: new Date('2023-06-08'),
      updatedAt: new Date('2023-06-08')
    }
  ];

  // Signals for reactive state management
  private readonly _positions = signal<Position[]>(this.dummyPositions);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly positions = this._positions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  getPositions(): Observable<Position[]> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      of(this.dummyPositions).pipe(delay(500)).subscribe({
        next: (positions) => {
          this._positions.set(positions);
          this._loading.set(false);
          observer.next(positions);
          observer.complete();
        },
        error: (error) => {
          this._error.set('Failed to load positions');
          this._loading.set(false);
          observer.error(error);
        }
      });
    });
  }

  getPositionById(id: number): Observable<Position> {
    const position = this.dummyPositions.find(p => p.id === id);
    if (position) {
      return of(position).pipe(delay(300));
    }
    return throwError(() => new Error('Position not found'));
  }

  getPositionsByDepartment(department: string): Observable<Position[]> {
    const filteredPositions = this.dummyPositions.filter(p => p.department === department);
    return of(filteredPositions).pipe(delay(300));
  }

  getActivePositions(): Observable<Position[]> {
    const activePositions = this.dummyPositions.filter(p => p.isActive);
    return of(activePositions).pipe(delay(300));
  }

  createPosition(position: CreatePositionDto): Observable<Position> {
    this._loading.set(true);
    this._error.set(null);
    
    const newPosition: Position = {
      id: Math.max(...this.dummyPositions.map(p => p.id)) + 1,
      ...position,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dummyPositions.push(newPosition);
    this._positions.set([...this.dummyPositions]);
    this._loading.set(false);

    return of(newPosition).pipe(delay(500));
  }

  updatePosition(position: UpdatePositionDto): Observable<Position> {
    this._loading.set(true);
    this._error.set(null);
    
    const index = this.dummyPositions.findIndex(p => p.id === position.id);
    if (index === -1) {
      this._error.set('Position not found');
      this._loading.set(false);
      return throwError(() => new Error('Position not found'));
    }

    const updatedPosition: Position = {
      ...this.dummyPositions[index],
      ...position,
      updatedAt: new Date()
    };

    this.dummyPositions[index] = updatedPosition;
    this._positions.set([...this.dummyPositions]);
    this._loading.set(false);

    return of(updatedPosition).pipe(delay(500));
  }

  deletePosition(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);
    
    const index = this.dummyPositions.findIndex(p => p.id === id);
    if (index === -1) {
      this._error.set('Position not found');
      this._loading.set(false);
      return throwError(() => new Error('Position not found'));
    }

    this.dummyPositions.splice(index, 1);
    this._positions.set([...this.dummyPositions]);
    this._loading.set(false);

    return of(void 0).pipe(delay(500));
  }

  // Utility method to refresh positions
  refreshPositions(): void {
    this.getPositions().subscribe();
  }
}