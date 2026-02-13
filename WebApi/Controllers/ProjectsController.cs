using System.Security.Claims;
using Business.DTOs.Project;
using Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// Tüm projeleri listeler.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var result = await _projectService.GetProjectsAsync();

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// ID'ye göre proje detayını getirir.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProject(int id)
    {
        var result = await _projectService.GetProjectByIdAsync(id);

        if (result.IsFailure)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Yeni proje oluşturur.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto createProjectDto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var result = await _projectService.CreateProjectAsync(createProjectDto, userId.Value);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetProject), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// Projeyi günceller.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto updateProjectDto)
    {
        var result = await _projectService.UpdateProjectAsync(id, updateProjectDto);

        if (result.IsFailure)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
