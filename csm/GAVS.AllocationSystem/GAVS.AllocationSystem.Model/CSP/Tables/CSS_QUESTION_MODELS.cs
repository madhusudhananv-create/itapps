using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_QUESTION_MODELS
    {
        public int ID { get; set; }
        public string MODEL_NAME { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

        public string CATEGORY { get; set; }
    }
}
