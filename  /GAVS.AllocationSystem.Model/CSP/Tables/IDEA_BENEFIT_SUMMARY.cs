using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IDEA_BENEFIT_SUMMARY : EntityBase
    {
        public int IDEA_ID { get; set; }
        public BENEFIT_PILLAR? BENEFIT_PILLAR_ID { get; set; }
        public TYPE? TYPE_ID { get; set; }
        public BENEFICIARY? BENEFICIARY_ID { get; set; }
        public BENEFIT_TYPE? BENEFIT_TYPE_ID { get; set; }
        public int? CATEGORY_ID { get; set; }
        public bool? IS_ONETIME { get; set; }

        [NotMapped]
        public List<IDEA_CATEGORY> CATEGORIES { get; set; }
    }

    public enum BENEFIT_PILLAR : int
    {
        People =1,
        Process = 2,
        Technology = 3,
        Facilities = 4,
        Assets = 5
    }

    public enum TYPE : int
    {
        Value = 1,
        Value_Add = 2
    }
     
    public enum BENEFICIARY : int
    {
        GAVS = 1,
        Customer = 2
    }

    public enum BENEFIT_TYPE : int
    {
        Quantitative = 1,
        Qualitative = 2
    }

}

