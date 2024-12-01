using System;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class Resource
    {
        public string PROJECT_ID { get; set; }
        public string EMP_ID { get; set; }
        public string NAME { get; set; }
        public string TITLE { get; set; }
        public int CSM_TITLE_ID { get; set; }
        public Int16 BASE_CNTRY_ID { get; set; }
        public string ActiveFrom { get; set; }
    }
}