using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_CONFIGURATION_SETTING
    {
        public int Id { get; set; }
        public string Setting_Name { get; set; }
        public int Setting_Type { get; set; }
        public string Setting_Key { get; set; }
        public int? Min_Threshhold { get; set; }
        public int? Max_Threshhold { get; set; }
        public string Values_Collection { get; set; }
        public bool isActive { get; set; }
        public DateTime Created_Date { get; set; }
        public string Created_By { get; set; }
        public DateTime Updated_Date { get; set; }
        public string Updated_By { get; set; }

        [NotMapped]
        public int? Int_Value { get; set; }
        [NotMapped]
        public bool? Bit_Value { get; set; }
        [NotMapped]
        public string String_Value { get; set; }
    }
}
