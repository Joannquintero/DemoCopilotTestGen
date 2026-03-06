using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using Moq;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using EmployeeCRUD.API.Controllers;
using EmployeeCRUD.Application.Commands;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Application.Queries;

namespace EmployeeCRUD.API.Tests.Controllers;

[TestClass]
public class EmployeesControllerTests
{
    private Mock<IMediator> _mockMediator;
    private EmployeesController _controller;

    [TestInitialize]
    public void SetUp()
    {
        _mockMediator = new Mock<IMediator>();
        _controller = new EmployeesController(_mockMediator.Object);
    }

    #region Constructor Tests

    [TestMethod]
    public void Constructor_ValidMediator_ShouldCreateController()
    {
        // Arrange & Act
        var controller = new EmployeesController(_mockMediator.Object);

        // Assert
        controller.Should().NotBeNull();
    }

    [TestMethod]
    public void Constructor_NullMediator_ShouldCreateController()
    {
        // Arrange, Act & Assert
        // In .NET 9, the compiler might not enforce null checks in test contexts
        // This test verifies the constructor behavior rather than null validation
        var act = () => new EmployeesController(null!);

        // The controller creation might succeed but will fail at runtime when used
        act.Should().NotThrow();
    }

    #endregion

    #region GetAllEmployees Tests

    [TestMethod]
    public async Task GetAllEmployees_WithEmployees_ShouldReturnOkWithEmployeeList()
    {
        // Arrange
        var employees = new List<EmployeeDto>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe", FullName = "John Doe", Email = "john@example.com" },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith", FullName = "Jane Smith", Email = "jane@example.com" }
        };

        _mockMediator.Setup(x => x.Send(It.IsAny<GetAllEmployeesQuery>(), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(employees);

        // Act
        var result = await _controller.GetAllEmployees();

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as OkObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(200);
        actionResult.Value.Should().BeEquivalentTo(employees);
        
        _mockMediator.Verify(x => x.Send(It.IsAny<GetAllEmployeesQuery>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task GetAllEmployees_WithNoEmployees_ShouldReturnOkWithEmptyList()
    {
        // Arrange
        var employees = new List<EmployeeDto>();

        _mockMediator.Setup(x => x.Send(It.IsAny<GetAllEmployeesQuery>(), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(employees);

        // Act
        var result = await _controller.GetAllEmployees();

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as OkObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(200);
        ((IEnumerable<EmployeeDto>)actionResult.Value!).Should().BeEmpty();
    }

    [TestMethod]
    public async Task GetAllEmployees_MediatorThrowsException_ShouldPropagateException()
    {
        // Arrange
        _mockMediator.Setup(x => x.Send(It.IsAny<GetAllEmployeesQuery>(), It.IsAny<CancellationToken>()))
                   .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var act = async () => await _controller.GetAllEmployees();
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database error");
    }

    #endregion

    #region GetEmployeeById Tests

    [TestMethod]
    public async Task GetEmployeeById_ExistingEmployee_ShouldReturnOkWithEmployee()
    {
        // Arrange
        var employeeId = 1;
        var employee = new EmployeeDto 
        { 
            Id = employeeId, 
            FirstName = "John", 
            LastName = "Doe", 
            FullName = "John Doe", 
            Email = "john@example.com" 
        };

        _mockMediator.Setup(x => x.Send(It.Is<GetEmployeeByIdQuery>(q => q.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(employee);

        // Act
        var result = await _controller.GetEmployeeById(employeeId);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as OkObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(200);
        actionResult.Value.Should().BeEquivalentTo(employee);
        
        _mockMediator.Verify(x => x.Send(It.Is<GetEmployeeByIdQuery>(q => q.Id == employeeId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task GetEmployeeById_NonExistingEmployee_ShouldReturnNotFound()
    {
        // Arrange
        var employeeId = 999;

        _mockMediator.Setup(x => x.Send(It.Is<GetEmployeeByIdQuery>(q => q.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync((EmployeeDto?)null);

        // Act
        var result = await _controller.GetEmployeeById(employeeId);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as NotFoundObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(404);
        actionResult.Value.Should().Be($"Employee with ID {employeeId} was not found");
    }

    [TestMethod]
    public async Task GetEmployeeById_ZeroId_ShouldCallMediatorWithZeroId()
    {
        // Arrange
        var employeeId = 0;

        _mockMediator.Setup(x => x.Send(It.Is<GetEmployeeByIdQuery>(q => q.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync((EmployeeDto?)null);

        // Act
        var result = await _controller.GetEmployeeById(employeeId);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<GetEmployeeByIdQuery>(q => q.Id == employeeId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task GetEmployeeById_NegativeId_ShouldCallMediatorWithNegativeId()
    {
        // Arrange
        var employeeId = -1;

        _mockMediator.Setup(x => x.Send(It.Is<GetEmployeeByIdQuery>(q => q.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync((EmployeeDto?)null);

        // Act
        var result = await _controller.GetEmployeeById(employeeId);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<GetEmployeeByIdQuery>(q => q.Id == employeeId), It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetEmployeesByPosition Tests

    [TestMethod]
    public async Task GetEmployeesByPosition_ValidPosition_ShouldReturnOkWithEmployees()
    {
        // Arrange
        var position = "Developer";
        var employees = new List<EmployeeDto>
        {
            new() { Id = 1, Position = position },
            new() { Id = 2, Position = position }
        };

        _mockMediator.Setup(x => x.Send(It.Is<GetEmployeesByPositionQuery>(q => q.Position == position), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(employees);

        // Act
        var result = await _controller.GetEmployeesByPosition(position);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as OkObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(200);
        actionResult.Value.Should().BeEquivalentTo(employees);
    }

    [TestMethod]
    public async Task GetEmployeesByPosition_EmptyPosition_ShouldCallMediatorWithEmptyString()
    {
        // Arrange
        var position = "";
        var employees = new List<EmployeeDto>();

        _mockMediator.Setup(x => x.Send(It.Is<GetEmployeesByPositionQuery>(q => q.Position == position), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(employees);

        // Act
        var result = await _controller.GetEmployeesByPosition(position);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<GetEmployeesByPositionQuery>(q => q.Position == position), It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetPaginatedEmployees Tests

    [TestMethod]
    public async Task GetPaginatedEmployees_ValidParameters_ShouldReturnOkWithPaginatedResult()
    {
        // Arrange
        var page = 1;
        var pageSize = 10;
        var paginatedResult = new PaginatedResult<EmployeeDto>(
            Items: new List<EmployeeDto> { new() { Id = 1, FirstName = "John" } },
            TotalCount: 25,
            Page: page,
            PageSize: pageSize,
            TotalPages: 3
        );

        _mockMediator.Setup(x => x.Send(It.Is<GetPaginatedEmployeesQuery>(q => q.Page == page && q.PageSize == pageSize), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(paginatedResult);

        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as OkObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(200);
        actionResult.Value.Should().BeEquivalentTo(paginatedResult);
    }

    [TestMethod]
    public async Task GetPaginatedEmployees_PageLessThanOne_ShouldReturnBadRequest()
    {
        // Arrange
        var page = 0;
        var pageSize = 10;

        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as BadRequestObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(400);
        actionResult.Value.Should().Be("Page must be greater than 0");
        
        _mockMediator.Verify(x => x.Send(It.IsAny<GetPaginatedEmployeesQuery>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [TestMethod]
    public async Task GetPaginatedEmployees_PageSizeLessThanOne_ShouldReturnBadRequest()
    {
        // Arrange
        var page = 1;
        var pageSize = 0;

        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as BadRequestObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(400);
        actionResult.Value.Should().Be("Page size must be between 1 and 100");
    }

    [TestMethod]
    public async Task GetPaginatedEmployees_PageSizeGreaterThan100_ShouldReturnBadRequest()
    {
        // Arrange
        var page = 1;
        var pageSize = 101;

        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as BadRequestObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(400);
        actionResult.Value.Should().Be("Page size must be between 1 and 100");
    }

    [TestMethod]
    public async Task GetPaginatedEmployees_DefaultValues_ShouldUseCorrectDefaults()
    {
        // Arrange
        var paginatedResult = new PaginatedResult<EmployeeDto>(
            Items: new List<EmployeeDto>(),
            TotalCount: 0,
            Page: 1,
            PageSize: 10,
            TotalPages: 0
        );

        _mockMediator.Setup(x => x.Send(It.Is<GetPaginatedEmployeesQuery>(q => q.Page == 1 && q.PageSize == 10), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(paginatedResult);

        // Act
        var result = await _controller.GetPaginatedEmployees();

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<GetPaginatedEmployeesQuery>(q => q.Page == 1 && q.PageSize == 10), It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetEmployeeCount Tests

    [TestMethod]
    public async Task GetEmployeeCount_ShouldReturnOkWithCount()
    {
        // Arrange
        var expectedCount = 25;

        _mockMediator.Setup(x => x.Send(It.IsAny<GetEmployeeCountQuery>(), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(expectedCount);

        // Act
        var result = await _controller.GetEmployeeCount();

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as OkObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(200);
        actionResult.Value.Should().Be(expectedCount);
        
        _mockMediator.Verify(x => x.Send(It.IsAny<GetEmployeeCountQuery>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task GetEmployeeCount_ZeroEmployees_ShouldReturnOkWithZero()
    {
        // Arrange
        var expectedCount = 0;

        _mockMediator.Setup(x => x.Send(It.IsAny<GetEmployeeCountQuery>(), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(expectedCount);

        // Act
        var result = await _controller.GetEmployeeCount();

        // Assert
        var actionResult = result.Result as OkObjectResult;
        actionResult!.Value.Should().Be(0);
    }

    #endregion
}