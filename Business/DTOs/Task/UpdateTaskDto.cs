namespace Business.DTOs.Task;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Entity.Enums.TaskStatus Status { get; set; }
}
