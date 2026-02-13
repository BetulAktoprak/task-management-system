using Business.Common;
using Business.DTOs.Auth;

namespace Business.Services;

public interface IAuthService
{
    Task<Result<TokenDto>> RegisterAsync(RegisterDto registerDto);
    Task<Result<TokenDto>> LoginAsync(LoginDto loginDto);
}
