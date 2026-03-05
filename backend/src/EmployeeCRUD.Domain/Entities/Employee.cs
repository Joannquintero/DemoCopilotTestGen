using System.ComponentModel.DataAnnotations;

namespace EmployeeCRUD.Domain.Entities;

public class Employee
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Position { get; set; } = string.Empty;
    
    [Range(0, double.MaxValue)]
    public decimal Salary { get; set; }
    
    public DateTime HireDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Computed property for full name
    public string FullName => $"{FirstName} {LastName}";
}