using Microsoft.EntityFrameworkCore;
using EmployeeCRUD.Domain.Entities;

namespace EmployeeCRUD.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee entity configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Position)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Salary)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entity.Property(e => e.HireDate)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(e => e.UpdatedAt);

            // Indexes
            entity.HasIndex(e => e.Email)
                .IsUnique()
                .HasDatabaseName("IX_Employee_Email");

            entity.HasIndex(e => e.Position)
                .HasDatabaseName("IX_Employee_Position");
        });

        // Seed data
        modelBuilder.Entity<Employee>().HasData(
            new Employee
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@company.com",
                Position = "Software Engineer",
                Salary = 75000,
                HireDate = new DateTime(2023, 1, 15),
                CreatedAt = DateTime.UtcNow
            },
            new Employee
            {
                Id = 2,
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@company.com",
                Position = "Senior Developer",
                Salary = 95000,
                HireDate = new DateTime(2022, 8, 10),
                CreatedAt = DateTime.UtcNow
            },
            new Employee
            {
                Id = 3,
                FirstName = "Mike",
                LastName = "Johnson",
                Email = "mike.johnson@company.com",
                Position = "Tech Lead",
                Salary = 110000,
                HireDate = new DateTime(2021, 3, 22),
                CreatedAt = DateTime.UtcNow
            }
        );
    }
}