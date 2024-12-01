using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.Base;


namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_BATCHES : EntityBase
    {
        public string FREQUENCY { get; set; }
        public int SEQUENCE { get; set; }
        public int YEAR { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string STATUS { get; set; }

    }
}
