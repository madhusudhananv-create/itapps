using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CUST_REQ_REF : EntityBase
    {
       
        public int Applicability_Level { get; set; }

        public string[] Customer_Project_Name { get; set; }

       // public int[] Category_Id { get; set; }
        public string Doc_Req_Reference { get; set; }
        public string Doc_Revision_No { get; set; }

        public DateTime? Doc_Revision_Date { get; set; }

        public string Requirement_Title { get; set; }
        public string Requirement_Desc { get; set; }
        public string Compliance_fulfilment { get; set; }
        public string Documents_Evidence { get; set; }
        public string Owner { get; set; }
        
        public string Concerned_Authority { get; set; }
        public string Status { get; set; }
        public string Comments { get; set; }
        public string Issues { get; set; }
        public DateTime? DocumentTargetDate { get; set; }
        public string Responsibility { get; set; }

      
    }
}
