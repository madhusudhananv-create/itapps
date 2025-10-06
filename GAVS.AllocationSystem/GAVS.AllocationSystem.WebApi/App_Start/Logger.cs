using GAVS.AllocationSystem.Data;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace GAVS.AllocationSystem.WebApi
{
    public class Logger
    {
        public Logger(HttpActionExecutedContext context)
        {
            string token = context.Request.Headers.GetValues("token").First();
            CloudDbContext objCIDSDbContext = new CloudDbContext();
            IActivityLogs logger = new ActivityLogs(objCIDSDbContext);

            ACTIVITY_LOGS log = new ACTIVITY_LOGS();
            log.EMAIL_ID = token;
            log.CREATED_DATE = DateTime.Now;
            log.REQUEST_URL = context.Request.RequestUri.ToString();
            log.METHOD = context.Request.Method.ToString();
            log.EXCEPTION = context.Exception.ToString();
            if (context.Exception.InnerException != null)
            {
                log.INNER_EXCEPTION = context.Exception.InnerException.ToString();
                if (context.Exception.InnerException.InnerException != null)
                    log.INNER_EXCEPTION = "~" + context.Exception.InnerException.InnerException.ToString();
            }
            log.STACK_TRACE = context.Exception.StackTrace;
            logger.logWithToken(log);
        }
        public Logger(HttpRequestMessage request, Exception exception, string prefix = "", string content = "")
        {
            CloudDbContext objCIDSDbContext = new CloudDbContext();
            IActivityLogs logger = new ActivityLogs(objCIDSDbContext);
            ACTIVITY_LOGS log = new ACTIVITY_LOGS();
            var url = prefix == "PSA:" ? prefix + request.RequestUri.ToString() : request.RequestUri.ToString();
            if (request.Headers.Contains("token"))
            {
                string token = request.Headers.GetValues("token").First();
                log.EMAIL_ID = token;
                log.CREATED_DATE = DateTime.Now;

                log.REQUEST_URL = url;
                if (!string.IsNullOrWhiteSpace(content))
                    log.CONTENT = content;
                else if (request.Content != null)
                    log.CONTENT = request.Content.ReadAsStringAsync().Result;


                if (exception != null)
                {
                    log.EXCEPTION = exception.Message;
                    log.STACK_TRACE = exception.StackTrace;
                    if (exception.InnerException != null)
                    {
                        log.INNER_EXCEPTION = exception.InnerException.ToString();
                        if (exception.InnerException.InnerException != null)
                            log.INNER_EXCEPTION = "~" + exception.InnerException.InnerException.ToString();
                    }
                }
                log.METHOD = request.Method.ToString();
                logger.logWithToken(log);
            }
            else if (request.Headers.Authorization != null)
            {
                string authenticationString = request.Headers.Authorization.Parameter;
                string originalString = string.Empty;
                originalString = Encoding.UTF8.GetString(Convert.FromBase64String(authenticationString));
                string emailid = originalString.Split(':')[0];
                log.EMAIL_ID = emailid;
                log.CREATED_DATE = DateTime.Now;
                log.REQUEST_URL = url;
                if (exception != null)
                {
                    log.EXCEPTION = exception.Message;
                    log.STACK_TRACE = exception.StackTrace;
                    if (exception.InnerException != null)
                    {
                        log.INNER_EXCEPTION = exception.InnerException.ToString();
                        if (exception.InnerException.InnerException != null)
                            log.INNER_EXCEPTION = "~" + exception.InnerException.InnerException.ToString();
                    }
                }
                log.METHOD = request.Method.ToString();
                if (request.Content != null)
                    log.CONTENT = request.Content.ReadAsStringAsync().Result;
                logger.logWithEmailid(log);
            }
            else
            {
                log.EMAIL_ID = "Unhandled";
                log.CREATED_DATE = DateTime.Now;
                log.REQUEST_URL = url;
                if (exception != null)
                {
                    log.EXCEPTION = exception.Message;
                    log.STACK_TRACE = exception.StackTrace;
                    if (exception.InnerException != null)
                    {
                        log.INNER_EXCEPTION = exception.InnerException.ToString();
                        if (exception.InnerException.InnerException != null)
                            log.INNER_EXCEPTION = "~" + exception.InnerException.InnerException.ToString();
                    }
                }
                log.METHOD = request.Method.ToString();
                  if (request.Content != null)
                    log.CONTENT = request.Content.ReadAsStringAsync().Result;
                logger.logWithEmailid(log);
            }
        }

        public Logger(HttpRequestMessage request, string exception = "", string prefix = "")
        {
            CloudDbContext objCIDSDbContext = new CloudDbContext();
            IActivityLogs logger = new ActivityLogs(objCIDSDbContext);
            ACTIVITY_LOGS log = new ACTIVITY_LOGS();

            if (request.Headers.Contains("token"))
            {
                string token = request.Headers.GetValues("token").FirstOrDefault();

                if (request.Headers.Contains("EmailId"))
                    log.EMAIL_ID = request.Headers.GetValues("EmailId").First();
                else
                    log.EMAIL_ID = "unhandled";
                log.CREATED_DATE = DateTime.Now;
                log.REQUEST_URL = request.RequestUri.ToString();
                log.EXCEPTION = exception;
                log.METHOD = request.Method.ToString();
                logger.logWithEmailid(log);
            }
            else if (request.Headers.Authorization != null)
            {
                string authenticationString = request.Headers.Authorization.Parameter;
                string originalString = string.Empty;
                originalString = Encoding.UTF8.GetString(Convert.FromBase64String(authenticationString));
                string emailid = originalString.Split(':')[0];
                log.EMAIL_ID = emailid;
                log.CREATED_DATE = DateTime.Now;
                log.REQUEST_URL = request.RequestUri.ToString();
                log.EXCEPTION = exception;
                log.METHOD = request.Method.ToString();
                logger.logWithEmailid(log);
            }
            else
            {
                log.EMAIL_ID = "Unhandled";
                log.CREATED_DATE = DateTime.Now;
                log.REQUEST_URL = prefix + request.RequestUri.ToString();
                log.EXCEPTION = exception;
                log.METHOD = request.Method.ToString();
                logger.logWithEmailid(log);
            }
        }
        public Logger(HttpResponseMessage response)
        {
            CloudDbContext objCIDSDbContext = new CloudDbContext();
            IActivityLogs logger = new ActivityLogs(objCIDSDbContext);
            ACTIVITY_LOGS log = new ACTIVITY_LOGS();

            if (response.Headers.Contains("token"))
            {
                string token = response.Headers.GetValues("token").First();
                if (response.Headers.Contains("EmailId"))
                    log.EMAIL_ID = response.Headers.GetValues("EmailId").First();
                else
                    log.EMAIL_ID = "unhandled";
                log.CREATED_DATE = DateTime.Now;
                string url = response.RequestMessage.RequestUri.ToString();
                if (url.Contains("?"))
                    url = url.Split('?')[0];
                log.REQUEST_URL = url;
                log.METHOD = response.RequestMessage.Method.ToString();
                logger.logWithEmailid(log);
            }
        }
        public Logger(HttpActionContext context)
        {
            CloudDbContext objCIDSDbContext = new CloudDbContext();
            IActivityLogs logger = new ActivityLogs(objCIDSDbContext);
            ACTIVITY_LOGS log = new ACTIVITY_LOGS();

            if (context.Request.Headers.Contains("token"))
            {
                string token = context.Request.Headers.GetValues("token").First();
                log.EMAIL_ID = token;
                log.CREATED_DATE = DateTime.Now;
                log.REQUEST_URL = context.Request.RequestUri.ToString();
                log.METHOD = context.Request.Method.ToString();
                logger.logWithToken(log);
            }
            else if (context.Request.Headers.Authorization != null)
            {
                string authenticationString = context.Request.Headers.Authorization.Parameter;
                string originalString = string.Empty;
                originalString = Encoding.UTF8.GetString(Convert.FromBase64String(authenticationString));
                string emailid = originalString.Split(':')[0];
                log.EMAIL_ID = emailid;
                log.CREATED_DATE = DateTime.Now;
                log.REQUEST_URL = context.Request.RequestUri.ToString();
                log.METHOD = context.Request.Method.ToString();
                logger.logWithEmailid(log);
            }
        }
    }
}