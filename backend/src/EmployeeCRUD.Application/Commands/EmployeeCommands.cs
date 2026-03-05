using MediatR;
using EmployeeCRUD.Application.DTOs;

namespace EmployeeCRUD.Application.Commands;

public record CreateEmployeeCommand(CreateEmployeeDto Employee) : IRequest<EmployeeDto>;

public record UpdateEmployeeCommand(int Id, UpdateEmployeeDto Employee) : IRequest<EmployeeDto?>;

public record DeleteEmployeeCommand(int Id) : IRequest<bool>;