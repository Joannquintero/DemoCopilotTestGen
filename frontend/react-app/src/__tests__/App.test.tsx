import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import App from '../App';

/**
 * Mocks de los componentes hijos para aislar el test de App.
 * Solo verificamos que App monta el routing y los providers correctamente.
 */
jest.mock('../components/Layout', () => {
  const MockLayout: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => <div data-testid="layout">{children}</div>;
  MockLayout.displayName = 'MockLayout';
  return { __esModule: true, default: MockLayout };
});

jest.mock('../components/EmployeeList', () => {
  const MockList: React.FC = () => (
    <div data-testid="employee-list">Lista de Empleados</div>
  );
  MockList.displayName = 'MockEmployeeList';
  return { __esModule: true, default: MockList };
});

jest.mock('../components/EmployeeForm', () => {
  const MockForm: React.FC = () => (
    <div data-testid="employee-form">Formulario de Empleado</div>
  );
  MockForm.displayName = 'MockEmployeeForm';
  return { __esModule: true, default: MockForm };
});

jest.mock('../components/EmployeeDetails', () => {
  const MockDetails: React.FC = () => (
    <div data-testid="employee-details">Detalles de Empleado</div>
  );
  MockDetails.displayName = 'MockEmployeeDetails';
  return { __esModule: true, default: MockDetails };
});

describe('App', () => {
  it('debe renderizar sin errores', () => {
    render(<App />);

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('debe mostrar la lista de empleados en la ruta raíz', () => {
    render(<App />);

    expect(screen.getByTestId('employee-list')).toBeInTheDocument();
  });

  it('debe envolver todo en el Layout', () => {
    render(<App />);

    const layout = screen.getByTestId('layout');
    expect(layout).toBeInTheDocument();
  });
});
