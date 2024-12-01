using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class GLOBAL_KPI_CATEGORY
    {
        [Key]
        public int ID { get; set; }
        public string SHORT_DESC { get; set; }
        public string LONG_DESC { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
    public class PERSPECTIVE_LIST
    {
        [Key]
        public int ID { get; set; }
        public string SHORT_DESC { get; set; }
        public string LONG_DESC { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
        public string PERSPECTIVE_NAME { get; set; }
       
    }
       public class GLOBAL_CAT_LIST
    {
        public string PERSPECTIVE { get; set; }
        public List<PERSPECTIVE_LIST> CATEGORY { get; set; } = new List<PERSPECTIVE_LIST>();
    }
}
