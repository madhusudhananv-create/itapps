using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CRISP_VALIDATIONS
    {
        [Key]
        public int ID { get; set; }
        public int CRITERIA_ID { get; set; }
        public string VALIDATION_NAME { get; set; }
        public int SCORE_PERCENTAGE { get; set; }
        public Boolean AUTOPOPULATE { get; set; }
        public string VALIDATION_API_URL { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string DEFAULT_COMMENTS { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
