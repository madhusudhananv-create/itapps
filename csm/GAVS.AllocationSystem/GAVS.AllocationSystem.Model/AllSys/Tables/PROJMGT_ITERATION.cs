using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJMGT_ITERATION
    {
        [Key]
        public int ID { get; set; }
        public int ITERATION_ID { get; set; }
        public string NAME { get; set; }
        public int RELEASE_ID { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? SUB_PROJ_ID { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
