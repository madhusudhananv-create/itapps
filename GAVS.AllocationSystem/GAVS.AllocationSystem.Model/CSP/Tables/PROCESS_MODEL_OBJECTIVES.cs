using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_MODEL_OBJECTIVES
    {
        public int ID { get; set; }
        public int PROCESS_ID { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
        public string REFERENCE_DOCUMENT { get; set; }
        public string FILE_NAME_SERVER { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }

    }

    public class CONTROL_CATEGORY
    {
        public int ID { get; set; }
        public string DESCRIPTION { get; set; }
        public int PROCESS_MODEL_ID { get; set; }
    }

    public class CONTROL_REFERENCE
    {
        public int ID { get; set; }
        public string DESCRIPTION { get; set; }
        public int CONTROL_CATEGORY_ID { get; set; }
    }

    public class PROCESS_MODEL_CONTROL_NEW
    {
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }

        public string CONTROL_TYPE { get;  set;}

        public string FRAMEWORK { get; set; }
        public string FUNCTIONS { get; set; }
        public int CATEGORY { get; set; }

        public string REQUIREMENT_REFERENCE { get; set; }

        public string REFERENCE_DOCUMENT { get; set; }
        public string FILE_NAME_SERVER { get; set; }
        public bool ISACTIVE { get; set; }

        public string CLASSIFICATION { get; set; }

        public string AUTOMATION { get; set; }

        public string ASSERTION { get; set; }

        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }

        public string CONTROL_OWNER { get; set; }
    }

    public class CONTROL_RISKS_MAPPING
    {
        public int ID { get; set; }
        public int CONTROL_ID { get; set; }
        public int RISKS_ID { get; set; }

        public bool ISACTIVE { get; set; }
    }

    public class CONTROL_CLASSIFICATIONS
    {
        public int ID { get; set; }
        public string DESCRIPTION { get; set; }
    }

    public class PROCESS_MODEL_TESTS_NEW
    {
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }

        public string TEST_CLASSIFICATION { get; set; }

        public string REFERENCE_DOCUMENT { get; set; }
        public string FILE_NAME_SERVER { get; set; }
 
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
        
    }

    public class TEST_CONTROL_MAPPING
    {
        public int ID { get; set; }
        public int TEST_ID { get; set; }
        public int CONTROL_ID { get; set; }

        public bool ISACTIVE { get; set; }
    }
}
