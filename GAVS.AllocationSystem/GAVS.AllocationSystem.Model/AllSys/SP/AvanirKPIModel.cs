using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.SP
{
    public class AvanirKPIModel
    {
        public string Customer_Id { get; set; }
        public string Project_Id { get; set; }
        public string Success_Goal { get; set; }
        public string KPI { get; set; }
        public string Area { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Actual { get; set; }
        public string Status { get; set; }
    }

    public class KPIModel
    {
        public string CustomerId { get; set; }
        public string ProjectId { get; set; }
        public string SuccessGoal { get; set; }
        public string KpiIdentifier { get; set; }
        public string Area { get; set; }
        public string Frequency { get; set; }
        public DateTime Period { get; set; }
        public decimal Actual { get; set; }
        public string Status { get; set; }
    }
}
