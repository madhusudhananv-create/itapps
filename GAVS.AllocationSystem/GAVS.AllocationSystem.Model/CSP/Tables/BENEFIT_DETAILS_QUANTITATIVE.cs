using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class BENEFIT_DETAILS_QUANTITATIVE : EntityBase
    {
        public int BENEFIT_SUMMARY_ID { get; set; }
        public int UOM_ID { get; set; }
        public decimal? CURRENT_STATE_MONTH { get; set; }
        public decimal? CURRENT_STATE_YEAR { get; set; }
        public decimal? FUTURE_STATE_MONTH { get; set; }
        public decimal? FUTURE_STATE_YEAR { get; set; }
        public decimal? NET_BENEFITS_MONTH { get; set; }
        public decimal? NET_BENEFITS_YEAR { get; set; }
        
    }

    public class IDEA_CATEGORY_UOM_MAPPING
    {
        public int ID { get; set; }
        public int? IDEA_CATEGORY_ID { get; set; }
        public int? UOM_ID { get; set; }
        public bool ISACTIVE { get; set; }
    }

    public class UOM
    {
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string DATATYPE { get; set; }
        public string TYPE { get; set; }
        public bool ISACTIVE { get; set; }
        public string DATATYPE_SYMBOL { get; set; }
    }

    public class IDEA_CATEGORY
    {
        public int ID { get; set; }
        public int BENEFIT_PILLAR_ID { get; set; }

        public int BENEFIT_TYPE_ID { get; set; }
        public string TITLE { get; set; }
        public bool ISACTIVE { get; set; }
    }

    public class UOMMappings
    {
        public int ID { get; set; }
        public string TITLE { get; set; }

        public string DATATYPE { get; set; }
    }

    public class BENEFIT_DETAILS_QUANTITATIVE_VM
    {
        public int ID { get; set; }
        public int BENEFIT_SUMMARY_ID { get; set; }
        public bool? IS_ONETIME { get; set; }

        public List<Benefits> BENEFITS_ARRAY { get; set; } = new List<Benefits>();
        
    }

    public class Benefits
    {
        public int ID { get; set; }
        public decimal? CURRENT_STATE_MONTH { get; set; }
        public decimal? CURRENT_STATE_YEAR { get; set; }
        public decimal? FUTURE_STATE_MONTH { get; set; }
        public decimal? FUTURE_STATE_YEAR { get; set; }
        public decimal? NET_BENEFITS_MONTH { get; set; }
        public decimal? NET_BENEFITS_YEAR { get; set; }
        public string TITLE { get; set; }

        public string DATATYPE { get; set; }
        public int UOM_ID { get; set; }
    }





}
