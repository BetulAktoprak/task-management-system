using System.Security.Cryptography;
using System.Text;
using Entity;
using Entity.Constants;
using Entity.Enums;
using Microsoft.EntityFrameworkCore;

namespace DataAccess;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // TaskStatus enum -> string veya int olarak saklanır (varsayılan int)
        modelBuilder.Entity<TaskItem>()
            .Property(t => t.Status)
            .HasConversion<int>();

        // İlişkiler Fluent API ile (opsiyonel - EF Core convention ile de çözülebilir)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.Creator)
            .WithMany(u => u.CreatedProjects)
            .HasForeignKey(p => p.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.AssignedUser)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssignedUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // User Email unique
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Role seed
        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = RoleNames.Admin, CreatedAt = seedDate },
            new Role { Id = 2, Name = RoleNames.ProjectManager, CreatedAt = seedDate },
            new Role { Id = 3, Name = RoleNames.Developer, CreatedAt = seedDate }
        );

        // Admin user seed (email: admin@admin.com, password: 123456)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@admin.com",
                PasswordHash = HashPasswordForSeed("123456"),
                RoleId = 1,
                CreatedAt = seedDate,
                IsDeleted = false
            }
        );
    }

    /// <summary>
    /// AuthService ile aynı algoritma: SHA256 + Base64 (seed için).
    /// </summary>
    private static string HashPasswordForSeed(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}
