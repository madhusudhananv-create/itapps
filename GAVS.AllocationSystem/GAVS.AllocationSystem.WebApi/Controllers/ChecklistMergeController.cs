using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.SP;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.UI.WebControls;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [GET("GetMultiChecklistPreview")]
        [ActionName("GetMultiChecklistPreview")]
        [HttpGet]
        public IHttpActionResult GetMultiChecklistPreview(List<int> checklistIds)
        {
            var result = new List<MULTI_CHECKLIST>();
            foreach (var item in checklistIds)
            {
                var output = new MULTI_CHECKLIST { CHECKLIST_ID = item };
                output.CHECKLIST_NAME = CSPdb.PM_CHECKLIST.GetAll().FirstOrDefault(x => x.ID == item)?.TITLE;
                output.QUESTIONS_BY_SERVICE_AREA = GetPreviewChecklistPrivate(item);
            }

            return Ok(result);
        }




        //  Create the new checklists and its mappings 

    }
}