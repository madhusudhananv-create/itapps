using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi
{
    public class RouteConfig
    {
        public static string ControllerOnly = "ApiControllerOnly";
        public static string ControllerAndId = "ApiControllerAndIntegerId";
        public static string ControllerAction = "ApiControllerAction";
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            //routes.MapRoute(
            //    name: "Default",
            //    url: "{controller}/{action}/{id}",
            //    defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            //);

            routes.MapHttpRoute(
              name: ControllerOnly,
              routeTemplate: "api/{controller}"
            );

            routes.MapHttpRoute(
              name: ControllerAndId,
              routeTemplate: "api/{controller}/{id}",
              defaults: null, //defaults: new { id = RouteParameter.Optional } //,
              constraints: new { id = @"^\d+$" }
            );

            routes.MapHttpRoute(
              name: ControllerAction,
              routeTemplate: "api/{controller}/{action}"
            );
        }
    }
}
