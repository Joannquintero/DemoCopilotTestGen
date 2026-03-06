using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using Moq;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using EmployeeCRUD.Application.Commands;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Application.Handlers;
using EmployeeCRUD.Domain.Entities;
using EmployeeCRUD.Domain.Interfaces;

namespace EmployeeCRUD.Application.Tests.Handlers;

[TestClass]
public class CreateEmployeeCommandHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private Mock<IMapper> _mockMapper;
    private Mock<IValidator<CreateEmployeeDto>> _mockValidator;
    private CreateEmployeeCommandHandler _handler;
    private CreateEmployeeDto _validCreateEmployeeDto;
    private Employee _validEmployee;
    private EmployeeDto _expectedEmployeeDto;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockValidator = new Mock<IValidator<CreateEmployeeDto>>();
        
        _handler = new CreateEmployeeCommandHandler(
            _mockRepository.Object,
            _mockMapper.Object,
            _mockValidator.Object);

        _validCreateEmployeeDto = new CreateEmployeeDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Position = "Software Developer",
            Salary = 75000m,
            HireDate = DateTime.UtcNow
        };

        _validEmployee = new Employee
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Position = "Software Developer",
            Salary = 75000m,
            HireDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _expectedEmployeeDto = new EmployeeDto
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe",
            FullName = "John Doe",
            Email = "john.doe@example.com",
            Position = "Software Developer",
            Salary = 75000m,
            HireDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
    }

    [TestMethod]
    public async Task Handle_ValidEmployee_ShouldReturnEmployeeDto()
    {
        // Arrange
        var command = new CreateEmployeeCommand(_validCreateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validCreateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByEmailAsync(_validCreateEmployeeDto.Email))
                      .ReturnsAsync((Employee?)null);

        _mockMapper.Setup(x => x.Map<Employee>(_validCreateEmployeeDto))
                  .Returns(_validEmployee);

        _mockRepository.Setup(x => x.CreateAsync(_validEmployee))
                      .ReturnsAsync(_validEmployee);

        _mockMapper.Setup(x => x.Map<EmployeeDto>(_validEmployee))
                  .Returns(_expectedEmployeeDto);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(_expectedEmployeeDto);
        
        _mockValidator.Verify(x => x.ValidateAsync(_validCreateEmployeeDto, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.GetByEmailAsync(_validCreateEmployeeDto.Email), Times.Once);
        _mockRepository.Verify(x => x.CreateAsync(_validEmployee), Times.Once);
        _mockMapper.Verify(x => x.Map<Employee>(_validCreateEmployeeDto), Times.Once);
        _mockMapper.Verify(x => x.Map<EmployeeDto>(_validEmployee), Times.Once);
    }

    [TestMethod]
    public async Task Handle_InvalidEmployee_ShouldThrowValidationException()
    {
        // Arrange
        var command = new CreateEmployeeCommand(_validCreateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationFailures = new List<ValidationFailure>
        {
            new ValidationFailure("FirstName", "First name is required")
        };
        var validationResult = new ValidationResult(validationFailures);
        
        _mockValidator.Setup(x => x.ValidateAsync(_validCreateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        // Act & Assert
        var act = async () => await _handler.Handle(command, cancellationToken);
        
        await act.Should().ThrowAsync<ValidationException>()
                 .WithMessage("Validation failed: \r\n -- FirstName: First name is required Severity: Error");

        _mockValidator.Verify(x => x.ValidateAsync(_validCreateEmployeeDto, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.GetByEmailAsync(It.IsAny<string>()), Times.Never);
        _mockRepository.Verify(x => x.CreateAsync(It.IsAny<Employee>()), Times.Never);
    }

    [TestMethod]
    public async Task Handle_DuplicateEmail_ShouldThrowArgumentException()
    {
        // Arrange
        var command = new CreateEmployeeCommand(_validCreateEmployeeDto);
        var cancellationToken = new CancellationToken();
        var existingEmployee = new Employee { Id = 2, Email = _validCreateEmployeeDto.Email };

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validCreateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByEmailAsync(_validCreateEmployeeDto.Email))
                      .ReturnsAsync(existingEmployee);

        // Act & Assert
        var act = async () => await _handler.Handle(command, cancellationToken);
        
        await act.Should().ThrowAsync<ArgumentException>()
                 .WithMessage("Employee with this email already exists");

        _mockValidator.Verify(x => x.ValidateAsync(_validCreateEmployeeDto, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.GetByEmailAsync(_validCreateEmployeeDto.Email), Times.Once);
        _mockRepository.Verify(x => x.CreateAsync(It.IsAny<Employee>()), Times.Never);
    }

    [TestMethod]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {
        // Arrange
        var command = new CreateEmployeeCommand(_validCreateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validCreateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByEmailAsync(_validCreateEmployeeDto.Email))
                      .ReturnsAsync((Employee?)null);

        _mockMapper.Setup(x => x.Map<Employee>(_validCreateEmployeeDto))
                  .Returns(_validEmployee);

        _mockRepository.Setup(x => x.CreateAsync(_validEmployee))
                      .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database error");

        _mockRepository.Verify(x => x.CreateAsync(_validEmployee), Times.Once);
    }

    [TestMethod]
    public async Task Handle_EmptyStringValues_ShouldProcessCorrectly()
    {
        // Arrange
        var createEmployeeDtoWithEmptyValues = new CreateEmployeeDto
        {
            FirstName = "",
            LastName = "",
            Email = "test@example.com",
            Position = "",
            Salary = 0,
            HireDate = DateTime.MinValue
        };
        var command = new CreateEmployeeCommand(createEmployeeDtoWithEmptyValues);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(createEmployeeDtoWithEmptyValues, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByEmailAsync(createEmployeeDtoWithEmptyValues.Email))
                      .ReturnsAsync((Employee?)null);

        var employeeWithEmptyValues = new Employee
        {
            FirstName = "",
            LastName = "",
            Email = "test@example.com",
            Position = "",
            Salary = 0,
            HireDate = DateTime.MinValue
        };

        _mockMapper.Setup(x => x.Map<Employee>(createEmployeeDtoWithEmptyValues))
                  .Returns(employeeWithEmptyValues);

        _mockRepository.Setup(x => x.CreateAsync(employeeWithEmptyValues))
                      .ReturnsAsync(employeeWithEmptyValues);

        var expectedDto = new EmployeeDto
        {
            FirstName = "",
            LastName = "",
            Email = "test@example.com",
            Position = "",
            Salary = 0,
            HireDate = DateTime.MinValue
        };

        _mockMapper.Setup(x => x.Map<EmployeeDto>(employeeWithEmptyValues))
                  .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("test@example.com");
        _mockRepository.Verify(x => x.CreateAsync(employeeWithEmptyValues), Times.Once);
    }
}