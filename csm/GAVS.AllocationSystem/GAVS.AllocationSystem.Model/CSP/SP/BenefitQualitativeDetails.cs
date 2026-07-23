using GAVS.AllocationSystem.Model.CSP.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class BenefitQualitativeDetails
    {
        public string Beneficiary { get; set; }

        public string CustomerId { get; set; }

        public string ProjectId { get; set; }

        public string IdentifiedBy { get; set; }
        public int typeid { get; set; }

        public string BenefitPillar { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Status { get; set; }
    }

    public class BenefitQuantitativeDetails
    {
        public string Beneficiary { get; set; }

        public string CustomerId { get; set; }

        public string ProjectId { get; set; }

        public string IdentifiedBy { get; set; }
        public int typeid { get; set; }

        public string BenefitPillar { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int UOMID { get; set; }

        public string Status { get; set; }
    }

    public class BenefitByType
    {
        public List<QualitativeBenefitTitle> Benefits_Value { get; set; }
        public List<QualitativeBenefitTitle> Benefits_ValueAdd { get; set; }

        public List<QuantitativeNetBenefits> Benefits_Quantitative_Value { get; set; }

        public List<QuantitativeNetBenefits> Benefits_Quantitative_ValueAdd { get; set; }

        public List<QuantitativeMonthlyNetBenefits> Benefits_Quantitative_Column_Value { get; set;}

        public List<QuantitativeMonthlyNetBenefits> Benefits_Quantitative_Column_ValueAdd  { get; set;}
    }
}
