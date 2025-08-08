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
        [POST("GetCheckPointsByAudit")]
        [ActionName("GetCheckPointsByAudit")]
        [HttpPost]
        public IHttpActionResult GetCheckPointsByAudit([FromBody] ChecklistAuditData checklistAuditData)
        {
            LogRequest(prefix: "GetCheckPointsByAudit");
            var watch = Stopwatch.StartNew();
            ValidateReqest(checklistAuditData);


            string serviceAreas = string.Empty;
            var result = new List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED>();
            var output = new List<ChecklistNew>();
            var checklistrec = new ChecklistNew();
            var checklistrow = new AUDIT_CHECKLIST_EXECUTION_SUMMARY();

            serviceAreas = string.Join(",", checklistAuditData.SERVICE_AREA_IDS);
            var existingAuditRows = new List<AUDIT_CHECKLIST_EXECUTION_DETAILS>();
            var existingSamplesRows = new List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED>();
            var existingFindingsRows = new List<AUDIT_CHECKLIST_PROJECT_FINDINGS>();
            var allFindingTypeValues = new List<FINDINGSTYPE_VALUES>();

            var checklistStatuses = new List<AUDIT_CHECKLIST_STATUS_LIST_VALUES>();
            var ccToLists = new List<CHECKLIST_EXECUTION_CC_DETAILS>();
            var auditeeNames = new List<CHECKLIST_EXECUTION_AUDITEE_DETAILS>();
            var checklistRows = new List<AUDIT_CHECKLIST_EXECUTION_SUMMARY>();
            var maturityLevelMappings = new List<PM_MATURITYLEVEL_MAPPING>();

            result = CSPdb.AppRepo.GetChecklistAuditNew(checklistAuditData.CUSTOMER_ID, checklistAuditData.PROJECT_ID, checklistAuditData.AUDIT_ID, serviceAreas).ToList();
            allFindingTypeValues = CSPdb.FINDINGSTYPE_VALUES.GetAll().Where(x => x.ISACTIVE).ToList();
            existingAuditRows = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.ISACTIVE && x.ASSESSMENT_ID == checklistAuditData.AUDIT_ID).ToList();
            existingSamplesRows = CSPdb.AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED.GetAll().Where(x => x.ISACTIVE && x.AUDIT_ID == checklistAuditData.AUDIT_ID).ToList();
            existingFindingsRows = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.ISACTIVE && x.AUDIT_ID == checklistAuditData.AUDIT_ID).ToList();

            if (existingAuditRows.Where(x => x.ISSUBMITTED).Any())
            {
                existingAuditRows = existingAuditRows.Where(x => x.ISSUBMITTED).ToList();
            }
            else
            {
                existingAuditRows = existingAuditRows.OrderByDescending(x => x.UPDATED_DATE).ToList();
            }

            foreach (var row in result)
            {
                var l = existingAuditRows.FirstOrDefault(x => x.PM_CHECKLIST_QUESTION_ID == row.PM_CHECKLIST_QUESTION_ID
                                               && x.PROCESS_ID == row.PROCESS_ID && x.SERVICE_AREA_ID == row.SERVICE_AREA_ID
                                               && x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID && x.PROCESS_AREA_ID == row.PROCESS_AREA_ID);
                var mod = new AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED();
                var findingTypeValue = allFindingTypeValues.Where(x => x.FINDINGSTYPE_ID == row.FINDINGSTYPE_ID).ToList();

                if (l != null)
                {
                    mod.ID = l.ID;
                    mod.ASSESSMENT_ID = l.ASSESSMENT_ID;
                    mod.CHECKLIST_SAMPLE_AUDITED = GetSamplesAuditedNew(l, existingSamplesRows);
                    mod.CREATED_BY = l.CREATED_BY;
                    mod.PM_CHECKLIST_QUESTION_ID = l.PM_CHECKLIST_QUESTION_ID;
                    mod.CREATED_DATE = l.CREATED_DATE;
                    mod.UPDATED_BY = l.UPDATED_BY;
                    mod.UPDATED_DATE = l.UPDATED_DATE;
                    mod.PROCESS_ID = l.PROCESS_ID;
                    mod.SERVICE_AREA_ID = l.SERVICE_AREA_ID;
                    mod.PROCESS_MODEL_ID = l.PROCESS_MODEL_ID;
                    mod.PROCESS_AREA_ID = l.PROCESS_AREA_ID;
                    mod.PROCESS_MODEL_DESCRIPTION = row.PROCESS_MODEL_DESCRIPTION;
                    mod.FINDINGS = GetChecklistFindingsNew(l, findingTypeValue, existingFindingsRows);
                    mod.STATUS_VALUE_ID = l.STATUS_VALUE_ID;
                    mod.SCORE = l.SCORE;
                    mod.ISSUBMITTED = l.ISSUBMITTED;
                    mod.STATUS_CATEGORY = l.STATUS_CATEGORY;
                    mod.IS_WEIGHTAGE_APPLICABLE = row.IS_WEIGHTAGE_APPLICABLE;
                    mod.MAX_SCORE = l.MAX_SCORE;
                    mod.UPDATED_SCORE = l.UPDATED_SCORE;
                    if (row.IS_WEIGHTAGE_APPLICABLE)
                    {
                        mod.WEIGHTAGE_ID = row.WEIGHTAGE_ID;
                        mod.WEIGHTAGE_TITLE = row.WEIGHTAGE_TITLE;
                        mod.WEIGHTAGE_SCORE = row.WEIGHTAGE_SCORE;
                    }
                    mod.ID = l.ID;
                    mod.ISACTIVE = l.ISACTIVE;
                    mod.NOTES = l.NOTES;
                    mod.LOOK_FOR = row.LOOK_FOR;
                    mod.PROCESS_DESCRIPTION = row.PROCESS_DESCRIPTION;
                    mod.SERVICE_AREA_NAME = row.SERVICE_AREA_NAME;
                    mod.MAPPED_CHECKLIST = true;
                    mod.CHECKLIST_ID = row.CHECKLIST_ID;
                    mod.ID = l.ID;
                    mod.CHECKLIST_EFFECTIVE_FROM = row.CHECKLIST_EFFECTIVE_FROM;
                }
                else
                {
                    mod = row;
                    mod.ASSESSMENT_ID = checklistAuditData.AUDIT_ID;
                    mod.FINDINGS = GetChecklistFindingsNew(row, findingTypeValue, existingFindingsRows);
                    mod.MAPPED_CHECKLIST = false;
                }

                if (!output.Any(x => x.CHECKLIST_ID == row.CHECKLIST_ID))
                    output.Add(new ChecklistNew(row.CHECKLIST_ID, row.VERSION_ID, row.CHECKLIST_NAME, row.IS_WEIGHTAGE_APPLICABLE, row.CORRECTIVE_ACTION_TRACKING,
                                mod.MAPPED_CHECKLIST, row.MATURITY_LEVEL, row.FINDINGSTYPE_ID, row.MAPPED_PROCESS_MODEL, row.STATUS_LIST_ID, row.CHECKLIST_EFFECTIVE_FROM));

                checklistrec.FINDINGTYPE_VALUES = findingTypeValue;

                checklistrec = output.Find(x => x.CHECKLIST_ID == row.CHECKLIST_ID);

                if (!checklistrec.CHECKPOINTS_BY_SERVICE_AREA.Any(x => x.SERVICE_AREA_ID == row.SERVICE_AREA_ID))
                    checklistrec.CHECKPOINTS_BY_SERVICE_AREA.Add(new AUDIT_CHECKLIST_BY_SERVICE_AREA(row.SERVICE_AREA_ID, row.SERVICE_AREA_NAME));

                var record = checklistrec.CHECKPOINTS_BY_SERVICE_AREA.Find(x => x.SERVICE_AREA_ID == row.SERVICE_AREA_ID);

                if (!record.CHECKPOINTS_BY_PROCESS_MODEL.Any(x => x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID))
                    record.CHECKPOINTS_BY_PROCESS_MODEL.Add(new AUDIT_CHECKLIST_BY_PROCESS_MODEL(row.PROCESS_MODEL_ID, row.PROCESS_MODEL_DESCRIPTION));

                var processModelRec = record.CHECKPOINTS_BY_PROCESS_MODEL.Find(x => x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID);

                if (!processModelRec.CHECKPOINTS_BY_PROCESS_AREA.Any(x => x.PROCESS_AREA_ID == row.PROCESS_AREA_ID))
                    processModelRec.CHECKPOINTS_BY_PROCESS_AREA.Add(new AUDIT_CHECKLIST_BY_PROCESS_AREA(row.PROCESS_AREA_ID, row.PROCESS_AREA_DESCRIPTION));

                var processAreaRec = processModelRec.CHECKPOINTS_BY_PROCESS_AREA.Find(x => x.PROCESS_AREA_ID == row.PROCESS_AREA_ID);

                if (!processAreaRec.CHECKPOINTS_BY_PROCESS.Any(x => x.PROCESS_ID == row.PROCESS_ID))
                    processAreaRec.CHECKPOINTS_BY_PROCESS.Add(new AUDIT_CHECKLIST_BY_PROCESS(row.PROCESS_ID, row.PROCESS_DESCRIPTION));

                var processRec = processAreaRec.CHECKPOINTS_BY_PROCESS.Find(x => x.PROCESS_ID == row.PROCESS_ID);

                processRec.CHECKPOINTS.Add(mod);
            }

            var checkStatusListIds = output.Select(x => x.CHECKLIST_STATUS_LIST_ID).ToList();
            var checklistIds = output.Select(x => x.CHECKLIST_ID).ToList();
            var auditIds = output.Select(x => checklistAuditData.AUDIT_ID).ToList();
            var mappedProcessModels = output.Select(x => x.MAPPED_PROCESS_MODEL).ToList();

            checklistStatuses = CSPdb.AUDIT_CHECKLIST_STATUS_LIST_VALUES.GetAll().Where(x => checkStatusListIds.Contains(x.STATUS_LIST_ID) && x.ISACTIVE).ToList();
            ccToLists = CSPdb.CHECKLIST_EXECUTION_CC_DETAILS.GetAll().Where(x => auditIds.Contains(x.ASSESSMENT_ID) && x.ISACTIVE).ToList();
            //  auditeeNames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x=>auditIds.Contains(x.AUDIT_ID) && auditIds.Contains(x.AUDITEE_EMP_ID) && x.ISACTIVE ).ToList();
            auditeeNames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => auditIds.Contains(x.AUDIT_ID) && x.ISACTIVE).ToList();
            checklistRows = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().Where(x => checklistIds.Contains(x.CHECKLIST_ID) && auditIds.Contains(x.ASSESSMENT_ID) && x.ISACTIVE).ToList();
            maturityLevelMappings = CSPdb.PM_MATURITYLEVEL_MAPPING.GetAll().Where(x => mappedProcessModels.Contains(x.PROCESS_MODEL_ID) && x.ISACTIVE).ToList();


            foreach (var checklist in output)
            {
                checklist.CHECKLIST_STATUS_LIST_VALUES = checklistStatuses.Where(x => x.STATUS_LIST_ID == checklist.CHECKLIST_STATUS_LIST_ID).ToList();

                if (checklist.MAPPED_CHECKLIST)
                {
                    var ccToListValues = ccToLists.Where(x => x.ASSESSMENT_ID == checklistAuditData.AUDIT_ID).ToList();
                    checklist.CC_LIST = ccToListValues.Where(x => x.CC_EMP_ID != null).Select(x => x.CC_EMP_ID).ToList();
                    checklist.TO_LIST = ccToListValues.Where(x => x.TO_EMP_ID != null).Select(x => x.TO_EMP_ID).ToList();
                    checklist.AUDITEE_NAMES = auditeeNames.Where(x => x.AUDIT_ID == checklistAuditData.AUDIT_ID).Select(x => x.AUDITEE_EMP_ID).ToList();
                }

                var checklistRowValues = checklistRows.Find(x => x.CHECKLIST_ID == checklist.CHECKLIST_ID && x.ASSESSMENT_ID == checklistAuditData.AUDIT_ID);

                if (checklistRowValues != null)
                    checklist.AUDIT_CHECKLIST_EXECUTION_SUMMARY = checklistRowValues;
                else
                    checklist.AUDIT_CHECKLIST_EXECUTION_SUMMARY = new AUDIT_CHECKLIST_EXECUTION_SUMMARY();

                if (checklist.MATURITY_LEVEL_APPLICABLE)
                {
                    checklist.PM_MATURITYLEVEL_MAPPINGS = maturityLevelMappings.Where(x => x.PROCESS_MODEL_ID == checklist.MAPPED_PROCESS_MODEL).ToList();

                    var maturityRec = checklist.PM_MATURITYLEVEL_MAPPINGS.Find(x => x.MATURITY_LEVEL_ID == checklist.AUDIT_CHECKLIST_EXECUTION_SUMMARY.MATURITY_LEVEL_ID && x.ISACTIVE);
                    if (maturityRec != null)
                    {
                        checklist.MATURITY_LEVEL_ID = maturityRec.MATURITY_LEVEL_ID;
                        checklist.MATURITY_LEVEL_TITLE = maturityRec.LEVEL_TITLE;
                    }
                }
            }

            var checklistPoints = output.OrderByDescending(x => x.CHECKLIST_EFFECTIVE_FROM).ToList();
            FillResponseTime(watch);
            return Ok(checklistPoints);
        }

        private void ValidateReqest(object obj)
        {

            if (obj == null)
                throw new ArgumentNullException("Request data is empty");
        }

        [POST("SaveAuditChecklistDetails")]
        [ActionName("SaveAuditChecklistDetails")]
        [HttpPost]
        public IHttpActionResult SaveAuditChecklistDetails([FromBody] ChecklistExecutionViewModel checklistmodel)
        {
            var watch = Stopwatch.StartNew();
            LogRequest(prefix: "SaveAuditChecklistDetails");
            ValidateReqest(checklistmodel);
            var summary = checklistmodel.AUDIT_CHECKLIST_EXECUTION_SUMMARY;
            var resultList = checklistmodel.AUDIT_CHECKLIST_BY_SERVICE_AREA_LIST;

            ValidateReqest(summary);
            ValidateReqest(resultList);

            var empId = GetHeaderDetails_String("empId");

            var checkpoints = new List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED>();
            var findings = new List<AUDIT_CHECKLIST_PROJECT_FINDINGS>();
            var samplesAudited = new List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED>();

            List<int> checkpointIds = new List<int>();
            List<int> findingIds = new List<int>();

            try
            {
                checkpoints = resultList.SelectMany(x => x.CHECKPOINTS_BY_PROCESS_MODEL)
                    .SelectMany(x => x.CHECKPOINTS_BY_PROCESS_AREA)
                    .SelectMany(x => x.CHECKPOINTS_BY_PROCESS)
                    .SelectMany(x => x.CHECKPOINTS)
                    .ToList();
                findings = checkpoints.SelectMany(x => x.FINDINGS).ToList();
                samplesAudited = checkpoints.SelectMany(x => x.CHECKLIST_SAMPLE_AUDITED).ToList();
                checkpointIds = checkpoints.Select(x => x.ID).ToList();
                findingIds = findings.Where(x => x.ID != 0).Select(x => x.ID).ToList();
            }
            catch (Exception ex)
            {
                Logger l = new Logger(Request, ex);
                return Content(System.Net.HttpStatusCode.Conflict, "An Error occured while saving the data. please reload the page and try again.");
            }

            if (!checkpoints.Any())
                return Content(System.Net.HttpStatusCode.Conflict, "An Error occured while saving the data. please reload the page and try again.");
            // Add/Edit Checklist summary Details
            var summaryRec = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ISACTIVE && x.ID == summary.ID);
            summaryRec = summaryRec != null ? summaryRec : new AUDIT_CHECKLIST_EXECUTION_SUMMARY();
            summaryRec.ASSESSMENT_ID = summary.ASSESSMENT_ID;
            summaryRec.CUSTOMER_ID = summary.CUSTOMER_ID;
            summaryRec.PROJECT_ID = summary.PROJECT_ID;
            summaryRec.CHECKLIST_ID = summary.CHECKLIST_ID;
            summaryRec.PLANNED_AUDIT_START_DATE = summary.PLANNED_AUDIT_START_DATE;
            summaryRec.PLANNED_AUDIT_END_DATE = summary.PLANNED_AUDIT_END_DATE;
            summaryRec.ACTUAL_AUDIT_START_DATE = summary.ACTUAL_AUDIT_START_DATE;
            summaryRec.ACTUAL_AUDIT_END_DATE = summary.ACTUAL_AUDIT_END_DATE;
            summaryRec.AUDIT_ACTUAL_HOURS = summary.AUDIT_ACTUAL_HOURS;
            summaryRec.AUDIT_PLANNED_HOURS = summary.AUDIT_PLANNED_HOURS;
            summaryRec.AUDIT_TITLE = summary.AUDIT_TITLE;
            summaryRec.AUDITOR_ID = summary.AUDITOR_ID;
            summaryRec.VERSION_ID = summary.VERSION_ID;
            summaryRec.SCORE = summary.SCORE;
            summaryRec.PERCENTAGE_SCORE = summary.PERCENTAGE_SCORE;
            summaryRec.UPDATED_SCORE = summary.SCORE;
            summaryRec.UPDATED_PERCENTAGE_SCORE = summary.PERCENTAGE_SCORE;
            summaryRec.MATURITY_LEVEL_ID = summary.MATURITY_LEVEL_ID;
            summaryRec.UPDATED_BY = empId;
            summaryRec.UPDATED_DATE = DateTime.Now;
            summaryRec.ISACTIVE = true;
            summaryRec.ISSUBMITTED = summary.ISSUBMITTED;
            if (summaryRec.ID != 0)
                CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Update(summaryRec);
            else
            {
                summaryRec.CREATED_BY = empId;
                summaryRec.CREATED_DATE = DateTime.Now;
                CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Add(summaryRec);
            }
            CSPdb.Commit(CanCommit);
            summary.ID = summaryRec.ID;

            var auditId = summaryRec.ASSESSMENT_ID;

            var maturityRec = CSPdb.PM_MATURITYLEVEL_MAPPING.GetAll().FirstOrDefault(x => x.MATURITY_LEVEL_ID == summary.MATURITY_LEVEL_ID && x.ISACTIVE);
            if (maturityRec != null)
            {
                summary.LEVEL_TITLE = maturityRec.LEVEL_TITLE;
            }

            //// Get flat list of all the input data;


            // Insert checkpoints

            var auditRecordsToUpdate = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.ISACTIVE && x.ASSESSMENT_ID == auditId).ToList();

            foreach (var res in auditRecordsToUpdate)
            {
                var updateRecord = checkpoints.Find(x => x.ID == res.ID);

                if (updateRecord == null)
                    continue;

                res.ASSESSMENT_ID = updateRecord.ASSESSMENT_ID;
                res.PROCESS_ID = updateRecord.PROCESS_ID;
                res.SERVICE_AREA_ID = updateRecord.SERVICE_AREA_ID;
                res.PROCESS_MODEL_ID = updateRecord.PROCESS_MODEL_ID;
                res.PROCESS_AREA_ID = updateRecord.PROCESS_AREA_ID;
                res.STATUS_CATEGORY = updateRecord.STATUS_CATEGORY;
                res.PM_CHECKLIST_QUESTION_ID = updateRecord.PM_CHECKLIST_QUESTION_ID;
                res.NOTES = updateRecord.NOTES;
                res.UPDATED_BY = empId;
                res.UPDATED_DATE = DateTime.Now;
                res.SCORE = updateRecord.SCORE;
                res.UPDATED_SCORE = updateRecord.UPDATED_SCORE;
                res.ISSUBMITTED = updateRecord.ISSUBMITTED;
                res.MAX_SCORE = updateRecord.MAX_SCORE;
                res.STATUS_VALUE_ID = updateRecord.STATUS_VALUE_ID;
            }

            if (auditRecordsToUpdate.Count > 0)
                CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.Update(auditRecordsToUpdate);

            var addedRecords = new List<AUDIT_CHECKLIST_EXECUTION_DETAILS>();
            var newRecords = checkpoints.Where(x => x.ID == 0).ToList();
            if (auditRecordsToUpdate.Count == 0 || newRecords.Any())
            {
                foreach (var res in newRecords)
                {
                    var newRecord = new AUDIT_CHECKLIST_EXECUTION_DETAILS
                    {
                        ASSESSMENT_ID = res.ASSESSMENT_ID,
                        PROCESS_ID = res.PROCESS_ID,
                        SERVICE_AREA_ID = res.SERVICE_AREA_ID,
                        PROCESS_MODEL_ID = res.PROCESS_MODEL_ID,
                        PROCESS_AREA_ID = res.PROCESS_AREA_ID,
                        STATUS_CATEGORY = res.STATUS_CATEGORY,
                        PM_CHECKLIST_QUESTION_ID = res.PM_CHECKLIST_QUESTION_ID,
                        NOTES = res.NOTES,
                        ISACTIVE = true,
                        SCORE = res.SCORE,
                        UPDATED_SCORE = res.UPDATED_SCORE,
                        ISSUBMITTED = res.ISSUBMITTED,
                        MAX_SCORE = res.MAX_SCORE,
                        STATUS_VALUE_ID = res.STATUS_VALUE_ID,
                        UPDATED_BY = empId,
                        UPDATED_DATE = DateTime.Now,
                        CREATED_BY = empId,
                        CREATED_DATE = DateTime.Now
                    };
                    addedRecords.Add(newRecord);
                    //summary.TOTAL_SCORE += res.MAX_SCORE;
                }

                if (addedRecords.Count > 0)
                    CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.AddList(addedRecords);

            }

            // Insert Findings

            var findingRecordsToUpdate = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.ISACTIVE && x.AUDIT_ID == auditId && findingIds.Contains(x.ID)).ToList();
            AUDIT_CHECKLIST_PROJECT_FINDINGS updateFindingRecord;

            foreach (var res in findingRecordsToUpdate)
            {
                updateFindingRecord = findings.Find(x => x.ID == res.ID);
                if (updateFindingRecord == null)
                    continue;

                if (string.IsNullOrWhiteSpace(updateFindingRecord.FINDING_DESCRIPTION))
                {
                    res.ISACTIVE = false;
                    CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.Update(res);
                    continue;
                }

                res.AUDIT_ID = updateFindingRecord.AUDIT_ID;
                res.APPLICABLE_QUESTIONS = updateFindingRecord.APPLICABLE_QUESTIONS;
                res.FINDING_DESCRIPTION = updateFindingRecord.FINDING_DESCRIPTION;
                res.FINDING_TYPE = updateFindingRecord.FINDING_TYPE;
                res.SERVICE_AREA_ID = updateFindingRecord.SERVICE_AREA_ID;
                res.PROCESS_ID = updateFindingRecord.PROCESS_ID;
                res.PROCESS_MODEL_ID = updateFindingRecord.PROCESS_MODEL_ID;
                res.PROCESS_AREA_ID = updateFindingRecord.PROCESS_AREA_ID;
                res.ISSUBMITTED = summary.ISSUBMITTED;
                res.UPDATED_DATE = DateTime.Now;
                res.UPDATED_BY = empId;
                res.ISACTIVE = true;
                res.FINDING_CATEGORY = updateFindingRecord.FINDING_CATEGORY;
            }

            if (findingRecordsToUpdate.Count > 0)
                CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.Update(findingRecordsToUpdate);

            var findingRecordsUpdateIds = findingRecordsToUpdate.Select(x => x.ID).ToList();
            var findingRecordsToAdd = findings.Where(x => !findingRecordsUpdateIds.Contains(x.ID)).ToList();
            findingRecordsToAdd = findingRecordsToAdd.Where(x => !string.IsNullOrWhiteSpace(x.FINDING_DESCRIPTION)).ToList();

            var newFindings = new List<AUDIT_CHECKLIST_PROJECT_FINDINGS>();
            AUDIT_CHECKLIST_PROJECT_FINDINGS newFindingRecord;

            foreach (var res in findingRecordsToAdd)
            {
                newFindingRecord = new AUDIT_CHECKLIST_PROJECT_FINDINGS
                {
                    AUDIT_ID = res.AUDIT_ID,
                    APPLICABLE_QUESTIONS = res.APPLICABLE_QUESTIONS,
                    FINDING_DESCRIPTION = res.FINDING_DESCRIPTION,
                    FINDING_TYPE = res.FINDING_TYPE,
                    SERVICE_AREA_ID = res.SERVICE_AREA_ID,
                    PROCESS_ID = res.PROCESS_ID,
                    PROCESS_MODEL_ID = res.PROCESS_MODEL_ID,
                    PROCESS_AREA_ID = res.PROCESS_AREA_ID,
                    ISSUBMITTED = summary.ISSUBMITTED,
                    ISACTIVE = true,
                    UPDATED_DATE = DateTime.Now,
                    UPDATED_BY = empId,
                    CREATED_DATE = DateTime.Now,
                    CREATED_BY = empId,
                    FINDING_CATEGORY = res.FINDING_CATEGORY
                };
                newFindings.Add(newFindingRecord);
            }

            if (newFindings.Count > 0)
                CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.AddList(newFindings);

            // Delete Already existing samples and insert new set

            var sampleRecordsToUpdate = CSPdb.AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED.GetAll().Where(x => x.ISACTIVE && x.AUDIT_ID == auditId).ToList();
            sampleRecordsToUpdate.ForEach(x => x.ISACTIVE = false);
            CSPdb.AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED.DeleteList(sampleRecordsToUpdate);

            samplesAudited = samplesAudited.Where(x => x.EMP_ID != "0").ToList();
            var samplesToAdd = new List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED>();
            AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED newSample;

            foreach (var exe in samplesAudited)
            {
                newSample = new AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED();
                newSample.AUDIT_ID = exe.AUDIT_ID;
                newSample.APPLICABLE_QUESTIONS = exe.APPLICABLE_QUESTIONS;
                newSample.SERVICE_AREA_ID = exe.SERVICE_AREA_ID;
                newSample.PROCESS_AREA_ID = exe.PROCESS_AREA_ID;
                newSample.PROCESS_MODEL_ID = exe.PROCESS_MODEL_ID;
                newSample.PROCESS_ID = exe.PROCESS_ID;
                samplesToAdd.Add(newSample);
            }

            if (samplesToAdd.Count > 0)
                CSPdb.AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED.AddList(samplesToAdd);

            CSPdb.Commit(CanCommit);

            // Get Ids of newly added records
            if (addedRecords.Count > 0)
                GetIdsofNewlyAddedCheckpoints(addedRecords, ref checkpoints);

            // Get Ids of newly added findings
            if (newFindings.Count > 0)
                GetIdsofNewlyAddedFindings(newFindings, ref findings);

            // Get Ids of newly added Samples
            if (samplesToAdd.Count > 0)
                GetIdsofNewlyAddedSamples(samplesToAdd, ref samplesAudited);

            // Add stage status for all the applicable findings

            var mappingsList = new List<AUDIT_FINDING_STAGES_MAPPING>();
            AUDIT_FINDING_STAGES_MAPPING newMapping;
            List<int> stages = CSPdb.AUDIT_FINDING_STAGES.GetAll().Where(x => x.ISACTIVE).Select(t => t.ID).ToList();

            foreach (var mapp in newFindings)
            {
                foreach (var stage in stages)
                {
                    newMapping = new AUDIT_FINDING_STAGES_MAPPING
                    {
                        STAGE_ID = stage,
                        FINDING_ID = mapp.ID,
                        STAGE_STATUS = "New",
                        STATUS_DATE = DateTime.Now,
                        ISCOMPLETE = false,
                        CREATED_DATE = DateTime.Now,
                        CREATED_BY = empId.ToString(),
                        UPDATED_BY = empId.ToString(),
                        UPDATED_DATE = DateTime.Now,
                        ISACTIVE = true
                    };
                    mappingsList.Add(newMapping);
                }
            }
            if (mappingsList.Count > 0)
                CSPdb.AUDIT_FINDING_STAGES_MAPPING.AddList(mappingsList);

            // Get Auditee rejected records and delete

            var existingFindingIds = findingRecordsToUpdate.Select(x => x.ID).ToList();
            var updateDetails = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(x => x.ISACTIVE && existingFindingIds.Contains(x.FINDING_ID.Value) && stages.Contains(x.STAGE_ID) && x.STAGE_STATUS == "Auditee Rejected").ToList();
            updateDetails.ForEach(x => { x.STAGE_STATUS = "New"; x.ISCOMPLETE = false; x.ISACTIVE = true; x.UPDATED_BY = empId.ToString(); x.UPDATED_DATE = DateTime.Now; });
            if (updateDetails.Count > 0)
            {
                CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(updateDetails);

                var idsToDelete = updateDetails.Select(x => x.FINDING_ID).ToList();

                var deleteDetails = CSPdb.AUDITEE_ACCEPTANCE.GetAll().Where(x => x.ISACTIVE && idsToDelete.Contains(x.FINDING_ID)).ToList();
                deleteDetails.ForEach(x => x.ISACTIVE = false);
                CSPdb.AUDITEE_ACCEPTANCE.Update(deleteDetails);
            }
            UpdateAuditStatus(auditId, "IN PROGRESS");
            CSPdb.Commit(CanCommit);

            if (summary.AUDITEE_LIST != null && summary.AUDITEE_LIST.Count > 0)
                SaveCheckListAuditeeDetailsNew(summary.AUDITEE_LIST, auditId, empId);

            SaveCheckListCCDetailsNew(summary.CC_LIST, summary.TO_LIST, auditId, empId);


            var auditRows = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.ASSESSMENT_ID == auditId && x.ISACTIVE && x.ISSUBMITTED).ToList();

            if (summary.ISSUBMITTED)
            {
                if (CheckIfNoOpenFinding(auditId))
                {
                    auditRows.ForEach(x =>
                    {
                        if (x.STATUS_CATEGORY == "NMET")
                            x.UPDATED_SCORE = x.MAX_SCORE;
                    });
                    CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.Update(auditRows);
                    CSPdb.Commit(CanCommit);
                    UpdateAuditStatus(auditId, "COMPLETED");
                }

                if (!summary.MAIL_SENT.HasValue || (summary.MAIL_SENT.HasValue && !summary.MAIL_SENT.Value))
                {
                    var cust = CSPdb.CUSTOMER_PROJECTS.GetAll().FirstOrDefault(x => x.CUST_ID == summary.CUSTOMER_ID);
                    var proj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == summary.PROJECT_ID);

                    var taskrec = CSPdb.TASK.GetAll().FirstOrDefault(x => x.ID == auditId && x.ISACTIVE);
                    bool isReleaseAssessment = false;
                    bool isPostReleaseAssessment = false;
                    var requestDomain = helper.GetAbsoulteUri();
                    var path = "layout/checklistfindings";
                    decimal maxscore = 0;
                    auditRows.ForEach(x => maxscore += x.MAX_SCORE);

                    var findingsFlatList = resultList.SelectMany(x => x.CHECKPOINTS_BY_PROCESS_MODEL)
                    .SelectMany(x => x.CHECKPOINTS_BY_PROCESS_AREA)
                    .SelectMany(x => x.CHECKPOINTS_BY_PROCESS)
                    .SelectMany(x => x.CHECKPOINTS)
                    .SelectMany(x => x.FINDINGS)
                    .ToList();

                    if (taskrec != null)
                    {
                        if (taskrec.TASK_CATEGORY_ID == 12)
                            isReleaseAssessment = true;

                        if (taskrec.TASK_CATEGORY_ID == 19)
                            isPostReleaseAssessment = true;
                    }
                    if (isReleaseAssessment)
                    {
                        ReleaseAssessmentMail releaseAssessmentMail = new ReleaseAssessmentMail();
                        if (releaseAssessmentMail != null)
                        {
                            string gostatus = "GO ahead";

                            if (!CheckIfNoMandatoryFindings(checkpoints))
                                gostatus = "No-GO";

                            var assessmentMonth = summary.PLANNED_AUDIT_END_DATE.Value.ToString("MMM", CultureInfo.InvariantCulture);
                            assessmentMonth = $"{assessmentMonth}-{summary.PLANNED_AUDIT_END_DATE.Value.Year.ToString().Substring(2)}";

                            releaseAssessmentMail.CUSTOMER_ID = summary.CUSTOMER_ID;
                            releaseAssessmentMail.PROJECT_ID = summary.PROJECT_ID;
                            releaseAssessmentMail.CUSTOMER_NAME = cust != null ? cust.CUST_NM : null;
                            releaseAssessmentMail.PROJECT_NAME = proj != null ? proj.PROJ_NM : null;
                            releaseAssessmentMail.URL = $"{requestDomain}/{path}/{summary.CUSTOMER_ID}/{summary.PROJECT_ID}/{auditId}";
                            releaseAssessmentMail.RECIPIENT_LIST = summary.AUDITEE_LIST;
                            releaseAssessmentMail.AUDIT_ID = auditId;
                            releaseAssessmentMail.AUDITOR_NAME = GetEmployeeNamebyId(summary.AUDITOR_ID.ToString());
                            releaseAssessmentMail.AUDITOR_ID = summary.AUDITOR_ID;
                            releaseAssessmentMail.GO_STATUS = gostatus;
                            releaseAssessmentMail.ASSESSMENT_MONTH = assessmentMonth;
                            releaseAssessmentMail.ASSESSMENT_TITLE = summary.AUDIT_TITLE;
                            releaseAssessmentMail.SUBJECT = $"- Recommendation - {gostatus}";//{summary.AUDIT_TITLE} 
                            releaseAssessmentMail.RECIPIENT_LIST = summary.AUDITEE_LIST;
                            releaseAssessmentMail.AUDIT_ID = auditId;
                            releaseAssessmentMail.CC_LIST = summary.CC_LIST;
                            releaseAssessmentMail.START_DATE = summary.PLANNED_AUDIT_START_DATE;
                            releaseAssessmentMail.SCORE = summary.SCORE;
                            releaseAssessmentMail.MAX_SCORE = maxscore;

                            if (summary.TO_LIST != null && summary.TO_LIST.Count > 0)
                                releaseAssessmentMail.RECIPIENT_LIST.AddRange(summary.TO_LIST);
                            SendMailReleaseAssessment(releaseAssessmentMail);
                        }
                    }
                    else if (isPostReleaseAssessment)
                    {
                        var releaseassessrec = new ReleaseAssessmentMail()
                        {
                            PROJECT_NAME = proj != null ? proj.PROJ_NM : null,
                            URL = $"{helper.GetAbsoulteUri()}/layout/checklistfindings/{summary.CUSTOMER_ID}/{summary.PROJECT_ID}",
                            ASSESSMENT_TITLE = summary.AUDIT_TITLE,
                            PROJECT_ID = summary.PROJECT_ID,
                            SUBJECT = GetPostReleaseAssessmentSubject(findingsFlatList, proj.PROJ_NM),
                            CLASS = GetClassPostReleaseAssessment(findingsFlatList),
                            RECIPIENT_LIST = summary.AUDITEE_LIST,
                            AUDITOR_ID = summary.AUDITOR_ID,
                            AUDITOR_NAME = GetEmployeeNamebyId(summary.AUDITOR_ID.ToString()),
                            AUDIT_ID = summary.ASSESSMENT_ID,
                            CC_LIST = summary.CC_LIST
                        };

                        if (summary.TO_LIST != null && summary.TO_LIST.Count > 0)
                            releaseassessrec.RECIPIENT_LIST.AddRange(summary.TO_LIST);

                        SendMailPostReleaseAssessment(releaseassessrec, summary.PLANNED_AUDIT_START_DATE);
                    }
                    else
                    {
                        bool noFinding = true;
                        var findingsList = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == auditId && x.ISACTIVE && x.ISSUBMITTED).ToList();

                        if (findingsList.Any())
                            noFinding = false;
                        ChecklistSendMail checklistSendMail = new ChecklistSendMail();
                        checklistSendMail.CUSTOMER_ID = summary.CUSTOMER_ID;
                        checklistSendMail.PROJECT_ID = summary.PROJECT_ID;
                        checklistSendMail.CUSTOMER_NAME = cust != null ? cust.CUST_NM : null;
                        checklistSendMail.PROJECT_NAME = proj != null ? proj.PROJ_NM : null;
                        checklistSendMail.URL = $"{requestDomain}/{path}/{summary.CUSTOMER_ID}/{summary.PROJECT_ID}/{auditId}";
                        checklistSendMail.RECIPIENT_LIST = summary.AUDITEE_LIST;
                        checklistSendMail.AUDIT_ID = auditId;
                        checklistSendMail.AUDITOR_ID = summary.AUDITOR_ID;
                        checklistSendMail.AUDIT_TITLE = summary.AUDIT_TITLE;
                        checklistSendMail.AUDITOR_NAME = GetEmployeeNamebyId(summary.AUDITOR_ID.ToString());
                        checklistSendMail.COMPLETED_DATE = summary.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                        checklistSendMail.PLANNED_DATE = summary.ACTUAL_AUDIT_START_DATE.GetValueOrDefault();
                        checklistSendMail.ACTION = noFinding ? "No" : "Yes";
                        checklistSendMail.STATUS = "Assessment Completed";
                        checklistSendMail.STAGE = !noFinding ? "Findings Reported" : "No Findings Reported";
                        checklistSendMail.CLASS = !noFinding ? "show" : "hide";
                        checklistSendMail.SUBJECT = "Assessment Completed";
                        checklistSendMail.NEXT_ACTION = "Submit Corrective Action Plan within two days after accepting the findings";
                        checklistSendMail.ACTION_CLASS = !noFinding ? "showAction" : "hideAction";
                        checklistSendMail.CC_LIST = summary.CC_LIST;

                        if (maturityRec != null)
                        {
                            checklistSendMail.SCORE_VALUES = $" Maturity Level : <b> {summary.LEVEL_TITLE} </b> <br/> Project Maturity Level Score : ";
                        }
                        else
                        {
                            checklistSendMail.SCORE_VALUES = $" Project Process Compliance Score : ";
                        }
                        checklistSendMail.SCORE_VALUES += $"<b>{summary.SCORE}</b> out of <b>{maxscore}</b> <br/> Percentage : <b>{summary.PERCENTAGE_SCORE}%</b>";
                        if (summary.TO_LIST != null && summary.TO_LIST.Count > 0)
                            checklistSendMail.RECIPIENT_LIST.AddRange(summary.TO_LIST);
                        SendMailOnAuditChecklistStage(checklistSendMail);
                    }
                }
            }

            checklistmodel.AUDIT_CHECKLIST_EXECUTION_SUMMARY = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == checklistmodel.AUDIT_CHECKLIST_EXECUTION_SUMMARY.ASSESSMENT_ID && x.ISACTIVE);
            FillResponseTime(watch);
            return Ok(checklistmodel);
        }


        private List<NameMailIDHolder> GetRecipientDetails(string auditorId, PROJECT project, List<string> receipentList)
        {
            var result = new List<NameMailIDHolder>();
            var qualitySpocEmpId = project.QUALITY_SPOC;

            var qualitySpocAvailable = project.QUALITY_SPOC != "";

            var employeesToSearch = new List<string>(receipentList);

            if (!receipentList.Contains(auditorId))
                employeesToSearch.Add(auditorId);
            //else auditorId = 0; accessorDetails.IsCC = false;

            if (qualitySpocAvailable)
                if (!receipentList.Contains(qualitySpocEmpId))
                    employeesToSearch.Add(qualitySpocEmpId);
            //else qualitySpocEmpId = null;



            var employees = Cldb.EMP_INFO.GetAll().Where(x => employeesToSearch.Contains(x.EMP_ID) && x.DOR == null).ToList();
            var qualityspoc = qualitySpocAvailable ? employees.FirstOrDefault(x => x.EMP_ID == qualitySpocEmpId) : null;
            var assessor = employees.FirstOrDefault(x => x.EMP_ID == auditorId);

            var accessorDetails = new NameMailIDHolder();


            //if (!receipentList.Contains(qualitySpocEmpId.Value) || !receipentList.Contains(auditorId))
            //{
            //accessorDetails.IsCC = true;
            if (assessor != null && qualityspoc != null)
            {
                if (!receipentList.Contains(qualitySpocEmpId) && !receipentList.Contains(auditorId))
                {
                    if (assessor.EMAIL_ID == qualityspoc.EMAIL_ID)
                    {
                        accessorDetails.Name = assessor.FRST_NM;
                        accessorDetails.MailID = assessor.EMAIL_ID;
                    }
                    else
                    {
                        accessorDetails.Name = assessor.FRST_NM;
                        accessorDetails.MailID = string.Join(",", assessor.EMAIL_ID, qualityspoc.EMAIL_ID);
                    }
                }

                else if (!receipentList.Contains(qualitySpocEmpId))
                {
                    accessorDetails.Name = qualityspoc.FRST_NM;
                    accessorDetails.MailID = qualityspoc.EMAIL_ID;
                }

                else if (!receipentList.Contains(auditorId))
                {
                    accessorDetails.Name = assessor.FRST_NM;
                    accessorDetails.MailID = assessor.EMAIL_ID;
                }
            }

            else if (assessor != null)
            {
                if (!receipentList.Contains(auditorId))
                {
                    accessorDetails.Name = assessor.FRST_NM;
                    accessorDetails.MailID = assessor.EMAIL_ID;
                }
                if (qualityspoc == null)
                {
                    var qualitySpoc = new NameMailIDHolder();
                    qualitySpoc.Name = "Quality Team";
                    qualitySpoc.MailID = Constants.QUALITY_MAIL;
                    qualitySpoc.IsCC = true;
                    result.Add(qualitySpoc);
                }
            }
            else if (qualityspoc != null)
            {
                if (!receipentList.Contains(qualitySpocEmpId))
                {
                    accessorDetails.Name = qualityspoc.FRST_NM;
                    accessorDetails.MailID = qualityspoc.EMAIL_ID;
                }
            }
            else
            {
                // Static 
                accessorDetails.Name = "Quality Team";
                accessorDetails.MailID = Constants.QUALITY_MAIL;
            }

            if (accessorDetails.MailID != null)
            {
                accessorDetails.IsCC = true;
                result.Add(accessorDetails);
            }

            //}

            var receipinets = employees.Where(x => receipentList.Contains(x.EMP_ID));
            if (receipinets.Any())
            {
                result.Add(new NameMailIDHolder
                {
                    Name = string.Join(",", receipinets.Select(x => x.FRST_NM)),
                    MailID = string.Join(",", receipinets.Select(x => x.EMAIL_ID)),
                    IsCC = false,
                });
            }
            return result;
        }

        private void SendMailPostReleaseAssessment([FromBody] ReleaseAssessmentMail checklistSendMail, DateTime? startDate)
        {
            if (checklistSendMail == null)
                return;

            var proj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == checklistSendMail.PROJECT_ID);

            checklistSendMail.PROJECT_NAME = proj != null ? proj.PROJ_NM : null;

            string toperson = string.Empty;
            string tomail = string.Empty;
            string ccmail = string.Empty;
            string selectedcc = string.Empty;


            string csmMails = helper.GetCSMMailsFromProject(checklistSendMail.PROJECT_ID);
            string pmMails = helper.GetPMMailsFromProject(checklistSendMail.PROJECT_ID);


            var recipientsDetails = GetRecipientDetails(checklistSendMail.AUDITOR_ID, proj, checklistSendMail.RECIPIENT_LIST);


            if (checklistSendMail.CC_LIST != null && checklistSendMail.CC_LIST.Count > 0)
                selectedcc = string.Join(",", Cldb.EMP_INFO.GetAll().Where(x => checklistSendMail.CC_LIST.Contains(x.EMP_ID)).Select(x => x.EMAIL_ID));

            var recipientDtls = recipientsDetails.FirstOrDefault(x => !x.IsCC);
            if (recipientDtls != null)
            {
                toperson = recipientDtls.Name;
                tomail = recipientDtls.MailID;
            }
            else
            {
                toperson = recipientsDetails[0].Name;
                tomail = recipientsDetails[0].MailID;
                recipientsDetails[0].IsCC = false;
            }

            var ccMailIds = recipientsDetails.Where(x => x.IsCC).ToList();
            var ccMailId = string.Empty;
            if (ccMailIds.Any())
            {
                ccMailId = string.Join(",", ccMailIds.Select(x => x.MailID));
            }
            var qspoc = GetQSPOCMailforAssessment(proj);
            ccmail = helper.ConcatEmails(new List<string>() { pmMails, csmMails, ccMailId, selectedcc, qspoc }); // quality spoc , auditor           

            string mailContent;

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("TO_RECIPIENTS", toperson);
            EmailContentValues.Add("URL", checklistSendMail.URL);
            EmailContentValues.Add("START_DATE", startDate.HasValue ? startDate.Value.ToString("dd-MMM-yyyy") : "-");

            mailContent = helper.GetEmailContent("PostReleaseAssessmentEmail.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            try
            {
                ep.SendEmail
               (
               new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
               new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = checklistSendMail.SUBJECT, hasAttachments = false, attachmentFilePath = "", ProjId = checklistSendMail.PROJECT_ID },
               Request
               );

                var mailRec = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == checklistSendMail.AUDIT_ID && x.ISACTIVE);
                if (mailRec != null)
                {
                    mailRec.MAIL_SENT = true;
                    CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Update(mailRec);
                    CSPdb.Commit(CanCommit);
                }
            }
            catch (Exception)
            {
                // Ignored
            }

        }

        private string GetClassPostReleaseAssessment(List<AUDIT_CHECKLIST_PROJECT_FINDINGS> findings)
        {
            var isThreat = findings.Find(x => !string.IsNullOrEmpty(x.FINDING_DESCRIPTION.Trim()) && x.FINDING_TYPE == "Threat");
            if (isThreat != null)
                return "hide";

            var isWeaknessOrOpportunity = findings.Find(x => !string.IsNullOrEmpty(x.FINDING_DESCRIPTION.Trim()) && (x.FINDING_TYPE == "Weakness" || x.FINDING_TYPE == "Opportunity"));
            if (isWeaknessOrOpportunity != null)
                return "show";


            return "show";
        }

        private string GetPostReleaseAssessmentSubject(List<AUDIT_CHECKLIST_PROJECT_FINDINGS> findings, string projectname)
        {
            var isThreat = findings.Find(x => !string.IsNullOrEmpty(x.FINDING_DESCRIPTION.Trim()) && x.FINDING_TYPE == "Threat");
            if (isThreat != null)
                return $"CR Implementation Assessment for Project: {projectname} - Need Immediate Attention";

            var isWeaknessOrOpportunity = findings.Find(x => !string.IsNullOrEmpty(x.FINDING_DESCRIPTION.Trim()) && (x.FINDING_TYPE == "Weakness" || x.FINDING_TYPE == "Opportunity"));
            if (isWeaknessOrOpportunity != null)
                return $"CR Implementation Assessment for Project: {projectname} - Need Attention";


            return $"CR Implementation Assessment for Project: {projectname} - No Action Required";
        }

        private decimal CalculateChecklistScore(List<AUDIT_CHECKLIST_EXECUTION_DETAILS> AuditRows)
        {
            decimal acheieved = 0;
            decimal maxscore = 0;
            foreach (var row in AuditRows)
            {
                if (row.STATUS_CATEGORY != "N/A")
                {
                    acheieved += row.UPDATED_SCORE;
                    maxscore += row.MAX_SCORE;
                }
            }
            return maxscore > 0 ? Math.Round((acheieved / maxscore) * 100, 2) : (acheieved == 0) ? 100 : 0;
        }

        private void GetIdsofNewlyAddedCheckpoints(List<AUDIT_CHECKLIST_EXECUTION_DETAILS> addedRecords, ref List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> checkpoints)
        {
            foreach (var rec in addedRecords)
            {
                var ques = checkpoints.Find(x => x.ASSESSMENT_ID == rec.ASSESSMENT_ID && x.PM_CHECKLIST_QUESTION_ID == rec.PM_CHECKLIST_QUESTION_ID
                                                && x.SERVICE_AREA_ID == rec.SERVICE_AREA_ID && x.PROCESS_AREA_ID == rec.PROCESS_AREA_ID
                                                && x.PROCESS_ID == rec.PROCESS_ID && x.PROCESS_MODEL_ID == rec.PROCESS_MODEL_ID);
                if (ques == null)
                    continue;

                ques.ID = rec.ID;
            }
        }

        private void GetIdsofNewlyAddedFindings(List<AUDIT_CHECKLIST_PROJECT_FINDINGS> addedRecords, ref List<AUDIT_CHECKLIST_PROJECT_FINDINGS> findings)
        {
            foreach (var rec in addedRecords)
            {
                var find = findings.Find(x => x.AUDIT_ID == rec.AUDIT_ID && x.APPLICABLE_QUESTIONS == rec.APPLICABLE_QUESTIONS && x.FINDING_TYPE == rec.FINDING_TYPE
                                                && x.SERVICE_AREA_ID == rec.SERVICE_AREA_ID && x.PROCESS_AREA_ID == rec.PROCESS_AREA_ID
                                                && x.PROCESS_ID == rec.PROCESS_ID && x.PROCESS_MODEL_ID == rec.PROCESS_MODEL_ID);
                if (find == null)
                    continue;

                find.ID = rec.ID;
            }
        }

        private void GetIdsofNewlyAddedSamples(List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> addedRecords, ref List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> samples)
        {
            foreach (var rec in addedRecords)
            {
                var sample = samples.Find(x => x.AUDIT_ID == rec.AUDIT_ID && x.APPLICABLE_QUESTIONS == rec.APPLICABLE_QUESTIONS
                                                && x.SERVICE_AREA_ID == rec.SERVICE_AREA_ID && x.PROCESS_AREA_ID == rec.PROCESS_AREA_ID
                                                && x.PROCESS_ID == rec.PROCESS_ID && x.PROCESS_MODEL_ID == rec.PROCESS_MODEL_ID);
                if (sample == null)
                    continue;

                sample.ID = rec.ID;
            }
        }

        private void SaveCheckListAuditeeDetailsNew(List<string> Auditeenames, int Auditid, string createdby)
        {
            List<CHECKLIST_EXECUTION_AUDITEE_DETAILS> deleteDetails = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(t => t.AUDIT_ID == Auditid && t.ISACTIVE).ToList();
            if (deleteDetails != null && deleteDetails.Count > 0)
                CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.DeleteList(deleteDetails);

            foreach (string emp in Auditeenames)
            {
                CHECKLIST_EXECUTION_AUDITEE_DETAILS auditeedetails = new CHECKLIST_EXECUTION_AUDITEE_DETAILS();
                auditeedetails.AUDIT_ID = Auditid;
                auditeedetails.AUDITEE_EMP_ID = emp;
                auditeedetails.CREATED_DATE = DateTime.Now;
                auditeedetails.CREATED_BY = createdby;
                auditeedetails.UPDATED_DATE = DateTime.Now;
                auditeedetails.UPDATED_BY = createdby;
                auditeedetails.ISACTIVE = true;
                CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.Add(auditeedetails);
            }

            CSPdb.Commit(CanCommit);
        }

        private void SaveCheckListCCDetailsNew(List<string> CCList, List<string> ToList, int Auditid, string createdby)
        {
            // Delete Existing

            List<CHECKLIST_EXECUTION_CC_DETAILS> deleteDetails = CSPdb.CHECKLIST_EXECUTION_CC_DETAILS.GetAll().Where(t => t.ASSESSMENT_ID == Auditid).ToList();
            if (deleteDetails != null && deleteDetails.Count > 0)
                CSPdb.CHECKLIST_EXECUTION_CC_DETAILS.DeleteList(deleteDetails);

            if (CCList != null && CCList.Count > 0)
            {
                foreach (string emp in CCList)
                {
                    CHECKLIST_EXECUTION_CC_DETAILS ccdetails = new CHECKLIST_EXECUTION_CC_DETAILS();
                    ccdetails.ASSESSMENT_ID = Auditid;
                    ccdetails.CC_EMP_ID = emp;
                    ccdetails.TO_EMP_ID = null;
                    ccdetails.CREATED_DATE = DateTime.Now;
                    ccdetails.CREATED_BY = createdby;
                    ccdetails.UPDATED_DATE = DateTime.Now;
                    ccdetails.UPDATED_BY = createdby;
                    ccdetails.ISACTIVE = true;
                    CSPdb.CHECKLIST_EXECUTION_CC_DETAILS.Add(ccdetails);
                }
            }

            if (ToList != null && ToList.Count > 0)
            {
                foreach (string emp in ToList)
                {
                    CHECKLIST_EXECUTION_CC_DETAILS todetails = new CHECKLIST_EXECUTION_CC_DETAILS();
                    todetails.ASSESSMENT_ID = Auditid;
                    todetails.TO_EMP_ID = emp;
                    todetails.CC_EMP_ID = null;
                    todetails.CREATED_DATE = DateTime.Now;
                    todetails.CREATED_BY = createdby;
                    todetails.UPDATED_DATE = DateTime.Now;
                    todetails.UPDATED_BY = createdby;
                    todetails.ISACTIVE = true;
                    CSPdb.CHECKLIST_EXECUTION_CC_DETAILS.Add(todetails);
                }
            }

            CSPdb.Commit(CanCommit);
        }

        public class ChecklistExecutionViewModel
        {
            public AUDIT_CHECKLIST_EXECUTION_SUMMARY AUDIT_CHECKLIST_EXECUTION_SUMMARY { get; set; }
            public List<AUDIT_CHECKLIST_BY_SERVICE_AREA> AUDIT_CHECKLIST_BY_SERVICE_AREA_LIST;
        }



        public class ChecklistNew
        {
            public ChecklistNew() { }

            public ChecklistNew(int checklistid, decimal version, string name, bool weightageapplicable, bool correctiveaction, bool mappedstatus,
                bool maturiryLevel, int? findingtypeid, int mappedprocessModel, int checklistatusid, DateTime checklistEffectiveFrom)
            {
                this.CHECKLIST_ID = checklistid;
                this.VERSION_ID = version;
                this.CHECKLIST_NAME = name;
                this.WEIGHTAGE_APPLICABLE_FLAG = weightageapplicable;
                this.MATURITY_LEVEL_APPLICABLE = maturiryLevel;
                this.CORRECTIVE_ACTION_TRACKING = correctiveaction;
                this.MAPPED_CHECKLIST = mappedstatus;
                this.FINDINGSTYPE_ID = findingtypeid;
                this.MAPPED_PROCESS_MODEL = mappedprocessModel;
                this.CHECKLIST_STATUS_LIST_ID = checklistatusid;
                this.FINDINGTYPE_VALUES = new List<FINDINGSTYPE_VALUES>();
                this.CHECKPOINTS_BY_SERVICE_AREA = new List<AUDIT_CHECKLIST_BY_SERVICE_AREA>();
                this.CHECKLIST_STATUS_LIST_VALUES = new List<AUDIT_CHECKLIST_STATUS_LIST_VALUES>();
                this.PM_MATURITYLEVEL_MAPPINGS = new List<PM_MATURITYLEVEL_MAPPING>();
                this.CHECKLIST_EFFECTIVE_FROM = checklistEffectiveFrom;
            }

            public AUDIT_CHECKLIST_EXECUTION_SUMMARY AUDIT_CHECKLIST_EXECUTION_SUMMARY { get; set; }
            public int CHECKLIST_ID { get; set; }
            public string CHECKLIST_NAME { get; set; }
            public List<string> AUDITEE_NAMES { get; set; }
            public List<string> TO_LIST { get; set; }
            public List<string> CC_LIST { get; set; }
            public int? FINDINGSTYPE_ID { get; set; }
            public decimal VERSION_ID { get; set; }

            public List<FINDINGSTYPE_VALUES> FINDINGTYPE_VALUES { get; set; }

            public bool WEIGHTAGE_APPLICABLE_FLAG { get; set; }

            public bool CORRECTIVE_ACTION_TRACKING { get; set; }
            public bool MATURITY_LEVEL_APPLICABLE { get; set; }

            public bool MAPPED_CHECKLIST { get; set; }

            public int MAPPED_PROCESS_MODEL { get; set; }

            public int MATURITY_LEVEL_ID { get; set; }

            public string MATURITY_LEVEL_TITLE { get; set; }
            public List<PM_MATURITYLEVEL_MAPPING> PM_MATURITYLEVEL_MAPPINGS { get; set; }
            public int CHECKLIST_STATUS_LIST_ID { get; set; }
            public List<AUDIT_CHECKLIST_STATUS_LIST_VALUES> CHECKLIST_STATUS_LIST_VALUES { get; set; }

            public List<AUDIT_CHECKLIST_BY_SERVICE_AREA> CHECKPOINTS_BY_SERVICE_AREA { get; set; }

            public DateTime? CHECKLIST_EFFECTIVE_FROM { get; set; }

        }

        public class AUDIT_CHECKLIST_BY_SERVICE_AREA
        {
            public int SERVICE_AREA_ID { get; set; }

            public string SERVICE_AREA_NAME { get; set; }
            public decimal MAX_SCORE { get; set; }
            public decimal SCORE_ACHIEVED { get; set; }
            public decimal PERCENTAGE { get; set; }

            public AUDIT_CHECKLIST_BY_SERVICE_AREA(int id, string title)
            {
                this.SERVICE_AREA_ID = id;
                this.SERVICE_AREA_NAME = title;
                this.CHECKPOINTS_BY_PROCESS_MODEL = new List<AUDIT_CHECKLIST_BY_PROCESS_MODEL>();
            }

            public List<AUDIT_CHECKLIST_BY_PROCESS_MODEL> CHECKPOINTS_BY_PROCESS_MODEL { get; set; }

        }

        public class AUDIT_CHECKLIST_BY_PROCESS_MODEL
        {
            public int PROCESS_MODEL_ID { get; set; }
            public string PROCESS_MODEL_NAME { get; set; }

            public AUDIT_CHECKLIST_BY_PROCESS_MODEL(int id, string title)
            {
                this.PROCESS_MODEL_ID = id;
                this.PROCESS_MODEL_NAME = title;
                this.CHECKPOINTS_BY_PROCESS_AREA = new List<AUDIT_CHECKLIST_BY_PROCESS_AREA>();
            }

            public List<AUDIT_CHECKLIST_BY_PROCESS_AREA> CHECKPOINTS_BY_PROCESS_AREA { get; set; }
        }

        public class AUDIT_CHECKLIST_BY_PROCESS_AREA
        {
            public int PROCESS_AREA_ID { get; set; }
            public string PROCESS_AREA_NAME { get; set; }
            public decimal MAX_SCORE { get; set; }
            public decimal SCORE_ACHIEVED { get; set; }
            public decimal PERCENTAGE { get; set; }

            public AUDIT_CHECKLIST_BY_PROCESS_AREA(int id, string title)
            {
                this.PROCESS_AREA_ID = id;
                this.PROCESS_AREA_NAME = title;
                this.CHECKPOINTS_BY_PROCESS = new List<AUDIT_CHECKLIST_BY_PROCESS>();
            }

            public List<AUDIT_CHECKLIST_BY_PROCESS> CHECKPOINTS_BY_PROCESS { get; set; }
        }

        public class AUDIT_CHECKLIST_BY_PROCESS
        {
            public int PROCESS_ID { get; set; }

            public string PROCESS_NAME { get; set; }

            public decimal MAX_SCORE { get; set; }
            public decimal SCORE_ACHIEVED { get; set; }
            public decimal PERCENTAGE { get; set; }
            public AUDIT_CHECKLIST_BY_PROCESS(int id, string title)
            {
                this.CHECKPOINTS = new List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED>();
                this.PROCESS_ID = id;
                this.PROCESS_NAME = title;
            }
            public List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> CHECKPOINTS { get; set; }
        }

        public class ChecklistAuditData
        {
            public int AUDIT_ID { get; set; }
            public string[] SERVICE_AREA_IDS { get; set; }

            public string CUSTOMER_ID { get; set; }

            public string PROJECT_ID { get; set; }
        }

        private List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> GetSamplesAuditedNew(AUDIT_CHECKLIST_EXECUTION_DETAILS Audit, List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> existingSamples)
        {
            List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> mat = existingSamples.Where(t => t.APPLICABLE_QUESTIONS == Audit.PM_CHECKLIST_QUESTION_ID
                                       && t.PROCESS_MODEL_ID == Audit.PROCESS_MODEL_ID
                                       && t.PROCESS_ID == Audit.PROCESS_ID && t.SERVICE_AREA_ID == Audit.SERVICE_AREA_ID
                                       && t.PROCESS_AREA_ID == Audit.PROCESS_AREA_ID && t.ISACTIVE).ToList();
            return mat;
        }

        private List<AUDIT_CHECKLIST_PROJECT_FINDINGS> GetChecklistFindingsNew(AUDIT_CHECKLIST_EXECUTION_DETAILS Audit, List<FINDINGSTYPE_VALUES> FindingtypeValues,
                                List<AUDIT_CHECKLIST_PROJECT_FINDINGS> ExistingFindings)
        {

            var findings = ExistingFindings.Where(x => x.APPLICABLE_QUESTIONS == Audit.PM_CHECKLIST_QUESTION_ID
                                                    && x.PROCESS_ID == Audit.PROCESS_ID && x.SERVICE_AREA_ID == Audit.SERVICE_AREA_ID
                                                    && x.PROCESS_AREA_ID == Audit.PROCESS_AREA_ID
                                                    && x.PROCESS_MODEL_ID == Audit.PROCESS_MODEL_ID).ToList();

            foreach (var row in FindingtypeValues)
            {
                var record = findings.Find(x => x.FINDING_TYPE == row.FINDINGTYPE_VALUE);
                if (record != null)
                {
                    record.APPLICABLE_QUESTIONS = Audit.PM_CHECKLIST_QUESTION_ID;
                    record.AUDIT_ID = Audit.ASSESSMENT_ID;
                    record.FINDING_CATEGORY = row.FINDINGTYPE_CATEGORY;
                    record.GO_CATEGORY = row.GO_CATEGORY;
                }
                else
                {
                    var finding = new AUDIT_CHECKLIST_PROJECT_FINDINGS();
                    finding.FINDING_TYPE = row.FINDINGTYPE_VALUE;
                    finding.FINDING_DESCRIPTION = string.Empty;
                    finding.FINDING_CATEGORY = row.FINDINGTYPE_CATEGORY;
                    finding.AUDIT_ID = Audit.ASSESSMENT_ID;
                    finding.APPLICABLE_QUESTIONS = Audit.PM_CHECKLIST_QUESTION_ID;
                    finding.SERVICE_AREA_ID = Audit.SERVICE_AREA_ID;
                    finding.PROCESS_AREA_ID = Audit.PROCESS_AREA_ID;
                    finding.PROCESS_MODEL_ID = Audit.PROCESS_MODEL_ID;
                    finding.PROCESS_ID = Audit.PROCESS_ID;
                    finding.ISSUBMITTED = false;
                    finding.GO_CATEGORY = row.GO_CATEGORY;
                    findings.Add(finding);
                }
            }

            return findings;
        }

        private string GetStatusCategoryNew(int statusid, int listid)
        {
            return CSPdb.AUDIT_CHECKLIST_STATUS_LIST_VALUES.GetAll().Where(x => x.ID == statusid && x.STATUS_LIST_ID == listid).Select(y => y.STATUS_CATEGORY).FirstOrDefault();
        }

        private string GetCheckListQuestionNew(AUDIT_CHECKLIST_EXECUTION_DETAILS Audit)
        {
            string lookFor = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().Where(t => t.ID == Audit.PM_CHECKLIST_QUESTION_ID && t.ISACTIVE).Select(t => t.TITLE).FirstOrDefault();
            return lookFor;
        }
        private bool CheckIfNoMandatoryFindings(List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> checkpoints)
        {
            if (checkpoints == null)
                return false;

            foreach (var checkpoint in checkpoints)
            {
                foreach (var finding in checkpoint.FINDINGS)
                {
                    if (!string.IsNullOrEmpty(finding.FINDING_DESCRIPTION) && finding.GO_CATEGORY == "NO-GO")
                        return false;
                }
            }

            return true;
        }

        private void UpdateAuditStatus(int taskId, string status)
        {
            var rec = CSPdb.TASK.GetAll().FirstOrDefault(x => x.ID == taskId && x.ISACTIVE);
            if (rec != null)
            {
                rec.STATUS = status;
                CSPdb.TASK.Update(rec);
                CSPdb.Commit(CanCommit);
            }
        }

        private void SaveChecklistQuestionIsSubmitted(int QuestionId)
        {
            AUDIT_CHECKLIST_QUESTIONS ques = CSPdb.AUDIT_CHECKLIST_QUESTIONS.GetAll().Where(t => t.ID == QuestionId).FirstOrDefault();
            ques.ISSUBMITTED = true;
            CSPdb.AUDIT_CHECKLIST_QUESTIONS.Update(ques);
            CSPdb.Commit(CanCommit);
        }

        [POST("AddFindingCAP")]
        [ActionName("AddFindingCAP")]
        [HttpPost]
        public IHttpActionResult AddFindingCAP([FromBody] FINDING_STAGE_DATA results)
        {
            LogRequest(prefix: "AddFindingCAP");
            var empId = GetHeaderDetails_String("empId");

            Guid obj;
            AUDIT_FINDINGS_CAPA fcap = new AUDIT_FINDINGS_CAPA();
            string unique;
            var findingid = results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.FINDING_ID;
            var capstatus = string.Empty;
            var stageStatus = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(x => x.FINDING_ID == findingid && x.STAGE_ID == 1);
            if (stageStatus == null)
                return Ok(results);

            if (stageStatus.STAGE_STATUS == "New")
            {
                obj = Guid.NewGuid();
                unique = obj.ToString();
                if (stageStatus.STAGE_STATUS == "Corrective Action Plan Resubmit")
                    capstatus = "Corrective Action Plan Resubmit";
            }
            else
            {
                if (results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID != null)
                    unique = results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID;
                else
                {
                    obj = Guid.NewGuid();
                    unique = obj.ToString();
                }
            }

            var filteredRows = results.CAPA_SUBMISSION.CAPA.Where(x => x.CAPPALIST.STATUS != "Corrective Action Plan Approved").ToList();

            foreach (AUDIT_FINDING_CAPPA_EXT cap in filteredRows)
            {

                UpdateIsActive(cap);
                fcap = new AUDIT_FINDINGS_CAPA();
                fcap.FINDING_ID = cap.CAPPALIST.FINDING_ID;
                fcap.UNIQUE_ID = unique;
                fcap.CAP_TARGET_DATE = cap.CAPPALIST.CAP_TARGET_DATE;
                fcap.CORRECTION = cap.CAPPALIST.CORRECTION;
                fcap.CORRECTIVE_ACTION_PLAN = cap.CAPPALIST.CORRECTIVE_ACTION_PLAN;
                fcap.RESPONSIBLE = cap.CAPPALIST.RESPONSIBLE;
                fcap.CREATED_BY = empId;
                fcap.CREATED_DATE = DateTime.Now;
                fcap.ISACTIVE = true;
                fcap.ISROOTCAUSE = cap.CAPPALIST.ISROOTCAUSE;
                fcap.ISSUBMITTED = cap.CAPPALIST.ISSUBMITTED;
                fcap.NOTES = cap.CAPPALIST.NOTES;
                fcap.STATUS = cap.CAPPALIST.STATUS;
                fcap.PLAN_FOR_EFFECTIVE_CAP = cap.CAPPALIST.PLAN_FOR_EFFECTIVE_CAP;
                fcap.PLAN_TARGET_DATE = cap.CAPPALIST.PLAN_TARGET_DATE;
                fcap.ROOT_CAUSE_ID = cap.CAPPALIST.ROOT_CAUSE_ID;
                fcap.UPDATED_BY = empId;
                fcap.UPDATED_DATE = DateTime.Now;
                fcap.ROOTCAUSE_OTHER = cap.CAPPALIST.ROOTCAUSE_OTHER;
                CSPdb.AUDIT_FINDINGS_CAPA.Add(fcap);
                if (cap.CAPPALIST.STATUS == "Corrective Action Plan Submitted")
                    enableCAPReview(cap);
            }

            if (results.CAPA_SUBMISSION.CAPA.Any())
            {
                results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID = unique;
                UpdateFindingStatus(results.CAPA_SUBMISSION.CAPA[0].CAPPALIST);
                var checklistsendmail = new ChecklistSendMail();
                var findingId = results.CAPA_SUBMISSION.CAPA[0].CAPPALIST.FINDING_ID;
                string findingtxt = string.Empty;

                var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
                int auditid = 0;

                if (findingrow != null)
                {
                    auditid = findingrow.AUDIT_ID;
                    findingtxt = findingrow.FINDING_DESCRIPTION;
                }

                var auditrow = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == auditid && x.ISACTIVE);
                var requestDomain = helper.GetAbsoulteUri();
                var path = "layout/checklistfindings";

                if (auditrow != null)
                {
                    checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                    checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                    checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                    checklistsendmail.RECIPIENT_LIST = new List<string>() { auditrow.AUDITOR_ID };
                    checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                    checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                    checklistsendmail.URL = $"{requestDomain}/{path}/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}";
                    checklistsendmail.AUDITOR_ID = auditrow.AUDITOR_ID;
                }

                checklistsendmail.STAGE = "Corrective Action Plan Submission";
                checklistsendmail.STATUS = "Corrective Action Plan Submitted by Appraisee";
                if (capstatus == "Corrective Action Plan Resubmit")
                    checklistsendmail.STATUS = "Corrective Action Plan Resubmitted by Appraisee";
                checklistsendmail.ACTION = "Yes";
                checklistsendmail.CLASS = "hide";
                checklistsendmail.SUBJECT = $"Corrective Action Plan Submission status for finding- {findingtxt}";
                checklistsendmail.NEXT_ACTION = "Review Corrective Action Plan submitted";
                checklistsendmail.ACTION_CLASS = "showAction";
                checklistsendmail.TARGET = "2 Business days from the date of audit report submitted";
                checklistsendmail.REMARKS = "N/A";
                checklistsendmail.FINDING_DESCRIPTION = findingtxt;
                checklistsendmail.FINDING_ID = findingid;
                SendMailOnAuditChecklistStage(checklistsendmail);
            }
            return Ok(results);
        }

        private void enableCAPReview(AUDIT_FINDING_CAPPA_EXT capa)
        {
            var reviewRow = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().FirstOrDefault(t => t.FINDING_ID == capa.CAPPALIST.FINDING_ID && t.ROOT_CAUSE_ID == capa.CAPPALIST.ROOT_CAUSE_ID && t.UNIQUE_ID == capa.CAPPALIST.UNIQUE_ID && t.ISACTIVE == true);
            if (reviewRow == null)
                return;

            reviewRow.ISSUBMITTED = false;
            CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(reviewRow);
        }


        [POST("SaveAuditorAcceptanceStatus")]
        [ActionName("SaveAuditorAcceptanceStatus")]
        [HttpPost]
        public IHttpActionResult SaveAuditorAcceptanceStatus([FromBody] List<AUDITEE_ACCEPTANCE> resultList)
        {
            LogRequest(prefix: "SaveAuditorAcceptanceStatus");
            var empId = GetHeaderDetails_String("empId");

            if (resultList == null || resultList.Count == 0 || string.IsNullOrWhiteSpace(resultList[0].STATUS))
                return Ok(resultList);

            var findingId = resultList[0].FINDING_ID;
            var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            int auditid = 0;

            if (findingrow != null)
                auditid = findingrow.AUDIT_ID;

            foreach (var results in resultList)
            {
                var rec = CSPdb.AUDITEE_ACCEPTANCE.GetAll().Where(x => x.FINDING_ID == results.FINDING_ID && x.ISACTIVE).FirstOrDefault();
                if (rec != null)
                {
                    if (results.IS_AUDITOR_ACCEPT)
                    {
                        if (results.STATUS == "Accept") // auditor is accepting the auditee reject - complete the stages 
                        {
                            rec.STATUS = results.STATUS;
                            rec.REMARKS = results.REMARKS;
                            rec.ISACTIVE = true;
                            UpdateAuditFields(rec, empId);
                            CSPdb.AUDITEE_ACCEPTANCE.Update(rec);
                            UpdateFindingStatusForAuditorAcceptance(rec, auditid, empId);
                        }
                        else if (results.STATUS == "Reject") // auditor is accepting the auditee accept - no action to be taken.
                        {
                            rec.STATUS = "Auditor Rejected";
                            rec.REMARKS = results.REMARKS;
                            UpdateAuditFields(rec, empId);
                            CSPdb.AUDITEE_ACCEPTANCE.Update(rec);
                            UpdateFindingStatusForAuditorRejection(rec, auditid, empId);
                        }
                    }
                }
            }
            CSPdb.Commit(CanCommit);
            var checklistsendmail = new ChecklistSendMail();


            if (CheckIfNoOpenFinding(auditid))
                UpdateAuditStatus(auditid, "COMPLETED");

            var auditrow = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == auditid && x.ISACTIVE);
            var findingDetails = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            List<string> auditeeNames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => x.AUDIT_ID == auditid && x.ISACTIVE).Select(x => x.AUDITEE_EMP_ID).ToList();
            if (auditrow != null)
            {
                checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                checklistsendmail.RECIPIENT_LIST = auditeeNames;
                checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                checklistsendmail.AUDITOR_ID = auditrow.AUDITOR_ID;
            }


            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/checklistfindings";
            checklistsendmail.STAGE = "Findings Submitted";
            checklistsendmail.FINDING_DESCRIPTION = $"{findingDetails.FINDING_TYPE} - {findingDetails.FINDING_DESCRIPTION}";
            checklistsendmail.STATUS = $"Appraiser Response Submitted - {resultList.FirstOrDefault()?.STATUS}";
            checklistsendmail.URL = $"{requestDomain}/{path}/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}/{auditid}";
            checklistsendmail.ACTION = "Yes";
            checklistsendmail.CLASS = "show";
            checklistsendmail.SUBJECT = "Appraiser Response Submitted";
            checklistsendmail.ACTION_CLASS = "hideAction";
            checklistsendmail.AUDIT_ID = auditid;
            checklistsendmail.TARGET = "NA";
            checklistsendmail.REMARKS = resultList[0].REMARKS ?? "None";
            SendMailOnAuditChecklistStage(checklistsendmail);

            return Ok(resultList);
        }



        [POST("SaveAuditeeAcceptanceStatus")]
        [ActionName("SaveAuditeeAcceptanceStatus")]
        [HttpPost]
        public IHttpActionResult SaveAuditeeAcceptanceStatus([FromBody] List<AUDITEE_ACCEPTANCE> resultList)
        {
            LogRequest(prefix: "SaveAuditeeAcceptanceStatus");
            var empId = GetHeaderDetails_String("empId");
            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/checklistfindings";
            if (resultList == null || resultList.Count == 0 || string.IsNullOrWhiteSpace(resultList[0].STATUS))
                return Ok(resultList);
            var findingId = resultList[0].FINDING_ID;
            var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            int auditid = 0;

            if (findingrow != null)
                auditid = findingrow.AUDIT_ID;

            var validationResult = ValidateStatusApprovers(empId, auditid);
            if (!string.IsNullOrWhiteSpace(validationResult))
                return Content(System.Net.HttpStatusCode.Conflict, validationResult);

            foreach (var results in resultList)
            {
                var rec = CSPdb.AUDITEE_ACCEPTANCE.GetAll().Where(x => x.FINDING_ID == results.FINDING_ID && x.ISACTIVE).FirstOrDefault();
                if (rec != null)
                {

                    rec.REMARKS = results.REMARKS;
                    rec.STATUS = results.STATUS;
                    rec.ISSUBMITTED = true;
                    UpdateAuditFields(rec, empId);
                    CSPdb.AUDITEE_ACCEPTANCE.Update(rec);
                }
                else
                {
                    results.UNIQUE_ID = Guid.NewGuid().ToString();
                    results.ISSUBMITTED = true;
                    UpdateAuditFields(results, empId);
                    CSPdb.AUDITEE_ACCEPTANCE.Add(results);
                    CSPdb.Commit(CanCommit);

                }
                if (results.STATUS == "Reject")
                {
                    var updateResult = UpdateFindingStatusForAuditeeRejection(rec ?? results);
                    if (!string.IsNullOrWhiteSpace(updateResult))
                        return Content(System.Net.HttpStatusCode.Conflict, updateResult);
                }
            }
            CSPdb.Commit(CanCommit);

            var checklistsendmail = new ChecklistSendMail();


            if (CheckIfNoOpenFinding(auditid))
                UpdateAuditStatus(auditid, "COMPLETED");

            var auditrow = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == auditid && x.ISACTIVE);
            var findingDetails = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            if (auditrow != null)
            {
                checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                checklistsendmail.RECIPIENT_LIST = new List<string>() { auditrow.AUDITOR_ID };
                checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                checklistsendmail.AUDITOR_ID = auditrow.AUDITOR_ID;
            }

            checklistsendmail.STAGE = "Findings Submitted";
            checklistsendmail.FINDING_DESCRIPTION = $"{findingDetails.FINDING_TYPE} - {findingDetails.FINDING_DESCRIPTION}";
            checklistsendmail.STATUS = $"Appraisee Response Submitted - {resultList.FirstOrDefault()?.STATUS}";
            checklistsendmail.URL = $"{requestDomain}/{path}/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}/{auditid}";

            checklistsendmail.ACTION = "Yes";
            checklistsendmail.CLASS = "show";
            checklistsendmail.SUBJECT = "Appraisee Response Submitted";
            checklistsendmail.ACTION_CLASS = "hideAction";
            checklistsendmail.TARGET = "NA";
            checklistsendmail.AUDIT_ID = auditid;
            checklistsendmail.FINDING_ID = resultList[0].FINDING_ID;
            checklistsendmail.REMARKS = resultList[0].REMARKS ?? "None";
            SendMailOnAuditChecklistStage(checklistsendmail);

            return Ok(resultList);


        }

        internal string ValidateStatusApprovers(string empId, int auditId)
        {

            var result = CSPdb.AUDIT_SCHEDULE.GetAll().FirstOrDefault(t => t.ISACTIVE && t.TASK_ID.HasValue && t.TASK_ID == auditId);
            if (result != null)
            {
                //result.AUDITEE_EMP_ID = CSPdb.AUDIT_SCHEDULE_REF.GetAll().Where(x => x.KEY == "AUDITEE_EMP_ID" && x.AUDIT_SCHEDULE_ID == result.ID).Select(x => x.VALUE).ToList();

                var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == result.PROJ_ID);
                var allowedProjects = GetProjectListForUser(empId, project.CUST_ID);
                if (allowedProjects.Any(x => x.PROJ_ID == project.PROJ_ID) || (empId == project.PROJ_PM_EMP_ID) || (empId == project.PROJ_DM_EMP_ID))
                {
                    return string.Empty;
                }
            }
            return "You are not an authorised person to accept/reject the findings";

        }


        private bool CheckIfNoOpenFinding(int auditId, int questionId = -1)
        {
            var AllFindings = CSPdb.AppRepo.GetFindingsForAuditWithStatus(auditId, questionId).ToList();

            if (AllFindings.Count == 0)
                return true;

            var mandatoryFindings = AllFindings.Where(x => x.FINDINGTYPE_CATEGORY == "MANDATORY").ToList();
            var notApplicableFindings = AllFindings.Where(x => x.FINDINGTYPE_CATEGORY == "NOT APPLICABLE").ToList();

            if (CheckIfNoOpenMandatoryFinding(mandatoryFindings) && CheckIfNoOpenNAFinding(notApplicableFindings))
                return true;
            else
                return false;
        }

        private bool CheckIfNoOpenMandatoryFinding(List<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM> mandatoryFindings)
        {
            if (mandatoryFindings.Count == 0)
                return true;

            return mandatoryFindings.All(x => x.ISCOMPLETE.HasValue && x.ISCOMPLETE.Value);
        }

        private bool CheckIfNoOpenNAFinding(List<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM> notApplicableFindings)
        {
            if (notApplicableFindings.Count == 0)
                return true;

            return !notApplicableFindings.Any(x => x.STATUS == null || x.STATUS == "Reject");
        }

        [GET("GetAllAuditeeResponses")]
        [ActionName("GetAllAuditeeResponses")]
        [HttpGet]
        public IHttpActionResult GetAllAuditeeResponses(int assessmentId)
        {
            LogRequest(prefix: "GetAllAuditeeResponses");
            var findingIds = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == assessmentId).Select(x => x.ID).ToList();
            var result = CSPdb.AUDITEE_ACCEPTANCE.GetAll().Where(x => x.ISACTIVE && findingIds.Contains(x.FINDING_ID)).ToList();
            foreach (var capa in result)
            {
                var findingDetails = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(x => x.FINDING_ID == capa.FINDING_ID).ToList();
                if (findingDetails.Count > 0 && findingDetails.All(x => x.STAGE_STATUS == "Auditee Rejected" && x.ISCOMPLETE))
                {
                    capa.DISABLE_CAPA = true;
                    capa.STATUS = "Rejected-Complet";
                }
            }
            return Ok(result);
        }

        [POST("AddFindingCAPReviewDetails")]
        [ActionName("AddFindingCAPReviewDetails")]
        [HttpPost]
        public IHttpActionResult AddFindingCAPReviewDetails([FromBody] List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED> resultsList)
        {
            LogRequest(prefix: "AddFindingCAPReviewDetails");

            var empId = GetHeaderDetails_String("empId");

            var capStatus = string.Empty;


            foreach (AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED results in resultsList)
            {
                UpdateIsActiveReview(results);
                var review = new AUDIT_FINDING_CAPA_REVIEW();
                review.FINDING_ID = results.FINDING_ID;
                review.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID.HasValue ? results.ROOT_CAUSE_ID.Value : (int?)null;
                review.UNIQUE_ID = results.UNIQUE_ID;
                review.ISAPPROVED = results.ISCAPAPPROVED;
                review.ISREJECTED = results.ISCAPREJECTED;
                review.REMARKS = results.REMARKS;
                review.STATUS = results.STATUS;
                review.ISACTIVE = true;
                review.ISSUBMITTED = true;
                UpdateAuditFields(review);
                CSPdb.AUDIT_FINDING_CAPA_REVIEW.Add(review);

                if (review.ISREJECTED.Value)
                {
                    var cap = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(t => t.FINDING_ID == review.FINDING_ID && t.ROOT_CAUSE_ID == review.ROOT_CAUSE_ID && t.UNIQUE_ID == review.UNIQUE_ID && t.ISACTIVE == true);
                    cap.ISSUBMITTED = false;
                    cap.STATUS = review.STATUS;
                    CSPdb.AUDIT_FINDINGS_CAPA.Update(cap);
                    capStatus = "Corrective Action Plan Rejected";
                }

                else if (review.ISAPPROVED.Value)
                {
                    var cap = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(t => t.FINDING_ID == review.FINDING_ID && t.ROOT_CAUSE_ID == review.ROOT_CAUSE_ID && t.UNIQUE_ID == review.UNIQUE_ID && t.ISACTIVE == true).FirstOrDefault();
                    cap.STATUS = review.STATUS;
                    CSPdb.AUDIT_FINDINGS_CAPA.Update(cap);
                }
            }


            if (resultsList.Count > 0)
            {
                var findingId = resultsList[0].FINDING_ID;
                if (capStatus == "Corrective Action Plan Rejected")
                {
                    var aUDITEE_ACCEPTANCE = CSPdb.AUDITEE_ACCEPTANCE.GetAll().FirstOrDefault(x => x.FINDING_ID == findingId && x.ISACTIVE);
                    aUDITEE_ACCEPTANCE.ISSUBMITTED = false;
                    CSPdb.AUDITEE_ACCEPTANCE.Update(aUDITEE_ACCEPTANCE);
                }

                UpdateFindingReviewStatus(resultsList[0], capStatus);

                if (string.IsNullOrEmpty(capStatus))
                    capStatus = "Corrective Action Plan Approved";

                var checklistsendmail = new ChecklistSendMail();
                string findingtxt = string.Empty;
                string remarks = string.Empty;
                var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
                int auditid = 0;

                if (findingrow != null)
                {
                    auditid = findingrow.AUDIT_ID;
                    findingtxt = findingrow.FINDING_DESCRIPTION;
                }


                var auditrow = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == auditid && x.ISACTIVE);

                List<string> auditeeNames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => x.AUDIT_ID == auditid && x.ISACTIVE).Select(x => x.AUDITEE_EMP_ID).ToList();
                var requestDomain = helper.GetAbsoulteUri();
                var path = "layout/checklistfindings";

                if (auditrow != null)
                {
                    checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                    checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                    checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                    checklistsendmail.RECIPIENT_LIST = auditeeNames;
                    checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                    checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                    checklistsendmail.URL = $"{requestDomain}/{path}/{ auditrow.CUSTOMER_ID}/{ auditrow.PROJECT_ID}/{auditid}";
                    checklistsendmail.AUDITOR_ID = auditrow.AUDITOR_ID;
                }

                checklistsendmail.STAGE = "Corrective Action Plan Review";
                checklistsendmail.STATUS = capStatus;
                checklistsendmail.ACTION = "Yes";
                checklistsendmail.CLASS = "hide";
                checklistsendmail.TARGET = "2 Business days from the date of Corrective Action Plan Submitted";
                checklistsendmail.SUBJECT = $"Corrective Action Plan Review status for finding- {findingtxt}";
                if (capStatus == "Corrective Action Plan Approved")
                    checklistsendmail.NEXT_ACTION = "Implement Corrective Action and confirm the closure";
                else if (capStatus == "Corrective Action Plan Rejected")
                    checklistsendmail.NEXT_ACTION = "Resubmit Corrective Action Plan after review";
                checklistsendmail.REMARKS = resultsList[0].REMARKS;
                checklistsendmail.FINDING_DESCRIPTION = findingtxt;
                checklistsendmail.ACTION_CLASS = "showAction";
                checklistsendmail.FINDING_ID = findingId;
                SendMailOnAuditChecklistStage(checklistsendmail);
            }
            return Ok();
        }
        private void UpdateIsActiveReview(AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED fcap)
        {
            var capa = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(t => t.FINDING_ID == fcap.FINDING_ID && t.UNIQUE_ID == fcap.UNIQUE_ID && t.ROOT_CAUSE_ID == fcap.ROOT_CAUSE_ID).FirstOrDefault();
            if (capa != null)
            {
                capa.ISACTIVE = false;
                CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(capa);
                CSPdb.Commit(CanCommit);
            }
        }


        public IHttpActionResult AddFindingCAPImplementationDetails([FromBody] List<AUDIT_FINDING_CAPA_IMPLEMENTATION> resultsList)
        {
            LogRequest(prefix: "AddFindingCAPImplementationDetails");
            var empId = GetHeaderDetails_String("empId");

            var CapStatus = string.Empty;

            if (resultsList == null || !resultsList.Any())
                return Ok();

            foreach (var results in resultsList)
            {
                UpdateIsActiveImplementation(results);
                var review = new AUDIT_FINDING_CAPA_IMPLEMENTATION();
                review.FINDING_ID = results.FINDING_ID;
                review.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                review.UNIQUE_ID = results.UNIQUE_ID;
                review.ISIMPLEMENTED = results.ISIMPLEMENTED;
                review.REMARKS = results.REMARKS;
                review.STATUS = results.STATUS;
                UpdateAuditFields(review);
                review.ISACTIVE = true;
                CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Add(review);

                if (!review.ISIMPLEMENTED)
                    CapStatus = review.STATUS;
            }


            if (string.IsNullOrEmpty(CapStatus))
                CapStatus = "Corrective Action Plan Implemented";

            UpdateFindingImplementationStatus(resultsList[0], CapStatus);
            var findingId = resultsList[0].FINDING_ID;
            var checklistsendmail = new ChecklistSendMail();
            string findingtxt = string.Empty;
            var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            int auditid = 0;

            if (findingrow != null)
            {
                auditid = findingrow.AUDIT_ID;
                findingtxt = findingrow.FINDING_DESCRIPTION;
            }

            var auditrow = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == auditid && x.ISACTIVE);
            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/checklistfindings";

            if (auditrow != null)
            {
                checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                checklistsendmail.RECIPIENT_LIST = new List<string>() { auditrow.AUDITOR_ID };
                checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                checklistsendmail.URL = $"{requestDomain}/{path}/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}/{auditid}";
                checklistsendmail.AUDITOR_ID = auditrow.AUDITOR_ID;
            }

            checklistsendmail.STAGE = "Corrective Action Plan Implementation";
            checklistsendmail.STATUS = CapStatus;
            checklistsendmail.ACTION = "Yes";
            checklistsendmail.CLASS = "hide";
            checklistsendmail.SUBJECT = $"Corrective Action Plan Implementation status for finding - {findingtxt}";
            checklistsendmail.TARGET = "5 business days for Threats | 10 Business days for Weakness | 20 to 30 Business days for Opportunities for Improvements. Any anticipated delay in the target date should be approved";
            if (CapStatus == "Corrective Action Plan Implemented")
            {
                checklistsendmail.NEXT_ACTION = "Verify the closure corrective action and accept or reject";
                checklistsendmail.ACTION_CLASS = "showAction";
            }
            else
            {
                checklistsendmail.ACTION_CLASS = "hideAction";
            }
            checklistsendmail.REMARKS = resultsList[0].REMARKS;
            checklistsendmail.FINDING_DESCRIPTION = findingtxt;
            checklistsendmail.FINDING_ID = findingId;
            SendMailOnAuditChecklistStage(checklistsendmail);


            return Ok();
        }
        private void UpdateIsActiveImplementation(AUDIT_FINDING_CAPA_IMPLEMENTATION fcap)
        {
            AUDIT_FINDING_CAPA_IMPLEMENTATION capa = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().Where(t => t.FINDING_ID == fcap.FINDING_ID && t.UNIQUE_ID == fcap.UNIQUE_ID && t.ROOT_CAUSE_ID == fcap.ROOT_CAUSE_ID).FirstOrDefault();
            if (capa != null)
            {
                capa.ISACTIVE = false;
                CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Update(capa);
                CSPdb.Commit(CanCommit);
            }
        }

        [POST("AddFindingCAPVerificationDetails")]
        [ActionName("AddFindingCAPVerificationDetails")]
        [HttpPost]
        public IHttpActionResult AddFindingCAPVerificationDetails([FromBody] List<AUDIT_FINDING_CAPA_VERIFICATION> resultsList)
        {
            LogRequest(prefix: "AddFindingCAPVerificationDetails");
            var empId = GetHeaderDetails_String("empId");

            string CapRecommendedAction = string.Empty;

            if (resultsList == null || !resultsList.Any())
                return Ok(resultsList);

            foreach (var results in resultsList)
            {
                UpdateIsActiveVerifcation(results);
                var review = new AUDIT_FINDING_CAPA_VERIFICATION();
                review.FINDING_ID = results.FINDING_ID;
                review.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                review.UNIQUE_ID = results.UNIQUE_ID;
                review.ISVERIFIED = results.ISVERIFIED;
                review.ISREJECTED = results.ISREJECTED;
                review.REMARKS = results.REMARKS;
                review.STATUS = results.STATUS;
                review.RECOMMENDED_ACTION = results.RECOMMENDED_ACTION;
                UpdateAuditFields(review);
                review.ISACTIVE = true;
                CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.Add(review);
                CSPdb.Commit(CanCommit);


                if (review.ISREJECTED)
                {
                    if (review.RECOMMENDED_ACTION == "Resubmit Corrective Action Plan")
                        UpdateCAPSubmissionDetails(review);

                    else if (review.RECOMMENDED_ACTION == "Reimplement Corrective Action Plan")
                        UpdateCAPImplementationDetails(review);
                }

                else if (review.ISVERIFIED)
                {

                    var cap = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(t => t.FINDING_ID == review.FINDING_ID && t.ROOT_CAUSE_ID == review.ROOT_CAUSE_ID && t.UNIQUE_ID == review.UNIQUE_ID && t.ISACTIVE == true);
                    cap.STATUS = review.STATUS;
                    CSPdb.AUDIT_FINDINGS_CAPA.Update(cap);
                    CSPdb.Commit(CanCommit);
                }
            }

            foreach (var rec in resultsList)
            {
                if (!rec.ISREJECTED)
                    continue;

                if (rec.RECOMMENDED_ACTION == "Resubmit Corrective Action Plan")
                {
                    CapRecommendedAction = "Resubmit Corrective Action Plan";
                    break;
                }

                CapRecommendedAction = "Reimplement Corrective Action Plan";
            }

            if (string.IsNullOrEmpty(CapRecommendedAction))
                CapRecommendedAction = "Corrective Action Implementation Verified";

            UpdateFindingVerificationStatus(resultsList[0], CapRecommendedAction);
            var findingId = resultsList[0].FINDING_ID;
            var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            var isCloseFinfing = resultsList.All(x => x.ISVERIFIED);

            if (isCloseFinfing && findingrow != null)
            {
                if (CheckIfNoOpenFinding(findingrow.AUDIT_ID, findingrow.APPLICABLE_QUESTIONS))
                {
                    UpdateStatusOfQuestion(findingrow.ID);
                    CalculateNewScoreForchecklist(findingrow.AUDIT_ID, empId);
                }

                if (CheckIfNoOpenFinding(findingrow.AUDIT_ID))
                    UpdateAuditStatus(findingrow.AUDIT_ID, "COMPLETED");
            }

            var checklistsendmail = new ChecklistSendMail();
            string findingtxt = string.Empty;
            int auditid = 0;

            if (findingrow != null)
            {
                auditid = findingrow.AUDIT_ID;
                findingtxt = findingrow.FINDING_DESCRIPTION;
            }

            var auditrow = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == auditid && x.ISACTIVE);

            List<string> auditeeNames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => x.AUDIT_ID == auditid && x.ISACTIVE).Select(x => x.AUDITEE_EMP_ID).ToList();

            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/checklistfindings";

            if (auditrow != null)
            {
                checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                checklistsendmail.RECIPIENT_LIST = auditeeNames;
                checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                checklistsendmail.URL = $"{requestDomain}/{path}/{ auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}/{auditid}";
                checklistsendmail.AUDITOR_ID = auditrow.AUDITOR_ID;
            }

            checklistsendmail.STAGE = "Corrective Action Plan Verification";
            checklistsendmail.STATUS = CapRecommendedAction;
            checklistsendmail.ACTION = CapRecommendedAction == "Corrective Action Implementation Verified" ? "No" : "Yes";
            checklistsendmail.CLASS = "hide";
            checklistsendmail.SUBJECT = $"Corrective Action Plan Verification status for finding - {findingtxt}";
            checklistsendmail.ACTION_CLASS = "hideAction";
            checklistsendmail.TARGET = "2 Business days from the date of Implementation is completed/submitted by appraisee.";
            checklistsendmail.REMARKS = resultsList[0].REMARKS;
            checklistsendmail.FINDING_DESCRIPTION = findingtxt;
            checklistsendmail.FINDING_ID = findingId;
            SendMailOnAuditChecklistStage(checklistsendmail);
            return Ok();
        }

        private void UpdateStatusOfQuestion(int findingId)
        {
            var questionRow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            var auditrow = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().FirstOrDefault(x => x.PM_CHECKLIST_QUESTION_ID == questionRow.APPLICABLE_QUESTIONS
                    && x.SERVICE_AREA_ID == questionRow.SERVICE_AREA_ID && x.PROCESS_ID == questionRow.PROCESS_ID
                    && x.PROCESS_MODEL_ID == questionRow.PROCESS_MODEL_ID
                    && x.PROCESS_AREA_ID == questionRow.PROCESS_AREA_ID
                       && x.ASSESSMENT_ID == questionRow.AUDIT_ID && x.ISACTIVE && x.ISSUBMITTED);

            if (auditrow != null)
            {
                auditrow.UPDATED_SCORE = auditrow.MAX_SCORE;
                CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.Update(auditrow);
                CSPdb.Commit(CanCommit);
            }
        }

        private void CalculateNewScoreForchecklist(int auditId, string empId)
        {
            decimal acheivedscore = 0;
            decimal maxscore = 0;
            decimal percentage = 0;

            var auditRows = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.ASSESSMENT_ID == auditId && x.ISACTIVE).ToList();
            auditRows = auditRows.Where(x => x.STATUS_CATEGORY != "N/A").ToList();
            acheivedscore = auditRows.Sum(x => x.UPDATED_SCORE);
            maxscore = auditRows.Sum(x => x.MAX_SCORE);
            percentage = maxscore > 0 ? Math.Round((acheivedscore / maxscore) * 100, 2) : (acheivedscore == 0) ? 100 : 0;

            var headerRow = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == auditId && x.ISACTIVE);
            if (headerRow != null)
            {
                headerRow.UPDATED_PERCENTAGE_SCORE = percentage;
                headerRow.UPDATED_SCORE = acheivedscore;
                UpdateAuditFields(headerRow);
                CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Update(headerRow);

                if (headerRow.MATURITY_LEVEL_ID.HasValue)
                {
                    var checklistrow = CSPdb.PM_CHECKLIST.GetAll().FirstOrDefault(c => c.ID == headerRow.CHECKLIST_ID && c.ISACTIVE);
                    if (checklistrow != null)
                    {
                        var mappings = CSPdb.PM_MATURITYLEVEL_MAPPING.GetAll().Where(x => x.PROCESS_MODEL_ID == checklistrow.PROCESS_MODEL_ID && x.ISACTIVE).ToList();
                        var mapping = mappings.Find(x => percentage >= x.LOWER_BOUND_SCORE && percentage <= x.UPPER_BOUND_SCORE);

                        if (mapping != null)
                        {
                            headerRow.MATURITY_LEVEL_ID = mapping.MATURITY_LEVEL_ID;
                            CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Update(headerRow);
                        }
                    }
                }

                CSPdb.Commit(CanCommit);
            }

        }

        [POST("EnableChecklistStatus")]
        [ActionName("EnableChecklistStatus")]
        [HttpPost]
        public IHttpActionResult EnableChecklistStatus([FromBody] List<AUDIT_CHECKLIST_BY_SERVICE_AREA> resultList)
        {
            if (resultList == null || resultList.Count == 0)
                return Ok(resultList);

            var record = new AUDIT_CHECKLIST_PROJECT_FINDINGS();
            List<int> notSubmittedAuditRecs = new List<int>();
            List<int> notSubmittedFindings = new List<int>();
            var checkpoints = new List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED>();
            var findings = new List<AUDIT_CHECKLIST_PROJECT_FINDINGS>();
            try
            {
                checkpoints = resultList.SelectMany(x => x.CHECKPOINTS_BY_PROCESS_MODEL).SelectMany(x => x.CHECKPOINTS_BY_PROCESS_AREA)
                        .SelectMany(x => x.CHECKPOINTS_BY_PROCESS).SelectMany(x => x.CHECKPOINTS).ToList();

                findings = resultList.SelectMany(x => x.CHECKPOINTS_BY_PROCESS_MODEL).SelectMany(x => x.CHECKPOINTS_BY_PROCESS_AREA)
                        .SelectMany(x => x.CHECKPOINTS_BY_PROCESS).SelectMany(x => x.CHECKPOINTS).SelectMany(x => x.FINDINGS).ToList();
            }
            catch (Exception)
            {
                return BadRequest("Request was not in correct format");
            }

            notSubmittedAuditRecs.AddRange(checkpoints.Where(x => !x.ISSUBMITTED).Select(X => X.ID));
            notSubmittedFindings.AddRange(findings.Where(x => !x.ISSUBMITTED && x.ID != 0).Select(x => x.ID));

            var checklistRows = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => notSubmittedAuditRecs.Contains(x.ID) && x.ISACTIVE && x.ISSUBMITTED).ToList();
            if (checklistRows.Any())
            {
                checklistRows.ForEach(x => x.ISSUBMITTED = false);
                CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.Update(checklistRows);
                CSPdb.Commit(CanCommit);
            }

            var checklistFindings = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => notSubmittedFindings.Contains(x.ID) && x.ISACTIVE && x.ISSUBMITTED).ToList();
            if (checklistFindings.Any())
            {
                checklistFindings.ForEach(x => x.ISSUBMITTED = false);
                CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.Update(checklistFindings);
                CSPdb.Commit(CanCommit);
            }

            return Ok(resultList);
        }

        private void SendMailOnAuditChecklistStage([FromBody] ChecklistSendMail checklistSendMail)
        {

            if (checklistSendMail == null)
                return;

            string ccmail = string.Empty;
            string selectedccs = string.Empty;

            var proj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == checklistSendMail.PROJECT_ID);
            var cust = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == checklistSendMail.CUSTOMER_ID);
            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/qasummary";
            if (checklistSendMail.SUBJECT == "Assessment Completed" || checklistSendMail.SUBJECT == "Appraiser Response Submitted" || (checklistSendMail.SUBJECT == "Appraisee Response Submitted" && checklistSendMail.STATUS.Contains("Accept")))
            {
                checklistSendMail.FINDING_DETAILS_MSG = $"<p> Details of compliance against check-points  / assessment findings can be viewed <a href = \'{checklistSendMail.URL}'\'> here </a> , where in you can choose the assessment to view the result.</p>";
            }
            else if (checklistSendMail.SUBJECT == "Appraisee Response Submitted")
            {
                checklistSendMail.FINDING_DETAILS_MSG = $"<p> Details of compliance against check-points  / assessment findings can be viewed <a href = \'{checklistSendMail.URL}'\'> here </a> , where in you can choose the assessment to view the result.You can <a href='{requestDomain}/{path}/{checklistSendMail.CUSTOMER_ID}/{checklistSendMail.PROJECT_ID}/{checklistSendMail.AUDIT_ID}/{checklistSendMail.FINDING_ID}/1/1'> Accept</a> or <a href='{requestDomain}/{path}/{checklistSendMail.CUSTOMER_ID}/{checklistSendMail.PROJECT_ID}/{checklistSendMail.AUDIT_ID}/{checklistSendMail.FINDING_ID}/1/0 '> Revert </a>  the status</p>";
            }
            checklistSendMail.NOTE_MSG = $"<p> Note : You are requested to accept or reject the findings within 5 days from the date of reporting. In case the findings are not accepted within five days, the findings will be considered as accepted by the internal assessment system </p>";
            checklistSendMail.QUERY_MSG = $" <p>In case you have any query on the findings, please contact { checklistSendMail.AUDITOR_NAME}. In case of any issue that is not resolved even after approaching { checklistSendMail.AUDITOR_NAME} or Quality SPOC, please setup a call with Head of Quality Assurance to resolve it.</ p >";
            checklistSendMail.NEXT_ACTION = checklistSendMail.ACTION_CLASS == "hideAction" ? string.Empty : $"<span> Next Action : <b> {checklistSendMail.NEXT_ACTION} </b></span>";

            string mailContent;

            string csmMails = helper.GetCSMMailsFromProject(proj);
            string pmMails = helper.GetPMMailsFromProject(proj);

            string toperson = string.Empty;
            string tomail = string.Empty;

            checklistSendMail.CUSTOMER_NAME = cust?.CUST_NM;
            checklistSendMail.PROJECT_NAME = proj?.PROJ_NM;

            var recipientsDetails = GetRecipientDetails(checklistSendMail.AUDITOR_ID, proj, checklistSendMail.RECIPIENT_LIST);

            if (checklistSendMail.CC_LIST != null && checklistSendMail.CC_LIST.Count > 0)
                selectedccs = string.Join(",", Cldb.EMP_INFO.GetAll().Where(x => checklistSendMail.CC_LIST.Contains(x.EMP_ID) && x.DOR == null).Select(X => X.EMAIL_ID));

            var auditorMail = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == checklistSendMail.AUDITOR_ID && x.DOR == null);

            var subject = $"Project: {checklistSendMail.PROJECT_NAME} - {checklistSendMail.SUBJECT}";
            var recipientDtls = recipientsDetails.FirstOrDefault(x => !x.IsCC);
            if (recipientDtls != null)
            {
                toperson = recipientDtls.Name;
                tomail = recipientDtls.MailID;
            }
            else
            {
                toperson = recipientsDetails[0].Name;
                tomail = recipientsDetails[0].MailID;
                recipientsDetails[0].IsCC = false;
            }

            var htmlTable = GenerateFindingTable(checklistSendMail.AUDIT_ID, checklistSendMail.CUSTOMER_ID, checklistSendMail.PROJECT_ID, toperson);
            var ccMailIds = recipientsDetails.Where(x => x.IsCC).ToList();
            var ccMailId = string.Empty;
            if (ccMailIds.Any())
            {
                ccMailId = string.Join(",", ccMailIds.Select(x => x.MailID));
            }
            var qspoc = GetQSPOCMailforAssessment(proj);
            ccmail = helper.ConcatEmails(new List<string>() { pmMails, csmMails, ccMailId, selectedccs, qspoc, Constants.DEVX_LEAD, Constants.AUDITOR_LEAD }); // quality spoc , auditor
            bool showCapaTable = checklistSendMail.SUBJECT.ToLower().Contains("corrective action plan");
            var htmlCapaTable = string.Empty;
            if (showCapaTable)
            {
                htmlCapaTable = GenerateCapaTable(checklistSendMail.FINDING_ID, checklistSendMail.STAGE);
            }

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("AUDITEE_NM", toperson);
            EmailContentValues.Add("AUDIT_TITLE", checklistSendMail.AUDIT_TITLE);
            EmailContentValues.Add("AUDIT_PLANNED_DATE", checklistSendMail.PLANNED_DATE.ToLocalTime().ToString("dd-MMM-yyyy"));
            EmailContentValues.Add("AUDIT_COMPLETED_DATE", checklistSendMail.COMPLETED_DATE.ToLocalTime().ToString("dd-MMM-yyyy"));
            EmailContentValues.Add("ACTION", checklistSendMail.ACTION);
            EmailContentValues.Add("STAGE", checklistSendMail.STAGE);
            EmailContentValues.Add("STATUS", checklistSendMail.STATUS);
            EmailContentValues.Add("URL", checklistSendMail.URL);
            EmailContentValues.Add("AUDITOR_NAME", checklistSendMail.AUDITOR_NAME);
            EmailContentValues.Add("AUDITOR_MAIL", auditorMail?.EMAIL_ID);
            EmailContentValues.Add("CLASS", checklistSendMail.CLASS);
            EmailContentValues.Add("NEXT_ACTION", checklistSendMail.NEXT_ACTION);
            EmailContentValues.Add("ACTION_CLASS", checklistSendMail.ACTION_CLASS);
            EmailContentValues.Add("SCORE", checklistSendMail.SCORE);
            EmailContentValues.Add("SCORE_PERCENTAGE", checklistSendMail.SCORE_PERCENTAGE);
            EmailContentValues.Add("FINDING_DETAILS_MSG", checklistSendMail.FINDING_DETAILS_MSG);
            EmailContentValues.Add("NOTE_MSG", checklistSendMail.NOTE_MSG);
            EmailContentValues.Add("QUERY_MSG", checklistSendMail.QUERY_MSG);
            EmailContentValues.Add("SCORE_VALUES", checklistSendMail.SCORE_VALUES);
            EmailContentValues.Add("TABLE", htmlTable);
            EmailContentValues.Add("TARGET", checklistSendMail.TARGET);
            EmailContentValues.Add("FINDING_DESCRIPTION", checklistSendMail.FINDING_DESCRIPTION);
            EmailContentValues.Add("REMARKS", checklistSendMail.REMARKS);
            EmailContentValues.Add("CAPA_TABLE", htmlCapaTable);            
            if (checklistSendMail.STATUS == "Assessment Completed")
            {
                mailContent = helper.GetEmailContent("CheckListAuditSendMailForAssessmentCompleted.htm", EmailContentValues);
            }
            else if(checklistSendMail.STAGE.ToLower() == "corrective action plan submission")
            {
                mailContent = helper.GetEmailContent("CAPAAuditSubmissionEmail.htm", EmailContentValues);
            }
            else if (checklistSendMail.STAGE.ToLower() == "corrective action plan review")
            {
                mailContent = helper.GetEmailContent("CAPAAuditReviewEmail.htm", EmailContentValues);
            }
            else if (checklistSendMail.STAGE.ToLower() == "corrective action plan implementation")
            {
                mailContent = helper.GetEmailContent("CAPAAuditImplementationEmail.htm", EmailContentValues);
            }
            else if (checklistSendMail.STAGE.ToLower() == "corrective action plan verification")
            {
                mailContent = helper.GetEmailContent("CAPAAuditVerificationEmail.htm", EmailContentValues);
            }
            else 
            {
                mailContent = helper.GetEmailContent("ChecklistAuditSendEmail.htm", EmailContentValues);
            }

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;

            if (ep.SendEmail
                  (
                  new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                  new EmailContent { from = _email, returnpath = auditorMail?.EMAIL_ID, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = checklistSendMail.PROJECT_ID },

                  Request
                  ))
            {

                var mailRec = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == checklistSendMail.AUDIT_ID && x.ISACTIVE);
                if (mailRec != null)
                {
                    mailRec.MAIL_SENT = true;
                    CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Update(mailRec);
                    CSPdb.Commit(CanCommit);
                }
            }

        }

        private string GetQSPOCMailforAssessment(PROJECT proj)
        {
            var qspoc = helper.GetQualitySpocMailForProject(proj, false);
            if (string.IsNullOrWhiteSpace(qspoc)) qspoc = Constants.DEVX_MAIL;
            return qspoc;
        }
        private void SendMailReleaseAssessment(ReleaseAssessmentMail checklistSendMail)
        {

            if (checklistSendMail == null)
                return;

            var cust = CSPdb.CUSTOMER_PROJECTS.GetAll().FirstOrDefault(x => x.CUST_ID == checklistSendMail.CUSTOMER_ID);
            var proj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == checklistSendMail.PROJECT_ID);

            checklistSendMail.CUSTOMER_NAME = cust != null ? cust.CUST_NM : null;
            checklistSendMail.PROJECT_NAME = proj != null ? proj.PROJ_NM : null;

            string toperson = string.Empty;
            string tomail = string.Empty;
            string ccmail = string.Empty;
            string selectedcc = string.Empty;

            string csmMails = helper.GetCSMMailsFromProject(checklistSendMail.PROJECT_ID);
            string pmMails = helper.GetPMMailsFromProject(checklistSendMail.PROJECT_ID);

            var recipientsDetails = GetRecipientDetails(checklistSendMail.AUDITOR_ID, proj, checklistSendMail.RECIPIENT_LIST);

            if (checklistSendMail.CC_LIST != null && checklistSendMail.CC_LIST.Count > 0)
                selectedcc = string.Join(",", Cldb.EMP_INFO.GetAll().Where(x => checklistSendMail.CC_LIST.Contains(x.EMP_ID)).Select(x => x.EMAIL_ID));
            var auditorMail = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == checklistSendMail.AUDITOR_ID && x.DOR == null);
            var recipientDtls = recipientsDetails.FirstOrDefault(x => !x.IsCC);
            if (recipientDtls != null)
            {
                toperson = recipientDtls.Name;
                tomail = recipientDtls.MailID;
            }
            else
            {
                toperson = recipientsDetails[0].Name;
                tomail = recipientsDetails[0].MailID;
                recipientsDetails[0].IsCC = false;
            }

            var ccMailIds = recipientsDetails.Where(x => x.IsCC).ToList();
            var ccMailId = string.Empty;
            if (ccMailIds.Any())
            {
                ccMailId = string.Join(",", ccMailIds.Select(x => x.MailID));
            }
            var qspoc = GetQSPOCMailforAssessment(proj);
            ccmail = helper.ConcatEmails(new List<string>() { pmMails, csmMails, ccMailId, selectedcc, qspoc });

            decimal percent = 0;

            if (checklistSendMail.MAX_SCORE > 0)
                percent = (checklistSendMail.SCORE.GetValueOrDefault() / checklistSendMail.MAX_SCORE) * 100;

            var htmlTable = GenerateFindingTable(checklistSendMail.AUDIT_ID, checklistSendMail.CUSTOMER_ID, checklistSendMail.PROJECT_ID, toperson);

            string mailContent;
            var subject = $"Release Assessment report for Project: {checklistSendMail.PROJECT_NAME} {checklistSendMail.SUBJECT}"; ;

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("TO_RECIPIENTS", toperson);
            //EmailContentValues.Add("ASSESSMENT_TITLE", checklistSendMail.ASSESSMENT_TITLE);
            EmailContentValues.Add("AUDIT_PLANNED_MONTH", checklistSendMail.ASSESSMENT_MONTH);
            EmailContentValues.Add("GO_STATUS", checklistSendMail.GO_STATUS);
            EmailContentValues.Add("URL", checklistSendMail.URL);
            EmailContentValues.Add("PROJECT_NAME", checklistSendMail.PROJECT_NAME);
            EmailContentValues.Add("AUDITOR_NAME", checklistSendMail.AUDITOR_NAME);
            EmailContentValues.Add("AUDITOR_MAIL", auditorMail?.EMAIL_ID);
            EmailContentValues.Add("START_DATE", checklistSendMail.START_DATE.HasValue ? checklistSendMail.START_DATE.Value.ToString("dd-MMM-yyyy") : "-");
            EmailContentValues.Add("SCORE", checklistSendMail.SCORE.GetValueOrDefault().ToString());
            EmailContentValues.Add("MAX_SCORE", checklistSendMail.MAX_SCORE.ToString());
            EmailContentValues.Add("PERCENT", percent.ToString("0.00"));
            EmailContentValues.Add("TABLE", htmlTable);

            mailContent = helper.GetEmailContent("ReleaseAssessmentEmail.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            ep.SendEmail
           (
           new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
           new EmailContent { from = _email, returnpath = auditorMail?.EMAIL_ID, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = checklistSendMail.PROJECT_ID },
           Request
           );

            var mailRec = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == checklistSendMail.AUDIT_ID && x.ISACTIVE);
            if (mailRec != null)
            {
                mailRec.MAIL_SENT = true;
                CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Update(mailRec);
                CSPdb.Commit(CanCommit);
            }
        }

        private string GenerateFindingTable(int auditId, string custid, string projectid, string findingOwner)
        {
            var findingsList = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == auditId && x.ISACTIVE).ToList();
            var sb = new StringBuilder();
            int i = 1;
            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/qasummary";

            if (findingsList.Count == 0)
            {
                return "<tr style='text-align: center;'><td colspan='4'>No findings reported</td></tr>";
            }

            foreach (var item in findingsList)
            {
                sb.Append("<tr>");
                sb.Append($"<td>{i++}</td>");
                sb.Append($"<td>{item.FINDING_TYPE}</td>");
                sb.Append($"<td>{item.FINDING_DESCRIPTION}</td>");
                sb.Append($"<td>{findingOwner}</td>");
                sb.Append($"<td><a href='{requestDomain}/{path}/{custid}/{projectid}/{item.AUDIT_ID}/{item.ID}/0/1 '> Accept</a>  /  <a href='{requestDomain}/{path}/{custid}/{projectid}/{item.AUDIT_ID}/{item.ID}/0/0 '> Reject</a> </td>");
                sb.AppendLine("</tr>");
            }
            return sb.ToString();
        }


        [POST("GetStageColor")]
        [ActionName("GetStageColor")]
        [HttpPost]
        public IHttpActionResult GetStageColor([FromBody] List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> results)
        {
            if (results == null || results.Count == 0)
                return Ok(results);


            var findings = new List<AUDIT_CHECKLIST_PROJECT_FINDINGS>();

            try
            {
                findings = results.SelectMany(x => x.FINDINGS).Distinct().ToList();
            }
            catch (Exception)
            {
                return Ok(results);
            }

            List<string> color;
            foreach (var finding in findings)
            {
                color = new List<string>();

                if (finding.FINDING_CATEGORY == "NOT APPLICABLE")
                {
                    color.Add("#AAAFB4");
                    color.Add("#AAAFB4");
                    color.Add("#AAAFB4");
                    color.Add("#AAAFB4");
                }
                else
                {
                    List<AUDIT_FINDING_STAGES_MAPPING> mapp = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(t => t.FINDING_ID == finding.ID && t.ISACTIVE).ToList();

                    var stageOne = mapp.FirstOrDefault(t => t.STAGE_ID == 1 && t.STAGE_STATUS.ToLower() == "auditee rejected")?.ISCOMPLETE;
                    var stageTwo = mapp.FirstOrDefault(t => t.STAGE_ID == 2 && t.STAGE_STATUS.ToLower() == "auditee rejected")?.ISCOMPLETE;
                    var stageThree = mapp.FirstOrDefault(t => t.STAGE_ID == 3 && t.STAGE_STATUS.ToLower() == "auditee rejected")?.ISCOMPLETE;
                    var stageFour = mapp.FirstOrDefault(t => t.STAGE_ID == 4 && t.STAGE_STATUS.ToLower() == "auditee rejected")?.ISCOMPLETE;

                    if ((stageOne.HasValue && stageOne.Value) && (stageTwo.HasValue && stageTwo.Value) && (stageThree.HasValue && stageThree.Value) && (stageFour.HasValue && stageFour.Value))
                    {

                        color.Add("#AAAFB4");
                        color.Add("#AAAFB4");
                        color.Add("#AAAFB4");
                        color.Add("#AAAFB4");

                    }
                    else
                    {

                        //stage1

                        var stage1 = mapp.FirstOrDefault(t => t.STAGE_ID == 1 && t.STAGE_STATUS.ToLower() != "auditee rejected")?.ISCOMPLETE;
                        if (stage1.HasValue && stage1.Value)
                            color.Add("#3AB376");
                        else
                            color.Add("#FF5969");

                        //stage2
                        var stage2 = mapp.FirstOrDefault(t => t.STAGE_ID == 2)?.ISCOMPLETE;
                        if (stage2.HasValue && stage2.Value)
                            color.Add("#3AB376");
                        else
                            color.Add("#FF5969");

                        //stage3
                        var stage3 = mapp.FirstOrDefault(t => t.STAGE_ID == 3)?.ISCOMPLETE;
                        if (stage3.HasValue && stage3.Value)
                            color.Add("#3AB376");
                        else
                            color.Add("#FF5969");

                        //stage4
                        var stage4 = mapp.FirstOrDefault(t => t.STAGE_ID == 4)?.ISCOMPLETE;
                        if (stage4.HasValue && stage4.Value)
                            color.Add("#3AB376");
                        else
                            color.Add("#FF5969");
                    }
                }
                finding.STAGE_COLORS = color;
            }
            return Ok(results);
        }


        [GET("GetCCListForChecklist")]
        [ActionName("GetCCListForChecklist")]
        [HttpGet]
        public IHttpActionResult GetCCListForChecklist(string custId)
        {
            return Ok(Cldb.AppRepo.GetEmpIdsForAccount(custId));
        }

        [GET("VerifyChecklistInAudit")]
        [ActionName("VerifyChecklistInAudit")]
        [HttpGet]
        public IHttpActionResult VerifyChecklistInAudit(int checklistId)
        {
            var checklistscore = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.CHECKLIST_ID == checklistId && x.ISACTIVE);
            return Ok(checklistscore);
        }

        [GET("GetCustomerListForChecklist")]
        [ActionName("GetCustomerListForChecklist")]
        [HttpGet]
        public IHttpActionResult GetCustomerListForChecklist(string customerId)
        {
            if (string.IsNullOrWhiteSpace(customerId)) return Ok(new List<CUST_EMP_INFO>());
            return Ok(Cldb.AppRepo.GetEmpIdsForCustomerAccount(customerId));
        }


        public class AssessmentBase
        {
            public int AUDIT_ID { get; set; }
            public string CUSTOMER_ID { get; set; }
            public string PROJECT_ID { get; set; }
            public string CUSTOMER_NAME { get; set; }
            public string PROJECT_NAME { get; set; }
            public string URL { get; set; }
            public string SUBJECT { get; set; }
            public string AUDITOR_NAME { get; set; }

            public string AUDITOR_ID { get; set; }
            public List<string> RECIPIENT_LIST { get; set; }
        }

        public class ReleaseAssessmentMail : AssessmentBase
        {
            public List<string> CC_LIST { get; set; }
            public string ASSESSMENT_MONTH { get; set; }
            public string ASSESSMENT_TITLE { get; set; }
            public string GO_STATUS { get; set; }
            public DateTime? START_DATE { get; set; }
            public decimal? SCORE { get; set; }
            public decimal MAX_SCORE { get; set; }

            public string CLASS { get; set; }

        }

        public class ChecklistSendMail : AssessmentBase
        {
            public string ACTION { get; set; }
            public string STAGE { get; set; }
            public string STATUS { get; set; }

            public string AUDIT_TITLE { get; set; }
            public DateTime PLANNED_DATE { get; set; }

            public DateTime COMPLETED_DATE { get; set; }
            public string CLASS { get; set; }

            public string NEXT_ACTION { get; set; }
            public string TARGET { get; set; }
            public string ACTION_CLASS { get; set; }
            public List<string> CC_LIST { get; set; }
            public string SCORE { get; set; }
            public string SCORE_VALUES { get; set; }
            public string SCORE_PERCENTAGE { get; set; }
            public string FINDING_DETAILS_MSG { get; set; }
            public string NOTE_MSG { get; set; }
            public string QUERY_MSG { get; set; }
            public string FINDING_DESCRIPTION { get; set; }
            public int? FINDING_ID { get; set; }
            public string REMARKS { get; set; }

        }

        [GET("GetFindingsForProject")]
        [ActionName("GetFindingsForProject")]
        [HttpGet]
        public IHttpActionResult GetFindingsForProject(string projId, int serviceAreaId)
        {
            List<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM> projectFindings = CSPdb.AppRepo.GetFindingsForProject(projId, serviceAreaId);
            return Ok(projectFindings);
        }

        [GET("GetAssessmentExecutionDetails")]
        [ActionName("GetAssessmentExecutionDetails")]
        [HttpGet]
        public IHttpActionResult GetAssessmentExecutionDetails()
        {
            List<AUDIT_CHECKLIST_EXECUTION_DETAILS> findings = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.ISACTIVE && x.ISSUBMITTED).ToList();
            return Ok(findings);
        }
        private class NameMailIDHolder
        {
            public string Name { get; set; }
            public string MailID { get; set; }
            public bool IsCC { get; set; }
        }

        [GET("GetWeightage")]
        [ActionName("GetWeightage")]
        [HttpGet]
        public IHttpActionResult GetWeightage()
        {
            var weightage = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE.GetAll().Where(x => x.ISACTIVE).ToList();
            return Ok(weightage);
        }

        [GET("GetWeightageForChecklist")]
        [ActionName("GetWeightageForChecklist")]
        [HttpGet]
        public IHttpActionResult GetWeightageForChecklist(int checklistId)
        {
            var checklistUsedInSubmittedAssessment = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.CHECKLIST_ID == checklistId && x.ISSUBMITTED && x.ISACTIVE);

            var weightages = CSPdb.AppRepo.GetWeightageForChecklist(checklistId);

            if (weightages.Any() && checklistUsedInSubmittedAssessment != null)
            {
                weightages.ForEach(x => x.IS_USED_IN_SUMBITTED_ASSESSMENT = true);
            }

            return Ok(weightages);

        }

        [GET("GetWeightageForAllChecklist")]
        [ActionName("GetWeightageForAllChecklist")]
        [HttpGet]
        public IHttpActionResult GetWeightageForAllChecklist()
        {
            var weightagesForCheckList = CSPdb.AppRepo.GetWeightageForAllChecklist().ToList();
            return Ok(weightagesForCheckList);

        }

        [POST("UpdateWeightageForChecklist")]
        [ActionName("UpdateWeightageForChecklist")]
        [HttpPost]
        public IHttpActionResult UpdateWeightageForChecklist(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            int checklistId = GetHeaderDetails_Int("checklistId");
            string empId = GetHeaderDetails_String("empId");

            List<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED> weightageScoresForChecklist = JsonConvert.DeserializeObject<List<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED>>(json);

            if (weightageScoresForChecklist == null)
                return BadRequest("Invalid request");

            if (checklistId <= 0)
                return BadRequest("Please update weightage after checklist created.");

            var existing = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE_SCORES.GetAll().Where(x => x.CHECKLIST_ID == checklistId && x.ISACTIVE).ToList();

            foreach (var weightageScores in weightageScoresForChecklist)
            {
                var exist = existing.FirstOrDefault(x => x.WEIGHTAGE_ID == weightageScores.WEIGHTAGE_ID);

                if (exist != null)
                {
                    exist.UPDATED_BY = empId;
                    exist.UPDATED_DATE = DateTime.Now;
                    exist.WEIGHTAGE_SCORE = weightageScores.WEIGHTAGE_SCORE;
                    exist.ISACTIVE = weightageScores.IS_CHECKED;
                    CSPdb.AUDIT_CHECKLIST_WEIGHTAGE_SCORES.Update(exist);
                }
                else
                {
                    if (weightageScores.IS_CHECKED)
                    {
                        var checklistweightage = new AUDIT_CHECKLIST_WEIGHTAGE_SCORES()
                        {
                            CHECKLIST_ID = checklistId,
                            WEIGHTAGE_ID = weightageScores.WEIGHTAGE_ID,
                            WEIGHTAGE_SCORE = weightageScores.WEIGHTAGE_SCORE,
                            CREATED_BY = empId,
                            CREATED_DATE = DateTime.Now,
                            UPDATED_BY = empId,
                            UPDATED_DATE = DateTime.Now,
                            ISACTIVE = true
                        };
                        CSPdb.AUDIT_CHECKLIST_WEIGHTAGE_SCORES.Add(checklistweightage);
                    }
                }
            }
            CSPdb.Commit(CanCommit);
            return Ok(weightageScoresForChecklist);
        }

        [GET("GetChecklistUsedInAssessment")]
        [ActionName("GetChecklistUsedInAssessment")]
        [HttpGet]
        public IHttpActionResult GetChecklistUsedInAssessment()
        {
            var checklistUsedInAssessment = CSPdb.AppRepo.GetChecklistUsedInAssessment().ToList();
            return Ok(checklistUsedInAssessment);

        }

        [GET("GetPreviewChecklist")]
        [ActionName("GetPreviewChecklist")]
        [HttpGet]
        public IHttpActionResult GetPreviewChecklist(int ChecklistId)
        {


            return Ok(GetPreviewChecklistPrivate(ChecklistId));
        }

        private List<QUESTIONS_BY_SERVICE_AREA> GetPreviewChecklistPrivate(int checklistId)
        {

            var checklistMappings = CSPdb.PM_PROCESS_QUESTIONS_MAPPING.GetAll().Where(x => x.CHECKLIST_ID == checklistId && x.ISACTIVE)
                                                                                                                        .OrderBy(x => x.ID)
                                                                                                                        .ToList();
            var weightages = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE.GetAll().Where(x => x.ISACTIVE).ToList();

            var checklistMappingsExt = new List<PM_PROCESS_QUESTIONS_MAPPING_EXT>();
            string processAreaIds = string.Join(",", checklistMappings.Select(t => t.PROCESS_AREA_ID).Distinct().ToList());
            var processModelList = CSPdb.AppRepo.GetProcessModelListByProcessAreaIds(processAreaIds).ToList();
            var output = new List<QUESTIONS_BY_SERVICE_AREA>();

            foreach (var row in checklistMappings)
            {
                var newRow = new PM_PROCESS_QUESTIONS_MAPPING_EXT();
                newRow.CHECKLIST_ID = row.CHECKLIST_ID;
                // newRow.IS_MATURITY_APPLICABLE = maturityapplicable;
                newRow.PROCESS_ID = row.PROCESS_ID;
                // newRow.IS_WEIGHTAGE_APPLICABLE = weightageapplicable;
                newRow.QUESTION_ID = row.QUESTION_ID;
                newRow.PROCESS_AREA_ID = row.PROCESS_AREA_ID;
                newRow.PROCESS_MODEL = processModelList.Where(pm => pm.PROCESS_AREA_ID == row.PROCESS_AREA_ID).Select(pm => pm.PROCESS_MODEL_NAME).FirstOrDefault() ?? string.Empty;
                newRow.SERVICE_AREA_ID = row.SERVICE_AREA_ID;
                newRow.DISPLAY_ORDER = row.DISPLAY_ORDER;
                newRow.IS_CHECKED = true;
                GetServiceAreaForProcess(newRow);
                GetProcessAreaForProcess(newRow);
                GetProcesstitleProcess(newRow);
                GetWeigtageForQuestion(newRow, weightages);
                GetQuestion(newRow);
                GetGlobalCategory(newRow);
                GetMaturityLevel(newRow);
                checklistMappingsExt.Add(newRow);
            }

            foreach (var row in checklistMappingsExt)
            {
                if (!output.Any(x => x.SERVICE_AREA_ID == row.SERVICE_AREA_ID))
                    output.Add(new QUESTIONS_BY_SERVICE_AREA(row.SERVICE_AREA_ID, row.SERVICE_AREA_NAME)
                    {
                        IS_SERVICE_TOWER_SELECTED = true
                    });


                var serviceAreaRec = output.Find(x => x.SERVICE_AREA_ID == row.SERVICE_AREA_ID);

                if (!serviceAreaRec.QUESTIONS_BY_PROCESS_AREA.Any(x => x.PROCESS_AREA_ID == row.PROCESS_AREA_ID))
                    serviceAreaRec.QUESTIONS_BY_PROCESS_AREA.Add(new QUESTIONS_BY_PROCESS_AREA(row.PROCESS_AREA_ID, row.PROCESS_AREA_NAME, row.PROCESS_MODEL)
                    {
                        IS_PROCESS_AREA_SELECTED = true
                    });

                var processAreaRec = serviceAreaRec.QUESTIONS_BY_PROCESS_AREA.Find(x => x.PROCESS_AREA_ID == row.PROCESS_AREA_ID);

                if (!processAreaRec.QUESTIONS_BY_PROCESS.Any(x => x.PROCESS_ID == row.PROCESS_ID))
                    processAreaRec.QUESTIONS_BY_PROCESS.Add(new QUESTIONS_BY_PROCESS(row.PROCESS_ID, row.PROCESS_NAME)
                    {
                        IS_PROCESS_SELECTED = true
                    });

                var processRec = processAreaRec.QUESTIONS_BY_PROCESS.Find(x => x.PROCESS_ID == row.PROCESS_ID);

                processRec.QUESTIONS.Add(row);
            }

            foreach (var servicearea in output)
            {
                foreach (var processarea in servicearea.QUESTIONS_BY_PROCESS_AREA)
                {
                    foreach (var process in processarea.QUESTIONS_BY_PROCESS)
                    {
                        process.QUESTIONS = process.QUESTIONS.OrderBy(x => x.DISPLAY_ORDER).ToList();
                    }
                }
            }

            return output;
        }

        [POST("ReviseChecklist")]
        [ActionName("ReviseChecklist")]
        [HttpPost]
        public IHttpActionResult ReviseChecklist([FromBody] PM_CHECKLIST pM_CHECKLIST, int ChecklistId)
        {
            LogRequest(prefix: "ReviseChecklist");
            if (pM_CHECKLIST != null)
            {
                pM_CHECKLIST.VERSION = Math.Round(pM_CHECKLIST.VERSION, 2);
                CSPdb.PM_CHECKLIST.Add(pM_CHECKLIST);
                CSPdb.Commit(CanCommit);
            }

            CopyChecklistQuestions(ChecklistId, pM_CHECKLIST);

            CopyChecklistWeightageScores(ChecklistId, pM_CHECKLIST.ID);

            return Ok(pM_CHECKLIST);
        }

        private void CopyChecklistQuestions(int ChecklistId, PM_CHECKLIST Newchecklist)
        {
            var questions = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().Where(x => x.CHECKLIST_ID == ChecklistId && x.ISACTIVE).ToList();
            foreach (var question in questions)
            {
                var mappingrec = CSPdb.PM_PROCESS_QUESTIONS_MAPPING.GetAll().FirstOrDefault(x => x.QUESTION_ID == question.ID && x.ISACTIVE);
                question.CHECKLIST_ID = Newchecklist.ID;
                CSPdb.PM_CHECKLIST_QUESTIONS.Add(question);
                CSPdb.Commit(CanCommit);

                if (mappingrec != null)
                {
                    mappingrec.QUESTION_ID = question.ID;
                    mappingrec.CHECKLIST_ID = Newchecklist.ID;
                    mappingrec.UPDATED_DATE = DateTime.Now;
                    mappingrec.CREATED_DATE = DateTime.Now;
                    mappingrec.ISACTIVE = true;
                    CSPdb.PM_PROCESS_QUESTIONS_MAPPING.Add(mappingrec);
                }

                CSPdb.Commit(CanCommit);
            }
        }

        private void CopyChecklistWeightageScores(int oldChecklistId, int newChecklistId)
        {
            List<AUDIT_CHECKLIST_WEIGHTAGE_SCORES> weightageScores = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE_SCORES.GetAll().Where(x => x.CHECKLIST_ID == oldChecklistId).ToList();
            if (weightageScores != null)
            {
                foreach (var weightage in weightageScores)
                {
                    weightage.CHECKLIST_ID = newChecklistId;
                    CSPdb.AUDIT_CHECKLIST_WEIGHTAGE_SCORES.Add(weightage);

                }
                CSPdb.Commit(CanCommit);
            }

        }
        private void GetWeigtageForQuestion(PM_PROCESS_QUESTIONS_MAPPING_EXT rec, List<AUDIT_CHECKLIST_WEIGHTAGE> weightages)
        {
            var weigtageRow = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().FirstOrDefault(x => x.ID == rec.QUESTION_ID && x.ISACTIVE);
            var weightage = new AUDIT_CHECKLIST_WEIGHTAGE();
            if (weigtageRow != null)
            {
                var weightageScores = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE_SCORES.GetAll().FirstOrDefault(x => x.CHECKLIST_ID == rec.CHECKLIST_ID && x.WEIGHTAGE_ID == weigtageRow.WEIGHTAGE_ID && x.ISACTIVE);
                if (weightageScores != null)
                {
                    rec.WEIGHTAGE = weightages.FirstOrDefault(x => x.WEIGHTAGE_ID == weightageScores.WEIGHTAGE_ID).WEIGHTAGE_TITLE;
                    rec.WEIGHTAGE_SCORE = weightageScores.WEIGHTAGE_SCORE;
                    rec.WEIGHTAGE_ID = weightageScores.WEIGHTAGE_ID;
                }
            }

        }

        private void GetServiceAreaForProcess(PM_PROCESS_QUESTIONS_MAPPING_EXT rec)
        {
            var servicenamerec = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().FirstOrDefault(x => x.ID == rec.SERVICE_AREA_ID && x.ISACTIVE);
            if (servicenamerec != null)
            {
                rec.SERVICE_AREA_NAME = servicenamerec.TITLE;
            }
            else
            {
                rec.SERVICE_AREA_NAME = string.Empty;
            }
        }
        private void GetProcessAreaForProcess(PM_PROCESS_QUESTIONS_MAPPING_EXT rec)
        {
            var processnamerec = CSPdb.PROCESS_AREA.GetAll().FirstOrDefault(x => x.ID == rec.PROCESS_AREA_ID && x.ISACTIVE);
            if (processnamerec != null)
            {
                rec.PROCESS_AREA_NAME = processnamerec.TITLE;
            }
            else
            {
                rec.PROCESS_AREA_NAME = string.Empty;
            }

        }
        private void GetProcesstitleProcess(PM_PROCESS_QUESTIONS_MAPPING_EXT rec)
        {
            var processrec = CSPdb.PROCESS.GetAll().FirstOrDefault(x => x.ID == rec.PROCESS_ID && x.ISACTIVE);
            if (processrec != null)
            {
                rec.PROCESS_NAME = processrec.TITLE;
            }
            else
            {
                rec.PROCESS_NAME = string.Empty;
            }

        }
        private void GetQuestion(PM_PROCESS_QUESTIONS_MAPPING_EXT rec)
        {
            var questionRow = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().FirstOrDefault(x => x.ID == rec.QUESTION_ID && x.ISACTIVE);
            if (questionRow != null)
            {
                rec.QUESTION = questionRow.TITLE;
            }
        }
        private void GetGlobalCategory(PM_PROCESS_QUESTIONS_MAPPING_EXT rec)
        {
            var questionrow = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().FirstOrDefault(x => x.ID == rec.QUESTION_ID && x.ISACTIVE);
            if (questionrow != null)
            {
                var globalRow = CSPdb.GLOBAL_PERSPECTIVE.GetAll().FirstOrDefault(x => x.ID == questionrow.GLOBAL_PERSPECTIVE_ID && x.ISACTIVE);
                if (globalRow != null)
                {
                    rec.CATEGORY = globalRow.SHORT_DESC;
                    rec.GLOBAL_PERSPECTIVE_ID = globalRow.ID;
                }
            }
        }

        private void GetMaturityLevel(PM_PROCESS_QUESTIONS_MAPPING_EXT rec)
        {
            var questionrow = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().FirstOrDefault(x => x.ID == rec.QUESTION_ID);
            if (questionrow != null)
            {
                var maturityRow = CSPdb.PM_MATURITYLEVEL_MAPPING.GetAll().FirstOrDefault(x => x.MATURITY_LEVEL_ID == questionrow.MATURITY_LEVEL_ID && x.ISACTIVE);
                if (maturityRow != null)
                {
                    rec.MATURITY_LEVEL = maturityRow.LEVEL_TITLE;
                }
            }
        }

        [GET("GetChecklistList")]
        [ActionName("GetChecklistList")]
        [HttpGet]
        public IHttpActionResult GetChecklistList(bool includeMerged = true)
        {

            var checklist = CSPdb.PM_CHECKLIST.GetAll().Where(t => t.ISACTIVE && (includeMerged || t.IS_MERGED == false)).OrderBy(t => t.TITLE).ToList();
            var empIds = checklist.Select(c => c.UPDATED_BY).ToList();
            var empInfo = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID)).ToList();
            if (checklist.Count > 0)
            {
                checklist.ForEach(x =>
                {
                    //int intEmpId = 0;
                    //if (int.TryParse(x.UPDATED_BY, out intEmpId))
                    x.UPDATED_NAME = empInfo.FirstOrDefault(y => y.EMP_ID == x.UPDATED_BY)?.FRST_NM;

                });
            }
            return Ok(checklist);
        }

        [POST("ResubmitChecklistAssessment")]
        [ActionName("ResubmitChecklistAssessment")]
        [HttpPost]
        public IHttpActionResult ResubmitChecklistAssessment(PlannedAuditsConsolidated plannedAudit)
        {
            var exist = Cldb.ASSESSMENT_STATUS_HISTORY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == plannedAudit.ID && x.ISACTIVE);
            if (exist != null)
            {
                exist.REQUEST_COMMENTS = plannedAudit.COMMENTS;
                exist.IS_RETAIN_CAPA = plannedAudit.IS_RETAIN_CAPA;
                UpdateAuditFields(exist);
                Cldb.ASSESSMENT_STATUS_HISTORY.Update(exist);
            }
            else
            {
                var record = new ASSESSMENT_STATUS_HISTORY();
                record.ASSESSMENT_ID = plannedAudit.ID;
                record.STATUS = plannedAudit.ASSESSMENT_STATUS;
                record.REQUESTED_EMP_ID = plannedAudit.EMP_ID;
                record.REQUEST_COMMENTS = plannedAudit.COMMENTS;
                record.IS_RETAIN_CAPA = plannedAudit.IS_RETAIN_CAPA;
                UpdateAuditFields(record);
                Cldb.ASSESSMENT_STATUS_HISTORY.Add(record);
            }

            Cldb.Commit(CanCommit);

            var toMail = helper.GetDBConfig("QUALITY_HEAD_MAIL", plannedAudit.CUST_ID);
            var empList = Cldb.EMP_INFO.GetAll().Where(x => x.EMAIL_ID == toMail || x.EMP_ID == plannedAudit.EMP_ID).ToList();
            var approverName = empList.FirstOrDefault(x => x.EMAIL_ID == toMail)?.FRST_NM;
            var requestor = empList.FirstOrDefault(x => x.EMP_ID == plannedAudit.EMP_ID);
            var ccMail = requestor.EMAIL_ID;
            var requestorName = requestor.FRST_NM;
            var customerName = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == plannedAudit.CUST_ID)?.CUST_NM;
            var projectName = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == plannedAudit.PROJ_ID && x.PROJ_STATUS != "Close")?.PROJ_NM;
            var subject = $"Assessment Revert to Resubmit for the {customerName} - {projectName}";
            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/checklistfindings/resubmit";
            var mainUrl = $"{requestDomain}/{path}/{plannedAudit.CUST_ID}/{plannedAudit.PROJ_ID}/{plannedAudit.ID}/";
            var approveUrl = mainUrl + "1";
            var rejectUrl = mainUrl + "0";

            var emailContentValues = new Dictionary<string, string>();
            emailContentValues.Add("CUSTOMER_NAME", customerName);
            emailContentValues.Add("PROJECT_NAME", projectName);
            emailContentValues.Add("ASSESSMENT_NAME", plannedAudit.DESCRIPTION);
            emailContentValues.Add("COMMENTS", plannedAudit.COMMENTS);
            emailContentValues.Add("APPROVER_NAME", approverName);
            emailContentValues.Add("REQUESTOR_NAME", requestorName);
            emailContentValues.Add("START_DATE", plannedAudit.ACTUAL_AUDIT_START_DATE.HasValue ? plannedAudit.ACTUAL_AUDIT_START_DATE.Value.ToLocalTime().ToString(_dateformat) : "-");
            emailContentValues.Add("END_DATE", plannedAudit.ACTUAL_AUDIT_END_DATE.HasValue ? plannedAudit.ACTUAL_AUDIT_END_DATE.Value.ToLocalTime().ToString(_dateformat) : "-");
            emailContentValues.Add("TODAYS_DATE", DateTime.Now.ToLocalTime().ToString(_dateformat));
            emailContentValues.Add("APPROVE", approveUrl);
            emailContentValues.Add("REJECT", rejectUrl);

            var mailContent = helper.GetEmailContent("AssessmentRevertRequest.htm", emailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = toMail, cc = ccMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = plannedAudit.PROJ_ID },
                      Request
                      ))
            {

            }
            return Ok();
        }

        [POST("RevertChecklistAssessmentData")]
        [ActionName("RevertChecklistAssessmentData")]
        [HttpPost]
        public IHttpActionResult RevertChecklistAssessmentData(PlannedAuditData plannedAuditData)
        {
            var exist = Cldb.ASSESSMENT_STATUS_HISTORY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == plannedAuditData.ASSESSMENT_ID && x.ISACTIVE);
            if (exist != null)
            {
                if (exist.STATUS == "Approved" || exist.STATUS == "Rejected")
                {
                    return BadRequest($"Assessment has been already {exist.STATUS}");
                }
                else
                {
                    exist.STATUS = plannedAuditData.STATUS;
                    exist.APPROVER_EMP_ID = plannedAuditData.EMP_ID;
                    exist.APPROVE_REJECT_COMMENTS = plannedAuditData.COMMENTS;
                    UpdateAuditFields(exist);
                    Cldb.ASSESSMENT_STATUS_HISTORY.Update(exist);
                    Cldb.Commit(CanCommit);
                }
            }

            var auditSummaryRecords = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == plannedAuditData.ASSESSMENT_ID && x.ISACTIVE);
            if (plannedAuditData.STATUS == "Approved")
            {
                if (auditSummaryRecords != null)
                {
                    auditSummaryRecords.ISSUBMITTED = false;
                    auditSummaryRecords.MAIL_SENT = false;
                    UpdateAuditFields(auditSummaryRecords);
                    CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.Update(auditSummaryRecords);
                }

                var task = CSPdb.TASK.GetAll().FirstOrDefault(x => x.ID == plannedAuditData.ASSESSMENT_ID && x.ISACTIVE);
                if (task != null)
                {
                    task.STATUS = "IN PROGRESS";
                    UpdateAuditFields(task);
                    CSPdb.TASK.Update(task);
                }

                var auditExecutionRecords = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.ASSESSMENT_ID == plannedAuditData.ASSESSMENT_ID && x.ISACTIVE).ToList();
                if (auditExecutionRecords != null)
                {
                    foreach (var record in auditExecutionRecords)
                    {
                        record.ISSUBMITTED = false;
                        UpdateAuditFields(record);
                        CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.Update(record);
                    }
                }

                var auditFindingRecords = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == plannedAuditData.ASSESSMENT_ID && x.ISACTIVE).ToList();
                if (auditFindingRecords != null)
                {
                    foreach (var record in auditFindingRecords)
                    {
                        record.ISSUBMITTED = false;
                        UpdateAuditFields(record);
                        CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.Update(record);
                    }
                }

                if (!exist.IS_RETAIN_CAPA)
                {
                    var aufitFindingIds = auditFindingRecords.Select(x => x.ID).ToList();
                    if (aufitFindingIds != null)
                    {
                        var auditFindingRecordsCapa = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => aufitFindingIds.Contains(x.FINDING_ID ?? 0) && x.ISACTIVE).ToList();
                        foreach (var record in auditFindingRecordsCapa)
                        {
                            UpdateAuditFields(record);
                            record.ISACTIVE = false;
                            CSPdb.AUDIT_FINDINGS_CAPA.Update(record);
                        }

                        var auditFindingStagesMapping = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(x => aufitFindingIds.Contains(x.FINDING_ID ?? 0) && x.ISACTIVE).ToList();
                        foreach (var record in auditFindingStagesMapping)
                        {
                            UpdateAuditFields(record);
                            record.ISACTIVE = false;
                            CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(record);
                        }

                        var auditFindingCapaReview = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(x => aufitFindingIds.Contains(x.FINDING_ID ?? 0) && x.ISACTIVE).ToList();
                        foreach (var record in auditFindingCapaReview)
                        {
                            UpdateAuditFields(record);
                            record.ISACTIVE = false;
                            CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(record);
                        }

                        var auditFindingCapaImplementation = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().Where(x => aufitFindingIds.Contains(x.FINDING_ID ?? 0) && x.ISACTIVE).ToList();
                        foreach (var record in auditFindingCapaImplementation)
                        {
                            UpdateAuditFields(record);
                            record.ISACTIVE = false;
                            CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Update(record);
                        }

                        var auditFindingCapaVerification = CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.GetAll().Where(x => aufitFindingIds.Contains(x.FINDING_ID ?? 0) && x.ISACTIVE).ToList();
                        foreach (var record in auditFindingCapaVerification)
                        {
                            UpdateAuditFields(record);
                            record.ISACTIVE = false;
                            CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.Update(record);
                        }

                        var auditFindingCapaStatusHistory = CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.GetAll().Where(x => aufitFindingIds.Contains(x.FINDING_ID ?? 0) && x.ISACTIVE).ToList();
                        foreach (var record in auditFindingCapaStatusHistory)
                        {
                            UpdateAuditFields(record);
                            record.ISACTIVE = false;
                            CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.Update(record);
                        }
                    }
                }
                CSPdb.Commit(CanCommit);
            }

            var empIds = new List<string>();
            empIds.Add(plannedAuditData.EMP_ID);
            empIds.Add(exist.REQUESTED_EMP_ID);
            var empList = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID)).ToList();
            var approver = empList.FirstOrDefault(x => x.EMP_ID == plannedAuditData.EMP_ID);
            var approverName = approver.FRST_NM;
            var ccMail = approver.EMAIL_ID;
            var requestor = empList.FirstOrDefault(x => x.EMP_ID == exist.REQUESTED_EMP_ID);
            var toMail = requestor.EMAIL_ID;
            var requestorName = requestor.FRST_NM;
            var customerName = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == plannedAuditData.CUST_ID)?.CUST_NM;
            var projectName = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == plannedAuditData.PROJ_ID && x.PROJ_STATUS != "Close")?.PROJ_NM;
            var subject = $"Assessment Revert to Resubmit for the {customerName} - {projectName}";

            var emailContentValues = new Dictionary<string, string>();
            emailContentValues.Add("CUSTOMER_NAME", customerName);
            emailContentValues.Add("PROJECT_NAME", projectName);
            emailContentValues.Add("ASSESSMENT_NAME", auditSummaryRecords.AUDIT_TITLE);
            emailContentValues.Add("COMMENTS", plannedAuditData.COMMENTS);
            emailContentValues.Add("APPROVER_NAME", approverName);
            emailContentValues.Add("REQUESTOR_NAME", requestorName);
            emailContentValues.Add("STATUS", plannedAuditData.STATUS);
            emailContentValues.Add("TODAYS_DATE", DateTime.Now.ToLocalTime().ToString(_dateformat));

            var mailContent = helper.GetEmailContent("AssessmentRevertApproveReject.htm", emailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = toMail, cc = ccMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = plannedAuditData.PROJ_ID },
                      Request
                      )) ;


            return Ok();
        }
        private string GenerateInternalAuditReport(string custId, string projId, int assessmentId)
        {
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            var task = CSPdb.TASK.GetAll().FirstOrDefault(x => x.ID == assessmentId);
            var audit = CSPdb.AUDIT_SCHEDULE.GetAll().FirstOrDefault(x => x.TASK_ID == task.ID);
            var auditScheduleRef = CSPdb.AUDIT_SCHEDULE_REF.GetAll().Where(x => x.AUDIT_SCHEDULE_ID == audit.ID).ToList();
            var auditExecutionSummary = CSPdb.AUDIT_CHECKLIST_EXECUTION_SUMMARY.GetAll().FirstOrDefault(x => x.ASSESSMENT_ID == assessmentId);


            var accountName = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID)?.CUST_NM;

            var auditeeIds = auditScheduleRef.Where(x => x.KEY == "AUDITEE_EMP_ID").Select(x => x.VALUE);
            var serviesAreaIds = auditScheduleRef.Where(x => x.KEY == "SERVICE_AREA_ID").Select(x => Convert.ToInt32(x.VALUE)).ToList();
            var serviceAreas = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => serviesAreaIds.Contains(x.ID)).Select(x => x.TITLE).ToList();


            string auditStartDate = auditExecutionSummary.ACTUAL_AUDIT_START_DATE.HasValue ? auditExecutionSummary.ACTUAL_AUDIT_START_DATE.Value.ToString("MM-dd-yyyy") : "-";
            string auditSubmittedDate = auditExecutionSummary.ACTUAL_AUDIT_END_DATE.HasValue ? auditExecutionSummary.ACTUAL_AUDIT_END_DATE.Value.ToString("MM-dd-yyyy") : "-";
            var reqReference = task.REQUIREMENT_REFERENCE;
            var servicename = string.Join(",", serviceAreas);
            var empId = GetHeaderDetails_String("empId");
            var empIdList = new List<string> { empId, audit.AUDITOR_EMP_ID };
            empIdList.AddRange(auditeeIds);
            var empInfoData = Cldb.EMP_INFO.GetAll().Where(x => empIdList.Contains(x.EMP_ID)).ToList();
            var requestor = empInfoData.FirstOrDefault(x => x.EMP_ID == empId);

            var auditorName = empInfoData.FirstOrDefault(x => x.EMP_ID == audit.AUDITOR_EMP_ID).FRST_NM;

            var auditeesName = empInfoData.Where(x => auditeeIds.Contains(x.EMP_ID)).Select(x => x.FRST_NM).ToList();
            var auditeeNames = string.Join(",", auditeesName);
            var processModelIds = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == assessmentId).Select(x => x.PROCESS_MODEL_ID).Distinct().ToList();
            var processModelNames = string.Join(",", CSPdb.PROCESS_MODEL.GetAll().Where(x => processModelIds.Contains(x.ID)).Select(x => x.DESCRIPTION).ToList());
            var qualityDirector = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMAIL_ID == Constants.QUALITY_HEAD).FRST_NM;
            var findingsTable = GenerateFindingTableReport(assessmentId);
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("PROJECT_NAME", project.PROJ_NM);
            EmailContentValues.Add("ACCOUNT_NAME", accountName);
            EmailContentValues.Add("AUDITOR_NAME", auditorName);
            EmailContentValues.Add("AUDITEE_NAME", auditeeNames);
            EmailContentValues.Add("SERVICE_TOWER", servicename);
            EmailContentValues.Add("PROCESS_MODEL", processModelNames);
            EmailContentValues.Add("REQUIREMENT_REFERENCE", reqReference?.ToString());
            EmailContentValues.Add("QUALITY_DIRECTOR", qualityDirector?.ToString());
            EmailContentValues.Add("AUDIT_START_DATE", auditStartDate);
            EmailContentValues.Add("AUDIT_SUBMITTED_DATE", auditSubmittedDate);
            EmailContentValues.Add("VERSION", auditExecutionSummary.VERSION_ID.ToString());
            EmailContentValues.Add("FINDINGS_TABLE", findingsTable);
            var mailContent = helper.GetEmailContent("InternalAuditReportTemplate.htm", EmailContentValues);

            return mailContent;


        }

        public class FindingCategory
        {
            public int SectionNumber { get; set; }
            public string SectionHeader { get; set; }
            public string[] FindingTypes { get; set; }
        }

        private string GenerateFindingTableReport(int auditId)
        {
            var findingsList = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == auditId && x.ISACTIVE).ToList();

            var findingCategories = new List<FindingCategory>
    {
        new FindingCategory {
            SectionNumber = 4,
            SectionHeader = "4. Findings:",
            FindingTypes = new[] { "Threat", "Weakness" }
        },
        new FindingCategory {
            SectionNumber = 5,
            SectionHeader = "5. Strengths and Best Practices:",
            FindingTypes = new[] { "Strength" }
        },
        new FindingCategory {
            SectionNumber = 6,
            SectionHeader = "6. Opportunities for Improvement (OFI):",
            FindingTypes = new[] { "Opportunities for Improvement", "Opportunity" }
        }
    };

            return string.Concat(findingCategories.Select(category => GenerateCategorySection(category, findingsList)));
        }

        private string GenerateCategorySection(FindingCategory category, List<AUDIT_CHECKLIST_PROJECT_FINDINGS> findingsList)
        {
            var categoryFindings = findingsList.Where(f => category.FindingTypes.Contains(f.FINDING_TYPE)).ToList();

            var sb = new StringBuilder().Append($"<p class='section-header'>{category.SectionHeader}</p>");

            if (categoryFindings.Any())
            {
                categoryFindings.Select((finding, index) => CreateFindingSection(finding, index + 1, category.SectionNumber)).ToList()
                    .ForEach(section => sb.Append(section));
            }
            else
            {
                sb.Append("<p>NIL</p>");
            }

            return sb.ToString();
        }

        private string CreateFindingSection(AUDIT_CHECKLIST_PROJECT_FINDINGS finding, int index, int sectionNumber)
        {
            if (finding == null)
                return string.Empty;

            var sb = new StringBuilder()
                .Append($"<div class='finding-section'>")
                .Append($"<div class='finding-item'>")
                .Append($"<p><b>{sectionNumber}.{index} {finding.FINDING_TYPE}:</b> {finding.FINDING_DESCRIPTION}</p>");
            sb.AppendLine("</div>")
              .AppendLine("</div>");

            return sb.ToString();
        }

        private string GenerateCapaTable(int? findingId, string status)
        {
            var findingsList = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => x.FINDING_ID == findingId && x.ISACTIVE).ToList();
            var rootCauseIds = findingsList.Select(x => x.ROOT_CAUSE_ID).Distinct().ToList();
            var rootCauseList = CSPdb.AUDIT_MANAGEMENT_ROOTCAUSES.GetAll().Where(x => rootCauseIds.Contains(x.ID)).ToList();
            var empIds = findingsList.Select(x => x.RESPONSIBLE).Distinct().ToList();
            var empIdList = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID)).ToList();
            var sb = new StringBuilder();
            int i = 1;
            var capaReviewList = new List<AUDIT_FINDING_CAPA_REVIEW>();
            var capaImplementationList = new List<AUDIT_FINDING_CAPA_IMPLEMENTATION>();
            var capaVerificationList = new List<AUDIT_FINDING_CAPA_VERIFICATION>();

            if (status == "Corrective Action Plan Review")
            {
         
                capaReviewList = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(x => x.FINDING_ID == findingId && x.ISACTIVE && x.ISSUBMITTED).ToList();
            }
            else if (status == "Corrective Action Plan Implementation")
            {
                capaImplementationList = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().Where(x => x.FINDING_ID == findingId && x.ISACTIVE).ToList();
            }
            else if (status == "Corrective Action Plan Verification")
            {
                capaVerificationList = CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.GetAll().Where(x => x.FINDING_ID == findingId && x.ISACTIVE).ToList();
            }

            foreach (var item in findingsList)
            {
                var rootCause = rootCauseList.FirstOrDefault(x => x.ID == item.ROOT_CAUSE_ID);
                string rootCauseName = rootCause.ROOT_CAUSE ?? "N/A";
                var empDetails = empIdList.FirstOrDefault(x => x.EMP_ID == item.RESPONSIBLE);
                string isRootCause = item.ISROOTCAUSE ? "Yes" : "No";

                sb.Append("<tr>");
                sb.Append($"<td>{i++}</td>");
                sb.Append($"<td>{rootCauseName}</td>");
                sb.Append($"<td>{isRootCause}</td>");
                sb.Append($"<td>{item.CORRECTION}</td>");
                sb.Append($"<td>{item.CORRECTIVE_ACTION_PLAN}</td>");
                sb.Append($"<td>{item.CAP_TARGET_DATE?.ToString("dd-MM-yyyy")}</td>");
                sb.Append($"<td>{empDetails.FRST_NM ?? "N/A"}</td>");
                sb.Append($"<td>{item.PLAN_FOR_EFFECTIVE_CAP}</td>");

                if (status == "Corrective Action Plan Review")
                {
                    var capaReview = capaReviewList.FirstOrDefault(x => x.ROOT_CAUSE_ID == item.ROOT_CAUSE_ID);
                    string isApproved = capaReview.ISAPPROVED == true ? "Yes" : "No";
                    string remarks = capaReview.REMARKS ?? string.Empty;
                    sb.Append($"<td>{isApproved}</td>");
                    sb.Append($"<td>{remarks}</td>");
                }
                else if (status == "Corrective Action Plan Implementation")
                {
                    var capaImplementation = capaImplementationList.FirstOrDefault(x => x.ROOT_CAUSE_ID == item.ROOT_CAUSE_ID);
                    string isImplemented = capaImplementation.ISIMPLEMENTED == true ? "Yes" : "No";
                    string remarks = capaImplementation.REMARKS ?? string.Empty;
                    sb.Append($"<td>{isImplemented}</td>");
                    sb.Append($"<td>{remarks}</td>");
                }
                else if (status == "Corrective Action Plan Verification")
                {
                    var capaVerification = capaVerificationList.FirstOrDefault(x => x.ROOT_CAUSE_ID == item.ROOT_CAUSE_ID);
                    string isVerified = capaVerification.ISVERIFIED == true ? "Yes" : "No";
                    string remarks = capaVerification.REMARKS ?? string.Empty;
                    sb.Append($"<td>{isVerified}</td>");
                    sb.Append($"<td>{remarks}</td>");
                }

                sb.AppendLine("</tr>");
            }
            return sb.ToString();
        }
       

    }
}

