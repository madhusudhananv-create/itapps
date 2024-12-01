using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Base;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Web.Http;
using System.Web.UI.WebControls;
using EF = GAVS.AllocationSystem.WebApi.DBContext;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        List<string> missingCSM = new List<string>
        {

"alwinking.rajamani@gavstech.com",
"arunkumar.singh@GAVSTECH.COM",

"elangovan.s@gavstech.com",
"gautam.burse@gslab.com",
"guru.bhoopala@gavstech.com",
"ishwarya.m@gavstech.com",
"juliana.koshy@gavstech.com",
 
"kumararaman.h@gavstech.com",
"kumarvel.sk@GAVSTECH.COM",
"mayilsamy.k@gavstech.com",
"priyanand.somisetty@gavstech.com",
"rajeshkumar.vp@GAVSTECH.COM",
"ramesh.jayachandar@gavstech.com",
"ravindran.c@gavstech.com",
"shruti.kapoor@gavstech.com",
"sundara.rajulu@gavstech.com",
"suraaj.doshi@gavstech.com",
"swapnil.warkar@gslab.com",
"Vasan.Rajesh@gavstech.com"
        };

        private void GenerateCSSReadinessReport()
        {
            var startDate = new DateTime(2024, 7, 1);
            var endDate = new DateTime(2024, 9, 30);
            int i = 0;
            var result = Cldb.AppRepo.getCSS_Readiness_Info(startDate, endDate).Where(x => x.PROJECT_TYPE.ToUpper() != "INTERNAL").ToList();
            var absoluteUrl = helper.GetAbsoulteUri();
            foreach (var item in result.GroupBy(x => x.CSM_MAIL))
            {
                if (!missingCSM.Contains(item.Key)) continue;
                //if (item.All(x => x.CSS_Eligible.ToUpper() == "NO")) continue;
                //if (item.All(x => x.CSS_CONFIGURED.ToUpper() == "YES")) continue;
                var toMail = item.Key;
                var ccMail = string.Join(",", item.Select(x => x.PM_MAIL).Distinct().ToList());
                ccMail += "," + Constants.DEVX_MAIL;
                var sbNonEligeible = new StringBuilder();
                var sbEligeible = new StringBuilder();

                foreach (var p in item.Where(x => x.CSS_Eligible.ToUpper() == "NO").Distinct().ToList())
                {
                    var verificationLink = string.Empty;
                    var skipCSATLink = string.Empty;
                    var contactLink = absoluteUrl + $"/layout/contacts/{p.CUST_ID}";

                    if (string.IsNullOrWhiteSpace(p.SKIP_CSAT))
                    {
                        skipCSATLink = absoluteUrl + $"/layout/projectdataconfiguration/{p.CUST_ID}";
                    }

                    //sb.Append("<tr style=\"border: 1px solid black; padding: 8px; text - align: left;\"> ");
                    sbNonEligeible.Append("<tr>");
                    sbNonEligeible.Append($"<td>{p.PROJ_NM}</td><td>{p.START_DATE}</td><td>{p.END_DATE}</td><td>{p.PROJ_STATUS}</td><td>{p.Reason}</td><td>{p.CSS_CONFIGURED}</td><td>{p.RESPONDENT_NAME}</td><td>{p.RESPONDENT_MAIL}</td><td>{contactLink}</td><td>{skipCSATLink}</td><td>{p.PM}</td><td>{p.CUST_NM}</td>");
                    sbNonEligeible.Append("</tr>");
                    sbNonEligeible.AppendLine();

                }
                var eligible = false;
                foreach (var p in item.Where(x => x.CSS_Eligible.ToUpper() == "YES").Distinct().ToList())
                {
                    eligible = true;
                    var verificationLink = string.Empty;
                    var skipCSATLink = string.Empty;
                    var contactLink = absoluteUrl + $"/layout/contacts/{p.CUST_ID}";

                    //if (p.CSS_CONFIGURED.ToUpper() == "YES" && p.CUSTOMER_CONTACT_VERIFICATION.ToUpper() != "YES")
                    //{
                    //    if (p.BATCH_ID.HasValue && p.BATCH_CUSTOMER_ID.HasValue)
                    //        verificationLink = absoluteUrl + $"/css/{p.BATCH_ID.Value}/{p.BATCH_CUSTOMER_ID}/1";
                    //    else if (p.BATCH_MONTHLY_ID.HasValue && p.BATCH_CUSTOMER_MONTHLY_ID.HasValue)
                    //        verificationLink = absoluteUrl + $"/css/{p.BATCH_MONTHLY_ID.Value}/{p.BATCH_CUSTOMER_MONTHLY_ID}/1";
                    //}
                    if (string.IsNullOrWhiteSpace(p.SKIP_CSAT))
                    {
                        skipCSATLink = absoluteUrl + $"/layout/projectdataconfiguration/{p.CUST_ID}";
                    }
                    sbEligeible.Append("<tr>");
                    //sbEligeible.Append($"<td>{p.CUST_NM}</td><td>{p.PROJ_NM}</td><td>{p.START_DATE}</td><td>{p.END_DATE}</td><td>{p.PROJ_STATUS}</td><td>{p.CSS_Eligible}</td><td>{p.Reason}</td><td>{p.CSS_CONFIGURED}</td><td>{p.RESPONDENT_NAME}</td><td>{p.RESPONDENT_MAIL}</td><td>{p.CUSTOMER_CONTACT_VERIFICATION}</td><td>{p.PM}</td><td>{verificationLink}</td><td>{skipCSATLink}</td>");
                    sbEligeible.Append($"<td>{p.PROJ_NM}</td><td>{p.START_DATE}</td><td>{p.END_DATE}</td><td>{p.PROJ_STATUS}</td><td>{p.CSS_CONFIGURED}</td><td>{p.RESPONDENT_NAME}</td><td>{p.RESPONDENT_MAIL}</td><td>{contactLink}</td><td>{skipCSATLink}</td><td>{p.PM}</td><td>{p.CUST_NM}</td>");
                    sbEligeible.Append("</tr>");
                    sbNonEligeible.AppendLine();
                }
                if (!eligible)
                {
                    sbEligeible.AppendLine("<tr><td colspan=11>-</td></tr>");
                     
                }
                string period = GetCurrentPeriodStringNew("quarterly", (startDate.Month - 1) / 3, startDate.Year);
                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("CSM_NAME", item.First().CSM);
                EmailContentValues.Add("INELIGIBLE_CONTENT", sbNonEligeible.ToString());
                EmailContentValues.Add("ELIGIBLE_CONTENT", sbEligeible.ToString());
                EmailContentValues.Add("CSS_PERIOD", period);
                var mailContent = helper.GetEmailContent("CSSReadiness.htm", EmailContentValues);
                var ep = new EmailProvider(Cldb, CSPdb);

                var mailSubject = $"Action Needed - {period} Customer Success Survey Readiness for your Projects";

                if (ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.CSS_BCC, content = mailContent, subject = mailSubject, hasAttachments = false, attachmentFilePath = "" },
                Request
                )) ;
                //if (i++ == 5) break;
            }
        }

        private void GenerateAutoRisk(int batchId, string batchType)
        {
            var targetDate = DateTime.Now.AddDays(20);
            var currentDate = DateTime.Now;
            var validity = helper.GetDBConfigValue("CSS_LINK_VALIDITY_DAYS", "-1", null);
            int.TryParse(validity, out int val);
            var projIds = new List<string>();
            var completedCustIds = new List<string>();
            var incompletedProjIds = new List<string>();
            var batchList = new List<iBatchCustomer>();
            var filtertedbatchList = new List<iBatchCustomer>();
            var prevDate = DateTime.Today.AddMonths(-1);
            var period = string.Empty;
            if (batchType == "batch")
            {
                var batchCustomerList = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == batchId && t.SURVEY_SENT_DATE.HasValue && t.SURVEY_SENT_DATE < prevDate && t.ISACTIVE).ToList();
                completedCustIds = batchCustomerList.Where(t => t.STATUS == "COMPLETED").Select(p => p.PROJ_ID).Distinct().ToList();
                batchList = batchCustomerList.Where(t => t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT").ToList<iBatchCustomer>();
                var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batchId);
                if (batch != null)
                {
                    period = GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR);
                }
            }
            else if (batchType == "batchmonthly")
            {
                var batchCustomerMonthlyList = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batchId
                                       && t.PROJ_ID != null && t.SURVEY_SENT_DATE.HasValue && t.SURVEY_SENT_DATE < prevDate && t.ISACTIVE).ToList();
                completedCustIds = batchCustomerMonthlyList.Where(t => t.STATUS == "COMPLETED").Select(p => p.PROJ_ID).Distinct().ToList();
                batchList = batchCustomerMonthlyList.Where(t => t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT").ToList<iBatchCustomer>();
                var batch = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchId);
                if (batch != null)
                {
                    period = GetCurrentPeriodStringNew("quarterly", (batch.MONTH - 1) / 3, batch.YEAR);
                }
            }

            foreach (var t in batchList)
            {
                if (!completedCustIds.Contains(t.PROJ_ID))
                {
                    if (helper.GetLaterDateForCSSValidity(t.SURVEY_SENT_DATE.Value, val) < currentDate && !string.IsNullOrWhiteSpace(t.PROJ_ID))
                    {
                        filtertedbatchList.Add(t);
                    }
                }
            }
            projIds = filtertedbatchList.Select(x => x.PROJ_ID).Distinct().ToList();
            var projects = Cldb.PROJECT.GetAll().Where(x => projIds.Contains(x.PROJ_ID)).ToList();
            var empIds = projects.Select(p => p.PROJ_PM_EMP_ID).ToList();
            var empInfo = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID)).ToList();
            var existingRisks = CSPdb.PROJECT_RISK.GetAll().Where(x => x.RISK_CATEGORY == "Strategic risk" && x.ISACTIVE).ToList();


            foreach (var item in projIds)
            {
                if (existingRisks.Any(x => x.PROJECT_ID == item && x.DESCRIPTION.Contains(period))) continue;
                var pmId = projects.FirstOrDefault(x => x.PROJ_ID == item)?.PROJ_PM_EMP_ID;
                string pmName = empInfo.FirstOrDefault(x => x.EMP_ID == pmId)?.FRST_NM;
                AddRiskInternal(CreateRisk(item, targetDate, period, pmName));
            }
        }
        private PROJECT_RISK CreateRisk(string projectId, DateTime targetDate, string period, string pmName)
        {
            var risk = new PROJECT_RISK
            {
                PROJECT_ID = projectId,
                DESCRIPTION = $"Customer success/satisfaction level would not be known in the absence of customer feedback on the service delivered in the quarter {period} may lead to missed opportunities for improvement and potential loss of business from the customer.",
                IMPACT = "Potential loss of repeat business and customer may not provide a reference.",
                RISK_CATEGORY = "Strategic risk",
                IDENTIFIED_BY = "Process Excellence Team or PeX Team",
                IDENTIFIED_DATE = DateTime.Now,
                IMPACT_SCALE = 4,
                PROBABILITY_SCALE = 4,
                RAG = string.Empty,
                LOCATION = string.Empty,
                OWNER = pmName ?? "Team",
                TARGET_DATE = targetDate,
                STATUS = "Identified",
                RISK_LEVEL = "High",
                ACTION_ITEM_DESCRIPTION = $"Customer success/satisfaction level would not be known in the absence of customer feedback on the service delivered in the quarter {period} which may lead to missed opportunities for improvement and potential loss of business from the customer.",
                ACTION_ITEM_TARGET_DATE = targetDate,
                ACTION_ITEM_STATUS = "Identified",
                ACTION_ITEM_OWNER = pmName,
                ACTION_ITEM_IDENTIFIED_DATE = DateTime.Now
            };
            UpdateAuditFields(risk);
            return risk;
        }
    }
}