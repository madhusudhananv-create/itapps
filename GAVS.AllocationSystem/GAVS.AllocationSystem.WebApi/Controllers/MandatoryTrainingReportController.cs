using AttributeRouting.Web.Mvc;
using System;
using System.Globalization;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [GET("GetMandatoryTrainingData")]
        [ActionName("GetMandatoryTrainingData")]
        [HttpGet]
        public IHttpActionResult GetMandatoryTrainingData(string starDate, string endDate, string custId, string projIds)
        {
             DateTime st = Convert.ToDateTime(starDate, new CultureInfo("en-US")).ToLocalTime();
             DateTime ed = Convert.ToDateTime(endDate, new CultureInfo("en-US")).ToLocalTime();

            var report = Cldb.AppRepo.GetMandatoryTrainingDetails(st, ed, custId, projIds);

            return Ok(report);
        }

    }

}