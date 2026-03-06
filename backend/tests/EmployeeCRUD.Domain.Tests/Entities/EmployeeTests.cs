using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using EmployeeCRUD.Domain.Entities;

namespace EmployeeCRUD.Domain.Tests.Entities;

[TestClass]
public class EmployeeTests
{
    [TestMethod]
    public void Constructor_DefaultValues_ShouldSetPropertiesCorrectly()
    {
        // Arrange & Act
        var employee = new Employee();

        // Assert
        employee.Id.Should().Be(0);
        employee.FirstName.Should().Be(string.Empty);
        employee.LastName.Should().Be(string.Empty);
        employee.Email.Should().Be(string.Empty);
        employee.Position.Should().Be(string.Empty);
        employee.Salary.Should().Be(0);
        employee.HireDate.Should().Be(DateTime.MinValue);
        employee.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        employee.UpdatedAt.Should().BeNull();
    }

    [TestMethod]
    public void FullName_WithFirstNameAndLastName_ShouldReturnConcatenatedNames()
    {
        // Arrange
        var employee = new Employee
        {
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = employee.FullName;

        // Assert
        result.Should().Be("John Doe");
    }

    [TestMethod]
    public void FullName_WithEmptyFirstName_ShouldReturnSpaceAndLastName()
    {
        // Arrange
        var employee = new Employee
        {
            FirstName = "",
            LastName = "Doe"
        };

        // Act
        var result = employee.FullName;

        // Assert
        result.Should().Be(" Doe");
    }

    [TestMethod]
    public void FullName_WithEmptyLastName_ShouldReturnFirstNameAndSpace()
    {
        // Arrange
        var employee = new Employee
        {
            FirstName = "John",
            LastName = ""
        };

        // Act
        var result = employee.FullName;

        // Assert
        result.Should().Be("John ");
    }

    [TestMethod]
    public void FullName_WithBothNamesEmpty_ShouldReturnSingleSpace()
    {
        // Arrange
        var employee = new Employee
        {
            FirstName = "",
            LastName = ""
        };

        // Act
        var result = employee.FullName;

        // Assert
        result.Should().Be(" ");
    }

    [TestMethod]
    public void SetProperties_ValidValues_ShouldAssignCorrectly()
    {
        // Arrange
        var employee = new Employee();
        var hireDate = new DateTime(2024, 1, 15);
        var createdAt = new DateTime(2024, 1, 1);
        var updatedAt = new DateTime(2024, 1, 20);

        // Act
        employee.Id = 1;
        employee.FirstName = "Jane";
        employee.LastName = "Smith";
        employee.Email = "jane.smith@email.com";
        employee.Position = "Software Developer";
        employee.Salary = 75000.50m;
        employee.HireDate = hireDate;
        employee.CreatedAt = createdAt;
        employee.UpdatedAt = updatedAt;

        // Assert
        employee.Id.Should().Be(1);
        employee.FirstName.Should().Be("Jane");
        employee.LastName.Should().Be("Smith");
        employee.Email.Should().Be("jane.smith@email.com");
        employee.Position.Should().Be("Software Developer");
        employee.Salary.Should().Be(75000.50m);
        employee.HireDate.Should().Be(hireDate);
        employee.CreatedAt.Should().Be(createdAt);
        employee.UpdatedAt.Should().Be(updatedAt);
        employee.FullName.Should().Be("Jane Smith");
    }

    [TestMethod]
    public void SetProperties_SpecialCharactersInNames_ShouldHandleCorrectly()
    {
        // Arrange
        var employee = new Employee();

        // Act
        employee.FirstName = "José-María";
        employee.LastName = "García-López";

        // Assert
        employee.FirstName.Should().Be("José-María");
        employee.LastName.Should().Be("García-López");
        employee.FullName.Should().Be("José-María García-López");
    }

    [TestMethod]
    public void SetProperties_MaximumDecimalSalary_ShouldHandleCorrectly()
    {
        // Arrange
        var employee = new Employee();

        // Act
        employee.Salary = decimal.MaxValue;

        // Assert
        employee.Salary.Should().Be(decimal.MaxValue);
    }

    [TestMethod]
    public void SetProperties_ZeroSalary_ShouldHandleCorrectly()
    {
        // Arrange
        var employee = new Employee();

        // Act
        employee.Salary = 0;

        // Assert
        employee.Salary.Should().Be(0);
    }

    [TestMethod]
    public void UpdatedAt_InitiallyNull_ShouldRemainNull()
    {
        // Arrange & Act
        var employee = new Employee
        {
            FirstName = "Test",
            LastName = "User"
        };

        // Assert
        employee.UpdatedAt.Should().BeNull();
    }

    [TestMethod]
    public void CreatedAt_AfterInitialization_ShouldBeSetToCurrentUtcTime()
    {
        // Arrange
        var beforeCreation = DateTime.UtcNow;

        // Act
        var employee = new Employee();
        var afterCreation = DateTime.UtcNow;

        // Assert
        employee.CreatedAt.Should().BeOnOrAfter(beforeCreation);
        employee.CreatedAt.Should().BeOnOrBefore(afterCreation);
    }

    [TestMethod]
    public void Employee_FullScenario_ShouldMaintainDataIntegrity()
    {
        // Arrange
        var employee = new Employee
        {
            Id = 999,
            FirstName = "Senior",
            LastName = "Developer",
            Email = "senior.dev@company.com",
            Position = "Senior Software Engineer",
            Salary = 120000.00m,
            HireDate = new DateTime(2020, 3, 15),
            UpdatedAt = DateTime.UtcNow
        };

        // Act & Assert - Verify all properties are maintained
        employee.Id.Should().Be(999);
        employee.FirstName.Should().Be("Senior");
        employee.LastName.Should().Be("Developer");
        employee.Email.Should().Be("senior.dev@company.com");
        employee.Position.Should().Be("Senior Software Engineer");
        employee.Salary.Should().Be(120000.00m);
        employee.HireDate.Should().Be(new DateTime(2020, 3, 15));
        employee.UpdatedAt.Should().NotBeNull();
        employee.FullName.Should().Be("Senior Developer");
    }
}