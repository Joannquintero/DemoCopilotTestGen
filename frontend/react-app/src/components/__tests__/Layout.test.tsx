import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from '../Layout';
import { renderWithProviders } from '../../test/testUtils';

/**
 * Mock de useNavigate para verificar la navegación programática.
 */
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado de estructura', () => {
    it('debe renderizar la barra de navegación', () => {
      renderWithProviders(
        <Layout>
          <div>Contenido de prueba</div>
        </Layout>
      );

      expect(
        screen.getByText('Employee Management System')
      ).toBeInTheDocument();
    });

    it('debe renderizar el contenido hijo dentro del main', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="test-content">Contenido hijo</div>
        </Layout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Contenido hijo')).toBeInTheDocument();
    });

    it('debe renderizar el pie de página con el texto de copyright', () => {
      renderWithProviders(
        <Layout>
          <div>Contenido</div>
        </Layout>
      );

      expect(
        screen.getByText(/2026 Employee Management System/)
      ).toBeInTheDocument();
    });

    it('debe tener el enlace del logo que apunta a la raíz', () => {
      renderWithProviders(
        <Layout>
          <div>Contenido</div>
        </Layout>
      );

      const logoLink = screen.getByText('Employee Management System');
      expect(logoLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('Botones de navegación', () => {
    it('debe tener el botón "Employees" en la barra de navegación', () => {
      renderWithProviders(
        <Layout>
          <div>Contenido</div>
        </Layout>
      );

      expect(screen.getByText('Employees')).toBeInTheDocument();
    });

    it('debe tener el botón "Add Employee" en la barra de navegación', () => {
      renderWithProviders(
        <Layout>
          <div>Contenido</div>
        </Layout>
      );

      expect(screen.getByText('Add Employee')).toBeInTheDocument();
    });

    it('debe navegar a /employees al hacer clic en "Employees"', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Layout>
          <div>Contenido</div>
        </Layout>
      );

      await user.click(screen.getByText('Employees'));

      expect(mockNavigate).toHaveBeenCalledWith('/employees');
    });

    it('debe navegar a /employees/create al hacer clic en "Add Employee"', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Layout>
          <div>Contenido</div>
        </Layout>
      );

      await user.click(screen.getByText('Add Employee'));

      expect(mockNavigate).toHaveBeenCalledWith('/employees/create');
    });
  });

  describe('Múltiples hijos', () => {
    it('debe renderizar múltiples elementos hijos correctamente', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="child-1">Hijo 1</div>
          <div data-testid="child-2">Hijo 2</div>
        </Layout>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });
});
