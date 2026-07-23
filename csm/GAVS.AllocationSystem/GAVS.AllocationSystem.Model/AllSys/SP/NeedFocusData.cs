using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class NeedFocusData
    {
        public int RISK_DUE { get; set; }
        public int RISK_NEXT { get; set; }
        public int RISK_TO_ISSUE { get; set; }
        public int ISSUE_DUE { get; set; }
        public int ISSUE_NO_DUE { get; set; }
        public int ISSUE_NEXT { get; set; }
        public int ACTION_ITEM_DUE { get; set; }
        public int ACTION_ITEM_NEXT { get; set; }
        public string PROJ_ID { get; set; }


    }
}
