using GAVS.AllocationSystem.Data.Contracts;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public interface IRepositoryProvider_CSP
    {
DbContext DbContext { get; set; }

IRepository_CSP<T> GetRepositoryForEntityType<T>() where T : class;


T GetRepository<T>(Func<DbContext, object> factory = null) where T : class;

void SetRepository<T>(T repository);
    }
}
