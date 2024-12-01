using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PRODUCT_RESPONSIBLE_EXTENDED   //: PRODUCT_RESPONSIBLE
    {
        public int PRODUCT_ID { get; set; }
        public string RESPONSIBLE_EMP_ID { get; set; }        
        public string RESPONSIBLE_NAME { get; set; }
       
        public string PRODUCT_TITLE { get; set; }
    }


    public class PRODUCT_RESPONSIBLE_LIST   //: PRODUCT_RESPONSIBLE
    {
        public int PRODUCT_ID { get; set; }
        public string CUST_ID { get; set; }
        public string PRODUCT_TITLE { get; set; }
        public string RESPONSIBLE_NAME { get; set; }
        public string PORTFOLIO_Name { get; set; }
      //  public string MANAGEMENT_TYPE { get; set; }
        public string MailID { get; set; } 
    }


}
