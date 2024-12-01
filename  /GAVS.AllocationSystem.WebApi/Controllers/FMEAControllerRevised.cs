using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [POST("GetProjectSpecificFailures")]
        [ActionName("GetProjectSpecificFailures")]
        [HttpPost]
        public IHttpActionResult GetProjectSpecificFailures([FromBody] FailureModeFilters input)
        {
            ValidateReqest(input);
            return Ok(CSPdb.AppRepo.GetProjectSpecificFailures(input));
        }

        [POST("UpdateProjectFailure")]
        [ActionName("UpdateProjectFailure")]
        [HttpPost]
        public IHttpActionResult UpdateProjectFailure([FromBody] PROJECT_FAILURES_MAPPING[] input)
        {
            ValidateReqest(input);
            var addList = new List<PROJECT_FAILURES_MAPPING>();
            var updateList = new List<PROJECT_FAILURES_MAPPING>();

            foreach (var row in input)
            {
                var mapping = GetEntity(CSPdb.PROJECT_FAILURES_MAPPING.GetAll(), row);

                mapping.ID = row.ID;
                mapping.FAILURE_MODE_ID = row.FAILURE_MODE_ID;
                mapping.PROJECT_ID = row.PROJECT_ID;
                mapping.RF_OCCURRENCE_ID = row.RF_OCCURRENCE_ID;
                mapping.RF_SEVERITY_ID = row.RF_SEVERITY_ID;
                mapping.RF_DETECTION_ID = row.RF_DETECTION_ID;
                mapping.RPN = row.RPN;
                mapping.CURRENT_DETECTION_CONTROL = row.CURRENT_DETECTION_CONTROL;
                mapping.CURRENT_PREVENTIVE_CONTROL = row.CURRENT_PREVENTIVE_CONTROL;
                mapping.RESPONSIBLE = row.RESPONSIBLE;
                mapping.RECOMMENDED_DETECTIVE_CONTROL = row.RECOMMENDED_DETECTIVE_CONTROL;
                mapping.RECOMMENDED_PREVENTIVE_CONTROL = row.RECOMMENDED_PREVENTIVE_CONTROL;
                mapping.POTENTIAL_CAUSE = row.POTENTIAL_CAUSE;
                mapping.POTENTIAL_CAUSE_FACTOR = row.POTENTIAL_CAUSE_FACTOR;
                mapping.POTENTIAL_EFFECT_OF_FAILURE = row.POTENTIAL_EFFECT_OF_FAILURE;
                mapping.ISAPPLICABLE = row.ISAPPLICABLE;
                mapping.ISAPPROVED = row.ISAPPROVED;
                if (mapping.ID == 0)
                    addList.Add(mapping);
                else
                    updateList.Add(mapping);
            }
            if (addList.Count > 0)
                CSPdb.PROJECT_FAILURES_MAPPING.AddList(addList);
            if (updateList.Count > 0)
                CSPdb.PROJECT_FAILURES_MAPPING.Update(updateList);
            CSPdb.Commit(CanCommit);

            if (addList.Count > 0)
            {
                foreach (var row in addList)
                {
                    var rec = input.FirstOrDefault(x => x.FAILURE_MODE_ID == row.FAILURE_MODE_ID);
                    if (rec == null)
                        continue;

                    rec.ID = row.ID;
                }
            }


            return Ok(input);
        }

        [POST("UpdateFailureAssessment")]
        [ActionName("UpdateFailureAssessment")]
        [HttpPost]
        public IHttpActionResult UpdateFailureAssessment([FromBody] FAILURE_ASSESSMENT input)
        {
            ValidateReqest(input);
            var mapping = GetEntity(CSPdb.FAILURE_ASSESSMENT.GetAll(), input);
            mapping.ID = input.ID;
            mapping.PROJECT_ID = input.PROJECT_ID;
            mapping.PROJECT_FAILURES_MAPPING_ID = input.PROJECT_FAILURES_MAPPING_ID;
            mapping.TARGET_DATE = input.TARGET_DATE;
            mapping.ACTION_TAKEN = input.ACTION_TAKEN;
            mapping.ACTION_TAKEN_BY = input.ACTION_TAKEN_BY;
            mapping.ACTION_TAKEN_ON = input.ACTION_TAKEN_ON;
            mapping.FUTURE_RF_DETECTION_ID = input.FUTURE_RF_DETECTION_ID;
            mapping.FUTURE_RF_OCCURRENCE_ID = input.FUTURE_RF_OCCURRENCE_ID;
            mapping.FUTURE_RF_SEVERITY_ID = input.FUTURE_RF_SEVERITY_ID;
            mapping.FUTURE_RPN = input.FUTURE_RPN;
            if (mapping.ID > 0)
                CSPdb.FAILURE_ASSESSMENT.Update(mapping);
            else
                CSPdb.FAILURE_ASSESSMENT.Add(mapping);

            CSPdb.Commit(CanCommit);

            input.ID = mapping.ID;

            return Ok(input);
        }

        [POST("ApproveSelected")]
        [ActionName("ApproveSelected")]
        [HttpPost]
        public IHttpActionResult ApproveSelected([FromBody] List<PROJECT_FAILURES_MAPPING> input)
        {
            ValidateReqest(input);
            input = input.Where(x => x.ID > 0).ToList();
            CSPdb.PROJECT_FAILURES_MAPPING.Update(input);
            CSPdb.Commit(CanCommit);

            return Ok(input);
        }


        [GET("DeleteProjectFailure")]
        [ActionName("DeleteProjectFailure")]
        [HttpGet]
        public IHttpActionResult DeleteProjectFailure(int failureId)
        {
            var projectRec = CSPdb.PROJECT_FAILURES_MAPPING.GetAll().FirstOrDefault(x => x.ID == failureId && x.ISACTIVE);
            if (projectRec == null)
                return BadRequest("There is no record exists with the given id");
            projectRec.ISACTIVE = false;
            CSPdb.PROJECT_FAILURES_MAPPING.Update(projectRec);
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        [GET("GetFailureAssessmentRecords")]
        [ActionName("GetFailureAssessmentRecords")]
        [HttpGet]
        public IHttpActionResult GetFailureAssessmentRecords(string ProjectId)
        {
            return Ok(CSPdb.FAILURE_ASSESSMENT.GetAll().Where(x => x.PROJECT_ID == ProjectId).ToList());
        }
    }
}