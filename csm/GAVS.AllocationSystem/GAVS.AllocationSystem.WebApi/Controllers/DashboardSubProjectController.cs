using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {

        private List<SubProjectDetails> GetSubprojectDetails(string custId, string projId, DateTime startDate, DateTime endDate)
        {
            var result = new List<SubProjectDetails>();
            List<PROJECT> projects = new List<PROJECT>();

            if (!string.IsNullOrWhiteSpace(projId))
            {
                projects.Add(Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projId));
            }
            else
            {
                projects.AddRange(Cldb.PROJECT.GetAll().Where(x => x.CUST_ID == custId && x.PROJ_STATUS != "close").ToList());
            }

            var projIds = projects.Select(x => x.PROJ_ID);
            var subprojects = CSPdb.SUBPROJECT.GetAll().Where(x => x.ISACTIVE && projIds.Contains(x.PROJECT_ID)).ToList();
            var subprojectTasks = CSPdb.SUBPROJECT_TASK.GetAll().Where(x => x.ISACTIVE && projIds.Contains(x.PROJECT_ID)).ToList();
            var deliverys = CSPdb.PROJECT_DELIVERY.GetAll().Where(x => x.ISACTIVE && projIds.Contains(x.PROJECT_ID) && startDate <= x.PUBLISH_DATE && endDate >= x.PUBLISH_DATE).ToList();
            foreach (var item in projects)
            {


            }
            return result;
        }
    }

    public class SubProjectDetails
    {
        public string PROJ_NM { get; set; }

        public string PROJ_ID { get; set; }

        public string PM { get; set; }

        public string RAG { get; set; }
        public DateTime START_DATE { get; set; }

        public DateTime END_DATE { get; set; }

        public DateTime FORECAST_FINISH_DATE { get; set; }

        public Milestone LAST_MILESTONE { get; set; }

        public Milestone CURRENT_MILESTONE { get; set; }

        public Milestone NEXT_MILESTONE { get; set; }
    }

    public class Milestone
    {
        public string DESCRIPTION { get; set; }

        public Decimal COMPLETION_PERCENT { get; set; }

        public string STATUS { get; set; }
    }

}