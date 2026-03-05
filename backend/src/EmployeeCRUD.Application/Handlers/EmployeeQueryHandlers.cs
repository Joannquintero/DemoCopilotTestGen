using AutoMapper;
using MediatR;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Application.Queries;
using EmployeeCRUD.Domain.Interfaces;

namespace EmployeeCRUD.Application.Handlers;

public class GetAllEmployeesQueryHandler : IRequestHandler<GetAllEmployeesQuery, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _repository;
    private readonly IMapper _mapper;

    public GetAllEmployeesQueryHandler(IEmployeeRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(GetAllEmployeesQuery request, CancellationToken cancellationToken)
    {
        var employees = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<EmployeeDto>>(employees);
    }
}

public class GetEmployeeByIdQueryHandler : IRequestHandler<GetEmployeeByIdQuery, EmployeeDto?>
{
    private readonly IEmployeeRepository _repository;
    private readonly IMapper _mapper;

    public GetEmployeeByIdQueryHandler(IEmployeeRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<EmployeeDto?> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
    {
        var employee = await _repository.GetByIdAsync(request.Id);
        return employee == null ? null : _mapper.Map<EmployeeDto>(employee);
    }
}

public class GetEmployeesByPositionQueryHandler : IRequestHandler<GetEmployeesByPositionQuery, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _repository;
    private readonly IMapper _mapper;

    public GetEmployeesByPositionQueryHandler(IEmployeeRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(GetEmployeesByPositionQuery request, CancellationToken cancellationToken)
    {
        var employees = await _repository.GetByPositionAsync(request.Position);
        return _mapper.Map<IEnumerable<EmployeeDto>>(employees);
    }
}

public class GetPaginatedEmployeesQueryHandler : IRequestHandler<GetPaginatedEmployeesQuery, PaginatedResult<EmployeeDto>>
{
    private readonly IEmployeeRepository _repository;
    private readonly IMapper _mapper;

    public GetPaginatedEmployeesQueryHandler(IEmployeeRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<EmployeeDto>> Handle(GetPaginatedEmployeesQuery request, CancellationToken cancellationToken)
    {
        var employees = await _repository.GetPaginatedAsync(request.Page, request.PageSize);
        var totalCount = await _repository.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var employeeDtos = _mapper.Map<IEnumerable<EmployeeDto>>(employees);

        return new PaginatedResult<EmployeeDto>(employeeDtos, totalCount, request.Page, request.PageSize, totalPages);
    }
}

public class GetEmployeeCountQueryHandler : IRequestHandler<GetEmployeeCountQuery, int>
{
    private readonly IEmployeeRepository _repository;

    public GetEmployeeCountQueryHandler(IEmployeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<int> Handle(GetEmployeeCountQuery request, CancellationToken cancellationToken)
    {
        return await _repository.CountAsync();
    }
}