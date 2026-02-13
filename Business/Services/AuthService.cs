using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Business.Common;
using Business.DTOs.Auth;
using DataAccess;
using DataAccess.Repositories;
using Entity;
using Entity.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Business.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(
        IRepository<User> userRepository,
        IRepository<Role> roleRepository,
        AppDbContext context,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _context = context;
        _configuration = configuration;
    }

    public async Task<Result<TokenDto>> RegisterAsync(RegisterDto registerDto)
    {
        // Email kontrolü
        var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
        if (existingUser != null)
        {
            return Result<TokenDto>.Failure("Bu email adresi zaten kullanılıyor.");
        }

        // Default role: Developer
        var defaultRole = await _roleRepository.FirstOrDefaultAsync(r => r.Name == RoleNames.Developer);
        if (defaultRole == null)
        {
            return Result<TokenDto>.Failure("Sistem hatası: Varsayılan rol bulunamadı.");
        }

        // Şifre hash'leme
        var passwordHash = HashPassword(registerDto.Password);

        // Yeni kullanıcı oluştur
        var user = new User
        {
            Name = registerDto.Name,
            Email = registerDto.Email,
            PasswordHash = passwordHash,
            RoleId = defaultRole.Id
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Token oluştur ve döndür
        var tokenDto = GenerateToken(user);
        return Result<TokenDto>.Success(tokenDto);
    }

    public async Task<Result<TokenDto>> LoginAsync(LoginDto loginDto)
    {
        // Kullanıcıyı email ile bul
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email && !u.IsDeleted);

        if (user == null)
        {
            return Result<TokenDto>.Failure("Email veya şifre hatalı.");
        }

        // Şifre kontrolü
        if (!VerifyPassword(loginDto.Password, user.PasswordHash))
        {
            return Result<TokenDto>.Failure("Email veya şifre hatalı.");
        }

        // Token oluştur ve döndür
        var tokenDto = GenerateToken(user);
        return Result<TokenDto>.Success(tokenDto);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private bool VerifyPassword(string password, string passwordHash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == passwordHash;
    }

    private TokenDto GenerateToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey bulunamadı.");
        var issuer = jwtSettings["Issuer"] ?? "TaskManagementSystem";
        var audience = jwtSettings["Audience"] ?? "TaskManagementSystem";
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var roleName = user.Role?.Name ?? "Developer";
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, roleName)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return new TokenDto
        {
            AccessToken = tokenString,
            Expiration = token.ValidTo,
            Email = user.Email,
            Name = user.Name,
            UserId = user.Id
        };
    }
}
