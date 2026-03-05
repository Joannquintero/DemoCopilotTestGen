import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEmployee, useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployee';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: number;
  hireDate: string;
}

const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(
    id ? parseInt(id, 10) : 0
  );

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<EmployeeFormData>();

  // Set initial values when editing
  React.useEffect(() => {
    if (isEditing && employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        salary: employee.salary,
        hireDate: employee.hireDate.split('T')[0] // Convert to YYYY-MM-DD format
      });
    }
  }, [employee, isEditing, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const employeeData = {
        ...data,
        salary: Number(data.salary),
        hireDate: data.hireDate
      };

      if (isEditing && id) {
        await updateEmployee.mutateAsync({
          id: parseInt(id, 10),
          employee: employeeData
        });
      } else {
        await createEmployee.mutateAsync(employeeData);
      }

      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  if (isEditing && isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando datos del empleado...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName', {
                  required: 'El nombre es obligatorio',
                  maxLength: { value: 50, message: 'El nombre debe tener máximo 50 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName', {
                  required: 'El apellido es obligatorio',
                  maxLength: { value: 50, message: 'El apellido debe tener máximo 50 caracteres' }
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el apellido"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'El correo electrónico es obligatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Dirección de correo electrónico inválida'
                }
              })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el correo electrónico"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
              Cargo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              {...register('position', {
                required: 'El cargo es obligatorio',
                maxLength: { value: 100, message: 'El cargo debe tener máximo 100 caracteres' }
              })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.position ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el cargo"
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                Salario <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="salary"
                min="0"
                step="0.01"
                {...register('salary', {
                  required: 'El salario es obligatorio',
                  min: { value: 0, message: 'El salario debe ser un número positivo' }
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.salary ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el salario"
              />
              {errors.salary && (
                <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Contratación <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="hireDate"
                {...register('hireDate', {
                  required: 'La fecha de contratación es obligatoria'
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.hireDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.hireDate && (
                <p className="mt-1 text-sm text-red-600">{errors.hireDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Empleado' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;