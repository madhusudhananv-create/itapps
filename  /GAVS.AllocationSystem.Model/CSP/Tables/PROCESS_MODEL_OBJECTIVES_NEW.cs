using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_MODEL_OBJECTIVES_NEW
    {
        [Key]
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
        public string REFERENCE_DOCUMENT { get; set; }
        public string FILE_NAME_SERVER { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
    }

    public class RISKS_LEVEL1_DETAILS
    {
        public int ID { get; set; }

        public string TITLE { get; set; }
    }

    public class RISKS_LEVEL2_DETAILS
    {
        public int ID { get; set; }

        public string TITLE { get; set; }

        public int RISKLEVEL1_ID { get; set; }
    }

    public class RISKS_LEVEL3_DETAILS
    {
        public int ID { get; set; }

        public string TITLE { get; set; }

        public int RISKLEVEL2_ID { get; set; }
    }

    public class PROCESS_MODEL_RISKS_NEW
    {
        [Key]
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }

        public int RISK_CATEGORY_LEVEL1 { get; set; }
        public int RISK_CATEGORY_LEVEL2 { get; set; }
        public int RISK_CATEGORY_LEVEL3 { get; set; }

        public string RISK_OWNER { get; set; }
        public string REFERENCE_DOCUMENT { get; set; }
        public string FILE_NAME_SERVER { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

    }

    public class RISKS_OBJECTIVES_MAPPING
    {
        public int ID { get; set; }
        public int RISK_ID { get; set; }
        public int OBJECTIVE_ID { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

    }

    public  class PROCESS_OBJECTIVE_MAPPING
    {
        public int ID { get; set; }
        public int OBJECTIVES_ID { get; set; }
        public int PROCESS_ID { get; set; }
        public string CREATED_BY { get; set; }
        public  DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }

        public bool ISACTIVE { get; set; }
    }


}
