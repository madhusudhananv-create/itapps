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
                else
                {
                    item.IS_SELECTED = false;
                }

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
            var batchprojects = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId && x.DP_ID == dpId).ToList();
            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId).ToList();
            var custIds = batchprojects.Select(x => x.CUST_ID).Distinct().ToList();
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.ISACTIVE && x.CONTACT_TYPE == "CUSTOMER" && custIds.Contains(x.CUSTOMER_ID)).ToList();

            //write logic to find the real id
            int oldBatchId = 35;
            var oldBatchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == oldBatchId).ToList();
            var oldBatchCustomerIds = oldBatchCustomers.Select(x => x.ID).ToList();
            var oldReplies = CSPdb.CSS_QUESTION_REPLIES.GetAll().Where(x => x.ISACTIVE && x.QUESTION_ID == 48 && oldBatchCustomerIds.Contains(x.BATCH_CUSTOMER_ID)).ToList();
            foreach (var item in custIds)
            {
                var batchProjectsForCustomer = batchprojects.Where(x => x.CUST_ID == item).ToList();
                var contactsForCustomer = contacts.Where(x => x.CUSTOMER_ID == item).ToList();
                var cartesianProduct = batchProjectsForCustomer.SelectMany(item1 => contactsForCustomer,
                                                  (item1, item2) => new { Item1 = item1, Item2 = item2 }).ToList();

                foreach (var item1 in cartesianProduct)
                {
                    var existing = batchCustomers.FirstOrDefault(x => x.PROJ_ID == item1.Item1.PROJ_ID && x.EMAIL_ID == item1.Item2.CONTACT_EMAILID);
                    if (existing != null)
                        firstResult.Add(existing);
                    else
                    {
                        var predictedValues = GetPredcitedScoreAndReason(item1.Item2.CONTACT_EMAILID, oldBatchCustomers, oldReplies);
                        firstResult.Add(new CSS_BATCH_CUSTOMERS
                        {
                            BATCH_ID = batchId,
                            ID = 0,
                            CUST_ID = item1.Item1.CUST_ID,
                            PROJ_ID = item1.Item1.PROJ_ID,
                            EMAIL_ID = item1.Item2.CONTACT_EMAILID,
                            DISPLAY_NAME = item1.Item2.CONTACT_NAME,
                            SPOC = predictedValues.Item3,
                            PREDICTED_SCORE = predictedValues.Item1.GetValueOrDefault(),
                            PREDICTED_REASON = predictedValues.Item2,
                        });
                    }
                }
            }
            result = helper.FillCustomerAndProjectNames(firstResult);
            return Ok(result);
        }

        [POST("SaveCSATContactListForDP")]
        [ActionName("SaveCSATContactListForDP")]
        [HttpPost]
        public IHttpActionResult SaveCSATContactListForDP([FromBody] List<CSS_BATCH_CUSTOMERS_EXTENDED> batchCustomerList, string dpId, int batchId)
        {
            //perform validation

            //loop the results and save.
            foreach (var item in batchCustomerList)
            {
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
            Cldb.Commit();

            return Ok();
        }

        [GET("GetContactListForCustIds")]
        [ActionName("GetContactListForCustIds")]
        [HttpGet]
        public IHttpActionResult GetContactListForCustIds(List<string> custids)
        {
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.ISACTIVE && custids.Contains(x.CUSTOMER_ID)).ToList();

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
            var result = new List<DROPDOWN_OPTION>();

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