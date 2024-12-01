using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJECT
    {
        [Key]
        public string PROJ_ID { get; set; }
        public int CUST_ADDR_ID { get; set; }
        public Int16 BILL_CRNCY_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string PROJ_ALIAS_NM { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public Boolean BILL_TYPE { get; set; }
        public string PROC_TYPE { get; set; }
        public string LVL_1_APPR_EMP_ID { get; set; }
        public string LVL_2_APPR_EMP_ID { get; set; }
        public string LVL_3_APPR_EMP_ID { get; set; }
        public string LVL_4_APPR_EMP_ID { get; set; }
        public string PROJ_BUHEAD_EMP_ID { get; set; }
        public string PROJ_DM_EMP_ID { get; set; }
        public string PROJ_PM_EMP_ID { get; set; }
        public string PROJ_AM_EMP_ID { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Int16? DEPT_ID { get; set; }
        public string CUST_ID { get; set; }
        public Int16? BU_ID { get; set; }
        public string PARENT_PROJ_ID { get; set; }       
        public string QUALITY_SPOC { get; set; }
        public bool? BP_SHARE_TO_All { get; set; }
        public string PROJ_STATUS { get; set; }
        public string BUSINESS_UNIT { get; set; }
        public string PROJECT_TYPE { get; set; }
        public string DEPARTMENT { get; set; }
        public string PROJECT_GROUP { get; set; }

        public string CONTRACTING_UNIT { get; set; }

        public string COUNTRY { get; set; }

        public string METHODOLOGY { get; set; }
        public string GUID { get; set; }
        public string REVENUE_TYPE { get; set; }

        public string PROJ_EP_ID { get; set; }
    }

    public class PROJECTSPOC
    {
        public string PROJ_PM_EMP_ID { get; set; }
        public string PROJ_DM_EMP_ID { get; set; }
        public string QA_HEAD { get; set; }
    }
}
