using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJECT_COMPLIANCE_INFO
    {
        //public List<COMPLIANCE_TRAINING_ASSESSMENT_RESULT> result { get; set; } = new List<COMPLIANCE_TRAINING_ASSESSMENT_RESULT>();
        //public string PROJ_ID { get; set; }
        //public string TITLE_NAME { get; set; }
        //public string EMP_NAME { get; set; }
        //public string PROJ_NM { get; set; }
        //public DateTime IMPORT_DATE { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }

        public List<PROJECT_COMPLIANCE_DATA> PROJECT_COMPLIANCE = new List<PROJECT_COMPLIANCE_DATA>();
        public string COMPLIANCE_PERCENT { get; set; }

    }
    public class PROJECT_COMPLIANCE_DATA
    {
        public string EMP_NAME { get; set; }

        public List<PROJECT_COMPLIANCE_RESULT> RESULT = new List<PROJECT_COMPLIANCE_RESULT>();
    }
    public class PROJECT_COMPLIANCE_RESULT
    {
        public string TITLE_NAME { get; set; }
        public DateTime IMPORT_DATE { get; set; }
    }
}
