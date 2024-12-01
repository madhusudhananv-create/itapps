using GAVS.AllocationSystem.Model.CSP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data.Contracts
{
    public interface IRepository_CSP<T> where T : class
    {
        IQueryable<T> GetAll();
        T GetById(dynamic id);
        void Add(T entity);
        void AddList(List<T> entities);
        void Update(T entity);
        void Delete(T entity);
        void DeleteList(List<T> entities);
        void Delete(int id);
        void Update(List<T> entities);
        
    }
}
