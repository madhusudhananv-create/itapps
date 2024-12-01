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
        [GET("GetAppreciationDetails")]
        [ActionName("GetAppreciationDetails")]
        [HttpGet]
        public IHttpActionResult GetAppreciationDetails(string custId, bool projFlag)
        {
            var empId = this.GetHeaderDetails_String("empId");
            var projects = Cldb.PROJECT.GetAll().Where(t => t.CUST_ID == custId).OrderBy(t => t.PROJ_NM).ToList();
            string projIds = string.Join(",", projects.Select(t => t.PROJ_ID).ToArray());
            var appreciationList = CSPdb.AppRepo.GetAppreciationDetails(projIds).ToList();
            foreach (var appreciation in appreciationList)
            {
                if (appreciation.RECIPIENT_NM == null)
                    appreciation.RECIPIENT_NM = appreciation.RECIPIENT;
            }
            return Ok(appreciationList);
        }

        [POST("UpdateAppreciation")]
        [ActionName("UpdateAppreciation")]
        [HttpPost]
        public IHttpActionResult UpdateAppreciation([FromBody] APPRECIATION appreciation)
        {
            LogRequest(prefix: "UpdateAppreciation", content: JsonConvert.SerializeObject(appreciation));
            if (appreciation == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }

            if (appreciation.ID != 0)
            {
                UpdateAuditFields(appreciation);
                CSPdb.APPRECIATION.Update(appreciation);
            }
            else
            {
                UpdateAuditFields(appreciation);
                CSPdb.APPRECIATION.Add(appreciation);
            }

            CSPdb.Commit(CanCommit);
            return Ok();
        }

        [POST("DeleteAppreciation")]
        [ActionName("DeleteAppreciation")]
        [HttpPost]
        public IHttpActionResult DeleteAppreciation([FromBody] APPRECIATION appreciation)
        {
            LogRequest(prefix: "DeleteAppreciation", content: JsonConvert.SerializeObject(appreciation));
            if (appreciation == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }


            var exist = CSPdb.APPRECIATION.GetAll().FirstOrDefault(x => x.ID == appreciation.ID && x.ISACTIVE);
            if (exist == null) return Content(HttpStatusCode.Conflict, "Unable to find the appreciation.");


            exist.ISACTIVE = false;
            CSPdb.APPRECIATION.Update(exist);
            CSPdb.Commit(CanCommit);
            return Ok();
        }
    }
}
