namespace GAVS.AllocationSystem.Model.CSP
{
    // IT Ops Maturity's own copy of the generic REPORTS_SP_DETAILS/REPORTS_PARAMS
    // registration tables, kept separate from the shared/global reporting tables
    // (used by every other CSM report) so this module's report registrations
    // don't mix with the rest of the app's - same idea as ITOPS_* having its own
    // isolated tables rather than piggybacking on shared ones.
    public class ITOPS_REPORT_SP_DETAILS
    {
        public int ID { get; set; }
        public string SP_NAME { get; set; }
        public string SP_DISPLAY_NAME { get; set; }
        public string DB_NAME { get; set; }
    }

    public class ITOPS_REPORT_PARAMS
    {
        public int ID { get; set; }
        public int REPORT_SP_ID { get; set; } // FK -> ITOPS_REPORT_SP_DETAILS.ID
        public string PARAM_NAME { get; set; }
        public string PARAM_TYPE { get; set; }
        public string PARAM_VALUE { get; set; }
    }
}
