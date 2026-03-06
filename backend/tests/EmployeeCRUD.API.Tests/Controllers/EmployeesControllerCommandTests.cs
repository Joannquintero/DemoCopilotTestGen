using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using Moq;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using EmployeeCRUD.API.Controllers;
using EmployeeCRUD.Application.Commands;
using EmployeeCRUD.Application.DTOs;

namespace EmployeeCRUD.API.Tests.Controllers;

[TestClass]
public class EmployeesControllerCommandTests
{
    private Mock<IMediator> _mockMediator;
    private EmployeesController _controller;

    [TestInitialize]
    public void SetUp()
    {
        _mockMediator = new Mock<IMediator>();
        _controller = new EmployeesController(_mockMediator.Object);
    }

    #region CreateEmployee Tests

    [TestMethod]
    public async Task CreateEmployee_ValidEmployee_ShouldReturnCreatedAtActionWithEmployee()
    {
        // Arrange
        var createEmployeeDto = new CreateEmployeeDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Position = "Developer",
            Salary = 75000,
            HireDate = DateTime.UtcNow
        };

        var createdEmployee = new EmployeeDto
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe",
            FullName = "John Doe",
            Email = "john.doe@example.com",
            Position = "Developer",
            Salary = 75000,
            HireDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<CreateEmployeeCommand>(c => c.Employee == createEmployeeDto), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(createdEmployee);

        // Act
        var result = await _controller.CreateEmployee(createEmployeeDto);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as CreatedAtActionResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(201);
        actionResult.Value.Should().BeEquivalentTo(createdEmployee);
        actionResult.ActionName.Should().Be(nameof(EmployeesController.GetEmployeeById));
        actionResult.RouteValues!["id"].Should().Be(1);
        
        _mockMediator.Verify(x => x.Send(It.Is<CreateEmployeeCommand>(c => c.Employee == createEmployeeDto), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task CreateEmployee_MediatorThrowsArgumentException_ShouldReturnBadRequest()
    {
        // Arrange
        var createEmployeeDto = new CreateEmployeeDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "duplicate@example.com",
            Position = "Developer",
            Salary = 75000,
            HireDate = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<CreateEmployeeCommand>(c => c.Employee == createEmployeeDto), It.IsAny<CancellationToken>()))
                   .ThrowsAsync(new ArgumentException("Employee with this email already exists"));

        // Act
        var result = await _controller.CreateEmployee(createEmployeeDto);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as BadRequestObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(400);
        actionResult.Value.Should().Be("Employee with this email already exists");
    }

    [TestMethod]
    public async Task CreateEmployee_MediatorThrowsOtherException_ShouldPropagateException()
    {
        // Arrange
        var createEmployeeDto = new CreateEmployeeDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Position = "Developer",
            Salary = 75000,
            HireDate = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<CreateEmployeeCommand>(c => c.Employee == createEmployeeDto), It.IsAny<CancellationToken>()))
                   .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var act = async () => await _controller.CreateEmployee(createEmployeeDto);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database error");
    }

    [TestMethod]
    public async Task CreateEmployee_EmptyDto_ShouldCallMediatorCorrectly()
    {
        // Arrange
        var createEmployeeDto = new CreateEmployeeDto();
        var createdEmployee = new EmployeeDto { Id = 1 };

        _mockMediator.Setup(x => x.Send(It.Is<CreateEmployeeCommand>(c => c.Employee == createEmployeeDto), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(createdEmployee);

        // Act
        var result = await _controller.CreateEmployee(createEmployeeDto);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<CreateEmployeeCommand>(c => c.Employee == createEmployeeDto), It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region UpdateEmployee Tests

    [TestMethod]
    public async Task UpdateEmployee_ValidEmployee_ShouldReturnOkWithUpdatedEmployee()
    {
        // Arrange
        var employeeId = 1;
        var updateEmployeeDto = new UpdateEmployeeDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane.smith@example.com",
            Position = "Senior Developer",
            Salary = 85000,
            HireDate = DateTime.UtcNow.AddYears(-1)
        };

        var updatedEmployee = new EmployeeDto
        {
            Id = employeeId,
            FirstName = "Jane",
            LastName = "Smith",
            FullName = "Jane Smith",
            Email = "jane.smith@example.com",
            Position = "Senior Developer",
            Salary = 85000,
            HireDate = DateTime.UtcNow.AddYears(-1),
            UpdatedAt = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(updatedEmployee);

        // Act
        var result = await _controller.UpdateEmployee(employeeId, updateEmployeeDto);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as OkObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(200);
        actionResult.Value.Should().BeEquivalentTo(updatedEmployee);
        
        _mockMediator.Verify(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateEmployee_EmployeeNotFound_ShouldReturnNotFound()
    {
        // Arrange
        var employeeId = 999;
        var updateEmployeeDto = new UpdateEmployeeDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane@example.com",
            Position = "Developer",
            Salary = 75000,
            HireDate = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()))
                   .ReturnsAsync((EmployeeDto?)null);

        // Act
        var result = await _controller.UpdateEmployee(employeeId, updateEmployeeDto);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as NotFoundObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(404);
        actionResult.Value.Should().Be($"Employee with ID {employeeId} was not found");
    }

    [TestMethod]
    public async Task UpdateEmployee_MediatorThrowsArgumentException_ShouldReturnBadRequest()
    {
        // Arrange
        var employeeId = 1;
        var updateEmployeeDto = new UpdateEmployeeDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "duplicate@example.com",
            Position = "Developer",
            Salary = 75000,
            HireDate = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()))
                   .ThrowsAsync(new ArgumentException("Another employee with this email already exists"));

        // Act
        var result = await _controller.UpdateEmployee(employeeId, updateEmployeeDto);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result.Result as BadRequestObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(400);
        actionResult.Value.Should().Be("Another employee with this email already exists");
    }

    [TestMethod]
    public async Task UpdateEmployee_ZeroId_ShouldCallMediatorWithZeroId()
    {
        // Arrange
        var employeeId = 0;
        var updateEmployeeDto = new UpdateEmployeeDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Position = "Tester",
            Salary = 50000,
            HireDate = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()))
                   .ReturnsAsync((EmployeeDto?)null);

        // Act
        var result = await _controller.UpdateEmployee(employeeId, updateEmployeeDto);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateEmployee_NegativeId_ShouldCallMediatorWithNegativeId()
    {
        // Arrange
        var employeeId = -1;
        var updateEmployeeDto = new UpdateEmployeeDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Position = "Tester",
            Salary = 50000,
            HireDate = DateTime.UtcNow
        };

        _mockMediator.Setup(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()))
                   .ReturnsAsync((EmployeeDto?)null);

        // Act
        var result = await _controller.UpdateEmployee(employeeId, updateEmployeeDto);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<UpdateEmployeeCommand>(c => c.Id == employeeId && c.Employee == updateEmployeeDto), It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region DeleteEmployee Tests

    [TestMethod]
    public async Task DeleteEmployee_ExistingEmployee_ShouldReturnNoContent()
    {
        // Arrange
        var employeeId = 1;

        _mockMediator.Setup(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteEmployee(employeeId);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result as NoContentResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(204);
        
        _mockMediator.Verify(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task DeleteEmployee_NonExistingEmployee_ShouldReturnNotFound()
    {
        // Arrange
        var employeeId = 999;

        _mockMediator.Setup(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteEmployee(employeeId);

        // Assert
        result.Should().NotBeNull();
        var actionResult = result as NotFoundObjectResult;
        actionResult.Should().NotBeNull();
        actionResult!.StatusCode.Should().Be(404);
        actionResult.Value.Should().Be($"Employee with ID {employeeId} was not found");
    }

    [TestMethod]
    public async Task DeleteEmployee_ZeroId_ShouldCallMediatorWithZeroId()
    {
        // Arrange
        var employeeId = 0;

        _mockMediator.Setup(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteEmployee(employeeId);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task DeleteEmployee_NegativeId_ShouldCallMediatorWithNegativeId()
    {
        // Arrange
        var employeeId = -1;

        _mockMediator.Setup(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteEmployee(employeeId);

        // Assert
        _mockMediator.Verify(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()), Times.Once);
    }

    [TestMethod]
    public async Task DeleteEmployee_MediatorThrowsException_ShouldPropagateException()
    {
        // Arrange
        var employeeId = 1;

        _mockMediator.Setup(x => x.Send(It.Is<DeleteEmployeeCommand>(c => c.Id == employeeId), It.IsAny<CancellationToken>()))
                   .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var act = async () => await _controller.DeleteEmployee(employeeId);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database error");
    }

    #endregion
}