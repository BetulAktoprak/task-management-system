namespace Business.DTOs.Project;

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CreatedBy { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public int TaskCount { get; set; }
}
