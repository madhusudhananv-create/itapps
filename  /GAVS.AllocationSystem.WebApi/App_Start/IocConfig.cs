using GAVS.AllocationSystem.Data;
using GAVS.AllocationSystem.Data.Contracts;
using Ninject;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi
{
    public class IocConfig
    {
        public static void RegisterIoc(HttpConfiguration config)
        {
            var kernel = new StandardKernel(); // Ninject IoC

            // These registrations are "per instance request".
            // See http://blog.bobcravens.com/2010/03/ninject-life-cycle-management-or-scoping/

            kernel.Bind<RepositoryFactories>().To<RepositoryFactories>()
                .InSingletonScope();

            kernel.Bind<IRepositoryProvider>().To<RepositoryProvider>();
            kernel.Bind<ICloudDB>().To<CloudDB>();

            kernel.Bind<RepositoryFactories_CSP>().To<RepositoryFactories_CSP>()
                .InSingletonScope();

            kernel.Bind<IRepositoryProvider_CSP>().To<RepositoryProvider_CSP>();
            kernel.Bind<ICSPDB>().To<CSPDB>();

            // Tell WebApi how to use our Ninject IoC
            config.DependencyResolver = new NinjectDependencyResolver(kernel);
        }
    }
}