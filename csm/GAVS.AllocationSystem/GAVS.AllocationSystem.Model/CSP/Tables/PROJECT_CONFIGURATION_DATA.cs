using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_CONFIGURATION_DATA : EntityBase
    {
         
        public string Cust_Id { get; set; }
        public string Proj_Id { get; set; }
        public int Configuration_Setting_Id { get; set; }
        public int? Int_Value { get; set; }
        public bool? Bit_Value { get; set; }
        public string String_Value { get; set; }

        public bool? Is_Approved { get; set; }

        public string Comments { get; set; }
        public string Approved_By { get; set; }

        public string Approval_Comments { get; set; }

        public DateTime? End_date { get; set; }
         

        [NotMapped]
        public PROJECT_CONFIGURATION_SETTING PROJECT_CONFIGURATION_SETTING { get; set; }
        [NotMapped]
        public bool Is_Approval { get; set; }
        [NotMapped]
        public string Approved_By_Name{ get; set; }
        [NotMapped]
        public bool isMailApproveReject { get; set; }
    }
}
