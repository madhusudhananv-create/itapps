using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public partial class APPRECIATIONDETAILS : EntityBase
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string PORTFOLIO_NAME { get; set; }
        public string APPRECIATED_BY { get; set; }
        public string COMMENTS { get; set; }
        public string RECIPIENT { get; set; }
        public string RECIPIENT_NM { get; set; }
        public string DESIGNATION { get; set; }
        public DateTime RECEIVED_DATE { get; set; }
    }
}
