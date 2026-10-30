using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    // Flat result-set shapes for the AIMI (AI Maturity Index) stored procedures
    // (usp_AIMI_*, see WebApi/DB Scripts/01 StoredProcedure/BAS/). Each mirrors one
    // SELECT's column list exactly - EF6's Database.SqlQuery<T> maps by name and
    // throws if the result columns and T's properties disagree, so these are
    // intentionally flat DTOs rather than the entity classes. The *_JSON columns
    // (FOR JSON PATH sub-selects) come back as raw JSON strings; AimiController
    // deserializes them into the nested shape the client expects.
    //
    // GlobalConfig.cs applies a global CamelCasePropertyNamesContractResolver
    // to every Web API response. Json.NET's camel-casing algorithm doesn't
    // split multi-word ALL_CAPS names on underscores (e.g. PROJECT_ID does not
    // become projectId - it mangles into something like projecT_ID), and even
    // a plain single-word ALL-CAPS property like NAME gets silently
    // lowercased to "name". Worse, CamelCasePropertyNamesContractResolver's
    // default NamingStrategy has OverrideSpecifiedNames = true, so a plain
    // [JsonProperty("NAME")] attribute alone is NOT enough - it still gets
    // camel-cased. [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    // on the class opts these DTOs out of the resolver's naming strategy
    // entirely, so properties serialize exactly as declared (matching the SQL
    // column names and the TypeScript code already written against them)
    // without touching every SQL proc's column aliases or the global config.

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiActivitySpRow
    {
        [JsonProperty("ID")] public int ID { get; set; }
        [JsonProperty("PROJECT_ID")] public string PROJECT_ID { get; set; }
        [JsonProperty("PROJECT")] public string PROJECT { get; set; }
        [JsonProperty("ACCOUNT")] public string ACCOUNT { get; set; }
        [JsonProperty("BUSINESS_UNIT")] public string BUSINESS_UNIT { get; set; }
        [JsonProperty("PRACTICE")] public string PRACTICE { get; set; }
        [JsonProperty("SDLC_PHASE")] public string SDLC_PHASE { get; set; }
        [JsonProperty("ACTIVITY")] public string ACTIVITY { get; set; }
        [JsonProperty("APPLICABILITY")] public string APPLICABILITY { get; set; }
        [JsonProperty("AI_ADOPTION_SCORE")] public byte? AI_ADOPTION_SCORE { get; set; }
        [JsonProperty("WORK_DONE_BY_AI")] public byte? WORK_DONE_BY_AI { get; set; }
        [JsonProperty("HOURS_SAVED")] public decimal? HOURS_SAVED { get; set; }
        [JsonProperty("REVENUE_GENERATED")] public string REVENUE_GENERATED { get; set; }
        [JsonProperty("BENEFIT_TO")] public string BENEFIT_TO { get; set; }
        [JsonProperty("COMMENTS")] public string COMMENTS { get; set; }
        [JsonProperty("STATUS")] public string STATUS { get; set; }
        [JsonProperty("CREATED_BY")] public string CREATED_BY { get; set; }
        [JsonProperty("CREATED_DATE")] public DateTime? CREATED_DATE { get; set; }
        [JsonProperty("UPDATED_BY")] public string UPDATED_BY { get; set; }
        [JsonProperty("UPDATED_DATE")] public DateTime? UPDATED_DATE { get; set; }
        [JsonProperty("ACCEPTED_SCORE")] public decimal? ACCEPTED_SCORE { get; set; }
        [JsonProperty("SCORE_REVIEWED")] public bool SCORE_REVIEWED { get; set; }
        [JsonProperty("ACCEPTED_SCORE_COMMENT")] public string ACCEPTED_SCORE_COMMENT { get; set; }
        [JsonProperty("AI_TOOLS_JSON")] public string AI_TOOLS_JSON { get; set; }
        [JsonProperty("ACCELERATORS_JSON")] public string ACCELERATORS_JSON { get; set; }
        [JsonProperty("QUALITATIVE_BENEFITS_JSON")] public string QUALITATIVE_BENEFITS_JSON { get; set; }
    }

    // usp_AIMI_GetReportData - the Report Data + Project Info stitch backing the
    // Reports page / Manage Activities "Generate Report" export (see
    // usp_AIMI_GetReportData.sql for the header note on the two entry points).
    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiReportDataSpRow
    {
        [JsonProperty("BUSINESS_UNIT")] public string BUSINESS_UNIT { get; set; }
        [JsonProperty("ACCOUNT")] public string ACCOUNT { get; set; }
        [JsonProperty("PROJECT")] public string PROJECT { get; set; }
        [JsonProperty("PROJECT_ID")] public string PROJECT_ID { get; set; }
        [JsonProperty("PRACTICE")] public string PRACTICE { get; set; }

        [JsonProperty("PEOPLE_USING_AI")] public int? PEOPLE_USING_AI { get; set; }
        [JsonProperty("LICENSE_COUNT")] public int? LICENSE_COUNT { get; set; }
        [JsonProperty("LICENSE_PROVIDER")] public string LICENSE_PROVIDER { get; set; }
        [JsonProperty("RUNOPS_AUTO_RESOLVED")] public string RUNOPS_AUTO_RESOLVED { get; set; }
        [JsonProperty("RUNOPS_MTTR_REDUCTION")] public string RUNOPS_MTTR_REDUCTION { get; set; }
        [JsonProperty("RUNOPS_AI_AGENTS")] public string RUNOPS_AI_AGENTS { get; set; }
        [JsonProperty("RUNOPS_AUTOMATED_WORKFLOWS")] public string RUNOPS_AUTOMATED_WORKFLOWS { get; set; }
        [JsonProperty("RUNOPS_MTTD")] public string RUNOPS_MTTD { get; set; }
        [JsonProperty("RUNOPS_MTTR")] public string RUNOPS_MTTR { get; set; }
        [JsonProperty("ENGINEER_AI_AGENTS")] public string ENGINEER_AI_AGENTS { get; set; }
        [JsonProperty("ENGINEER_DELIVERY_CYCLE_TIME")] public string ENGINEER_DELIVERY_CYCLE_TIME { get; set; }
        [JsonProperty("ENGINEER_CONTRACT_TEST_CASE_PASS_RATE")] public string ENGINEER_CONTRACT_TEST_CASE_PASS_RATE { get; set; }
        [JsonProperty("ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE")] public string ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE { get; set; }
        [JsonProperty("COMMON_ADOPTION_WORKFORCE_CERTIFICATION")] public string COMMON_ADOPTION_WORKFORCE_CERTIFICATION { get; set; }
        [JsonProperty("COMMON_ADOPTION_EFFORTS_SAVED")] public string COMMON_ADOPTION_EFFORTS_SAVED { get; set; }
        [JsonProperty("COMMON_DEPLOYMENT_ENGINEER")] public string COMMON_DEPLOYMENT_ENGINEER { get; set; }
        [JsonProperty("ACCEPTED_SCORE")] public decimal? ACCEPTED_SCORE { get; set; }
        [JsonProperty("ACCEPTED_SCORE_COMMENT")] public string ACCEPTED_SCORE_COMMENT { get; set; }

        [JsonProperty("ACTIVITY_ID")] public int ACTIVITY_ID { get; set; }
        [JsonProperty("SDLC_PHASE")] public string SDLC_PHASE { get; set; }
        [JsonProperty("ACTIVITY")] public string ACTIVITY { get; set; }
        [JsonProperty("APPLICABILITY")] public string APPLICABILITY { get; set; }
        [JsonProperty("AI_ADOPTION_SCORE")] public byte? AI_ADOPTION_SCORE { get; set; }
        [JsonProperty("AI_TOOLS_JSON")] public string AI_TOOLS_JSON { get; set; }
        [JsonProperty("ACCELERATORS_JSON")] public string ACCELERATORS_JSON { get; set; }
        [JsonProperty("WORK_DONE_BY_AI")] public byte? WORK_DONE_BY_AI { get; set; }
        [JsonProperty("HOURS_SAVED")] public decimal? HOURS_SAVED { get; set; }
        [JsonProperty("REVENUE_GENERATED")] public string REVENUE_GENERATED { get; set; }
        [JsonProperty("BENEFIT_TO")] public string BENEFIT_TO { get; set; }
        [JsonProperty("QUALITATIVE_BENEFITS_JSON")] public string QUALITATIVE_BENEFITS_JSON { get; set; }
        [JsonProperty("COMMENTS")] public string COMMENTS { get; set; }
        [JsonProperty("CREATED_DATE")] public DateTime? CREATED_DATE { get; set; }
        [JsonProperty("UPDATED_DATE")] public DateTime? UPDATED_DATE { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiProjectInfoSpRow
    {
        [JsonProperty("ID")] public int ID { get; set; }
        [JsonProperty("PROJECT_ID")] public string PROJECT_ID { get; set; }
        [JsonProperty("PEOPLE_USING_AI")] public int? PEOPLE_USING_AI { get; set; }
        [JsonProperty("IS_PROJECT_NA")] public bool IS_PROJECT_NA { get; set; }
        [JsonProperty("NA_COMMENTS")] public string NA_COMMENTS { get; set; }
        [JsonProperty("LICENSE_COUNT")] public int? LICENSE_COUNT { get; set; }
        [JsonProperty("LICENSE_PROVIDER")] public string LICENSE_PROVIDER { get; set; }
        [JsonProperty("RUNOPS_AUTO_RESOLVED")] public string RUNOPS_AUTO_RESOLVED { get; set; }
        [JsonProperty("RUNOPS_MTTR_REDUCTION")] public string RUNOPS_MTTR_REDUCTION { get; set; }
        [JsonProperty("RUNOPS_AI_AGENTS")] public string RUNOPS_AI_AGENTS { get; set; }
        [JsonProperty("RUNOPS_AUTOMATED_WORKFLOWS")] public string RUNOPS_AUTOMATED_WORKFLOWS { get; set; }
        [JsonProperty("RUNOPS_MTTD")] public string RUNOPS_MTTD { get; set; }
        [JsonProperty("RUNOPS_MTTR")] public string RUNOPS_MTTR { get; set; }
        [JsonProperty("ENGINEER_AI_AGENTS")] public string ENGINEER_AI_AGENTS { get; set; }
        [JsonProperty("ENGINEER_DELIVERY_CYCLE_TIME")] public string ENGINEER_DELIVERY_CYCLE_TIME { get; set; }
        [JsonProperty("ENGINEER_CONTRACT_TEST_CASE_PASS_RATE")] public string ENGINEER_CONTRACT_TEST_CASE_PASS_RATE { get; set; }
        [JsonProperty("ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE")] public string ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE { get; set; }
        [JsonProperty("COMMON_ADOPTION_WORKFORCE_CERTIFICATION")] public string COMMON_ADOPTION_WORKFORCE_CERTIFICATION { get; set; }
        [JsonProperty("COMMON_ADOPTION_EFFORTS_SAVED")] public string COMMON_ADOPTION_EFFORTS_SAVED { get; set; }
        [JsonProperty("COMMON_DEPLOYMENT_ENGINEER")] public string COMMON_DEPLOYMENT_ENGINEER { get; set; }
        [JsonProperty("PRESENTATION_DONE")] public bool PRESENTATION_DONE { get; set; }
        [JsonProperty("PROJECT_FY")] public string PROJECT_FY { get; set; }
        [JsonProperty("CREATED_BY")] public string CREATED_BY { get; set; }
        [JsonProperty("CREATED_DATE")] public DateTime? CREATED_DATE { get; set; }
        [JsonProperty("UPDATED_BY")] public string UPDATED_BY { get; set; }
        [JsonProperty("UPDATED_DATE")] public DateTime? UPDATED_DATE { get; set; }
        [JsonProperty("ISACTIVE")] public bool ISACTIVE { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiPracticeInfoSpRow
    {
        [JsonProperty("ID")] public int ID { get; set; }
        [JsonProperty("PROJECT_ID")] public string PROJECT_ID { get; set; }
        [JsonProperty("PRACTICE")] public string PRACTICE { get; set; }
        [JsonProperty("CURRENT_PHASE")] public string CURRENT_PHASE { get; set; }
        [JsonProperty("CREATED_BY")] public string CREATED_BY { get; set; }
        [JsonProperty("CREATED_DATE")] public DateTime? CREATED_DATE { get; set; }
        [JsonProperty("UPDATED_BY")] public string UPDATED_BY { get; set; }
        [JsonProperty("UPDATED_DATE")] public DateTime? UPDATED_DATE { get; set; }
        [JsonProperty("ISACTIVE")] public bool ISACTIVE { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiAiToolMetricSpRow
    {
        [JsonProperty("TOOL_NAME")] public string TOOL_NAME { get; set; }
        [JsonProperty("ACTIVITIES")] public int ACTIVITIES { get; set; }
        [JsonProperty("HOURS_SAVED")] public decimal HOURS_SAVED { get; set; }
        [JsonProperty("REVENUE_ACTIVITIES")] public int REVENUE_ACTIVITIES { get; set; }
        [JsonProperty("AVG_WORK_DONE_BY_AI")] public double? AVG_WORK_DONE_BY_AI { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiAiToolBySdlcPhaseSpRow
    {
        [JsonProperty("SDLC_PHASE")] public string SDLC_PHASE { get; set; }
        [JsonProperty("TOOL_NAME")] public string TOOL_NAME { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiDashboardSummarySpRow
    {
        [JsonProperty("TOTAL_ACTIVITIES")] public int TOTAL_ACTIVITIES { get; set; }
        [JsonProperty("OVERALL_AI_ADOPTION_SCORE")] public double? OVERALL_AI_ADOPTION_SCORE { get; set; }
        [JsonProperty("OVERALL_WORK_DONE_BY_AI")] public double? OVERALL_WORK_DONE_BY_AI { get; set; }
        [JsonProperty("TOTAL_HOURS_SAVED")] public decimal TOTAL_HOURS_SAVED { get; set; }
        [JsonProperty("REVENUE_GENERATING_ACTIVITIES")] public int REVENUE_GENERATING_ACTIVITIES { get; set; }
        [JsonProperty("HIGH_ADOPTION_ACTIVITIES")] public int HIGH_ADOPTION_ACTIVITIES { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiQualitativeBenefitAnalysisSpRow
    {
        [JsonProperty("BENEFIT_NAME")] public string BENEFIT_NAME { get; set; }
        [JsonProperty("FREQUENCY")] public int FREQUENCY { get; set; }
        [JsonProperty("TOTAL_HOURS_SAVED")] public decimal TOTAL_HOURS_SAVED { get; set; }
        [JsonProperty("MOST_FREQUENT_TOOL")] public string MOST_FREQUENT_TOOL { get; set; }
        [JsonProperty("ASSOCIATED_TOOLS_JSON")] public string ASSOCIATED_TOOLS_JSON { get; set; }
    }

    // ---- Table-valued-parameter row shapes ----
    // Property declaration order must match the SQL table type's column order:
    // AppRepository_CSP's ToDataTable<T> helper builds DataTable columns via
    // reflection in declaration order, and a Structured SqlParameter binds to a
    // TVP type by ordinal, not by name. These are never JSON-serialized (only
    // used to build a DataTable via reflection), so no [JsonProperty] needed.

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

    // ---- Lookup/master-data stored procedures (usp_AIMI_Get*, tables from
    // Release 2.6.3.sql) - the questionnaire practice/phase/activity catalog
    // and the various option-list suggestion tables that used to be
    // hardcoded/derived from a static questionnaire.json in the React client. ----

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiPracticeSpRow
    {
        [JsonProperty("ID")] public int ID { get; set; }
        [JsonProperty("NAME")] public string NAME { get; set; }
        [JsonProperty("SORT_ORDER")] public int SORT_ORDER { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiSdlcPhaseSpRow
    {
        [JsonProperty("ID")] public int ID { get; set; }
        [JsonProperty("PRACTICE_ID")] public int PRACTICE_ID { get; set; }
        [JsonProperty("PRACTICE_NAME")] public string PRACTICE_NAME { get; set; }
        [JsonProperty("NAME")] public string NAME { get; set; }
        [JsonProperty("SORT_ORDER")] public int SORT_ORDER { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiQuestionnaireActivitySpRow
    {
        [JsonProperty("ID")] public int ID { get; set; }
        [JsonProperty("SDLC_PHASE_ID")] public int SDLC_PHASE_ID { get; set; }
        [JsonProperty("PRACTICE_NAME")] public string PRACTICE_NAME { get; set; }
        [JsonProperty("SDLC_PHASE_NAME")] public string SDLC_PHASE_NAME { get; set; }
        [JsonProperty("ACTIVITY")] public string ACTIVITY { get; set; }
        [JsonProperty("SORT_ORDER")] public int SORT_ORDER { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiNamedLookupSpRow
    {
        [JsonProperty("NAME")] public string NAME { get; set; }
        [JsonProperty("SORT_ORDER")] public int SORT_ORDER { get; set; }
    }

    // AIMI_AI_TOOL / AIMI_ACCELERATOR have no SORT_ORDER column - alphabetical
    // (ORDER BY NAME) is the proc's own ordering.
    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiNameOnlySpRow
    {
        [JsonProperty("NAME")] public string NAME { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiAiAdoptionScoreSpRow
    {
        [JsonProperty("SCORE")] public byte SCORE { get; set; }
        [JsonProperty("LABEL")] public string LABEL { get; set; }
        [JsonProperty("DESCRIPTION")] public string DESCRIPTION { get; set; }
        [JsonProperty("COLOR_HEX")] public string COLOR_HEX { get; set; }
    }

}
