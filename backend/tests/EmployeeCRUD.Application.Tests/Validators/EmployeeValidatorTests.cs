using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using FluentValidation.Results;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Application.Validators;

namespace EmployeeCRUD.Application.Tests.Validators;

[TestClass]
public class CreateEmployeeDtoValidatorTests
{
    private CreateEmployeeDtoValidator _validator;
    private CreateEmployeeDto _validEmployeeDto;

    [TestInitialize]
    public void SetUp()
    {
        _validator = new CreateEmployeeDtoValidator();

        _validEmployeeDto = new CreateEmployeeDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Position = "Software Developer",
            Salary = 50000m,
            HireDate = DateTime.UtcNow
        };
    }

    #region Salary Validation Tests

    [TestMethod]
    public void Validate_SalaryIsZero_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 0 };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegative_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -1000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegative50000_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -50000.50m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegativeOne_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -1m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegativeCents_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -0.01m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryExceedsMaximum_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 1000000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary cannot exceed 999,999.99");
    }

    [TestMethod]
    public void Validate_SalaryExceeds1Million_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 1500000.50m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary cannot exceed 999,999.99");
    }

    [TestMethod]
    public void Validate_SalaryIsValidMinimum_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 1m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    [TestMethod]
    public void Validate_SalaryIsValidMaximum_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 999999.99m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    [TestMethod]
    public void Validate_SalaryIs1000_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 1000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    [TestMethod]
    public void Validate_SalaryIs100000_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 100000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    #endregion

    #region Other Field Validation Tests

    [TestMethod]
    public void Validate_ValidEmployee_ShouldNotHaveValidationErrors()
    {
        // Act
        ValidationResult result = _validator.Validate(_validEmployeeDto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [TestMethod]
    public void Validate_FirstNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { FirstName = "" };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName" && e.ErrorMessage == "First name is required");
    }

    [TestMethod]
    public void Validate_LastNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { LastName = "" };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "LastName" && e.ErrorMessage == "Last name is required");
    }

    [TestMethod]
    public void Validate_EmailIsInvalid_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Email = "invalid-email" };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email" && e.ErrorMessage == "Email must be valid");
    }

    [TestMethod]
    public void Validate_PositionIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Position = "" };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Position" && e.ErrorMessage == "Position is required");
    }

    #endregion
}

[TestClass]
public class UpdateEmployeeDtoValidatorTests
{
    private UpdateEmployeeDtoValidator _validator;
    private UpdateEmployeeDto _validEmployeeDto;

    [TestInitialize]
    public void SetUp()
    {
        _validator = new UpdateEmployeeDtoValidator();

        _validEmployeeDto = new UpdateEmployeeDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane.smith@example.com",
            Position = "Senior Developer",
            Salary = 75000m,
            HireDate = DateTime.UtcNow.AddYears(-2)
        };
    }

    #region Salary Validation Tests

    [TestMethod]
    public void Validate_SalaryIsZero_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 0 };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegative_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -2500m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegative100000_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -100000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegative50Point25_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -50.25m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryIsNegative99Cents_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = -0.99m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary must be at least 1");
    }

    [TestMethod]
    public void Validate_SalaryExceedsMaximum_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 1000000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary cannot exceed 999,999.99");
    }

    [TestMethod]
    public void Validate_SalaryExceeds1MillionBy1Cent_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 1000000.01m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary cannot exceed 999,999.99");
    }

    [TestMethod]
    public void Validate_SalaryIs2Million_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 2000000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Salary" && e.ErrorMessage == "Salary cannot exceed 999,999.99");
    }

    [TestMethod]
    public void Validate_SalaryIsValidMinimum_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 1m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    [TestMethod]
    public void Validate_SalaryIsValidMaximum_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 999999.99m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    [TestMethod]
    public void Validate_SalaryIs25000_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 25000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    [TestMethod]
    public void Validate_SalaryIs85000_ShouldNotHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Salary = 85000m };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.Errors.Should().NotContain(e => e.PropertyName == "Salary");
    }

    #endregion

    #region Other Field Validation Tests

    [TestMethod]
    public void Validate_ValidEmployee_ShouldNotHaveValidationErrors()
    {
        // Act
        ValidationResult result = _validator.Validate(_validEmployeeDto);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [TestMethod]
    public void Validate_FirstNameIsEmpty_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { FirstName = "" };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName" && e.ErrorMessage == "First name is required");
    }

    [TestMethod]
    public void Validate_EmailIsInvalid_ShouldHaveValidationError()
    {
        // Arrange
        var employeeDto = _validEmployeeDto with { Email = "not-an-email" };

        // Act
        ValidationResult result = _validator.Validate(employeeDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email" && e.ErrorMessage == "Email must be valid");
    }

    #endregion
}