using GAVS.AllocationSystem.Data;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Filters;

namespace GAVS.AllocationSystem.WebApi.ActionFilters
{
    public class ExceptionFilter : ExceptionFilterAttribute
    {
#pragma warning disable CS1998 // This async method lacks 'await' operators and will run synchronously. Consider using the 'await' operator to await non-blocking API calls, or 'await Task.Run(...)' to do CPU-bound work on a background thread.
        public async override void OnException(HttpActionExecutedContext context)
#pragma warning restore CS1998 // This async method lacks 'await' operators and will run synchronously. Consider using the 'await' operator to await non-blocking API calls, or 'await Task.Run(...)' to do CPU-bound work on a background thread.
        {
            //if (context.Exception != null)
            //{
            //    if (context.Exception.GetType() == typeof(TaskCanceledException))
            //        return;
            //}
            Logger log = new Logger(context);
            if (context.Exception != null)
            {

            }
        }
    }
}