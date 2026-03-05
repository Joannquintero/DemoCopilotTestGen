using EmployeeCRUD.Application;
using EmployeeCRUD.Infrastructure;
using EmployeeCRUD.API.Middleware;
using Microsoft.OpenApi.Models;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Swagger configuration
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Employee CRUD API",
        Version = "v1",
        Description = "A REST API for Employee management built with Clean Architecture",
        Contact = new OpenApiContact
        {
            Name = "Development Team",
            Email = "dev@company.com"
        }
    });

    // Include XML comments
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularReactApps",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:4200",  // Angular default port
                    "http://localhost:3000",  // React default port
                    "https://localhost:4200",
                    "https://localhost:3000")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// Application and Infrastructure services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Employee CRUD API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at app's root
    });
}

// Global exception handler
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// CORS
app.UseCors("AllowAngularReactApps");

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

// Health checks
app.MapHealthChecks("/health");

// Development seedser
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<EmployeeCRUD.Infrastructure.Persistence.ApplicationDbContext>();
        
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();
    }
}

app.Run();