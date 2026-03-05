using System.Net;
using System.Text.Json;
using FluentValidation;

namespace EmployeeCRUD.API.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = context.Response;
        var errorResponse = new ErrorResponse();

        switch (exception)
        {
            case ValidationException validationEx:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = new ErrorResponse
                {
                    Message = "Validation failed",
                    Details = validationEx.Errors.Select(x => x.ErrorMessage).ToArray()
                };
                break;

            case ArgumentException argEx:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = new ErrorResponse
                {
                    Message = argEx.Message
                };
                break;

            case KeyNotFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse = new ErrorResponse
                {
                    Message = "Resource not found"
                };
                break;

            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse = new ErrorResponse
                {
                    Message = "Unauthorized access"
                };
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse = new ErrorResponse
                {
                    Message = "An internal server error occurred"
                };
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await response.WriteAsync(jsonResponse);
    }
}

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string[]? Details { get; set; }
    public DateTime TimeStamp { get; set; } = DateTime.UtcNow;
}