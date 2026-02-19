using Business.Common;
using Business.DTOs.Project;
using DataAccess;
using DataAccess.Repositories;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace Business.Services;

public class ProjectService : IProjectService
{
    private readonly IRepository<Project> _projectRepository;
    private readonly AppDbContext _context;

    public ProjectService(IRepository<Project> projectRepository, AppDbContext context)
    {
        _projectRepository = projectRepository;
        _context = context;
    }

    public async Task<Result<List<ProjectDto>>> GetProjectsAsync()
    {
        var projects = await _context.Projects
            .Include(p => p.Creator)
            .Where(p => !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                CreatedBy = p.CreatedBy,
                CreatorName = p.Creator.Name,
                TaskCount = p.Tasks.Count(t => !t.IsDeleted),
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Result<List<ProjectDto>>.Success(projects);
    }

    public async Task<Result<ProjectDto>> GetProjectByIdAsync(int id)
    {
        var project = await _context.Projects
            .Include(p => p.Creator)
            .Where(p => p.Id == id && !p.IsDeleted)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                CreatedBy = p.CreatedBy,
                CreatorName = p.Creator.Name,
                TaskCount = p.Tasks.Count(t => !t.IsDeleted),
                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return Result<ProjectDto>.Failure("Proje bulunamadı.");
        }

        return Result<ProjectDto>.Success(project);
    }

    public async Task<Result<ProjectDto>> CreateProjectAsync(CreateProjectDto createProjectDto, int userId)
    {
        var project = new Project
        {
            Name = createProjectDto.Name,
            Description = createProjectDto.Description,
            ImageUrl = createProjectDto.ImageUrl,
            CreatedBy = userId
        };

        await _projectRepository.AddAsync(project);
        await _projectRepository.SaveChangesAsync();

        var creator = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.Name)
            .FirstOrDefaultAsync();

        var projectDto = new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            ImageUrl = project.ImageUrl,
            CreatedBy = project.CreatedBy,
            CreatorName = creator ?? "",
            TaskCount = 0,
            CreatedAt = project.CreatedAt
        };

        return Result<ProjectDto>.Success(projectDto);
    }

    public async Task<Result<ProjectDto>> UpdateProjectAsync(int id, UpdateProjectDto updateProjectDto)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
        {
            return Result<ProjectDto>.Failure("Proje bulunamadı.");
        }

        project.Name = updateProjectDto.Name;
        project.Description = updateProjectDto.Description;
        project.ImageUrl = updateProjectDto.ImageUrl;
        _projectRepository.Update(project);
        await _projectRepository.SaveChangesAsync();

        var projectDto = await GetProjectByIdAsync(id);
        return projectDto;
    }

    public async Task<Result> DeleteProjectAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
        {
            return Result.Failure("Proje bulunamadı.");
        }

        _projectRepository.Delete(project);
        await _projectRepository.SaveChangesAsync();
        return Result.Success();
    }
}
