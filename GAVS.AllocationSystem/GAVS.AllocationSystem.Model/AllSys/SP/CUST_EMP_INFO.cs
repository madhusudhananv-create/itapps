using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.SP
{
    public class CUST_EMP_INFO
    {
        [Key]
        public string EMP_ID { get; set; }
        public string FRST_NM { get; set; }


    }
}
