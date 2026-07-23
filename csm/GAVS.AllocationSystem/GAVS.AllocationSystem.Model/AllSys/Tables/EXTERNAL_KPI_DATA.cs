using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.Tables
{
    public class EXTERNAL_KPI_DATA : EntityBase
    { 
        public string KPI_DATA { get; set; }

        public DateTime INPUT_DATE { get; set; }

        public bool IS_PROCESSED { get; set; }
        public int MASTER_ID { get; set; }

    }
}
