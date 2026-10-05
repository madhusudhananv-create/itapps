using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    // Request/response shapes for AimiController (WebApi/Controllers/AimiController.cs).
    // These are the JSON contract with the AIMI React client. The raw stored-proc row
    // shapes (GAVS.AllocationSystem.Model.CSP.SP.AimiActivitySpRow / AimiReportDataSpRow)
    // carry the *_JSON sub-columns as strings; the controller expands those into the
    // real arrays defined here before returning.
    //
    // GlobalConfig.cs applies a global CamelCasePropertyNamesContractResolver
    // to every Web API request/response. Json.NET's camel-casing algorithm
    // mangles multi-word ALL_CAPS names (e.g. PROJECT_ID does not cleanly
    // become projectId) and even lowercases a single-word ALL-CAPS property
    // like ID. Worse, CamelCasePropertyNamesContractResolver's default
    // NamingStrategy has OverrideSpecifiedNames = true, so a plain
    // [JsonProperty("PROJECT_ID")] attribute alone is NOT enough for either
    // serialization or [FromBody] deserialization - it still gets mangled.
    // [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))] on the
    // class opts these DTOs out of the resolver's naming strategy entirely, so
    // properties serialize/bind exactly as declared, matching what the
    // TypeScript client already sends/expects.
    // AimiActivitiesByFilterRequest/AimiReportDataRequest below are already
    // plain PascalCase with no underscores, so they camelCase cleanly on their
    // own and don't need this.

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiAiToolDto
    {
        [JsonProperty("TOOL_NAME")] public string TOOL_NAME { get; set; }
        [JsonProperty("ACCESS_TYPE")] public string ACCESS_TYPE { get; set; }
        [JsonProperty("LICENSE_COUNT")] public int? LICENSE_COUNT { get; set; }
        [JsonProperty("NETWORK_TYPE")] public string NETWORK_TYPE { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiActivityResponse
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
        [JsonProperty("AI_TOOLS")] public List<AimiAiToolDto> AI_TOOLS { get; set; }
        [JsonProperty("ACCELERATORS")] public List<string> ACCELERATORS { get; set; }
        [JsonProperty("QUALITATIVE_BENEFITS")] public List<string> QUALITATIVE_BENEFITS { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiReportRowResponse
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
        [JsonProperty("AI_TOOLS")] public List<AimiAiToolDto> AI_TOOLS { get; set; }
        [JsonProperty("ACCELERATORS")] public List<string> ACCELERATORS { get; set; }
        [JsonProperty("WORK_DONE_BY_AI")] public byte? WORK_DONE_BY_AI { get; set; }
        [JsonProperty("HOURS_SAVED")] public decimal? HOURS_SAVED { get; set; }
        [JsonProperty("REVENUE_GENERATED")] public string REVENUE_GENERATED { get; set; }
        [JsonProperty("BENEFIT_TO")] public string BENEFIT_TO { get; set; }
        [JsonProperty("QUALITATIVE_BENEFITS")] public List<string> QUALITATIVE_BENEFITS { get; set; }
        [JsonProperty("COMMENTS")] public string COMMENTS { get; set; }
        [JsonProperty("CREATED_DATE")] public DateTime? CREATED_DATE { get; set; }
        [JsonProperty("UPDATED_DATE")] public DateTime? UPDATED_DATE { get; set; }
    }

    public class AimiActivitiesByFilterRequest
    {
        public List<string> BusinessUnits { get; set; }
        public List<string> Accounts { get; set; }
        public List<string> Projects { get; set; }
        public List<string> Practices { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiActivityUpsertRequest
    {
        [JsonProperty("ID")] public int? ID { get; set; }
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
        [JsonProperty("AI_TOOLS")] public List<AimiAiToolDto> AI_TOOLS { get; set; }
        [JsonProperty("ACCELERATORS")] public List<string> ACCELERATORS { get; set; }
        [JsonProperty("QUALITATIVE_BENEFITS")] public List<string> QUALITATIVE_BENEFITS { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiDeleteActivityRequest
    {
        [JsonProperty("ID")] public int? ID { get; set; }
        [JsonProperty("IDS")] public List<int> IDS { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiProjectInfoUpsertRequest
    {
        [JsonProperty("ID")] public int? ID { get; set; }
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
    }

    // Admin review of a project's Overall Score - saved against the project's activities
    // (not the project info row) so it can't overwrite the AI Adoption Metrics.
    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiAcceptedScoreUpdateRequest
    {
        [JsonProperty("PROJECT_ID")] public string PROJECT_ID { get; set; }
        [JsonProperty("PRACTICE")] public string PRACTICE { get; set; }
        [JsonProperty("ACCEPTED_SCORE")] public decimal? ACCEPTED_SCORE { get; set; }
        [JsonProperty("SCORE_REVIEWED")] public bool SCORE_REVIEWED { get; set; }
        [JsonProperty("ACCEPTED_SCORE_COMMENT")] public string ACCEPTED_SCORE_COMMENT { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiPracticeInfoUpsertRequest
    {
        [JsonProperty("ID")] public int? ID { get; set; }
        [JsonProperty("PROJECT_ID")] public string PROJECT_ID { get; set; }
        [JsonProperty("PRACTICE")] public string PRACTICE { get; set; }
        [JsonProperty("CURRENT_PHASE")] public string CURRENT_PHASE { get; set; }
    }

    public class AimiReportDataRequest
    {
        public string ProjectId { get; set; }
        public string Practice { get; set; }
        public List<string> BusinessUnits { get; set; }
        public List<string> Accounts { get; set; }
        public List<string> Projects { get; set; }
        public List<string> Practices { get; set; }
    }

    // Anonymous types can't carry [JsonProperty] attributes, so any controller
    // response that isn't already one of the named DTOs above needs one of
    // these instead - otherwise the global camelCase resolver silently mangles
    // its property names too (see the note at the top of this file).

    /// Result of the three Upsert* actions (UpsertAimiActivity/ProjectInfo/PracticeInfo).
    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiIdResult
    {
        [JsonProperty("ID")] public int ID { get; set; }
    }

    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class AimiQualitativeBenefitAnalysisResponse
    {
        [JsonProperty("BENEFIT_NAME")] public string BENEFIT_NAME { get; set; }
        [JsonProperty("FREQUENCY")] public int FREQUENCY { get; set; }
        [JsonProperty("TOTAL_HOURS_SAVED")] public decimal TOTAL_HOURS_SAVED { get; set; }
        [JsonProperty("MOST_FREQUENT_TOOL")] public string MOST_FREQUENT_TOOL { get; set; }
        [JsonProperty("ASSOCIATED_TOOLS")] public List<string> ASSOCIATED_TOOLS { get; set; }
    }
}
