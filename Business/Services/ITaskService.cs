using Business.Common;
using Business.DTOs.Task;

namespace Business.Services;

public interface ITaskService
{
    Task<Result<List<TaskDto>>> GetTasksAsync();
    Task<Result<List<TaskDto>>> GetTasksByProjectAsync(int projectId);
    Task<Result<TaskDto>> GetTaskByIdAsync(int id);
    Task<Result<TaskDto>> CreateTaskAsync(CreateTaskDto createTaskDto);
    Task<Result<TaskDto>> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto);
    Task<Result> AssignTaskAsync(int taskId, int? assignedUserId);
}
