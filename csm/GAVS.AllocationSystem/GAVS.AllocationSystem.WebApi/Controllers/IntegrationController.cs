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

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [POST("UpdateProjectDetailsFromSOW")]
        [ActionName("UpdateProjectDetailsFromSOW")]
        [HttpPost]
        public IHttpActionResult UpdateProjectDetailsFromSOW([FromBody] string sowJson, string customerId, string projectId)
        {
            //check if project is active, else throw error
            //todo:
            // recive the json and store it in JSON_integration table
            var ety = new INTEGRATION_REQUEST_DATA
            {
                PROJ_ID = projectId,
                REQUEST_TYPE = "SOW",
                REQUEST_DATA = sowJson,
            };
            UpdateAuditFields(ety);
            CSPdb.INTEGRATION_REQUEST_DATA.Add(ety);
            CSPdb.Commit();



            return Ok();

        }

        [GET("ProcessProjectDetailsSOW")]
        [ActionName("ProcessProjectDetailsSOW")]
        [HttpPost]
        public IHttpActionResult ProcessProjectDetailsSOW(int jsonId = 0)
        {
            var result = ProcessSOWRecordsPrivate(jsonId);
            if (result == string.Empty)

                return Ok();
            else
                throw new InvalidOperationException(result);
        }

        private string ProcessSOWRecordsPrivate(int jsonId = 0)
        {
            string result = string.Empty;
            var tobeProcessedList = CSPdb.INTEGRATION_REQUEST_DATA.GetAll().Where(x => x.ISACTIVE && !x.IS_PROCESSED && (jsonId == 0 || x.ID == jsonId)).ToList();

            foreach (var item in tobeProcessedList)
            {
                //1. check if project is available and in active state. if not throw error with proper error msg.
                //2. Retrive the project and update the values - this will be done later once requirement is spcified clearly.

                //3. save the project in DB
                //4. send mail of updated values (reuse existing methods from risk/action item etc)
                //Additionally check what all validation to be performed in incoming json.


                item.IS_PROCESSED = true;
                item.PROCESSED_DATE = DateTime.Now;
                UpdateAuditFields(item);
                CSPdb.INTEGRATION_REQUEST_DATA.Update(item);
            }
            CSPdb.Commit();
            if (jsonId != 0)
                return result;
            else
                return string.Empty;
        }
    }
}