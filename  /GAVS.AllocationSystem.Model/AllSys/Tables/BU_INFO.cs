using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class BU_INFO
    {
        [Key]
        public short? BU_ID { get; set; }
        public string BU_NAME {get;set;}
        public string BU_TYPE { get; set; }
        public string BU_DESC { get; set; }
    }
}
