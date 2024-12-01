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
    }
}