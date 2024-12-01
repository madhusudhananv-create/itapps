using System;
using System.Collections.Generic;
using System.Data.Entity;
using GAVS.AllocationSystem.Data.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public class RepositoryFactories_CSP
    {
private IDictionary<Type, Func<DbContext, object>> GetCloudFactories()
{
    return new Dictionary<Type, Func<DbContext, object>>
    {
 {typeof(IAppRepository_CSP), dbContext_CSP => new AppRepository_CSP(dbContext_CSP)},
    };
}

public RepositoryFactories_CSP()
{
    _repositoryFactories = GetCloudFactories();
}

public RepositoryFactories_CSP(IDictionary<Type, Func<DbContext, object>> factories)
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
    return dbContext => new EFRepository_CSP<T>(dbContext);
}

private readonly IDictionary<Type, Func<DbContext, object>> _repositoryFactories;
    }
}
