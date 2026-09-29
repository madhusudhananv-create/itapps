using System;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    // Flat result-set shapes for the AIMI (AI Maturity Index) stored procedures
    // (usp_AIMI_*, see WebApi/DB Scripts/01 StoredProcedure/BAS/). Each mirrors one
    // SELECT's column list exactly - EF6's Database.SqlQuery<T> maps by name and
    // throws if the result columns and T's properties disagree, so these are
    // intentionally flat DTOs rather than the entity classes. The *_JSON columns
    // (FOR JSON PATH sub-selects) come back as raw JSON strings; AimiController
    // deserializes them into the nested shape the client expects.

    public class AimiActivitySpRow
    {
        public int ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string PROJECT { get; set; }
        public string ACCOUNT { get; set; }
        public string BUSINESS_UNIT { get; set; }
        public string PRACTICE { get; set; }
        public string SDLC_PHASE { get; set; }
        public string ACTIVITY { get; set; }
        public string APPLICABILITY { get; set; }
        public byte? AI_ADOPTION_SCORE { get; set; }
        public byte? WORK_DONE_BY_AI { get; set; }
        public decimal? HOURS_SAVED { get; set; }
        public string REVENUE_GENERATED { get; set; }
        public string BENEFIT_TO { get; set; }
        public string COMMENTS { get; set; }
        public string STATUS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public string AI_TOOLS_JSON { get; set; }
        public string ACCELERATORS_JSON { get; set; }
        public string QUALITATIVE_BENEFITS_JSON { get; set; }
    }

    // usp_AIMI_GetReportData - the Report Data + Project Info stitch backing the
    // Reports page / Manage Activities "Generate Report" export (see
    // usp_AIMI_GetReportData.sql for the header note on the two entry points).
    public class AimiReportDataSpRow
    {
        public string BUSINESS_UNIT { get; set; }
        public string ACCOUNT { get; set; }
        public string PROJECT { get; set; }
        public string PROJECT_ID { get; set; }
        public string PRACTICE { get; set; }

        public int? PEOPLE_USING_AI { get; set; }
        public int? LICENSE_COUNT { get; set; }
        public string LICENSE_PROVIDER { get; set; }
        public string RUNOPS_AUTO_RESOLVED { get; set; }
        public string RUNOPS_MTTR_REDUCTION { get; set; }
        public string RUNOPS_AI_AGENTS { get; set; }
        public string RUNOPS_AUTOMATED_WORKFLOWS { get; set; }
        public string RUNOPS_MTTD { get; set; }
        public string RUNOPS_MTTR { get; set; }
        public string ENGINEER_AI_AGENTS { get; set; }
        public string ENGINEER_DELIVERY_CYCLE_TIME { get; set; }
        public string ENGINEER_CONTRACT_TEST_CASE_PASS_RATE { get; set; }
        public string ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE { get; set; }
        public string COMMON_ADOPTION_WORKFORCE_CERTIFICATION { get; set; }
        public string COMMON_ADOPTION_EFFORTS_SAVED { get; set; }
        public string COMMON_DEPLOYMENT_ENGINEER { get; set; }
        public decimal? ACCEPTED_SCORE { get; set; }
        public string ACCEPTED_SCORE_COMMENT { get; set; }

        public int ACTIVITY_ID { get; set; }
        public string SDLC_PHASE { get; set; }
        public string ACTIVITY { get; set; }
        public string APPLICABILITY { get; set; }
        public byte? AI_ADOPTION_SCORE { get; set; }
        public string AI_TOOLS_JSON { get; set; }
        public string ACCELERATORS_JSON { get; set; }
        public byte? WORK_DONE_BY_AI { get; set; }
        public decimal? HOURS_SAVED { get; set; }
        public string REVENUE_GENERATED { get; set; }
        public string BENEFIT_TO { get; set; }
        public string QUALITATIVE_BENEFITS_JSON { get; set; }
        public string COMMENTS { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
    }

    public class AimiProjectInfoSpRow
    {
        public int ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int? PEOPLE_USING_AI { get; set; }
        public bool IS_PROJECT_NA { get; set; }
        public string NA_COMMENTS { get; set; }
        public int? LICENSE_COUNT { get; set; }
        public string LICENSE_PROVIDER { get; set; }
        public string RUNOPS_AUTO_RESOLVED { get; set; }
        public string RUNOPS_MTTR_REDUCTION { get; set; }
        public string RUNOPS_AI_AGENTS { get; set; }
        public string RUNOPS_AUTOMATED_WORKFLOWS { get; set; }
        public string RUNOPS_MTTD { get; set; }
        public string RUNOPS_MTTR { get; set; }
        public string ENGINEER_AI_AGENTS { get; set; }
        public string ENGINEER_DELIVERY_CYCLE_TIME { get; set; }
        public string ENGINEER_CONTRACT_TEST_CASE_PASS_RATE { get; set; }
        public string ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE { get; set; }
        public string COMMON_ADOPTION_WORKFORCE_CERTIFICATION { get; set; }
        public string COMMON_ADOPTION_EFFORTS_SAVED { get; set; }
        public string COMMON_DEPLOYMENT_ENGINEER { get; set; }
        public bool PRESENTATION_DONE { get; set; }
        public string PROJECT_FY { get; set; }
        public decimal? ACCEPTED_SCORE { get; set; }
        public bool SCORE_REVIEWED { get; set; }
        public string ACCEPTED_SCORE_COMMENT { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
    }

    public class AimiPracticeInfoSpRow
    {
        public int ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string PRACTICE { get; set; }
        public string CURRENT_PHASE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
    }

    public class AimiAiToolMetricSpRow
    {
        public string TOOL_NAME { get; set; }
        public int ACTIVITIES { get; set; }
        public decimal HOURS_SAVED { get; set; }
        public int REVENUE_ACTIVITIES { get; set; }
        public double? AVG_WORK_DONE_BY_AI { get; set; }
    }

    public class AimiAiToolBySdlcPhaseSpRow
    {
        public string SDLC_PHASE { get; set; }
        public string TOOL_NAME { get; set; }
    }

    public class AimiDashboardSummarySpRow
    {
        public int TOTAL_ACTIVITIES { get; set; }
        public double? OVERALL_AI_ADOPTION_SCORE { get; set; }
        public double? OVERALL_WORK_DONE_BY_AI { get; set; }
        public decimal TOTAL_HOURS_SAVED { get; set; }
        public int REVENUE_GENERATING_ACTIVITIES { get; set; }
        public int HIGH_ADOPTION_ACTIVITIES { get; set; }
    }

    public class AimiQualitativeBenefitAnalysisSpRow
    {
        public string BENEFIT_NAME { get; set; }
        public int FREQUENCY { get; set; }
        public decimal TOTAL_HOURS_SAVED { get; set; }
        public string MOST_FREQUENT_TOOL { get; set; }
        public string ASSOCIATED_TOOLS_JSON { get; set; }
    }

    // ---- Table-valued-parameter row shapes ----
    // Property declaration order must match the SQL table type's column order:
    // AppRepository_CSP's ToDataTable<T> helper builds DataTable columns via
    // reflection in declaration order, and a Structured SqlParameter binds to a
    // TVP type by ordinal, not by name.

    public class AimiStringListRow
    {
        public string VALUE_TEXT { get; set; }
    }

    public class AimiIdListRow
    {
        public int ID { get; set; }
    }

    public class AimiAiToolTvpRow
    {
        public string TOOL_NAME { get; set; }
        public string ACCESS_TYPE { get; set; }
        public int? LICENSE_COUNT { get; set; }
        public string NETWORK_TYPE { get; set; }
    }
}
