using Business.Common;
using Business.DTOs.Dashboard;

namespace Business.Services;

public interface IDashboardService
{
    Task<Result<DashboardDto>> GetDashboardStatsAsync();
}
