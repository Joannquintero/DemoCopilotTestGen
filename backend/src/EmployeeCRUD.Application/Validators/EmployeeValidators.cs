using FluentValidation;
using EmployeeCRUD.Application.DTOs;

namespace EmployeeCRUD.Application.Validators;

public class CreateEmployeeDtoValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeDtoValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be valid")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters");

        RuleFor(x => x.Position)
            .NotEmpty().WithMessage("Position is required")
            .MaximumLength(100).WithMessage("Position must not exceed 100 characters");

        // Opción 2: Validación más específica
        RuleFor(x => x.Salary)
            .GreaterThanOrEqualTo(1).WithMessage("Salary must be at least 1")
            .LessThanOrEqualTo(999999.99m).WithMessage("Salary cannot exceed 999,999.99");

        RuleFor(x => x.HireDate)
            .NotEmpty().WithMessage("Hire date is required");
    }
}

public class UpdateEmployeeDtoValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeDtoValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be valid")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters");

        RuleFor(x => x.Position)
            .NotEmpty().WithMessage("Position is required")
            .MaximumLength(100).WithMessage("Position must not exceed 100 characters");

        // Opción 2: Validación más específica
        RuleFor(x => x.Salary)
            .GreaterThanOrEqualTo(1).WithMessage("Salary must be at least 1")
            .LessThanOrEqualTo(999999.99m).WithMessage("Salary cannot exceed 999,999.99");

        RuleFor(x => x.HireDate)
            .NotEmpty().WithMessage("Hire date is required");
    }
}