using System.Linq.Expressions;
using Entity;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Where(x => !x.IsDeleted)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet
            .Where(x => !x.IsDeleted)
            .ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet
            .Where(x => !x.IsDeleted)
            .Where(predicate)
            .ToListAsync();
    }

    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet
            .Where(x => !x.IsDeleted)
            .FirstOrDefaultAsync(predicate);
    }

    public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet
            .Where(x => !x.IsDeleted)
            .AnyAsync(predicate);
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        var query = _dbSet.Where(x => !x.IsDeleted);
        
        if (predicate != null)
        {
            query = query.Where(predicate);
        }
        
        return await query.CountAsync();
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        await _dbSet.AddAsync(entity);
        return entity;
    }

    public virtual async Task AddRangeAsync(IEnumerable<T> entities)
    {
        foreach (var entity in entities)
        {
            entity.CreatedAt = DateTime.UtcNow;
        }
        await _dbSet.AddRangeAsync(entities);
    }

    public virtual void Update(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _dbSet.Update(entity);
    }

    public virtual void UpdateRange(IEnumerable<T> entities)
    {
        foreach (var entity in entities)
        {
            entity.UpdatedAt = DateTime.UtcNow;
        }
        _dbSet.UpdateRange(entities);
    }

    public virtual void Delete(T entity)
    {
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        _dbSet.Update(entity);
    }

    public virtual void DeleteRange(IEnumerable<T> entities)
    {
        foreach (var entity in entities)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
        }
        _dbSet.UpdateRange(entities);
    }

    public virtual async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
