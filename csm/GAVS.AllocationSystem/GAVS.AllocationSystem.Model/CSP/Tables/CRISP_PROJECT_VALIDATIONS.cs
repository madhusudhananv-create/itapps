using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CRISP_PROJECT_VALIDATIONS
    {
        [Key]
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public String PROJECT_ID { get; set; }
        public int VALIDATION_ID { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
    public class CRISP_PROJECT_VALIDATIONS_GROUPED
    {
        [Key]
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public String PROJECT_ID { get; set; }
        public int VALIDATION_ID { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
    //public class CRISP_PROJECT_VALIDATIONS_GROUPED
    //{

    //}
    //public class CRISP_PROJECT_VALIDATIONS_GROUPED_CRITERIA
    //{
    //    public int 
    //    public List<CRISP_PROJECT_VALIDATIONS_GROUPED_PERCENTAGE> CRISP_PROJECT_VALIDATIONS_GROUPED_PERCENTAGE { get; set; }
    //}
    //public class CRISP_PROJECT_VALIDATIONS_GROUPED_PERCENTAGE
    //{
    //    public List<CRISP_PROJECT_VALIDATIONS> CRISP_PROJECT_VALIDATIONS { get; set; }
    //}

}
