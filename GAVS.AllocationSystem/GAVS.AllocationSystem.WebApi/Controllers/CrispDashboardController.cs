using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Helpers;
using System.Web.Http;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.Expressions;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetCrispDetails")]
        [ActionName("GetCrispDetails")]
        [HttpGet]
        public IHttpActionResult GetCrispDetails(string month, int year)
        {
            List<string> PROJECT_IDs = new List<string>();
            if (Request.Headers.Contains("projectIds"))
                PROJECT_IDs = Request.Headers.GetValues("projectIds").ToList<string>()[0].ToString().Split(',').ToList<string>();

            var empid = GetHeaderDetails_String("empId");
            var basProjects = GetProjectListForUser(empid);
            //var query1 = Cldb.AppRepo.GetProjectIdsForUser(empid, "", "").ToList();
            foreach (var item in PROJECT_IDs)
            {
                CheckUserHasAccess(empid, "", item, basProjects);
            }
            DateTime pubdate = Convert.ToDateTime("1-" + month + "-" + year.ToString());
            //Data

            //var basProjects = Cldb.AppRepo.Projects(empid, "").ToList();// Cldb.PROJECT.GetAll().Where(x => PROJECT_IDs.Contains(x.PROJ_ID)).ToList<PROJECT>();
            List<CRISP_CATEGORY> categories = CSPdb.CRISP_CATEGORY.GetAll().ToList<CRISP_CATEGORY>();
            List<CRISP_CRITERIA> criterias = CSPdb.CRISP_CRITERIA.GetAll().ToList<CRISP_CRITERIA>();
            List<CRISP_VALIDATIONS> validations = CSPdb.CRISP_VALIDATIONS.GetAll().ToList<CRISP_VALIDATIONS>();
            //&& t.STATUS == "Published"
            List<CRISP_SCORES_PROJECT> projects = CSPdb.CRISP_SCORES_PROJECT.GetAll().Where(t => PROJECT_IDs.Contains(t.PROJECT_ID) && t.PUBLISH_DATE == pubdate).ToList<CRISP_SCORES_PROJECT>();
            List<int> projectIds = projects.Select(t => t.ID).ToList<int>();
            List<CRISP_SCORES_CRITERIA> score_criterias = CSPdb.CRISP_SCORES_CRITERIA.GetAll().Where(t => projectIds.Contains(t.CRISP_SCORES_PROJECT_ID)).ToList<CRISP_SCORES_CRITERIA>();
            List<CRISP_SCORES_VALIDATIONS> score_validations = CSPdb.CRISP_SCORES_VALIDATIONS.GetAll().Where(t => projectIds.Contains(t.CRISP_SCORES_PROJECT_ID)).ToList<CRISP_SCORES_VALIDATIONS>();
            List<CRISP_SCORES_CATEGORY> score_categories = CSPdb.CRISP_SCORES_CATEGORY.GetAll().Where(t => projectIds.Contains(t.CRISP_SCORES_PROJECT_ID)).ToList<CRISP_SCORES_CATEGORY>();

            List<CrispProjectSummary> summary = new List<CrispProjectSummary>();

            foreach (CRISP_SCORES_PROJECT proj in projects)
            {
                CrispProjectSummary projDetails = GetCristProjectDetails(proj, basProjects, categories, score_categories, criterias, score_criterias, validations, score_validations);

                summary.Add(projDetails);
            }

            return Ok(summary);
        }

        [GET("GetCrispProjectSummary")]
        [ActionName("GetCrispProjectSummary")]
        [HttpGet]
        public IHttpActionResult GetCrispProjectSummary(string month, int year)
        {
            List<string> PROJECT_IDs = new List<string>();
            if (Request.Headers.Contains("projectIds"))
                PROJECT_IDs = Request.Headers.GetValues("projectIds").ToList<string>()[0].ToString().Split(',').ToList<string>();
            DateTime pubdate = Convert.ToDateTime("1-" + month + "-" + year.ToString());
            //Data
            var empid = GetHeaderDetails_String("empId");
            //var query1 = Cldb.AppRepo.Projects(empid, "");
            var basProjects = GetProjectListForUser(empid);
            foreach (var item in PROJECT_IDs)
            {
                CheckUserHasAccess(empid, "", item, basProjects);
            }
            //var basProjects = Cldb.AppRepo.Projects(empid, "").ToList();// Cldb.PROJECT.GetAll().Where(x => PROJECT_IDs.Contains(x.PROJ_ID)).ToList<PROJECT>();

            List<CRISP_CATEGORY> categories = CSPdb.CRISP_CATEGORY.GetAll().ToList<CRISP_CATEGORY>();
            List<CRISP_CRITERIA> criterias = CSPdb.CRISP_CRITERIA.GetAll().ToList<CRISP_CRITERIA>();
            List<CRISP_VALIDATIONS> validations = CSPdb.CRISP_VALIDATIONS.GetAll().ToList<CRISP_VALIDATIONS>();
            //
            List<CRISP_SCORES_PROJECT> projects = new List<CRISP_SCORES_PROJECT>();// = CSPdb.CRISP_SCORES_PROJECT.GetAll().Where(t => PROJECT_IDs.Contains(t.PROJECT_ID) && t.PUBLISH_DATE == pubdate).ToList<CRISP_SCORES_PROJECT>();
            foreach (var item in PROJECT_IDs)
            {
                var crispScoresProject = CSPdb.CRISP_SCORES_PROJECT.GetAll().FirstOrDefault(t => t.PROJECT_ID == item && t.PUBLISH_DATE == pubdate);
                if (crispScoresProject == null)
                {
                    var projectstoSkipBySettings = helper.GetProjectConfigurationDataForSetting("SKIP CRISP SCORE CALCULATION").Where(x => x.Bit_Value == true).ToList();
                    if (projectstoSkipBySettings.Any(x => x.Proj_Id == item)) continue;
                    if (pubdate > DateTime.Now) continue;
                    var custId = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == item)?.CUST_ID;
                    ProcessCrispScoreForProjectPvt(custId, new string[] { item }, month, year.ToString());
                    crispScoresProject = CSPdb.CRISP_SCORES_PROJECT.GetAll().FirstOrDefault(t => t.PROJECT_ID == item && t.PUBLISH_DATE == pubdate);
                }
                if (crispScoresProject != null)
                    projects.Add(crispScoresProject);

            }
            List<int> projectIds = projects.Select(t => t.ID).ToList<int>();
            List<CRISP_SCORES_CATEGORY> score_categories = CSPdb.CRISP_SCORES_CATEGORY.GetAll().Where(t => projectIds.Contains(t.CRISP_SCORES_PROJECT_ID)).ToList<CRISP_SCORES_CATEGORY>();
            List<CRISP_SCORES_CRITERIA> score_criterias = CSPdb.CRISP_SCORES_CRITERIA.GetAll().Where(t => projectIds.Contains(t.CRISP_SCORES_PROJECT_ID)).ToList<CRISP_SCORES_CRITERIA>();
            List<CRISP_SCORES_VALIDATIONS> score_validations = CSPdb.CRISP_SCORES_VALIDATIONS.GetAll().Where(t => projectIds.Contains(t.CRISP_SCORES_PROJECT_ID)).ToList<CRISP_SCORES_VALIDATIONS>();

            List<CrispProjectSummary> summary = new List<CrispProjectSummary>();

            foreach (CRISP_SCORES_PROJECT proj in projects)
            {
                CrispProjectSummary projDetails = GetCristProjectDetails(proj, basProjects, categories, score_categories, criterias, score_criterias, validations, score_validations);
                summary.Add(projDetails);
            }
            summary = summary.OrderByDescending(t => t.score).ToList<CrispProjectSummary>();

            return Ok(summary);
        }

        [GET("GetCrispSummary")]
        [ActionName("GetCrispSummary")]
        [HttpGet]
        public IHttpActionResult GetCrispSummary(string empid, string month, int year)
        {
            List<string> PROJECT_IDs = new List<string>();
            if (Request.Headers.Contains("projectIds"))
                PROJECT_IDs = Request.Headers.GetValues("projectIds").ToList<string>()[0].ToString().Split(',').ToList<string>();

            DateTime pubdate = Convert.ToDateTime("1-" + month + "-" + year.ToString());
            //Data
            List<CRISP_CATEGORY> categories = CSPdb.CRISP_CATEGORY.GetAll().ToList<CRISP_CATEGORY>();
            List<CRISP_CRITERIA> criterias = CSPdb.CRISP_CRITERIA.GetAll().ToList<CRISP_CRITERIA>();
            List<CRISP_SCORES_CRITERIA> score_criterias = CSPdb.CRISP_SCORES_CRITERIA.GetAll().ToList<CRISP_SCORES_CRITERIA>();


            //
            List<CRISP_SCORES_PROJECT> projects = CSPdb.CRISP_SCORES_PROJECT.GetAll().Where(t => PROJECT_IDs.Contains(t.PROJECT_ID) && t.PUBLISH_DATE == pubdate).ToList<CRISP_SCORES_PROJECT>();
            List<int> projectIds = projects.Select(t => t.ID).ToList<int>();

            List<CRISP_SCORES_CATEGORY> score_categories = CSPdb.CRISP_SCORES_CATEGORY.GetAll().Where(t => projectIds.Contains(t.CRISP_SCORES_PROJECT_ID)).ToList<CRISP_SCORES_CATEGORY>();

            List<CrispCategorySummary> summary = new List<CrispCategorySummary>();



            foreach (CRISP_SCORES_CATEGORY c in score_categories)
            {
                int catId = c.CATEGORY_ID;
                string catName = categories.Where(t => t.ID == c.CATEGORY_ID).Select(u => u.CATEGORY_NAME).FirstOrDefault();
                List<int> criteriaIds = criterias.Where(t => t.CATEGORY_ID == c.CATEGORY_ID).Select(u => u.ID).ToList<int>();
                int catScoreActual = score_criterias.Where(t => criteriaIds.Contains(t.CRITERIA_ID) && t.CRISP_SCORES_PROJECT_ID == c.CRISP_SCORES_PROJECT_ID).Sum(u => u.SCORE);
                int catScoreTarget = criterias.Where(t => t.CATEGORY_ID == c.CATEGORY_ID).Sum(u => u.SCORE);

                string rag = GetRagFromScore(catScoreTarget, catScoreActual);

                CrispCategorySummary categoryDetails = summary.Where(t => t.name == catName).FirstOrDefault();
                if (categoryDetails == null)
                {
                    categoryDetails = new CrispCategorySummary();
                    categoryDetails.name = catName;
                    summary.Add(categoryDetails);
                }

                if (rag == "#b1d57e")  //Green
                {
                    categoryDetails.greenRags.count += 1;
                    categoryDetails.greenRags.projectIds.Add(projects.Where(t => t.ID == c.CRISP_SCORES_PROJECT_ID).Select(u => u.PROJECT_ID).FirstOrDefault());
                }
                else if (rag == "#feeb84") //Amber"
                {
                    categoryDetails.amberRags.count += 1;
                    categoryDetails.amberRags.projectIds.Add(projects.Where(t => t.ID == c.CRISP_SCORES_PROJECT_ID).Select(u => u.PROJECT_ID).FirstOrDefault());
                }
                else if (rag == "#fb8f73") //Red
                {
                    categoryDetails.redRags.count += 1;
                    categoryDetails.redRags.projectIds.Add(projects.Where(t => t.ID == c.CRISP_SCORES_PROJECT_ID).Select(u => u.PROJECT_ID).FirstOrDefault());
                }
            }

            return Ok(summary);
        }
        [GET("GetHealthReportOverallPie")]
        [ActionName("GetHealthReportOverallPie")]
        [HttpGet]
        public IHttpActionResult GetHealthReportOverallPie(string StartDate, string EndDate)
        {
            string empId = "";
            List<string> projIds = new List<string>();
            string custId = string.Empty;

            if (Request.Headers.Contains("empId"))
                empId = Request.Headers.GetValues("empId").ToList()[0];
            if (Request.Headers.Contains("custId"))
                custId = Request.Headers.GetValues("custId").ToList()[0];
            if (Request.Headers.Contains("projId"))
                projIds = Request.Headers.GetValues("projId").ToList<string>()[0].ToString().Split(',').ToList<string>();


            var projects = GetProjectListForUser(empId);
            List<string> empProjects = projects.Select(t => t.PROJ_ID).ToList();

            List<KPI_DETAILS_EXTENDED> kpi_all = new List<KPI_DETAILS_EXTENDED>();
            List<KPI_DETAILS_EXTENDED> kpi_logged = new List<KPI_DETAILS_EXTENDED>();
            List<KPI_DETAILS_EXTENDED> kpi_notLogged = new List<KPI_DETAILS_EXTENDED>();
            DateTime stDate = DateTime.Parse(StartDate);
            DateTime enDate = DateTime.Parse(EndDate);

            enDate = enDate.AddMonths(1).AddSeconds(-1);
            kpi_all = CSPdb.AppRepo.GetKPIDetails(stDate, enDate).ToList();



            if (custId == "-1" || custId == string.Empty)
            {
                kpi_logged = kpi_all.Where(t => empProjects.Contains(t.PROJECT_ID) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
                kpi_notLogged = kpi_all.Where(t => empProjects.Contains(t.PROJECT_ID) && (t.KPI_ACTUAL == "" || t.KPI_ACTUAL == null || t.SLA_TARGET_HIGH_VALUE == null)).ToList();
            }
            else
            {
                kpi_logged = kpi_all.Where(t => empProjects.Contains(t.PROJECT_ID) && (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
                kpi_notLogged = kpi_all.Where(t => empProjects.Contains(t.PROJECT_ID) && (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId) && (t.KPI_ACTUAL == "" || t.KPI_ACTUAL == null || t.SLA_TARGET_HIGH_VALUE == null)).ToList();
            }


            FillDetails(ref kpi_logged);

            decimal kpi_met_count = kpi_logged.Where(t => t.PERCENT >= 100).ToList().Count;
            decimal kpi_notMet_count = kpi_logged.Where(t => t.PERCENT < 100).ToList().Count;

            decimal finalscore = 0;
            if (kpi_met_count > 0 && kpi_logged.Count > 0)
                finalscore = GetDecimal((kpi_met_count / kpi_logged.Count) * 100);

            return Ok(finalscore);
        }
        [GET("GetHealthReportDetailedPie")]
        [ActionName("GetHealthReportDetailedPie")]
        [HttpGet]
        public IHttpActionResult GetHealthReportDetailedPie(string StartDate, string EndDate)
        {
            string empId = "";
            List<string> projIds = new List<string>();
            string custId = string.Empty;

            if (Request.Headers.Contains("empId"))
                empId = Request.Headers.GetValues("empId").ToList()[0];
            if (Request.Headers.Contains("custId"))
                custId = Request.Headers.GetValues("custId").ToList()[0];
            if (Request.Headers.Contains("projId"))
                projIds = Request.Headers.GetValues("projId").ToList<string>()[0].ToString().Split(',').ToList<string>();

            var projects = GetProjectListForUser(empId);
            List<string> empProjects = projects.Select(t => t.PROJ_ID).ToList();

            List<KPI_DETAILS_EXTENDED> kpis = new List<KPI_DETAILS_EXTENDED>();
            DateTime stDate = DateTime.Parse(StartDate);
            DateTime enDate = DateTime.Parse(EndDate);

            enDate = enDate.AddMonths(1).AddSeconds(-1);
            kpis = CSPdb.AppRepo.GetKPIDetails(stDate, enDate);
            if (custId == "-1" || custId == string.Empty)
                //For All Customers
                kpis = kpis.Where(t => empProjects.Contains(t.PROJECT_ID) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
            else
                //For specific customer and project(s)
                kpis = kpis.Where(t => empProjects.Contains(t.PROJECT_ID) && (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();

            this.FillDetails(ref kpis);

            List<HighChartsPiePortfolio> result = GetChartDetails(kpis);
            return Ok(result);
        }

        private List<HighChartsPiePortfolio> GetChartDetails(List<KPI_DETAILS_EXTENDED> list)
        {
            List<HighChartsPiePortfolio> pieDataList = new List<HighChartsPiePortfolio>();
            HighChartsPiePortfolio pieDataOverAll = new HighChartsPiePortfolio();
            pieDataOverAll.chart.type = "pie";
            pieDataOverAll.exporting.enabled = false;
            pieDataOverAll.credits.enabled = false;
            pieDataOverAll.title.text = "Overall Health Index";
            pieDataOverAll.title.style.color = "#333333";
            pieDataOverAll.title.style.fontSize = "12px";
            pieDataOverAll.tooltip.pointFormat = "{point.percentage:.1f}%";
            pieDataOverAll.plotOptions.pie.allowPointSelect = true;
            pieDataOverAll.plotOptions.pie.cursor = "pointer";
            pieDataOverAll.plotOptions.pie.dataLabels.enabled = true;
            pieDataOverAll.plotOptions.pie.dataLabels.format = " {point.percentage:.1f} %";
            pieDataOverAll.plotOptions.pie.dataLabels.distance = 5;
            pieDataOverAll.plotOptions.pie.size = 80;
            //string msg = string.Empty;
            //foreach (KPI_DETAILS_EXTENDED k in list)
            //    msg += k.RAG + "\n";

            List<pieData> dataoverAll = new List<Model.CSP.Charts.pieData>();
            var colorList = list.GroupBy(t => t.RAG);
            foreach (var det in colorList)
            {
                pieData data1 = new Model.CSP.Charts.pieData();
                data1.color = GetLightColor(det.Key);
                //decimal d = 0;
                //foreach (KPI_DETAILS_EXTENDED c in det.ToList())
                //    d += c.PERCENT.Value;
                //data1.y += Convert.ToInt32(GetDecimal(d));
                data1.y = det.ToList().Count;
                data1.name = "Overall Health Index";
                dataoverAll.Add(data1);
            }
            pieDataOverAll.series.Add(new seriesPiePortFolio() { name = "Chart", data = dataoverAll });
            pieDataList.Add(pieDataOverAll);

            //Perspective Wise
            var perList = list.GroupBy(t => t.GLOBAL_KPI_PERSPECTIVE_ID);
            foreach (var per in perList)
            {
                HighChartsPiePortfolio pieDataPie = new HighChartsPiePortfolio();
                pieDataPie.chart.type = "pie";
                //pieDataPie.chart.height = "200";
                //pieDataPie.chart.width = "200";
                pieDataPie.exporting.enabled = false;
                pieDataPie.credits.enabled = false;
                pieDataPie.title.text = GetPerspectiveName(per.Key);
                pieDataPie.title.style.color = "#333333";
                pieDataPie.title.style.fontSize = "12px";
                pieDataPie.tooltip.pointFormat = "{point.percentage:.1f}%";
                pieDataPie.plotOptions.pie.allowPointSelect = true;
                pieDataPie.plotOptions.pie.cursor = "pointer";
                pieDataPie.plotOptions.pie.dataLabels.enabled = true;
                pieDataPie.plotOptions.pie.dataLabels.format = "{point.percentage:.1f} %";
                pieDataPie.plotOptions.pie.dataLabels.distance = 5;
                pieDataPie.plotOptions.pie.size = 80;
                List<pieData> datas = new List<Model.CSP.Charts.pieData>();
                var listPerpective = per.ToList().ToList<KPI_DETAILS_EXTENDED>().GroupBy(t => t.RAG);
                foreach (var det in listPerpective)
                {
                    pieData data1 = new Model.CSP.Charts.pieData();
                    data1.color = GetLightColor(det.Key);
                    data1.y = det.ToList().Count;
                    data1.name = GetPerspectiveName(per.Key);
                    datas.Add(data1);
                }
                //               pieDataPie.series.Add(new seriesPie() { name = "Chart", data = datas, dataLabels = new credits() { enabled = true } });
                pieDataPie.series.Add(new seriesPiePortFolio()
                {
                    name = "Chart",
                    data = datas,
                    //events = new events() { click = "(event) => { this.callExternalFunction(event);}," }
                }
                    );
                pieDataList.Add(pieDataPie);
            }

            return pieDataList;
        }
        [GET("GetHealthReportOverallLine")]
        [ActionName("GetHealthReportOverallLine")]
        [HttpGet]
        public IHttpActionResult GetHealthReportOverallLine(string StartDate, string EndDate)
        {
            string empId = this.GetHeaderDetails_String("empId");
            List<string> projIds = new List<string>();
            string custId = string.Empty;

            if (Request.Headers.Contains("empId"))
                empId = Request.Headers.GetValues("empId").ToList()[0];
            if (Request.Headers.Contains("custId"))
                custId = Request.Headers.GetValues("custId").ToList()[0];
            if (Request.Headers.Contains("projId"))
                projIds = Request.Headers.GetValues("projId").ToList<string>()[0].ToString().Split(',').ToList<string>();

            var projects = GetProjectListForUser(empId);
            List<string> empProjects = projects.Select(t => t.PROJ_ID).ToList();

            List<KPI_DETAILS_EXTENDED> kpi_all = new List<KPI_DETAILS_EXTENDED>();

            DateTime stDate = DateTime.Parse(StartDate);
            DateTime enDate = DateTime.Parse(EndDate);

            enDate = enDate.AddMonths(1).AddSeconds(-1);
            kpi_all = CSPdb.AppRepo.GetKPIDetails(stDate, enDate).ToList();
            if (custId == "-1" || custId == string.Empty)
                kpi_all = kpi_all.Where(t => empProjects.Contains(t.PROJECT_ID)).ToList();
            else
                kpi_all = kpi_all.Where(t => empProjects.Contains(t.PROJECT_ID) && (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId)).ToList();
            FillDetails(ref kpi_all);
            Dictionary<DateTime, decimal> kpi_met_series = new Dictionary<DateTime, decimal>();
            List<decimal> kpi_notLogged_series = new List<decimal>();
            var monthgroup = kpi_all.OrderBy(t => t.MONTH_YEAR).GroupBy(t => t.MONTH_YEAR);
            foreach (var c in monthgroup)
            {
                List<KPI_DETAILS_EXTENDED> kpi_logged = new List<KPI_DETAILS_EXTENDED>();
                List<KPI_DETAILS_EXTENDED> kpi_notLogged = new List<KPI_DETAILS_EXTENDED>();
                kpi_logged = c.ToList().Where(t => t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
                kpi_notLogged = c.ToList().Where(t => t.KPI_ACTUAL == "" || t.KPI_ACTUAL == null || t.SLA_TARGET_HIGH_VALUE == null).ToList();

                decimal kpi_met_count = kpi_logged.Where(t => t.PERCENT >= 100).ToList().Count;
                decimal kpi_met_percent = 0;
                if (kpi_met_count > 0 && kpi_logged.Count > 0)
                    kpi_met_percent = GetDecimal((kpi_met_count / kpi_logged.Count) * 100);
                kpi_met_series.Add(c.Key, kpi_met_percent);

                decimal kpi_logged_count = kpi_logged.Count;
                decimal kpi_all_count = c.ToList().Count;

                if (kpi_logged_count > 0 && kpi_all_count > 0)
                    kpi_notLogged_series.Add(GetDecimal((kpi_logged_count / kpi_all_count) * 100));
                else
                    kpi_notLogged_series.Add(0);
            }

            HighChartsLine chart = GetLineChart(kpi_met_series, kpi_notLogged_series);
            return Ok(chart);
        }
        [GET("GetHealthReportMonthlyLine")]
        [ActionName("GetHealthReportMonthlyLine")]
        [HttpGet]
        public IHttpActionResult GetHealthReportMonthlyLine(string StartDate, string EndDate)
        {
            string empId = "";
            List<string> projIds = new List<string>();
            string custId = string.Empty;

            if (Request.Headers.Contains("empId"))
                empId = Request.Headers.GetValues("empId").ToList()[0];

            if (Request.Headers.Contains("custId"))
                custId = Request.Headers.GetValues("custId").ToList()[0];
            if (Request.Headers.Contains("projId"))
                projIds = Request.Headers.GetValues("projId").ToList<string>()[0].ToString().Split(',').ToList<string>();


            var projects = GetProjectListForUser(empId);
            List<string> empProjects = projects.Select(t => t.PROJ_ID).ToList();

            List<KPI_DETAILS_EXTENDED> kpis = new List<KPI_DETAILS_EXTENDED>();
            DateTime stDate = DateTime.Parse(StartDate);
            DateTime enDate = DateTime.Parse(EndDate);

            enDate = enDate.AddMonths(1).AddSeconds(-1);
            kpis = CSPdb.AppRepo.GetKPIDetails(stDate, enDate).ToList();

            //kpis = kpis.Where(t => empProjects.Contains(t.PROJECT_ID) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
            if (custId == "-1" || custId == string.Empty)
                kpis = kpis.Where(t => empProjects.Contains(t.PROJECT_ID) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
            else
                kpis = kpis.Where(t => empProjects.Contains(t.PROJECT_ID) && (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();


            HighChartsLine result = GetLineChartDataMonthly(kpis);
            return Ok(result);
        }
        private HighChartsLine GetLineChartDataMonthly(List<KPI_DETAILS_EXTENDED> list)
        {
            FillDetails(ref list);

            HighChartsLine lineChart = new HighChartsLine();
            lineChart.title.text = "Health Index trend by Focus Area";
            lineChart.yAxis = new yAxis();
            lineChart.yAxis.max = 100;
            lineChart.yAxis.tickInterval = 20;
            lineChart.yAxis.title.text = "in %";
            lineChart.yAxis.gridLineWidth = 1;
            var groupByMonthData = list.OrderBy(t => t.MONTH_YEAR).GroupBy(t => t.MONTH_YEAR);
            var groupByPersepectivId = list.OrderBy(t => t.MONTH_YEAR).GroupBy(t => t.GLOBAL_KPI_PERSPECTIVE_ID);
            foreach (var gdata in groupByMonthData)
            {
                lineChart.xAxis.categories.Add(gdata.Key.ToString("MMM-yyy"));
            }
            List<seriesItem> series = new List<seriesItem>();
            foreach (var gdata in groupByPersepectivId)
            {
                seriesItem seriesData = new seriesItem();
                seriesData.name = GetPerspectiveName(gdata.Key);

                foreach (string mm in lineChart.xAxis.categories)
                {
                    List<KPI_DETAILS_EXTENDED> tes = gdata.ToList().Where(t => t.MONTH_YEAR == Convert.ToDateTime(mm)).ToList<KPI_DETAILS_EXTENDED>();
                    decimal result = 0;

                    if (tes.Count > 0)
                    {
                        foreach (KPI_DETAILS_EXTENDED ext in tes)
                        {
                            if (ext.PERCENT.GetValueOrDefault() >= 100)
                                result += ext.PERCENT.GetValueOrDefault();
                        }
                    }
                    else
                    {
                        result = result + 0;
                    }
                    decimal finalres;
                    if (tes.Count > 0 && result > 0)
                        finalres = result / tes.Count;
                    else
                        finalres = 0;

                    seriesData.data.Add(Math.Round(finalres, 1));
                }
                series.Add(seriesData);
            }
            lineChart.series = series;

            return lineChart;
        }
        [GET("GetHealthReportDetailedProject")]
        [ActionName("GetHealthReportDetailedProject")]
        [HttpGet]
        public IHttpActionResult GetHealthReportDetailedProject(string StartDate, string EndDate)
        {
            string empId = "";
            List<string> projIds = new List<string>();
            string custId = string.Empty;
            if (Request.Headers.Contains("empId"))
                empId = Request.Headers.GetValues("empId").ToList()[0];
            if (Request.Headers.Contains("custId"))
                custId = Request.Headers.GetValues("custId").ToList()[0];
            if (Request.Headers.Contains("projId"))
                projIds = Request.Headers.GetValues("projId").ToList<string>()[0].ToString().Split(',').ToList<string>();


            var projects = GetProjectListForUser(empId);
            List<string> empProjects = projects.Select(t => t.PROJ_ID).ToList();

            DateTime stDate = DateTime.Parse(StartDate);
            DateTime enDate = DateTime.Parse(EndDate);

            enDate = enDate.AddMonths(1).AddSeconds(-1);
            List<KPI_DETAILS_EXTENDED> kpis = new List<KPI_DETAILS_EXTENDED>();
            kpis = CSPdb.AppRepo.GetKPIDetails(stDate, enDate).ToList();

            if (custId == "-1" || custId == string.Empty)
                kpis = kpis.Where(t => empProjects.Contains(t.PROJECT_ID) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();
            else
                kpis = kpis.Where(t => empProjects.Contains(t.PROJECT_ID) && (projIds.Contains(t.PROJECT_ID) && t.CUSTOMER_ID == custId) && t.KPI_ACTUAL != "" && t.SLA_TARGET_HIGH_VALUE != null).ToList();

            FillDetails(ref kpis);

            var tmpCustomer = kpis.GroupBy(t => t.CUSTOMER_ID);

            List<GLOBAL_PERSPECTIVE> perstectives = CSPdb.GLOBAL_PERSPECTIVE.GetAll().Where(t => t.GROUP_CODE == "KPI").ToList();

            List<HealthReportCustomer> customers = new List<HealthReportCustomer>();
            foreach (var c in tmpCustomer)
            {
                HealthReportCustomer cust = new HealthReportCustomer(c.ToList(), perstectives);
                customers.Add(cust);
            }
            List<List<tableCell>> HelthReportTable = GetHelthReportTable(customers, perstectives);

            return Ok(HelthReportTable);
        }

        [GET("GetProjectCsatURL")]
        [ActionName("GetProjectCsatURL")]
        [HttpGet]
        public IHttpActionResult GetProjectCsatURL(string projId, string month, string year)
        {
            string url = string.Empty;
            DateTime pubdate = Convert.ToDateTime("1-" + month + "-" + year.ToString()).AddMonths(1);

            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId);
            if (IsPremier(project.CUST_ID))
            {

            }
            else
            {
                var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.START_DATE <= pubdate && x.END_DATE >= pubdate);
                if (batch == null)
                    batch = CSPdb.CSS_BATCHES.GetAll().Where(x => x.END_DATE <= pubdate).OrderByDescending(x => x.ID).FirstOrDefault();
                if (batch == null)
                    batch = CSPdb.CSS_BATCHES.GetAll().OrderByDescending(x => x.ID).FirstOrDefault();

                var surveys = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.PROJ_ID == projId && x.BATCH_ID == batch.ID).ToList();

                var latestSurvey = surveys.OrderByDescending(x => x.ID).FirstOrDefault();
                if (latestSurvey != null)
                {
                    var surveyIteration = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(x => x.BATCH_CUSTOMERS_ID == latestSurvey.ID);

                    if (surveyIteration != null)
                        url = $"{helper.GetAbsoulteUri()}/CustomerSuccessSurvey/{surveyIteration.SURVEY_ID}";
                }
            }

            return Ok(url);
        }

        private CrispProjectSummary GetCristProjectDetails(CRISP_SCORES_PROJECT proj, List<ProjectBase> basProjects, List<CRISP_CATEGORY> categories, List<CRISP_SCORES_CATEGORY> score_categories, List<CRISP_CRITERIA> criterias, List<CRISP_SCORES_CRITERIA> score_criterias, List<CRISP_VALIDATIONS> validations, List<CRISP_SCORES_VALIDATIONS> score_validations)
        {
            CrispProjectSummary projDetails = new CrispProjectSummary { categories = new List<CrispCategoryDetails>(), validations = new List<validations>(), CRISP_SCORES_PROJECT = proj };
            var project = basProjects.FirstOrDefault(t => t.PROJ_ID == proj.PROJECT_ID);
            if (project == null) return projDetails;
            projDetails.CUST_ID = project.CUST_ID;
            projDetails.projecT_ID = proj.PROJECT_ID;
            projDetails.projecT_NAME = project.PROJ_NM;
            projDetails.score = proj.SCORE;
            //Implement NA in next line
            List<int> scoreCriteriaIds = score_criterias.Where(t => t.CRISP_SCORES_PROJECT_ID == proj.ID).Select(u => u.CRITERIA_ID).ToList<int>();
            projDetails.targetScore = criterias.Where(t => scoreCriteriaIds.Contains(t.ID)).Sum(u => u.SCORE);
            projDetails.rag = this.GetRagFromScore(projDetails.targetScore, projDetails.score);

            //validations

            //var lstVal0 =
            //    from score_valid in score_validations.OrderBy(x => x.ID).Take(28)
            //    join valid in validations on score_valid.VALIDATION_ID equals valid.ID
            //    select new validations()
            //    {
            //        VALIDATION_ID = score_valid.VALIDATION_ID,
            //        CRITERIA_ID = validations.FirstOrDefault(t => t.ID == score_valid.VALIDATION_ID).CRITERIA_ID,
            //        CATEGORY_ID = criterias.FirstOrDefault(t => t.ID == (validations.FirstOrDefault(u => u.ID == score_valid.VALIDATION_ID).CRITERIA_ID)).CATEGORY_ID,
            //        //CATEGORY_NAME = categories.FirstOrDefault(v => v.ID == (criterias.FirstOrDefault(t => t.ID == (validations.FirstOrDefault(u => u.ID == score_valid.VALIDATION_ID).CRITERIA_ID)).CATEGORY_ID)).CATEGORY_NAME,
            //        ACHIEVED = score_valid.ACHIEVED,
            //        COMMENTS = score_valid.COMMENTS,
            //        VALIDATION_NAME = valid.VALIDATION_NAME,

            //    };

            //var lstVal = lstVal0.ToList();
            projDetails.validations = new List<validations>();
            foreach (var item in score_criterias.OrderBy(x => x.CRITERIA_ID))
            {
                if (projDetails.validations.Any(x => x.CRITERIA_ID == item.CRITERIA_ID)) continue;
                var criteria = criterias.Single(x => x.ID == item.CRITERIA_ID);
                var category = categories.Single(x => x.ID == criteria.CATEGORY_ID);
                var validation = validations.FirstOrDefault(x => x.CRITERIA_ID == criteria.ID && x.SCORE_PERCENTAGE.ToString() == item.SCORE_PERCENTAGE);
                if (validation == null && criteria.ID == 2)
                {
                    if (item.SCORE_PERCENTAGE == "100")
                        validation = validations.FirstOrDefault(x => x.CRITERIA_ID == criteria.ID && x.SCORE_PERCENTAGE.ToString() == "100");
                    else
                        validation = validations.FirstOrDefault(x => x.CRITERIA_ID == criteria.ID && x.SCORE_PERCENTAGE.ToString() == "0");
                }
                if (validation == null) continue;
                var scorevalidation = score_validations.FirstOrDefault(x => x.VALIDATION_ID == validation.ID);
                var newItem = new validations()
                {
                    CATEGORY_ID = category.ID,
                    CATEGORY_NAME = category.CATEGORY_NAME,
                    ACHIEVED = scorevalidation != null ? scorevalidation.ACHIEVED : false,
                    //STATUS = scorevalidation.ACHIEVED ? "MET" : "NOT MET",
                    CRITERIA_ID = criteria.ID,
                    CRITERIA_NAME = criteria.CRITERIA_NAME,
                    ELIGIBLE = criteria.SCORE,
                    VALIDATION_ID = validation.ID,
                    VALIDATION_NAME = validation.VALIDATION_NAME,
                    SCORE = item.SCORE
                };
                if (newItem.SCORE == newItem.ELIGIBLE)
                {
                    newItem.STATUS = "Met";
                }
                else if (newItem.SCORE > 0)
                {
                    newItem.STATUS = "Partially Met";
                }
                else
                {
                    newItem.STATUS = "Not Met";
                }
                projDetails.validations.Add(newItem);

            }

            //foreach (var item in lstVal)
            //{
            //    item.CRITERIA_NAME = criterias.FirstOrDefault(x => x.ID == item.CRITERIA_ID)?.CRITERIA_NAME;
            //    item.CATEGORY_NAME = categories.FirstOrDefault(x => x.ID == item.CATEGORY_ID)?.CATEGORY_NAME;
            //    item.ELIGIBLE = criterias.FirstOrDefault(x => x.ID == item.CRITERIA_ID).SCORE;
            //}


            //projDetails.validations = lstVal.ToList().Where(t => t.ACHIEVED == false).ToList<validations>();
            //projDetails.validations = lstVal.ToList().Where(t => t.ACHIEVED==false).ToList<validations>();

            //Categories (CRISP)
            projDetails.categories = new List<CrispCategoryDetails>();
            List<CRISP_SCORES_CATEGORY> cats = score_categories.Where(t => t.CRISP_SCORES_PROJECT_ID == proj.ID).ToList<CRISP_SCORES_CATEGORY>();

            foreach (var c in cats.OrderBy(x => x.ID))
            {
                if (projDetails.categories.Any(x => x.id == c.CATEGORY_ID)) continue;
                CrispCategoryDetails catDetails = new CrispCategoryDetails();
                catDetails.name = categories.Where(t => t.ID == c.CATEGORY_ID).FirstOrDefault().CATEGORY_NAME;
                catDetails.id = c.CATEGORY_ID;
                catDetails.score = c.SCORE;
                catDetails.targetScore = criterias.Where(t => t.CATEGORY_ID == c.CATEGORY_ID).Sum(u => u.SCORE);
                catDetails.rag = this.GetRagFromScore(catDetails.targetScore, catDetails.score);

                projDetails.categories.Add(catDetails);
            }
            int cnt = 0;
            foreach (CrispCategoryDetails c in projDetails.categories)
            {
                if (c.id != 3)
                {
                    if (c.targetScore == c.score)
                        cnt++;
                }
            }
            if (cnt == 4)
            {
                if (projDetails.categories[2].score == (projDetails.categories[2].targetScore - 2))
                    projDetails.rag = "#b1d57e";
            }

            return projDetails;
        }


        private string GetRagFromScore(int target, int actual)
        {
            string rag = "red";

            double t = Convert.ToDouble(target);
            double a = Convert.ToDouble(actual);
            double d = (a / t) * 100;
            if (d == 100)
                rag = "#b1d57e"; //"green";
            else if (d >= 90)
                rag = "#feeb84"; //"amber";
            else
                rag = "#fb8f73"; //"red";

            return rag;

        }

        private string GetRagFromScore(string score)
        {
            decimal dScore = Convert.ToDecimal(score);
            return GetRagFromScore(dScore);
        }

        private string GetRagFromScore(decimal score)
        {
            string rag; ;

            if (score >= 0)
            {
                if (score >= 98)
                    rag = "#3ab376"; //"green";
                else if (score >= 90)
                    rag = "#e16f00"; //"amber";
                else
                    rag = "red"; //"red";
            }

            else
            {
                rag = "red";
            }

            return rag;
        }

        public class CrispCategoryDetails
        {
            public int id { get; set; }
            public string name { get; set; }
            public string rag { get; set; }
            public int score { get; set; }
            public int targetScore { get; set; }
        }

        public class CrispCategoryRags
        {
            public int count { get; set; }
            public List<string> projectIds { get; set; } = new List<string>();
            public string rag { get; set; }
        }

        public class CrispCategorySummary
        {
            public CrispCategoryRags amberRags { set; get; } = new CrispCategoryRags() { rag = "amber" };
            public CrispCategoryRags greenRags { set; get; } = new CrispCategoryRags() { rag = "green" };
            public string name { set; get; }
            public CrispCategoryRags redRags { set; get; } = new CrispCategoryRags() { rag = "red" };
        }

        public class CrispProjectSummary
        {
            public List<CrispCategoryDetails> categories { get; set; } = new List<CrispCategoryDetails>();
            public CRISP_SCORES_PROJECT CRISP_SCORES_PROJECT { get; set; }
            public string CUST_ID { get; set; }
            public string projecT_ID { get; set; }
            public string projecT_NAME { get; set; }
            public string rag { get; set; }
            public int score { get; set; }
            public int targetScore { get; set; }
            public List<validations> validations { get; set; } = new List<validations>();
        }
        public class validations
        {
            public bool ACHIEVED { get; set; } = false;
            public int CATEGORY_ID { get; set; }
            public string CATEGORY_NAME { get; set; }
            public string CRITERIA_NAME { get; set; }
            public string STATUS { get; set; }
            public string COMMENTS { get; set; }
            public int CRITERIA_ID { get; set; }
            public int VALIDATION_ID { get; set; }
            public int ELIGIBLE { get; set; }
            public int SCORE { get; set; }
            public string VALIDATION_NAME { get; set; }
        }
    }
}