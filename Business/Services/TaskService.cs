using Business.Common;
using Business.DTOs.Task;
using DataAccess;
using DataAccess.Repositories;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace Business.Services;

public class TaskService : ITaskService
{
    private readonly IRepository<TaskItem> _taskRepository;
    private readonly AppDbContext _context;
    private readonly ITaskNotificationService _taskNotificationService;

    public TaskService(
        IRepository<TaskItem> taskRepository,
        AppDbContext context,
        ITaskNotificationService taskNotificationService)
    {
        _taskRepository = taskRepository;
        _context = context;
        _taskNotificationService = taskNotificationService;
    }

    public async Task<Result<List<TaskDto>>> GetTasksAsync()
    {
        var tasks = await GetTasksQuery()
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Result<List<TaskDto>>.Success(tasks);
    }

    public async Task<Result<List<TaskDto>>> GetTasksByProjectAsync(int projectId)
    {
        var tasks = await GetTasksQuery()
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Result<List<TaskDto>>.Success(tasks);
    }

    public async Task<Result<TaskDto>> GetTaskByIdAsync(int id)
    {
        var task = await GetTasksQuery()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return Result<TaskDto>.Failure("Görev bulunamadı.");
        }

        return Result<TaskDto>.Success(task);
    }

    public async Task<Result<TaskDto>> CreateTaskAsync(CreateTaskDto createTaskDto)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == createTaskDto.ProjectId && !p.IsDeleted);

        if (!projectExists)
        {
            return Result<TaskDto>.Failure("Proje bulunamadı.");
        }

        if (createTaskDto.AssignedUserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == createTaskDto.AssignedUserId.Value && !u.IsDeleted);

            if (!userExists)
            {
                return Result<TaskDto>.Failure("Atanacak kullanıcı bulunamadı.");
            }
        }

        var task = new TaskItem
        {
            Title = createTaskDto.Title,
            Description = createTaskDto.Description,
            Status = createTaskDto.Status,
            ProjectId = createTaskDto.ProjectId,
            AssignedUserId = createTaskDto.AssignedUserId
        };

        await _taskRepository.AddAsync(task);
        await _taskRepository.SaveChangesAsync();

        var taskDto = await GetTaskByIdAsync(task.Id);
        if (taskDto.IsSuccess && taskDto.Data != null)
        {
            await _taskNotificationService.NotifyTaskUpdatedAsync(taskDto.Data);
        }
        return taskDto;
    }

    public async Task<Result<TaskDto>> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null)
        {
            return Result<TaskDto>.Failure("Görev bulunamadı.");
        }

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.Status = updateTaskDto.Status;

        _taskRepository.Update(task);
        await _taskRepository.SaveChangesAsync();

        var taskDto = await GetTaskByIdAsync(id);
        if (taskDto.IsSuccess && taskDto.Data != null)
        {
            await _taskNotificationService.NotifyTaskUpdatedAsync(taskDto.Data);
        }
        return taskDto;
    }

    public async Task<Result> AssignTaskAsync(int taskId, int? assignedUserId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
        {
            return Result.Failure("Görev bulunamadı.");
        }

        if (assignedUserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == assignedUserId.Value && !u.IsDeleted);

            if (!userExists)
            {
                return Result.Failure("Atanacak kullanıcı bulunamadı.");
            }
        }

        task.AssignedUserId = assignedUserId;
        _taskRepository.Update(task);
        await _taskRepository.SaveChangesAsync();

        var taskDto = await GetTaskByIdAsync(taskId);
        if (taskDto.IsSuccess && taskDto.Data != null)
        {
            await _taskNotificationService.NotifyTaskUpdatedAsync(taskDto.Data);
        }
        return Result.Success();
    }

    private IQueryable<TaskDto> GetTasksQuery()
    {
        return _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.AssignedUser)
            .Where(t => !t.IsDeleted)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                ProjectId = t.ProjectId,
                ProjectName = t.Project.Name,
                AssignedUserId = t.AssignedUserId,
                AssignedUserName = t.AssignedUser != null ? t.AssignedUser.Name : null
            });
    }
}
