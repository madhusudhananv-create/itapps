using AttributeRouting.Web.Mvc;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Charts;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.Filters;
using System.Web.Http.Results;
using System.Web.Services.Description;
using System.Web.UI.WebControls;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController 
    {
        [GET("MigrateProjectData")]
        [ActionName("MigrateProjectData")]
        [HttpGet]
        public IHttpActionResult MigrateProjectData(string oldProjectId,string newProjectId)
        {
            Cldb.AppRepo.MigrateProjectData(oldProjectId, newProjectId);
            return Ok("Success");
        }


        [GET("GetCustomerProjectsForMigration")]
        [ActionName("GetCustomerProjectsForMigration")]
        [HttpGet]
        public IHttpActionResult GetCustomerProjectsForMigration(string customerId, bool needClosed)
        {
            List<PROJECT> projects = new List<PROJECT>();
            if(needClosed)
                projects = Cldb.PROJECT.GetAll().Where(t => t.PARENT_PROJ_ID == t.PROJ_ID && t.CUST_ID == customerId && t.END_DATE < DateTime.Now).OrderBy(t => t.PROJ_NM).ToList();
            else
                projects = Cldb.PROJECT.GetAll().Where(t => t.PARENT_PROJ_ID == t.PROJ_ID && t.CUST_ID == customerId && t.PROJ_STATUS != "CLOSE" && t.END_DATE > DateTime.Now).OrderBy(t => t.PROJ_NM).ToList();

            return Ok(projects);
        }


    }
}
