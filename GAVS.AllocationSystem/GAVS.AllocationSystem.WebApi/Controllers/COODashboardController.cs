using AttributeRouting.Helpers;
using AttributeRouting.Web.Mvc;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using GAVS.AllocationSystem.Data;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Charts;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
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
using System.DirectoryServices.ActiveDirectory;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Runtime.InteropServices;
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
    [ExceptionFilter]
    public partial class AllSysController
    {
        [POST("GetEarlyWarningSignalCount")]
        [ActionName("GetEarlyWarningSignalCount")]
        [HttpPost]
        public IHttpActionResult GetEarlyWarningSignalCount(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            var cnt = CSPdb.PROJECT_ISSUE.GetAll().Count(x => x.ISACTIVE && x.IDENTIFIED_DATE >= ipParams.START_DATE && x.IDENTIFIED_DATE <= ipParams.END_DATE && projects.Contains(x.PROJECT_ID));
            FillResponseTime(stopwatch);
            return Ok(cnt);
        }

        [POST("GetEarlyWarningSignalDetails")]
        [ActionName("GetEarlyWarningSignalDetails")]
        [HttpPost]
        public IHttpActionResult GetEarlyWarningSignalDetails(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            // var projectDetails = GetProjectDetailsForEWS(ipParams);
            // var projectIds = projectDetails.Select(x => x.PROJ_ID).ToList();

            //var portfolioTitle = Cldb.AppRepo.GetPortfolioDetails();
            var projectIds = ipParams.PROJ_IDS;
            var projectPortfolios = CSPdb.PORTFOLIO_PROJECT.GetAll().Where(x => projectIds.Contains(x.PROJ_ID)).ToList();
            var projectPortfolioIds = projectPortfolios.Select(x => x.PORTFOLIO_ID).ToList();
            var portfolios = CSPdb.PORTFOLIO.GetAll().Where(x => projectPortfolioIds.Contains(x.ID)).ToList();
            var projectIssues = CSPdb.PROJECT_ISSUE.GetAll().Where(x => x.ISACTIVE && x.IDENTIFIED_DATE >= ipParams.START_DATE && x.IDENTIFIED_DATE <= ipParams.END_DATE && projectIds.Contains(x.PROJECT_ID)).ToList();
            var issueProjIds = projectIssues.Select(x => x.PROJECT_ID).ToList();
            var projects = Cldb.PROJECT.GetAll().Where(x => issueProjIds.Contains(x.PROJ_ID) && x.PROJ_STATUS.ToLower() != "close").ToList();
            var issueCustsIds = projects.Select(x => x.CUST_ID).ToList();
            var custs = Cldb.CUSTOMER.GetAll().Where(x => issueCustsIds.Contains(x.CUST_ID)).ToList();

            var ewsList = new List<EWSDetails>();

            foreach (PROJECT_ISSUE p in projectIssues)
            {
                var projectPortfolio = projectPortfolios.FirstOrDefault(x => x.PROJ_ID == p.PROJECT_ID);
                var portfolioTitle = projectPortfolio == null ? "NA" : portfolios.FirstOrDefault(x => x.ID == projectPortfolio.PORTFOLIO_ID).TITLE;
                var curCustId = projects.FirstOrDefault(x => x.PROJ_ID == p.PROJECT_ID).CUST_ID;
                var curCust = custs.FirstOrDefault(x => x.CUST_ID == curCustId);
                ewsList.Add(new EWSDetails()
                {
                    EWS = p.DESCRIPTION,
                    Account = curCust.CUST_NM,
                    Severity = p.SEVERITY,
                    Level = p.LEVEL,
                    Project = projects.FirstOrDefault(x => x.PROJ_ID == p.PROJECT_ID).PROJ_NM,
                    Project_ID = p.PROJECT_ID,
                    Cust_ID = curCust.CUST_ID,
                    Portfolio = portfolioTitle// == null ? "NA" : portfolioTitle.TITLE
                });
            }
            // FillResponseTime(stopwatch);
            return Ok(ewsList);
        }


        [POST("GetOverallHealthIndex")]
        [ActionName("GetOverallHealthIndex")]
        [HttpPost]
        public IHttpActionResult GetOverallHealthIndex(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();

            var kpiAll = CSPdb.AppRepo.GetKPIDetails(startDate, endDate, string.Join(",", projects));
            //var filteredKPIs = new List<KPI_DETAILS_EXTENDED>();
            // filteredKPIs = kpiAll.Where(x => x.ISACTIVE && projects.Contains(x.PROJECT_ID)).ToList();
            var cnt = GetSuccessGoalScoreNewLogic1(kpiAll, cutoffDays);
            FillResponseTime(stopwatch);
            return Ok(cnt);
        }

        [POST("GetOverallHealthIndexTrend")]
        [ActionName("GetOverallHealthIndexTrend")]
        [HttpPost]
        public IHttpActionResult GetOverallHealthIndexTrend(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            var list = new List<KPI_DETAILS_EXTENDED>();
            var lineChart = new HighChartsLine();
            var result = new HighChartsLine();
            var startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            var endDate = ipParams.END_DATE ?? DateTime.Today;
            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();
            List<seriesItem> series = new List<seriesItem>();
            if (ipParams != null)
            {
                list = CSPdb.AppRepo.GetKPIDetails(startDate, endDate, string.Join(",", projects));
                list = list.Where(x => !string.IsNullOrEmpty(x.KPI_ACTUAL) && x.SLA_TARGET_HIGH_VALUE.HasValue
                               && x.ISACTIVE).ToList();
                FillDetails(ref list);
                var seriesData = new seriesItem();
                seriesData.name = "Values"; string mm = string.Empty;
                var groupByMonthData = list.OrderBy(t => t.MONTH_YEAR).GroupBy(t => t.MONTH_YEAR);
                foreach (var gdata in groupByMonthData)
                {
                    lineChart.xAxis.categories.Add(gdata.Key.ToString("MMM-yyy"));
                    mm = gdata.Key.ToString("MMM-yyy");
                    decimal finalres = GetSuccessGoalScoreNewLogic1(list.Where(t => t.MONTH_YEAR == Convert.ToDateTime(mm)).ToList<KPI_DETAILS_EXTENDED>(), cutoffDays);
                    seriesData.data.Add(Math.Round(finalres, 1));
                }
                series.Add(seriesData);
                lineChart.series = series;
            }
            FillResponseTime(stopwatch);
            return Ok(lineChart);
        }

        [POST("GetSuccessGoalScore")]
        [ActionName("GetSuccessGoalScore")]
        [HttpPost]
        public IHttpActionResult GetSuccessGoalScore(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();

            var kpiAll = new List<KPI_DETAILS_EXTENDED>();
            if (projects.Count > 0)
            {
                kpiAll = getkpidetails(startDate, endDate, string.Join(",", projects));
            }
            var cnt =  GetSuccessGoalScoreNewLogic1(kpiAll, cutoffDays);
            FillResponseTime(stopwatch);
            return Ok(cnt);
        }
        private List<KPI_DETAILS_EXTENDED> getkpidetails(DateTime startDate, DateTime endDate, String ProjIds)
        {
            return CSPdb.AppRepo.GetKPIDetails(startDate, endDate, string.Join(",", ProjIds));
        }

        [POST("GetOverallAccountHealth")]
        [ActionName("GetOverallAccountHealth")]
        [HttpPost]
        public IHttpActionResult GetOverallAccountHealth(HttpRequestMessage request)
        {

            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var data = new List<OverallAccountHealth>();
            var stopwatch = Stopwatch.StartNew();

            var kpiAll = new List<KPI_DETAILS_EXTENDED>();
            if (projects.Count > 0)
            {
                kpiAll = CSPdb.AppRepo.GetKPIDetails(startDate, endDate, string.Join(",", projects));
            }

            var projectPortfolios = CSPdb.PORTFOLIO_PROJECT.GetAll().Where(x => x.ISACTIVE).ToList();
            var portfolios = CSPdb.PORTFOLIO.GetAll().Where(x => x.ISACTIVE).ToList();
            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();
            var totalScore = GetSuccessGoalScoreNewLogic1(kpiAll, cutoffDays);
            var custKpis = new List<OverallAccountHealth>();
            var portKpis = new List<OverallAccountHealth>();

            foreach (string projId in projects)
            {
                var temp = kpiAll.FirstOrDefault(x => x.PROJECT_ID == projId);
                if (temp != null)
                {
                    var filteredKPIs = new List<KPI_DETAILS_EXTENDED>();
                    //filteredKPIs = kpiAll.Where(x => x.ISACTIVE && x.CREATED_DATE >= ipParams.START_DATE && x.CREATED_DATE <= ipParams.END_DATE && x.PROJECT_ID == projId).ToList();
                    filteredKPIs = kpiAll.Where(x => x.PROJECT_ID == projId).ToList();
                    var cnt = GetSuccessGoalScoreNewLogic1(filteredKPIs, cutoffDays);
                    if (!custKpis.Exists(x => x.CUST_ID == temp.CUSTOMER_ID))
                    {
                        var filteredKPIsCust = kpiAll.Where(x => x.ISACTIVE && x.CUSTOMER_ID == temp.CUSTOMER_ID).ToList();
                        var custCnt = GetSuccessGoalScoreNewLogic1(filteredKPIsCust, cutoffDays);
                        custKpis.Add(new OverallAccountHealth()
                        {
                            CUST_ID = temp.CUSTOMER_ID,
                            CUST_NAME = temp.CUSTOMER_NM,
                            SCORE = custCnt
                        });
                    }

                    if (IsPremier(temp.CUSTOMER_ID))
                    {
                        var projectPortfolio = projectPortfolios.FirstOrDefault(x => x.PROJ_ID == projId);
                        var portfolio = portfolios.FirstOrDefault(x => x.ID == projectPortfolio.PORTFOLIO_ID);
                        var portProjs = projectPortfolios.Where(x => x.PORTFOLIO_ID == projectPortfolio.PORTFOLIO_ID).Select(x => x.PROJ_ID).ToList();
                        var filteredKPIsPort = kpiAll.Where(x => x.ISACTIVE && portProjs.Contains(x.PROJECT_ID)).ToList();
                        if (!portKpis.Exists(x => x.PORTFOLIO_ID == portfolio.ID))
                        {
                            //var filteredKPIsPort = kpiAll.Where(x => x.ISACTIVE && x. == temp.CUSTOMER_ID).ToList();
                            //var custCnt = GetSuccessGoalScoreNewLogic1(filteredKPIsPort);
                            portKpis.Add(new OverallAccountHealth()
                            {
                                CUST_ID = temp.CUSTOMER_ID,
                                CUST_NAME = temp.CUSTOMER_NM,
                                PORTFOLIO_ID = portfolio.ID,
                                PORTFOLIO_NAME = portfolio.TITLE,
                                SCORE = GetSuccessGoalScoreNewLogic1(filteredKPIsPort, cutoffDays)
                            });
                        }
                        data.Add(new OverallAccountHealth() { PROJ_ID = projId, CUST_ID = temp.CUSTOMER_ID, CUST_NAME = temp.CUSTOMER_NM, PROJ_NAME = temp.PROJECT_NM, SCORE = cnt, PORTFOLIO_ID = portfolio.ID, PORTFOLIO_NAME = portfolio.TITLE });
                    }
                    else
                        data.Add(new OverallAccountHealth() { PROJ_ID = projId, CUST_ID = temp.CUSTOMER_ID, CUST_NAME = temp.CUSTOMER_NM, PROJ_NAME = temp.PROJECT_NM, SCORE = cnt });
                }
            }
            var dataOP = new OverallAccountHealthResullts() { OVERALL_SCORE = totalScore, CUST_KPIS = custKpis, PORTFOLIO_KPIS = portKpis, PROJECT_KPIS = data };
            FillResponseTime(stopwatch);
            return Ok(dataOP);
        }


        [POST("GetKPIPerspectives")]
        [ActionName("GetKPIPerspectives")]
        [HttpPost]
        public IHttpActionResult GetKPIPerspectives(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var perspectiveKpis = new List<PerspectivesByKPICategory>();
            var kpiAll = new List<KPI_DETAILS_EXTENDED>();
            if (projects.Count > 0)
            {
                kpiAll = CSPdb.AppRepo.GetKPIDetails(startDate, endDate, string.Join(",", projects));
            }

            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();
            var perstectives = new List<GLOBAL_PERSPECTIVE>();
            perstectives = CSPdb.GLOBAL_PERSPECTIVE.GetAll().Where(t => t.GROUP_CODE == "KPI").ToList();

            var kpiCategories = kpiAll.Select(x => x.GLOBAL_KPI_PERSPECTIVE_ID).Distinct();
            foreach (GLOBAL_PERSPECTIVE perstective in perstectives)
            {
                if (!perspectiveKpis.Exists(x => x.KPI_CATEGORYID == perstective.ID))
                {
                    var filteredKPIs = kpiAll.Where(x => x.GLOBAL_KPI_PERSPECTIVE_ID == perstective.ID).ToList();
                    perspectiveKpis.Add(new PerspectivesByKPICategory()
                    {
                        KPI_CATEGORYID = perstective.ID,
                        KPI_CATEGORY = perstective.SHORT_DESC,
                        SCORE = GetSuccessGoalScoreNewLogic1(filteredKPIs, cutoffDays)
                    });
                }
            }
            var totalScore = GetSuccessGoalScoreNewLogic1(kpiAll, cutoffDays);
            var data = new KPIPerspectives() { OVERALL_SCORE = totalScore, PerspectivesByKPICategory = perspectiveKpis.OrderByDescending(x => x.SCORE).ToList() };
            FillResponseTime(stopwatch);
            return Ok(data);
        }




        [POST("GetAchievementsByCustomerSuccessGoal")]
        [ActionName("GetAchievementsByCustomerSuccessGoal")]
        [HttpPost]
        public IHttpActionResult GetAchievementsByCustomerSuccessGoal(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var achievementsByCustomerSuccessGoals = new List<AchievementsByCustomerSuccessGoal>();
            var kpiAll = new List<KPI_DETAILS_EXTENDED>();
            if (projects.Count > 0)
            {
                kpiAll = CSPdb.AppRepo.GetKPIDetails(startDate, endDate, string.Join(",", projects));
            }
            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();
            var kpiGoalIds = kpiAll.Select(x => x.GOAL_ID).Distinct();
            var kpiGoals = CSPdb.KPI_GOALS.GetAll().Where(x => kpiGoalIds.Contains(x.ID));
            foreach (int kpiGoalId in kpiGoalIds)
            {
                if (!achievementsByCustomerSuccessGoals.Exists(x => x.GOAL_ID == kpiGoalId))
                {
                    var filteredKPIs = kpiAll.Where(x => x.GOAL_ID == kpiGoalId).ToList();
                    achievementsByCustomerSuccessGoals.Add(new AchievementsByCustomerSuccessGoal()
                    {
                        GOAL_ID = kpiGoalId,
                        GOAL_NAME = kpiGoals.FirstOrDefault(x => x.ID == kpiGoalId).DESCRIPTION,
                        SCORE = GetSuccessGoalScoreNewLogic1(filteredKPIs, cutoffDays)
                    }); ;
                }
            }
            //  FillResponseTime(stopwatch);
            return Ok(achievementsByCustomerSuccessGoals);
        }


        [POST("GetKPITrendTargetActualsByGoal")]
        [ActionName("GetKPITrendTargetActualsByGoal")]
        [HttpPost]
        private IHttpActionResult GetKPITrendTargetActualsByGoal(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            //Data
            List<KPI_GOALS> goals = CSPdb.KPI_GOALS.GetAll().Where(t => ipParams.CUST_ID.Contains(t.CUSTOMER_ID) && projects.Contains(t.PROJECT_ID) && t.ISACTIVE == true).OrderBy(u => u.DISPLAY_ORDER).ToList<KPI_GOALS>();
            List<int> goalIds = goals.Select(s => s.ID).ToList<int>();

            List<KPI> KPIs = CSPdb.KPI.GetAll().Where(t => goalIds.Contains(t.GOAL_ID) && t.ISACTIVE == true).ToList<KPI>();
            List<KPI> SortedKPIs = new List<KPI>();
            foreach (KPI_GOALS g in goals)
            {
                SortedKPIs.AddRange(KPIs.Where(t => t.GOAL_ID == g.ID).OrderBy(u => u.DISPLAY_ORDER).ToList<KPI>());
            }

            List<int> kpiIds = SortedKPIs.Select(s => s.ID).ToList<int>();
            List<KPI_DETAILS> allDetails = CSPdb.KPI_DETAILS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID) && t.ISACTIVE == true && t.KPI_ACTUAL != "").ToList<KPI_DETAILS>();
            List<KPI_DETAILS> SortedallDetails = new List<KPI_DETAILS>();
            foreach (KPI k in SortedKPIs)
            {
                SortedallDetails.AddRange(allDetails.Where(t => t.KPI_ID == k.ID).ToList<KPI_DETAILS>());
            }
            //Chart

            List<HighChartsLineGroup> TrendChartsGroup = new List<HighChartsLineGroup>();

            foreach (int i in kpiIds)
            {
                List<KPI_DETAILS> details = allDetails.Where(t => t.KPI_ID == i).OrderBy(u => u.PERIOD).ToList<KPI_DETAILS>();
                if (details != null && details.Count > 0)
                {
                    KPI tmpKPI = KPIs.Where(t => t.ID == i).FirstOrDefault<KPI>();
                    HighChartsLine chart = new HighChartsLine();
                    chart.title.text = tmpKPI.KPI_NAME + " - " + tmpKPI.SERVICE_AREA;
                    chart.title.style = new style() { color = "#333333", fontSize = "13px" };
                    chart.subtitle.text = tmpKPI.SUPPORT_WINDOW;
                    chart.xAxis.gridLineWidth = 1;


                    //Series Actual
                    seriesItem item = new seriesItem();
                    item.name = "Actual";
                    item.width = 1;
                    string yAxisTitle = string.Empty;
                    List<decimal> Targets = new List<decimal>();
                    List<KPI_TARGETS> kpiTargets = CSPdb.KPI_TARGETS.GetAll().Where(t => t.KPI_ID == tmpKPI.ID && t.ISACTIVE == true).ToList<KPI_TARGETS>();
                    foreach (KPI_DETAILS d in details)
                    {
                        Targets.Add(GetKPITarget(kpiTargets, d.PERIOD));
                        if (d.KPI_ACTUAL != "")
                            item.data.Add(Convert.ToDecimal(d.KPI_ACTUAL));
                        if (tmpKPI.FREQUENCY == "Monthly")
                            chart.xAxis.categories.Add(d.PERIOD.ToString("MMM-yyy"));
                        else
                            chart.xAxis.categories.Add(d.PERIOD.ToString("dd-MMM-yyy"));
                        yAxisTitle = "In " + tmpKPI.SLA_TARGET_UNIT_OF_MEASUREMENT;
                    }

                    //Target Actual
                    seriesItem target = new seriesItem();
                    target.name = "Target";
                    target.color = "#63be7b";
                    target.width = 1;
                    foreach (decimal d in Targets)
                    {
                        target.data.Add(d);
                    }

                    chart.series.Add(target);
                    chart.series.Add(item);




                    chart.yAxis = new yAxis();
                    chart.yAxis.tickInterval = 20;
                    chart.yAxis.title.text = yAxisTitle;
                    chart.yAxis.gridLineWidth = 1;

                    string sGoal = goals.Where(t => t.ID == tmpKPI.GOAL_ID).FirstOrDefault<KPI_GOALS>().DESCRIPTION;

                    HighChartsLineGroup h = TrendChartsGroup.Where(t => t.GoalName == sGoal).FirstOrDefault<HighChartsLineGroup>();
                    if (h != null)
                    {
                        h.TrendHighChart.Add(new HighChartsLineWithArea() { KPIId = tmpKPI.ID, AreaName = tmpKPI.SERVICE_AREA, TrendHighChart = chart });
                    }
                    else
                    {
                        TrendChartsGroup.Add(new HighChartsLineGroup() { GoalName = sGoal, TrendHighChart = new List<HighChartsLineWithArea>() { new HighChartsLineWithArea() { KPIId = tmpKPI.ID, AreaName = tmpKPI.SERVICE_AREA, TrendHighChart = chart } } });
                    }
                }
            }
            FillResponseTime(stopwatch);
            return Ok(TrendChartsGroup);
        }



        [POST("GetActionitemsForProjects")]
        [ActionName("GetActionitemsForProjects")]
        [HttpPost]
        public IHttpActionResult GetActionitemsForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            var result = CSPdb.AppRepo.GetActionitemArea(string.Join(",", projects)).OrderByDescending(x => x.MONTH_NAME).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [POST("GetRisksForProjects")]
        [ActionName("GetRisksForProjects")]
        [HttpPost]
        public IHttpActionResult GetRisksForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            var result = CSPdb.AppRepo.GetRiskAreaChart(string.Join(",", projects)).OrderByDescending(x => x.MONTH_NAME).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [POST("GetIssuesForProjects")]
        [ActionName("GetIssuesForProjects")]
        [HttpPost]
        public IHttpActionResult GetIssuesForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            var result = CSPdb.AppRepo.GetIssueAreaChart(string.Join(",", projects)).OrderByDescending(x => x.MONTH_NAME).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [POST("GetProjectTeamCountForProjects")]
        [ActionName("GetProjectTeamCountForProjects")]
        [HttpPost]
        public IHttpActionResult GetProjectTeamCountForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            var result = CSPdb.AppRepo.GetProjectTeamCount(string.Join(",", projects)).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [POST("GetActionitemsDetailsForProjects")]
        [ActionName("GetActionitemsDetailsForProjects")]
        [HttpPost]
        public IHttpActionResult GetActionitemsDetailsForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var result = CSPdb.AppRepo.GetActionitemsDetailsForProjects(startDate, endDate, string.Join(",", projects)).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [POST("GetRisksDetailsForProjects")]
        [ActionName("GetRisksDetailsForProjects")]
        [HttpPost]
        public IHttpActionResult GetRisksDetailsForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);

            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var result = CSPdb.AppRepo.GetRisksDetailsForProjects(startDate, endDate, string.Join(",", projects)).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [POST("GetIssuesDetailsForProjects")]
        [ActionName("GetIssuesDetailsForProjects")]
        [HttpPost]
        public IHttpActionResult GetIssuesDetailsForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);

            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var result = CSPdb.AppRepo.GetIssuesDetailsForProjects(startDate, endDate, string.Join(",", projects)).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }



        [POST("GetContractStatusDetailsForProjects")]
        [ActionName("GetContractStatusDetailsForProjects")]
        [HttpPost]
        public IHttpActionResult GetContractStatusDetailsForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);

            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            var result = CSPdb.AppRepo.GetContractStatusDetailsForProjects(startDate, endDate, string.Join(",", projects)).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [POST("GetCustomersuccessKPIPerformance")]
        [ActionName("GetCustomersuccessKPIPerformance")]
        [HttpPost]
        public IHttpActionResult GetCustomersuccessKPIPerformance(HttpRequestMessage request, int groupBy)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;
            int goalId = ipParams.GOAL_ID ?? 0;
            string serviceTowerId = null;
            DateRange range = new DateRange(startDate, enDateRange.Monthly);
            FillResponseTime(stopwatch);

            switch (groupBy)
            {
                case 1:
                    return Ok(GetTableChartGroupByServiceTowers(projects, startDate, endDate, serviceTowerId));
                case 2:
                    return Ok(GetTableChartGroupByGoals(projects, startDate, endDate, goalId));
                case 3:
                    return Ok(GetTableChartGroupByKPIArea(projects, startDate, endDate, serviceTowerId));
                default:
                    return BadRequest("Invalid GroupBy value");
            }
        }

        private List<structGoals> GetTableChartGroupByGoals(List<string> projectIds, DateTime startDate, DateTime endDate, int goalId = 0)
        {
            List<List<tableCell>> data = new List<List<tableCell>>();
            DateRange range = new DateRange(startDate, endDate);
            List<KPI_GOALS> goals = new List<KPI_GOALS>();
            if (goalId == 0)
                goals = CSPdb.KPI_GOALS.GetAll().Where(t => projectIds.Contains(t.PROJECT_ID) && t.ISACTIVE).OrderBy(u => u.DISPLAY_ORDER).ToList<KPI_GOALS>();
            else
                goals = CSPdb.KPI_GOALS.GetAll().Where(t => projectIds.Contains(t.PROJECT_ID) && t.ID == goalId && t.ISACTIVE).OrderBy(u => u.DISPLAY_ORDER).ToList<KPI_GOALS>();
            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();
            var goalIds = goals.Select(s => s.ID).ToList<int>();
            var KPIs = CSPdb.KPI.GetAll().Where(t => goalIds.Contains(t.GOAL_ID) && t.ISACTIVE).ToList<KPI>();
            var SortedKPIs = new List<KPI>();
            foreach (KPI_GOALS g in goals)
            {
                SortedKPIs.AddRange(KPIs.Where(t => t.GOAL_ID == g.ID).OrderBy(u => u.DISPLAY_ORDER).ToList<KPI>());
            }
            var SortedallDetails = new List<KPI_DETAILS>();
            var KPITargets = new List<KPI_TARGETS>();
            var kpiIds = KPIs.Select(s => s.ID).ToList<int>();
            KPITargets = CSPdb.KPI_TARGETS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID)).ToList();
            DateTime stDate = range.StartDate;
            DateTime enDate = range.EndDate;

            var targets = GetKPITargets(KPIs, stDate, enDate);

            //Get only latest update details of a kpi with in the date range
            var allDetails = new List<KPI_DETAILS>();
            var allKPI = CSPdb.KPI_DETAILS.GetAll().Where(x => x.ISACTIVE).ToList();
            foreach (int id in kpiIds)
            {
                var tmpKpiDetail = allKPI.Where(t => t.KPI_ID == id && t.PERIOD >= stDate && t.PERIOD <= enDate).OrderByDescending(u => u.PERIOD).FirstOrDefault();
                if (tmpKpiDetail != null)
                    allDetails.Add(tmpKpiDetail);
            }

            foreach (KPI k in SortedKPIs)
            {
                SortedallDetails.AddRange(allDetails.Where(t => t.KPI_ID == k.ID).ToList<KPI_DETAILS>());
            }

            var supports_window = KPIs.OrderBy(t => t.SUPPORT_WINDOW).Select(s => s.SUPPORT_WINDOW).Distinct().ToList<string>();

            var KPI_high = targets.Where(t => t.SLA_TARGET_HIGH_DESCRIPTION != "" && t.SLA_TARGET_HIGH_DESCRIPTION != null && t.ISACTIVE == true).FirstOrDefault();
            var KPI_medium = targets.Where(t => t.SLA_TARGET_MEDIUM_DESCRIPTION != "" && t.SLA_TARGET_MEDIUM_DESCRIPTION != null && t.ISACTIVE == true).FirstOrDefault();
            var KPI_low = targets.Where(t => t.SLA_TARGET_LOW_DESCRIPTION != "" && t.SLA_TARGET_LOW_DESCRIPTION != null && t.ISACTIVE == true).FirstOrDefault();
            var KPI_veryhigh = targets.Where(t => t.SLA_TARGET_VERYHIGH_DESCRIPTION != "" && t.SLA_TARGET_VERYHIGH_DESCRIPTION != null && t.ISACTIVE == true).FirstOrDefault();

            int colCount = 0;
            if (KPI_high != null)
                colCount += 1;
            if (KPI_medium != null)
                colCount += 1;
            if (KPI_low != null)
                colCount += 1;
            if (KPI_veryhigh != null)
                colCount += 1;

            var header1 = new List<tableCell>();
            header1.Add(new tableCell() { text = "Success Goal", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Work Group / KPI Area", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "KPI Description", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Service Towers", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Priority", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Support window", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Target", rowSpan = 1, colSpan = colCount, color = COLOR_GREEN });
            header1.Add(new tableCell() { text = "Achievement", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "", rowSpan = 2, colSpan = 1, celltype = "link" });
            data.Add(header1);

            var header2 = new List<tableCell>();
            if (KPI_low != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_RED });
            if (KPI_medium != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_AMBER });
            if (KPI_high != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_GREEN });
            if (KPI_veryhigh != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_BLUE });
            data.Add(header2);


            var kpi_all = CSPdb.AppRepo.GetKPIDetails(stDate, stDate.AddMonths(1).AddSeconds(-1)).Where(x => x.ISACTIVE).ToList();
            var filteredKPIs = new List<KPI_DETAILS_EXTENDED>();
            decimal score;
            string sScore;

            foreach (KPI_DETAILS d in SortedallDetails)
            {
                KPI tmpKPI = KPIs.Where(t => t.ID == d.KPI_ID).FirstOrDefault();
                var row = new List<tableCell>();
                var description = goals.Where(t => t.ID == tmpKPI.GOAL_ID).FirstOrDefault<KPI_GOALS>().DESCRIPTION;
                var serviceTowers = getServiceTowerNamesCSVMappedToKpi(d.KPI_ID);
                goalId = goals.Where(t => t.ID == tmpKPI.GOAL_ID).FirstOrDefault<KPI_GOALS>().ID;
                filteredKPIs = kpi_all.Where(x => projectIds.Contains(x.PROJECT_ID) && x.GOAL_ID == goalId && x.ISACTIVE).ToList();
                score = GetSuccessGoalScoreNewLogic1(filteredKPIs, cutoffDays);

                if (score == -1)
                    sScore = "-";
                else
                    sScore = score.ToString("0") + " %";

                var appendedText = description + '|' + goalId.ToString() + '|' + sScore;
                row.Add(new tableCell() { text = appendedText });
                row.Add(new tableCell() { text = tmpKPI.SERVICE_AREA, rowSpan = 1 });
                row.Add(new tableCell() { text = tmpKPI.KPI_NAME, rowSpan = 1 });
                row.Add(new tableCell() { text = serviceTowers, rowSpan = 1 });
                row.Add(new tableCell() { text = tmpKPI.PRIORITY, rowSpan = 1 });
                row.Add(new tableCell() { text = tmpKPI.SUPPORT_WINDOW, rowSpan = 1 });

                var target = this.GetKPITargets(KPITargets.Where(t => t.KPI_ID == tmpKPI.ID && t.ISACTIVE).ToList(), stDate, enDate);

                if (KPI_low != null)
                    row.Add(new tableCell() { text = target.SLA_TARGET_LOW_DESCRIPTION, rowSpan = 1 });
                if (KPI_medium != null)
                    row.Add(new tableCell() { text = target.SLA_TARGET_MEDIUM_DESCRIPTION, rowSpan = 1 });
                if (KPI_high != null)
                    row.Add(new tableCell() { text = target.SLA_TARGET_HIGH_DESCRIPTION, rowSpan = 1 });

                if (KPI_veryhigh != null)
                    row.Add(new tableCell() { text = target.SLA_TARGET_VERYHIGH_DESCRIPTION, rowSpan = 1 });
                //if (d.ISFLAG == true)
                if (d.ISFLAG == true && d.KPI_ACTUAL == string.Empty && d.SLA_STATUS == "NA")
                    row.Add(new tableCell() { text = d.SLA_STATUS, color = GetColorForKPIDetails(d, target), rowSpan = 1, toolTip = GetToolTip(d) });
                else
                    row.Add(new tableCell() { text = d.KPI_ACTUAL, color = GetColorForKPIDetails(d, target), rowSpan = 1, toolTip = GetToolTip(d) });

                row.Add(new tableCell() { text = tmpKPI.ID, rowSpan = 1, celltype = "link" });

                if (target.SLA_TARGET_HIGH_DESCRIPTION != null)
                    data.Add(row);
            }

            var final = new Dictionary<string, structGoals>();

            int iGoal = 1;
            if (data.Count > 2)
            {
                for (int i = 2; i <= data.Count - 1; i++)
                {
                    if (final.ContainsKey(data[i][0].text.ToString()))
                    {
                        final[data[i][0].text.ToString()].Details.Add(data[i]);
                    }
                    else
                    {
                        final.Add(data[i][0].text.ToString(), new structGoals() { Goal = data[i][0].text.ToString(), Details = new List<List<tableCell>>() { data[i] } });
                        iGoal += 1;
                    }
                }
            }

            var returnList = new List<structGoals>();
            var NewReturnList = new List<structGoals>();
            returnList = final.Values.OrderBy(x => x.Goal.Trim()).ToList<structGoals>();

            var Header = new Dictionary<string, structGoals>();
            //Header rows

            Header.Add("Header", new structGoals() { Goal = "Header", Details = new List<List<tableCell>>() { data.ToArray()[0] } });
            Header["Header"].Details.Add(data.ToArray()[1]);
            returnList.Insert(0, Header.Values.FirstOrDefault());

            if (returnList.Count > 1)
            {
                for (int j = 1; j <= returnList.Count - 1; j++)
                {
                    int rowSpan1 = 1;

                    for (int i = returnList[j].Details.Count - 1; i >= 0; i--)
                    {
                        if (i == 0)
                        {
                            returnList[j].Details[i] = ChangeRowSpan(returnList[j].Details[i], 1, rowSpan1);
                            rowSpan1 = 1;
                        }
                        else
                        {
                            if (returnList[j].Details[i - 1].ToArray()[1].text.ToString() == returnList[j].Details[i].ToArray()[1].text.ToString())
                            {
                                returnList[j].Details[i].RemoveAt(1);
                                rowSpan1 += 1;
                            }
                            else if (returnList[j].Details[i - 1].ToArray()[1].text.ToString() != returnList[j].Details[i].ToArray()[1].text.ToString())
                            {
                                returnList[j].Details[i] = ChangeRowSpan(returnList[j].Details[i], 1, rowSpan1);
                                rowSpan1 = 1;
                            }
                        }
                    }
                }
            }

            return returnList;
        }


        [GET("GetChartsForProjects")]
        [ActionName("GetChartsForProjects")]
        [HttpGet]
        public IHttpActionResult GetChartsForProjects(string CustomerId, string ProjectId, DateTime CurrentDate, string Period)
        {
            var stopwatch = Stopwatch.StartNew();
            List<string> projects = Cldb.PROJECT.GetAll().Where(t => t.CUST_ID == CustomerId).Select(s => s.PROJ_ID).ToList<string>();
            DateRange range = new DateRange(CurrentDate, enDateRange.Monthly);
            Charts charts = new Charts();

            charts.IssueChartHighChart = IssueChartHighChart(CustomerId, projects, range);
            charts.RiskChart = GetRiskChart(CustomerId, projects, range);
            charts.TrendHighChartGroup = GetTrendHighChartsNew(CustomerId, ProjectId, range);
            charts.TableChart = GetTableChartNew(CustomerId, ProjectId, ref range, Period);
            charts.Month = range.StartDate.ToString("MMM");
            charts.Year = range.StartDate.Year;
            FillResponseTime(stopwatch);
            return Ok(charts);
        }


        [POST("GetCSSTableForProjects")]
        [ActionName("GetCSSTableForProjects")]
        [HttpPost]
        public IHttpActionResult GetCSSTableForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;

            var csat = new List<CSSData>();
            if (projects.Count > 0)
            {
                csat = CSPdb.AppRepo.GetCSSTableForProjects(startDate, endDate.AddDays(-1), string.Join(",", projects));
            }

            var data = new List<CSS>();
            var projectPortfolios = CSPdb.PORTFOLIO_PROJECT.GetAll().Where(x => projects.Contains(x.PROJ_ID)).ToList();
            var projectPortfolioIds = projectPortfolios.Select(x => x.PORTFOLIO_ID).ToList();
            var portfolios = CSPdb.PORTFOLIO.GetAll().Where(x => projectPortfolioIds.Contains(x.ID)).ToList();
            //var totalScore = GetCustomerSuccessScores(csat);
            var npsscore = GetNPSScore(csat);
            var overallNewCal = GetCustomerSuccessScoresNewLogic(csat);
            var noOfSurveys = csat.Count;
            var noOfResponded = csat.Count(x => !string.IsNullOrEmpty(x.RESPONDENT_NAME) && x.STATUS != null && x.STATUS.ToLower() == "completed");
            csat = csat.Where(x => x.STATUS != null && x.STATUS.ToLower() == "completed").ToList();
            var noOfYetToRespond = noOfSurveys - noOfResponded;
            var custCsat = new List<CSS>();
            var portCsat = new List<CSS>();
            foreach (string projId in projects)
            {
                var temp = csat.FirstOrDefault(x => x.PROJECT_ID == projId);
                if (temp != null)
                {
                    var filteredcsat = new List<CSSData>();
                    //filteredKPIs = kpiAll.Where(x => x.ISACTIVE && x.CREATED_DATE >= ipParams.START_DATE && x.CREATED_DATE <= ipParams.END_DATE && x.PROJECT_ID == projId).ToList();
                    filteredcsat = csat.Where(x => x.PROJECT_ID == projId).ToList();
                    var cnt = GetCustomerSuccessScores(filteredcsat);
                    var nps = GetCustomerSuccessScorePerc(filteredcsat);
                    var newCal = GetCustomerSuccessScoresNewLogic(filteredcsat);
                    if (!custCsat.Exists(x => x.CUST_ID == temp.CUSTOMER_ID))
                    {
                        var filteredcsatCust = csat.Where(x => x.CUSTOMER_ID == temp.CUSTOMER_ID).ToList();
                        var custCnt = GetMinScores(filteredcsatCust);
                        custCsat.Add(new CSS()
                        {
                            CUST_ID = temp.CUSTOMER_ID,
                            CUST_NAME = temp.CUSTOMER_NAME,
                            SCORE = custCnt,
                            SCORE_NEW = GetCustomerSuccessScoresNewLogic(filteredcsatCust),
                            NPS = GetCustomerSuccessScorePerc(filteredcsatCust)
                        });
                    }

                    data.Add(new CSS() { PROJ_ID = projId, CUST_ID = temp.CUSTOMER_ID, CUST_NAME = temp.CUSTOMER_NAME, PROJ_NAME = temp.PROJECT_NAME, SCORE = cnt, SCORE_NEW = newCal, NPS = nps });
                }
            }

            var dataOP = new CustomerSuccessScoresResults() { CUST_CSAT = custCsat, PORTFOLIO_CSAT = portCsat, PROJECT_CSAT = data };

            FillResponseTime(stopwatch);
            var t = new CustomerSuccessSurvey() { CSAT_SUMMARY = new CSATSummary() { OVERALL_SCORE = npsscore, OVERALL_NEWSCORE = overallNewCal, NPS_SCORE = npsscore, NO_OF_SURVEYS = noOfSurveys, NO_OF_RESPONDED = noOfResponded, NO_OF_YET_TO_RESPOND = noOfYetToRespond }, customerSuccessScoresResults = dataOP, csat = csat };
            return Ok(t);
        }


        [POST("GetCSSNPSScoreForProjects")]
        [ActionName("GetCSSNPSScoreForProjects")]
        [HttpPost]
        public IHttpActionResult GetCSSNPSScoreForProjects(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            DateTime startDate = ipParams.START_DATE ?? DateTime.Today.AddDays(-30);
            DateTime endDate = ipParams.END_DATE ?? DateTime.Today;

            var csat = new List<CSSData>();
            if (projects.Count > 0)
            {
                csat = CSPdb.AppRepo.GetCSSTableForProjects(startDate, endDate.AddDays(-1), string.Join(",", projects));
            }
            var npsScore = GetNPSScore(csat);
            FillResponseTime(stopwatch);
            return Ok(npsScore);
        }


        [POST("GetProjectNamesByCustomerIds")]
        [ActionName("GetProjectNamesByCustomerIds")]
        [HttpPost]
        public IHttpActionResult GetProjectNamesByCustomerIds(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            string empId = this.GetHeaderDetails_String("empId");
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            ProjectByCustomerIdsParams ipParams = JsonConvert.DeserializeObject<ProjectByCustomerIdsParams>(json);
            List<string> custIds = ipParams.CUST_ID;
          
            //should avoid this call
            var projects = GetProjectListForUser(empId);
            projects = projects.Where(t => custIds.Contains(t.CUST_ID) || custIds.Contains("-1")).Select(x => new ProjectBase { PROJ_NM = x.PROJ_NM, PROJ_ID = x.PROJ_ID }).OrderBy(t => t.PROJ_NM).ToList();
            FillResponseTime(stopwatch);
            return Ok(projects);
        }


        [POST("GetProjectsFromProjectsByCustID")]
        [ActionName("GetProjectsFromProjectsByCustID")]
        [HttpPost]
        public IHttpActionResult GetProjectsFromProjectsByCustID(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var ipParams = GetDashboardSearchParams(request);
            var projects = GetProjectIdsForUser(ipParams);
            var result = Cldb.PROJECT.GetAll().Where(x => projects.Contains(x.PROJ_ID) && ipParams.CUST_ID.Contains(x.CUST_ID)).Select(x => new { x.PROJ_ID, x.PROJ_NM }).OrderBy(x => x.PROJ_NM).ToList();
            FillResponseTime(stopwatch);
            return Ok(result);
        }


        [GET("GetAllProjectIdsForUser")]
        [ActionName("GetAllProjectIdsForUser")]
        [HttpGet]
        public IHttpActionResult GetAllProjectIdsForUser(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            string empId = this.GetHeaderDetails_String("empId");
            //var ipParams = GetDashboardSearchParams(request);
            //var projects = GetProjectIdsForUser(ipParams);
            //var result = Cldb.PROJECT.GetAll().Where(x => projects.Contains(x.PROJ_ID) && ipParams.CUST_ID.Contains(x.CUST_ID)).Select(x => x.PROJ_ID).ToList();
            var projects = GetProjIdListForUser(empId).Select(x => x.PROJ_ID).Distinct().ToList();
            FillResponseTime(stopwatch);
            return Ok(projects);
        }

        private List<string> GetProjectIdsForUser(DashboardSearchParams searchParams)
        {
            string empId = this.GetHeaderDetails_String("empId");

            if (searchParams.PROJ_IDS != null && searchParams.PROJ_IDS.Count > 1)
                return searchParams.PROJ_IDS;

            List<string> projects = new List<string>();
            if (searchParams.PROJ_IDS != null)
            {
                if (searchParams.ALL_PROJECTS && (searchParams.PROJ_IDS.Contains("-1") && searchParams.PROJ_IDS.Count == 1))
                    //projects.AddRange(Cldb.PROJECT.GetAll().Select(x => x.PROJ_ID).ToList());
                    projects = GetProjIdListForUser(empId).Select(x => x.PROJ_ID).Distinct().ToList();
                else if (!searchParams.ALL_PROJECTS && (searchParams.PROJ_IDS.Contains("-1") && searchParams.PROJ_IDS.Count == 1))
                    projects = GetProjIdListForUser(empId).Select(x => x.PROJ_ID).Distinct().ToList();
                else
                    projects = searchParams.PROJ_IDS.Distinct().ToList();
            }


            return projects;
        }


        private DashboardSearchParams GetDashboardSearchParams(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            DashboardSearchParams ipParams = JsonConvert.DeserializeObject<DashboardSearchParams>(json);
            if (ipParams.END_DATE.HasValue)
                ipParams.END_DATE = ipParams.END_DATE.Value.AddDays(1);
            return ipParams;
        }
        private decimal GetCustomerSuccessScores(List<CSSData> csat)
        {
            var d = 0.0;
            csat = csat.Where(x => x.CSAT_RECIEVED_DATE != null).ToList();
            if (csat.Count > 0)
            {
                foreach (CSSData cssd in csat)
                {
                    if (cssd.Q1 != null && cssd.Q1 != 0)
                        d += Math.Round((Convert.ToDouble(cssd.Q1) + Convert.ToDouble(cssd.Q2) + Convert.ToDouble(cssd.Q3)) / 3.0);// + cssd.VALUE_ADDS + cssd.OVERALL_QUALITY_OF_DELIVERABLE); / 3.0);
                    else if (cssd.Q8 != null && cssd.Q8 != 0)
                    {
                        if (cssd.Q6 != null && cssd.Q6 != 0)
                            d += Math.Round((Convert.ToDouble(cssd.Q6) + Convert.ToDouble(cssd.Q7) + Convert.ToDouble(cssd.Q8)) / 3.0);
                    }
                    else if (cssd.Q10 != null && cssd.Q10 != 0)
                        d += Math.Round((Convert.ToDouble(cssd.Q13) + Convert.ToDouble(cssd.Q14) + Convert.ToDouble(cssd.Q10) + Convert.ToDouble(cssd.Q11) + Convert.ToDouble(cssd.Q12)) / 5.0);// + cssd.VALUE_ADDS + cssd.OVERALL_QUALITY_OF_DELIVERABLE); / 3.0);
                }
                var total = csat.Count(x => x.CSAT_RECIEVED_DATE != null);
                return Math.Round(Convert.ToDecimal(d) / total);
            }
            return 0;
        }

        private decimal GetCustomerSuccessScoresNewLogic(List<CSSData> csat)
        {
            var d = 0.0;
            csat = csat.Where(x => x.CSAT_RECIEVED_DATE != null).ToList();
            if (csat.Count > 0)
            {
                foreach (CSSData cssd in csat)
                {
                    if (cssd.Q1 != null && cssd.Q1 != 0)
                    {
                        int?[] ratings = { cssd.Q1, cssd.Q2, cssd.Q3 };
                        d += ratings.Count(x => x.Value > 3);
                    }
                    else if (cssd.Q8 != null && cssd.Q8 != 0)
                    {
                        if (cssd.Q6 != null && cssd.Q6 != 0)
                        {
                            int?[] ratings = { cssd.Q6, cssd.Q7, cssd.Q8 };
                            d += ratings.Count(x => x.Value > 3);
                        }
                    }
                    else if (cssd.Q10 != null && cssd.Q10 != 0)
                    {
                        int?[] ratings = { cssd.Q13, cssd.Q14, cssd.Q10, cssd.Q11, cssd.Q12 };
                        d += ratings.Count(x => x.Value > 3);
                    }
                }
                var total = csat.Count(x => x.CSAT_RECIEVED_DATE != null);
                return Math.Round(Convert.ToDecimal(d) / total);
            }
            return 0;
        }
        private decimal GetMinScores(List<CSSData> csat)
        {
            var d = 0.0;
            csat = csat.Where(x => x.CSAT_RECIEVED_DATE != null).ToList();
            if (csat.Count > 0)
            {
                foreach (CSSData cssd in csat)
                {
                    if (cssd.Q1 != null && cssd.Q1 != 0)
                    {
                        var li = new List<int?> { cssd.Q1, cssd.Q2, cssd.Q3 };
                        d += li.Min(x => x.Value);
                    }
                    else if (cssd.Q8 != null && cssd.Q8 != 0)
                    {
                        if (cssd.Q6 != null && cssd.Q6 != 0)
                        {
                            var li = new List<int?> { cssd.Q6, cssd.Q7, cssd.Q8 };
                            d += li.Min(x => x.Value);
                        }
                    }
                    else if (cssd.Q10 != null && cssd.Q10 != 0)
                    {
                        var li = new List<int?> { cssd.Q13, cssd.Q14, cssd.Q10, cssd.Q11, cssd.Q12 };
                        d += li.Min(x => x.Value);
                    }
                }
                var total = csat.Count(x => x.CSAT_RECIEVED_DATE != null);
                return Math.Round(Convert.ToDecimal(d) / total);
            }
            return 0;
        }
        private decimal GetCSSRatingPercentage(List<CSS_QUESTION_REPLIES> rating)
        {

            //var getCustomerIdListForQuarterlyandMonthly = GetBatchCustomerIdListForQuarterlyAndMonthly(custId, quarter, cssDetails, true);

            var cssRating = rating.Where(x => x.ISACTIVE && x.QUESTION_CATEGORY == "Criteria").ToList();

            var totalRating = cssRating.Count;

            var fourAndFiveRating = cssRating.Count(x => x.RATING == 4 || x.RATING == 5);

            //var lessthanequaltoThreeRating = cssRating.Count(x => x.RATING <= 3);

            var ratingPercentage = GetSurveyPercentage(fourAndFiveRating, totalRating);

            return ratingPercentage;
        }
        private decimal GetCustomerSuccessScorePerc(List<CSSData> csat)
        {
            var ret = GetMinScores(csat);
            return ret / 5 * 100;
        }
        private decimal GetNPSScore(List<CSSData> csat)
        {
            csat = csat.Where(c => c.NPS_SCORE != null && c.NPS_SCORE != 0).ToList();
            var d = 0.0;
            if (csat.Count > 0)
            {
                var nps = csat.Sum(x => x.NPS_SCORE);
                return Math.Round((Convert.ToDecimal(nps) / (csat.Count)) * 10);
            }
            return 0;
        }
        private List<ProjectBase> GetProjectDetailsForEWS(DashboardSearchParams searchParams)
        {
            string empId = this.GetHeaderDetails_String("empId");

            var projects = GetProjectListForUser(empId);
            if (searchParams.ALL_PROJECTS)
                return projects;
            else
                return projects.Where(x => searchParams.PROJ_IDS.Contains(x.PROJ_ID)).ToList();
        }
        [POST("GetCustomerProjectListForProjIds")]
        [ActionName("GetCustomerProjectListForProjIds")]
        [HttpPost]
        public IHttpActionResult GetCustomerProjectListForProjIds(HttpRequestMessage request)
        {
            var stopwatch = Stopwatch.StartNew();
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            //dynamic json = jsonContent;
            //string projectIds = JsonConvert.DeserializeObject<string>(json);
            var projIds = jsonContent.Split(',');
            var projectsList = Cldb.PROJECT.GetAll().Where(x => projIds.Contains(x.PROJ_ID) && x.PROJ_STATUS.ToLower() != "close").ToList();
            var projects = new List<Projects>();
            projects.AddRange(projectsList.Select(x => new Projects { CUST_ID = x.CUST_ID, BILLING_PROJ_ID = x.PROJ_ID, PROJ_ID = x.PROJ_ID, PROJ_NM = x.PROJ_NM }));
            var custIds = projects.Select(x => x.CUST_ID).ToList();
            var custs = Cldb.CUSTOMER.GetAll().Where(x => custIds.Contains(x.CUST_ID)).ToList();
            List<CustomerProjectsList> Customers = new List<CustomerProjectsList>();

            foreach (Projects p in projects)
            {
                var custName = custs.FirstOrDefault(t => t.CUST_ID == p.CUST_ID).CUST_NM;
                var cust = Customers.FirstOrDefault(t => t.CUST_ID == p.CUST_ID);
                if (cust == null)
                    Customers.Add(new CustomerProjectsList() { CUST_ID = p.CUST_ID, CUST_NM = custName, Projects = new List<Projects>() { p } });
                else
                    cust.Projects.Add(p);
            }
            Customers = Customers.OrderBy(x => x.CUST_NM).ToList();
            FillResponseTime(stopwatch);
            return Ok(Customers);
        }
        private List<structKPIAreas> GetTableChartGroupByServiceTowers(List<string> projectIds, DateTime startDate, DateTime endDate, string serviceTowerId = null)
        {
            var data = new List<List<tableCell>>();
            var kpis = new List<KPI>();

            kpis = CSPdb.KPI.GetAll().Where(t => projectIds.Contains(t.PROJECT_ID) && t.ISACTIVE).ToList();
            string[] serviceTowerIds = null;
            var serviceTowerkpis = new List<int>();
            var kpiServiceTowerMapping = new List<KPI_SERVICETOWER_MAPPING>();
            if (!string.IsNullOrEmpty(serviceTowerId) && serviceTowerId != "null")
            {
                serviceTowerIds = serviceTowerId.Split(',');
                if (serviceTowerId != null)
                {
                    kpiServiceTowerMapping = Cldb.KPI_SERVICETOWER_MAPPING.GetAll().Where(x => serviceTowerIds.Contains(x.SERVICE_TOWER_ID.ToString()) && x.ISACTIVE).ToList();
                    if (kpiServiceTowerMapping != null && kpiServiceTowerMapping.Count() > 0)
                    {
                        foreach (int k in kpiServiceTowerMapping.Select(x => x.KPI_ID))
                            serviceTowerkpis.Add(k);
                    }
                }
                if (serviceTowerkpis.Count > 0)
                    kpis = kpis.Where(x => serviceTowerkpis.Contains(x.ID)).ToList();
                else
                    kpis.Clear();
            }

            var goals = CSPdb.KPI_GOALS.GetAll().Where(t => projectIds.Contains(t.PROJECT_ID) && t.ISACTIVE).OrderBy(u => u.DISPLAY_ORDER).ToList();

            var kpiTargets = new List<KPI_TARGETS>();

            var kpiIds = kpis.Select(s => s.ID).ToList<int>();
            kpiTargets = CSPdb.KPI_TARGETS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID)).ToList();
            List<KPI_TARGETS> targets = GetKPITargets(kpis, startDate, endDate);

            //Get only latest update details of a kpi with in the date range
            var allDetails = new List<KPI_DETAILS>();
            allDetails = CSPdb.KPI_DETAILS.GetAll().Where(t => t.ISACTIVE && t.PERIOD >= startDate && t.PERIOD <= endDate && kpiIds.Contains(t.KPI_ID)).OrderByDescending(u => u.PERIOD).ToList();
            var kpiServiceTowers = Cldb.KPI_SERVICETOWER_MAPPING.GetAll().Where(x => x.ISACTIVE && kpiIds.Contains(x.KPI_ID)).OrderByDescending(u => u.SERVICE_TOWER_ID).ToList();
            if (serviceTowerIds != null && serviceTowerIds.Length > 0)
                kpiServiceTowers = kpiServiceTowers.Where(x => serviceTowerIds.Contains(x.SERVICE_TOWER_ID.ToString())).ToList();
            else
            {
                var kpiST = new KPI_SERVICETOWER_MAPPING() { SERVICE_TOWER_ID = -1 };
                kpiServiceTowers.Add(kpiST);
            }
            var kpi_high = targets.FirstOrDefault(t => t.SLA_TARGET_HIGH_DESCRIPTION != "" && t.SLA_TARGET_HIGH_DESCRIPTION != null && t.ISACTIVE);
            var kpi_medium = targets.FirstOrDefault(t => t.SLA_TARGET_MEDIUM_DESCRIPTION != "" && t.SLA_TARGET_MEDIUM_DESCRIPTION != null && t.ISACTIVE);
            var kpi_low = targets.FirstOrDefault(t => t.SLA_TARGET_LOW_DESCRIPTION != "" && t.SLA_TARGET_LOW_DESCRIPTION != null && t.ISACTIVE);
            var kpi_veryhigh = targets.FirstOrDefault(t => t.SLA_TARGET_VERYHIGH_DESCRIPTION != "" && t.SLA_TARGET_VERYHIGH_DESCRIPTION != null && t.ISACTIVE);

            int colCount = 0;
            if (kpi_high != null)
                colCount += 1;
            if (kpi_medium != null)
                colCount += 1;
            if (kpi_low != null)
                colCount += 1;
            if (kpi_veryhigh != null)
                colCount += 1;

            var header1 = new List<tableCell>();
            header1.Add(new tableCell() { text = "Service Tower", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Success Goal", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Work Group / KPI Area", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "KPI Description", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Priority", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Support window", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Target", rowSpan = 1, colSpan = colCount, color = COLOR_GREEN });
            header1.Add(new tableCell() { text = "Achievement", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "", rowSpan = 2, colSpan = 1, celltype = "link" });
            data.Add(header1);

            var header2 = new List<tableCell>();
            if (kpi_low != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_RED });
            if (kpi_medium != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_AMBER });
            if (kpi_high != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_GREEN });
            if (kpi_veryhigh != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_BLUE });
            data.Add(header2);

            var kpi_all = CSPdb.AppRepo.GetKPIDetails(startDate, startDate.AddMonths(1).AddSeconds(-1)).Where(x => x.ISACTIVE).ToList();

            var filteredKPIs = new List<KPI_DETAILS_EXTENDED>();
            decimal score;
            string sScore;
            var kpiServiceTowerIds = kpiServiceTowers.Select(x => x.SERVICE_TOWER_ID).ToList();
            var serviceTowerNames = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => x.ISACTIVE && kpiServiceTowerIds.Contains(x.ID)).ToList();
            foreach (int s in kpiServiceTowers.Select(x => x.SERVICE_TOWER_ID).Distinct())
            {
                var allDetails1 = new List<KPI_DETAILS>();
                var servicekpiIds = kpiServiceTowers.Where(x => x.SERVICE_TOWER_ID == s).Select(x => x.KPI_ID).ToList();
                if (s == -1)
                {
                    servicekpiIds = kpiServiceTowers.Select(x => x.KPI_ID).ToList();
                    allDetails1 = allDetails.Where(c => kpiIds.Contains(c.KPI_ID) && !servicekpiIds.Contains(c.KPI_ID)).ToList();
                }
                else
                    allDetails1 = allDetails.Where(c => kpiIds.Contains(c.KPI_ID) && servicekpiIds.Contains(c.KPI_ID)).ToList();
                foreach (KPI_DETAILS d in allDetails1)
                {
                    KPI tmpKPI = kpis.FirstOrDefault(t => t.ID == d.KPI_ID);
                    var row = new List<tableCell>();
                    var description = goals.FirstOrDefault(t => t.ID == tmpKPI.GOAL_ID).DESCRIPTION;
                    var serviceTowerName = string.Empty;
                    if (s == -1)
                        serviceTowerName = "Not mapped with KPI";
                    else
                        serviceTowerName = serviceTowerNames.FirstOrDefault(t => t.ID == s).TITLE;

                    var serviceTowerKpis = new List<int>();
                    serviceTowerKpis = allDetails1.Select(x => x.KPI_ID).ToList();
                    filteredKPIs = kpi_all.Where(x => projectIds.Contains(x.PROJECT_ID) && serviceTowerKpis.Contains(x.KPI_ID) && x.ISACTIVE).ToList();
                    score = GetSuccessGoalScoreNewLogic(filteredKPIs);

                    if (score == -1)
                        sScore = "-";
                    else
                        sScore = score.ToString("0") + " %";

                    var appendedText = serviceTowerName + '|' + '0' + '|' + sScore;
                    row.Add(new tableCell() { text = appendedText });
                    row.Add(new tableCell() { text = description, rowSpan = 1 });
                    row.Add(new tableCell() { text = tmpKPI.SERVICE_AREA, rowSpan = 1 });
                    row.Add(new tableCell() { text = tmpKPI.KPI_NAME, rowSpan = 1 });
                    row.Add(new tableCell() { text = tmpKPI.PRIORITY, rowSpan = 1 });
                    row.Add(new tableCell() { text = tmpKPI.SUPPORT_WINDOW, rowSpan = 1 });

                    var target = this.GetKPITargets(kpiTargets.Where(t => t.KPI_ID == tmpKPI.ID && t.ISACTIVE).ToList(), startDate, endDate);

                    if (kpi_low != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_LOW_DESCRIPTION, rowSpan = 1 });
                    if (kpi_medium != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_MEDIUM_DESCRIPTION, rowSpan = 1 });
                    if (kpi_high != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_HIGH_DESCRIPTION, rowSpan = 1 });

                    if (kpi_veryhigh != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_VERYHIGH_DESCRIPTION, rowSpan = 1 });

                    if (d.ISFLAG == true && d.KPI_ACTUAL == string.Empty && d.SLA_STATUS == "NA")
                        row.Add(new tableCell() { text = d.SLA_STATUS, color = GetColorForKPIDetails(d, target), rowSpan = 1, toolTip = GetToolTip(d) });
                    else
                        row.Add(new tableCell() { text = d.KPI_ACTUAL, color = GetColorForKPIDetails(d, target), rowSpan = 1, toolTip = GetToolTip(d) });

                    row.Add(new tableCell() { text = tmpKPI.ID, rowSpan = 1, celltype = "link" });

                    if (target.SLA_TARGET_HIGH_DESCRIPTION != null)
                        data.Add(row);
                }
            }

            var final = new Dictionary<string, structKPIAreas>();

            int iGoal = 1;
            if (data.Count > 2)
            {
                for (int i = 2; i <= data.Count - 1; i++)
                {
                    if (final.ContainsKey(data[i][0].text.ToString()))
                    {
                        final[data[i][0].text.ToString()].details.Add(data[i]);
                    }
                    else
                    {
                        final.Add(data[i][0].text.ToString(), new structKPIAreas() { kpiArea = data[i][0].text.ToString(), goal = data[i][1].text.ToString() + data[i][0].text.ToString().Replace(data[i][0].text.ToString().Split('|')[0], ""), details = new List<List<tableCell>>() { data[i] } });
                        iGoal += 1;
                    }
                }
            }

            var returnList = new List<structKPIAreas>();
            var NewReturnList = new List<structKPIAreas>();
            returnList = final.Values.OrderBy(x => x.kpiArea).ToList();

            var Header = new Dictionary<string, structKPIAreas>();
            Header.Add("Header", new structKPIAreas() { kpiArea = "Header", details = new List<List<tableCell>>() { data.ToArray()[0] } });
            Header["Header"].details.Add(data.ToArray()[1]);

            returnList.Insert(0, Header.Values.FirstOrDefault());

            if (returnList.Count > 1)
            {
                for (int j = 1; j <= returnList.Count - 1; j++)
                {
                    int rowSpan1 = 1;

                    for (int i = returnList[j].details.Count - 1; i >= 0; i--)
                    {
                        if (i == 0)
                        {
                            returnList[j].details[i] = ChangeRowSpan(returnList[j].details[i], 1, rowSpan1);
                            rowSpan1 = 1;
                        }
                        else
                        {
                            if (returnList[j].details[i - 1].ToArray()[1].text.ToString() == returnList[j].details[i].ToArray()[1].text.ToString())
                            {
                                returnList[j].details[i][0] = new tableCell() { text = returnList[j].details[i].ToArray()[1].text, rowSpan = 1 };
                                returnList[j].details[i].RemoveAt(1);
                                rowSpan1 += 1;
                            }
                            else if (returnList[j].details[i - 1].ToArray()[1].text.ToString() != returnList[j].details[i].ToArray()[0].text.ToString())
                            {
                                returnList[j].details[i] = ChangeRowSpan(returnList[j].details[i], 1, rowSpan1);
                                rowSpan1 = 1;
                            }
                        }
                    }
                }
            }

            return returnList;
        }
        private List<structKPIAreas> GetTableChartGroupByKPIArea(List<string> projectIds, DateTime startDate, DateTime endDate, string serviceTowerId = null)
        {
            var data = new List<List<tableCell>>();
            var kpis = new List<KPI>();

            kpis = CSPdb.KPI.GetAll().Where(t => projectIds.Contains(t.PROJECT_ID) && t.ISACTIVE).ToList();
            if (!string.IsNullOrEmpty(serviceTowerId) && serviceTowerId != "null")
            {
                var serviceTowerIds = serviceTowerId.Split(',');
                var serviceTowerkpis = new List<int>();
                if (serviceTowerId != null)
                {
                    var kpiServiceTowerMapping = Cldb.KPI_SERVICETOWER_MAPPING.GetAll().Where(x => serviceTowerIds.Contains(x.SERVICE_TOWER_ID.ToString()) && x.ISACTIVE).Select(x => x.KPI_ID);
                    if (kpiServiceTowerMapping != null && kpiServiceTowerMapping.Count() > 0)
                    {
                        foreach (int k in kpiServiceTowerMapping)
                            serviceTowerkpis.Add(k);
                    }
                }
                if (serviceTowerkpis.Count > 0)
                    kpis = kpis.Where(x => serviceTowerkpis.Contains(x.ID)).ToList();
                else
                    kpis.Clear();
            }

            var goals = CSPdb.KPI_GOALS.GetAll().Where(t => projectIds.Contains(t.PROJECT_ID) && t.ISACTIVE).OrderBy(u => u.DISPLAY_ORDER).ToList();

            var kpiTargets = new List<KPI_TARGETS>();
            var kpiIds = kpis.Select(s => s.ID).ToList();
            kpiTargets = CSPdb.KPI_TARGETS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID)).ToList();

            List<KPI_TARGETS> targets = GetKPITargets(kpis, startDate, endDate);

            //Get only latest update details of a kpi with in the date range
            var allDetails = new List<KPI_DETAILS>();
            allDetails = CSPdb.KPI_DETAILS.GetAll().Where(t => t.ISACTIVE && t.PERIOD >= startDate && t.PERIOD <= endDate && kpiIds.Contains(t.KPI_ID)).OrderByDescending(u => u.PERIOD).ToList();

            var kpi_high = targets.FirstOrDefault(t => t.SLA_TARGET_HIGH_DESCRIPTION != "" && t.SLA_TARGET_HIGH_DESCRIPTION != null && t.ISACTIVE);
            var kpi_medium = targets.FirstOrDefault(t => t.SLA_TARGET_MEDIUM_DESCRIPTION != "" && t.SLA_TARGET_MEDIUM_DESCRIPTION != null && t.ISACTIVE);
            var kpi_low = targets.FirstOrDefault(t => t.SLA_TARGET_LOW_DESCRIPTION != "" && t.SLA_TARGET_LOW_DESCRIPTION != null && t.ISACTIVE);
            var kpi_veryhigh = targets.FirstOrDefault(t => t.SLA_TARGET_VERYHIGH_DESCRIPTION != "" && t.SLA_TARGET_VERYHIGH_DESCRIPTION != null && t.ISACTIVE);

            int colCount = 0;
            if (kpi_high != null)
                colCount += 1;
            if (kpi_medium != null)
                colCount += 1;
            if (kpi_low != null)
                colCount += 1;
            if (kpi_veryhigh != null)
                colCount += 1;

            var header1 = new List<tableCell>();
            header1.Add(new tableCell() { text = "Work Group / KPI Area", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Success Goal", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "KPI Description", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Service Towers", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Priority", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Support window", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "Target", rowSpan = 1, colSpan = colCount, color = COLOR_GREEN });
            header1.Add(new tableCell() { text = "Achievement", rowSpan = 2, colSpan = 1 });
            header1.Add(new tableCell() { text = "", rowSpan = 2, colSpan = 1, celltype = "link" });
            data.Add(header1);

            var header2 = new List<tableCell>();
            if (kpi_low != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_RED });
            if (kpi_medium != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_AMBER });
            if (kpi_high != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_GREEN });
            if (kpi_veryhigh != null)
                header2.Add(new tableCell() { text = "", rowSpan = 1, colSpan = 1, color = COLOR_BLUE });
            data.Add(header2);


            var kpi_all = CSPdb.AppRepo.GetKPIDetails(startDate, startDate.AddMonths(1).AddSeconds(-1)).Where(x => x.ISACTIVE).ToList();
            var filteredKPIs = new List<KPI_DETAILS_EXTENDED>();
            decimal score;
            string sScore;
            var kpiAreas = kpis.Where(x => kpiIds.Contains(x.ID)).Select(x => x.SERVICE_AREA.Trim()).Distinct().ToList();
            foreach (string s in kpiAreas)
            {
                var kpiAreaIds = kpis.Where(k => k.SERVICE_AREA.Trim() == s).Select(x => x.ID).ToList();
                var allDetails1 = allDetails.Where(x => kpiAreaIds.Contains(x.KPI_ID)).ToList();
                foreach (KPI_DETAILS d in allDetails1)
                {
                    KPI tmpKPI = kpis.FirstOrDefault(t => t.ID == d.KPI_ID);
                    var row = new List<tableCell>();
                    var description = goals.FirstOrDefault(t => t.ID == tmpKPI.GOAL_ID).DESCRIPTION;
                    var serviceTowers = getServiceTowerNamesCSVMappedToKpi(d.KPI_ID);
                    var kpiDetailIds = allDetails1.Select(x => x.ID).ToList();
                    filteredKPIs = kpi_all.Where(x => projectIds.Contains(x.PROJECT_ID) && kpiDetailIds.Contains(x.ID) && x.ISACTIVE).ToList();
                    score = GetSuccessGoalScoreNewLogic(filteredKPIs);

                    if (score == -1)
                        sScore = "-";
                    else
                        sScore = score.ToString("0") + " %";

                    var appendedText = s + '|' + '0' + '|' + sScore;
                    row.Add(new tableCell() { text = appendedText });
                    row.Add(new tableCell() { text = description, rowSpan = 1 });
                    row.Add(new tableCell() { text = tmpKPI.KPI_NAME, rowSpan = 1 });
                    row.Add(new tableCell() { text = serviceTowers, rowSpan = 1 });
                    row.Add(new tableCell() { text = tmpKPI.PRIORITY, rowSpan = 1 });
                    row.Add(new tableCell() { text = tmpKPI.SUPPORT_WINDOW, rowSpan = 1 });

                    var target = this.GetKPITargets(kpiTargets.Where(t => t.KPI_ID == tmpKPI.ID && t.ISACTIVE).ToList(), startDate, endDate);

                    if (kpi_low != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_LOW_DESCRIPTION, rowSpan = 1 });
                    if (kpi_medium != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_MEDIUM_DESCRIPTION, rowSpan = 1 });
                    if (kpi_high != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_HIGH_DESCRIPTION, rowSpan = 1 });

                    if (kpi_veryhigh != null)
                        row.Add(new tableCell() { text = target.SLA_TARGET_VERYHIGH_DESCRIPTION, rowSpan = 1 });

                    if (d.ISFLAG == true && d.KPI_ACTUAL == string.Empty && d.SLA_STATUS == "NA")
                        row.Add(new tableCell() { text = d.SLA_STATUS, color = GetColorForKPIDetails(d, target), rowSpan = 1, toolTip = GetToolTip(d) });
                    else
                        row.Add(new tableCell() { text = d.KPI_ACTUAL, color = GetColorForKPIDetails(d, target), rowSpan = 1, toolTip = GetToolTip(d) });

                    row.Add(new tableCell() { text = tmpKPI.ID, rowSpan = 1, celltype = "link" });

                    if (target.SLA_TARGET_HIGH_DESCRIPTION != null)
                        data.Add(row);
                }
            }

            var final = new Dictionary<string, structKPIAreas>();

            int iGoal = 1;
            if (data.Count > 2)
            {
                for (int i = 2; i <= data.Count - 1; i++)
                {
                    if (final.ContainsKey(data[i][0].text.ToString()))
                    {
                        final[data[i][0].text.ToString()].details.Add(data[i]);
                    }
                    else
                    {
                        final.Add(data[i][0].text.ToString(), new structKPIAreas() { kpiArea = data[i][0].text.ToString(), goal = data[i][1].text.ToString() + data[i][0].text.ToString().Replace(data[i][0].text.ToString().Split('|')[0], ""), details = new List<List<tableCell>>() { data[i] } });
                        iGoal += 1;
                    }
                }
            }

            var returnList = new List<structKPIAreas>();
            var NewReturnList = new List<structKPIAreas>();
            returnList = final.Values.OrderBy(x => x.kpiArea).ToList();

            var Header = new Dictionary<string, structKPIAreas>();
            Header.Add("Header", new structKPIAreas() { kpiArea = "Header", details = new List<List<tableCell>>() { data.ToArray()[0] } });
            Header["Header"].details.Add(data.ToArray()[1]);

            returnList.Insert(0, Header.Values.FirstOrDefault());

            if (returnList.Count > 1)
            {
                for (int j = 1; j <= returnList.Count - 1; j++)
                {
                    int rowSpan1 = 1;

                    for (int i = returnList[j].details.Count - 1; i >= 0; i--)
                    {
                        if (i == 0)
                        {
                            returnList[j].details[i] = ChangeRowSpan(returnList[j].details[i], 1, rowSpan1);
                            rowSpan1 = 1;
                        }
                        else
                        {
                            if (returnList[j].details[i - 1].ToArray()[1].text.ToString() == returnList[j].details[i].ToArray()[1].text.ToString())
                            {
                                returnList[j].details[i][0] = new tableCell() { text = returnList[j].details[i].ToArray()[1].text, rowSpan = 1 };
                                returnList[j].details[i].RemoveAt(1);
                                rowSpan1 += 1;
                            }
                            else if (returnList[j].details[i - 1].ToArray()[1].text.ToString() != returnList[j].details[i].ToArray()[0].text.ToString())
                            {
                                returnList[j].details[i] = ChangeRowSpan(returnList[j].details[i], 1, rowSpan1);
                                rowSpan1 = 1;
                            }
                        }
                    }
                }
            }
            return returnList;
        }

    }
}