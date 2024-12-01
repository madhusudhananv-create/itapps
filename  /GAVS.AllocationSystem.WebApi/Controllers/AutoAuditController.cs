using System;
using System.Linq;
using System.Web;
using AttributeRouting.Web.Mvc;
using System.Web.Http;
using GAVS.AllocationSystem.Model.AllSys.Tables;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using System.Net.Http;
using Newtonsoft.Json;
using System.Net;
using System.Configuration;
using GAVS.AllocationSystem.Data.Contracts;
using System.Collections.Generic;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Data.OleDb;
using System.Data;
using System.Globalization;
using GAVS.AllocationSystem.Model.CSP.Tables;
using System.Text.RegularExpressions;
using System.Diagnostics;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP.SP;
using System.Text;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        public const int TASK_CATEGORY_MATURITY_LEVEL = 11;  //11: Maturity Level Assessment
        public const int TASK_CATEGORY_OFFBOARDNING_PROJECT = 24; //24: Off-boarding Project - Assessment
        public const int TASK_CATEGORY_ONBOARDNING_PROJECT = 22; //22: On-boarding Project - Assessment
        public const string TASK_DESC_MATURITY_LEVEL = "Health Check";
        public const string TASK_DESC_CLOSURE_AUDIT = "Closure Audit";
        public const string TASK_DESC_STARTUP_AUDIT = "Start-up Assessment";
        public const string PROJECT_GROUP_FIXEDBID = "fixed bid";
        public const string AUDIT_STATUS_SCHEDULED = "SCHEDULED";
        public const string TASK_STATUS_PLANNED = "PLANNED";
        public const string TASK_PRIORITY_MEDIUM = "MEDIUM";
     

        [GET("ProcessAutoAudit")]
        [ActionName("ProcessAutoAudit")]
        [HttpGet]
        public IHttpActionResult ProcessAutoAudit(DateTime startDate, DateTime endDate, int categoryId, string taskDesc, string projectGroup)
        {
            // categoryId 24 : Closure, startDate is today, endDate is today+ 10 days  (10 Days Before the project end date)
            // categoryId 11 : HealthCheck, startDate is today -6 Months, endDate is today (Frequency is Half yearly)
            var stopwatch = Stopwatch.StartNew();
            string strMessage = string.Empty; var projects = new List<PROJECT>();
            var taskAudits = new List<TASK>(); var projResource = new List<PROJECT_RESOURCE>(); var task = new TASK();
            var range = ValidateAndReturnDates(startDate, endDate, categoryId, out strMessage);
            if (!string.IsNullOrWhiteSpace(strMessage))
                return Content(HttpStatusCode.Conflict, strMessage);
            startDate = range.Item1;
            endDate = range.Item2;
            if (categoryId == TASK_CATEGORY_OFFBOARDNING_PROJECT)
            {
                projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_STATUS != "close" && x.END_DATE >= DateTime.Today && x.END_DATE <= endDate).ToList();
                var projectIds = projects.Select(x => x.PROJ_ID).ToList();
                taskAudits = CSPdb.TASK.GetAll().Where(x => x.ISACTIVE && x.TASK_CATEGORY_ID == categoryId && projectIds.Contains(x.PROJ_ID)).ToList();
            }
            else if (categoryId == TASK_CATEGORY_MATURITY_LEVEL)
            {
                if (string.IsNullOrWhiteSpace(projectGroup))
                    projectGroup = PROJECT_GROUP_FIXEDBID;
                projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_STATUS != "close" && !string.IsNullOrEmpty(x.PROJECT_GROUP) && x.PROJECT_GROUP.ToLower().IndexOf(projectGroup.ToLower()) != -1 &&
                x.START_DATE <= startDate).ToList();
                var projectIds = projects.Select(x => x.PROJ_ID).ToList();
                projResource = Cldb.PROJECT_RESOURCE.GetAll().Where(x => projectIds.Contains(x.PROJ_ID) && x.END_DATE >= endDate && x.CURR_INDC.ToUpper() == "Y").ToList();
                endDate = endDate.AddMonths(1);
                taskAudits = CSPdb.TASK.GetAll().Where(x => x.ISACTIVE && x.TASK_CATEGORY_ID == categoryId && projectIds.Contains(x.PROJ_ID)
                && x.SCHEDULED_START_DATE >= startDate && x.SCHEDULED_START_DATE <= endDate).ToList();
            }

            foreach (var p in projects)
            {
                task = taskAudits.FirstOrDefault(x => x.PROJ_ID == p.PROJ_ID);
                if (categoryId == TASK_CATEGORY_OFFBOARDNING_PROJECT)
                {
                    if (task == null)
                        strMessage = CreateTaskAudit(p, taskDesc, categoryId, endDate);
                }
                else if (categoryId == TASK_CATEGORY_MATURITY_LEVEL)
                {
                    var resourceCnt = projResource.Count(x => x.PROJ_ID == p.PROJ_ID);
                    if (task == null && resourceCnt > 3)
                        strMessage = CreateTaskAudit(p, taskDesc, categoryId, endDate);
                }
            }

            if (!string.IsNullOrWhiteSpace(strMessage))
                return Ok(strMessage);
            FillResponseTime(stopwatch);
            return Ok("Process Completed Successfully");
        }

        [GET("NotifyAuditsNotCompleted")]
        [ActionName("NotifyAuditsNotCompleted")]
        [HttpGet]
        // Once Audit is planned and not completed on given target date (Actual end date) , then warning email should be triggered within  2 working days
        // to Auditor , Auditor’s Manager , GRC Team.
        public IHttpActionResult NotifyAuditNotCompleted()
        {
            var stopwatch = Stopwatch.StartNew();
            string strMessage = string.Empty; var audit = new AUDIT_SCHEDULE();
            var empIds = new List<string>();
            var startDate = DateTime.Today.AddDays(-2);
            var endDate = DateTime.Today;
            var taskAudits = CSPdb.AppRepo.GetAuditNotCompleted();
            var owner = taskAudits.Select(x => x.OWNER).ToList();
            var responsible = taskAudits.Select(x => x.ASSIGNED_TO).ToList();
            var managers = taskAudits.Select(x => x.MANAGER_EMP_ID).ToList();
            var auditor = taskAudits.Select(x => x.AUDITOR_EMP_ID).ToList();

            if (owner != null && owner.Count > 0)
                empIds.AddRange(owner);
            if (responsible != null && responsible.Count > 0)
                empIds.AddRange(responsible);
            if (managers != null && managers.Count > 0)
                empIds.AddRange(managers);
            if (auditor != null && auditor.Count > 0)
                empIds.AddRange(auditor);

            var empList = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID)).ToList();
            foreach (var t in taskAudits)
            {
                SendAuditNotCompletedNotification(t, empList, "Audit");
            }
            if (!string.IsNullOrWhiteSpace(strMessage))
                return Content(HttpStatusCode.Conflict, strMessage);

            if (!string.IsNullOrWhiteSpace(strMessage))
                return Ok(strMessage);
            FillResponseTime(stopwatch);
            return Ok("Process Completed Successfully");
        }


        [GET("NotifyAuditScoreNotSubmitted")]
        [ActionName("NotifyAuditScoreNotSubmitted")]
        [HttpGet]
        // Even if , Audit is completed and score not submitted with in 2 working days , then email should be tiggered to Auditor , Auditor’s manager , GRC Team.
        public IHttpActionResult NotifyAuditScoreNotSubmitted()
        { 
            var stopwatch = Stopwatch.StartNew();
            string strMessage = string.Empty; var audit = new AUDIT_SCHEDULE();
            var empIds = new List<string>();
            var startDate = DateTime.Today.AddDays(-2);
            var endDate = DateTime.Today;
            var taskAudits = CSPdb.AppRepo.GetAuditScoreNotSubmitted();
            var owner = taskAudits.Select(x => x.OWNER).ToList();
            var responsible = taskAudits.Select(x => x.ASSIGNED_TO).ToList();
            var managers = taskAudits.Select(x => x.MANAGER_EMP_ID).ToList();
            var auditor = taskAudits.Select(x => x.AUDITOR_EMP_ID).ToList();

            if (owner != null && owner.Count > 0)
                empIds.AddRange(owner);
            if (responsible != null && responsible.Count > 0)
                empIds.AddRange(responsible);
            if (managers != null && managers.Count > 0)
                empIds.AddRange(managers);
            if (auditor != null && auditor.Count > 0)
                empIds.AddRange(auditor);

            var empList = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID)).ToList();
            foreach (var t in taskAudits)
            {
                SendAuditScoreNotSubmittedNotification(t, empList, "Audit");
            }
            if (!string.IsNullOrWhiteSpace(strMessage))
                return Content(HttpStatusCode.Conflict, strMessage);

            if (!string.IsNullOrWhiteSpace(strMessage))
                return Ok(strMessage);
            FillResponseTime(stopwatch);
            return Ok("Process Completed Successfully");
        }

        private void SendAuditNotCompletedNotification(AUDIT_DETAILS_VM taskAudit, List<EMP_INFO> empList, string entity)
        {
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string toMail = string.Empty;
            string ccMail = string.Empty;

            string mailContent;
            var recipients = new List<string>();
            StringBuilder sb = new StringBuilder();
            var empIds = new List<string>();
            var auditEmpIds = new List<string>();

            var auditor = empList.FirstOrDefault(x => taskAudit.AUDITOR_EMP_ID == x.EMP_ID);
            var manager = empList.FirstOrDefault(x => taskAudit.MANAGER_EMP_ID == x.EMP_ID);
            var responsible = empList.FirstOrDefault(x => taskAudit.ASSIGNED_TO == x.EMP_ID);
            var owner = empList.FirstOrDefault(x => taskAudit.OWNER == x.EMP_ID);

            toMail = auditor.EMAIL_ID;
            ccMail = helper.ConcatEmails(new List<string> { manager.EMAIL_ID, Constants.GRC_Team_Email });

            if (taskAudit != null)
            {
                subject = $"{entity}: {taskAudit.DESCRIPTION} - Audit not completed. ";
                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("CATEGORY", taskAudit.TASK_CATEGORY);
                EmailContentValues.Add("DESCRIPTION", taskAudit.DESCRIPTION);
                EmailContentValues.Add("PROJECT_NAME", $"{taskAudit.CUST_NM} - {taskAudit.PROJ_NM}");
                EmailContentValues.Add("OWNER", owner.FRST_NM);
                EmailContentValues.Add("SCHEDULED_START_DATE", taskAudit.SCHEDULED_START_DATE.HasValue ? taskAudit.SCHEDULED_START_DATE.Value.ToString(_dateformat) : string.Empty);
                EmailContentValues.Add("DUE_DATE", taskAudit.DUE_DATE.HasValue ? taskAudit.DUE_DATE.Value.ToString(_dateformat) : string.Empty);
                EmailContentValues.Add("STATUS", taskAudit.STATUS);
                EmailContentValues.Add("PRIORITY", taskAudit.PRIORITY);
                EmailContentValues.Add("RESPONSIBLE", responsible.FRST_NM);
                EmailContentValues.Add("COMMENTS", taskAudit.COMMENTS);
                EmailContentValues.Add("AUDITOR_NAME", auditor.FRST_NM);
                mailContent = helper.GetEmailContent("AuditNotCompleted.htm", EmailContentValues);
                var ep = new EmailProvider(Cldb, CSPdb);
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }
                    , Request
                    );
            }
        }
        private void SendAuditScoreNotSubmittedNotification(AUDIT_DETAILS_VM taskAudit, List<EMP_INFO> empList, string entity)
        {
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string toMail = string.Empty;
            string ccMail = string.Empty;

            string mailContent;
            var recipients = new List<string>();
            StringBuilder sb = new StringBuilder();
            var empIds = new List<string>();
            var auditEmpIds = new List<string>();

            var auditor = empList.FirstOrDefault(x => taskAudit.AUDITOR_EMP_ID == x.EMP_ID);
            var manager = empList.FirstOrDefault(x => taskAudit.MANAGER_EMP_ID == x.EMP_ID);
            var responsible = empList.FirstOrDefault(x => taskAudit.ASSIGNED_TO == x.EMP_ID);
            var owner = empList.FirstOrDefault(x => taskAudit.OWNER == x.EMP_ID);

            toMail = auditor.EMAIL_ID;
            ccMail = helper.ConcatEmails(new List<string> { manager.EMAIL_ID, Constants.GRC_Team_Email });

            if (taskAudit != null)
            {
                subject = $"{entity}: {taskAudit.DESCRIPTION} - Audit score not submitted. ";
                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("CATEGORY", taskAudit.TASK_CATEGORY);
                EmailContentValues.Add("DESCRIPTION", taskAudit.DESCRIPTION);
                EmailContentValues.Add("PROJECT_NAME", $"{taskAudit.CUST_NM} - {taskAudit.PROJ_NM}");
                EmailContentValues.Add("OWNER", owner.FRST_NM);
                EmailContentValues.Add("SCHEDULED_START_DATE", taskAudit.SCHEDULED_START_DATE.HasValue ? taskAudit.SCHEDULED_START_DATE.Value.ToString(_dateformat) : string.Empty);
                EmailContentValues.Add("DUE_DATE", taskAudit.DUE_DATE.HasValue ? taskAudit.DUE_DATE.Value.ToString(_dateformat) : string.Empty);
                EmailContentValues.Add("STATUS", taskAudit.STATUS);
                EmailContentValues.Add("PRIORITY", taskAudit.PRIORITY);
                EmailContentValues.Add("RESPONSIBLE", responsible.FRST_NM);
                EmailContentValues.Add("COMMENTS", taskAudit.COMMENTS);
                EmailContentValues.Add("AUDITOR_NAME", auditor.FRST_NM);
                mailContent = helper.GetEmailContent("AuditScoreNotSubmitted.htm", EmailContentValues);
                var ep = new EmailProvider(Cldb, CSPdb);
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }
                    , Request
                    );
            }
        }

        /// <summary>
        /// StartUpAutoTaskAudit   -- Audit plan Automatization 
        /// </summary>
        /// <param name="item"></param>
        /// 

        [POST("AddStartUpAutoAuditTask")]
        [ActionName("AddStartUpAutoAuditTask")]
        [HttpPost]
        public IHttpActionResult AddStartUpAutoAuditTask(HttpRequestMessage request)
        {
            LogRequest(prefix: "AddStartUpAutoAuditTask");
            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            var projectList = JsonConvert.DeserializeObject<List<PROJECT>>(json);

            if (projectList == null || projectList.Count == 0)
                return Ok("Empty Project List");

            foreach (var project in projectList)
            {
                if (!project.PROJ_ID.StartsWith("PROJ"))
                {
                    StartUpAutoTaskAudit(project);
                }          
            }

            return Ok("Success");
        }

        private string StartUpAutoTaskAudit(PROJECT item)
        {
            int categoryId = TASK_CATEGORY_ONBOARDNING_PROJECT;
            string taskDesc = TASK_DESC_STARTUP_AUDIT;
            return CreateTaskAudit(item, taskDesc, categoryId, DateTime.Today);
        }

        private Tuple<DateTime, DateTime> GetScheduledStarDateAndDueDate(DateTime date, int categoryId)
        {
            var schedulestartdate = date; var dueDate = date;
            if (categoryId == TASK_CATEGORY_OFFBOARDNING_PROJECT)
            {
                schedulestartdate = CheckIfWeekendAndAddDays(date);
                dueDate = schedulestartdate.AddDays(10);
            }
            else if (categoryId == TASK_CATEGORY_MATURITY_LEVEL)
            {
                schedulestartdate = new DateTime(date.Year, date.Month, 1).AddMonths(1);
                dueDate = schedulestartdate.AddMonths(1).AddDays(-1);
            }
            else if (categoryId == TASK_CATEGORY_ONBOARDNING_PROJECT)
            {
                schedulestartdate = CheckIfWeekendAndAddDays(DateTime.Today.AddDays(15));
                dueDate = schedulestartdate.AddDays(10);
            }
            return new Tuple<DateTime, DateTime>(schedulestartdate, dueDate);
        }
        private string CreateTaskAudit(PROJECT item, string taskDesc, int categoryId, DateTime date)
        {
            var schedulestartdate = DateTime.Today; var dueDate = DateTime.Today;
            var auditorEmpId = string.Empty;
            string taskDescNew = string.Empty;
            var strMessage = string.Empty;
            if (categoryId == TASK_CATEGORY_OFFBOARDNING_PROJECT)
            {
                auditorEmpId = helper.GetDBConfig("DEFAULT_CLOSURE_AUDITOR", item.CUST_ID);
                taskDescNew = TASK_DESC_CLOSURE_AUDIT;
            }
            else if (categoryId == TASK_CATEGORY_MATURITY_LEVEL)
            {
                auditorEmpId = helper.GetDBConfig("DEFAULT_HEALTHCHECK_AUDITOR", item.CUST_ID);
                taskDescNew = TASK_DESC_MATURITY_LEVEL;
            }
            else if (categoryId == TASK_CATEGORY_ONBOARDNING_PROJECT)
            {
                auditorEmpId = helper.GetDBConfig("DEFAULT_STARTUP_AUDITOR", item.CUST_ID);
                taskDescNew = TASK_DESC_STARTUP_AUDIT;
            }
            if (string.IsNullOrWhiteSpace(taskDesc))
                taskDesc = taskDescNew;
            var taskAudit = new TASK_AUDIT_VM();
            string projId = item.PROJ_ID;
            var range = GetScheduledStarDateAndDueDate(schedulestartdate, categoryId);
            schedulestartdate = range.Item1;
            dueDate = range.Item2;
            var task = new TASK()
            {

                TASK_TYPE_ID = 2,
                DESCRIPTION = taskDesc,
                TASK_CATEGORY_ID = categoryId,
                DUE_DATE = dueDate,
                SCHEDULED_START_DATE = schedulestartdate,
                PRIORITY = TASK_PRIORITY_MEDIUM,
                STATUS = TASK_STATUS_PLANNED,
                CUST_ID = item.CUST_ID,
                PROJ_ID = projId,
                SCHEDULED_DURATION = 1,
                OWNER = item.CREATED_BY,
                IS_DRAFT = false
            };
            var auditeeEmpId = new List<string>() { item.PROJ_PM_EMP_ID };

            var audit = new AUDIT_SCHEDULE()
            {

                CUST_ID = item.CUST_ID,
                TITLE = taskDesc,
                PROJ_ID = projId,
                ISACTIVE = true,
                SCHEDULED_DURATION = 0,
                SCHEDULED_DATE = schedulestartdate,
                STATUS = AUDIT_STATUS_SCHEDULED,
                AUDITEE_EMP_ID = auditeeEmpId,
                AUDITOR_EMP_ID = auditorEmpId
            };
            UpdateAuditFields(task);
            UpdateAuditFields(audit);
            taskAudit.isAudit = true;
            taskAudit.PROJ_NM = item.PROJ_NM;
            taskAudit.Task = task;
            taskAudit.TASK_CATEGORY_TITLE = CSPdb.TASK_CATEGORY.GetById(categoryId).TITLE;
            taskAudit.Audit = audit;
            taskAudit.IS_SUBMIT = true;
            var empId = this.GetHeaderDetails_String("empid");
           
            helper.AddTaskandAudit(taskAudit, Request, CanCommit, empId, out strMessage);
            return strMessage;
        }
        Tuple<DateTime, DateTime> ValidateAndReturnDates(DateTime startDate, DateTime endDate, int categoryId, out string strMsg)
        {
            strMsg = string.Empty;
            if (categoryId == TASK_CATEGORY_OFFBOARDNING_PROJECT)
            {
                if (!DateTime.TryParse(endDate.ToString(), out endDate))
                    endDate = DateTime.Today.AddDays(10);
            }
            else if (categoryId == TASK_CATEGORY_MATURITY_LEVEL)
            {
                if (!DateTime.TryParse(startDate.ToString(), out startDate))
                    startDate = startDate.AddMonths(-6); // HalfYearly  
                if (!DateTime.TryParse(endDate.ToString(), out endDate))
                    endDate = DateTime.Today;
            }
            if (startDate > endDate)
                strMsg = "Start date is greater than End date";
            return new Tuple<DateTime, DateTime>(startDate, endDate);
        }
        DateTime CheckIfWeekendAndAddDays(DateTime date)
        {
            if (date.DayOfWeek == DayOfWeek.Saturday)
                date = date.AddDays(-1);
            else if (date.DayOfWeek == DayOfWeek.Sunday)
                date = date.AddDays(-2);
            return date;
        }
    }
}