using System;
using System.Collections.Generic;
using System.Data.Entity;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Data;

namespace GAVS.AllocationSystem.Data
{
    public class RepositoryFactories
    {
private IDictionary<Type, Func<DbContext, object>> GetCloudFactories()
{
    return new Dictionary<Type, Func<DbContext, object>>
    {
 {typeof(IAppRepository), dbContext => new AppRepository(dbContext)}
    };
}

public RepositoryFactories()
{
    _repositoryFactories = GetCloudFactories();
}

public RepositoryFactories(IDictionary<Type, Func<DbContext, object>> factories)
{
    _repositoryFactories = factories;
}

public Func<DbContext, object> GetRepositoryFactory<T>()
{

    Func<DbContext, object> factory;
    _repositoryFactories.TryGetValue(typeof(T), out factory);
    return factory;
}


public Func<DbContext, object> GetRepositoryFactoryForEntityType<T>() where T : class
{
    return GetRepositoryFactory<T>() ?? DefaultEntityRepositoryFactory<T>();
}


protected virtual Func<DbContext, object> DefaultEntityRepositoryFactory<T>() where T : class
{
    return dbContext => new EFRepository<T>(dbContext);
}

private readonly IDictionary<Type, Func<DbContext, object>> _repositoryFactories;

    }
}
