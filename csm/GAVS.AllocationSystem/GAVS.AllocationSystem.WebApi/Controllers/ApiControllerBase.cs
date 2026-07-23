using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Base;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;


namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public enum ragCategory
    {
        project,
        scope,
        delivery,
        people,
        risk,
        issue,
        valueadds,
        innovation,
        success,
        actionitem,
    }

    public abstract class ApiControllerBase : ApiController
    {
        protected const string ERROR_MSG = "Request is invalid";
        protected const string EMPTY_EMPLOYEEID_MSG = "EmployeeId not filled in the given request";
        protected internal const string PREMIER_CUSTOMER_ID = "212100001";
        public ICloudDB Cldb { get; set; }
        protected ICSPDB CSPdb { get; set; }

        protected ControllerHelper helper;
        public string _dateformat = "dd-MMM-yyyy";

        protected string _email;
        protected string _password;

        protected void LogRequest(Exception exception = null, string prefix = "", string content = "")
        {
            var l = new Logger(Request, exception, prefix, content);
        }

        protected string GetException(Exception exp, string content, string prefix = "")
        {


            string errMsg = string.Empty;
            if (exp.InnerException != null)
                errMsg = exp.InnerException.Message + exp.InnerException.StackTrace;
            else
                errMsg = exp.Message + exp.StackTrace;

            LogRequest(exp, prefix, content);
            return errMsg;
        }

        protected IHttpActionResult GetResult<T>(T entity, string errormsg) where T : new()
        {
            if (string.IsNullOrWhiteSpace(errormsg))
            {
                if (entity != null)
                    return Ok(entity);
                else
                    return Ok();
            }
            else
            {

                LogRequest(new Exception(errormsg), "PSA:");
                return Content(HttpStatusCode.Conflict, errormsg);
            }
        }
        protected void AddAuditTask(AuditTaskInputs taskInputs)
        {
            var taskAudit = new TASK_AUDIT_VM();
            string strMessage = string.Empty;
            var auditeeEmpId = new List<string>() { taskInputs.PROJ_PM_ID };
            var task = new TASK()
            {
                ID = 0,
                TASK_TYPE_ID = 2,
                DESCRIPTION = taskInputs.TASK_DESCRIPTION,
                TASK_CATEGORY_ID = taskInputs.CATEGORY_ID,
                DUE_DATE = taskInputs.DUE_DATE,
                SCHEDULED_START_DATE = taskInputs.SCHEDULED_START_DATE,
                PRIORITY = "MEDIUM",
                STATUS = "PLANNED",
                CUST_ID = taskInputs.CUST_ID,
                PROJ_ID = taskInputs.PROJ_ID,
                SCHEDULED_DURATION = 1,
                OWNER = taskInputs.CREATED_BY != null ? taskInputs.CREATED_BY : taskInputs.AUDITOR_EMP_ID,
                IS_DRAFT = false
            };
            var audit = new AUDIT_SCHEDULE()
            {
                ID = 0,
                CUST_ID = taskInputs.CUST_ID,
                TITLE = taskInputs.TASK_DESCRIPTION,
                PROJ_ID = taskInputs.PROJ_ID,
                ISACTIVE = true,
                SCHEDULED_DURATION = 0,
                SCHEDULED_DATE = taskInputs.SCHEDULED_START_DATE,
                STATUS = "SCHEDULED",
                AUDITEE_EMP_ID = auditeeEmpId,
                AUDITOR_EMP_ID = taskInputs.AUDITOR_EMP_ID
            };

            UpdateAuditFields(task);
            UpdateAuditFields(audit);
            taskAudit.isAudit = true;
            taskAudit.PROJ_NM = taskInputs.PROJ_NM;
            taskAudit.Task = task;
            taskAudit.TASK_CATEGORY_TITLE = CSPdb.TASK_CATEGORY.GetAll().FirstOrDefault(x => x.ID == taskInputs.CATEGORY_ID && x.ISACTIVE)?.TITLE;
            taskAudit.Audit = audit;
            taskAudit.CSS_SCORE = taskInputs.CSS_SCORE;
            taskAudit.CSS_URL = taskInputs.CSS_URL;
            taskAudit.IS_SUBMIT = true;
            var empId = GetHeaderDetails_String("empId");
            helper.AddTaskandAudit(taskAudit, Request, CanCommit, empId, out strMessage);
        }


        public IHttpActionResult AddActionItemInternal(ActionItemsViewDetails results, PROJECT project = null)
        {


            //AddActionItemNew Mail_End
            AddActionItemInternalPrivate(results, project);

            return Ok(results);
        }

        protected PROJECT_ACTIONITEM AddActionItemInternalPrivate(ActionItemsViewDetails results, PROJECT project = null)
        {
            string projid = ((ActionItemsViewDetails)results).PROJ_ID;
            PROJECT_ACTIONITEM overview = new PROJECT_ACTIONITEM();
            if (results != null)
            {
                overview.CUSTOMER_ID = results.CUST_ID;
                overview.PROJECT_ID = results.PROJ_ID;
                overview.RAG = results.RAG;
                overview.DESCRIPTION = results.DESCRIPTION;
                overview.SOURCE = results.SOURCE;
                overview.SOURCE_DESCRIPTION = results.SOURCE_DESCRIPTION;
                overview.ORIGINAL_DESCRIPTION = results.ORIGINAL_DESCRIPTION;
                overview.OWNER = results.OWNER;
                overview.PRIORITY = results.PRIORITY;
                overview.IDENTIFIED_DATE = results.IDENTIFIED_DATE.ToLocalTime();
                overview.TARGET_DATE = results.TARGET_DATE.HasValue ? results.TARGET_DATE.Value.ToLocalTime() : (DateTime?)null;
                overview.STATUS = results.STATUS;
                overview.COMPLETION_DATE = results.COMPLETION_DATE.HasValue ? results.COMPLETION_DATE.Value.ToLocalTime() : (DateTime?)null;
                overview.COMMENTS = results.COMMENTS;
                overview.CREATED_BY = results.CREATED_BY;
                overview.CREATED_DATE = DateTime.Now;
                overview.UPDATED_BY = results.CREATED_BY;
                overview.UPDATED_DATE = DateTime.Now;
                overview.ISACTIVE = true;
                overview.BATCH_CUSTOMER_ID = results.BATCH_CUSTOMER_ID;
                overview.BATCH_CUSTOMER_MONTHLY_ID = results.BATCH_CUSTOMER_MONTHLY_ID;
                overview.RISK_ID = results.RISK_ID;
                overview.PLANNED_TARGET_DATE = results.PLANNED_TARGET_DATE.HasValue ? results.PLANNED_TARGET_DATE.Value.ToLocalTime() : (DateTime?)null;
                overview.PLANNED_ACTUAL_DATE = results.PLANNED_ACTUAL_DATE.HasValue ? results.PLANNED_ACTUAL_DATE.Value.ToLocalTime() : (DateTime?)null;
                overview.CSS_REFERENCE = results.CSS_REFERENCE;
                overview.PORTFOLIO = results.PORTFOLIO_NAME;
                overview.ROOT_CAUSE = results.ROOT_CAUSE;
                overview.SCORE = results.SCORE;
                overview.CUSTOMER_REMARKS = results.CUSTOMER_REMARKS;
                overview.PERSPECTIVE = results.PERSPECTIVE;
                CSPdb.PROJECT_ACTIONITEM.Add(overview);
                CSPdb.Commit();
                results.ACTION_ITEM_ID = overview.ID;
                if (overview.RISK_ID != null)
                {
                    var risk = CSPdb.PROJECT_RISK.GetAll().FirstOrDefault(x => x.ID == overview.RISK_ID);
                    if (risk != null)
                    {
                        var actionItems = CSPdb.PROJECT_ACTIONITEM.GetAll().Where(x => x.RISK_ID == risk.ID && x.ISACTIVE).ToList();
                        if (actionItems.Any())
                            risk.TARGET_DATE = actionItems.Max(x => x.TARGET_DATE);
                    }
                }
                UpdateRag(projid, ragCategory.actionitem, results.RAG, results.CREATED_BY);
                UpdateLastUpdatedDetails(results.PROJ_ID, results.CREATED_BY);
            }

            if (!results.SEND_MAIL)
                return overview;

            //AddActionItemNew Mail_Start

            if (project == null)
                project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == overview.PROJECT_ID);

            if (project == null)
                return null;


            //spliting to email address

            string csmMails = helper.GetCSMMailsFromProject(project);
            string pmMails = helper.GetPMMailsFromProject(project);
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;

            string tomail = pmMails;
            string ccmail = helper.GetDBConfig("CSS_LINK_CC", "-1");
            var qualitySpoc = helper.GetQualitySpocMailForProject(project);

            string customerName = string.Empty;
            string projectName = string.Empty;

            var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
            customerName = customer?.CUST_NM;
            projectName = project.PROJ_NM;

            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/actionitems";

            subject = $"New Action Item Identified - Project: {projectName}; Customer: {customerName}";
            ccmail = helper.ConcatEmails(new List<string>() { ccmail, csmMails, qualitySpoc });

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("Project Name", projectName);
            EmailContentValues.Add("Description", Regex.Replace(overview.DESCRIPTION, @"\r\n?|\n", "</br>"));
            EmailContentValues.Add("Source", overview.SOURCE);
            EmailContentValues.Add("Source_Description", overview.SOURCE_DESCRIPTION);
            EmailContentValues.Add("Owner", overview.OWNER);
            EmailContentValues.Add("Priority", overview.PRIORITY);
            EmailContentValues.Add("Identified Date", overview.IDENTIFIED_DATE.ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Target Date", GetDateValueForMail(overview.PLANNED_TARGET_DATE ?? overview.TARGET_DATE));
            EmailContentValues.Add("Status", overview.STATUS);
            EmailContentValues.Add("Completion Date", GetDateValueForMail(overview.PLANNED_ACTUAL_DATE));
            EmailContentValues.Add("Action Plan Completion - Target date", !overview.COMPLETION_DATE.HasValue ? "-" : overview.PLANNED_TARGET_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Comments", string.IsNullOrWhiteSpace(overview.COMMENTS) ? "-" : overview.COMMENTS);
            EmailContentValues.Add("Root Cause", overview.ROOT_CAUSE);
            EmailContentValues.Add("URL", $"{requestDomain}/{path}/{overview.CUSTOMER_ID}");

            mailContent = helper.GetEmailContent("AddNewActionItem.htm", EmailContentValues);

            var email = ConfigurationManager.AppSettings["emailid"];
            var password = ConfigurationManager.AppSettings["emailpassword"];

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = email, smtpHost = "smtp.office365.com", smtpPassword = password, smtpPortValue = "587" },
                new EmailContent { from = email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = overview.PROJECT_ID },
                Request
                );
            return overview;
        }

        protected string GetDateValueForMail(DateTime? date)
        {
            return !date.HasValue ? "-" : date.Value.ToLocalTime().ToString(_dateformat);
        }

        public void UpdateRag(string projid, ragCategory category, string rag, string UpdatedBy)
        {
            PROJECT_RAGS overview = CSPdb.PROJECT_RAGS.GetAll().Where(t => t.PROJECT_ID == projid && t.CATEGORY == category.ToString()).FirstOrDefault<PROJECT_RAGS>();
            if (overview != null)
            {
                overview.RAG = rag;
                UpdateLastUpdatedDetails(projid, UpdatedBy);
                CSPdb.PROJECT_RAGS.Update(overview);
                CSPdb.Commit(CanCommit);
            }
            else
            {
                UpdateLastUpdatedDetails(projid, UpdatedBy);
                PROJECT_RAGS newRec = new PROJECT_RAGS();
                newRec.PROJECT_ID = projid;
                newRec.CATEGORY = category.ToString();
                newRec.RAG = rag;
                newRec.PUBLISHED_ON = DateTime.Now;
                newRec.CREATED_BY = UpdatedBy;
                newRec.CREATED_DATE = DateTime.Now;
                newRec.UPDATED_BY = UpdatedBy;
                newRec.UPDATED_DATE = DateTime.Now;
                newRec.ISACTIVE = true;
                CSPdb.PROJECT_RAGS.Add(newRec);
                CSPdb.Commit();
            }


        }

        protected void UpdateLastUpdatedDetails(string ProjectId, string UpdatedBy)
        {
            LAST_UPDATED_DETAILS lud = CSPdb.LAST_UPDATED_DETAILS.GetAll().Where(t => t.PROJECT_ID == ProjectId).FirstOrDefault();
            LAST_UPDATED_DETAILS addlud = new LAST_UPDATED_DETAILS();
            if (lud == null)
            {
                addlud.LAST_UPDATED_DATE = DateTime.UtcNow;
                addlud.PROJECT_ID = ProjectId;
                addlud.LAST_UPDATED_BY = UpdatedBy;
                CSPdb.LAST_UPDATED_DETAILS.Add(addlud);
                CSPdb.Commit(CanCommit);
            }
            else if (lud != null)
            {
                lud.LAST_UPDATED_DATE = DateTime.UtcNow;
                lud.LAST_UPDATED_BY = UpdatedBy;
                CSPdb.LAST_UPDATED_DETAILS.Update(lud);
                CSPdb.Commit(CanCommit);
            }
        }

        protected T GetEntity<T>(IQueryable<T> list, T input) where T : EntityBase, new()
        {
            T entity;
            if (input.ID == 0)
            {
                entity = new T();
            }
            else
            {
                entity = list.FirstOrDefault(i => i.ISACTIVE && i.ID == input.ID);
                if (entity == null)
                {
                    entity = new T();
                }
            }
            if (entity != null)
            {
                UpdateAuditFields<T>(entity);
                return entity;
            }
            else
                return null;
        }



        protected void UpdateAuditFields<T>(T input, string empId = "") where T : EntityBase
        {
            if (string.IsNullOrWhiteSpace(empId))
                empId = GetHeaderDetails_String("empId");
            input.UpdateAuditFieldsExt(empId);
        }

        //protected void UpdateMappingList<T>(List<T> existingList, int[] inputIds, Func<T, bool> predicate, Action<T, int> addMethod, Action<T> updateMethod) where T : EntityBase
        //{
        //    foreach (var item in existingList)
        //    {
        //        item.ISACTIVE = false;
        //    }
        //    foreach (var item in inputIds)
        //    {
        //        var existing = existingList.FirstOrDefault(predicate);
        //        if (existing != null)
        //        {
        //            UpdateAuditFields(existing);
        //        }
        //        else
        //        {
        //            addMethod(item);
        //        }
        //    }
        //    foreach (var item in existingList)
        //    {
        //        updateMethod(item);
        //    }
        //}



        private string GetJSONContent<T>(T e) where T : EntityBase
        {

            string result = string.Empty;
            result = JsonConvert.SerializeObject(e);

            return result;

        }

        protected void CreateEntityHistory<T>(T entity) where T : EntityBase
        {
            var name = entity.GetType().Name;
            var newEty = new ENTITY_HISTORY
            {
                ENTITY_NAME = name,
                ENTITY_CONTENT = GetJSONContent(entity),

            };
            UpdateAuditFields(newEty);
            CSPdb.ENTITY_HISTORY.Add(newEty);


        }
        protected string GetHeaderDetails_String(string key)
        {
            string sValue = string.Empty;
            if (Request.Headers.Contains(key))
                sValue = Request.Headers.GetValues(key).ToList()[0];
            return sValue;
        }
        private bool? _canCommit;
        public virtual bool CanCommit
        {
            get
            {
                if (_canCommit.HasValue) return _canCommit.Value;
                else
                {
                    _canCommit = CanCommitTran();
                    return _canCommit.Value;
                }
            }
        }

        private bool CanCommitTran()
        {
            string empId = this.GetHeaderDetails_String("empId");
            //int iEmpId;
            //if (int.TryParse(empId, out iEmpId))
            //{
            var role = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId)?.CSM_TITLE_ID;
            var readonlyProfiles = new List<int> { 11, 13 };
            if (readonlyProfiles.Contains(role.GetValueOrDefault()))
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Authorization Issue: This user profile doesnot have rights to update data in CSM Platform."));
            //}
            ////customer login - Logic to be updated
            //else
            //{

            //}
            return true;

        }



    }
}