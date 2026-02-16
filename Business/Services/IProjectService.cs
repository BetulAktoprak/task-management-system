using Business.Common;
using Business.DTOs.Project;

namespace Business.Services;

public interface IProjectService
{
    Task<Result<List<ProjectDto>>> GetProjectsAsync();
    Task<Result<ProjectDto>> GetProjectByIdAsync(int id);
    Task<Result<ProjectDto>> CreateProjectAsync(CreateProjectDto createProjectDto, int userId);
    Task<Result<ProjectDto>> UpdateProjectAsync(int id, UpdateProjectDto updateProjectDto);
    Task<Result> DeleteProjectAsync(int id);
}
