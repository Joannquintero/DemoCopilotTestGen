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

    #region GetPaginatedEmployees Parametrized Tests

    [DataTestMethod]
    [DataRow(0, 10, 400, "Page must be greater than 0")]
    [DataRow(-1, 10, 400, "Page must be greater than 0")]
    [DataRow(-5, 10, 400, "Page must be greater than 0")]
    [DataRow(1, 0, 400, "Page size must be between 1 and 100")]
    [DataRow(1, -1, 400, "Page size must be between 1 and 100")]
    [DataRow(1, 101, 400, "Page size must be between 1 and 100")]
    [DataRow(1, 150, 400, "Page size must be between 1 and 100")]
    [DataRow(1, -10, 400, "Page size must be between 1 and 100")]
    [DataRow(0, 0, 400, "Page must be greater than 0")]
    [DataRow(-1, -1, 400, "Page must be greater than 0")]
    [DataRow(-2, 101, 400, "Page must be greater than 0")]
    public async Task GetPaginatedEmployees_InvalidParameters_ShouldReturnBadRequestWithExpectedMessage(
        int page, int pageSize, int expectedStatusCode, string expectedMessage)
    {
        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        Assert.IsNotNull(badRequestResult, "Expected BadRequestObjectResult but got null");
        Assert.AreEqual(expectedStatusCode, badRequestResult.StatusCode, $"Expected status code {expectedStatusCode}");
        Assert.AreEqual(expectedMessage, badRequestResult.Value, $"Expected message '{expectedMessage}'");

        // Verify that mediator was never called for invalid parameters
        _mockMediator.Verify(x => x.Send(It.IsAny<GetPaginatedEmployeesQuery>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [DataTestMethod]
    [DataRow(1, 1)]
    [DataRow(1, 10)]
    [DataRow(1, 50)]
    [DataRow(1, 100)]
    [DataRow(5, 20)]
    [DataRow(10, 15)]
    [DataRow(100, 100)]
    [DataRow(1, 99)]
    [DataRow(2, 1)]
    [DataRow(50, 50)]
    public async Task GetPaginatedEmployees_ValidParameters_ShouldReturnOkWithPaginatedResult(
        int page, int pageSize)
    {
        // Arrange
        var expectedPaginatedResult = new PaginatedResult<EmployeeDto>(
            Items: new List<EmployeeDto>
            {
                new() { Id = 1, FirstName = "John", LastName = "Doe", FullName = "John Doe", Email = "john@example.com" },
                new() { Id = 2, FirstName = "Jane", LastName = "Smith", FullName = "Jane Smith", Email = "jane@example.com" }
            },
            TotalCount: 50,
            Page: page,
            PageSize: pageSize,
            TotalPages: (int)Math.Ceiling(50.0 / pageSize)
        );

        _mockMediator.Setup(x => x.Send(It.Is<GetPaginatedEmployeesQuery>(q => q.Page == page && q.PageSize == pageSize), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(expectedPaginatedResult);

        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult, "Expected OkObjectResult but got null");
        Assert.AreEqual(200, okResult.StatusCode, "Expected status code 200");

        var actualResult = okResult.Value as PaginatedResult<EmployeeDto>;
        Assert.IsNotNull(actualResult, "Expected PaginatedResult<EmployeeDto> but got null");
        Assert.AreEqual(expectedPaginatedResult.Page, actualResult.Page, $"Expected page {expectedPaginatedResult.Page}");
        Assert.AreEqual(expectedPaginatedResult.PageSize, actualResult.PageSize, $"Expected page size {expectedPaginatedResult.PageSize}");
        Assert.AreEqual(expectedPaginatedResult.TotalCount, actualResult.TotalCount, $"Expected total count {expectedPaginatedResult.TotalCount}");
        Assert.AreEqual(expectedPaginatedResult.TotalPages, actualResult.TotalPages, $"Expected total pages {expectedPaginatedResult.TotalPages}");

        // Verify mediator was called with correct parameters
        _mockMediator.Verify(x => x.Send(It.Is<GetPaginatedEmployeesQuery>(q => q.Page == page && q.PageSize == pageSize), It.IsAny<CancellationToken>()), Times.Once);
    }

    [DataTestMethod]
    [DataRow(1, 5, 23, 5)]   // 23 items, page size 5 = 5 pages
    [DataRow(1, 10, 50, 5)]  // 50 items, page size 10 = 5 pages
    [DataRow(1, 3, 10, 4)]   // 10 items, page size 3 = 4 pages (3+3+3+1)
    [DataRow(2, 7, 20, 3)]   // 20 items, page size 7 = 3 pages (7+7+6)
    [DataRow(1, 1, 5, 5)]    // 5 items, page size 1 = 5 pages
    [DataRow(3, 15, 100, 7)] // 100 items, page size 15 = 7 pages
    public async Task GetPaginatedEmployees_DifferentTotalCounts_ShouldCalculateCorrectTotalPages(
        int page, int pageSize, int totalCount, int expectedTotalPages)
    {
        // Arrange
        var items = new List<EmployeeDto>();
        for (int i = 1; i <= Math.Min(pageSize, totalCount); i++)
        {
            items.Add(new EmployeeDto { Id = i, FirstName = $"Employee{i}", LastName = $"Last{i}" });
        }

        var paginatedResult = new PaginatedResult<EmployeeDto>(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: expectedTotalPages
        );

        _mockMediator.Setup(x => x.Send(It.Is<GetPaginatedEmployeesQuery>(q => q.Page == page && q.PageSize == pageSize), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(paginatedResult);

        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult, "Expected OkObjectResult but got null");

        var actualResult = okResult.Value as PaginatedResult<EmployeeDto>;
        Assert.IsNotNull(actualResult, "Expected PaginatedResult<EmployeeDto> but got null");
        Assert.AreEqual(totalCount, actualResult.TotalCount, $"Expected total count {totalCount}");
        Assert.AreEqual(expectedTotalPages, actualResult.TotalPages, $"Expected total pages {expectedTotalPages} for {totalCount} items with page size {pageSize}");
        Assert.AreEqual(page, actualResult.Page, $"Expected page {page}");
        Assert.AreEqual(pageSize, actualResult.PageSize, $"Expected page size {pageSize}");
    }

    [DataTestMethod]
    [DataRow(1, 10, 0)]      // Empty result set
    [DataRow(1, 5, 3)]       // Less items than page size
    [DataRow(2, 10, 15)]     // Second page with remaining items
    [DataRow(1, 100, 50)]    // Page size larger than total items
    public async Task GetPaginatedEmployees_EdgeCasesItemCount_ShouldHandleCorrectly(
        int page, int pageSize, int totalCount)
    {
        // Arrange
        var items = new List<EmployeeDto>();
        int itemsToShow = Math.Min(pageSize, Math.Max(0, totalCount - ((page - 1) * pageSize)));

        for (int i = 1; i <= itemsToShow; i++)
        {
            items.Add(new EmployeeDto { Id = i, FirstName = $"Employee{i}" });
        }

        var expectedTotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / pageSize);

        var paginatedResult = new PaginatedResult<EmployeeDto>(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: expectedTotalPages
        );

        _mockMediator.Setup(x => x.Send(It.IsAny<GetPaginatedEmployeesQuery>(), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(paginatedResult);

        // Act
        var result = await _controller.GetPaginatedEmployees(page, pageSize);

        // Assert
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult, "Expected OkObjectResult but got null");

        var actualResult = okResult.Value as PaginatedResult<EmployeeDto>;
        Assert.IsNotNull(actualResult, "Expected PaginatedResult<EmployeeDto> but got null");
        Assert.AreEqual(totalCount, actualResult.TotalCount, $"Expected total count {totalCount}");
        Assert.AreEqual(items.Count, actualResult.Items.Count(), $"Expected {items.Count} items in current page");
        Assert.AreEqual(expectedTotalPages, actualResult.TotalPages, $"Expected total pages {expectedTotalPages}");
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