using System.Security.Claims;
using Business.DTOs.User;
using Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Mevcut kullanıcının bilgilerini getirir.
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var result = await _userService.GetUserByIdAsync(userId.Value);

        if (result.IsFailure)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Tüm kullanıcıları listeler. Sadece Admin erişebilir.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _userService.GetUsersAsync();

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Görev atama vb. için kullanıcı listesini döndürür. Tüm giriş yapmış kullanıcılar erişebilir.
    /// </summary>
    [HttpGet("for-assignment")]
    public async Task<IActionResult> GetUsersForAssignment()
    {
        var result = await _userService.GetUsersForAssignmentAsync();

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Rol listesini döndürür. Rol atama için kullanılır.
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetRoles()
    {
        var result = await _userService.GetRolesAsync();

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Kullanıcıya rol atar. Sadece Admin erişebilir.
    /// </summary>
    [HttpPut("{userId}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignRole(int userId, int roleId)
    {
        var assignRoleDto = new AssignRoleDto
        {
            UserId = userId,
            RoleId = roleId
        };

        var result = await _userService.AssignRoleAsync(assignRoleDto);

        if (result.IsFailure)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { message = "Rol başarıyla atandı." });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

