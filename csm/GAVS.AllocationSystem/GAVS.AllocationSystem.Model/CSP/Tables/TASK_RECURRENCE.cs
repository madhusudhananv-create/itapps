using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAVS.AllocationSystem.Model.CSP
{
    public partial class TASK_RECURRENCE
    {
        [Key]
        public int ID { get; set; }
        public int TASK_ID { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string FREQUENCY { get; set; }
        public bool? DAILY_IS_MONDAY { get; set; }
        public bool? DAILY_IS_TUESDAY { get; set; }
        public bool? DAILY_IS_WEDNESDAY { get; set; }
        public bool? DAILY_IS_THURSDAY { get; set; }
        public bool? DAILY_IS_FRIDAY { get; set; }
        public bool? DAILY_IS_SATURDAY { get; set; }
        public bool? DAILY_IS_SUNDAY { get; set; }
        public string WEEKLY_SELECTED_DAY { get; set; }
        public string FORTNIGHTLY_SELECTED_DAY { get; set; }
        public string MONTHLY_SELECTED_DAY { get; set; }
        public int? MONTHLY_SKIP_DAYS { get; set; }

        public int? QUARTERLY_SKIP_DAYS { get; set; }
        public string QUARTERLY_SELECTED_DAY { get; set; }

        public string BIANNUAL_FIRST_SELECTED_DAY { get; set; }
        public int? BIANNUAL_FIRST_SKIP_DAYS { get; set; }
        public string BIANNUAL_FIRST_SELECTED_MONTH { get; set; }
        public string BIANNUAL_SECOND_SELECTED_DAY { get; set; }
        public int? BIANNUAL_SECOND_SKIP_DAYS { get; set; }
        public string BIANNUAL_SECOND_SELECTED_MONTH { get; set; }
        public string ANNUAL_SELECTED_DAY { get; set; }
        public int? ANNUAL_SKIP_DAYS { get; set; }
        public string ANNUAL_SELECTED_MONTH { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
