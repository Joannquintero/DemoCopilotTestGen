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
        <span>Employee and Position Management System</span>
        <span class="spacer"></span>
        <div class="nav-section">
          <span class="section-label">Employees:</span>
          <button 
            mat-raised-button 
            color="accent" 
            (click)="navigateToEmployees()">
            <mat-icon>people</mat-icon>
            List
          </button>
          <button 
            mat-raised-button 
            color="accent" 
            (click)="navigateToCreateEmployee()"
            class="ml-1">
            <mat-icon>person_add</mat-icon>
            Add
          </button>
        </div>
        
        <div class="nav-section">
          <span class="section-label">Positions:</span>
          <button 
            mat-raised-button 
            color="warn" 
            (click)="navigateToPositions()">
            <mat-icon>work</mat-icon>
            List
          </button>
        </div>
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
    
    .nav-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 16px;
    }
    
    .section-label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      margin-right: 4px;
    }
    
    .ml-1 {
      margin-left: 4px;
    }
    
    mat-toolbar {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    mat-toolbar-row {
      flex-wrap: wrap;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      .nav-section {
        flex-direction: column;
        align-items: flex-start;
        margin-left: 8px;
      }
      
      mat-toolbar-row {
        flex-direction: column;
        align-items: flex-start;
        padding: 8px 16px;
      }
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

  navigateToPositions(): void {
    this.router.navigate(['/positions']);
  }
}