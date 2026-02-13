namespace Entity;

public class TaskItem : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Enums.TaskStatus Status { get; set; }
    public int ProjectId { get; set; }
    public int? AssignedUserId { get; set; }

    // Navigation properties
    public Project Project { get; set; } = null!;
    public User? AssignedUser { get; set; }
}
