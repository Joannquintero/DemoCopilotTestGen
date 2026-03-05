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
  { path: '**', redirectTo: '/employees' }
];