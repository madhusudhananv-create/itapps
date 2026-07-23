using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class DEPT_INFO
    {
        [Key]
        public short? DEPT_ID { get; set; }
        public string DEPT_NAME { get; set; }
        public string DEPT_DESC { get; set; }
    }
}
