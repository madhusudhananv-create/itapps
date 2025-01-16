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
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.Filters;
using System.Web.Http.Results;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [POST("AddIssue")]
        [ActionName("AddIssue")]
        [HttpPost]
        public IHttpActionResult AddIssue(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;

            dynamic json = jsonContent;

            PROJECT_ISSUEEXT results = JsonConvert.DeserializeObject<PROJECT_ISSUEEXT>(json);

            PROJECT_ISSUE overview = new PROJECT_ISSUE();

            if (results != null)
            {
                overview.PROJECT_ID = results.PROJECT_ID;
                overview.RAG = results.RAG;
                overview.DESCRIPTION = results.DESCRIPTION;
                overview.IMPACT_SUMMARY = results.IMPACT_SUMMARY;
                overview.IS_POTENTIAL_RISK = results.IS_POTENTIAL_RISK;
                if (results.IS_POTENTIAL_RISK)
                {
                    overview.BUSINESS_IMPACT = results.BUSINESS_IMPACT;
                    overview.BUSINESS_IMPACT_DESC = results.BUSINESS_IMPACT_DESC;
                }
                overview.GEO_LOCATION = results.GEO_LOCATION;
                overview.ISSUE_TYPE = results.ISSUE_TYPE;
                overview.SEVERITY = results.SEVERITY;
                overview.ACTION_PLAN = results.ACTION_PLAN;
                overview.ASSIGNED_TO = results.ASSIGNED_TO;
                overview.IDENTIFIED_BY = results.IDENTIFIED_BY;
                overview.REPORTED_BY = results.REPORTED_BY;
                overview.LEVEL = results.LEVEL;
                overview.STATUS = results.STATUS;
                overview.IDENTIFIED_DATE = results.IDENTIFIED_DATE.ToLocalTime();
                overview.TARGET_DATE = results.TARGET_DATE.GetValueOrDefault(DateTime.Today).ToLocalTime();
                overview.ISSUE_RESOLVED_DATE = results.ISSUE_RESOLVED_DATE.HasValue ? results.ISSUE_RESOLVED_DATE.Value.ToLocalTime() : (DateTime?)null;
                overview.COMMENTS = results.COMMENTS;
                overview.ROOTCAUSE = results.ROOTCAUSE;

                overview.SUBVERTICAL = results.SUBVERTICAL;
                if(results.ACK_DATE.HasValue)
                    overview.ACK_DATE = results.ACK_DATE.GetValueOrDefault(DateTime.Today).ToLocalTime();  
                overview.SERVICE_IMPACT = results.SERVICE_IMPACT;
                overview.FINANCIAL_IMPACT = results.FINANCIAL_IMPACT;

                overview.FINANCIAL_IMPACT_DESCRIPTION = results.FINANCIAL_IMPACT_DESCRIPTION;
                overview.LOCATION_SELECTION = results.LOCATION_SELECTION;
                overview.ISSUE_SOURCE = results.ISSUE_SOURCE;
                overview.ISSUE_SOURCE_OTHER = results.ISSUE_SOURCE_OTHER;
                UpdateAuditFields(overview);
                CSPdb.PROJECT_ISSUE.Add(overview);
                CSPdb.Commit(CanCommit);
                results.ID = overview.ID;
                results.CREATED_DATE = overview.CREATED_DATE;
                results.UPDATED_DATE = overview.UPDATED_DATE;
                UpdateRag(results.PROJECT_ID, ragCategory.issue, results.RAG, results.CREATED_BY);
                UpdateLastUpdatedDetails(results.PROJECT_ID, results.UPDATED_BY);
            }

            //AddNewIssue Mail_start

            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == overview.PROJECT_ID);

            if (project == null)
                return Ok(results);
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


            subject = $"New Issue Identified - Project: {projectName}; Customer: {customerName}";
            ccmail = helper.ConcatEmails(new List<string>() { ccmail, csmMails, qualitySpoc });

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("Project Name", projectName);
            EmailContentValues.Add("Issue Description", overview.DESCRIPTION);
            EmailContentValues.Add("Impact Summary", overview.IMPACT_SUMMARY);
            EmailContentValues.Add("Is Potential Risk", overview.IS_POTENTIAL_RISK ? YES : NO);
            EmailContentValues.Add("Business Impact", string.IsNullOrWhiteSpace(overview.BUSINESS_IMPACT) ? "-" : overview.BUSINESS_IMPACT);
            EmailContentValues.Add("Location", overview.LOCATION_SELECTION + " " + overview.GEO_LOCATION);
            EmailContentValues.Add("Issue Type", overview.ISSUE_TYPE);
            EmailContentValues.Add("Severity", overview.SEVERITY);
            EmailContentValues.Add("Action Plan / Steps", overview.ACTION_PLAN);
            EmailContentValues.Add("Assigned To", overview.ASSIGNED_TO);
            EmailContentValues.Add("Identified By", overview.IDENTIFIED_BY);
            EmailContentValues.Add("Reported By", overview.REPORTED_BY);
            EmailContentValues.Add("Level", overview.LEVEL);
            EmailContentValues.Add("Identified Date", overview.IDENTIFIED_DATE.ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Target Date", overview.TARGET_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Status", overview.STATUS);
            EmailContentValues.Add("Issue Resolved Date", !overview.ISSUE_RESOLVED_DATE.HasValue ? "-" : overview.ISSUE_RESOLVED_DATE.GetValueOrDefault().ToLocalTime().ToString(_dateformat));
            EmailContentValues.Add("Comments / Final resolution", overview.COMMENTS);

            mailContent = helper.GetEmailContent("AddNewIssue.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = overview.PROJECT_ID },
                Request
                );

            //AddNewIssue Mail_End

            LoadOverAllIssuesData();
            return Ok(results);
        }



        [POST("UpdateIssue")]
        [ActionName("UpdateIssue")]
        [HttpPost]
        public IHttpActionResult UpdateIssue(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            PROJECT_ISSUE results = JsonConvert.DeserializeObject<PROJECT_ISSUE>(json);
            PROJECT_ISSUE overview = CSPdb.PROJECT_ISSUE.GetAll().Where(t => t.ID == results.ID).FirstOrDefault<PROJECT_ISSUE>();
            if (overview != null && results != null)
            {
                overview.PROJECT_ID = results.PROJECT_ID;
                overview.DESCRIPTION = results.DESCRIPTION;
                overview.ISSUE_TYPE = results.ISSUE_TYPE;
                overview.IMPACT_SUMMARY = results.IMPACT_SUMMARY;
                overview.IS_POTENTIAL_RISK = results.IS_POTENTIAL_RISK;
                if (results.IS_POTENTIAL_RISK)
                {
                    overview.BUSINESS_IMPACT = results.BUSINESS_IMPACT;
                    overview.BUSINESS_IMPACT_DESC = results.BUSINESS_IMPACT_DESC;
                }
                else  
                {
                    overview.BUSINESS_IMPACT = null;
                    overview.BUSINESS_IMPACT_DESC = null;
                }

                overview.SEVERITY = results.SEVERITY;
                overview.ACTION_PLAN = results.ACTION_PLAN;
                overview.ASSIGNED_TO = results.ASSIGNED_TO;
                overview.IDENTIFIED_BY = results.IDENTIFIED_BY;
                overview.REPORTED_BY = results.REPORTED_BY;
                overview.LEVEL = results.LEVEL;
                overview.STATUS = results.STATUS;
                overview.IDENTIFIED_DATE = results.IDENTIFIED_DATE.ToLocalTime();
                overview.TARGET_DATE = results.TARGET_DATE.GetValueOrDefault(DateTime.Today).ToLocalTime();
                overview.ISSUE_RESOLVED_DATE = results.ISSUE_RESOLVED_DATE.HasValue ? results.ISSUE_RESOLVED_DATE.Value.ToLocalTime() : (DateTime?)null;
                overview.COMMENTS = results.COMMENTS;
                overview.ROOTCAUSE = results.ROOTCAUSE;

                overview.SUBVERTICAL = results.SUBVERTICAL;
                if (results.ACK_DATE.HasValue)
                    overview.ACK_DATE = results.ACK_DATE.GetValueOrDefault(DateTime.Today).ToLocalTime();
                overview.SERVICE_IMPACT = results.SERVICE_IMPACT;
                overview.FINANCIAL_IMPACT = results.FINANCIAL_IMPACT;
                if (overview.FINANCIAL_IMPACT.GetValueOrDefault())
                    overview.FINANCIAL_IMPACT_DESCRIPTION = results.FINANCIAL_IMPACT_DESCRIPTION;
                else overview.FINANCIAL_IMPACT_DESCRIPTION = string.Empty;
                overview.LOCATION_SELECTION = results.LOCATION_SELECTION;

                if (!string.IsNullOrWhiteSpace(overview.LOCATION_SELECTION) && overview.LOCATION_SELECTION.ToUpper() == "OTHER")
                    overview.GEO_LOCATION = results.GEO_LOCATION;
                else
                    overview.GEO_LOCATION = string.Empty;
                overview.ISSUE_SOURCE = results.ISSUE_SOURCE;
                if (!string.IsNullOrWhiteSpace(overview.ISSUE_SOURCE) && overview.ISSUE_SOURCE.ToUpper() == "OTHER")
                    overview.ISSUE_SOURCE_OTHER = results.ISSUE_SOURCE_OTHER;
                else
                    overview.ISSUE_SOURCE_OTHER = string.Empty;


                UpdateAuditFields(overview);
                CSPdb.PROJECT_ISSUE.Update(overview);
                CSPdb.Commit(CanCommit);
                UpdateLastUpdatedDetails(results.PROJECT_ID, results.UPDATED_BY);
                //SendUpdateMail<PROJECT_RISK>(results, overview, project, FieldNameWithCaptionList, "Risk Updated for " + project.PROJ_NM);
            }
            LoadOverAllIssuesData();
            return Ok();
        }
    }
}