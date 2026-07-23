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
using GAVS.AllocationSystem.WebApi.Models;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [GET("GetAuditorQualifiedStandardSummary")]
        [ActionName("GetAuditorQualifiedStandardSummary")]
        [HttpGet]
        public IHttpActionResult GetAuditorQualifiedStandardSummary()
        {
            var auditorQualifiedStandardDetails = Cldb.AppRepo.GetAuditorQualifiedStandardSummary().ToList();
            return Ok(auditorQualifiedStandardDetails);
        }

        [GET("GetQASpocDetails")]
        [ActionName("GetQASpocDetails")]
        [HttpGet]
        public IHttpActionResult GetQASpocDetails()
        {
            var empInfo = Cldb.EMP_INFO.GetAll().Where(t => t.DOR == null && t.CSM_TITLE_ID == 7).OrderBy(t => t.FRST_NM).ToList();
            return Ok(empInfo);
        }

        [POST("UpdateAuditor")]
        [ActionName("UpdateAuditor")]
        [HttpPost]
        public IHttpActionResult UpdateAuditor([FromBody] AUDITOR_QUALIFIED_STANDARDS auditorStandards)
        {
            CheckAccessForFeature(90);
            LogRequest(content: JsonConvert.SerializeObject(auditorStandards));
            if (auditorStandards == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }

            var existing = Cldb.AUDITOR_QUALIFIED_STANDARDS.GetAll().Where(x => x.EMP_ID == auditorStandards.EMP_ID && x.ISACTIVE).ToList();
            foreach (var item in existing)
            {
                item.ISACTIVE = false;
                Cldb.AUDITOR_QUALIFIED_STANDARDS.Update(item);
            }

            var processList = auditorStandards.PROCESS_MODEL_ID.Split(',');

            foreach (var item in processList)
            {
                if (!int.TryParse(item, out var val)) continue;
                auditorStandards.QUALIFIED_STANDARDS = val;
                var exist = existing.FirstOrDefault(x => x.QUALIFIED_STANDARDS == val);

                if (exist != null)
                {
                    UpdateAuditFields(exist);
                    Cldb.AUDITOR_QUALIFIED_STANDARDS.Update(exist);
                }
                else
                {
                    var newAuditorStandards = new AUDITOR_QUALIFIED_STANDARDS
                    {
                        EMP_ID = auditorStandards.EMP_ID,
                        QUALIFIED_STANDARDS = auditorStandards.QUALIFIED_STANDARDS,
                        EFFECTIVE_FROM = auditorStandards.EFFECTIVE_FROM,
                        QUALIFICATION_STATUS = "Active"
                    };
                    UpdateAuditFields(newAuditorStandards);
                    Cldb.AUDITOR_QUALIFIED_STANDARDS.Add(newAuditorStandards);
                }
            }
            Cldb.Commit(CanCommit);
            return Ok();
        }
    }
}
