using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.UI.WebControls;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetSQAReportTypes")]
        [ActionName("GetSQAReportTypes")]
        [HttpGet]
        public IHttpActionResult GetSQAReportTypes(string ProjectId)
        {
            var details = CSPdb.SQA_PROJECT_REPORTS.GetAll().Where(t => t.PROJECT_ID == ProjectId && t.ISACTIVE).ToList();
             
                return Ok(details);
        }

        [POST("GetComplianceDetailsforInsights")]
        [ActionName("GetComplianceDetailsforInsights")]
        [HttpPost]
        public IHttpActionResult GetComplianceDetailsforInsights(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            List<string> rows = JsonConvert.DeserializeObject<List<string>>(json);
            List<InsightEmployeeDetail> dash = new List<InsightEmployeeDetail>();
            var repdetails = CSPdb.SQA_DATA_REPOSITORY.GetAll().Where(t => rows.Contains(t.ROW_ID)).GroupBy(t => t.ROW_ID);
            foreach (var rep in repdetails)
            {
                InsightEmployeeDetail det = new InsightEmployeeDetail();
                det.ROW_ID = rep.Key;
                det.DATALIST = rep.ToList().OrderBy(t => t.ID).ToList<SQA_DATA_REPOSITORY>();
                dash.Add(det);
            }
            return Ok(dash);
        }

        [GET("GetAnalyzedInsights")]
        [ActionName("GetAnalyzedInsights")]
        [HttpGet]
        public IHttpActionResult GetAnalyzedInsights(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate)
        {

            InsightsCompliance insights = new InsightsCompliance();
            List<GROUPED_INSIGHTS> detail = new List<GROUPED_INSIGHTS>();
            //List<GROUPED_INSIGHTS> noncompliant = new List<GROUPED_INSIGHTS>();
            //List<GROUPED_INSIGHTS> totalemp = new List<GROUPED_INSIGHTS>();
            insights.total = CSPdb.AppRepo.GetAnalyzedInsights(CustomerId, ProjectId, ReportType, StartDate, EndDate);
            var totemp = CSPdb.AppRepo.GetEngineerwiseTotalCount(CustomerId, ProjectId, ReportType, StartDate, EndDate).GroupBy(t => t.FIELD_VALUE).ToList();
            var tocomtemp = CSPdb.AppRepo.GetEngineerComplainceCount(CustomerId, ProjectId, ReportType, StartDate, EndDate).GroupBy(t => t.FIELD_VALUE).ToList();
            var tononcomtemp = CSPdb.AppRepo.GetEngineerNonComplainceCount(CustomerId, ProjectId, ReportType, StartDate, EndDate).GroupBy(t => t.FIELD_VALUE).ToList();
            var conditionsapplied = CSPdb.AppRepo.GetReportCondition(ReportType).ToList();
            foreach (var s in totemp)
            {
                GROUPED_INSIGHTS ins = new GROUPED_INSIGHTS();
                ins.NAME = s.Key;
                ins.totalemp = s.ToList().ToList<SQA_DATA_REPOSITORY>();
                var d = tocomtemp.ToList().Where(t => t.Key == s.Key).FirstOrDefault();
                if (d != null)
                    ins.compliant = tocomtemp.ToList().Where(t => t.Key == s.Key).FirstOrDefault().ToList();
                var m = tononcomtemp.ToList().Where(t => t.Key == s.Key).FirstOrDefault();
                if (m != null)
                    ins.noncompliant = tononcomtemp.ToList().Where(t => t.Key == s.Key).FirstOrDefault().ToList();
                detail.Add(ins);
            }
            insights.RULES_APPLIED = conditionsapplied;
            insights.detailList = detail;

            return Ok(insights);
        }

        [POST("UploadSQAReportFile")]
        [ActionName("UploadSQAReportFile")]
        [HttpPost]
        public IHttpActionResult UploadSQAReportFile()
        {
           
            var httpRequest = HttpContext.Current.Request;
          var tbl = new List<SQA_PROJECT_REPORTS_STRUCT>();
            if (httpRequest.Files.Count > 0)
            {
                foreach (string file in httpRequest.Files)
                {
                    var postedFile = httpRequest.Files[file];
                    string ServerFileName = Guid.NewGuid().ToString() + System.IO.Path.GetExtension(postedFile.FileName);
                    string contentType = postedFile.ContentType;
                    var filePath = HttpContext.Current.Server.MapPath("~/UploadFile/TempFiles/" + ServerFileName);
                    postedFile.SaveAs(filePath);
                    if (Shared.OpenXML.Excel.GetExcelSheetCount(filePath) > 1)
                        return BadRequest("Excel should have only one sheet with data");

                    //Check if Report type already exists
                    int reportId = Convert.ToInt32(Request.Headers.GetValues("REPORT_ID").ToList()[0]);
                    if (reportId == 0)
                    {
                        //Store uploaded file
                        string jsonProcess = AddTempFile(postedFile.FileName, filePath, contentType);
                        //Create Report Type
                        var report = AddSQAProjectReport();
                        //Add Reports structure and upload data
                        AddSQAReportStructureAndUploadData(report.ID, filePath);
                    }
                    else
                    {
                        //Add data for existing Report Type
                        AddSQAReportData(reportId, Shared.OpenXML.Excel.GetExcelData(filePath));
                    }
                }
            }
            return Ok("Uploaded Successfully");
        }

        private SQA_PROJECT_REPORTS AddSQAProjectReport()
        {
            SQA_PROJECT_REPORTS report = new SQA_PROJECT_REPORTS()
            {
                CUSTOMER_ID = (Request.Headers.GetValues("CUSTOMER_ID").ToList()[0]),
                PROJECT_ID = Request.Headers.GetValues("PROJECT_ID").ToList()[0],
                DATA_DUMP_NAME = Request.Headers.GetValues("DATA_DUMP_NAME").ToList()[0],
                DATA_DUMP_TYPE = Request.Headers.GetValues("DATA_DUMP_TYPE").ToList()[0],
                CREATED_BY = "100365",
                CREATED_DATE = DateTime.Now,
                UPDATED_BY = "100365",
                UPDATED_DATE = DateTime.Now,
                ISACTIVE = true
            };
            CSPdb.SQA_PROJECT_REPORTS.Add(report);
            CSPdb.Commit(CanCommit);
            return report;
        }

        private void AddSQAReportStructureAndUploadData(int ReportId, string FileName)
        {
            string filePath = HttpContext.Current.Server.MapPath("~/UploadFile/TempFiles/" + Path.GetFileName(FileName));
            DataTable dt = Shared.OpenXML.Excel.GetExcelData(filePath);
            //Add Report Structure
            List<SQA_PROJECT_REPORTS_STRUCT> tbl = new List<SQA_PROJECT_REPORTS_STRUCT>();
            foreach (DataColumn col in dt.Columns)
            {
                tbl.Add(new SQA_PROJECT_REPORTS_STRUCT() { REPORT_ID = ReportId, FIELD_SORT = 0, FIELD_NAME = col.ColumnName, FIELD_DISPLAY_NAME = col.ColumnName, CHART_FIELD_NAME = "", DATA_TYPE = "varchar", REQUIRED_FIELD = true, DB_INCLUDE = true });
            }
            AddSQAReportStructure(tbl);
            //Upload Data
            AddSQAReportData(ReportId, dt);
        }
        public List<SQA_PROJECT_REPORTS_STRUCT> GetProjectReportsStructure(int ReportId, string FileName)
        {
            string filePath = HttpContext.Current.Server.MapPath("~/UploadFile/TempFiles/" + FileName);
            List<SQA_PROJECT_REPORTS_STRUCT> tbl = new List<SQA_PROJECT_REPORTS_STRUCT>();
            DataTable dt = Shared.OpenXML.Excel.GetExcelColumnHeaders(filePath);
            foreach (DataColumn col in dt.Columns)
            {
                tbl.Add(new SQA_PROJECT_REPORTS_STRUCT() { REPORT_ID = ReportId, FIELD_SORT = 0, FIELD_NAME = col.ColumnName, FIELD_DISPLAY_NAME = col.ColumnName, CHART_FIELD_NAME = "", DATA_TYPE = "varchar", REQUIRED_FIELD = true, DB_INCLUDE = true });
            }
            return tbl;
        }

        [POST("AddSQAReportStructure")]
        [ActionName("AddSQAReportStructure")]
        [HttpPost]
        public IHttpActionResult AddSQAReportStructure(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            List<SQA_PROJECT_REPORTS_STRUCT> report = JsonConvert.DeserializeObject<List<SQA_PROJECT_REPORTS_STRUCT>>(json);
            AddSQAReportStructure(report);
            return Ok();
        }

        public void AddSQAReportStructure(List<SQA_PROJECT_REPORTS_STRUCT> report)
        {
            foreach (SQA_PROJECT_REPORTS_STRUCT r in report)
            {
                SQA_PROJECT_REPORTS_STRUCT newReport = new SQA_PROJECT_REPORTS_STRUCT()
                {
                    REPORT_ID = r.REPORT_ID,
                    FIELD_SORT = r.FIELD_SORT,
                    FIELD_NAME = r.FIELD_NAME,
                    FIELD_DISPLAY_NAME = r.FIELD_DISPLAY_NAME,
                    CHART_FIELD_NAME = r.CHART_FIELD_NAME,
                    DATA_TYPE = r.DATA_TYPE,
                    REQUIRED_FIELD = r.REQUIRED_FIELD,
                    DB_INCLUDE = r.DB_INCLUDE,
                    CREATED_BY = "100365",
                    CREATED_DATE = DateTime.Now,
                    UPDATED_BY = "100365",
                    UPDATED_DATE = DateTime.Now,
                };
                CSPdb.SQA_PROJECT_REPORTS_STRUCT.Add(newReport);
                CSPdb.Commit(CanCommit);
            }
        }


        [GET("GetSQAFileStructure")]
        [ActionName("GetSQAFileStructure")]
        [HttpGet]
        public IHttpActionResult GetSQAFileStructure(string FileName)
        {
            string filePath = HttpContext.Current.Server.MapPath("~/UploadFile/TempFile" + FileName);
            string line;
            List<string> fields = new List<string>();
            using (System.IO.StreamReader sr = new StreamReader(filePath))
            {
                line = sr.ReadLine();
                //fields = line.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList<string>();
                fields = line.Split(new char[] { '|' }, StringSplitOptions.RemoveEmptyEntries).ToList<string>();
            }
            List<SQA_PROJECT_REPORTS_STRUCT> tbl = new List<SQA_PROJECT_REPORTS_STRUCT>();
            foreach (string s in fields)
            {
                tbl.Add(new SQA_PROJECT_REPORTS_STRUCT() { FIELD_NAME = s, FIELD_DISPLAY_NAME = s, CHART_FIELD_NAME = "", DATA_TYPE = "varchar", REQUIRED_FIELD = true, DB_INCLUDE = true });
            }
            return Ok(tbl);
        }


        private string AddTempFile(string filename, string ServerFileName, string contentType)
        {
            SQA_REPORT_FILES p = new SQA_REPORT_FILES()
            {
                CUSTOMER_ID = (Request.Headers.GetValues("CUSTOMER_ID").ToList()[0]),
                PROJECT_ID = Request.Headers.GetValues("PROJECT_ID").ToList()[0],
                REPORT_TYPE = Request.Headers.GetValues("DATA_DUMP_NAME").ToList()[0],
                //FILE_CONTENT = '';
                FILE_NAME = Path.GetFileNameWithoutExtension(filename),
                FILE_NAME_SERVER = ServerFileName,
                FILE_EXTENSION = Path.GetExtension(filename),
                FILE_TYPE = contentType,

                PUBLISH_DATE = DateTime.Now, // Convert.ToDateTime(Request.Headers.GetValues("PUBLISH_DATE").ToList()[0]),

                CREATED_BY = Request.Headers.GetValues("CREATED_BY").ToList()[0],
                CREATED_DATE = DateTime.Now,
                UPDATED_BY = Request.Headers.GetValues("CREATED_BY").ToList()[0],
                UPDATED_DATE = DateTime.Now,
                ISACTIVE = true
            };
            CSPdb.SQA_REPORT_FILES.Add(p);
            CSPdb.Commit(CanCommit);
            string jsonProcess = Newtonsoft.Json.JsonConvert.SerializeObject(p);
            return jsonProcess;
        }


    }

    public class InsightEmployeeDetail
    {
        public string ROW_ID { get; set; }
        public List<SQA_DATA_REPOSITORY> DATALIST { get; set; } = new List<SQA_DATA_REPOSITORY>();

    }

}