using GAVS.AllocationSystem.WebApi;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace GAVS.AllocationSystem.WebApi
{
    public static class GlobalConfig
    {
        public static void CustomizeConfig(HttpConfiguration config)
        {
            config.Formatters.Remove(config.Formatters.XmlFormatter);
            //config.EnableCors();

            bool isProd;
            bool.TryParse(ConfigurationManager.AppSettings["IsProd"], out isProd);

            if (!isProd)
            {
                var cors = new EnableCorsAttribute("*", "*", "*"); //https://docs.microsoft.com/en-us/aspnet/web-api/overview/security/enabling-cross-origin-requests-in-web-api
                config.EnableCors(cors);
            }
            var json = config.Formatters.JsonFormatter;
            json.SerializerSettings.ContractResolver =
                new CamelCasePropertyNamesContractResolver();
            //json.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Local;
            // config.Filters.Add(new ValidationActionFilter());

            /*
             config.Formatters.JsonFormatter.SerializerSettings =
    new JsonSerializerSettings
    {
        DateFormatHandling = DateFormatHandling.IsoDateFormat,
        DateTimeZoneHandling = DateTimeZoneHandling.Unspecified,
        ContractResolver = new CamelCasePropertyNamesContractResolver()
        };
            var json = config.Formatters.JsonFormatter;
            json.SerializerSettings.ContractResolver =
                new CamelCasePropertyNamesContractResolver();
        }
             */
        }

    }
}