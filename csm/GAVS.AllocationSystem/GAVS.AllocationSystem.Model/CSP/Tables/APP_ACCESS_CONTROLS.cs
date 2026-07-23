using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class APP_ACCESS_CONTROLS : EntityBase
    {
       
        public int RESOURCE_ID { get; set; }
        public int ACCESS_LEVEL { get; set; }
        public int? ROLE_ID { get; set; }
        public string CUST_ID { get; set; }
        public string EMP_ID { get; set; }
        public string PROJ_ID { get; set; }
        public bool VIEW_ACCESS { get; set; }
        public bool CREATE_ACCESS { get; set; }
        public bool EDIT_ACCESS { get; set; }
        public bool DELETE_ACCESS { get; set; }
        public bool DEFAULT_ACCESS { get; set; }
        public string COMMENTS { get; set; }
        
    }

    public class APP_ACCESS_CONTROLS_MODEL
    {
        [Key]
        public int ID { get; set; }
        public int RESOURCE_ID { get; set; }
        public int ACCESS_LEVEL { get; set; }
        public int? ROLE_ID { get; set; }
        public List<string> CUST_ID { get; set; }
        public List<string> PROJ_ID { get; set; }
        public List<string> EMP_ID { get; set; }
        public bool VIEW_ACCESS { get; set; }
        public bool CREATE_ACCESS { get; set; }
        public bool EDIT_ACCESS { get; set; }
        public bool DELETE_ACCESS { get; set; }
        //public bool DEFAULT_ACCESS { get; set; }
        //public string COMMENTS { get; set; }
    }
}
