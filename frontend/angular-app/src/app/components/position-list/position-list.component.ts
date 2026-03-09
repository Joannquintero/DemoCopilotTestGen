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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { PositionService } from '../../services/position.service';
import { Position } from '../../models/position.model';

@Component({
  selector: 'app-position-list',
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
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <div class="position-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-actions">
              <h2>Position Management</h2>
              <div class="actions">
                <div class="filters-container">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Search positions...</mat-label>
                    <input matInput 
                           [(ngModel)]="searchTerm" 
                           (input)="onSearchChange()"
                           placeholder="Search by name or department">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Department</mat-label>
                    <mat-select [(ngModel)]="selectedDepartment" (selectionChange)="onFilterChange()">
                      <mat-option value="">All departments</mat-option>
                      <mat-option *ngFor="let dept of getDepartments()" [value]="dept">{{dept}}</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-slide-toggle 
                    [(ngModel)]="activeOnly" 
                    (change)="onFilterChange()"
                    class="toggle-active">
                    Active only
                  </mat-slide-toggle>

                  <button 
                    mat-stroked-button 
                    (click)="clearFilters()" 
                    class="clear-filters-btn"
                    *ngIf="searchTerm || selectedDepartment || !activeOnly">
                    <mat-icon>clear</mat-icon>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="loading-container" *ngIf="positionService.loading()">
            <mat-spinner></mat-spinner>
            <p>Loading positions...</p>
          </div>

          <div class="error-container" *ngIf="positionService.error()">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ positionService.error() }}</p>
            <button mat-raised-button color="primary" (click)="refreshPositions()">
              Try again
            </button>
          </div>

          <div class="table-container" *ngIf="!positionService.loading() && !positionService.error()">
            <table mat-table [dataSource]="filteredPositions()" class="positions-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Position Name</th>
                <td mat-cell *matCellDef="let position">
                  <div class="position-info">
                    <strong>{{ position.name }}</strong>
                    <span 
                      class="status-chip"
                      [class.status-active]="position.isActive"
                      [class.status-inactive]="!position.isActive">
                      {{ position.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let position">
                  <div class="description-cell" [title]="position.description">
                    {{ position.description | slice:0:80 }}
                    <span *ngIf="position.description && position.description.length > 80">...</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef>Department</th>
                <td mat-cell *matCellDef="let position">
                  <span class="department-chip">
                    {{ position.department }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="salaryRange">
                <th mat-header-cell *matHeaderCellDef>Salary Range</th>
                <td mat-cell *matCellDef="let position">
                  <div class="salary-range">
                    <small>Min:</small> {{ position.minSalary | currency:'USD':'symbol':'1.0-0' }}
                    <br>
                    <small>Max:</small> {{ position.maxSalary | currency:'USD':'symbol':'1.0-0' }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="createdDate">
                <th mat-header-cell *matHeaderCellDef>Created Date</th>
                <td mat-cell *matCellDef="let position">
                  {{ position.createdAt | date:'shortDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let position">
                  <div class="action-buttons">
                    <button 
                      mat-icon-button 
                      color="primary"
                      (click)="viewPosition(position.id)"
                      matTooltip="View Details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="accent"
                      (click)="editPosition(position.id)"
                      matTooltip="Edit Position">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      [color]="position.isActive ? 'warn' : 'primary'"
                      (click)="toggleActivePosition(position)"
                      [matTooltip]="position.isActive ? 'Deactivate Position' : 'Activate Position'">
                      <mat-icon>{{ position.isActive ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="warn"
                      (click)="confirmDelete(position)"
                      matTooltip="Delete Position">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div class="no-data" *ngIf="filteredPositions().length === 0">
              <mat-icon>work_outline</mat-icon>
              <h3>No positions found</h3>
              <p *ngIf="searchTerm || selectedDepartment || !activeOnly">Try adjusting your search criteria.</p>
              <p *ngIf="!searchTerm && !selectedDepartment && activeOnly">Start by adding your first position.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .position-list-container {
      max-width: 1400px;
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

    .filters-container {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-field {
      width: 300px;
    }

    .filter-field {
      width: 200px;
    }

    .toggle-active {
      margin-top: 8px;
    }

    .clear-filters-btn {
      margin-top: 8px;
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

    .positions-table {
      width: 100%;
      margin-top: 20px;
    }

    .position-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-chip {
      font-size: 11px;
      min-height: 20px;
      line-height: 20px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
      text-align: center;
      display: inline-block;
    }

    .status-active {
      background-color: #4caf50;
      color: white;
    }

    .status-inactive {
      background-color: #f44336;
      color: white;
    }

    .department-chip {
      font-size: 12px;
      background-color: #ff9800;
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      display: inline-block;
    }

    .description-cell {
      max-width: 200px;
      line-height: 1.4;
    }

    .salary-range {
      font-size: 13px;
      line-height: 1.3;
    }

    .salary-range small {
      color: #666;
      font-size: 11px;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
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

      .filters-container {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .filter-field {
        width: 100%;
      }
    }
  `]
})
export class PositionListComponent implements OnInit {
  protected readonly positionService = inject(PositionService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  private _searchTerm = signal('');
  private _selectedDepartment = signal('');
  private _activeOnly = signal(true);

  get searchTerm() { return this._searchTerm(); }
  set searchTerm(value: string) { this._searchTerm.set(value); }

  get selectedDepartment() { return this._selectedDepartment(); }
  set selectedDepartment(value: string) { this._selectedDepartment.set(value); }

  get activeOnly() { return this._activeOnly(); }
  set activeOnly(value: boolean) { this._activeOnly.set(value); }

  displayedColumns: string[] = ['name', 'description', 'department', 'salaryRange', 'createdDate', 'actions'];

  // Lista de departamentos únicos para el filtro
  departments = computed(() => {
    const positions = this.positionService.positions();
    const deptSet = new Set(positions.map(position => position.department));
    return Array.from(deptSet).sort();
  });

  filteredPositions = computed(() => {
    const positions = this.positionService.positions();
    
    return positions.filter(position => {
      // Filter by search term
      const searchValue = this._searchTerm();
      const matchesSearch = !searchValue || 
        position.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        position.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        position.department.toLowerCase().includes(searchValue.toLowerCase());
      
      // Filter by department
      const deptValue = this._selectedDepartment();
      const matchesDepartment = !deptValue || 
        position.department === deptValue;
      
      // Filter by active status
      const activeValue = this._activeOnly();
      const matchesActive = !activeValue || position.isActive;
      
      return matchesSearch && matchesDepartment && matchesActive;
    });
  });

  ngOnInit(): void {
    this.loadPositions();
  }

  loadPositions(): void {
    this.positionService.getPositions().subscribe();
  }

  refreshPositions(): void {
    this.positionService.refreshPositions();
  }

  onSearchChange(): void {
    // The computed signal will automatically update the filtered results
  }

  onFilterChange(): void {
    // The computed signal will automatically update the filtered results
  }

  clearFilters(): void {
    this._searchTerm.set('');
    this._selectedDepartment.set('');
    this._activeOnly.set(true);
  }

  getDepartments(): string[] {
    return this.departments();
  }

  viewPosition(id: number): void {
    // Temporarily show message until details component is created
    this.snackBar.open(`Position details for ID ${id} will be available soon`, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  editPosition(id: number): void {
    // Temporarily show message until form component is created
    this.snackBar.open(`Position editing for ID ${id} will be available soon`, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  toggleActivePosition(position: Position): void {
    const updatedPosition = {
      id: position.id,
      isActive: !position.isActive
    };

    this.positionService.updatePosition(updatedPosition).subscribe({
      next: () => {
        const action = position.isActive ? 'deactivated' : 'activated';
        this.snackBar.open(`Position ${action} successfully`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        this.snackBar.open('Error updating position status', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  confirmDelete(position: Position): void {
    if (confirm(`Are you sure you want to delete the position "${position.name}"?`)) {
      this.deletePosition(position.id);
    }
  }

  private deletePosition(id: number): void {
    this.positionService.deletePosition(id).subscribe({
      next: () => {
        this.snackBar.open('Position deleted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        this.snackBar.open('Error deleting position', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}