using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Results;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        #region groupbyPerspectivecategory

        
        public class GlobalPerspective
        {
            public GlobalPerspective(string kpiCategory)
            {
                this.GlobalPerspectiveName = kpiCategory;
                this.GLOBAL_KPIs = new List<GlobalKPI>();
            }

            public string GlobalPerspectiveName { get; set; }
            public List<GlobalKPI> GLOBAL_KPIs { get; set; }
        }

        public class GlobalKPI
        {
            public GlobalKPI(string globalKpiName)
            {
                this.GLOBAL_KPI_NAME = globalKpiName;
                this.PROJECT_KPIS = new List<KPIProject>();
                this.LocalKPIs = new List<LocalKPI>();
            }

            public string GLOBAL_KPI_NAME { get; set; }

            public List<KPIProject> PROJECT_KPIS { get; set; }
            public List<LocalKPI> LocalKPIs { get; set; }

        }

        public class KPIProject
        {
            public KPIProject(string projectid, string projectName, string custnm)
            {
                this.PROJECT_NAME = projectName;
                this.PROJECT_ID = projectid;
                this.CUST_NAME = custnm;
                this.KPIs = new List<LocalKPI>();
                this.GlobalPerspectives = new List<GlobalPerspective>();
            }

            public string PROJECT_ID { get; set; }
            public string PROJECT_NAME { get; set; }

            public string CUST_NAME { get; set; }

            public List<LocalKPI> KPIs { get; set; }
            public List<GlobalPerspective> GlobalPerspectives { get; set; }

        }

        public enum KpiType
        {
            Weekly = 0,
            Monthly = 1
        }

        public class LocalKPI
        {
            public LocalKPI(int kpiid, string kpiName, string kpiType, string uom)
            {
                this.KPI_NAME = kpiName;
                this.KPI_ID = kpiid;
                this.KpiType = kpiType == "Monthly" ? KpiType.Monthly : KpiType.Weekly;
                this.Periods = new List<Period>();
                this.UOM = uom;
            }

            public int KPI_ID { get; set; }
            public string KPI_NAME { get; set; }

            public KpiType KpiType { get; set; }

            public string UOM { get; set; }

            public List<Period> Periods { get; set; }
        }


        public class MonthData : KpiTargetsBase
        {
            public MonthData() { }
            public MonthData(string month, decimal? targethighvalue, string targethighoperator, decimal? targetlowvalue, string targetlowoperator, decimal actual,
               bool isactualempty,  string sa, string priority, string supportwindow, bool issow,
               decimal? targetmediumvalue, string targetmediumoperator, string veryhighdesc, string targetveryhighoperator, decimal? targetveryhighvalue, string highdesc, string mediumdesc, string lowdesc, bool IsFlag)
            {
                this.Month = month;
                this.Targethighvalue = targethighvalue;
                this.Targethighoperator = targethighoperator;
                this.Targetlowvalue = targetlowvalue;
                this.Targetlowoperator = targetlowoperator;
                this.KpiActualValue = actual;
                this.IsActualEmpty = isactualempty;
                this.Servicearea = sa;
                this.Supportwindow = supportwindow;
                this.Priority = priority;
                this.Issowcommitment = issow;
                this.Targetmediumvalue = targetmediumvalue;
                this.Targetmediumoperator = targetmediumoperator;
                this.Veryhighdesc = veryhighdesc;
                this.Targetveryhighoperator = targetveryhighoperator;
                this.Targetveryhighvalue = targetveryhighvalue;
                this.Highdesc = highdesc;
                this.Mediumdesc = mediumdesc;
                this.Lowdesc = lowdesc;
                this.IsFlag = IsFlag;
                if(!this.IsFlag && !this.IsActualEmpty)
                {
                    var result = GetKPIScore(this)?? 0;
                    this.KpiScore = Math.Round(result);
                }
            }
            public string Month { get; set; }
            public bool IsActualEmpty { get; set; }

            public bool IsFlag { get; set; }

            public DateTime KpiStartDate { get; set; }
            public DateTime KpiEndDate { get; set; }
            public decimal? KpiScore { get; set; }

            
            public string Servicearea { get; set; }
            public string Priority { get; set; }
            public string Supportwindow { get; set; }
            public bool Issowcommitment { get; set; }

            public MonthData Previouskpi { get; set; }

            public bool Showtooltip { get; set; } = false;

            public bool Istargetchanged { get; set; }

        }

        public class Period
        {
            public Period(string periodType)
            {
                this.PeriodType = periodType;
                this.MonthlyData = new Dictionary<string, MonthData>();
            }

            public Period()
            { }

            public string PeriodType { get; set; }

            public decimal Total { get; set; }

            public decimal Kpiachievementscore { get; set; }

            public decimal Average { get; set; }

            public decimal Median { get; set; }

            public decimal Min { get; set; }

            public decimal Max { get; set; }

            public int Abovetarget { get; set; }

            public decimal Abovetargetpercentage { get; set; }

            public int Ontarget { get; set; }

            public decimal Ontargetpercentage { get; set; }

            public int Undertarget { get; set; }

            public decimal Undertargetpercentage { get; set; }

            public int ActualsEmpty { get; set; }

            public int SingleTarget { get; set; }
            public int NotApplCount { get; set; }

            public bool FirstEntryFlag { get; set; } 

            public Dictionary<string, MonthData> MonthlyData { get; set; }


            public void AddMonthlyData(MonthData monthData)
            {
                if (!MonthlyData.ContainsKey(monthData.Month))
                    MonthlyData.Add(monthData.Month, monthData);
                else
                    return;

                if (monthData.IsFlag)
                {
                    monthData.KpiActualValue = -1;
                    NotApplCount++;
                    return;
                }

                var KpiScore = monthData.KpiScore.HasValue ? monthData.KpiScore.Value : 0;
                Total += KpiScore;

                if(!monthData.IsActualEmpty)
                {
                    Max = Max > monthData.KpiActualValue ? Max : monthData.KpiActualValue.Value;

                    if (!FirstEntryFlag)
                        Min = monthData.KpiActualValue.Value;
                    else
                        Min = Min < monthData.KpiActualValue ? Min : monthData.KpiActualValue.Value;
                }

                var avgdeno = MonthlyData.Count - NotApplCount;

                if(avgdeno != 0)
                    Average = Math.Round((Total / avgdeno));

                if(monthData.IsActualEmpty)
                {
                    ActualsEmpty++;
                }
                else
                {
                    //var highvalue = monthData.targethighvalue.HasValue ? monthData.targethighvalue.Value : 0;
                    //var lowvalue = 0M;

                    if (!monthData.Targetlowvalue.HasValue && !monthData.Targetmediumvalue.HasValue && !monthData.Targetveryhighvalue.HasValue)
                    {
                        SingleTarget++;
                        if (monthData.Targethighvalue.HasValue && monthData.Targethighvalue.Value == monthData.KpiActualValue)
                            Ontarget++;
                    }
                    else
                    {
                        DetermineTargetsAchievedCount(monthData);
                    }
                    // else
                    //{
                    //    if (!monthData.targetlowvalue.HasValue && !monthData.targetmediumvalue.HasValue && monthData.targetveryhighvalue.HasValue)
                    //    {
                    //        highvalue = monthData.targetveryhighvalue.Value;
                    //        lowvalue = monthData.targethighvalue.Value;
                    //    }
                    //    else
                    //    {
                    //        lowvalue = monthData.targetmediumvalue.HasValue ? monthData.targetmediumvalue.Value : monthData.targetlowvalue.HasValue ? monthData.targetlowvalue.Value : 0;
                    //    }

                    //    var trend = highvalue - lowvalue;
                    //    if(trend >= 0)
                    //    {
                    //        if (monthData.KpiActualValue == monthData.targethighvalue)
                    //            Ontarget++;
                    //        else if (monthData.KpiActualValue > monthData.targethighvalue)
                    //            Abovetarget++;
                    //        else 
                    //            Undertarget++;
                    //    }
                    //    else
                    //    {
                    //        if (monthData.KpiActualValue == monthData.targethighvalue)
                    //            Ontarget++;
                    //        else if (monthData.KpiActualValue > monthData.targethighvalue)
                    //            Undertarget++;
                    //        else 
                    //            Abovetarget++;
                    //    }
                    //}

                }


                var num1 = Convert.ToDecimal((Ontarget + Abovetarget));
                var num2 = Convert.ToDecimal((Ontarget + Abovetarget + Undertarget + ActualsEmpty));
                if (num2 != 0)
                    Kpiachievementscore = Math.Round((num1 / num2) * 100);
                else
                    Kpiachievementscore = 0;

                if(!monthData.IsActualEmpty)
                    FirstEntryFlag = true;
            }


            public void DetermineTargetsAchievedCount(KpiTargetsBase monthData)
            {
               
               

                //if(monthData.targetveryhighvalue.HasValue)
                //    isRaisingTrend = IsRaisingTrend(monthData.targethighoperator, monthData.targethighvalue.Value, monthData.targetveryhighoperator, monthData.targetveryhighvalue.Value, true);
                //else if(monthData.targetmediumvalue.HasValue)
                //    isRaisingTrend = IsRaisingTrend(monthData.targethighoperator, monthData.targethighvalue.Value, monthData.targetmediumoperator, monthData.targetmediumvalue.Value, false);
                //else if(monthData.targetlowvalue.HasValue)
                //    isRaisingTrend = IsRaisingTrend(monthData.targethighoperator, monthData.targethighvalue.Value, monthData.targetlowoperator, monthData.targetlowvalue.Value, false);


                if(monthData.Targetveryhighvalue.HasValue)
                {
                   if(IsRaisingTrend(monthData.Targethighoperator, monthData.Targethighvalue.Value,monthData.Targetveryhighoperator, monthData.Targetveryhighvalue.Value))
                    {
                        if (DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                        {
                            if (DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                Abovetarget++;
                            else
                                Ontarget++;
                        }
                        else
                        {
                            if (DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                Abovetarget++;
                            else
                                Undertarget++;
                        }
                    }
                    else
                    {
                        if (DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                        {
                            if (DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                Abovetarget++;
                            else
                                Ontarget++;
                        }
                        else if (DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                        {
                            Abovetarget++;
                        }
                        else
                            Undertarget++;
                    }
                }
                else if(monthData.Targetmediumvalue.HasValue)
                {
                    if (IsRaisingTrend(monthData.Targetmediumoperator, monthData.Targetmediumvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                    {
                        if (DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                        {
                            Ontarget++;
                        }
                        else if(DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                        {
                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else
                                Undertarget++;
                        }
                        else
                        {
                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else if (monthData.KpiActualValue < monthData.Targetmediumvalue.Value)
                                Undertarget++;
                        }
                    }
                    else
                    {
                        if (DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                        {
                                Ontarget++;
                        }
                        else if (DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                        {
                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else
                                Undertarget++;
                        }
                        else
                        {
                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else if (monthData.KpiActualValue > monthData.Targetmediumvalue.Value)
                                Undertarget++;
                        }
                    }
                }
                else if(monthData.Targetlowvalue.HasValue)
                {
                    if (IsRaisingTrend(monthData.Targetlowoperator, monthData.Targetlowvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                    {
                        if (DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                        {
                            Ontarget++;
                        }
                        else if (DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                        {
                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else 
                                Undertarget++;
                        }
                        else
                        {
                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else if (monthData.KpiActualValue < monthData.Targetlowvalue.Value)
                                Undertarget++;
                        }
                    }
                    else
                    {
                        if (DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                        {
                            Ontarget++;
                        }
                        else if (DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                        {
                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else
                                Undertarget++;
                        }
                        else
                        {
                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                Abovetarget++;
                            else if (monthData.KpiActualValue > monthData.Targetlowvalue.Value)
                                Undertarget++;
                        }
                    }
                }

                
            }

            public bool IsRaisingTrend(string targetOperator, decimal targetvalue,string comparisonOperator, decimal comparisonValue)
            {
                var isRaisingTrend = true;

                string[] greaterThanOperator = new string[2] { ">", ">=" };
                string[] lessThanOperator = new string[2] { "<", "<=" };

                if (comparisonValue - targetvalue > 0)
                    isRaisingTrend = true;
                else if (comparisonValue - targetvalue < 0)
                    isRaisingTrend = false;
                else if (comparisonValue - targetvalue == 0)
                {
                    if (greaterThanOperator.Contains(comparisonOperator))
                        isRaisingTrend = true;
                    else if (lessThanOperator.Contains(comparisonOperator))
                        isRaisingTrend = false;
                    else if (greaterThanOperator.Contains(targetOperator))
                        isRaisingTrend = false;
                    else if (lessThanOperator.Contains(targetOperator))
                        isRaisingTrend = true;
                    else
                        isRaisingTrend = true;
                }

                return isRaisingTrend;
            }

            //private bool IsRaisingTrend(string targetOperator, decimal targethighvalue, string comparisonOperator, decimal comparisonValue, bool higherLevel)
            //{
            //    if (comparisonValue > targethighvalue)
            //        return higherLevel;

            //    if (comparisonValue < targethighvalue)
            //        return !higherLevel;

            //    if (targetOperator == "=")
            //        return higherLevel && (comparisonOperator == "=" || comparisonOperator == ">" || comparisonOperator == ">=");

            //    if (targetOperator == "<")
            //        return higherLevel && (comparisonOperator == "=" || comparisonOperator == ">" || comparisonOperator == ">=");

            //    if (targetOperator == ">")
            //        return higherLevel && comparisonOperator == ">";

            //    return false;
            //}

            public bool DetermineTargetsAchievement(string targetOperator, decimal? targetValue, decimal? actualValue)
            {
                if (!string.IsNullOrEmpty(targetOperator) && targetValue.HasValue)
                {
                    switch (targetOperator)
                    {
                        case ">":
                            if (actualValue > targetValue.Value)
                                return true;
                            break;

                        case ">=":
                            if (actualValue >= targetValue.Value)
                                return true;
                            break;

                        case "=":
                            if (actualValue == targetValue.Value)
                                return true;
                            
                            //if (actualValue > targetValue.Value)
                            //    return isRaisingTrend;
                            
                            //if (actualValue < targetValue.Value)
                            //    return !isRaisingTrend;

                            break;

                        case "<":
                            if (actualValue < targetValue.Value)
                                return true;
                            break;

                        case "<=":
                            if (actualValue <= targetValue.Value)
                                return true;
                            break;
                    }
                }

                return false;
            }
        }

        Dictionary<int, string> MonthLiterals = new Dictionary<int, string>
        {
            [1] = "Jan",
            [2] = "Feb",
            [3] = "Mar",
            [4] = "Apr",
            [5] = "May",
            [6] = "Jun",
            [7] = "Jul",
            [8] = "Aug",
            [9] = "Sep",
            [10] = "Oct",
            [11] = "Nov",
            [12] = "Dec"
        };
        private string GetMonth(int monthNumber, string year)
        {
            return $"{MonthLiterals[monthNumber]} {year}";
        }

        public class GlobalKPIRequest
        {
            [Required]
            public DateTime StartDate { get; set; }

            [Required]
            public DateTime EndDate { get; set; }

            public string[] Globalkpis { get; set; }

            public string[] Customerids { get; set; }
            public string[] Projectids { get; set; }
            public string[] ServiceTowerIds { get; set; }
            public string InitialGroup { get; set; }
            public bool LoadAll { get; set; }

        }

        #endregion

        #region groupbyProject
        public class ProjectsKPI
        {
            public string PROJ_ID { get; set; }

            public string PROJ_NAME { get; set; }

            public List<EnterpriseKPICategory> ENTERPRISE_KPIS { get; set; }
        }

        public class EnterpriseKPICategory
        {
            public int ENTERPRISE_KPI_CAT_ID { get; set; }

            public string ENTERPRISE_KPI_CAT_NM { get; set; }

            public List<GlobalKPINew> GLOBAL_KPIS { get; set; }

        }

        public class GlobalKPINew
        {
            public int GLOBAL_KPI_ID { get; set; }

            public string GLOBAL_KPI_NAME { get; set; }

            public List<LocalKPINew> PROJECT_KPIS { get; set; }
        }

        public class LocalKPINew
        {
            public int KPI_ID { get; set; }

            public string KPI_NAME { get; set; }

            public List<LocalKPIDetailsNew> MONTHWISE_KPI_DETAILS { get; set; }
        }


        public class LocalKPIDetailsNew
        {
            public string PERIOD_TYPE { get; set; }
            
            public decimal YTD_KPI_SCORE { get; set; }

            public int ABOVE_TARGET { get; set; }

            public decimal ABOVE_TARGET_PERCENTAGE { get; set; }

            public int ON_TARGET { get; set; }

            public decimal ON_TARGET_PERCENTAGE { get; set; }

            public int BELOW_TARGET { get; set; }

            public decimal BELOW_TARGET_PERCENTAGE { get; set; }

            public string UOM { get; set; }

            public decimal MEDIAN { get; set; }

            public decimal MIN { get; set; }

            public decimal MAX { get; set; }

            public List<MonthdetailsNew> MONTH_DETAILS { get; set; }

        }

        public class MonthdetailsNew
        {
            public DateTime MONTH_NAME { get; set; }

            public decimal? KPI_ACTUAL_VALUE { get; set; }

            public decimal? KPI_TARGET_VERYHIGH_VALUE { get; set; }

            public string SLA_TARGET_VERYHIGH_OPERATOR { get; set; }

            public decimal? SLA_TARGET_HIGH_VALUE { get; set; }

            public string SLA_TARGET_HIGH_OPERATOR { get; set; }

            public decimal? SLA_TARGET_MEDIUM_VALUE { get; set; }

            public string SLA_TARGET_MEDIUM_OPERATOR { get; set; }

            public decimal? SLA_TARGET_LOW_VALUE { get; set; }

            public string SLA_TARGET_LOW_OPERATOR { get; set; }

            public decimal? KPI_SCORE  { get; set; }

            public string SERVICE_AREA { get; set; }

            public string PRIORITY { get; set; }

            public string SUPPORT_WINDOW { get; set; }

            public bool IS_SOW_COMMITMENT { get; set; }

            public MonthdetailsNew PREVIOUS_KPI { get; set; }

            public bool SHOW_TOOLTIP { get; set; }

            public bool IS_TARGET_CHANGED { get; set; }
        }

        #endregion

        public class Customergrouping
        {
            public Customergrouping(string custnm, string custid)
            {
                this.CUST_ID = custid;
                this.CUST_NM = custnm;
                this.PROJECTS = new Dictionary<string, ProjectConsolidated>();
                this.CUST_DATAS = new CommonkpiData();
            }
            public string CUST_ID { get; set; }

            public string CUST_NM { get; set; }

            public CommonkpiData  CUST_DATAS { get; set; }

            public Dictionary<string, ProjectConsolidated> PROJECTS { get; set; }
        }

        public class ProjectConsolidated
        {
            public ProjectConsolidated( string projnm, string projid)
            {
                this.PROJ_ID = projid;
                this.PROJ_NM = projnm;
                this.PROJ_KPI_DATAS = new Dictionary<int, KpiConsolidatedData>();
                this.PROJ_DATAS = new CommonkpiData();
            }

            public string PROJ_ID { get; set; }
            public string PROJ_NM { get; set; }

            public CommonkpiData PROJ_DATAS { get; set; }

            public Dictionary<int, KpiConsolidatedData> PROJ_KPI_DATAS { get; set; }
        }
       
        public class KpiConsolidatedData
        {
            public KpiConsolidatedData(int kpiid, string kpitype, string uom)
            {
                this.KPI_ID = kpiid;
                this.KPI_TYPE = kpitype;
                this.PERIODS = new List<Period>();
                this.UOM = uom;
            }
            public int KPI_ID { get; set; }
           

            public string KPI_TYPE { get; set; }

            public string UOM { get; set; }

            public List<Period> PERIODS { get; set; }
        }

        public class CommonkpiData
        {
            public string PARTICULAR_TITLE { get; set; }
            public decimal KPI_YTD_SCORE { get; set; }

            public decimal KPI_ACHIEVED { get; set; }

            public int KPI_COUNT { get; set; }

            public decimal ABOVE_TARGET { get; set; }

            public decimal ON_TARGET { get; set; }

            public decimal UNDER_TARGET { get; set; }

            public decimal ACTUALS_EMPTY { get; set; }

            public int KPI_NOT_CALCULATED { get; set; }

            public decimal ABOVE_TARGET_PERCENTAGE { get; set; }
            public decimal ON_TARGET_PERCENTAGE { get; set; }
            public decimal UNDER_TARGET_PERCENTAGE { get; set; }
        }

        public class OverallSummary
        {
            public  CommonkpiData CUST_KPI_DATA { get; set; }
            public CommonkpiData PROJ_KPI_DATA { get; set; }
            public Dictionary<string, CommonkpiData> GLOBAL_KPI_DATA { get; set; }
        }

        [POST("GetGlobalKPICategoryDetailsAcrossProject")]
        [ActionName("GetGlobalKPICategoryDetailsAcrossProject")]
        [HttpPost]
        public IHttpActionResult GetGlobalKPICategoryDetailsAcrossProject([FromBody] GlobalKPIRequest globalKPIRequest)
        {
            var monthColumns = new List<string>();

            var empid = Request.Headers.GetValues("empid").FirstOrDefault();

            if (globalKPIRequest.StartDate > globalKPIRequest.EndDate)
                return BadRequest("The Start date should be less than end date");

            var tempDate = new DateTime(globalKPIRequest.StartDate.Year, globalKPIRequest.StartDate.Month, globalKPIRequest.StartDate.Day);

            while (tempDate <= globalKPIRequest.EndDate)
            {
                monthColumns.Add(GetMonth(tempDate.Month, tempDate.Year.ToString().Substring(2, 2)));
                tempDate = tempDate.AddMonths(1);
            }

            var GlobalKpis = string.Empty;
            var Customerids = string.Empty;
            var Projectids = string.Empty;
            var ServiceTowerIds = string.Empty;
            

            if (globalKPIRequest.Globalkpis != null && globalKPIRequest.Globalkpis.Length > 0)
                GlobalKpis = string.Join(",", globalKPIRequest.Globalkpis);
            if (globalKPIRequest.Customerids != null && globalKPIRequest.Customerids.Length > 0)
                Customerids = string.Join(",", globalKPIRequest.Customerids);
            if (globalKPIRequest.Projectids != null && globalKPIRequest.Projectids.Length > 0)
                Projectids = string.Join(",", globalKPIRequest.Projectids);
            if (globalKPIRequest.ServiceTowerIds != null && globalKPIRequest.ServiceTowerIds.Length > 0)
                ServiceTowerIds = string.Join(",", globalKPIRequest.ServiceTowerIds);



            var groupBy = 1;

            if (string.IsNullOrEmpty(globalKPIRequest.InitialGroup))
            {
                groupBy = 1;
            }
            else if (globalKPIRequest.InitialGroup.ToUpper() == "PROJECT")
            {
                groupBy = 0;
            }
            else if (globalKPIRequest.InitialGroup.ToUpper() == "GCATEGORY")
            {
                groupBy = 1;
            }


            if (string.IsNullOrEmpty(Customerids) && !globalKPIRequest.LoadAll)
            {
                var customerlist = ((OkNegotiatedContentResult<List<CUSTOMER>>)GetCustomerList(empid)).Content;
                Customerids = string.Join(",", customerlist.Select(x => x.CUST_ID));
            }

            var dbResult = CSPdb.AppRepo.GetGlobalKPIDetails(globalKPIRequest.StartDate, globalKPIRequest.EndDate, GlobalKpis, Customerids, Projectids, ServiceTowerIds);
              

            //  var dbResult = CSPdb.AppRepo.GetGlobalKPIDetailsNew(globalKPIRequest.StartDate, globalKPIRequest.EndDate, GlobalKpis, Customerids, Projectids);
            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToArray();


            var result = new Dictionary<string, GlobalPerspective>();
            var projectResult = new Dictionary<string, KPIProject>();
            //var previouskpi = new MonthData();

            foreach (var row in dbResult)
            {
                LocalKPI kpi;

                if (groupBy == 0)
                {
                    if (!projectResult.ContainsKey(row.PROJ_ID))
                        projectResult.Add(row.PROJ_ID, new KPIProject(row.PROJ_ID, row.PROJ_NM, row.CUST_NM));

                    var project = projectResult[row.PROJ_ID];

                    if (!project.GlobalPerspectives.Any(g => g.GlobalPerspectiveName == row.KPI_CATEGORY))
                        project.GlobalPerspectives.Add(new GlobalPerspective(row.KPI_CATEGORY));

                    var perspective = project.GlobalPerspectives.FirstOrDefault(g => g.GlobalPerspectiveName == row.KPI_CATEGORY);

                    if (!perspective.GLOBAL_KPIs.Any(x => x.GLOBAL_KPI_NAME == row.GLOBAL_KPI_NAME))
                        perspective.GLOBAL_KPIs.Add(new GlobalKPI(row.GLOBAL_KPI_NAME));

                    var globalKpi = perspective.GLOBAL_KPIs.FirstOrDefault(x => x.GLOBAL_KPI_NAME == row.GLOBAL_KPI_NAME);

                    if (!globalKpi.LocalKPIs.Any(x => x.KPI_ID == row.KPI_ID))
                        globalKpi.LocalKPIs.Add(new LocalKPI(row.KPI_ID, row.KPI_NAME, row.PERIOD_TYPE, row.SLA_TARGET_UNIT_OF_MEASUREMENT));

                    kpi = globalKpi.LocalKPIs.FirstOrDefault(x => x.KPI_ID == row.KPI_ID);
                }
                else
                {
                    if (!result.ContainsKey(row.KPI_CATEGORY))
                        result.Add(row.KPI_CATEGORY, new GlobalPerspective(row.KPI_CATEGORY));

                    var perspective = result[row.KPI_CATEGORY];

                    if (!perspective.GLOBAL_KPIs.Any(x => x.GLOBAL_KPI_NAME == row.GLOBAL_KPI_NAME))
                        perspective.GLOBAL_KPIs.Add(new GlobalKPI(row.GLOBAL_KPI_NAME));

                    var globalKpi = perspective.GLOBAL_KPIs.FirstOrDefault(x => x.GLOBAL_KPI_NAME == row.GLOBAL_KPI_NAME);

                    if (!globalKpi.PROJECT_KPIS.Any(x => x.PROJECT_ID == row.PROJ_ID))
                        globalKpi.PROJECT_KPIS.Add(new KPIProject(row.PROJ_ID, row.PROJ_NM, row.CUST_NM));

                    var project = globalKpi.PROJECT_KPIS.FirstOrDefault(x => x.PROJECT_ID == row.PROJ_ID);

                    if (!project.KPIs.Any(x => x.KPI_ID == row.KPI_ID))
                        project.KPIs.Add(new LocalKPI(row.KPI_ID, row.KPI_NAME, row.PERIOD_TYPE, row.SLA_TARGET_UNIT_OF_MEASUREMENT));

                    kpi = project.KPIs.FirstOrDefault(x => x.KPI_ID == row.KPI_ID);
                }

                if (!kpi.Periods.Any(x => x.PeriodType == row.PERIOD_TYPE))
                    kpi.Periods.Add(new Period(row.PERIOD_TYPE));

                var weekData = kpi.Periods.FirstOrDefault(x => x.PeriodType == row.PERIOD_TYPE);
                bool IsActualEmpty = false;

                if (!decimal.TryParse(row.KPI_ACTUAL, out var actual))
                {
                    var periodDate = new DateTime(row.PERIOD.Year, row.PERIOD.Month, 01);
                    var currentDate = DateTime.Now;
                    if (row.PERIOD_TYPE == "Monthly")
                    {
                        double days = (currentDate - periodDate).TotalDays;
                        double cutoffDate = cutoffDays[0] + 30;
                        if (days > cutoffDate)
                            IsActualEmpty = true;
                        else
                            continue;
                    }
                    else
                    {
                        int days;
                        if (row.PERIOD_TYPE == "Week1")
                        {
                            days = cutoffDays[1] + 7;
                            periodDate = periodDate.AddDays(days);

                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week2")
                        {
                            days = cutoffDays[1] + 14;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week3")
                        {
                            days = cutoffDays[1] + 21;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week4")
                        {
                            days = cutoffDays[1] + 28;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week5")
                        {
                            days = cutoffDays[1] + 35;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                    }
                }

                var monthdata = new MonthData(
                    $"{row.MONTH_NM.ToLower()} {row.YEAR.ToString().Substring(2, 2)}",
                    row.SLA_TARGET_HIGH_VALUE,
                    row.SLA_TARGET_HIGH_OPERATOR,
                    row.SLA_TARGET_LOW_VALUE,
                    row.SLA_TARGET_LOW_OPERATOR,
                    actual,
                    IsActualEmpty,
                    row.SERVICE_AREA,
                    row.PRIORITY,
                    row.SUPPORT_WINDOW,
                    row.IS_SOW_COMMITMENT,
                    row.SLA_TARGET_MEDIUM_VALUE,
                    row.SLA_TARGET_MEDIUM_OPERATOR,
                    row.SLA_TARGET_VERYHIGH_DESCRIPTION,
                    row.SLA_TARGET_VERYHIGH_OPERATOR,
                    row.SLA_TARGET_VERYHIGH_VALUE,
                    row.SLA_TARGET_HIGH_DESCRIPTION,
                    row.SLA_TARGET_MEDIUM_DESCRIPTION,
                    row.SLA_TARGET_LOW_DESCRIPTION,
                    row.ISFLAG);
                weekData.AddMonthlyData(monthdata);

            }

            decimal[] actualsArray;
            if (groupBy == 1)
            {
                foreach (var persprec in result.Values)
                {
                    foreach (var gkpi in persprec.GLOBAL_KPIs)
                    {
                        foreach (var pkpi in gkpi.PROJECT_KPIS)
                        {
                            foreach (var kpi in pkpi.KPIs)
                            {
                                foreach (var period in kpi.Periods)
                                {
                                    actualsArray = period.MonthlyData.Values.Where(x => x.KpiActualValue.HasValue && x.KpiActualValue.Value != -1 && !x.IsActualEmpty)
                                        .Select(x => x.KpiActualValue.Value).ToArray();
                                    Array.Sort(actualsArray);
                                    if (actualsArray.Length > 0)
                                    {
                                        var n = actualsArray.Length;
                                        if (n % 2 != 0)
                                            period.Median = actualsArray[(n / 2)];
                                        else
                                            period.Median = (actualsArray[(n / 2) - 1] + actualsArray[(n / 2)]) / 2;
                                    }
                                    else
                                        period.Median = 0;

                                    //var index = (actualsArray.Length + 1) / 2;
                                    //if (index >= 0 && index < actualsArray.Length)
                                    //    period.Median = actualsArray[index - 1];
                                    //else
                                    //    period.Median = 0;

                                    var num1 = Convert.ToDecimal(period.Ontarget);
                                    var num2 = Convert.ToDecimal(period.Abovetarget);
                                    var num3 = Convert.ToDecimal(period.Undertarget);
                                    var deno = Convert.ToDecimal(period.MonthlyData.Count - period.NotApplCount);
                                    if (deno != 0)
                                    {
                                        period.Undertargetpercentage = Math.Round((num3 / deno) * 100);
                                        period.Abovetargetpercentage = Math.Round((num2 / deno) * 100);
                                        period.Ontargetpercentage = Math.Round((num1 / deno) * 100);
                                    }

                                    var i = 0;
                                    var previouskpi = new MonthData();

                                    foreach (var month in period.MonthlyData.Values)
                                    {
                                        if (i == 0)
                                        {
                                            month.Previouskpi = null;
                                            previouskpi = month;
                                            month.Istargetchanged = true;
                                        }
                                        else
                                        {
                                            if (month.Targethighoperator == previouskpi.Targethighoperator && month.Targethighvalue == previouskpi.Targethighvalue
                                             && month.Targetveryhighoperator == previouskpi.Targetveryhighoperator && month.Targetlowoperator == previouskpi.Targetlowoperator
                                             && month.Targetlowvalue == previouskpi.Targetlowvalue
                                             && month.Targetmediumoperator == previouskpi.Targetmediumoperator
                                             && month.Targetmediumvalue == previouskpi.Targetmediumvalue
                                             && month.Targetveryhighvalue == previouskpi.Targetveryhighvalue)
                                                month.Istargetchanged = false;
                                            else
                                                month.Istargetchanged = true;

                                            month.Previouskpi = previouskpi;
                                            previouskpi = month;
                                        }
                                        i++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                foreach (var pkpi in projectResult.Values)
                {
                    foreach (var persprec in pkpi.GlobalPerspectives)
                    {
                        foreach (var gkpi in persprec.GLOBAL_KPIs)
                        {
                            foreach (var kpi in gkpi.LocalKPIs)
                            {
                                foreach (var period in kpi.Periods)
                                {
                                    actualsArray = period.MonthlyData.Values.Where(x => x.KpiActualValue.HasValue && x.KpiActualValue.Value != -1 && !x.IsActualEmpty)
                                        .Select(x => x.KpiActualValue.Value).ToArray();
                                    if (actualsArray.Length > 0)
                                    {
                                        Array.Sort(actualsArray);

                                        var n = actualsArray.Length;
                                        if (n % 2 != 0)
                                            period.Median = actualsArray[(n / 2)];
                                        else
                                            period.Median = (actualsArray[(n / 2) - 1] + actualsArray[(n / 2)]) / 2;
                                    }
                                    else
                                        period.Median = 0;

                                    //var index = (actualsArray.Length + 1) / 2;
                                    //if (index >= 0 && index < actualsArray.Length)
                                    //    period.Median = actualsArray[index - 1];
                                    //else
                                    //    period.Median = 0;

                                    var num1 = Convert.ToDecimal(period.Ontarget);
                                    var num2 = Convert.ToDecimal(period.Abovetarget);
                                    var num3 = Convert.ToDecimal(period.Undertarget);
                                    var deno = Convert.ToDecimal(period.MonthlyData.Count - period.NotApplCount);
                                    if (deno != 0)
                                    {
                                        period.Undertargetpercentage = Math.Round((num3 / deno) * 100);
                                        period.Abovetargetpercentage = Math.Round((num2 / deno) * 100);
                                        period.Ontargetpercentage = Math.Round((num1 / deno) * 100);
                                    }

                                    var i = 0;
                                    var previouskpi = new MonthData();

                                    foreach (var month in period.MonthlyData.Values)
                                    {
                                        if (i == 0)
                                        {
                                            month.Previouskpi = null;
                                            previouskpi = month;
                                            month.Istargetchanged = true;
                                        }
                                        else
                                        {
                                            if (month.Targethighoperator == previouskpi.Targethighoperator && month.Targethighvalue == previouskpi.Targethighvalue
                                             && month.Targetveryhighoperator == previouskpi.Targetveryhighoperator && month.Targetlowoperator == previouskpi.Targetlowoperator
                                             && month.Targetlowvalue == previouskpi.Targetlowvalue
                                             && month.Targetmediumoperator == previouskpi.Targetmediumoperator
                                             && month.Targetmediumvalue == previouskpi.Targetmediumvalue
                                             && month.Targetveryhighvalue == previouskpi.Targetveryhighvalue)
                                                month.Istargetchanged = false;
                                            else
                                                month.Istargetchanged = true;

                                            month.Previouskpi = previouskpi;
                                            previouskpi = month;
                                        }
                                        i++;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (groupBy == 0)
            {
                return Ok(new
                {
                    monthColumns,
                    projectsKpi = projectResult.Values
                });
            }
            else
            {
                return Ok(new
                {
                    monthColumns,
                    projectsKpi = result.Values
                });
            }
        }

        public static decimal? GetKPIScore(MonthData kpi)
        {
            decimal tmpPercent = 0M;
            decimal kpiActualValue = kpi.KpiActualValue.HasValue ? kpi.KpiActualValue.Value : 0;

            if (kpi.Targetlowvalue.HasValue)
            {
                if (kpi.Targethighoperator == ">" && kpi.Targethighvalue == kpiActualValue)
                    kpi.Targethighvalue = kpi.Targethighvalue.Value + Convert.ToDecimal(.01);

                decimal trend = kpi.Targethighvalue.Value - kpi.Targetlowvalue.Value;

                if (trend > 0)
                    tmpPercent = kpiActualValue / kpi.Targethighvalue.Value;
                else if (trend < 0)
                {
                    if (kpiActualValue > 0)
                        tmpPercent = kpi.Targethighvalue.Value / kpiActualValue;
                    else
                        tmpPercent = 1;
                }
                else if (trend == 0)
                {
                    if (kpi.Targethighoperator == ">" || kpi.Targethighoperator == ">=" || kpi.Targetlowoperator == "<" || kpi.Targetlowoperator == "<=")
                    {
                        if (kpi.Targethighvalue.Value > 0)
                            tmpPercent = kpiActualValue / kpi.Targethighvalue.Value;
                        else
                            tmpPercent = 1;
                    }
                    else if (kpi.Targethighoperator == "<" || kpi.Targethighoperator == "<=" || kpi.Targetlowoperator == ">" || kpi.Targetlowoperator == ">=")
                    {
                        if (kpiActualValue > 0)
                            tmpPercent = kpi.Targethighvalue.Value / kpiActualValue;
                        else
                            tmpPercent = 1;
                    }
                }


                if (tmpPercent > 1)
                    kpi.KpiScore = 100;
                else
                    kpi.KpiScore = tmpPercent * 100;
            }
            else if (kpiActualValue != 0 && kpi.Targethighvalue.HasValue && kpi.Targethighvalue != 0)
            {
                if (kpi.Targethighoperator == ">" && kpi.Targethighvalue.Value == Convert.ToDecimal(kpi.KpiActualValue))
                    kpi.Targethighvalue = kpi.Targethighvalue.Value + Convert.ToDecimal(.01);

                tmpPercent = Convert.ToDecimal(kpi.KpiActualValue.Value) / kpi.Targethighvalue.Value;


                if (tmpPercent > 1)
                    kpi.KpiScore = 100;
                else
                    kpi.KpiScore = tmpPercent * 100;
            }
            else if (kpiActualValue == 0 && kpi.Targethighvalue.HasValue)
            {
                if (kpi.Targethighvalue.Value == 0)
                {
                    kpi.KpiScore = 100;
                }
                else
                {
                    kpi.KpiScore = 0;
                }

            }

            return kpi.KpiScore;
        }


        [POST("GetConsolidatedProjectWiseKPIDetails")]
        [ActionName("GetConsolidatedProjectWiseKPIDetails")]
        [HttpPost]
        public IHttpActionResult GetConsolidatedProjectWiseKPIDetails([FromBody] GlobalKPIRequest globalKPIRequest)
        {
            var empid = Request.Headers.GetValues("empid").FirstOrDefault();

            if (globalKPIRequest.StartDate > globalKPIRequest.EndDate)
                return BadRequest("The Start date should be less than end date");

            var GlobalKpis = string.Empty;
            var Customerids = string.Empty;
            var Projectids = string.Empty;
            var ServiceTowerIds = string.Empty;

            if (globalKPIRequest.Globalkpis != null && globalKPIRequest.Globalkpis.Length > 0)
                GlobalKpis = string.Join(",", globalKPIRequest.Globalkpis);
            if (globalKPIRequest.Customerids != null && globalKPIRequest.Customerids.Length > 0)
                Customerids = string.Join(",", globalKPIRequest.Customerids);
            if (globalKPIRequest.Projectids != null && globalKPIRequest.Projectids.Length > 0)
                Projectids = string.Join(",", globalKPIRequest.Projectids);           
            if (globalKPIRequest.ServiceTowerIds != null && globalKPIRequest.ServiceTowerIds.Length > 0)            
                ServiceTowerIds = string.Join(",", globalKPIRequest.ServiceTowerIds);
            


            if (string.IsNullOrEmpty(Customerids) && !globalKPIRequest.LoadAll)
            {
                var customerlist = ((OkNegotiatedContentResult<List<CUSTOMER>>)GetCustomerList(empid)).Content;
                Customerids = string.Join(",", customerlist.Select(x => x.CUST_ID));
            }


            var dbResult = CSPdb.AppRepo.GetGlobalKPIDetails(globalKPIRequest.StartDate, globalKPIRequest.EndDate, GlobalKpis, Customerids, Projectids, ServiceTowerIds);

            var cutoffDays = CSPdb.PARAMETER_TABLE.GetAll().Where(x => x.NAME == "KPI CUTOFF DATES").OrderBy(x => x.SORT_ORDER).Select(x => x.OPTIONS_ID).ToList();

            //var dbResult = CSPdb.AppRepo.GetGlobalKPIDetailsNew(globalKPIRequest.StartDate, globalKPIRequest.EndDate, GlobalKpis, Customerids, Projectids);

            var customerdict = new Dictionary<string, Customergrouping>();

            foreach (var row in dbResult)
            {
                if (!customerdict.ContainsKey(row.CUST_NM))
                    customerdict.Add(row.CUST_NM, new Customergrouping(row.CUST_NM, row.CUST_ID));

                var customer = customerdict[row.CUST_NM];

                if (!customer.PROJECTS.ContainsKey(row.PROJ_NM))
                    customer.PROJECTS.Add(row.PROJ_NM, new ProjectConsolidated(row.PROJ_NM, row.PROJ_ID));

                var project = customer.PROJECTS[row.PROJ_NM];

                if (!project.PROJ_KPI_DATAS.ContainsKey(row.KPI_ID))
                {
                    project.PROJ_KPI_DATAS.Add(row.KPI_ID, new KpiConsolidatedData(row.KPI_ID, row.PERIOD_TYPE, row.SLA_TARGET_UNIT_OF_MEASUREMENT));
                    project.PROJ_DATAS.KPI_COUNT++;
                    customer.CUST_DATAS.KPI_COUNT++;
                }

                var kpi = project.PROJ_KPI_DATAS[row.KPI_ID];

                if (!kpi.PERIODS.Any(x => x.PeriodType == row.PERIOD_TYPE))
                    kpi.PERIODS.Add(new Period(row.PERIOD_TYPE));

                var period = kpi.PERIODS.FirstOrDefault(x => x.PeriodType == row.PERIOD_TYPE);
                bool IsActualEmpty = false;

                if (!decimal.TryParse(row.KPI_ACTUAL, out var actual))
                {
                    var periodDate = new DateTime(row.PERIOD.Year, row.PERIOD.Month, 01);
                    var currentDate = DateTime.Now;
                    if (row.PERIOD_TYPE == "Monthly")
                    {
                        double days = (currentDate - periodDate).TotalDays;
                        double cutoffDate = cutoffDays[0] + 30;
                        if (days > cutoffDate)
                            IsActualEmpty = true;
                        else
                            continue;
                    }
                    else
                    {
                        int days;
                        if (row.PERIOD_TYPE == "Week1")
                        {
                            days = cutoffDays[1] + 7;
                            periodDate = periodDate.AddDays(days);

                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week2")
                        {
                            days = cutoffDays[1] + 14;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week3")
                        {
                            days = cutoffDays[1] + 21;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week4")
                        {
                            days = cutoffDays[1] + 28;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week5")
                        {
                            days = cutoffDays[1] + 35;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                    }
                }
                //      IsActualEmpty = true;

                //var monthdata = new MonthData(
                //    $"{row.MONTH_NM.ToLower()} {row.YEAR.ToString().Substring(2, 2)}",
                //    row.SLA_TARGET_HIGH_VALUE,
                //    row.SLA_TARGET_HIGH_OPERATOR,
                //    row.SLA_TARGET_LOW_VALUE,
                //    row.SLA_TARGET_LOW_OPERATOR,
                //    actual,
                //    IsActualEmpty,
                //    row.SERVICE_AREA,
                //    row.PRIORITY,
                //    row.SUPPORT_WINDOW,
                //    row.IS_SOW_COMMITMENT,
                //    row.SLA_TARGET_MEDIUM_VALUE,
                //    row.SLA_TARGET_MEDIUM_OPERATOR,
                //    row.SLA_TARGET_VERYHIGH_DESCRIPTION,
                //    row.SLA_TARGET_HIGH_DESCRIPTION,
                //    row.SLA_TARGET_MEDIUM_DESCRIPTION,
                //    row.SLA_TARGET_LOW_DESCRIPTION,
                //    row.ISFLAG);

                // period.AddMonthlyData(monthdata);

                if (row.ISFLAG)
                {
                    customer.CUST_DATAS.KPI_NOT_CALCULATED++;
                    project.PROJ_DATAS.KPI_NOT_CALCULATED++;
                    continue;
                }


                if (IsActualEmpty)
                {
                    customer.CUST_DATAS.ACTUALS_EMPTY++;
                    project.PROJ_DATAS.ACTUALS_EMPTY++;
                    customer.CUST_DATAS.KPI_NOT_CALCULATED++;
                    project.PROJ_DATAS.KPI_NOT_CALCULATED++;
                }
                else
                {

                    //var highvalue = row.SLA_TARGET_HIGH_VALUE.HasValue ? row.SLA_TARGET_HIGH_VALUE.Value : 0;
                    //var lowvalue = 0M;

                    if (!row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_MEDIUM_VALUE.HasValue && !row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                    {
                        if (row.SLA_TARGET_HIGH_VALUE.HasValue && row.SLA_TARGET_HIGH_VALUE.Value == actual)
                        {
                            customer.CUST_DATAS.ON_TARGET++;
                            project.PROJ_DATAS.ON_TARGET++;
                        }
                        else
                        {
                            customer.CUST_DATAS.KPI_NOT_CALCULATED++;
                            project.PROJ_DATAS.KPI_NOT_CALCULATED++;
                        }
                    }
                    else
                    {

                        //if (!row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_MEDIUM_VALUE.HasValue && row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                        //{
                        //    highvalue = row.SLA_TARGET_VERYHIGH_VALUE.Value;
                        //    lowvalue = row.SLA_TARGET_HIGH_VALUE.Value;
                        //}
                        //else
                        //{
                        //    lowvalue = row.SLA_TARGET_MEDIUM_VALUE.HasValue ? row.SLA_TARGET_MEDIUM_VALUE.Value : row.SLA_TARGET_LOW_VALUE.HasValue ? row.SLA_TARGET_LOW_VALUE.Value : 0;
                        //}

                        //var trend = highvalue - lowvalue;

                        //if (trend >= 0)
                        //{
                        //    if (actual == row.SLA_TARGET_HIGH_VALUE.Value)
                        //    {
                        //        customer.CUST_DATAS.ON_TARGET++;
                        //        project.PROJ_DATAS.ON_TARGET++;
                        //    }
                        //    else if (actual > row.SLA_TARGET_HIGH_VALUE.Value)
                        //    {
                        //        customer.CUST_DATAS.ABOVE_TARGET++;
                        //        project.PROJ_DATAS.ABOVE_TARGET++;
                        //    }
                        //    else if (actual < row.SLA_TARGET_HIGH_VALUE.Value)
                        //    {
                        //        customer.CUST_DATAS.UNDER_TARGET++;
                        //        project.PROJ_DATAS.UNDER_TARGET++;
                        //    }
                        //}
                        //else
                        //{
                        //    if (actual == row.SLA_TARGET_HIGH_VALUE.Value)
                        //    {
                        //        customer.CUST_DATAS.ON_TARGET++;
                        //        project.PROJ_DATAS.ON_TARGET++;
                        //    }
                        //    else if (actual < row.SLA_TARGET_HIGH_VALUE.Value)
                        //    {
                        //        customer.CUST_DATAS.ABOVE_TARGET++;
                        //        project.PROJ_DATAS.ABOVE_TARGET++;
                        //    }
                        //    else if (actual > row.SLA_TARGET_HIGH_VALUE.Value)
                        //    {
                        //        customer.CUST_DATAS.UNDER_TARGET++;
                        //        project.PROJ_DATAS.UNDER_TARGET++;
                        //    }
                        //}

                        var monthData = new MonthData();
                        monthData.KpiActualValue = actual;
                        monthData.Targetveryhighoperator = row.SLA_TARGET_VERYHIGH_OPERATOR;
                        monthData.Targetveryhighvalue = row.SLA_TARGET_VERYHIGH_VALUE;
                        monthData.Targethighoperator = row.SLA_TARGET_HIGH_OPERATOR;
                        monthData.Targethighvalue = row.SLA_TARGET_HIGH_VALUE;
                        monthData.Targetlowvalue = row.SLA_TARGET_LOW_VALUE;
                        monthData.Targetlowoperator = row.SLA_TARGET_LOW_OPERATOR;
                        monthData.Targetmediumoperator = row.SLA_TARGET_MEDIUM_OPERATOR;
                        monthData.Targetmediumvalue = row.SLA_TARGET_MEDIUM_VALUE;

                        var periodObj = new Period();

                        if (monthData.Targetveryhighvalue.HasValue)
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targethighoperator, monthData.Targethighvalue.Value, monthData.Targetveryhighoperator, monthData.Targetveryhighvalue.Value))
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        customer.CUST_DATAS.ON_TARGET++;
                                        project.PROJ_DATAS.ON_TARGET++;
                                    }
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                {
                                    customer.CUST_DATAS.ABOVE_TARGET++;
                                    project.PROJ_DATAS.ABOVE_TARGET++;
                                }
                                else
                                {
                                    customer.CUST_DATAS.UNDER_TARGET++;
                                    project.PROJ_DATAS.UNDER_TARGET++;
                                }

                            }
                            else
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        customer.CUST_DATAS.ON_TARGET++;
                                        project.PROJ_DATAS.ON_TARGET++;
                                    }
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                {
                                    customer.CUST_DATAS.ABOVE_TARGET++;
                                    project.PROJ_DATAS.ABOVE_TARGET++;
                                }
                                else
                                {
                                    customer.CUST_DATAS.UNDER_TARGET++;
                                    project.PROJ_DATAS.UNDER_TARGET++;
                                }
                            }
                        }
                        else if (monthData.Targetmediumvalue.HasValue)
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targetmediumoperator, monthData.Targetmediumvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    customer.CUST_DATAS.ON_TARGET++;
                                    project.PROJ_DATAS.ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue < monthData.Targetmediumvalue.Value)
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                            }
                            else
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    customer.CUST_DATAS.ON_TARGET++;
                                    project.PROJ_DATAS.ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue > monthData.Targetmediumvalue.Value)
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                            }
                        }
                        else if (monthData.Targetlowvalue.HasValue)
                        {
                            if (periodObj.IsRaisingTrend(monthData.Targetlowoperator, monthData.Targetlowvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    customer.CUST_DATAS.ON_TARGET++;
                                    project.PROJ_DATAS.ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue < monthData.Targetlowvalue.Value)
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                            }
                            else
                            {
                                if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                {
                                    customer.CUST_DATAS.ON_TARGET++;
                                    project.PROJ_DATAS.ON_TARGET++;
                                }
                                else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                    {
                                        customer.CUST_DATAS.ABOVE_TARGET++;
                                        project.PROJ_DATAS.ABOVE_TARGET++;
                                    }
                                    else if (monthData.KpiActualValue > monthData.Targetlowvalue.Value)
                                    {
                                        customer.CUST_DATAS.UNDER_TARGET++;
                                        project.PROJ_DATAS.UNDER_TARGET++;
                                    }
                                }
                            }
                        }
                    }
                }

                var deno1 = customer.CUST_DATAS.ON_TARGET + customer.CUST_DATAS.ABOVE_TARGET + customer.CUST_DATAS.UNDER_TARGET;
                if (deno1 != 0)
                {
                    customer.CUST_DATAS.ON_TARGET_PERCENTAGE = Math.Round(customer.CUST_DATAS.ON_TARGET / deno1 * 100);
                    customer.CUST_DATAS.UNDER_TARGET_PERCENTAGE = Math.Round(customer.CUST_DATAS.UNDER_TARGET / deno1 * 100);
                    customer.CUST_DATAS.ABOVE_TARGET_PERCENTAGE = Math.Round(customer.CUST_DATAS.ABOVE_TARGET / deno1 * 100);
                }

                var deno2 = project.PROJ_DATAS.ON_TARGET + project.PROJ_DATAS.ABOVE_TARGET + project.PROJ_DATAS.UNDER_TARGET;

                if (deno2 != 0)
                {
                    project.PROJ_DATAS.ON_TARGET_PERCENTAGE = Math.Round(project.PROJ_DATAS.ON_TARGET / deno2 * 100);
                    project.PROJ_DATAS.UNDER_TARGET_PERCENTAGE = Math.Round(project.PROJ_DATAS.UNDER_TARGET / deno2 * 100);
                    project.PROJ_DATAS.ABOVE_TARGET_PERCENTAGE = Math.Round(project.PROJ_DATAS.ABOVE_TARGET / deno2 * 100);
                }



                var num1 = customer.CUST_DATAS.ON_TARGET + customer.CUST_DATAS.ABOVE_TARGET;
                var num2 = customer.CUST_DATAS.ON_TARGET + customer.CUST_DATAS.ABOVE_TARGET + customer.CUST_DATAS.UNDER_TARGET + customer.CUST_DATAS.ACTUALS_EMPTY;

                if (num2 != 0)
                    customer.CUST_DATAS.KPI_ACHIEVED = Math.Round((num1 / num2) * 100);
                else
                    customer.CUST_DATAS.KPI_ACHIEVED = 0;

                num1 = project.PROJ_DATAS.ON_TARGET + project.PROJ_DATAS.ABOVE_TARGET;
                num2 = project.PROJ_DATAS.ON_TARGET + project.PROJ_DATAS.ABOVE_TARGET + project.PROJ_DATAS.UNDER_TARGET + project.PROJ_DATAS.ACTUALS_EMPTY;

                if (num2 != 0)
                    project.PROJ_DATAS.KPI_ACHIEVED = Math.Round((num1 / num2) * 100);
                else
                    project.PROJ_DATAS.KPI_ACHIEVED = 0;
            }


            var summaryKpi = GetoverallKPISummary(dbResult, cutoffDays);

            return Ok(new
            {
                summaryKpi,
                overallkpi = customerdict.Values
            });
        }
        public Dictionary<string, CommonkpiData>.ValueCollection GetoverallKPISummary(List<GlobalKPIData> dbResult, List<int> cutoffDays)
        {
            HashSet<string> custset = new HashSet<string>();
            HashSet<string> projset = new HashSet<string>();
            HashSet<int> qualityKPIs = new HashSet<int>();
            HashSet<int> perfKPIs = new HashSet<int>();
            HashSet<int> valueKPIs = new HashSet<int>();
            HashSet<int> compKPIs = new HashSet<int>();
            HashSet<int> backlogKPIs = new HashSet<int>();
            HashSet<int> unclassified = new HashSet<int>();

            var resultDict = new Dictionary<string, CommonkpiData>();
           
            foreach (var row in dbResult)
            {
                if (!resultDict.ContainsKey("customer"))
                    resultDict.Add("customer", new CommonkpiData());

                var custrec = resultDict["customer"];

                if (!custset.Contains(row.CUST_ID))
                {
                    custset.Add(row.CUST_ID);
                    custrec.KPI_COUNT++;
                }

                custrec.PARTICULAR_TITLE = "No of Customer / Accounts";

                bool IsActualEmpty = false;

                if (!decimal.TryParse(row.KPI_ACTUAL, out var actualcust))
                {
                    var periodDate = new DateTime(row.PERIOD.Year, row.PERIOD.Month, 01);
                    var currentDate = DateTime.Now;
                    if (row.PERIOD_TYPE == "Monthly")
                    {
                        double days = (currentDate - periodDate).TotalDays;
                        double cutoffDate = cutoffDays[0] + 30;
                        if (days > cutoffDate)
                            IsActualEmpty = true;
                        else
                            continue;
                    }
                    else
                    {
                        int days;
                        if (row.PERIOD_TYPE == "Week1")
                        {
                            days = cutoffDays[1] + 7;
                            periodDate = periodDate.AddDays(days);

                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week2")
                        {
                            days = cutoffDays[1] + 14;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week3")
                        {
                            days = cutoffDays[1] + 21;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week4")
                        {
                            days = cutoffDays[1] + 28;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                        else if (row.PERIOD_TYPE == "Week5")
                        {
                            days = cutoffDays[1] + 35;
                            periodDate = periodDate.AddDays(days);
                            if (currentDate > periodDate)
                                IsActualEmpty = true;
                            else
                                continue;
                        }
                    }
                }
                // IsActualEmpty = true;

                if (!row.ISFLAG)
                {
                    if (IsActualEmpty)
                    {
                        custrec.ACTUALS_EMPTY++;
                    }
                    else
                    {
                        //var highvalue = row.SLA_TARGET_HIGH_VALUE.HasValue ? row.SLA_TARGET_HIGH_VALUE : 0;
                        //var lowvalue = 0M;

                        if (!row.SLA_TARGET_MEDIUM_VALUE.HasValue && !row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                        {
                            if (row.SLA_TARGET_HIGH_VALUE.HasValue && row.SLA_TARGET_HIGH_VALUE.Value == actualcust)
                                custrec.ON_TARGET++;
                        }
                        else
                        {
                            //if (!row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_MEDIUM_VALUE.HasValue && row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                            //{
                            //    highvalue = row.SLA_TARGET_VERYHIGH_VALUE.Value;
                            //    lowvalue = row.SLA_TARGET_HIGH_VALUE.Value;
                            //}
                            //else
                            //{
                            //    lowvalue = row.SLA_TARGET_MEDIUM_VALUE.HasValue ? row.SLA_TARGET_MEDIUM_VALUE.Value : row.SLA_TARGET_LOW_VALUE.HasValue ? row.SLA_TARGET_LOW_VALUE.Value : 0;
                            //}

                            //var trendcust = highvalue - lowvalue;
                            //if (trendcust >= 0)
                            //{
                            //    if (actualcust > row.SLA_TARGET_HIGH_VALUE)
                            //        custrec.ABOVE_TARGET++;
                            //    else if (actualcust < row.SLA_TARGET_HIGH_VALUE)
                            //        custrec.UNDER_TARGET++;
                            //    else
                            //        custrec.ON_TARGET++;
                            //}
                            //else
                            //{
                            //    if (actualcust < row.SLA_TARGET_HIGH_VALUE)
                            //        custrec.ABOVE_TARGET++;
                            //    else if (actualcust > row.SLA_TARGET_HIGH_VALUE)
                            //        custrec.UNDER_TARGET++;
                            //    else
                            //        custrec.ON_TARGET++;
                            //}

                            var monthData = new MonthData();
                            monthData.KpiActualValue = actualcust;
                            monthData.Targetveryhighoperator = row.SLA_TARGET_VERYHIGH_OPERATOR;
                            monthData.Targetveryhighvalue = row.SLA_TARGET_VERYHIGH_VALUE;
                            monthData.Targethighoperator = row.SLA_TARGET_HIGH_OPERATOR;
                            monthData.Targethighvalue = row.SLA_TARGET_HIGH_VALUE;
                            monthData.Targetlowvalue = row.SLA_TARGET_LOW_VALUE;
                            monthData.Targetlowoperator = row.SLA_TARGET_LOW_OPERATOR;
                            monthData.Targetmediumoperator = row.SLA_TARGET_MEDIUM_OPERATOR;
                            monthData.Targetmediumvalue = row.SLA_TARGET_MEDIUM_VALUE;

                            var periodObj = new Period();

                            if (monthData.Targetveryhighvalue.HasValue)
                            {
                                if (periodObj.IsRaisingTrend(monthData.Targethighoperator, monthData.Targethighvalue.Value, monthData.Targetveryhighoperator, monthData.Targetveryhighvalue.Value))
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            custrec.ON_TARGET++;
                                        }
                                    }
                                    else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                    {
                                        custrec.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        custrec.UNDER_TARGET++;
                                    }
                                }
                                else
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            custrec.ON_TARGET++;
                                        }
                                    }
                                    else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                    {
                                        custrec.ABOVE_TARGET++;
                                    }
                                    else
                                    {
                                        custrec.UNDER_TARGET++;
                                    }
                                }
                            }
                            else if (monthData.Targetmediumvalue.HasValue)
                            {
                                if (periodObj.IsRaisingTrend(monthData.Targetmediumoperator, monthData.Targetmediumvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                    {
                                        custrec.ON_TARGET++;
                                    }
                                    else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                    {
                                        if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                    else
                                    {
                                        if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else if (monthData.KpiActualValue < monthData.Targetmediumvalue.Value)
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                }
                                else
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                    {
                                        custrec.ON_TARGET++;
                                    }
                                    else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                    {
                                        if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                    else
                                    {
                                        if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else if (monthData.KpiActualValue > monthData.Targetmediumvalue.Value)
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                }
                            }
                            else if (monthData.Targetlowvalue.HasValue)
                            {
                                if (periodObj.IsRaisingTrend(monthData.Targetlowoperator, monthData.Targetlowvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                    {
                                        custrec.ON_TARGET++;
                                    }
                                    else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                    {
                                        if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                    else
                                    {
                                        if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else if (monthData.KpiActualValue < monthData.Targetlowvalue.Value)
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                }
                                else
                                {
                                    if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                    {
                                        custrec.ON_TARGET++;
                                    }
                                    else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                    {
                                        if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                    else
                                    {
                                        if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                        {
                                            custrec.ABOVE_TARGET++;
                                        }
                                        else if (monthData.KpiActualValue > monthData.Targetlowvalue.Value)
                                        {
                                            custrec.UNDER_TARGET++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                var odeno = custrec.ON_TARGET + custrec.ABOVE_TARGET + custrec.UNDER_TARGET + custrec.ACTUALS_EMPTY;
                if (odeno != 0)
                    custrec.KPI_ACHIEVED = Math.Round((custrec.ABOVE_TARGET + custrec.ON_TARGET) / (odeno) * 100);

                var deno = custrec.ON_TARGET + custrec.ABOVE_TARGET + custrec.UNDER_TARGET;

                if (deno != 0)
                {
                    custrec.ON_TARGET_PERCENTAGE = Math.Round(custrec.ON_TARGET / (custrec.ON_TARGET + custrec.UNDER_TARGET + custrec.ABOVE_TARGET) * 100);
                    custrec.UNDER_TARGET_PERCENTAGE = Math.Round(custrec.UNDER_TARGET / (custrec.ON_TARGET + custrec.UNDER_TARGET + custrec.ABOVE_TARGET) * 100);
                    custrec.ABOVE_TARGET_PERCENTAGE = Math.Round(custrec.ABOVE_TARGET / (custrec.ON_TARGET + custrec.UNDER_TARGET + custrec.ABOVE_TARGET) * 100);
                }

                if (!resultDict.ContainsKey("project"))
                    resultDict.Add("project", new CommonkpiData());

                var projrec = resultDict["project"];

                if (!projset.Contains(row.PROJ_ID))
                {
                    projset.Add(row.PROJ_ID);
                    projrec.KPI_COUNT++;
                }

                projrec.PARTICULAR_TITLE = "No. of Projects";

                if (!row.ISFLAG)
                {
                    projrec.KPI_ACHIEVED = custrec.KPI_ACHIEVED;
                    projrec.ON_TARGET = custrec.ON_TARGET;
                    projrec.UNDER_TARGET = custrec.UNDER_TARGET;
                    projrec.ABOVE_TARGET = custrec.ABOVE_TARGET;
                    projrec.ON_TARGET_PERCENTAGE = custrec.ON_TARGET_PERCENTAGE;
                    projrec.UNDER_TARGET_PERCENTAGE = custrec.UNDER_TARGET_PERCENTAGE;
                    projrec.ABOVE_TARGET_PERCENTAGE = custrec.ABOVE_TARGET_PERCENTAGE;
                }



                if (!resultDict.ContainsKey(row.KPI_CATEGORY))
                    resultDict.Add(row.KPI_CATEGORY, new CommonkpiData());

                var rec = resultDict[row.KPI_CATEGORY];

                if (row.GLOBAL_KPI_ID == 1)
                {
                    if (!resultDict.ContainsKey(row.GLOBAL_KPI_NAME))
                        resultDict.Add(row.GLOBAL_KPI_NAME, new CommonkpiData());

                    var unclassifiedrec = resultDict[row.GLOBAL_KPI_NAME];

                    unclassifiedrec.PARTICULAR_TITLE = "No. of KPIs not linked to Category";
                    unclassified.Add(row.KPI_ID);

                    if (!row.ISFLAG)
                    {
                        if (IsActualEmpty)
                        {
                            unclassifiedrec.ACTUALS_EMPTY++;
                        }
                        else
                        {
                            //decimal.TryParse(row.KPI_ACTUAL, out var actualnew);

                            //var highvalue = row.SLA_TARGET_HIGH_VALUE.HasValue ? row.SLA_TARGET_HIGH_VALUE : 0;
                            //var lowvalue = 0M;

                            if (!row.SLA_TARGET_MEDIUM_VALUE.HasValue && !row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                            {
                                if (row.SLA_TARGET_HIGH_VALUE.HasValue && row.SLA_TARGET_HIGH_VALUE.Value == actualcust)
                                    unclassifiedrec.ON_TARGET++;
                            }
                            else
                            {
                                //if (!row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_MEDIUM_VALUE.HasValue && row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                                //{
                                //    highvalue = row.SLA_TARGET_VERYHIGH_VALUE.Value;
                                //    lowvalue = row.SLA_TARGET_HIGH_VALUE.Value;
                                //}
                                //else
                                //{
                                //    lowvalue = row.SLA_TARGET_MEDIUM_VALUE.HasValue ? row.SLA_TARGET_MEDIUM_VALUE.Value : row.SLA_TARGET_LOW_VALUE.HasValue ? row.SLA_TARGET_LOW_VALUE.Value : 0;
                                //}

                                //var trendnew = highvalue - lowvalue;
                                //if (trendnew >= 0)
                                //{
                                //    if (actualcust > row.SLA_TARGET_HIGH_VALUE)
                                //        unclassifiedrec.ABOVE_TARGET++;
                                //    else if (actualcust < row.SLA_TARGET_HIGH_VALUE)
                                //        unclassifiedrec.UNDER_TARGET++;
                                //    else
                                //        unclassifiedrec.ON_TARGET++;
                                //}
                                //else
                                //{
                                //    if (actualcust < row.SLA_TARGET_HIGH_VALUE)
                                //        unclassifiedrec.ABOVE_TARGET++;
                                //    else if (actualcust > row.SLA_TARGET_HIGH_VALUE)
                                //        unclassifiedrec.UNDER_TARGET++;
                                //    else
                                //        unclassifiedrec.ON_TARGET++;
                                //}
                                var monthData = new MonthData();
                                monthData.KpiActualValue = actualcust;
                                monthData.Targetveryhighoperator = row.SLA_TARGET_VERYHIGH_OPERATOR;
                                monthData.Targetveryhighvalue = row.SLA_TARGET_VERYHIGH_VALUE;
                                monthData.Targethighoperator = row.SLA_TARGET_HIGH_OPERATOR;
                                monthData.Targethighvalue = row.SLA_TARGET_HIGH_VALUE;
                                monthData.Targetlowvalue = row.SLA_TARGET_LOW_VALUE;
                                monthData.Targetlowoperator = row.SLA_TARGET_LOW_OPERATOR;
                                monthData.Targetmediumoperator = row.SLA_TARGET_MEDIUM_OPERATOR;
                                monthData.Targetmediumvalue = row.SLA_TARGET_MEDIUM_VALUE;

                                var periodObj = new Period();

                                if (monthData.Targetveryhighvalue.HasValue)
                                {
                                    if (periodObj.IsRaisingTrend(monthData.Targethighoperator, monthData.Targethighvalue.Value, monthData.Targetveryhighoperator, monthData.Targetveryhighvalue.Value))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                unclassifiedrec.ON_TARGET++;
                                            }
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                        {
                                            unclassifiedrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            unclassifiedrec.UNDER_TARGET++;
                                        }

                                    }
                                    else
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                unclassifiedrec.ON_TARGET++;
                                            }
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                        {
                                            unclassifiedrec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            unclassifiedrec.UNDER_TARGET++;
                                        }
                                    }
                                }
                                else if (monthData.Targetmediumvalue.HasValue)
                                {
                                    if (periodObj.IsRaisingTrend(monthData.Targetmediumoperator, monthData.Targetmediumvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            unclassifiedrec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue < monthData.Targetmediumvalue.Value)
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            unclassifiedrec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue > monthData.Targetmediumvalue.Value)
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                }
                                else if (monthData.Targetlowvalue.HasValue)
                                {
                                    if (periodObj.IsRaisingTrend(monthData.Targetlowoperator, monthData.Targetlowvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            unclassifiedrec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue < monthData.Targetlowvalue.Value)
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            unclassifiedrec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                unclassifiedrec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue > monthData.Targetlowvalue.Value)
                                            {
                                                unclassifiedrec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var odeno1 = unclassifiedrec.ON_TARGET + unclassifiedrec.ABOVE_TARGET + unclassifiedrec.UNDER_TARGET + unclassifiedrec.ACTUALS_EMPTY;
                    if (odeno1 != 0)
                        unclassifiedrec.KPI_ACHIEVED = Math.Round((unclassifiedrec.ABOVE_TARGET + unclassifiedrec.ON_TARGET) / (odeno1) * 100);

                    var deno1 = unclassifiedrec.ON_TARGET + unclassifiedrec.ABOVE_TARGET + unclassifiedrec.UNDER_TARGET;

                    if (deno1 != 0)
                    {
                        unclassifiedrec.ON_TARGET_PERCENTAGE = Math.Round(unclassifiedrec.ON_TARGET / deno1 * 100);
                        unclassifiedrec.UNDER_TARGET_PERCENTAGE = Math.Round(unclassifiedrec.UNDER_TARGET / deno1 * 100);
                        unclassifiedrec.ABOVE_TARGET_PERCENTAGE = Math.Round(unclassifiedrec.ABOVE_TARGET / deno1 * 100);
                    }

                }
                else
                {
                    rec.PARTICULAR_TITLE = "No. of KPIs in Category :- " + row.KPI_CATEGORY;
                    if (row.KPI_CATEGORY.ToUpper() == "QUALITY")    
                    {                      
                        qualityKPIs.Add(row.KPI_ID);
                    }
                    else if (row.KPI_CATEGORY.ToUpper() == "PERFORMANCE")
                    {                      
                        perfKPIs.Add(row.KPI_ID);
                    }
                    else if (row.KPI_CATEGORY.ToUpper() == "VALUE")
                    {                       
                        valueKPIs.Add(row.KPI_ID);
                    }
                    else if (row.KPI_CATEGORY.ToUpper() == "COMPLIANCE")
                    {                        
                        compKPIs.Add(row.KPI_ID);
                    }
                    else if (row.KPI_CATEGORY.ToUpper() == "BACKLOG")
                    {
                        backlogKPIs.Add(row.KPI_ID);
                    }
                    if (!row.ISFLAG)
                    {
                        if (IsActualEmpty)
                        {
                            rec.ACTUALS_EMPTY++;
                        }
                        else
                        {
                            //decimal.TryParse(row.KPI_ACTUAL, out var actual);
                            //var highvalue = row.SLA_TARGET_HIGH_VALUE.HasValue ? row.SLA_TARGET_HIGH_VALUE.Value : 0;
                            //var lowvalue = 0M;

                            if (!row.SLA_TARGET_MEDIUM_VALUE.HasValue && !row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                            {
                                if (row.SLA_TARGET_HIGH_VALUE.HasValue && row.SLA_TARGET_HIGH_VALUE.Value == actualcust)
                                    rec.ON_TARGET++;
                            }
                            else
                            {
                                //if (!row.SLA_TARGET_LOW_VALUE.HasValue && !row.SLA_TARGET_MEDIUM_VALUE.HasValue && row.SLA_TARGET_VERYHIGH_VALUE.HasValue)
                                //{
                                //    highvalue = row.SLA_TARGET_VERYHIGH_VALUE.Value;
                                //    lowvalue = row.SLA_TARGET_HIGH_VALUE.Value;
                                //}
                                //else
                                //{
                                //    lowvalue = row.SLA_TARGET_MEDIUM_VALUE.HasValue ? row.SLA_TARGET_MEDIUM_VALUE.Value : row.SLA_TARGET_LOW_VALUE.HasValue ? row.SLA_TARGET_LOW_VALUE.Value : 0;
                                //}

                                //var trend = highvalue - lowvalue;
                                //if (trend >= 0)
                                //{
                                //    if (actualcust > row.SLA_TARGET_HIGH_VALUE)
                                //        rec.ABOVE_TARGET++;
                                //    else if (actualcust < row.SLA_TARGET_HIGH_VALUE)
                                //        rec.UNDER_TARGET++;
                                //    else
                                //        rec.ON_TARGET++;
                                //}
                                //else
                                //{
                                //    if (actualcust < row.SLA_TARGET_HIGH_VALUE)
                                //        rec.ABOVE_TARGET++;
                                //    else if (actualcust > row.SLA_TARGET_HIGH_VALUE)
                                //        rec.UNDER_TARGET++;
                                //    else
                                //        rec.ON_TARGET++;
                                //}
                                var monthData = new MonthData();
                                monthData.KpiActualValue = actualcust;
                                monthData.Targetveryhighoperator = row.SLA_TARGET_VERYHIGH_OPERATOR;
                                monthData.Targetveryhighvalue = row.SLA_TARGET_VERYHIGH_VALUE;
                                monthData.Targethighoperator = row.SLA_TARGET_HIGH_OPERATOR;
                                monthData.Targethighvalue = row.SLA_TARGET_HIGH_VALUE;
                                monthData.Targetlowvalue = row.SLA_TARGET_LOW_VALUE;
                                monthData.Targetlowoperator = row.SLA_TARGET_LOW_OPERATOR;
                                monthData.Targetmediumoperator = row.SLA_TARGET_MEDIUM_OPERATOR;
                                monthData.Targetmediumvalue = row.SLA_TARGET_MEDIUM_VALUE;

                                var periodObj = new Period();

                                if (monthData.Targetveryhighvalue.HasValue)
                                {
                                    if (periodObj.IsRaisingTrend(monthData.Targethighoperator, monthData.Targethighvalue.Value, monthData.Targetveryhighoperator, monthData.Targetveryhighvalue.Value))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                rec.ON_TARGET++;
                                            }
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                        {
                                            rec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            rec.UNDER_TARGET++;
                                        }

                                    }
                                    else
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                rec.ON_TARGET++;
                                            }
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetveryhighoperator, monthData.Targetveryhighvalue, monthData.KpiActualValue))
                                        {
                                            rec.ABOVE_TARGET++;
                                        }
                                        else
                                        {
                                            rec.UNDER_TARGET++;
                                        }
                                    }
                                }
                                else if (monthData.Targetmediumvalue.HasValue)
                                {
                                    if (periodObj.IsRaisingTrend(monthData.Targetmediumoperator, monthData.Targetmediumvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            rec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue < monthData.Targetmediumvalue.Value)
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            rec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetmediumoperator, monthData.Targetmediumvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue > monthData.Targetmediumvalue.Value)
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                }
                                else if (monthData.Targetlowvalue.HasValue)
                                {
                                    if (periodObj.IsRaisingTrend(monthData.Targetlowoperator, monthData.Targetlowvalue.Value, monthData.Targethighoperator, monthData.Targethighvalue.Value))
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            rec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue > monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue < monthData.Targetlowvalue.Value)
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        if (periodObj.DetermineTargetsAchievement(monthData.Targethighoperator, monthData.Targethighvalue, monthData.KpiActualValue))
                                        {
                                            rec.ON_TARGET++;
                                        }
                                        else if (periodObj.DetermineTargetsAchievement(monthData.Targetlowoperator, monthData.Targetlowvalue, monthData.KpiActualValue))
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                        else
                                        {
                                            if (monthData.KpiActualValue < monthData.Targethighvalue.Value)
                                            {
                                                rec.ABOVE_TARGET++;
                                            }
                                            else if (monthData.KpiActualValue > monthData.Targetlowvalue.Value)
                                            {
                                                rec.UNDER_TARGET++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    var odeno2 = rec.ON_TARGET + rec.ABOVE_TARGET + rec.UNDER_TARGET + rec.ACTUALS_EMPTY;
                    var deno2 = rec.ON_TARGET + rec.UNDER_TARGET + rec.ABOVE_TARGET;

                    if (deno2 != 0)
                    {
                        rec.ON_TARGET_PERCENTAGE = Math.Round(rec.ON_TARGET / (rec.ON_TARGET + rec.UNDER_TARGET + rec.ABOVE_TARGET) * 100);
                        rec.UNDER_TARGET_PERCENTAGE = Math.Round(rec.UNDER_TARGET / (rec.ON_TARGET + rec.UNDER_TARGET + rec.ABOVE_TARGET) * 100);
                        rec.ABOVE_TARGET_PERCENTAGE = Math.Round(rec.ABOVE_TARGET / (rec.ON_TARGET + rec.UNDER_TARGET + rec.ABOVE_TARGET) * 100);
                    }

                    if (odeno2 != 0)
                        rec.KPI_ACHIEVED = Math.Round((rec.ABOVE_TARGET + rec.ON_TARGET) / (odeno2) * 100);
                }

            }

            if (resultDict.ContainsKey("Quality"))
            {
                resultDict["Quality"].KPI_COUNT = qualityKPIs.Count;
            }
            if (resultDict.ContainsKey("Performance"))
            {
                resultDict["Performance"].KPI_COUNT = perfKPIs.Count;
            }
            if (resultDict.ContainsKey("Value"))
            {
                resultDict["Value"].KPI_COUNT = valueKPIs.Count;
            }
            if (resultDict.ContainsKey("Compliance"))
            {
                resultDict["Compliance"].KPI_COUNT = compKPIs.Count;
            }
            if (resultDict.ContainsKey("Backlog"))
            {
                resultDict["Backlog"].KPI_COUNT = backlogKPIs.Count;
            }
            if (resultDict.ContainsKey("UNCLASSIFIED"))
            {
                resultDict["UNCLASSIFIED"].KPI_COUNT = unclassified.Count;
            }

            return resultDict.Values;
        }


    }
}