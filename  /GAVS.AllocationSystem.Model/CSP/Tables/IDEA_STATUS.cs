using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IDEA_STATUS
    {
        public int ID { get; set; }

        public string TITLE { get; set; }
        public int STAGE_ID { get; set; }
        public bool ISACTIVE { get; set; }
    }

    //public enum IDEA_STATUS
    //{
    //    Submitted = 1,
    //    Reviewed = 2,
    //    Approved = 3,
    //    OnHold = 4,
    //    Draft = 5,
    //    Rejected = 6,
    //    Completed = 7,
    //    Planned = 8,
    //    Execution = 9,
    //    Implemented = 10
    //}
}
