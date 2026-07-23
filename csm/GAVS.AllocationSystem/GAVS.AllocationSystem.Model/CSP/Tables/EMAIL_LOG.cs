using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAVS.AllocationSystem.Model.CSP
{
    public partial class EMAIL_LOG
    {
        [Key]
        public int ID { get; set; }
        public string FROMADDRESS { get; set; }
        public string TOADDRESS { get; set; }
        public string CC { get; set; }
        public string BCC { get; set; }
        public string SUBJECTLINE { get; set; }
        public string CONTENT { get; set; }
        public string URL { get; set; }
        public bool MAILSENT { get; set; }
        public string EXCEPTION { get; set; }
        public string STACKTRACE{ get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
       
    }
}
