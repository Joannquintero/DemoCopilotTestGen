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
public class UpdateEmployeeCommandHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private Mock<IMapper> _mockMapper;
    private Mock<IValidator<UpdateEmployeeDto>> _mockValidator;
    private UpdateEmployeeCommandHandler _handler;
    private UpdateEmployeeDto _validUpdateEmployeeDto;
    private Employee _existingEmployee;
    private EmployeeDto _expectedEmployeeDto;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockValidator = new Mock<IValidator<UpdateEmployeeDto>>();
        
        _handler = new UpdateEmployeeCommandHandler(
            _mockRepository.Object,
            _mockMapper.Object,
            _mockValidator.Object);

        _validUpdateEmployeeDto = new UpdateEmployeeDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane.smith@example.com",
            Position = "Senior Developer",
            Salary = 85000m,
            HireDate = DateTime.UtcNow.AddYears(-2)
        };

        _existingEmployee = new Employee
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Position = "Developer",
            Salary = 70000m,
            HireDate = DateTime.UtcNow.AddYears(-3),
            CreatedAt = DateTime.UtcNow.AddYears(-3)
        };

        _expectedEmployeeDto = new EmployeeDto
        {
            Id = 1,
            FirstName = "Jane",
            LastName = "Smith",
            FullName = "Jane Smith",
            Email = "jane.smith@example.com",
            Position = "Senior Developer",
            Salary = 85000m,
            HireDate = DateTime.UtcNow.AddYears(-2),
            CreatedAt = DateTime.UtcNow.AddYears(-3),
            UpdatedAt = DateTime.UtcNow
        };
    }

    [TestMethod]
    public async Task Handle_ValidEmployee_ShouldReturnUpdatedEmployeeDto()
    {
        // Arrange
        var command = new UpdateEmployeeCommand(1, _validUpdateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByIdAsync(1))
                      .ReturnsAsync(_existingEmployee);

        _mockRepository.Setup(x => x.GetByEmailAsync(_validUpdateEmployeeDto.Email))
                      .ReturnsAsync((Employee?)null);

        _mockMapper.Setup(x => x.Map(_validUpdateEmployeeDto, _existingEmployee))
                  .Returns(_existingEmployee);

        _mockRepository.Setup(x => x.UpdateAsync(_existingEmployee))
                      .ReturnsAsync(_existingEmployee);

        _mockMapper.Setup(x => x.Map<EmployeeDto>(_existingEmployee))
                  .Returns(_expectedEmployeeDto);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(_expectedEmployeeDto);
        
        _mockValidator.Verify(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.GetByIdAsync(1), Times.Once);
        _mockRepository.Verify(x => x.GetByEmailAsync(_validUpdateEmployeeDto.Email), Times.Once);
        _mockRepository.Verify(x => x.UpdateAsync(_existingEmployee), Times.Once);
        _mockMapper.Verify(x => x.Map(_validUpdateEmployeeDto, _existingEmployee), Times.Once);
        _mockMapper.Verify(x => x.Map<EmployeeDto>(_existingEmployee), Times.Once);
    }

    [TestMethod]
    public async Task Handle_InvalidEmployee_ShouldThrowValidationException()
    {
        // Arrange
        var command = new UpdateEmployeeCommand(1, _validUpdateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationFailures = new List<ValidationFailure>
        {
            new ValidationFailure("Email", "Invalid email format")
        };
        var validationResult = new ValidationResult(validationFailures);
        
        _mockValidator.Setup(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        // Act & Assert
        var act = async () => await _handler.Handle(command, cancellationToken);
        
        await act.Should().ThrowAsync<ValidationException>()
                 .WithMessage("Validation failed: \r\n -- Email: Invalid email format Severity: Error");

        _mockValidator.Verify(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.GetByIdAsync(It.IsAny<int>()), Times.Never);
    }

    [TestMethod]
    public async Task Handle_EmployeeNotFound_ShouldReturnNull()
    {
        // Arrange
        var command = new UpdateEmployeeCommand(999, _validUpdateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByIdAsync(999))
                      .ReturnsAsync((Employee?)null);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().BeNull();
        
        _mockValidator.Verify(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.GetByIdAsync(999), Times.Once);
        _mockRepository.Verify(x => x.GetByEmailAsync(It.IsAny<string>()), Times.Never);
        _mockRepository.Verify(x => x.UpdateAsync(It.IsAny<Employee>()), Times.Never);
    }

    [TestMethod]
    public async Task Handle_DuplicateEmailWithDifferentEmployee_ShouldThrowArgumentException()
    {
        // Arrange
        var command = new UpdateEmployeeCommand(1, _validUpdateEmployeeDto);
        var cancellationToken = new CancellationToken();
        var employeeWithSameEmail = new Employee { Id = 2, Email = _validUpdateEmployeeDto.Email };

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByIdAsync(1))
                      .ReturnsAsync(_existingEmployee);

        _mockRepository.Setup(x => x.GetByEmailAsync(_validUpdateEmployeeDto.Email))
                      .ReturnsAsync(employeeWithSameEmail);

        // Act & Assert
        var act = async () => await _handler.Handle(command, cancellationToken);
        
        await act.Should().ThrowAsync<ArgumentException>()
                 .WithMessage("Another employee with this email already exists");

        _mockValidator.Verify(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken), Times.Once);
        _mockRepository.Verify(x => x.GetByIdAsync(1), Times.Once);
        _mockRepository.Verify(x => x.GetByEmailAsync(_validUpdateEmployeeDto.Email), Times.Once);
        _mockRepository.Verify(x => x.UpdateAsync(It.IsAny<Employee>()), Times.Never);
    }

    [TestMethod]
    public async Task Handle_SameEmployeeWithSameEmail_ShouldUpdateSuccessfully()
    {
        // Arrange
        var updateDtoWithSameEmail = new UpdateEmployeeDto
        {
            FirstName = "John Updated",
            LastName = "Doe Updated",
            Email = _existingEmployee.Email, // Same email as existing
            Position = "Updated Position",
            Salary = 80000m,
            HireDate = DateTime.UtcNow.AddYears(-1)
        };
        
        var command = new UpdateEmployeeCommand(1, updateDtoWithSameEmail);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(updateDtoWithSameEmail, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByIdAsync(1))
                      .ReturnsAsync(_existingEmployee);

        _mockRepository.Setup(x => x.GetByEmailAsync(updateDtoWithSameEmail.Email))
                      .ReturnsAsync(_existingEmployee); // Same employee

        _mockMapper.Setup(x => x.Map(updateDtoWithSameEmail, _existingEmployee))
                  .Returns(_existingEmployee);

        _mockRepository.Setup(x => x.UpdateAsync(_existingEmployee))
                      .ReturnsAsync(_existingEmployee);

        _mockMapper.Setup(x => x.Map<EmployeeDto>(_existingEmployee))
                  .Returns(_expectedEmployeeDto);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        _mockRepository.Verify(x => x.UpdateAsync(_existingEmployee), Times.Once);
    }

    [TestMethod]
    public async Task Handle_IdPreservation_ShouldMaintainOriginalId()
    {
        // Arrange
        var command = new UpdateEmployeeCommand(1, _validUpdateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByIdAsync(1))
                      .ReturnsAsync(_existingEmployee);

        _mockRepository.Setup(x => x.GetByEmailAsync(_validUpdateEmployeeDto.Email))
                      .ReturnsAsync((Employee?)null);

        _mockMapper.Setup(x => x.Map(_validUpdateEmployeeDto, _existingEmployee))
                  .Callback<UpdateEmployeeDto, Employee>((dto, emp) => 
                  {
                      // Simulate mapping that might change ID
                      emp.Id = 999;
                  })
                  .Returns(_existingEmployee);

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Employee>()))
                      .ReturnsAsync(_existingEmployee);

        _mockMapper.Setup(x => x.Map<EmployeeDto>(_existingEmployee))
                  .Returns(_expectedEmployeeDto);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        _mockRepository.Verify(x => x.UpdateAsync(It.Is<Employee>(e => e.Id == 1)), Times.Once);
    }

    [TestMethod]
    public async Task Handle_RepositoryUpdateThrowsException_ShouldPropagateException()
    {
        // Arrange
        var command = new UpdateEmployeeCommand(1, _validUpdateEmployeeDto);
        var cancellationToken = new CancellationToken();

        var validationResult = new ValidationResult();
        _mockValidator.Setup(x => x.ValidateAsync(_validUpdateEmployeeDto, cancellationToken))
                     .ReturnsAsync(validationResult);

        _mockRepository.Setup(x => x.GetByIdAsync(1))
                      .ReturnsAsync(_existingEmployee);

        _mockRepository.Setup(x => x.GetByEmailAsync(_validUpdateEmployeeDto.Email))
                      .ReturnsAsync((Employee?)null);

        _mockMapper.Setup(x => x.Map(_validUpdateEmployeeDto, _existingEmployee))
                  .Returns(_existingEmployee);

        _mockRepository.Setup(x => x.UpdateAsync(_existingEmployee))
                      .ThrowsAsync(new InvalidOperationException("Database update failed"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database update failed");
    }
}