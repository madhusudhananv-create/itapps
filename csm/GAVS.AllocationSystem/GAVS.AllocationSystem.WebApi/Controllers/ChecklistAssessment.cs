using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net.Http;
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
            string serviceAreas = string.Empty;
            var result = new List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED>();
            var finalCheckpoints = new List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED>();
            var output = new List<ChecklistNew>();
            decimal checklistScore = 0;
            decimal metCount = 0;
            var checklistrec = new ChecklistNew();
            int deno = 0;
            decimal value = 0;
            List<AUDIT_CHECKLIST_BY_SERVICE_AREA> CheckpointsByServiceArea = new List<AUDIT_CHECKLIST_BY_SERVICE_AREA>();
            int findingtypeid;
            List<FINDINGSTYPE_VALUES> findingTypeValues = new List<FINDINGSTYPE_VALUES>();
            CHECKLIST_SCORES_BY_AUDIT checklistrow;
            var maxscore = 0M;
            var acheivedscore = 0M;

            if (checklistAuditData != null)
            {
                serviceAreas = string.Join(",", checklistAuditData.SERVICE_AREA_IDS);
                result = CSPdb.AppRepo.GetChecklistAuditNew(checklistAuditData.CUSTOMER_ID, checklistAuditData.PROJECT_ID, serviceAreas).ToList();

                foreach (var row in result)
                {
                    var l = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.AUDIT_ID == checklistAuditData.AUDIT_ID && x.APPLICABLE_QUESTIONS == row.APPLICABLE_QUESTIONS
                                                && x.CUSTOMER_ID == checklistAuditData.CUSTOMER_ID && x.PROJECT_ID == checklistAuditData.PROJECT_ID
                                                && x.PROCESS_ID == row.PROCESS_ID && x.SERVICE_AREA_ID == row.SERVICE_AREA_ID
                                                && x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID && x.PROCESS_AREA_ID == row.PROCESS_AREA_ID
                                                && x.ISACTIVE);
                    var mod = new AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED();

                    findingTypeValues = CSPdb.FINDINGSTYPE_VALUES.GetAll().Where(x => x.FINDINGSTYPE_ID == row.FINDINGSTYPE_ID && x.ISACTIVE).ToList();

                    if (l != null)
                    {
                        mod.ID = l.ID;
                        mod.AUDIT_ID = l.AUDIT_ID;
                        mod.CUSTOMER_ID = l.CUSTOMER_ID;
                        mod.PROJECT_ID = l.PROJECT_ID;
                        mod.AUDIT_TITLE = l.AUDIT_TITLE;
                        mod.PLANNED_AUDIT_START_DATE = l.PLANNED_AUDIT_START_DATE;
                        mod.PLANNED_AUDIT_END_DATE = l.PLANNED_AUDIT_END_DATE;
                        mod.ACTUAL_AUDIT_START_DATE = l.ACTUAL_AUDIT_START_DATE;
                        mod.ACTUAL_AUDIT_END_DATE = l.ACTUAL_AUDIT_END_DATE;
                        mod.APPLICABLE_QUESTIONS = l.APPLICABLE_QUESTIONS;
                        mod.AUDITEE_NAME = GetAuditeeNames(l.AUDIT_ID);
                        mod.CC_EMP_LIST = GetCCEmpNames(l.AUDIT_ID);
                        mod.TO_EMP_LIST = GetToEmpNames(l.AUDIT_ID);
                        mod.AUDITOR_NAME = l.AUDITOR_NAME;
                        mod.AUDIT_SCOPE = l.AUDIT_SCOPE;
                        mod.AUDIT_ACTUAL_HOURS = l.AUDIT_ACTUAL_HOURS;
                        mod.AUDIT_PLANNED_HOURS = l.AUDIT_PLANNED_HOURS;
                        mod.CHECKLIST_SAMPLE_AUDITED = GetSamplesAudited(l);
                        mod.CREATED_BY = l.CREATED_BY;
                        mod.CREATED_DATE = l.CREATED_DATE;
                        mod.UPDATED_BY = l.UPDATED_BY;
                        mod.UPDATED_DATE = l.UPDATED_DATE;
                        mod.PROCESS_ID = l.PROCESS_ID;
                        mod.SERVICE_AREA_ID = l.SERVICE_AREA_ID;
                        mod.PROCESS_MODEL_ID = l.PROCESS_MODEL_ID;
                        mod.PROCESS_AREA_ID = l.PROCESS_AREA_ID;
                        mod.PROCESS_MODEL_DESCRIPTION = row.PROCESS_MODEL_DESCRIPTION;
                        mod.CHECKLIST_STATUS_LIST_ID = row.CHECKLIST_STATUS_LIST_ID;
                        mod.CHECKLIST_STATUS_LIST_VALUES = GetChecklistStatusValues(mod.CHECKLIST_STATUS_LIST_ID);
                        mod.FINDINGS = GetChecklistFindings(l, findingTypeValues);
                        mod.STATUS = l.STATUS;
                        mod.SCORE = l.SCORE;
                        mod.MAX_SCORE = l.MAX_SCORE;
                        mod.UPDATED_SCORE = l.UPDATED_SCORE;
                        mod.ISSUBMITTED = l.ISSUBMITTED;
                        mod.STATUS_CATEGORY = GetStatusCategory(l.STATUS, row.CHECKLIST_STATUS_LIST_ID);
                        mod.CURRENT_STATUS = l.CURRENT_STATUS;
                        mod.IS_WEIGHTAGE_APPLICABLE = row.IS_WEIGHTAGE_APPLICABLE;
                        if (row.IS_WEIGHTAGE_APPLICABLE)
                            GetWeightageScaleNew(l, mod);
                        mod.ID = l.ID;
                        mod.ISACTIVE = l.ISACTIVE;
                        mod.NOTES = l.NOTES;
                        mod.LOOK_FOR = GetCheckListQuestionNew(l);
                        mod.PROCESS_DESCRIPTION = row.PROCESS_DESCRIPTION;
                        mod.SERVICE_AREA_NAME = row.SERVICE_AREA_NAME;
                        mod.MAPPED_CHECKLIST = true;
                        mod.CHECKLIST_ID = row.CHECKLIST_ID;
                    }
                    else
                    {
                        mod = row;
                        mod.AUDIT_ID = checklistAuditData.AUDIT_ID;
                        mod.CHECKLIST_STATUS_LIST_VALUES = GetChecklistStatusValues(row.CHECKLIST_STATUS_LIST_ID);
                        mod.FINDINGS = GetChecklistFindings(row, findingTypeValues);
                        mod.MAPPED_CHECKLIST = false;
                    }

                    if (!output.Any(x => x.CHECKLIST_ID == row.CHECKLIST_ID))
                        output.Add(new ChecklistNew(row.CHECKLIST_ID, row.CHECKLIST_NAME, row.VERSIONID, row.IS_WEIGHTAGE_APPLICABLE, row.CORRECTIVE_ACTION_TRACKING, mod.MAPPED_CHECKLIST, row.MATURITY_LEVEL));

                    checklistrec = output.Find(x => x.CHECKLIST_ID == row.CHECKLIST_ID);
                    checklistrec.FINDINGSTYPE_ID = row.FINDINGSTYPE_ID.GetValueOrDefault();
                    checklistrec.FINDINGTYPE_VALUES = CSPdb.FINDINGSTYPE_VALUES.GetAll().Where(x => x.FINDINGSTYPE_ID == checklistrec.FINDINGSTYPE_ID).ToList();
                    if (checklistrec.MATURITY_LEVEL_APPLICABLE)
                        checklistrec.PM_MATURITYLEVEL_MAPPINGS = CSPdb.PM_MATURITYLEVEL_MAPPING.GetAll().Where(X => X.PROCESS_MODEL_ID == row.MAPPED_PROCESS_MODEL).ToList();


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

                foreach (var checklist in output)
                {
                    if(checklist.MAPPED_CHECKLIST)
                    {
                        var checklistScoreRow = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == checklistAuditData.AUDIT_ID && x.ISACTIVE);
                        if(checklistScoreRow != null)
                        {
                            checklist.OVERALL_SCORE = checklistScoreRow.SCORE;
                            checklist.OVERALL_SCORE_PERCENT = checklistScoreRow.PERCENTAGE_SCORE;
                        }
                        else
                        {
                            var auditRows = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().Where(x => x.AUDIT_ID == checklistAuditData.AUDIT_ID && x.ISACTIVE).ToList();
                            auditRows.ForEach(x => {
                                    if(x.CURRENT_STATUS != "N/A")
                                    {
                                        maxscore += x.MAX_SCORE.HasValue ? x.MAX_SCORE.Value : 0;
                                        acheivedscore += x.UPDATED_SCORE;
                                    }
                                });

                            checklist.OVERALL_SCORE = acheivedscore;
                            checklist.OVERALL_SCORE_PERCENT = maxscore > 0 ? Math.Round((acheivedscore / maxscore) * 100, 2) : (acheivedscore == 0) ? 100 : 0;
                        }
                    }
                    else
                    {
                        checklist.OVERALL_SCORE = 0;
                        checklist.OVERALL_SCORE_PERCENT = 0;
                    }
                }
            }

            return Ok(output);
        }


        public class ChecklistAuditData
        {
            public int AUDIT_ID { get; set; }
            public string[] SERVICE_AREA_IDS { get; set; }

            public int CUSTOMER_ID { get; set; }

            public string PROJECT_ID { get; set; }
        }

        public class ChecklistNew
        {
            public ChecklistNew()
            {

            }
            public ChecklistNew(int id, string name, decimal version, bool weightageapplicable, bool correctiveaction, bool mappedstatus, bool maturiryLevel)
            {
                this.CHECKLIST_ID = id;
                this.CHECKLIST_NAME = name;
                this.VERSION = version;
                this.WEIGHTAGE_APPLICABLE_FLAG = weightageapplicable;
                this.MATURITY_LEVEL_APPLICABLE = maturiryLevel;
                this.CORRECTIVE_ACTION_TRACKING = correctiveaction;
                this.MAPPED_CHECKLIST = mappedstatus;
                this.FINDINGTYPE_VALUES = new List<FINDINGSTYPE_VALUES>();
                this.CHECKPOINTS_BY_SERVICE_AREA = new List<AUDIT_CHECKLIST_BY_SERVICE_AREA>();
            }

            public int CHECKLIST_ID { get; set; }
            public string CHECKLIST_NAME { get; set; }
            public decimal VERSION { get; set; }
            public decimal OVERALL_SCORE { get; set; }

            public decimal OVERALL_SCORE_PERCENT { get; set; }

            public decimal WEIGHTAGE { get; set; }

            public int FINDINGSTYPE_ID { get; set; }

            public List<FINDINGSTYPE_VALUES> FINDINGTYPE_VALUES { get; set; }

            public bool WEIGHTAGE_APPLICABLE_FLAG { get; set; }

            public bool CORRECTIVE_ACTION_TRACKING { get; set; }
            public bool MATURITY_LEVEL_APPLICABLE { get; set; }

            public bool MAPPED_CHECKLIST { get; set; }
            public bool MAPPED_PROCESS_MODEL { get; set; }

            public List<PM_MATURITYLEVEL_MAPPING> PM_MATURITYLEVEL_MAPPINGS { get; set; }

            public List<AUDIT_CHECKLIST_BY_SERVICE_AREA> CHECKPOINTS_BY_SERVICE_AREA { get; set; }

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
                this.CHECKPOINTS = new List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED>();
                this.PROCESS_ID = id;
                this.PROCESS_NAME = title;
            }
            public List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED> CHECKPOINTS { get; set; }
        }

        private void GetWeightageScaleNew(AUDIT_CHECKLIST_PROJECT_EXECUTION Audit, AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED mod)
        {
            int weightageId = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().Where(t => t.ID == Audit.APPLICABLE_QUESTIONS).Select(t => t.WEIGHTAGE_ID).FirstOrDefault();
            AUDIT_CHECKLIST_WEIGHTAGE weightage = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE.GetAll().Where(t => t.ID == weightageId).FirstOrDefault();
            if (weightage != null)
            {
                mod.WEIGHTAGE_ID = weightage.ID;
                mod.WEIGHTAGE_TITLE = weightage.WEIGHTAGE_TITLE;
                mod.WEIGHTAGE_SCORE = weightage.WEIGHTAGE_SCORE;
            }
        }
        private string GetCheckListQuestionNew(AUDIT_CHECKLIST_PROJECT_EXECUTION Audit)
        {
            string lookFor = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().Where(t => t.ID == Audit.APPLICABLE_QUESTIONS).Select(t => t.TITLE).FirstOrDefault();
            return lookFor;
        }

        [POST("SaveAuditChecklistDetails")]
        [ActionName("SaveAuditChecklistDetails")]
        [HttpPost]
        public IHttpActionResult SaveAuditChecklistDetails([FromBody] List<AUDIT_CHECKLIST_BY_SERVICE_AREA> resultList)
        {
            int empIds = GetHeaderDetails_Int("empId");
            var findings = new List<AUDIT_CHECKLIST_PROJECT_FINDINGS>();
            decimal score = 0;
            decimal percentagescore = 0;
            decimal acheivedscore = 0;
            decimal maxscore = 0;
            bool isSubmitted = false;
            var checklistscoreModel = new CHECKLIST_SCORES_BY_AUDIT();

            if (resultList == null || !resultList.Any())
                return Ok(resultList);

            foreach (var servicearea in resultList)
            {
                foreach (var processModel in servicearea.CHECKPOINTS_BY_PROCESS_MODEL)
                {
                    foreach (var processAra in processModel.CHECKPOINTS_BY_PROCESS_AREA)
                    {
                        foreach (var process in processAra.CHECKPOINTS_BY_PROCESS)
                        {
                            foreach (AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED res in process.CHECKPOINTS)
                            {

                                var checkList = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.AUDIT_ID == res.AUDIT_ID && x.APPLICABLE_QUESTIONS == res.APPLICABLE_QUESTIONS
                                                    && x.PROCESS_ID == res.PROCESS_ID && x.SERVICE_AREA_ID == res.SERVICE_AREA_ID
                                                    && x.PROCESS_MODEL_ID == res.PROCESS_MODEL_ID && x.PROCESS_AREA_ID == res.PROCESS_AREA_ID
                                                    && x.CUSTOMER_ID == res.CUSTOMER_ID && x.PROJECT_ID == res.PROJECT_ID && x.ISACTIVE);
                                if (checkList != null)
                                {
                                    checkList.AUDIT_TITLE = res.AUDIT_TITLE;
                                    checkList.ACTUAL_AUDIT_START_DATE = res.ACTUAL_AUDIT_START_DATE;
                                    checkList.ACTUAL_AUDIT_END_DATE = res.ACTUAL_AUDIT_END_DATE;
                                    checkList.PLANNED_AUDIT_END_DATE = res.PLANNED_AUDIT_END_DATE;
                                    checkList.PLANNED_AUDIT_START_DATE = res.PLANNED_AUDIT_START_DATE;
                                    checkList.APPLICABLE_QUESTIONS = res.APPLICABLE_QUESTIONS;
                                    checkList.AUDITOR_NAME = res.AUDITOR_NAME;
                                    checkList.AUDIT_SCOPE = res.AUDIT_SCOPE;
                                    checkList.AUDIT_PLANNED_HOURS = res.AUDIT_PLANNED_HOURS;
                                    checkList.AUDIT_ACTUAL_HOURS = res.AUDIT_ACTUAL_HOURS;
                                    checkList.STATUS = res.STATUS;
                                    checkList.NOTES = res.NOTES;
                                    checkList.VERSIONID = res.VERSIONID;
                                    checkList.UPDATED_BY = empIds;
                                    checkList.UPDATED_DATE = DateTime.Now;
                                    checkList.ISACTIVE = true;
                                    checkList.ISSUBMITTED = res.ISSUBMITTED;
                                    checkList.UPDATED_SCORE = res.UPDATED_SCORE;
                                    checkList.SCORE = res.SCORE;
                                    score += checkList.SCORE;
                                    checkList.MAX_SCORE = res.MAX_SCORE;
                                    checkList.CURRENT_STATUS = res.CURRENT_STATUS;
                                    CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.Update(checkList);
                                    CSPdb.Commit();
                                    if (res.STATUS_CATEGORY != "N/A")
                                    {
                                        findings = SaveCheckListfindings(checkList, res);
                                        res.FINDINGS = findings;

                                        SaveSampleAudits(checkList, res);
                                    }
                                    if (res.ISSUBMITTED)
                                    {
                                        SaveLastUpdatedDetails(checkList, findings);
                                        isSubmitted = true;
                                    }     
                                }
                                else
                                {
                                    AUDIT_CHECKLIST_PROJECT_EXECUTION checkList1 = new AUDIT_CHECKLIST_PROJECT_EXECUTION();
                                    checkList1.AUDIT_ID = res.AUDIT_ID;
                                    checkList1.CUSTOMER_ID = res.CUSTOMER_ID;
                                    checkList1.PROJECT_ID = res.PROJECT_ID;
                                    checkList1.AUDIT_TITLE = res.AUDIT_TITLE;
                                    checkList1.ACTUAL_AUDIT_START_DATE = res.ACTUAL_AUDIT_START_DATE;
                                    checkList1.ACTUAL_AUDIT_END_DATE = res.ACTUAL_AUDIT_END_DATE;
                                    checkList1.PLANNED_AUDIT_END_DATE = res.PLANNED_AUDIT_END_DATE;
                                    checkList1.PLANNED_AUDIT_START_DATE = res.PLANNED_AUDIT_START_DATE;
                                    checkList1.APPLICABLE_QUESTIONS = res.APPLICABLE_QUESTIONS;
                                    checkList1.AUDITOR_NAME = res.AUDITOR_NAME;
                                    checkList1.AUDIT_SCOPE = res.AUDIT_SCOPE;
                                    checkList1.AUDIT_PLANNED_HOURS = res.AUDIT_PLANNED_HOURS;
                                    checkList1.AUDIT_ACTUAL_HOURS = res.AUDIT_ACTUAL_HOURS;
                                    checkList1.STATUS = res.STATUS;
                                    checkList1.NOTES = res.NOTES;
                                    checkList1.PROCESS_ID = res.PROCESS_ID;
                                    checkList1.SERVICE_AREA_ID = res.SERVICE_AREA_ID;
                                    checkList1.PROCESS_MODEL_ID = res.PROCESS_MODEL_ID;
                                    checkList1.PROCESS_AREA_ID = res.PROCESS_AREA_ID;
                                    checkList1.VERSIONID = res.VERSIONID;
                                    checkList1.ISSUBMITTED = res.ISSUBMITTED;
                                    checkList1.CREATED_BY = empIds;
                                    checkList1.CREATED_DATE = DateTime.Now;
                                    checkList1.UPDATED_BY = empIds;
                                    checkList1.UPDATED_DATE = DateTime.Now;
                                    checkList1.ISACTIVE = true;
                                    checkList1.SCORE = res.SCORE;
                                    checkList1.UPDATED_SCORE = res.SCORE;
                                    checkList1.MAX_SCORE = res.MAX_SCORE;
                                    score += checkList1.SCORE;
                                    checkList1.ISSUBMITTED = res.ISSUBMITTED;
                                    checkList1.CURRENT_STATUS = res.CURRENT_STATUS;
                                    CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.Add(checkList1);
                                    CSPdb.Commit();
                                    if (res.STATUS_CATEGORY != "N/A")
                                    {
                                        findings = SaveCheckListfindings(checkList1, res);
                                        res.FINDINGS = findings;
                                        SaveSampleAudits(checkList1, res);
                                    }

                                    if (res.ISSUBMITTED)
                                    {
                                        SaveLastUpdatedDetails(checkList1, findings);
                                        isSubmitted = true;
                                    }  
                                }
                            }
                        }
                    }
                }
            }

            var anyrec = resultList.First().CHECKPOINTS_BY_PROCESS_MODEL.First().CHECKPOINTS_BY_PROCESS_AREA.First().CHECKPOINTS_BY_PROCESS.First().CHECKPOINTS.First();
            SaveCheckListAuditeeDetailsNew(anyrec.AUDITEE_NAME, anyrec.AUDIT_ID, anyrec.CREATED_BY, anyrec.UPDATED_BY);
            if((anyrec.CC_EMP_LIST != null && anyrec.CC_EMP_LIST.Count > 0) || (anyrec.TO_EMP_LIST != null && anyrec.TO_EMP_LIST.Count > 0))
                SaveCheckListCCDetailsNew(anyrec.CC_EMP_LIST, anyrec.TO_EMP_LIST, anyrec.AUDIT_ID, anyrec.CREATED_BY, anyrec.UPDATED_BY);
            UpdateAuditStatus(anyrec.AUDIT_ID, "IN PROGRESS");

            var anyRow = resultList[0].CHECKPOINTS_BY_PROCESS_MODEL[0].CHECKPOINTS_BY_PROCESS_AREA[0].CHECKPOINTS_BY_PROCESS[0].CHECKPOINTS[0];
            var auditRows = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().Where(x => x.AUDIT_ID == anyRow.AUDIT_ID && x.ISACTIVE && x.ISSUBMITTED).ToList();

            if (isSubmitted)
            {
                if (CheckIfNoOpenFinding(anyRow.AUDIT_ID))
                {
                    auditRows.ForEach(x =>
                    {
                        if (x.CURRENT_STATUS == "NMET")
                            x.UPDATED_SCORE = x.MAX_SCORE.HasValue ? x.MAX_SCORE.Value : 0;
                    });
                    CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.Update(auditRows);
                    CSPdb.Commit();
                    UpdateAuditStatus(anyRow.AUDIT_ID, "COMPLETED");
                }

                auditRows.ForEach(x =>
                {
                    if (x.CURRENT_STATUS != "N/A")
                    {
                        acheivedscore += x.UPDATED_SCORE;
                        maxscore += x.MAX_SCORE.HasValue ? x.MAX_SCORE.Value : 0;
                    }

                });

                if (maxscore > 0)
                    percentagescore = Math.Round((acheivedscore / maxscore) * 100, 2);
                else if (maxscore == 0)
                    percentagescore = 100;

                var isRecExists = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == anyRow.AUDIT_ID && x.ISACTIVE);
                if (isRecExists != null)
                {
                    isRecExists.PERCENTAGE_SCORE = percentagescore;
                    isRecExists.UPDATED_BY = empIds.ToString();
                    isRecExists.SCORE = score;
                    isRecExists.UPDATED_DATE = DateTime.Now;

                    CSPdb.CHECKLIST_SCORES_BY_AUDIT.Update(isRecExists);
                    CSPdb.Commit();
                }
                else
                {
                    checklistscoreModel = new CHECKLIST_SCORES_BY_AUDIT()
                    {
                        AUDIT_ID = anyRow.AUDIT_ID,
                        CHECKLIST_ID = anyRow.CHECKLIST_ID,
                        SCORE = score,
                        PERCENTAGE_SCORE = percentagescore,
                        CREATED_DATE = DateTime.Now,
                        UPDATED_DATE = DateTime.Now,
                        CREATED_BY = empIds.ToString(),
                        UPDATED_BY = empIds.ToString(),
                        ISACTIVE = true,
                        MAIL_SENT = false
                    };

                    CSPdb.CHECKLIST_SCORES_BY_AUDIT.Add(checklistscoreModel);
                    CSPdb.Commit();
                }

                var auditrec = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == anyRow.AUDIT_ID && x.ISACTIVE);
                if (auditrec != null && !auditrec.MAIL_SENT)
                {
                    var cust = CSPdb.CUSTOMER_PROJECTS.GetAll().FirstOrDefault(x => x.CUST_ID == anyRow.CUSTOMER_ID);
                    var proj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == anyRow.PROJECT_ID);

                    var taskrec = CSPdb.TASK.GetAll().FirstOrDefault(x => x.ID == anyRow.AUDIT_ID && x.ISACTIVE);
                    bool isReleaseAssessment = false;
                    if (taskrec != null)
                    {
                        if (taskrec.TASK_CATEGORY_ID == 12)
                            isReleaseAssessment = true;
                    }

                    if (isReleaseAssessment)
                    {
                        string gostatus = "GO ahead";

                        if (!CheckIfNoMandatoryFindings(resultList))
                            gostatus = "No-GO";

                        var assessmentMonth = anyRow.PLANNED_AUDIT_START_DATE.Value.ToString("MMM", CultureInfo.InvariantCulture);
                        assessmentMonth = $"{assessmentMonth}-{anyRow.PLANNED_AUDIT_START_DATE.Value.Year.ToString().Substring(2)}";
                        var releaseassessrec = new ReleaseAssessmentMail()
                        {
                            CUSTOMER_ID = anyRow.CUSTOMER_ID,
                            PROJECT_ID = anyRow.PROJECT_ID,
                            CUSTOMER_NAME = cust != null ? cust.CUST_NM : null,
                            PROJECT_NAME = proj != null ? proj.PROJ_NM : null,
                            URL = $"https://csm.gavstech.com/layout/checklistfindings/{anyRow.CUSTOMER_ID}/{anyRow.PROJECT_ID}",
                            GO_STATUS = gostatus,
                            ASSESSMENT_TITLE = anyRow.AUDIT_TITLE,
                            ASSESSMENT_MONTH = assessmentMonth,
                            SUBJECT = $"{anyRow.AUDIT_TITLE} - Recommendation - {gostatus}",
                            RECIPIENT_LIST = anyRow.AUDITEE_NAME,
                            AUDITOR_NAME = anyRow.AUDITOR_NAME.GetValueOrDefault(),
                            AUDIT_ID = anyRow.AUDIT_ID,
                            CC_LIST = anyRow.CC_EMP_LIST
                        };
                        if (anyrec.TO_EMP_LIST != null && anyrec.TO_EMP_LIST.Count > 0)
                            releaseassessrec.RECIPIENT_LIST.AddRange(anyRow.TO_EMP_LIST);

                        SendMailReleaseAssessment(releaseassessrec, anyRow.PLANNED_AUDIT_START_DATE, auditrec.SCORE,maxscore);
                    }
                    else
                    {
                        bool noFinding = true;
                        var findingsList = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == anyRow.AUDIT_ID && x.ISACTIVE && x.ISSUBMITTED).ToList();
                        if (findingsList.Any())
                            noFinding = false;

                        var checkliststagenew = new ChecklistSendMail()
                        {
                            CUSTOMER_ID = anyRow.CUSTOMER_ID,
                            PROJECT_ID = anyRow.PROJECT_ID,
                            AUDIT_TITLE = anyRow.AUDIT_TITLE,
                            AUDITOR_NAME = GetEmployeeNamebyId(resultList[0].CHECKPOINTS_BY_PROCESS_MODEL[0].CHECKPOINTS_BY_PROCESS_AREA[0].CHECKPOINTS_BY_PROCESS[0].CHECKPOINTS[0].AUDITOR_NAME.ToString()),
                            COMPLETED_DATE = anyRow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault(),
                            PLANNED_DATE = anyRow.PLANNED_AUDIT_START_DATE.GetValueOrDefault(),
                            CUSTOMER_NAME = cust != null ? cust.CUST_NM : null,
                            PROJECT_NAME = proj != null ? proj.PROJ_NM : null,
                            ACTION = noFinding ? "No" : "Yes",
                            STATUS = "Assessment Completed",
                            STAGE = !noFinding ? "Findings Reported" : "No Findings Reported",
                            CLASS = !noFinding ? "show" : "hide",
                            URL = $"https://csm.gavstech.com/layout/checklistfindings/{anyRow.CUSTOMER_ID}/{anyRow.PROJECT_ID}",
                            SUBJECT = "Assessment Completed",
                            NEXT_ACTION = "Submit Corrective Action Plan within two days after accepting the findings",
                            ACTION_CLASS = !noFinding ? "showAction" : "hideAction",
                            RECIPIENT_LIST = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => x.AUDIT_ID == anyRow.AUDIT_ID).Select(x => x.AUDITEE_EMP_ID).ToList(),
                            AUDITOR_EMP_ID = anyRow.AUDITOR_NAME.GetValueOrDefault(),
                            AUDIT_ID = anyRow.AUDIT_ID,
                            SCORE = auditrec.SCORE.ToString(),
                            SCORE_PERCENTAGE = auditrec.PERCENTAGE_SCORE.ToString(),
                            CC_LIST = anyrec.CC_EMP_LIST
                        };
                        if (anyrec.TO_EMP_LIST != null && anyrec.TO_EMP_LIST.Count > 0)
                            checkliststagenew.RECIPIENT_LIST.AddRange(anyrec.TO_EMP_LIST);

                        SendMailOnAuditChecklistStage(checkliststagenew);
                    }
                }
            }

            return Ok(resultList);
        }


        private bool CheckIfNoMandatoryFindings(List<AUDIT_CHECKLIST_BY_SERVICE_AREA> resultlist)
        {
            if (resultlist == null)
                return false;
            
            foreach (var servicearea in resultlist)
            {
                foreach (var processmodel in servicearea.CHECKPOINTS_BY_PROCESS_MODEL)
                {
                    foreach (var processArea in processmodel.CHECKPOINTS_BY_PROCESS_AREA)
                    {
                        foreach (var process in processArea.CHECKPOINTS_BY_PROCESS)
                        {
                            foreach (var checkpoint in process.CHECKPOINTS)
                            {
                                foreach (var finding in checkpoint.FINDINGS)
                                {
                                    if (!string.IsNullOrEmpty(finding.FINDING_DESCRIPTION.Trim()) && finding.GO_CATEGORY == "NO-GO")
                                        return false;
                                }
                            }
                        }
                    }
                }
            }

            return true;
        }

        private void UpdateAuditStatus(int Taskid, string status)
        {
            var rec = CSPdb.TASK.GetAll().FirstOrDefault(x => x.ID == Taskid && x.ISACTIVE);
            if (rec != null)
            {
                rec.STATUS = status;
                CSPdb.TASK.Update(rec);
                CSPdb.Commit();
            }
        }

        private void SaveChecklistQuestionIsSubmitted(int QuestionId)
        {
            AUDIT_CHECKLIST_QUESTIONS ques = CSPdb.AUDIT_CHECKLIST_QUESTIONS.GetAll().Where(t => t.ID == QuestionId).FirstOrDefault();
            ques.ISSUBMITTED = true;
            CSPdb.AUDIT_CHECKLIST_QUESTIONS.Update(ques);
            CSPdb.Commit();
        }

        [POST("AddFindingCAP")]
        [ActionName("AddFindingCAP")]
        [HttpPost]
        public IHttpActionResult AddFindingCAP([FromBody] FINDING_STAGE_DATA results)
        {

            string empId = Request.Headers.GetValues("empId").ToList()[0];
            int empIds = Convert.ToInt32(empId);
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
                if (stageStatus.STAGE_STATUS == "CAP Resubmit")
                    capstatus = "CAP Resubmit";
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

            var filteredRows = results.CAPA_SUBMISSION.CAPA.Where(x => x.CAPPALIST.STATUS != "CAP Approved").ToList();

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
                fcap.CREATED_BY = empIds;
                fcap.CREATED_DATE = DateTime.Now;
                fcap.ISACTIVE = true;
                fcap.ISROOTCAUSE = cap.CAPPALIST.ISROOTCAUSE;
                fcap.ISSUBMITTED = cap.CAPPALIST.ISSUBMITTED;
                fcap.NOTES = cap.CAPPALIST.NOTES;
                fcap.STATUS = cap.CAPPALIST.STATUS;
                fcap.PLAN_FOR_EFFECTIVE_CAP = cap.CAPPALIST.PLAN_FOR_EFFECTIVE_CAP;
                fcap.PLAN_TARGET_DATE = cap.CAPPALIST.PLAN_TARGET_DATE;
                fcap.ROOT_CAUSE_ID = cap.CAPPALIST.ROOT_CAUSE_ID;
                fcap.UPDATED_BY = empIds;
                fcap.UPDATED_DATE = DateTime.Now;
                CSPdb.AUDIT_FINDINGS_CAPA.Add(fcap);
                if (cap.CAPPALIST.STATUS == "CAP Submitted")
                    enableCAPReview(cap);
            }
            //else
            //{
            //    if (cap.CAPPALIST.ID == 0)
            //    {
            //        fcap = new AUDIT_FINDINGS_CAPA();
            //        fcap.FINDING_ID = cap.CAPPALIST.FINDING_ID;
            //        fcap.UNIQUE_ID = unique;
            //        fcap.CAP_TARGET_DATE = cap.CAPPALIST.CAP_TARGET_DATE;
            //        fcap.CORRECTION = cap.CAPPALIST.CORRECTION;
            //        fcap.CORRECTIVE_ACTION_PLAN = cap.CAPPALIST.CORRECTIVE_ACTION_PLAN;
            //        fcap.RESPONSIBLE = cap.CAPPALIST.RESPONSIBLE;
            //        fcap.CREATED_BY = empIds;
            //        fcap.CREATED_DATE = DateTime.Now;
            //        fcap.ISACTIVE = true;
            //        fcap.ISROOTCAUSE = cap.CAPPALIST.ISROOTCAUSE;
            //        fcap.ISSUBMITTED = cap.CAPPALIST.ISSUBMITTED;
            //        fcap.NOTES = cap.CAPPALIST.NOTES;
            //        fcap.STATUS = cap.CAPPALIST.STATUS;
            //        fcap.PLAN_FOR_EFFECTIVE_CAP = cap.CAPPALIST.PLAN_FOR_EFFECTIVE_CAP;
            //        fcap.PLAN_TARGET_DATE = cap.CAPPALIST.PLAN_TARGET_DATE;
            //        fcap.ROOT_CAUSE_ID = cap.CAPPALIST.ROOT_CAUSE_ID;
            //        fcap.UPDATED_BY = empIds;
            //        fcap.UPDATED_DATE = DateTime.Now;
            //        CSPdb.AUDIT_FINDINGS_CAPA.Add(fcap);
            //    }
            //    else
            //    {
            //        fcap = CSPdb.AUDIT_FINDINGS_CAPA.GetById(cap.CAPPALIST.ID);
            //        fcap.CAP_TARGET_DATE = cap.CAPPALIST.CAP_TARGET_DATE;
            //        fcap.CORRECTION = cap.CAPPALIST.CORRECTION;
            //        fcap.CORRECTIVE_ACTION_PLAN = cap.CAPPALIST.CORRECTIVE_ACTION_PLAN;
            //        fcap.RESPONSIBLE = cap.CAPPALIST.RESPONSIBLE;
            //        fcap.ISACTIVE = true;
            //        fcap.ISROOTCAUSE = cap.CAPPALIST.ISROOTCAUSE;
            //        fcap.ISSUBMITTED = cap.CAPPALIST.ISSUBMITTED;
            //        fcap.NOTES = cap.CAPPALIST.NOTES;
            //        fcap.STATUS = cap.CAPPALIST.STATUS;
            //        fcap.PLAN_FOR_EFFECTIVE_CAP = cap.CAPPALIST.PLAN_FOR_EFFECTIVE_CAP;
            //        fcap.PLAN_TARGET_DATE = cap.CAPPALIST.PLAN_TARGET_DATE;
            //        fcap.ROOT_CAUSE_ID = cap.CAPPALIST.ROOT_CAUSE_ID;
            //        fcap.UPDATED_BY = empIds;
            //        fcap.UPDATED_DATE = DateTime.Now;
            //        CSPdb.AUDIT_FINDINGS_CAPA.Update(fcap);
            //    }
            //}


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


                var auditrow = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);

                //List<int> auditeenames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => x.AUDIT_ID == auditid).Select(y => y.AUDITEE_EMP_ID).ToList();

                var scorerow = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);
                if (scorerow != null)
                {
                    checklistsendmail.SCORE = scorerow.SCORE.ToString();
                    checklistsendmail.SCORE_PERCENTAGE = scorerow.PERCENTAGE_SCORE.ToString();
                }

                if (auditrow != null)
                {
                    checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                    checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                    checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                    checklistsendmail.RECIPIENT_LIST = new List<int>() { auditrow.AUDITOR_NAME.GetValueOrDefault() };
                    checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                    checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                    checklistsendmail.URL = $"https://csm.gavstech.com/layout/checklistfindings/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}";
                    checklistsendmail.AUDITOR_EMP_ID = auditrow.AUDITOR_NAME.GetValueOrDefault();
                }

                checklistsendmail.STAGE = "CAP Submission";
                checklistsendmail.STATUS = "CAP Submitted by Appraisee";
                if (capstatus == "CAP Resubmit")
                    checklistsendmail.STATUS = "CAP Resubmitted by Appraisee";
                checklistsendmail.ACTION = "Yes";
                checklistsendmail.CLASS = "hide";
                checklistsendmail.SUBJECT = $"CAP Submission status for finding- {findingtxt}";
                checklistsendmail.NEXT_ACTION = "Review CAP submitted";
                checklistsendmail.ACTION_CLASS = "showAction";

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

        [POST("SaveAuditeeAcceptanceStatus")]
        [ActionName("SaveAuditeeAcceptanceStatus")]
        [HttpPost]
        public IHttpActionResult SaveAuditeeAcceptanceStatus([FromBody] List<AUDITEE_ACCEPTANCE> resultList)
        {
            var empId = Request.Headers.GetValues("empId").FirstOrDefault();
            if (resultList != null && resultList.Count > 0)
            {
                foreach (var results in resultList)
                {
                    var rec = CSPdb.AUDITEE_ACCEPTANCE.GetAll().Where(x => x.FINDING_ID == results.FINDING_ID && x.ISACTIVE).FirstOrDefault();
                    if (rec != null)
                    {
                        rec.UPDATED_BY = empId;
                        rec.UPDATED_DATE = DateTime.Now;
                        rec.REMARKS = results.REMARKS;
                        rec.STATUS = results.STATUS;
                        rec.ISSUBMITTED = true;
                        rec.ISACTIVE = true;
                        CSPdb.AUDITEE_ACCEPTANCE.Update(rec);
                        CSPdb.Commit();

                        if (results.STATUS == "Reject")
                        {
                            UpdateFindingStatusForAuditeeRejection(rec);
                        }
                    }
                    else
                    {
                        results.UNIQUE_ID = Guid.NewGuid().ToString();
                        results.CREATED_BY = empId;
                        results.UPDATED_BY = empId;
                        results.CREATED_DATE = DateTime.Now;
                        results.UPDATED_DATE = DateTime.Now;
                        results.ISACTIVE = true;
                        results.ISSUBMITTED = true;
                        CSPdb.AUDITEE_ACCEPTANCE.Add(results);
                        CSPdb.Commit();

                        if (results.STATUS == "Reject")
                        {
                            UpdateFindingStatusForAuditeeRejection(results);
                        }
                    }
                }
                var checklistsendmail = new ChecklistSendMail();
                var findingId = resultList[0].FINDING_ID;
                var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
                int auditid = 0;

                if (findingrow != null)
                    auditid = findingrow.AUDIT_ID;

                if (CheckIfNoOpenFinding(findingrow.AUDIT_ID, findingrow.APPLICABLE_QUESTIONS))
                {
                    UpdateStatusOfQuestion(findingId);
                    CalculateNewScoreForchecklist(findingrow.AUDIT_ID, empId);

                    if (CheckIfNoOpenFinding(auditid))
                        UpdateAuditStatus(auditid, "COMPLETED");

                }

                var auditrow = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);
                var scorerow = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);
                if (scorerow != null)
                {
                    checklistsendmail.SCORE = scorerow.SCORE.ToString();
                    checklistsendmail.SCORE_PERCENTAGE = scorerow.PERCENTAGE_SCORE.ToString();
                }

                if (auditrow != null)
                {
                    checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                    checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                    checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                    checklistsendmail.RECIPIENT_LIST = new List<int>() { auditrow.AUDITOR_NAME.GetValueOrDefault() };
                    checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                    checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                    checklistsendmail.AUDITOR_EMP_ID = auditrow.AUDITOR_NAME.GetValueOrDefault();
                }

                checklistsendmail.STAGE = "Findings Submitted";
                checklistsendmail.STATUS = "Appraisee Response Submitted";
                checklistsendmail.URL = $"https://csm.gavstech.com/layout/checklistfindings/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}";
                checklistsendmail.ACTION = "Yes";
                checklistsendmail.CLASS = "hide";
                checklistsendmail.SUBJECT = "Appraisee Response Submitted";
                checklistsendmail.ACTION_CLASS = "hideAction";

                SendMailOnAuditChecklistStage(checklistsendmail);
            }
            return Ok(resultList);
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
        public IHttpActionResult GetAllAuditeeResponses(HttpRequestMessage request)
        {
            var result = CSPdb.AUDITEE_ACCEPTANCE.GetAll().Where(x => x.ISACTIVE).ToList();
            return Ok(result);
        }

        [POST("AddFindingCAPReviewDetails")]
        [ActionName("AddFindingCAPReviewDetails")]
        [HttpPost]
        public IHttpActionResult AddFindingCAPReviewDetails([FromBody] List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED> resultsList)
        {

            string empId = Request.Headers.GetValues("empId").ToList()[0];
            int empIds = Convert.ToInt32(empId);
            var capStatus = string.Empty;

            foreach (AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED results in resultsList)
            {
                UpdateIsActiveReview(results);
                AUDIT_FINDING_CAPA_REVIEW review = new AUDIT_FINDING_CAPA_REVIEW();
                review.FINDING_ID = results.FINDING_ID;
                review.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                review.UNIQUE_ID = results.UNIQUE_ID;
                review.ISAPPROVED = results.ISCAPAPPROVED;
                review.ISREJECTED = results.ISCAPREJECTED;
                review.REMARKS = results.REMARKS;
                review.STATUS = results.STATUS;
                review.UPDATED_BY = empIds;
                review.UPDATED_DATE = DateTime.Now;
                review.ISACTIVE = true;
                review.ISSUBMITTED = true;
                CSPdb.AUDIT_FINDING_CAPA_REVIEW.Add(review);

                if (review.ISREJECTED)
                {
                    AUDIT_FINDINGS_CAPA cap = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(t => t.FINDING_ID == review.FINDING_ID && t.ROOT_CAUSE_ID == review.ROOT_CAUSE_ID && t.UNIQUE_ID == review.UNIQUE_ID && t.ISACTIVE == true);
                    cap.ISSUBMITTED = false;
                    cap.STATUS = review.STATUS;
                    CSPdb.AUDIT_FINDINGS_CAPA.Update(cap);
                    capStatus = "CAP Rejected";
                }

                else if (review.ISAPPROVED)
                {
                    AUDIT_FINDINGS_CAPA cap = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(t => t.FINDING_ID == review.FINDING_ID && t.ROOT_CAUSE_ID == review.ROOT_CAUSE_ID && t.UNIQUE_ID == review.UNIQUE_ID && t.ISACTIVE == true).FirstOrDefault();
                    cap.STATUS = review.STATUS;
                    CSPdb.AUDIT_FINDINGS_CAPA.Update(cap);
                }
            }


            if (resultsList.Count > 0)
            {
                var findingId = resultsList[0].FINDING_ID;
                if (capStatus == "CAP Rejected")
                {
                    AUDITEE_ACCEPTANCE aUDITEE_ACCEPTANCE = CSPdb.AUDITEE_ACCEPTANCE.GetAll().FirstOrDefault(x => x.FINDING_ID == findingId && x.ISACTIVE);
                    aUDITEE_ACCEPTANCE.ISSUBMITTED = false;
                    CSPdb.AUDITEE_ACCEPTANCE.Update(aUDITEE_ACCEPTANCE);
                }

                UpdateFindingReviewStatus(resultsList[0], capStatus);

                if (string.IsNullOrEmpty(capStatus))
                    capStatus = "CAP Approved";

                var checklistsendmail = new ChecklistSendMail();
                string findingtxt = string.Empty;

                var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
                int auditid = 0;

                if (findingrow != null)
                {
                    auditid = findingrow.AUDIT_ID;
                    findingtxt = findingrow.FINDING_DESCRIPTION;
                }


                var auditrow = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);

                List<int> auditeeNames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => x.AUDIT_ID == auditid && x.ISACTIVE).Select(x => x.AUDITEE_EMP_ID).ToList();
                var scorerow = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);
                if (scorerow != null)
                {
                    checklistsendmail.SCORE = scorerow.SCORE.ToString();
                    checklistsendmail.SCORE_PERCENTAGE = scorerow.PERCENTAGE_SCORE.ToString();
                }

                if (auditrow != null)
                {
                    checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                    checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                    checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                    checklistsendmail.RECIPIENT_LIST = auditeeNames;
                    checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                    checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                    checklistsendmail.URL = $"https://csm.gavstech.com/layout/checklistfindings/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}";
                    checklistsendmail.AUDITOR_EMP_ID = auditrow.AUDITOR_NAME.GetValueOrDefault();
                }

                checklistsendmail.STAGE = "CAP Review";
                checklistsendmail.STATUS = capStatus;
                checklistsendmail.ACTION = "Yes";
                checklistsendmail.CLASS = "hide";
                checklistsendmail.SUBJECT = $"CAP Review status for finding- {findingtxt}";
                if (capStatus == "CAP Approved")
                    checklistsendmail.NEXT_ACTION = "Implement Corrective Action and confirm the closure";
                else if (capStatus == "CAP Rejected")
                    checklistsendmail.NEXT_ACTION = "Resubmit CAP after review";

                checklistsendmail.ACTION_CLASS = "showAction";

                SendMailOnAuditChecklistStage(checklistsendmail);
            }
            return Ok();
        }
        private void UpdateIsActiveReview(AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED fcap)
        {
            AUDIT_FINDING_CAPA_REVIEW capa = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(t => t.FINDING_ID == fcap.FINDING_ID && t.UNIQUE_ID == fcap.UNIQUE_ID && t.ROOT_CAUSE_ID == fcap.ROOT_CAUSE_ID).FirstOrDefault();
            if (capa != null)
            {
                capa.ISACTIVE = false;
                CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(capa);
                CSPdb.Commit();
            }
        }

        public IHttpActionResult AddFindingCAPImplementationDetails([FromBody] List<AUDIT_FINDING_CAPA_IMPLEMENTATION> resultsList)
        {
            string empId = Request.Headers.GetValues("empId").ToList()[0];
            int empIds = Convert.ToInt32(empId);
            var CapStatus = string.Empty;

            if (resultsList == null || !resultsList.Any())
                return Ok();

            foreach (AUDIT_FINDING_CAPA_IMPLEMENTATION results in resultsList)
            {
                UpdateIsActiveImplementation(results);
                AUDIT_FINDING_CAPA_IMPLEMENTATION review = new AUDIT_FINDING_CAPA_IMPLEMENTATION();
                review.FINDING_ID = results.FINDING_ID;
                review.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                review.UNIQUE_ID = results.UNIQUE_ID;
                review.ISIMPLEMENTED = results.ISIMPLEMENTED;
                review.REMARKS = results.REMARKS;
                review.STATUS = results.STATUS;
                review.UPDATED_BY = empIds;
                review.UPDATED_DATE = DateTime.Now;
                review.ISACTIVE = true;
                CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Add(review);

                if (!review.ISIMPLEMENTED)
                    CapStatus = review.STATUS;
            }

            if (string.IsNullOrEmpty(CapStatus))
                CapStatus = "CAP Implemented";

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


            var auditrow = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);

            var scorerow = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);
            if (scorerow != null)
            {
                checklistsendmail.SCORE = scorerow.SCORE.ToString();
                checklistsendmail.SCORE_PERCENTAGE = scorerow.PERCENTAGE_SCORE.ToString();
            }

            if (auditrow != null)
            {
                checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                checklistsendmail.RECIPIENT_LIST = new List<int>() { auditrow.AUDITOR_NAME.GetValueOrDefault() };
                checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                checklistsendmail.URL = $"https://csm.gavstech.com/layout/checklistfindings/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}";
                checklistsendmail.AUDITOR_EMP_ID = auditrow.AUDITOR_NAME.GetValueOrDefault();
            }

            checklistsendmail.STAGE = "CAP Implementation";
            checklistsendmail.STATUS = CapStatus;
            checklistsendmail.ACTION = "Yes";
            checklistsendmail.CLASS = "hide";
            checklistsendmail.SUBJECT = $"CAP Implementation status for finding - {findingtxt}";
            if (CapStatus == "CAP Implemented")
            {
                checklistsendmail.NEXT_ACTION = "Verify the closure corrective action and accept or reject";
                checklistsendmail.ACTION_CLASS = "showAction";
            }
            else
            {
                checklistsendmail.ACTION_CLASS = "hideAction";
            }

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
                CSPdb.Commit();
            }
        }

        [POST("AddFindingCAPVerificationDetails")]
        [ActionName("AddFindingCAPVerificationDetails")]
        [HttpPost]
        public IHttpActionResult AddFindingCAPVerificationDetails([FromBody] List<AUDIT_FINDING_CAPA_VERIFICATION> resultsList)
        {
            string empId = Request.Headers.GetValues("empId").ToList()[0];
            int empIds = Convert.ToInt32(empId);
            string CapRecommendedAction = string.Empty;

            if (resultsList == null || !resultsList.Any())
                return Ok(resultsList);

            foreach (AUDIT_FINDING_CAPA_VERIFICATION results in resultsList)
            {
                UpdateIsActiveVerifcation(results);
                AUDIT_FINDING_CAPA_VERIFICATION review = new AUDIT_FINDING_CAPA_VERIFICATION();
                review.FINDING_ID = results.FINDING_ID;
                review.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                review.UNIQUE_ID = results.UNIQUE_ID;
                review.ISVERIFIED = results.ISVERIFIED;
                review.ISREJECTED = results.ISREJECTED;
                review.REMARKS = results.REMARKS;
                review.STATUS = results.STATUS;
                review.UPDATED_BY = empIds;
                review.RECOMMENDED_ACTION = results.RECOMMENDED_ACTION;
                review.UPDATED_DATE = DateTime.Now;
                review.ISACTIVE = true;
                CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.Add(review);
                CSPdb.Commit();


                if (review.ISREJECTED)
                {
                    if (review.RECOMMENDED_ACTION == "resubmitcap")
                        UpdateCAPSubmissionDetails(review);

                    else if (review.RECOMMENDED_ACTION == "reimplementcap")
                        UpdateCAPImplementationDetails(review);
                }

                else if (review.ISVERIFIED)
                {

                    AUDIT_FINDINGS_CAPA cap = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(t => t.FINDING_ID == review.FINDING_ID && t.ROOT_CAUSE_ID == review.ROOT_CAUSE_ID && t.UNIQUE_ID == review.UNIQUE_ID && t.ISACTIVE == true);
                    cap.STATUS = review.STATUS;
                    CSPdb.AUDIT_FINDINGS_CAPA.Update(cap);
                    CSPdb.Commit();
                }
            }

            foreach (var rec in resultsList)
            {
                if (!rec.ISREJECTED)
                    continue;

                if (rec.RECOMMENDED_ACTION == "resubmitcap")
                {
                    CapRecommendedAction = "resubmitcap";
                    break;
                }

                CapRecommendedAction = "reimplementcap";
            }

            if (string.IsNullOrEmpty(CapRecommendedAction))
                CapRecommendedAction = "CA Implementation Verified";

            UpdateFindingVerificationStatus(resultsList[0], CapRecommendedAction);
            var findingId = resultsList[0].FINDING_ID;
            var findingrow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            var isCloseFinfing = resultsList.All(x => x.ISVERIFIED);

            if (isCloseFinfing)
            {
                if (CheckIfNoOpenFinding(findingrow.AUDIT_ID, findingrow.APPLICABLE_QUESTIONS))
                {
                    UpdateStatusOfQuestion(resultsList[0].FINDING_ID);
                    CalculateNewScoreForchecklist(findingrow.AUDIT_ID, empId);

                    if (CheckIfNoOpenFinding(findingrow.AUDIT_ID))
                        UpdateAuditStatus(findingrow.AUDIT_ID, "COMPLETED");
                }

            }

            var checklistsendmail = new ChecklistSendMail();
            string findingtxt = string.Empty;
            int auditid = 0;

            if (findingrow != null)
            {
                auditid = findingrow.AUDIT_ID;
                findingtxt = findingrow.FINDING_DESCRIPTION;
            }

            var auditrow = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);

            List<int> auditeeNames = CSPdb.CHECKLIST_EXECUTION_AUDITEE_DETAILS.GetAll().Where(x => x.AUDIT_ID == auditid && x.ISACTIVE).Select(x => x.AUDITEE_EMP_ID).ToList();
            var scorerow = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditid && x.ISACTIVE);
            if (scorerow != null)
            {
                checklistsendmail.SCORE = scorerow.SCORE.ToString();
                checklistsendmail.SCORE_PERCENTAGE = scorerow.PERCENTAGE_SCORE.ToString();
            }

            if (auditrow != null)
            {
                checklistsendmail.AUDIT_TITLE = auditrow.AUDIT_TITLE;
                checklistsendmail.CUSTOMER_ID = auditrow.CUSTOMER_ID;
                checklistsendmail.PROJECT_ID = auditrow.PROJECT_ID;
                checklistsendmail.RECIPIENT_LIST = auditeeNames;
                checklistsendmail.COMPLETED_DATE = auditrow.ACTUAL_AUDIT_END_DATE.GetValueOrDefault();
                checklistsendmail.PLANNED_DATE = auditrow.PLANNED_AUDIT_START_DATE.GetValueOrDefault();
                checklistsendmail.URL = $"https://csm.gavstech.com/layout/checklistfindings/{auditrow.CUSTOMER_ID}/{auditrow.PROJECT_ID}";
                checklistsendmail.AUDITOR_EMP_ID = auditrow.AUDITOR_NAME.GetValueOrDefault();
            }

            checklistsendmail.STAGE = "CAP Verification";
            checklistsendmail.STATUS = CapRecommendedAction;
            checklistsendmail.ACTION = CapRecommendedAction == "CA Implementation Verified" ? "No" : "Yes";
            checklistsendmail.CLASS = "hide";
            checklistsendmail.SUBJECT = $"CAP Verification status for finding - {findingtxt}";
            checklistsendmail.ACTION_CLASS = "hideAction";

            SendMailOnAuditChecklistStage(checklistsendmail);
            return Ok();
        }

        private int UpdateStatusOfQuestion(int findingId)
        {
            var questionRow = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().FirstOrDefault(x => x.ID == findingId && x.ISACTIVE);
            if (questionRow == null)
                return 0;

            var auditrow = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().FirstOrDefault(x => x.APPLICABLE_QUESTIONS == questionRow.APPLICABLE_QUESTIONS
                    && x.SERVICE_AREA_ID == questionRow.SERVICE_AREA_ID && x.PROCESS_ID == questionRow.PROCESS_ID
                    && x.PROCESS_MODEL_ID == questionRow.PROCESS_MODEL_ID
                    && x.PROCESS_AREA_ID == questionRow.PROCESS_AREA_ID
                       && x.AUDIT_ID == questionRow.AUDIT_ID && x.ISACTIVE && x.ISSUBMITTED);

            auditrow.UPDATED_SCORE = auditrow.MAX_SCORE.HasValue ? auditrow.MAX_SCORE.Value : 0;
            auditrow.CURRENT_STATUS = "MET";
            CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.Update(auditrow);
            CSPdb.Commit();
            return auditrow.AUDIT_ID;
        }

        private decimal GetMaxScoreOfQuestion(int QuestionId)
        {
            var weightageRow = CSPdb.PM_CHECKLIST_QUESTIONS.GetAll().FirstOrDefault(x => x.ID == QuestionId && x.ISACTIVE);
            if (weightageRow == null)
                return 0;
            var checklistrow = CSPdb.PM_CHECKLIST.GetAll().FirstOrDefault(x => x.ID == weightageRow.CHECKLIST_ID && x.ISACTIVE);
            decimal maxMultiplier = 0;

            if (checklistrow != null && checklistrow.IS_WEIGHTAGE_APPLICABLE)
            {
                var weightageScore = CSPdb.AUDIT_CHECKLIST_WEIGHTAGE.GetAll().FirstOrDefault(x => x.ID == weightageRow.WEIGHTAGE_ID && x.ISACTIVE)?.WEIGHTAGE_SCORE;
                maxMultiplier = CSPdb.AUDIT_CHECKLIST_STATUS_LIST_VALUES.GetAll().Where(x => x.STATUS_LIST_ID == checklistrow.STATUS_LIST_ID && x.ISACTIVE)
                                    .Select(x => x.MULTIPLIER).Max();

                return (maxMultiplier) * (weightageScore.HasValue ? weightageScore.Value : 1);
            }
            else
                return maxMultiplier;
        }


        private void CalculateNewScoreForchecklist(int auditId, string empid = "103245")
        {
            decimal acheivedscore = 0;
            decimal maxscore = 0;
            decimal percentagescore = 0;
            var auditrows = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().Where(x => x.AUDIT_ID == auditId && x.ISACTIVE && x.ISSUBMITTED).ToList();
            foreach (var row in auditrows)
            {
                if (row.CURRENT_STATUS == "N/A")
                    continue;

                acheivedscore += row.UPDATED_SCORE;
                maxscore += row.MAX_SCORE.HasValue ? row.MAX_SCORE.Value : 0;
            }

            if (maxscore > 0)
                percentagescore = Math.Round(((acheivedscore / maxscore) * 100), 2);
            else if (maxscore == 0)
                percentagescore = 100;

            var checklistscore = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.AUDIT_ID == auditId && x.ISACTIVE);
            if (checklistscore != null)
            {
                checklistscore.PERCENTAGE_SCORE = percentagescore;
                checklistscore.UPDATED_BY = empid;
                checklistscore.UPDATED_DATE = DateTime.Now;
            }

            CSPdb.CHECKLIST_SCORES_BY_AUDIT.Update(checklistscore);
            CSPdb.Commit();
        }

        private bool IsAuditCompleted(int auditid)
        {

            var findings = CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll().Where(x => x.AUDIT_ID == auditid).ToList();

            foreach (var finding in findings)
            {
                var findingTypeRec = CSPdb.FINDINGSTYPE_VALUES.GetAll().FirstOrDefault(x => x.FINDINGTYPE_VALUE == finding.FINDING_TYPE);

                if (findingTypeRec != null && findingTypeRec.FINDINGTYPE_CATEGORY == "MANDATORY")
                {
                    var findingstages = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(x => x.FINDING_ID == finding.ID && x.ISACTIVE);
                    if (findingstages.Any(x => x.ISACTIVE && !x.ISCOMPLETE))
                        return false;
                }
            }

            if (findings.Count > 0)
                return true;
            else
                return false;
        }

        private List<int> GetToEmpNames(int AssessmentId)
        {
            List<int> mat = CSPdb.CHECKLIST_EXECUTION_CC_DETAILS.GetAll().Where(t => t.ASSESSMENT_ID == AssessmentId && t.TO_EMP_ID.HasValue)
                .Select(t => t.TO_EMP_ID.Value).ToList();
            List<int> output = new List<int>();
            output.AddRange(Cldb.EMP_INFO.GetAll().Where(x => mat.Contains(x.EMP_ID)).Select(x => x.EMP_ID));
            return output;
        }
        private List<int> GetCCEmpNames(int AssessmentId)
        {
            List<int> mat = CSPdb.CHECKLIST_EXECUTION_CC_DETAILS.GetAll().Where(t => t.ASSESSMENT_ID == AssessmentId && t.CC_EMP_ID.HasValue)
                .Select(t => t.CC_EMP_ID.Value).ToList();
            List<int> output = new List<int>();
            output.AddRange(Cldb.EMP_INFO.GetAll().Where(x => mat.Contains(x.EMP_ID)).Select(x => x.EMP_ID));
            return output;
        }

        [GET("GetCCListForChecklist")]
        [ActionName("GetCCListForChecklist")]
        [HttpGet]
        public IHttpActionResult GetCCListForChecklist(int custId)
        {
            return Ok(Cldb.AppRepo.GetEmpIdsForAccount(custId));
        }   


        //[GET("GetCCListForChecklist")]
        //[ActionName("GetCCListForChecklist")]
        //[HttpGet]
        //public IHttpActionResult GetCCListForChecklist(string projid)
        //{
        //    List<EMP_INFO> output = new List<EMP_INFO>();
        //    List<EMP_INFO> pmlist = helper.GetPMEmpInfoFromProject(projid);
        //    List<EMP_INFO> csmlist = helper.GetCSMFromProject(projid);
        //    EMP_INFO qualitySpoc = helper.GetQualitySpocForProject(projid);
        //    List<EMP_INFO> buhead = helper.GetBUHEADFromProject(projid);

        //    foreach (var emp in pmlist)
        //        output.Add(emp);

        //    foreach (var emp in csmlist)
        //        output.Add(emp);

        //    foreach (var emp in buhead)
        //        output.Add(emp);

        //    output.Add(qualitySpoc);

        //    return Ok(output);
        //}


        [GET("VerifyChecklistInAudit")]
        [ActionName("VerifyChecklistInAudit")]
        [HttpGet]
        public IHttpActionResult VerifyChecklistInAudit(int checklistId)
        {
            var checklistscore = CSPdb.CHECKLIST_SCORES_BY_AUDIT.GetAll().FirstOrDefault(x => x.CHECKLIST_ID == checklistId);
            return Ok(checklistscore);
        }


      


    }
}