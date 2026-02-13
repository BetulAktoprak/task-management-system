namespace Business.DTOs.Auth;

public class TokenDto
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int UserId { get; set; }
}
