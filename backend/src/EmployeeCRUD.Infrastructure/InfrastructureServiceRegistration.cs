using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EmployeeCRUD.Domain.Interfaces;
using EmployeeCRUD.Infrastructure.Persistence;
using EmployeeCRUD.Infrastructure.Repositories;

namespace EmployeeCRUD.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Entity Framework
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // Repositories
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();

        return services;
    }
}