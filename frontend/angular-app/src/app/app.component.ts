import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <mat-toolbar-row>
        <span>Employee Management System</span>
        <span class="spacer"></span>
        <button 
          mat-raised-button 
          color="accent" 
          (click)="navigateToEmployees()">
          <mat-icon>people</mat-icon>
          Employees
        </button>
        <button 
          mat-raised-button 
          color="accent" 
          (click)="navigateToCreateEmployee()"
          class="ml-2">
          <mat-icon>person_add</mat-icon>
          Add Employee
        </button>
      </mat-toolbar-row>
    </mat-toolbar>
    
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .main-content {
      padding: 20px;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
    
    .ml-2 {
      margin-left: 8px;
    }
    
    mat-toolbar {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class AppComponent {
  title = 'Employee CRUD - Angular';

  constructor(private router: Router) {}

  navigateToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  navigateToCreateEmployee(): void {
    this.router.navigate(['/employees/create']);
  }
}