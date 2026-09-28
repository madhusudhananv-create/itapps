-- Backs BOTH report entry points that exist today:
--   1) Manage Activities > "Generate Report" (single project) - pass @PROJECT_ID
--      (+ optionally @PRACTICE) and leave all four filter TVPs empty.
--   2) Reports page > "Generate Reports" (cross-project) - leave @PROJECT_ID/@PRACTICE
--      NULL and pass whichever of @BUSINESS_UNITS/@ACCOUNTS/@PROJECTS/@PRACTICES the
--      user selected; an empty TVP means "no filter on that dimension", matching the
--      old client-side "All" multi-select behaviour. Practice, if supplied via either
--      @PRACTICE or @PRACTICES, always narrows further, same as the current UI rule
--      ("Projects > Accounts > Business Units, Practice always narrows further").
--
-- Returns one row per activity, joined with that project's AI Adoption Metrics
-- (AIMI_PROJECT_INFO) and Accepted Score, i.e. every AIMI-owned column of the
-- existing CSV export (csvExportUtils.ts). Business Head / Account Manager /
-- Manager / Head Count are NOT included here - those come from the CSM project
-- master data (PROJECT/EMP_INFO), not from the AIMI domain, and are enriched by
-- the API layer exactly like the existing GetProjectListTemp-based enrichment does
-- today; wiring that join in is a follow-up once those column names are confirmed.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetReportData' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetReportData]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetReportData]
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL,
    @BUSINESS_UNITS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @ACCOUNTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PROJECTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PRACTICES dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        -- Project / org context
        a.BUSINESS_UNIT,
        a.ACCOUNT,
        a.PROJECT,
        a.PROJECT_ID,
        a.PRACTICE,

        -- AI Adoption Metrics (project-level, from AIMI_PROJECT_INFO)
        p.PEOPLE_USING_AI,
        p.LICENSE_COUNT,
        p.LICENSE_PROVIDER,
        p.RUNOPS_AUTO_RESOLVED,
        p.RUNOPS_MTTR_REDUCTION,
        p.RUNOPS_AI_AGENTS,
        p.RUNOPS_AUTOMATED_WORKFLOWS,
        p.RUNOPS_MTTD,
        p.RUNOPS_MTTR,
        p.ENGINEER_AI_AGENTS,
        p.ENGINEER_DELIVERY_CYCLE_TIME,
        p.ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
        p.ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE,
        p.COMMON_ADOPTION_WORKFORCE_CERTIFICATION,
        p.COMMON_ADOPTION_EFFORTS_SAVED,
        p.COMMON_DEPLOYMENT_ENGINEER,
        p.ACCEPTED_SCORE,
        p.ACCEPTED_SCORE_COMMENT,

        -- Activity-level fields
        a.ID AS ACTIVITY_ID,
        a.SDLC_PHASE,
        a.ACTIVITY,
        a.APPLICABILITY,
        a.AI_ADOPTION_SCORE,
        (SELECT TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE
           FROM AIMI_ACTIVITY_AI_TOOL t WHERE t.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS AI_TOOLS_JSON,
        (SELECT ACCELERATOR_NAME
           FROM AIMI_ACTIVITY_ACCELERATOR ac WHERE ac.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS ACCELERATORS_JSON,
        a.WORK_DONE_BY_AI,
        a.HOURS_SAVED,
        a.REVENUE_GENERATED,
        a.BENEFIT_TO,
        (SELECT BENEFIT_NAME
           FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb WHERE qb.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS QUALITATIVE_BENEFITS_JSON,
        a.COMMENTS,
        a.CREATED_DATE,
        a.UPDATED_DATE
    FROM AIMI_ACTIVITY a
    LEFT JOIN AIMI_PROJECT_INFO p ON p.PROJECT_ID = a.PROJECT_ID AND p.ISACTIVE = 1
    WHERE a.ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
      AND (NOT EXISTS (SELECT 1 FROM @BUSINESS_UNITS) OR a.BUSINESS_UNIT IN (SELECT VALUE_TEXT FROM @BUSINESS_UNITS))
      AND (NOT EXISTS (SELECT 1 FROM @ACCOUNTS)       OR a.ACCOUNT       IN (SELECT VALUE_TEXT FROM @ACCOUNTS))
      AND (NOT EXISTS (SELECT 1 FROM @PROJECTS)       OR a.PROJECT       IN (SELECT VALUE_TEXT FROM @PROJECTS))
      AND (NOT EXISTS (SELECT 1 FROM @PRACTICES)      OR a.PRACTICE      IN (SELECT VALUE_TEXT FROM @PRACTICES))
    ORDER BY a.BUSINESS_UNIT, a.ACCOUNT, a.PROJECT, a.PRACTICE, a.SDLC_PHASE, a.CREATED_DATE;
END
GO
