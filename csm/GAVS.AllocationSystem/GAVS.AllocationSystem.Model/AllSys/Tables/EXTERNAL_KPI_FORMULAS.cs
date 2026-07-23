using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.Tables
{
    public class EXTERNAL_KPI_FORMULAS : EntityBase
    {
        public string SLA_ID { get; set; }
        public int PRODUCT_ID { get; set; }
        public string Rule_Description { get; set; }
        public string Formula_Numerator { get; set; }
        public string Formula_Denominator { get; set; } 
        public string CUSTOMER_ID { get; set; }
    }
}
