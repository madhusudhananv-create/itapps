using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class CSM_TITLES
    {
        [Key]
        public int ID { get; set; }
        public string TITLE { get; set; }
        public int SORT_ORDER { get; set; }
    }
}
