using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.Tables
{

    public class KPI_KEYWORDS : EntityBase
    {
        public int KPI_ID { get; set; }

        public string KEYWORD { get; set; }
    }
}
