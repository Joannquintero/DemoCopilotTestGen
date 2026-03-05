import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="employee-details-container" *ngIf="employee">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Detalles del Empleado</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" 
                    (click)="editEmployee()">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-raised-button color="warn" 
                    (click)="deleteEmployee()">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="employee-info">
            <div class="info-section">
              <h3>Información Personal</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Nombre:</label>
                  <span>{{ employee.firstName }}</span>
                </div>
                <div class="info-item">
                  <label>Apellido:</label>
                  <span>{{ employee.lastName }}</span>
                </div>
                <div class="info-item">
                  <label>Correo Electrónico:</label>
                  <span>{{ employee.email }}</span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="info-section">
              <h3>Información Profesional</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Cargo:</label>
                  <span>{{ employee.position }}</span>
                </div>
                <div class="info-item">
                  <label>Fecha de Contratación:</label>
                  <span>{{ employee.hireDate | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <label>Salario:</label>
                  <span>{{ employee.salary | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver a la Lista
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="!employee">
      <p>Cargando detalles del empleado...</p>
    </div>
  `,
  styles: [`
    .employee-details-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }

    mat-card {
      padding: 20px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .employee-info {
      padding: 20px 0;
    }

    .info-section {
      margin: 20px 0;
    }

    .info-section h3 {
      color: #1976d2;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.9em;
    }

    .info-item span {
      font-size: 1.1em;
      color: #333;
    }

    mat-divider {
      margin: 20px 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      font-size: 1.2em;
      color: #666;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-start;
      margin-top: 20px;
    }
  `]
})
export class EmployeeDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  employee?: Employee;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEmployee(+id);
    }
  }

  private loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employee = employee;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        // Handle error - maybe redirect back to list
        this.router.navigate(['/employees']);
      }
    });
  }

  editEmployee(): void {
    if (this.employee) {
      this.router.navigate(['/employees', this.employee.id, 'edit']);
    }
  }

  deleteEmployee(): void {
    if (this.employee && confirm('¿Está seguro de que desea eliminar este empleado?')) {
      this.employeeService.deleteEmployee(this.employee.id).subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          // Handle error
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}