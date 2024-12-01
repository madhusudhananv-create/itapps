using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class COMPLIANCE_TRAINING_ASSESSMENT_RESULT
    {
        public int ID { get; set; }
        public int TITLE_ID { get; set; }
        public string EMP_ID { get; set; }
        public string EMP_NAME { get; set; }
        public DateTime DATE_OF_COMPLETION { get; set; }
        public int ATTEMPTED { get; set; }
        public int CORRECT_ANSWERS { get; set; }
        public int TOTAL_MARKS { get; set; }
        public int TOTAL_PERCENTAGE { get; set; }
        public string RESULT { get; set; }
        public DateTime IMPORT_DATE { get; set; }
        public string IMPORTED_BY { get; set; }

    }
}
