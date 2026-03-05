using AutoMapper;
using MediatR;
using FluentValidation;
using EmployeeCRUD.Application.Commands;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Domain.Entities;
using EmployeeCRUD.Domain.Interfaces;

namespace EmployeeCRUD.Application.Handlers;

public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _repository;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateEmployeeDto> _validator;

    public CreateEmployeeCommandHandler(
        IEmployeeRepository repository,
        IMapper mapper,
        IValidator<CreateEmployeeDto> validator)
    {
        _repository = repository;
        _mapper = mapper;
        _validator = validator;
    }

    public async Task<EmployeeDto> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        // Validate the request
        var validationResult = await _validator.ValidateAsync(request.Employee, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Check if email already exists
        var existingEmployee = await _repository.GetByEmailAsync(request.Employee.Email);
        if (existingEmployee != null)
        {
            throw new ArgumentException("Employee with this email already exists");
        }

        // Map and create employee
        var employee = _mapper.Map<Employee>(request.Employee);
        var createdEmployee = await _repository.CreateAsync(employee);

        return _mapper.Map<EmployeeDto>(createdEmployee);
    }
}

public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, EmployeeDto?>
{
    private readonly IEmployeeRepository _repository;
    private readonly IMapper _mapper;
    private readonly IValidator<UpdateEmployeeDto> _validator;

    public UpdateEmployeeCommandHandler(
        IEmployeeRepository repository,
        IMapper mapper,
        IValidator<UpdateEmployeeDto> validator)
    {
        _repository = repository;
        _mapper = mapper;
        _validator = validator;
    }

    public async Task<EmployeeDto?> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        // Validate the request
        var validationResult = await _validator.ValidateAsync(request.Employee, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Check if employee exists
        var existingEmployee = await _repository.GetByIdAsync(request.Id);
        if (existingEmployee == null)
        {
            return null;
        }

        // Check if email is taken by another employee
        var employeeWithEmail = await _repository.GetByEmailAsync(request.Employee.Email);
        if (employeeWithEmail != null && employeeWithEmail.Id != request.Id)
        {
            throw new ArgumentException("Another employee with this email already exists");
        }

        // Map updated data to existing employee
        _mapper.Map(request.Employee, existingEmployee);
        existingEmployee.Id = request.Id; // Ensure ID remains unchanged

        var updatedEmployee = await _repository.UpdateAsync(existingEmployee);
        return _mapper.Map<EmployeeDto>(updatedEmployee);
    }
}

public class DeleteEmployeeCommandHandler : IRequestHandler<DeleteEmployeeCommand, bool>
{
    private readonly IEmployeeRepository _repository;

    public DeleteEmployeeCommandHandler(IEmployeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
    {
        return await _repository.DeleteAsync(request.Id);
    }
}