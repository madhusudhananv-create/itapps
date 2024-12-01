using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_PROCESS
    {
public int ID { get; set; }
public string PROJECT_ID { get; set; }
public string RAG { get; set; }
public byte[] FILE_CONTENT { get; set; }
public string FILE_NAME { get; set; }
public string FILE_NAME_SERVER { get; set; }
public string FILE_EXTENSION { get; set; }
public string FILE_TYPE { get; set; }
public string REPORT_TYPE { get; set; }
public string CATEGORY { get; set; }
public DateTime PUBLISH_DATE { get; set; }
public string CREATED_BY { get; set; }
public DateTime CREATED_DATE { get; set; }
public string UPDATED_BY { get; set; }
public DateTime UPDATED_DATE { get; set; }
public Boolean ISACTIVE { get; set; }
    }
}
