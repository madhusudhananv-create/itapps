using AttributeRouting.Web.Mvc;
using System;
using System.Web.Http;
using System.Linq;
using GAVS.AllocationSystem.Model.CSP;
using System.Collections.Generic;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        public class AssessmentModel
        {
            public string CUST_ID { get; set; }
            public DateTime START_DATE { get; set; }
            public DateTime END_DATE { get; set; }
        }

        [POST("GetAuditsByStatus")]
        [ActionName("GetAuditsByStatus")]
        [HttpPost]
        public IHttpActionResult GetAuditsByStatus([FromBody] AssessmentModel assessmentModel)
        {
            List<TASK_EXTENDED> tasks = new List<TASK_EXTENDED>();
            // assessmentModel = new AssessmentModel() { StartDate = new DateTime(2020, 09, 01), EndDate = new DateTime(2020, 09, 30) };
            if (assessmentModel != null)
            {
                tasks = CSPdb.AppRepo.GetAllAssessments(assessmentModel.CUST_ID, assessmentModel.START_DATE, assessmentModel.END_DATE).ToList();
            }
            return Ok(tasks);
        }

        public class FindingsModel
        {
            public string CUST_ID { get; set; }
            public DateTime? START_DATE { get; set; }
            public DateTime? END_DATE { get; set; }
            public string PROJ_ID { get; set; }

        }

        [POST("GetAllFindingsForCustomer")]
        [ActionName("GetAllFindingsForCustomer")]
        [HttpPost]
        public IHttpActionResult GetAllFindingsForCustomer([FromBody] FindingsModel findingsModel)
        {
            var empId = GetHeaderDetails_String("empId");

            CheckUserHasAccess(empId, findingsModel.CUST_ID, string.Empty);

            if (!string.IsNullOrEmpty(findingsModel.PROJ_ID))
            {
                CheckUserHasAccess(empId, findingsModel.CUST_ID, findingsModel.PROJ_ID);
            }

            var startDate = findingsModel.START_DATE.HasValue ? findingsModel.START_DATE.Value.ToString("yyyy-MM-dd") : string.Empty;

            var endDate = findingsModel.START_DATE.HasValue ? findingsModel.END_DATE.Value.ToString("yyyy-MM-dd") : string.Empty;

            var basProjects = GetProjectListForUser(empId).Select(x => x.PROJ_ID).ToList();
            var findings = CSPdb.AppRepo.GetAllFindingsForCustomer(findingsModel.CUST_ID, startDate, endDate).ToList();

            findings = findings.Where(x => basProjects.Contains(x.PROJECT_ID)).ToList();
            var findingIdList = findings.Select(x => x.ID).ToList();

            string empid = "0";

            var capaSubmittedList = CSPdb.AUDIT_FINDINGS_CAPA.GetAll().Where(x => x.ISACTIVE && findingIdList.Contains(x.FINDING_ID.Value)).OrderByDescending(x => x.CAP_TARGET_DATE).ToList();

            var empIdList = capaSubmittedList.Select(x => x.RESPONSIBLE).ToList();

            var empList = Cldb.EMP_INFO.GetAll().Where(x => empIdList.Contains(x.EMP_ID)).ToList();

            var anyrec = new AUDIT_FINDINGS_CAPA();
            List<FindingsByType> findingsByTypes = new List<FindingsByType>();

            foreach (var find in findings)
            {
                anyrec = capaSubmittedList.FirstOrDefault(x => x.FINDING_ID == find.ID);
                find.TARGET_DATE = anyrec?.CAP_TARGET_DATE;
                empid = anyrec?.RESPONSIBLE;
                find.RESPONSIBLE = empList.FirstOrDefault(x => x.EMP_ID == empid)?.FRST_NM;
                find.URL = $"/layout/checklistfindings/{find.CUSTOMER_ID}/{find.PROJECT_ID}/{find.ASSESSMENT_ID}/true";

                if (!findingsByTypes.Any(x => x.FINDING_TYPE == find.FINDING_TYPE))
                    findingsByTypes.Add(new FindingsByType(find.FINDING_TYPE));

                var typerec = findingsByTypes.Find(x => x.FINDING_TYPE == find.FINDING_TYPE);

                typerec.FINDINGS.Add(find);
            }

            return Ok(findingsByTypes);
        }

    }
}