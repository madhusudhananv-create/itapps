using System;
using System.Linq;
using System.Web;
using AttributeRouting.Web.Mvc;
using System.Web.Http;
using GAVS.AllocationSystem.Model.AllSys.Tables;
using GAVS.AllocationSystem.WebApi.ActionFilters;
using System.Net.Http;
using Newtonsoft.Json;
using System.Net;
using System.Configuration;
using GAVS.AllocationSystem.Data.Contracts;
using System.Collections.Generic;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Data.OleDb;
using System.Data;
using System.Globalization;
using GAVS.AllocationSystem.Model.CSP.Tables;
using System.Text.RegularExpressions;
using System.Diagnostics;
using GAVS.AllocationSystem.Model.AllSys;
using System.Reflection;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    [BearerTokenAuthorization]
    [ExceptionFilter]
    [ResponseTimeActionFilter]
    public partial class AllSysController
    {
        string kpiRulesInput = ConfigurationManager.AppSettings["KpiRulesInputFolder"].ToString();
        string kpiRulesFailed = ConfigurationManager.AppSettings["KpiRulesFailedFolder"].ToString();
        string kpiRulesSuccess = ConfigurationManager.AppSettings["KpiRulesSuccessFolder"].ToString();
        string kpiDataInput = ConfigurationManager.AppSettings["KpiDataInputFolder"].ToString();
        string kpiDataFailed = ConfigurationManager.AppSettings["KpiDataFailedFolder"].ToString();
        string kpiDataSuccess = ConfigurationManager.AppSettings["KpiDataSuccessFolder"].ToString();
        string fileTypeFormula = "formula";
        string fileTypeData = "data";
        string sourceZIF = "zif";
        string sourceFreshWorks = "freshworks";
        int slaDays = 15;
        string csvFormat = "csv";
        string jsonFormat = "json";
        string uploadFilePath = ConfigurationManager.AppSettings["uploadfolder"].ToString();
        string[] ignoreFormulaKeys = { "exclude", "range", "isproblemticket" };
        string createdDtField = "Resolved Date";
        string closedDtField = "closed date";

        const int KPI_DATATYPE_NUMERATOR = 1; // 1 : Numerator, 2 : Denom
        const int KPI_DATATYPE_DENOM = 2;
        [GET("ProcessExternalKPIs")]
        [ActionName("ProcessExternalKPIs")]
        [HttpGet]
        public IHttpActionResult ProcessExternalKPIs(string custId, DateTime date)
        {
            var stopwatch = Stopwatch.StartNew();
            CheckEmpIdExists();
            LogRequest(prefix: "ExternalKPI");
            CheckAccessForFeature(98);// access to Process
            var errorMsg = string.Empty;
            errorMsg = ProcessExternalKPIs(custId, date, sourceZIF);
            if (!string.IsNullOrWhiteSpace(errorMsg))
                return Ok(errorMsg);
            errorMsg = ProcessExternalKPIsByFormula(custId, date, sourceFreshWorks);
            if (!string.IsNullOrWhiteSpace(errorMsg))
                return Ok(errorMsg);
            FillResponseTime(stopwatch);
            return Ok("Process Completed Successfully");
        }

        [GET("GetExternalKPIDataByBaseMeasure")]
        [ActionName("GetExternalKPIDataByBaseMeasure")]
        [HttpGet]
        public IHttpActionResult GetExternalKPIDataByBaseMeasure(int kpiDetailsId)
        {
            var stopwatch = Stopwatch.StartNew();
            LogRequest(prefix: "ExternalKPI");
            var baseMeasureValues = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().Where(x => x.KPI_DETAILS_ID == kpiDetailsId).ToList();
            var baseMeasureValueIds = baseMeasureValues.Select(x => x.ID).ToList();
            var bmkMaps = Cldb.BASE_MEASURE_EXTERNAL_KPI_DATA.GetAll().Where(x => baseMeasureValueIds.Contains(x.KPI_BASE_MEASURE_VALUE_ID)).ToList();
            var numMaps = bmkMaps.Where(x => x.KPI_DATATYPE == KPI_DATATYPE_NUMERATOR).Select(x => x.KPI_DATA_JSON).ToList();
            var denMaps = bmkMaps.Where(x => x.KPI_DATATYPE == KPI_DATATYPE_DENOM).Select(x => x.KPI_DATA_JSON).ToList();
            var dtNumMaps = AddNewColumnToKPIData(numMaps, "Numerator");
            var dtDenMaps = AddNewColumnToKPIData(denMaps, "Denominator");
            dtDenMaps.Merge(dtNumMaps);
            FillResponseTime(stopwatch);
            return Ok(dtDenMaps);
        }
        private DataTable AddNewColumnToKPIData(List<string> baseMeasurekPIMaps, string type)
        {
            var colName = "TYPE";
            var dtMaps = GetDatatableFromJsonList(baseMeasurekPIMaps);
            var dc = new DataColumn(colName);
            dtMaps.Columns.Add(dc);
            foreach (DataRow item in dtMaps.Rows)
            {
                item[colName] = type;
            }
            return dtMaps;
        }
        private string ProcessExternalKPIs(string customerId, DateTime date, string source)
        {
            var errorMsg = string.Empty;
            int monthNumber = date.Month;
            int Year = date.Year;
            var baseMeasureKPIData = new List<BaseMeasureKPIDataMap>();
            var selectedDate = new DateTime(Year, monthNumber, 01);
            var range = new DateRange(selectedDate, enDateRange.Monthly);
            var externalKpis = CSPdb.AppRepo.GetExternalKPIstoProcess(customerId, source, range.StartDate, range.EndDate);
            var toProcess = new List<ExternalKPIData>();
            var kpisToSearch = CSPdb.KPI.GetAll().Where(x => x.CUSTOMER_ID == customerId && x.ISACTIVE && x.PRODUCT_ID != null).ToList();
            var kpiIds = kpisToSearch.Select(x => x.ID).ToList();
            var kpiKeywords = Cldb.KPI_KEYWORDS.GetAll().Where(x => kpiIds.Contains(x.KPI_ID)).ToList();
            var baseMeasureMaster = CSPdb.BASE_MEASURE.GetAll().Where(x => x.ISACTIVE).ToList();//can take without filtering as its master data
            var serviceConfigMaster = CSPdb.SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG.GetAll().Where(x => x.ISACTIVE).ToList();
            var extKpisConsideredNum = new List<KPIIdJson>();
            if (externalKpis.Count == 0)
                return errorMsg;
            foreach (var item in externalKpis)
            {
                dynamic json = item.KPI_DATA;
                try
                {
                    Root list = JsonConvert.DeserializeObject<Root>(json);
                    toProcess.AddRange(list.csm_data);
                    extKpisConsideredNum.Add(new KPIIdJson { id = item.ID, json = json });
                }
                catch (Exception ex)
                {
                    LogRequest(ex);
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Invalid JSON"));
                }
            }
            var validationResult = ValidateInput(toProcess);
            if (!string.IsNullOrWhiteSpace(validationResult))
                return errorMsg;


            foreach (var item in kpisToSearch)
            {
                var filteredKpiKeywords = kpiKeywords.Where(x => x.KPI_ID == item.ID).Select(x => x.KEYWORD.ToLower()).ToList();
                if (!filteredKpiKeywords.Any()) continue;
                var actuals = toProcess.Where(x => x.keyword != null && x.period >= range.StartDate && x.period <= range.EndDate && filteredKpiKeywords.Contains(x.keyword.ToLower())).ToList();
                if (!actuals.Any()) continue;
                var kpiDetail = CSPdb.KPI_DETAILS.GetAll().FirstOrDefault(x => x.ISACTIVE && x.KPI_ID == item.ID && x.PERIOD == range.StartDate);
                if (kpiDetail != null && kpiDetail.ISDRAFT == false) continue;
                var baseMeasureConfig = serviceConfigMaster.Where(x => x.KPI_ID == item.ID && x.ISACTIVE).ToList();

                List<BaseMeasureData> BaseMeasureDataList = new List<BaseMeasureData>();
                var ids = baseMeasureConfig.Select(x => x.BASE_MEASURE_ID).ToArray();

                var baseMeasureList = baseMeasureMaster.Where(x => ids.Contains(x.ID) && x.ISACTIVE).ToList();
                if (baseMeasureList.Count > 0)
                {
                    var kpiDetailId = kpiDetail != null ? kpiDetail.ID : 0;
                    if (kpiDetailId > 0)
                    {
                        var existingBM = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().FirstOrDefault(x => x.ISACTIVE && x.IS_EXCLUSION != true && kpiDetailId == x.KPI_DETAILS_ID);
                        if (existingBM == null)
                        {
                            existingBM = new KPI_BASE_MEASURE_VALUE
                            {
                                KPI_DETAILS_ID = kpiDetailId,
                                NUMERATOR = (decimal)actuals.Average(x => x.actual),
                                DENOMINATOR = 100M,
                                BASE_MEASURE_ID = baseMeasureConfig.FirstOrDefault(x => x.KPI_ID == item.ID).BASE_MEASURE_ID,
                            };
                            UpdateAuditFields(existingBM);
                            CSPdb.KPI_BASE_MEASURE_VALUE.Add(existingBM);
                            CSPdb.Commit(CanCommit);
                        }
                        else
                        {
                            existingBM.NUMERATOR = (decimal)actuals.Average(x => x.actual);
                            existingBM.DENOMINATOR = 100M;
                        }
                        UpdateAuditFields(existingBM);
                        //As of now assuming only one basemeasure data
                        //var basemeasure = GetBaseMeasureData(item.ID, kpiDetailId, baseMeasureConfig, baseMeasureList, new List<KPI_BASE_MEASURE_VALUE> { existingBM }).FirstOrDefault();
                        var basemeasure = new BaseMeasureData
                        {
                            BaseMeasureId = existingBM.BASE_MEASURE_ID,
                            Numerator = existingBM.NUMERATOR,
                            Denominator = existingBM.DENOMINATOR,
                            BaseMeasureFormulaTypeId = baseMeasureList.FirstOrDefault(x => x.ID == existingBM.BASE_MEASURE_ID).BASE_MEASURE_FORMULA_TYPE_ID
                        };
                        var kpiAchievement = GetKPIAchievementPercentagePvt(new List<BaseMeasureData> { basemeasure }, item.ID);
                        //update existing
                        existingBM.NUMERATOR = basemeasure.Numerator;
                        existingBM.DENOMINATOR = basemeasure.Denominator;
                        UpdateKpiDetailsEntities(kpiDetail, existingBM, baseMeasureList, item.ID);
                        // Updating BaseMeasureKpi data  
                        baseMeasureKPIData.AddRange(AddBaseMeasureKPIData(extKpisConsideredNum, existingBM.ID, KPI_DATATYPE_NUMERATOR));

                    }
                    else
                    {
                        //create new
                        kpiDetail = new KPI_DETAILS
                        {
                            KPI_ID = item.ID,
                            PRODUCT_ID = item.PRODUCT_ID,
                            //SLA_STATUS = kpiAchievement.SLA_STATUS,
                            //SECONDARY_SLA_STATUS = kpiAchievement.SECONDARY_SLA_STATUS,
                            ISDRAFT = true,
                            MODE_ID = item.MODE_ID,
                            PERIOD_TYPE = item.FREQUENCY,
                            PERIOD = range.StartDate,
                            KPI_METRIC = 0,
                            KPI_ACTUAL = string.Empty,
                        };
                        UpdateAuditFields(kpiDetail);
                        CSPdb.KPI_DETAILS.Add(kpiDetail);
                        CSPdb.Commit(CanCommit);
                        var kpiBaseMeasure = new KPI_BASE_MEASURE_VALUE
                        {
                            KPI_DETAILS_ID = kpiDetail.ID,
                            NUMERATOR = (decimal)actuals.Average(x => x.actual),
                            DENOMINATOR = 100M,
                            BASE_MEASURE_ID = baseMeasureConfig.FirstOrDefault(x => x.KPI_ID == item.ID).BASE_MEASURE_ID,
                        };
                        UpdateAuditFields(kpiBaseMeasure);
                        UpdateKpiDetailsEntities(kpiDetail, kpiBaseMeasure, baseMeasureList, item.ID);

                        baseMeasureKPIData.AddRange(AddBaseMeasureKPIData(extKpisConsideredNum, kpiBaseMeasure.ID, KPI_DATATYPE_NUMERATOR));
                        //if (extKpisConsideredDenom.Count > 0)
                        //{
                        //    baseMeasureKPIData.Add(new BaseMeasureKPIDataMap() { baseMeasureId = kpiBaseMeasure.BASE_MEASURE_ID, listkpiIdJson = extKpisConsideredDenom, kpiDataType = KPI_DATATYPE_DENOM });
                        //}
                    }
                    CSPdb.Commit(CanCommit);
                }
                //else create new basemeasure and kpi_details
            }
            if (baseMeasureKPIData != null && baseMeasureKPIData.Count > 0)
                ProcessBaseMeasureExtKPIDataList(baseMeasureKPIData);
            Cldb.Commit(CanCommit);
            return errorMsg;
        }
        private bool checkIfDateWithInTheRange(DateRange range, string dateStr)
        {
            var dt = Convert.ToDateTime(dateStr);
            if (dt >= range.StartDate && dt <= range.EndDate)
                return true;
            else
                return false;
        }
        public static double GetBusinessDays(DateTime startD, DateTime endD)
        {
            double calcBusinessDays =
                1 + ((endD - startD).TotalDays * 5 -
                (startD.DayOfWeek - endD.DayOfWeek) * 2) / 7;

            if (endD.DayOfWeek == DayOfWeek.Saturday) calcBusinessDays--;
            if (startD.DayOfWeek == DayOfWeek.Sunday) calcBusinessDays--;

            return calcBusinessDays;
        }
        private string ProcessExternalKPIsByFormula(string customerId, DateTime date, string source)
        {
            var errorMsg = string.Empty;
            int monthNumber = date.Month;
            int Year = date.Year;
            var selectedDate = new DateTime(Year, monthNumber, 01);
            var range = new DateRange(selectedDate, enDateRange.Monthly);
            var externalKpis = CSPdb.AppRepo.GetExternalKPIstoProcess(customerId, source, range.StartDate, range.EndDate);
            var baseMeasureKPIData = new List<BaseMeasureKPIDataMap>();
            if (externalKpis.Count == 0)
                return errorMsg;

            var toProcess = new List<KPIIdJson>();
            foreach (var item in externalKpis)
            {
                dynamic json = item.KPI_DATA.ToLower();
                // var list = JsonConvert.DeserializeObject<dynamic>(json);
                toProcess.Add(new KPIIdJson { id = item.ID, json = json });
            }
            var kpiFormulas = Cldb.EXTERNAL_KPI_FORMULAS.GetAll().Where(x => x.ISACTIVE && x.CUSTOMER_ID == customerId).ToList();
            var kpiSLAIds = kpiFormulas.Select(x => x.SLA_ID).ToList();
            var kpisToSearch = CSPdb.AppRepo.GetKPIReferencesByCustomer(string.Join(",", kpiSLAIds), customerId, range.StartDate.ToString("yyyy-MM-dd"), range.EndDate.ToString("yyyy-MM-dd"));

            var extKpisConsideredNum = new List<KPIIdJson>(); //KPI_DATA 
            var extKpisConsideredDenom = new List<KPIIdJson>();//KPI_DATA 
            var kpiIds = kpisToSearch.Select(x => x.KPI_ID).ToList();
            var baseMeasureMaster = CSPdb.BASE_MEASURE.GetAll().Where(x => x.ISACTIVE).ToList();//can take without filtering as its master data
            var serviceConfigMaster = CSPdb.SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG.GetAll().Where(x => x.ISACTIVE).ToList();
            var kpiDetails = CSPdb.KPI_DETAILS.GetAll().Where(x => x.ISACTIVE && kpiIds.Contains(x.KPI_ID) && x.PERIOD == range.StartDate).ToList();
            var kpiDetailIds = kpiDetails.Select(x => x.ID).ToList();
            var baseMeasureDataList = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().Where(x => x.ISACTIVE && x.IS_EXCLUSION != true && kpiDetailIds.Contains(x.KPI_DETAILS_ID)).ToList();
            foreach (var item in kpisToSearch)
            {
                var filteredFormula = kpiFormulas.FirstOrDefault(x => x.SLA_ID == item.REFERENCE && x.PRODUCT_ID == item.PRODUCT_ID);
                var kpiDetail = kpiDetails.FirstOrDefault(x => x.ISACTIVE && x.KPI_ID == item.KPI_ID && x.PERIOD == range.StartDate);
                if (kpiDetail != null && kpiDetail.ISDRAFT == false) continue;

                var baseMeasureConfig = serviceConfigMaster.Where(x => x.KPI_ID == item.KPI_ID && x.ISACTIVE).ToList();
                var baseMeasureData = baseMeasureDataList.Where(x => x.ISACTIVE && x.IS_EXCLUSION != true && (kpiDetail == null || kpiDetail.ID == x.KPI_DETAILS_ID)).ToList();

                var ids = baseMeasureConfig.Select(x => x.BASE_MEASURE_ID).ToArray();

                var baseMeasureList = baseMeasureMaster.Where(x => ids.Contains(x.ID) && x.ISACTIVE).ToList();
                if (baseMeasureList.Count > 0 && filteredFormula != null)
                {
                    var kpiDetailId = kpiDetail != null ? kpiDetail.ID : 0;

                    //As of now assuming only one basemeasure data
                    var basemeasure = GetBaseMeasureDataByFormula(item.KPI_ID, kpiDetailId, baseMeasureConfig, baseMeasureList, baseMeasureData, filteredFormula, toProcess, range, out extKpisConsideredNum, out extKpisConsideredDenom).FirstOrDefault();
                    if (basemeasure.Denominator == 0M) continue;
                    if (kpiDetailId > 0)
                    {
                        //update existing
                        var existingBM = baseMeasureDataList.FirstOrDefault(x => x.KPI_DETAILS_ID == kpiDetailId);
                        if (existingBM == null)
                        {
                            existingBM = new KPI_BASE_MEASURE_VALUE
                            {
                                KPI_DETAILS_ID = kpiDetailId,
                                NUMERATOR = basemeasure.Numerator,
                                DENOMINATOR = basemeasure.Denominator,
                                BASE_MEASURE_ID = baseMeasureConfig.FirstOrDefault(x => x.KPI_ID == item.KPI_ID).BASE_MEASURE_ID,
                            };
                            UpdateAuditFields(existingBM);
                            CSPdb.KPI_BASE_MEASURE_VALUE.Add(existingBM);
                            CSPdb.Commit(CanCommit);
                        }
                        else
                        {
                            existingBM.NUMERATOR = basemeasure.Numerator;
                            existingBM.DENOMINATOR = basemeasure.Denominator;

                            UpdateAuditFields(existingBM);
                            UpdateKpiDetailsEntities(kpiDetail, existingBM, baseMeasureList, item.KPI_ID);
                        }

                        baseMeasureKPIData.AddRange(AddBaseMeasureKPIData(extKpisConsideredNum, existingBM.ID, KPI_DATATYPE_NUMERATOR));
                        baseMeasureKPIData.AddRange(AddBaseMeasureKPIData(extKpisConsideredDenom, existingBM.ID, KPI_DATATYPE_DENOM));
                    }
                    else
                    {
                        //create new
                        kpiDetail = new KPI_DETAILS
                        {
                            KPI_ID = item.KPI_ID,
                            PRODUCT_ID = item.PRODUCT_ID,
                            ISDRAFT = true,
                            MODE_ID = item.MODE_ID,
                            PERIOD_TYPE = item.FREQUENCY,
                            PERIOD = range.StartDate,
                            KPI_METRIC = 0,
                            KPI_ACTUAL = string.Empty,
                        };
                        UpdateAuditFields(kpiDetail);
                        CSPdb.KPI_DETAILS.Add(kpiDetail);
                        CSPdb.Commit(CanCommit);
                        var kpiBaseMeasure = new KPI_BASE_MEASURE_VALUE
                        {
                            KPI_DETAILS_ID = kpiDetail.ID,
                            NUMERATOR = basemeasure.Numerator,
                            DENOMINATOR = basemeasure.Denominator,
                            BASE_MEASURE_ID = baseMeasureConfig.FirstOrDefault(x => x.KPI_ID == item.KPI_ID).BASE_MEASURE_ID,
                        };
                        UpdateAuditFields(kpiBaseMeasure);
                        UpdateKpiDetailsEntities(kpiDetail, kpiBaseMeasure, baseMeasureList, item.KPI_ID);

                        baseMeasureKPIData.AddRange(AddBaseMeasureKPIData(extKpisConsideredNum, kpiBaseMeasure.ID, KPI_DATATYPE_NUMERATOR));
                        baseMeasureKPIData.AddRange(AddBaseMeasureKPIData(extKpisConsideredDenom, kpiBaseMeasure.ID, KPI_DATATYPE_DENOM));
                    }

                }
            }
            if (baseMeasureKPIData != null && baseMeasureKPIData.Count > 0)
                ProcessBaseMeasureExtKPIDataList(baseMeasureKPIData);
            CSPdb.Commit(CanCommit);
            Cldb.Commit(CanCommit);
            return errorMsg;
        }
        private List<BaseMeasureKPIDataMap> AddBaseMeasureKPIData(List<KPIIdJson> extKpisConsidered, int baseMeasureValueId, int kpiDateType)
        {
            var baseMeasureKPIData = new List<BaseMeasureKPIDataMap>();
            if (extKpisConsidered.Count > 0)
            {
                baseMeasureKPIData.Add(
                    new BaseMeasureKPIDataMap()
                    {
                        baseMeasureValueId = baseMeasureValueId,
                        listkpiIdJson = extKpisConsidered,
                        kpiDataType = kpiDateType
                    });
            }
            return baseMeasureKPIData;
        }
        private List<BaseMeasureData> GetBaseMeasureDataByFormula(int kpiID, int kpiDetailsId, List<SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG> configList, List<BASE_MEASURE> baseMeasureList, List<KPI_BASE_MEASURE_VALUE> baseMeasureData, EXTERNAL_KPI_FORMULAS formula, List<KPIIdJson> toProcess, DateRange range, out List<KPIIdJson> extKpisConsideredNum, out List<KPIIdJson> extKpisConsideredDenom)
        {
            var result = new List<BaseMeasureData>();
            var baseMeasureConfig = configList.Where(x => x.KPI_ID == kpiID).ToList();
            var ids = baseMeasureConfig.Select(x => x.BASE_MEASURE_ID).ToArray();
            var baseMeasures = baseMeasureList.Where(x => ids.Contains(x.ID)).ToList();
            extKpisConsideredNum = new List<KPIIdJson>();
            extKpisConsideredDenom = new List<KPIIdJson>();
            int numerator = 0, denominator = 0;
            if (formula != null)
            {
                numerator = GetMatchedKPIDataCountByFormula(formula.Formula_Numerator, toProcess, range, out extKpisConsideredNum);
                denominator = GetMatchedKPIDataCountByFormula(formula.Formula_Denominator, toProcess, range, out extKpisConsideredDenom);

                var baseMeasureValueList = baseMeasureData.Where(x => x.KPI_DETAILS_ID == kpiDetailsId).ToList();
                foreach (var item in baseMeasureConfig.OrderBy(x => x.DISPLAY_ORDER))
                {
                    var baseMeasureValue = baseMeasureValueList.FirstOrDefault(x => x.BASE_MEASURE_ID == item.BASE_MEASURE_ID);
                    result.Add(new BaseMeasureData
                    {
                        BaseMeasureId = item.BASE_MEASURE_ID,
                        NumeratorDescription = baseMeasures.Single(x => x.ID == item.BASE_MEASURE_ID).NUMERATORDESCRIPTION,
                        DenominatorDescription = baseMeasures.Single(x => x.ID == item.BASE_MEASURE_ID).DENOMINATORDESCRIPTION,
                        BaseMeasureValueId = baseMeasureValue != null ? baseMeasureValue.ID : (int?)null,
                        Numerator = numerator,
                        Denominator = denominator,
                        BaseMeasureFormulaTypeId = baseMeasures.Single(x => x.ID == item.BASE_MEASURE_ID).BASE_MEASURE_FORMULA_TYPE_ID
                    });
                }
            }
            return result;
        }

        private int GetMatchedKPIDataCountByFormula(string formula, List<KPIIdJson> toProcess, DateRange range, out List<KPIIdJson> extKpisConsidered)
        {
            int cnt = 0; bool isExist = false; bool isExExist = false; bool isWithInRange = true;
            var stDate = DateTime.Today;
            var enDate = DateTime.Today;
            extKpisConsidered = new List<KPIIdJson>();
            var diFormula = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(formula.ToLower());
            foreach (var p in toProcess)
            {
                isWithInRange = true;
                Dictionary<string, string> diKPIData = new Dictionary<string, string>();
                try
                {
                    diKPIData = JsonConvert.DeserializeObject<Dictionary<string, string>>(p.json);
                }
                catch
                {
                    //diKPIData = JsonConvert.DeserializeObject<Dictionary<string, string>>(p.json);
                    continue;

                }

                isExist = checkKPIDataWithFormula(diKPIData, diFormula);
                if (diFormula.ContainsKey("exclude"))
                {
                    var diExcludeFormula = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(diFormula["exclude"].ToString());
                    isExExist = checkKPIDataWithFormula(diKPIData, diExcludeFormula);
                }
                var isProblemTicket = diFormula.ContainsKey("isproblemticket");
                var isRangeExists = diFormula.ContainsKey("range");
                //range Logic  --
                if (isRangeExists)  //range is currently is using for problem tkt
                {
                    var diRange = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(diFormula["range"].ToString());
                    if (diRange.ContainsKey("startdate") && diRange.ContainsKey("enddate") && diRange.ContainsKey("sladays")) // check if range fields are there 
                    {
                        var startDt = diRange["startdate"];
                        var endDt = diRange["enddate"];
                        if (diKPIData.ContainsKey(startDt)
                         && DateTime.TryParse(diKPIData[startDt], out stDate)
                         && int.TryParse(diRange["sladays"].ToString(), out slaDays))// check if start date is present and valid
                        {
                            if (diKPIData.ContainsKey(endDt) && !string.IsNullOrEmpty(diKPIData[endDt]) && DateTime.TryParse(diKPIData[endDt], out enDate))// check if end date is present and valid
                            {
                                DateRange rangefilter = new DateRange(stDate, enDate);
                                isWithInRange = GetBusinessDays(stDate, enDate) > slaDays ? false : true;
                            }
                            else
                                isWithInRange = false;   // not considering when endate is empty or invalid
                        }
                    }
                }

                if (isExist && ((!isProblemTicket && diKPIData.ContainsKey(createdDtField) && checkIfDateWithInTheRange(range, diKPIData[createdDtField])) ||
                    (isProblemTicket && diKPIData.ContainsKey(closedDtField) && checkIfDateWithInTheRange(range, diKPIData[closedDtField]) && diKPIData.ContainsKey("id") && diKPIData["id"].IndexOf("prb") != -1)) && !isExExist && isWithInRange)
                {
                    cnt = cnt + 1;
                    extKpisConsidered.Add(p);
                }
            }
            return cnt;
        }

        private bool checkKPIDataWithFormula(Dictionary<string, string> diKPIData, Dictionary<string, dynamic> diFormula)
        {
            bool isExist = false;
            foreach (var d in diFormula)
            {
                var key = d.Key.Trim().ToLower();
                if (!ignoreFormulaKeys.Contains(key))
                {
                    var value = d.Value.Trim().ToLower();
                    if (diKPIData.ContainsKey(key) && value.Contains(diKPIData[key].Trim().ToLower()))
                        isExist = true;
                    else
                    { isExist = false; break; }
                }
            }
            return isExist;
        }
        private void UpdateKpiDetailsEntities(KPI_DETAILS kpiDetail, KPI_BASE_MEASURE_VALUE kpiBaseMeasure, List<BASE_MEASURE> baseMeasureList, int kpiId)
        {
            var basemeasure = new BaseMeasureData
            {
                BaseMeasureId = kpiBaseMeasure.BASE_MEASURE_ID,
                Numerator = kpiBaseMeasure.NUMERATOR,
                Denominator = kpiBaseMeasure.DENOMINATOR,
                BaseMeasureFormulaTypeId = baseMeasureList.FirstOrDefault(x => x.ID == kpiBaseMeasure.BASE_MEASURE_ID).BASE_MEASURE_FORMULA_TYPE_ID
            };
            var kpiAchievement = GetKPIAchievementPercentagePvt(new List<BaseMeasureData> { basemeasure }, kpiId);
            kpiBaseMeasure.BASE_MEASURE_ID = basemeasure.BaseMeasureId;
            kpiDetail.SLA_STATUS = kpiAchievement.SLA_STATUS;
            kpiDetail.SECONDARY_SLA_STATUS = kpiAchievement.SECONDARY_SLA_STATUS;
            kpiDetail.KPI_ACTUAL = kpiAchievement.KPI_ACTUAL;
            UpdateAuditFields(kpiBaseMeasure);
            if (kpiBaseMeasure.ID == 0)
                CSPdb.KPI_BASE_MEASURE_VALUE.Add(kpiBaseMeasure);
            else
                CSPdb.KPI_BASE_MEASURE_VALUE.Update(kpiBaseMeasure);

            UpdateAuditFields(kpiDetail);
            CSPdb.KPI_DETAILS.Update(kpiDetail);
        }
        private string ValidateInput(List<ExternalKPIData> embectaKPIs)
        {
            return string.Empty;
        }
        private void CheckRequestIsValid<T>(T course, string empId = "") where T : class, new()
        {
            if (string.IsNullOrWhiteSpace(empId))
            {
                CheckEmpIdExists();
            }

            if (course == null)
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = ERROR_MSG });
            }

        }

        private void CheckEmpIdExists()
        {
            var empId = this.GetHeaderDetails_String("empId");
            if (string.IsNullOrWhiteSpace(empId))
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = EMPTY_EMPLOYEEID_MSG });
            }
        }


        [POST("UploadExternalKPIData")]
        [ActionName("UploadExternalKPIData")]
        [HttpPost]
        public IHttpActionResult UploadExternalKPIData()
        {
            string customerId = string.Empty, source = string.Empty, fileType = string.Empty, empId = string.Empty;
            var stopwatch = Stopwatch.StartNew();
            CheckAccessForFeature(95); // access to KPI data upload
            var strMsg = string.Empty;
            customerId = GetHeaderDetails_String("customerId");
            source = GetHeaderDetails_String("source");
            fileType = fileTypeData;// GetHeaderDetails_String("fileType");
            empId = GetHeaderDetails_String("empId");
            if (string.IsNullOrEmpty(customerId))
                return Content(HttpStatusCode.Conflict, "Customer is not set");

            CheckUserHasAccess(empId, customerId, string.Empty);

            var httpRequest = HttpContext.Current.Request;
            string path = uploadFilePath + kpiDataInput;
            var date = DateTime.Today;
            if (httpRequest.Files.Count != 1)
                return Content(HttpStatusCode.Conflict, "No File to upload");

            var file = httpRequest.Files[0];

            var postedFile = httpRequest.Files[0];
            if (fileType.Trim().ToLower() == fileTypeFormula)
                path = uploadFilePath + kpiRulesInput;

            var createDirectory = HttpContext.Current.Server.MapPath(path);

            if (!Directory.Exists(createDirectory))
            {
                Directory.CreateDirectory(createDirectory);
            }
            string fileFormat = csvFormat;
            if (source == sourceZIF)
                fileFormat = jsonFormat;

            var postedFileName = string.Format(@"{0}_{1}.{2}", postedFile.FileName.Replace(fileFormat, "").Replace(".", ""), DateTime.Now.ToString("yyyy_MM_HH_mmss"), fileFormat);
            var filePath = HttpContext.Current.Server.MapPath(path + postedFileName);
            postedFile.SaveAs(filePath);
            //var extKPIMasters = Cldb.EXTERNAL_KPI_DATA_MASTER.GetAll().Where(x => x.ISACTIVE == true && x.SOURCE == source && x.CUST_ID == customerId).ToList();

            strMsg = ImportKPIDataToDatabase(customerId, date, source);
            if (!string.IsNullOrEmpty(strMsg))
                return Ok(strMsg);
            strMsg = "Uploaded Successfully";

            FillResponseTime(stopwatch);

            return Ok(strMsg);

        }


        [POST("UploadExternalKPIFormulas")]
        [ActionName("UploadExternalKPIFormulas")]
        [HttpPost]
        public IHttpActionResult UploadExternalKPIFormulas()
        {
            var stopwatch = Stopwatch.StartNew();
            string customerId = string.Empty, source = string.Empty, fileType = string.Empty, empId = string.Empty;

            CheckAccessForFeature(96); // access to KPI rules upload
            var strMsg = string.Empty;
            customerId = GetHeaderDetails_String("customerId");
            source = GetHeaderDetails_String("source");
            fileType = fileTypeFormula;// GetHeaderDetails_String("fileType");
            empId = GetHeaderDetails_String("empId");
            if (string.IsNullOrEmpty(customerId))
                return Content(HttpStatusCode.Conflict, "Customer is not set");

            CheckUserHasAccess(empId, customerId, string.Empty);

            var httpRequest = HttpContext.Current.Request;
            string path = uploadFilePath + kpiDataInput;
            var date = DateTime.Today;
            if (httpRequest.Files.Count != 1)
                return Content(HttpStatusCode.Conflict, "No File to upload");

            var file = httpRequest.Files[0];

            var postedFile = httpRequest.Files[0];
            if (fileType.Trim().ToLower() == fileTypeFormula)
                path = uploadFilePath + kpiRulesInput;

            var createDirectory = HttpContext.Current.Server.MapPath(path);

            if (!Directory.Exists(createDirectory))
            {
                Directory.CreateDirectory(createDirectory);
            }
            string fileFormat = csvFormat;
            var postedFileName = string.Format(@"{0}_{1}.{2}", postedFile.FileName.Replace(fileFormat, "").Replace(".", ""), DateTime.Now.ToString("yyyy_MM_HH_mmss"), fileFormat);
            var filePath = HttpContext.Current.Server.MapPath(path + postedFileName);
            postedFile.SaveAs(filePath);
            ImportKPIRulesToDatabase(customerId, source);
            strMsg = "Uploaded Successfully";
            FillResponseTime(stopwatch);
            return Ok(strMsg);
        }

        private void ImportKPIRulesToDatabase(string customerId, string source)
        {
            FileInfo[] files; bool isRead = true; bool isProcessed = true; string strMsg = ""; string fileFormat = csvFormat; int masterId = 0;
            var extKPIFList = Cldb.EXTERNAL_KPI_FORMULAS.GetAll().Where(x => x.ISACTIVE).ToList();
            var pp = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(s => s.ISACTIVE && s.CUST_ID == customerId).ToList();
            string path = uploadFilePath + kpiRulesInput;
            if (CheckIfFilesExists(HttpContext.Current.Server.MapPath(path), out files, fileFormat))
            {
                foreach (FileInfo fi in files)
                {
                    var dt = GetDataTableFromCsv(fi.FullName, true);

                    if (isRead)
                    {
                        foreach (DataRow dr in dt.Rows)
                        {
                            var product = pp.FirstOrDefault(x => x.PRODUCT_TITLE == dr[1].ToString().Trim());
                            var extKPIF = extKPIFList.FirstOrDefault(x => x.SLA_ID == dr[0].ToString().Trim() && x.PRODUCT_ID == product.ID);
                            if (extKPIF != null)
                            {
                                extKPIF.SLA_ID = dr[0].ToString().Trim();
                                extKPIF.PRODUCT_ID = product.ID;
                                extKPIF.Rule_Description = dr[2].ToString().Trim();
                                extKPIF.Formula_Numerator = dr[3].ToString().Trim();
                                extKPIF.Formula_Denominator = dr[4].ToString().Trim();
                                extKPIF.CUSTOMER_ID = customerId;
                                UpdateAuditFields(extKPIF);
                                Cldb.EXTERNAL_KPI_FORMULAS.Update(extKPIF);
                            }
                            else
                            {
                                extKPIF = new EXTERNAL_KPI_FORMULAS();
                                extKPIF.SLA_ID = dr[0].ToString();
                                extKPIF.PRODUCT_ID = product.ID;
                                extKPIF.Rule_Description = dr[2].ToString();
                                extKPIF.Formula_Numerator = dr[3].ToString();
                                extKPIF.Formula_Denominator = dr[4].ToString();
                                extKPIF.CUSTOMER_ID = customerId;
                                UpdateAuditFields(extKPIF);
                                Cldb.EXTERNAL_KPI_FORMULAS.Add(extKPIF);
                            }
                        }
                        Cldb.Commit(CanCommit);

                        MoveFile(fi, HttpContext.Current.Server.MapPath(uploadFilePath + kpiRulesSuccess), fileFormat);
                    }
                    else
                    {
                        MoveFile(fi, HttpContext.Current.Server.MapPath(uploadFilePath + kpiRulesFailed), fileFormat);
                    }

                }
            }
            else
            {
                // Files not exist
            }
        }

        private string ImportKPIDataToDatabase(string customerId, DateTime date, string source)
        {
            var empId = GetHeaderDetails_String("empId");
            FileInfo[] files; var kpiJArray = new JArray();
            string fileFormat = csvFormat; var errorMsg = string.Empty;
            if (source == sourceZIF)
                fileFormat = jsonFormat;
            string path = uploadFilePath + kpiDataInput;

            var configVal = helper.GetDBConfig($"KPIDATA_REQUIREDFIELDS_{source}", customerId).ToLower();
            if (CheckIfFilesExists(HttpContext.Current.Server.MapPath(path), out files, fileFormat))
            {
                foreach (FileInfo fi in files)
                {
                    DataTable dt = null; string missedRequiredFields = string.Empty;
                    var externalKpiData = CSPdb.AppRepo.GetExternalKPIstoProcess(customerId, source, date.AddDays(-7), date);
                    try
                    {
                        if (source.ToLower() == sourceFreshWorks)
                        {
                            dt = GetDataTableFromCsv(fi.FullName, true);
                            if (dt == null)
                            {
                                errorMsg = "Data Table From Csv is Empty";
                                MoveFile(fi, HttpContext.Current.Server.MapPath(uploadFilePath + kpiDataFailed), fileFormat);
                                return errorMsg;
                            }

                            if (dt != null)
                            {
                                missedRequiredFields = GetMissedRequiredFieldsInDataTable(dt, configVal, customerId);
                                if (!string.IsNullOrEmpty(missedRequiredFields))
                                {
                                    errorMsg = $"The excel has some missing fields which are required for calculation. Missing Fields:'{missedRequiredFields}'";
                                    MoveFile(fi, HttpContext.Current.Server.MapPath(uploadFilePath + kpiDataFailed), fileFormat);
                                    return errorMsg;
                                }
                                kpiJArray = JArray.FromObject(dt, JsonSerializer.CreateDefault(new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }));
                            }
                        }
                        else if (source.ToLower() == sourceZIF)
                        {
                            string strJson = GetContentFromJson(fi.FullName);
                            //read the json 
                            Root list = JsonConvert.DeserializeObject<Root>(strJson);
                            if (!string.IsNullOrEmpty(strJson))
                            {
                                kpiJArray.Add(JToken.Parse(strJson));
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        LogRequest(ex);
                        MoveFile(fi, HttpContext.Current.Server.MapPath(uploadFilePath + kpiDataFailed), fileFormat);
                        return ex.Message;
                    }
                    if (kpiJArray != null && kpiJArray.Count > 0)
                    {
                        DataTable extDt = new DataTable();
                        DataColumn dc = new DataColumn("KPI_DATA");
                        extDt.Columns.Add(dc);
                        foreach (JToken jToken in kpiJArray)
                        {
                            var dr = extDt.NewRow();
                            dr[0] = jToken.ToString(Formatting.Indented);
                            extDt.Rows.Add(dr);
                        }
                        try
                        {
                            CSPdb.AppRepo.InsertExternalKPIData(extDt, empId, customerId, date, source, fi.Name);
                        }
                        catch (Exception ex)
                        {
                            errorMsg = ex.Message;
                            LogRequest(ex);
                        }
                    }
                    if (!string.IsNullOrEmpty(errorMsg))
                    {
                        MoveFile(fi, HttpContext.Current.Server.MapPath(uploadFilePath + kpiDataFailed), fileFormat);
                        return errorMsg;
                    }
                    MoveFile(fi, HttpContext.Current.Server.MapPath(uploadFilePath + kpiDataSuccess), fileFormat);
                }

            }
            else
            {
                // Files not exist
            }
            return errorMsg;
        }
        private string GetMissedRequiredFieldsInDataTable(DataTable dt, string configval, string custId)
        {
            var reqFields = configval.Split(',');
            string missedFields = string.Empty;
            var columnNames = (from dc in dt.Columns.Cast<DataColumn>()
                               select dc.ColumnName.ToLower()).ToArray();
            foreach (string field in reqFields)
            {
                if (!columnNames.Contains(field))
                {
                    if (!string.IsNullOrEmpty(missedFields)) missedFields += ", ";
                    missedFields += char.ToUpper(field[0]) + field.Substring(1);
                }
            }
            return missedFields;
        }

        private DateTime GetMinDateFromDataTable(DataTable dt)
        {
            return dt.Rows.OfType<DataRow>().Select(k => Convert.ToDateTime(k[createdDtField])).Min();
        }
        private bool CheckIfFilesExists(string ipPath, out FileInfo[] files, string fileFormat)
        {
            var dir = new DirectoryInfo(ipPath);
            files = null;
            if (dir.Exists)
            {
                files = dir.GetFiles("*." + fileFormat);
                if (files.Length > 0)
                    return true;
                else
                    return false;
            }
            else
            {
                // directoy not exist
                return false;
            }
        }
        DataTable GetDataTableFromCsv(string path, bool isFirstRowHeader)
        {
            string header = isFirstRowHeader ? "Yes" : "No";

            string pathOnly = Path.GetDirectoryName(path);
            string fileName = Path.GetFileName(path);

            string sql = @"SELECT * FROM [" + fileName + "]";
            string excelConnectionString = "";// string.Format("Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties='Excel 12.0 Csv;HDR=YES;READONLY=FALSE;'", pathOnly);
                                              //var oledb12Installed = new System.Data.OleDb.OleDbEnumerator().GetElements().AsEnumerable().Any(x => x.Field<string>("SOURCES_NAME") == "Microsoft.ACE.OLEDB.12.0");
                                              //if (!oledb12Installed)
            excelConnectionString = @"Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + pathOnly + ";Extended Properties=\"Text;HDR=" + header + "\"";
            using (OleDbConnection connection = new OleDbConnection(excelConnectionString))
            using (OleDbCommand command = new OleDbCommand(sql, connection))
            using (OleDbDataAdapter adapter = new OleDbDataAdapter(command))
            {
                DataTable dataTable = new DataTable();
                // dataTable.Locale = CultureInfo.CurrentCulture;
                adapter.Fill(dataTable);
                return dataTable;
            }
        }
        public DataTable GetDataTableFromJson(string path)
        {
            if (File.Exists(path))
            {
                string strjson = File.ReadAllText(path);
                var json = JObject.Parse(strjson);
                var table = JsonConvert.DeserializeObject<DataTable>(json.ToString());

                return table;
            }
            return null;
        }
        public string GetContentFromJson(string path)
        {
            if (File.Exists(path))
            {
                string strjson = File.ReadAllText(path);

                //if (fileTypeData == fileType)
                //    masterId = AddExtKPIMaster(source, customerId, fileName);
                return strjson;
            }
            return string.Empty;
        }

        private EXTERNAL_KPI_DATA_MASTER AddExtKPIMaster(string source, string customerId, string fileName)
        {
            var extKPIMaster = new EXTERNAL_KPI_DATA_MASTER();
            extKPIMaster.ISACTIVE = true;
            extKPIMaster.FILE_NAME = fileName;
            extKPIMaster.CUST_ID = customerId;
            extKPIMaster.SOURCE = source;
            UpdateAuditFields(extKPIMaster);
            Cldb.EXTERNAL_KPI_DATA_MASTER.Add(extKPIMaster);
            Cldb.Commit(CanCommit);
            return extKPIMaster;
        }
        private void ProcessBaseMeasureExtKPIDataList(List<BaseMeasureKPIDataMap> baseMeasureKPIDataMapList)
        {
            var empId = GetHeaderDetails_String("empId");
            var bmkList = new List<BASE_MEASURE_EXTERNAL_KPI_DATA>();
            foreach (var bmk in baseMeasureKPIDataMapList)
            {
                foreach (var item in bmk.listkpiIdJson)
                {
                    bmkList.Add(new BASE_MEASURE_EXTERNAL_KPI_DATA()
                    {
                        KPI_BASE_MEASURE_VALUE_ID = bmk.baseMeasureValueId,
                        EXTERNAL_KPI_DATA_ID = item.id,
                        KPI_DATA_JSON = item.json,
                        KPI_DATATYPE = bmk.kpiDataType
                    });
                }
            }
            var temp = bmkList.Select(x => new { x.KPI_BASE_MEASURE_VALUE_ID, x.EXTERNAL_KPI_DATA_ID, x.KPI_DATATYPE, x.KPI_DATA_JSON }).ToList();
            DataTable dt = ToDataTable(temp);
            CSPdb.AppRepo.UpdateExistingBaseMeasureKPIdataMap(dt, empId);
        }
        private bool MoveFile(FileInfo fi, string destPath, string fileFormat)
        {
            var createDirectory = destPath;
            if (!Directory.Exists(createDirectory))
            {
                Directory.CreateDirectory(createDirectory);
            }
            //fi.MoveTo(string.Format(@"{0}{1}_{2}.{3}", destPath, fi.Name.Replace(fi.Extension, ""), DateTime.Now.ToString("yyyy_MM_HHmmss"), fileFormat));
            fi.MoveTo(string.Format(@"{0}{1}", destPath, fi.Name));
            return true;
        }
    }

    public class ExternalKPIData
    {
        public string deviceName { get; set; }
        public double actual { get; set; }
        public int PercentLoss { get; set; }
        public string frequency { get; set; }
        public string customerId { get; set; }
        public string projectId { get; set; }
        public string successGoal { get; set; }
        public string kpiIdentifier { get; set; }
        public string area { get; set; }
        public string status { get; set; }
        public DateTime period { get; set; }
        public string location { get; set; }
        public string deviceType { get; set; }
        public string ipAddress { get; set; }

        public string keyword { get; set; }

    }

    public class Root
    {
        public int id { get; set; }
        public List<ExternalKPIData> csm_data { get; set; }
    }
    public class KPIIdJson
    {
        public int id { get; set; }
        public string json { get; set; }
    }
    public class BaseMeasureKPIDataMap
    {
        public int baseMeasureValueId { get; set; }
        public List<KPIIdJson> listkpiIdJson { get; set; }
        public int kpiDataType { get; set; }
    }
}
