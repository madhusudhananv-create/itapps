using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class DataTableStructure
    {
        public string FieldName { get; set; }
        public string DataType { get; set; }
        public int Length { get; set; }
        public Boolean Required { get; set; }
        public Boolean Include { get; set; }
    }
}
