using AttributeRouting.Helpers;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        private readonly string DateFormatKPI = "{0:yyyy-MM-dd}";
        private readonly string UptimeText = "System Uptime";

        [GET("GetPortfolioWithProductList"), ActionName("GetPortfolioWithProductList"), HttpGet]
        public IHttpActionResult GetPortfolioWithProductList(string customerId)
        {
            var products = new List<PORTFOLIO_PRODUCT>();
            if (string.IsNullOrWhiteSpace(customerId))
            {
                products = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(x => x.ISACTIVE).ToList();
            }
            else
            {
                products = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(x => x.CUST_ID == customerId && x.ISACTIVE).ToList();
            }

            List<int> portfolioId = products.Select(t => t.PORTFOLIO_ID).Distinct().ToList();
            var results = CSPdb.PORTFOLIO.GetAll().Where(t => portfolioId.Contains(t.ID) && t.ISACTIVE).OrderBy(x => x.TITLE).ToList();
            return Ok(results);
        }

        [GET("GetProductList")]
        [ActionName("GetProductList")]
        [HttpGet]
        public IHttpActionResult GetProductList(string custId, int portId)
        {
            List<PORTFOLIO_PRODUCT> results = new List<PORTFOLIO_PRODUCT>();
            if (portId == 0)
            {
                results = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(t => t.ISACTIVE && t.CUST_ID == custId).OrderBy(t => t.PRODUCT_TITLE).ToList();
            }
            else
            {
                results = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(t => t.CUST_ID == custId && t.PORTFOLIO_ID == portId && t.ISACTIVE).OrderBy(t => t.PRODUCT_TITLE).ToList();
            }

            return Ok(results);
        }
        [GET("GetProductListByCustId")]
        [ActionName("GetProductListByCustId")]
        [HttpGet]
        public IHttpActionResult GetProductListByCustId(string custId)
        {
            List<PORTFOLIO_PRODUCT> results = new List<PORTFOLIO_PRODUCT>();
            if (string.IsNullOrEmpty(custId))
            {
                results = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(t => t.ISACTIVE).OrderBy(t => t.PRODUCT_TITLE).ToList();
            }
            else
            {
                results = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(t => t.CUST_ID == custId && t.ISACTIVE).OrderBy(t => t.PRODUCT_TITLE).ToList();
            }

            return Ok(results);
        }
        [GET("GetKpiMetrics")]
        [ActionName("GetKpiMetrics")]
        [HttpGet]
        public IHttpActionResult GetKpiMetrics(int prodId, int modeId, DateTime date, bool excludeExclusions = false)
        {
            LogRequest(prefix: "GetKpiMetrics");
            var watch = Stopwatch.StartNew();
            date = new DateTime(date.Year, date.Month, date.Day);
            DateRange range = new DateRange(date, enDateRange.Monthly);
            DateTime stDate = range.StartDate;
            var startDate = string.Format(DateFormatKPI, stDate);
            DateTime enDate = range.EndDate;
            var endDate = string.Format(DateFormatKPI, enDate);
             
            var result = CSPdb.AppRepo.GetKpiMetrics(prodId, modeId, startDate, endDate.ToString()).OrderBy(x => x.REFERENCE).ToList();

            string kpiDetailIds = string.Join(",", result.Select(x => x.DETAIL_ID));
            var capStageIds = Cldb.AppRepo.getCAPAStages(kpiDetailIds).ToList();
            foreach (var item in result)
            {
                item.CAPA_STAGE_ID = capStageIds.FirstOrDefault(x => x.DETAIL_ID == item.DETAIL_ID)?.CAPA_STAGE_ID;
            }

            var hideUOMMetrics = helper.GetDBConfig("HIDE_UOM", PREMIER_CUSTOMER_ID);
            var monthly = result.Where(x => x.FREQUENCY == "Monthly").ToList();
            var quarterly = result.Where(x => x.FREQUENCY == "Quarterly").ToList();
            if (monthly.All(x => x.IS_DRAFT == false) && quarterly.Any() && DateTime.Compare(DateTime.Now, enDate) > 0)
            {
                quarterly.ForEach(x => x.IS_DRAFT = false);
            }
            foreach (var item in result)
            {
                item.GUID = Guid.NewGuid().ToString();
                item.HIDE_UOM = hideUOMMetrics.Contains(item.SERVICE_LEVEL_METRICS) ? true : false;
            }
            FillResponseTime(watch);
            return Ok(result);
        }

        [POST("GetKpiMetricsAdditionalData")]
        [ActionName("GetKpiMetricsAdditionalData")]
        [HttpPost]
        public IHttpActionResult GetKpiMetricsAdditionalData([FromBody] List<KPIDetailsHolder> kpiDetails)
        {
            LogRequest(prefix: "GetKpiMetricsAdditionalData", content: JsonConvert.SerializeObject(kpiDetails));
            var watch = Stopwatch.StartNew();

            var capaDataCollection = new CAPADataHolder();
            var baseMeasureDataCollection = GetBaseMeasureDataCollection(kpiDetails.Select(x => new Tuple<int, int>(x.KPI_ID, x.DETAIL_ID.GetValueOrDefault(0))).ToList());

            capaDataCollection = GetCAPAAndRCADataCollection(kpiDetails.Where(x => x.DETAIL_ID.HasValue).Select(x => x.DETAIL_ID.Value).ToList());
            var kpiDetailsIdList = kpiDetails.Where(x => x.DETAIL_ID.HasValue).Select(x => x.DETAIL_ID.Value).ToList();
            var kpiDetailsEty = CSPdb.KPI_DETAILS.GetAll().Where(x => x.ISACTIVE && kpiDetailsIdList.Contains(x.ID)).ToList();
            var rejectionData = GetSLARejectionData(kpiDetailsIdList);

            var comments = Cldb.KPI_DETAILS_COMMENT.GetAll().Where(x => kpiDetailsIdList.Contains(x.KPI_DETAILS_ID) && x.ISACTIVE).ToList();

            foreach (var item in kpiDetails)
            {
                var kpiDetail = kpiDetailsEty.FirstOrDefault(x => x.ID == item.DETAIL_ID);

                if (baseMeasureDataCollection.BaseMeasureData.Count > 0)
                {
                    item.BaseMeasureDataList = baseMeasureDataCollection.BaseMeasureData[item.KPI_ID];
                    item.ExclusionBaseMeasureDataList = baseMeasureDataCollection.ExclusionBaseMeasureData[item.KPI_ID];
                    if (item.ExclusionBaseMeasureDataList.Any(x => x.BaseMeasureValueId > 0))
                    {
                        item.IS_EXCLUSION = true;
                        item.EXCLUSION_COMMENT = kpiDetail.EXCLUSION_COMMENT;
                    }
                    //if (!item.ExclusionBaseMeasureDataList.Any(x=>x.IsExclusion))
                    //    item.ExclusionBaseMeasureDataList = item.BaseMeasureDataList;
                }

                if (kpiDetail != null && kpiDetail.SLA_STATUS == "Not Met")
                    item.CapaStage = GetCAPAStagesForKPIInternal(item.DETAIL_ID.GetValueOrDefault(), capaDataCollection);
                else item.CapaStage = new FINDING_STAGE_DATA
                {
                    AUDIT_REPORTING_FINDING = new AUDIT_REPORTING_FINDING { FINDINGS = new AUDIT_CHECKLIST_PROJECT_FINDINGS { } },
                    CAPA_REVIEW = new CAPA_REVIEW { CAPA = new List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED>() },
                    CAP_IMPLEMENTATION = new AUDIT_CAPA_IMPLEMENTATION { CAPA = new List<AUDIT_FINDING_CAPA_IMPLEMENTATION>() },
                    CAP_VERIFICATION = new AUDIT_REPORTING_VERIFICATION { CAPA = new List<AUDIT_FINDING_CAPA_VERIFICATION>() },
                    CAPA_SUBMISSION = new CAPA_SUBMISSION { CAPA = new List<AUDIT_FINDING_CAPPA_EXT>() },
                    CAPA_CUSTOMER_APPROVAL = new CAPA_CUSTOMER_APPROVAL { CAPA = new List<CUSTOMER_CAPA_APPROVAL>() }
                };

                if (rejectionData.Count > 0)
                    item.SLA_Rejection_data = rejectionData.FirstOrDefault(x => x.SLA_REJECTION_KPI_DETAILS.KPI_DETAILS_ID == item.DETAIL_ID);
                else if (rejectionData.Count == 0 || item.SLA_Rejection_data == null)
                    item.SLA_Rejection_data = new SLA_Rejection_data
                    {
                        REJECTION_COMMENTS = new List<string>(),
                        SLA_REJECTION_KPI_DETAILS = new SLA_REJECTION_KPI_DETAILS() { KPI_DETAILS_ID = item.DETAIL_ID.GetValueOrDefault() }
                    };

                var commentEty = comments.Where(x => x.KPI_DETAILS_ID == item.DETAIL_ID).OrderByDescending(x => x.ID).FirstOrDefault() ?? new Model.AllSys.KPI_DETAILS_COMMENT();

                item.KPI_DETAILS_COMMENT = commentEty;
                item.KPI_DETAILS_COMMENT.CAN_ADD_COMMENTS = !rejectionData.Any(x => x.SLA_REJECTION_KPI_DETAILS.KPI_DETAILS_ID == item.DETAIL_ID);

            }
            FillResponseTime(watch);
            return Ok(kpiDetails);
        }

        [POST("AddKpiDetailsByProduct")]
        [ActionName("AddKpiDetailsByProduct")]
        [HttpPost]
        public IHttpActionResult AddKpiDetailsByProduct([FromBody] List<KPI_SERVICE_LEVEL_METRICS> serviceMetrics, DateTime date)
        {

            LogRequest(prefix: "AddKpiDetailsByProduct", content: JsonConvert.SerializeObject(serviceMetrics));
            string debugs = "incoming count" + serviceMetrics.Count.ToString();

            var watch = Stopwatch.StartNew();
            var empId = GetHeaderDetails_String("empId");
            var isDraft = Convert.ToBoolean(GetHeaderDetails_Int("isDraft"));
            debugs += "~ isDraft: " + isDraft.ToString();
            var newEntities = new List<KPI_DETAILS>();
            var updatedEntities = new List<KPI_DETAILS>();
            if (!isDraft)
            {
                if (serviceMetrics.Any(x => x.IS_NOT_APPLICABLE == false && string.IsNullOrWhiteSpace(x.KPI_ACTUAL) && !x.IS_NO_DATA))
                {
                    return Content(HttpStatusCode.Conflict, "Please fill all the Service Metrics to Submit. If any Service Metrics is not applicable for the period, mark as NA/ND");
                }
            }
            var products = serviceMetrics.Select(x => x.PRODUCT_ID).Distinct().ToList();
            var existingEntities = CSPdb.KPI_DETAILS.GetAll().Where(x => x.ISACTIVE && x.PRODUCT_ID.HasValue && x.PERIOD.Year == date.Year && products.Contains(x.PRODUCT_ID.Value)).ToList();
            debugs += "~ existing: " + existingEntities.Count.ToString();

            var entitiestoUpdate = serviceMetrics.Where(x => !string.IsNullOrEmpty(x.KPI_ACTUAL) || x.IS_NOT_APPLICABLE || x.IS_NO_DATA).Distinct().ToList();

            debugs += "~ to update: " + entitiestoUpdate.Count.ToString();
            foreach (var kd in entitiestoUpdate)
            {
                var existing = existingEntities.FirstOrDefault(x => x.KPI_ID == kd.KPI_ID && x.ID == kd.DETAIL_ID && x.PERIOD_TYPE == kd.FREQUENCY && x.PRODUCT_ID == kd.PRODUCT_ID);
                if (existing == null)
                {
                    var kpiDetailsEntitites = AddKPIDetailsData(kd, date, isDraft);
                    newEntities.Add(kpiDetailsEntitites);
                }
                else
                {
                    var updatedKpiDetails = UpdateKPIDetails(kd, existing, date, isDraft);
                    updatedEntities.Add(updatedKpiDetails);
                }
            }
            debugs += "~ new entities: " + newEntities.Count.ToString();
            debugs += "~ updated entities: " + updatedEntities.Count.ToString();
            foreach (var item in newEntities)
            {
                CSPdb.KPI_DETAILS.Add(item);
            }
            foreach (var item in updatedEntities)
            {
                CSPdb.KPI_DETAILS.Update(item);
            }
            CSPdb.Commit(CanCommit);
            LogRequest(prefix: "AddKpiDetailsByProduct", content: debugs);
            var input = new Dictionary<int, List<BaseMeasureData>>();
            foreach (var item in newEntities)
            {
                input[item.ID] = serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID)?.BaseMeasureDataList;
            }
            foreach (var item in updatedEntities)
            {
                input[item.ID] = serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID)?.BaseMeasureDataList;
            }
            UpdateBaseMeasureValueCollection(input, false);
            var exclusionInput = new Dictionary<int, List<BaseMeasureData>>();
            foreach (var item in newEntities)
            {
                if (serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID).IS_EXCLUSION)
                    exclusionInput[item.ID] = serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID)?.ExclusionBaseMeasureDataList;
            }
            foreach (var item in updatedEntities)
            {
                if (serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID).IS_EXCLUSION)
                    exclusionInput[item.ID] = serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID)?.ExclusionBaseMeasureDataList;
                else
                {
                    //delete existing base measure value if any
                    var existing = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().Where(x => x.KPI_DETAILS_ID == item.ID && x.IS_EXCLUSION == true).ToList();
                    if (existing.Any())
                        CSPdb.KPI_BASE_MEASURE_VALUE.DeleteList(existing);
                }
            }
            UpdateBaseMeasureValueCollection(exclusionInput, true);
            CSPdb.Commit(CanCommit);

            foreach (var item in newEntities)
            {
                var isExclusion = serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID).IS_EXCLUSION;
                if (checkIfCAPARequired(item, isExclusion))
                    AddCapaForKPIInternal(serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID)?.CapaStage, item, serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID).SERVICE_LEVEL_METRICS, date, empId);
            }
            foreach (var item in updatedEntities)
            {
                var isExclusion = serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID).IS_EXCLUSION;
                if (checkIfCAPARequired(item, isExclusion))
                    AddCapaForKPIInternal(serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID).CapaStage, item, serviceMetrics.FirstOrDefault(x => x.GUID == item.GUID).SERVICE_LEVEL_METRICS, date, empId);

            }

            CSPdb.Commit(CanCommit);

            var slaStatusChangedFromNotMetToMet = updatedEntities.Where(x => x.IS_SLA_STATUS_CHANGED).ToList();

            if (slaStatusChangedFromNotMetToMet.Count > 0)
            {
                foreach (var row in slaStatusChangedFromNotMetToMet)
                {
                    UpdateCAPAForKPI(row.ID);
                }
            }

            if (!isDraft   && serviceMetrics.Any())
            {
                //send mail.
                var kpiDetails = serviceMetrics.FirstOrDefault();
              
                if (kpiDetails != null)
                {
                    var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDetails.PRODUCT_ID);
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("<table border=1  cellspacing=0 >");
                    sb.AppendLine("<tr><th>Frequency</th><th>Service Level Metrics</th><th>Specification Limit</th><th>Service Tower</th><th>Service Level</th><th>Expected Service Level</th><th>Minimum Service Level</th><th>KPI Achievements</th><th>Service Level Status(Expected)</th><th>Service Level Status(Minimum)</th><th>Exclusion KPI Achievements</th><th>Remarks</th></tr>");
                    foreach (var item in serviceMetrics)
                    {
                        sb.Append("<tr>");
                        sb.Append($"<td>{item.FREQUENCY}</td>");
                        sb.Append($"<td>{item.SERVICE_LEVEL_METRICS}</td>");
                        sb.Append($"<td>{item.SPECIFICATION_LIMIT}</td>");
                        sb.Append($"<td>{item.SERVICE_AREA_TYPE}</td>");
                        sb.Append($"<td>{item.SERVICE_LEVEL}</td>");
                        sb.Append($"<td>{item.EXPECTED_SERVICE_LEVEL + item.UNIT_OF_MEASUREMENT}</td>");
                        sb.Append($"<td>{item.MINIMUM_SERVICE_LEVEL + item.UNIT_OF_MEASUREMENT}</td>");
                        if (item.IS_NOT_APPLICABLE)
                        {
                            sb.Append($"<td>N/A</td>");
                            sb.Append($"<td>N/A</td>");
                            sb.Append($"<td>N/A</td>");
                            sb.Append($"<td>N/A</td>");
                            sb.Append($"<td>{item.REMARKS }</td>");
                        }
                        else
                        {
                            sb.Append($"<td>{  item.KPI_ACTUAL + item.UNIT_OF_MEASUREMENT}</td>");
                            sb.Append($"<td>{item.SLA_STATUS}</td>");
                            sb.Append($"<td>{item.SECONDARY_SLA_STATUS}</td>");
                            if (!string.IsNullOrWhiteSpace(item.EXCLUSION_KPI_ACTUAL))
                                sb.Append($"<td>{  item.EXCLUSION_KPI_ACTUAL + item.UNIT_OF_MEASUREMENT}</td>");
                            else
                                sb.Append($"<td> </td>");
                            sb.Append($"<td></td>");
                        }
                        sb.AppendLine("</tr>");
                    }

                    sb.AppendLine("</table>");
                    //string SenderEmaiId = string.Empty;
                    var productResponsibleList = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == product.ID && x.ISACTIVE).ToList();
                    var cc = IsPremier(product.CUST_ID) ? Constants.PREMIER_QUALITY_TEAM : string.Empty;
                    if (productResponsibleList.Any())
                    {
                        var emails = helper.GetEmployeeMailIdList(productResponsibleList.Select(x => x.EMP_ID).ToList());
                        cc = string.Join(",", emails);
                    }
                    var to = IsPremier(product.CUST_ID) ? Constants.PREMIER_QUALITY_TEAM : cc;
                    string filePath = HttpContext.Current.Server.MapPath("~/UploadFile/Mails/") + "SubmittedSlaMetrics.htm";
                    using (System.IO.StreamReader sr = new StreamReader(filePath))
                    {

                        string emailContent = sr.ReadToEnd();
                        var subject = $"KPI details submitted for {product.PRODUCT_TITLE} for {date.ToString("MMM-yyyy")}";
                        var requestDomain = helper.GetAbsoulteUri();
                        emailContent = emailContent.Replace("{{TABLE}}", sb.ToString());
                        emailContent = emailContent.Replace("{{PRODUCT_TITLE}}", product.PRODUCT_TITLE);
                        emailContent = emailContent.Replace("{{PERIOD}}", date.ToString("MMM-yyyy"));
                        emailContent = emailContent.Replace("{{URL}}", $"{requestDomain}/kpi/{product.CUST_ID}");
                       
                        int year = 0;
                        if (int.TryParse(date.ToString("yyyy"), out year))
                        {
                            emailContent = emailContent.Replace("{{REVISEURL}}", $"{requestDomain}/successgoal/metric/{product.CUST_ID}/" + product.ID + "/" + kpiDetails.MODE_ID + "/" + date.ToString("MMM") + "/" + year + "/" + "true");
                        }
                        //emailContent = emailContent.Replace("{{TO_NAME}}", "Quality Team");
                        var ep = new EmailProvider(Cldb, CSPdb);
                        ep.SendEmail
                            (
                            new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                            new EmailContent { from = _email, to = to, cc = cc, bcc = Constants.BCC, content = emailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }, Request
                            );
                    }
                }
            }
            FillResponseTime(watch);
            return Ok();
        }

        public bool checkIfCAPARequired(KPI_DETAILS kpiDetails, bool isExclusion)
        {
            //var isExclusion = kpiDetails.IS_EXCLUSION;
            if (!isExclusion)
            {
                if (kpiDetails.SLA_STATUS == "Not Met")
                    return true;
            }
            if (isExclusion)
            {
                if (kpiDetails.SLA_STATUS == "Not Met" && kpiDetails.EXCLUSION_SLA_STATUS == "Not Met")
                    return true;
                if (kpiDetails.SLA_STATUS == "Met" && kpiDetails.EXCLUSION_SLA_STATUS == "Not Met")
                    return true;
            }
            return false;
        }

        [GET("GetServiceLevelModes")]
        [ActionName("GetServiceLevelModes")]
        [HttpGet]
        public IHttpActionResult GetServiceLevelModes(int prodId)
        {
            var products = CSPdb.PRODUCT_MODE_MAPPING.GetAll().Where(t => t.ISACTIVE && t.PRODUCT_ID == prodId).ToList();
            List<int> modeId = products.Select(t => t.MODE_ID).Distinct().ToList();
            var results = CSPdb.PRODUCTS_SERVICE_LEVEL_MODE.GetAll().Where(t => modeId.Contains(t.ID) && t.ISACTIVE).ToList();
            return Ok(results);
        }

        [GET("GetProductName")]
        [ActionName("GetProductName")]
        [HttpGet]
        public IHttpActionResult GetProductName(int prodId)
        {
            var productName = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == prodId)?.PRODUCT_TITLE;
            return Ok(productName);
        }
        [GET("GetProductServiceArea")]
        [ActionName("GetProductServiceArea")]
        [HttpGet]
        public IHttpActionResult GetProductServiceArea()
        {
            var results = CSPdb.PRODUCTS_SERVICE_AREA.GetAll().Where(t => t.ISACTIVE).ToList();
            return Ok(results);
        }

        [GET("GetServiceLevel")]
        [ActionName("GetServiceLevel")]
        [HttpGet]
        public IHttpActionResult GetServiceLevel()
        {
            var results = CSPdb.PRODUCTS_SERVICE_LEVEL_TYPE.GetAll().Where(t => t.ISACTIVE).ToList();
            return Ok(results);
        }

        [GET("GetServiceReference")]
        [ActionName("GetServiceReference")]
        [HttpGet]
        public IHttpActionResult GetServiceReference()
        {
            var results = CSPdb.REFERENCE_MASTER.GetAll().Where(t => t.ISACTIVE).ToList();
            return Ok(results);
        }

        [POST("UpdateProductKPI")]
        [ActionName("UpdateProductKPI")]
        [HttpPost]
        public IHttpActionResult UpdateProductKPI(HttpRequestMessage request)
        {
            LogRequest(prefix: "UpdateProductKPI");
            var watch = Stopwatch.StartNew();
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            KPIWithTargets results = JsonConvert.DeserializeObject<KPIWithTargets>(json);
            KPI overview = CSPdb.KPI.GetById(results.ID);
            if (overview != null && results != null)
            {
                overview.SERVICE_AREA = results.SERVICE_AREA;
                overview.ABBREVIATION = results.ABBREVIATION;
                overview.KPI_NAME = results.KPI_NAME;
                overview.SUPPORT_WINDOW = results.SUPPORT_WINDOW;
                overview.FREQUENCY = results.FREQUENCY;
                overview.PRIORITY = results.PRIORITY;
                overview.SLA_TARGET_UNIT_OF_MEASUREMENT = results.SLA_TARGET_UNIT_OF_MEASUREMENT;
                overview.DISPLAY_ORDER = results.DISPLAY_ORDER;
                overview.CHART_TYPE = results.CHART_TYPE;
                overview.SHOW_IN_CHART = results.SHOW_IN_CHART;
                overview.GLOBAL_KPI_CATEGORY_ID = results.GLOBAL_KPI_CATEGORY_ID;
                overview.IS_SOW_COMMITMENT = results.IS_SOW_COMMITMENT;
                overview.PRODUCT_ID = results.PRODUCT_ID;
                overview.MODE_ID = results.MODE_ID;
                overview.UPDATED_BY = results.UPDATED_BY;
                overview.UPDATED_DATE = DateTime.Now;
                CSPdb.KPI.Update(overview);
                CSPdb.Commit(CanCommit);

                foreach (KPI_TARGETS t in results.KPI_TARGETS)
                {
                    if (t.ID == 0)
                    {
                        KPI_TARGETS target = new KPI_TARGETS();
                        target.KPI_ID = t.KPI_ID;
                        target.START_DATE = t.START_DATE.ToLocalTime();
                        target.END_DATE = t.END_DATE.ToLocalTime();
                        target.SLA_TARGET_HIGH_DESCRIPTION = t.SLA_TARGET_HIGH_DESCRIPTION;
                        target.SLA_TARGET_HIGH_OPERATOR = t.SLA_TARGET_HIGH_OPERATOR;
                        target.SLA_TARGET_HIGH_VALUE = t.SLA_TARGET_HIGH_VALUE;
                        target.SLA_TARGET_LOW_DESCRIPTION = t.SLA_TARGET_LOW_DESCRIPTION;
                        target.SLA_TARGET_LOW_OPERATOR = t.SLA_TARGET_LOW_OPERATOR;
                        target.SLA_TARGET_LOW_VALUE = t.SLA_TARGET_LOW_VALUE;
                        target.SLA_TARGET_MEDIUM_DESCRIPTION = t.SLA_TARGET_MEDIUM_DESCRIPTION;
                        target.SLA_TARGET_MEDIUM_OPERATOR = t.SLA_TARGET_MEDIUM_OPERATOR;
                        target.SLA_TARGET_MEDIUM_VALUE = t.SLA_TARGET_MEDIUM_VALUE;
                        target.SLA_TARGET_VERYHIGH_DESCRIPTION = t.SLA_TARGET_VERYHIGH_DESCRIPTION;
                        target.SLA_TARGET_VERYHIGH_OPERATOR = t.SLA_TARGET_VERYHIGH_OPERATOR;
                        target.SLA_TARGET_VERYHIGH_VALUE = t.SLA_TARGET_VERYHIGH_VALUE;
                        target.EXPECTED_SERVICE_LEVEL = t.EXPECTED_SERVICE_LEVEL;
                        target.MINIMUM_SERVICE_LEVEL = t.MINIMUM_SERVICE_LEVEL;
                        target.SPECIFICATION_LIMIT = t.SPECIFICATION_LIMIT;
                        target.CREATED_BY = overview.CREATED_BY;
                        target.CREATED_DATE = DateTime.Now;
                        target.UPDATED_BY = overview.UPDATED_BY;
                        target.UPDATED_DATE = DateTime.Now;
                        target.ISACTIVE = true;
                        CSPdb.KPI_TARGETS.Add(target);
                        CSPdb.Commit(CanCommit);
                    }
                    else
                    {
                        KPI_TARGETS target = CSPdb.KPI_TARGETS.GetById(t.ID);
                        if (target != null)
                        {
                            target.START_DATE = t.START_DATE.ToLocalTime();
                            target.END_DATE = t.END_DATE.ToLocalTime();
                            target.SLA_TARGET_HIGH_DESCRIPTION = t.SLA_TARGET_HIGH_DESCRIPTION;
                            target.SLA_TARGET_HIGH_OPERATOR = t.SLA_TARGET_HIGH_OPERATOR;
                            target.SLA_TARGET_HIGH_VALUE = t.SLA_TARGET_HIGH_VALUE;
                            target.SLA_TARGET_LOW_DESCRIPTION = t.SLA_TARGET_LOW_DESCRIPTION;
                            target.SLA_TARGET_LOW_OPERATOR = t.SLA_TARGET_LOW_OPERATOR;
                            target.SLA_TARGET_LOW_VALUE = t.SLA_TARGET_LOW_VALUE;
                            target.SLA_TARGET_MEDIUM_DESCRIPTION = t.SLA_TARGET_MEDIUM_DESCRIPTION;
                            target.SLA_TARGET_MEDIUM_OPERATOR = t.SLA_TARGET_MEDIUM_OPERATOR;
                            target.SLA_TARGET_MEDIUM_VALUE = t.SLA_TARGET_MEDIUM_VALUE;
                            target.SLA_TARGET_VERYHIGH_DESCRIPTION = t.SLA_TARGET_VERYHIGH_DESCRIPTION;
                            target.SLA_TARGET_VERYHIGH_OPERATOR = t.SLA_TARGET_VERYHIGH_OPERATOR;
                            target.SLA_TARGET_VERYHIGH_VALUE = t.SLA_TARGET_VERYHIGH_VALUE;
                            target.EXPECTED_SERVICE_LEVEL = t.EXPECTED_SERVICE_LEVEL;
                            target.MINIMUM_SERVICE_LEVEL = t.MINIMUM_SERVICE_LEVEL;
                            target.SPECIFICATION_LIMIT = t.SPECIFICATION_LIMIT;
                            target.UPDATED_BY = t.UPDATED_BY;
                            target.UPDATED_DATE = DateTime.Now;
                            CSPdb.KPI_TARGETS.Update(target);
                            CSPdb.Commit(CanCommit);
                        }
                    }
                }
                foreach (PRODUCT_KPI_DETAILS d in results.PRODUCT_KPI_DETAILS)
                {
                    //PRODUCT_SERVICE_LEVEL_METRICS t = CSPdb.PRODUCT_SERVICE_LEVEL_METRICS.GetAll().FirstOrDefault(p => p.KPI_ID == d.KPI_ID);
                    //{
                    //    if (t != null)
                    //    {

                    //        t.REFERENCE_ID = d.REFERENCE;
                    //        t.SERVICE_AREA_TYPE_ID = d.SERVICE_AREA_ID;
                    //        t.SERVICE_LEVEL_TYPE_ID = d.SERVICE_LEVEL_ID;
                    //        t.SERVICE_LEVEL_METRIC_DESCRIPTION = d.SERVICE_LEVEL_METRIC_DESCRIPTION;
                    //        t.ISACTIVE = true;
                    //        t.UPDATED_BY = d.UPDATED_BY;
                    //        t.UPDATED_DATE = DateTime.Now;
                    //        CSPdb.PRODUCT_SERVICE_LEVEL_METRICS.Update(t);
                    //        CSPdb.Commit(CanCommit);
                    //    }

                    //}
                }
            }
            FillResponseTime(watch);
            return Ok();
        }

        [GET("GetServiceMetricsDashboardDataPortfolioWise"), ActionName("GetServiceMetricsDashboardDataPortfolioWise"), HttpGet]
        public IHttpActionResult GetServiceMetricsDashboardDataPortfolioWise(string customerId, string month, int year, bool bLastUpdated)
        {
            var watch = Stopwatch.StartNew();
            ProductKPIScores output = new ProductKPIScores();

            int monthNumber = DateTime.ParseExact(month, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(year, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);


            output.MONTH = range.StartDate.ToString("MMM");
            output.YEAR = range.StartDate.Year;
            DateTime startDate = range.StartDate;
            DateTime endDate = range.EndDate;

            var isCustomer = !IsGavs();
            //CSPdb.AppRepo.GetKPIWiseDataForPeriod(customerId, startDate, endDate, isCustomer),
            var portfolio_Kpi = GetPortfolioWiseKPICount(customerId, startDate, endDate);

            output.PORTFOLIO_WISE_KPI = portfolio_Kpi;

            FillResponseTime(watch);
            return Ok(output);
        }

        [GET("GetServiceMetricsDashboardDataProductWise"), ActionName("GetServiceMetricsDashboardDataProductWise"), HttpGet]
        public IHttpActionResult GetServiceMetricsDashboardDataProductWise(string customerId, string month, int year, bool bLastUpdated)
        {
            var watch = Stopwatch.StartNew();
            ProductKPIScores output = new ProductKPIScores();

            int monthNumber = DateTime.ParseExact(month, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(year, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            //if (bLastUpdated)
            //    range = GetProductKPILastUpdatedDate(customerId);

            output.MONTH = range.StartDate.ToString("MMM");
            output.YEAR = range.StartDate.Year;
            DateTime startDate = range.StartDate;
            DateTime endDate = range.EndDate;

            var isCustomer = !IsGavs();
            //CSPdb.AppRepo.GetKPIWiseDataForPeriod(customerId, startDate, endDate, isCustomer),

            var product_Kpi = CSPdb.AppRepo.GetProductWiseKPICount(customerId, startDate, endDate, isCustomer).ToList();
            var engagement_Kpi = CSPdb.AppRepo.GetEngagementWiseKPICount(customerId, startDate, endDate, isCustomer).ToList();

            var uptime = engagement_Kpi.FirstOrDefault(x => x.KPI_NAME == UptimeText);
            if (uptime != null)
            {
                var overallData = CSPdb.AppRepo.GetOverallProductWiseKPIData(0, startDate, endDate, isCustomer, false).ToList();
                var uptimeDetails = overallData.Where(x => x.SERVICE_LEVEL_METRICS == UptimeText).ToList();
                foreach (var item in uptimeDetails.Where(x => x.KPI_DENOMINATOR > 0).ToList())
                {
                    item.UPTIME_CALC = item.KPI_DENOMINATOR.GetValueOrDefault() * item.EXPECTED_SERVICE_LEVEL;
                }
                try
                {
                    var numer = uptimeDetails.Sum(x => x.UPTIME_CALC);
                    var denom = uptimeDetails.Sum(x => x.KPI_DENOMINATOR.GetValueOrDefault());
                    var exclusionDenom = uptimeDetails.Sum(x => x.EXCLUSION_KPI_DENOMINATOR ?? x.KPI_DENOMINATOR.GetValueOrDefault());
                    uptime.ACHIEVEMENT_VALUE = Math.Round(uptimeDetails.Sum(x => x.KPI_NUMERATOR.GetValueOrDefault()) / denom * 100, 3);
                    uptime.EXCLUSION_ACHIEVEMENT_VALUE = Math.Round(uptimeDetails.Sum(x => x.EXCLUSION_KPI_NUMERATOR ?? x.KPI_NUMERATOR.GetValueOrDefault()) / exclusionDenom * 100, 3);
                    uptime.EXPECTED_SERVICE_LEVEL = uptime.MINIMUM_SERVICE_LEVEL = Math.Round(numer / denom, 2);
                }
                catch (Exception ex)
                {
                    var a = ex;

                }

            }
            foreach (var item in engagement_Kpi)
            {
                if (item.EXCLUSION_ACHIEVEMENT_VALUE.GetValueOrDefault() == 0m)
                    item.EXCLUSION_ACHIEVEMENT_VALUE = item.ACHIEVEMENT_VALUE;
            }
            var productWiseCAPACount = CSPdb.AppRepo.GetProductWiseCAPACount(customerId, startDate, endDate, isCustomer).ToList();



            output.PRODUCT_WISE_KPI = product_Kpi;
            output.ENGAGEMENT_WISE_KPI = engagement_Kpi;
            output.HIGHLIGHTS = GetNotesForPeriodPvt(customerId, startDate); ;
            output.PRODUCT_WISE_CAPA_DETAILS = productWiseCAPACount;
            FillResponseTime(watch);
            return Ok(output);
        }
        //SDC Dashboard main method
        [Obsolete("Do not use this method. This method has been split into 2 methods for performance refacotring. ")]
        [GET("GetServiceMetricsForAPeriod"), ActionName("GetServiceMetricsForAPeriod"), HttpGet]
        public IHttpActionResult GetServiceMetricsForAPeriod(string customerId, string month, int year, bool bLastUpdated)
        {
            var watch = Stopwatch.StartNew();
            ProductKPIScores output = new ProductKPIScores();

            int monthNumber = DateTime.ParseExact(month, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(year, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            //if (bLastUpdated)
            //    range = GetProductKPILastUpdatedDate(customerId);

            output.MONTH = range.StartDate.ToString("MMM");
            output.YEAR = range.StartDate.Year;
            DateTime startDate = range.StartDate;
            DateTime endDate = range.EndDate;

            var isCustomer = !IsGavs();
            //CSPdb.AppRepo.GetKPIWiseDataForPeriod(customerId, startDate, endDate, isCustomer),
            var portfolio_Kpi = GetPortfolioWiseKPICount(customerId, startDate, endDate);
            var product_Kpi = CSPdb.AppRepo.GetProductWiseKPICount(customerId, startDate, endDate, isCustomer).ToList();
            var engagement_Kpi = CSPdb.AppRepo.GetEngagementWiseKPICount(customerId, startDate, endDate, isCustomer).ToList();

            var uptime = engagement_Kpi.FirstOrDefault(x => x.KPI_NAME == UptimeText);
            if (uptime != null)
            {
                var overallData = CSPdb.AppRepo.GetOverallProductWiseKPIData(0, startDate, endDate, isCustomer, false).ToList();
                var uptimeDetails = overallData.Where(x => x.SERVICE_LEVEL_METRICS == UptimeText).ToList();
                foreach (var item in uptimeDetails.Where(x => x.KPI_DENOMINATOR > 0).ToList())
                {
                    item.UPTIME_CALC = item.KPI_DENOMINATOR.GetValueOrDefault() * item.EXPECTED_SERVICE_LEVEL;
                }
                try
                {
                    var numer = uptimeDetails.Sum(x => x.UPTIME_CALC);
                    var denom = uptimeDetails.Sum(x => x.KPI_DENOMINATOR.GetValueOrDefault());
                    var exclusionDenom = uptimeDetails.Sum(x => x.EXCLUSION_KPI_DENOMINATOR ?? x.KPI_DENOMINATOR.GetValueOrDefault());
                    uptime.ACHIEVEMENT_VALUE = Math.Round(uptimeDetails.Sum(x => x.KPI_NUMERATOR.GetValueOrDefault()) / denom * 100, 3);
                    uptime.EXCLUSION_ACHIEVEMENT_VALUE = Math.Round(uptimeDetails.Sum(x => x.EXCLUSION_KPI_NUMERATOR ?? x.KPI_NUMERATOR.GetValueOrDefault()) / exclusionDenom * 100, 3);
                    uptime.EXPECTED_SERVICE_LEVEL = uptime.MINIMUM_SERVICE_LEVEL = Math.Round(numer / denom, 2);
                }
                catch (Exception ex)
                {
                    var a = ex;

                }

            }
            foreach (var item in engagement_Kpi)
            {
                if (item.EXCLUSION_ACHIEVEMENT_VALUE.GetValueOrDefault() == 0m)
                    item.EXCLUSION_ACHIEVEMENT_VALUE = item.ACHIEVEMENT_VALUE;
            }
            var productWiseCAPACount = CSPdb.AppRepo.GetProductWiseCAPACount(customerId, startDate, endDate, isCustomer).ToList();



            var result = GetNotesForPeriodPvt(customerId, startDate);
            output.PORTFOLIO_WISE_KPI = portfolio_Kpi;
            output.PRODUCT_WISE_KPI = product_Kpi;
            output.ENGAGEMENT_WISE_KPI = engagement_Kpi;
            output.HIGHLIGHTS = result;
            output.PRODUCT_WISE_CAPA_DETAILS = productWiseCAPACount;
            FillResponseTime(watch);
            return Ok(output);

        }

        private List<PORTFOLIO_WISE_KPI> GetPortfolioWiseKPICount(string customerId, DateTime startDate, DateTime endDate)
        {
            var result = new List<PORTFOLIO_WISE_KPI>();
            var isCustomer = !IsGavs();
            var portfolioProducts = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(x => x.ISACTIVE && x.CUST_ID == customerId && (!isCustomer || x.IS_SERVICE_COMMENCED == true)).ToList();
            var portfolioId = portfolioProducts.Select(t => t.PORTFOLIO_ID).Distinct().ToList();
            var portfolios = CSPdb.PORTFOLIO.GetAll().Where(t => portfolioId.Contains(t.ID) && t.ID != 99 && t.ISACTIVE).OrderBy(x => x.TITLE).ToList();
            var portfolio_KPI_Details = CSPdb.AppRepo.GetPortfolioWiseKPIDetails(customerId, startDate, endDate, isCustomer).ToList();
            var overallData = CSPdb.AppRepo.GetOverallProductWiseKPIData(0, startDate, endDate, isCustomer, false).ToList();
            var uptimeDetails = overallData.Where(x => x.KPI_NAME == UptimeText).ToList();
            foreach (var item in portfolios.OrderBy(x => x.TITLE))
            {
                if (!portfolioProducts.Any(x => x.PORTFOLIO_ID == item.ID && x.ISACTIVE)) continue;
                var toAdd = new PORTFOLIO_WISE_KPI
                {
                    PORTFOLIO_ID = item.ID,
                    TITLE = item.TITLE,
                    PRODUCT_COUNT = portfolioProducts.Count(x => x.PORTFOLIO_ID == item.ID && x.ISACTIVE),
                    OVERALL_KPI_COUNT = CSPdb.AppRepo.GetOverallKPICountForPortfolio(item.ID, startDate, endDate, isCustomer),
                };
                var portfolioKPIs = portfolio_KPI_Details.Where(x => x.PORTFOLIO_ID == item.ID).ToList();
                portfolioKPIs.ForEach(x =>
                {
                    UpdateKPIWiseData(x, uptimeDetails);
                });
                toAdd.OVERALL_KPI_COUNT = portfolioKPIs.Count;
                toAdd.KEY_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 1);
                toAdd.CRITICAL_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 2);
                toAdd.MET_KEY_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 1 && CheckSLAStatus(x.SLA_STATUS));
                toAdd.MET_CRITICAL_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 2 && CheckSLAStatus(x.SLA_STATUS));
                toAdd.SECONDARY_MET_KEY_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 1 && CheckSLAStatus(x.SECONDARY_SLA_STATUS));
                toAdd.SECONDARY_MET_CRITICAL_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 2 && CheckSLAStatus(x.SECONDARY_SLA_STATUS));

                toAdd.EXCLUSION_MET_KEY_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 1 && CheckSLAStatus(!string.IsNullOrWhiteSpace(x.EXCLUSION_SLA_STATUS) ? x.EXCLUSION_SLA_STATUS : x.SLA_STATUS));
                toAdd.EXCLUSION_MET_CRITICAL_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 2 && CheckSLAStatus(!string.IsNullOrWhiteSpace(x.EXCLUSION_SLA_STATUS) ? x.EXCLUSION_SLA_STATUS : x.SLA_STATUS));
                toAdd.EXCLUSION_SECONDARY_MET_KEY_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 1 && CheckSLAStatus(!string.IsNullOrWhiteSpace(x.EXCLUSION_SECONDARY_SLA_STATUS) ? x.EXCLUSION_SECONDARY_SLA_STATUS : x.SECONDARY_SLA_STATUS));
                toAdd.EXCLUSION_SECONDARY_MET_CRITICAL_KPI = portfolioKPIs.Count(x => x.SERVICE_LEVEL_TYPE_ID == 2 && CheckSLAStatus(!string.IsNullOrWhiteSpace(x.EXCLUSION_SECONDARY_SLA_STATUS) ? x.EXCLUSION_SECONDARY_SLA_STATUS : x.SECONDARY_SLA_STATUS));

                result.Add(toAdd);
            }


            return result;
        }

        private bool CheckSLAStatus(string status)
        {
            return status == "Met" || status == "NA" || status == "NT";
        }

        private void UpdateKPIWiseData(KPI_WISE_DATA x, List<PRODUCTWISEKPIDATA> uptimeDetails)
        {

            if (x.ISNA)
            {
                x.SLA_STATUS = "NA";
                x.KPI_ACTUAL = string.Empty;
                x.SECONDARY_SLA_STATUS = "NA";
                x.EXCLUSION_SLA_STATUS = "NA";
                x.EXCLUSION_KPI_ACTUAL = string.Empty;
                x.EXCLUSION_SECONDARY_SLA_STATUS = "NA";
            }
            else if (x.ISNODATA)
            {
                x.SLA_STATUS = "NT";
                x.KPI_ACTUAL = string.Empty;
                x.SECONDARY_SLA_STATUS = "NT";
                x.EXCLUSION_SLA_STATUS = "NT";
                x.EXCLUSION_KPI_ACTUAL = string.Empty;
                x.EXCLUSION_SECONDARY_SLA_STATUS = "NT";
            }
            else
            {
                if (new List<string> { "Adherence to Agile Methodology", "Average Cycle Time for release", "Process Efficiency", "Volume of Incidents or Problems that require a Code Change" }.Contains(x.KPI_NAME))
                {
                    x.SLA_STATUS = x.KPI_NUMERATOR > x.EXPECTED_SERVICE_LEVEL ? "Met" : "Not Met";
                    x.KPI_ACTUAL = x.KPI_NUMERATOR.GetValueOrDefault().ToString("0.###");
                    x.SECONDARY_SLA_STATUS = x.KPI_NUMERATOR > x.MINIMUM_SERVICE_LEVEL ? "Met" : "Not Met";

                    x.EXCLUSION_SLA_STATUS = x.EXCLUSION_KPI_NUMERATOR > x.EXPECTED_SERVICE_LEVEL ? "Met" : "Not Met";
                    x.EXCLUSION_KPI_ACTUAL = x.EXCLUSION_KPI_NUMERATOR.GetValueOrDefault().ToString("0.###");
                    x.EXCLUSION_SECONDARY_SLA_STATUS = x.EXCLUSION_KPI_NUMERATOR > x.MINIMUM_SERVICE_LEVEL ? "Met" : "Not Met";
                }
                else if (x.KPI_NAME == "Issues detected Post-Production release")
                {
                    x.SLA_STATUS = x.KPI_NUMERATOR < x.CNT ? "Met" : "Not Met";
                    x.SECONDARY_SLA_STATUS = x.KPI_NUMERATOR < x.CNT * 2 ? "Met" : "Not Met";
                    if (x.CNT > 0)
                    {
                        x.KPI_ACTUAL = (x.KPI_NUMERATOR.GetValueOrDefault() / x.CNT).ToString("0.###");
                        x.EXCLUSION_KPI_ACTUAL = (x.EXCLUSION_KPI_NUMERATOR.GetValueOrDefault() / x.CNT).ToString("0.###");
                    }
                    x.EXCLUSION_SLA_STATUS = x.EXCLUSION_KPI_NUMERATOR < x.CNT ? "Met" : "Not Met";
                    x.EXCLUSION_SECONDARY_SLA_STATUS = x.EXCLUSION_KPI_NUMERATOR < x.CNT * 2 ? "Met" : "Not Met";

                }
                else if (x.KPI_NAME == UptimeText && x.CNT > 0)
                {
                    var portfolioUptimeDetails = uptimeDetails.Where(y => y.KPI_DENOMINATOR > 0 && y.PORTFOLIO_ID == x.PORTFOLIO_ID).ToList();
                    foreach (var item in portfolioUptimeDetails)
                    {
                        item.UPTIME_CALC = item.KPI_DENOMINATOR.GetValueOrDefault() * item.EXPECTED_SERVICE_LEVEL;
                    }
                    try
                    {
                        var numer = portfolioUptimeDetails.Sum(y => y.UPTIME_CALC);
                        var denom = portfolioUptimeDetails.Sum(y => y.KPI_DENOMINATOR.GetValueOrDefault());
                        var exclusionDenom = portfolioUptimeDetails.Sum(y => y.EXCLUSION_KPI_DENOMINATOR.GetValueOrDefault());
                        if (denom > 0)
                        {
                            x.KPI_ACTUAL = Math.Round(portfolioUptimeDetails.Sum(y => y.KPI_NUMERATOR.GetValueOrDefault()) / denom * 100, 3).ToString("0.##");
                            x.EXPECTED_SERVICE_LEVEL = Math.Round(numer / denom, 2);
                            x.MINIMUM_SERVICE_LEVEL = Math.Round(numer / denom, 2);
                            x.SLA_STATUS = x.SECONDARY_SLA_STATUS = Math.Round(portfolioUptimeDetails.Sum(y => y.KPI_NUMERATOR.GetValueOrDefault()) / denom * 100, 3) > x.EXPECTED_SERVICE_LEVEL ? "Met" : "Not Met";
                            if (exclusionDenom > 0)
                                x.EXCLUSION_KPI_ACTUAL = Math.Round(portfolioUptimeDetails.Sum(y => y.EXCLUSION_KPI_NUMERATOR.GetValueOrDefault()) / exclusionDenom * 100, 3).ToString("0.##");
                            else
                                x.EXCLUSION_KPI_ACTUAL = x.KPI_ACTUAL;
                            x.EXCLUSION_SLA_STATUS = x.EXCLUSION_SECONDARY_SLA_STATUS = Math.Round(portfolioUptimeDetails.Sum(y => y.EXCLUSION_KPI_NUMERATOR.GetValueOrDefault(y.KPI_NUMERATOR.GetValueOrDefault())) / denom * 100, 3) > x.EXPECTED_SERVICE_LEVEL ? "Met" : "Not Met";
                        }
                    }
                    catch (Exception ex)
                    {
                        var a = ex.Message;

                    }


                }
                else
                {
                    var calc = GetSLAStatus(x.FORMULA_ID, 0, x.KPI_NUMERATOR, x.KPI_DENOMINATOR, x.FORMULA, x.EXPECTED_SERVICE_LEVEL, x.MINIMUM_SERVICE_LEVEL);
                    x.SLA_STATUS = calc.Item2;
                    x.KPI_ACTUAL = calc.Item1;
                    x.SECONDARY_SLA_STATUS = calc.Item3;

                    calc = GetSLAStatus(x.FORMULA_ID, 0, x.EXCLUSION_KPI_NUMERATOR, x.EXCLUSION_KPI_DENOMINATOR, x.FORMULA, x.EXPECTED_SERVICE_LEVEL, x.MINIMUM_SERVICE_LEVEL);
                    x.EXCLUSION_SLA_STATUS = calc.Item2;
                    x.EXCLUSION_KPI_ACTUAL = calc.Item1;
                    x.EXCLUSION_SECONDARY_SLA_STATUS = calc.Item3;
                }
                //var calc = GetSLAStatus(x.FORMULA_ID, 0, x.KPI_NUMERATOR, x.KPI_DENOMINATOR, x.FORMULA, x.EXPECTED_SERVICE_LEVEL, x.MINIMUM_SERVICE_LEVEL);
                //x.SLA_STATUS = calc.Item2;
                //x.KPI_ACTUAL = calc.Item1;
                //x.SECONDARY_SLA_STATUS = calc.Item3;
            }
        }

        [GET("GetTrendHighChartsGroupForProduct")]
        [ActionName("GetTrendHighChartsGroupForProduct")]
        [HttpGet]
        public IHttpActionResult GetTrendHighChartsGroupForProduct(string customerId, int prodId, DateTime currentDate, string viewBy)
        {
            DateRange range = new DateRange(currentDate, enDateRange.Monthly);
            var trendHighChartGroup = GetTrendHighChartsForProduct(customerId, prodId, range, viewBy);
            return Ok(trendHighChartGroup);
        }

        [POST("GetKpiAchievementPercentage")]
        [ActionName("GetKpiAchievementPercentage")]
        [HttpPost]
        public IHttpActionResult GetKpiAchievementPercentage([FromBody] List<BaseMeasureData> baseMeasures, int kpiId)
        {

            //output.KPI_ACTUAL = Math.Round(Convert.ToDouble(actualAchieved), 2).ToString();
            return Ok(GetKPIAchievementPercentagePvt(baseMeasures, kpiId));
        }

        private KpiAchievement GetKPIAchievementPercentagePvt(List<BaseMeasureData> baseMeasures, int kpiId)
        {
            var output = new KpiAchievement();
            if (baseMeasures.Count > 0)
            {
                var numerator = baseMeasures.Where(x => x.IsExclusion == false).Sum(x => x.Numerator);
                var denominator = baseMeasures.Where(x => x.IsExclusion == false).Sum(x => x.Denominator);
                var formulaId = baseMeasures.First().BaseMeasureFormulaTypeId;
                var calc = GetSLAStatus(formulaId, kpiId, numerator.GetValueOrDefault(), denominator.GetValueOrDefault());
                output.KPI_ACTUAL = calc.Item1;
                output.SLA_STATUS = calc.Item2;
                output.SECONDARY_SLA_STATUS = calc.Item3;
                if (baseMeasures.Any(x => x.IsExclusion == true))
                {
                    numerator = baseMeasures.Where(x => x.IsExclusion == true).Sum(x => x.Numerator);
                    denominator = baseMeasures.Where(x => x.IsExclusion == true).Sum(x => x.Denominator);
                    calc = GetSLAStatus(formulaId, kpiId, numerator.GetValueOrDefault(), denominator.GetValueOrDefault());
                    output.EXCLUSION_KPI_ACTUAL = calc.Item1;
                    output.EXCLUSION_SLA_STATUS = calc.Item2;
                    output.EXCLUSION_SECONDARY_SLA_STATUS = calc.Item3;
                }

            }
            return output;
        }


        [GET("RevertProductKPIDetails")]
        [ActionName("RevertProductKPIDetails")]
        [HttpGet]
        public IHttpActionResult RevertProductKPIDetails(int prodId, string month, int year)
        {
            CheckAccessForFeature(79);
            LogRequest(content: "RevertProductKPIDetails");
            var empId = GetHeaderDetails_String("empId");
            var date = DateTime.Parse($"{year}-{month}-01");
            var kpidetails = CSPdb.KPI_DETAILS.GetAll().Where(x => x.PRODUCT_ID == prodId && (x.PERIOD_TYPE == "Monthly" || x.PERIOD_TYPE == "Release") && x.PERIOD == date && x.ISACTIVE).ToList();
            if (kpidetails.Any(x => x.ISDRAFT))
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Some KPIs are still in Draft state. Cannot revert."));

            var quarterlyDates = GetKPIPeriod(date, "Quarterly");
            var quarterlyKpidetails = CSPdb.KPI_DETAILS.GetAll().Where(x => x.PRODUCT_ID == prodId && x.PERIOD_TYPE == "Quarterly" && x.PERIOD == quarterlyDates.Item1 && x.ISACTIVE).ToList();
            if (quarterlyKpidetails.Any(x => x.ISDRAFT))
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Some Quarterly KPIs are still in Draft state. Cannot revert."));

            var notMetSLAList = kpidetails.Where(x => x.SLA_STATUS == "Not Met").Select(x => x.ID).Union(quarterlyKpidetails.Where(x => x.SLA_STATUS == "Not Met").Select(x => x.ID)).ToList();
            var stages = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(x => notMetSLAList.Contains(x.KPI_DETAILS_ID.Value)).ToList();
            var capaSubmission = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => notMetSLAList.Contains(x.KPI_DETAILS_ID.Value)).ToList();

            foreach (var item in kpidetails)
            {
                item.ISDRAFT = true;
                UpdateAuditFields(item, empId);
                CSPdb.KPI_DETAILS.Update(item);

            }

            foreach (var item in quarterlyKpidetails)
            {
                item.ISDRAFT = true;
                UpdateAuditFields(item, empId);
                CSPdb.KPI_DETAILS.Update(item);

            }
            CSPdb.Commit(CanCommit);
            return Ok();
        }


        private KPI_DETAILS UpdateKPIDetails(KPI_SERVICE_LEVEL_METRICS serviceMetrics, KPI_DETAILS existing, DateTime date, bool isDraft)
        {
            existing.KPI_ACTUAL = String.Format("{0:0.##}", serviceMetrics.KPI_ACTUAL);
            existing.ISFLAG = serviceMetrics.IS_NOT_APPLICABLE;
            existing.HIGHLIGHTS = serviceMetrics.REMARKS;
            existing.EX_HIGHLIGHTS = serviceMetrics.EXREMARKS;
            existing.ISEXNODATA = serviceMetrics.IS_EX_NO_DATA;
            //existing.ISDRAFT = serviceMetrics
            //id =0 or isdraft = true then isdraft can be set to true else it has to be set to false
            if (isDraft && existing.ISDRAFT)
                existing.ISDRAFT = true;
            else
                existing.ISDRAFT = false;
            if (existing.SLA_STATUS == "Not Met" && serviceMetrics.SLA_STATUS == "Met")
            {
                existing.IS_SLA_STATUS_CHANGED = true;
            }

            existing.SLA_STATUS = serviceMetrics.SLA_STATUS;
            existing.SECONDARY_SLA_STATUS = serviceMetrics.SECONDARY_SLA_STATUS;

            if (serviceMetrics.IS_EXCLUSION)
            {
                existing.EXCLUSION_KPI_ACTUAL = String.Format("{0:0.##}", serviceMetrics.EXCLUSION_KPI_ACTUAL);
                existing.EXCLUSION_SLA_STATUS = serviceMetrics.EXCLUSION_SLA_STATUS;
                existing.EXCLUSION_SECONDARY_SLA_STATUS = serviceMetrics.EXCLUSION_SECONDARY_SLA_STATUS;
                existing.EXCLUSION_COMMENT = serviceMetrics.EXCLUSION_COMMENT;
            }
            else
            {
                existing.EXCLUSION_KPI_ACTUAL = string.Empty;
                existing.EXCLUSION_SLA_STATUS = string.Empty;
                existing.EXCLUSION_SECONDARY_SLA_STATUS = string.Empty;
                existing.EXCLUSION_COMMENT = string.Empty;
            }
            UpdateAuditFields<KPI_DETAILS>(existing);
            serviceMetrics.GUID = existing.GUID = Guid.NewGuid().ToString();
            return existing;
        }
        private KPI_DETAILS AddKPIDetailsData(KPI_SERVICE_LEVEL_METRICS serviceMetrics, DateTime date, bool isDraft)
        {

            var data = new KPI_DETAILS();
            data.PERIOD_TYPE = serviceMetrics.FREQUENCY;
            data.PERIOD = GetKPIPeriod(date, serviceMetrics.FREQUENCY).Item1;
            data.KPI_ID = serviceMetrics.KPI_ID;
            data.KPI_ACTUAL = String.Format("{0:0.##}", serviceMetrics.KPI_ACTUAL);
            data.EXCLUSION_KPI_ACTUAL = String.Format("{0:0.##}", serviceMetrics.EXCLUSION_KPI_ACTUAL);
            data.PRODUCT_ID = serviceMetrics.PRODUCT_ID;
            data.MODE_ID = serviceMetrics.MODE_ID;
            data.ISFLAG = serviceMetrics.IS_NOT_APPLICABLE;
            data.SLA_STATUS = serviceMetrics.SLA_STATUS;
            data.SECONDARY_SLA_STATUS = serviceMetrics.SECONDARY_SLA_STATUS;
            data.EXCLUSION_SLA_STATUS = serviceMetrics.EXCLUSION_SLA_STATUS;
            data.EXCLUSION_SECONDARY_SLA_STATUS = serviceMetrics.EXCLUSION_SECONDARY_SLA_STATUS;
            data.HIGHLIGHTS = serviceMetrics.REMARKS;
            data.EX_HIGHLIGHTS = serviceMetrics.EXREMARKS;
            //data.KPI_STATUS_ID = serviceMetrics.KPI_STATUS_ID;
            data.ISDRAFT = isDraft;
            data.ISEXNODATA = serviceMetrics.IS_EX_NO_DATA;
            data.EXCLUSION_COMMENT = serviceMetrics.EXCLUSION_COMMENT;
            UpdateAuditFields<KPI_DETAILS>(data);
            serviceMetrics.GUID = data.GUID = Guid.NewGuid().ToString();
            return data;
        }

        private Tuple<DateTime, DateTime> GetKPIPeriod(DateTime date, string frequency)
        {
            var startDate = date;
            var endDate = DateTime.Now;
            if (frequency == "Monthly")
            {

            }
            else if (frequency == "Quarterly")
            {
                dynamic dates = FinancialYear(date);
                startDate = (DateTime)dates.startdate;
                endDate = (DateTime)dates.enddate;
                date = new DateTime(endDate.Year, endDate.Month, endDate.Day);
                DateRange range = new DateRange(endDate, enDateRange.Monthly);
                DateTime stDate = range.StartDate;
                DateTime enDate = range.EndDate;
                startDate = stDate;
                endDate = enDate;

            }
            else if (frequency == "Release")
            {

            }
            return new Tuple<DateTime, DateTime>(startDate, endDate);
        }
        private object FinancialYear(DateTime startDate)
        {

            var periodstDate = new DateTime();
            var periodedDate = new DateTime();

            if (startDate.Month >= 4 && startDate.Month <= 6)
            {
                periodstDate = DateTime.Parse(startDate.Year + "-" + "04" + "-" + "01");
                periodedDate = DateTime.Parse(startDate.Year + "-" + "06" + "-" + "30");
            }
            else if (startDate.Month >= 7 && startDate.Month <= 9)
            {
                periodstDate = DateTime.Parse(startDate.Year + "-" + "07" + "-" + "01");
                periodedDate = DateTime.Parse(startDate.Year + "-" + "09" + "-" + "30");
            }
            else if (startDate.Month >= 10 && startDate.Month <= 12)
            {
                periodstDate = DateTime.Parse(startDate.Year + "-" + "10" + "-" + "01");
                periodedDate = DateTime.Parse(startDate.Year + "-" + "12" + "-" + "31");
            }
            else
            {
                periodstDate = DateTime.Parse(startDate.Year + "-" + "01" + "-" + "01");
                periodedDate = DateTime.Parse(startDate.Year + "-" + "03" + "-" + "31");
            }

            return new
            {
                startdate = periodstDate,
                enddate = periodedDate
            };
        }

        private DateRange GetProductKPILastUpdatedDate(string customerId)
        {
            DateRange range = new DateRange(DateTime.Now, enDateRange.Monthly);

            //Get KPIs
            var KPIs = CSPdb.KPI.GetAll().Where(t => t.CUSTOMER_ID == customerId && t.PRODUCT_ID != null && t.ISACTIVE).ToList();
            var kpiIds = KPIs.Select(s => s.ID).ToList();

            //Get last updated Kpi details
            KPI_DETAILS lastUpdated = CSPdb.KPI_DETAILS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID) && t.ISACTIVE).OrderByDescending(u => u.PERIOD).FirstOrDefault();
            if (lastUpdated != null)
                range = new DateRange(lastUpdated.PERIOD, enDateRange.Monthly);

            return range;
        }

        private List<HighChartsLineGroup> GetTrendHighChartsForProduct(string customerId, int prodId, DateRange range, string viewBy)
        {
            var KPIs = CSPdb.KPI.GetAll().Where(t => t.PRODUCT_ID == prodId && t.ISACTIVE).ToList();
            var kpiIds = KPIs.Select(s => s.ID).ToList();
            var months = int.Parse(helper.GetDBConfig("ACHIEVEMENT_TREND", customerId)) - 1;
            DateTime startDate = range.StartDate.AddMonths(-1 * months);
            DateTime endDate = range.EndDate;

            var kpiDetails = CSPdb.KPI_DETAILS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID) && t.ISACTIVE && t.PERIOD >= startDate && t.PERIOD <= endDate && !t.ISDRAFT && (t.PERIOD_TYPE == "Monthly" || t.PERIOD_TYPE == "Release")).ToList();
            var quarterStartDate = GetKPIPeriod(startDate, "Quarterly");
            var quarterEndDate = GetKPIPeriod(endDate, "Quarterly");

            var quarterlyKpidetails = CSPdb.KPI_DETAILS.GetAll().Where(x => kpiIds.Contains(x.KPI_ID) && x.PERIOD_TYPE == "Quarterly" && x.PERIOD >= quarterStartDate.Item1 && x.PERIOD <= quarterEndDate.Item2 && x.ISACTIVE && !x.ISDRAFT).ToList();

            var allDetails = kpiDetails.Union(quarterlyKpidetails).ToList();

            var kpiTargets = CSPdb.KPI_TARGETS.GetAll().Where(t => kpiIds.Contains(t.KPI_ID) && t.ISACTIVE).ToList();
            var trendChartsGroup = new List<HighChartsLineGroup>();
            foreach (int i in kpiIds)
            {
                var details = allDetails.Where(t => t.KPI_ID == i).OrderBy(u => u.PERIOD).ToList();
                if (details != null && details.Count > 0)
                {
                    var tmpKPI = KPIs.FirstOrDefault(t => t.ID == i);
                    var chart = new HighChartsLine();
                    chart.title.text = tmpKPI.KPI_NAME;
                    chart.title.style = new style() { color = "#333333", fontSize = "13px" };
                    chart.xAxis.gridLineWidth = 1;

                    //Series Actual
                    var item = new seriesItem();
                    item.name = "Actual";
                    item.width = 1;
                    string yAxisTitle = string.Empty;
                    //Target Actual
                    var target = new seriesItem();
                    target.name = "Target";
                    target.color = "#63be7b";
                    target.width = 1;
                    var targets = new List<decimal>();
                    var kpiTarget = kpiTargets.Where(t => t.KPI_ID == tmpKPI.ID && t.ISACTIVE).ToList();
                    foreach (var d in details)
                    {
                        targets.Add(GetKPITarget(kpiTargets, d.PERIOD, viewBy));
                        GetChartsCategoriesData(chart, d.KPI_ACTUAL, targets.LastOrDefault(), item, target, d.PERIOD, d.SLA_STATUS, tmpKPI.FREQUENCY);
                        yAxisTitle = "In " + tmpKPI.SLA_TARGET_UNIT_OF_MEASUREMENT;
                    }


                    chart.series.Add(target);
                    chart.series.Add(item);
                    chart.yAxis = new yAxis();
                    chart.yAxis.tickInterval = 20;
                    chart.yAxis.title.text = yAxisTitle;
                    chart.yAxis.gridLineWidth = 1;

                    string kpiName = KPIs.FirstOrDefault(t => t.ID == tmpKPI.ID).KPI_NAME;

                    var h = trendChartsGroup.FirstOrDefault(t => t.GoalName == kpiName);
                    if (h != null)
                    {
                        h.TrendHighChart.Add(new HighChartsLineWithArea() { KPIId = tmpKPI.ID, AreaName = tmpKPI.SERVICE_AREA, TrendHighChart = chart });
                    }
                    else
                    {
                        trendChartsGroup.Add(new HighChartsLineGroup() { GoalName = kpiName, TrendHighChart = new List<HighChartsLineWithArea>() { new HighChartsLineWithArea() { KPIId = tmpKPI.ID, AreaName = tmpKPI.SERVICE_AREA, TrendHighChart = chart } } });
                    }
                }
            }
            return trendChartsGroup;
        }


        private decimal GetKPITarget(List<KPI_TARGETS> kpiTargets, DateTime? PERIOD, string viewBy)
        {
            decimal target = 0;
            var kpiTarget = kpiTargets.Where(t => PERIOD >= t.START_DATE && PERIOD <= t.END_DATE).FirstOrDefault();
            if (kpiTarget != null && (viewBy == "Expected Service Level" || viewBy == "By Expected Service Level"))
                target = Convert.ToDecimal(kpiTarget.EXPECTED_SERVICE_LEVEL);
            else if (kpiTarget != null && (viewBy == "Minimum Service Level" || viewBy == "By Minimum Service Level"))
                target = Convert.ToDecimal(kpiTarget.MINIMUM_SERVICE_LEVEL);
            return target;
        }


        #region code for BaseMeasure
        private void UpdateBaseMeasureValueCollection(Dictionary<int, List<BaseMeasureData>> baseMeasureValueList, bool isExclusion)
        {
            foreach (var item in baseMeasureValueList)
            {
                UpdateBaseMeasureValues(item.Key, item.Value, isExclusion);
            }

            CSPdb.Commit(CanCommit);
        }
        private void UpdateBaseMeasureValues(int kpiDetailsId, List<BaseMeasureData> baseMeasureValueList, bool isExclusion)
        {
            if (baseMeasureValueList == null) return;
            foreach (var item in baseMeasureValueList)
            {
                if (item.BaseMeasureValueId.HasValue && item.BaseMeasureValueId > 0)
                {
                    var ety = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().SingleOrDefault(x => x.ID == item.BaseMeasureValueId.Value);
                    if (ety != null)
                    {
                        //ety.MEASURE_VALUE = item.MeasureValue.GetValueOrDefault();
                        ety.NUMERATOR = item.Numerator;
                        ety.DENOMINATOR = item.Denominator;
                        ety.IS_EXCLUSION = isExclusion;
                        UpdateAuditFields(ety);
                        CSPdb.KPI_BASE_MEASURE_VALUE.Update(ety);
                    }
                }
                else if (item.BaseMeasureValueId.GetValueOrDefault() == 0)
                {
                    var ety = new KPI_BASE_MEASURE_VALUE()
                    {
                        KPI_DETAILS_ID = kpiDetailsId,
                        BASE_MEASURE_ID = item.BaseMeasureId,
                        DENOMINATOR = item.Denominator,
                        NUMERATOR = item.Numerator,
                        IS_EXCLUSION = isExclusion,
                        //MEASURE_VALUE = item.MeasureValue,
                    };
                    UpdateAuditFields(ety);
                    CSPdb.KPI_BASE_MEASURE_VALUE.Add(ety);
                }
            }

        }

        internal class BaseMeasureDataCollectionHolder
        {
            public Dictionary<int, List<BaseMeasureData>> BaseMeasureData { get; set; }
            public Dictionary<int, List<BaseMeasureData>> ExclusionBaseMeasureData { get; set; }
        }

        private BaseMeasureDataCollectionHolder GetBaseMeasureDataCollection(List<Tuple<int, int>> kpiCombination)
        {
            var result = new BaseMeasureDataCollectionHolder
            {
                BaseMeasureData = new Dictionary<int, List<BaseMeasureData>>(),
                ExclusionBaseMeasureData = new Dictionary<int, List<BaseMeasureData>>()
            };

            var kpiIds = kpiCombination.Select(x => x.Item1).ToList();
            var kpiDetailIds = kpiCombination.Select(x => x.Item2).ToList();
            var baseMeasureConfig = CSPdb.SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG.GetAll().Where(x => kpiIds.Contains(x.KPI_ID) && x.ISACTIVE).ToList();
            var baseMeasureData = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().Where(x => x.ISACTIVE && x.IS_EXCLUSION != true && kpiDetailIds.Contains(x.KPI_DETAILS_ID)).ToList();
            var exclusionBaseMeasureData = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().Where(x => x.ISACTIVE && x.IS_EXCLUSION == true && kpiDetailIds.Contains(x.KPI_DETAILS_ID)).ToList();
            var ids = baseMeasureConfig.Select(x => x.BASE_MEASURE_ID).ToArray();
            var baseMeasureList = CSPdb.BASE_MEASURE.GetAll().Where(x => ids.Contains(x.ID) && x.ISACTIVE).ToList();
            if (baseMeasureList.Count > 0)
            {
                foreach (var item in kpiCombination)
                {
                    result.BaseMeasureData[item.Item1] = GetBaseMeasureData(item.Item1, item.Item2, baseMeasureConfig, baseMeasureList, baseMeasureData);
                    result.ExclusionBaseMeasureData[item.Item1] = GetBaseMeasureData(item.Item1, item.Item2, baseMeasureConfig, baseMeasureList, exclusionBaseMeasureData);
                }
            }
            return result;
        }

        private List<BaseMeasureData> GetBaseMeasureData(int kpiID, int kpiDetailsId, List<SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG> configList, List<BASE_MEASURE> baseMeasureList,
            List<KPI_BASE_MEASURE_VALUE> baseMeasureData)
        {
            var result = new List<BaseMeasureData>();
            var baseMeasureConfig = configList.Where(x => x.KPI_ID == kpiID).ToList();
            var ids = baseMeasureConfig.Select(x => x.BASE_MEASURE_ID).ToArray();
            var baseMeasures = baseMeasureList.Where(x => ids.Contains(x.ID)).ToList();
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
                    Numerator = baseMeasureValue != null ? baseMeasureValue.NUMERATOR : (decimal?)null,
                    Denominator = baseMeasureValue != null ? baseMeasureValue.DENOMINATOR : (decimal?)null,
                    BaseMeasureFormulaTypeId = baseMeasures.Single(x => x.ID == item.BASE_MEASURE_ID).BASE_MEASURE_FORMULA_TYPE_ID
                });
            }
            return result;
        }

        #endregion

        #region code for Actual_Calculation


        private Tuple<string, string, string> GetSLAStatus(int formulaId, int kpiId, decimal? numerator, decimal? denominator, string formula = null, decimal? expServiceLevel = null, decimal? minServiceLevel = null)
        {
            var actualAchievedFormat = "{0:0.###}";
            var actualAchievedFormatFor0and100 = "{0:0.###}";
            var actualAchieved = 0m;
            var actualFormattedValue = string.Empty;
            var numeratorFormattedValue = string.Empty;

            if (string.IsNullOrWhiteSpace(formula))
                formula = CSPdb.BASE_MEASURE_FORMULA_TYPE.GetAll().FirstOrDefault(x => x.ID == formulaId)?.FORMULA;
            if (!expServiceLevel.HasValue)
                expServiceLevel = CSPdb.KPI_TARGETS.GetAll().FirstOrDefault(x => x.KPI_ID == kpiId).EXPECTED_SERVICE_LEVEL;
            if (!minServiceLevel.HasValue)
                minServiceLevel = CSPdb.KPI_TARGETS.GetAll().FirstOrDefault(x => x.KPI_ID == kpiId).MINIMUM_SERVICE_LEVEL;

            if (denominator > 0 && !string.IsNullOrEmpty(formula))
            {
                formula = formula.Replace("NUMERATOR", numerator.GetValueOrDefault().ToString());
                formula = formula.Replace("DENOMINATOR", denominator.ToString());
                actualAchieved = Math.Round(Convert.ToDecimal(new DataTable().Compute(formula, null)), 3, MidpointRounding.AwayFromZero);

                if (actualAchieved == 100 || actualAchieved == 0)
                {
                    actualFormattedValue = string.Format(actualAchievedFormatFor0and100, actualAchieved);
                }
                else
                {
                    actualFormattedValue = string.Format(actualAchievedFormat, actualAchieved);
                }

                switch (formulaId)
                {
                    case 1:
                        return new Tuple<string, string, string>(actualFormattedValue, actualAchieved >= expServiceLevel ? "Met" : "Not Met", actualAchieved >= minServiceLevel ? "Met" : "Not Met");
                    case 2:
                        return new Tuple<string, string, string>(numerator.ToString(), numerator >= actualAchieved ? "Met" : "Not Met", numerator >= actualAchieved ? "Met" : "Not Met");
                    case 3:
                        return new Tuple<string, string, string>(numerator.ToString(), numerator <= actualAchieved ? "Met" : "Not Met", numerator <= actualAchieved ? "Met" : "Not Met");
                    case 4:
                        return new Tuple<string, string, string>(actualFormattedValue, denominator > 0 && actualAchieved <= expServiceLevel ? "Met" : "Not Met", denominator > 0 && actualAchieved <= minServiceLevel ? "Met" : "Not Met");
                    case 5:
                        expServiceLevel = CSPdb.AppRepo.GetExpectedServiceLevel(kpiId);
                        return new Tuple<string, string, string>(actualFormattedValue, actualAchieved >= expServiceLevel ? "Met" : "Not Met", actualAchieved >= expServiceLevel ? "Met" : "Not Met");
                    case 6:
                        return new Tuple<string, string, string>(actualFormattedValue, actualAchieved >= expServiceLevel ? "Met" : "Not Met", actualAchieved >= minServiceLevel ? "Met" : "Not Met");
                    case 7:
                        return new Tuple<string, string, string>(actualFormattedValue, denominator > 0 && actualAchieved <= expServiceLevel ? "Met" : "Not Met", denominator > 0 && actualAchieved <= minServiceLevel ? "Met" : "Not Met");
                    case 8:
                        var eslValue = helper.GetDBConfig("ESTIMATION_QUALITY_ESL", "-1"); // For Estimation Quality
                        if (decimal.TryParse(eslValue, out decimal parsedESLValue))
                        {
                            expServiceLevel = parsedESLValue;
                        }
                        var mslValue = helper.GetDBConfig("ESTIMATION_QUALITY_MSL", "-1");
                        if (decimal.TryParse(mslValue, out decimal parsedMSLValue))
                        {
                            minServiceLevel = parsedMSLValue;
                        }
                        return new Tuple<string, string, string>(actualFormattedValue, actualAchieved >= minServiceLevel && actualAchieved <= expServiceLevel ? "Met" : "Not Met", actualAchieved >= minServiceLevel && actualAchieved <= expServiceLevel ? "Met" : "Not Met");
                    default:
                        return new Tuple<string, string, string>(actualFormattedValue, actualAchieved >= expServiceLevel ? "Met" : "Not Met", actualAchieved >= minServiceLevel ? "Met" : "Not Met");
                }
            }
            else if (numerator.HasValue)
            {

                if (numerator.Value.ToString() == "100.00000" || numerator.Value.ToString() == "0.00000")
                {
                    var numeratorRoundOff = Math.Round(numerator.Value, 0);
                    numeratorFormattedValue = string.Format(actualAchievedFormatFor0and100, numeratorRoundOff);
                }
                else
                {
                    numeratorFormattedValue = string.Format(actualAchievedFormat, numerator.Value.ToString());
                }

                switch (formulaId)
                {
                    case 1:
                        return new Tuple<string, string, string>(numeratorFormattedValue, numerator >= expServiceLevel ? "Met" : "Not Met", numerator >= minServiceLevel ? "Met" : "Not Met");
                    case 4:
                        return new Tuple<string, string, string>(numeratorFormattedValue, numerator <= expServiceLevel ? "Met" : "Not Met", numerator <= minServiceLevel ? "Met" : "Not Met");
                    default:
                        return new Tuple<string, string, string>(numeratorFormattedValue, numerator >= expServiceLevel ? "Met" : "Not Met", numerator >= minServiceLevel ? "Met" : "Not Met");
                }
            }

            return new Tuple<string, string, string>(string.Empty, string.Empty, string.Empty); //numerator.ToString()
        }
        #endregion

        #region code for File Upload


        [POST("UploadKPIFile")]
        [ActionName("UploadKPIFile")]
        [HttpPost]
        public HttpResponseMessage UploadKPIFile()
        {
            HttpResponseMessage response = new HttpResponseMessage();
            var httpRequest = HttpContext.Current.Request;
            string excelData = string.Empty;

            if (httpRequest.Files.Count > 0)
            {
                foreach (string file in httpRequest.Files)
                {
                    var postedFile = httpRequest.Files[file];
                    var createDirectory = HttpContext.Current.Server.MapPath("~/UploadFile/KPIFiles/");

                    if (!Directory.Exists(createDirectory))
                    {
                        Directory.CreateDirectory(createDirectory);
                    }

                    var filePath = HttpContext.Current.Server.MapPath("~/UploadFile/KPIFiles/" + postedFile.FileName);
                    postedFile.SaveAs(filePath);
                    try
                    {
                        excelData = BindData(filePath);
                    }
                    catch (Exception ex)
                    {

                        return this.Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
                    }

                }
            }
            return this.Request.CreateResponse(HttpStatusCode.OK, excelData);
        }

        private string BindData(string filePath)
        {
            string excelConnectionString = string.Format("Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties='Excel 12.0;HDR=NO'", filePath);
            string json;
            DataSet ds = new DataSet();
            DataTable backlog = null;
            DataTable nonBacklog = null;
            using (OleDbConnection connection = new OleDbConnection(excelConnectionString))
            {
                try
                {
                    connection.Open();
                    string sql1 = "SELECT * FROM [Backlog$]";
                    string sql2 = "SELECT * FROM [Non-Backlog$]";

                    using (OleDbDataAdapter adaptor = new OleDbDataAdapter(sql1, excelConnectionString))
                    {
                        ds = new DataSet();

                        adaptor.Fill(ds);
                        backlog = ds.Tables[0];

                        var validateResult = ValidateVersion(backlog);
                        if (!validateResult.Item1)
                            throw new Exception($"Version not matching in sheet {backlog.TableName}. Excel version is {validateResult.Item2}. Version expected is {validateResult.Item3}. Please use updated version downloaded from mygavs.");
                    }
                    using (OleDbDataAdapter adaptor = new OleDbDataAdapter(sql2, excelConnectionString))
                    {
                        ds = new DataSet();
                        adaptor.Fill(ds);
                        nonBacklog = ds.Tables[0];
                        var validateResult = ValidateVersion(nonBacklog);
                        if (!validateResult.Item1)
                            throw new Exception($"Version not matching in sheet {nonBacklog.TableName}. Excel version is {validateResult.Item2}. Version expected is {validateResult.Item3}. Please use updated version downloaded from mygavs.");
                    }

                    //foreach (DataRow row in dt.Rows)
                    //{
                    //    DataTable dtSheetData = new DataTable();
                    //    switch (row["TABLE_NAME"].ToString())
                    //    {
                    //        case "Backlog$":
                    //            dtSheetData = GetSheetData(row["TABLE_NAME"].ToString(), connection);

                    //            if (dtSheetData.Rows.Count > 0)
                    //            {
                    //                ds.Tables.Add(dtSheetData);
                    //            }
                    //            break;

                    //        case "'Non-Backlog$'":
                    //            dtSheetData = GetSheetData(row["TABLE_NAME"].ToString(), connection);
                    //            if (dtSheetData.Rows.Count > 0)
                    //            {
                    //                ds.Tables.Add(dtSheetData);
                    //            }
                    //            break;
                    //    }

                    //}

                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    if (connection != null)
                        connection.Close();
                }
            }

            StringBuilder result = new StringBuilder();

            var output = ParseKPIData(backlog, "Backlog");
            if (!string.IsNullOrWhiteSpace(output.Item2))
                result.AppendLine($"Backlog - Errors {output.Item2}");
            else
                result.AppendLine($"Backlog - {output.Item1} Rows Updated");

            output = ParseKPIData(nonBacklog, "Non-Backlog");
            if (!string.IsNullOrWhiteSpace(output.Item2))
                result.AppendLine($"Non-Backlog - Errors {output.Item2}");
            else
                result.AppendLine($"Non-Backlog - {output.Item1} Rows Updated");

            return result.ToString();
            //json = JsonConvert.SerializeObject(ds);

        }

        private DataTable GetSheetData(string sheetName, OleDbConnection connection)
        {
            string query = "select * from [" + sheetName + "]";
            DataTable dtSheetData = new DataTable();
            OleDbDataAdapter oleDA;
            oleDA = new OleDbDataAdapter(query, connection);
            oleDA.Fill(dtSheetData);
            oleDA.Dispose();
            return dtSheetData;
        }

        private Tuple<bool, string, string> ValidateVersion(DataTable datatable)
        {
            if (datatable == null) throw new Exception("Unable to read Sheet Data, Please check the Sheet names. It should be 'Backlog' or 'Non-Baklog'");
            var result = new Tuple<bool, string, string>(true, string.Empty, string.Empty);
            var version = datatable.Rows[0][3].ToString();
            var versionInDB = helper.GetDBConfig("KPI_UPLOAD_FILE_VERSION", "-1");
            if (version != versionInDB)
            {
                return new Tuple<bool, string, string>(false, version, versionInDB);
            }

            return result;
        }


        private Tuple<int, string> ParseKPIData(DataTable datatable, string sheetName)
        {
            if (datatable == null) throw new Exception($"Unable to read Sheet Data '{sheetName}', Please check the Sheet data.");
            string errorMsg = string.Empty;
            var portfolioName = datatable.Rows[0][1].ToString();
            var productName = datatable.Rows[1][1].ToString();
            var month = datatable.Rows[4][1].ToString();
            var modeText = datatable.Rows[3][1].ToString();
            if (string.IsNullOrWhiteSpace(portfolioName))
                return new Tuple<int, string>(0, "Portfolio Name not matching");
            if (string.IsNullOrWhiteSpace(productName))
                return new Tuple<int, string>(0, "Portfolio Name not matching");
            if (string.IsNullOrWhiteSpace(month))
                return new Tuple<int, string>(0, "Portfolio Name not matching");
            if (string.IsNullOrWhiteSpace(modeText))
                return new Tuple<int, string>(0, "Mode not matching");

            var portfolio = CSPdb.PORTFOLIO.GetAll().FirstOrDefault(x => x.TITLE == portfolioName);
            var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.PRODUCT_TITLE == productName);
            var date = DateTime.Parse("1-" + month);
            var mode = CSPdb.PRODUCTS_SERVICE_LEVEL_MODE.GetAll().FirstOrDefault(x => x.MODE_TYPE == modeText || x.MODE_TITLE.ToLower() == modeText.ToLower());
            if (portfolio == null)
                return new Tuple<int, string>(0, "Portfolio Name not matching");
            if (product == null)
                return new Tuple<int, string>(0, "Portfolio Name not matching");
            if (date > DateTime.Now)
                return new Tuple<int, string>(0, "Future month entry not allowed");
            if (mode == null)
                return new Tuple<int, string>(0, "Mode name not matching.");
            int rowCount = 0;
            var serviceArea = sheetName.ToLower() == "backlog" ? 1 : 2;
            foreach (DataRow item in datatable.Rows)
            {
                if (new List<string> { "service tower", "backlog", "non-backlog" }.Contains(item[0].ToString().ToLower()))
                {
                    if (item[0].ToString().ToLower() == "service tower")
                        continue;
                    var serviceLevel = item[2].ToString().ToLower() == "key measurement" ? 1 : 2;
                    var serviceLevelmeasure = item[1].ToString().ToLower();
                    //var serviceLevelmeasureEty = CSPdb.PRODUCT_SERVICE_LEVEL_METRICS.GetAll().FirstOrDefault(x => x.SERVICE_LEVEL_TYPE_ID == serviceLevel
                    //              && x.SERVICE_LEVEL_METRIC_DESCRIPTION.ToLower() == serviceLevelmeasure && x.SERVICE_AREA_TYPE_ID == serviceArea);
                    //if (serviceLevelmeasureEty == null)
                    //    continue;

                    // var k2p = CSPdb.KPI2PRODUCT_SERVICE_LEVEL_METRICS.GetAll().Where(x => x.PRODUCT_SERVICE_LEVEL_METRICS_ID == serviceLevelmeasureEty.ID).Select(x => x.KPI_ID).ToList();

                    var kpi = CSPdb.KPI.GetAll().FirstOrDefault(x => x.PRODUCT_ID == product.ID && x.MODE_ID == mode.ID && x.KPI_NAME == serviceLevelmeasure);
                    var kpiActual = item[9].ToString();
                    if (kpi == null || string.IsNullOrWhiteSpace(kpiActual)) continue;

                    var kpiDetails = CSPdb.KPI_DETAILS.GetAll().FirstOrDefault(x => x.KPI_ID == kpi.ID);
                    var isNew = false;
                    var periodType = item[3].ToString();
                    if (kpiDetails == null)
                    {
                        isNew = true;
                        kpiDetails = new KPI_DETAILS
                        {
                            KPI_ID = kpi.ID,
                            PERIOD = GetKPIPeriod(date, kpi.FREQUENCY).Item1,
                            MODE_ID = mode.ID,
                            ISACTIVE = true,
                            PRODUCT_ID = product.ID,
                            KPI_METRIC = 0,
                            PERIOD_TYPE = periodType == "Quaterly" || periodType == "Release" ? periodType : "Monthly",
                        };
                    }
                    kpiDetails.KPI_ACTUAL = kpiActual.Replace("%", "");
                    kpiDetails.SLA_STATUS = item[10].ToString();
                    UpdateAuditFields(kpiDetails);
                    rowCount++;
                    if (isNew)
                        CSPdb.KPI_DETAILS.Add(kpiDetails);
                    else
                        CSPdb.KPI_DETAILS.Update(kpiDetails);
                }
            }
            CSPdb.Commit(CanCommit);
            return new Tuple<int, string>(rowCount, errorMsg);
        }
        #endregion

        #region code for CAPA
        [GET("GetCAPAStagesForKPI")]
        [ActionName("GetCAPAStagesForKPI")]
        [HttpGet]
        public IHttpActionResult GetCAPAStagesForKPI(int kpiDetailId)
        {
            var kpiDetailsId = new List<int> { kpiDetailId };
            var capaDataCollection = GetCAPAAndRCADataCollection(kpiDetailsId);
            var result = GetCAPAStagesForKPIInternal(kpiDetailId, capaDataCollection);
            return Ok(result);
        }
        [POST("AddCAPAForKPI")]
        [ActionName("AddCAPAForKPI")]
        [HttpPost]
        public IHttpActionResult AddCAPAForKPI([FromBody] FINDING_STAGE_DATA results)
        {
            LogRequest(prefix: "AddCAPAForKPI");
            string empId = GetHeaderDetails_String("empId");
            DateTime selectedPeriod = GetHeaderDetails_Date("selectedPeriod");

            if (results == null)
                return BadRequest("Request invalid");

            var kpidetailsId = results.CAPA_SUBMISSION.STATUS.KPI_DETAILS_ID.GetValueOrDefault();

            var kpiDtls = CSPdb.KPI_DETAILS.GetAll().FirstOrDefault(x => x.ID == kpidetailsId && x.ISACTIVE);
            if (kpiDtls == null)
            {
                return Content(HttpStatusCode.Conflict, "Unable to find the corresponding KPI Details. Please try again after some time");
            }

            var kpi = CSPdb.KPI.GetAll().FirstOrDefault(x => x.ID == kpiDtls.KPI_ID && x.ISACTIVE);
            if (kpi == null)
            {
                return Content(HttpStatusCode.Conflict, "Unable to find the corresponding KPI Details. Please try again after some time");
            }
            var result = AddCapaForKPIInternal(results, kpiDtls, kpi.KPI_NAME, selectedPeriod, empId);

            return Ok(results);
        }

        [GET("GetProductManagerByProduct")]
        [ActionName("GetProductManagerByProduct")]
        [HttpGet]
        public IHttpActionResult GetProductManagerByProduct(int prodId)
        {
            var result = CSPdb.AppRepo.GetProductManagerByProductId(prodId).ToList();
            
         

            return Ok(result);
        }

        [GET("IsCAPAApprovalAllowed")]
        [ActionName("IsCAPAApprovalAllowed")]
        [HttpGet]
        public IHttpActionResult IsCAPAApprovalAllowed(int prodId, DateTime selectedPeriod, int kpiDetailsId)
        {
            var managementTypes = new List<int> { 2, 3 };
            var empId = GetHeaderDetails_String("empId");
            var result = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Any(x => x.PRODUCT_ID == prodId && managementTypes.Contains(x.MANAGEMENT_TYPE) && x.EMP_ID == empId && x.ISACTIVE);

            return Ok(result);
        }

        private FINDING_STAGE_DATA GetCAPAStagesForKPIInternal(int kpiDetailId, CAPADataHolder capaDataCollection)
        {


            var capaList = new List<AUDIT_FINDING_CAPPA_EXT>();
            var caparevList = new List<AUDIT_FINDING_CAPPA_EXT>();
            var capa = new List<AUDIT_FINDINGS_CAPA>();

            var resultData = new FINDING_STAGE_DATA();
            var extList = new List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED>();

            var map = capaDataCollection.AUDIT_FINDING_STAGES_MAPPING.Where(t => t.KPI_DETAILS_ID == kpiDetailId).ToList();

            capa = capaDataCollection.CAPA_SUBMISSION.Where(t => t.KPI_DETAILS_ID == kpiDetailId && t.ISACTIVE).OrderByDescending(x => x.CREATED_DATE).ToList();

            if (!capa.Any())
                return resultData;

            // Stage 1 - CAP Submission
            resultData.CAPA_SUBMISSION.STATUS = map.FirstOrDefault(t => t.STAGE_ID == 1);
            foreach (var c in capa)
            {
                if (c.STATUS == "Corrective Action Plan Rejected")
                    c.ISSUBMITTED = false;
                var ext = new AUDIT_FINDING_CAPPA_EXT();
                //var rootCause = capaDataCollection.AUDIT_MANAGEMENT_ROOTCAUSES.FirstOrDefault(x => x.ID == c.ROOT_CAUSE_ID);
                ext.CAPPALIST = c;
                ext.CAPPALIST.ROOT_CAUSE = c.ROOTCAUSE;
                var cause = capaDataCollection.AUDIT_MANAGEMENT_CAUSES.FirstOrDefault(x => x.ID == c.CAUSE_ID);
                if (cause != null)
                {
                    ext.CAUSE_ID = cause.ID;//c.ROOT_CAUSE_ID;
                    ext.CAPPALIST.CAUSE = cause.CAUSES;
                    capaList.Add(ext);
                }

            }

            resultData.CAPA_SUBMISSION.CAPA = capaList;

            //stage2 - Audit Review
            resultData.CAPA_REVIEW.STATUS = map.FirstOrDefault(t => t.STAGE_ID == 2);
            var capaReview = capaDataCollection.CAPA_REVIEW.Where(x => x.ISACTIVE && x.KPI_DETAILS_ID == kpiDetailId).ToList();

            foreach (var c in capa)
            {
                var review = capaReview.FirstOrDefault(t => t.KPI_DETAILS_ID == c.KPI_DETAILS_ID && t.CAPA_ID == c.ID && t.UNIQUE_ID == c.UNIQUE_ID && t.ISACTIVE);
                if (review == null)
                    review = new AUDIT_FINDING_CAPA_REVIEW();

                var ext = new AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED();
                ext.CAP_TARGET_DATE = c.CAP_TARGET_DATE;
                ext.CAUSE = c.CAUSE;
                ext.CORRECTION = c.CORRECTION;
                ext.CORRECTIVE_ACTION_PLAN = c.CORRECTIVE_ACTION_PLAN;
                ext.CREATED_BY = c.CREATED_BY;
                ext.CREATED_DATE = c.CREATED_DATE;
                ext.FINDING_ID = c.FINDING_ID;
                ext.KPI_DETAILS_ID = c.KPI_DETAILS_ID;
                ext.ID = c.ID;
                ext.ISACTIVE = c.ISACTIVE;
                ext.RESPONSIBLE = c.RESPONSIBLE;
                ext.ISCAPAPPROVED = review.ISAPPROVED;
                ext.ISCAPREJECTED = review.ISREJECTED;
                ext.ISROOTCAUSE = c.ISROOTCAUSE;
                ext.ISSUBMITTED = review.ISSUBMITTED;
                ext.NOTES = c.NOTES;
                ext.REMARKS = review.REMARKS;
                ext.PLAN_FOR_EFFECTIVE_CAP = c.PLAN_FOR_EFFECTIVE_CAP;
                ext.PLAN_TARGET_DATE = c.PLAN_TARGET_DATE;
                ext.REVIEW_UPDATED_BY = review.UPDATED_BY;
                ext.ROOT_CAUSE = c.ROOT_CAUSE;
                ext.ROOT_CAUSE_ID = c.ROOT_CAUSE_ID;
                ext.ISCHECKED = review.ISREJECTED.HasValue ? !(review.ISREJECTED.Value) : false;
                ext.STATUS = review.STATUS;
                ext.UNIQUE_ID = c.UNIQUE_ID;
                ext.UPDATED_BY = c.UPDATED_BY;
                ext.UPDATED_DATE = c.UPDATED_DATE;
                extList.Add(ext);
            }

            resultData.CAPA_REVIEW.CAPA = extList;

            //stage 4 -Audit Implementation
            resultData.CAP_IMPLEMENTATION.STATUS = map.Where(t => t.STAGE_ID == 3).FirstOrDefault();
            var implist = new List<AUDIT_FINDING_CAPA_IMPLEMENTATION>();
            var capaImplementation = capaDataCollection.CAPA_IMPLEMENTATION.Where(x => x.ISACTIVE && x.KPI_DETAILS_ID == kpiDetailId).ToList();
            foreach (var c in capa)
            {
                var imp = capaImplementation.OrderByDescending(x => x.ID).FirstOrDefault(t => t.KPI_DETAILS_ID == c.KPI_DETAILS_ID && t.CAPA_ID == c.ID && t.UNIQUE_ID == c.UNIQUE_ID && t.ISACTIVE);

                if (imp == null)
                {
                    imp = new AUDIT_FINDING_CAPA_IMPLEMENTATION();
                    imp.FINDING_ID = c.FINDING_ID;
                    imp.KPI_DETAILS_ID = c.KPI_DETAILS_ID;
                    imp.UNIQUE_ID = c.UNIQUE_ID;
                    imp.CAPA_ID = c.ID;
                    imp.ROOT_CAUSE_ID = c.ROOT_CAUSE_ID.HasValue ? c.ROOT_CAUSE_ID.Value : (int?)null;
                    imp.CAPADATA = c;
                    implist.Add(imp);
                }
                else
                {
                    imp.CAPADATA = c;
                    implist.Add(imp);
                }
            }
            resultData.CAP_IMPLEMENTATION.CAPA = implist;

            //stage 5 -Audit Verification

            resultData.CAP_VERIFICATION.STATUS = map.Where(t => t.STAGE_ID == 4).FirstOrDefault();
            var capaVerification = capaDataCollection.CAPA_VERIFICATION.Where(x => x.ISACTIVE && x.KPI_DETAILS_ID == kpiDetailId).ToList();
            var veriList = new List<AUDIT_FINDING_CAPA_VERIFICATION>();
            foreach (var c in capa)
            {
                var imp = capaVerification.OrderByDescending(x => x.ID).FirstOrDefault(t => t.KPI_DETAILS_ID == c.KPI_DETAILS_ID && t.ROOT_CAUSE_ID == c.ROOT_CAUSE_ID && t.UNIQUE_ID == c.UNIQUE_ID && t.ISACTIVE == true);
                if (imp == null)
                {
                    imp = new AUDIT_FINDING_CAPA_VERIFICATION();
                    imp.FINDING_ID = c.FINDING_ID;
                    imp.KPI_DETAILS_ID = c.KPI_DETAILS_ID;
                    imp.UNIQUE_ID = c.UNIQUE_ID;
                    imp.ROOT_CAUSE_ID = c.ROOT_CAUSE_ID.HasValue ? c.ROOT_CAUSE_ID.Value : (int?)null;
                    imp.CAPA_ID = c.ID;
                    imp.CAPADATA = c;
                    veriList.Add(imp);
                }
                else
                {
                    imp.CAPADATA = c;
                    veriList.Add(imp);
                }
            }
            resultData.CAP_VERIFICATION.CAPA = veriList;

            //stage 3 - CAPA Approval By Customer

            resultData.CAPA_CUSTOMER_APPROVAL.STATUS = map.Where(t => t.STAGE_ID == 5).FirstOrDefault();
            var capaIds = resultData.CAPA_SUBMISSION.CAPA.ToList().Select(x => x.CAPPALIST.ID).ToList();
            var capaCustomerApproval = capaDataCollection.CAPA_CUSTOMER_APPROVAL.Where(x => x.ISACTIVE && capaIds.Contains(x.CAPA_ID)).ToList();
            var capaCustApprovalList = new List<CUSTOMER_CAPA_APPROVAL>();
            foreach (var c in capa)
            {
                var custApproval = capaCustomerApproval.OrderByDescending(x => x.ID).FirstOrDefault(t => t.CAPA_ID == c.ID && t.ISACTIVE);
                if (custApproval == null)
                {
                    custApproval = new CUSTOMER_CAPA_APPROVAL();
                    custApproval.CAPA_ID = c.ID;
                    custApproval.CAPADATA = c;
                    //imp.FINDING_ID = c.FINDING_ID;
                    //imp.KPI_DETAILS_ID = c.KPI_DETAILS_ID;
                    //imp.UNIQUE_ID = c.UNIQUE_ID;
                    //imp.ROOT_CAUSE_ID = c.ROOT_CAUSE_ID.HasValue ? c.ROOT_CAUSE_ID.Value : (int?)null;
                    //imp.CAPADATA = c;
                    capaCustApprovalList.Add(custApproval);
                }
                else
                {
                    custApproval.CAPADATA = c;
                    capaCustApprovalList.Add(custApproval);
                }
            }
            resultData.CAPA_CUSTOMER_APPROVAL.CAPA = capaCustApprovalList;

            return resultData;
        }

        private FINDING_STAGE_DATA AddCapaForKPIInternal(FINDING_STAGE_DATA result, KPI_DETAILS kpiDtls, string serviceLevelMetric, DateTime selectedPeriod, string empId)
        {


            Guid obj;
            var fcap = new AUDIT_FINDINGS_CAPA();
            string unique;

            var capStatus = string.Empty;

            var isUpdatedInDB = false;
            var isTriggerMail = false;
            var capExistList = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => x.KPI_DETAILS_ID == kpiDtls.ID && x.ISACTIVE).ToList();
            var stageStatus = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(x => x.KPI_DETAILS_ID == kpiDtls.ID && x.STAGE_ID == 1);
            var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDtls.PRODUCT_ID);
            var responsible = new List<string>();
            var requestDomain = helper.GetAbsoulteUri();
            var month = selectedPeriod.Month;
            var year = selectedPeriod.Year;
            var path = "productkpi";
            //return Ok(results);
            if (stageStatus == null)
            {
                obj = Guid.NewGuid();
                unique = obj.ToString();
            }
            else
            {
                if (stageStatus.STAGE_STATUS == "Corrective Action Plan Resubmit")
                    capStatus = "Corrective Action Plan Resubmit";
                if (result.CAPA_SUBMISSION != null && result.CAPA_SUBMISSION.CAPA.Any() && result.CAPA_SUBMISSION.CAPA[0].CAPPALIST != null && result.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID != null)
                    unique = result.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID;
                else
                {
                    obj = Guid.NewGuid();
                    unique = obj.ToString();
                }
            }

            var filteredRows = result.CAPA_SUBMISSION.CAPA.Where(x => x.CAPPALIST.STATUS != "Corrective Action Plan Approved").ToList();
            capExistList.ForEach(x => { x.ISACTIVE = false; CSPdb.AUDIT_FINDINGS_CAPA.Update(x); });
            foreach (var cap in filteredRows)
            {
                var capaExist = capExistList.FirstOrDefault(t => t.ID == cap.CAPPALIST.ID);
                if (capaExist != null)
                {
                    capaExist.UNIQUE_ID = unique;
                    capaExist.CAP_TARGET_DATE = cap.CAPPALIST.CAP_TARGET_DATE;
                    capaExist.CORRECTION = cap.CAPPALIST.CORRECTION;
                    capaExist.CORRECTIVE_ACTION_PLAN = cap.CAPPALIST.CORRECTIVE_ACTION_PLAN;
                    capaExist.RESPONSIBLE = cap.CAPPALIST.RESPONSIBLE;

                    capaExist.ISROOTCAUSE = cap.CAPPALIST.ISROOTCAUSE;
                    capaExist.ISSUBMITTED = true;
                    capaExist.NOTES = cap.CAPPALIST.NOTES;
                    capaExist.STATUS = cap.CAPPALIST.STATUS;
                    capaExist.PLAN_FOR_EFFECTIVE_CAP = cap.CAPPALIST.PLAN_FOR_EFFECTIVE_CAP;
                    capaExist.PLAN_TARGET_DATE = cap.CAPPALIST.PLAN_TARGET_DATE;
                    //fcap.ROOT_CAUSE_ID = rootCauseList.FirstOrDefault(x=>x.CAUSE_ID == cap.CAUSE_ID && x.ROOT_CAUSE.ToLower() == cap.CAPPALIST.ROOT_CAUSE.ToLower()).ID;
                    capaExist.KPI_DETAILS_ID = kpiDtls.ID;
                    capaExist.CAUSE_ID = string.IsNullOrEmpty(cap.CAUSE_ID.ToString()) ? 1 : cap.CAUSE_ID;
                    capaExist.ROOTCAUSE = cap.CAPPALIST.ROOT_CAUSE;
                    UpdateAuditFields(capaExist, empId);
                    responsible.Add(capaExist.RESPONSIBLE);
                    if (!string.IsNullOrEmpty(capaExist.CORRECTION) && !string.IsNullOrEmpty(capaExist.CORRECTIVE_ACTION_PLAN) && !string.IsNullOrWhiteSpace(capaExist.RESPONSIBLE))
                    {
                        CSPdb.AUDIT_FINDINGS_CAPA.Update(capaExist);
                        isUpdatedInDB = true;

                    }
                }
                else
                {
                    fcap = new AUDIT_FINDINGS_CAPA();
                    fcap.UNIQUE_ID = unique;
                    fcap.CAP_TARGET_DATE = cap.CAPPALIST.CAP_TARGET_DATE;
                    fcap.CORRECTION = cap.CAPPALIST.CORRECTION;
                    fcap.CORRECTIVE_ACTION_PLAN = cap.CAPPALIST.CORRECTIVE_ACTION_PLAN;
                    fcap.RESPONSIBLE = cap.CAPPALIST.RESPONSIBLE;
                    fcap.ISROOTCAUSE = cap.CAPPALIST.ISROOTCAUSE;
                    fcap.ISSUBMITTED = true;
                    fcap.NOTES = cap.CAPPALIST.NOTES;
                    fcap.STATUS = "Corrective Action Plan Submitted";
                    fcap.PLAN_FOR_EFFECTIVE_CAP = cap.CAPPALIST.PLAN_FOR_EFFECTIVE_CAP;
                    fcap.PLAN_TARGET_DATE = cap.CAPPALIST.PLAN_TARGET_DATE.HasValue ? cap.CAPPALIST.PLAN_TARGET_DATE.Value : (DateTime?)null;
                    //fcap.ROOT_CAUSE_ID = rootCauseList.FirstOrDefault(x=>x.CAUSE_ID == cap.CAUSE_ID && x.ROOT_CAUSE.ToLower() == cap.CAPPALIST.ROOT_CAUSE.ToLower()).ID;
                    UpdateAuditFields(fcap, empId);
                    fcap.KPI_DETAILS_ID = kpiDtls.ID;
                    fcap.CAUSE_ID = string.IsNullOrEmpty(cap.CAUSE_ID.ToString()) ? 1 : cap.CAUSE_ID;
                    fcap.ROOTCAUSE = cap.CAPPALIST.ROOT_CAUSE;
                    responsible.Add(fcap.RESPONSIBLE);
                    if (!string.IsNullOrEmpty(fcap.CORRECTION) && !string.IsNullOrEmpty(fcap.CORRECTIVE_ACTION_PLAN) && fcap.RESPONSIBLE != "0")
                    {
                        CSPdb.AUDIT_FINDINGS_CAPA.Add(fcap);
                        isUpdatedInDB = true;
                        isTriggerMail = true;
                    }
                }
                if ((cap.CAPPALIST.STATUS == "Corrective Action Plan Submitted" || cap.CAPPALIST.STATUS == "Corrective Action Plan Resubmit") && isUpdatedInDB)
                    enableCAPReviewForKPI(cap);
                enableCAPApproveForKPI(cap);
            }

            if (result.CAPA_SUBMISSION.CAPA.Any() && isUpdatedInDB)
            {
                result.CAPA_SUBMISSION.CAPA[0].CAPPALIST.UNIQUE_ID = unique;
                if (capStatus == "Corrective Action Plan Resubmit")
                    UpdateStatus(result.CAPA_SUBMISSION.CAPA[0].CAPPALIST, kpiDtls.ID);
                else
                    AddStagesForCAPA(result.CAPA_SUBMISSION.CAPA[0].CAPPALIST, kpiDtls.ID, empId);

                if (isTriggerMail && product != null)
                {
                    var capasendmail = new CAPASendMail();
                    capasendmail.STAGE = "Corrective Action Plan Submission";
                    capasendmail.STATUS = "Corrective Action Plan Submitted by PM";
                    capasendmail.CAP_STAGE_ID = 1;
                    if (capStatus == "Corrective Action Plan Resubmit")
                        capasendmail.STATUS = "Corrective Action Plan Resubmitted by PM";
                    capasendmail.ACTION = "Yes";
                    capasendmail.CLASS = "hide";
                    capasendmail.SUBJECT = $"Corrective Action Plan Submission";
                    capasendmail.NEXT_ACTION = "Review Corrective Action Plan submitted";
                    capasendmail.ACTION_CLASS = "showAction";
                    capasendmail.PERIOD_TYPE = kpiDtls.PERIOD_TYPE;
                    capasendmail.PERIOD_DATE = kpiDtls.PERIOD;
                    capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION = serviceLevelMetric;
                    capasendmail.PRODUCT_NAME = product != null ? product.PRODUCT_TITLE : string.Empty;
                    capasendmail.PRODUCT_ID = kpiDtls.PRODUCT_ID;
                    capasendmail.PORTFOLIO_ID = product.PORTFOLIO_ID;
                    capasendmail.RESPONSIBILE_ID = responsible;
                    capasendmail.URL = $"{requestDomain}/{path}/{product.CUST_ID}/{product.PORTFOLIO_ID}/{kpiDtls.PRODUCT_ID}/{kpiDtls.MODE_ID}/{month}/{year}/{kpiDtls.KPI_ID}";
                    capasendmail.NOTE_MSG = $"<p> Details of CAPA against '{serviceLevelMetric}' can be viewed <a href = \'{capasendmail.URL}'\'> here </a>.</p>";
                    SendMail(capasendmail, product.CUST_ID);
                }

            }
            //}
            return result;
        }


        private void AddStagesForCAPA(AUDIT_FINDINGS_CAPA fcap, int kpiDetailsId, string empId)
        {
            var mappingsList = new List<AUDIT_FINDING_STAGES_MAPPING>();

            var newMapping = new AUDIT_FINDING_STAGES_MAPPING();
            List<int> stages = CSPdb.AUDIT_FINDING_STAGES.GetAll().Where(x => x.ISACTIVE).Select(t => t.ID).ToList();

            //var capaSubmitted = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(t => t.KPI_DETAILS_ID == kpiDetailsId && t.ISACTIVE).OrderByDescending(x => x.CREATED_DATE).ToList();
            //if (stageStatus == null)

            //foreach (var mapp in newFindings)
            //{
            if (fcap.ID == 0)
                foreach (var stage in stages)
                {
                    newMapping = new AUDIT_FINDING_STAGES_MAPPING
                    {
                        STAGE_ID = stage,
                        STAGE_STATUS = stage == 1 ? "Corrective Action Plan Submitted" : "New",
                        ISCOMPLETE = stage == 1 ? true : false,
                        KPI_DETAILS_ID = kpiDetailsId,
                        STATUS_DATE = DateTime.Now,

                    };
                    UpdateAuditFields(newMapping, empId);
                    mappingsList.Add(newMapping);
                }
            //}
            if (mappingsList.Count > 0)
                CSPdb.AUDIT_FINDING_STAGES_MAPPING.AddList(mappingsList);

            var his = new AUDIT_FINDING_CAPA_STATUS_HISTORY();
            his.KPI_DETAILS_ID = kpiDetailsId;
            his.ROOT_CAUSE_ID = fcap.ROOT_CAUSE_ID;
            his.UNIQUE_ID = fcap.UNIQUE_ID;
            his.STATUS = fcap.STATUS;

            UpdateAuditFields(his, empId);
            CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.Add(his);
            CSPdb.Commit(CanCommit);
        }

        private void enableCAPReviewForKPI(AUDIT_FINDING_CAPPA_EXT capa)
        {
            var reviewRow = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == capa.CAPPALIST.KPI_DETAILS_ID && t.CAPA_ID == capa.CAPPALIST.ID && t.ISACTIVE && t.ISREJECTED.Value);
            if (reviewRow == null)
                return;

            reviewRow.ISSUBMITTED = false;
            reviewRow.REMARKS = string.Empty;
            reviewRow.ISAPPROVED = (bool?)null;
            reviewRow.ISREJECTED = (bool?)null;
            CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(reviewRow);
        }

        private void enableCAPApproveForKPI(AUDIT_FINDING_CAPPA_EXT capa)
        {
            var approvalRow = CSPdb.CUSTOMER_CAPA_APPROVAL.GetAll().FirstOrDefault(t => t.CAPA_ID == capa.CAPPALIST.ID && t.ISACTIVE && t.STATUS_ID == 2);
            if (approvalRow == null)
                return;

            approvalRow.ISACTIVE = true;
            approvalRow.STATUS_ID = (int?)null;
            approvalRow.REMARKS = string.Empty;
            CSPdb.CUSTOMER_CAPA_APPROVAL.Update(approvalRow);
        }

        [POST("AddCAPReviewDetailsForKPI")]
        [ActionName("AddCAPReviewDetailsForKPI")]
        [HttpPost]
        public IHttpActionResult AddCAPReviewDetailsForKPI([FromBody] List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED> resultsList)
        {
            LogRequest(prefix: "AddCAPReviewDetailsForKPI", content: JsonConvert.SerializeObject(resultsList));
            var empId = GetHeaderDetails_String("empId");
            DateTime selectedPeriod = GetHeaderDetails_Date("selectedPeriod");


            var capStatus = string.Empty; var reviewResults = new FINDING_STAGE_DATA();

            var kpiDetailIds = resultsList.Select(x => x.KPI_DETAILS_ID).Distinct().ToList();

            var capSubmittedDetails = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => x.ISACTIVE && kpiDetailIds.Contains(x.KPI_DETAILS_ID)).ToList();

            var capaRevExistList = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(x => x.ISACTIVE && kpiDetailIds.Contains(x.KPI_DETAILS_ID)).ToList();

            var responsible = new List<string>();
            var requestDomain = helper.GetAbsoulteUri();
            var path = "productkpi";


            foreach (var results in resultsList.Where(x => x.ISACTIVE && !x.ISSUBMITTED))
            {


                var capaRevExist = capaRevExistList.FirstOrDefault(t => t.UNIQUE_ID == results.UNIQUE_ID && t.CAPA_ID == results.ID);

                if (capaRevExist != null)
                {
                    capaRevExist.KPI_DETAILS_ID = results.KPI_DETAILS_ID.GetValueOrDefault();
                    capaRevExist.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                    capaRevExist.UNIQUE_ID = results.UNIQUE_ID;
                    capaRevExist.ISAPPROVED = results.ISCAPAPPROVED;
                    capaRevExist.ISREJECTED = results.ISCAPREJECTED;
                    capaRevExist.REMARKS = results.REMARKS;
                    capaRevExist.STATUS = results.STATUS;
                    UpdateAuditFields(capaRevExist, empId);
                    capaRevExist.ISSUBMITTED = true;
                    responsible.Add(results.RESPONSIBLE);
                    CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(capaRevExist);
                }

                else
                {
                    var review = new AUDIT_FINDING_CAPA_REVIEW();
                    review.KPI_DETAILS_ID = results.KPI_DETAILS_ID.GetValueOrDefault();
                    review.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                    review.UNIQUE_ID = results.UNIQUE_ID;
                    review.ISAPPROVED = results.ISCAPAPPROVED;
                    review.ISREJECTED = results.ISCAPREJECTED;
                    review.REMARKS = results.REMARKS;
                    review.STATUS = results.STATUS;
                    UpdateAuditFields(review, empId);
                    review.ISSUBMITTED = true;
                    review.CAPA_ID = results.ID;
                    responsible.Add(results.RESPONSIBLE);
                    CSPdb.AUDIT_FINDING_CAPA_REVIEW.Add(review);
                }
            }


            var capRejected = resultsList.Where(x => x.ISCAPREJECTED.HasValue && x.ISCAPREJECTED.Value).ToList();

            foreach (var row in capRejected)
            {
                var capaSubmittedRow = capSubmittedDetails.FirstOrDefault(t => t.KPI_DETAILS_ID == row.KPI_DETAILS_ID && t.ID == row.ID && t.UNIQUE_ID == row.UNIQUE_ID && t.ISACTIVE);
                capaSubmittedRow.ISSUBMITTED = false;
                capaSubmittedRow.STATUS = row.STATUS;
                CSPdb.AUDIT_FINDINGS_CAPA.Update(capaSubmittedRow);
                capStatus = row.ISCAPREJECTED.HasValue && row.ISCAPREJECTED.Value ? "Corrective Action Plan Rejected" : string.Empty;
            }

            CSPdb.Commit(CanCommit);

            if (resultsList.Count > 0)
            {
                UpdateCAPReviewStatus(resultsList[0], capStatus);

                if (string.IsNullOrEmpty(capStatus))
                    capStatus = "Corrective Action Plan Approved";

                var kpiDtls = CSPdb.KPI_DETAILS.GetAll().FirstOrDefault(x => kpiDetailIds.Contains(x.ID));

                var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDtls.PRODUCT_ID && x.ISACTIVE);

                if (product != null)
                {
                    var kpi = CSPdb.KPI.GetAll().FirstOrDefault(x => x.ID == kpiDtls.KPI_ID && x.ISACTIVE);

                    var month = selectedPeriod.Month;
                    var year = selectedPeriod.Year;

                    var capasendmail = new CAPASendMail();
                    capasendmail.STAGE = "Corrective Action Plan Review";
                    capasendmail.STATUS = capStatus;
                    capasendmail.CAP_STAGE_ID = 2;

                    capasendmail.ACTION = "Yes";
                    capasendmail.CLASS = "hide";
                    capasendmail.SUBJECT = $"Corrective Action Plan Review";
                    capasendmail.ACTION_CLASS = "showAction";
                    if (capStatus == "Corrective Action Plan Approved")
                        capasendmail.NEXT_ACTION = "Customer Approval for Corrective Action Plan";
                    else if (capStatus == "Corrective Action Plan Rejected")
                        capasendmail.NEXT_ACTION = "Resubmit Corrective Action Plan after review";

                    capasendmail.PERIOD_TYPE = kpiDtls.PERIOD_TYPE;
                    capasendmail.PERIOD_DATE = kpiDtls.PERIOD;
                    capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION = kpi != null ? kpi.KPI_NAME : string.Empty;
                    capasendmail.PRODUCT_NAME = product != null ? product.PRODUCT_TITLE : string.Empty;
                    capasendmail.PRODUCT_ID = kpiDtls.PRODUCT_ID;
                    capasendmail.PORTFOLIO_ID = product.PORTFOLIO_ID;
                    capasendmail.RESPONSIBILE_ID = responsible;
                    capasendmail.URL = $"{requestDomain}/{path}/{product.CUST_ID}/{product.PORTFOLIO_ID}/{kpiDtls.PRODUCT_ID}/{kpiDtls.MODE_ID}/{month}/{year}/{kpiDtls.KPI_ID}";
                    capasendmail.NOTE_MSG = $"<p> Details of corrective action plan can be viewed <a href = \'{capasendmail.URL}'\'> here </a>.</p>";
                    SendMail(capasendmail, product.CUST_ID);
                }
            }
            return Ok();
        }


        private void UpdateCAPReviewStatus(AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED fcap, string CapStatus)
        {
            if (string.IsNullOrEmpty(CapStatus))
                CapStatus = "Corrective Action Plan Approved";

            var mapping = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.STAGE_ID == 2);
            if (mapping == null)
                return;

            switch (CapStatus)
            {
                case "Corrective Action Plan Approved":
                    mapping.STAGE_STATUS = CapStatus;
                    mapping.ISCOMPLETE = true;
                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);
                    break;
                case "Corrective Action Plan Rejected":

                    // Stage 1 
                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 1, "Corrective Action Plan Resubmit", fcap.REVIEW_UPDATED_BY);

                    // Stage 2 
                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 2, "New", fcap.REVIEW_UPDATED_BY);

                    //AUDIT_FINDING_STAGES_MAPPING stage1 = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.STAGE_ID == 1);
                    //if (stage1 != null)
                    //{
                    //    stage1.STAGE_STATUS = "CAP Resubmit";
                    //    stage1.ISCOMPLETE = false;
                    //    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(stage1);
                    //}

                    //AUDIT_FINDING_STAGES_MAPPING stage2 = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.STAGE_ID == 2);
                    //if (stage2 != null)
                    //{
                    //    stage2.STAGE_STATUS = "New";
                    //    stage2.ISCOMPLETE = false;
                    //    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(stage2);
                    //}
                    break;
            }

            var his = new AUDIT_FINDING_CAPA_STATUS_HISTORY();
            his.FINDING_ID = fcap.FINDING_ID;
            his.KPI_DETAILS_ID = fcap.KPI_DETAILS_ID;
            his.ROOT_CAUSE_ID = fcap.ROOT_CAUSE_ID;
            his.UNIQUE_ID = fcap.UNIQUE_ID;
            his.STATUS = fcap.STATUS;
            UpdateAuditFields(his, fcap.REVIEW_UPDATED_BY);
            CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.Add(his);
            CSPdb.Commit(CanCommit);
        }

        [POST("AddCAPImplementationDetailsForKPI")]
        [ActionName("AddCAPImplementationDetailsForKPI")]
        [HttpPost]
        public IHttpActionResult AddCAPImplementationDetailsForKPI([FromBody] List<AUDIT_FINDING_CAPA_IMPLEMENTATION> resultsList)
        {
            LogRequest(prefix: "AddCAPImplementationDetailsForKPI");
            var empId = GetHeaderDetails_String("empId");
            DateTime selectedPeriod = GetHeaderDetails_Date("selectedPeriod");

            var capStatus = string.Empty;

            var kpiDetailIds = resultsList.Select(x => x.KPI_DETAILS_ID).Distinct().ToList();

            var capReviewedDetails = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(x => x.ISACTIVE && kpiDetailIds.Contains(x.KPI_DETAILS_ID)).ToList();

            var responsible = new List<string>();
            var requestDomain = helper.GetAbsoulteUri();
            var path = "productkpi";


            if (resultsList == null || !resultsList.Any())
                return Ok();

            foreach (var results in resultsList)
            {
                UpdateIsActiveImplementationForKPI(results);
                var imp = new AUDIT_FINDING_CAPA_IMPLEMENTATION();
                imp.KPI_DETAILS_ID = results.KPI_DETAILS_ID;
                imp.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                imp.UNIQUE_ID = results.UNIQUE_ID;
                imp.ISIMPLEMENTED = results.ISIMPLEMENTED;
                imp.REMARKS = results.REMARKS;
                imp.STATUS = results.STATUS;
                UpdateAuditFields(imp, empId);
                imp.CAPA_ID = results.CAPA_ID;
                responsible.Add(results.CAPADATA.RESPONSIBLE);
                CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Add(imp);

                if (!imp.ISIMPLEMENTED)
                    capStatus = imp.STATUS;
            }

            CSPdb.Commit(CanCommit);

            if (string.IsNullOrEmpty(capStatus))
                capStatus = "Corrective Action Plan Implemented";

            UpdateCAPImplementationStatusForKPI(resultsList[0], capStatus);

            var kpiDtls = CSPdb.KPI_DETAILS.GetAll().FirstOrDefault(x => kpiDetailIds.Contains(x.ID));

            var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDtls.PRODUCT_ID && x.ISACTIVE);

            if (product != null)
            {
                var kpi = CSPdb.KPI.GetAll().FirstOrDefault(x => x.ID == kpiDtls.KPI_ID && x.ISACTIVE);

                var month = selectedPeriod.Month;
                var year = selectedPeriod.Year;

                var capasendmail = new CAPASendMail();
                capasendmail.STAGE = "Corrective Action Plan Implementation";
                capasendmail.STATUS = capStatus;
                capasendmail.CAP_STAGE_ID = 3;
                capasendmail.ACTION = "Yes";
                capasendmail.CLASS = "hide";
                capasendmail.SUBJECT = $"Corrective Action Plan Implementation";
                if (capStatus == "Corrective Action Plan Implemented")
                {
                    capasendmail.NEXT_ACTION = "Verify the closure corrective action and accept or reject";
                    capasendmail.ACTION_CLASS = "showAction";
                }
                else
                {
                    capasendmail.ACTION_CLASS = "hideAction";
                }
                capasendmail.PERIOD_TYPE = kpiDtls.PERIOD_TYPE;
                capasendmail.PERIOD_DATE = kpiDtls.PERIOD;
                capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION = kpi != null ? kpi.KPI_NAME : string.Empty;
                capasendmail.PRODUCT_NAME = product != null ? product.PRODUCT_TITLE : string.Empty;
                capasendmail.PRODUCT_ID = kpiDtls.PRODUCT_ID;
                capasendmail.PORTFOLIO_ID = product.PORTFOLIO_ID;
                capasendmail.RESPONSIBILE_ID = responsible;
                capasendmail.URL = $"{requestDomain}/{path}/{product.CUST_ID}/{product.PORTFOLIO_ID}/{kpiDtls.PRODUCT_ID}/{kpiDtls.MODE_ID}/{month}/{year}/{kpiDtls.KPI_ID}";
                capasendmail.NOTE_MSG = $"<p> Details of CAPA against '{capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION}' can be viewed <a href = \'{capasendmail.URL}'\'> here </a>.</p>";
                SendMail(capasendmail, product.CUST_ID);
            }
            return Ok();
        }
        private void UpdateIsActiveImplementationForKPI(AUDIT_FINDING_CAPA_IMPLEMENTATION fcap)
        {
            var capa = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.UNIQUE_ID == fcap.UNIQUE_ID && t.CAPA_ID == fcap.CAPA_ID && t.ISACTIVE);
            if (capa != null)
            {
                capa.ISACTIVE = false;
                CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Update(capa);
                CSPdb.Commit(CanCommit);
            }
        }

        private void UpdateCAPImplementationStatusForKPI(AUDIT_FINDING_CAPA_IMPLEMENTATION fcap, string capStatus)
        {
            var mapping = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.STAGE_ID == 3);
            var empId = GetHeaderDetails_String("empId");
            if (mapping == null)
                return;

            switch (capStatus)
            {
                case "Corrective Action Plan Implemented":
                    mapping.STAGE_STATUS = capStatus;
                    mapping.ISCOMPLETE = true;
                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);
                    break;
                case "Corrective Action Plan Not Implemented":
                    // Stage 2
                    //UpdateStageStatus(fcap.KPI_DETAILS_ID, 2, "CAP Re-Review", fcap.UPDATED_BY);
                    // Stage 3 
                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 3, "New", empId);

                    break;
            }
            CSPdb.Commit(CanCommit);

            var his = new AUDIT_FINDING_CAPA_STATUS_HISTORY();
            his.FINDING_ID = fcap.FINDING_ID;
            his.KPI_DETAILS_ID = fcap.KPI_DETAILS_ID;
            his.ROOT_CAUSE_ID = fcap.ROOT_CAUSE_ID;
            his.UNIQUE_ID = fcap.UNIQUE_ID;
            his.STATUS = fcap.STATUS;
            UpdateAuditFields(his, empId);
            CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.Add(his);
            CSPdb.Commit(CanCommit);
        }


        [POST("AddCAPVerificationDetailsForKPI")]
        [ActionName("AddCAPVerificationDetailsForKPI")]
        [HttpPost]
        public IHttpActionResult AddCAPVerificationDetailsForKPI([FromBody] List<AUDIT_FINDING_CAPA_VERIFICATION> resultsList)
        {
            LogRequest(prefix: "AddCAPVerificationDetailsForKPI");
            var empId = GetHeaderDetails_String("empId");
            DateTime selectedPeriod = GetHeaderDetails_Date("selectedPeriod");

            var capRecommendedAction = string.Empty;

            if (resultsList == null || !resultsList.Any())
                return Ok(resultsList);

            var kpiDetailIds = resultsList.Select(x => x.KPI_DETAILS_ID).Distinct().ToList();

            var responsible = new List<string>();
            var requestDomain = helper.GetAbsoulteUri();
            var path = "productkpi";

            var capaSubmitted = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(t => t.ISACTIVE && kpiDetailIds.Contains(t.KPI_DETAILS_ID)).ToList();

            foreach (var results in resultsList)
            {
                UpdateIsActiveVerifcationForKPI(results);
                var verfication = new AUDIT_FINDING_CAPA_VERIFICATION();
                verfication.KPI_DETAILS_ID = results.KPI_DETAILS_ID;
                verfication.ROOT_CAUSE_ID = results.ROOT_CAUSE_ID;
                verfication.UNIQUE_ID = results.UNIQUE_ID;
                verfication.ISVERIFIED = results.ISVERIFIED;
                verfication.ISREJECTED = results.ISREJECTED;
                verfication.REMARKS = results.REMARKS;
                verfication.STATUS = results.STATUS;
                verfication.RECOMMENDED_ACTION = results.RECOMMENDED_ACTION;
                verfication.CAPA_ID = results.CAPA_ID;
                UpdateAuditFields(verfication, empId);
                responsible.Add(results.CAPADATA.RESPONSIBLE);
                CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.Add(verfication);
                if (verfication.ISREJECTED)
                {
                    if (verfication.RECOMMENDED_ACTION == "ReSubmit Corrective Action Plan")
                        UpdateCAPSubmissionDetailsForKPI(verfication);

                    else if (verfication.RECOMMENDED_ACTION == "ReImplement Corrective Action Plan")
                        UpdateCAPImplementationDetailsForKPI(verfication);
                }

                else if (verfication.ISVERIFIED)
                {
                    var cap = capaSubmitted.FirstOrDefault(t => t.KPI_DETAILS_ID == verfication.KPI_DETAILS_ID && t.ROOT_CAUSE_ID == verfication.ROOT_CAUSE_ID && t.UNIQUE_ID == verfication.UNIQUE_ID && t.ISACTIVE == true);
                    cap.STATUS = verfication.STATUS;
                    CSPdb.AUDIT_FINDINGS_CAPA.Update(cap);

                }
            }

            foreach (var rec in resultsList)
            {
                if (!rec.ISREJECTED)
                    continue;

                if (rec.RECOMMENDED_ACTION == "ReSubmit Corrective Action Plan")
                {
                    capRecommendedAction = "ReSubmit Corrective Action Plan";
                    break;
                }

                capRecommendedAction = "ReImplement Corrective Action Plan";
            }

            if (string.IsNullOrEmpty(capRecommendedAction))
                capRecommendedAction = "Corrective Action Implementation Verified";

            UpdateFindingVerificationStatusForKPI(resultsList[0], capRecommendedAction);

            CSPdb.Commit(CanCommit);

            var kpiDtls = CSPdb.KPI_DETAILS.GetAll().FirstOrDefault(x => kpiDetailIds.Contains(x.ID));

            var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDtls.PRODUCT_ID && x.ISACTIVE);

            if (product != null)
            {
                var kpi = CSPdb.KPI.GetAll().FirstOrDefault(x => x.ID == kpiDtls.KPI_ID && x.ISACTIVE);
                var month = selectedPeriod.Month;
                var year = selectedPeriod.Year;

                var capasendmail = new CAPASendMail();
                capasendmail.STAGE = "Corrective Action Plan Verification";
                capasendmail.STATUS = capRecommendedAction;
                capasendmail.CAP_STAGE_ID = 4;
                capasendmail.ACTION = capRecommendedAction == "Corrective Action Implementation Verified" ? "No" : "Yes";
                capasendmail.CLASS = "hide";
                capasendmail.SUBJECT = $"Corrective Action Plan Verification";

                capasendmail.PERIOD_TYPE = kpiDtls.PERIOD_TYPE;
                capasendmail.PERIOD_DATE = kpiDtls.PERIOD;
                capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION = kpi != null ? kpi.KPI_NAME : string.Empty;
                capasendmail.PRODUCT_NAME = product != null ? product.PRODUCT_TITLE : string.Empty;
                capasendmail.PRODUCT_ID = kpiDtls.PRODUCT_ID;
                capasendmail.RESPONSIBILE_ID = responsible;
                capasendmail.PORTFOLIO_ID = product.PORTFOLIO_ID;
                capasendmail.URL = $"{requestDomain}/{path}/{product.CUST_ID}/{product.PORTFOLIO_ID}/{kpiDtls.PRODUCT_ID}/{kpiDtls.MODE_ID}/{month}/{year}/{kpiDtls.KPI_ID}";
                capasendmail.NOTE_MSG = $"<p> Details of CAPA against '{capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION}' can be viewed <a href = \'{capasendmail.URL}'\'> here </a>.</p>";
                SendMail(capasendmail, product.CUST_ID);
            }
            return Ok();
        }


        private void UpdateIsActiveVerifcationForKPI(AUDIT_FINDING_CAPA_VERIFICATION fcap)
        {
            var capa = CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.GetAll().Where(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.UNIQUE_ID == fcap.UNIQUE_ID && t.CAPA_ID == fcap.CAPA_ID).FirstOrDefault();
            if (capa != null)
            {
                capa.ISACTIVE = false;
                CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.Update(capa);
                CSPdb.Commit(CanCommit);
            }
        }

        private void UpdateCAPSubmissionDetailsForKPI(AUDIT_FINDING_CAPA_VERIFICATION verification)
        {
            var capa = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == verification.KPI_DETAILS_ID && t.ROOT_CAUSE_ID == verification.ROOT_CAUSE_ID && t.UNIQUE_ID == verification.UNIQUE_ID && t.ISACTIVE);
            if (capa != null)
            {
                capa.ISSUBMITTED = false;
                capa.STATUS = "Corrective Action Plan Submission Failed";
                CSPdb.AUDIT_FINDINGS_CAPA.Update(capa);
            }

            var capRev = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == verification.KPI_DETAILS_ID && t.ROOT_CAUSE_ID == verification.ROOT_CAUSE_ID && t.UNIQUE_ID == verification.UNIQUE_ID && t.ISACTIVE);
            if (capRev != null)
            {
                capRev.ISACTIVE = false;
                capRev.ISSUBMITTED = false;
                CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(capRev);
            }
            var capImp = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == verification.KPI_DETAILS_ID && t.ROOT_CAUSE_ID == verification.ROOT_CAUSE_ID && t.UNIQUE_ID == verification.UNIQUE_ID && t.ISACTIVE);
            if (capImp != null)
            {
                capImp.ISACTIVE = false;
                CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Update(capImp);
            }
            CSPdb.Commit(CanCommit);
        }


        private void UpdateCAPImplementationDetailsForKPI(AUDIT_FINDING_CAPA_VERIFICATION verification)
        {
            var capImp = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == verification.KPI_DETAILS_ID && t.ROOT_CAUSE_ID == verification.ROOT_CAUSE_ID && t.UNIQUE_ID == verification.UNIQUE_ID && t.ISACTIVE);
            if (capImp != null)
            {
                capImp.ISACTIVE = false;
                capImp.ISIMPLEMENTED = false;
                CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.Update(capImp);
                CSPdb.Commit(CanCommit);
            }
        }

        private void UpdateFindingVerificationStatusForKPI(AUDIT_FINDING_CAPA_VERIFICATION fcap, string CapStatus)
        {
            var mapping = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.STAGE_ID == 4 && t.ISACTIVE);

            var empId = GetHeaderDetails_String("empId");

            if (mapping == null)
                return;

            switch (CapStatus)
            {
                case "Corrective Action Implementation Verified":
                    mapping.STAGE_STATUS = "Corrective Action Implementation Verified";
                    mapping.ISCOMPLETE = true;
                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);
                    break;

                case "ReSubmit Corrective Action Plan":
                    mapping.STAGE_STATUS = "Corrective Action Implementation Failed";
                    mapping.ISCOMPLETE = false;
                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);

                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 1, "Corrective Action Plan Resubmit", empId);

                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 2, "New", empId);

                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 3, "New", empId);

                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 4, "New", empId);

                    break;

                case "ReImplement Corrective Action Plan":

                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 4, "New", fcap.UPDATED_BY);
                    UpdateStageStatus(fcap.KPI_DETAILS_ID, 3, "New", fcap.UPDATED_BY);
                    break;
            }

            var his = new AUDIT_FINDING_CAPA_STATUS_HISTORY();
            his.KPI_DETAILS_ID = fcap.KPI_DETAILS_ID;
            his.ROOT_CAUSE_ID = fcap.ROOT_CAUSE_ID;
            his.UNIQUE_ID = fcap.UNIQUE_ID;
            his.STATUS = fcap.STATUS;
            UpdateAuditFields(his, empId);
            CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.Add(his);
            CSPdb.Commit(CanCommit);
        }


        private void UpdateStageStatus(int? kpiDetailsId, int stageId, string stageStatus, string updatedBy, List<AUDIT_FINDING_STAGES_MAPPING> stageMappings = null)
        {
            if (stageMappings == null)
                stageMappings = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(t => t.KPI_DETAILS_ID == kpiDetailsId).ToList();

            var stage = stageMappings.FirstOrDefault(t => t.STAGE_ID == stageId);
            if (stage != null)
            {
                stage.ISCOMPLETE = false;
                stage.STAGE_STATUS = stageStatus;
                UpdateAuditFields(stage, updatedBy);
                CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(stage);
            }
        }

        private void SendMail(CAPASendMail capaSendMail, String custId)
        {

            if (capaSendMail == null)
                return;

            var ccmail = string.Empty; var managerMails = string.Empty;
            var customerName = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == custId)?.CUST_NM;

            capaSendMail.NEXT_ACTION = capaSendMail.ACTION_CLASS == "hideAction" ? string.Empty : $"<span> Next Action : <b> {capaSendMail.NEXT_ACTION} </b></span>";

            var mailContent = string.Empty; var customerMailContent = string.Empty;

            var csmMails = helper.GetCSMMailsFromProduct(capaSendMail.PRODUCT_ID.Value);
            var portfolioLeadMails = helper.GetPortfolioLeadMailsFromProduct(capaSendMail.PRODUCT_ID.Value);
            var empList = Cldb.EMP_INFO.GetAll().ToList();
            var productResponsibleList = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.PRODUCT_ID == capaSendMail.PRODUCT_ID.Value && x.ISACTIVE).ToList();
            var type4EmpList = productResponsibleList.Where(p => p.MANAGEMENT_TYPE == 4).Select(x => x.EMP_ID).ToList();
            var qualitySpocList = empList.Where(x => type4EmpList.Contains(x.EMP_ID)).ToList();
            var managerList = productResponsibleList.Where(p => p.MANAGEMENT_TYPE == 1).Select(x => x.EMP_ID).ToList();
            if (managerList != null)
                managerMails = string.Join(",", empList.Where(x => managerList.Contains(x.EMP_ID)).Select(x => x.EMAIL_ID).ToList());
            string toperson = string.Empty, tomail = string.Empty, selectedccs = "";

            var period = string.Empty;
            var portfolio = new PORTFOLIO();
            var portfolioLead = "99";

            if (capaSendMail.PORTFOLIO_ID != 0)
            {
                portfolio = CSPdb.PORTFOLIO.GetAll().FirstOrDefault(x => x.ID == capaSendMail.PORTFOLIO_ID);
                portfolioLead = portfolio.LEAD_EMP_ID != null && portfolio.LEAD_EMP_ID != "" ? portfolio.LEAD_EMP_ID : "99";
            }

            switch (capaSendMail.CAP_STAGE_ID)
            {
                case 1:
                case 3:
                    if (productResponsibleList.Any(p => p.MANAGEMENT_TYPE == 2))
                    {
                        var type1EmpList = productResponsibleList.Where(p => p.MANAGEMENT_TYPE == 2).Select(x => x.EMP_ID).ToList();
                        var responsibleEmps = empList.Where(x => type1EmpList.Contains(x.EMP_ID)).ToList();
                        toperson = string.Join(",", responsibleEmps.Select(x => x.FRST_NM));
                        tomail = string.Join(",", responsibleEmps.Select(x => x.EMAIL_ID));
                    }
                    else
                    {

                        toperson = string.Join(",", qualitySpocList.Select(x => x.FRST_NM));
                        tomail = string.Join(",", qualitySpocList.Select(x => x.EMAIL_ID));
                    }

                    var ccList = helper.GetEmployeeMailIdList(capaSendMail.RESPONSIBILE_ID);
                    ccList.AddRange(qualitySpocList.Select(x => x.EMAIL_ID));
                    selectedccs += string.Join(",", ccList);//string.Join(",", helper.GetPMMailsFromProduct(capaSendMail.PRODUCT_ID.Value));
                    break;
                case 2:
                case 4:
                    toperson = string.Join(",", helper.GetEmployeeNameList(capaSendMail.RESPONSIBILE_ID));//string.Join(",",helper.GetPMNamesFromProduct(capaSendMail.PRODUCT_ID.Value));
                    tomail = string.Join(",", helper.GetEmployeeMailIdList(capaSendMail.RESPONSIBILE_ID));//string.Join(",", helper.GetPMMailsFromProduct(capaSendMail.PRODUCT_ID.Value));
                    selectedccs += string.Join(",", qualitySpocList.Select(x => x.EMAIL_ID));
                    break;
                case 5:
                    var custMailId = GetHeaderDetails_String("empId");
                    if (productResponsibleList.Any(p => p.MANAGEMENT_TYPE == 2))
                    {
                        var type1EmpList = productResponsibleList.Where(p => p.MANAGEMENT_TYPE == 2).Select(x => x.EMP_ID).ToList();
                        var responsibleEmps = empList.Where(x => type1EmpList.Contains(x.EMP_ID)).ToList();
                        toperson = string.Join(",", responsibleEmps.Select(x => x.FRST_NM));
                        tomail = string.Join(",", responsibleEmps.Select(x => x.EMAIL_ID));
                    }
                    else
                    {

                        toperson = string.Join(",", qualitySpocList.Select(x => x.FRST_NM));
                        tomail = string.Join(",", qualitySpocList.Select(x => x.EMAIL_ID));
                    }

                    var ccListIds = helper.GetEmployeeMailIdList(capaSendMail.RESPONSIBILE_ID);
                    ccListIds.AddRange(qualitySpocList.Select(x => x.EMAIL_ID));
                    ccListIds.Add(custMailId);
                    selectedccs += string.Join(",", ccListIds);//string.Join(",", helper.GetPMMailsFromProduct(capaSendMail.PRODUCT_ID.Value));
                    break;
                default: break;
            }

            if (capaSendMail.PERIOD_TYPE == "Monthly" || capaSendMail.PERIOD_TYPE == "Release")
            {
                period = $" for the Month {capaSendMail.PERIOD_DATE.ToString("MMM").ToUpper()} {capaSendMail.PERIOD_DATE.Year}";

            }
            if (capaSendMail.PERIOD_TYPE == "Quarterly")
            {
                period = "for the Quarter";
            }

            var subject = $"{capaSendMail.PRODUCT_NAME} - {capaSendMail.SERVICE_LEVEL_METRIC_DESCRIPTION} - {capaSendMail.SUBJECT}";

            var qualityTeamEmail = IsPremier(custId) ? Constants.PREMIER_QUALITY_TEAM : Constants.QUALITY_MAIL;
            ccmail = helper.ConcatEmails(new List<string>() { csmMails, portfolioLeadMails, managerMails, selectedccs, qualityTeamEmail }); // quality spoc , auditor

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("TO_PERSON", toperson);
            EmailContentValues.Add("SLM_TITLE", capaSendMail.SERVICE_LEVEL_METRIC_DESCRIPTION);
            EmailContentValues.Add("PERIOD", period);
            EmailContentValues.Add("ACTION", capaSendMail.ACTION);
            EmailContentValues.Add("STAGE", capaSendMail.STAGE);
            EmailContentValues.Add("STATUS", capaSendMail.STATUS);
            EmailContentValues.Add("URL", capaSendMail.URL);
            EmailContentValues.Add("CLASS", capaSendMail.CLASS);
            EmailContentValues.Add("NEXT_ACTION", capaSendMail.NEXT_ACTION);
            EmailContentValues.Add("ACTION_CLASS", capaSendMail.ACTION_CLASS);
            EmailContentValues.Add("NOTE_MSG", capaSendMail.NOTE_MSG);
            EmailContentValues.Add("QUALITYTEAM_EMAIL", qualityTeamEmail);
            EmailContentValues.Add("CUSTOMER_NAME", customerName);
            if (IsPremier(custId))
                mailContent = helper.GetEmailContent("CapaSendMailForKPI_Premier.htm", EmailContentValues);
            else
                mailContent = helper.GetEmailContent("CapaSendMailForKPI_NonPremier.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;

            if (capaSendMail.CAP_STAGE_ID == 2 && capaSendMail.STATUS == "Corrective Action Plan Approved")
            {
                var customerList = productResponsibleList.Where(p => p.MANAGEMENT_TYPE == 5).Select(x => x.EMP_ID).ToList();
                if (customerList != null)
                {
                    toperson = string.Join(",", customerList);
                    var customerContact = CSPdb.CUSTOMER_USERS.GetAll().Where(x => customerList.Contains(x.EMAILID)).Select(x => x.DISPLAY_NAME).ToList();
                    //ccmail += "," + qualityTeamEmail;
                    if (customerContact != null)
                        EmailContentValues.Add("TO_CUSTOMERPERSON", string.Join(", ", customerContact));
                    else
                        EmailContentValues.Add("TO_CUSTOMERPERSON", string.Empty);
                    customerMailContent = helper.GetEmailContent("CapaSendMailForKPI_Customer.htm", EmailContentValues);
                    if (ep.SendEmail
                                      (
                                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                                      new EmailContent { from = _email, to = toperson, cc = ccmail, bcc = ccmail, content = customerMailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                                      Request
                                      ))
                    {

                    }
                }
            }
            else
            {
                if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = tomail, cc = ccmail, bcc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                      Request
                      ))
                {

                }
            }

        }

        private void UpdateStatus(AUDIT_FINDINGS_CAPA fcap, int KpiDetailsId)
        {

            // Cap resubmitted 
            // Stage 1 
            var empId = GetHeaderDetails_String("empId");
            var stage = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == fcap.KPI_DETAILS_ID && t.STAGE_ID == 1);
            if (stage != null)
            {
                stage.ISCOMPLETE = true;
                stage.STAGE_STATUS = "Corrective Action Plan Resubmit";
                UpdateAuditFields(stage, empId);
                CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(stage);
            }

            // Stage 2
            UpdateStageStatus(KpiDetailsId, 2, "New", empId);

            // Stage 3
            UpdateStageStatus(KpiDetailsId, 3, "New", empId);

            // Stage 4
            UpdateStageStatus(KpiDetailsId, 4, "New", empId);

            UpdateStageStatus(KpiDetailsId, 5, "New", empId);



            var his = new AUDIT_FINDING_CAPA_STATUS_HISTORY();
            his.FINDING_ID = fcap.FINDING_ID;
            his.ROOT_CAUSE_ID = fcap.ROOT_CAUSE_ID.HasValue ? fcap.ROOT_CAUSE_ID.Value : (int?)null;
            his.UNIQUE_ID = fcap.UNIQUE_ID;
            his.STATUS = fcap.STATUS;
            UpdateAuditFields(his, empId);
            CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.Add(his);
            CSPdb.Commit(CanCommit);
        }

        private void UpdateCAPAForKPI(int? kpiDetailsId)
        {
            var capa = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().FirstOrDefault(t => t.KPI_DETAILS_ID == kpiDetailsId.Value && t.ISACTIVE);
            if (capa != null)
            {
                capa.ISACTIVE = false;
                CSPdb.AUDIT_FINDINGS_CAPA.Update(capa);
                CSPdb.Commit(CanCommit);
            }

            var capaStages = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(t => t.KPI_DETAILS_ID == kpiDetailsId.Value && t.ISACTIVE).ToList();
            if (capa != null)
            {
                capaStages.ForEach(x => x.ISACTIVE = false);
                CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(capaStages);
                CSPdb.Commit(CanCommit);
            }

        }

        private CAPADataHolder GetCAPAAndRCADataCollection(List<int> kpiDetailIdList, bool isCalledFromCustomerApproval = false)
        {
            var capaDataHolder = new CAPADataHolder();

            if (!isCalledFromCustomerApproval)
            {
                capaDataHolder.AUDIT_MANAGEMENT_CAUSES = CSPdb.AUDIT_MANAGEMENT_CAUSES.GetAll().Where(x => x.ISACTIVE).ToList();
                capaDataHolder.AUDIT_MANAGEMENT_ROOTCAUSES = CSPdb.AUDIT_MANAGEMENT_ROOTCAUSES.GetAll().Where(x => x.ISACTIVE).ToList();
                capaDataHolder.CAPA_IMPLEMENTATION = CSPdb.AUDIT_FINDING_CAPA_IMPLEMENTATION.GetAll().Where(x => x.ISACTIVE && x.KPI_DETAILS_ID.HasValue && kpiDetailIdList.Contains(x.KPI_DETAILS_ID.Value)).ToList();
                capaDataHolder.CAPA_VERIFICATION = CSPdb.AUDIT_FINDING_CAPA_VERIFICATION.GetAll().Where(x => x.ISACTIVE && x.KPI_DETAILS_ID.HasValue && kpiDetailIdList.Contains(x.KPI_DETAILS_ID.Value)).ToList();
            }
            capaDataHolder.AUDIT_FINDING_STAGES_MAPPING = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(x => x.ISACTIVE && x.KPI_DETAILS_ID.HasValue && kpiDetailIdList.Contains(x.KPI_DETAILS_ID.Value)).ToList();
            capaDataHolder.CAPA_SUBMISSION = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => x.ISACTIVE && x.KPI_DETAILS_ID.HasValue && kpiDetailIdList.Contains(x.KPI_DETAILS_ID.Value)).ToList();
            capaDataHolder.CAPA_REVIEW = CSPdb.AUDIT_FINDING_CAPA_REVIEW.GetAll().Where(x => x.ISACTIVE && x.KPI_DETAILS_ID.HasValue && kpiDetailIdList.Contains(x.KPI_DETAILS_ID.Value)).ToList();
            var capaIdList = capaDataHolder.CAPA_SUBMISSION.Select(x => x.ID).ToList();
            capaDataHolder.CAPA_CUSTOMER_APPROVAL = CSPdb.CUSTOMER_CAPA_APPROVAL.GetAll().Where(x => x.ISACTIVE && capaIdList.Contains(x.CAPA_ID)).ToList();
            return capaDataHolder;
        }

        private class CAPADataHolder
        {
            public List<AUDIT_MANAGEMENT_CAUSES> AUDIT_MANAGEMENT_CAUSES { get; set; }
            public List<AUDIT_MANAGEMENT_ROOTCAUSES> AUDIT_MANAGEMENT_ROOTCAUSES { get; set; }
            public List<AUDIT_FINDING_STAGES_MAPPING> AUDIT_FINDING_STAGES_MAPPING { get; set; }
            public List<AUDIT_FINDINGS_CAPA> CAPA_SUBMISSION { get; set; }
            public List<AUDIT_FINDING_CAPA_REVIEW> CAPA_REVIEW { get; set; }
            public List<AUDIT_FINDING_CAPA_IMPLEMENTATION> CAPA_IMPLEMENTATION { get; set; }
            public List<AUDIT_FINDING_CAPA_VERIFICATION> CAPA_VERIFICATION { get; set; }
            public List<CUSTOMER_CAPA_APPROVAL> CAPA_CUSTOMER_APPROVAL { get; set; }
        }


        #endregion

        #region code for Service Metrics Details

        [POST("GetEngagementKPIDetails")]
        [ActionName("GetEngagementKPIDetails")]
        [HttpPost]
        public IHttpActionResult GetEngagementKPIDetails([FromBody] ENGAGEMENT_WISE_KPI_DATA data)
        {

            var empId = GetHeaderDetails_String("empId");
            int monthNumber = DateTime.ParseExact(data.MONTH, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(data.YEAR, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);

            DateTime startDate = range.StartDate;
            DateTime endDate = range.EndDate;

            var engagementKPIDetails = CSPdb.AppRepo.GetEngagementWiseKPIDetails(data.CUSTID, data.KPINAME, data.STATUS, startDate, endDate, data.VIEWBY).ToList();

            return Ok(engagementKPIDetails);
        }
        [GET("GetPortfolioWiseKPIDetails")]
        [ActionName("GetPortfolioWiseKPIDetails")]
        [HttpGet]
        public IHttpActionResult GetPortfolioWiseKPIDetails(string customerId, string month, int year)
        {

            var empId = GetHeaderDetails_String("empId");
            int monthNumber = DateTime.ParseExact(month, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(year, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            DateTime startDate = range.StartDate;
            DateTime endDate = range.EndDate;
            var isCustomer = !IsGavs(empId);
            var portfolios = CSPdb.PORTFOLIO.GetAll().ToList();
            var portfolio_KPI_Details = CSPdb.AppRepo.GetPortfolioWiseKPIDetails(customerId, startDate, endDate, isCustomer).ToList();
            var overallData = CSPdb.AppRepo.GetOverallProductWiseKPIData(0, startDate, endDate, isCustomer, false).ToList();
            var uptimeDetails = overallData.Where(x => x.KPI_NAME == UptimeText).ToList();
            foreach (var item in portfolios.OrderBy(x => x.TITLE))
            {
                var portfolioKPIs = portfolio_KPI_Details.Where(x => x.PORTFOLIO_ID == item.ID).ToList();
                portfolioKPIs.ForEach(x =>
                {
                    UpdateKPIWiseData(x, uptimeDetails);
                });
            }

            return Ok(portfolio_KPI_Details);
        }
        #endregion

        [GET("GetTrendHighChartDetailsForPortfolio")]
        [ActionName("GetTrendHighChartDetailsForPortfolio")]
        [HttpGet]
        public IHttpActionResult GetTrendHighChartDetailsForPortfolio(string customerId, int portId, string kpiName, DateTime currentDate, string viewBy)
        {
            DateRange range = new DateRange(currentDate, enDateRange.Monthly);
            var trendHighChartGroup = GetTrendHighChartDetailForPortfolio(customerId, portId, kpiName, range, viewBy);
            return Ok(trendHighChartGroup);
        }
        private List<HighChartsLineGroup> GetTrendHighChartDetailForPortfolio(string customerId, int portId, string KpiName, DateRange range, string viewBy)
        {
            if (KpiName == null)
                KpiName = "";
            var trendChartsGroup = new List<HighChartsLineGroup>();
            var months = int.Parse(helper.GetDBConfig("ACHIEVEMENT_TREND", customerId)) - 1;
            DateTime startDate = range.StartDate.AddMonths(-1 * months);
            DateTime endDate = range.EndDate;
            var isCustomer = !IsGavs();
            var trendDetails = CSPdb.AppRepo.GetTrendDetails(customerId, portId, KpiName, startDate, endDate).ToList();
            var details = trendDetails.Where(t => t.PORTFOLIO_ID == portId).OrderBy(u => u.PERIOD).ToList();
            var overallData = CSPdb.AppRepo.GetOverallProductWiseKPIData(0, startDate, endDate, isCustomer, false).ToList();
            var uptimeDetails = overallData.Where(x => x.KPI_NAME == UptimeText).ToList();
            details.ForEach(x =>
            {
                UpdateKPIWiseData(x, uptimeDetails);
            });

            if (details != null && details.Count > 0)
            {
                var tmpKPI = CSPdb.KPI.GetAll().FirstOrDefault(t => t.KPI_NAME == KpiName && t.ISACTIVE);
                var chart = new HighChartsLine();
                chart.title.text = details[0].PORTFOLIO_NAME;
                chart.subtitle.text = tmpKPI.KPI_NAME;
                chart.title.style = new style() { color = "#333333", fontSize = "13px" };
                chart.xAxis.gridLineWidth = 1;

                //Series Actual
                var item = new seriesItem();
                item.name = "Actual";
                item.width = 1;
                string yAxisTitle = string.Empty;
                var targets = new List<decimal>();
                var kpiTargets = CSPdb.KPI_TARGETS.GetAll().Where(t => t.KPI_ID == tmpKPI.ID && t.ISACTIVE).ToList();
                //Target Actual
                var target = new seriesItem();
                target.name = "Target";
                target.color = "#63be7b";
                target.width = 1;
                foreach (var d in details)
                {
                    targets.Add(GetPortfolioWiseKPITarget(kpiTargets, d.PERIOD, viewBy));
                    if (viewBy == "By Expected Service Level" || viewBy == "Expected Service Level")
                        GetChartsCategoriesData(chart, d.KPI_ACTUAL, kpiTargets.FirstOrDefault().EXPECTED_SERVICE_LEVEL.Value, item, target, d.PERIOD.Value, d.SLA_STATUS, tmpKPI.FREQUENCY);
                    else
                        GetChartsCategoriesData(chart, d.KPI_ACTUAL, kpiTargets.FirstOrDefault().MINIMUM_SERVICE_LEVEL.Value, item, target, d.PERIOD.Value, d.SLA_STATUS, tmpKPI.FREQUENCY);

                    yAxisTitle = "In " + tmpKPI.SLA_TARGET_UNIT_OF_MEASUREMENT;
                }



                chart.series.Add(target);
                chart.series.Add(item);
                chart.yAxis = new yAxis();
                chart.yAxis.tickInterval = 20;
                chart.yAxis.title.text = yAxisTitle;
                chart.yAxis.gridLineWidth = 1;

                var h = trendChartsGroup.FirstOrDefault(t => t.GoalName == KpiName);
                if (h != null)
                {
                    h.TrendHighChart.Add(new HighChartsLineWithArea() { KPIId = portId, AreaName = details[0].PORTFOLIO_NAME, TrendHighChart = chart });
                }
                else
                {
                    trendChartsGroup.Add(new HighChartsLineGroup() { GoalName = KpiName, TrendHighChart = new List<HighChartsLineWithArea>() { new HighChartsLineWithArea() { KPIId = portId, AreaName = details[0].PORTFOLIO_NAME, TrendHighChart = chart } } });
                }
            }
            return trendChartsGroup;
        }
        private decimal GetPortfolioWiseKPITarget(List<KPI_TARGETS> kpiTargets, DateTime? PERIOD, string viewBy)
        {
            decimal target = 0;
            var kpiTarget = kpiTargets.Where(t => PERIOD >= t.START_DATE && PERIOD <= t.END_DATE).FirstOrDefault();
            if (kpiTarget != null && (viewBy == "Expected Service Level" || viewBy == "By Expected Service Level"))
                target = Convert.ToDecimal(kpiTarget.EXPECTED_SERVICE_LEVEL);
            else if (kpiTarget != null && (viewBy == "Minimum Service Level" || viewBy == "By Minimum Service Level"))
                target = Convert.ToDecimal(kpiTarget.MINIMUM_SERVICE_LEVEL);
            return target;
        }

        private void UpdateSLAStatus()
        {
            var kpiDetails = CSPdb.KPI_DETAILS.GetAll().Where(x => x.PRODUCT_ID.HasValue && x.ISFLAG == false && x.ISACTIVE).ToList();
            var forumlaTypes = CSPdb.BASE_MEASURE_FORMULA_TYPE.GetAll().ToList();
            var kpiDetailsIds = kpiDetails.Select(x => x.ID).ToList();
            var kpiIds = kpiDetails.Select(x => x.KPI_ID).ToList();
            var kpiTargets = CSPdb.KPI_TARGETS.GetAll().Where(x => kpiIds.Contains(x.KPI_ID) && x.ISACTIVE).ToList();
            var baseMeasureList = CSPdb.KPI_BASE_MEASURE_VALUE.GetAll().Where(x => kpiDetailsIds.Contains(x.KPI_DETAILS_ID) && x.ISACTIVE).ToList();
            var baseMeasureMasterList = CSPdb.BASE_MEASURE.GetAll().ToList();
            foreach (var item in kpiDetails)
            {
                var baseMeasures = baseMeasureList.Where(x => x.KPI_DETAILS_ID == item.ID).ToList();
                if (!baseMeasures.Any()) continue;
                var formulaId = baseMeasureMasterList.First(x => x.ID == baseMeasures.First().BASE_MEASURE_ID).BASE_MEASURE_FORMULA_TYPE_ID;
                var formula = forumlaTypes.Single(x => x.ID == formulaId).FORMULA;
                item.SECONDARY_SLA_STATUS = item.SLA_STATUS;
                item.SLA_STATUS = GetSLAStatus(formulaId, item.KPI_ID, baseMeasures.Sum(x => x.NUMERATOR), baseMeasures.Sum(x => x.DENOMINATOR), formula, kpiTargets.First(x => x.KPI_ID == item.KPI_ID).EXPECTED_SERVICE_LEVEL).Item2;
                CSPdb.KPI_DETAILS.Update(item);
            }
            CSPdb.Commit(CanCommit);
        }

        [GET("GetOverallServiceMetricsForAPeriod"), ActionName("GetOverallServiceMetricsForAPeriod"), HttpGet]
        public IHttpActionResult GetOverallServiceMetricsForAPeriod(string customerId, string month, int year)
        {
            int monthNumber = DateTime.ParseExact(month, "MMM", CultureInfo.CurrentCulture).Month;
            var selectedDate = new DateTime(year, monthNumber, 1);
            DateRange range = new DateRange(selectedDate, enDateRange.Monthly);
            DateTime startDate = range.StartDate;
            DateTime endDate = range.EndDate;
            var isCustomer = !IsGavs();
            var product_Wise_Kpi = CSPdb.AppRepo.GetProductWiseKPICount(customerId, startDate, endDate, isCustomer).ToList();
            return Ok(product_Wise_Kpi);
        }

        [GET("GetAllProductList")]
        [ActionName("GetAllProductList")]
        [HttpGet]
        public IHttpActionResult GetAllProductList()
        {
            var products = new List<PORTFOLIO_PRODUCT>();
            products = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(t => t.ISACTIVE).ToList();
            return Ok(products);
        }


        [POST("AddCAPAApprovalByCustomer")]
        [ActionName("AddCAPAApprovalByCustomer")]
        [HttpPost]
        public IHttpActionResult AddCAPAApprovalByCustomer([FromBody] List<CUSTOMER_CAPA_APPROVAL> resultsList)
        {
            var stopwatch = Stopwatch.StartNew();
            LogRequest(prefix: "AddCAPAApprovalByCustomer");
            if (IsGavs())
            {
                return Content(HttpStatusCode.Conflict, "Gavs users are not allowed to update the CAPA status.");
            }
            var capStatus = "Corrective Action Plan Approved By Customer";
            UpdateCAPforthirdStage(resultsList, capStatus);

            FillResponseTime(stopwatch);
            return Ok();
        }


        [POST("AddCAPAApprovalByQASpoc")]
        [ActionName("AddCAPAApprovalByQASpoc")]
        [HttpPost]
        public IHttpActionResult AddCAPAApprovalByQASpoc([FromBody] List<CUSTOMER_CAPA_APPROVAL> resultsList)
        {
            var stopwatch = Stopwatch.StartNew();
            LogRequest(prefix: "AddCAPAApprovalByQASpoc");
            var capStatus = "Corrective Action Plan Approved By QASpoc";
            UpdateCAPforthirdStage(resultsList, capStatus);

            FillResponseTime(stopwatch);
            return Ok();
        }

        private void UpdateCAPforthirdStage(List<CUSTOMER_CAPA_APPROVAL> resultsList, string capStatus)
        {
            var kpiDetailId = resultsList.Select(x => x.CAPADATA.KPI_DETAILS_ID.Value).Distinct().ToList();
            var kpiDetails = CSPdb.KPI_DETAILS.GetAll().FirstOrDefault(x => kpiDetailId.Contains(x.ID) && x.ISACTIVE);
            var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == kpiDetails.PRODUCT_ID && x.ISACTIVE);
            var capaDetails = GetCAPAAndRCADataCollection(kpiDetailId, true);
            var capaIdList = resultsList.Select(x => x.CAPADATA.ID).Distinct().ToList();
            var capSubmittedDetails = capaDetails.CAPA_SUBMISSION.Where(x => x.ISACTIVE && capaIdList.Contains(x.ID)).ToList();
            var capReviewedDetails = capaDetails.CAPA_REVIEW.Where(x => x.ISACTIVE && x.CAPA_ID.HasValue && capaIdList.Contains(x.CAPA_ID.Value)).ToList();
            var capApproveDetails = capaDetails.CAPA_CUSTOMER_APPROVAL.Where(x => x.ISACTIVE && capaIdList.Contains(x.CAPA_ID)).ToList();
            var capRejectedList = resultsList.Where(x => x.STATUS_ID == 2).ToList();
            var responsible = new List<string>();
            var requestDomain = helper.GetAbsoulteUri();
            var path = "productkpi";

            foreach (var results in resultsList)
            {
                var exist = capApproveDetails.FirstOrDefault(x => x.CAPA_ID == results.CAPA_ID && x.ISACTIVE);
                if (exist != null)
                {
                    exist.CAPA_ID = results.CAPA_ID;
                    exist.STATUS_ID = results.STATUS_ID.HasValue ? results.STATUS_ID.Value : (int?)null;
                    exist.REMARKS = results.REMARKS;
                    UpdateAuditFields(exist);
                    responsible.Add(results.CAPADATA.RESPONSIBLE);
                    CSPdb.CUSTOMER_CAPA_APPROVAL.Update(exist);
                }
                else
                {
                    var approve = new CUSTOMER_CAPA_APPROVAL();
                    approve.CAPA_ID = results.CAPA_ID;
                    approve.STATUS_ID = results.STATUS_ID.HasValue ? results.STATUS_ID.Value : (int?)null;
                    approve.REMARKS = results.REMARKS;
                    UpdateAuditFields(approve);
                    responsible.Add(results.CAPADATA.RESPONSIBLE);
                    CSPdb.CUSTOMER_CAPA_APPROVAL.Add(approve);
                }
            }

            // Inactive stage 2  
            foreach (var row in capRejectedList)
            {
                var capReviewedRow = capReviewedDetails.FirstOrDefault(t => t.KPI_DETAILS_ID == row.CAPADATA.KPI_DETAILS_ID && t.CAPA_ID == row.CAPADATA.ID && t.ISACTIVE);
                capReviewedRow.ISSUBMITTED = false;
                capReviewedRow.STATUS = "Corrective Action Plan Rejected";
                CSPdb.AUDIT_FINDING_CAPA_REVIEW.Update(capReviewedRow);
                if (product != null)
                {
                    capStatus = row.STATUS_ID == 2 ? "Corrective Action Plan Rejected By Customer" : "Corrective Action Plan Approved By Customer";
                }
                else
                {
                    capStatus = row.STATUS_ID == 2 ? "Corrective Action Plan Rejected By QASpoc" : "Corrective Action Plan Approved By QASpoc";
                }
            }

            // Inactive stage 1  

            foreach (var row in capRejectedList)
            {
                var capaSubmittedRow = capSubmittedDetails.FirstOrDefault(t => t.KPI_DETAILS_ID == row.CAPADATA.KPI_DETAILS_ID && t.ID == row.CAPADATA.ID && t.ISACTIVE);
                capaSubmittedRow.ISSUBMITTED = false;
                capaSubmittedRow.STATUS = "Corrective Action Plan Rejected";
                CSPdb.AUDIT_FINDINGS_CAPA.Update(capaSubmittedRow);
                if (product != null)
                {
                    capStatus = row.STATUS_ID == 2 ? "Corrective Action Plan Rejected By Customer" : "Corrective Action Plan Approved By Customer";
                }
                else
                {
                    capStatus = row.STATUS_ID == 2 ? "Corrective Action Plan Rejected By QASpoc" : "Corrective Action Plan Approved By QASpoc";
                }
            }

            UpdateCAPCustomerApprovalStatus(resultsList[0], capStatus, capaDetails.AUDIT_FINDING_STAGES_MAPPING);
            CSPdb.Commit(CanCommit);

            DateTime selectedPeriod = GetHeaderDetails_Date("selectedPeriod");
            if (product != null)
            {
                var kpiDtls = CSPdb.AppRepo.GetProductKPIDetails(kpiDetailId[0]).FirstOrDefault();
                var month = selectedPeriod.Month;
                var year = selectedPeriod.Year;
                var capasendmail = new CAPASendMail();
                capasendmail.STAGE = "Corrective Action Plan Approve";
                capasendmail.STATUS = capStatus;
                capasendmail.CAP_STAGE_ID = 5;
                capasendmail.ACTION = "Yes";
                capasendmail.CLASS = "hide";
                capasendmail.SUBJECT = $"Corrective Action Plan Approve";

                if (capStatus == "Corrective Action Plan Approved By Customer")
                {
                    capasendmail.NEXT_ACTION = "Implement Corrective Action and confirm the closure";
                    capasendmail.ACTION_CLASS = "showAction";
                }
                else
                {
                    capasendmail.ACTION_CLASS = "hideAction";
                }
                capasendmail.PERIOD_TYPE = kpiDtls.PERIOD_TYPE;
                capasendmail.PERIOD_DATE = kpiDtls.PERIOD;
                capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION = kpiDtls.KPI_NAME;
                capasendmail.PRODUCT_NAME = kpiDtls.PRODUCT_TITLE;
                capasendmail.PRODUCT_ID = kpiDtls.PRODUCT_ID;
                capasendmail.PORTFOLIO_ID = kpiDtls.PORTFOLIO_ID;
                capasendmail.RESPONSIBILE_ID = responsible;
                capasendmail.URL = $"{requestDomain}/{path}/{kpiDtls.CUST_ID}/{kpiDtls.PORTFOLIO_ID}/{kpiDtls.PRODUCT_ID}/{kpiDtls.MODE_ID}/{month}/{year}/{kpiDtls.KPI_ID}";
                capasendmail.NOTE_MSG = $"<p> Details of CAPA against '{capasendmail.SERVICE_LEVEL_METRIC_DESCRIPTION}' can be viewed <a href = \'{capasendmail.URL}'\'> here </a>.</p>";
                SendMail(capasendmail, kpiDtls.CUST_ID);
            }
        }


        [GET("GetCustomerCAPAApprovalStatus")]
        [ActionName("GetCustomerCAPAApprovalStatus")]
        [HttpGet]
        public IHttpActionResult GetCustomerCAPAApprovalStatus()
        {
            var capaCustomerApprovalStatus = new List<CUSTOMER_CAPA_APPROVAL_STATUS>();
            capaCustomerApprovalStatus = CSPdb.CUSTOMER_CAPA_APPROVAL_STATUS.GetAll().Where(t => t.ISACTIVE).ToList();
            return Ok(capaCustomerApprovalStatus);
        }

        [GET("GetTrendHighChartDetailsForEngagement")]
        [ActionName("GetTrendHighChartDetailsForEngagement")]
        [HttpGet]
        public IHttpActionResult GetTrendHighChartDetailsForEngagement(string customerId, string kpiName, DateTime currentDate, string viewBy)
        {
            if (kpiName == null)
                kpiName = "";
            var trendChartsGroup = new List<HighChartsLineGroup>();

            DateRange range = new DateRange(currentDate, enDateRange.Monthly);

            var months = int.Parse(helper.GetDBConfig("ACHIEVEMENT_TREND", customerId)) - 1;
            DateTime startDate = range.StartDate.AddMonths(-1 * months);
            DateTime endDate = range.EndDate;
            var trendDetails = CSPdb.AppRepo.GetTrendDataForEngagementLevelKPI(customerId, startDate, endDate, kpiName).ToList();

            var details = trendDetails.OrderBy(u => u.PERIOD).ToList();
            if (details != null && details.Count > 0)
            {
                var tmpKPI = CSPdb.KPI.GetAll().FirstOrDefault(t => t.KPI_NAME == kpiName && t.ISACTIVE);
                var chart = new HighChartsLine();
                chart.title.text = kpiName;
                //chart.subtitle.text = tmpKPI.KPI_NAME;
                chart.title.style = new style() { color = "#333333", fontSize = "13px" };
                chart.xAxis.gridLineWidth = 1;

                //Series Actual
                var item = new seriesItem();
                item.name = "Actual";
                item.width = 1;
                string yAxisTitle = string.Empty;
                var target = new seriesItem();
                target.name = "Target";
                target.color = "#63be7b";
                target.width = 1;
                var targets = new List<decimal>();
                var kpiTargets = CSPdb.KPI_TARGETS.GetAll().Where(t => t.KPI_ID == tmpKPI.ID && t.ISACTIVE).ToList();
                foreach (var d in details)
                {
                    targets.Add(GetPortfolioWiseKPITarget(kpiTargets, d.PERIOD, viewBy));
                    if (viewBy == "By Expected Service Level" || viewBy == "Expected Service Level")
                        GetChartsCategoriesData(chart, d.ACHIEVEMENT_VALUE.ToString(), kpiTargets.FirstOrDefault().EXPECTED_SERVICE_LEVEL.Value, item, target, d.PERIOD.Value, d.SLA_STATUS, tmpKPI.FREQUENCY);
                    else
                        GetChartsCategoriesData(chart, d.ACHIEVEMENT_VALUE.ToString(), kpiTargets.FirstOrDefault().MINIMUM_SERVICE_LEVEL.Value, item, target, d.PERIOD.Value, d.SLA_STATUS, tmpKPI.FREQUENCY);

                    yAxisTitle = "In " + tmpKPI.SLA_TARGET_UNIT_OF_MEASUREMENT;

                }
                //Target 

                chart.series.Add(target);
                chart.series.Add(item);
                chart.yAxis = new yAxis();
                chart.yAxis.tickInterval = 20;
                chart.yAxis.title.text = yAxisTitle;
                chart.yAxis.gridLineWidth = 1;

                var h = trendChartsGroup.FirstOrDefault(t => t.GoalName == kpiName);
                if (h != null)
                {
                    h.TrendHighChart.Add(new HighChartsLineWithArea() { KPIId = tmpKPI.ID, AreaName = kpiName, TrendHighChart = chart });
                }
                else
                {
                    trendChartsGroup.Add(new HighChartsLineGroup() { GoalName = kpiName, TrendHighChart = new List<HighChartsLineWithArea>() { new HighChartsLineWithArea() { KPIId = tmpKPI.ID, AreaName = kpiName, TrendHighChart = chart } } });
                }
            }
            return Ok(trendChartsGroup);
        }


        private void UpdateIsActiveCustomerApprovalForKPI(CUSTOMER_CAPA_APPROVAL fcap)
        {
            var capa = CSPdb.CUSTOMER_CAPA_APPROVAL.GetAll().FirstOrDefault(t => t.CAPA_ID == fcap.CAPA_ID);
            if (capa != null)
            {
                capa.ISACTIVE = false;
                CSPdb.CUSTOMER_CAPA_APPROVAL.Update(capa);
                CSPdb.Commit(CanCommit);
            }
        }

        private void UpdateCAPCustomerApprovalStatus(CUSTOMER_CAPA_APPROVAL fcap, string capStatus, List<AUDIT_FINDING_STAGES_MAPPING> stageMappings = null)
        {
            if (stageMappings == null)
                stageMappings = CSPdb.AUDIT_FINDING_STAGES_MAPPING.GetAll().Where(t => t.KPI_DETAILS_ID == fcap.CAPADATA.KPI_DETAILS_ID).ToList();
            var mapping = stageMappings.FirstOrDefault(t => t.STAGE_ID == 5);
            var empId = GetHeaderDetails_String("empId");
            if (mapping == null)
                return;

            switch (capStatus)
            {
                case "Corrective Action Plan Approved By Customer":
                    mapping.STAGE_STATUS = capStatus;
                    mapping.ISCOMPLETE = true;
                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);
                    break;

                case "Corrective Action Plan Rejected By Customer":
                    mapping.STAGE_STATUS = capStatus;
                    mapping.ISCOMPLETE = false;

                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);

                    UpdateStageStatus(fcap.CAPADATA.KPI_DETAILS_ID, 1, "Corrective Action Plan Resubmit", empId, stageMappings);

                    UpdateStageStatus(fcap.CAPADATA.KPI_DETAILS_ID, 2, "New", empId, stageMappings);

                    UpdateStageStatus(fcap.CAPADATA.KPI_DETAILS_ID, 5, "New", empId, stageMappings);
                    break;

                case "Corrective Action Plan Approved By QASpoc":
                    mapping.STAGE_STATUS = capStatus;
                    mapping.ISCOMPLETE = true;
                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);
                    break;

                case "Corrective Action Plan Rejected By QASpoc":
                    mapping.STAGE_STATUS = capStatus;
                    mapping.ISCOMPLETE = false;

                    CSPdb.AUDIT_FINDING_STAGES_MAPPING.Update(mapping);

                    UpdateStageStatus(fcap.CAPADATA.KPI_DETAILS_ID, 1, "Corrective Action Plan Resubmit", empId, stageMappings);

                    UpdateStageStatus(fcap.CAPADATA.KPI_DETAILS_ID, 2, "New", empId, stageMappings);

                    UpdateStageStatus(fcap.CAPADATA.KPI_DETAILS_ID, 5, "New", empId, stageMappings);
                    break;
            }

            var his = new AUDIT_FINDING_CAPA_STATUS_HISTORY();
            //his.FINDING_ID = fcap.FINDING_ID;
            his.KPI_DETAILS_ID = fcap.CAPADATA.KPI_DETAILS_ID;
            his.ROOT_CAUSE_ID = fcap.CAPADATA.ROOT_CAUSE_ID;
            his.UNIQUE_ID = fcap.CAPADATA.UNIQUE_ID;
            his.STATUS = capStatus;
            UpdateAuditFields(his, empId);
            CSPdb.AUDIT_FINDING_CAPA_STATUS_HISTORY.Add(his);
        }

        private List<string> GetMonthsForQuarterly(DateTime startDate)
        {
            var month = startDate.Month.ToString();
            var getMonths = new List<string>();
            switch (month)
            {
                case "6":
                    getMonths.Add($"Apr {startDate.Year}");
                    getMonths.Add($"May {startDate.Year}");
                    getMonths.Add($"Jun {startDate.Year}");
                    break;
                case "9":
                    getMonths.Add($"Jul {startDate.Year}");
                    getMonths.Add($"Aug {startDate.Year}");
                    getMonths.Add($"Sep {startDate.Year}");
                    break;
                case "12":
                    getMonths.Add($"Oct {startDate.Year}");
                    getMonths.Add($"Nov {startDate.Year}");
                    getMonths.Add($"Dec {startDate.Year}");
                    break;
                default:
                    getMonths.Add($"Jan {startDate.Year}");
                    getMonths.Add($"Feb {startDate.Year}");
                    getMonths.Add($"Mar {startDate.Year}");
                    break;
            }
            return getMonths;

        }

        private void GetChartsCategoriesData(HighChartsLine chart, string kpiActual, decimal targets, seriesItem item, seriesItem target, DateTime period, string slaStatus, string frequency)
        {
            var monthsForQuarterly = GetMonthsForQuarterly(period).ToList();
            var xAxisText = string.Empty;
            var actual = kpiActual;
            if (frequency == "Quarterly")
            {
                foreach (var month in monthsForQuarterly)
                {
                    if (string.IsNullOrEmpty(kpiActual))
                    {
                        kpiActual = "0";
                        xAxisText = string.IsNullOrEmpty(slaStatus) ? month : $"{month} ({slaStatus})";
                    }
                    else
                    {
                        xAxisText = month;
                    }
                    chart.xAxis.categories.Add(xAxisText);
                    item.data.Add(Convert.ToDecimal(kpiActual));
                    target.data.Add(targets);
                    kpiActual = actual;
                }
            }
            else
            {
                if (string.IsNullOrEmpty(kpiActual))
                {
                    kpiActual = "0";
                    xAxisText = string.IsNullOrEmpty(slaStatus) ? period.ToString("MMM - yyyy") : $"{period.ToString("MMM - yyyy")} ({slaStatus})";
                }
                else
                {
                    xAxisText = period.ToString("MMM - yyyy");
                }
                chart.xAxis.categories.Add(xAxisText);
                item.data.Add(Convert.ToDecimal(kpiActual));
                target.data.Add(targets);
            }
        }



        private string GetSLARejectionStatus(int RejectionStatus)
        {
            var statusText = string.Empty;
            switch (RejectionStatus)
            {
                case 1:
                    statusText = "Rejected By Customer";
                    break;
                case 2:
                    statusText = "Rejection Accepted";
                    break;
                case 3:
                    statusText = "Rejection Not Accepted";
                    break;
                default: break;
            }

            return statusText;
        }





    }
}
