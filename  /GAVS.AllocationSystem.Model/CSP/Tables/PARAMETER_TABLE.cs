using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PARAMETER_TABLE
    {
        [Key]
        public int ID { get; set; }
        public string NAME { get; set; }
        public string OPTIONS { get; set; }
        public int SORT_ORDER { get; set; }
        public bool ISACTIVE { get; set; }

        public int OPTIONS_ID { get; set; }
    }
}
