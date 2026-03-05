import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto, PaginatedResult } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:53392/api/employees';
  
  // Signals for reactive state management
  private readonly _employees = signal<Employee[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly employees = this._employees.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  getEmployees(): Observable<Employee[]> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      this.http.get<Employee[]>(this.baseUrl).subscribe({
        next: (employees) => {
          this._employees.set(employees);
          this._loading.set(false);
          observer.next(employees);
          observer.complete();
        },
        error: (error) => {
          this._error.set('Failed to load employees');
          this._loading.set(false);
          observer.error(error);
        }
      });
    });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  getEmployeesByPosition(position: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/by-position/${position}`);
  }

  getPaginatedEmployees(page: number, pageSize: number): Observable<PaginatedResult<Employee>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResult<Employee>>(`${this.baseUrl}/paginated`, { params });
  }

  getEmployeeCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  createEmployee(employee: CreateEmployeeDto): Observable<Employee> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      this.http.post<Employee>(this.baseUrl, employee).subscribe({
        next: (newEmployee) => {
          const currentEmployees = this._employees();
          this._employees.set([...currentEmployees, newEmployee]);
          this._loading.set(false);
          observer.next(newEmployee);
          observer.complete();
        },
        error: (error) => {
          this._error.set('Failed to create employee');
          this._loading.set(false);
          observer.error(error);
        }
      });
    });
  }

  updateEmployee(id: number, employee: UpdateEmployeeDto): Observable<Employee> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      this.http.put<Employee>(`${this.baseUrl}/${id}`, employee).subscribe({
        next: (updatedEmployee) => {
          const currentEmployees = this._employees();
          const index = currentEmployees.findIndex(emp => emp.id === id);
          if (index !== -1) {
            const newEmployees = [...currentEmployees];
            newEmployees[index] = updatedEmployee;
            this._employees.set(newEmployees);
          }
          this._loading.set(false);
          observer.next(updatedEmployee);
          observer.complete();
        },
        error: (error) => {
          this._error.set('Failed to update employee');
          this._loading.set(false);
          observer.error(error);
        }
      });
    });
  }

  deleteEmployee(id: number): Observable<void> {
    this._loading.set(true);
    this._error.set(null);
    
    return new Observable(observer => {
      this.http.delete<void>(`${this.baseUrl}/${id}`).subscribe({
        next: () => {
          const currentEmployees = this._employees();
          this._employees.set(currentEmployees.filter(emp => emp.id !== id));
          this._loading.set(false);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          this._error.set('Failed to delete employee');
          this._loading.set(false);
          observer.error(error);
        }
      });
    });
  }

  // Method to refresh the employees list
  refreshEmployees(): void {
    this.getEmployees().subscribe();
  }

  // Method to clear error
  clearError(): void {
    this._error.set(null);
  }
}