using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class IdeaViewModel
    {
        public int ID { get; set; }
        public string PROJECT_NAME { get; set; }

        public string PROJ_ID { get; set; }
        public string STATUS { get; set; }

        public int IDEA_STATUS_ID { get; set; }

        public string DESCRIPTION { get; set; }

        public DateTime? IDENTIFIED_DATE { get; set; }

        public DateTime? TARGET_DATE { get; set; }

        public string RESPONSIBLE { get; set; }
        public string Identified_By { get; set; }
        public string TYPE { get; set; }

        public string BENEFIT_TYPE { get; set; }
    }

    public class IdeaStatusUpdate
    {
        public int[] IdeaId { get; set; }

        public int Status { get; set; }
    }

    //public class IdeaAreaUpdate
    //{
    //    public int IdeaId { get; set; }

    //    public int ResponsibleId { get; set; }

    //    public int AreaId { get; set; }
    //}
}
