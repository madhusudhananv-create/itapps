using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class MandatoryTrainingReport
    {
        public string cust_nm { get; set; }
        public string proj_nm { get; set; }

        public string emp_id { get; set; }
        public string emp_name { get; set; }
        public string Allocation_End_Date { get; set; }

        public string quality_spoc { get; set; }
        public string Fundamentals_of_Quality_Certification { get; set; }

        public string HIPAA_Internal_Compliance_Certification { get; set; }

        public string Information_Security_Awareness_Certification { get; set; }

        public string OHSAS_Internal_Certification { get; set; }
        public string PCI_DSS_Compliance_Certification { get; set; }

        public string GDPR_Certification { get; set; }
        public string Secure_Coding_OWASP_Certification { get; set; }

        public string Infrastructure_Overview_Certification { get; set; }
        public string General_Compliance_and_Combating_Certification { get; set; }
        public string Continual_Improvement_Awareness_Certification { get; set; }

    }
}
