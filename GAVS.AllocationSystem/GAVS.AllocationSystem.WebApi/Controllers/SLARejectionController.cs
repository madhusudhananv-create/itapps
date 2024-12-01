using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

       

        [POST("UpdateSLARejection")]
        [ActionName("UpdateSLARejection")]
        [HttpPost]
        public IHttpActionResult UpdateSLARejection([FromBody] List<SLA_Rejection_data> rejectionDetails)
        {
            LogRequest(prefix: "UpdateSLARejection", content: JsonConvert.SerializeObject(rejectionDetails));
            if (rejectionDetails.Any(x => x.SLA_REJECTION_KPI_DETAILS == null))
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Invalid Request. KPI Details not available"));
            var kpiDetailIds = rejectionDetails.Select(x => x.SLA_REJECTION_KPI_DETAILS.KPI_DETAILS_ID).ToList();
            var kpiDetails = CSPdb.KPI_DETAILS.GetAll().Where(x => kpiDetailIds.Contains(x.ID) && x.ISACTIVE).ToList();
            var empId = GetHeaderDetails_String("empId");
            var date = GetHeaderDetails_Date("requestdate");
            SLA_REJECTION rejection = null;
            var rejectionId = rejectionDetails.First().SLA_REJECTION_KPI_DETAILS.REJECTION_ID;
            if (IsGavs())
            {
                rejection = CSPdb.SLA_REJECTION.GetAll().FirstOrDefault(x => x.ID == rejectionId);
                if (rejectionDetails.All(x => x.SLA_REJECTION_KPI_DETAILS.ID == 0))
                {
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Rejection can be created by Customer only."));
                }
                else
                {
                    UpdateRejectionEntities(rejectionDetails);
                    /// Commented as ISdraft =1 not required
                    //foreach (var item in rejectionDetails.Where(x => x.SLA_REJECTION_KPI_DETAILS.STATUS_ID == 2).ToList())//check later
                    //{
                    //    var kpiDetailEty = kpiDetails.FirstOrDefault(x => x.ID == item.SLA_REJECTION_KPI_DETAILS.KPI_DETAILS_ID);
                    //    kpiDetailEty.ISDRAFT = true;
                    //    CSPdb.KPI_DETAILS.Update(kpiDetailEty);
                    //}
                }
            }
            //customer
            else
            {
                //create
                if (rejectionDetails.All(x => x.SLA_REJECTION_KPI_DETAILS.ID == 0))
                {
                    rejection = new SLA_REJECTION
                    {
                        CUSTOMER_EMAIL_ID = empId,
                        ISACTIVE = true
                    };
                    UpdateAuditFields(rejection);
                    CSPdb.SLA_REJECTION.Add(rejection);
                    CSPdb.Commit();

                    foreach (var item in rejectionDetails)
                    {
                        var newEty = item.SLA_REJECTION_KPI_DETAILS;
                        newEty.REJECTION_ID = rejection.ID;
                        UpdateAuditFields(newEty);
                        CSPdb.SLA_REJECTION_KPI_DETAILS.Add(newEty);
                    }
                }
                //update
                else
                {
                    rejection = CSPdb.SLA_REJECTION.GetAll().FirstOrDefault(x => x.ID == rejectionId);
                    UpdateRejectionEntities(rejectionDetails);
                }
            }

            CSPdb.Commit();
            SendMailForSLARejections(rejection, rejectionDetails, kpiDetails, date);

            return Ok();
        }

        [GET("SendKPIReviewFeedback")]
        [ActionName("SendKPIReviewFeedback")]
        [HttpGet]
        public IHttpActionResult SendKPIDetailsToCustomer(int productId, string period)
        {
            LogRequest(prefix: "SLA");
            var empId = GetHeaderDetails_String("empId");
            //get and send mail to product manager
            var respsonsibles = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == productId && x.ISACTIVE).ToList();

            bool isPortfolioLead = respsonsibles.Any(x => x.MANAGEMENT_TYPE == 2 && x.EMP_ID == empId);
            if (!isPortfolioLead)
            {
                return BadRequest("You are not authorized to do this operation. Only Product Leads can do this action.");
            }
            var result = SendKPIDetailsMailToCustomer(respsonsibles, productId, period);
            if (!string.IsNullOrWhiteSpace(result))
            {
                return BadRequest(result);
            }
            return Ok();

        }

        [GET("GetEmployeeRolesForProduct")]
        [ActionName("GetEmployeeRolesForProduct")]
        [HttpGet]
        public IHttpActionResult GetEmployeeRolesForProduct(int productId)
        {
            var roles = new List<int>();
            var empId = GetHeaderDetails_String("empId");
            if (!IsGavs())
            {
                return Ok(roles);
            }
            var result = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == productId && x.EMP_ID == empId && x.ISACTIVE).ToList();
            roles = result.Select(x => x.MANAGEMENT_TYPE).ToList();
            return Ok(roles);
        }

        [POST("SendKPIReviewFeedback")]
        [ActionName("SendKPIReviewFeedback")]
        [HttpPost]
        public IHttpActionResult SendKPIReviewFeedback([FromBody] List<KPI_DETAILS_COMMENT> kpiDetailsCommentList, int productId, string period)
        {
            LogRequest(prefix: "SLA", content: JsonConvert.SerializeObject(kpiDetailsCommentList));
            var empId = GetHeaderDetails_String("empId");
            if (kpiDetailsCommentList == null)
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Invalid Request. KPI Details not available"));
            //get and send mail to product manager
            var respsonsibles = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == productId && x.ISACTIVE).ToList();
            //find user is quality or portfolio Lead, 
            bool isQuality = helper.IsQuality(empId); //respsonsibles.Any(x => x.MANAGEMENT_TYPE == 4 && x.EMP_ID == empId);
            bool isPortfolioLead = respsonsibles.Any(x => x.MANAGEMENT_TYPE == 2 && x.EMP_ID == empId);

            if (!isQuality && !isPortfolioLead)

            {
                return BadRequest("You are not authorized to do this operation. Only Product Quality SPOC or Product Leads can do this action.");
            }

            var kpiDetailsCommentListUpdated = UpdateKpiDetailsComments(kpiDetailsCommentList, empId);
            if (isQuality || isPortfolioLead)
            {
                //send mail to product related people 
                SendMailForSLAReviewFeedback(kpiDetailsCommentList, respsonsibles, productId, period);
            }

            return Ok();
        }

        private List<KPI_DETAILS_COMMENT> UpdateKpiDetailsComments(List<KPI_DETAILS_COMMENT> kpiDetailsCommentList, string empId)
        {
            //get all kpiDetails
            var detailsIds = kpiDetailsCommentList.Select(x => x.KPI_DETAILS_ID).ToList();
            var kpiDetailsList = CSPdb.KPI_DETAILS.GetAll().Where(x => detailsIds.Contains(x.ID)).ToList();
            //sanitize & update
            foreach (var item in kpiDetailsCommentList)
            {
                if (item.IsRejected)
                {
                    var kpiDetails = kpiDetailsList.FirstOrDefault(x => x.ID == item.KPI_DETAILS_ID);
                    kpiDetails.ISDRAFT = true;
                    UpdateAuditFields(kpiDetails);
                    CSPdb.KPI_DETAILS.Update(kpiDetails);
                }
                item.COMMENT_BY = empId;
                item.COMMENT_TIMESTAMP = DateTime.Now;
                UpdateAuditFields(item);
                if (item.ID == 0)
                {
                    Cldb.KPI_DETAILS_COMMENT.Add(item);
                }
                else
                {
                    Cldb.KPI_DETAILS_COMMENT.Update(item);
                }
            }
            CSPdb.Commit();
            Cldb.Commit();
            return kpiDetailsCommentList;
        }

        private List<SLA_REJECTION_KPI_DETAILS> UpdateRejectionEntities(List<SLA_Rejection_data> rejectionDetails)
        {
            var empid = GetHeaderDetails_String("empId");
            var ids = rejectionDetails.Select(x => x.SLA_REJECTION_KPI_DETAILS.ID);
            var existingEntities = CSPdb.SLA_REJECTION_KPI_DETAILS.GetAll().Where(x => ids.Contains(x.ID)).ToList();
            foreach (var item in existingEntities)
            {
                var ety = rejectionDetails.Select(x => x.SLA_REJECTION_KPI_DETAILS).FirstOrDefault(x => x.ID == item.ID);
                if (ety == null) continue;
                var history = new SLA_REJECTION_STATUS_HISTORY
                {
                    REJECTION_ID = item.REJECTION_ID,
                    COMMENT = item.COMMENT,
                    USER_ID = item.CREATED_BY,
                    STATUS_DATE = item.CREATED_DATE,
                    STATUS_ID = item.STATUS_ID
                };
                UpdateAuditFields(history);
                CSPdb.SLA_REJECTION_STATUS_HISTORY.Add(history);
                CSPdb.Commit(true);

                item.COMMENT = ety.COMMENT;
                item.STATUS_ID = ety.STATUS_ID;
                UpdateAuditFields(item, empid);
                CSPdb.SLA_REJECTION_KPI_DETAILS.Update(item);
                CSPdb.Commit(true);
            }
            return existingEntities;
        }

        private List<SLA_Rejection_data> GetSLARejectionData(List<int> kpiDetailsIds)
        {
            var result = new List<SLA_Rejection_data>();
            var statusList = CSPdb.SLA_REJECTION_STATUS.GetAll().ToList();

            var slaEtntities = CSPdb.SLA_REJECTION_KPI_DETAILS.GetAll().Where(x => kpiDetailsIds.Contains(x.KPI_DETAILS_ID) && x.ISACTIVE).ToList();
            if (slaEtntities.Any())
            {
                var slaEtyIds = slaEtntities.Select(x => x.ID).ToList();
                var historyList = CSPdb.SLA_REJECTION_STATUS_HISTORY.GetAll().Where(x => slaEtyIds.Contains(x.REJECTION_ID) && x.ISACTIVE).ToList();
                foreach (var item in slaEtntities)
                {
                    var toAdd = new SLA_Rejection_data
                    {
                        SLA_REJECTION_KPI_DETAILS = item,
                    };
                    toAdd.SLA_REJECTION_KPI_DETAILS.REJECTION_STATUS = statusList.FirstOrDefault(x => x.ID == toAdd.SLA_REJECTION_KPI_DETAILS.STATUS_ID)?.STATUS;
                    result.Add(toAdd);
                }


            }
            else
            {


            }
            return result;
        }


        private void SendMailForSLARejections(SLA_REJECTION rejection, List<SLA_Rejection_data> rejectionData, List<KPI_DETAILS> kpiDetails, DateTime date)
        {
            var kpiDtls = kpiDetails.FirstOrDefault();
            var ccmail = string.Empty;
            var mailContent = string.Empty;
            var typeEmpList = new List<string>();
            dynamic toperson = string.Empty, tomail = string.Empty, selectedccs = "";

            var period = date;

            var portfolioLead = "99";
            var sb = new StringBuilder();

            var productDtls = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDtls.PRODUCT_ID.Value);
            var portfolio = CSPdb.PORTFOLIO.GetAll().FirstOrDefault(x => x.ID == productDtls.PORTFOLIO_ID);
            if (portfolio != null)
                portfolioLead = portfolio.LEAD_EMP_ID;

            var productResponsibleList = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == kpiDtls.PRODUCT_ID.Value && x.ISACTIVE).ToList();

            var subject = string.Empty;
            var empId = GetHeaderDetails_String("empId");
            var customerMail = string.Empty;

            var kpiIdList = kpiDetails.Select(x => x.KPI_ID).ToList();
            var kpiList = CSPdb.KPI.GetAll().Where(x => kpiIdList.Contains(x.ID) && x.ISACTIVE).Select(x => new { KPI_ID = x.ID, KPI_NAME = x.KPI_NAME }).ToList();

            var filePath = string.Empty;
            var statusId = rejectionData.FirstOrDefault().SLA_REJECTION_KPI_DETAILS.STATUS_ID;
            string headerCellStyle = "style='border:solid black 1.0pt;mso-border-alt:solid black .75pt; background:#CCCCFF;padding:3.0pt 3.0pt 3.0pt 3.0pt; height: 7.5pt;text-align:center'";
            string cellStyle = "style='border:solid black 1.0pt;mso-border-alt:solid black .75pt;padding:3.0pt 3.0pt 3.0pt 3.0pt; height: 7.5pt;text-align:center'";

            switch (statusId)
            {
                case 1:
                    filePath = HttpContext.Current.Server.MapPath("~/UploadFile/Mails/") + "SLARejectionByCustomer.htm";
                    subject = $"KPI rejection details for {productDtls.PRODUCT_TITLE} for { date.ToString("MMM-yyyy")}";
                    sb.AppendLine("<table border=1  cellspacing=0 cellpadding=0 style='border-collapse:collapse; border: none; mso-border-alt:solid black .75pt;'> ");
                    sb.AppendLine(string.Format("<tr><th {0}>SNO</th><th {0}>SERVICE LEVEL METRIC</th><th {0}>COMMENT</th></tr>", headerCellStyle));
                    for (int i = 0; i < kpiList.Count; i++)
                    {
                        var kpiDetailId = kpiDetails.FirstOrDefault(x => x.KPI_ID == kpiList[i].KPI_ID).ID;
                        var comment = rejectionData.FirstOrDefault(x => x.SLA_REJECTION_KPI_DETAILS.KPI_DETAILS_ID == kpiDetailId).SLA_REJECTION_KPI_DETAILS.COMMENT;
                        sb.Append("<tr>");
                        sb.Append($"<td {cellStyle}>{ i + 1}</td>");
                        sb.Append($"<td {cellStyle}>{kpiList[i].KPI_NAME}</td>");
                        sb.Append($"<td {cellStyle}>{comment}</td>");
                        sb.AppendLine("</tr>");
                    }
                    sb.AppendLine("</table>");
                    break;
                case 2:
                case 3:
                    subject = $"KPI rejection details for {productDtls.PRODUCT_TITLE} for { date.ToString("MMM-yyyy")}";
                    filePath = HttpContext.Current.Server.MapPath("~/UploadFile/Mails/") + "SLARejectionAcceptRejectByProductManagers.htm";
                    sb.AppendLine("<table border=1  cellspacing=0 cellpadding=0 style='border-collapse:collapse; border: none; mso-border-alt:solid black .75pt;' >");
                    sb.AppendLine(string.Format("<tr><th {0}>SNO</th><th {0}>SERVICE LEVEL METRIC</th><th {0}>COMMENT</th><th {0}>STATUS</th></tr>", headerCellStyle));
                    for (int i = 0; i < rejectionData.Count; i++)
                    {
                        var status = (rejectionData[i].SLA_REJECTION_KPI_DETAILS.STATUS_ID == 2 ? "Accepted" : "Rejected");
                        var kpiId = kpiDetails.FirstOrDefault(x => x.ID == rejectionData[i].SLA_REJECTION_KPI_DETAILS.KPI_DETAILS_ID).KPI_ID;
                        var kpiName = kpiList.FirstOrDefault(x => x.KPI_ID == kpiId).KPI_NAME;
                        sb.Append("<tr>");
                        sb.Append($"<td {cellStyle}>{ i + 1}</td>");
                        sb.Append($"<td {cellStyle}>{kpiName}</td>");
                        sb.Append($"<td {cellStyle}>{rejectionData[i].SLA_REJECTION_KPI_DETAILS.COMMENT}</td>");
                        sb.Append($"<td {cellStyle}>{status}</td>");
                        sb.AppendLine("</tr>");
                    }
                    sb.AppendLine("</table>");
                    break;
                default: break;
            }
            var responsibleEmps = new List<EMP_INFO>();
            if (productResponsibleList.Any())
                typeEmpList = productResponsibleList.Where(p => p.MANAGEMENT_TYPE == 1).Select(x => x.EMP_ID).ToList();
            else
                typeEmpList = productResponsibleList.Where(p => p.MANAGEMENT_TYPE == 4).Select(x => x.EMP_ID).ToList();

            var csm = productResponsibleList.FirstOrDefault(p => p.MANAGEMENT_TYPE == 3)?.EMP_ID;
            var lead = productResponsibleList.FirstOrDefault(p => p.MANAGEMENT_TYPE == 2)?.EMP_ID;
            customerMail = rejection.CUSTOMER_EMAIL_ID;
            var premierPMOMail = helper.GetDBConfig("SLA_REJECTION_MAIL_FOR_PMO", productDtls.CUST_ID);

            var empIds = new List<string>();
            empIds.AddRange(new List<string> { portfolioLead, csm, lead });
            if (typeEmpList != null)
                empIds.AddRange(typeEmpList);
            var empList = Cldb.EMP_INFO.GetAll().Where(x => x.DOR == null && empIds.Contains(x.EMP_ID)).ToList();

            var portfolioManagerEmail = empList.FirstOrDefault(x => x.EMP_ID == portfolioLead)?.EMAIL_ID;
            var managerEmail = empList.FirstOrDefault(x => x.EMP_ID == empId)?.EMAIL_ID;
            var csmMails = empList.FirstOrDefault(x => x.EMP_ID == csm)?.EMAIL_ID;
            var leadMails = empList.FirstOrDefault(x => x.EMP_ID == lead)?.EMAIL_ID;
            var ccList = Constants.PREMIER_QUALITY_TEAM;

            if (typeEmpList != null && typeEmpList.Count > 0)
            {
                responsibleEmps = empList.Where(x => typeEmpList.Contains(x.EMP_ID)).ToList();
                toperson = string.Join(",", responsibleEmps.Select(x => x.FRST_NM));
                tomail = string.Join(",", responsibleEmps.Select(x => x.EMAIL_ID));
            }

            selectedccs += helper.ConcatEmails(new List<string>() { string.Join(",", ccList.Split()), portfolioManagerEmail });
            ccmail = helper.ConcatEmails(new List<string>() { csmMails, leadMails, selectedccs, customerMail, premierPMOMail });
            if (statusId == 3)
                ccmail = helper.ConcatEmails(new List<string>() { ccmail, managerEmail });

            using (System.IO.StreamReader sr = new StreamReader(filePath))
            {
                string emailContent = sr.ReadToEnd();
                emailContent = emailContent.Replace("{{PERSONNM}}", toperson);
                emailContent = emailContent.Replace("{{TABLE}}", sb.ToString());
                emailContent = emailContent.Replace("{{PERIOD}}", date.ToString("MMM-yyyy"));
                int year = 0;
                if (int.TryParse(date.ToString("yyyy"), out year))
                {
                    var path = $"{helper.GetAbsoulteUri()}/successgoal/metric/{productDtls.CUST_ID}/{kpiDtls.PRODUCT_ID}/{kpiDtls.MODE_ID}/{date.ToString("MMM")}/{year}";
                    emailContent = emailContent.Replace("{{URL}}", path);
                }
                var ep = new EmailProvider(Cldb, CSPdb);
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = tomail, cc = ccmail, bcc = Constants.BCC, content = emailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }, Request
                    );
            }

        }

        private void SendMailForSLAReviewFeedback(List<KPI_DETAILS_COMMENT> kpiDetailsCommentList, List<PRODUCT_RESPONSIBLE> responsibleDetails, int productId, string date)
        {
            var ccMail = string.Empty;
            var toMail = string.Empty;
            DateTime originalDate = DateTime.ParseExact(date, "yyyy-MMM-dd", CultureInfo.InvariantCulture);
            string formattedDate = originalDate.ToString("MMM-yyyy");

            var productDetails = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == productId);
            var empIds = new List<string>();
            var leadIds = new List<string>();
            var qaIds = new List<string>();
            foreach (var item in responsibleDetails)
            {
                if (item.MANAGEMENT_TYPE == 1 || item.MANAGEMENT_TYPE == 3)
                {
                    empIds.Add(item.EMP_ID);
                }
                else if (item.MANAGEMENT_TYPE == 4)
                {
                    qaIds.Add(item.EMP_ID);
                }
                else if (item.MANAGEMENT_TYPE == 2)
                {
                    leadIds.Add(item.EMP_ID);
                }
            }
            var EmpList = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID) || leadIds.Contains(x.EMP_ID) || qaIds.Contains(x.EMP_ID)).ToList();
            var leadList = EmpList.Where(x => leadIds.Contains(x.EMP_ID)).ToList();
            var qaList = EmpList.Where(x => qaIds.Contains(x.EMP_ID)).ToList();
            var ccList = EmpList.Where(x => empIds.Contains(x.EMP_ID)).Select(x => x.EMAIL_ID).ToList();
            var leadNames = leadList.Select(x => x.FRST_NM).ToList();
            var leadMails = leadList.Select(x => x.EMAIL_ID).ToList();
            var qaNames = qaList.Select(x => x.FRST_NM).ToList();
            var qaMails = qaList.Select(x => x.EMAIL_ID).ToList();
            var premierQAMail = helper.GetDBConfig("SLA_REVIEW_MAIL_FOR_PQA", productDetails.CUST_ID);

            var qaSpoc = string.Join(",", qaNames);
            var leads = string.Join(",", leadNames);
            toMail = string.Join(",", leadMails);
            ccList.Add(premierQAMail);
            ccList.AddRange(qaMails);
            ccMail = string.Join(",", ccList);
            var subject = $" SLA Review Feedback - {productDetails.PRODUCT_TITLE} for {formattedDate}";

            var detailsIds = kpiDetailsCommentList.Select(x => x.KPI_DETAILS_ID).ToList();
            var kpiDetailsList = CSPdb.KPI_DETAILS.GetAll().Where(x => detailsIds.Contains(x.ID)).ToList();
            var kpiIdList = kpiDetailsList.Select(x => x.KPI_ID).ToList();
            var kpiList = CSPdb.KPI.GetAll().Where(x => kpiIdList.Contains(x.ID) && x.ISACTIVE).ToList();

            var sb = new StringBuilder();
            int i = 1;
            foreach (var item in kpiDetailsCommentList)
            {
                var kpiDetail = kpiDetailsList.FirstOrDefault(x => x.ID == item.KPI_DETAILS_ID);
                sb.Append("<tr>");
                sb.Append($"<td>{i++}</td>");
                sb.Append($"<td>{kpiList.FirstOrDefault(x => x.ID == kpiDetail.KPI_ID).KPI_NAME}</td>");
                sb.Append($"<td>{item.COMMENT}</td>");
                sb.Append($"<td>{kpiDetail.SLA_STATUS}</td>");
                sb.Append($"<td>{kpiDetail.EXCLUSION_SLA_STATUS}</td>");
                sb.Append($"<td>{kpiDetail.KPI_ACTUAL}</td>");
                sb.Append($"<td>{kpiDetail.HIGHLIGHTS}</td>");
                sb.Append($"<td>{(item.IsRejected ? "Yes" : "No")}</td>");
                sb.AppendLine("</tr>");
            }

            var year = originalDate.ToString("yyyy");
            var path = $"{helper.GetAbsoulteUri()}/kpi/{productDetails.CUST_ID}";
            var emailContentValues = new Dictionary<string, string>();
            emailContentValues.Add("PRODUCT_NAME", productDetails.PRODUCT_TITLE);
            emailContentValues.Add("LEAD_NAMES", leads);
            emailContentValues.Add("QA_NAME", qaSpoc);
            emailContentValues.Add("URL", path);
            emailContentValues.Add("TABLE", sb.ToString());
            var mailContent = helper.GetEmailContent("SendReviewFeedbackToLead.htm", emailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                      Request
                      ))
            {

            }
        }

        private string SendKPIDetailsMailToCustomer(List<PRODUCT_RESPONSIBLE> responsibleDetails, int productId, string date)
        {
            var ccMail = string.Empty;
            var toMail = string.Empty;
            DateTime originalDate = DateTime.ParseExact(date, "yyyy-MMM-dd", CultureInfo.InvariantCulture);
            string formattedDate = originalDate.ToString("MMM-yyyy");

            var productDetails = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == productId);

            var empIds = new List<string>();
            var customerIds = new List<string>();
            foreach (var item in responsibleDetails)
            {
                if (item.MANAGEMENT_TYPE == 1 || item.MANAGEMENT_TYPE == 2 || item.MANAGEMENT_TYPE == 3 || item.MANAGEMENT_TYPE == 4)
                {
                    empIds.Add(item.EMP_ID);
                }
                else if (item.MANAGEMENT_TYPE == 5)
                {
                    customerIds.Add(item.EMP_ID);
                }
            }
            if (!customerIds.Any())
            {
                return "There are no customers mapped to this product. So please map it in the product responsible screen.";
            }
            var empId = GetHeaderDetails_String("empId");
            var EmpList = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID) || x.EMP_ID == empId).ToList();
            var customerList = CSPdb.CUSTOMER_USERS.GetAll().Where(x => customerIds.Contains(x.EMAILID)).ToList();
            var ccList = EmpList.Where(x => empIds.Contains(x.EMP_ID)).Select(x => x.EMAIL_ID).ToList();
            var leadName = EmpList.Where(x => x.EMP_ID == empId).Select(x => x.FRST_NM).FirstOrDefault();
            var customerNames = customerList.Select(x => x.DISPLAY_NAME).ToList();
            var customerMails = customerList.Select(x => x.EMAILID).ToList();
            var premierQAMail = helper.GetDBConfig("SLA_REVIEW_MAIL_FOR_PQA", productDetails.CUST_ID);
            ccList.Add(premierQAMail);

            var customer = string.Join(",", customerNames);
            toMail = string.Join(",", customerMails);
            ccMail = string.Join(",", ccList);
            var subject = $"{productDetails.PRODUCT_TITLE} SLA Review Submitted for {formattedDate}";

            var kpiDetailsList = CSPdb.KPI_DETAILS.GetAll().Where(x => x.PERIOD == originalDate && x.PRODUCT_ID == productId && x.ISACTIVE).ToList();
            var detailIdList = kpiDetailsList.Select(x => x.ID).ToList();
            var kpiIdList = kpiDetailsList.Select(x => x.KPI_ID).ToList();
            var kpiList = CSPdb.KPI.GetAll().Where(x => kpiIdList.Contains(x.ID) && x.ISACTIVE).ToList();
            var modeId = kpiList.Select(x => x.MODE_ID).Distinct().FirstOrDefault();

            var productServiceMetricsIds = CSPdb.KPI2PRODUCT_SERVICE_LEVEL_METRICS.GetAll().Where(x => kpiIdList.Contains(x.KPI_ID) && x.ISACTIVE).ToList();
            var productServiceMetricsIdList = productServiceMetricsIds.Select(x => x.PRODUCT_SERVICE_LEVEL_METRICS_ID).ToList();
            var referenceIds = CSPdb.PRODUCT_SERVICE_LEVEL_METRICS.GetAll().Where(x => productServiceMetricsIdList.Contains(x.ID) && x.ISACTIVE).ToList();
            var referenceIdList = referenceIds.Select(x => x.REFERENCE_ID).ToList();
            var productReferenceIds = CSPdb.REFERENCE_MASTER.GetAll().Where(x => referenceIdList.Contains(x.ID) && x.ISACTIVE).ToList();
            var productReferenceIdList = productReferenceIds.Select(x => x.ID).ToList();

            var sb = new StringBuilder();
            int i = 1;
            var kpiDetailsCommentList = Cldb.KPI_DETAILS_COMMENT.GetAll().Where(x => detailIdList.Contains(x.KPI_DETAILS_ID) && x.ISACTIVE).ToList();
            foreach (var item in kpiDetailsList)
            {
                var kpiCommentDetails = kpiDetailsCommentList.FirstOrDefault(x => x.KPI_DETAILS_ID == item.ID);
                var productServiceMetricsId = productServiceMetricsIds.FirstOrDefault(x => x.KPI_ID == item.KPI_ID);
                var referenceId = referenceIds.FirstOrDefault(x => x.ID == productServiceMetricsId.PRODUCT_SERVICE_LEVEL_METRICS_ID);
                var productReferenceId = productReferenceIds.FirstOrDefault(x => x.ID == referenceId.REFERENCE_ID);
                sb.Append("<tr>");
                sb.Append($"<td>{i++}</td>");
                sb.Append($"<td>{productReferenceId.REFERENCE}</td>");
                sb.Append($"<td>{kpiList.FirstOrDefault(x => x.ID == item.KPI_ID).KPI_NAME}</td>");
                sb.Append($"<td>{item.SLA_STATUS}</td>");
                sb.Append($"<td>{item.EXCLUSION_SLA_STATUS}</td>");
                sb.Append($"<td>{item.KPI_ACTUAL}</td>");
                sb.Append($"<td>{item.HIGHLIGHTS}</td>");
                sb.Append($"<td>{(kpiCommentDetails == null ? "" : kpiCommentDetails.COMMENT)}</td>");
                sb.AppendLine("</tr>");
            }

            var year = originalDate.ToString("yyyy");
            var path = $"{helper.GetAbsoulteUri()}/successgoal/metric/{productDetails.CUST_ID}/{productId}/{modeId}/{originalDate.ToString("MMM")}/{year}";
            var emailContentValues = new Dictionary<string, string>();
            emailContentValues.Add("PRODUCT_NAME", productDetails.PRODUCT_TITLE);
            emailContentValues.Add("CUSTOMER_NAMES", customer);
            emailContentValues.Add("LEAD_NAME", leadName);
            emailContentValues.Add("DATE", formattedDate);
            emailContentValues.Add("URL", path);
            emailContentValues.Add("TABLE", sb.ToString());
            var mailContent = helper.GetEmailContent("SendReviewFeedbackToCustomer.htm", emailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                      Request
                      ))
            {

            }
            return string.Empty;
        }

    }
}