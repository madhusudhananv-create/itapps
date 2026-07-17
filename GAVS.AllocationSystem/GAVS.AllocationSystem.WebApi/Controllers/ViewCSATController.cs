using AttributeRouting.Web.Mvc;
using System;
using System.Web.Http;
using System.Linq;
using GAVS.AllocationSystem.Model.CSP;
using System.Collections.Generic;
using GAVS.AllocationSystem.Model.AllSys;
using System.Diagnostics;
using Newtonsoft.Json;
using System.Net.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetAllCustomerUser")]
        [ActionName("GetAllCustomerUser")]
        [HttpGet]
        public IHttpActionResult GetAllCustomerUser(string customerId, string projId, bool isMonthly, DateTime startDate, DateTime endDate)
        {
            LogRequest(content: JsonConvert.SerializeObject(new { customerId, projId, isMonthly, startDate, endDate }), prefix: "GetAllCustomerUser");
            List<CUSTOMER_USERS> usersData = new List<CUSTOMER_USERS>();
            List<int> ids = new List<int>();
            var userIds = new List<CSS_BATCH_CUSTOMERS>();
            var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.START_DATE == startDate && x.END_DATE == endDate && x.ISACTIVE);
            if (batch == null)
                return Ok();
            int batchId = batch.ID;
            if (isMonthly)
            {
                //userIds = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.CUST_ID == customerId && t.CSAT_FREQUENCY == "Monthly").ToList<CUSTOMER_PROJECTS>();
            }
            else if (!string.IsNullOrEmpty(projId))
            {
                userIds = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.PROJ_ID == projId && t.CUST_ID == customerId && t.BATCH_ID == batchId && t.ISACTIVE).ToList();
            }
            else
            {
                userIds = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.CUST_ID == customerId && t.ISACTIVE).ToList();
            }
            //var 
            var emailIds = userIds.Select(t => t.EMAIL_ID).ToList<string>();
            //pick users who are not configured in customer projects
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.CUSTOMER_ID == customerId && emailIds.Contains(x.CONTACT_EMAILID) && x.ISACTIVE).ToList();

            // usersData = CSPdb.CUSTOMER_USERS.GetAll().Where(t => ids.Contains(t.ID)).OrderBy(t => t.DISPLAY_NAME.Trim()).ToList();
            usersData = contacts.Select(x => new CUSTOMER_USERS
            {
                DISPLAY_NAME = x.CONTACT_NAME,
                EMAILID = x.CONTACT_EMAILID,

            }).ToList();
            return Ok(usersData);
        }

        [POST("GetSurveyGuid")]
        [ActionName("GetSurveyGuid")]
        [HttpPost]
        public IHttpActionResult GetSurveyGuid([FromBody] SURVEY_SEARCH_CRITERIA surveyCriteria)
        {
            int? batchId; int? custbatchId = null; string guid = null;
            string frequency = "Quarterly";
            string frequency1 = string.Empty;
            iBatchCustomer batchCustomer = null;
            string status = string.Empty;
            int batchCustomerId = 0;
            string spoc = "";
            string dex = "";
            string dp = "";
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
                            batchCustomer = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(t => t.BATCH_ID == batchId && t.ISACTIVE && t.CUST_ID == surveyCriteria.CUST_ID && t.PROJ_ID == surveyCriteria.PROJ_ID && (t.STATUS == "CREATED" || t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT" || t.STATUS == "DRAFT" || t.STATUS == "COMPLETED") && t.EMAIL_ID == surveyCriteria.USER_EMAIL_ID);
                        }
                        else
                        {
                            batchCustomer = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(t => t.BATCH_ID == batchId && t.ISACTIVE && t.CUST_ID == surveyCriteria.CUST_ID && t.STATUS == "COMPLETED" && t.EMAIL_ID == surveyCriteria.USER_EMAIL_ID);
                        }
                        if (batchCustomer != null)
                        {
                            custbatchId = batchCustomer.ID;
                            status = batchCustomer.STATUS;
                            guid = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(t => t.BATCH_CUSTOMERS_ID == custbatchId && t.ISACTIVE)?.SURVEY_ID;
                            if (!string.IsNullOrWhiteSpace(batchCustomer.SPOC))
                                spoc = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.DOR == null && x.EMAIL_ID == batchCustomer.SPOC)?.EMP_ID;
                            var projectDetails = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == batchCustomer.PROJ_ID);
                            if (projectDetails != null)
                            {
                                dex = projectDetails.QUALITY_SPOC;
                                dp = projectDetails.PROJ_DM_EMP_ID;
                            }
                        }


                    }
                }
            }
            return Ok(new { guid = guid, status = status, batchCustomerId = custbatchId.GetValueOrDefault(), spoc = spoc, dex = dex, dp = dp });
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

        //[GET("GetOverallPreconnectData")]
        //[ActionName("GetOverallPreconnectData")]
        //[HttpGet]
        //public IHttpActionResult GetOverallPreconnectData(int batchCustomerId)
        //{
        //    var preConnectData = Cldb.CSS_PRECONNECT.GetAll().Where(x => x.ISACTIVE && x.CSS_BATCH_CUSTOMER_ID == batchCustomerId).ToList();
        //    return Ok(preConnectData);
        //}

        [GET("GetOverallPreconnectData")]
        [ActionName("GetOverallPreconnectData")]
        [HttpGet]
        public IHttpActionResult GetOverallPreconnectData(int batchCustomerId)
        {
            var preConnectData = Cldb.CSS_PRECONNECT.GetAll().FirstOrDefault(x => x.ISACTIVE && x.CSS_BATCH_CUSTOMER_ID == batchCustomerId);
            if (preConnectData != null)
            {
                var updatedByIds = preConnectData.UPDATED_BY;
                var employeeInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => updatedByIds == x.EMP_ID);

                preConnectData.UPDATED_BY_NAME = employeeInfo?.FRST_NM;
                //var result = preConnectData.Select(p => new
                //{
                //    p.PLANNED_DATE,
                //    p.ACTUAL_DATE,
                //    p.REMARKS,
                //    p.STATUS,
                //    p.CSS_BATCH_CUSTOMER_ID,
                //    p.UPDATED_BY,
                //    UPDATED_BY_NAME = employeeInfo?.FRST_NM,
                //    p.CREATED_BY,
                //    p.CREATED_DATE,
                //    p.UPDATED_DATE,
                //    p.ISACTIVE
                //}).ToList();

                return Ok(preConnectData);
            }
            return Ok();
        }

        [POST("SavePreconnectSurveyData")]
        [ActionName("SavePreconnectSurveyData")]
        [HttpPost]
        public IHttpActionResult SavePreconnectSurveyData([FromBody] CSS_PRECONNECT surveyData)
        {
            var stopwatch = Stopwatch.StartNew();
            LogRequest(content: JsonConvert.SerializeObject(surveyData));
            if (surveyData == null)
            {
                return BadRequest("Survey data is required");
            }
            var existingRecord = Cldb.CSS_PRECONNECT.GetAll().FirstOrDefault(x => x.CSS_BATCH_CUSTOMER_ID == surveyData.CSS_BATCH_CUSTOMER_ID && x.ISACTIVE);

            if (existingRecord == null)
            {
                var newRecord = new CSS_PRECONNECT
                {
                    CSS_BATCH_CUSTOMER_ID = surveyData.CSS_BATCH_CUSTOMER_ID,
                    ACTUAL_DATE = surveyData.ACTUAL_DATE,
                    PLANNED_DATE = surveyData.PLANNED_DATE,
                    STATUS = surveyData.STATUS,
                    REMARKS = surveyData.REMARKS,
                };
                UpdateAuditFields(newRecord);
                Cldb.CSS_PRECONNECT.Add(newRecord);
            }
            else
            {
                // Update existing record
                existingRecord.ACTUAL_DATE = surveyData.ACTUAL_DATE;
                existingRecord.PLANNED_DATE = surveyData.PLANNED_DATE;
                existingRecord.STATUS = surveyData.STATUS;
                existingRecord.REMARKS = surveyData.REMARKS;
                UpdateAuditFields(existingRecord);
                Cldb.CSS_PRECONNECT.Update(existingRecord);

            }
            Cldb.Commit();
            FillResponseTime(stopwatch);
            return Ok();

        }


        //    [POST("UpdateQualitativeAnalysis")]
        //    [ActionName("UpdateQualitativeAnalysis")]
        //    [HttpPost]
        //    public IHttpActionResult UpdateQualitativeAnalysis([FromBody] List<CSS_QUESTION_REPLIES> replies)
        //    {
        //        var ids = replies.Select(x => x.ID).ToList();
        //        //validation - check if user belong to dex group
        //        var empId = GetEmpIdFromRequest(Request);
        //        var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId);
        //        if (emp == null || emp.CSM_TITLE_ID != 7)
        //        {
        //            //raise error
        //            throw new HttpResponseException(Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, "User does not belong to DEX group, unable to update the Qualitative data."));
        //        }
        //        var entities = CSPdb.CSS_QUESTION_REPLIES.GetAll().Where(x => ids.Contains(x.ID)).ToList();
        //        foreach (var item in replies)
        //        {
        //            var ety = entities.FirstOrDefault(x => x.ID == item.ID);
        //            if (ety == null)
        //            {
        //                //raise error
        //            }
        //            else
        //            {
        //                ety.QUALITATIVE_CATEGORY = item.QUALITATIVE_CATEGORY;
        //                ety.QUALITATIVE_STATUS = item.QUALITATIVE_STATUS;
        //                ety.QUALITATIVE_REMARKS = item.QUALITATIVE_REMARKS;
        //                ety.QUALITATIVE_SUBMITTED = item.QUALITATIVE_SUBMITTED;
        //                UpdateAuditFields(ety);
        //                CSPdb.CSS_QUESTION_REPLIES.Update(ety);
        //            }
        //        }
        //        CSPdb.Commit();
        //        return Ok();
        //    }

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