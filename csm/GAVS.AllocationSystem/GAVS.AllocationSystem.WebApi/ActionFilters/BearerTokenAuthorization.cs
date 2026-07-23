using GAVS.AllocationSystem.Data;
using GAVS.AllocationSystem.Data.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace GAVS.AllocationSystem.WebApi.ActionFilters
{
    public class BearerTokenAuthorizationAttribute : ActionFilterAttribute
    {
        private bool validate = true;
        public BearerTokenAuthorizationAttribute()
        { }
        public BearerTokenAuthorizationAttribute(bool bValidate)
        {
            validate = bValidate;
        }
        private const string Token = "token";
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (validate)
            {


                CloudDbContext objCIDSDbContext = new CloudDbContext();
                ITokenRepository UserToken = new TokenRepository(objCIDSDbContext);
                if (actionContext.Request.Headers.Contains(Token))
                {
                    var tokenValue = actionContext.Request.Headers.GetValues(Token).First();
                    var validateToken = UserToken.ValidateToken(tokenValue);
                    if (!validateToken.Item2)
                    {
                        var responseMessage = new HttpResponseMessage(HttpStatusCode.Unauthorized) { ReasonPhrase = "Invalid Token" };
                        actionContext.Response = responseMessage;
                    }
                    //verify its application call or integration call
                    else
                    {
                        var actionDescriptor = actionContext.ActionDescriptor;
                        var actionName = actionDescriptor.ActionName;
                        if (integrationMethods.Contains(actionName))
                        {
                            if (!integrationUsers.Contains(validateToken.Item1))
                            {
                                //var responseMessage = new HttpResponseMessage(HttpStatusCode.Unauthorized) { ReasonPhrase = "Invalid User" };
                                //actionContext.Response = responseMessage;
                            }
                        }
                        else
                        {
                            if (integrationUsers.Contains(validateToken.Item1))
                            {
                                //var responseMessage = new HttpResponseMessage(HttpStatusCode.Unauthorized) { ReasonPhrase = "Invalid User" };
                                //actionContext.Response = responseMessage;
                            }
                        }
                    }
                }
                else
                {
                    var responseMessage = new HttpResponseMessage(HttpStatusCode.Unauthorized) { ReasonPhrase = "Invalid Token" };
                    actionContext.Response = responseMessage;
                }
            }
            base.OnActionExecuting(actionContext);
        }



        private List<string> integrationMethods = new List<string> { "AddNewCustomer", };
        private List<string> integrationUsers = new List<string> { "roopsundar@outlook.com", "integration@gslab.com" };
    }
}