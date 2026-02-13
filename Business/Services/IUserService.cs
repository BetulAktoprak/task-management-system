using Business.Common;
using Business.DTOs.User;

namespace Business.Services;

public interface IUserService
{
    Task<Result<List<UserDto>>> GetUsersAsync();
    Task<Result<List<RoleDto>>> GetRolesAsync();
    Task<Result> AssignRoleAsync(AssignRoleDto assignRoleDto);
}
