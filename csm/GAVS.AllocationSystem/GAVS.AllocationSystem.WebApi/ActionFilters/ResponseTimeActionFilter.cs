using GAVS.AllocationSystem.WebApi.Controllers;
using System;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace GAVS.AllocationSystem.WebApi.ActionFilters
{
    public class ResponseTimeActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            base.OnActionExecuting(actionContext);

            // Start the timer
            //actionContext.Request.Properties[actionContext.ActionDescriptor.ActionName] = Stopwatch.StartNew();
        }

        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            base.OnActionExecuted(actionExecutedContext);
            //Stopwatch watch = (Stopwatch)actionExecutedContext.Request.Properties[actionExecutedContext.ActionContext.ActionDescriptor.ActionName];
            //var timeElapsed = watch.Elapsed;
            //actionExecutedContext.Request.Properties[actionExecutedContext.ActionContext.ActionDescriptor.ActionName] = null;
            //var url = actionExecutedContext.Request.RequestUri.AbsoluteUri;
            //var empId = getEmpId(actionExecutedContext.Request);
            //var cldb = ((ApiControllerBase)actionExecutedContext.ActionContext.ControllerContext.Controller).Cldb;
            //cldb.API_RESPONSE_DURATION.Add(new Model.AllSys.API_RESPONSE_DURATION
            //{
            //    duration = Convert.ToDecimal(timeElapsed.TotalSeconds),
            //    CREATED_BY = empID,
            //    CREATED_DATE = DateTime.Now,
            //    URL = url
            //});
            //cldb.Commit();
        }

        private string getEmpId(HttpRequestMessage request)
        {
            var result = "Logger";
            if (request == null) return result;
            if (request.Headers.Contains("empId"))
            {
                try
                {
                    return request.Headers.GetValues("empId").ToList()[0];
                }
                catch { }
            }
            return result;
        }
    }
}