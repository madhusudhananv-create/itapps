using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class SQA_PROJECT_CHART_PARAMS
    {
        [Key]
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int DATA_DUMP_ID { get; set; }
        public string DATA_DUMP_TYPE { get; set; }
        public string CHART_USER { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
        public string CATEGORY { get; set; }
        public string SUBCATEGORY { get; set; }
        public string YAXIS_LABLE { get; set; }
        public string CHART_TYPE { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public int? TARGET { get; set; }
        public string XAXIS_TYPE { get; set; }
        public string YAXIS_TYPE { get; set; }
        public string GROUP_BY_LEVEL1 { get; set; }
        public string GROUP_BY_LEVEL2 { get; set; }
        public string FREQUENCY { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
    }

    [NotMapped]
    public class SQA_PROJECT_CHART_PARAMS_WITH_FILTER : SQA_PROJECT_CHART_PARAMS
    {
        public List<SQA_CHART_FILTER> FILTERS { get; set; } = new List<SQA_CHART_FILTER>();
        public string FilterXmlString()
        {
            try
            {
                List<SQA_CHART_FILTER> tmpFilter = FILTERS.Where(t => t.FIELD != "" && t.FIELD != null).ToList();
                if (tmpFilter.Count > 0)
                {

                    var stringwriter = new System.IO.StringWriter();
                    var serializer = new XmlSerializer(typeof(List<SQA_CHART_FILTER>));
                    serializer.Serialize(stringwriter, this.FILTERS);
                    return stringwriter.ToString().Replace("<?xml version=\"1.0\" encoding=\"utf-16\"?>", "");
                }
                else
                    return "";
            }
            catch
            {
                throw;
            }
        }
    }
}
