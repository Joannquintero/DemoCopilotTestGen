import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeForm from '../EmployeeForm';
import { renderWithProviders } from '../../test/testUtils';
import { MOCK_EMPLOYEE } from '../../test/fixtures/employeeFixtures';

/**
 * Mock de react-router-dom para controlar parámetros de URL y navegación.
 */
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

/**
 * Mocks de los hooks de mutación para crear y actualizar empleados.
 */
const mockCreateMutateAsync = jest.fn();
const mockUpdateMutateAsync = jest.fn();

jest.mock('../../hooks/useEmployee', () => ({
  useEmployee: jest.fn(),
  useCreateEmployee: jest.fn(() => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  })),
  useUpdateEmployee: jest.fn(() => ({
    mutateAsync: mockUpdateMutateAsync,
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

describe('EmployeeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Modo creación por defecto (sin ID en la URL)
    useParams.mockReturnValue({ id: undefined });
    useEmployee.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  describe('Modo creación', () => {
    it('debe mostrar el título "Agregar Nuevo Empleado"', () => {
      renderWithProviders(<EmployeeForm />);

      expect(
        screen.getByText('Agregar Nuevo Empleado')
      ).toBeInTheDocument();
    });

    it('debe mostrar el botón "Crear Empleado"', () => {
      renderWithProviders(<EmployeeForm />);

      expect(
        screen.getByText('Crear Empleado')
      ).toBeInTheDocument();
    });

    it('debe renderizar todos los campos del formulario vacíos', () => {
      renderWithProviders(<EmployeeForm />);

      expect(screen.getByLabelText(/Nombre/)).toHaveValue('');
      expect(screen.getByLabelText(/Apellido/)).toHaveValue('');
      expect(
        screen.getByLabelText(/Correo Electrónico/)
      ).toHaveValue('');
      expect(screen.getByLabelText(/Cargo/)).toHaveValue('');
    });

    it('debe tener los placeholders correctos en español', () => {
      renderWithProviders(<EmployeeForm />);

      expect(
        screen.getByPlaceholderText('Ingrese el nombre')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Ingrese el apellido')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Ingrese el correo electrónico')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Ingrese el cargo')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Ingrese el salario')
      ).toBeInTheDocument();
    });

    it('debe crear un empleado y navegar al listado al enviar datos válidos', async () => {
      const user = userEvent.setup();
      mockCreateMutateAsync.mockResolvedValueOnce(MOCK_EMPLOYEE);

      renderWithProviders(<EmployeeForm />);

      await user.type(
        screen.getByPlaceholderText('Ingrese el nombre'),
        'Juan'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el apellido'),
        'Pérez'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el correo electrónico'),
        'juan@example.com'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el cargo'),
        'Developer'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el salario'),
        '75000'
      );

      // Fecha de contratación
      const hireDateInput = screen.getByLabelText(/Fecha de Contratación/);
      await user.type(hireDateInput, '2024-01-15');

      // Enviar el formulario
      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/employees');
      });
    });
  });

  describe('Validaciones del formulario', () => {
    it('debe mostrar error de validación cuando el nombre está vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeForm />);

      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(
          screen.getByText('El nombre es obligatorio')
        ).toBeInTheDocument();
      });
    });

    it('debe mostrar error de validación cuando el apellido está vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeForm />);

      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(
          screen.getByText('El apellido es obligatorio')
        ).toBeInTheDocument();
      });
    });

    it('debe mostrar error de validación cuando el email está vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeForm />);

      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(
          screen.getByText('El correo electrónico es obligatorio')
        ).toBeInTheDocument();
      });
    });

    it('debe mostrar error de validación cuando el cargo está vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeForm />);

      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(
          screen.getByText('El cargo es obligatorio')
        ).toBeInTheDocument();
      });
    });

    it('debe mostrar error de validación cuando el salario está vacío', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeForm />);

      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(
          screen.getByText('El salario es obligatorio')
        ).toBeInTheDocument();
      });
    });

    it('debe mostrar error de validación cuando la fecha está vacía', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeForm />);

      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(
          screen.getByText('La fecha de contratación es obligatoria')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Modo edición', () => {
    beforeEach(() => {
      useParams.mockReturnValue({ id: '1' });
      useEmployee.mockReturnValue({
        data: MOCK_EMPLOYEE,
        isLoading: false,
      });
    });

    it('debe mostrar el título "Editar Empleado"', () => {
      renderWithProviders(<EmployeeForm />);

      expect(
        screen.getByText('Editar Empleado')
      ).toBeInTheDocument();
    });

    it('debe mostrar el botón "Actualizar Empleado"', () => {
      renderWithProviders(<EmployeeForm />);

      expect(
        screen.getByText('Actualizar Empleado')
      ).toBeInTheDocument();
    });

    it('debe mostrar el spinner mientras carga el empleado para editar', () => {
      useEmployee.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderWithProviders(<EmployeeForm />);

      expect(
        screen.getByText('Cargando datos del empleado...')
      ).toBeInTheDocument();
    });

    it('debe llamar a updateEmployee al enviar el formulario en modo edición', async () => {
      const user = userEvent.setup();
      mockUpdateMutateAsync.mockResolvedValueOnce({
        ...MOCK_EMPLOYEE,
        firstName: 'Juan Carlos',
      });

      renderWithProviders(<EmployeeForm />);

      // Modificar el nombre
      const firstNameInput = screen.getByPlaceholderText(
        'Ingrese el nombre'
      );
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Juan Carlos');

      await user.click(screen.getByText('Actualizar Empleado'));

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            employee: expect.objectContaining({
              firstName: 'Juan Carlos',
            }),
          })
        );
      });
    });
  });

  describe('Navegación', () => {
    it('debe navegar al listado al hacer clic en Cancelar', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EmployeeForm />);

      await user.click(screen.getByText('Cancelar'));

      expect(mockNavigate).toHaveBeenCalledWith('/employees');
    });
  });

  describe('Manejo de errores al guardar', () => {
    it('debe manejar errores de mutación sin crash', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockCreateMutateAsync.mockRejectedValueOnce(
        new Error('Server error')
      );

      renderWithProviders(<EmployeeForm />);

      await user.type(
        screen.getByPlaceholderText('Ingrese el nombre'),
        'Ana'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el apellido'),
        'López'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el correo electrónico'),
        'ana@test.com'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el cargo'),
        'QA'
      );
      await user.type(
        screen.getByPlaceholderText('Ingrese el salario'),
        '50000'
      );

      const hireDateInput = screen.getByLabelText(/Fecha de Contratación/);
      await user.type(hireDateInput, '2024-01-01');

      await user.click(screen.getByText('Crear Empleado'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error saving employee:',
          expect.any(Error)
        );
      });

      // No debe navegar cuando hay error
      expect(mockNavigate).not.toHaveBeenCalledWith('/employees');

      consoleSpy.mockRestore();
    });
  });
});
