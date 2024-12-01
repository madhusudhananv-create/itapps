using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class ENGAGEMENT_OVERVIEW
    {
public int ID { get; set; }
public string CUSTOMER_ID { get; set; }
public string RAG { get; set; }
public byte[] IMAGE { get; set; }
public string CUSTOMER_NAME { get; set; }
public string CUSTOMER_DESCRIPTION { get; set; }
public string CUSTOMER_GOALS { get; set; }
public string GAVS_DESCRIPTION { get; set; }
public string CREATED_BY { get; set; }
public DateTime CREATED_DATE { get; set; }
public string UPDATED_BY { get; set; }
public DateTime UPDATED_DATE { get; set; }
public Boolean ISACTIVE { get; set; }
    }
}
