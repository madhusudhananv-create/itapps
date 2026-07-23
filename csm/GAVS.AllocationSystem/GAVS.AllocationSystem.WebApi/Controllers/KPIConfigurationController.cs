using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Charts;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using GAVS.AllocationSystem.WebApi.Models;
using System.Text;
using System.Net.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        [GET("GetAllKpiByModeId")]
        [ActionName("GetAllKpiByModeId")]
        [HttpGet]
        public IHttpActionResult GetAllKpiByModeId(int modeId, int serviceLevelId, int prodId)
        {
            var result = CSPdb.AppRepo.GetAllKpiByModeId(modeId, serviceLevelId, prodId).ToList();
            return Ok(result);
        }

        [POST("DeleteKpiForProduct")]
        [ActionName("DeleteKpiForProduct")]
        [HttpPost]
        public IHttpActionResult DeleteKpiForProduct(int kpiId)
        {
            if (kpiId == 0)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }

            var kpiRecords = CSPdb.KPI.GetAll().FirstOrDefault(x => x.ID == kpiId && x.ISACTIVE);
            if (kpiRecords != null)
            {
                UpdateAuditFields(kpiRecords);
                kpiRecords.ISACTIVE = false;
                CSPdb.KPI.Update(kpiRecords);
            }

            var kpiTargetRecords = CSPdb.KPI_TARGETS.GetAll().FirstOrDefault(x => x.KPI_ID == kpiId && x.ISACTIVE);
            if (kpiTargetRecords != null)
            {
                UpdateAuditFields(kpiTargetRecords);
                kpiTargetRecords.ISACTIVE = false;
                CSPdb.KPI_TARGETS.Update(kpiTargetRecords);
            }

            var kpiDetailsRecords = CSPdb.KPI_DETAILS.GetAll().Where(x => x.KPI_ID == kpiId && x.ISACTIVE).ToList();
            foreach (var item in kpiDetailsRecords)
            {
                UpdateAuditFields(item);
                item.ISACTIVE = false;
                CSPdb.KPI_DETAILS.Update(item);
            }
            CSPdb.Commit(CanCommit);
            return Ok();
        }

        [GET("GetAllKpiMasterData")]
        [ActionName("GetAllKpiMasterData")]
        [HttpGet]
        public IHttpActionResult GetAllKpiMasterData()
        {
            var result = Cldb.AppRepo.GetAllKPIList().ToList();
            return Ok(result);
        }

        [POST("AddKpiList")]
        [ActionName("AddKpiList")]
        [HttpPost]
        public IHttpActionResult AddKpiList([FromBody] List<KPIMasterList> kpiList)
        {
            foreach (var item in kpiList)
            {       
                AddKPI(item);                    //1. Insert in KPI table      
                AddKPITarget(item);              //2. Insert in KPI target table    
                AddKPIProductMetrics(item);      //3. Insert KPI2PRODUCT_SERVICE_LEVEL_METRICS
                AddKPIBaseMeasure(item);         //4. service_level_measurement_2_base_measure_config
            }
            CSPdb.Commit(CanCommit);
            return Ok();
        }

        private void AddKPI(KPIMasterList results)
        {
            var kpi = new KPI();

            var exist = GetKPI(results.KPI_NAME, results.PRODUCT_ID);
            if (exist != null)
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = "KPI Record already exist for this product." });
            }

            kpi.CUSTOMER_ID = results.CUSTOMER_ID;
            kpi.PROJECT_ID = results.PROJECT_ID;
            kpi.GOAL_ID = results.GOAL_ID;
            kpi.SERVICE_AREA = results.SERVICE_AREA;
            kpi.KPI_NAME = results.KPI_NAME;
            kpi.SLA_TARGET_UNIT_OF_MEASUREMENT = results.SLA_TARGET_UNIT_OF_MEASUREMENT;
            kpi.FREQUENCY = results.FREQUENCY;
            kpi.GLOBAL_KPI_CATEGORY_ID = results.GLOBAL_KPI_CATEGORY_ID;
            kpi.MODE_ID = results.MODE_ID;
            kpi.PRODUCT_ID = results.PRODUCT_ID;
            kpi.KPI_MASTER_ID = results.KPI_MASTER_ID;

            UpdateAuditFields(kpi);
            CSPdb.KPI.Add(kpi);
            CSPdb.Commit(CanCommit);
        }

        private void AddKPITarget(KPIMasterList results)
        {
            var kpiTarget = new KPI_TARGETS();

            var kpi = GetKPI(results.KPI_NAME, results.PRODUCT_ID);
            var exist = CSPdb.KPI_TARGETS.GetAll().FirstOrDefault(x => x.KPI_ID == kpi.ID && x.ISACTIVE);
            if (exist != null)
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = "KPI Target Record already exist for this product." });
            }

            kpiTarget.KPI_ID = kpi.ID;
            kpiTarget.START_DATE = results.START_DATE;
            kpiTarget.END_DATE = results.END_DATE;
            kpiTarget.SPECIFICATION_LIMIT = results.SPECIFICATION_LIMIT;
            kpiTarget.EXPECTED_SERVICE_LEVEL = results.EXPECTED_SERVICE_LEVEL;
            kpiTarget.MINIMUM_SERVICE_LEVEL = results.MINIMUM_SERVICE_LEVEL;
            kpiTarget.KPI_TARGET_MASTER_ID = results.KPI_TARGET_MASTER_ID;

            UpdateAuditFields(kpiTarget);
            CSPdb.KPI_TARGETS.Add(kpiTarget);
        }

        private void AddKPIProductMetrics(KPIMasterList results)
        {
            var kpiMetrics = new KPI2PRODUCT_SERVICE_LEVEL_METRICS();

            var kpi = GetKPI(results.KPI_NAME, results.PRODUCT_ID);
            var exist = CSPdb.KPI2PRODUCT_SERVICE_LEVEL_METRICS.GetAll().FirstOrDefault(x => x.KPI_ID == kpi.ID && x.ISACTIVE);
            if (exist != null)
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = "KPI product metric Record already exist for this product." });
            }

            kpiMetrics.KPI_ID = kpi.ID;
            kpiMetrics.PRODUCT_SERVICE_LEVEL_METRICS_ID = results.PRODUCT_SERVICE_LEVEL_METRICS_ID;
            kpiMetrics.MASTER_ID = results.KPI_MASTER_ID;

            UpdateAuditFields(kpiMetrics);
            CSPdb.KPI2PRODUCT_SERVICE_LEVEL_METRICS.Add(kpiMetrics);
        }

        private void AddKPIBaseMeasure(KPIMasterList results)
        {
            var kpiBaseMeasure = new SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG();

            var kpi = GetKPI(results.KPI_NAME, results.PRODUCT_ID);
            var exist = CSPdb.SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG.GetAll().FirstOrDefault(x => x.KPI_ID == kpi.ID && x.ISACTIVE);
            if (exist != null)
            {
                throw new HttpResponseException(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest, ReasonPhrase = "KPI Base Measure Record already exist for this product." });
            }

            kpiBaseMeasure.KPI_ID = kpi.ID;
            kpiBaseMeasure.BASE_MEASURE_ID = results.BASE_MEASURE_ID;
            kpiBaseMeasure.MASTER_ID = results.KPI_MASTER_ID;

            UpdateAuditFields(kpiBaseMeasure);
            CSPdb.SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG.Add(kpiBaseMeasure);          
        }

        private KPI GetKPI(string kpiName, int productId)
        {
            var kpi = CSPdb.KPI.GetAll().FirstOrDefault(x => x.KPI_NAME == kpiName && x.PRODUCT_ID == productId && x.ISACTIVE);
            return kpi;
        }

        [GET("GetOverallKPIList")]
        [ActionName("GetOverallKPIList")]
        [HttpGet]
        public IHttpActionResult GetOverallKPIList()
        {
            var result = Cldb.AppRepo.GetOverallKPIList().ToList();
            return Ok(result);
        }

    }
}
