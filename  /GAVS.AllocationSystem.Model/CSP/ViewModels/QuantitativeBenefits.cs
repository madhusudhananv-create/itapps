using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
   public class QuantitativeBenefits : IdeasFilter
    {
        public int UOMID { get; set; }

        
    }

    public class IdeasFilter
    {
        public int[] Beneficiary { get; set; }
        public int[] BenefitPillar { get; set; }
        public int typeid { get; set; }
        public string[] CustomerId { get; set; }

        public string[] ProjectId { get; set; }

        public string[] IdentifiedBy { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int[] StatusId { get; set; }
    }

    public class IdeasSPFilter
    {
        public string Beneficiary { get; set; }
        public string CustomerId { get; set; }

        public string ProjectId { get; set; }

        public string IdentifiedBy { get; set; }
        public int typeid { get; set; }
        public string BenefitPillar { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class QuantitativeNetBenefits
    {
        public string Benefit_Pillar { get; set; }
        public int Net_Benefits { get; set; }

        public string Responsible { get; set; }

        public string Area { get; set; }

        public string Idea { get; set; }

        public string Identified_Date { get; set; }

        public TYPE Type_id { get; set; }
    }

    public class QuantitativeMonthlyNetBenefits
    {
        public string Benefit_Pillar { get; set; }
        public int Net_Benefits { get; set; }
        public string Months { get; set; }

        public TYPE Type_id { get; set; }
    }


    public class UOM_Title
    {
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string DATATYPE_SYMBOL { get; set; }
        
    }

    

}
