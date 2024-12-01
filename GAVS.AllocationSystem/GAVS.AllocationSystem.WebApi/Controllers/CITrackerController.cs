using AttributeRouting.Web.Mvc;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Charts;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.SP;
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

        [POST("GetCITracker")]
        [ActionName("GetCITracker")]
        [HttpPost]
        public IHttpActionResult GetCITracker([FromBody] CITrackerParameterModel ciTrackerParameterModel)
        {

            List<PARAMETER_TABLE> lstWeightage = GetWeightageData("CI_TRACKER_WEIGHTAGE");

            List<TIMEFORMAT_CONFIG> lstTimeFormat_Config = GetTimeFormat_Config();


            //List<CI_TRACKER> mapping = CSPdb.AppRepo.GetCITracker(ciTrackerParameterModel.AUTOMATE,
            //    ciTrackerParameterModel.CUSTOMER_SAVINGS, ciTrackerParameterModel.START_DATE, ciTrackerParameterModel.END_DATE,
            //    ciTrackerParameterModel.PROJECTIDS, ciTrackerParameterModel.CUST_ID, ciTrackerParameterModel.INNOVATION,
            //    ciTrackerParameterModel.IMPROVEMENT, ciTrackerParameterModel.ALL, ciTrackerParameterModel.VIEWBY, ciTrackerParameterModel.IISTATUS);

            List<CI_TRACKER> mapping = CSPdb.AppRepo.GetCILBoard(ciTrackerParameterModel.ALL, ciTrackerParameterModel.CUST_ID, ciTrackerParameterModel.PROJECTIDS,
               ciTrackerParameterModel.START_DATE, ciTrackerParameterModel.END_DATE, ciTrackerParameterModel.CILCATEGORY, ciTrackerParameterModel.IISTATUS,
               ciTrackerParameterModel.BENEFICIARY, ciTrackerParameterModel.UOM);


            Dictionary<string, CI_TRACKER_CUSTOMER_GROUPING> customerGrouping = new Dictionary<string, CI_TRACKER_CUSTOMER_GROUPING>();
            var projrec = new CI_TRACKER_PROJECT_GROUPING();
            decimal? AutomatedEffort;

            foreach (var row in mapping)
            {
                if (!customerGrouping.ContainsKey(row.CUST_ID))
                    customerGrouping.Add(row.CUST_ID, new CI_TRACKER_CUSTOMER_GROUPING(row.CUST_ID, row.CUST_NM));

                var custrec = customerGrouping[row.CUST_ID];

                //Rows based on New Idea Table
                custrec.CI_CUST_PROPERTIES.NET_BENEFITS += row.NET_BENEFITS.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.TOTALIDEAS += row.TOTALIDEAS.GetValueOrDefault();
                // Improvements
                custrec.CI_CUST_PROPERTIES.COMPLETED += row.COMPLETED.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.INPROGRESS += row.INPROGRESS.GetValueOrDefault();
                // Financial
                custrec.CI_CUST_PROPERTIES.OPERATING_COST += row.OPERATING_COST.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.PROFITABILITY += row.PROFITABILITY.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.REVENUE += row.REVENUE.GetValueOrDefault();
                // Internal savings
                custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_ERROR += row.TOTAL_BEFORE_ERROR.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.TOTAL_AFTER_ERROR += row.TOTAL_AFTER_ERROR.GetValueOrDefault();


                custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_LEAD += row.TOTAL_BEFORE_LEAD.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.TOTAL_AFTER_LEAD += row.TOTAL_AFTER_LEAD.GetValueOrDefault();

                custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_CYCLE += row.TOTAL_BEFORE_CYCLE.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.TOTAL_AFTER_CYCLE += row.TOTAL_AFTER_CYCLE.GetValueOrDefault();


                custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT += row.BEFORE_EFFORT.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.AFTER_EFFORT += row.AFTER_EFFORT.GetValueOrDefault();

                custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT_AUTOMATION += row.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault();
                custrec.CI_CUST_PROPERTIES.AFTER_EFFORT_AUTOMATION += row.AFTER_EFFORT_AUTOMATION.GetValueOrDefault();

                AutomatedEffort = custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - custrec.CI_CUST_PROPERTIES.AFTER_EFFORT_AUTOMATION.GetValueOrDefault();

                custrec.CI_CUST_PROPERTIES.AUTOMATION_SPLIT = (ProcessTimeValueByTimeValueConfig(AutomatedEffort.GetValueOrDefault() * 60, lstTimeFormat_Config)) + " / " +
                        (ProcessTimeValueByTimeValueConfig(custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() * 60, lstTimeFormat_Config));


                if (custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() > 0)
                {
                    custrec.CI_CUST_PROPERTIES.AUTOMATION_INDEX = ((custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - custrec.CI_CUST_PROPERTIES.AFTER_EFFORT_AUTOMATION.GetValueOrDefault()) / custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault()) * 100;
                    custrec.CI_CUST_PROPERTIES.AUTOMATION_INDEX = Math.Round(custrec.CI_CUST_PROPERTIES.AUTOMATION_INDEX.Value, 0);
                }
                else
                    custrec.CI_CUST_PROPERTIES.AUTOMATION_INDEX = 0;

                if (custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault() > 0)
                {
                    custrec.CI_CUST_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = ((custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault() - custrec.CI_CUST_PROPERTIES.TOTAL_AFTER_ERROR.GetValueOrDefault()) / custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault()) * 100;
                    custrec.CI_CUST_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = Math.Round(custrec.CI_CUST_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS.Value, 0);
                }

                else
                    custrec.CI_CUST_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = 0;


                custrec.CI_CUST_PROPERTIES.REDUCTION_IN_LEAD_TIME = custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_LEAD.GetValueOrDefault() - custrec.CI_CUST_PROPERTIES.TOTAL_AFTER_LEAD.GetValueOrDefault();
                // custrec.CI_CUST_PROPERTIES.REDUCTION_IN_LEAD_TIME = Math.Round(custrec.CI_CUST_PROPERTIES.REDUCTION_IN_LEAD_TIME.Value, 0);


                custrec.CI_CUST_PROPERTIES.REDUCTION_IN_LEAD_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((custrec.CI_CUST_PROPERTIES.REDUCTION_IN_LEAD_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);


                custrec.CI_CUST_PROPERTIES.REDUCTION_IN_CYCLE_TIME = custrec.CI_CUST_PROPERTIES.TOTAL_BEFORE_CYCLE.GetValueOrDefault() - custrec.CI_CUST_PROPERTIES.TOTAL_AFTER_CYCLE.GetValueOrDefault();
                //custrec.CI_CUST_PROPERTIES.REDUCTION_IN_CYCLE_TIME = Math.Round(custrec.CI_CUST_PROPERTIES.REDUCTION_IN_CYCLE_TIME.Value, 0);

                custrec.CI_CUST_PROPERTIES.REDUCTION_IN_CYCLE_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((custrec.CI_CUST_PROPERTIES.REDUCTION_IN_CYCLE_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);

                custrec.CI_CUST_PROPERTIES.SAVINGS_IN_USD += row.SAVINGS_IN_USD.GetValueOrDefault();


                //custrec.CI_CUST_PROPERTIES.SAVING_PER_YEAR_EFFORT = (custrec.CI_CUST_PROPERTIES.BEFORE_EFFORT.GetValueOrDefault() - custrec.CI_CUST_PROPERTIES.AFTER_EFFORT.GetValueOrDefault());

                custrec.CI_CUST_PROPERTIES.SAVING_PER_YEAR_EFFORT += row.SAVING_PER_YEAR_EFFORT.GetValueOrDefault() + (row.BEFORE_EFFORT.GetValueOrDefault() - row.AFTER_EFFORT.GetValueOrDefault());
                custrec.CI_CUST_PROPERTIES.SAVING_PER_YEAR_EFFORT_DISPLAY = ProcessTimeValueByTimeValueConfig(custrec.CI_CUST_PROPERTIES.SAVING_PER_YEAR_EFFORT.GetValueOrDefault() * 60, lstTimeFormat_Config);

                // Customer
                custrec.CI_CUST_PROPERTIES.HARD_BENEFITS += row.HARD_BENEFITS.GetValueOrDefault();

                if (row.PORTFOLIO_ID.HasValue)
                {
                    if (!custrec.CI_TRACKER_PORTFOLIO_GOUPING.Any(x => x.PORTFOLIO_ID == row.PORTFOLIO_ID.Value))
                        custrec.CI_TRACKER_PORTFOLIO_GOUPING.Add(new CI_TRACKER_PORTFOLIO_GOUPING(row.PORTFOLIO_ID.Value, row.PORTFOLIO_NM));

                    var portfoliorec = custrec.CI_TRACKER_PORTFOLIO_GOUPING.Find(x => x.PORTFOLIO_ID == row.PORTFOLIO_ID);


                    //Rows based on New Idea Table
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.NET_BENEFITS += row.NET_BENEFITS.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTALIDEAS += row.TOTALIDEAS.GetValueOrDefault();
                    // Improvements
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.COMPLETED += row.COMPLETED.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.INPROGRESS += row.INPROGRESS.GetValueOrDefault();
                    // Financial
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.OPERATING_COST += row.OPERATING_COST.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.PROFITABILITY += row.PROFITABILITY.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.REVENUE += row.REVENUE.GetValueOrDefault();
                    // Internal savings
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_ERROR += row.TOTAL_BEFORE_ERROR.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_AFTER_ERROR += row.TOTAL_AFTER_ERROR.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_LEAD += row.TOTAL_BEFORE_LEAD.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_AFTER_LEAD += row.TOTAL_AFTER_LEAD.GetValueOrDefault();

                    portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_CYCLE += row.TOTAL_BEFORE_CYCLE.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_AFTER_CYCLE += row.TOTAL_AFTER_CYCLE.GetValueOrDefault();

                    portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT += row.BEFORE_EFFORT.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.AFTER_EFFORT += row.AFTER_EFFORT.GetValueOrDefault();

                    portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT_AUTOMATION += row.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault();
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.AFTER_EFFORT_AUTOMATION += row.AFTER_EFFORT_AUTOMATION.GetValueOrDefault();

                    AutomatedEffort = portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - portfoliorec.CI_PORTFOLIO_PROPERTIES.AFTER_EFFORT_AUTOMATION.GetValueOrDefault();

                    portfoliorec.CI_PORTFOLIO_PROPERTIES.AUTOMATION_SPLIT = (ProcessTimeValueByTimeValueConfig(AutomatedEffort.GetValueOrDefault() * 60, lstTimeFormat_Config)) + " / " +
                        (ProcessTimeValueByTimeValueConfig(portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() * 60, lstTimeFormat_Config));

                    if (portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() > 0)
                    {
                        portfoliorec.CI_PORTFOLIO_PROPERTIES.AUTOMATION_INDEX = ((portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - portfoliorec.CI_PORTFOLIO_PROPERTIES.AFTER_EFFORT_AUTOMATION.GetValueOrDefault()) / portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault()) * 100;
                        portfoliorec.CI_PORTFOLIO_PROPERTIES.AUTOMATION_INDEX = Math.Round(portfoliorec.CI_PORTFOLIO_PROPERTIES.AUTOMATION_INDEX.Value, 0);
                    }
                    else
                        portfoliorec.CI_PORTFOLIO_PROPERTIES.AUTOMATION_INDEX = 0;

                    if (portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault() > 0)
                    {
                        portfoliorec.CI_PORTFOLIO_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = ((portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault() - portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_AFTER_ERROR.GetValueOrDefault()) / portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault()) * 100;
                        portfoliorec.CI_PORTFOLIO_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = Math.Round(portfoliorec.CI_PORTFOLIO_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS.Value, 0);
                    }
                    else
                        portfoliorec.CI_PORTFOLIO_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = 0;


                    portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_LEAD_TIME = portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_LEAD.GetValueOrDefault() - portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_AFTER_LEAD.GetValueOrDefault();
                    //portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_LEAD_TIME = Math.Round(portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_LEAD_TIME.Value, 0);


                    portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_LEAD_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_LEAD_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);



                    portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_CYCLE_TIME = portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_BEFORE_CYCLE.GetValueOrDefault() - portfoliorec.CI_PORTFOLIO_PROPERTIES.TOTAL_AFTER_CYCLE.GetValueOrDefault();
                    //portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_CYCLE_TIME = Math.Round(portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_CYCLE_TIME.Value, 0);


                    portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_CYCLE_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((portfoliorec.CI_PORTFOLIO_PROPERTIES.REDUCTION_IN_CYCLE_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);


                    portfoliorec.CI_PORTFOLIO_PROPERTIES.SAVINGS_IN_USD += row.SAVINGS_IN_USD.GetValueOrDefault();
                    //portfoliorec.CI_PORTFOLIO_PROPERTIES.SAVING_PER_YEAR_EFFORT += (portfoliorec.CI_PORTFOLIO_PROPERTIES.BEFORE_EFFORT.GetValueOrDefault() - portfoliorec.CI_PORTFOLIO_PROPERTIES.AFTER_EFFORT.GetValueOrDefault());

                    portfoliorec.CI_PORTFOLIO_PROPERTIES.SAVING_PER_YEAR_EFFORT += row.SAVING_PER_YEAR_EFFORT.GetValueOrDefault() + (row.BEFORE_EFFORT.GetValueOrDefault() - row.AFTER_EFFORT.GetValueOrDefault());


                    portfoliorec.CI_PORTFOLIO_PROPERTIES.SAVING_PER_YEAR_EFFORT_DISPLAY = ProcessTimeValueByTimeValueConfig(portfoliorec.CI_PORTFOLIO_PROPERTIES.SAVING_PER_YEAR_EFFORT.GetValueOrDefault() * 60, lstTimeFormat_Config);

                    // Customer
                    portfoliorec.CI_PORTFOLIO_PROPERTIES.HARD_BENEFITS += row.HARD_BENEFITS.GetValueOrDefault();

                    if (!portfoliorec.CI_TRACKER_PROJECT_GROUPING.Any(x => x.PROJ_ID == row.PROJ_ID))
                        portfoliorec.CI_TRACKER_PROJECT_GROUPING.Add(new CI_TRACKER_PROJECT_GROUPING(row.PROJ_ID, row.PROJ_NM));

                    projrec = portfoliorec.CI_TRACKER_PROJECT_GROUPING.Find(x => x.PROJ_ID == row.PROJ_ID);
                }
                else
                {
                    if (!custrec.CI_TRACKER_PROJECT_GROUPING.Any(x => x.PROJ_ID == row.PROJ_ID))
                        custrec.CI_TRACKER_PROJECT_GROUPING.Add(new CI_TRACKER_PROJECT_GROUPING(row.PROJ_ID, row.PROJ_NM));

                    projrec = custrec.CI_TRACKER_PROJECT_GROUPING.Find(x => x.PROJ_ID == row.PROJ_ID);
                }

                //Rows based on New Idea Table
                projrec.CI_PROJECT_PROPERTIES.NET_BENEFITS += row.NET_BENEFITS.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.TOTALIDEAS += row.TOTALIDEAS.GetValueOrDefault();
                // Improvements
                projrec.CI_PROJECT_PROPERTIES.COMPLETED += row.COMPLETED.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.INPROGRESS += row.INPROGRESS.GetValueOrDefault();
                // Financial
                projrec.CI_PROJECT_PROPERTIES.OPERATING_COST += row.OPERATING_COST.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.PROFITABILITY += row.PROFITABILITY.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.REVENUE += row.REVENUE.GetValueOrDefault();
                // Internal savings


                projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_ERROR += row.TOTAL_BEFORE_ERROR.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.TOTAL_AFTER_ERROR += row.TOTAL_AFTER_ERROR.GetValueOrDefault();

                projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_LEAD += row.TOTAL_BEFORE_LEAD.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.TOTAL_AFTER_LEAD += row.TOTAL_AFTER_LEAD.GetValueOrDefault();

                projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_CYCLE += row.TOTAL_BEFORE_CYCLE.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.TOTAL_AFTER_CYCLE += row.TOTAL_AFTER_CYCLE.GetValueOrDefault();

                projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT += row.BEFORE_EFFORT.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.AFTER_EFFORT += row.AFTER_EFFORT.GetValueOrDefault();

                projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT_AUTOMATION += row.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault();
                projrec.CI_PROJECT_PROPERTIES.AFTER_EFFORT_AUTOMATION += row.AFTER_EFFORT_AUTOMATION.GetValueOrDefault();

                AutomatedEffort = projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - projrec.CI_PROJECT_PROPERTIES.AFTER_EFFORT_AUTOMATION.GetValueOrDefault();

                projrec.CI_PROJECT_PROPERTIES.AUTOMATION_SPLIT = (ProcessTimeValueByTimeValueConfig(AutomatedEffort.GetValueOrDefault() * 60, lstTimeFormat_Config)) + " / " +
                        (ProcessTimeValueByTimeValueConfig(projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() * 60, lstTimeFormat_Config));

                //projrec.CI_PROJECT_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS += row.QUALITY_REDUCTION_OF_ERRORS.GetValueOrDefault();
                if (projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault() > 0)
                {
                    projrec.CI_PROJECT_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = ((projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault() - projrec.CI_PROJECT_PROPERTIES.TOTAL_AFTER_ERROR.GetValueOrDefault()) / projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_ERROR.GetValueOrDefault()) * 100;
                    projrec.CI_PROJECT_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = Math.Round(projrec.CI_PROJECT_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS.Value, 0);
                }
                else
                    projrec.CI_PROJECT_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS = 0;


                //projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_LEAD_TIME = row.REDUCTION_IN_LEAD_TIME.GetValueOrDefault();

                //projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_CYCLE_TIME = row.REDUCTION_IN_CYCLE_TIME.GetValueOrDefault();


                projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_LEAD_TIME = projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_LEAD.GetValueOrDefault() - projrec.CI_PROJECT_PROPERTIES.TOTAL_AFTER_LEAD.GetValueOrDefault();
                //projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_LEAD_TIME = Math.Round(projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_LEAD_TIME.Value, 0);

                projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_LEAD_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_LEAD_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);


                projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_CYCLE_TIME = projrec.CI_PROJECT_PROPERTIES.TOTAL_BEFORE_CYCLE.GetValueOrDefault() - projrec.CI_PROJECT_PROPERTIES.TOTAL_AFTER_CYCLE.GetValueOrDefault();
                //projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_CYCLE_TIME = Math.Round(projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_CYCLE_TIME.Value, 0);

                projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_CYCLE_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((projrec.CI_PROJECT_PROPERTIES.REDUCTION_IN_CYCLE_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);

                //projrec.CI_PROJECT_PROPERTIES.SAVING_PER_YEAR_EFFORT += (projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT.GetValueOrDefault() - projrec.CI_PROJECT_PROPERTIES.AFTER_EFFORT.GetValueOrDefault());

                projrec.CI_PROJECT_PROPERTIES.SAVING_PER_YEAR_EFFORT += row.SAVING_PER_YEAR_EFFORT.GetValueOrDefault() + (row.BEFORE_EFFORT.GetValueOrDefault() - row.AFTER_EFFORT.GetValueOrDefault());

                projrec.CI_PROJECT_PROPERTIES.SAVING_PER_YEAR_EFFORT_DISPLAY = ProcessTimeValueByTimeValueConfig(projrec.CI_PROJECT_PROPERTIES.SAVING_PER_YEAR_EFFORT.GetValueOrDefault() * 60, lstTimeFormat_Config);


                projrec.CI_PROJECT_PROPERTIES.SAVINGS_IN_USD += row.SAVINGS_IN_USD.GetValueOrDefault();

                //projrec.CI_PROJECT_PROPERTIES.AUTOMATION_INDEX += row.AUTOMATION_INDEX.GetValueOrDefault();

                if (projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() > 0)
                {
                    projrec.CI_PROJECT_PROPERTIES.AUTOMATION_INDEX = ((projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - projrec.CI_PROJECT_PROPERTIES.AFTER_EFFORT_AUTOMATION.GetValueOrDefault()) / projrec.CI_PROJECT_PROPERTIES.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault()) * 100;
                    projrec.CI_PROJECT_PROPERTIES.AUTOMATION_INDEX = Math.Round(projrec.CI_PROJECT_PROPERTIES.AUTOMATION_INDEX.Value, 0);
                }
                else
                    projrec.CI_PROJECT_PROPERTIES.AUTOMATION_INDEX = 0;
                // Customer
                projrec.CI_PROJECT_PROPERTIES.HARD_BENEFITS += row.HARD_BENEFITS.GetValueOrDefault();
            }


            foreach (var lst in customerGrouping.Values)
            {

                decimal calc = 0;

                foreach (var lstWeight in lstWeightage)
                {
                    if (lstWeight.OPTIONS == "COMPLETED" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.COMPLETED) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "INPROGRESS" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.INPROGRESS) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "QUALITY_REDUCTION_OF_ERRORS" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.QUALITY_REDUCTION_OF_ERRORS) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "REDUCTION_IN_LEAD_TIME" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.REDUCTION_IN_LEAD_TIME) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "REDUCTION_IN_CYCLE_TIME" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.REDUCTION_IN_CYCLE_TIME) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "SAVING_PER_YEAR_EFFORT" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.SAVING_PER_YEAR_EFFORT) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "AUTOMATION_INDEX" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.AUTOMATION_INDEX) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "SAVINGS_IN_USD" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.SAVINGS_IN_USD) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "HARD_BENEFITS" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.HARD_BENEFITS) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "REVENUE" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.REVENUE) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "OPERATING_COST" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.OPERATING_COST) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                    if (lstWeight.OPTIONS == "PROFITABILITY" && lstWeight.OPTIONS_ID > 0)
                        calc += Convert.ToDecimal(lst.CI_CUST_PROPERTIES.PROFITABILITY) * Convert.ToDecimal(lstWeight.OPTIONS_ID / 100.0);

                }

                lst.CI_CUST_PROPERTIES.CALCULATION = calc;
            }

            var index = 1;
            foreach (var lst in customerGrouping.Values.OrderByDescending(key => key.CI_CUST_PROPERTIES.CALCULATION))
            {
                lst.CI_CUST_PROPERTIES.POSITION = index++;
            }


            //List<CI_TOTAL_BASE> lstciTotalBase = new List<CI_TOTAL_BASE>();
            //ciTotalBase.ciCustomerGrouping = customerGrouping.Values.OrderBy(key => key.CI_CUST_PROPERTIES.POSITION).ToList();

            CI_TOTAL_BASE ciTotalBase = new CI_TOTAL_BASE();
            ciTotalBase.CTB_CUSTOMER_GROUPING = customerGrouping.Values.OrderByDescending(key => key.CI_CUST_PROPERTIES.CALCULATION).ToList();


            foreach (var lst in ciTotalBase.CTB_CUSTOMER_GROUPING)
            {
                ciTotalBase.COMPLETED += lst.CI_CUST_PROPERTIES.COMPLETED;
                ciTotalBase.INPROGRESS += lst.CI_CUST_PROPERTIES.INPROGRESS;
                ciTotalBase.TOTAL_BEFORE_ERROR += lst.CI_CUST_PROPERTIES.TOTAL_BEFORE_ERROR;
                ciTotalBase.TOTAL_AFTER_ERROR += lst.CI_CUST_PROPERTIES.TOTAL_AFTER_ERROR;
                ciTotalBase.TOTAL_BEFORE_LEAD += lst.CI_CUST_PROPERTIES.TOTAL_BEFORE_LEAD;
                ciTotalBase.TOTAL_AFTER_LEAD += lst.CI_CUST_PROPERTIES.TOTAL_AFTER_LEAD;
                ciTotalBase.TOTAL_BEFORE_CYCLE += lst.CI_CUST_PROPERTIES.TOTAL_BEFORE_CYCLE;
                ciTotalBase.TOTAL_AFTER_CYCLE += lst.CI_CUST_PROPERTIES.TOTAL_AFTER_CYCLE;

                ciTotalBase.BEFORE_EFFORT += lst.CI_CUST_PROPERTIES.BEFORE_EFFORT;
                ciTotalBase.AFTER_EFFORT += lst.CI_CUST_PROPERTIES.AFTER_EFFORT;

                ciTotalBase.BEFORE_EFFORT_AUTOMATION += lst.CI_CUST_PROPERTIES.BEFORE_EFFORT_AUTOMATION;
                ciTotalBase.AFTER_EFFORT_AUTOMATION += lst.CI_CUST_PROPERTIES.AFTER_EFFORT_AUTOMATION;

                ciTotalBase.SAVINGS_IN_USD += lst.CI_CUST_PROPERTIES.SAVINGS_IN_USD.GetValueOrDefault();
                ciTotalBase.SAVING_PER_YEAR_EFFORT += lst.CI_CUST_PROPERTIES.SAVING_PER_YEAR_EFFORT.GetValueOrDefault();
                ciTotalBase.HARD_BENEFITS += lst.CI_CUST_PROPERTIES.HARD_BENEFITS.GetValueOrDefault();

                ciTotalBase.REVENUE += lst.CI_CUST_PROPERTIES.REVENUE.GetValueOrDefault();
                ciTotalBase.OPERATING_COST += lst.CI_CUST_PROPERTIES.OPERATING_COST.GetValueOrDefault();
                ciTotalBase.PROFITABILITY += lst.CI_CUST_PROPERTIES.PROFITABILITY.GetValueOrDefault();
                ciTotalBase.NET_BENEFITS += lst.CI_CUST_PROPERTIES.NET_BENEFITS.GetValueOrDefault();
                ciTotalBase.TOTALIDEAS += lst.CI_CUST_PROPERTIES.TOTALIDEAS.GetValueOrDefault();
            }

            if (ciTotalBase.TOTAL_BEFORE_ERROR.GetValueOrDefault() > 0)
            {
                ciTotalBase.QUALITY_REDUCTION_OF_ERRORS = ((ciTotalBase.TOTAL_BEFORE_ERROR.GetValueOrDefault() - ciTotalBase.TOTAL_AFTER_ERROR.GetValueOrDefault()) / ciTotalBase.TOTAL_BEFORE_ERROR.GetValueOrDefault()) * 100;
                ciTotalBase.QUALITY_REDUCTION_OF_ERRORS = Math.Round(ciTotalBase.QUALITY_REDUCTION_OF_ERRORS.Value, 0);
            }
            else
                ciTotalBase.QUALITY_REDUCTION_OF_ERRORS = 0;

            ciTotalBase.REDUCTION_IN_LEAD_TIME = ciTotalBase.TOTAL_BEFORE_LEAD.GetValueOrDefault() - ciTotalBase.TOTAL_AFTER_LEAD.GetValueOrDefault();
            ciTotalBase.REDUCTION_IN_LEAD_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((ciTotalBase.REDUCTION_IN_LEAD_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);
            //ciTotalBase.REDUCTION_IN_LEAD_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig(ciTotalBase.REDUCTION_IN_LEAD_TIME.GetValueOrDefault(), lstTimeFormat_Config);


            ciTotalBase.REDUCTION_IN_CYCLE_TIME = ciTotalBase.TOTAL_BEFORE_CYCLE.GetValueOrDefault() - ciTotalBase.TOTAL_AFTER_CYCLE.GetValueOrDefault();
            ciTotalBase.REDUCTION_IN_CYCLE_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig((ciTotalBase.REDUCTION_IN_CYCLE_TIME.GetValueOrDefault() * 60), lstTimeFormat_Config);

            //ciTotalBase.REDUCTION_IN_CYCLE_TIME_DISPLAY = ProcessTimeValueByTimeValueConfig(ciTotalBase.REDUCTION_IN_CYCLE_TIME.GetValueOrDefault(), lstTimeFormat_Config);
            ciTotalBase.SAVING_PER_YEAR_EFFORT_DISPLAY = ProcessTimeValueByTimeValueConfig(ciTotalBase.SAVING_PER_YEAR_EFFORT.GetValueOrDefault() * 60, lstTimeFormat_Config);

            AutomatedEffort = ciTotalBase.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - ciTotalBase.AFTER_EFFORT_AUTOMATION.GetValueOrDefault();

            ciTotalBase.AUTOMATION_SPLIT = (ProcessTimeValueByTimeValueConfig(AutomatedEffort.GetValueOrDefault() * 60, lstTimeFormat_Config)) + " / " +
                        (ProcessTimeValueByTimeValueConfig(ciTotalBase.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() * 60, lstTimeFormat_Config));

            if (ciTotalBase.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() > 0)
            {
                ciTotalBase.AUTOMATION_INDEX = ((ciTotalBase.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault() - ciTotalBase.AFTER_EFFORT_AUTOMATION.GetValueOrDefault()) / ciTotalBase.BEFORE_EFFORT_AUTOMATION.GetValueOrDefault()) * 100;
                ciTotalBase.AUTOMATION_INDEX = Math.Round(ciTotalBase.AUTOMATION_INDEX.Value, 0);
            }
            else
                ciTotalBase.AUTOMATION_INDEX = 0;

            //lstciTotalBase.Add(ciTotalBase);


            //return Ok(customerGrouping.Values.OrderBy(key => key.CI_CUST_PROPERTIES.POSITION));

            //return Ok(lstciTotalBase);

            return Ok(ciTotalBase);
        }



        private List<PARAMETER_TABLE> GetWeightageData(string type)
        {
            List<PARAMETER_TABLE> parameters = CSPdb.PARAMETER_TABLE.GetAll().Where(t => t.NAME.ToLower() == type.ToLower() && t.ISACTIVE == true).ToList();
            return parameters;
        }


        private List<TIMEFORMAT_CONFIG> GetTimeFormat_Config()
        {
            List<TIMEFORMAT_CONFIG> timeFormatConfig = CSPdb.TIMEFORMAT_CONFIG.GetAll().ToList();
            return timeFormatConfig;
        }


        private string ProcessTimeValue(decimal value)
        {
            string result = "0";
            decimal temph;
            decimal tempm;

            if (value < 0)
                value = value * (-1);

            if (value >= 0 && value < 60)
            {
                result = value + " min(s)";
            }
            else if (value >= 60 && value < 480)
            {
                temph = Math.Floor(value / 60);
                result = temph + " hr(s) ";
                tempm = value % 60;

                if (tempm > 0)
                    result = result + tempm + " mins";
            }
            else if (value >= 480)
            {
                var hour = Math.Floor(value / 60);
                temph = Math.Floor(hour / 8);
                result = temph + " day(s) ";
                tempm = hour % 8;
                if (tempm > 0)
                    result = result + tempm + " hr(s)";
            }

            return result;
        }


        private string ProcessTimeValueByTimeValueConfig(decimal value, List<TIMEFORMAT_CONFIG> lstTimeFormatConfig)
        {
            string result = "0";
            decimal temph;
            decimal tempm;

            decimal tempvalue = value;

            if (value < 0)
                return (value * (-1)).ToString();

            var configRec = lstTimeFormatConfig.FindLast(x => value >= x.MINVALUE);

            if (configRec == null)
                return result;

            switch (configRec.MODE)
            {
                case "Minutes":
                    result = value + " mins";
                    break;
                case "Hours":
                    temph = Math.Floor(value / 60);
                    result = temph + " hr(s) ";
                    tempm = value % 60;
                    result = result + tempm + " mins";
                    break;
                case "Days":
                    var hour = Math.Floor(value / 60);
                    temph = Math.Floor(hour / 8);
                    result = temph + " day(s) ";
                    tempm = hour % 8;
                    if (tempm > 0)
                        result = result + tempm + " hr(s)";
                    break;
                default:
                    break;
            }


            //if (tempvalue < 0)
            //    result = "- " + result;

            //foreach (var lst in lstTimeFormatConfig)
            //{
            //    if(value >= lst.MINVALUE && value < lst.MAXVALUE)
            //    {
            //        if(lst.ID == 1)
            //        {
            //            result = value + " mins";
            //        }
            //        if (lst.ID == 2)
            //        {
            //            temph = Math.Floor(value / 60);
            //            result = temph + " hr(s) ";
            //            tempm = value % 60;
            //            result = result + tempm + " mins";
            //        }

            //        if (lst.ID == 3)
            //        {
            //            var hour = Math.Floor(value / 60);
            //            temph = Math.Floor(hour / 8);
            //            result = temph + " day(s) ";
            //            tempm = hour % 8;                        
            //            if (tempm > 0)
            //                result = result + tempm + " hr(s)";
            //        }
            //    }
            //}

            //if (tempvalue < 0)
            //    result = "- " + result;

            return result;
        }

    }





}
