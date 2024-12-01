using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class SERVICE_LEVEL_IDENTIFIER_MODEL
    {
        public int ID { get; set; }
        public string SERVICE_LEVEL_IDENTIFIER { get; set; }
        public string SERVICE_LEVEL_TITLE { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY   { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }    

    


}
