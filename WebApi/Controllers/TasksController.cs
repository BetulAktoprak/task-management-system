using Business.DTOs.Task;
using Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// Tüm görevleri listeler.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var result = await _taskService.GetTasksAsync();

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Belirli bir projeye ait görevleri listeler.
    /// </summary>
    [HttpGet("project/{projectId:int}")]
    public async Task<IActionResult> GetTasksByProject(int projectId)
    {
        var result = await _taskService.GetTasksByProjectAsync(projectId);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// ID'ye göre görev detayını getirir.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var result = await _taskService.GetTaskByIdAsync(id);

        if (result.IsFailure)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Yeni görev oluşturur.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto createTaskDto)
    {
        var result = await _taskService.CreateTaskAsync(createTaskDto);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return CreatedAtAction(nameof(GetTask), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// Görevi günceller (başlık, açıklama, durum).
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto updateTaskDto)
    {
        var result = await _taskService.UpdateTaskAsync(id, updateTaskDto);

        if (result.IsFailure)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Göreve kullanıcı atar veya atamayı kaldırır.
    /// </summary>
    [HttpPut("{id:int}/assign")]
    public async Task<IActionResult> AssignTask(int id, [FromBody] AssignTaskDto assignTaskDto)
    {
        var result = await _taskService.AssignTaskAsync(id, assignTaskDto.AssignedUserId);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { message = "Görev ataması başarıyla güncellendi." });
    }
}
