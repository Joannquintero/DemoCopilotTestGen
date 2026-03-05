import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEmployee, useDeleteEmployee } from '../hooks/useEmployee';

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = id ? parseInt(id, 10) : 0;

  const { data: employee, isLoading, error } = useEmployee(employeeId);
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este empleado?')) {
      try {
        await deleteEmployee.mutateAsync(employeeId);
        navigate('/employees');
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar empleado</h3>
              <div className="mt-2 text-sm text-red-700">
                No se pudo encontrar el empleado o hubo un error al cargar los datos.
              </div>
              <div className="mt-3">
                <Link
                  to="/employees"
                  className="text-sm font-medium text-red-800 underline hover:text-red-600"
                >
                  Volver a la lista de empleados
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Empleado no encontrado</h2>
          <Link
            to="/employees"
            className="text-blue-600 hover:text-blue-500"
          >
            Volver a la lista de empleados
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.fullName || `${employee.firstName} ${employee.lastName}`}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{employee.position}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/employees/${employee.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteEmployee.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleteEmployee.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Nombre</dt>
              <dd className="text-sm text-gray-900">{employee.firstName}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Apellido</dt>
              <dd className="text-sm text-gray-900">{employee.lastName}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Correo Electrónico</dt>
              <dd className="text-sm text-gray-900">
                <a
                  href={`mailto:${employee.email}`}
                  className="text-blue-600 hover:text-blue-500"
                >
                  {employee.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Cargo</dt>
              <dd className="text-sm text-gray-900">{employee.position}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Salario</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(employee.salary)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Fecha de Contratación</dt>
              <dd className="text-sm text-gray-900">{formatDate(employee.hireDate)}</dd>
            </div>

            {employee.createdAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Creado</dt>
                <dd className="text-sm text-gray-900">{formatDate(employee.createdAt)}</dd>
              </div>
            )}

            {employee.updatedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Última Actualización</dt>
                <dd className="text-sm text-gray-900">{formatDate(employee.updatedAt)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              to="/employees"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a la lista de empleados
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;