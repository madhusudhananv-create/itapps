using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CRISP_SCORES_PROJECT
    {
        [Key]
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public String PROJECT_ID { get; set; }
        public DateTime PUBLISH_DATE { get; set; }
        public int SCORE { get; set; }
        public Boolean NEED_FOCUS { get; set; }
        public string COMMENTS { get; set; }
        public string CSM_GENERATED_COMMENTS { get; set; }
        public Boolean HR_NEED_FOCUS { get; set; }
        public string HR_NEED_FOCUS_COMMENTS { get; set; }
        public string STATUS { get; set; }
        public Boolean SELECTED { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
