namespace Business.DTOs.Task;

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ProjectId { get; set; }
    public Entity.Enums.TaskStatus Status { get; set; } = Entity.Enums.TaskStatus.ToDo;
    public int? AssignedUserId { get; set; }
}
