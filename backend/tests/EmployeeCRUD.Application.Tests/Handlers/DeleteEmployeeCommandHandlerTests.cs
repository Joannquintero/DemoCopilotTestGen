using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using Moq;
using EmployeeCRUD.Application.Commands;
using EmployeeCRUD.Application.Handlers;
using EmployeeCRUD.Domain.Interfaces;

namespace EmployeeCRUD.Application.Tests.Handlers;

[TestClass]
public class DeleteEmployeeCommandHandlerTests
{
    private Mock<IEmployeeRepository> _mockRepository;
    private DeleteEmployeeCommandHandler _handler;

    [TestInitialize]
    public void SetUp()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _handler = new DeleteEmployeeCommandHandler(_mockRepository.Object);
    }

    [TestMethod]
    public async Task Handle_ExistingEmployeeId_ShouldReturnTrue()
    {
        // Arrange
        const int employeeId = 1;
        var command = new DeleteEmployeeCommand(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(employeeId))
                      .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().BeTrue();
        _mockRepository.Verify(x => x.DeleteAsync(employeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_NonExistingEmployeeId_ShouldReturnFalse()
    {
        // Arrange
        const int nonExistingEmployeeId = 999;
        var command = new DeleteEmployeeCommand(nonExistingEmployeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(nonExistingEmployeeId))
                      .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().BeFalse();
        _mockRepository.Verify(x => x.DeleteAsync(nonExistingEmployeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_ZeroEmployeeId_ShouldCallRepositoryWithZero()
    {
        // Arrange
        const int zeroEmployeeId = 0;
        var command = new DeleteEmployeeCommand(zeroEmployeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(zeroEmployeeId))
                      .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().BeFalse();
        _mockRepository.Verify(x => x.DeleteAsync(zeroEmployeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_NegativeEmployeeId_ShouldCallRepositoryWithNegativeId()
    {
        // Arrange
        const int negativeEmployeeId = -1;
        var command = new DeleteEmployeeCommand(negativeEmployeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(negativeEmployeeId))
                      .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().BeFalse();
        _mockRepository.Verify(x => x.DeleteAsync(negativeEmployeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_MaxIntEmployeeId_ShouldCallRepositoryWithMaxInt()
    {
        // Arrange
        const int maxIntEmployeeId = int.MaxValue;
        var command = new DeleteEmployeeCommand(maxIntEmployeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(maxIntEmployeeId))
                      .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().BeFalse();
        _mockRepository.Verify(x => x.DeleteAsync(maxIntEmployeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_RepositoryThrowsException_ShouldPropagateException()
    {
        // Arrange
        const int employeeId = 1;
        var command = new DeleteEmployeeCommand(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(employeeId))
                      .ThrowsAsync(new InvalidOperationException("Database connection failed"));

        // Act & Assert
        var act = async () => await _handler.Handle(command, cancellationToken);
        
        await act.Should().ThrowAsync<InvalidOperationException>()
                 .WithMessage("Database connection failed");

        _mockRepository.Verify(x => x.DeleteAsync(employeeId), Times.Once);
    }

    [TestMethod]
    public async Task Handle_MultipleCallsSameId_ShouldCallRepositoryMultipleTimes()
    {
        // Arrange
        const int employeeId = 1;
        var command = new DeleteEmployeeCommand(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(employeeId))
                      .ReturnsAsync(true);

        // Act
        var result1 = await _handler.Handle(command, cancellationToken);
        var result2 = await _handler.Handle(command, cancellationToken);

        // Assert
        result1.Should().BeTrue();
        result2.Should().BeTrue();
        _mockRepository.Verify(x => x.DeleteAsync(employeeId), Times.Exactly(2));
    }

    [TestMethod]
    public async Task Handle_RepositoryReturnsTrue_ShouldVerifyCorrectRepositoryCall()
    {
        // Arrange
        const int employeeId = 42;
        var command = new DeleteEmployeeCommand(employeeId);
        var cancellationToken = new CancellationToken();

        _mockRepository.Setup(x => x.DeleteAsync(It.Is<int>(id => id == employeeId)))
                      .ReturnsAsync(true)
                      .Verifiable();

        // Act
        var result = await _handler.Handle(command, cancellationToken);

        // Assert
        result.Should().BeTrue();
        _mockRepository.Verify(x => x.DeleteAsync(It.Is<int>(id => id == employeeId)), Times.Once);
    }
}