using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class FILTER_PREFERENCE
    {
        public int ID { get; set; }
        public string TABLE_NAME { get; set; }
        public String FIELD_NAME { get; set; }
        public string DISPLAY_NAME { get; set; }
        public string DATA_TYPE { get; set; }
        public bool INCLUDE { get; set; }
        public bool SORTING { get; set; }
        public bool SORTING_DIRECTION { get; set; }
        public string PARAMETER_TABLE_NAME { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
    [NotMapped]
    public class FILTER_PREFERENCE_EXT : FILTER_PREFERENCE
    {
        public List<PARAMETER_TABLE> PARAMETER_TABLE { get; set; }
    }
}
