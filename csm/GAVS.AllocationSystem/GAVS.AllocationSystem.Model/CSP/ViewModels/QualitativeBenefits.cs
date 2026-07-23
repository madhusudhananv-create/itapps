using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class QualitativeBenefits
    {
        public int[] Beneficiary { get; set; }
        
        public string[] CustomerId { get; set; }

        public string[] ProjectId { get; set; }

        public string[] IdentifiedBy { get; set; }
        public int typeid { get; set; }

        public int[] BenefitPillar { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int[] StatusId { get; set; }
    }

    public class QualitativeBenefitTitle
    {
        public string Benefit_Title { get; set; }
        public TYPE Type_id { get; set; }

        public string Responsible { get; set; }

        public string Area { get; set; }

        public string Idea { get; set; }

        public string Identified_Date { get; set; }
    }

    public class IdentifiedBy_People
    {
        public int ID { get; set; }
        public string FRST_NM { get; set; }
        public string EMP_ID { get; set; }
        public string CUST_NM { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string PROJ_ID { get; set; }
    }
}
