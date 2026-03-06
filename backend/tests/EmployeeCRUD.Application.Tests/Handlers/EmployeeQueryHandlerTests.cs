using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using Moq;
using AutoMapper;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Application.Handlers;
using EmployeeCRUD.Application.Queries;
using EmployeeCRUD.Domain.Entities;
using EmployeeCRUD.Domain.Interfaces;

namespace EmployeeCRUD.Application.Tests.Handlers;

[TestClass]
public class GetAllEmployeesQueryHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private Mock<IMapper> _mockMapper;
    private GetAllEmployeesQueryHandler _handler;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetAllEmployeesQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [TestMethod]
    public async Task Handle_WithEmployees_ShouldReturnMappedEmployeeDtos()
    {
        // Arrange
        var query = new GetAllEmployeesQuery();
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe", Email = "john@example.com" },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith", Email = "jane@example.com" }
        };

        var employeeDtos = new List<EmployeeDto>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe", FullName = "John Doe", Email = "john@example.com" },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith", FullName = "Jane Smith", Email = "jane@example.com" }
        };

        _mockRepository.Setup(x => x.GetAllAsync())
                      .ReturnsAsync(employees);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(employeeDtos);
        
        _mockRepository.Verify(x => x.GetAllAsync(), Times.Once);
        _mockMapper.Verify(x => x.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }

    [TestMethod]
    public async Task Handle_WithNoEmployees_ShouldReturnEmptyCollection()
    {
        // Arrange
        var query = new GetAllEmployeesQuery();
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetAllAsync())
                      .ReturnsAsync(employees);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
        
        _mockRepository.Verify(x => x.GetAllAsync(), Times.Once);
        _mockMapper.Verify(x => x.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }

    [TestMethod]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {
        // Arrange
        var query = new GetAllEmployeesQuery();
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.GetAllAsync())
                      .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database error");

        _mockRepository.Verify(x => x.GetAllAsync(), Times.Once);
    }

    [TestMethod]
    public async Task Handle_MapperThrowsException_ShouldPropagateException()
    {
        // Arrange
        var query = new GetAllEmployeesQuery();
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe" }
        };

        _mockRepository.Setup(x => x.GetAllAsync())
                      .ReturnsAsync(employees);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Throws(new InvalidOperationException("Mapping error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Mapping error");

        _mockRepository.Verify(x => x.GetAllAsync(), Times.Once);
        _mockMapper.Verify(x => x.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }
}

[TestClass]
public class GetEmployeeByIdQueryHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private Mock<IMapper> _mockMapper;
    private GetEmployeeByIdQueryHandler _handler;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetEmployeeByIdQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [TestMethod]
    public async Task Handle_ExistingEmployeeId_ShouldReturnMappedEmployeeDto()
    {
        // Arrange
        var employeeId = 1;
        var query = new GetEmployeeByIdQuery(employeeId);
        var cancellationToken = new CancellationToken();

        var employee = new Employee 
        { 
            Id = employeeId, 
            FirstName = "John", 
            LastName = "Doe", 
            Email = "john@example.com" 
        };

        var employeeDto = new EmployeeDto 
        { 
            Id = employeeId, 
            FirstName = "John", 
            LastName = "Doe", 
            FullName = "John Doe", 
            Email = "john@example.com" 
        };

        _mockRepository.Setup(x => x.GetByIdAsync(employeeId))
                      .ReturnsAsync(employee);

        _mockMapper.Setup(x => x.Map<EmployeeDto>(employee))
                  .Returns(employeeDto);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(employeeDto);
        
        _mockRepository.Verify(x => x.GetByIdAsync(employeeId), Times.Once);
        _mockMapper.Verify(x => x.Map<EmployeeDto>(employee), Times.Once);
    }

    [TestMethod]
    public async Task Handle_NonExistingEmployeeId_ShouldReturnNull()
    {
        // Arrange
        var employeeId = 999;
        var query = new GetEmployeeByIdQuery(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.GetByIdAsync(employeeId))
                      .ReturnsAsync((Employee?)null);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().BeNull();
        
        _mockRepository.Verify(x => x.GetByIdAsync(employeeId), Times.Once);
        _mockMapper.Verify(x => x.Map<EmployeeDto>(It.IsAny<Employee>()), Times.Never);
    }

    [TestMethod]
    public async Task Handle_ZeroEmployeeId_ShouldCallRepositoryWithZero()
    {
        // Arrange
        var employeeId = 0;
        var query = new GetEmployeeByIdQuery(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.GetByIdAsync(employeeId))
                      .ReturnsAsync((Employee?)null);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().BeNull();
        _mockRepository.Verify(x => x.GetByIdAsync(employeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_NegativeEmployeeId_ShouldCallRepositoryWithNegativeId()
    {
        // Arrange
        var employeeId = -1;
        var query = new GetEmployeeByIdQuery(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.GetByIdAsync(employeeId))
                      .ReturnsAsync((Employee?)null);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().BeNull();
        _mockRepository.Verify(x => x.GetByIdAsync(employeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {
        // Arrange
        var employeeId = 1;
        var query = new GetEmployeeByIdQuery(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.GetByIdAsync(employeeId))
                      .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database error");

        _mockRepository.Verify(x => x.GetByIdAsync(employeeId), Times.Once);
    }
}