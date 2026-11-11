using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;
using System.Net;

namespace GAVS.AllocationSystem.WebApi
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            // Code that runs on application startup
            HttpConfiguration config = new HttpConfiguration();
            //app.UseWebApi(config);

            GlobalConfig.CustomizeConfig(GlobalConfiguration.Configuration);
            AreaRegistration.RegisterAllAreas();
            IocConfig.RegisterIoc(GlobalConfiguration.Configuration);
            //FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }

        //protected void Application_BeginRequest(object sender, EventArgs e)
        //{
        //    if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
        //    {
        //        HttpContext.Current.Response.Flush();
        //    }
        //}

        // VAPT-flagged: Information Disclosure via Banner Grabbing. The "Server" header
        // (e.g. "Microsoft-IIS/10.0") is owned by IIS itself and can't be removed via
        // Web.config's <httpProtocol><customHeaders> (that only strips headers ASP.NET
        // itself adds, like X-Powered-By). PreSendRequestHeaders is the one point late
        // enough in the pipeline that the header collection is mutable and IIS hasn't
        // already flushed it.
        protected void Application_PreSendRequestHeaders(object sender, EventArgs e)
        {
            var response = HttpContext.Current?.Response;
            if (response == null) return;
            response.Headers.Remove("Server");
            response.Headers.Remove("X-AspNet-Version");
            response.Headers.Remove("X-AspNetMvc-Version");
            response.Headers.Remove("X-Powered-By");
        }
    }
}