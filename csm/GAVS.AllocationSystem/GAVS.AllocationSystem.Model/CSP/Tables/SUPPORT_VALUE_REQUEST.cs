using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class SUPPORT_VALUE_REQUEST : EntityBase
    {
        public int SUPPORT_VALUE_TYPE_ID { get; set; }

        public string SUPPORT_VALUE { get; set; }

        public string REQUESTED_BY { get; set; }

        public int Status { get; set; }

        public string HANDLED_BY { get; set; }

    }
}
