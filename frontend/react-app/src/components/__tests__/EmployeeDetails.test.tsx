import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeDetails from '../EmployeeDetails';
import { renderWithProviders } from '../../test/testUtils';
import { MOCK_EMPLOYEE } from '../../test/fixtures/employeeFixtures';

/**
 * Mock de react-router-dom para controlar los parámetros de URL y la navegación.
 */
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

/**
 * Mock de los hooks de empleados para aislar el componente de la capa de datos.
 */
const mockDeleteMutateAsync = jest.fn();

jest.mock('../../hooks/useEmployee', () => ({
  useEmployee: jest.fn(),
  useDeleteEmployee: jest.fn(() => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  })),
}));

const { useParams } = jest.requireMock('react-router-dom') as {
  useParams: jest.Mock;
};
const { useEmployee } = jest.requireMock(
  '../../hooks/useEmployee'
) as {
  useEmployee: jest.Mock;
};

describe('EmployeeDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ id: '1' });
    useEmployee.mockReturnValue({
      data: MOCK_EMPLOYEE,
      isLoading: false,
      error: null,
    });
  });

  describe('Renderizado exitoso', () => {
    it('debe mostrar el nombre completo del empleado', () => {
      renderWithProviders(<EmployeeDetails />);

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    it('debe mostrar todos los campos del empleado', () => {
      renderWithProviders(<EmployeeDetails />);

      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Juan')).toBeInTheDocument();
      expect(screen.getByText('Apellido')).toBeInTheDocument();
      expect(screen.getByText('Pérez')).toBeInTheDocument();
      expect(
        screen.getByText('Correo Electrónico')
      ).toBeInTheDocument();
      expect(
        screen.getByText('juan.perez@example.com')
      ).toBeInTheDocument();
      expect(screen.getByText('Cargo')).toBeInTheDocument();
      // 'Desarrollador Senior' aparece tanto en el header como en la sección de detalles
      const positionElements = screen.getAllByText('Desarrollador Senior');
      expect(positionElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Salario')).toBeInTheDocument();
    });

    it('debe mostrar el enlace de correo electrónico con mailto', () => {
      renderWithProviders(<EmployeeDetails />);

      const emailLink = screen.getByText('juan.perez@example.com');
      expect(emailLink.closest('a')).toHaveAttribute(
        'href',
        'mailto:juan.perez@example.com'
      );
    });

    it('debe mostrar el cargo debajo del nombre en el encabezado', () => {
      renderWithProviders(<EmployeeDetails />);

      const positionElements = screen.getAllByText('Desarrollador Senior');
      expect(positionElements.length).toBeGreaterThanOrEqual(1);
    });

    it('debe mostrar las fechas de creación y actualización cuando existen', () => {
      renderWithProviders(<EmployeeDetails />);

      expect(screen.getByText('Creado')).toBeInTheDocument();
      expect(
        screen.getByText('Última Actualización')
      ).toBeInTheDocument();
    });

    it('no debe mostrar "Última Actualización" cuando updatedAt es undefined', () => {
      const employeeWithoutUpdate = {
        ...MOCK_EMPLOYEE,
        updatedAt: undefined,
      };
      useEmployee.mockReturnValue({
        data: employeeWithoutUpdate,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<EmployeeDetails />);

      expect(
        screen.queryByText('Última Actualización')
      ).not.toBeInTheDocument();
    });

    it('debe tener enlace de editar que apunte a la ruta correcta', () => {
      renderWithProviders(<EmployeeDetails />);

      const editLink = screen.getByText('Editar');
      expect(editLink.closest('a')).toHaveAttribute(
        'href',
        '/employees/1/edit'
      );
    });

    it('debe tener enlace para volver a la lista de empleados', () => {
      renderWithProviders(<EmployeeDetails />);

      const backLink = screen.getByText(
        'Volver a la lista de empleados'
      );
      expect(backLink.closest('a')).toHaveAttribute(
        'href',
        '/employees'
      );
    });
  });

  describe('Estado de carga', () => {
    it('debe mostrar el spinner mientras se carga el empleado', () => {
      useEmployee.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { container } = renderWithProviders(<EmployeeDetails />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Estado de error', () => {
    it('debe mostrar mensaje de error cuando falla la carga', () => {
      useEmployee.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Not found'),
      });

      renderWithProviders(<EmployeeDetails />);

      expect(
        screen.getByText('Error al cargar empleado')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'No se pudo encontrar el empleado o hubo un error al cargar los datos.'
        )
      ).toBeInTheDocument();
    });

    it('debe mostrar enlace para volver a la lista en estado de error', () => {
      useEmployee.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Not found'),
      });

      renderWithProviders(<EmployeeDetails />);

      expect(
        screen.getByText('Volver a la lista de empleados')
      ).toBeInTheDocument();
    });
  });

  describe('Empleado no encontrado', () => {
    it('debe mostrar mensaje cuando el empleado no existe', () => {
      useEmployee.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<EmployeeDetails />);

      expect(
        screen.getByText('Empleado no encontrado')
      ).toBeInTheDocument();
    });
  });

  describe('Eliminación de empleado', () => {
    it('debe mostrar confirmación al hacer clic en Eliminar', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(false);

      renderWithProviders(<EmployeeDetails />);

      await user.click(screen.getByText('Eliminar'));

      expect(confirmSpy).toHaveBeenCalledWith(
        '¿Está seguro de que desea eliminar este empleado?'
      );

      confirmSpy.mockRestore();
    });

    it('debe eliminar y navegar a la lista cuando se confirma', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(true);
      mockDeleteMutateAsync.mockResolvedValueOnce(undefined);

      renderWithProviders(<EmployeeDetails />);

      await user.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(mockDeleteMutateAsync).toHaveBeenCalledWith(1);
        expect(mockNavigate).toHaveBeenCalledWith('/employees');
      });

      confirmSpy.mockRestore();
    });

    it('no debe eliminar cuando se cancela la confirmación', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(false);

      renderWithProviders(<EmployeeDetails />);

      await user.click(screen.getByText('Eliminar'));

      expect(mockDeleteMutateAsync).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('debe manejar el error cuando la eliminación falla', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(true);
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockDeleteMutateAsync.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      renderWithProviders(<EmployeeDetails />);

      await user.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      expect(mockNavigate).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Caso extremo: ID no numérico en la URL', () => {
    it('debe manejar un ID no numérico parseándolo a 0', () => {
      useParams.mockReturnValue({ id: 'abc' });
      useEmployee.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<EmployeeDetails />);

      expect(
        screen.getByText('Empleado no encontrado')
      ).toBeInTheDocument();
    });
  });
});
