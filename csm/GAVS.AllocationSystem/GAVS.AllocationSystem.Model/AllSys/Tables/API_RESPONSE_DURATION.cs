using System;
using System.ComponentModel.DataAnnotations;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class API_RESPONSE_DURATION
    {
        [Key]
        public int ID { get; set; }

        public string URL { get; set; }
        public decimal duration { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CONTENT { get; set; }
    }
}