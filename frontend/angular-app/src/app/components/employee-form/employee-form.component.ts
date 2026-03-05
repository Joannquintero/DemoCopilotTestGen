import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="employee-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditing ? 'Editar Empleado' : 'Agregar Nuevo Empleado' }}
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field>
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="employeeForm.get('firstName')?.hasError('required')">
                  El nombre es obligatorio
                </mat-error>
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="employeeForm.get('lastName')?.hasError('required')">
                  El apellido es obligatorio
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field>
                <mat-label>Correo Electrónico</mat-label>
                <input matInput formControlName="email" type="email" required>
                <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">
                  El correo electrónico es obligatorio
                </mat-error>
                <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">
                  Ingrese un correo electrónico válido
                </mat-error>
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Cargo</mat-label>
                <input matInput formControlName="position" required>
                <mat-error *ngIf="employeeForm.get('position')?.hasError('required')">
                  El cargo es obligatorio
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field>
                <mat-label>Fecha de Contratación</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="hireDate" required>
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="employeeForm.get('hireDate')?.hasError('required')">
                  La fecha de contratación es obligatoria
                </mat-error>
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Salario</mat-label>
                <input matInput formControlName="salary" type="number" min="0">
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" 
                  (click)="onSubmit()" 
                  [disabled]="!employeeForm.valid">
            {{ isEditing ? 'Actualizar' : 'Crear' }} Empleado
          </button>
          <button mat-button (click)="onCancel()">
            Cancelar
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .employee-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .form-row mat-form-field {
      flex: 1;
    }
    
    mat-card {
      padding: 20px;
    }
    
    mat-card-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);

  employeeForm: FormGroup;
  isEditing = false;
  employeeId?: number;

  constructor() {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      position: ['', [Validators.required]],
      hireDate: ['', [Validators.required]],
      salary: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditing = true;
      this.employeeId = +id;
      this.loadEmployee(this.employeeId);
    }
  }

  private loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          position: employee.position,
          hireDate: new Date(employee.hireDate),
          salary: employee.salary
        });
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        // Handle error
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      const employeeData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        position: formValue.position,
        hireDate: formValue.hireDate,
        salary: formValue.salary || 0
      };

      if (this.isEditing) {
        this.employeeService.updateEmployee(this.employeeId!, employeeData).subscribe({
          next: () => {
            this.router.navigate(['/employees']);
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            // Handle error
          }
        });
      } else {
        this.employeeService.createEmployee(employeeData).subscribe({
          next: () => {
            this.router.navigate(['/employees']);
          },
          error: (error) => {
            console.error('Error creating employee:', error);
            // Handle error
          }
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}