using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.Base;


namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_BATCH_MONTHLY : EntityBase, iBatch
    {
        public int MONTH { get; set; }
        public int YEAR { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string STATUS { get; set; }
        [NotMapped]
        public int TOTAL_RECORDS { get; set; }

        [NotMapped]
        public int REJECTED { get; set; }
        [NotMapped]
        public int VERIFIED { get; set; }

        [NotMapped]
        public int PENDING { get; set; }
        [NotMapped]
        public int SURVEY_SENT { get; set; }

        [NotMapped]
        public int SURVEY_RECD { get; set; }


    }
}
