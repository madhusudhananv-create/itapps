using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.SP;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.UI.WebControls;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [GET("GetMultiChecklistPreview")]
        [ActionName("GetMultiChecklistPreview")]
        [HttpGet]
        public IHttpActionResult GetMultiChecklistPreview(List<int> checklistIds)
        {
            var result = new List<MULTI_CHECKLIST>();
            foreach (var item in checklistIds)
            {
                var output = new MULTI_CHECKLIST { CHECKLIST_ID = item };
                output.CHECKLIST_NAME = CSPdb.PM_CHECKLIST.GetAll().FirstOrDefault(x => x.ID == item)?.TITLE;
                output.QUESTIONS_BY_SERVICE_AREA = GetPreviewChecklistPrivate(item);
            }

            return Ok(result);
        }

        [GET("CreateNewMultiChecklist")]
        [ActionName("CreateNewMultiChecklist")]
        [HttpGet]
        public IHttpActionResult CreateNewMultiChecklist(List<int> checklistIds, string title)
        {
            var result = new PM_CHECKLIST();
            result.TITLE = title;
            if (checklistIds == null || checklistIds.Count == 0)
                return Ok(result);

            var existing = CSPdb.PM_CHECKLIST.GetAll().Where(x => checklistIds.Contains(x.ID) && x.ISACTIVE).ToList();
            if (  existing.Count == 0)
                return Ok(result);

            var firstChecklist = existing.First();
            if (existing.TrueForAll(x => x.MATURITY_LEVEL == firstChecklist.MATURITY_LEVEL))
                result.MATURITY_LEVEL = firstChecklist.MATURITY_LEVEL;

            if (existing.TrueForAll(x => x.CORRECTIVE_ACTION_TRACKING == firstChecklist.CORRECTIVE_ACTION_TRACKING))
                result.CORRECTIVE_ACTION_TRACKING = firstChecklist.CORRECTIVE_ACTION_TRACKING;

            if (existing.TrueForAll(x => x.FINDINGSTYPE_ID == firstChecklist.FINDINGSTYPE_ID))
                result.FINDINGSTYPE_ID = firstChecklist.FINDINGSTYPE_ID;

            if (existing.TrueForAll(x => x.IS_WEIGHTAGE_APPLICABLE == firstChecklist.IS_WEIGHTAGE_APPLICABLE))
                result.IS_WEIGHTAGE_APPLICABLE = firstChecklist.IS_WEIGHTAGE_APPLICABLE;

            if (existing.TrueForAll(x => x.PROCESS_MODEL_ID == firstChecklist.PROCESS_MODEL_ID))
                result.PROCESS_MODEL_ID = firstChecklist.PROCESS_MODEL_ID;

            if (existing.TrueForAll(x => x.STATUS_LIST_ID == firstChecklist.STATUS_LIST_ID))
                result.STATUS_LIST_ID = firstChecklist.STATUS_LIST_ID;

            return Ok(result);
        }



        //  Create the new checklists and its mappings 

    }
}