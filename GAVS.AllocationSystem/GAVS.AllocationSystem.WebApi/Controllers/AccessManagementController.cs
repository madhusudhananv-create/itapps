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
        public IHttpActionResult RequestEditResourceAccess([FromBody] int resourceId, string feature, string empId, int accessType, string custId, string projId = null)
        {

            if (string.IsNullOrEmpty(empId)) { return BadRequest("Employee ID is required"); }
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
                case 3:
                    accessTypeText = "EDIT";
                    break;
                case 2:
                    accessTypeText = "CREATED";
                    break;
                case 1:
                    accessTypeText = "VIEW";
                    break;
                case 4:
                    accessTypeText = "DELETE";
                    break;
                default:
                    break;
            }
            var requestId = SaveAccessRequest(resourceId, empId, accessType, projId);
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
        private int SaveAccessRequest(int resourceId, string empId, int accessType, string projId)
        {


            var existingRequest = CSPdb.ACCESS_REQUEST.GetAll().FirstOrDefault(x => x.CREATED_BY == empId && x.PROJ_ID == projId && x.STATUS == "Pending");
            if (existingRequest != null)
            {

                if (existingRequest.RESOURCE_ID == resourceId)
                {
                    throw new Exception("You have already requested an access. Please wait for approval.");
                }
            }
            var newRequest = new ACCESS_REQUEST();
            newRequest.RESOURCE_ID = resourceId;
            newRequest.ACCESS_LEVEL = accessType;
            newRequest.PROJ_ID = projId;
            newRequest.STATUS = "Pending";
            UpdateAuditFields(newRequest);
            CSPdb.ACCESS_REQUEST.Add(newRequest);
            CSPdb.Commit(CanCommit);

            return newRequest.ID;
        }

        [POST("ApproveOrRejectEditResourceAccess")]
        [ActionName("ApproveOrRejectEditResourceAccess")]
        [HttpPost]
        public IHttpActionResult ApproveOrRejectEditResourceAccess([FromBody] ACCESS_REQUEST accessRequestData)
        {


            var accessRequestEty = CSPdb.ACCESS_REQUEST.GetAll().FirstOrDefault(x => x.ID == accessRequestData.ID && x.ISACTIVE);
            if (accessRequestEty == null) { return BadRequest("Access request not found"); }
            var approverList = helper.GetDBConfig("ACCESS_REQUEST_RESOURCE_APPROVERS", "-1");
            //important check
            if (!approverList.Contains(accessRequestEty.REQUESTED_BY))
            {
                return BadRequest("You are not authorized person to approve/reject this request. Please ask the Approvers to approve the request. ");

            }

            if (accessRequestEty.STATUS != "Pending") { return BadRequest("Request already processed. Please create a new request for fresh Approval."); }
            if (accessRequestData.STATUS.ToLower() == "approved")
            {
                //Check the role of the employee
                //Logic to provide project specific access for the employees to edit / view / delete the findings

                //1. get the role of the employee
                var empInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == accessRequestData.REQUESTED_BY && x.DOR == null);
                //do nullcheck

                //2. get all records for this resourceid
                var appaccessControls = CSPdb.APP_ACCESS_CONTROLS.GetAll().Where(x => x.RESOURCE_ID == accessRequestData.RESOURCE_ID && x.ISACTIVE);



                //3. if role and corresponding app_access_control record matches dont do anything
                //4. take the first record which has a role that have access for this resource
                var level = accessRequestData.ACCESS_LEVEL;
                var activeRecord = appaccessControls.FirstOrDefault(x => (level == 1 && x.VIEW_ACCESS) || (level == 2 && x.CREATE_ACCESS)
                                        || (level == 3 && x.EDIT_ACCESS) || (level == 4 && x.DELETE_ACCESS));
                //5. append the given emp_id record in that record and save
                if (activeRecord != null)
                {
                    activeRecord.EMP_ID += $",{accessRequestData.REQUESTED_BY}";
                    UpdateAuditFields(activeRecord);
                    accessRequestEty.STATUS = accessRequestData.STATUS;
                    CSPdb.APP_ACCESS_CONTROLS.Update(activeRecord);
                }
                else
                {
                    //throw error and return
                }


            }
            string requestorEmpId = accessRequestEty.CREATED_BY;
          
            accessRequestEty.APPROVER_ID = accessRequestData.APPROVER_ID;
            accessRequestEty.APPROVAL_DATE = accessRequestData.APPROVAL_DATE;
            accessRequestEty.REJECT_REASON = accessRequestData.REJECT_REASON;
            UpdateAuditFields(accessRequestEty);
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
            //EmailContentValues.Add("ACCESS_TYPE", accessRequestData.ACCESS_LEVEL);
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