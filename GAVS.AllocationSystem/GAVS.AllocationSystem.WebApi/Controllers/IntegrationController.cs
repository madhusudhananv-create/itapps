using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [POST("UpdateProjectDetailsFromSOW")]
        [ActionName("UpdateProjectDetailsFromSOW")]
        [HttpPost]
        public IHttpActionResult UpdateProjectDetailsFromSOW([FromBody] string sowText, string customerId, string projectId)
        {
            //1. check if project is available and in active state. if not throw error with proper error msg.
            //2. Retrive the project and update the values - this will be done later once requirement is spcified clearly.
            //3. save the project in DB
            //4. send mail of updated values (reuse existing methods from risk/action item etc)
            //Additionally check what all validation to be performed in incoming json.


            return Ok();

        }
    }
}