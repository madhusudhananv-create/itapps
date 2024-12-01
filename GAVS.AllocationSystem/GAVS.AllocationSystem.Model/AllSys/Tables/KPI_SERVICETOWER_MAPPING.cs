using System;
using System.Collections.Generic;
using GAVS.AllocationSystem.Model.Base;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class KPI_SERVICETOWER_MAPPING : EntityBase
    { 
        public int KPI_ID { get; set; } 
        public int SERVICE_TOWER_ID { get; set; }       

    }  
}
