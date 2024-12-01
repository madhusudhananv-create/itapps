using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class ACCESS_CONTROL
    {
        [Key]
        public int ID { get; set; }
        public int RESOURCE_ID { get; set; }
        public string RESOURCE_TYPE { get; set; }
        public string RESOURCE_NAME { get; set; }
        public int? ROLE_ID { get; set; }
        public string EMP_ID { get; set; }
        public bool VIEW_ACCESS { get; set; }
        public bool CREATE_ACCESS { get; set; }
        public bool EDIT_ACCESS { get; set; }
        public bool DELETE_ACCESS { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
