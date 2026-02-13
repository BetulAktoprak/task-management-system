using Business.Common;
using Business.DTOs.Dashboard;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Business.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DashboardDto>> GetDashboardStatsAsync()
    {
        var projectCount = await _context.Projects
            .CountAsync(p => !p.IsDeleted);

        var taskCount = await _context.Tasks
            .CountAsync(t => !t.IsDeleted);

        var completedTaskCount = await _context.Tasks
            .CountAsync(t => !t.IsDeleted && t.Status == Entity.Enums.TaskStatus.Done);

        var completedTaskPercentage = taskCount > 0
            ? Math.Round((double)completedTaskCount / taskCount * 100, 2)
            : 0;

        var dashboard = new DashboardDto
        {
            ProjectCount = projectCount,
            TaskCount = taskCount,
            CompletedTaskPercentage = completedTaskPercentage
        };

        return Result<DashboardDto>.Success(dashboard);
    }
}
