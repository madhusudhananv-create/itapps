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

        [POST("GetMultiChecklistPreview")]
        [ActionName("GetMultiChecklistPreview")]
        [HttpPost]
        public IHttpActionResult GetMultiChecklistPreview([FromBody] List<int> checklistIds)
        {

            var watch = Stopwatch.StartNew();
            var result = new List<MULTI_CHECKLIST>();
            var allSelectedChecklists = CSPdb.PM_CHECKLIST.GetAll().Where(x => checklistIds.Contains(x.ID)).ToList();
            if (allSelectedChecklists.Count == 0)
                return Ok(result);

           
            foreach (var item in checklistIds)
            {
                var checklist = allSelectedChecklists.FirstOrDefault(x => x.ID == item);
                if (checklist != null)
                {
                    var output = new MULTI_CHECKLIST { CHECKLIST_ID = item };
                    output.CHECKLIST_NAME = checklist.TITLE;
                    output.VERSION = checklist.VERSION;
                    output.EFFECTIVE_FROM = checklist.EFFECTIVE_FROM;
                    output.QUESTIONS_BY_SERVICE_AREA = GetPreviewChecklistPrivate(item);
                    result.Add(output);
                }

            }
            FillResponseTime(watch);
            return Ok(result);
        }

        [POST("CreateNewMultiChecklist")]
        [ActionName("CreateNewMultiChecklist")]
        [HttpPost]
        public IHttpActionResult CreateNewMultiChecklist([FromBody] List<int> checklistIds, string title)
        {
            LogRequest(prefix: "CreateNewMultiChecklist");
            var watch = Stopwatch.StartNew();
            var result = new PM_CHECKLIST { VERSION =1m, TITLE = string.Empty, DESCRIPTION = string.Empty, EFFECTIVE_FROM = DateTime.Today };
       
            if (checklistIds == null || checklistIds.Count == 0)
                return Ok(result);

            var existing = CSPdb.PM_CHECKLIST.GetAll().Where(x => checklistIds.Contains(x.ID) && x.ISACTIVE).ToList();
            var maxMergeCount = 4;
            if (existing.Count <= 1)
            {
                return BadRequest($"Unable to Merge. Please select a minimum of 2 checklists to continue.");
            }
            int.TryParse(helper.GetDBConfig("MERGE_CHECKLIST_MAX", "-1"), out maxMergeCount);
            if (existing.Count > maxMergeCount)
            {
                return BadRequest($"Unable to Merge. Please select max of {maxMergeCount} checklists to continue.");
            }

            var firstChecklist = existing.First();

            //check weightage scores are equal for all checklist. else throw error
            var scores = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE_SCORES.GetAll().Where(x => checklistIds.Contains(x.CHECKLIST_ID) && x.ISACTIVE).ToList();
            var firstScore = scores.FirstOrDefault(x => x.CHECKLIST_ID == firstChecklist.ID && x.WEIGHTAGE_ID == 1)?.WEIGHTAGE_SCORE;
            var secondScore = scores.FirstOrDefault(x => x.CHECKLIST_ID == firstChecklist.ID && x.WEIGHTAGE_ID == 2)?.WEIGHTAGE_SCORE;
            var thirdScore = scores.FirstOrDefault(x => x.CHECKLIST_ID == firstChecklist.ID && x.WEIGHTAGE_ID == 3)?.WEIGHTAGE_SCORE;


            var errMsg = "Unable to Merge. The Weightage scores for {0} category are not the same for the selected checklists. Please select checklists with same weightage scores.";
            if (!scores.Where(x => x.WEIGHTAGE_ID == 1).ToList().TrueForAll(x => x.WEIGHTAGE_SCORE == firstScore))
            {
                //raise error MAJOR
                return BadRequest(string.Format(errMsg, "MAJOR"));
            }
            if (!scores.Where(x => x.WEIGHTAGE_ID == 2).ToList().TrueForAll(x => x.WEIGHTAGE_SCORE == secondScore))
            {
                //raise error MINOR
                return BadRequest(string.Format(errMsg, "MINOR"));
            }
            if (!scores.Where(x => x.WEIGHTAGE_ID == 3).ToList().TrueForAll(x => x.WEIGHTAGE_SCORE == thirdScore))
            {
                //raise error Mandatory
                return BadRequest(string.Format(errMsg, "MANDATORY"));
            }

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
            FillResponseTime(watch);
            return Ok(result);
        }



        //  Create the new checklists and its mappings 
        [POST("SaveNewMultiChecklist")]
        [ActionName("SaveNewMultiChecklist")]
        [HttpPost]
        public IHttpActionResult SaveNewMultiChecklist([FromBody] List<MULTI_CHECKLIST> multichecklists, int checklistId)
        {
            // select * from pm_checklist
            //select * from pm_checklist_questions where checklist_id in (97,98)
            // select * from pm_process_questions_mapping where question_id in (select id from  pm_checklist_questions where checklist_id in (97,98))r
            var watch = Stopwatch.StartNew();
            LogRequest(prefix: "SaveNewMultiChecklist");


            FillResponseTime(watch);

            return Ok();
        }
    }
}