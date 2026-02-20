using Business.DTOs.Task;
using Business.Services;
using Microsoft.AspNetCore.SignalR;
using WebApi.Hubs;

namespace WebApi.Services;

public class TaskNotificationService : ITaskNotificationService
{
    private readonly IHubContext<TaskHub> _hubContext;

    public TaskNotificationService(IHubContext<TaskHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyTaskUpdatedAsync(TaskDto task)
    {
        await _hubContext.Clients.All.SendAsync("TaskUpdated", task);
    }

    public async Task NotifyTaskAssignedAsync(TaskDto task)
    {
        await _hubContext.Clients.All.SendAsync("TaskAssigned", task);
    }
}
