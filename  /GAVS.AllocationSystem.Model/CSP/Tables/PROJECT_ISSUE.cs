using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_ISSUE :EntityBase
    {

public string PROJECT_ID { get; set; }
public string RAG { get; set; }

public string DESCRIPTION { get; set; }
public string IMPACT_SUMMARY { get; set; }
public Boolean IS_POTENTIAL_RISK { get; set; }
public string BUSINESS_IMPACT { get; set; }
public string GEO_LOCATION { get; set; }
public string ISSUE_TYPE { get; set; }
public string SEVERITY { get; set; }
public string ACTION_PLAN { get; set; }
public string ASSIGNED_TO { get; set; }
public string IDENTIFIED_BY { get; set; }
public string REPORTED_BY { get; set; }
public string LEVEL { get; set; }
public DateTime IDENTIFIED_DATE { get; set; }
public DateTime? TARGET_DATE { get; set; }
public string STATUS { get; set; }
public DateTime? ISSUE_RESOLVED_DATE { get; set; }
public string COMMENTS { get; set; }

//public Boolean ISCUSTOMERESCALATED { get; set; }
    }
}

