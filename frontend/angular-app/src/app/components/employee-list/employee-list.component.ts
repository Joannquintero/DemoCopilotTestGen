import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="employee-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-actions">
              <h2>Gestión de Empleados</h2>
              <div class="actions">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Buscar empleados...</mat-label>
                  <input matInput 
                         [(ngModel)]="searchTerm" 
                         (input)="onSearchChange()"
                         placeholder="Buscar por nombre o cargo">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="createEmployee()">
                  <mat-icon>person_add</mat-icon>
                  Agregar Empleado
                </button>
              </div>
            </div>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="loading-container" *ngIf="employeeService.loading()">
            <mat-spinner></mat-spinner>
            <p>Cargando empleados...</p>
          </div>

          <div class="error-container" *ngIf="employeeService.error()">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ employeeService.error() }}</p>
            <button mat-raised-button color="primary" (click)="refreshEmployees()">
              Intentar de nuevo
            </button>
          </div>

          <div class="table-container" *ngIf="!employeeService.loading() && !employeeService.error()">
            <table mat-table [dataSource]="filteredEmployees()" class="employees-table">
              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
                <td mat-cell *matCellDef="let employee">
                  <strong>{{ employee.fullName }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Correo Electrónico</th>
                <td mat-cell *matCellDef="let employee">
                  <a href="mailto:{{ employee.email }}">{{ employee.email }}</a>
                </td>
              </ng-container>

              <ng-container matColumnDef="position">
                <th mat-header-cell *matHeaderCellDef>Cargo</th>
                <td mat-cell *matCellDef="let employee">
                  {{ employee.position }}
                </td>
              </ng-container>

              <ng-container matColumnDef="salary">
                <th mat-header-cell *matHeaderCellDef>Salario</th>
                <td mat-cell *matCellDef="let employee">
                  {{ employee.salary | currency:'USD':'symbol':'1.0-0' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="hireDate">
                <th mat-header-cell *matHeaderCellDef>Fecha de Contratación</th>
                <td mat-cell *matCellDef="let employee">
                  {{ employee.hireDate | date:'shortDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let employee">
                  <div class="action-buttons">
                    <button 
                      mat-icon-button 
                      color="primary"
                      (click)="viewEmployee(employee.id)"
                      matTooltip="Ver Detalles">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="accent"
                      (click)="editEmployee(employee.id)"
                      matTooltip="Editar Empleado">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="warn"
                      (click)="confirmDelete(employee)"
                      matTooltip="Eliminar Empleado">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div class="no-data" *ngIf="filteredEmployees().length === 0">
              <mat-icon>people_outline</mat-icon>
              <h3>No se encontraron empleados</h3>
              <p *ngIf="searchTerm">Intente ajustar sus criterios de búsqueda.</p>
              <p *ngIf="!searchTerm">Comience agregando su primer empleado.</p>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="createEmployee()"
                *ngIf="employeeService.employees().length === 0">
                <mat-icon>person_add</mat-icon>
                Agregar Primer Empleado
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .employee-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .search-field {
      width: 300px;
    }

    .loading-container, 
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 20px;
    }

    .employees-table {
      width: 100%;
      margin-top: 20px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-data h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .no-data p {
      margin: 8px 0;
      opacity: 0.7;
    }

    mat-card {
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .header-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        width: 100%;
      }
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  protected readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  searchTerm = '';
  displayedColumns: string[] = ['fullName', 'email', 'position', 'salary', 'hireDate', 'actions'];

  filteredEmployees = computed(() => {
    const employees = this.employeeService.employees();
    if (!this.searchTerm) {
      return employees;
    }
    
    const term = this.searchTerm.toLowerCase();
    return employees.filter(employee => 
      employee.fullName.toLowerCase().includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      employee.position.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe();
  }

  refreshEmployees(): void {
    this.employeeService.clearError();
    this.loadEmployees();
  }

  onSearchChange(): void {
    // The computed signal will automatically update the filtered results
  }

  createEmployee(): void {
    this.router.navigate(['/employees/create']);
  }

  viewEmployee(id: number): void {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  confirmDelete(employee: Employee): void {
    if (confirm(`¿Está seguro de que desea eliminar a ${employee.fullName}?`)) {
      this.deleteEmployee(employee.id);
    }
  }

  private deleteEmployee(id: number): void {
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.snackBar.open('Empleado eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        this.snackBar.open('Error al eliminar empleado', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}