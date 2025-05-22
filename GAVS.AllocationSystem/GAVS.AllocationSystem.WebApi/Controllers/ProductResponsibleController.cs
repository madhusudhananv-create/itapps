using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using GAVS.AllocationSystem.WebApi.Models;
using System.Text;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetCustomerDetails")]
        [ActionName("GetCustomerDetails")]
        [HttpGet]
        public IHttpActionResult GetCustomerDetails(string customerId)
        {
            var customer = Cldb.CUSTOMER.GetAll().Where(x => x.CUST_ID == customerId).ToList();
            return Ok(customer);
        }

        [GET("GetProductResponsibleDetails")]
        [ActionName("GetProductResponsibleDetails")]
        [HttpGet]
        public IHttpActionResult GetProductResponsibleDetails(int productId)
        {
            var productResponsibleDetails = Cldb.AppRepo.GetProductResponsibleDetails(productId).ToList();
            return Ok(productResponsibleDetails);
        }

        [GET("GetEmployeeDetailsFromCustomer")]
        [ActionName("GetEmployeeDetailsFromCustomer")]
        [HttpGet]
        public IHttpActionResult GetEmployeeDetailsFromCustomer(string customerId)
        {
            var employeeDetailsFromCustomer = Cldb.AppRepo.GetEmployeeDetailsfromCustomer(customerId).ToList();
            return Ok(employeeDetailsFromCustomer);
        }

        [GET("GetProductResponsibleManagementTypeDetails")]
        [ActionName("GetProductResponsibleManagementTypeDetails")]
        [HttpGet]
        public IHttpActionResult GetProductResponsibleManagementTypeDetails()
        {
            var managementTypes = CSPdb.PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE.GetAll().Where(x => x.ISACTIVE).ToList();
            return Ok(managementTypes);
        }

        [POST("AddUpdateProductResponsible")]
        [ActionName("AddUpdateProductResponsible")]
        [HttpPost]
        public IHttpActionResult AddUpdateProductResponsible([FromBody] PRODUCT_RESPONSIBLE productResponsible)
        {
            CheckAccessForFeature(94);
            LogRequest(prefix:"Product", content: JsonConvert.SerializeObject(productResponsible));
            if (productResponsible == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            PRODUCT_RESPONSIBLE exist = null;
            if (!string.IsNullOrWhiteSpace(productResponsible.EMP_ID))
            {
                exist = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.MANAGEMENT_TYPE == productResponsible.MANAGEMENT_TYPE &&
                 x.PRODUCT_ID == productResponsible.PRODUCT_ID && x.EMP_ID == productResponsible.EMP_ID && x.ISACTIVE);
            }
            else if (!string.IsNullOrWhiteSpace(productResponsible.PROJECT_ID))
            {
                exist = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.MANAGEMENT_TYPE == productResponsible.MANAGEMENT_TYPE &&
                 x.PRODUCT_ID == productResponsible.PRODUCT_ID && x.PROJECT_ID == productResponsible.PROJECT_ID && x.ISACTIVE);
            }

            if (exist != null)
            {
                return Content(HttpStatusCode.Conflict, "Record already exists for this product");
            }

            if (productResponsible.PROJECT_ID != null)
            {
                var productDetail = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == productResponsible.PRODUCT_ID && x.ISACTIVE);
                var project = CSPdb.PORTFOLIO_PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == productResponsible.PROJECT_ID && x.ISACTIVE);

                if(project != null && productDetail != null)
                {
                    project.PORTFOLIO_ID = productDetail.PORTFOLIO_ID;
                    UpdateAuditFields(project);
                    CSPdb.PORTFOLIO_PROJECT.Update(project);
                    CSPdb.Commit(CanCommit);
                }
            }

            if (productResponsible.ID != 0)
            {
                UpdateAuditFields(productResponsible);
                CSPdb.PRODUCT_RESPONSIBLE.Update(productResponsible);
            }
            else
            {
                UpdateAuditFields(productResponsible);
                CSPdb.PRODUCT_RESPONSIBLE.Add(productResponsible);
            }

            CSPdb.Commit(CanCommit);
            SendMailForProductResponsible(productResponsible);
            return Ok();
        }

        [POST("DeleteProductResponsible")]
        [ActionName("DeleteProductResponsible")]
        [HttpPost]
        public IHttpActionResult DeleteProductResponsible([FromBody] PRODUCT_RESPONSIBLE productResponsible)
        {
            CheckAccessForFeature(94);
            LogRequest(prefix: "Product", content: JsonConvert.SerializeObject(productResponsible));
            if (productResponsible == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            var exist = CSPdb.PRODUCT_RESPONSIBLE.GetAll().FirstOrDefault(x => x.ID == productResponsible.ID && x.ISACTIVE);
            if (exist != null)
            {
                UpdateAuditFields(exist);
                exist.ISACTIVE = false;
                CSPdb.PRODUCT_RESPONSIBLE.Update(exist);
                CSPdb.Commit(CanCommit);
            }

            return Ok();
        }

        private void SendMailForProductResponsible(PRODUCT_RESPONSIBLE productResponsible)
        {
            var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(x => x.ID == productResponsible.PRODUCT_ID && x.ISACTIVE).ToList();
            var customerId = product[0].CUST_ID;
            var customerName = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == customerId)?.CUST_NM;
            var productName = product[0].PRODUCT_TITLE;

            var productResponsibleDetails = Cldb.AppRepo.GetProductResponsibleDetails(productResponsible.PRODUCT_ID).ToList();
            var updatedName = productResponsibleDetails.FirstOrDefault(p => p.ID == productResponsible.ID)?.NAME;
            var updatedManagementType = productResponsibleDetails.FirstOrDefault(p => p.ID == productResponsible.ID)?.MANAGEMENT_TYPE;

            var managerMails = string.Join(",", productResponsibleDetails.Where(p => p.MANAGEMENT_TYPE_ID == 1).Select(x => x.MAIL).ToList());
            var leadMails = string.Join(",", productResponsibleDetails.Where(p => p.MANAGEMENT_TYPE_ID == 2).Select(x => x.MAIL).ToList());
            var csmMail = string.Join(",", productResponsibleDetails.Where(p => p.MANAGEMENT_TYPE_ID == 3).Select(x => x.MAIL).ToList());
            var qaMail = string.Join(",", productResponsibleDetails.Where(p => p.MANAGEMENT_TYPE_ID == 4).Select(x => x.MAIL).ToList());

            var toMail = managerMails;
            var subject = $"{updatedName} - {updatedManagementType} updated in {productName} of {customerName}";
            var ccMail = helper.ConcatEmails(new List<string>() { leadMails, csmMail, qaMail });
            var sb = new StringBuilder();
            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/productresponsible";

            for (var i = 0; i < productResponsibleDetails.Count; i++)
            {
                sb.Append("<tr>");
                sb.Append($"<td>{ i + 1}</td>");
                sb.Append($"<td>{ productResponsibleDetails[i].MANAGEMENT_TYPE }</td>");
                sb.Append($"<td>{ productResponsibleDetails[i].NAME }</td>");
                sb.AppendLine("</tr>");
            }

            var emailContentValues = new Dictionary<string, string>();
            emailContentValues.Add("CUSTOMER_NAME", customerName);
            emailContentValues.Add("PRODUCT_NAME", productName);
            emailContentValues.Add("URL", $"{requestDomain}/{path}/{customerId}");
            emailContentValues.Add("TABLE", sb.ToString());
            var mailContent = helper.GetEmailContent("ProductResponsible.htm", emailContentValues);

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
    }
}
