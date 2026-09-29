using System;
using System.Collections.Generic;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    // Request/response shapes for AimiController (WebApi/Controllers/AimiController.cs).
    // These are the JSON contract with the AIMI React client. The raw stored-proc row
    // shapes (GAVS.AllocationSystem.Model.CSP.SP.AimiActivitySpRow / AimiReportDataSpRow)
    // carry the *_JSON sub-columns as strings; the controller expands those into the
    // real arrays defined here before returning.

    public class AimiAiToolDto
    {
        public string TOOL_NAME { get; set; }
        public string ACCESS_TYPE { get; set; }
        public int? LICENSE_COUNT { get; set; }
        public string NETWORK_TYPE { get; set; }
    }

    public class AimiActivityResponse
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
        public List<AimiAiToolDto> AI_TOOLS { get; set; }
        public List<string> ACCELERATORS { get; set; }
        public List<string> QUALITATIVE_BENEFITS { get; set; }
    }

    public class AimiReportRowResponse
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
        public List<AimiAiToolDto> AI_TOOLS { get; set; }
        public List<string> ACCELERATORS { get; set; }
        public byte? WORK_DONE_BY_AI { get; set; }
        public decimal? HOURS_SAVED { get; set; }
        public string REVENUE_GENERATED { get; set; }
        public string BENEFIT_TO { get; set; }
        public List<string> QUALITATIVE_BENEFITS { get; set; }
        public string COMMENTS { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
    }

    public class AimiActivitiesByFilterRequest
    {
        public List<string> BusinessUnits { get; set; }
        public List<string> Accounts { get; set; }
        public List<string> Projects { get; set; }
        public List<string> Practices { get; set; }
    }

    public class AimiActivityUpsertRequest
    {
        public int? ID { get; set; }
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
        public List<AimiAiToolDto> AI_TOOLS { get; set; }
        public List<string> ACCELERATORS { get; set; }
        public List<string> QUALITATIVE_BENEFITS { get; set; }
    }

    public class AimiDeleteActivityRequest
    {
        public int? ID { get; set; }
        public List<int> IDS { get; set; }
    }

    public class AimiProjectInfoUpsertRequest
    {
        public int? ID { get; set; }
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
    }

    public class AimiPracticeInfoUpsertRequest
    {
        public int? ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string PRACTICE { get; set; }
        public string CURRENT_PHASE { get; set; }
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
}
