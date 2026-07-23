using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class MOM
    {
        public DateTime MEETING_DATE { get; set; }
        public string MEETING_TIME { get; set; }
        public string MEETING_DESCRIPTION { get; set; }
        public string MEETING_VENUE { get; set; }
        public string MEETING_AGENDA { get; set; }
        public string MEETING_PARTICIPANTS { get; set; }
        public string CHAIRPERSON { get; set; }
        public string STATUS { get; set; }
        public string CREATED_BY { get; set; }
        public List<MOM_DETAIL> MOM_ITEMS { get; set; } = new List<MOM_DETAIL>();
         public class MOM_DETAIL
        {
            public int ID { get; set; }
            public List<string> CUSTOMER_ID { get; set; } = new List<string>();
            public List<string> PROJECT_ID { get; set; } = new List<string>();
            public string DISCUSSION_POINTS { get; set; } 
            public string ACTION_ITEM { get; set; }
            public string PRIORITY { get; set; }
            //public EMP_INFO RESPONSIBILITY { get; set; }
            public string RESPONSIBILITY { get; set; }
            public DateTime? TARGET_DATE { get; set; }
        }
    }
}

