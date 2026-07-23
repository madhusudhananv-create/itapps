using AttributeRouting.Helpers;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Charts;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.Filters;
using System.Web.Http.Results;
using System.Web.UI.WebControls;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        //oldcode
        [POST("SubmitActionItemPlanToCustomer")]
        [ActionName("SubmitActionItemPlanToCustomer")]
        [HttpPost]
        public IHttpActionResult SubmitActionItemPlanToCustomer(int customerId, string projectId, int actionItemId)
        {

            var actionitem = CSPdb.PROJECT_ACTIONITEM.GetAll().FirstOrDefault(x => x.ID == actionItemId);
            if (actionitem == null || (actionitem.BATCH_CUSTOMER_MONTHLY_ID.GetValueOrDefault() == 0 && actionitem.BATCH_CUSTOMER_ID.GetValueOrDefault() == 0))
            {
                //raise error
                return BadRequest("Unable to find related Customer Success Survey for the Action Item");
            }
            //find premier or non premier
            var isMonthly = actionitem.BATCH_CUSTOMER_MONTHLY_ID.GetValueOrDefault() != 0;
            var customerName = string.Empty;
            var customerMail = string.Empty;
            var cssLink = string.Empty;
            var requestDomain = helper.GetAbsoulteUri();
            var period = string.Empty;
            if (isMonthly)
            {
                var batchCustomerMonthly = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(x => x.ID == actionitem.BATCH_CUSTOMER_MONTHLY_ID);
                if (batchCustomerMonthly == null)
                {
                    return BadRequest("Unable to find related CSS link. Please make sure that this action is related to a CSS.");
                }
                customerMail = batchCustomerMonthly.EMAIL_ID;
                customerName = batchCustomerMonthly.DISPLAY_NAME;
                var survey = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(x => x.BATCH_CUSTOMER_MONTHLY_ID == batchCustomerMonthly.ID);
                cssLink = survey.SURVEY_ID;
                var batch = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchCustomerMonthly.BATCH_MONTHLY_ID);
                if (batch != null)
                    period = GetCurrentPeriodStringNew("quarterly", (batch.MONTH - 1) / 3, batch.YEAR);
            }
            else
            {
                var batchCustomer = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(x => x.ID == actionitem.BATCH_CUSTOMER_ID);
                if (batchCustomer == null)
                {
                    return BadRequest("Unable to find related CSS link");
                }
                customerMail = batchCustomer.EMAIL_ID;
                customerName = batchCustomer.DISPLAY_NAME;
                var surevey = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(x => x.BATCH_CUSTOMERS_ID == batchCustomer.ID);
                cssLink = surevey.SURVEY_ID;
            }
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);

            if (project == null)
                return Ok("");
            var cclist = new List<string>();
            cclist.AddRange(helper.getProjectResposnibleMailIds(project, true, true, true));
            cclist.Add(helper.GetDBConfig("CC_MAIL_FOR_ACTIONITEM_CUSTOMER_UPDATE", actionitem.CUSTOMER_ID));

            string statusMsg = string.Empty;
            string mailContent;

            string tomail = customerMail;

            string projectName = string.Empty;

            //var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
            //customerName = customer?.CUST_NM;
            projectName = project.PROJ_NM;



            var path = "layout/actionitems";

            var subject = $"CSS Action Item Update : {projectName}";
            var ccmail = helper.ConcatEmails(cclist);

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();

            EmailContentValues.Add("Customer_Name", customerName);

            EmailContentValues.Add("Improvement Plan", Regex.Replace(actionitem.DESCRIPTION, @"\r\n?|\n", "</br>"));
            EmailContentValues.Add("Source", $"{actionitem.SOURCE} - {customerName} - {period}");
            EmailContentValues.Add("CSS Link", $"{requestDomain}/CustomerSuccessSurvey/{cssLink}");
            EmailContentValues.Add("Owner", actionitem.OWNER);
            EmailContentValues.Add("Priority", actionitem.PRIORITY);
            EmailContentValues.Add("Identified Date", actionitem.IDENTIFIED_DATE.ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Target Date", GetDateValueForMail(actionitem.PLANNED_TARGET_DATE));
            EmailContentValues.Add("Status", actionitem.STATUS);
            EmailContentValues.Add("Completion Date", GetDateValueForMail(actionitem.PLANNED_ACTUAL_DATE));
            EmailContentValues.Add("Comments", actionitem.COMMENTS);
            EmailContentValues.Add("Project Name", projectName);
            EmailContentValues.Add("URL", $"{requestDomain}/{path}/{actionitem.CUSTOMER_ID}");

            mailContent = helper.GetEmailContent("ActionItemCustomerUpdate.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = projectId },
                Request
                );


            return Ok("");
        }



        //[POST("SubmitActionItemPlanToCustomer")]
        //[ActionName("SubmitActionItemPlanToCustomer")]
        //[HttpPost]
        //public IHttpActionResult SubmitActionItemPlanToCustomer(string customerId, string projectId, int batchCustomerId, bool isApproved, string comments)
        //{
        //    CheckAccessForFeature(119);
        //    CheckUserHasAccess(GetHeaderDetails_String("empId"), customerId, projectId);

        //    var actionitem = CSPdb.PROJECT_ACTIONITEM.GetAll().Where(x => (x.BATCH_CUSTOMER_ID == batchCustomerId || x.BATCH_CUSTOMER_MONTHLY_ID == batchCustomerId) &&
        //                        (x.BATCH_CUSTOMER_ID != null && x.BATCH_CUSTOMER_MONTHLY_ID != null) && x.PROJECT_ID == projectId && x.ISACTIVE).ToList();
        //    if (actionitem == null)
        //    {
        //        return BadRequest("Unable to find related Customer Success Survey for the Action Item");
        //    }
        //    else
        //    {
        //        foreach (var item in actionitem)
        //        {
        //            if (isApproved)
        //            {
        //                item.STATUS = "Planned";
        //            }
        //            else
        //            {
        //                item.STATUS = "Rejected by CSM";
        //            }
        //            UpdateAuditFields(item);
        //            CSPdb.PROJECT_ACTIONITEM.Update(item);
        //        }
        //    }

        //    var customerDetails = GetCustomerDetails(actionitem.FirstOrDefault());
        //    if (customerDetails == null)
        //    {
        //        return BadRequest("Unable to find related Customer Success Survey. Please make sure that this action plan is created.");
        //    }

        //    var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
        //    if (project == null)
        //        return Ok("");
        //    var cclist = new List<string>();
        //    cclist.AddRange(helper.getProjectResposnibleMailIds(project, true, true, true));

        //    var csmlist = helper.GetCSMFromProject(project);
        //    var csmName = string.Join(",", csmlist.Select(x => x.FRST_NM));
        //    var pmlist = helper.GetPMEmpInfoFromProject(projectId);
        //    var pmName = string.Join(",", pmlist.Select(x => x.FRST_NM));

        //    string statusMsg = string.Empty;
        //    string mailContent = string.Empty;
        //    string tomail = string.Empty;
        //    string projectName = string.Empty;
        //    var subject = string.Empty;

        //    var accountName = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID)?.CUST_NM;
        //    projectName = project.PROJ_NM;
        //    var path = "layout/actionitems";
        //    var ccmail = helper.ConcatEmails(cclist);
        //    var requestDomain = helper.GetAbsoulteUri();

        //    Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
        //    EmailContentValues.Add("Customer_Name", customerDetails.CustomerName);
        //    EmailContentValues.Add("Project Name", projectName);
        //    EmailContentValues.Add("URL", $"{requestDomain}/{path}/{customerId}");
        //    EmailContentValues.Add("CSM_NAME", csmName);
        //    EmailContentValues.Add("PM_NAME", pmName);
        //    EmailContentValues.Add("REJECTION_COMMENTS", comments);
        //    EmailContentValues.Add("TABLE", GenerateHtmlTable(actionitem));

        //    if (isApproved)
        //    {
        //        tomail = customerDetails.CustomerMail;
        //        subject = $"Customer Success Survey Action Item Update - {accountName} | {projectName} | {customerDetails.Period}";
        //        mailContent = helper.GetEmailContent("ActionItemCustomerUpdate.htm", EmailContentValues);
        //    }
        //    else
        //    {
        //        tomail = string.Join(",", pmlist.Select(x => x.EMAIL_ID));
        //        subject = $"Improvement Action Plan Rejected - {accountName} | {projectName} | {customerDetails.Period}";
        //        mailContent = helper.GetEmailContent("ActionItemRejectionUpdate.htm", EmailContentValues);
        //    }

        //    var ep = new EmailProvider(Cldb, CSPdb);
        //    if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
        //    ep.SendEmail
        //        (
        //        new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
        //        new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = projectId },
        //        Request
        //        );

        //    CSPdb.Commit(CanCommit);
        //    return Ok("");
        //}


        [POST("SubmitActionItemPlanToCSM")]
        [ActionName("SubmitActionItemPlanToCSM")]
        [HttpPost]
        public IHttpActionResult SubmitActionItemPlanToCSM(string customerId, string projectId, int batchCustomerId)
        {
            CheckAccessForFeature(120);
            CheckUserHasAccess(GetHeaderDetails_String("empId"), customerId, projectId);

            var actionitem = CSPdb.PROJECT_ACTIONITEM.GetAll().Where(x => (x.BATCH_CUSTOMER_ID == batchCustomerId || x.BATCH_CUSTOMER_MONTHLY_ID == batchCustomerId) &&
                                (x.BATCH_CUSTOMER_ID != null && x.BATCH_CUSTOMER_MONTHLY_ID != null) && x.PROJECT_ID == projectId && x.ISACTIVE).ToList();
            if (actionitem == null)
            {
                return BadRequest("Unable to find related Customer Success Survey for the Action Item");
            }
            else
            {
                foreach (var item in actionitem)
                {
                    item.STATUS = "Submitted for Approval";
                    UpdateAuditFields(item);
                    CSPdb.PROJECT_ACTIONITEM.Update(item);
                }
            }

            var customerDetails = GetCustomerDetails(actionitem.FirstOrDefault());
            if (customerDetails == null)
            {
                return BadRequest("Unable to find related Customer Success Survey. Please make sure that this action plan is created.");
            }

            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
            if (project == null)
                return Ok("");
            var cclist = new List<string>();
            cclist.AddRange(helper.getProjectResposnibleMailIds(project, true, true, true));
            var ccmail = helper.ConcatEmails(cclist);

            string statusMsg = string.Empty;
            string mailContent;
            string tomail = string.Empty;
            string projectName = string.Empty;

            var accountName = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID)?.CUST_NM;
            projectName = project.PROJ_NM;
            var csmlist = helper.GetCSMFromProject(project);
            tomail = string.Join(",", csmlist.Select(x => x.EMAIL_ID));
            var csmName = string.Join(",", csmlist.Select(x => x.FRST_NM));

            var path = "layout/actionitems";
            var subject = $"Approval Required - Improvement Action Plan Submitted - {accountName} | {projectName} | {customerDetails.Period}";
            var requestDomain = helper.GetAbsoulteUri();
            var mainUrl = $"{requestDomain}/{path}/{customerId}/{projectId}/{batchCustomerId}/";
            string approveUrl = mainUrl + "1";
            string rejectUrl = mainUrl + "0";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CSM_NAME", csmName);
            EmailContentValues.Add("PM_NAME", helper.GetPMEmpInfoFromProject(projectId).FirstOrDefault()?.FRST_NM);
            EmailContentValues.Add("PROJECT_NAME", projectName);
            EmailContentValues.Add("PERIOD", customerDetails.Period);
            EmailContentValues.Add("APPROVE", approveUrl);
            EmailContentValues.Add("REJECT", rejectUrl);
            EmailContentValues.Add("TARGET_DATE", customerDetails.TARGET_DATE.Value.ToString(_dateformat));
            EmailContentValues.Add("TABLE", GenerateHtmlTable(actionitem));
            mailContent = helper.GetEmailContent("ActionItemUpdateToCSM.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = projectId },
                Request
                );

            CSPdb.Commit(CanCommit);
            return Ok("");
        }

        private string GenerateHtmlTable(List<PROJECT_ACTIONITEM> actionitem)
        {
            var sb = new StringBuilder();
            var i = 1;
            foreach (var item in actionitem)
            {
                sb.Append("<tr>");
                sb.Append($"<td>{ i++ }</td>");
                sb.Append($"<td>{ item.DESCRIPTION }</td>");
                sb.Append($"<td>{ item.OWNER }</td>");
                sb.Append($"<td>{ item.IDENTIFIED_DATE.ToString(_dateformat) }</td>");
                sb.Append($"<td>{ GetDateValueForMail(item.TARGET_DATE) }</td>");
                sb.Append($"<td>{ GetDateValueForMail(item.COMPLETION_DATE) }</td>");
                sb.Append($"<td>{ GetDateValueForMail(item.PLANNED_TARGET_DATE) }</td>");
                sb.Append($"<td>{ GetDateValueForMail(item.PLANNED_ACTUAL_DATE) }</td>");
                sb.Append($"<td>{ item.STATUS }</td>");
                sb.AppendLine("</tr>");
            }
            return sb.ToString();
        }

        private CustomerDetails GetCustomerDetails(PROJECT_ACTIONITEM actionitem)
        {
            bool isMonthly = actionitem.BATCH_CUSTOMER_MONTHLY_ID.HasValue && actionitem.BATCH_CUSTOMER_MONTHLY_ID != 0;
            var customerDetails = new CustomerDetails();

            if (isMonthly)
            {
                var batchCustomerMonthly = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(x => x.ID == actionitem.BATCH_CUSTOMER_MONTHLY_ID);
                if (batchCustomerMonthly == null)
                {
                    return null;
                }
                customerDetails.CustomerMail = batchCustomerMonthly.EMAIL_ID;
                customerDetails.CustomerName = batchCustomerMonthly.DISPLAY_NAME;
                var survey = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(x => x.BATCH_CUSTOMER_MONTHLY_ID == batchCustomerMonthly.ID);
                customerDetails.surveyId = survey.SURVEY_ID;
                customerDetails.TARGET_DATE = actionitem.TARGET_DATE;
                var batch = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchCustomerMonthly.BATCH_MONTHLY_ID);
                if (batch != null)
                {
                    customerDetails.Period = GetCurrentPeriodStringNew("quarterly", (batch.MONTH - 1) / 3, batch.YEAR);
                }
            }
            else
            {
                var batchCustomer = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(x => x.ID == actionitem.BATCH_CUSTOMER_ID);
                if (batchCustomer == null)
                {
                    return null;
                }
                customerDetails.CustomerMail = batchCustomer.EMAIL_ID;
                customerDetails.CustomerName = batchCustomer.DISPLAY_NAME;
                var survey = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(x => x.BATCH_CUSTOMERS_ID == batchCustomer.ID);
                customerDetails.surveyId = survey.SURVEY_ID;
                customerDetails.TARGET_DATE = actionitem.TARGET_DATE;
                var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batchCustomer.BATCH_ID);
                if (batch != null)
                {
                    customerDetails.Period = GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR);
                }
            }

            return customerDetails;
        }

        private class CustomerDetails
        {
            public string CustomerName { get; set; }
            public string CustomerMail { get; set; }
            public string surveyId { get; set; }
            public string Period { get; set; }
            public DateTime? TARGET_DATE { get; set; }
        }

        [GET("GetPortfolioLeadForProject")]
        [ActionName("GetPortfolioLeadForProject")]
        [HttpGet]
        public IHttpActionResult GetPortfolioLeadForProject(string projectId)
        {

            var result = new List<string>();

            var productResponsible = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.MANAGEMENT_TYPE == 7 && x.PROJECT_ID == projectId && x.ISACTIVE);
            if (productResponsible != null)
            {
                result.AddRange(GetPortfolioLeadIDFromProduct(productResponsible.PRODUCT_ID));
            }

            var proj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
            if (proj != null)
            {
                result.Add(proj.PROJ_PM_EMP_ID);
                if (!string.IsNullOrWhiteSpace(proj.QUALITY_SPOC))
                {
                    result.Add(proj.QUALITY_SPOC);
                }
            }
            result.Add("102802");
            return Ok(result);
        }

        private List<string> GetPortfolioLeadIDFromProduct(int prodId)
        {
            var product = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == prodId && (x.MANAGEMENT_TYPE == 1 || x.MANAGEMENT_TYPE == 2 || x.MANAGEMENT_TYPE == 3) && x.ISACTIVE).ToList();

            return product.Select(x => x.EMP_ID).ToList();
        }

        [POST("CreateActionItemForCSAT")]
        [ActionName("CreateActionItemForCSAT")]
        [HttpPost]
        public IHttpActionResult CreateActionItemForCSAT(HttpRequestMessage request, int batchId)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            string empId = GetHeaderDetails_String("empid");
            var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => Convert.ToInt32(x)).ToList();
            string type = GetHeaderDetails_String("type");
            var batchCustomers = new List<iBatchCustomer>();

            if (CheckPremierType(type))
            {
                batchCustomers = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batchId && selectedIds.Contains(t.ID) &&
                (t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT") && t.ISACTIVE).ToList<iBatchCustomer>();
            }
            else
            {
                batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == batchId && selectedIds.Contains(t.ID) && (t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT") && t.ISACTIVE).ToList<iBatchCustomer>();
            }

            if (!batchCustomers.Any())
            {
                return Content(HttpStatusCode.Conflict, "Unable to find related Batch Customer Records.");
            }

            var batchCustomerIds = batchCustomers.Select(x => x.ID).ToList();
            var existingActionItems = CSPdb.PROJECT_ACTIONITEM.GetAll().Where(x => x.SOURCE == "CSAT Improvement" &&
             (batchCustomerIds.Contains(x.BATCH_CUSTOMER_ID ?? -99) || batchCustomerIds.Contains(x.BATCH_CUSTOMER_MONTHLY_ID ?? -99)) && x.ISACTIVE).ToList();

            var skipRecords = helper.GetProjectConfigurationDataForSetting("SKIP_CSAT");
            var actionItemCreated = false;
            foreach (var cust in batchCustomers)
            {
                if (cust.PROJ_ID == null) continue;

                if (skipRecords.Any(x => x.Proj_Id == cust.PROJ_ID)) continue;

                if (CheckPremierType(type))
                {
                    if (!existingActionItems.Any(x => x.BATCH_CUSTOMER_MONTHLY_ID == cust.ID))
                    {
                        CreateActionItemDetails(cust.CUST_ID, cust.PROJ_ID, null, cust.ID);
                        actionItemCreated = true;
                    }
                }
                else
                {
                    if (!existingActionItems.Any(x => x.BATCH_CUSTOMER_ID == cust.ID))
                    {
                        CreateActionItemDetails(cust.CUST_ID, cust.PROJ_ID, cust.ID, null);
                        actionItemCreated = true;
                    }
                }
            }
            if (!actionItemCreated)
            {
                return Content(HttpStatusCode.Conflict, "No Action item created for selected Records. Either Action item may be already there or related Project is not available now.");
            }

            return Ok();
        }

        private bool CheckPremierType(string type)
        {
            return type == "PremierCSAT";
        }

        private void CreateActionItemDetails(string customerId, string projectId, int? batchCustomerId, int? batchCustomerMonthlyId)
        {
            var overview = new ActionItemsViewDetails();
            overview.CUST_ID = customerId;
            overview.PROJ_ID = projectId;
            overview.RAG = "Red";
            overview.DESCRIPTION = " Get CSAT feedback and complete improvement action";
            overview.ORIGINAL_DESCRIPTION = overview.DESCRIPTION;
            overview.SOURCE = "CSAT Improvement";
            overview.OWNER = helper.GetPMEmpInfoFromProject(projectId).FirstOrDefault()?.FRST_NM;
            overview.IDENTIFIED_DATE = DateTime.Today;
            overview.TARGET_DATE = DateTime.Today.AddDays(7);
            overview.STATUS = "In Progress";
            overview.PRIORITY = "High";
            overview.CREATED_BY = "SYSTEM";
            overview.CREATED_DATE = DateTime.Now;
            overview.UPDATED_BY = "SYSTEM";
            overview.UPDATED_DATE = DateTime.Now;
            overview.ISACTIVE = true;
            overview.BATCH_CUSTOMER_MONTHLY_ID = batchCustomerMonthlyId;
            overview.BATCH_CUSTOMER_ID = batchCustomerId;
            AddActionItemInternal(overview);
        }

    }
}