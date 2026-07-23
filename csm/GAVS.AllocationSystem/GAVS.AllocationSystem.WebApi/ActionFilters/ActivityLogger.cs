using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace GAVS.AllocationSystem.WebApi.ActionFilters
{
    public class ActivityLogger : ActionFilterAttribute
    {
#pragma warning disable CS1998 // This async method lacks 'await' operators and will run synchronously. Consider using the 'await' operator to await non-blocking API calls, or 'await Task.Run(...)' to do CPU-bound work on a background thread.

        public override async void OnActionExecuting(HttpActionContext context)
#pragma warning restore CS1998 // This async method lacks 'await' operators and will run synchronously. Consider using the 'await' operator to await non-blocking API calls, or 'await Task.Run(...)' to do CPU-bound work on a background thread.
        {
            Logger log = new Logger(context);
        }
    }
}