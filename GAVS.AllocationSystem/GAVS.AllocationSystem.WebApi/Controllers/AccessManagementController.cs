using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Web.Http;
using System.Web.UI.WebControls;


namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {


        [POST("RequestEditResourceAccess")]
        [ActionName("RequestEditResourceAccess")]
        [HttpPost]
        public IHttpActionResult RequestEditResourceAccess([FromBody] List<int> resourceId, string feature, string empId, int accessType, string custId, string projId = null)
        {

            if (string.IsNullOrEmpty(empId)) { return BadRequest("Employee ID is required"); }
            if (resourceId == null || resourceId.Count == 0) { return BadRequest("Resource ID list is required"); }
            if (!string.IsNullOrEmpty(projId))
            {
                bool hasAllocation = CheckUserHasAccess(empId, custId, projId, throwError: false);
                if (!hasAllocation)
                {
                    return BadRequest("Employee does not have allocation to the project");
                }
            }
            string accessTypeText = string.Empty;
            switch (accessType)
            {
                case 1:
                    accessTypeText = "EDIT";
                    break;
                case 2:
                    accessTypeText = "VIEW";
                    break;
                case 3:
                    accessTypeText = "DELETE";
                    break;
                default:
                    break;
            }
            var requestId = SaveAccessRequest(resourceId, empId, accessTypeText, projId);
            var subject = $"{accessTypeText} Access Request to {feature}";
            var empName = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId && x.DOR == null);
        
            var mainUrl = $"{helper.GetAbsoulteUri()}/accesscontrolrequest/{custId}/{projId}/{requestId}/{accessTypeText}/{accessType}/";
            string approveUrl = mainUrl + "1";
            string rejectUrl = mainUrl + "0";

            var EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("PROJECT_NAME", GetProjectName(projId));
            EmailContentValues.Add("REQUESTOR_NAME", empName.FRST_NM);
            EmailContentValues.Add("APPROVE", approveUrl);
            EmailContentValues.Add("REJECT", rejectUrl);
            EmailContentValues.Add("REQUESTED_DATE", DateTime.Today.ToString("dd-MMM-yyyy"));
            EmailContentValues.Add("ACCESS_TYPE", accessTypeText);
            var toMail = helper.GetDBConfig("ACCESS_REQUEST_RESOURCE_TOMAIL", "-1");
            var mailContent = helper.GetEmailContent("ResourceAccessRequest.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = toMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = projId },
                      Request
                      )) ;

            return Ok();

        }

        //private bool CheckProjectAllocation(string projId, string empId)
        //{
        //    if (string.IsNullOrWhiteSpace(projId) || string.IsNullOrWhiteSpace(empId))
        //        return false;

        //    var empAllocation = Cldb.PROJECT_RESOURCE.GetAll().Where(x => x.PROJ_ID == projId && x.EMP_ID == empId && x.END_DATE >= DateTime.Today);
        //    if (empAllocation.Any())
        //        return true;

        //    return false;
        //}
        private int SaveAccessRequest(List<int> resourceIds, string empId, string accessTypeText, string projId)
        {
            var sortedResourceIds = string.Join(",", resourceIds.OrderBy(x => x));

            var existingRequest = CSPdb.ACCESS_REQUESTS.GetAll().FirstOrDefault(x => x.CREATED_BY == empId && x.PROJ_ID == projId && x.STATUS == "Pending");
            if (existingRequest != null)
            {
                var existingResourceIds = string.Join(",", existingRequest.RESOURCE_IDS.Split(',').Select(int.Parse).OrderBy(x => x));
                if (existingResourceIds == sortedResourceIds)
                {
                    throw new Exception("You have already requested an access. Please wait for approval.");
                }
            }
            var newRequest = new ACCESS_REQUESTS();
            newRequest.RESOURCE_IDS = sortedResourceIds;
            newRequest.ACCESS_TYPE = accessTypeText;
            newRequest.PROJ_ID = projId;
            newRequest.STATUS = "Pending";
            UpdateAuditFields(newRequest);
            CSPdb.ACCESS_REQUESTS.Add(newRequest);
            CSPdb.Commit(CanCommit);

            return newRequest.ID;
        }

        [POST("ApproveOrRejectEditResourceAccess")]
        [ActionName("ApproveOrRejectEditResourceAccess")]
        [HttpPost]
        public IHttpActionResult ApproveOrRejectEditResourceAccess([FromBody] ACCESS_REQUESTS accessRequestData)
        {


            var accessRequest = CSPdb.ACCESS_REQUESTS.GetAll().FirstOrDefault(x => x.ID == accessRequestData.ID && x.ISACTIVE);
            if (accessRequest == null) { return BadRequest("Access request not found"); }
            if (accessRequestData.APPROVER_ID == accessRequest.CREATED_BY) { return BadRequest("You are not authorized person to approve/reject this request"); }
            if (accessRequest.STATUS != "Pending") { return BadRequest("Request already processed"); }
            // if (accessRequestData.STATUS.ToLower() == "approved")
            // {
            //Check the role of the employee
            //Logic to provide project specific access for the employees to edit/view/delete the findings

            // }
            string requestorEmpId = accessRequest.CREATED_BY;
            accessRequest.STATUS = accessRequestData.STATUS;
            accessRequest.APPROVER_ID = accessRequestData.APPROVER_ID;
            accessRequest.APPROVAL_DATE = accessRequestData.APPROVAL_DATE;
            accessRequest.REJECT_REASON = accessRequestData.REJECT_REASON;
            UpdateAuditFields(accessRequest);
            CSPdb.Commit(CanCommit);
            string subject = string.Empty;
            string mailContent = string.Empty;
            var requestorInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == requestorEmpId && x.DOR == null);
            subject = $"Your access request has been {accessRequestData.STATUS}";
            var approverName = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == accessRequestData.APPROVER_ID && x.DOR == null);
            var EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("APPROVER_NAME", approverName.FRST_NM);
            EmailContentValues.Add("REQUEST_STATUS", accessRequestData.STATUS);
            EmailContentValues.Add("REJECT_REASON", !string.IsNullOrEmpty(accessRequestData.REJECT_REASON) ? accessRequestData.REJECT_REASON : "None");
            EmailContentValues.Add("ACCESS_TYPE", accessRequestData.ACCESS_TYPE);
            EmailContentValues.Add("APPROVAL_DATE", accessRequestData.APPROVAL_DATE?.ToString("dd-MMM-yyyy"));
            EmailContentValues.Add("PROJECT_NAME", GetProjectName(accessRequestData.PROJ_ID));
            EmailContentValues.Add("REQUESTOR_NAME", requestorInfo.FRST_NM);
            var ccMail = helper.GetDBConfig("ACCESS_REQUEST_RESOURCE_TOMAIL", "-1");
            var toMail = requestorInfo.EMAIL_ID;
            mailContent = helper.GetEmailContent("AccessRequestStatus.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = toMail, cc = ccMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                      Request
                      )) ;

            return Ok();
        }

    }
}