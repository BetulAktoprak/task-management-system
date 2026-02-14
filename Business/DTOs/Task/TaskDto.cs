namespace Business.DTOs.Task;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Entity.Enums.TaskStatus Status { get; set; }
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int? AssignedUserId { get; set; }
    public string? AssignedUserName { get; set; }
}
