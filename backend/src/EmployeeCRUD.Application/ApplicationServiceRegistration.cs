using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using MediatR;
using EmployeeCRUD.Application.Mappings;
using EmployeeCRUD.Application.Validators;

namespace EmployeeCRUD.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(typeof(EmployeeMappingProfile));

        // MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ApplicationServiceRegistration).Assembly));

        // FluentValidation
        services.AddValidatorsFromAssemblyContaining<CreateEmployeeDtoValidator>();

        return services;
    }
}