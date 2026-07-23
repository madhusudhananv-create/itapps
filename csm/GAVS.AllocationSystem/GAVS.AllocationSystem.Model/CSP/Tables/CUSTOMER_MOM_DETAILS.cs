using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CUSTOMER_MOM_DETAILS
    {
        [Key]
        public int ID { get; set; }
        public string MOM_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string DESCRIPTION { get; set; }
        public DateTime MOM_DATE { get; set; }
        public string MOM_TIME { get; set; }
        public string MOM_VENUE { get; set; }
        public string MOM_CHAIRPERSON { get; set; }
        public string MOM_AGENDA {get;set;}
        public string MOM_PARTICIPANTS { get; set;}
        public string DISCUSSION_POINTS { get; set; }
        public string ACTION_ITEM_ID { get; set; }
        public string ACTION_ITEM_DESCRIPTION { get; set; }
        public string ACTION_ITEM_PRIORITY { get; set; }
        public string ACTION_ITEM_RESPONSIBILITY { get; set;}
        public DateTime? ACTION_ITEM_TARGET_DATE { get; set; }
        public string MOM_STATUS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }

    }
}
