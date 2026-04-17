using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {


        [GET("GetAccountsForCSATDashboard")]

        [ActionName("GetAccountsForCSATDashboard")]
        [HttpGet]
        public IHttpActionResult GetAccountsForCSATDashboard(bool isHaveAllCustomerAccess)
        {
            LogRequest(prefix: "x");

            var empId = GetHeaderDetails_String("empId");

            var customers = new List<CustomerBase>();
            var allUserAccounts = new List<CustomerBase>(); var allTop15Accounts = string.Empty; var allAccountsExceptTop15Accounts = string.Empty;
            var allQASpocAccounts = string.Empty; var allGSLabAccounts = string.Empty; var allGSLabKeyAccounts = string.Empty;
            var allStrategicAccounts = string.Empty;
            var excludedIds = new List<string> { "-1", "-2", "-3", "-4", "-5", "-6", "-7" };

            var projects = GetProjectListForUser(empId.ToString());
            var customerIds = projects.Select(t => t.CUST_ID).Distinct().ToList<string>();
            //check whether user is superadmin; if not break the loop
            var empInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId);
            //todo: refactor to one query
            var query = Cldb.AppRepo.UserInfo(empInfo.EMAIL_ID).FirstOrDefault<UserInfo>();

            if (isHaveAllCustomerAccess && query.SUPERADMIN)
            {


                var allAccounts = Cldb.AppRepo.GetAllAccounts().ToList();
                allUserAccounts = allAccounts.Where(x => customerIds.Contains(x.CUST_ID) || excludedIds.Contains(x.CUST_ID)).ToList();

                var top15AccountIds = helper.GetDBConfig("CSAT_DASHBOARD_TOP_15_ACCOUNTS", "-1").Split(',').ToList();
                var top15Accounts = top15AccountIds.Where(x => customerIds.Contains(x)).ToList();
                allTop15Accounts = string.Join(",", top15Accounts);

                var exceptTop15AccountIds = allAccounts.Where(x => !top15AccountIds.Contains(x.CUST_ID.ToString())).ToList();
                var exceptTop15Accounts = exceptTop15AccountIds.Where(x => customerIds.Contains(x.CUST_ID)).ToList();
                allAccountsExceptTop15Accounts = string.Join(",", exceptTop15AccountIds.Select(x => x.CUST_ID));

                //var qaSpocAccountIds = projects.Where(x => x.QUALITY_SPOC == empId).Select(x => x.CUST_ID).Distinct().ToList();
                //var qaSpocAccounts = qaSpocAccountIds.Where(x => customerIds.Contains(x)).ToList();
                //allQASpocAccounts = string.Join(",", qaSpocAccounts);

                var allGSLabProjectIds = projects.Where(x => helper.IsGSLABAccount(x.CUST_ID)).Select(x => x.CUST_ID).Distinct().ToList();
                var gsLabAccounts = allGSLabProjectIds.Where(x => customerIds.Contains(x)).ToList();
                allGSLabAccounts = string.Join(",", gsLabAccounts);

                var gsLabKeyAccountIds = helper.GetDBConfig("GSLAB_KEY_ACCOUNTS", "-1").Split(',').ToList();
                var gsLabKeyAccounts = gsLabKeyAccountIds.Where(x => customerIds.Contains(x)).ToList();
                allGSLabKeyAccounts = string.Join(",", gsLabKeyAccounts);

                var strategicAccountIds = helper.GetDBConfig("STRATEGIC_ACCOUNTS_PRESIDENT", "-1").Split(',').ToList();
                var strategicAccounts = strategicAccountIds.Where(x => customerIds.Contains(x)).ToList();
                allStrategicAccounts = string.Join(",", strategicAccounts);

                customers.AddRange(allUserAccounts);
            }
            else
            {
                customers.AddRange(Cldb.CUSTOMER.GetAll().Where(t => customerIds.Contains(t.CUST_ID)).OrderBy(t => t.CUST_NM).ToList());
            }
            var overallData = new
            {
                Customers = customers,
                AllTop15Accounts = allTop15Accounts,
                AllAccountsExceptTop15Accounts = allAccountsExceptTop15Accounts,
                AllQASpocAccounts = allQASpocAccounts,
                AllGSLabAccounts = allGSLabAccounts,
                AllGSLabKeyAccounts = allGSLabKeyAccounts,
                AllstrategicAccounts = allStrategicAccounts
            };
            return Ok(overallData);
        }

        [POST("GetNPSForPeriod")]
        [ActionName("GetNPSForPeriod")]
        [HttpPost]
        public IHttpActionResult GetNPSForPeriod([FromBody] CSATInsightsInputHolder csatInsightsInput)
        {
            LogRequest();
            var watch = Stopwatch.StartNew();
            if (csatInsightsInput.BUSINESS_UNIT.ToUpper() != "all") csatInsightsInput.CUSTOMER_IDS = "-1";
            var csatdata = CSPdb.AppRepo.GetCSSTableForPeriod(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS);

            var csat = new List<PROJECT_CSAT_DATA>();
            var sorter = new QuarterSorter();
            var quarter = csatdata.Select(x => x.YEAR_QUARTER).Distinct().OrderBy(t => t, sorter).ToList();

            if (quarter.Count == 0)
            {
                return Ok();
            }

            var charts = new HighChartsColumn();

            charts.title.text = "Net Promoter Score";
            charts.yAxis = new yAxisOnlyWithTitle();
            charts.yAxis.title = new title() { text = "No of Projects" };
            charts.plotOptions.series.dataLabels.enabled = true;
            var detractors = new List<decimal>();
            var passives = new List<decimal>();
            var promoters = new List<decimal>();
            var npsScore = new List<decimal>();

            for (int i = 0; i < quarter.Count; i++)
            {
                charts.xAxis.categories.Add(quarter[i]);
                detractors.Add(csatdata.Count(t => t.NPS_SCORE <= 6 && t.YEAR_QUARTER == quarter[i]));
                passives.Add(csatdata.Count(t => (t.NPS_SCORE == 7 || t.NPS_SCORE == 8) && t.YEAR_QUARTER == quarter[i]));
                promoters.Add(csatdata.Count(t => t.NPS_SCORE >= 9 && t.YEAR_QUARTER == quarter[i]));
                npsScore.Add(GetNPSScoreData(csatdata.Count(t => t.NPS_SCORE >= 9 && t.YEAR_QUARTER == quarter[i]), csatdata.Count(t => t.NPS_SCORE <= 6 && t.YEAR_QUARTER == quarter[i]), csatdata.Count(t => t.YEAR_QUARTER == quarter[i])));
            }

            charts.series.Add(new seriesItem("Detractors", "#FB8F73", "column", detractors) { });

            charts.series.Add(new seriesItem("Passives", "#FFFF9D", "column", passives) { });

            charts.series.Add(new seriesItem("Promoters", "#CAEE97", "column", promoters) { });

            charts.series.Add(new seriesItem("NPScore", "#737373", "line", npsScore) { });
            FillResponseTime(watch);
            return Ok(charts);

        }

        [POST("GetCSATSurveyResponseForPeriod")]
        [ActionName("GetCSATSurveyResponseForPeriod")]
        [HttpPost]
        public IHttpActionResult GetCSATSurveyResponseForPeriod([FromBody] CSATInsightsInputHolder csatInsightsInput)
        {
            LogRequest(content: JsonConvert.SerializeObject(csatInsightsInput), prefix: "GetCSATSurveyResponseForPeriod");
            var watch = Stopwatch.StartNew();
            if (csatInsightsInput == null)
            {
                return BadRequest("Request is empty");
            }

            var csatList = new List<CSAT_SURVEY_DATA_PERIODWISE>();
            var csatMonthlyList = new List<CSAT_SURVEY_DATA_PERIODWISE_MONTHLY>();
            var charts = new HighChartsColumn();
            var initiated = new List<decimal>();
            var responded = new List<decimal>();

            var initiatedmonthly = 0;
            var respondedmonthly = 0;
            var percentageofRespondents = new List<decimal>();

            if (string.IsNullOrWhiteSpace(csatInsightsInput.CUSTOMER_IDS))
            {
                return BadRequest("Please select any Customer");
            }

            if (csatInsightsInput.FREQUENCY == "Monthly")
            {
                csatMonthlyList = CSPdb.AppRepo.GetCSSResponseSummaryForPremierMonthly(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS).ToList();
                var month = csatMonthlyList.Select(x => new { Month = x.YEAR_MONTH }).Distinct().ToList();
                if (month.Count == 0)
                {
                    return Ok();
                }

                for (int i = 0; i < month.Count; i++)
                {
                    charts.xAxis.categories.Add(month[i].Month);
                    initiated.Add(csatMonthlyList.Count(t => t.YEAR_MONTH == month[i].Month));
                    responded.Add(csatMonthlyList.Count(t => t.YEAR_MONTH == month[i].Month && t.STATUS == "COMPLETED"));
                    percentageofRespondents.Add(GetSurveyPercentage(csatMonthlyList.Count(t => t.YEAR_MONTH == month[i].Month && t.STATUS == "COMPLETED"), csatMonthlyList.Count(t => t.YEAR_MONTH == month[i].Month)));

                }
            }
            else
            {

                if (csatInsightsInput.CUSTOMER_IDS.Contains(PREMIER_CUSTOMER_ID) || csatInsightsInput.CUSTOMER_IDS == "-1")
                {
                    csatMonthlyList = CSPdb.AppRepo.GetCSSResponseSummaryForPremierMonthly(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS).ToList();
                }

                csatList = CSPdb.AppRepo.GetCSSResponseSummaryForPeriod(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS).ToList();

                var quarter = FilterDataByFrequency(csatInsightsInput.FREQUENCY, csatList);

                if (quarter.Count == 0 && csatMonthlyList.Count == 0)
                {
                    return Ok();
                }

                //if (quarter.Count == 0 && csatMonthlyList.Count > 0)
                //{
                //    quarter = csatMonthlyList.Select(x => x.YEAR_QUARTER).Distinct().OrderBy(t => t, sorter).ToList();
                //}

                for (int i = 0; i < quarter.Count; i++)
                {
                    charts.xAxis.categories.Add(quarter[i]);
                    if (csatMonthlyList.Count > 0)
                    {
                        var monthlyDataList = csatMonthlyList.Where(t => t.YEAR_QUARTER == quarter[i]).ToList();
                        initiatedmonthly = monthlyDataList.Count(t => t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT" || t.STATUS == "COMPLETED");
                        respondedmonthly = monthlyDataList.Count(t => t.STATUS == "COMPLETED");
                    }
                    var quarterDataList = csatList.Where(t => t.YEAR_QUARTER == quarter[i]).ToList();
                    initiated.Add(quarterDataList.Count(t => t.STATUS == "MAIL SENT" || t.STATUS == "MAIL RE-SENT" || t.STATUS == "COMPLETED") + initiatedmonthly);
                    responded.Add(quarterDataList.Count(t => t.STATUS == "COMPLETED") + respondedmonthly);
                    percentageofRespondents.Add(GetSurveyPercentage(responded[i], initiated[i]));

                }
            }

            charts.title.text = "Customer Success Survey - Initiated Vs Responded";
            charts.yAxis = new yAxisOnlyWithTitle();
            charts.plotOptions.series.dataLabels.enabled = true;

            charts.series.Add(new seriesItem("Initiated", "#FB8F73", "column", initiated) { });

            charts.series.Add(new seriesItem("Responded", "#FFFF9D", "column", responded) { });

            charts.series.Add(new seriesItem("% of Respondents", "#737373", "line", percentageofRespondents) { });
            FillResponseTime(watch);
            return Ok(charts);
        }

        [POST("GetHeatMapForCSATPeriod")]
        [ActionName("GetHeatMapForCSATPeriod")]
        [HttpPost]
        public IHttpActionResult GetHeatMapForCSATPeriod([FromBody] CSATInsightsInputHolder csatInsightsInput)
        {
            LogRequest(prefix: "GetHeatMapForCSATPeriod", content: JsonConvert.SerializeObject(csatInsightsInput));
            if (csatInsightsInput == null)
            {
                return BadRequest("Request is empty");
            }
            if (csatInsightsInput.START_DATE <= DateTime.MinValue)
            {
                return BadRequest("Invalid Start date: " + csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"));
            }
            if (csatInsightsInput.END_DATE <= DateTime.MinValue)
            {
                return BadRequest("Invalid End date: " + csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"));
            }
            if (csatInsightsInput.CUSTOMER_IDS == "" || csatInsightsInput.CUSTOMER_IDS == null)
            {
                return BadRequest("Please choose Customer");
            }
            if (csatInsightsInput.CSM_IDS == "" || csatInsightsInput.CSM_IDS == null)
            {
                return BadRequest("Please choose CSM");
            }
            var csatdata = CSPdb.AppRepo.GetCSSTableForPeriod1(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS, csatInsightsInput.CSM_IDS, csatInsightsInput.FREQUENCY ?? "both");
            var absoluteUrl = helper.GetAbsoulteUri();
            foreach (var item in csatdata)
            {
                if (!string.IsNullOrWhiteSpace(item.URL))
                    item.URL = item.URL.Replace("{SUBSTITUE_URL}", absoluteUrl);
                if (!string.IsNullOrWhiteSpace(item.ActionplanURL))
                    item.ActionplanURL = item.ActionplanURL.Replace("{SUBSTITUE_URL}", absoluteUrl);
            }
            return Ok(csatdata);
        }

        [GET("GetBusinessUnits")]
        [ActionName("GetBusinessUnits")]
        [HttpGet]
        public IHttpActionResult GetBusinessUnits()
        {
            var businessUnits = Cldb.PROJECT.GetAll().Where(x => !string.IsNullOrEmpty(x.PROJ_STATUS) && x.PROJ_STATUS != "Close" && x.BUSINESS_UNIT != null)
                                                      .Select(x => new { CUST_ID = x.CUST_ID, BUSINESS_UNIT = x.BUSINESS_UNIT }).Distinct().ToList();
            return Ok(businessUnits);
        }
        private List<string> FilterDataByFrequency(string frequency, IEnumerable<iYearQuarter> csatList)
        {

            var yearQuarters = csatList.Select(x => x.YEAR_QUARTER).ToList();
            var sorter = new QuarterSorter();
            if (frequency.ToLower() == "halfyearly" || frequency.ToLower() == "half-yearly" || frequency.ToLower() == "quarterly" || frequency.ToLower() == "annual")
            {
                var filter = frequency.ToLower() == "quarterly" ? "Q" : frequency.ToLower() == "annual" ? "A" : "H";
                return yearQuarters.Where(q => q.ToUpper().StartsWith(filter)).Distinct().OrderBy(t => t, sorter).ToList();
            }
            return yearQuarters.Distinct().OrderBy(t => t, sorter).ToList();
        }

        [POST("GetResponseCategoryData")]
        [ActionName("GetResponseCategoryData")]
        [HttpPost]
        public IHttpActionResult GetResponseCategoryData([FromBody] CSATInsightsInputHolder csatInsightsInput)
        {
            LogRequest(prefix: "GetResponseCategoryData");

            var watch = Stopwatch.StartNew();
            if (csatInsightsInput == null)
            {
                return BadRequest("Request is empty");
            }
            if (string.IsNullOrWhiteSpace(csatInsightsInput.CUSTOMER_IDS))
            {
                return BadRequest("Please select any Customer");
            }

            var csatdata = CSPdb.AppRepo.GetCSSTableForPeriod(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS);

            var csat = new List<PROJECT_CSAT_DATA>();

            var quarter = new List<string>();

            if (csatdata != null)
            {

                quarter = FilterDataByFrequency(csatInsightsInput.FREQUENCY, csatdata);
            }

            if (quarter.Count == 0)
            {
                return Ok();
            }

            var charts = new HighChartsColumn();

            charts.title.text = "Response Category ( % )";
            charts.yAxis = new yAxisOnlyWithTitle();
            charts.plotOptions.series.dataLabels.enabled = true;
            var detractors = new List<decimal>();
            var passives = new List<decimal>();
            var promoters = new List<decimal>();
            var npsScore = new List<decimal>();

            for (int i = 0; i < quarter.Count; i++)
            {
                charts.xAxis.categories.Add(quarter[i]);
                detractors.Add(GetScoreInPercentage(csatdata.Count(t => t.NPS_SCORE <= 6 && t.YEAR_QUARTER == quarter[i]), csatdata.Count(t => t.YEAR_QUARTER == quarter[i])));
                passives.Add(GetScoreInPercentage(csatdata.Count(t => (t.NPS_SCORE == 7 || t.NPS_SCORE == 8) && t.YEAR_QUARTER == quarter[i]), csatdata.Count(t => t.YEAR_QUARTER == quarter[i])));
                promoters.Add(GetScoreInPercentage(csatdata.Count(t => t.NPS_SCORE >= 9 && t.YEAR_QUARTER == quarter[i]), csatdata.Count(t => t.YEAR_QUARTER == quarter[i])));
                npsScore.Add(GetNPSScoreData(csatdata.Count(t => t.NPS_SCORE >= 9 && t.YEAR_QUARTER == quarter[i]), csatdata.Count(t => t.NPS_SCORE <= 6 && t.YEAR_QUARTER == quarter[i]), csatdata.Count(t => t.YEAR_QUARTER == quarter[i])));
            }

            charts.series.Add(new seriesItem("Detractors ( in % )", "#FB8F73", "column", detractors) { });

            charts.series.Add(new seriesItem("Passives ( in % )", "#FFFF9D", "column", passives) { });

            charts.series.Add(new seriesItem("Promoters ( in % )", "#CAEE97", "column", promoters) { });

            charts.series.Add(new seriesItem("NPScore", "#737373", "line", npsScore) { });
            FillResponseTime(watch);
            return Ok(charts);

        }


        private decimal GetScoreInPercentage(int promoters, int totalReponse)
        {
            if (totalReponse != 0)
            {
                decimal para1 = Decimal.Divide(promoters, totalReponse);

                decimal result = (para1 * 100);
                return Math.Round(result);
            }
            else
                return 0;
        }

        [POST("GetCSSViewDetails")]
        [ActionName("GetCSSViewDetails")]
        [HttpPost]
        public IHttpActionResult GetCSSViewDetails([FromBody] CSATInsightsInputHolder csatInsightsInput)
        {
            LogRequest(prefix: "GetCSSViewDetails");
            var watch = Stopwatch.StartNew();
            if (csatInsightsInput == null)
            {
                return BadRequest("Request is empty");
            }

            if (csatInsightsInput.FREQUENCY == "Monthly")
            {
                return Ok(GetCSSViewDetailsForMonthly(csatInsightsInput));
            }

            var keyList = new List<string>() { "CSAT_INSIGHTS_RESPONSE_PERCENTAGE_LOWER_THRESHOLD", "CSAT_INSIGHTS_RESPONSE_PERCENTAGE_HIGHER_THRESHOLD" };

            var responsePercentageThresholdValues = helper.GetDBConfig(keyList, "-1");

            var cssDetails = CSPdb.AppRepo.GetCSSViewDetails(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS);
            var viewCssDataBinding = new List<CSATViewDetailsInputHolder>();
            if (cssDetails.Count == 0)
            {
                return Ok();
            }

            var customerListWithoutType = cssDetails.Select(x => new { CUST_ID = x.CUST_ID, CUST_NM = x.CUST_NM }).Distinct().ToList();

            var customerList = customerListWithoutType.Select(x => new CustomerBase { CUST_ID = x.CUST_ID, CUST_NM = x.CUST_NM }).ToList();

            var batchCustomerIdList = cssDetails.Where(x => x.BATCH_CUSTOMER_ID.HasValue).Select(x => x.BATCH_CUSTOMER_ID.Value).Distinct().ToList();

            var batchCustomerMonthlyList = cssDetails.Where(x => x.BATCH_CUSTOMER_MONTHLIY_ID.HasValue).Select(x => x.BATCH_CUSTOMER_MONTHLIY_ID.Value).Distinct().ToList();

            var actionItemList = CSPdb.PROJECT_ACTIONITEM.GetAll().Where(x => x.SOURCE == "CSS" && x.ISACTIVE && (batchCustomerIdList.Contains(x.BATCH_CUSTOMER_ID.Value) || batchCustomerMonthlyList.Contains(x.BATCH_CUSTOMER_MONTHLY_ID.Value))).ToList();

            var quarterList = cssDetails.Select(x => x.YEAR_QUARTER).Distinct().ToList();

            var quarterText = quarterList.Count == 1 ? quarterList.Last().Substring(0, 2) : $"{ quarterList.First().Substring(0, 2)} to { quarterList.Last().Substring(0, 2)}";

            var ratings = GetQuestionRatings(batchCustomerIdList, batchCustomerMonthlyList);//dump data

            var completedStatusForActionItem = new List<string> { "Completed", "Closed" };

            var notCompletedStatusForActionItem = new List<string> { "In Progress" };

            foreach (var customer in customerList)
            {
                var getCustomerIdListForQuarterlyandMonthly = GetBatchCustomerIdListForQuarterlyAndMonthly(customer.CUST_ID, "", cssDetails, false);

                var csssurveyStatus = cssDetails.Where(x => x.CUST_ID == customer.CUST_ID).Select(x => new { CUST_ID = x.CUST_ID, proj_Id = x.PROJ_ID, RESPONDED_NAME = x.CONTACT_NAME, SURVEY_STATUS = x.SURVEY_STATUS, URL_FOR_CUSTOMER = x.SURVEY_FEEDBACK_URL_FOR_CUSTOMER, YEAR_QUARTER = x.YEAR_QUARTER, RATING_QUARTER = x.RATING_QUARTER }).Distinct().ToList();

                var projectListForCustomer = cssDetails.Where(x => x.CUST_ID == customer.CUST_ID).Select(x => new { proj_Id = x.PROJ_ID, proj_NM = x.PROJ_NM, RESPONDED_NAME = x.CONTACT_NAME, DISPLAY_TEXT = x.DISPLAY_TEXT }).Distinct().ToList(); // , SURVEY_STATUS = x.SURVEY_STATUS  BATCH_CUSTOMER_ID = x.BATCH_CUSTOMER_ID, BATCH_CUSTOMER_MONTHLY_ID = x.BATCH_CUSTOMER_MONTHLIY_ID 

                var cssCustomerData = new CSATViewDetailsInputHolder();
                cssCustomerData.CUST_ID = customer.CUST_ID;
                cssCustomerData.CUST_NM = customer.CUST_NM;
                cssCustomerData.NO_OF_SURVEY_INITIATED_RESPONDED_FOR_CUSTOMER = $"{csssurveyStatus.Count(x => x.SURVEY_STATUS == "COMPLETED")} / {csssurveyStatus.Count}";
                cssCustomerData.ACTION_PLAN_FOR_CUSTOMER = GetActionPlan(customer.CUST_ID, "", actionItemList, getCustomerIdListForQuarterlyandMonthly, true);
                cssCustomerData.SURVEY_FEEDBACK_URL_FOR_CUSTOMER = csssurveyStatus.OrderByDescending(x => x.YEAR_QUARTER).FirstOrDefault(x => x.RATING_QUARTER != null)?.URL_FOR_CUSTOMER;

                var projectDataList = new List<CSATViewDetailsProjectWise>();
                var frequencyDataForCustomer = new List<FrequencyWiseData>();

                foreach (var quarter in quarterList)
                {
                    var frequencyDataItem = new FrequencyWiseData();
                    getCustomerIdListForQuarterlyandMonthly = GetBatchCustomerIdListForQuarterlyAndMonthly(cssCustomerData.CUST_ID, quarter, cssDetails, true);
                    var rating = GetCSSRatingPercentage(cssCustomerData.CUST_ID, ratings, quarter, cssDetails, getCustomerIdListForQuarterlyandMonthly);

                    var actionItem = actionItemList.Where(x => x.BATCH_CUSTOMER_ID != null && getCustomerIdListForQuarterlyandMonthly.Item1.Contains(x.BATCH_CUSTOMER_ID.Value)).ToList();

                    frequencyDataItem.RATING = csssurveyStatus.Count(x => x.SURVEY_STATUS == "COMPLETED") > 0 ? $"{rating} %" : string.Empty;
                    frequencyDataItem.COLOR = GetColorCode(rating, responsePercentageThresholdValues);
                    frequencyDataItem.ACTION_PLAN_SUBMITTED_COUNT = actionItem.Count(x => completedStatusForActionItem.Contains(x.STATUS));
                    frequencyDataItem.ACTION_PLAN_NOT_SUBMITTED_COUNT = actionItem.Count(x => x.TARGET_DATE.Value <= DateTime.Today.AddDays(1) && notCompletedStatusForActionItem.Contains(x.STATUS));
                    frequencyDataForCustomer.Add(frequencyDataItem);
                }


                foreach (var proj in projectListForCustomer)
                {
                    var projectcssDetails = cssDetails.Where(x => x.PROJ_ID == proj.proj_Id && x.CONTACT_NAME == proj.RESPONDED_NAME).ToList();

                    var getBatchCustomerIdListQuarterlyAndMonthlyForProject = GetBatchCustomerIdListQuarterlyAndMonthlyForProject(projectcssDetails);

                    var cssprojectDetails = new CSATViewDetailsProjectWise();
                    cssprojectDetails.PROJ_ID = proj.proj_Id;
                    cssprojectDetails.PROJ_NM = proj.proj_NM;
                    cssprojectDetails.DISPLAY_TEXT = proj.DISPLAY_TEXT;
                    var surveyInitiatedResponded = new List<string>();

                    var frequencyDataForProject = new List<FrequencyWiseData>();

                    foreach (var quarter in quarterList)
                    {
                        var frequencyDataItem = new FrequencyWiseData();
                        var getUniqueProjectRec = projectcssDetails.Where(x => x.YEAR_QUARTER == quarter).Select(x => new { RESPONDENT_NAME = x.CONTACT_NAME, PROJECT_ID = x.PROJ_ID, STATUS = x.SURVEY_STATUS, RATING = x.RATING_QUARTER, BATCH_CUSTOMER_ID = x.BATCH_CUSTOMER_ID, BATCH_CUSTOMER_MONTHLY_ID = x.BATCH_CUSTOMER_MONTHLIY_ID }).Distinct().ToList();

                        if (getUniqueProjectRec.Count > 0)
                        {
                            var actionItem = actionItemList.Where(x => x.BATCH_CUSTOMER_ID.HasValue && x.BATCH_CUSTOMER_ID == getUniqueProjectRec.First().BATCH_CUSTOMER_ID).ToList();

                            frequencyDataItem.RATING = string.Join(" ", getUniqueProjectRec.Select(x => x.RATING));
                            frequencyDataItem.ACTION_PLAN_SUBMITTED_COUNT = actionItem.Count(x => completedStatusForActionItem.Contains(x.STATUS));
                            frequencyDataItem.ACTION_PLAN_NOT_SUBMITTED_COUNT = actionItem.Count(x => x.TARGET_DATE.Value <= DateTime.Today.AddDays(1) && notCompletedStatusForActionItem.Contains(x.STATUS));

                        }
                        frequencyDataForProject.Add(frequencyDataItem);

                    }
                    surveyInitiatedResponded.Add($"{projectcssDetails.Count(x => x.SURVEY_STATUS == "COMPLETED")} / {projectcssDetails.Count}");
                    cssprojectDetails.FREQUENCY_WISE_DATA_FOR_PROJECT = frequencyDataForProject;
                    cssprojectDetails.NO_OF_SURVEY_INITIATED_RESPONDED = surveyInitiatedResponded;
                    cssprojectDetails.URL = projectcssDetails.OrderByDescending(x => x.YEAR_QUARTER).FirstOrDefault(x => x.RATING_QUARTER != null)?.URL;
                    cssprojectDetails.ACTION_PLAN = GetActionPlan(customer.CUST_ID, proj.proj_Id, actionItemList, getBatchCustomerIdListQuarterlyAndMonthlyForProject, false);
                    projectDataList.Add(cssprojectDetails);
                }
                cssCustomerData.PROJECT_CSS_DETAILS = projectDataList;
                cssCustomerData.FREQUENCY_WISE_DATA_FOR_CUSTOMER = frequencyDataForCustomer;
                cssCustomerData.ISEXPANDED = false;
                viewCssDataBinding.Add(cssCustomerData);
            }

            var customerDataQuarterWise = new CSATViewDetails();
            customerDataQuarterWise.CUSTOMER_LIST = customerList;
            customerDataQuarterWise.FREQUENCY_LIST = quarterList;
            customerDataQuarterWise.CSAT_DETAILS = viewCssDataBinding;
            customerDataQuarterWise.FREQUENCY_TEXT = quarterText;
            FillResponseTime(watch);
            return Ok(customerDataQuarterWise);
        }


        [POST("GetQuestionWiseRatingForCSATInsight")]
        [ActionName("GetQuestionWiseRatingForCSATInsight")]
        [HttpPost]
        public IHttpActionResult GetQuestionWiseRatingForCSATInsight([FromBody] CSATInsightsInputHolder csatInsightsInput)
        {
            LogRequest(prefix: "GetQuestionWiseRatingForCSATInsight");

            if (csatInsightsInput == null)
            {
                return BadRequest("Request is empty");
            }

            var chartList = new List<HighChartsColumn>();

            var shouldLoadTrendWiseData = false;

            bool.TryParse(GetHeaderDetails_String("shouldLoadTrendWiseData"), out shouldLoadTrendWiseData);

            if (csatInsightsInput.FREQUENCY == "Monthly")
            {
                return Ok(GetMonthlyQuestionWiseRatingForCSATInsight(csatInsightsInput));
            }

            else
            {
                var questionsRating = CSPdb.AppRepo.GetCSSQuestionRatings(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS);

                if (questionsRating.Count == 0)
                {
                    return Ok();
                }

                var questionList = questionsRating.Select(x => x.QUESTION).Distinct().ToList();
                var sorter = new QuarterSorter();

                var quarterList = questionsRating.Select(x => x.YEAR_QUARTER).Distinct().OrderBy(x => x, sorter).ToList();

                var quarterText = quarterList.Count == 1 ? $"{quarterList.Last().Substring(0, 2)} {quarterList.Last().Substring(2, quarterList.Last().Length - 2)}" : $"{ quarterList.First().Substring(0, 2)} to {quarterList.Last().Substring(0, 2)} {quarterList.Last().Substring(2, quarterList.Last().Length - 2)}";

                foreach (var question in questionList)
                {
                    var charts = new HighChartsColumn();

                    charts.title.text = question;
                    charts.yAxis = new yAxisOnlyWithTitle();
                    charts.yAxis.title = new title() { text = "No of Response" };
                    charts.plotOptions.series.dataLabels.enabled = true;
                    var one = new List<decimal>();
                    var two = new List<decimal>();
                    var three = new List<decimal>();
                    var four = new List<decimal>();
                    var five = new List<decimal>();
                    var fourAndFiveRatingPercentage = new List<decimal>();

                    if (shouldLoadTrendWiseData)
                    {
                        foreach (var quarter in quarterList)
                        {
                            charts.xAxis.categories.Add(quarter);
                            var questionRating = questionsRating.Where(x => x.QUESTION == question && x.YEAR_QUARTER == quarter).ToList();
                            one.Add(questionRating.Count(x => x.RATING == 1));
                            two.Add(questionRating.Count(x => x.RATING == 2));
                            three.Add(questionRating.Count(x => x.RATING == 3));
                            four.Add(questionRating.Count(x => x.RATING == 4));
                            five.Add(questionRating.Count(x => x.RATING == 5));
                            fourAndFiveRatingPercentage.Add(GetSurveyPercentage(questionRating.Count(x => x.RATING == 5 || x.RATING == 4), questionRating.Count));

                        }
                    }

                    else
                    {
                        charts.xAxis.categories = new List<string>() { quarterText };

                        var questionRating = questionsRating.Where(x => x.QUESTION == question).ToList();

                        one.Add(questionRating.Count(x => x.RATING == 1));
                        two.Add(questionRating.Count(x => x.RATING == 2));
                        three.Add(questionRating.Count(x => x.RATING == 3));
                        four.Add(questionRating.Count(x => x.RATING == 4));
                        five.Add(questionRating.Count(x => x.RATING == 5));
                        fourAndFiveRatingPercentage.Add(GetSurveyPercentage(questionRating.Count(x => x.RATING == 5 || x.RATING == 4), questionRating.Count));

                    }


                    charts.series.Add(new seriesItem("1", "#FB8F73", "column", one) { });

                    charts.series.Add(new seriesItem("2", "#f44336", "column", two) { });

                    charts.series.Add(new seriesItem("3", "#59a3fd", "column", three) { });

                    charts.series.Add(new seriesItem("4", "#FFFF9D", "column", four) { });

                    charts.series.Add(new seriesItem("5", "#CAEE97", "column", five) { });

                    charts.series.Add(new seriesItem("% of 4 and 5 Ratings", "#737373", "line", fourAndFiveRatingPercentage) { });

                    chartList.Add(charts);

                }
            }
            return Ok(chartList);
        }


        private ActionPlanDetails GetActionPlan(string cust_Id, string projectId, List<PROJECT_ACTIONITEM> actionItemList, Tuple<List<int>, List<int>> batchCustomerIdListForQuartelyAndMonthly, bool isForCustomer)
        {
            var requestDomain = helper.GetAbsoulteUri();
            var path = "layout/actionitems";

            var actionItemForProject = actionItemList.Where(x => x.BATCH_CUSTOMER_ID.HasValue && batchCustomerIdListForQuartelyAndMonthly.Item1.Contains(x.BATCH_CUSTOMER_ID.Value) || (x.BATCH_CUSTOMER_MONTHLY_ID.HasValue && batchCustomerIdListForQuartelyAndMonthly.Item2.Contains(x.BATCH_CUSTOMER_MONTHLY_ID.Value))).ToList();

            var actionPlanDetails = new ActionPlanDetails();
            if (!isForCustomer)
                actionPlanDetails.ACTION_ITEM_URL = $"{requestDomain}/{path}/{cust_Id}/{projectId}/true";
            else
                actionPlanDetails.ACTION_ITEM_URL = $"{requestDomain}/{path}/{cust_Id}/true";

            var completedStatusForActionItem = new List<string> { "Completed", "Closed" };

            var notCompletedStatusForActionItem = new List<string> { "In Progress" };

            var completedActionItemsForProject = actionItemForProject.Where(x => completedStatusForActionItem.Contains(x.STATUS)).ToList();

            var notCompletedActionItemsForProject = actionItemForProject.Where(x => x.TARGET_DATE.Value <= DateTime.Today.AddDays(1) && notCompletedStatusForActionItem.Contains(x.STATUS)).ToList();

            if (actionItemForProject.Count == completedActionItemsForProject.Count)
            {
                actionPlanDetails.COUNT = completedActionItemsForProject.Count;
                actionPlanDetails.COLOR = COLOR_GREEN;

            }
            else if (actionItemForProject.Count == notCompletedActionItemsForProject.Count)
            {
                actionPlanDetails.COUNT = notCompletedActionItemsForProject.Count;
                actionPlanDetails.COLOR = COLOR_RED;

            }
            else if (notCompletedActionItemsForProject.Count < actionItemForProject.Count)
            {
                actionPlanDetails.COUNT = notCompletedActionItemsForProject.Count;
                actionPlanDetails.COLOR = COLOR_AMBER;

            }

            return actionPlanDetails;

        }
        private decimal GetSurveyPercentage(decimal x, decimal y)
        {
            decimal m;
            // decimal n;
            if (y != 0)
            {
                m = decimal.Divide(x, y);
                return Math.Round(m * 100);
            }
            else
                return m = 0;

        }

        private string GetColorCode(decimal rating, List<int> ratingThresholdList)
        {
            var colorCode = string.Empty;

            if (rating <= ratingThresholdList[0])
                colorCode = COLOR_RED;
            else if (rating >= ratingThresholdList[1])
                colorCode = COLOR_GREEN;
            else
                colorCode = COLOR_AMBER;

            return colorCode;


        }

        private CSATViewDetails GetCSSViewDetailsForMonthly(CSATInsightsInputHolder csatInsightsInput)
        {
            LogRequest(prefix: "GetCSSViewDetails");

            var customerDataMonthWise = new CSATViewDetails();

            var cssDetailsForMonthly = CSPdb.AppRepo.GetCSSViewDetailsForMonthly(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS);
            var viewCssDataBinding = new List<CSATViewDetailsInputHolder>();
            if (cssDetailsForMonthly.Count == 0)
            {
                return customerDataMonthWise;
            }

            var customerList1 = cssDetailsForMonthly.Select(x => new { CUST_ID = x.CUST_ID, CUST_NM = x.CUST_NM }).Distinct().ToList();

            var customerList = customerList1.Select(x => new CustomerBase { CUST_ID = x.CUST_ID, CUST_NM = x.CUST_NM }).ToList();

            var monthList = cssDetailsForMonthly.Select(x => x.YEAR_MONTH).Distinct().ToList();

            var monthText = monthList.Count == 1 ? monthList.Last().Substring(0, 3) : $"{ monthList.First().Substring(0, 3)} to { monthList.Last().Substring(0, 3)}";

            var batchCustomerIdList = cssDetailsForMonthly.Where(x => x.BATCH_CUSTOMER_ID.HasValue).Select(x => x.BATCH_CUSTOMER_ID.Value).Distinct().ToList();

            var batchCustomerMonthlyList = cssDetailsForMonthly.Where(x => x.BATCH_CUSTOMER_MONTHLIY_ID.HasValue).Select(x => x.BATCH_CUSTOMER_MONTHLIY_ID.Value).Distinct().ToList();

            var ratings = GetQuestionRatings(batchCustomerIdList, batchCustomerMonthlyList);//dump data

            foreach (var customer in customerList)
            {
                var csssurveyStatus = cssDetailsForMonthly.Where(x => x.CUST_ID == customer.CUST_ID).Select(x => new { CUST_ID = x.CUST_ID, RESPONDED_NAME = x.CONTACT_NAME, SURVEY_STATUS = x.SURVEY_STATUS, URL_FOR_CUSTOMER = x.SURVEY_FEEDBACK_URL_FOR_CUSTOMER, YEAR_QUARTER = x.YEAR_QUARTER, RATING_QUARTER = x.RATING_QUARTER }).Distinct().ToList();

                var projectListForCustomer = cssDetailsForMonthly.Where(x => x.CUST_ID == customer.CUST_ID).Select(x => new { RESPONDED_NAME = x.CONTACT_NAME, DISPLAY_TEXT = x.DISPLAY_TEXT }).Distinct().ToList(); //BATCH_CUSTOMER_ID = x.BATCH_CUSTOMER_ID, BATCH_CUSTOMER_MONTHLY_ID = x.BATCH_CUSTOMER_MONTHLIY_ID 
                var cssCustomerData = new CSATViewDetailsInputHolder();
                cssCustomerData.CUST_ID = customer.CUST_ID;
                cssCustomerData.CUST_NM = customer.CUST_NM;
                cssCustomerData.NO_OF_SURVEY_INITIATED_RESPONDED_FOR_CUSTOMER = $"{csssurveyStatus.Count(x => x.SURVEY_STATUS == "COMPLETED")} / {csssurveyStatus.Count}";
                //cssCustomerData.ACTION_PLAN_FOR_CUSTOMER = GetActionPlan(customer.CUST_ID, "", actionItemList, getCustomerIdListForQuarterlyandMonthly, true);
                cssCustomerData.SURVEY_FEEDBACK_URL_FOR_CUSTOMER = csssurveyStatus.OrderByDescending(x => x.YEAR_QUARTER).FirstOrDefault(x => x.RATING_QUARTER != null)?.URL_FOR_CUSTOMER;


                var projectDataList = new List<CSATViewDetailsProjectWise>();
                foreach (var proj in projectListForCustomer)
                {
                    var projectcssDetails = cssDetailsForMonthly.Where(x => x.CONTACT_NAME == proj.RESPONDED_NAME).ToList();

                    var cssprojectDetails = new CSATViewDetailsProjectWise();
                    cssprojectDetails.PROJ_NM = proj.RESPONDED_NAME;
                    cssprojectDetails.DISPLAY_TEXT = proj.DISPLAY_TEXT;

                    var monthWiseRatingForProject = new List<string>();
                    var surveyInitiatedResponded = new List<string>();

                    var frequencyData = new List<FrequencyWiseData>();

                    foreach (var month in monthList)
                    {
                        var getUniqueProjectRec = projectcssDetails.Where(x => x.YEAR_MONTH == month).Select(x => new { RESPONDENT_NAME = x.CONTACT_NAME, PROJECT_ID = x.PROJ_ID, STATUS = x.SURVEY_STATUS, RATING = x.RATING_QUARTER }).Distinct().ToList();
                        if (getUniqueProjectRec.Count > 0)
                        {

                            var frequencyDataItem = new FrequencyWiseData();
                            frequencyDataItem.RATING = string.Join(" ", getUniqueProjectRec.Select(x => x.RATING));
                            frequencyData.Add(frequencyDataItem);
                        }
                        else
                        {
                            monthWiseRatingForProject.Add(string.Empty);
                        }

                    }
                    surveyInitiatedResponded.Add($"{projectcssDetails.Count(x => x.SURVEY_STATUS == "COMPLETED")} / {projectcssDetails.Count}");
                    cssprojectDetails.FREQUENCY_WISE_DATA_FOR_PROJECT = frequencyData;
                    cssprojectDetails.NO_OF_SURVEY_INITIATED_RESPONDED = surveyInitiatedResponded;
                    cssprojectDetails.URL = projectcssDetails.OrderByDescending(x => x.YEAR_QUARTER).FirstOrDefault(x => x.RATING_QUARTER != null)?.URL;
                    projectDataList.Add(cssprojectDetails);
                }
                cssCustomerData.PROJECT_CSS_DETAILS = projectDataList;
                viewCssDataBinding.Add(cssCustomerData);
            }
            customerDataMonthWise.CUSTOMER_LIST = customerList;
            customerDataMonthWise.FREQUENCY_LIST = monthList;
            customerDataMonthWise.CSAT_DETAILS = viewCssDataBinding;
            customerDataMonthWise.FREQUENCY_TEXT = monthText;

            return customerDataMonthWise;
        }


        private List<CSS_QUESTION_REPLIES> GetQuestionRatings(List<int> batchCustomerIdList, List<int> batchCustomerMonthlyIdList)
        {
            var ratingsForCustomer = CSPdb.CSS_QUESTION_REPLIES.GetAll().Where(x => batchCustomerIdList.Contains(x.BATCH_CUSTOMER_ID) || batchCustomerMonthlyIdList.Contains(x.BATCH_CUSTOMER_MONTHLY_ID) && x.ISACTIVE)?.ToList();
            return ratingsForCustomer;
        }

        private decimal GetCSSRatingPercentage(string custId, List<CSS_QUESTION_REPLIES> rating, string quarter, List<CSS_VIEW_DETAILS> cssDetails, Tuple<List<int>, List<int>> getCustomerIdListForQuarterlyandMonthly)
        {

            //var getCustomerIdListForQuarterlyandMonthly = GetBatchCustomerIdListForQuarterlyAndMonthly(custId, quarter, cssDetails, true);

            var cssRating = rating.Where(x => x.ISACTIVE && x.QUESTION_CATEGORY == "Criteria" && (getCustomerIdListForQuarterlyandMonthly.Item1.Contains(x.BATCH_CUSTOMER_ID) || getCustomerIdListForQuarterlyandMonthly.Item2.Contains(x.BATCH_CUSTOMER_MONTHLY_ID))).ToList();

            var totalRating = cssRating.Count;

            var fourAndFiveRating = cssRating.Count(x => x.RATING == 4 || x.RATING == 5);

            //var lessthanequaltoThreeRating = cssRating.Count(x => x.RATING <= 3);

            var ratingPercentage = GetSurveyPercentage(fourAndFiveRating, totalRating);

            return ratingPercentage;
        }

        private Tuple<List<int>, List<int>> GetBatchCustomerIdListForQuarterlyAndMonthly(string custId, string quarter, List<CSS_VIEW_DETAILS> cssDetails, bool isForQuarter)
        {

            var quarterDataForCustomer = new List<CSS_VIEW_DETAILS>();
            var batchIdListForQuarter = new List<int>();
            var batchMonthlyIdListForQuarter = new List<int>();



            if (isForQuarter)
            {
                quarterDataForCustomer = cssDetails.Where(x => x.YEAR_QUARTER == quarter && x.CUST_ID == custId).ToList();

                batchIdListForQuarter = quarterDataForCustomer.Where(x => x.BATCH_CUSTOMER_ID.HasValue).Select(x => x.BATCH_CUSTOMER_ID.Value).ToList();

                batchMonthlyIdListForQuarter = quarterDataForCustomer.Where(x => x.BATCH_CUSTOMER_MONTHLIY_ID.HasValue).Select(x => x.BATCH_CUSTOMER_MONTHLIY_ID.Value).ToList();

            }
            else
            {
                quarterDataForCustomer = cssDetails.Where(x => x.CUST_ID == custId).ToList();

                batchIdListForQuarter = quarterDataForCustomer.Where(x => x.BATCH_CUSTOMER_ID.HasValue).Select(x => x.BATCH_CUSTOMER_ID.Value).ToList();

                batchMonthlyIdListForQuarter = quarterDataForCustomer.Where(x => x.BATCH_CUSTOMER_MONTHLIY_ID.HasValue).Select(x => x.BATCH_CUSTOMER_MONTHLIY_ID.Value).ToList();

            }

            return new Tuple<List<int>, List<int>>(batchIdListForQuarter, batchMonthlyIdListForQuarter);
        }

        private Tuple<List<int>, List<int>> GetBatchCustomerIdListQuarterlyAndMonthlyForProject(List<CSS_VIEW_DETAILS> projectcssDetails)
        {

            var quarterDataForCustomer = new List<CSS_VIEW_DETAILS>();
            var batchIdListForProject = new List<int>();
            var batchMonthlyIdListForProject = new List<int>();

            batchIdListForProject = projectcssDetails.Where(x => x.BATCH_CUSTOMER_ID.HasValue).Select(x => x.BATCH_CUSTOMER_ID.Value).ToList();

            batchMonthlyIdListForProject = projectcssDetails.Where(x => x.BATCH_CUSTOMER_MONTHLIY_ID.HasValue).Select(x => x.BATCH_CUSTOMER_MONTHLIY_ID.Value).ToList();

            return new Tuple<List<int>, List<int>>(batchIdListForProject, batchMonthlyIdListForProject);
        }

        private Tuple<List<HighChartsColumn>, List<HighChartsColumn>> GetMonthlyQuestionWiseRatingForCSATInsight(CSATInsightsInputHolder csatInsightsInput)
        {
            var questionsRatingList = new List<CSS_QUESTION_RATINGS_MONTHLY>();
            var chartListForLeaders = new List<HighChartsColumn>();
            var chartListForManagers = new List<HighChartsColumn>();
            var questionModelIdForLeader = 0;
            var questionModelIdForManager = 0;
            var custIds = csatInsightsInput.CUSTOMER_IDS.Split(',');
            var questionModelIds = Cldb.CONFIGURATION_EXT.GetAll().Where(x => custIds.Contains(x.CUST_ID) && x.KEY == "CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_1" || x.KEY == "CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_2").ToList();

            int.TryParse(questionModelIds.FirstOrDefault(x => x.KEY == "CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_1")?.VALUE, out questionModelIdForLeader);

            int.TryParse(questionModelIds.FirstOrDefault(x => x.KEY == "CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_2")?.VALUE, out questionModelIdForManager);



            questionsRatingList = CSPdb.AppRepo.GetCSSQuestionRatingsForMonthly(csatInsightsInput.START_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.END_DATE.ToString("yyyy-MM-dd"), csatInsightsInput.CUSTOMER_IDS);

            if (questionsRatingList.Count == 0)
            {
                return new Tuple<List<HighChartsColumn>, List<HighChartsColumn>>(chartListForLeaders, chartListForManagers);
            }
            var questionList = questionsRatingList.Select(x => new { QUESTION = x.QUESTION, QUESTION_MODEL_ID = x.QUESTION_MODEL_ID }).Distinct().ToList();


            foreach (var ques in questionList)
            {

                if (ques.QUESTION_MODEL_ID == questionModelIdForLeader)
                {
                    var chartsForLeader = GetChartBasedOnRole(ques.QUESTION, questionsRatingList, ques.QUESTION_MODEL_ID);
                    chartListForLeaders.Add(chartsForLeader);
                }
                else if (ques.QUESTION_MODEL_ID == questionModelIdForManager)
                {
                    var chartsForLeader = GetChartBasedOnRole(ques.QUESTION, questionsRatingList, ques.QUESTION_MODEL_ID);
                    chartListForLeaders.Add(chartsForLeader);
                }

            }

            return new Tuple<List<HighChartsColumn>, List<HighChartsColumn>>(chartListForLeaders, chartListForManagers);

        }


        private HighChartsColumn GetChartBasedOnRole(string question, List<CSS_QUESTION_RATINGS_MONTHLY> monthlyQuestionRatingList, int QuestionModelId)
        {
            var charts = new HighChartsColumn();

            charts.title.text = question;
            charts.yAxis = new yAxisOnlyWithTitle();
            charts.yAxis.title = new title() { text = "No of Response" };
            charts.plotOptions.series.dataLabels.enabled = true;
            var one = new List<decimal>();
            var two = new List<decimal>();
            var three = new List<decimal>();
            var four = new List<decimal>();
            var five = new List<decimal>();
            var fourAndFiveRatingPercentage = new List<decimal>();

            var monthList = monthlyQuestionRatingList.Select(x => x.YEAR_MONTH).Distinct().ToList();

            var monthText = monthList.Count == 1 ? monthList.Last().Substring(0, 3) : $"{ monthList.First().Substring(0, 3)} to { monthList.Last().Substring(0, 3)}";


            charts.xAxis.categories = new List<string>() { monthText };

            var questionRating = monthlyQuestionRatingList.Where(x => x.QUESTION == question && x.QUESTION_MODEL_ID == QuestionModelId).ToList();

            one.Add(questionRating.Count(x => x.RATING == 1));
            two.Add(questionRating.Count(x => x.QUESTION == question && x.RATING == 2));
            three.Add(questionRating.Count(x => x.QUESTION == question && x.RATING == 3));
            four.Add(questionRating.Count(x => x.QUESTION == question && x.RATING == 4));
            five.Add(questionRating.Count(x => x.QUESTION == question && x.RATING == 5));
            fourAndFiveRatingPercentage.Add(GetSurveyPercentage(questionRating.Count(x => x.RATING == 5 || x.RATING == 4), questionRating.Count));

            charts.series.Add(new seriesItem("1", "#FB8F73", "column", one) { });

            charts.series.Add(new seriesItem("2", "#f44336", "column", two) { });

            charts.series.Add(new seriesItem("3", "#59a3fd", "column", three) { });

            charts.series.Add(new seriesItem("4", "#FFFF9D", "column", four) { });

            charts.series.Add(new seriesItem("5", "#CAEE97", "column", five) { });

            charts.series.Add(new seriesItem("% of 4 and 5 Ratings", "#737373", "line", fourAndFiveRatingPercentage) { });

            return charts;

        }
    }

    internal class QuarterSorter : IComparer<string>
    {
        public int Compare(string x, string y)
        {
            if (x == null || y == null) return 0;
            try
            {
                var xyear = x.Split(' ')[1];
                var xquarter = x.Split(' ')[0];

                var yyear = y.Split(' ')[1];
                var yquarter = y.Split(' ')[0];

                var newX = xyear + xquarter;
                var newY = yyear + yquarter;
                return newX.CompareTo(newY);
            }
            catch
            {
                return x.CompareTo(y);
            }


        }
    }
}