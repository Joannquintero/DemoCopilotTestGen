import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEmployees, useDeleteEmployee } from '../hooks/useEmployee';
import { Employee } from '../types/employee';

const EmployeeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: employees, isLoading, error, refetch } = useEmployees();
  const deleteEmployee = useDeleteEmployee();

  const filteredEmployees = useMemo(() => {
    if (!employees || !searchTerm) return employees || [];
    
    const term = searchTerm.toLowerCase();
    return employees.filter(employee =>
      employee.fullName.toLowerCase().includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      employee.position.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  const handleDelete = async (employee: Employee) => {
    if (window.confirm(`¿Está seguro de que desea eliminar a ${employee.fullName}?`)) {
      try {
        await deleteEmployee.mutateAsync(employee.id);
        // Success message will be handled by the mutation
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert('Error al eliminar empleado. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Cargando empleados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar empleados</h3>
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
            <p className="text-gray-600 mt-1">
              {employees?.length || 0} empleado{employees?.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <Link
              to="/employees/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Empleado
            </Link>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron empleados' : 'Aún no hay empleados'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Intente ajustar sus criterios de búsqueda.' 
              : 'Comience agregando su primer empleado.'
            }
          </p>
          {!searchTerm && (
            <Link
              to="/employees/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Primer Empleado
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Contratación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            <a href={`mailto:${employee.email}`} className="hover:text-blue-600">
                              {employee.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatSalary(employee.salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(employee.hireDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/employees/${employee.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(employee)}
                          disabled={deleteEmployee.isPending}
                          className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                        >
                          {deleteEmployee.isPending ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;