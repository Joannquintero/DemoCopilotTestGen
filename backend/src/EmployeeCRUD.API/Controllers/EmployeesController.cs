using MediatR;
using Microsoft.AspNetCore.Mvc;
using EmployeeCRUD.Application.Commands;
using EmployeeCRUD.Application.DTOs;
using EmployeeCRUD.Application.Queries;

namespace EmployeeCRUD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EmployeesController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Retrieves all employees
    /// </summary>
    /// <returns>List of all employees</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAllEmployees()
    {
        var employees = await _mediator.Send(new GetAllEmployeesQuery());
        return Ok(employees);
    }

    /// <summary>
    /// Retrieves a specific employee by ID
    /// </summary>
    /// <param name="id">Employee ID</param>
    /// <returns>Employee details</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeDto>> GetEmployeeById(int id)
    {
        var employee = await _mediator.Send(new GetEmployeeByIdQuery(id));

        if (employee == null)
            return NotFound($"Employee with ID {id} was not found");

        return Ok(employee);
    }

    /// <summary>
    /// Retrieves a specific employee by email
    /// </summary>
    /// <param name="email">Employee email</param>
    /// <returns>Employee details</returns>
    [HttpGet("by-email/{email}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeDto>> GetEmployeeByEmail(string email)
    {
        var employee = await _mediator.Send(new GetEmployeeByEmailQuery(email));

        if (employee == null)
            return NotFound($"Employee with email {email} was not found");

        return Ok(employee);
    }

    /// <summary>
    /// Retrieves employees by position
    /// </summary>
    /// <param name="position">Position to filter by</param>
    /// <returns>List of employees matching the position</returns>
    [HttpGet("by-position/{position}")]
    [ProducesResponseType(typeof(IEnumerable<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployeesByPosition(string position)
    {
        var employees = await _mediator.Send(new GetEmployeesByPositionQuery(position));
        return Ok(employees);
    }

    /// <summary>
    /// Retrieves paginated employees
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <returns>Paginated list of employees</returns>
    [HttpGet("paginated")]
    [ProducesResponseType(typeof(PaginatedResult<EmployeeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PaginatedResult<EmployeeDto>>> GetPaginatedEmployees(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1)
            return BadRequest("Page must be greater than 0");

        if (pageSize < 1 || pageSize > 100)
            return BadRequest("Page size must be between 1 and 100");

        var result = await _mediator.Send(new GetPaginatedEmployeesQuery(page, pageSize));
        return Ok(result);
    }

    /// <summary>
    /// Gets the total count of employees
    /// </summary>
    /// <returns>Total employee count</returns>
    [HttpGet("count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<ActionResult<int>> GetEmployeeCount()
    {
        var count = await _mediator.Send(new GetEmployeeCountQuery());
        return Ok(count);
    }

    /// <summary>
    /// Creates a new employee
    /// </summary>
    /// <param name="createEmployeeDto">Employee creation data</param>
    /// <returns>Created employee details</returns>
    [HttpPost]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee([FromBody] CreateEmployeeDto createEmployeeDto)
    {
        try
        {
            var employee = await _mediator.Send(new CreateEmployeeCommand(createEmployeeDto));
            return CreatedAtAction(
                nameof(GetEmployeeById),
                new { id = employee.Id },
                employee);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Updates an existing employee
    /// </summary>
    /// <param name="id">Employee ID</param>
    /// <param name="updateEmployeeDto">Employee update data</param>
    /// <returns>Updated employee details</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeDto>> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto updateEmployeeDto)
    {
        try
        {
            var employee = await _mediator.Send(new UpdateEmployeeCommand(id, updateEmployeeDto));
            
            if (employee == null)
                return NotFound($"Employee with ID {id} was not found");

            return Ok(employee);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Deletes an employee
    /// </summary>
    /// <param name="id">Employee ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var result = await _mediator.Send(new DeleteEmployeeCommand(id));
        
        if (!result)
            return NotFound($"Employee with ID {id} was not found");

        return NoContent();
    }
}