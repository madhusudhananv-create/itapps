using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.DirectoryServices.AccountManagement;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.ServiceModel.Security.Tokens;
using System.Security.Claims;
using System.Threading;
using System.Diagnostics;
using System.ServiceModel.Security;
using DocumentFormat.OpenXml.Office2013.Excel;
using GAVS.AllocationSystem.Model.AllSys.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [GET("GetSupportValueTypeList"), ActionName("GetSupportValueTypeList"), HttpGet]
        public IHttpActionResult GetSupportValueTypeList()
        {
            var result = CSPdb.SUPPORT_VALUE_TYPE.GetAll().ToList();

            return this.Ok(result);
        }

        [GET("GetSupportValueDataList"), ActionName("GetSupportValueDataList"), HttpGet]
        public IHttpActionResult GetSupportValueDataList()
        {
            var result = CSPdb.SUPPORT_VALUE_REQUEST.GetAll().Where(x => x.ISACTIVE).OrderByDescending(x => x.ID).ToList();

            return this.Ok(result);
        }

        [POST("SaveSupportValueDataRequest"), ActionName("SaveSupportValueDataRequest"), HttpPost]
        public IHttpActionResult SaveSupportValueDataRequest([FromBody]SUPPORT_VALUE_REQUEST supportValueRequest)
        {
            if (supportValueRequest.ID > 0)
            {
                CSPdb.SUPPORT_VALUE_REQUEST.Update(supportValueRequest);
            }
            else
            {
                CSPdb.SUPPORT_VALUE_REQUEST.Add(supportValueRequest);
            }
            CSPdb.Commit(CanCommit);
            // send mail

            return this.Ok();
        }



    }
}