using Business.DTOs.Task;

namespace Business.Services;

public interface ITaskNotificationService
{
    Task NotifyTaskUpdatedAsync(TaskDto task);
}
