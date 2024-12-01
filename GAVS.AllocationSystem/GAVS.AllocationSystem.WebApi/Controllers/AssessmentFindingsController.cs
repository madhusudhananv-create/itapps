using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.ViewModels;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [GET("GetFindingTypeForAssessmentFindingsQADeck")]
        [ActionName("GetFindingTypeForAssessmentFindingsQADeck")]
        [HttpGet]
        public IHttpActionResult GetFindingTypeForAssessmentFindingsQADeck()
        {
            var findingType = CSPdb.FINDINGSTYPE_VALUES.GetAll().Where(x => x.ISACTIVE);
            return Ok(findingType);

        }

        [GET("GetMandatoryFindingTypeById")]
        [ActionName("GetMandatoryFindingTypeById")]
        [HttpGet]
        public IHttpActionResult GetMandatoryFindingTypeById(int findingTypeId)
        {
            //var findingType = string.Empty;
            var findingsType = CSPdb.FINDINGSTYPE_VALUES.GetAll().Where(x => x.ISACTIVE && x.FINDINGSTYPE_ID == findingTypeId && x.MANDATORYTYPE_FOR_FAILED_STATUS).Select(x => x.FINDINGTYPE_VALUE).ToList();                
            return Ok(findingsType);
        }

        [POST("GetAssessmentFindingChartData")]
        [ActionName("GetAssessmentFindingChartData")]
        [HttpPost]
        public IHttpActionResult GetAssessmentFindingChartData([FromBody] QAGovernanceDashboardInputHolder qagovernanceInput)
        {
            LogRequest(prefix: "GetAssessmentFindingChartData");

            if (qagovernanceInput == null)
            {
                return BadRequest("Request is invalid");
            }

            if (qagovernanceInput.CHART_TITLE == string.Empty)
            {
                return BadRequest("Chart Title should not be empty");
            }

            var findingChartData = CSPdb.AppRepo.GetAssessmentFindingsData(qagovernanceInput.START_DATE.ToString("yyyy-MM-dd"), qagovernanceInput.END_DATE.ToString("yyyy-MM-dd"), qagovernanceInput.CUSTOMER_IDS);

            var nonSkipedProjectList = new List<ASSESSMENT_FINDINGS>();

            if (findingChartData.Count == 0)
            {
                return Ok();
            }

            var skipedProjectList = GetSkipedMLAssessmentProjectList();
            nonSkipedProjectList = findingChartData.Where(x => !skipedProjectList.Contains(x.PROJ_ID)).ToList();
            var findingDataBasedOnAge = GetFindingDataBasedOnAge(nonSkipedProjectList, qagovernanceInput);

            var charts = new HighChartsColumn();

            charts.title.text = qagovernanceInput.CHART_TITLE;
            charts.yAxis = new yAxisOnlyWithTitle();
            charts.yAxis.title = new title() { text = qagovernanceInput.YAXIS };
            charts.plotOptions.series.dataLabels.enabled = true;
            charts.plotOptions.series.stacking = "normal";
            var strength = new List<decimal>();
            var weakness = new List<decimal>();
            var threat = new List<decimal>();
            var opporunity = new List<decimal>();
            dynamic xAxisLabelList = string.Empty;
            var queryString = string.Empty;

            switch (qagovernanceInput.XAXIS)
            {
                case "customer":
                    xAxisLabelList = findingDataBasedOnAge.Select(x => new { CUST_ID = x.CUST_ID, CUST_NM = x.CUST_NM }).Distinct().OrderBy(x => x.CUST_NM).ToList();
                    break;
                case "project":
                    xAxisLabelList = findingDataBasedOnAge.Select(x => new { PROJ_ID = x.PROJ_ID, PROJ_NM = x.PROJ_NM }).Distinct().OrderBy(x => x.PROJ_NM).ToList();
                    break;
                case "csm":
                    xAxisLabelList = findingDataBasedOnAge.Select(x => new { CSM_ID = x.CSM_ID, CSM_NM = x.CSM_NM }).Distinct().OrderBy(x => x.CSM_NM).ToList();
                    break;
                case "portfolio":
                    xAxisLabelList = findingDataBasedOnAge.Select(x => new { PORTFOLIO_ID = x.PORTFOLIO_ID, PORTFOLIO_NM = x.PORTFOLIO_NM }).Distinct().OrderBy(x => x.PORTFOLIO_NM).ToList();
                    break;
                case "quarter":
                    xAxisLabelList = findingDataBasedOnAge.Select(x => new { Quarter = x.YEAR_QUARTER }).Distinct().ToList();
                    break;
                case "month":
                    xAxisLabelList = findingDataBasedOnAge.Select(x => new { Month = x.YEAR_MONTH }).Distinct().ToList();
                    break;
            }

            foreach (var label in xAxisLabelList)
            {
                var xAxisData = new Tuple<decimal, decimal, decimal, decimal>(0.0m, 0.0m, 0.0m, 0.0m);

                switch (qagovernanceInput.XAXIS)
                {
                    case "customer":
                        xAxisData = GetXaxisData(label.CUST_ID.ToString(), findingDataBasedOnAge, MatchType.CustId, qagovernanceInput);
                        if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                            charts.xAxis.categories.Add(label.CUST_NM);
                        break;
                    case "project":
                        xAxisData = GetXaxisData(label.PROJ_ID, findingDataBasedOnAge, MatchType.ProjId, qagovernanceInput);
                        if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                            charts.xAxis.categories.Add(label.PROJ_NM);
                        break;
                    case "csm":
                        xAxisData = GetXaxisData(label.CSM_ID.ToString(), findingDataBasedOnAge, MatchType.CSMId, qagovernanceInput);
                        if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                            charts.xAxis.categories.Add(label.CSM_NM);
                        break;
                    case "portfolio":
                        xAxisData = GetXaxisData(label.PORTFOLIO_ID.ToString(), findingDataBasedOnAge, MatchType.PortfolioId, qagovernanceInput);
                        if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                            charts.xAxis.categories.Add(label.PORTFOLIO_NM);
                        break;
                    case "quarter":
                        xAxisData = GetXaxisData(label.Quarter, findingDataBasedOnAge, MatchType.Quarter, qagovernanceInput);
                        if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                            charts.xAxis.categories.Add(label.Quarter);
                        break;
                    case "month":
                        xAxisData = GetXaxisData(label.Month, findingDataBasedOnAge, MatchType.Month, qagovernanceInput);
                        if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                            charts.xAxis.categories.Add(label.Month);
                        break;
                }


                foreach (var type in qagovernanceInput.FINDING_TYPE)
                {
                    switch (type)
                    {
                        case "Strength":
                            if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                                strength.Add(xAxisData.Item1);
                            break;
                        case "Weakness":
                            if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                                weakness.Add(xAxisData.Item2);
                            break;
                        case "Opportunity":
                            if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                                opporunity.Add(xAxisData.Item3);
                            break;
                        case "Threat":
                            if (xAxisData.Item1 > 0 || xAxisData.Item2 > 0 || xAxisData.Item3 > 0 || xAxisData.Item4 > 0)
                                threat.Add(xAxisData.Item4);
                            break;
                    }
                }

            }

            foreach (var type in qagovernanceInput.FINDING_TYPE)
            {
                switch (type)
                {
                    case "Strength":
                        charts.series.Add(new seriesItem("Strength", COLOR_GREEN, "column", strength) { });
                        break;
                    case "Weakness":
                        charts.series.Add(new seriesItem("Weakness", COLOR_AMBER, "column", weakness) { });
                        break;
                    case "Opportunity":
                        charts.series.Add(new seriesItem("Opportunity", COLOR_BLUE_DARK, "column", opporunity) { });
                        break;
                    case "Threat":
                        charts.series.Add(new seriesItem("Threat", COLOR_RED, "column", threat) { });
                        break;
                }
            }
            return Ok(charts);
        }



        [POST("GetAssessmentFindingDetails")]
        [ActionName("GetAssessmentFindingDetails")]
        [HttpPost]
        public IHttpActionResult GetAssessmentFindingDetails([FromBody] QAGovernanceDashboardInputHolder qagovernanceInput)
        {
            LogRequest(prefix: "GetAssessmentFindingDetails");
            var assessmentFindingDetails = CSPdb.AppRepo.GetAssessmentFindingsData(qagovernanceInput.START_DATE.ToString("yyyy-MM-dd"), qagovernanceInput.END_DATE.ToString("yyyy-MM-dd"), qagovernanceInput.CUSTOMER_IDS);
            var viewAssessmentFindingDataBinding = new List<AssessmentFindingViewDetailsInputHolder>();
            var nonSkipedProjectList = new List<ASSESSMENT_FINDINGS>();

            if (qagovernanceInput == null)
            {
                return BadRequest("Request is empty");
            }

            if (assessmentFindingDetails.Count == 0)
            {
                return Ok();
            }

            var skipedProjectList = GetSkipedMLAssessmentProjectList();

            nonSkipedProjectList = assessmentFindingDetails.Where(x => !skipedProjectList.Contains(x.PROJ_ID)).ToList();

            var findingDataBasedOnAge = GetFindingDataBasedOnAge(nonSkipedProjectList, qagovernanceInput);


            var customerListWithoutType = findingDataBasedOnAge.Select(x => new { CUST_ID = x.CUST_ID, CUST_NM = x.CUST_NM }).Distinct().ToList();

            var customerList = customerListWithoutType.Select(x => new CustomerBase { CUST_ID = x.CUST_ID, CUST_NM = x.CUST_NM }).ToList();

            foreach (var customer in customerList)
            {
                var assessmentFindingDetailsForCustomer = findingDataBasedOnAge.Where(x => x.CUST_ID == customer.CUST_ID).ToList();

                var projectListForCustomer = assessmentFindingDetailsForCustomer.Select(x => new { proj_Id = x.PROJ_ID, proj_NM = x.PROJ_NM }).Distinct().ToList(); // , SURVEY_STATUS = x.SURVEY_STATUS  BATCH_CUSTOMER_ID = x.BATCH_CUSTOMER_ID, BATCH_CUSTOMER_MONTHLY_ID = x.BATCH_CUSTOMER_MONTHLIY_ID 

                var assessmentFindingsCustomerData = new AssessmentFindingViewDetailsInputHolder();
                assessmentFindingsCustomerData.CUST_ID = customer.CUST_ID;
                assessmentFindingsCustomerData.CUST_NM = customer.CUST_NM;

                assessmentFindingsCustomerData.STRENGTH_FOR_CUSTOMER = GetDataForFindingTypeandStatus("Strength", qagovernanceInput.FINDING_STATUS, assessmentFindingDetailsForCustomer);
                assessmentFindingsCustomerData.WEAKNESS_FOR_CUSTOMER = GetDataForFindingTypeandStatus("Weakness", qagovernanceInput.FINDING_STATUS, assessmentFindingDetailsForCustomer);
                assessmentFindingsCustomerData.OPPORTUNITY_FOR_CUSTOMER = GetDataForFindingTypeandStatus("Opportunity", qagovernanceInput.FINDING_STATUS, assessmentFindingDetailsForCustomer);
                assessmentFindingsCustomerData.THREAT_FOR_CUSTOMER = GetDataForFindingTypeandStatus("Threat", qagovernanceInput.FINDING_STATUS, assessmentFindingDetailsForCustomer);

                assessmentFindingsCustomerData.STRENGTH_URL_FOR_CUSTOMER = GetUrl(assessmentFindingsCustomerData.CUST_ID, "S", qagovernanceInput);
                assessmentFindingsCustomerData.WEAKNESS_URL_FOR_CUSTOMER = GetUrl(assessmentFindingsCustomerData.CUST_ID, "W", qagovernanceInput);
                assessmentFindingsCustomerData.OPPORTUNITY_URL_FOR_CUSTOMER = GetUrl(assessmentFindingsCustomerData.CUST_ID, "O", qagovernanceInput);
                assessmentFindingsCustomerData.THREAT_URL_FOR_CUSTOMER = GetUrl(assessmentFindingsCustomerData.CUST_ID, "T", qagovernanceInput);
                assessmentFindingsCustomerData.ISEXPANDED = false;

                var projectDataList = new List<AssessmentFindingViewDetailsProjectWise>();

                foreach (var proj in projectListForCustomer)
                {
                    var projectAssessmentFindingDetails = assessmentFindingDetails.Where(x => x.PROJ_ID == proj.proj_Id).ToList();
                    var assessmentFindingprojectDetails = new AssessmentFindingViewDetailsProjectWise();
                    assessmentFindingprojectDetails.PROJ_ID = proj.proj_Id;
                    assessmentFindingprojectDetails.PROJ_NM = proj.proj_NM;

                    assessmentFindingprojectDetails.STRENGTH_FOR_PROJECT = GetDataForFindingTypeandStatus("Strength", qagovernanceInput.FINDING_STATUS, projectAssessmentFindingDetails);
                    assessmentFindingprojectDetails.WEAKNESS_FOR_PROJECT = GetDataForFindingTypeandStatus("Weakness", qagovernanceInput.FINDING_STATUS, projectAssessmentFindingDetails);
                    assessmentFindingprojectDetails.OPPORTUNITY_FOR_PROJECT = GetDataForFindingTypeandStatus("Opportunity", qagovernanceInput.FINDING_STATUS, projectAssessmentFindingDetails);
                    assessmentFindingprojectDetails.THREAT_FOR_PROJECT = GetDataForFindingTypeandStatus("Threat", qagovernanceInput.FINDING_STATUS, projectAssessmentFindingDetails);

                    assessmentFindingprojectDetails.STRENGTH_URL_FOR_PROJECT = GetUrl(assessmentFindingsCustomerData.CUST_ID, "S", qagovernanceInput, assessmentFindingprojectDetails.PROJ_ID);
                    assessmentFindingprojectDetails.WEAKNESS_URL_FOR_PROJECT = GetUrl(assessmentFindingsCustomerData.CUST_ID, "W", qagovernanceInput, assessmentFindingprojectDetails.PROJ_ID);
                    assessmentFindingprojectDetails.OPPORTUNITY_URL_FOR_PROJECT = GetUrl(assessmentFindingsCustomerData.CUST_ID, "O", qagovernanceInput, assessmentFindingprojectDetails.PROJ_ID);
                    assessmentFindingprojectDetails.THREAT_URL_FOR_PROJECT = GetUrl(assessmentFindingsCustomerData.CUST_ID, "T", qagovernanceInput, assessmentFindingprojectDetails.PROJ_ID);

                    projectDataList.Add(assessmentFindingprojectDetails);
                }
                assessmentFindingsCustomerData.PROJECT_ASSESSMENT_DETAILS = projectDataList;
                viewAssessmentFindingDataBinding.Add(assessmentFindingsCustomerData);
            }

            var assessmentFindingsData = new AssessmentFindingsViewDetails();
            assessmentFindingsData.CUSTOMER_LIST = customerList;
            assessmentFindingsData.ASSESSMENT_FINDINGS_DETAILS = viewAssessmentFindingDataBinding;
            return Ok(assessmentFindingsData);
        }
        private decimal GetDataForFindingTypeandStatus(string findingType, string findingStatus, List<ASSESSMENT_FINDINGS> findingData)
        {
            var findingTypeData = 0.0m;

            if (findingStatus != "All")
                findingTypeData = findingData.Count(x => x.FINDING_TYPE == findingType && x.FINDING_STATUS == findingStatus);
            else
                findingTypeData = findingData.Count(x => x.FINDING_TYPE == findingType);

            return findingTypeData;
        }
        private Tuple<decimal, decimal, decimal, decimal> GetXaxisData(string matchValue, List<ASSESSMENT_FINDINGS> findingChartData, MatchType matchType, QAGovernanceDashboardInputHolder qagovernanceInput)
        {
            var xAxisData = new List<ASSESSMENT_FINDINGS>();
            var matchvalueInt = 0;
            var isNumeric = int.TryParse(matchValue, out matchvalueInt);

            var strength = 0.0m;
            var weakness = 0.0m;
            var threat = 0.0m;
            var opporunity = 0.0m;

            switch (matchType)
            {
                case MatchType.CustId:
                    //if (isNumeric)                        
                    xAxisData = findingChartData.Where(x => x.CUST_ID == matchValue).ToList();
                    break;
                case MatchType.ProjId:
                    xAxisData = findingChartData.Where(x => x.PROJ_ID == matchValue).ToList();
                    break;
                case MatchType.CSMId:
                    if (isNumeric)
                        xAxisData = findingChartData.Where(x => x.CSM_ID == matchValue).ToList();
                    break;
                case MatchType.PortfolioId:
                    if (isNumeric)
                        xAxisData = findingChartData.Where(x => x.PORTFOLIO_ID == matchvalueInt).ToList();
                    break;
                case MatchType.Quarter:
                    xAxisData = findingChartData.Where(x => x.YEAR_QUARTER == matchValue).ToList();
                    break;
                case MatchType.Month:
                    xAxisData = findingChartData.Where(x => x.YEAR_MONTH == matchValue).ToList();
                    break;

            }
            foreach (var type in qagovernanceInput.FINDING_TYPE)
            {
                switch (type)
                {
                    case "Strength":
                        strength = GetDataForFindingTypeandStatus(type, qagovernanceInput.FINDING_STATUS, xAxisData);
                        break;
                    case "Weakness":
                        weakness = GetDataForFindingTypeandStatus(type, qagovernanceInput.FINDING_STATUS, xAxisData);
                        break;
                    case "Opportunity":
                        opporunity = GetDataForFindingTypeandStatus(type, qagovernanceInput.FINDING_STATUS, xAxisData);
                        break;
                    case "Threat":
                        threat = GetDataForFindingTypeandStatus(type, qagovernanceInput.FINDING_STATUS, xAxisData);
                        break;
                }
            }

            return new Tuple<decimal, decimal, decimal, decimal>(strength, weakness, opporunity, threat);
        }

        private string GetUrl(string custId, string findingType, QAGovernanceDashboardInputHolder qagovernanceInput, string projId = "")
        {
            var findingStatus = '\0';
            switch (qagovernanceInput.FINDING_STATUS)
            {
                case "Open":
                    findingStatus = 'O';
                    break;
                case "Close":
                    findingStatus = 'C';
                    break;
                case "All":
                    findingStatus = 'A';
                    break;
                default: break;
            }
            var requestDomianPath = $"{helper.GetAbsoulteUri()}/layout/qasummary";

            if (string.IsNullOrEmpty(projId))

                return $"{requestDomianPath}/{custId}/{qagovernanceInput.START_DATE.ToString("MMM")}/{qagovernanceInput.START_DATE.Year}/{qagovernanceInput.END_DATE.ToString("MMM")}/{qagovernanceInput.END_DATE.Year}/{findingStatus}/{findingType}/true";

            else
                return $"{requestDomianPath}/{custId}/{projId}/{qagovernanceInput.START_DATE.ToString("MMM")}/{qagovernanceInput.START_DATE.Year}/{qagovernanceInput.END_DATE.ToString("MMM")}/{qagovernanceInput.END_DATE.Year}/{findingStatus}/{findingType}/true";

        }

        private List<ASSESSMENT_FINDINGS> GetFindingDataBasedOnAge(List<ASSESSMENT_FINDINGS> findingChartData, QAGovernanceDashboardInputHolder qagovernanceInput)
        {
            var findingDataBasedOnAge = new List<ASSESSMENT_FINDINGS>();
            switch (qagovernanceInput.FINDING_AGE)
            {
                case "-1":
                    findingDataBasedOnAge = findingChartData;
                    break;
                case "1":
                    findingDataBasedOnAge = findingChartData.Where(x => x.FINDING_AGE > 30).ToList();
                    break;
                case "2":
                    findingDataBasedOnAge = findingChartData.Where(x => x.FINDING_AGE < 30).ToList();
                    break;

            }

            return findingDataBasedOnAge = qagovernanceInput.FINDING_STATUS != "All" ? findingDataBasedOnAge.Where(x => x.FINDING_STATUS == qagovernanceInput.FINDING_STATUS).ToList() : findingDataBasedOnAge;

        }

        private List<string> GetSkipedMLAssessmentProjectList()
        {
            var settingKeys = new List<string>() { "SKIP_ML_ASSESSMENT", "SKIP_MONTHLY_HEALTH_CHECK" };

            var projectList = helper.GetProjectConfigurationDataForSetting(settingKeys).Where(x => x.Bit_Value == true).Select(x => x.Proj_Id).Distinct().ToList();

            return projectList;
        }
    }

    public enum MatchType
    {
        CustId,
        ProjId,
        CSMId,
        PortfolioId,
        Quarter,
        Month

    }
}