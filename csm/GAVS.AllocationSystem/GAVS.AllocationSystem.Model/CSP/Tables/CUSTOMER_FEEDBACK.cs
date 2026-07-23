using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CUSTOMER_FEEDBACK
    {
[Key]
public int ID { get; set; }
public string CUSTOMER_ID { get; set; }
public string CUSTOMER_EMAILID { get; set; }
public string FEEDBACK { get; set; }
public string STATUS { get; set; }
public string COMMENTS { get; set; }
public string CREATED_BY { get; set; }
public DateTime CREATED_DATE { get; set; }
public string UPDATED_BY { get; set; }
public DateTime UPDATED_DATE { get; set; }
public Boolean ISACTIVE { get; set; }
public DateTime? TARGET_DATE { get; set; }
public string TICKET_ID { get; set; }
    }
}
