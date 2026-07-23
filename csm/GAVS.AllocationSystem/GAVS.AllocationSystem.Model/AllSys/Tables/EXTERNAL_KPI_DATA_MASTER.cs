using GAVS.AllocationSystem.Model.Base;
using System;

namespace GAVS.AllocationSystem.Model.AllSys.Tables
{
    public class EXTERNAL_KPI_DATA_MASTER : EntityBase
    {
        public string CUST_ID { get; set; }
        public string SOURCE { get; set; }
        public string FILE_NAME { get; set; }
}
}