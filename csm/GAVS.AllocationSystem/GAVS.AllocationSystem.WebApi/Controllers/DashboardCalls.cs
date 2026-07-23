using AttributeRouting.Helpers;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;


namespace GAVS.AllocationSystem.WebApi.Controllers
{
    //[BearerTokenAuthorization]
    //[ExceptionFilter]
    public partial class AllSysController
    {

        [GET("RefreshDashboardDetailsAuto"), ActionName("RefreshDashboardDetailsAuto"), HttpGet]
        public IHttpActionResult RefreshDashboardDetailsAuto()
        {
            var stopwatch = Stopwatch.StartNew();
            var lastUpdated = helper.GetDBConfig("DashboardUpdateTime", "-1");
            DateTime lastUpdatedTimestamp = DateTime.Now;
            if (DateTime.TryParse(lastUpdated, out lastUpdatedTimestamp))
            {
                if (DateTime.Now.Subtract(lastUpdatedTimestamp) > new TimeSpan(24, 0, 0))
                {
                    LoadDashboardDetails();
                    helper.UpdateDBConfig("DashboardUpdateTime", "-1", DateTime.Now.ToString());
                }
            }
            FillResponseTime(stopwatch);
            return Ok();
        }

        [GET("RefreshDashboardDetails"), ActionName("RefreshDashboardDetails"), HttpGet]
        public IHttpActionResult RefreshDashboardDetails()
        {
            LoadDashboardDetails();
            return Ok();
        }

        [GET("GetAssessmentDetails")]
        [ActionName("GetAssessmentDetails")]
        [HttpGet]
        public IHttpActionResult GetAssessmentDetails(string customerId, int month, int year)
        {
            DateTime startDate = new DateTime(year, month + 1, 1);
            DateTime endDate = startDate.AddMonths(1).AddDays(-1);
            var inProgress = 0;
            var cancelled = 0;
            var planned = 0;
            var completed = 0;
            var statusList = new string[] { "IN PROGRESS", "PLANNED", "COMPLETED", "CANCELLED" };
            var tasks = CSPdb.TASK.GetAll().Where(x => x.ISACTIVE && statusList.Contains(x.STATUS) && x.CUST_ID == customerId && x.DUE_DATE >= startDate && x.DUE_DATE <= endDate).ToList();
            planned = tasks.Count(x => x.STATUS == "PLANNED");
            inProgress = tasks.Count(x => x.STATUS == "IN PROGRESS");
            completed = tasks.Count(x => x.STATUS == "COMPLETED");
            cancelled = tasks.Count(x => x.STATUS == "CANCELLED");

            var taskCount = new
            {
                AUDIT_PLANNED = planned,
                AUDIT_IN_PROGRESS = inProgress,
                AUDIT_COMPLETED = completed,
                AUDIT_CANCELLED = cancelled
            };
            return Ok(taskCount);
        }

        [GET("GetTasksEventsSummary")]
        [ActionName("GetTasksEventsSummary")]
        [HttpGet]
        public IHttpActionResult GetTasksEventsSummary(string customerId, string empId)
        {
            var results = CSPdb.AppRepo.GetTasksEventsSummary(customerId, empId);
            return Ok(results);
        }

        [GET("GetTasksEventsDetails")]
        [ActionName("GetTasksEventsDetails")]
        [HttpGet]
        public IHttpActionResult GetTasksEventsDetails(string customerId, string empId, string projectId, int eventTypeId, string period)
        {
            var results = CSPdb.AppRepo.GetTasksEventsDetails(customerId, empId, projectId, eventTypeId, period);
            return Ok(results);
        }

        [GET("GetAssessmentFindingsByTime")]
        [ActionName("GetAssessmentFindingsByTime")]
        [HttpGet]
        public IHttpActionResult GetAssessmentFindingsByTime(string custId, string projIds)
        {
            var projectList = JsonConvert.DeserializeObject<string[]>(projIds);
            var projectIds = string.Join(",", projectList);
            var results = CSPdb.AppRepo.GetAllFindingByTimeCustomerWise(custId, projectIds);
            var chartData = new FindingsByTypeChartData();
            if (results.Count == 0)
            {
                return Ok(chartData);
            }

            var availableFindingTypes = results.Select(x => x.FINDING_TYPE).Distinct().ToList();
            var days = new string[] { "< 7 days", "> 7 days", "> 14 days", "> 21 days", "> 30 days" };
            var columnNames = GetFindingsType(availableFindingTypes);
            columnNames.Insert(0, "AgeofDays");

            foreach (var day in days)
            {
                var valuesList = new List<object>();
                valuesList.Add(day);
                foreach (var col in columnNames)
                {
                    if (col == "AgeofDays")
                        continue;
                    var findingCount = results.Count(x => x.FINDING_TYPE == col && x.AGEBYDAYS == day);
                    valuesList.Add(findingCount);
                }
                chartData.VALUES.Add(valuesList);
            }
            chartData.COLUMNNAMES = columnNames;
            return Ok(chartData);
        }


        private List<string> GetFindingsType(List<string> availableFindingTypes)
        {
            var findingsType = CSPdb.FINDINGSTYPE_VALUES.GetAll().Where(x => x.ISACTIVE).ToList();
            var findingIdList = findingsType.Where(x => availableFindingTypes.Contains(x.FINDINGTYPE_VALUE)).Select(x => x.FINDINGSTYPE_ID).Distinct().ToList();
            var columnNames = findingsType.Where(x => findingIdList.Contains(x.FINDINGSTYPE_ID)).Select(x => x.FINDINGTYPE_VALUE).ToList();
            return columnNames;
        }

        private void LoadDashboardDetails()
        {
            LoadCustomerSuccesSurveyForCustomer();
            // LoadCrispRAGSummary();
            LoadCrispCategoryRAGSummary();
            LoadRiskAndIssuesSummary();
            LoadOverAllRisksData();
            LoadOverAllIssuesData();
            LoadSuccessGoalPerformanceSummary();
            LoadIdeasAndInnovationsSummary();
            LoadStaffingSummaryDetails();
            LoadActionItemsDetails();
            LoadProjectStatusSummary();
            LoadProcessComplianceForProjects();
            LoadAuditsByStatus();
            LoadAuditFindingsByType();
            //LoadAuditFindingsByTime();
            LoadAuditFindingsByStage();
            //LoadOverAllComplianceScore();
            //LoadComplianceScoreByStandards();
            //LoadComplianceScoreByStandardsMonthWise();
        }

        private void LoadProcessComplianceForProjects()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            // For portfolio
            List<CustomerProjectData> details = CSPdb.AppRepo.GetCustomerProjectDetails().ToList();

            if (details != null)
            {
                var groupByPortfolio = details.GroupBy(x => x.PORTFOLIO_ID);

                foreach (var portfolio in groupByPortfolio)
                {
                    if (portfolio.Key != null)
                    {
                        List<string> PROJ_IDs = portfolio.Select(x => x.PROJ_ID).ToList();
                        string Cust_id = portfolio.Select(x => x.CUST_ID).ToList()[0];

                        var Response = GetProcessComplaincePercentage(PROJ_IDs);
                        var contentResult = Response as OkNegotiatedContentResult<COMPLIANCE_COUNT>;
                        string compliancePercent = contentResult.Content.COMPLIANCE_PERCENT;
#pragma warning disable CS1717 // Assignment made to same variable; did you mean to assign something else?
                        compliancePercent = compliancePercent;// + "%";
#pragma warning restore CS1717 // Assignment made to same variable; did you mean to assign something else?
                        if (compliancePercent != string.Empty)
                        {
                            try
                            {
                                decimal d = Convert.ToDecimal(compliancePercent);
                                compliancePercent = d.ToString("0") + "%";
                            }
                            catch { }
                        }


                        newDashboardDetails.Add(GetNewDashboardDetails(Cust_id, null, portfolio.Key, "PROCESS_COMPLIANCE", compliancePercent));
                    }
                }
            }
            DeleteDashboardDetails("PROCESS_COMPLIANCE");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadAuditsByStatus()
        {
            var date = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 01);
            DateRange range = new DateRange(date, enDateRange.Monthly);
            DateTime stDate = range.StartDate;
            DateTime enDate = range.EndDate;
            var groupByCustomer = new List<AuditsByCustomer>();
            var groupByProject = new List<AuditsByCustomer>();
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<string> categoryIds = new List<string>();
            categoryIds = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "AUDIT_CATEGORY").Select(x => x.OPTIONS).ToList();
            List<int> categoryIdsint = categoryIds.Select(int.Parse).ToList();
            var tasks = CSPdb.TASK.GetAll().Where(x => x.ISACTIVE && (x.SCHEDULED_START_DATE >= stDate && x.SCHEDULED_START_DATE <= enDate) &&
                        (x.IS_DRAFT == false || x.IS_DRAFT == null) && categoryIdsint.Contains(x.TASK_CATEGORY_ID)).ToList();
            
            // Group by Customer
            foreach (var task in tasks)
            {
                if (!groupByCustomer.Any(x => x.CUST_ID == task.CUST_ID))
                    groupByCustomer.Add(new AuditsByCustomer(task.CUST_ID, task.PROJ_ID));

                var custrec = groupByCustomer.Find(x => x.CUST_ID == task.CUST_ID);

                if (!custrec.AUDIT_STATUSES.Any(x => x.STATUS == task.STATUS))
                    custrec.AUDIT_STATUSES.Add(new AuditByStatus(task.STATUS));

                var statusrec = custrec.AUDIT_STATUSES.Find(x => x.STATUS == task.STATUS);

                statusrec.AUDITS.Add(task);
            }

            // Group by Project

            foreach (var task in tasks)
            {
                if (!groupByProject.Any(x => x.PROJ_ID == task.PROJ_ID))
                    groupByProject.Add(new AuditsByCustomer(task.CUST_ID, task.PROJ_ID));

                var projrec = groupByProject.Find(x => x.PROJ_ID == task.PROJ_ID);

                if (!projrec.AUDIT_STATUSES.Any(x => x.STATUS == task.STATUS))
                    projrec.AUDIT_STATUSES.Add(new AuditByStatus(task.STATUS));

                var statusrec = projrec.AUDIT_STATUSES.Find(x => x.STATUS == task.STATUS);

                statusrec.AUDITS.Add(task);
            }

            foreach (var row in groupByCustomer)
            {
                foreach (var status in row.AUDIT_STATUSES)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(row.CUST_ID, null, null, $"AUDIT_{status.STATUS.ToUpper()}", status.AUDITS.Count.ToString()));
                }
            }

            //DeleteDashboardDetails("AUDIT_");
            //InsertDashboardDetails(newDashboardDetails);

            foreach (var row in groupByProject)
            {
                foreach (var status in row.AUDIT_STATUSES)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(row.CUST_ID, row.PROJ_ID, null, $"AUDIT_{status.STATUS.ToUpper()}", status.AUDITS.Count.ToString()));
                }
            }

            DeleteDashboardDetails("AUDIT_");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadAuditFindingsByType()
        {
            var date = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 01);
            DateRange range = new DateRange(date, enDateRange.Monthly);
            DateTime stDate = range.StartDate;
            DateTime enDate = range.EndDate;

            //var findings = (from x in CSPdb.AUDIT_CHECKLIST_PROJECT_FINDINGS.GetAll()
            //                join y in CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll()
            //                on x.AUDIT_ID equals y.AUDIT_ID
            //                where x.ISACTIVE == true && y.ISACTIVE == true && (x.CREATED_DATE >= stDate && x.CREATED_DATE <= enDate)
            //                select new { x.FINDING_TYPE, x.FINDING_DESCRIPTION, x.APPLICABLE_QUESTIONS, x.PROCESS_ID, x.SERVICE_AREA_ID, y.CUSTOMER_ID, y.PROJECT_ID, x.CREATED_DATE});

            List<Findings> findings = CSPdb.AppRepo.GetAllFindingsByType().ToList();

            findings = findings.Where(x => !string.IsNullOrEmpty(x.FINDING_TYPE)).ToList();
            var groupByCustomer = new List<AuditFindingsByCustomer>();
            var groupByProject = new List<AuditFindingsByCustomer>();
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();

            // Group by Customer

            foreach (var find in findings)
            {
                if (!groupByCustomer.Any(x => x.CUST_ID == find.CUSTOMER_ID))
                    groupByCustomer.Add(new AuditFindingsByCustomer(find.CUSTOMER_ID, find.PROJECT_ID));

                var custrec = groupByCustomer.Find(x => x.CUST_ID == find.CUSTOMER_ID);

                if (!custrec.FINDINGS_BY_TYPE.Any(x => x.FINDING_TYPE == find.FINDING_TYPE))
                    custrec.FINDINGS_BY_TYPE.Add(new FindingsByType(find.FINDING_TYPE));

                var findingrec = custrec.FINDINGS_BY_TYPE.Find(x => x.FINDING_TYPE == find.FINDING_TYPE);

                findingrec.FINDINGS.Add(find);
            }

            var findingTypes = new List<string> { "FINDING_STRENGTH", "FINDING_WEAKNESS", "FINDING_OPPORTUNITY", "FINDING_THREAT" };
            foreach (var rec in groupByCustomer)
            {
                foreach (var finding in findingTypes)//rec.FINDINGS_BY_TYPE)
                {
                    var count = rec.FINDINGS_BY_TYPE.Count(x => finding.EndsWith(x.FINDING_TYPE.ToUpper()));
                    //newDashboardDetails.Add(GetNewDashboardDetails(rec.CUST_ID, null, null, $"FINDING_{finding.FINDING_TYPE.ToUpper()}", finding.FINDINGS.Count.ToString()));
                    newDashboardDetails.Add(GetNewDashboardDetails(rec.CUST_ID, null, null, finding, count.ToString()));
                }
            }

            // Group By Project

            foreach (var find in findings)
            {
                if (!groupByProject.Any(x => x.PROJ_ID == find.PROJECT_ID))
                    groupByProject.Add(new AuditFindingsByCustomer(find.CUSTOMER_ID, find.PROJECT_ID));

                var projrec = groupByProject.Find(x => x.PROJ_ID == find.PROJECT_ID);

                if (!projrec.FINDINGS_BY_TYPE.Any(x => x.FINDING_TYPE == find.FINDING_TYPE))
                    projrec.FINDINGS_BY_TYPE.Add(new FindingsByType(find.FINDING_TYPE));

                var findingrec = projrec.FINDINGS_BY_TYPE.Find(x => x.FINDING_TYPE == find.FINDING_TYPE);

                findingrec.FINDINGS.Add(find);
            }

            foreach (var rec in groupByProject)
            {
                foreach (var finding in rec.FINDINGS_BY_TYPE)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(rec.CUST_ID, rec.PROJ_ID, null, $"FINDING_{finding.FINDING_TYPE.ToUpper()}", finding.FINDINGS.Count.ToString()));
                }
            }

            DeleteDashboardDetails("FINDING_");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadAuditFindingsByTime()
        {
            var groupByCustomer = new List<AuditFindingsByCustomer>();
            var groupByProject = new List<AuditFindingsByCustomer>();
            List<Findings> findings = CSPdb.AppRepo.GetAllFindingsByTime().ToList();
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();

            foreach (var find in findings)
            {
                if (!groupByCustomer.Any(x => x.CUST_ID == find.CUSTOMER_ID))
                    groupByCustomer.Add(new AuditFindingsByCustomer(find.CUSTOMER_ID, find.PROJECT_ID));

                var custrec = groupByCustomer.Find(x => x.CUST_ID == find.CUSTOMER_ID);

                if (!custrec.FINDINGS_BY_TYPE.Any(x => x.FINDING_TYPE == find.WEEKSTATUS))
                    custrec.FINDINGS_BY_TYPE.Add(new FindingsByType(find.WEEKSTATUS));

                var findingrec = custrec.FINDINGS_BY_TYPE.Find(x => x.FINDING_TYPE == find.WEEKSTATUS);

                findingrec.FINDINGS.Add(find);
            }

            foreach (var find in findings)
            {
                if (!groupByProject.Any(x => x.PROJ_ID == find.PROJECT_ID))
                    groupByProject.Add(new AuditFindingsByCustomer(find.CUSTOMER_ID, find.PROJECT_ID));

                var projrec = groupByProject.Find(x => x.PROJ_ID == find.PROJECT_ID);

                if (!projrec.FINDINGS_BY_TYPE.Any(x => x.FINDING_TYPE == find.WEEKSTATUS))
                    projrec.FINDINGS_BY_TYPE.Add(new FindingsByType(find.WEEKSTATUS));

                var findingrec = projrec.FINDINGS_BY_TYPE.Find(x => x.FINDING_TYPE == find.WEEKSTATUS);

                findingrec.FINDINGS.Add(find);
            }

            foreach (var row in groupByCustomer)
            {
                foreach (var finding in row.FINDINGS_BY_TYPE)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(row.CUST_ID, null, null, $"TIME_FINDING_{finding.FINDING_TYPE.ToUpper()}", finding.FINDINGS.Count.ToString()));
                }
            }

            foreach (var row in groupByProject)
            {
                foreach (var finding in row.FINDINGS_BY_TYPE)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(row.CUST_ID, row.PROJ_ID, null, $"TIME_FINDING_{finding.FINDING_TYPE.ToUpper()}", finding.FINDINGS.Count.ToString()));
                }
            }

            DeleteDashboardDetails("TIME_FINDING");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadAuditFindingsByStage()
        {
            var groupByCustomer = new List<AuditFindingsByCustomer>();
            var groupByProject = new List<AuditFindingsByCustomer>();
            List<Findings> findings = CSPdb.AppRepo.GetAllFindingsByTime().ToList();
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();

            foreach (var find in findings)
            {
                if (!groupByCustomer.Any(x => x.CUST_ID == find.CUSTOMER_ID))
                    groupByCustomer.Add(new AuditFindingsByCustomer(find.CUSTOMER_ID, find.PROJECT_ID));

                var custrec = groupByCustomer.Find(x => x.CUST_ID == find.CUSTOMER_ID);

                if (!custrec.FINDINGS_BY_TYPE.Any(x => x.FINDING_TYPE == find.STAGE_DESCRIPTION))
                    custrec.FINDINGS_BY_TYPE.Add(new FindingsByType(find.STAGE_DESCRIPTION));

                var findingrec = custrec.FINDINGS_BY_TYPE.Find(x => x.FINDING_TYPE == find.STAGE_DESCRIPTION);

                findingrec.FINDINGS.Add(find);
            }

            foreach (var find in findings)
            {
                if (!groupByProject.Any(x => x.PROJ_ID == find.PROJECT_ID))
                    groupByProject.Add(new AuditFindingsByCustomer(find.CUSTOMER_ID, find.PROJECT_ID));

                var projrec = groupByProject.Find(x => x.PROJ_ID == find.PROJECT_ID);

                if (!projrec.FINDINGS_BY_TYPE.Any(x => x.FINDING_TYPE == find.STAGE_DESCRIPTION))
                    projrec.FINDINGS_BY_TYPE.Add(new FindingsByType(find.STAGE_DESCRIPTION));

                var findingrec = projrec.FINDINGS_BY_TYPE.Find(x => x.FINDING_TYPE == find.STAGE_DESCRIPTION);

                findingrec.FINDINGS.Add(find);
            }

            foreach (var row in groupByCustomer)
            {
                foreach (var finding in row.FINDINGS_BY_TYPE)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(row.CUST_ID, null, null, $"STAGE_FINDING_{finding.FINDING_TYPE.ToUpper()}", finding.FINDINGS.Count.ToString()));
                }
            }

            foreach (var row in groupByProject)
            {
                foreach (var finding in row.FINDINGS_BY_TYPE)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(row.CUST_ID, row.PROJ_ID, null, $"STAGE_FINDING_{finding.FINDING_TYPE.ToUpper()}", finding.FINDINGS.Count.ToString()));
                }
            }

            DeleteDashboardDetails("STAGE_FINDING");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadOverAllComplianceScore()
        {
            var date = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 01);
            DateRange range = new DateRange(date, enDateRange.Monthly);
            DateTime stDate = range.StartDate;
            DateTime enDate = range.EndDate;
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();

            var checkpoints = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().Where(x => x.ISACTIVE && x.ISSUBMITTED
                    && x.CREATED_DATE >= stDate && x.CREATED_DATE <= enDate).ToList();

            var groupByCustomer = checkpoints.GroupBy(x => x.CUSTOMER_ID);
            decimal metCount = 0;
            decimal notMetCount = 0;
            decimal score = 0;
            string statuscat = string.Empty;

            foreach (var customer in groupByCustomer)
            {
                foreach (var row in customer.ToList())
                {
                    statuscat = GetStatusCategory(row.STATUS);
                    if (statuscat == "MET")
                        metCount++;
                    else if (statuscat == "NMET")
                        notMetCount++;
                }

                if ((metCount + notMetCount) > 0)
                {
                    score = Math.Round(metCount / (metCount + notMetCount) * 100);
                }

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "OVERALL_COMPLIANCE_SCORE", score.ToString()));
            }

            DeleteDashboardDetails("OVERALL_COMPLIANCE_SCORE");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadComplianceScoreByStandards()
        {
            var auditRows = CSPdb.AppRepo.GetAllAuditRows().ToList();
            //var auditRows = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().Where(X => X.ISACTIVE && X.ISSUBMITTED).ToList();
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            var complianceByCustomers = new List<AuditComplianceScoreByCustomer>();
            string statuscategory = string.Empty;
            foreach (var row in auditRows)
            {
                if (!complianceByCustomers.Any(x => x.CUST_ID == row.CUSTOMER_ID))
                    complianceByCustomers.Add(new AuditComplianceScoreByCustomer(row.CUSTOMER_ID, row.PROJECT_ID));

                var custrec = complianceByCustomers.Find(x => x.CUST_ID == row.CUSTOMER_ID);

                if (!custrec.ComplianceScores.Any(x => x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID))
                    custrec.ComplianceScores.Add(new ComplianceByProcessModel(row.PROCESS_MODEL_ID, row.PROCESS_MODEL_DESCRIPTION));

                var modelrec = custrec.ComplianceScores.Find(x => x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID);

                if (row.STATUS_CATEGORY == "MET")
                    modelrec.MET_COUNT++;
                else if (row.STATUS_CATEGORY == "NMET")
                    modelrec.NOT_MET_COUNT++;

                if (modelrec.MET_COUNT + modelrec.NOT_MET_COUNT != 0)
                    modelrec.SCORE = Math.Round(modelrec.MET_COUNT / (modelrec.MET_COUNT + modelrec.NOT_MET_COUNT) * 100);
                else
                    modelrec.SCORE = 0;
            }

            foreach (var cust in complianceByCustomers)
            {
                foreach (var model in cust.ComplianceScores)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(cust.CUST_ID, null, null, $"COMPLIANCE_SCORE_{model.PROCESS_MODEL_DESCRIPTION}", model.SCORE.ToString()));
                }
            }

            DeleteDashboardDetails("COMPLIANCE_SCORE_");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadComplianceScoreByStandardsMonthWise()
        {
            var auditRows = CSPdb.AppRepo.GetAllAuditRows().ToList();
            //var auditRows = CSPdb.AUDIT_CHECKLIST_PROJECT_EXECUTION.GetAll().Where(X => X.ISACTIVE && X.ISSUBMITTED).ToList();
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            var complianceByCustomers = new List<AuditComplianceScoreByCustomer>();
            string statuscategory = string.Empty;
            string monthliteral = string.Empty;
            foreach (var row in auditRows)
            {
                if (!complianceByCustomers.Any(x => x.CUST_ID == row.CUSTOMER_ID))
                    complianceByCustomers.Add(new AuditComplianceScoreByCustomer(row.CUSTOMER_ID, row.PROJECT_ID));

                var custrec = complianceByCustomers.Find(x => x.CUST_ID == row.CUSTOMER_ID);

                if (!custrec.ComplianceScores.Any(x => x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID))
                    custrec.ComplianceScores.Add(new ComplianceByProcessModel(row.PROCESS_MODEL_ID, row.PROCESS_MODEL_DESCRIPTION));

                var modelrec = custrec.ComplianceScores.Find(x => x.PROCESS_MODEL_ID == row.PROCESS_MODEL_ID);

                monthliteral = $"{row.MONTH_NM}-{row.YEAR}";

                if (!modelrec.SCORES_BY_MONTH.Any(x => x.Month == monthliteral))
                    modelrec.SCORES_BY_MONTH.Add(new ComplianceScoreByMonth(monthliteral));

                var monthrec = modelrec.SCORES_BY_MONTH.Find(x => x.Month == monthliteral);

                if (row.STATUS_CATEGORY == "MET")
                    monthrec.MET_COUNT++;
                else if (row.STATUS_CATEGORY == "NMET")
                    monthrec.NOT_MET_COUNT++;

                if (monthrec.MET_COUNT + monthrec.NOT_MET_COUNT != 0)
                    monthrec.SCORE = Math.Round(monthrec.MET_COUNT / (monthrec.MET_COUNT + monthrec.NOT_MET_COUNT) * 100);
                else
                    monthrec.SCORE = 0;
            }

            foreach (var cust in complianceByCustomers)
            {
                foreach (var model in cust.ComplianceScores)
                {
                    foreach (var month in model.SCORES_BY_MONTH)
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(cust.CUST_ID, null, null, $"MONTH_{model.PROCESS_MODEL_DESCRIPTION}_{month.Month}", month.SCORE.ToString()));
                    }
                }
            }

            DeleteDashboardDetails("MONTH_");
            InsertDashboardDetails(newDashboardDetails);
        }


        public class AuditComplianceScoreByCustomer
        {
            public AuditComplianceScoreByCustomer(string custid, string projid)
            {
                this.CUST_ID = custid;
                this.PROJ_ID = projid;
                this.ComplianceScores = new List<ComplianceByProcessModel>();
            }
            public string CUST_ID { get; set; }

            public string PROJ_ID { get; set; }

            public List<ComplianceByProcessModel> ComplianceScores { get; set; }
        }

        public class ComplianceByProcessModel
        {
            public ComplianceByProcessModel(int id, string desc)
            {
                this.PROCESS_MODEL_ID = id;
                this.PROCESS_MODEL_DESCRIPTION = desc;
                this.SCORES_BY_MONTH = new List<ComplianceScoreByMonth>();
            }
            public int PROCESS_MODEL_ID { get; set; }

            public string PROCESS_MODEL_DESCRIPTION { get; set; }

            public decimal MET_COUNT { get; set; }
            public decimal NOT_MET_COUNT { get; set; }

            public decimal SCORE { get; set; }

            public List<ComplianceScoreByMonth> SCORES_BY_MONTH { get; set; }
        }

        public class ComplianceScoreByMonth
        {
            public ComplianceScoreByMonth(string month)
            {
                this.Month = month;
            }
            public string Month { get; set; }

            public decimal SCORE { get; set; }
            public decimal MET_COUNT { get; set; }
            public decimal NOT_MET_COUNT { get; set; }
        }
        private string GetStatusCategory(string status)
        {
            var statuscat = CSPdb.AUDIT_CHECKLIST_STATUS_LIST_VALUES.GetAll().FirstOrDefault(x => x.STATUS_LIST_VALUE == status)?.STATUS_CATEGORY;

            return statuscat;
        }


        public class AuditFindingsByCustomer
        {
            public AuditFindingsByCustomer(string custid, string projid)
            {
                this.CUST_ID = custid;
                this.PROJ_ID = projid;
                this.FINDINGS_BY_TYPE = new List<FindingsByType>();
            }
            public string CUST_ID { get; set; }

            public string PROJ_ID { get; set; }

            public List<FindingsByType> FINDINGS_BY_TYPE { get; set; }

        }

        public class FindingsByType
        {
            public FindingsByType(string type)
            {
                this.FINDING_TYPE = type;
                this.FINDINGS = new List<dynamic>();
            }
            public string FINDING_TYPE { get; set; }
            public List<dynamic> FINDINGS { get; set; }
        }

        private void LoadProjectStatusSummary()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<ProjectStatusDetails> projectdetails = CSPdb.AppRepo.GetProjectStartAndEndDate().ToList();

            //---------------------- Group By Customer -------------------------------//

            var groupByCustomer = projectdetails.GroupBy(x => x.CUST_ID);

            foreach (var customer in groupByCustomer)
            {
                int startDueDateCount = customer.Where(x => x.PROJECT_STATUS == "PROJECT_TO_START").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "PROJECT_TO_START", startDueDateCount.ToString()));

                int EndDueDateCount = customer.Where(x => x.PROJECT_STATUS == "PROJECT_TO_END").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "PROJECT_TO_END", EndDueDateCount.ToString()));
            }

            //---------------------- Group By Portfolio -------------------------------//

            var groupByPortfolio = projectdetails.GroupBy(x => x.PORTFOLIO_ID);

            foreach (var portfolio in groupByPortfolio)
            {
                int startDueDateCount = portfolio.Where(x => x.PROJECT_STATUS == "PROJECT_TO_START").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "PROJECT_TO_START", startDueDateCount.ToString()));

                int EndDueDateCount = portfolio.Where(x => x.PROJECT_STATUS == "PROJECT_TO_END").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "PROJECT_TO_END", EndDueDateCount.ToString()));
            }

            //---------------------- Group By project -------------------------------//


            foreach (var proj in projectdetails)
            {
                if (proj.PROJECT_STATUS == "PROJECT_TO_START")
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.CUST_ID, proj.PROJ_ID, null, "PROJECT_TO_START", "1"));
                }
                else if (proj.PROJECT_STATUS == "PROJECT_TO_END")
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.CUST_ID, proj.PROJ_ID, null, "PROJECT_TO_END", "1"));
                }
            }

            DeleteDashboardDetails("PROJECT_TO_START");
            DeleteDashboardDetails("PROJECT_TO_END");
            InsertDashboardDetails(newDashboardDetails);
        }


        private void LoadActionItemsDetails()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<ActionItemsViewDetails> actionitems = CSPdb.AppRepo.GetActionItemsStatus().ToList();

            //---------------------- Group By Customer -------------------------------//

            var groupByCustomer = actionitems.GroupBy(x => x.CUST_ID);

            foreach (var customer in groupByCustomer)
            {
                var filteredList = customer.Where(x => x.STATUS_TYPE == "PAST_DUE_DATE" || x.STATUS_TYPE == "DUE_FOR_CLOSURE").ToList();

                int pastduedatecount = customer.Where(x => x.STATUS_TYPE == "PAST_DUE_DATE").ToList().Count();

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "PAST_DUE_DATE", pastduedatecount.ToString()));

                int dueforclosurecount = customer.Where(x => x.STATUS_TYPE == "DUE_FOR_CLOSURE").ToList().Count();

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "DUE_FOR_CLOSURE", dueforclosurecount.ToString()));

                int highCount = filteredList.Where(x => x.PRIORITY == "High" || x.PRIORITY == "Critical").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ACTION_ITEM_HIGH", highCount.ToString()));

                int mediumCount = filteredList.Where(x => x.PRIORITY == "Medium").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ACTION_ITEM_MEDIUM", mediumCount.ToString()));

                int lowCount = filteredList.Where(x => x.PRIORITY == "Low").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ACTION_ITEM_LOW", lowCount.ToString()));
            }

            //---------------------- Group By portfolio -------------------------------//

            var groupByPortfolio = actionitems.GroupBy(x => x.PORTFOLIO_ID);

            foreach (var portfolio in groupByPortfolio)
            {
                var filteredList = portfolio.Where(x => x.STATUS_TYPE == "PAST_DUE_DATE" || x.STATUS_TYPE == "DUE_FOR_CLOSURE").ToList();

                int pastduedatecount = portfolio.Where(x => x.STATUS_TYPE == "PAST_DUE_DATE").ToList().Count();

                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "PAST_DUE_DATE", pastduedatecount.ToString()));

                int dueforclosurecount = portfolio.Where(x => x.STATUS_TYPE == "DUE_FOR_CLOSURE").ToList().Count();

                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "DUE_FOR_CLOSURE", dueforclosurecount.ToString()));

                int highCount = filteredList.Where(x => x.PRIORITY == "High" || x.PRIORITY == "Critical").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ACTION_ITEM_HIGH", highCount.ToString()));

                int mediumCount = filteredList.Where(x => x.PRIORITY == "Medium").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ACTION_ITEM_MEDIUM", mediumCount.ToString()));

                int lowCount = filteredList.Where(x => x.PRIORITY == "Low").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ACTION_ITEM_LOW", lowCount.ToString()));
            }

            //---------------------- Group By project -------------------------------//

            var groupByPrpject = actionitems.GroupBy(x => x.PROJ_ID);

            foreach (var proj in groupByPrpject)
            {
                var filteredList = proj.Where(x => x.STATUS_TYPE == "PAST_DUE_DATE" || x.STATUS_TYPE == "DUE_FOR_CLOSURE").ToList();

                int pastduedatecount = proj.Where(x => x.STATUS_TYPE == "PAST_DUE_DATE").ToList().Count();

                newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.ToList()[0].PROJ_ID, null, "PAST_DUE_DATE", pastduedatecount.ToString()));

                int dueforclosurecount = proj.Where(x => x.STATUS_TYPE == "DUE_FOR_CLOSURE").ToList().Count();

                newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.ToList()[0].PROJ_ID, null, "DUE_FOR_CLOSURE", dueforclosurecount.ToString()));

                int highCount = filteredList.Where(x => x.PRIORITY == "High" || x.PRIORITY == "Critical").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.ToList()[0].PROJ_ID, null, "ACTION_ITEM_HIGH", highCount.ToString()));

                int mediumCount = filteredList.Where(x => x.PRIORITY == "Medium").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.ToList()[0].PROJ_ID, null, "ACTION_ITEM_MEDIUM", mediumCount.ToString()));

                int lowCount = filteredList.Where(x => x.PRIORITY == "Low").Count();

                newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.ToList()[0].PROJ_ID, null, "ACTION_ITEM_LOW", lowCount.ToString()));
            }

            DeleteDashboardDetails("PAST_DUE_DATE");
            DeleteDashboardDetails("DUE_FOR_CLOSURE");
            DeleteDashboardDetails("ACTION_ITEM");
            InsertDashboardDetails(newDashboardDetails);
        }
        private void LoadStaffingSummaryDetails()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<StaffingSummaryForAllCustomers> staffingDetails = Cldb.AppRepo.GetStaffingSummaryDetailsForAllCustomers().ToList();

            //----------------------------------------------------------GroupByCustomer---------------------------------------------------------//

            var groupByCustomer = staffingDetails.GroupBy(x => x.CUST_ID);
            string content = string.Empty;

            foreach (var customer in groupByCustomer)
            {
                List<StaffingSummaryForAllCustomers> offshordetail = customer.Where(x => x.NAME == "OFFSHORE").ToList();


                if (offshordetail != null)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "OFFSHORE_TOTAL", offshordetail.Count.ToString()));

                    content = offshordetail.Where(x => x.BILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "OFFSHORE_BILLABLE", content));

                    content = offshordetail.Where(x => x.UNBILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "OFFSHORE_NON_BILLABLE", content));
                }

                List<StaffingSummaryForAllCustomers> onsitedetail = customer.Where(x => x.NAME == "ONSITE").ToList();

                if (onsitedetail != null)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ONSITE_TOTAL", onsitedetail.Count.ToString()));

                    content = onsitedetail.Where(x => x.BILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ONSITE_BILLABLE", content));

                    content = onsitedetail.Where(x => x.UNBILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ONSITE_NON_BILLABLE", content));
                }

            }

            //------------------------------------------ group by portfolio -------------------------------------------------------//

            var groupByPortfolio = staffingDetails.GroupBy(x => x.PORTFOLIO_ID);


            foreach (var portfolio in groupByPortfolio)
            {
                string custid = portfolio.ToList().FirstOrDefault().CUST_ID;

                List<StaffingSummaryForAllCustomers> offshordetail = portfolio.Where(x => x.NAME == "OFFSHORE").ToList();

                if (offshordetail != null)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(custid, null, portfolio.Key, "OFFSHORE_TOTAL", offshordetail.Count.ToString()));

                    content = offshordetail.Where(x => x.BILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, null, portfolio.Key, "OFFSHORE_BILLABLE", content));

                    content = offshordetail.Where(x => x.UNBILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, null, portfolio.Key, "OFFSHORE_NON_BILLABLE", content));
                }

                List<StaffingSummaryForAllCustomers> onsitedetail = portfolio.Where(x => x.NAME == "ONSITE").ToList();

                if (onsitedetail != null)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(custid, null, portfolio.Key, "ONSITE_TOTAL", onsitedetail.Count.ToString()));

                    content = onsitedetail.Where(x => x.BILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, null, portfolio.Key, "ONSITE_BILLABLE", content));

                    content = onsitedetail.Where(x => x.UNBILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, null, portfolio.Key, "ONSITE_NON_BILLABLE", content));
                }
            }
            //--------------------------------- group by project ---------------------------------------------------------------//

            var groupByProject = staffingDetails.GroupBy(x => x.PROJ_ID);


            foreach (var proj in groupByProject)
            {
                string custid = proj.ToList().FirstOrDefault().CUST_ID;

                List<StaffingSummaryForAllCustomers> offshordetail = proj.Where(x => x.NAME == "OFFSHORE").ToList();

                if (offshordetail != null)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(custid, proj.Key, null, "OFFSHORE_TOTAL", offshordetail.Count.ToString()));

                    content = offshordetail.Where(x => x.BILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, proj.Key, null, "OFFSHORE_BILLABLE", content));

                    content = offshordetail.Where(x => x.UNBILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, proj.Key, null, "OFFSHORE_NON_BILLABLE", content));
                }

                List<StaffingSummaryForAllCustomers> onsitedetail = proj.Where(x => x.NAME == "ONSITE").ToList();

                if (onsitedetail != null)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(custid, proj.Key, null, "ONSITE_TOTAL", onsitedetail.Count.ToString()));

                    content = onsitedetail.Where(x => x.BILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, proj.Key, null, "ONSITE_BILLABLE", content));

                    content = onsitedetail.Where(x => x.UNBILLED == 1).Count().ToString();

                    newDashboardDetails.Add(GetNewDashboardDetails(custid, proj.Key, null, "ONSITE_NON_BILLABLE", content));
                }
            }



            DeleteDashboardDetails("OFFSHORE");
            DeleteDashboardDetails("ONSITE");
            InsertDashboardDetails(newDashboardDetails);
        }


        private DateRange GetKPILastUpdatedDate(string CustomerId)
        {
            DateRange range = new DateRange(DateTime.Now, enDateRange.Monthly);
            //Get Goalss
            List<KPI_GOALS> goals = CSPdb.KPI_GOALS.GetAll().Where(t => t.CUSTOMER_ID == CustomerId && t.ISACTIVE == true).OrderBy(u => u.DISPLAY_ORDER).ToList<KPI_GOALS>();
            List<int> goalIds = goals.Select(s => s.ID).ToList<int>();

            //Get KPIs
            List<KPI> KPIs = CSPdb.KPI.GetAll().Where(t => goalIds.Contains(t.GOAL_ID) && t.ISACTIVE == true).ToList<KPI>();
            List<int> kpiIds = KPIs.Select(s => s.ID).ToList<int>();

            //Get last updated Kpi details
            KPI_DETAILS lastUpdated = CSPdb.KPI_DETAILS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID) && t.ISACTIVE == true).OrderByDescending(u => u.PERIOD).FirstOrDefault();
            if (lastUpdated != null)
                range = new DateRange(lastUpdated.PERIOD, enDateRange.Monthly);

            return range;
        }

        [GET("GetSuccessGoalScoreForAPeriod")]
        [ActionName("GetSuccessGoalScoreForAPeriod")]
        [HttpGet]
        public IHttpActionResult GetSuccessGoalScoreForAPeriod(string CustomerId, string Month, int Year, bool bLastUpdated)
        {
            SuccessGoalScores output = new SuccessGoalScores();
            List<PROJECT_SCORES> scores = new List<PROJECT_SCORES>();

            int monthNumber = DateTime.ParseExact(Month, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(Year, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            if (bLastUpdated)
                range = GetKPILastUpdatedDate(CustomerId);
            output.MONTH = range.StartDate.ToString("MMM");
            output.YEAR = range.StartDate.Year;

            DateTime StartDate = range.StartDate;
            DateTime EndDate = range.EndDate;

            List<CUSTOMER_PROJECT_PORTFOLIO> overall = CSPdb.AppRepo.getCustomerProjectPorfolioList(StartDate, CustomerId).ToList();
            List<CUSTOMER_PROJECT_PORTFOLIO> filteredList = overall.Where(x => x.CUST_ID == CustomerId).ToList();
            List<string> ProjIds = filteredList.Select(x => x.PROJ_ID).ToList();

            List<KPI_DETAILS_EXTENDED> kpi_all = CSPdb.AppRepo.GetKPIDetails(StartDate, EndDate).ToList();

            var basicFilter = kpi_all.Where(x => x.CUSTOMER_ID == CustomerId && x.ISACTIVE).ToList();
            List<KPI_DETAILS_EXTENDED> projectKPIs = new List<KPI_DETAILS_EXTENDED>();
            decimal score = 0M;
            string color1 = "green";
            string sScore;

            var projectstoSkipBySettings = helper.GetProjectConfigurationDataForSetting("SKIP_TO_SHOW_IN_DASHBOARD").Where(x => x.Bit_Value == true).ToList();

            foreach (var project in filteredList)
            {
                if (projectstoSkipBySettings.Any(x => x.Proj_Id == project.PROJ_ID)) continue;

                projectKPIs = basicFilter.Where(x => x.PROJECT_ID == project.PROJ_ID).ToList();
                decimal kpiAreas = 0;

                kpiAreas = projectKPIs.Where(x => x.ISACTIVE).Select(x => x.SERVICE_AREA.Trim()).Distinct().Count();

                score = GetSuccessGoalScoreNewLogic(projectKPIs);
                sScore = GetScorePercentage(score);
                var goalScore = new PROJECT_SCORES()
                {
                    SCORE = sScore,
                    dSCORE = score,
                    COLOR = color1,
                    PROJ_NM = project.PROJ_NM,
                    PORTFOLIO_ID = project.PORTFOLIO_ID,
                    CUSTOMER_NM = project.CUSTOMER_NM,
                    PROJ_ID = project.PROJ_ID,
                    CUST_ID = project.CUST_ID,
                    PROJECT_PLAN_URL = project.PROJECT_PLAN_URL,
                    TOTAL_KPIS = GetTotalKPIsCount(projectKPIs),
                    MET_KPIS = GetMetKPIsCount(projectKPIs),
                    TOTAL_KPI_AREA = kpiAreas,
                    BUSINESS_UNIT = project.BUSINESS_UNIT
                };

                scores.Add(goalScore);
            }

            scores = scores.OrderByDescending(t => t.dSCORE).ToList();
            output.PROJECT_SCORES = scores;

            // Quality 

            projectKPIs = basicFilter.Where(x => ProjIds.Contains(x.PROJECT_ID)).ToList();

            decimal quality = GetSuccessGoalScoreNew(projectKPIs, 1);
            if (quality >= 0)
                output.QUALITY = quality.ToString("0") + "%";
            else
                output.QUALITY = "-";

            output.QUALITY_COLOR = "black";

            // Performance

            decimal performance = GetSuccessGoalScoreNew(projectKPIs, 2);
            if (performance >= 0)
                output.PERFORMANCE = performance.ToString("0") + "%";
            else
                output.PERFORMANCE = "-";

            output.PERFORMANCE_COLOR = "black";

            // Value

            decimal value = GetSuccessGoalScoreNew(projectKPIs, 3);
            if (value >= 0)
                output.VALUE = value.ToString("0") + "%";
            else
                output.VALUE = "-";

            output.VALUE_COLOR = "black";

            // Compliance

            decimal compliance = GetSuccessGoalScoreNew(projectKPIs, 4);

            if (Math.Sign(compliance) >= 0)
                output.COMPLIANCE = compliance.ToString("0") + "%";
            else
                output.COMPLIANCE = "-";

            output.COMPLIANCE_COLOR = "black";

            //----------------------------- Overall health calculation-----------------------------------------------------//

            if (IsPremier(CustomerId))
            {
                List<PORTFOLIO> portfolioList = CSPdb.PORTFOLIO.GetAll().ToList();
                List<HealthScoresPortfolioWise> hScoresList = new List<HealthScoresPortfolioWise>();
                decimal OverallScore = 0M;
                string OScore = string.Empty;

                foreach (var portfolio in portfolioList)
                {
                    var hScore = new HealthScoresPortfolioWise();
                    ProjIds = scores.Where(x => x.PORTFOLIO_ID == portfolio.ID).Select(x => x.PROJ_ID).ToList();
                    projectKPIs = basicFilter.Where(x => ProjIds.Contains(x.PROJECT_ID)).ToList();

                    OverallScore = GetSuccessGoalScoreNew(projectKPIs);
                    OScore = GetScorePercentage(OverallScore);

                    hScore.HEALTH_SCORE = OScore;
                    hScore.PORTFOLIO_ID = portfolio.ID;
                    hScore.TITLE = portfolio.TITLE;
                    hScore.CONTACT_NAME = portfolio.CONTACT_NAME;
                    hScoresList.Add(hScore);
                }
                hScoresList = hScoresList.OrderByDescending(t => t.HEALTH_SCORE).ToList();
                output.HEALTH_SCORES_OVERALL = hScoresList;
            }

            // getLatestHighlights

            IHttpActionResult actionResult = GetNotesForAPeriod(CustomerId, StartDate);
            var result = actionResult as OkNegotiatedContentResult<List<HIGHLIGHTS>>;
            output.HIGHLIGHTS = result.Content;

            return Ok(output);
        }

        private decimal GetMetKPIsCount(List<KPI_DETAILS_EXTENDED> inputKPIs)
        {
            decimal metKPIs = 0;

            foreach (var row in inputKPIs)
            {
                if (!string.IsNullOrWhiteSpace(row.SLA_STATUS) && row.SLA_STATUS.ToLower() == "met")
                {
                    metKPIs++;
                }
            }

            return metKPIs;
        }

        private decimal GetTotalKPIsCount(List<KPI_DETAILS_EXTENDED> inputKPIs)
        {
            decimal naCount = 0, emptyActual = 0;
            decimal total = inputKPIs.Count, totalKPIs = 0;

            foreach (var row in inputKPIs)
            {
                if (string.IsNullOrWhiteSpace(row.SLA_STATUS) && string.IsNullOrWhiteSpace(row.KPI_ACTUAL))
                {
                    emptyActual++;
                }
                else if (!string.IsNullOrWhiteSpace(row.SLA_STATUS) && row.SLA_STATUS.ToLower() == "na")
                {
                    naCount++;
                }
            }

            totalKPIs = total - naCount - emptyActual;
            return totalKPIs;
        }

        public IHttpActionResult GetSuccessGoalScoreForAPeriodNew(string CustomerId, DateTime fromDate, DateTime toDate, bool bLastUpdated)
        {
            SuccessGoalScores output = new SuccessGoalScores();
            List<PROJECT_SCORES> scores = new List<PROJECT_SCORES>();

            // int monthNumber = DateTime.ParseExact(Month, "MMM", CultureInfo.CurrentCulture).Month;
            //var selectedDate = new DateTime(Year, monthNumber, 1);
            //DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            if (bLastUpdated)
                GetKPILastUpdatedDate(CustomerId);
            //output.MONTH = range.StartDate.ToString("MMM");
            //output.YEAR = range.StartDate.Year;

            //DateTime StartDate = fromDate;
            //DateTime EndDate = toDate;

            List<CUSTOMER_PROJECT_PORTFOLIO> overall = CSPdb.AppRepo.getCustomerProjectPorfolioList(fromDate, CustomerId).ToList();
            List<CUSTOMER_PROJECT_PORTFOLIO> filteredList = overall.Where(x => x.CUST_ID == CustomerId).ToList();
            List<string> ProjIds = filteredList.Select(x => x.PROJ_ID).ToList();

            List<KPI_DETAILS_EXTENDED> kpi_all = CSPdb.AppRepo.GetKPIDetails(fromDate, toDate).ToList();

            var basicFilter = kpi_all.Where(x => x.CUSTOMER_ID == CustomerId && x.ISACTIVE).ToList();
            List<KPI_DETAILS_EXTENDED> projectKPIs = new List<KPI_DETAILS_EXTENDED>();
            decimal score = 0M;
            string color1 = "green";
            string sScore;

            var projectstoSkipBySettings = helper.GetProjectConfigurationDataForSetting("SKIP_TO_SHOW_IN_DASHBOARD").Where(x => x.Bit_Value == true).ToList();
            // fill Customer Success goals if customer has just one project

            if (filteredList.Count == 1)
            {
                projectKPIs = basicFilter.Where(x => x.PROJECT_ID == filteredList[0].PROJ_ID).ToList();
                var groupByGoal = projectKPIs.GroupBy(x => x.GOAL_ID);
                List<SUCCESS_GOALS_SCORES> goalScores = new List<SUCCESS_GOALS_SCORES>();

                foreach (var group in groupByGoal)
                {
                    if (projectstoSkipBySettings.Any(x => x.Proj_Id == filteredList[0].PROJ_ID)) continue;
                    SUCCESS_GOALS_SCORES goal = new SUCCESS_GOALS_SCORES();
                    goal.CUST_ID = filteredList[0].CUST_ID;
                    goal.PROJ_ID = filteredList[0].PROJ_ID;
                    goal.GOAL_NAME = CSPdb.KPI_GOALS.GetById(group.Key).DESCRIPTION;
                    goal.GOAL_ID = group.Key;
                    goal.DSCORE = GetSuccessGoalScoreNew(group.ToList());
                    goal.SCORE = GetScorePercentage(goal.DSCORE);
                    goal.COLOR = "#54b8e8";
                    goalScores.Add(goal);
                }

                output.SUCCESS_GOALS_SCORES = goalScores;
            }
            else
            {

                foreach (var project in filteredList)
                {
                    if (projectstoSkipBySettings.Any(x => x.Proj_Id == project.PROJ_ID)) continue;

                    projectKPIs = basicFilter.Where(x => x.PROJECT_ID == project.PROJ_ID).ToList();

                    score = GetSuccessGoalScoreNew(projectKPIs);
                    sScore = GetScorePercentage(score);
                    var goalScore = new PROJECT_SCORES()
                    {
                        SCORE = sScore,
                        dSCORE = score,
                        COLOR = color1,
                        PROJ_NM = project.PROJ_NM,
                        PORTFOLIO_ID = project.PORTFOLIO_ID,
                        CUSTOMER_NM = project.CUSTOMER_NM,
                        PROJ_ID = project.PROJ_ID,
                        CUST_ID = project.CUST_ID
                    };

                    scores.Add(goalScore);
                }

                scores = scores.OrderByDescending(t => t.dSCORE).ToList();
                output.PROJECT_SCORES = scores;
            }


            // Quality 

            projectKPIs = basicFilter.Where(x => ProjIds.Contains(x.PROJECT_ID)).ToList();

            decimal quality = GetSuccessGoalScoreNew(projectKPIs, 1);
            if (quality >= 0)
                output.QUALITY = quality.ToString("0") + "%";
            else
                output.QUALITY = "-";

            output.QUALITY_COLOR = "black";

            // Performance

            decimal performance = GetSuccessGoalScoreNew(projectKPIs, 2);
            if (performance >= 0)
                output.PERFORMANCE = performance.ToString("0") + "%";
            else
                output.PERFORMANCE = "-";

            output.PERFORMANCE_COLOR = "black";

            // Value

            decimal value = GetSuccessGoalScoreNew(projectKPIs, 3);
            if (value >= 0)
                output.VALUE = value.ToString("0") + "%";
            else
                output.VALUE = "-";

            output.VALUE_COLOR = "black";

            // Compliance

            decimal compliance = GetSuccessGoalScoreNew(projectKPIs, 4);

            if (Math.Sign(compliance) >= 0)
                output.COMPLIANCE = compliance.ToString("0") + "%";
            else
                output.COMPLIANCE = "-";

            output.COMPLIANCE_COLOR = "black";



            //----------------------------- Overall health calculation-----------------------------------------------------//

            if (IsPremier(CustomerId))
            {
                List<PORTFOLIO> portfolioList = CSPdb.PORTFOLIO.GetAll().ToList();
                List<HealthScoresPortfolioWise> hScoresList = new List<HealthScoresPortfolioWise>();
                decimal OverallScore = 0M;
                string OScore = string.Empty;

                foreach (var portfolio in portfolioList)
                {
                    var hScore = new HealthScoresPortfolioWise();
                    ProjIds = scores.Where(x => x.PORTFOLIO_ID == portfolio.ID).Select(x => x.PROJ_ID).ToList();
                    projectKPIs = basicFilter.Where(x => ProjIds.Contains(x.PROJECT_ID)).ToList();

                    OverallScore = GetSuccessGoalScoreNew(projectKPIs);
                    OScore = GetScorePercentage(OverallScore);

                    hScore.HEALTH_SCORE = OScore;
                    hScore.PORTFOLIO_ID = portfolio.ID;
                    hScoresList.Add(hScore);
                }

                output.HEALTH_SCORES_OVERALL = hScoresList;
            }

            // getLatestHighlights

            IHttpActionResult actionResult = GetNotesForAPeriod(CustomerId, fromDate);
            var result = actionResult as OkNegotiatedContentResult<List<HIGHLIGHTS>>;
            output.HIGHLIGHTS = result.Content;

            return Ok(output);
        }

        public bool IsPremier(string Custid)
        {
            if (Custid == PREMIER_CUSTOMER_ID)
                return true;
            else
                return false;
        }

        public bool IsSLAMetricsAvailable(string[] customerIds)
        {
            var availableSLAs = CSPdb.KPI.GetAll().Where(x => customerIds.Contains(x.CUSTOMER_ID) && x.ISACTIVE && x.PRODUCT_ID.HasValue).ToList();
            return availableSLAs.Any();
        }

        public void UpdateList(ref List<HealthScoresPortfolioWise> hList, HealthScoresPortfolioWise value)
        {
            HealthScoresPortfolioWise rec = hList.Find(x => x.PORTFOLIO_ID == value.PORTFOLIO_ID);
            if (rec != null)
                rec.HEALTH_SCORE = value.HEALTH_SCORE;
        }

        public string GetScorePercentage(decimal score)
        {
            if (score == -1)
                return "-";
            else
                return score.ToString() + " %";
        }

        public class SuccessGoalScores
        {
            public List<PROJECT_SCORES> PROJECT_SCORES { get; set; }
            public List<SUCCESS_GOALS_SCORES> SUCCESS_GOALS_SCORES { get; set; }
            public string MONTH { get; set; }
            public int YEAR { get; set; }
            public string OVERALL_SCORE { get; set; }
            public string QUALITY { get; set; }
            public string PERFORMANCE { get; set; }
            public string VALUE { get; set; }
            public string COMPLIANCE { get; set; }
            public string QUALITY_COLOR { get; set; }
            public string PERFORMANCE_COLOR { get; set; }
            public string VALUE_COLOR { get; set; }
            public string COMPLIANCE_COLOR { get; set; }
            public List<HealthScoresPortfolioWise> HEALTH_SCORES_OVERALL { get; set; }
            public List<HealthScoresPortfolioWise> HEALTH_SCORES_COLOR { get; set; }
            public List<HealthScoresPortfolioWise> PROJECT_HEALTH_HIGH { get; set; }
            public List<HealthScoresPortfolioWise> PROJECT_HEALTH_MEDIUM { get; set; }
            public List<HealthScoresPortfolioWise> PROJECT_HEALTH_LOW { get; set; }
            public List<HIGHLIGHTS> HIGHLIGHTS { get; set; }

        }

        public class HealthScoresPortfolioWise
        {
            public int? PORTFOLIO_ID { get; set; }

            public string TITLE { get; set; }

            public string CONTACT_NAME { get; set; }
            public string HEALTH_SCORE { get; set; }
        }

        private void LoadSuccessGoalPerformanceSummary()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();

            //string startDate = "1-Jul-2019";
            //string endDate = "31-Jul-2019";

            int currentMonth = DateTime.Now.Month;
            int currentYear = DateTime.Now.Year;
            var selectedDate = new DateTime(currentYear, currentMonth, 01);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            DateTime stDate = range.StartDate;
            DateTime enDate = range.EndDate;

            string sScore;

            List<CUSTOMER_PROJECT_PORTFOLIO> overall = CSPdb.AppRepo.getCustomerProjectPorfolioList(stDate, string.Empty).ToList();

            //DateTime stDate = DateTime.Parse(startDate);
            //DateTime enDate = DateTime.Parse(endDate);


            //enDate = stDate.AddMonths(1).AddSeconds(-1);
            List<KPI_DETAILS_EXTENDED> kpi_all = CSPdb.AppRepo.GetKPIDetails(stDate, enDate).ToList();
            //----------------------------------------------------------------------------------------
            //Customer
            //----------------------------------------------------------------------------------------
            var groupbyCustomer = overall.GroupBy(t => t.CUST_ID);
            foreach (var customer in groupbyCustomer)
            {
                List<string> projIds = customer.ToList().Select(t => t.PROJ_ID).ToList();
                decimal score = GetSuccessGoalScore(customer.Key, projIds, kpi_all);
                if (score >= 0)
                    sScore = score.ToString("0") + "%";
                else
                    sScore = "-";

                string color = "grey";

                if (score >= 0)
                {
                    if (score >= 98)
                        color = "green";
                    else if (score >= 90)
                        color = "orange";
                    else
                        color = "red";
                }
                else
                {
                    color = "red";
                }

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "SUCCESS_GOAL_SCORE", sScore, color));

                //----------------------------------------------------------------------------------------
                //Customer - Category () 1-Quality, 2- Performance,  3- value,  4- Compliance
                //----------------------------------------------------------------------------------------
                score = GetSuccessGoalScore(customer.Key, projIds, kpi_all, 1);
                if (score >= 0)
                    sScore = score.ToString("0") + "%";
                else
                    sScore = "-";
                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "SUCCESS_GOAL_SCORE_QUALITY", sScore, GetRagFromScore(score)));

                score = GetSuccessGoalScore(customer.Key, projIds, kpi_all, 2);
                if (score >= 0)
                    sScore = score.ToString("0") + "%";
                else
                    sScore = "-";
                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "SUCCESS_GOAL_SCORE_PERFORMANCE", sScore, GetRagFromScore(score)));

                score = GetSuccessGoalScore(customer.Key, projIds, kpi_all, 3);
                if (score >= 0)
                    sScore = score.ToString("0") + "%";
                else
                    sScore = "-";
                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "SUCCESS_GOAL_SCORE_VALUE", sScore, GetRagFromScore(score)));

                score = GetSuccessGoalScore(customer.Key, projIds, kpi_all, 4);
                if (score >= 0)
                    sScore = score.ToString("0") + "%";
                else
                    sScore = "-";
                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "SUCCESS_GOAL_SCORE_COMPLIANCE", sScore, GetRagFromScore(score)));

            }

            //----------------------------------------------------------------------------------------
            //project
            //----------------------------------------------------------------------------------------
            foreach (var project in overall)
            {
                decimal score = GetSuccessGoalScore(project.CUST_ID, new List<string> { project.PROJ_ID }, kpi_all);
                if (score >= 0)
                    sScore = score.ToString("0") + "%";
                else
                    sScore = "-";

                string color = "grey";
                if (score >= 0)
                {
                    if (score >= 98)
                        color = "green";
                    else if (score >= 90)
                        color = "orange";
                    else
                        color = "red";
                }
                else
                {
                    color = "red";
                }

                newDashboardDetails.Add(GetNewDashboardDetails(project.CUST_ID, project.PROJ_ID, null, "SUCCESS_GOAL_SCORE", sScore, color));
            }

            //----------------------------------------------------------------------------------------
            //portfolio
            //----------------------------------------------------------------------------------------

            var groupByPortfolio = overall.GroupBy(x => x.PORTFOLIO_ID);

            foreach (var portfolio in groupByPortfolio)
            {
                List<string> projIds = CSPdb.PORTFOLIO_PROJECT.GetAll().Where(x => x.PORTFOLIO_ID == portfolio.Key).Select(x => x.PROJ_ID).Distinct().ToList();

                decimal score = GetSuccessGoalScore(portfolio.ToList()[0].CUST_ID, projIds, kpi_all);
                if (score >= 0)
                    sScore = score.ToString("0") + "%";
                else
                    sScore = "-";

                string color = "grey";
                if (score >= 0)
                {
                    if (score >= 98)
                        color = "green";
                    else if (score >= 90)
                        color = "orange";
                    else
                        color = "red";
                }
                else
                {
                    color = "red";
                }


                newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "SUCCESS_GOAL_SCORE", sScore, color));

            }
            DeleteDashboardDetails("SUCCESS_GOAL_SCORE");
            InsertDashboardDetails(newDashboardDetails);
        }
        public decimal GetSuccessGoalScore(string custId, List<string> projIds, List<KPI_DETAILS_EXTENDED> kpi_all, int PerspectiveId = -1)
        {
            List<KPI_DETAILS_EXTENDED> kpi_logged = new List<KPI_DETAILS_EXTENDED>();
            List<KPI_DETAILS_EXTENDED> kpi_notLogged = new List<KPI_DETAILS_EXTENDED>();

            List<int> CategoryIds = CSPdb.GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING.GetAll().Where(t => t.GLOBAL_PERSPECTIVE_ID == PerspectiveId).ToList().Select(t => t.GLOBAL_KPI_CATEGORY_ID).ToList();

            if (PerspectiveId > 0)
                kpi_all = kpi_all.Where(t => CategoryIds.Contains(t.GLOBAL_KPI_CATEGORY_ID)).ToList();

            //KPI not applicable or not
            List<KPI_DETAILS_EXTENDED> project_kpi = kpi_all.Where(t => (projIds.Contains(t.PROJECT_ID)) && t.CUSTOMER_ID == custId).ToList();

            //if(project_kpi.Count == 0)

            kpi_logged = kpi_all.Where(t => (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
            kpi_notLogged = kpi_all.Where(t => (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId) && (t.KPI_ACTUAL == "" || t.KPI_ACTUAL == null || t.SLA_TARGET_HIGH_VALUE == null)).ToList();


            FillDetails(ref kpi_logged);

            decimal kpi_met_count = kpi_logged.Where(t => t.PERCENT >= 100).ToList().Count;
            decimal kpi_notMet_count = kpi_logged.Where(t => t.PERCENT < 100).ToList().Count;

            decimal finalscore = 0;

            if (kpi_met_count > 0 && kpi_logged.Count > 0)
                finalscore = GetDecimal((kpi_met_count / kpi_logged.Count) * 100);
            else if (project_kpi.Count - kpi_notLogged.Count == 0 || project_kpi.Count == 0)
                finalscore = -1;

            return finalscore;
        }

        public List<SUCCESS_GOALS_SCORES> GetSuccessGoalsScore(string custId, List<string> projIds, List<KPI_DETAILS_EXTENDED> kpi_all, int PerspectiveId = -1)
        {
            kpi_all = kpi_all.Where(t => t.PROJECT_ID == projIds[0]).ToList();
            List<SUCCESS_GOALS_SCORES> goalScores = new List<SUCCESS_GOALS_SCORES>();

            List<int> CategoryIds = CSPdb.GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING.GetAll().Where(t => t.GLOBAL_PERSPECTIVE_ID == PerspectiveId).ToList().Select(t => t.GLOBAL_KPI_CATEGORY_ID).ToList();

            if (PerspectiveId > 0)
                kpi_all = kpi_all.Where(t => CategoryIds.Contains(t.GLOBAL_KPI_CATEGORY_ID)).ToList();

            var goalGroup = kpi_all.GroupBy(t => t.GOAL_ID);

            foreach (var group in goalGroup)
            {
                List<KPI_DETAILS_EXTENDED> kpi_logged = new List<KPI_DETAILS_EXTENDED>();
                List<KPI_DETAILS_EXTENDED> kpi_notLogged = new List<KPI_DETAILS_EXTENDED>();
                SUCCESS_GOALS_SCORES goal = new SUCCESS_GOALS_SCORES();
                goal.GOAL_NAME = CSPdb.KPI_GOALS.GetById(group.Key).DESCRIPTION;
                goal.GOAL_ID = group.Key;

                //KPI not applicable or not
                List<KPI_DETAILS_EXTENDED> project_kpi = kpi_all.Where(t => (projIds.Contains(t.PROJECT_ID)) && t.CUSTOMER_ID == custId && t.GOAL_ID == group.Key).ToList();

                kpi_logged = kpi_all.Where(t => (projIds.Contains(t.PROJECT_ID) && t.GOAL_ID == group.Key && t.CUSTOMER_ID == custId) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
                kpi_notLogged = kpi_all.Where(t => (projIds.Contains(t.PROJECT_ID) && t.GOAL_ID == group.Key && t.CUSTOMER_ID == custId) && (t.KPI_ACTUAL == "" || t.KPI_ACTUAL == null || t.SLA_TARGET_HIGH_VALUE == null)).ToList();

                FillDetails(ref kpi_logged);

                decimal kpi_met_count = kpi_logged.Where(t => t.PERCENT >= 100).ToList().Count;
                decimal kpi_notMet_count = kpi_logged.Where(t => t.PERCENT < 100).ToList().Count;

                decimal finalscore = 0;

                if (kpi_met_count > 0 && kpi_logged.Count > 0)
                    finalscore = GetDecimal((kpi_met_count / kpi_logged.Count) * 100);
                else if (project_kpi.Count - kpi_notLogged.Count == 0 || project_kpi.Count == 0)
                {
                    finalscore = -1;
                    goal.SCORE = "-";
                }


                goal.DSCORE = finalscore;
                goalScores.Add(goal);
            }

            return goalScores;
        }
        public decimal GetSuccessGoalScoreForGoal(List<KPI_DETAILS_EXTENDED> kpi_all, string custId, string projId, int goalId)
        {
            List<KPI_DETAILS_EXTENDED> kpi_logged = new List<KPI_DETAILS_EXTENDED>();
            List<KPI_DETAILS_EXTENDED> kpi_notLogged = new List<KPI_DETAILS_EXTENDED>();

            List<KPI_DETAILS_EXTENDED> goal_kpi = kpi_all.Where(t => t.PROJECT_ID == projId && t.CUSTOMER_ID == custId && t.GOAL_ID == goalId && t.ISACTIVE).ToList();

            var basicFilter = kpi_all.Where(t => (t.PROJECT_ID == projId && t.CUSTOMER_ID == custId && t.GOAL_ID == goalId)).ToList();

            kpi_logged = basicFilter.Where(t => t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
            kpi_notLogged = basicFilter.Where(t => (t.KPI_ACTUAL == "" || t.KPI_ACTUAL == null || t.SLA_TARGET_HIGH_VALUE == null)).ToList();

            FillDetails(ref kpi_logged);

            decimal kpi_met_count = kpi_logged.Where(t => t.PERCENT >= 100).ToList().Count;
            decimal kpi_notMet_count = kpi_logged.Where(t => t.PERCENT < 100).ToList().Count;

            decimal finalscore = 0;
            if (kpi_met_count > 0 && kpi_logged.Count > 0)
                finalscore = GetDecimal((kpi_met_count / kpi_logged.Count) * 100);
            else if (goal_kpi.Count == 0 || goal_kpi.Count - kpi_notLogged.Count == 0)
                finalscore = -1;

            return finalscore;
        }

        private decimal GetSuccessGoalScoreNew(List<KPI_DETAILS_EXTENDED> InputKPIs, int PerspectiveId = -1)
        {
            List<KPI_DETAILS_EXTENDED> kpi_logged = new List<KPI_DETAILS_EXTENDED>();

            if (PerspectiveId > 0)
            {
                List<int> CategoryIds = CSPdb.GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING.GetAll().Where(t => t.GLOBAL_PERSPECTIVE_ID == PerspectiveId).ToList().Select(t => t.GLOBAL_KPI_CATEGORY_ID).ToList();
                InputKPIs = InputKPIs.Where(t => CategoryIds.Contains(t.GLOBAL_KPI_CATEGORY_ID)).ToList();
            }

            kpi_logged = InputKPIs.Where(x => !string.IsNullOrEmpty(x.KPI_ACTUAL) && x.SLA_TARGET_HIGH_VALUE.HasValue).ToList();

            decimal kpiScore = 0M;
            decimal goalScore = 0M;

            FillDetails(ref kpi_logged);

            foreach (var kpi in kpi_logged)
                kpiScore = kpiScore + (kpi.PERCENT.HasValue ? kpi.PERCENT.Value : 0);

            if (kpi_logged.Count == 0)
                goalScore = -1;
            else
            {
                goalScore = kpiScore / kpi_logged.Count;
                goalScore = goalScore < 99 ? Math.Round(goalScore) : Math.Floor(goalScore);
            }


            return goalScore;
        }


        /// <summary>
        /// GetSuccessGoalScoreNewLogic
        /// </summary> 
        private decimal GetSuccessGoalScoreNewLogic(List<KPI_DETAILS_EXTENDED> inputKPIs, int perspectiveId = -1)
        {
            decimal goalScore = -1, naCount = 0, emptyActual = 0;
            decimal total = inputKPIs.Count, met = 0, kpisWithNoTargetValue = 0, denominator = 0;

            foreach (var row in inputKPIs)
            {
                if (string.IsNullOrWhiteSpace(row.SLA_STATUS) && string.IsNullOrWhiteSpace(row.KPI_ACTUAL))
                {
                    emptyActual++;
                    continue;
                }
                if (!string.IsNullOrWhiteSpace(row.SLA_STATUS) && row.SLA_STATUS.ToLower() == "na")
                {
                    naCount++;
                    continue;
                }

                decimal.TryParse(row.KPI_ACTUAL, out var actual);
                if (!row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_MEDIUM_VALUE.HasValue && !row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                {
                    if (row.SLA_TARGET_HIGH_VALUE.HasValue)
                    {
                        if (row.SLA_TARGET_HIGH_VALUE.Value == actual)
                            met++;
                    }
                    else
                        kpisWithNoTargetValue++;
                }
                else
                {
                    var monthData = new MonthData();
                    monthData.KpiActualValue = actual;
                    monthData.Targetveryhighoperator = row.SLA_TARGET_VERYHIGH_OPERATOR;
                    monthData.Targetveryhighvalue = row.SLA_TARGET_VERYHIGH_VALUE;
                    monthData.Targethighoperator = row.SLA_TARGET_HIGH_OPERATOR;
                    monthData.Targethighvalue = row.SLA_TARGET_HIGH_VALUE;
                    monthData.Targetlowvalue = row.SLA_TARGET_LOW_VALUE;
                    monthData.Targetlowoperator = row.SLA_TARGET_LOW_OPERATOR;
                    monthData.Targetmediumoperator = row.SLA_TARGET_MEDIUM_OPERATOR;
                    monthData.Targetmediumvalue = row.SLA_TARGET_MEDIUM_VALUE;

                    var periodObj = new Period();

                    if (monthData.Targetveryhighvalue.HasValue)
                    {
                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue) || periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                            met++;
                    }
                    else if (monthData.Targetmediumvalue.HasValue)
                    {
                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                            met++;
                        else
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targetmediumoperator, monthData.Targetmediumvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                            {
                                if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    met++;
                            }
                            else
                            {
                                if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    met++;
                            }
                        }
                    }
                    else if (monthData.Targetlowvalue.HasValue)
                    {
                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                            met++;
                        else
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targetlowoperator, monthData.Targetlowvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                            {
                                if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    met++;
                            }
                            else
                            {
                                if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    met++;
                            }
                        }
                    }
                }
            }
            denominator = total - kpisWithNoTargetValue - naCount - emptyActual;
            if (denominator > 0 && total > 0)
            {
                goalScore = (met / denominator) * 100;
            }
            else if (denominator == 0M && naCount > 0)
            {
                goalScore = 100;
            }
            else
            {
                goalScore = 0;
            }

            return Math.Round(goalScore);
        }


        /// <summary>
        /// GetSuccessGoalScoreNewLogic
        /// </summary> 
        private decimal GetSuccessGoalScoreNewLogic1(List<KPI_DETAILS_EXTENDED> inputKPIs, List<int> cutoffDays, int perspectiveId = -1)
        {
            decimal KPI_NOT_CALCULATED = 0, ACTUALS_EMPTY = 0, ON_TARGET = 0, ABOVE_TARGET = 0, UNDER_TARGET = 0;
            decimal KPI_ACHIEVED = 0;
            var customerdict = new Dictionary<string, Customergrouping>();

            foreach (var row in inputKPIs)
            {
                //if (!customerdict.ContainsKey(row.CUSTOMER_NM))
                //    customerdict.Add(row.CUSTOMER_NM, new Customergrouping(row.CUSTOMER_NM, row.CUSTOMER_ID));

                //var customer = customerdict[row.CUSTOMER_NM];

                //if (!customer.PROJECTS.ContainsKey(row.PROJECT_NM))
                //    customer.PROJECTS.Add(row.PROJECT_NM, new ProjectConsolidated(row.PROJECT_NM, row.PROJECT_ID));

                //var project = customer.PROJECTS[row.PROJECT_NM];
                //var kpi = project.PROJ_KPI_DATAS[row.KPI_ID];
                var period = row.PERIOD;//kpi.PERIODS.FirstOrDefault(x => x.PeriodType == row.PERIOD_TYPE);
                bool IsActualEmpty = false;

                if (!decimal.TryParse(row.KPI_ACTUAL, out var actual))
                {
                    var periodDate = new DateTime(row.PERIOD.Year, row.PERIOD.Month, 01);
                    var currentDate = DateTime.Now;
                    if (row.PERIOD_TYPE == "Monthly")
                    {
                        double days = (currentDate - periodDate).TotalDays;
                        double cutoffDate = cutoffDays[0] + 30;
                        if (days > cutoffDate)
                            IsActualEmpty = true;
                        else
                            continue;
                    }
                    else
                    {
                        int days;
                        if (row.PERIOD_TYPE == "Week1")
                        {
                            days = cutoffDays[1] + 7;
                            periodDate = periodDate.AddDays(days);

                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week2")
                        {
                            days = cutoffDays[1] + 14;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week3")
                        {
                            days = cutoffDays[1] + 21;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week4")
                        {
                            days = cutoffDays[1] + 28;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week5")
                        {
                            days = cutoffDays[1] + 35;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                    }
                }
                if (row.ISFLAG)
                {
                    KPI_NOT_CALCULATED++;
                    continue;
                }


                if (IsActualEmpty)
                {
                    ACTUALS_EMPTY++;
                    KPI_NOT_CALCULATED++;
                }
                else
                {

                    //var highvalue = row.SLA_TARGET_HIGH_VALUE.HasValue ? row.SLA_TARGET_HIGH_VALUE.Value : 0;
                    //var lowvalue = 0M;

                    if (!row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_MEDIUM_VALUE.HasValue && !row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                    {
                        if (row.SLA_TARGET_HIGH_VALUE.HasValue && row.SLA_TARGET_HIGH_VALUE.Value == actual)
                        {
                            ON_TARGET++;
                        }
                        else
                        {
                            KPI_NOT_CALCULATED++;
                        }
                    }
                    else
                    {
                        var monthData = new MonthData();
                        monthData.KpiActualValue = actual;
                        monthData.Targetveryhighoperator = row.SLA_TARGET_VERYHIGH_OPERATOR;
                        monthData.Targetveryhighvalue = row.SLA_TARGET_VERYHIGH_VALUE;
                        monthData.Targethighoperator = row.SLA_TARGET_HIGH_OPERATOR;
                        monthData.Targethighvalue = row.SLA_TARGET_HIGH_VALUE;
                        monthData.Targetlowvalue = row.SLA_TARGET_LOW_VALUE;
                        monthData.Targetlowoperator = row.SLA_TARGET_LOW_OPERATOR;
                        monthData.Targetmediumoperator = row.SLA_TARGET_MEDIUM_OPERATOR;
                        monthData.Targetmediumvalue = row.SLA_TARGET_MEDIUM_VALUE;

                        var periodObj = new Period();

                        if (monthData.Targetveryhighvalue.HasValue)
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targethighoperator, monthData.Targethighvalue.Value, monthData.Targetveryhighoperator, monthData.Targetveryhighvalue.Value))
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        ON_TARGET++;
                                    }
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                {
                                    ABOVE_TARGET++;
                                }
                                else
                                {
                                    UNDER_TARGET++;
                                }

                            }
                            else
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        ON_TARGET++;
                                    }
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                {
                                    ABOVE_TARGET++;
                                }
                                else
                                {
                                    UNDER_TARGET++;
                                }
                            }
                        }
                        else if (monthData.Targetmediumvalue.HasValue)
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targetmediumoperator, monthData.Targetmediumvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue < monthData.Targetmediumvalue.Value)
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                            }
                            else
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue > monthData.Targetmediumvalue.Value)
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                            }
                        }
                        else if (monthData.Targetlowvalue.HasValue)
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targetlowoperator, monthData.Targetlowvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue < monthData.Targetlowvalue.Value)
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                            }
                            else
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue > monthData.Targetlowvalue.Value)
                                    {
                                        UNDER_TARGET++;
                                    }
                                }
                            }
                        }
                    }
                }

                //var deno1 = ON_TARGET + ABOVE_TARGET + UNDER_TARGET;
                //if (deno1 != 0)
                //{
                //    ON_TARGET_PERCENTAGE = Math.Round(ON_TARGET / deno1 * 100);
                //    UNDER_TARGET_PERCENTAGE = Math.Round(UNDER_TARGET / deno1 * 100);
                //    ABOVE_TARGET_PERCENTAGE = Math.Round(ABOVE_TARGET / deno1 * 100);
                //} 

                var num1 = ON_TARGET + ABOVE_TARGET;
                var num2 = ON_TARGET + ABOVE_TARGET + UNDER_TARGET + ACTUALS_EMPTY;

                if (num2 != 0)
                    KPI_ACHIEVED = Math.Round((num1 / num2) * 100);
                else
                    KPI_ACHIEVED = 0;
            }
            return KPI_ACHIEVED;
        }

        private void LoadRiskAndIssuesSummary()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<RisksIssuesForProject> overall = CSPdb.AppRepo.GetRisksAndIssuesDetails().ToList();
            //----------------------------------------------------------------------------------------
            //Risk - Customer
            //----------------------------------------------------------------------------------------
            var groupbyCustomer = overall.GroupBy(t => t.CUST_ID);
            foreach (var customer in groupbyCustomer)
            {
                //H
                List<RisksIssuesForProject> ratings = customer.Where(t => t.VALUE == "H" && t.TYPE == "R").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_H", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_H", ratings.Count.ToString()));
                }
                //M
                ratings = customer.Where(t => t.VALUE == "M" && t.TYPE == "R").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_M", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_M", ratings.Count.ToString()));
                }
                //L
                ratings = customer.Where(t => t.VALUE == "L" && t.TYPE == "R").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_L", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_L", ratings.Count.ToString()));
                }
                //Total
                ratings = customer.Where(t => t.TYPE == "R").ToList();
                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_TOTAL", ratings.Count.ToString()));
            }
            //----------------------------------------------------------------------------------------
            //Issues - Customer
            //----------------------------------------------------------------------------------------
            foreach (var customer in groupbyCustomer)
            {
                //H
                List<RisksIssuesForProject> ratings = customer.Where(t => t.VALUE == "H" && t.TYPE == "I").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUE_H", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUE_H", ratings.Count.ToString()));
                }
                //M
                ratings = customer.Where(t => t.VALUE == "M" && t.TYPE == "I").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUE_M", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUE_M", ratings.Count.ToString()));
                }
                //L
                ratings = customer.Where(t => t.VALUE == "L" && t.TYPE == "I").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUE_L", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUE_L", ratings.Count.ToString()));
                }
                //Total
                ratings = customer.Where(t => t.TYPE == "I").ToList();
                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUE_TOTAL", ratings.Count.ToString()));
            }
            //----------------------------------------------------------------------------------------
            // Risk and Issues - Customer
            //----------------------------------------------------------------------------------------
            foreach (var customer in groupbyCustomer)
            {
                //H
                List<RisksIssuesForProject> ratings = customer.Where(t => t.VALUE == "H").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_ISSUE_H_TOTAL", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_ISSUE_H_TOTAL", ratings.Count.ToString()));
                }
                //M
                ratings = customer.Where(t => t.VALUE == "M").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_ISSUE_M_TOTAL", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_ISSUE_M_TOTAL", ratings.Count.ToString()));
                }
                //L
                ratings = customer.Where(t => t.VALUE == "L").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_ISSUE_L_TOTAL", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_ISSUE_L_TOTAL", ratings.Count.ToString()));
                }
                //Total
                ratings = customer.ToList();
                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISK_ISSUE_TOTAL", ratings.Count.ToString()));
            }
            //-----------------------------------------------------------------------------
            // Risks and Issues Details by Portfolio
            //-----------------------------------------------------------------------------

            // Risks
            var groupbyPortfolio = overall.Where(t => t.PORTFOLIO_ID != null).GroupBy(t => t.PORTFOLIO_ID);

            foreach (var portfolio in groupbyPortfolio)
            {
                //H
                List<RisksIssuesForProject> ratings = portfolio.Where(t => t.VALUE == "H" && t.TYPE == "R").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK_H", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "RISK_H", ratings.Count.ToString()));
                }
                //M
                ratings = portfolio.Where(t => t.VALUE == "M" && t.TYPE == "R").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK_M", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "RISK_M", ratings.Count.ToString()));
                }
                //L
                ratings = portfolio.Where(t => t.VALUE == "L" && t.TYPE == "R").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK_L", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "RISK_L", ratings.Count.ToString()));
                }

                //Risks_High_Total
                ratings = portfolio.Where(t => t.VALUE == "H").ToList();

                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK/ISSUE_H_TOTAL", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "RISK/ISSUE_H_TOTAL", ratings.Count.ToString()));
                }

                // Risks_Medium_Total
                ratings = portfolio.Where(t => t.VALUE == "M").ToList();

                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK/ISSUE_M_TOTAL", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "RISK/ISSUE_M_TOTAL", ratings.Count.ToString()));
                }

                // Risks_Low_Total
                ratings = portfolio.Where(t => t.VALUE == "L").ToList();

                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK/ISSUE_L_TOTAL", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK/ISSUE_L_TOTAL", ratings.Count.ToString()));
                }

                //Total
                ratings = portfolio.Where(t => t.TYPE == "R").ToList();

                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK_TOTAL", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK_TOTAL", ratings.Count.ToString()));
                }

                newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "RISK/ISSUES_TOTAL", portfolio.ToList().Count.ToString()));


                // newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUSTOMER_ID, null, portfolio.Key, "RISK/ISSUES_TOTAL", portfolio.ToList().Count.ToString());
            }

            // Issues

            foreach (var portfolio in groupbyPortfolio)
            {
                //H
                List<RisksIssuesForProject> ratings = portfolio.Where(t => t.VALUE == "H" && t.TYPE == "I").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "ISSUE_H", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "ISSUE_H", ratings.Count.ToString()));
                }
                //M
                ratings = portfolio.Where(t => t.VALUE == "M" && t.TYPE == "I").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "ISSUE_M", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "ISSUE_M", ratings.Count.ToString()));
                }
                //L
                ratings = portfolio.Where(t => t.VALUE == "L" && t.TYPE == "I").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUST_ID, null, portfolio.Key, "ISSUE_L", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "ISSUE_L", ratings.Count.ToString()));
                }
                //Total
                ratings = portfolio.Where(t => t.TYPE == "I").ToList();
                if (ratings.Count > 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(ratings[0].CUST_ID, null, portfolio.Key, "ISSUE_TOTAL", ratings.Count.ToString()));
            }


            DeleteDashboardDetails("RISK");
            DeleteDashboardDetails("ISSUE");
            InsertDashboardDetails(newDashboardDetails);
        }
        private void LoadIdeasAndInnovationsSummary()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<IdeasAndInnovationsData> overall = CSPdb.AppRepo.GetIdeasAndInnovationsDetails().ToList();


            //------------------- Get Ideas count by Customer Level---------------------------
            if (overall != null)
            {
                var groupByCustomer = overall.GroupBy(x => x.CUSTOMER_ID);

                foreach (var customer in groupByCustomer)
                {
                    //Total Ideas
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS", customer.ToList().Count.ToString()));

                    //Total Completed
                    int completed = customer.Where(t => t.STATUS != null && t.STATUS.ToLower() == "completed").ToList().Count();
                    if (completed == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_COMPLETED", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_COMPLETED", completed.ToString()));

                    //Total In Progress
                    int inprogress = customer.Where(t => t.STATUS != null && t.STATUS.ToLower() != "completed").ToList().Count();
                    if (inprogress == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_INPROGRESS", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_INPROGRESS", inprogress.ToString()));

                    //Total minuteshours
                    decimal hours = customer.Where(t => t.EFFORTS_SAVED_PERSON_HOUR != null).Select(t => t.EFFORTS_SAVED_PERSON_HOUR.Value).Sum();
                    if (hours == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_HOURS", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_HOURS", hours.ToString("0") + " hrs"));


                    //Total dollars
                    decimal dollars = customer.Where(t => t.DOLLARS != null).Select(t => t.DOLLARS.Value).Sum();
                    if (dollars == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_DOLLARS", "-"));
                    else
                    {
                        dollars = (dollars / 1000);
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_DOLLARS", "$" + dollars.ToString("0") + "k"));
                    }



                    List<IdeasAndInnovationsData> ratings = customer.Where(x => x.AUTOMATIONS).ToList();

                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_AUTOMATIONS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_AUTOMATIONS", ratings.Count.ToString()));
                    }

                    ratings = customer.Where(x => x.INNOVATIONS).ToList();

                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_INNOVATIONS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_INNOVATIONS", ratings.Count.ToString()));
                    }

                    ratings = customer.Where(x => x.IMPROVEMENTS).ToList();

                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_IMPROVEMENTS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "IDEAS_IMPROVEMENTS", ratings.Count.ToString()));
                    }
                }

                //-------------------Get Ideas count by Portfolio Level---------------------------

                var groupByPortfolio = overall.GroupBy(x => x.PORTFOLIO_ID);

                foreach (var portfolio in groupByPortfolio)
                {
                    string CUST_ID = overall.Where(t => t.PORTFOLIO_ID == portfolio.Key).FirstOrDefault().CUSTOMER_ID;
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS", portfolio.ToList().Count.ToString()));


                    int completed = portfolio.Where(t => t.STATUS != null && t.STATUS.ToLower() == "completed").ToList().Count();
                    if (completed == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_COMPLETED", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_COMPLETED", completed.ToString()));

                    //Total In Progress
                    int inprogress = portfolio.Where(t => t.STATUS != null && t.STATUS.ToLower() != "completed").ToList().Count();
                    if (inprogress == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_INPROGRESS", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_INPROGRESS", inprogress.ToString()));


                    //Total minuteshours
                    decimal hours = portfolio.Where(t => t.EFFORTS_SAVED_PERSON_HOUR != null).Select(t => t.EFFORTS_SAVED_PERSON_HOUR.Value).Sum();
                    if (hours == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_HOURS", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_HOURS", hours.ToString("0") + " hrs"));

                    //Total dollars
                    decimal dollars = portfolio.Where(t => t.DOLLARS != null).Select(t => t.DOLLARS.Value).Sum();
                    if (dollars == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_DOLLARS", "-"));
                    else
                    {
                        dollars = (dollars / 1000);
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "IDEAS_DOLLARS", "$" + dollars.ToString("0") + "k"));
                    }



                    List<IdeasAndInnovationsData> ratings = portfolio.Where(x => x.AUTOMATIONS).ToList();
                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUSTOMER_ID, null, portfolio.Key, "IDEAS_AUTOMATIONS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUSTOMER_ID, null, portfolio.Key, "IDEAS_AUTOMATIONS", ratings.Count.ToString()));
                    }

                    ratings = portfolio.Where(x => x.INNOVATIONS).ToList();

                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUSTOMER_ID, null, portfolio.Key, "IDEAS_INNOVATIONS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUSTOMER_ID, null, portfolio.Key, "IDEAS_INNOVATIONS", ratings.Count.ToString()));
                    }

                    ratings = portfolio.Where(x => x.IMPROVEMENTS).ToList();

                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUSTOMER_ID, null, portfolio.Key, "IDEAS_IMPROVEMENTS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(overall[0].CUSTOMER_ID, null, portfolio.Key, "IDEAS_IMPROVEMENTS", ratings.Count.ToString()));
                    }
                }

                //---------------------- Get ideas by project level ------------------------------------------------------------------//

                var groupByProject = overall.GroupBy(x => x.PROJECT_ID);
                foreach (var proj in groupByProject)
                {
                    string CUST_ID = overall.Where(x => x.PROJECT_ID == proj.Key).Select(x => x.CUSTOMER_ID).FirstOrDefault();

                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS", proj.ToList().Count.ToString()));

                    int completed = proj.Where(t => t.STATUS != null && t.STATUS.ToLower() == "completed").ToList().Count();
                    if (completed == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_COMPLETED", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_COMPLETED", completed.ToString()));

                    //Total In Progress
                    int inprogress = proj.Where(t => t.STATUS != null && t.STATUS.ToLower() != "completed").ToList().Count();
                    if (inprogress == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_INPROGRESS", "-"));
                    else
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_INPROGRESS", inprogress.ToString()));


                    //Total minuteshours
                    decimal hours = proj.Where(t => t.EFFORTS_SAVED_PERSON_HOUR != null).Select(t => t.EFFORTS_SAVED_PERSON_HOUR.Value).Sum();
                    if (hours == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_HOURS", "-"));
                    else

                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_HOURS", hours.ToString("0") + " hrs"));

                    //Total dollars
                    decimal dollars = proj.Where(t => t.DOLLARS != null).Select(t => t.DOLLARS.Value).Sum();
                    if (dollars == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_DOLLARS", "-"));
                    else
                    {
                        dollars = (dollars / 1000);
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_DOLLARS", "$" + dollars.ToString("0") + "k"));
                    }



                    List<IdeasAndInnovationsData> ratings = proj.Where(x => x.AUTOMATIONS).ToList();
                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_AUTOMATIONS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_AUTOMATIONS", ratings.Count.ToString()));
                    }

                    ratings = proj.Where(x => x.INNOVATIONS).ToList();

                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_INNOVATIONS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_INNOVATIONS", ratings.Count.ToString()));
                    }

                    ratings = proj.Where(x => x.IMPROVEMENTS).ToList();

                    if (ratings.Count == 0)
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_IMPROVEMENTS", "-"));
                    else
                    {
                        newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, proj.Key, null, "IDEAS_IMPROVEMENTS", ratings.Count.ToString()));
                    }
                }

            }
            DeleteDashboardDetails("IDEAS");
            InsertDashboardDetails(newDashboardDetails);
        }
        private void LoadCrispCategoryRAGSummary()
        {
            List<CRISP_CATEGORY_RAG_SUMMARY> overall = CSPdb.AppRepo.getCrispCategoryRagSummary().ToList();
            //Customer
            var groupbyCustomer = overall.GroupBy(t => t.CUST_ID);
            foreach (var customer in groupbyCustomer)
            {
                UpdateDashboardCrispCategoryRAGSummary(customer.Key, customer.ToList(), 1, 30, "CRISP_C");
                UpdateDashboardCrispCategoryRAGSummary(customer.Key, customer.ToList(), 2, 15, "CRISP_R");
                UpdateDashboardCrispCategoryRAGSummary(customer.Key, customer.ToList(), 3, 20, "CRISP_I");
                UpdateDashboardCrispCategoryRAGSummary(customer.Key, customer.ToList(), 4, 20, "CRISP_S");
                UpdateDashboardCrispCategoryRAGSummary(customer.Key, customer.ToList(), 5, 15, "CRISP_P");

            }
        }
        private void UpdateDashboardCrispCategoryRAGSummary(string CustomerId, List<CRISP_CATEGORY_RAG_SUMMARY> ratings, int CategoryId, int target, string title)
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<CRISP_CATEGORY_RAG_SUMMARY> cats = ratings.Where(t => t.CATEGORY_ID == CategoryId).ToList();
            if (ratings.Count == 0)
                newDashboardDetails.Add(GetNewDashboardDetails(CustomerId, null, null, title, "-"));
            else
            {
                decimal sum = cats.Select(t => t.SCORE).Sum();
                decimal count = cats.Count * target;
                string percent = GetPercentage(sum, count, "0");
                string rag = GetRagFromScore(percent);
                newDashboardDetails.Add(GetNewDashboardDetails(CustomerId, null, null, title, percent, rag));
            }
            DeleteDashboardDetails(title);
            InsertDashboardDetails(newDashboardDetails);

        }
        private void LoadCrispRAGSummary()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();

            int currentMonth = DateTime.Now.Month;
            int currentYear = DateTime.Now.Year;
            DateTime selectedDate = new DateTime(currentYear, currentMonth, 01);

            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            DateTime date1 = range.StartDate;
            DateTime date2 = range.EndDate;

            List<CRISP_RAG_SUMMARY> filteredList = CSPdb.AppRepo.dashboard_getCrispRagSummary(date1, date2).ToList();
            //  List<CRISP_RAG_SUMMARY> filteredList = overall.Where(x => x.PUBLISHED_DATE >= date1 && x.PUBLISHED_DATE < date2).ToList();

            //Customer
            var groupbyCustomer = filteredList.GroupBy(t => t.CUST_ID);
            foreach (var customer in groupbyCustomer)
            {
                var counts = customer.GroupBy(t => t.VALUE).Select(group => new
                {
                    RAG = group.Key,
                    TOTAL = group.Count()
                }).ToList();


                string color = "RED";
                int greenCount = counts.Count(x => x.RAG == "H");
                int totalCount = customer.ToList().Count();

                var percent = totalCount > 0 ? Math.Round((Convert.ToDecimal(greenCount) / Convert.ToDecimal(totalCount)) * 100, 0) : 0;

                if (percent >= 98)
                    color = "#3ab276";
                else if (percent >= 90)
                    color = "ORANGE";

                newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "OVERALL_HEALTH", percent.ToString("0.#") + "%", color));
            }


            //Portfolio
            var groupbyPortfolio = filteredList.Where(t => t.PORTFOLIO_ID != null)
                .GroupBy(t => t.PORTFOLIO_ID);
            //Portfolio overall
            foreach (var portfolio in groupbyPortfolio)
            {
                string CUST_ID = filteredList.Where(t => t.PORTFOLIO_ID == portfolio.Key).FirstOrDefault().CUST_ID;
                var counts = portfolio.GroupBy(t => t.VALUE).Select(group => new
                {
                    RAG = group.Key,
                    TOTAL = group.Count()
                }).ToList();

                //counts = counts.OrderByDescending(t => t.TOTAL).ToList();
                //string color = "#3ab276";

                //if (counts[0].RAG == "H")
                //    color = "RED";
                //else if (counts[0].RAG == "A")
                //    color = "ORANGE";
                //else if (counts[0].RAG == "L")
                //    color = "#3ab276";
                //string percent = "0%";
                //decimal totalCrispScore = portfolio.Select(t => t.SCORE).Sum();
                //if (totalCrispScore > 0)
                //    totalCrispScore = totalCrispScore / 100;


                string color = "RED";
                int greenCount = counts.Where(x => x.RAG == "L").Select(x => x.TOTAL).FirstOrDefault();
                int totalCount = portfolio.ToList().Count();

                var percent = totalCount > 0 ? Math.Round((Convert.ToDecimal(greenCount) / Convert.ToDecimal(totalCount)) * 100, 0) : 0;

                if (percent >= 98)
                    color = "#3ab276";
                else if (percent >= 90)
                    color = "ORANGE";


                newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "OVERALL_HEALTH", percent.ToString("0.#") + "%", color));
            }

            foreach (var portfolio in groupbyPortfolio)
            {
                string CUST_ID = filteredList.Where(t => t.PORTFOLIO_ID == portfolio.Key).FirstOrDefault().CUST_ID;
                //H
                List<CRISP_RAG_SUMMARY> ratings = portfolio.Where(t => t.VALUE == "H").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_H", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_H", ratings.Count.ToString()));
                }
                //M
                ratings = portfolio.Where(t => t.VALUE == "M").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_M", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_M", ratings.Count.ToString()));
                }
                //L
                ratings = portfolio.Where(t => t.VALUE == "L").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_L", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_L", ratings.Count.ToString()));
                }
            }
            //High Medium Low Count
            foreach (var portfolio in groupbyPortfolio)
            {
                string CUST_ID = filteredList.Where(t => t.PORTFOLIO_ID == portfolio.Key).FirstOrDefault().CUST_ID;
                //H
                List<CRISP_RAG_SUMMARY> ratings = portfolio.Where(t => t.VALUE == "H").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_H", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_H", ratings.Count.ToString()));
                }
                //M
                ratings = portfolio.Where(t => t.VALUE == "M").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_M", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_M", ratings.Count.ToString()));
                }
                //L
                ratings = portfolio.Where(t => t.VALUE == "L").ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_L", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.Key, "PROJECT_HEALTH_L", ratings.Count.ToString()));
                }
            }
            DeleteDashboardDetails("OVERALL");
            DeleteDashboardDetails("PROJECT_HEALTH");
            InsertDashboardDetails(newDashboardDetails);
        }


        [GET("LoadOverAllIssuesData")]
        [ActionName("LoadOverAllIssuesData")]
        [HttpGet]
        private void LoadOverAllIssuesData()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<OverAllData> Overall = CSPdb.AppRepo.GetOverAllIssuesData();

            // ----------------------------- Group By Customer -------------------------------------//

            if (Overall != null)
            {
                var groupByCustomer = Overall.GroupBy(x => x.CUST_ID);

                foreach (var customer in groupByCustomer)
                {
                    var filteredList = customer.Where(x => x.STATUS_TYPE == "ISSUES_PAST_DUE_DATE" || x.STATUS_TYPE == "ISSUES_DUE_FOR_CLOSURE").ToList();

                    int pastdueIssues = customer.Where(x => x.STATUS_TYPE == "ISSUES_PAST_DUE_DATE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUES_PAST_DUE_DATE", pastdueIssues.ToString()));

                    int dueforClosureIssues = customer.Where(x => x.STATUS_TYPE == "ISSUES_DUE_FOR_CLOSURE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUES_DUE_FOR_CLOSURE", dueforClosureIssues.ToString()));

                    int totalIssues = pastdueIssues + dueforClosureIssues;

                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUES_TOTAL", totalIssues.ToString()));

                    int highIssues = filteredList.Where(x => x.SEVERITY == "High").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUES_HIGH", highIssues.ToString()));

                    int mediumIssues = filteredList.Where(x => x.SEVERITY == "Medium").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUES_MEDIUM", mediumIssues.ToString()));

                    int lowIssues = filteredList.Where(x => x.SEVERITY == "Low").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "ISSUES_LOW", lowIssues.ToString()));
                }
            }

            // ----------------------------- Group By Portfolio -------------------------------------//

            if (Overall != null)
            {
                var groupByPortfolio = Overall.GroupBy(x => x.PORTFOLIO_ID);

                foreach (var portfolio in groupByPortfolio)
                {
                    if (portfolio.Key != null)
                    {
                        var filteredList = portfolio.Where(x => x.STATUS_TYPE == "ISSUES_PAST_DUE_DATE" || x.STATUS_TYPE == "ISSUES_DUE_FOR_CLOSURE").ToList();

                        int pastdueIssues = portfolio.Where(x => x.STATUS_TYPE == "ISSUES_PAST_DUE_DATE").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ISSUES_PAST_DUE_DATE", pastdueIssues.ToString()));

                        int dueforClosureIssues = portfolio.Where(x => x.STATUS_TYPE == "ISSUES_DUE_FOR_CLOSURE").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ISSUES_DUE_FOR_CLOSURE", dueforClosureIssues.ToString()));

                        int totalIssues = pastdueIssues + dueforClosureIssues;

                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ISSUES_TOTAL", totalIssues.ToString()));

                        int highIssues = filteredList.Where(x => x.SEVERITY == "High" || x.SEVERITY.ToLower() == "showstopper/critical").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ISSUES_HIGH", highIssues.ToString()));

                        int mediumIssues = filteredList.Where(x => x.SEVERITY == "Medium").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ISSUES_MEDIUM", mediumIssues.ToString()));

                        int lowIssues = filteredList.Where(x => x.SEVERITY == "Low").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "ISSUES_LOW", lowIssues.ToString()));
                    }
                }
            }

            // ----------------------------- Group By Project -------------------------------------//

            if (Overall != null)
            {
                var groupByProject = Overall.GroupBy(x => x.PROJ_ID);

                foreach (var proj in groupByProject)
                {
                    var filteredList = proj.Where(x => x.STATUS_TYPE == "ISSUES_PAST_DUE_DATE" || x.STATUS_TYPE == "ISSUES_DUE_FOR_CLOSURE").ToList();

                    int pastdueIssues = proj.Where(x => x.STATUS_TYPE == "ISSUES_PAST_DUE_DATE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "ISSUES_PAST_DUE_DATE", pastdueIssues.ToString()));

                    int dueforClosureIssues = proj.Where(x => x.STATUS_TYPE == "ISSUES_DUE_FOR_CLOSURE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "ISSUES_DUE_FOR_CLOSURE", dueforClosureIssues.ToString()));

                    int totalIssues = pastdueIssues + dueforClosureIssues;

                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "ISSUES_TOTAL", totalIssues.ToString()));

                    int highIssues = filteredList.Where(x => x.SEVERITY == "High").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "ISSUES_HIGH", highIssues.ToString()));

                    int mediumIssues = filteredList.Where(x => x.SEVERITY == "Medium").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "ISSUES_MEDIUM", mediumIssues.ToString()));

                    int lowIssues = filteredList.Where(x => x.SEVERITY == "Low").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "ISSUES_LOW", lowIssues.ToString()));
                }
            }

            DeleteDashboardDetails("ISSUES");
            InsertDashboardDetails(newDashboardDetails);
        }

        [GET("LoadOverAllRisksData")]
        [ActionName("LoadOverAllRisksData")]
        [HttpGet]
        public void LoadOverAllRisksData()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<OverAllData> Overall = CSPdb.AppRepo.GetOverAllRisksData();

            // ----------------------------- Group By Customer -------------------------------------//

            if (Overall != null)
            {
                var groupByCustomer = Overall.GroupBy(x => x.CUST_ID);

                foreach (var customer in groupByCustomer)
                {
                    var filteredList = customer.Where(x => x.STATUS_TYPE == "RISKS_PAST_DUE_DATE" || x.STATUS_TYPE == "RISKS_DUE_FOR_CLOSURE").ToList();

                    int pastdueIssues = customer.Where(x => x.STATUS_TYPE == "RISKS_PAST_DUE_DATE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISKS_PAST_DUE_DATE", pastdueIssues.ToString()));

                    int dueforClosureIssues = customer.Where(x => x.STATUS_TYPE == "RISKS_DUE_FOR_CLOSURE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISKS_DUE_FOR_CLOSURE", dueforClosureIssues.ToString()));

                    int totalIssues = pastdueIssues + dueforClosureIssues;

                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISKS_TOTAL", totalIssues.ToString()));

                    int highIssues = filteredList.Where(x => x.SEVERITY == "H").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISKS_HIGH", highIssues.ToString()));

                    int mediumIssues = filteredList.Where(x => x.SEVERITY == "M").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISKS_MEDIUM", mediumIssues.ToString()));

                    int lowIssues = filteredList.Where(x => x.SEVERITY == "L").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.Key, null, null, "RISKS_LOW", lowIssues.ToString()));
                }
            }

            // ----------------------------- Group By Portfolio -------------------------------------//

            if (Overall != null)
            {
                var groupByPortfolio = Overall.GroupBy(x => x.PORTFOLIO_ID);

                foreach (var portfolio in groupByPortfolio)
                {
                    if (portfolio.Key != null)
                    {
                        var filteredList = portfolio.Where(x => x.STATUS_TYPE == "RISKS_PAST_DUE_DATE" || x.STATUS_TYPE == "RISKS_DUE_FOR_CLOSURE").ToList();

                        int pastdueIssues = portfolio.Where(x => x.STATUS_TYPE == "RISKS_PAST_DUE_DATE").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "RISKS_PAST_DUE_DATE", pastdueIssues.ToString()));

                        int dueforClosureIssues = portfolio.Where(x => x.STATUS_TYPE == "RISKS_DUE_FOR_CLOSURE").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "RISKS_DUE_FOR_CLOSURE", dueforClosureIssues.ToString()));

                        int totalIssues = pastdueIssues + dueforClosureIssues;

                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "RISKS_TOTAL", totalIssues.ToString()));

                        int highIssues = filteredList.Where(x => x.SEVERITY == "H").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "RISKS_HIGH", highIssues.ToString()));

                        int mediumIssues = filteredList.Where(x => x.SEVERITY == "M").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "RISKS_MEDIUM", mediumIssues.ToString()));

                        int lowIssues = filteredList.Where(x => x.SEVERITY == "L").Count();
                        newDashboardDetails.Add(GetNewDashboardDetails(portfolio.ToList()[0].CUST_ID, null, portfolio.Key, "RISKS_LOW", lowIssues.ToString()));
                    }
                }
            }

            // ----------------------------- Group By Project -------------------------------------//

            if (Overall != null)
            {
                var groupByProject = Overall.GroupBy(x => x.PROJ_ID);

                foreach (var proj in groupByProject)
                {
                    var filteredList = proj.Where(x => x.STATUS_TYPE == "RISKS_PAST_DUE_DATE" || x.STATUS_TYPE == "RISKS_DUE_FOR_CLOSURE").ToList();

                    int pastdueIssues = proj.Where(x => x.STATUS_TYPE == "RISKS_PAST_DUE_DATE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "RISKS_PAST_DUE_DATE", pastdueIssues.ToString()));

                    int dueforClosureIssues = proj.Where(x => x.STATUS_TYPE == "RISKS_DUE_FOR_CLOSURE").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "RISKS_DUE_FOR_CLOSURE", dueforClosureIssues.ToString()));

                    int totalIssues = pastdueIssues + dueforClosureIssues;

                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "RISKS_TOTAL", totalIssues.ToString()));

                    int highIssues = filteredList.Where(x => x.SEVERITY == "H").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "RISKS_HIGH", highIssues.ToString()));

                    int mediumIssues = filteredList.Where(x => x.SEVERITY == "M").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "RISKS_MEDIUM", mediumIssues.ToString()));

                    int lowIssues = filteredList.Where(x => x.SEVERITY == "L").Count();
                    newDashboardDetails.Add(GetNewDashboardDetails(proj.ToList()[0].CUST_ID, proj.Key, null, "RISKS_LOW", lowIssues.ToString()));
                }
            }

            DeleteDashboardDetails("RISKS");
            InsertDashboardDetails(newDashboardDetails);
        }

        private void LoadCustomerSuccesSurveyForCustomer()
        {
            List<DASHBOARD_DETAILS> newDashboardDetails = new List<DASHBOARD_DETAILS>();
            List<CSAT_INITIATED_SUMMARY> SurveysSent = CSPdb.AppRepo.getCSSInitiatedSummary().ToList();
            List<CSAT_RECEIVED_SUMMARY> summary = CSPdb.AppRepo.getCSSReceivedSummary().ToList();
            //Customer
            var groupbyCustomer = SurveysSent
                .GroupBy(t => t.CUST_ID)
                .Select(group => new
                {
                    CUST_ID = group.Key,
                    TOTAL = group.Count()
                });
            foreach (var customer in groupbyCustomer)
            {
                List<CSAT_RECEIVED_SUMMARY> custRatings = summary.Where(t => t.CUST_ID == customer.CUST_ID).ToList();

                //2 and below
                List<CSAT_RECEIVED_SUMMARY> ratings = custRatings.Where(t => t.RATING <= 2).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_1_2", "-"));
                else
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_1_2", GetPercentage(ratings.Count, customer.TOTAL, "0")));
                //Rating 3
                ratings = custRatings.Where(t => t.RATING == 3).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_3", "-"));
                else
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_3", GetPercentage(ratings.Count, customer.TOTAL, "0")));

                //Rating 4
                ratings = custRatings.Where(t => t.RATING == 4).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_4", "-"));
                else
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_4", GetPercentage(ratings.Count, customer.TOTAL, "0")));
                //Rating 5
                ratings = custRatings.Where(t => t.RATING == 5).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_5", "-"));
                else
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_5", GetPercentage(ratings.Count, customer.TOTAL, "0")));
                //Rating 0
                if (customer.TOTAL == custRatings.Count)
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_0", "-"));
                else
                    newDashboardDetails.Add(GetNewDashboardDetails(customer.CUST_ID, null, null, "CSS_0", GetPercentage(customer.TOTAL - custRatings.Count, customer.TOTAL, "0")));
            }


            //Portfolio
            var groupbyPortfolio = SurveysSent.Where(t => t.PORTFOLIO_ID != null)
                .GroupBy(t => t.PORTFOLIO_ID)
                .Select(group => new
                {
                    PORTFOLIO_ID = group.Key,
                    TOTAL = group.Count()
                });
            foreach (var portfolio in groupbyPortfolio)
            {
                string CUST_ID = SurveysSent.Where(t => t.PORTFOLIO_ID == portfolio.PORTFOLIO_ID.Value).FirstOrDefault().CUST_ID;
                List<CSAT_RECEIVED_SUMMARY> custRatings = summary.Where(t => t.PORTFOLIO_ID == portfolio.PORTFOLIO_ID).ToList();

                //2 and below
                List<CSAT_RECEIVED_SUMMARY> ratings = custRatings.Where(t => t.RATING <= 2).ToList();
                if (ratings.Count == 0)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_1_2", "-"));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_1_2", "-"));
                }
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_1_2", GetPercentageString(ratings.Count, portfolio.TOTAL)));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_1_2", ratings.Count().ToString()));
                }
                //Rating 3
                ratings = custRatings.Where(t => t.RATING == 3).ToList();
                if (ratings.Count == 0)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_3", "-"));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_3", "-"));
                }

                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_3", GetPercentageString(ratings.Count, portfolio.TOTAL)));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_3", ratings.Count().ToString()));
                }
                //Rating 4
                ratings = custRatings.Where(t => t.RATING == 4).ToList();
                if (ratings.Count == 0)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_4", "-"));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_4", "-"));
                }

                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_4", ratings.Count().ToString()));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_4", GetPercentageString(ratings.Count, portfolio.TOTAL)));
                }
                //Rating 5
                ratings = custRatings.Where(t => t.RATING == 5).ToList();
                if (ratings.Count == 0)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_5", "-"));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_5", "-"));
                }
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_5", ratings.Count().ToString()));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_5", GetPercentageString(ratings.Count, portfolio.TOTAL)));
                }
                //Rating 0
                if (portfolio.TOTAL == custRatings.Count)
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_0", "-"));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_0", "-"));
                }

                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_0", GetPercentageString(portfolio.TOTAL - custRatings.Count, portfolio.TOTAL)));
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, null, portfolio.PORTFOLIO_ID.Value, "CSS_P_0", (portfolio.TOTAL - custRatings.Count).ToString()));
                }

            }

            //Project
            var groupbyProject = SurveysSent
                .GroupBy(t => t.PROJ_ID)
                .Select(group => new
                {
                    PROJ_ID = group.Key,
                    TOTAL = group.Count()
                });
            foreach (var project in groupbyProject)
            {
                string CUST_ID = SurveysSent.Where(t => t.PROJ_ID == project.PROJ_ID).FirstOrDefault().CUST_ID;
                List<CSAT_RECEIVED_SUMMARY> custRatings = summary.Where(t => t.PROJ_ID == project.PROJ_ID).ToList();

                //2 and below
                List<CSAT_RECEIVED_SUMMARY> ratings = custRatings.Where(t => t.RATING <= 2).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_1_2", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_1_2", GetPercentageString(ratings.Count, project.TOTAL)));
                }
                //Rating 3
                ratings = custRatings.Where(t => t.RATING == 3).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_3", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_3", GetPercentageString(ratings.Count, project.TOTAL)));
                }
                //Rating 4
                ratings = custRatings.Where(t => t.RATING == 4).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_4", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_4", GetPercentageString(ratings.Count, project.TOTAL)));
                }
                //Rating 5
                ratings = custRatings.Where(t => t.RATING == 5).ToList();
                if (ratings.Count == 0)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_5", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_5", GetPercentageString(ratings.Count, project.TOTAL)));
                }
                //Rating 0
                if (project.TOTAL == custRatings.Count)
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_0", "-"));
                else
                {
                    newDashboardDetails.Add(GetNewDashboardDetails(CUST_ID, project.PROJ_ID, null, "CSS_0", GetPercentageString(project.TOTAL - custRatings.Count, project.TOTAL)));
                }
            }
            //log = new Logger(this.Request, DateTime.Now.ToLongTimeString());
            DeleteDashboardDetails("CSS");
            InsertDashboardDetails(newDashboardDetails);
            //log = new Logger(this.Request, DateTime.Now.ToLongTimeString());
        }
        private void InsertDashboardDetails(List<DASHBOARD_DETAILS> newDashboardDetails)
        {
            if (newDashboardDetails.Count > 0)
                CSPdb.AppRepo.Insert_DASHBOARD_DETAILS(ToDataTable(newDashboardDetails));
        }
        private void DeleteDashboardDetails(string startsWidh)
        {
            List<DASHBOARD_DETAILS> oldEntries = CSPdb.DASHBOARD_DETAILS.GetAll().Where(t => t.TITLE.StartsWith(startsWidh)).ToList();
            if (oldEntries.Count > 0)
                CSPdb.AppRepo.Delete_DASHBOARD_DETAILS(ToDataTable(oldEntries));
        }
        private DASHBOARD_DETAILS GetNewDashboardDetails(string CustomerId, string ProjectId, int? PortfolioId, string Title, string Content, string color = "grey")
        {
            DASHBOARD_DETAILS newDD = new DASHBOARD_DETAILS();
            newDD.TITLE = Title;
            newDD.CONTENT = Content;
            newDD.COLOR = color;
            newDD.CUST_ID = CustomerId;
            newDD.PROJ_ID = ProjectId;
            if (PortfolioId == null)
                newDD.PORTFOLIO_ID = null;
            else
                newDD.PORTFOLIO_ID = PortfolioId.Value;
            return newDD;
        }
        //private void newDashboardDetails.Add(GetNewDashboardDetails(string CustomerId, string ProjectId, int? PortfolioId, string Title, string Content, string color = "grey")
        //{
        //    DASHBOARD_DETAILS DD = new DASHBOARD_DETAILS();
        //    if (ProjectId == null && PortfolioId == null)
        //        DD = CSPdb.DASHBOARD_DETAILS.GetAll().Where(t => t.CUST_ID == CustomerId && t.TITLE == Title).FirstOrDefault();
        //    else if (ProjectId != null)
        //        DD = CSPdb.DASHBOARD_DETAILS.GetAll().Where(t => t.CUST_ID == CustomerId && t.PROJ_ID == ProjectId && t.TITLE == Title).FirstOrDefault();
        //    else if (PortfolioId != null)
        //        DD = CSPdb.DASHBOARD_DETAILS.GetAll().Where(t => t.CUST_ID == CustomerId && t.PORTFOLIO_ID == PortfolioId.Value && t.TITLE == Title).FirstOrDefault();

        //    if (DD != null)
        //    {
        //        DD.CONTENT = Content;
        //        DD.COLOR = color;
        //        CSPdb.DASHBOARD_DETAILS.Update(DD);
        //        CSPdb.Commit(CanCommit);
        //    }
        //    else
        //    {
        //        DASHBOARD_DETAILS newDD = new DASHBOARD_DETAILS();
        //        newDD.TITLE = Title;
        //        newDD.CONTENT = Content;
        //        newDD.COLOR = color;
        //        newDD.CUST_ID = CustomerId;
        //        newDD.PROJ_ID = ProjectId;
        //        if (PortfolioId == null)
        //            newDD.PORTFOLIO_ID = null;
        //        else
        //            newDD.PORTFOLIO_ID = PortfolioId.Value;
        //        CSPdb.DASHBOARD_DETAILS.Add(newDD);
        //        CSPdb.Commit(CanCommit);
        //    }
        //}
        private string GetPercentageString(int a, int b)
        {
            string percent = "%";
            percent = ((Convert.ToDecimal(a) / Convert.ToDecimal(b)) * 100).ToString("0.#");
            if (percent.Contains("."))
                percent = percent.Split('.')[0];
            percent = percent + "%";
            return percent;
        }
        private string GetPercentage(int a, int b, string format = "0.#")
        {
            string percent = ((Convert.ToDecimal(a) / Convert.ToDecimal(b)) * 100).ToString(format);
            return percent;
        }
        private string GetPercentage(decimal a, decimal b, string format = "0.#")
        {
            string percent = ((a / b) * 100).ToString(format);
            return percent;
        }
        private string GetPercentageString_Decimal(decimal a, decimal b, string format = "0.#")
        {
            string percent = "%";
            percent = ((a / b) * 100).ToString(format);
            percent = percent + "%";
            return percent;
        }
        private string GetPercentageString_OneDecimal(int a, int b)
        {
            string percent = "%";
            percent = ((Convert.ToDecimal(a) / Convert.ToDecimal(b)) * 100).ToString("0.#");
            percent = percent + "%";
            return percent;
        }

        [GET("GetAllProjectCertificationScopes")]
        [ActionName("GetAllProjectCertificationScopes")]
        [HttpGet]
        public IHttpActionResult GetAllProjectCertificationScopes()
        {
            var projectCertificationScopeList = Cldb.AppRepo.GetProjectCertificationScopes().ToList();
            var certificationScopeList = projectCertificationScopeList.GroupBy(x => x.ISO_STANDARD_ID).Select(group => new
            {
                ISO_STANDARD_ID = group.Key,
                STANDARD_NAME = group.First().STANDARD_NAME,
                Items = group.ToList()
            }).OrderBy(x => x.STANDARD_NAME).ToList();

            return Ok(certificationScopeList);
        }

        [GET("GetProjectInputDetails")]
        [ActionName("GetProjectInputDetails")]
        [HttpGet]
        public IHttpActionResult GetProjectInputDetails()
        {
            var projectInputs = new ProjectInputHolder();

            projectInputs.QAList = Cldb.EMP_INFO.GetAll().Where(t => t.DOR == null && t.CSM_TITLE_ID == 7).OrderBy(t => t.FRST_NM).ToList();
            projectInputs.CertificationScopeList = Cldb.PROJECT_CERTIFICATION_SCOPE.GetAll().Where(x => x.ISACTIVE).OrderBy(x => x.SCOPE_NAME).ToList();
            projectInputs.IsoStandardList = Cldb.PROJECT_ISO_STANDARD.GetAll().Where(x => x.ISACTIVE).OrderBy(x => x.STANDARD_NAME).ToList();

            return Ok(projectInputs);
        }

        [GET("GetProjectHeadsByID")]
        [ActionName("GetProjectHeadsByID")]
        [HttpGet]
        public IHttpActionResult GetProjectHeadsByID(string projectId)
        {
            var projectPeople = Cldb.AppRepo.GetProjectMembersByProject(projectId);
            return Ok(projectPeople);
        }

        [POST("UpdateProjectDetails")]
        [ActionName("UpdateProjectDetails")]
        [HttpPost]
        public IHttpActionResult UpdateProjectDetails([FromBody] ProjectInputDetails projectDetails)
        {
            CheckAccessForFeature(97);

            var selectedProject = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectDetails.PROJECT_ID);
            if (selectedProject == null)
            {
                return Content(HttpStatusCode.Conflict, "Selected project does not exist");
            }

            var empId = GetHeaderDetails_String("empId");
            var projects = GetProjectListForUser(empId);
            if (!projects.Any(x => x.PROJ_ID == projectDetails.PROJECT_ID))
            {
                return Content(HttpStatusCode.Conflict, $"You do not have access to project {selectedProject.PROJ_ALIAS_NM ?? selectedProject.PROJ_NM}. So unable to perform the operation.");
            }

            //Update QASpoc
            if (!string.IsNullOrEmpty(projectDetails.QA_SPOC) || !string.IsNullOrEmpty(projectDetails.GOVERNANCE_APPLICABILITY))
            {
                if (!string.IsNullOrEmpty(projectDetails.QA_SPOC))
                    selectedProject.QUALITY_SPOC = projectDetails.QA_SPOC;

                if (!string.IsNullOrEmpty(projectDetails.GOVERNANCE_APPLICABILITY))
                    selectedProject.GOVERNANCE_APPLICABILITY = projectDetails.GOVERNANCE_APPLICABILITY;

                selectedProject.UPDATED_DATE = DateTime.Today;
                selectedProject.UPDATED_BY = empId.ToString();
                Cldb.PROJECT.Update(selectedProject);
            }


            //Update Certification Scope
            var existingScopes = Cldb.PROJECT_CERTIFICATION_SCOPE_MAPPING.GetAll().Where(x => x.PROJECT_ID == projectDetails.PROJECT_ID && x.ISACTIVE).ToList();
            foreach (var item in existingScopes)
            {
                item.ISACTIVE = false;
            }
            foreach (var item in projectDetails.CERTIFICATION_SCOPE)
            {
                var existing = existingScopes.FirstOrDefault(x => x.CERTIFICATION_SCOPE_ID == item);
                if (existing != null)
                {
                    UpdateAuditFields(existing);
                }
                else
                {
                    var scopeReference = new PROJECT_CERTIFICATION_SCOPE_MAPPING
                    {
                        PROJECT_ID = projectDetails.PROJECT_ID,
                        CERTIFICATION_SCOPE_ID = item
                    };
                    UpdateAuditFields(scopeReference);
                    Cldb.PROJECT_CERTIFICATION_SCOPE_MAPPING.Add(scopeReference);
                }
            }
            foreach (var item in existingScopes)
            {
                Cldb.PROJECT_CERTIFICATION_SCOPE_MAPPING.Update(item);
            }


            //Update ISO Standard
            var existingStandards = Cldb.PROJECT_ISO_STANDARD_MAPPING.GetAll().Where(x => x.PROJECT_ID == projectDetails.PROJECT_ID && x.ISACTIVE).ToList();
            foreach (var item in existingStandards)
            {
                item.ISACTIVE = false;
            }
            foreach (var item in projectDetails.ISO_STANDARD)
            {
                var existing = existingStandards.FirstOrDefault(x => x.ISO_STANDARD_ID == item);
                if (existing != null)
                {
                    UpdateAuditFields(existing);
                }
                else
                {
                    var isoReference = new PROJECT_ISO_STANDARD_MAPPING
                    {
                        PROJECT_ID = projectDetails.PROJECT_ID,
                        ISO_STANDARD_ID = item
                    };
                    UpdateAuditFields(isoReference);
                    Cldb.PROJECT_ISO_STANDARD_MAPPING.Add(isoReference);
                }
            }
            foreach (var item in existingStandards)
            {
                Cldb.PROJECT_ISO_STANDARD_MAPPING.Update(item);
            }


            Cldb.Commit(CanCommit);
            SendMailForQspocChange(selectedProject);
            return Ok();
        }

        [GET("GetProjectCAPACount")]
        [ActionName("GetProjectCAPACount")]
        [HttpGet]
        public IHttpActionResult GetProjectCAPACount(string customerId, string month, int year)
        {

            int monthNumber = DateTime.ParseExact(month, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(year, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            DateTime startDate = range.StartDate;
            DateTime endDate = range.EndDate;

            var projectCAPACount = CSPdb.AppRepo.GetProjectCAPACount(customerId, startDate, endDate).ToList();
            return Ok(projectCAPACount);
        }

        private void SendMailForQspocChange(PROJECT selectedProject)
        {
            var empId = GetHeaderDetails_String("empId");
            var csmMails = helper.GetCSMMailsFromProject(selectedProject);
            var pmMails = helper.GetPMMailsFromProject(selectedProject);
            var pexMail = helper.GetDBConfig("PROCESS_EXCELLENCE_TEAM_MAIL", "-1");
            var ccMail = helper.ConcatEmails(new List<string>() { pmMails, csmMails, pexMail });

            var toMail = helper.GetQualitySpocMailForProject(selectedProject);
            var emailContentValues = new Dictionary<string, string>();
            var projectPeople = Cldb.AppRepo.GetProjectMembersByProject(selectedProject.PROJ_ID);
            var updatedBy = Cldb.EMP_INFO.GetAll().FirstOrDefault(e => e.EMP_ID == empId)?.FRST_NM;

            var subject = $"{selectedProject.PROJ_NM} - Project Record update";
            emailContentValues.Add("PROJECT_NAME", selectedProject.PROJ_NM);
            emailContentValues.Add("QUALITY_SPOC", projectPeople.QSPOC_NAME);
            emailContentValues.Add("CERTIFICATION_SCOPES_NAME", projectPeople.CERTIFICATION_SCOPES_NAME);
            emailContentValues.Add("GOVERNANCE_APPLICABILITY", projectPeople.GOVERNANCE_APPLICABILITY);
            emailContentValues.Add("ISO_STANDARDS_NAME", projectPeople.ISO_STANDARDS_NAME);
            emailContentValues.Add("UPDATED_BY", updatedBy);
            emailContentValues.Add("UPDATED_DATE", DateTime.Now.ToString(_dateformat));

            var mailContent = helper.GetEmailContent("SendMailForQspocChange.htm", emailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = toMail, cc = ccMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = selectedProject.PROJ_ID },
                    Request
                ))
            {

            }
        }

    }
}