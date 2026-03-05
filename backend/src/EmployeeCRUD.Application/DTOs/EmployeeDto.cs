namespace EmployeeCRUD.Application.DTOs;

public record EmployeeDto
{
    public int Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public decimal Salary { get; init; }
    public DateTime HireDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record CreateEmployeeDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public decimal Salary { get; init; }
    public DateTime HireDate { get; init; }
}

public record UpdateEmployeeDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public decimal Salary { get; init; }
    public DateTime HireDate { get; init; }
}

public record EmployeeSummaryDto
{
    public int Id { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public decimal Salary { get; init; }
}