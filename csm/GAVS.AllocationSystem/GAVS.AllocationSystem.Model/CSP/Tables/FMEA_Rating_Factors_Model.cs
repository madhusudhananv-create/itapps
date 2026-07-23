using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class FMEA_Rating_Factors_Model
    {
        public int ID { get; set; }
        public string RATING_FACTORS_CRITERIA { get; set; }

        public int RATING_FACTORS_RATING { get; set; }

        public string RATING_FACTORS_CATEGORY { get; set; }

        public string RATING_DEFINITION { get; set; }

    }
}
