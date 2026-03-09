import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeList from '../EmployeeList';
import { renderWithProviders } from '../../test/testUtils';
import {
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE,
} from '../../test/fixtures/employeeFixtures';

/**
 * Mock del hook useEmployee que retorna los datos y funciones de mutación.
 * Permite controlar el estado de carga, error y datos de empleados.
 */
const mockDeleteMutateAsync = jest.fn();
const mockRefetch = jest.fn();

jest.mock('../../hooks/useEmployee', () => ({
  useEmployees: jest.fn(),
  useDeleteEmployee: jest.fn(() => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  })),
}));

const { useEmployees } = jest.requireMock(
  '../../hooks/useEmployee'
) as {
  useEmployees: jest.Mock;
};

describe('EmployeeList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Estado por defecto: cargado con datos
    useEmployees.mockReturnValue({
      data: MOCK_EMPLOYEES,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  describe('Renderizado inicial', () => {
    it('debe mostrar el spinner de carga mientras se obtienen los datos', () => {
      useEmployees.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EmployeeList />);

      expect(screen.getByText('Cargando empleados...')).toBeInTheDocument();
    });

    it('debe mostrar el título y el conteo de empleados después de cargar', () => {
      renderWithProviders(<EmployeeList />);

      expect(
        screen.getByText('Gestión de Empleados')
      ).toBeInTheDocument();
      expect(screen.getByText('3 empleados total')).toBeInTheDocument();
    });

    it('debe mostrar texto en singular cuando hay un solo empleado', () => {
      useEmployees.mockReturnValue({
        data: [MOCK_EMPLOYEE],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EmployeeList />);

      expect(screen.getByText('1 empleado total')).toBeInTheDocument();
    });

    it('debe mostrar todos los empleados en la tabla', () => {
      renderWithProviders(<EmployeeList />);

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('Carlos López')).toBeInTheDocument();
    });

    it('debe mostrar las iniciales del empleado en el avatar', () => {
      renderWithProviders(<EmployeeList />);

      // Juan Pérez → JP
      expect(screen.getByText('JP')).toBeInTheDocument();
      // María García → MG
      expect(screen.getByText('MG')).toBeInTheDocument();
    });

    it('debe mostrar los encabezados de la tabla correctamente', () => {
      renderWithProviders(<EmployeeList />);

      expect(screen.getByText('Empleado')).toBeInTheDocument();
      expect(screen.getByText('Cargo')).toBeInTheDocument();
      expect(screen.getByText('Salario')).toBeInTheDocument();
      expect(
        screen.getByText('Fecha de Contratación')
      ).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('debe mostrar el enlace para agregar empleado', () => {
      renderWithProviders(<EmployeeList />);

      const addLink = screen.getByText('Agregar Empleado');
      expect(addLink).toBeInTheDocument();
      expect(addLink.closest('a')).toHaveAttribute(
        'href',
        '/employees/create'
      );
    });
  });

  describe('Estado de error', () => {
    it('debe mostrar mensaje de error cuando falla la carga', () => {
      useEmployees.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Error de conexión'),
        refetch: mockRefetch,
      });

      renderWithProviders(<EmployeeList />);

      expect(
        screen.getByText('Error al cargar empleados')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Error de conexión')
      ).toBeInTheDocument();
    });

    it('debe mostrar mensaje genérico cuando el error no es una instancia de Error', () => {
      useEmployees.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: 'algo salió mal',
        refetch: mockRefetch,
      });

      renderWithProviders(<EmployeeList />);

      expect(
        screen.getByText('Ocurrió un error inesperado')
      ).toBeInTheDocument();
    });

    it('debe llamar a refetch al hacer clic en "Intentar de nuevo"', async () => {
      const user = userEvent.setup();
      useEmployees.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Error'),
        refetch: mockRefetch,
      });

      renderWithProviders(<EmployeeList />);

      await user.click(screen.getByText('Intentar de nuevo'));

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Estado vacío', () => {
    it('debe mostrar mensaje vacío cuando no hay empleados', () => {
      useEmployees.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EmployeeList />);

      expect(
        screen.getByText('Aún no hay empleados')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Comience agregando su primer empleado.')
      ).toBeInTheDocument();
    });

    it('debe mostrar enlace para agregar primer empleado cuando la lista está vacía', () => {
      useEmployees.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EmployeeList />);

      const addFirstLink = screen.getByText('Agregar Primer Empleado');
      expect(addFirstLink).toBeInTheDocument();
    });
  });

  describe('Búsqueda y filtrado', () => {
    it('debe filtrar empleados por nombre al escribir en el campo de búsqueda', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeList />);

      const searchInput = screen.getByPlaceholderText(
        'Buscar empleados...'
      );
      await user.type(searchInput, 'Juan');

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(
        screen.queryByText('María García')
      ).not.toBeInTheDocument();
    });

    it('debe filtrar empleados por correo electrónico', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeList />);

      const searchInput = screen.getByPlaceholderText(
        'Buscar empleados...'
      );
      await user.type(searchInput, 'maria.garcia');

      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(
        screen.queryByText('Juan Pérez')
      ).not.toBeInTheDocument();
    });

    it('debe filtrar empleados por cargo', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeList />);

      const searchInput = screen.getByPlaceholderText(
        'Buscar empleados...'
      );
      await user.type(searchInput, 'Diseñadora');

      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(
        screen.queryByText('Juan Pérez')
      ).not.toBeInTheDocument();
    });

    it('debe mostrar mensaje cuando no se encuentran resultados de búsqueda', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeList />);

      const searchInput = screen.getByPlaceholderText(
        'Buscar empleados...'
      );
      await user.type(searchInput, 'zzzzz');

      expect(
        screen.getByText('No se encontraron empleados')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Intente ajustar sus criterios de búsqueda.')
      ).toBeInTheDocument();
    });

    it('debe ser case-insensitive al buscar', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeList />);

      const searchInput = screen.getByPlaceholderText(
        'Buscar empleados...'
      );
      await user.type(searchInput, 'juan');

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });

  describe('Acciones sobre empleados', () => {
    it('debe tener enlaces de Ver, Editar y Eliminar para cada empleado', () => {
      renderWithProviders(<EmployeeList />);

      const viewLinks = screen.getAllByText('Ver');
      expect(viewLinks).toHaveLength(3);

      const editLinks = screen.getAllByText('Editar');
      expect(editLinks).toHaveLength(3);

      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons).toHaveLength(3);
    });

    it('debe mostrar confirmación al intentar eliminar un empleado', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(false);

      renderWithProviders(<EmployeeList />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[0]!);

      expect(confirmSpy).toHaveBeenCalledWith(
        '¿Está seguro de que desea eliminar a Juan Pérez?'
      );

      confirmSpy.mockRestore();
    });

    it('debe eliminar el empleado cuando se confirma la acción', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(true);
      mockDeleteMutateAsync.mockResolvedValueOnce(undefined);

      renderWithProviders(<EmployeeList />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[0]!);

      expect(mockDeleteMutateAsync).toHaveBeenCalledWith(1);

      confirmSpy.mockRestore();
    });

    it('no debe eliminar cuando se cancela la confirmación', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(false);

      renderWithProviders(<EmployeeList />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[0]!);

      expect(mockDeleteMutateAsync).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('debe mostrar alerta cuando la eliminación falla', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest
        .spyOn(window, 'confirm')
        .mockReturnValue(true);
      const alertSpy = jest
        .spyOn(window, 'alert')
        .mockImplementation(() => {});
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockDeleteMutateAsync.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      renderWithProviders(<EmployeeList />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Error al eliminar empleado. Por favor, inténtelo de nuevo.'
        );
      });

      confirmSpy.mockRestore();
      alertSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Formato de datos', () => {
    it('debe formatear el salario como moneda USD', () => {
      renderWithProviders(<EmployeeList />);

      expect(screen.getByText('$75,000')).toBeInTheDocument();
      expect(screen.getByText('$65,000')).toBeInTheDocument();
    });

    it('debe mostrar los enlaces de correo electrónico correctamente', () => {
      renderWithProviders(<EmployeeList />);

      const emailLink = screen.getByText('juan.perez@example.com');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.closest('a')).toHaveAttribute(
        'href',
        'mailto:juan.perez@example.com'
      );
    });
  });
});
