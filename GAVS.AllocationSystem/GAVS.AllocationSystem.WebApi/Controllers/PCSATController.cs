using AttributeRouting.Web.Mvc;
using System;
using System.Web.Http;
using System.Linq;
using GAVS.AllocationSystem.Model.CSP;
using System.Collections.Generic;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP.SP;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        //step 1
        [GET("GetCSATListForDP")]
        [ActionName("GetCSATListForDP")]
        [HttpGet]
        public IHttpActionResult GetCSATListForDP(string dpId, int batchId)
        {
            var result = new List<CSS_BATCH_PROJECTS>();
            var batch = CSPdb.CSS_BATCHES.GetById(batchId);
            if (batch == null) return Ok();
            //1. call the new SP and get the results
            var spResult = Cldb.AppRepo.GetAccountProjectSelectionCSAT(batch.START_DATE, batch.END_DATE, dpId);
            var batchprojects = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId && x.DP_ID == dpId).ToList();

            //2. check if all the records in SP are available in css_batch_Projects, if not add new record.
            foreach (var item in spResult)
            {
                var existing = batchprojects.FirstOrDefault(x => x.PROJ_ID == item.PROJ_ID);
                if (existing != null)
                {
                    item.IS_SELECTED = existing.IS_SELECTED;
                    if (!existing.IS_SELECTED)
                    {
                        item.REASON = existing.REASON;
                    }

                }
                //else
                //{
                //    item.IS_SELECTED = false;
                //}

                //result.Add(item);
            }
            //3.
            return Ok(spResult);
        }

        [POST("SaveCSATListForDP")]
        [ActionName("SaveCSATListForDP")]
        [HttpPost]
        public IHttpActionResult SaveCSATListForDP([FromBody] List<CSS_BATCH_PROJECTS> batchProjectList, string dpID, int batchId)
        {

            var existingRecords = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.BATCH_ID == batchId && x.DP_ID == dpID && x.ISACTIVE).ToList();

            //loop the results and save.
            foreach (var item in batchProjectList)
            {
                var existingRecord = existingRecords.FirstOrDefault(x => x.PROJ_ID == item.PROJ_ID && x.CUST_ID == item.CUST_ID);
                if (existingRecord == null)
                {
                    item.BATCH_ID = batchId;
                    item.DP_ID = dpID;
                    UpdateAuditFields(item);
                    Cldb.CSS_BATCH_PROJECTS.Add(item);
                }
                else
                {
                    existingRecord.IS_SELECTED = item.IS_SELECTED;
                    existingRecord.REASON = item.REASON;
                    existingRecord.ISACTIVE = item.ISACTIVE;
                    UpdateAuditFields(existingRecord);
                    Cldb.CSS_BATCH_PROJECTS.Update(existingRecord);
                }
            }
            Cldb.Commit();
            return Ok();
        }

        //step 2
        [GET("GetCSATContactListForDP")]
        [ActionName("GetCSATContactListForDP")]
        [HttpGet]
        public IHttpActionResult GetCSATContactListForDP(string dpId, int batchId)
        {
            var firstResult = new List<CSS_BATCH_CUSTOMERS>();
            var result = new List<CSS_BATCH_CUSTOMERS_EXTENDED>();
            var batch = CSPdb.CSS_BATCHES.GetById(batchId);
            if (batch == null) return Ok();
            var batchprojects = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId && x.DP_ID == dpId && x.IS_SELECTED).ToList();
            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId).ToList();
            var custIds = batchprojects.Select(x => x.CUST_ID).Distinct().ToList();
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.ISACTIVE && x.CONTACT_TYPE == "CUSTOMER" && custIds.Contains(x.CUSTOMER_ID)).ToList();

            //write logic to find the real id

            int oldBatchId = 35;
            int.TryParse(helper.GetDBConfig("LAST_PCSAT_BATCH_ID", "-1"), out oldBatchId);
            var oldBatchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == oldBatchId && x.SURVEY_SENT_DATE.HasValue).ToList();
            var oldBatchCustomerIds = oldBatchCustomers.Select(x => x.ID).ToList();
            var oldReplies = CSPdb.CSS_QUESTION_REPLIES.GetAll().Where(x => x.ISACTIVE && x.PERSPECTIVE.ToLower() == "overall experience" && oldBatchCustomerIds.Contains(x.BATCH_CUSTOMER_ID)).ToList();
            foreach (var item in batchprojects)
            {
                // var batchProjectsForCustomer = batchprojects.Where(x => x.CUST_ID == item).ToList();
                // var contactsForCustomer = contacts.Where(x => x.CUSTOMER_ID == item).ToList();
                //var cartesianProduct = batchProjectsForCustomer.SelectMany(item1 => contactsForCustomer,
                //                                  (item1, item2) => new { Item1 = item1, Item2 = item2 }).ToList();

                var savedBatchRecord = batchCustomers.FirstOrDefault(x => x.PROJ_ID == item.PROJ_ID);

                if (savedBatchRecord != null)
                {
                    // If it exists in CSS_BATCH_CUSTOMERS, return that record
                    firstResult.Add(savedBatchRecord);
                }
                else
                {
                    var existing = oldBatchCustomers.Where(x => x.PROJ_ID == item.PROJ_ID && x.IS_VERIFIED && x.ISACTIVE).ToList();
                    if (!existing.Any())
                    {
                        firstResult.Add(new CSS_BATCH_CUSTOMERS
                        {
                            BATCH_ID = batchId,
                            ID = 0,
                            CUST_ID = item.CUST_ID,
                            PROJ_ID = item.PROJ_ID,
                            EMAIL_ID = "",
                            DISPLAY_NAME = "",

                        });
                    }
                    else

                    {
                        foreach (var item2 in existing)
                        {

                            var predictedValues = GetPredcitedScoreAndReason(item2.EMAIL_ID, oldBatchCustomers, oldReplies);
                            firstResult.Add(new CSS_BATCH_CUSTOMERS
                            {
                                BATCH_ID = batchId,
                                ID = 0,
                                CUST_ID = item2.CUST_ID,
                                PROJ_ID = item2.PROJ_ID,
                                EMAIL_ID = item2.EMAIL_ID,
                                DISPLAY_NAME = item2.DISPLAY_NAME,
                                SPOC = predictedValues.Item3,
                                PREDICTED_SCORE = predictedValues.Item1.GetValueOrDefault(),
                                PREDICTED_REASON = predictedValues.Item2,
                            });

                        }
                    }

                }

            }
            result = helper.FillCustomerAndProjectNames(firstResult);

            return Ok(result);
        }

        [POST("SaveCSATContactListForDP")]
        [ActionName("SaveCSATContactListForDP")]
        [HttpPost]
        public IHttpActionResult SaveCSATContactListForDP([FromBody] List<CSS_BATCH_CUSTOMERS> batchCustomerList, string dpId, int batchId)
        {
            //perform validation
            var lastAcsatBatchId = 36;
            int.TryParse(helper.GetDBConfig("LAST_ACSAT_BATCH_ID", "-1"), out lastAcsatBatchId);

            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.SURVEY_SENT_DATE.HasValue && x.BATCH_ID == lastAcsatBatchId).ToList();

            //loop the results and save.
            foreach (var item in batchCustomerList)
            {
                if (batchCustomers.Any(x => x.EMAIL_ID == item.EMAIL_ID))
                {
                    return BadRequest($"Unable to Save. Customer Contact {item.DISPLAY_NAME} - {item.EMAIL_ID} already has been sent ACSAT in the last period. Please remove the customer contact and continue.");
                }
                if (item.ID == 0)
                {
                    item.BATCH_ID = batchId;

                    UpdateAuditFields(item);
                    CSPdb.CSS_BATCH_CUSTOMERS.Add(item);
                }
                else
                {
                    UpdateAuditFields(item);
                    CSPdb.CSS_BATCH_CUSTOMERS.Update(item);
                }
            }
            CSPdb.Commit();

            return Ok();
        }

        [POST("GetContactListForCustIds")]
        [ActionName("GetContactListForCustIds")]
        [HttpPost]
        public IHttpActionResult GetContactListForCustIds([FromBody] List<string> custIds)
        {
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.ISACTIVE && custIds.Contains(x.CUSTOMER_ID)).ToList();

            return Ok(contacts);
        }

        [GET("GetCurrentActiveBatch")]
        [ActionName("GetCurrentActiveBatch")]
        [HttpGet]
        public IHttpActionResult GetCurrentActiveBatch()
        {

            return Ok(new { batch_id = 37, batch_name = "Half-Yearly June - Dec 2025" });
        }

        [GET("GetDropdownOptions")]
        [ActionName("GetDropdownOptions")]
        [HttpGet]
        public IHttpActionResult GetDropdownOptions(string dropdownName)
        {

            var result = new List<DROPDOWN_OPTION>()
               {
                new DROPDOWN_OPTION(){ DD_VALUE ="ALREADY_COVERED", DD_TEXT="Project covered in another project" },
                new DROPDOWN_OPTION(){ DD_VALUE ="JUST_STARTED", DD_TEXT="Project just started" },
                new DROPDOWN_OPTION(){ DD_VALUE ="IN_TRANSITION", DD_TEXT="Project in transition phase" },
                new DROPDOWN_OPTION(){ DD_VALUE ="ACCOUNT_CLOSED", DD_TEXT="Account getting closed" },
                new DROPDOWN_OPTION(){ DD_VALUE ="ZIF_ONLY", DD_TEXT="ZIF only project" },
                new DROPDOWN_OPTION(){ DD_VALUE ="INVOICING_ONLY", DD_TEXT="Project created for invoicing" }
               };


            return Ok(result);
        }

        public Tuple<int?, string, string> GetPredcitedScoreAndReason(string emailId, List<CSS_BATCH_CUSTOMERS> batchCustomers, List<CSS_QUESTION_REPLIES> replies)
        {
            var customerRecord = batchCustomers.FirstOrDefault(x => x.EMAIL_ID == emailId);
            Tuple<int?, string, string> result = new Tuple<int?, string, string>(null, "", "");
            if (customerRecord != null)
            {
                var reply = replies.FirstOrDefault(x => x.ISACTIVE && x.BATCH_CUSTOMER_ID == customerRecord.ID);
                if (reply != null)
                {
                    result = new Tuple<int?, string, string>((int?)reply.RATING, "Actual Score from last Survey", customerRecord.SPOC);

                }
                else
                {
                    result = new Tuple<int?, string, string>((int?)customerRecord.PREDICTED_SCORE, "Predicted Score from last Survey", customerRecord.SPOC);
                }
            }

            return result;
        }
    }
}