using MediatR;
using EmployeeCRUD.Application.DTOs;

namespace EmployeeCRUD.Application.Queries;

public record GetAllEmployeesQuery() : IRequest<IEnumerable<EmployeeDto>>;

public record GetEmployeeByIdQuery(int Id) : IRequest<EmployeeDto?>;

public record GetEmployeeByEmailQuery(string Email) : IRequest<EmployeeDto?>;

public record GetEmployeesByPositionQuery(string Position) : IRequest<IEnumerable<EmployeeDto>>;

public record GetPaginatedEmployeesQuery(int Page, int PageSize) : IRequest<PaginatedResult<EmployeeDto>>;

public record GetEmployeeCountQuery() : IRequest<int>;

public record PaginatedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize, int TotalPages);