using AttributeRouting.Web.Mvc;
using System;
using System.Web.Http;
using System.Linq;
using GAVS.AllocationSystem.Model.CSP;
using System.Collections.Generic;
using GAVS.AllocationSystem.Model.AllSys;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetAllCustomerUser")]
        [ActionName("GetAllCustomerUser")]
        [HttpGet]
        public IHttpActionResult GetAllCustomerUser(string customerId, string projId, bool isMonthly)
        {
            List<CUSTOMER_USERS> usersData = new List<CUSTOMER_USERS>();
            List<int> ids = new List<int>();
            List<CUSTOMER_PROJECTS> userIds = new List<CUSTOMER_PROJECTS>();
            if (isMonthly)
            {
                userIds = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.CUST_ID == customerId && t.CSAT_FREQUENCY == "Monthly").ToList<CUSTOMER_PROJECTS>();
            }
            else if (!string.IsNullOrEmpty(projId))
            {
                userIds = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.PROJ_ID == projId && t.CUST_ID == customerId).ToList();
            }
            else
            {
                userIds = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.CUST_ID == customerId).ToList();
            }
            ids = userIds.Select(t => t.CUSTOMER_USER_ID).ToList<int>();
            //pick users who are not configured in customer projects
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.CUSTOMER_ID == customerId && x.ISACTIVE).ToList();

            usersData = CSPdb.CUSTOMER_USERS.GetAll().Where(t => ids.Contains(t.ID)).OrderBy(t => t.DISPLAY_NAME.Trim()).ToList();
            return Ok(usersData);
        }

        [POST("GetSurveyGuid")]
        [ActionName("GetSurveyGuid")]
        [HttpPost]
        public IHttpActionResult GetSurveyGuid([FromBody] SURVEY_SEARCH_CRITERIA surveyCriteria)
        {
            int? batchId; int? custbatchId = null ; string guid = null;
            string frequency = "Quarterly";
            string frequency1 = string.Empty;
            iBatchCustomer batchCustomer = null;
            string status = string.Empty;
            int batchCustomerId = 0;
            string spoc = "";
            if (surveyCriteria != null)
            {
                if (surveyCriteria.QUARTER == 5 || surveyCriteria.QUARTER == 6)
                {
                    frequency1 = "halfyearly";
                    frequency = "half-yearly";
                    surveyCriteria.QUARTER -= 4;
                }
                if (surveyCriteria.IS_MONTHLY)
                {
                    var cssBatchMonthly = new CSS_BATCH_MONTHLY();
                    var quarterlyDates = QuarterDates(surveyCriteria.QUARTER, surveyCriteria.YEAR);
                    cssBatchMonthly.START_DATE = quarterlyDates.Item1;
                    cssBatchMonthly.END_DATE = quarterlyDates.Item2;
                    batchId = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(t => t.START_DATE == cssBatchMonthly.START_DATE && t.END_DATE == cssBatchMonthly.END_DATE &&
                                t.YEAR == surveyCriteria.YEAR)?.ID;
                    if (batchId.HasValue)
                    {
                        if (surveyCriteria.IS_QUALITATIVE_FEEDBACK)
                        {
                            custbatchId = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(t => t.BATCH_MONTHLY_ID == batchId && t.CUST_ID == surveyCriteria.CUST_ID && t.PROJ_ID == surveyCriteria.PROJ_ID && t.EMAIL_ID == surveyCriteria.USER_EMAIL_ID && (t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT"))?.ID;
                        }
                        else
                        {
                            custbatchId = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(t => t.BATCH_MONTHLY_ID == batchId && t.CUST_ID == surveyCriteria.CUST_ID && t.PROJ_ID == surveyCriteria.PROJ_ID && t.EMAIL_ID == surveyCriteria.USER_EMAIL_ID && t.STATUS == "COMPLETED")?.ID;
                        }
                        if (custbatchId.HasValue && custbatchId > 0)
                            guid = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(t => t.BATCH_CUSTOMER_MONTHLY_ID == custbatchId).SURVEY_ID;
                    }
                }
                else
                {
                    if (string.IsNullOrEmpty(surveyCriteria.PROJ_ID))
                    {
                        frequency = "Annual";
                        batchId = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(t => (t.FREQUENCY.ToLower() == frequency) && t.YEAR == surveyCriteria.YEAR)?.ID;

                    }
                    else
                    {
                        batchId = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(t => t.SEQUENCE == surveyCriteria.QUARTER && (t.FREQUENCY.ToLower() == frequency || t.FREQUENCY.ToLower() == frequency1) && t.YEAR == surveyCriteria.YEAR)?.ID;

                    }
                    if (batchId.HasValue)
                    {
                        if (surveyCriteria.IS_QUALITATIVE_FEEDBACK)
                        {
                            batchCustomer = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(t => t.BATCH_ID == batchId && t.CUST_ID == surveyCriteria.CUST_ID && t.PROJ_ID == surveyCriteria.PROJ_ID && (t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT") && t.EMAIL_ID == surveyCriteria.USER_EMAIL_ID);
                        }
                        else if (!string.IsNullOrEmpty(surveyCriteria.PROJ_ID))
                        {
                            batchCustomer = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(t => t.BATCH_ID == batchId && t.ISACTIVE && t.CUST_ID == surveyCriteria.CUST_ID && t.PROJ_ID == surveyCriteria.PROJ_ID && t.STATUS == "COMPLETED" && t.EMAIL_ID == surveyCriteria.USER_EMAIL_ID);
                        }
                        else
                        {
                            batchCustomer = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(t => t.BATCH_ID == batchId && t.ISACTIVE && t.CUST_ID == surveyCriteria.CUST_ID && t.STATUS == "COMPLETED" && t.EMAIL_ID == surveyCriteria.USER_EMAIL_ID);
                        }
                        if (batchCustomer != null)
                        {
                            custbatchId = batchCustomer.ID;
                            status = batchCustomer.STATUS;
                            guid = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(t => t.BATCH_CUSTOMERS_ID == custbatchId).SURVEY_ID;
                            if (!string.IsNullOrWhiteSpace(batchCustomer.SPOC))
                                spoc = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.DOR == null && x.EMAIL_ID == batchCustomer.SPOC)?.EMP_ID;
                        }


                    }
                }
            }
            return Ok(new { guid = guid, status = status, batchCustomerId = custbatchId.GetValueOrDefault(), spoc = spoc });
        }

        [GET("GetReportDetails")]
        [ActionName("GetReportDetails")]
        [HttpGet]

        public IHttpActionResult GetReportDetails(bool isMonthly)
        {
            int? reportId; List<REPORTS_PARAMS> param = new List<REPORTS_PARAMS>();
            if (isMonthly)
            {
                reportId = Cldb.REPORTS_SP_DETAILS.GetAll().FirstOrDefault(t => t.SP_DISPLAY_NAME == "CSS Report Monthly")?.ID;
                if (reportId > 0)
                    param = Cldb.REPORTS_PARAMS.GetAll().Where(t => t.REPORT_SP_ID == reportId).ToList<REPORTS_PARAMS>();
            }
            else
            {
                reportId = Cldb.REPORTS_SP_DETAILS.GetAll().FirstOrDefault(t => t.SP_DISPLAY_NAME == "CSS Report")?.ID;
                if (reportId > 0)
                    param = Cldb.REPORTS_PARAMS.GetAll().Where(t => t.REPORT_SP_ID == reportId).ToList<REPORTS_PARAMS>();
            }

            return Ok(param);
        }

        [GET("GetReportSpName")]
        [ActionName("GetReportSpName")]
        [HttpGet]

        public IHttpActionResult GetReportSpName(bool isMonthly)
        {
            string spName = "";
            if (isMonthly)
            {
                spName = Cldb.REPORTS_SP_DETAILS.GetAll().FirstOrDefault(t => t.SP_DISPLAY_NAME == "CSS Report Monthly")?.SP_NAME;

            }
            else
            {
                spName = Cldb.REPORTS_SP_DETAILS.GetAll().FirstOrDefault(t => t.SP_DISPLAY_NAME == "CSS Report")?.SP_NAME;

            }

            return Ok(spName);
        }

    }
    public class SURVEY_SEARCH_CRITERIA
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int QUARTER { get; set; }
        public int YEAR { get; set; }
        public int MONTH { get; set; }
        public string USER_EMAIL_ID { get; set; }
        public bool IS_MONTHLY { get; set; }
        public bool IS_QUALITATIVE_FEEDBACK { get; set; }
    }
}