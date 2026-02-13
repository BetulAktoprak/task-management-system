using Business.Common;
using Business.DTOs.User;
using DataAccess;
using DataAccess.Repositories;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace Business.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly AppDbContext _context;

    public UserService(
        IRepository<User> userRepository,
        IRepository<Role> roleRepository,
        AppDbContext context)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _context = context;
    }

    public async Task<Result<List<UserDto>>> GetUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.Name)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                RoleName = u.Role.Name,
                RoleId = u.RoleId
            })
            .ToListAsync();

        return Result<List<UserDto>>.Success(users);
    }

    public async Task<Result<List<RoleDto>>> GetRolesAsync()
    {
        var roles = await _context.Roles
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name)
            .Select(r => new RoleDto { Id = r.Id, Name = r.Name })
            .ToListAsync();

        return Result<List<RoleDto>>.Success(roles);
    }

    public async Task<Result> AssignRoleAsync(AssignRoleDto assignRoleDto)
    {
        var user = await _userRepository.GetByIdAsync(assignRoleDto.UserId);
        if (user == null)
        {
            return Result.Failure("Kullanıcı bulunamadı.");
        }

        var role = await _roleRepository.GetByIdAsync(assignRoleDto.RoleId);
        if (role == null)
        {
            return Result.Failure("Rol bulunamadı.");
        }

        user.RoleId = role.Id;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        return Result.Success();
    }
}
