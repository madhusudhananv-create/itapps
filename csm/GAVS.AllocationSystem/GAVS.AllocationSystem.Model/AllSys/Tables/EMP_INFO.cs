using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class EMP_INFO
    {
        [Key]
        public string EMP_ID { get; set; }
        public string FRST_NM { get; set; }
        public string MIDDLE_NM { get; set; }
        public string LAST_NM { get; set; }
        public DateTime? DOR { get; set; }
        

        public string EMAIL_ID { get; set; }
        public string TITLE { get; set; }
        public string EMP_CSP_ROLE { get; set; }
        public string NAME_IN_US_FORMAT { get; set; }
        public int CSM_TITLE_ID { get; set; }

        public string EMP_ID_NEW { get; set; }

        public DateTime UPDATED_DATE { get; set; }

    }
    public class EMP_INFO_DETAILED
    {
        [Key]
        public string EMP_ID { get; set; }
        public short BASE_CNTRY_ID { get; set; }
        public string MANAGER_EMP_ID { get; set; }
        public string REVIEWER_EMP_ID { get; set; }
        public string EMPL_TYPE { get; set; }
        public string FRST_NM { get; set; }
        public string MIDDLE_NM { get; set; }
        public string LAST_NM { get; set; }
        public char GENDER { get; set; }
        public DateTime? DOB { get; set; }
        public DateTime DOJ { get; set; }
        public DateTime? DOR { get; set; }
        public string LEVEL { get; set; }
        public string TITLE { get; set; }
        public string EXPERIENCE { get; set; }
        public string EMAIL_ID { get; set; }
        public string MOBILE_NBR { get; set; }
        public bool? POTENTIAL_TO_BILL { get; set; }
        public string UNBILL_CLASSIFY { get; set; }
        public string EMP_ROLE { get; set; }
        public string EMP_BAS_ROLE { get; set; }
        public string EMP_CSP_ROLE { get; set; }
        public string APPRAISAL_RATING { get; set; }
        public string PROMOTION_INFO { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public bool? SUPERADMIN { get; set; }
        public int CSM_TITLE_ID { get; set; }

        public string EMP_ID_NEW { get; set; }
    }

    public class Emp_Info_Small
    {
        public string EMP_ID { get; set; }
        
        public string FRST_NM { get; set; }

        public bool DISABLED { get; set; }
    }
}

