using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_PROCESS_DATA
    {
        public List<PROJECT_PROCESS_TYPE> PROJECT_PROCESS_TYPE { get; set; } = new List<CSP.PROJECT_PROCESS_TYPE>();
        public List<DDData> DDData { get; set; } = new List<CSP.DDData>();
    }
   
    public class PROJECT_PROCESS_TYPE
    {
        public string REPORT_TYPE { get; set; }
        public List<PROJECT_PROCESS> PROJECT_PROCESS { get; set;}
        public List<PROCESS_CATEGORY> PROCESS_CATEGORY { get; set; } = new List<CSP.PROCESS_CATEGORY>();
    }
   
    public class PROCESS_CATEGORY
    {
        public string REPORT_CATEGORY { get; set; }
        public List<PROJECT_PROCESS> PROJECT_PROCESS { get; set; } = new List<PROJECT_PROCESS>();
    }
    public class DDData
    {
        public string REPORT_TYPE { get; set; }
        public List<string> REPORT_CATEGORY { get; set; } = new List<string>();
     }
}
