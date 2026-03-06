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
public class GetEmployeesByPositionQueryHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private Mock<IMapper> _mockMapper;
    private GetEmployeesByPositionQueryHandler _handler;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetEmployeesByPositionQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [TestMethod]
    public async Task Handle_ValidPosition_ShouldReturnMatchingEmployees()
    {
        // Arrange
        var position = "Software Developer";
        var query = new GetEmployeesByPositionQuery(position);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe", Position = position },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith", Position = position }
        };

        var employeeDtos = new List<EmployeeDto>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe", Position = position },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith", Position = position }
        };

        _mockRepository.Setup(x => x.GetByPositionAsync(position))
                      .ReturnsAsync(employees);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(employeeDtos);
        
        _mockRepository.Verify(x => x.GetByPositionAsync(position), Times.Once);
        _mockMapper.Verify(x => x.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }

    [TestMethod]
    public async Task Handle_NonExistingPosition_ShouldReturnEmptyCollection()
    {
        // Arrange
        var position = "Non Existing Position";
        var query = new GetEmployeesByPositionQuery(position);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetByPositionAsync(position))
                      .ReturnsAsync(employees);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
        
        _mockRepository.Verify(x => x.GetByPositionAsync(position), Times.Once);
    }

    [TestMethod]
    public async Task Handle_EmptyStringPosition_ShouldCallRepositoryWithEmptyString()
    {
        // Arrange
        var position = "";
        var query = new GetEmployeesByPositionQuery(position);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetByPositionAsync(position))
                      .ReturnsAsync(employees);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
        _mockRepository.Verify(x => x.GetByPositionAsync(position), Times.Once);
    }

    [TestMethod]
    public async Task Handle_CaseSensitivePosition_ShouldCallRepositoryWithExactCase()
    {
        // Arrange
        var position = "Software DEVELOPER";
        var query = new GetEmployeesByPositionQuery(position);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetByPositionAsync(position))
                      .ReturnsAsync(employees);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        _mockRepository.Verify(x => x.GetByPositionAsync(It.Is<string>(p => p == position)), Times.Once);
    }

    [TestMethod]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {
        // Arrange
        var position = "Developer";
        var query = new GetEmployeesByPositionQuery(position);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.GetByPositionAsync(position))
                      .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database error");
    }
}

[TestClass]
public class GetPaginatedEmployeesQueryHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private Mock<IMapper> _mockMapper;
    private GetPaginatedEmployeesQueryHandler _handler;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetPaginatedEmployeesQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [TestMethod]
    public async Task Handle_ValidPagination_ShouldReturnPaginatedResult()
    {
        // Arrange
        var page = 1;
        var pageSize = 10;
        var totalCount = 25;
        var query = new GetPaginatedEmployeesQuery(page, pageSize);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe" },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith" }
        };

        var employeeDtos = new List<EmployeeDto>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe", FullName = "John Doe" },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith", FullName = "Jane Smith" }
        };

        _mockRepository.Setup(x => x.GetPaginatedAsync(page, pageSize))
                      .ReturnsAsync(employees);

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(totalCount);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(totalCount);
        result.Page.Should().Be(page);
        result.PageSize.Should().Be(pageSize);
        result.TotalPages.Should().Be(3); // Math.Ceiling(25.0 / 10)
        
        _mockRepository.Verify(x => x.GetPaginatedAsync(page, pageSize), Times.Once);
        _mockRepository.Verify(x => x.CountAsync(), Times.Once);
        _mockMapper.Verify(x => x.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }

    [TestMethod]
    public async Task Handle_FirstPage_ShouldCalculateCorrectPagination()
    {
        // Arrange
        var page = 1;
        var pageSize = 5;
        var totalCount = 12;
        var query = new GetPaginatedEmployeesQuery(page, pageSize);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetPaginatedAsync(page, pageSize))
                      .ReturnsAsync(employees);

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(totalCount);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.TotalPages.Should().Be(3); // Math.Ceiling(12.0 / 5)
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(5);
    }

    [TestMethod]
    public async Task Handle_LastPage_ShouldCalculateCorrectPagination()
    {
        // Arrange
        var page = 3;
        var pageSize = 5;
        var totalCount = 12;
        var query = new GetPaginatedEmployeesQuery(page, pageSize);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetPaginatedAsync(page, pageSize))
                      .ReturnsAsync(employees);

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(totalCount);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.TotalPages.Should().Be(3);
        result.Page.Should().Be(3);
    }

    [TestMethod]
    public async Task Handle_ExactPageSizeDivision_ShouldCalculateCorrectTotalPages()
    {
        // Arrange
        var page = 2;
        var pageSize = 10;
        var totalCount = 20; // Exactly divisible
        var query = new GetPaginatedEmployeesQuery(page, pageSize);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetPaginatedAsync(page, pageSize))
                      .ReturnsAsync(employees);

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(totalCount);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.TotalPages.Should().Be(2); // Exactly 20 / 10
    }

    [TestMethod]
    public async Task Handle_ZeroTotalCount_ShouldReturnZeroPages()
    {
        // Arrange
        var page = 1;
        var pageSize = 10;
        var totalCount = 0;
        var query = new GetPaginatedEmployeesQuery(page, pageSize);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(x => x.GetPaginatedAsync(page, pageSize))
                      .ReturnsAsync(employees);

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(totalCount);

        _mockMapper.Setup(x => x.Map<IEnumerable<EmployeeDto>>(employees))
                  .Returns(employeeDtos);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.TotalCount.Should().Be(0);
        result.TotalPages.Should().Be(0);
        result.Items.Should().BeEmpty();
    }

    [TestMethod]
    public async Task Handle_RepositoryCountThrowsException_ShouldPropagateException()
    {
        // Arrange
        var page = 1;
        var pageSize = 10;
        var query = new GetPaginatedEmployeesQuery(page, pageSize);
        var cancellationToken = new CancellationToken();

        var employees = new List<Employee>();

        _mockRepository.Setup(x => x.GetPaginatedAsync(page, pageSize))
                      .ReturnsAsync(employees);

        _mockRepository.Setup(x => x.CountAsync())
                      .ThrowsAsync(new InvalidOperationException("Count operation failed"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Count operation failed");
    }
}

[TestClass]
public class GetEmployeeCountQueryHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private GetEmployeeCountQueryHandler _handler;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _handler = new GetEmployeeCountQueryHandler(_mockRepository.Object);
    }

    [TestMethod]
    public async Task Handle_WithEmployees_ShouldReturnCorrectCount()
    {
        // Arrange
        var expectedCount = 15;
        var query = new GetEmployeeCountQuery();
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(expectedCount);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().Be(expectedCount);
        _mockRepository.Verify(x => x.CountAsync(), Times.Once);
    }

    [TestMethod]
    public async Task Handle_WithNoEmployees_ShouldReturnZero()
    {
        // Arrange
        var expectedCount = 0;
        var query = new GetEmployeeCountQuery();
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(expectedCount);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().Be(0);
        _mockRepository.Verify(x => x.CountAsync(), Times.Once);
    }

    [TestMethod]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {
        // Arrange
        var query = new GetEmployeeCountQuery();
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.CountAsync())
                      .ThrowsAsync(new InvalidOperationException("Database connection failed"));

        // Act & Assert
        var act = async () => await _handler.Handle(query, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database connection failed");
    }

    [TestMethod]
    public async Task Handle_MaxIntCount_ShouldReturnMaxInt()
    {
        // Arrange
        var expectedCount = int.MaxValue;
        var query = new GetEmployeeCountQuery();
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.CountAsync())
                      .ReturnsAsync(expectedCount);

        // Act
        var result = await _handler.Handle(query, cancellationToken);

        // Assert
        result.Should().Be(int.MaxValue);
        _mockRepository.Verify(x => x.CountAsync(), Times.Once);
    }
}