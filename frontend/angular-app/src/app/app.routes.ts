import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/employees', pathMatch: 'full' },
  {
    path: 'employees',
    loadComponent: () => import('./components/employee-list/employee-list.component').then(c => c.EmployeeListComponent)
  },
  {
    path: 'employees/create',
    loadComponent: () => import('./components/employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
  },
  {
    path: 'employees/:id/edit',
    loadComponent: () => import('./components/employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
  },
  {
    path: 'employees/:id',
    loadComponent: () => import('./components/employee-details/employee-details.component').then(c => c.EmployeeDetailsComponent)
  },
  {
    path: 'positions',
    loadComponent: () => import('./components/position-list/position-list.component').then(c => c.PositionListComponent)
  },
  // Temporarily commented out until these components are created
  // {
  //   path: 'positions/create',
  //   loadComponent: () => import('./components/position-form/position-form.component').then(c => c.PositionFormComponent)
  // },
  // {
  //   path: 'positions/:id/edit',
  //   loadComponent: () => import('./components/position-form/position-form.component').then(c => c.PositionFormComponent)
  // },
  // {
  //   path: 'positions/:id',
  //   loadComponent: () => import('./components/position-details/position-details.component').then(c => c.PositionDetailsComponent)
  // },
  { path: '**', redirectTo: '/employees' }
];