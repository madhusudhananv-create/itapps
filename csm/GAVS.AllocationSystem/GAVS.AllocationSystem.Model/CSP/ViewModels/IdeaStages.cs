using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    [NotMapped]
    public class IdeaStages : IDEA_STAGE_STATUS
    {
        public string UPDATED_PERSON { get; set; }
        public string UPDATED_FORMAT_DATE { get; set; }
    }
}
