----------------------------------------------------------------------------------------------------
-- AIMI (AI Maturity Index) - Firebase to SQL migration - CONSOLIDATED PRODUCTION SCRIPT
-- Contents (run once, top to bottom):
--   1. Tables + indexes   : AIMI_PROJECT_INFO, AIMI_PRACTICE_INFO, AIMI_ACTIVITY (incl. ACCEPTED_SCORE,
--                           SCORE_REVIEWED, ACCEPTED_SCORE_COMMENT), AIMI_ACTIVITY_AI_TOOL,
--                           AIMI_ACTIVITY_ACCELERATOR, AIMI_ACTIVITY_QUALITATIVE_BENEFIT,
--                           AIMI_USER_ACTIVITY_LOG, AIMI_ERROR_LOG
--   2. Table types        : AIMI_STRING_LIST_TABLE_TYPE, AIMI_ID_LIST_TABLE_TYPE, AIMI_AI_TOOL_TABLE_TYPE
--   3. Stored procedures  : usp_AIMI_* (16 procs: transactional/report + usage and error logging)
--   4. Master/lookup data : AIMI_PRACTICE, AIMI_SDLC_PHASE, AIMI_QUESTIONNAIRE_ACTIVITY,
--                           AIMI_QUALITATIVE_BENEFIT, AIMI_AI_ADOPTION_SCORE, AIMI_AI_TOOL, AIMI_ACCELERATOR,
--                           AIMI_APPLICABILITY, AIMI_BENEFIT_TO, AIMI_LICENSE_PROVIDER, AIMI_ACTIVITY_STATUS
--                           (tables + seed data)
--   5. Lookup procedures  : usp_AIMI_GetPractices / GetSdlcPhases / GetQuestionnaireActivities /
--                           GetQualitativeBenefits / GetAiAdoptionScores / GetAiTools / GetAccelerators
-- Equivalent to running Release 2.6.2.sql then Release 2.6.3.sql (kept in sync with this file).
-- Tables, types and seed data are guarded by IF NOT EXISTS; procedures are dropped and re-created.
-- NOTE: an existing AIMI_ACTIVITY / AIMI_PROJECT_INFO is NOT altered by this script - it is meant for a
--       database that does not have the AIMI tables yet (PROD).
----------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------
-- AIMI (AI Maturity Index Platform) - Firebase to SQL migration - Phase 1
-- Creates the core tables + supporting table types for the AIMI domain
-- (previously stored in Firestore collections: activities, projectInfo, practiceInfo).
-- Safe to re-run: every object is created only if it does not already exist.
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- AIMI_PROJECT_INFO  (was Firestore collection: projectInfo - 1 doc per PROJECT_ID)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_PROJECT_INFO' AND type='U')
BEGIN
CREATE TABLE AIMI_PROJECT_INFO (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    PROJECT_ID VARCHAR(20) NOT NULL,

    PEOPLE_USING_AI INT NULL,
    IS_PROJECT_NA BIT NOT NULL DEFAULT(0),
    NA_COMMENTS NVARCHAR(MAX) NULL,
    LICENSE_COUNT INT NULL,
    LICENSE_PROVIDER VARCHAR(50) NULL,

    -- RunOps Adoption Metrics
    RUNOPS_AUTO_RESOLVED VARCHAR(100) NULL,
    RUNOPS_MTTR_REDUCTION VARCHAR(100) NULL,
    RUNOPS_AI_AGENTS VARCHAR(100) NULL,
    RUNOPS_AUTOMATED_WORKFLOWS VARCHAR(100) NULL,
    RUNOPS_MTTD VARCHAR(100) NULL,
    RUNOPS_MTTR VARCHAR(100) NULL,

    -- Engineering Adoption Metrics
    ENGINEER_AI_AGENTS VARCHAR(100) NULL,
    ENGINEER_DELIVERY_CYCLE_TIME VARCHAR(100) NULL,
    ENGINEER_CONTRACT_TEST_CASE_PASS_RATE VARCHAR(100) NULL,
    ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE VARCHAR(100) NULL,

    -- Common Adoption Metrics
    COMMON_ADOPTION_WORKFORCE_CERTIFICATION VARCHAR(100) NULL,
    COMMON_ADOPTION_EFFORTS_SAVED VARCHAR(100) NULL,
    COMMON_DEPLOYMENT_ENGINEER VARCHAR(100) NULL,

    PRESENTATION_DONE BIT NOT NULL DEFAULT(0),
    PROJECT_FY VARCHAR(10) NULL,

    CREATED_BY VARCHAR(10) NULL,
    CREATED_DATE DATETIME NULL,
    UPDATED_BY VARCHAR(10) NULL,
    UPDATED_DATE DATETIME NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

-- One active row per project (mirrors the query-then-upsert behaviour the Firestore
-- service enforced in application code only).
CREATE UNIQUE INDEX UQ_AIMI_PROJECT_INFO_PROJECT_ID
    ON AIMI_PROJECT_INFO (PROJECT_ID) WHERE ISACTIVE = 1;
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_PRACTICE_INFO  (was Firestore collection: practiceInfo - 1 doc per (PROJECT_ID, PRACTICE))
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_PRACTICE_INFO' AND type='U')
BEGIN
CREATE TABLE AIMI_PRACTICE_INFO (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    PROJECT_ID VARCHAR(20) NOT NULL,
    PRACTICE VARCHAR(100) NOT NULL,
    CURRENT_PHASE VARCHAR(200) NULL,

    CREATED_BY VARCHAR(10) NULL,
    CREATED_DATE DATETIME NULL,
    UPDATED_BY VARCHAR(10) NULL,
    UPDATED_DATE DATETIME NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_PRACTICE_INFO_PROJECT_PRACTICE
    ON AIMI_PRACTICE_INFO (PROJECT_ID, PRACTICE) WHERE ISACTIVE = 1;
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY  (was Firestore collection: activities)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,

    -- Project context snapshot (denormalized at write time, same as the Firestore doc did;
    -- PROJECT_ID/PROJECT/ACCOUNT/BUSINESS_UNIT are not FK'd to PROJECT here - the master
    -- project list is owned by the existing CSM API/PROJECT table, not this new domain).
    PROJECT_ID VARCHAR(20) NOT NULL,
    PROJECT NVARCHAR(200) NULL,
    ACCOUNT NVARCHAR(200) NULL,
    BUSINESS_UNIT VARCHAR(100) NULL,
    PRACTICE VARCHAR(100) NOT NULL,

    SDLC_PHASE VARCHAR(200) NOT NULL,
    ACTIVITY VARCHAR(500) NOT NULL,
    APPLICABILITY VARCHAR(20) NULL,          -- Yes | No | Activity NA | Customer NA
    AI_ADOPTION_SCORE TINYINT NULL,          -- 0-5 ; NULL = not applicable / not scored
    WORK_DONE_BY_AI TINYINT NULL,            -- 0-100
    HOURS_SAVED DECIMAL(10,2) NULL,
    REVENUE_GENERATED VARCHAR(5) NULL,       -- Yes | No
    BENEFIT_TO VARCHAR(20) NULL,             -- Neurealm | Customer | Both
    COMMENTS NVARCHAR(MAX) NULL,
    STATUS VARCHAR(20) NULL,                 -- draft | submitted

    -- Admin review of the Overall Score (Accepted Score). Every activity of a project + practice
    -- carries the same values; written only by usp_AIMI_UpdateAcceptedScore.
    ACCEPTED_SCORE DECIMAL(4,2) NULL,
    SCORE_REVIEWED BIT NOT NULL DEFAULT(0),
    ACCEPTED_SCORE_COMMENT NVARCHAR(MAX) NULL,

    CREATED_BY VARCHAR(10) NULL,
    CREATED_DATE DATETIME NULL,
    UPDATED_BY VARCHAR(10) NULL,
    UPDATED_DATE DATETIME NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE INDEX IX_AIMI_ACTIVITY_PROJECT_PRACTICE ON AIMI_ACTIVITY (PROJECT_ID, PRACTICE) WHERE ISACTIVE = 1;
CREATE INDEX IX_AIMI_ACTIVITY_BUSINESS_UNIT ON AIMI_ACTIVITY (BUSINESS_UNIT) WHERE ISACTIVE = 1;
CREATE INDEX IX_AIMI_ACTIVITY_ACCOUNT ON AIMI_ACTIVITY (ACCOUNT) WHERE ISACTIVE = 1;
CREATE INDEX IX_AIMI_ACTIVITY_PROJECT ON AIMI_ACTIVITY (PROJECT) WHERE ISACTIVE = 1;
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_AI_TOOL  (was the aiToolUsed[] array + aiToolDetails{} map on the activity doc)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_AI_TOOL' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_AI_TOOL (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    ACTIVITY_ID INT NOT NULL,
    TOOL_NAME VARCHAR(200) NOT NULL,
    ACCESS_TYPE VARCHAR(20) NULL,     -- Licensed | Not-Licensed
    LICENSE_COUNT INT NULL,
    NETWORK_TYPE VARCHAR(20) NULL,    -- Customer | Neurealm

    CONSTRAINT FK_AIMI_ACTIVITY_AI_TOOL_ACTIVITY
        FOREIGN KEY (ACTIVITY_ID) REFERENCES AIMI_ACTIVITY (ID) ON DELETE CASCADE
);

CREATE INDEX IX_AIMI_ACTIVITY_AI_TOOL_ACTIVITY_ID ON AIMI_ACTIVITY_AI_TOOL (ACTIVITY_ID);
CREATE INDEX IX_AIMI_ACTIVITY_AI_TOOL_TOOL_NAME ON AIMI_ACTIVITY_AI_TOOL (TOOL_NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_ACCELERATOR  (was the acceleratorsUsed[] array on the activity doc)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_ACCELERATOR' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_ACCELERATOR (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    ACTIVITY_ID INT NOT NULL,
    ACCELERATOR_NAME VARCHAR(200) NOT NULL,

    CONSTRAINT FK_AIMI_ACTIVITY_ACCELERATOR_ACTIVITY
        FOREIGN KEY (ACTIVITY_ID) REFERENCES AIMI_ACTIVITY (ID) ON DELETE CASCADE
);

CREATE INDEX IX_AIMI_ACTIVITY_ACCELERATOR_ACTIVITY_ID ON AIMI_ACTIVITY_ACCELERATOR (ACTIVITY_ID);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_QUALITATIVE_BENEFIT  (was the qualitativeBenefits[] array on the activity doc)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_QUALITATIVE_BENEFIT' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_QUALITATIVE_BENEFIT (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    ACTIVITY_ID INT NOT NULL,
    BENEFIT_NAME VARCHAR(200) NOT NULL,

    CONSTRAINT FK_AIMI_ACTIVITY_QUAL_BENEFIT_ACTIVITY
        FOREIGN KEY (ACTIVITY_ID) REFERENCES AIMI_ACTIVITY (ID) ON DELETE CASCADE
);

CREATE INDEX IX_AIMI_ACTIVITY_QUAL_BENEFIT_ACTIVITY_ID ON AIMI_ACTIVITY_QUALITATIVE_BENEFIT (ACTIVITY_ID);
CREATE INDEX IX_AIMI_ACTIVITY_QUAL_BENEFIT_NAME ON AIMI_ACTIVITY_QUALITATIVE_BENEFIT (BENEFIT_NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- Table types used by the AIMI_* stored procedures (DB Scripts/01 StoredProcedure/BAS)
-- CREATE TYPE must be the only statement in its batch, so it is wrapped in EXEC(...).
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.types WHERE name = 'AIMI_STRING_LIST_TABLE_TYPE' AND is_table_type = 1)
BEGIN
    EXEC('CREATE TYPE dbo.AIMI_STRING_LIST_TABLE_TYPE AS TABLE (VALUE_TEXT VARCHAR(200) NOT NULL)')
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.types WHERE name = 'AIMI_ID_LIST_TABLE_TYPE' AND is_table_type = 1)
BEGIN
    EXEC('CREATE TYPE dbo.AIMI_ID_LIST_TABLE_TYPE AS TABLE (ID INT NOT NULL)')
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.types WHERE name = 'AIMI_AI_TOOL_TABLE_TYPE' AND is_table_type = 1)
BEGIN
    EXEC('CREATE TYPE dbo.AIMI_AI_TOOL_TABLE_TYPE AS TABLE (
        TOOL_NAME VARCHAR(200) NOT NULL,
        ACCESS_TYPE VARCHAR(20) NULL,
        LICENSE_COUNT INT NULL,
        NETWORK_TYPE VARCHAR(20) NULL
    )')
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI (AI Maturity Index Platform) - Firebase to SQL migration - Phase 3
-- AIMI currently has no usage/error logging of its own. The platform does have a shared
-- dbo.ACTIVITY_LOGS table (EMAIL_ID, REQUEST_URL, METHOD, EXCEPTION, INNER_EXCEPTION,
-- STACK_TRACE, CONTENT, CREATED_DATE), written via GAVS.AllocationSystem.WebApi's
-- Logger/IActivityLogs + [ActivityLogger]/[ExceptionFilter] action filters - but that pipeline
-- is wired per ASP.NET Web API controller, and AIMI has no C# controller yet (it talks to
-- Firestore directly from the React client today). It's also a coarse HTTP-request log (URL +
-- verb + raw body), with no concept of "which AIMI module/action" or "which project/practice"
-- was involved, so it wouldn't answer "who is using AIMI" in a useful way even if AIMI could
-- plug into it today.
--
-- These two tables are AIMI-specific so they can be written directly (from a future AIMI API
-- layer, or from a client-side logging call in the interim) with AIMI's own module/action/project
-- context, while still following the platform's usual table conventions.
--
-- Safe to re-run: every object is created only if it does not already exist.
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- AIMI_USER_ACTIVITY_LOG  (who used AIMI, when, and what they did - e.g. logged in, viewed the
-- dashboard, submitted/updated activities, generated a report)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_USER_ACTIVITY_LOG' AND type='U')
BEGIN
CREATE TABLE AIMI_USER_ACTIVITY_LOG (
    ID BIGINT NOT NULL IDENTITY(1,1) PRIMARY KEY,

    EMAIL_ID VARCHAR(100) NOT NULL,
    USER_NAME VARCHAR(100) NULL,

    MODULE VARCHAR(50) NOT NULL,      -- e.g. Dashboard | Activities | Reports | ProjectInfo | Backup
    ACTION VARCHAR(100) NOT NULL,     -- e.g. LOGIN | VIEW | SUBMIT_ACTIVITY | GENERATE_REPORT | DELETE_ACTIVITY

    -- Context the action was performed in, when applicable (all nullable - a dashboard view has
    -- no single project/practice, but submitting an activity does).
    PROJECT_ID VARCHAR(20) NULL,
    PRACTICE VARCHAR(100) NULL,

    REQUEST_URL VARCHAR(500) NULL,
    IP_ADDRESS VARCHAR(50) NULL,

    CREATED_DATE DATETIME NOT NULL DEFAULT(GETDATE())
);

CREATE INDEX IX_AIMI_USER_ACTIVITY_LOG_EMAIL_DATE ON AIMI_USER_ACTIVITY_LOG (EMAIL_ID, CREATED_DATE);
CREATE INDEX IX_AIMI_USER_ACTIVITY_LOG_MODULE_ACTION ON AIMI_USER_ACTIVITY_LOG (MODULE, ACTION);
CREATE INDEX IX_AIMI_USER_ACTIVITY_LOG_PROJECT_ID ON AIMI_USER_ACTIVITY_LOG (PROJECT_ID);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ERROR_LOG  (application errors encountered while using AIMI - e.g. the Firestore
-- 'IN' query limit errors from the Reports page, failed saves, etc.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ERROR_LOG' AND type='U')
BEGIN
CREATE TABLE AIMI_ERROR_LOG (
    ID BIGINT NOT NULL IDENTITY(1,1) PRIMARY KEY,

    EMAIL_ID VARCHAR(100) NULL,       -- nullable: an error can occur before the user is resolved
    MODULE VARCHAR(50) NULL,
    ACTION VARCHAR(100) NULL,

    REQUEST_URL VARCHAR(500) NULL,
    ERROR_MESSAGE NVARCHAR(MAX) NULL,
    EXCEPTION_TYPE VARCHAR(200) NULL,
    STACK_TRACE NVARCHAR(MAX) NULL,
    REQUEST_PAYLOAD NVARCHAR(MAX) NULL,   -- request body / relevant state at time of error, if captured

    CREATED_DATE DATETIME NOT NULL DEFAULT(GETDATE())
);

CREATE INDEX IX_AIMI_ERROR_LOG_EMAIL_DATE ON AIMI_ERROR_LOG (EMAIL_ID, CREATED_DATE);
CREATE INDEX IX_AIMI_ERROR_LOG_MODULE_ACTION ON AIMI_ERROR_LOG (MODULE, ACTION);
END
GO

----------------------------------------------------------------------------------------------------
-- Permissions: AIMI already uses APP_ACCESS_CONTROLS resource id 833 client-side
-- (see csp-angular19/src/microapps/AIMI/src/shared/utils/accessControl.ts - AIMI_ADMIN_RESOURCE_ID)
-- for its admin role check. That resource id is already provisioned, so no new
-- APP_CONTROLS / APP_ACCESS_CONTROLS rows are needed here - the new AimiController
-- will call CheckAccessForFeature(833) for admin-gated actions (delete, bulk-delete,
-- review score) exactly the same way the client already gates its own UI.
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- Stored procedures (latest versions - source of truth: 01 StoredProcedure\BAS\usp_AIMI_*.sql)
----------------------------------------------------------------------------------------------------

-- Soft-deletes one activity (@ID) and/or a batch of activities (@IDS), matching the
-- house convention of ISACTIVE=0 rather than a hard DELETE. Covers both the single
-- "Delete Activity" action and the admin "bulk delete selected in phase" action.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_DeleteActivity' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_DeleteActivity]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_DeleteActivity]
    @ID INT = NULL,
    @IDS dbo.AIMI_ID_LIST_TABLE_TYPE READONLY,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE AIMI_ACTIVITY
       SET ISACTIVE = 0,
           UPDATED_BY = @EMP_ID,
           UPDATED_DATE = GETDATE()
     WHERE ISACTIVE = 1
       AND (
             (@ID IS NOT NULL AND ID = @ID)
             OR ID IN (SELECT ID FROM @IDS)
           );
END
GO

-- Flexible read covering the three single-project Firestore queries AIMI used to run:
-- getActivityById, getActivitiesByProjectIdAndPractice, getActivitiesByProjectId.
-- Pass whichever combination of @ID / @PROJECT_ID / @PRACTICE the caller has; any
-- left NULL is not filtered on. Tool/accelerator/benefit junction rows are folded
-- back into each activity row as JSON arrays so the API layer gets one row per
-- activity, matching the shape the React service layer already expects.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetActivities' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetActivities]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetActivities]
    @ID INT = NULL,
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.ID, a.PROJECT_ID, a.PROJECT, a.ACCOUNT, a.BUSINESS_UNIT, a.PRACTICE,
        a.SDLC_PHASE, a.ACTIVITY, a.APPLICABILITY, a.AI_ADOPTION_SCORE, a.WORK_DONE_BY_AI,
        a.HOURS_SAVED, a.REVENUE_GENERATED, a.BENEFIT_TO, a.COMMENTS, a.STATUS,
        a.ACCEPTED_SCORE, a.SCORE_REVIEWED, a.ACCEPTED_SCORE_COMMENT,
        a.CREATED_BY, a.CREATED_DATE, a.UPDATED_BY, a.UPDATED_DATE,
        (SELECT TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE
           FROM AIMI_ACTIVITY_AI_TOOL t WHERE t.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS AI_TOOLS_JSON,
        (SELECT ACCELERATOR_NAME
           FROM AIMI_ACTIVITY_ACCELERATOR ac WHERE ac.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS ACCELERATORS_JSON,
        (SELECT BENEFIT_NAME
           FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb WHERE qb.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS QUALITATIVE_BENEFITS_JSON
    FROM AIMI_ACTIVITY a
    WHERE a.ISACTIVE = 1
      AND (@ID IS NULL OR a.ID = @ID)
      AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
    ORDER BY a.CREATED_DATE DESC;
END
GO

-- Cross-project read backing the Reports page and the Dashboard/Project Statistics
-- screens - replaces the old getActivitiesByBusinessUnits / getActivitiesByAccounts /
-- getActivitiesByProjects client methods with one flexible, filtered, set-based query.
-- Any of the four table-valued parameters may be passed empty, meaning "no filter on
-- that dimension" (mirrors the old client-side "All" multi-select behaviour).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetActivitiesByFilter' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetActivitiesByFilter]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetActivitiesByFilter]
    @BUSINESS_UNITS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @ACCOUNTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PROJECTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PRACTICES dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.ID, a.PROJECT_ID, a.PROJECT, a.ACCOUNT, a.BUSINESS_UNIT, a.PRACTICE,
        a.SDLC_PHASE, a.ACTIVITY, a.APPLICABILITY, a.AI_ADOPTION_SCORE, a.WORK_DONE_BY_AI,
        a.HOURS_SAVED, a.REVENUE_GENERATED, a.BENEFIT_TO, a.COMMENTS, a.STATUS,
        a.ACCEPTED_SCORE, a.SCORE_REVIEWED, a.ACCEPTED_SCORE_COMMENT,
        a.CREATED_BY, a.CREATED_DATE, a.UPDATED_BY, a.UPDATED_DATE,
        (SELECT TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE
           FROM AIMI_ACTIVITY_AI_TOOL t WHERE t.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS AI_TOOLS_JSON,
        (SELECT ACCELERATOR_NAME
           FROM AIMI_ACTIVITY_ACCELERATOR ac WHERE ac.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS ACCELERATORS_JSON,
        (SELECT BENEFIT_NAME
           FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb WHERE qb.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS QUALITATIVE_BENEFITS_JSON
    FROM AIMI_ACTIVITY a
    WHERE a.ISACTIVE = 1
      AND (NOT EXISTS (SELECT 1 FROM @BUSINESS_UNITS) OR a.BUSINESS_UNIT IN (SELECT VALUE_TEXT FROM @BUSINESS_UNITS))
      AND (NOT EXISTS (SELECT 1 FROM @ACCOUNTS)       OR a.ACCOUNT       IN (SELECT VALUE_TEXT FROM @ACCOUNTS))
      AND (NOT EXISTS (SELECT 1 FROM @PROJECTS)       OR a.PROJECT       IN (SELECT VALUE_TEXT FROM @PROJECTS))
      AND (NOT EXISTS (SELECT 1 FROM @PRACTICES)      OR a.PRACTICE      IN (SELECT VALUE_TEXT FROM @PRACTICES))
    ORDER BY a.CREATED_DATE DESC;
END
GO

-- Replaces statisticalAnalysisUtils.ts's calculateAIToolMetrics(), which today
-- unnests the aiToolUsed[] array client-side and reduces in JS. Here the unnest is
-- just the AIMI_ACTIVITY_AI_TOOL join, and the aggregation is a plain GROUP BY.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAIToolMetrics' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAIToolMetrics]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAIToolMetrics]
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.TOOL_NAME,
        COUNT(*) AS ACTIVITIES,
        SUM(ISNULL(a.HOURS_SAVED, 0)) AS HOURS_SAVED,
        SUM(CASE WHEN a.REVENUE_GENERATED = 'Yes' THEN 1 ELSE 0 END) AS REVENUE_ACTIVITIES,
        AVG(CAST(a.WORK_DONE_BY_AI AS FLOAT)) AS AVG_WORK_DONE_BY_AI
    FROM AIMI_ACTIVITY a
    JOIN AIMI_ACTIVITY_AI_TOOL t ON t.ACTIVITY_ID = a.ID
    WHERE a.ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
    GROUP BY t.TOOL_NAME
    ORDER BY HOURS_SAVED DESC;
END
GO

-- Replaces statisticalAnalysisUtils.ts's getAIToolsBySDLCPhase() - which distinct
-- tool is used in which phase.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAIToolsBySDLCPhase' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAIToolsBySDLCPhase]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAIToolsBySDLCPhase]
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        a.SDLC_PHASE,
        t.TOOL_NAME
    FROM AIMI_ACTIVITY a
    JOIN AIMI_ACTIVITY_AI_TOOL t ON t.ACTIVITY_ID = a.ID
    WHERE a.ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
    ORDER BY a.SDLC_PHASE, t.TOOL_NAME;
END
GO

-- Replaces statisticalAnalysisUtils.ts's calculateSummaryStatistics(), which today
-- fetches every activity and reduces client-side. @PROJECT_ID/@PRACTICE are both
-- optional: leave NULL for the portfolio-wide Dashboard, or pass PROJECT_ID (and
-- optionally PRACTICE) to scope this to one project's "Project Statistics" tab.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetDashboardSummary' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetDashboardSummary]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetDashboardSummary]
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TOTAL_ACTIVITIES,
        AVG(CAST(AI_ADOPTION_SCORE AS FLOAT)) AS OVERALL_AI_ADOPTION_SCORE,
        AVG(CAST(WORK_DONE_BY_AI AS FLOAT)) AS OVERALL_WORK_DONE_BY_AI,
        SUM(ISNULL(HOURS_SAVED, 0)) AS TOTAL_HOURS_SAVED,
        SUM(CASE WHEN REVENUE_GENERATED = 'Yes' THEN 1 ELSE 0 END) AS REVENUE_GENERATING_ACTIVITIES,
        SUM(CASE WHEN AI_ADOPTION_SCORE >= 4 THEN 1 ELSE 0 END) AS HIGH_ADOPTION_ACTIVITIES
    FROM AIMI_ACTIVITY
    WHERE ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR PRACTICE = @PRACTICE);
END
GO

-- Reads practice-info rows. Pass @PROJECT_ID/@PRACTICE to narrow; leave either or
-- both NULL for "all" (covers both getPracticeInfo and getAllPracticeInfo).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetPracticeInfo' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetPracticeInfo]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetPracticeInfo]
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM AIMI_PRACTICE_INFO
    WHERE ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR PRACTICE = @PRACTICE);
END
GO

-- Reads one project's AI Adoption Metrics (@PROJECT_ID supplied), or all projects
-- when @PROJECT_ID is NULL (covers both getProjectInfo and getAllProjectInfo).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetProjectInfo' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetProjectInfo]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetProjectInfo]
    @PROJECT_ID VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM AIMI_PROJECT_INFO
    WHERE ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR PROJECT_ID = @PROJECT_ID);
END
GO

-- Replaces statisticalAnalysisUtils.ts's analyzeQualitativeBenefits() - frequency and
-- hours-saved per benefit, plus the most-frequent associated AI tool and the full
-- distinct tool list for each benefit. This was an O(benefits x activities) client-side
-- loop; here it is a GROUP BY plus two CROSS APPLYs.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetQualitativeBenefitAnalysis' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefitAnalysis]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefitAnalysis]
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        qb.BENEFIT_NAME,
        COUNT(*) AS FREQUENCY,
        SUM(ISNULL(a.HOURS_SAVED, 0)) AS TOTAL_HOURS_SAVED,
        mostFrequentTool.TOOL_NAME AS MOST_FREQUENT_TOOL,
        associatedTools.TOOLS_JSON AS ASSOCIATED_TOOLS_JSON
    FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb
    JOIN AIMI_ACTIVITY a ON a.ID = qb.ACTIVITY_ID
    OUTER APPLY (
        SELECT TOP 1 t.TOOL_NAME
        FROM AIMI_ACTIVITY_AI_TOOL t
        JOIN AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb2 ON qb2.ACTIVITY_ID = t.ACTIVITY_ID
        WHERE qb2.BENEFIT_NAME = qb.BENEFIT_NAME
        GROUP BY t.TOOL_NAME
        ORDER BY COUNT(*) DESC
    ) mostFrequentTool
    OUTER APPLY (
        SELECT (
            SELECT DISTINCT t.TOOL_NAME
            FROM AIMI_ACTIVITY_AI_TOOL t
            JOIN AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb3 ON qb3.ACTIVITY_ID = t.ACTIVITY_ID
            WHERE qb3.BENEFIT_NAME = qb.BENEFIT_NAME
            FOR JSON PATH
        ) AS TOOLS_JSON
    ) associatedTools
    WHERE a.ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
    GROUP BY qb.BENEFIT_NAME, mostFrequentTool.TOOL_NAME, associatedTools.TOOLS_JSON
    ORDER BY FREQUENCY DESC;
END
GO

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
-- (AIMI_PROJECT_INFO); Accepted Score comes from the activity rows, i.e. every AIMI-owned column of the
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
        a.ACCEPTED_SCORE,
        a.ACCEPTED_SCORE_COMMENT,
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

-- Saves the admin review (Accepted Score / Score Reviewed / Comments) for a project's
-- activities. Touches ONLY these three columns, so unlike the old project-info upsert it
-- cannot overwrite any other data. Scoped to PROJECT_ID + PRACTICE because the Overall Score
-- it reviews is calculated from that practice's activities.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_UpdateAcceptedScore' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_UpdateAcceptedScore]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_UpdateAcceptedScore]
    @PROJECT_ID VARCHAR(20),
    @PRACTICE VARCHAR(100),
    @ACCEPTED_SCORE DECIMAL(4,2) = NULL,
    @SCORE_REVIEWED BIT = 0,
    @ACCEPTED_SCORE_COMMENT NVARCHAR(MAX) = NULL,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE AIMI_ACTIVITY
       SET ACCEPTED_SCORE = @ACCEPTED_SCORE,
           SCORE_REVIEWED = @SCORE_REVIEWED,
           ACCEPTED_SCORE_COMMENT = @ACCEPTED_SCORE_COMMENT,
           UPDATED_BY = @EMP_ID,
           UPDATED_DATE = GETDATE()
     WHERE PROJECT_ID = @PROJECT_ID
       AND PRACTICE = @PRACTICE
       AND ISACTIVE = 1;

    SELECT @@ROWCOUNT AS ID;
END
GO

-- Inserts a new AIMI_ACTIVITY row, or updates an existing one when @ID is supplied,
-- and replaces its AI Tool / Accelerator / Qualitative Benefit junction rows in the
-- same call (equivalent to the old Firestore addDoc/updateDoc on the activities collection).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_UpsertActivity' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_UpsertActivity]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_UpsertActivity]
    @ID INT = NULL OUTPUT,
    @PROJECT_ID VARCHAR(20),
    @PROJECT NVARCHAR(200) = NULL,
    @ACCOUNT NVARCHAR(200) = NULL,
    @BUSINESS_UNIT VARCHAR(100) = NULL,
    @PRACTICE VARCHAR(100),
    @SDLC_PHASE VARCHAR(200),
    @ACTIVITY VARCHAR(500),
    @APPLICABILITY VARCHAR(20) = NULL,
    @AI_ADOPTION_SCORE TINYINT = NULL,
    @WORK_DONE_BY_AI TINYINT = NULL,
    @HOURS_SAVED DECIMAL(10,2) = NULL,
    @REVENUE_GENERATED VARCHAR(5) = NULL,
    @BENEFIT_TO VARCHAR(20) = NULL,
    @COMMENTS NVARCHAR(MAX) = NULL,
    @STATUS VARCHAR(20) = NULL,
    @AI_TOOLS dbo.AIMI_AI_TOOL_TABLE_TYPE READONLY,
    @ACCELERATORS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @QUALITATIVE_BENEFITS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        IF @ID IS NULL OR NOT EXISTS (SELECT 1 FROM AIMI_ACTIVITY WHERE ID = @ID)
        BEGIN
            -- A new activity inherits the practice's current review (Accepted Score etc.)
            -- so the reviewed score still shows once every activity row carries it.
            DECLARE @ACCEPTED_SCORE DECIMAL(4,2), @SCORE_REVIEWED BIT = 0, @ACCEPTED_SCORE_COMMENT NVARCHAR(MAX);
            SELECT TOP 1 @ACCEPTED_SCORE = ACCEPTED_SCORE, @SCORE_REVIEWED = SCORE_REVIEWED, @ACCEPTED_SCORE_COMMENT = ACCEPTED_SCORE_COMMENT
              FROM AIMI_ACTIVITY
             WHERE PROJECT_ID = @PROJECT_ID AND PRACTICE = @PRACTICE AND ISACTIVE = 1
               AND (ACCEPTED_SCORE IS NOT NULL OR SCORE_REVIEWED = 1 OR ACCEPTED_SCORE_COMMENT IS NOT NULL)
             ORDER BY UPDATED_DATE DESC;

            INSERT INTO AIMI_ACTIVITY
                (PROJECT_ID, PROJECT, ACCOUNT, BUSINESS_UNIT, PRACTICE, SDLC_PHASE, ACTIVITY,
                 APPLICABILITY, AI_ADOPTION_SCORE, WORK_DONE_BY_AI, HOURS_SAVED, REVENUE_GENERATED,
                 BENEFIT_TO, COMMENTS, STATUS, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE, ISACTIVE,
                 ACCEPTED_SCORE, SCORE_REVIEWED, ACCEPTED_SCORE_COMMENT)
            VALUES
                (@PROJECT_ID, @PROJECT, @ACCOUNT, @BUSINESS_UNIT, @PRACTICE, @SDLC_PHASE, @ACTIVITY,
                 @APPLICABILITY, @AI_ADOPTION_SCORE, @WORK_DONE_BY_AI, @HOURS_SAVED, @REVENUE_GENERATED,
                 @BENEFIT_TO, @COMMENTS, @STATUS, @EMP_ID, GETDATE(), @EMP_ID, GETDATE(), 1,
                 @ACCEPTED_SCORE, @SCORE_REVIEWED, @ACCEPTED_SCORE_COMMENT);

            SET @ID = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE AIMI_ACTIVITY
               SET PROJECT_ID = @PROJECT_ID,
                   PROJECT = @PROJECT,
                   ACCOUNT = @ACCOUNT,
                   BUSINESS_UNIT = @BUSINESS_UNIT,
                   PRACTICE = @PRACTICE,
                   SDLC_PHASE = @SDLC_PHASE,
                   ACTIVITY = @ACTIVITY,
                   APPLICABILITY = @APPLICABILITY,
                   AI_ADOPTION_SCORE = @AI_ADOPTION_SCORE,
                   WORK_DONE_BY_AI = @WORK_DONE_BY_AI,
                   HOURS_SAVED = @HOURS_SAVED,
                   REVENUE_GENERATED = @REVENUE_GENERATED,
                   BENEFIT_TO = @BENEFIT_TO,
                   COMMENTS = @COMMENTS,
                   STATUS = @STATUS,
                   UPDATED_BY = @EMP_ID,
                   UPDATED_DATE = GETDATE()
             WHERE ID = @ID;
        END

        -- Replace junction rows wholesale - simplest correct way to keep them in sync
        -- with whatever set of tools/accelerators/benefits the UI currently has selected.
        DELETE FROM AIMI_ACTIVITY_AI_TOOL WHERE ACTIVITY_ID = @ID;
        INSERT INTO AIMI_ACTIVITY_AI_TOOL (ACTIVITY_ID, TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE)
        SELECT @ID, TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE FROM @AI_TOOLS;

        DELETE FROM AIMI_ACTIVITY_ACCELERATOR WHERE ACTIVITY_ID = @ID;
        INSERT INTO AIMI_ACTIVITY_ACCELERATOR (ACTIVITY_ID, ACCELERATOR_NAME)
        SELECT @ID, VALUE_TEXT FROM @ACCELERATORS;

        DELETE FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT WHERE ACTIVITY_ID = @ID;
        INSERT INTO AIMI_ACTIVITY_QUALITATIVE_BENEFIT (ACTIVITY_ID, BENEFIT_NAME)
        SELECT @ID, VALUE_TEXT FROM @QUALITATIVE_BENEFITS;

        COMMIT TRANSACTION;

        -- EF6's Database.SqlQuery<int> is unreliable when a proc only has an
        -- OUTPUT parameter and no result set (throws "data reader has more
        -- than one field"), so the id is also returned as a plain one-column
        -- result set instead of relying solely on @ID OUTPUT.
        SELECT @ID AS ID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Insert-or-update of a project's current-phase-per-practice record, keyed on
-- (PROJECT_ID, PRACTICE).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_UpsertPracticeInfo' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_UpsertPracticeInfo]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_UpsertPracticeInfo]
    @ID INT = NULL OUTPUT,
    @PROJECT_ID VARCHAR(20),
    @PRACTICE VARCHAR(100),
    @CURRENT_PHASE VARCHAR(200) = NULL,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @ID = ID FROM AIMI_PRACTICE_INFO
     WHERE PROJECT_ID = @PROJECT_ID AND PRACTICE = @PRACTICE AND ISACTIVE = 1;

    IF @ID IS NULL
    BEGIN
        INSERT INTO AIMI_PRACTICE_INFO
            (PROJECT_ID, PRACTICE, CURRENT_PHASE, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE, ISACTIVE)
        VALUES
            (@PROJECT_ID, @PRACTICE, @CURRENT_PHASE, @EMP_ID, GETDATE(), @EMP_ID, GETDATE(), 1);

        SET @ID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE AIMI_PRACTICE_INFO
           SET CURRENT_PHASE = @CURRENT_PHASE,
               UPDATED_BY = @EMP_ID,
               UPDATED_DATE = GETDATE()
         WHERE ID = @ID;
    END

    -- EF6's Database.SqlQuery<int> is unreliable when a proc only has an
    -- OUTPUT parameter and no result set (throws "data reader has more than
    -- one field"), so the id is also returned as a plain one-column result
    -- set instead of relying solely on @ID OUTPUT.
    SELECT @ID AS ID;
END
GO

-- Insert-or-update of a project's AI Adoption Metrics panel, keyed on PROJECT_ID
-- (replaces the Firestore "query then addDoc/updateDoc" upsert pattern with a real
-- unique-index-backed MERGE-style upsert).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_UpsertProjectInfo' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_UpsertProjectInfo]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_UpsertProjectInfo]
    @ID INT = NULL OUTPUT,
    @PROJECT_ID VARCHAR(20),
    @PEOPLE_USING_AI INT = NULL,
    @IS_PROJECT_NA BIT = 0,
    @NA_COMMENTS NVARCHAR(MAX) = NULL,
    @LICENSE_COUNT INT = NULL,
    @LICENSE_PROVIDER VARCHAR(50) = NULL,
    @RUNOPS_AUTO_RESOLVED VARCHAR(100) = NULL,
    @RUNOPS_MTTR_REDUCTION VARCHAR(100) = NULL,
    @RUNOPS_AI_AGENTS VARCHAR(100) = NULL,
    @RUNOPS_AUTOMATED_WORKFLOWS VARCHAR(100) = NULL,
    @RUNOPS_MTTD VARCHAR(100) = NULL,
    @RUNOPS_MTTR VARCHAR(100) = NULL,
    @ENGINEER_AI_AGENTS VARCHAR(100) = NULL,
    @ENGINEER_DELIVERY_CYCLE_TIME VARCHAR(100) = NULL,
    @ENGINEER_CONTRACT_TEST_CASE_PASS_RATE VARCHAR(100) = NULL,
    @ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE VARCHAR(100) = NULL,
    @COMMON_ADOPTION_WORKFORCE_CERTIFICATION VARCHAR(100) = NULL,
    @COMMON_ADOPTION_EFFORTS_SAVED VARCHAR(100) = NULL,
    @COMMON_DEPLOYMENT_ENGINEER VARCHAR(100) = NULL,
    @PRESENTATION_DONE BIT = 0,
    @PROJECT_FY VARCHAR(10) = NULL,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @ID = ID FROM AIMI_PROJECT_INFO WHERE PROJECT_ID = @PROJECT_ID AND ISACTIVE = 1;

    IF @ID IS NULL
    BEGIN
        INSERT INTO AIMI_PROJECT_INFO
            (PROJECT_ID, PEOPLE_USING_AI, IS_PROJECT_NA, NA_COMMENTS, LICENSE_COUNT, LICENSE_PROVIDER,
             RUNOPS_AUTO_RESOLVED, RUNOPS_MTTR_REDUCTION, RUNOPS_AI_AGENTS, RUNOPS_AUTOMATED_WORKFLOWS,
             RUNOPS_MTTD, RUNOPS_MTTR,
             ENGINEER_AI_AGENTS, ENGINEER_DELIVERY_CYCLE_TIME, ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
             ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE,
             COMMON_ADOPTION_WORKFORCE_CERTIFICATION, COMMON_ADOPTION_EFFORTS_SAVED, COMMON_DEPLOYMENT_ENGINEER,
             PRESENTATION_DONE, PROJECT_FY,
             CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE, ISACTIVE)
        VALUES
            (@PROJECT_ID, @PEOPLE_USING_AI, @IS_PROJECT_NA, @NA_COMMENTS, @LICENSE_COUNT, @LICENSE_PROVIDER,
             @RUNOPS_AUTO_RESOLVED, @RUNOPS_MTTR_REDUCTION, @RUNOPS_AI_AGENTS, @RUNOPS_AUTOMATED_WORKFLOWS,
             @RUNOPS_MTTD, @RUNOPS_MTTR,
             @ENGINEER_AI_AGENTS, @ENGINEER_DELIVERY_CYCLE_TIME, @ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
             @ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE,
             @COMMON_ADOPTION_WORKFORCE_CERTIFICATION, @COMMON_ADOPTION_EFFORTS_SAVED, @COMMON_DEPLOYMENT_ENGINEER,
             @PRESENTATION_DONE, @PROJECT_FY,
             @EMP_ID, GETDATE(), @EMP_ID, GETDATE(), 1);

        SET @ID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE AIMI_PROJECT_INFO
           SET PEOPLE_USING_AI = @PEOPLE_USING_AI,
               IS_PROJECT_NA = @IS_PROJECT_NA,
               NA_COMMENTS = @NA_COMMENTS,
               LICENSE_COUNT = @LICENSE_COUNT,
               LICENSE_PROVIDER = @LICENSE_PROVIDER,
               RUNOPS_AUTO_RESOLVED = @RUNOPS_AUTO_RESOLVED,
               RUNOPS_MTTR_REDUCTION = @RUNOPS_MTTR_REDUCTION,
               RUNOPS_AI_AGENTS = @RUNOPS_AI_AGENTS,
               RUNOPS_AUTOMATED_WORKFLOWS = @RUNOPS_AUTOMATED_WORKFLOWS,
               RUNOPS_MTTD = @RUNOPS_MTTD,
               RUNOPS_MTTR = @RUNOPS_MTTR,
               ENGINEER_AI_AGENTS = @ENGINEER_AI_AGENTS,
               ENGINEER_DELIVERY_CYCLE_TIME = @ENGINEER_DELIVERY_CYCLE_TIME,
               ENGINEER_CONTRACT_TEST_CASE_PASS_RATE = @ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
               ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE = @ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE,
               COMMON_ADOPTION_WORKFORCE_CERTIFICATION = @COMMON_ADOPTION_WORKFORCE_CERTIFICATION,
               COMMON_ADOPTION_EFFORTS_SAVED = @COMMON_ADOPTION_EFFORTS_SAVED,
               COMMON_DEPLOYMENT_ENGINEER = @COMMON_DEPLOYMENT_ENGINEER,
               PRESENTATION_DONE = @PRESENTATION_DONE,
               PROJECT_FY = @PROJECT_FY,
               UPDATED_BY = @EMP_ID,
               UPDATED_DATE = GETDATE()
         WHERE ID = @ID;
    END

    -- EF6's Database.SqlQuery<int> is unreliable when a proc only has an
    -- OUTPUT parameter and no result set (throws "data reader has more than
    -- one field"), so the id is also returned as a plain one-column result
    -- set instead of relying solely on @ID OUTPUT.
    SELECT @ID AS ID;
END
GO

-- Records one AIMI user action (login, page view, submit, delete, report, ...) in
-- AIMI_USER_ACTIVITY_LOG. The caller only knows the CSM employee id (the empId request
-- header), so the e-mail and display name are resolved here from EMP_INFO. If the
-- employee is not found the EMP_ID itself is stored so the row is never lost.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_InsertUserActivityLog' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_InsertUserActivityLog]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_InsertUserActivityLog]
    @EMP_ID VARCHAR(10),
    @MODULE VARCHAR(50),
    @ACTION VARCHAR(100),
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL,
    @REQUEST_URL VARCHAR(500) = NULL,
    @IP_ADDRESS VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EMAIL_ID VARCHAR(100), @USER_NAME VARCHAR(100);

    SELECT @EMAIL_ID = NULLIF(LTRIM(RTRIM(EMAIL_ID)), ''),
           @USER_NAME = NULLIF(LTRIM(RTRIM(ISNULL(FRST_NM, '') + ' ' + ISNULL(LAST_NM, ''))), '')
      FROM EMP_INFO
     WHERE EMP_ID = @EMP_ID;

    INSERT INTO AIMI_USER_ACTIVITY_LOG
        (EMAIL_ID, USER_NAME, MODULE, ACTION, PROJECT_ID, PRACTICE, REQUEST_URL, IP_ADDRESS, CREATED_DATE)
    VALUES
        (ISNULL(@EMAIL_ID, @EMP_ID), @USER_NAME, @MODULE, @ACTION, @PROJECT_ID, @PRACTICE, @REQUEST_URL, @IP_ADDRESS, GETDATE());
END
GO

-- Records one application error in AIMI_ERROR_LOG. As with the user activity log, only the
-- CSM employee id is passed in; the e-mail is resolved from EMP_INFO (falling back to the
-- EMP_ID, or NULL when the error happened before a user was known).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_InsertErrorLog' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_InsertErrorLog]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_InsertErrorLog]
    @EMP_ID VARCHAR(10) = NULL,
    @MODULE VARCHAR(50) = NULL,
    @ACTION VARCHAR(100) = NULL,
    @REQUEST_URL VARCHAR(500) = NULL,
    @ERROR_MESSAGE NVARCHAR(MAX) = NULL,
    @EXCEPTION_TYPE VARCHAR(200) = NULL,
    @STACK_TRACE NVARCHAR(MAX) = NULL,
    @REQUEST_PAYLOAD NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EMAIL_ID VARCHAR(100);

    IF NULLIF(@EMP_ID, '') IS NOT NULL
        SELECT @EMAIL_ID = ISNULL(NULLIF(LTRIM(RTRIM(EMAIL_ID)), ''), @EMP_ID)
          FROM EMP_INFO
         WHERE EMP_ID = @EMP_ID;

    INSERT INTO AIMI_ERROR_LOG
        (EMAIL_ID, MODULE, ACTION, REQUEST_URL, ERROR_MESSAGE, EXCEPTION_TYPE, STACK_TRACE, REQUEST_PAYLOAD, CREATED_DATE)
    VALUES
        (ISNULL(@EMAIL_ID, NULLIF(@EMP_ID, '')), @MODULE, @ACTION, @REQUEST_URL, @ERROR_MESSAGE, @EXCEPTION_TYPE, @STACK_TRACE, @REQUEST_PAYLOAD, GETDATE());
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI (AI Maturity Index Platform) - Firebase to SQL migration - Phase 2
-- Lookup/reference tables for values that are currently hardcoded in the React source
-- (src/microapps/AIMI/src) instead of being driven by data:
--   - questionnaire.json                 -> AIMI_PRACTICE / AIMI_SDLC_PHASE / AIMI_QUESTIONNAIRE_ACTIVITY
--   - activityTypes.ts (QUALITATIVE_BENEFITS)      -> AIMI_QUALITATIVE_BENEFIT
--   - activityTypes.ts (AI_ADOPTION_SCORES)        -> AIMI_AI_ADOPTION_SCORE
--   - activityTypes.ts (COMMON_AI_TOOLS)           -> AIMI_AI_TOOL
--   - activityTypes.ts (COMMON_ACCELERATORS)       -> AIMI_ACCELERATOR
--   - activityTypes.ts (APPLICABILITY_OPTIONS)     -> AIMI_APPLICABILITY
--   - activityTypes.ts (BENEFIT_TO_OPTIONS)        -> AIMI_BENEFIT_TO
--   - ProjectInfoSelection.tsx (inline 'Client'/'Neurealm' literals) -> AIMI_LICENSE_PROVIDER
--   - activityTypes.ts (ActivityStatus union type)  -> AIMI_ACTIVITY_STATUS
--
-- Plain Yes/No and two-value flags (REVENUE_GENERATED_OPTIONS, CLIENT_APPROVED_OPTIONS, the
-- AI-tool ACCESS_TYPE/NETWORK_TYPE options) are intentionally NOT modeled as lookup tables here -
-- a binary flag doesn't need a FK'd reference table, a CHECK-constrained column is enough.
--
-- These are pure reference/lookup tables, seeded from the values that exist in the client today.
-- None of the existing AIMI_* transactional tables (AIMI_ACTIVITY, AIMI_PROJECT_INFO, ...) are
-- altered here - wiring FK columns into them is a follow-up once the client reads these lists
-- from an API instead of from hardcoded arrays.
--
-- Safe to re-run: every table is created only if it does not already exist, and each table is
-- seeded only the first time (guarded by "IF NOT EXISTS (SELECT 1 FROM <table>)").
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- AIMI_PRACTICE  (was the flat list derived from questionnaire.json practices[])
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_PRACTICE' AND type='U')
BEGIN
CREATE TABLE AIMI_PRACTICE (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_PRACTICE_NAME ON AIMI_PRACTICE (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_SDLC_PHASE  (was questionnaire.json practices[].sdlcPhases[] - phase names are NOT a
-- global enum, each practice has its own phase vocabulary, so this is scoped per practice)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_SDLC_PHASE' AND type='U')
BEGIN
CREATE TABLE AIMI_SDLC_PHASE (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    PRACTICE_ID INT NOT NULL,
    NAME VARCHAR(200) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1),

    CONSTRAINT FK_AIMI_SDLC_PHASE_PRACTICE
        FOREIGN KEY (PRACTICE_ID) REFERENCES AIMI_PRACTICE (ID)
);

CREATE UNIQUE INDEX UQ_AIMI_SDLC_PHASE_PRACTICE_NAME ON AIMI_SDLC_PHASE (PRACTICE_ID, NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_QUESTIONNAIRE_ACTIVITY  (was questionnaire.json ...sdlcPhases[].activities[] - the catalog
-- of activities the questionnaire/manage-activities screen presents per phase. Distinct from the
-- existing AIMI_ACTIVITY table, which stores the per-project activity log entries a user submits,
-- not the master catalog of possible activities.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_QUESTIONNAIRE_ACTIVITY' AND type='U')
BEGIN
CREATE TABLE AIMI_QUESTIONNAIRE_ACTIVITY (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    SDLC_PHASE_ID INT NOT NULL,
    ACTIVITY NVARCHAR(1000) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1),

    CONSTRAINT FK_AIMI_QUESTIONNAIRE_ACTIVITY_PHASE
        FOREIGN KEY (SDLC_PHASE_ID) REFERENCES AIMI_SDLC_PHASE (ID)
);

CREATE INDEX IX_AIMI_QUESTIONNAIRE_ACTIVITY_PHASE_ID ON AIMI_QUESTIONNAIRE_ACTIVITY (SDLC_PHASE_ID);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_QUALITATIVE_BENEFIT  (was activityTypes.ts QUALITATIVE_BENEFITS - the master suggestion
-- list. Distinct from AIMI_ACTIVITY_QUALITATIVE_BENEFIT, which stores which benefits were picked
-- for a given logged activity.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_QUALITATIVE_BENEFIT' AND type='U')
BEGIN
CREATE TABLE AIMI_QUALITATIVE_BENEFIT (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(200) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_QUALITATIVE_BENEFIT_NAME ON AIMI_QUALITATIVE_BENEFIT (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_ADOPTION_SCORE  (was activityTypes.ts AI_ADOPTION_SCORES + scoreColorUtils.ts
-- getScoreColor - the 0-5 maturity scale used on AIMI_ACTIVITY.AI_ADOPTION_SCORE)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_AI_ADOPTION_SCORE' AND type='U')
BEGIN
CREATE TABLE AIMI_AI_ADOPTION_SCORE (
    SCORE TINYINT NOT NULL PRIMARY KEY,   -- 0-5, matches AIMI_ACTIVITY.AI_ADOPTION_SCORE
    LABEL VARCHAR(50) NOT NULL,
    DESCRIPTION NVARCHAR(300) NOT NULL,
    COLOR_HEX VARCHAR(7) NOT NULL
);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_TOOL  (was activityTypes.ts COMMON_AI_TOOLS - free-text autocomplete suggestion list.
-- Distinct from AIMI_ACTIVITY_AI_TOOL, which stores which tools were picked for a given logged
-- activity, including tools typed in that aren't in this suggestion list.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_AI_TOOL' AND type='U')
BEGIN
CREATE TABLE AIMI_AI_TOOL (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(200) NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_AI_TOOL_NAME ON AIMI_AI_TOOL (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACCELERATOR  (was activityTypes.ts COMMON_ACCELERATORS - free-text autocomplete suggestion
-- list. Distinct from AIMI_ACTIVITY_ACCELERATOR, the per-activity junction table.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACCELERATOR' AND type='U')
BEGIN
CREATE TABLE AIMI_ACCELERATOR (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(200) NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_ACCELERATOR_NAME ON AIMI_ACCELERATOR (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- Simple CODE/LABEL option lookups - one table per hardcoded dropdown in activityTypes.ts /
-- ProjectInfoSelection.tsx that has more than two values (a plain Yes/No or other two-value flag
-- doesn't get a table - see the note near the top of this script). CODE is the exact string value
-- the client already persists today (e.g. AIMI_ACTIVITY.APPLICABILITY, .BENEFIT_TO, .STATUS,
-- AIMI_PROJECT_INFO.LICENSE_PROVIDER), so existing data keeps matching once these columns are
-- FK'd to these tables.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_APPLICABILITY' AND type='U')
BEGIN
CREATE TABLE AIMI_APPLICABILITY (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_BENEFIT_TO' AND type='U')
BEGIN
CREATE TABLE AIMI_BENEFIT_TO (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_LICENSE_PROVIDER' AND type='U')
BEGIN
CREATE TABLE AIMI_LICENSE_PROVIDER (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_STATUS' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_STATUS (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

----------------------------------------------------------------------------------------------------
-- Seed data - each block only inserts the first time (table starts empty), so this script
-- stays safe to re-run alongside the CREATE TABLE guards above.
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- AIMI_PRACTICE / AIMI_SDLC_PHASE / AIMI_QUESTIONNAIRE_ACTIVITY
-- Generated from src/microapps/AIMI/src/shared/assets/questionnaire.json (8 practices,
-- 60 phases, 298 activities as of this migration).
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_PRACTICE)
BEGIN

INSERT INTO AIMI_PRACTICE (NAME, SORT_ORDER) VALUES
    (N'Digital Product Engineering', 1),
    (N'Network Monitoring', 2),
    (N'Infrastructure Support', 3),
    (N'Security', 4),
    (N'End-user Computing & Service De', 5),
    (N'Data & Analytics', 6),
    (N'Semi', 7),
    (N'Embedded & Digital SW', 8);

INSERT INTO AIMI_SDLC_PHASE (PRACTICE_ID, NAME, SORT_ORDER)
SELECT p.ID, v.PHASE_NAME, v.SORT_ORDER
FROM (VALUES
    (N'Digital Product Engineering', N'Requirements & Design Phase', 1),
    (N'Digital Product Engineering', N'Development', 2),
    (N'Digital Product Engineering', N'Testing & QA', 3),
    (N'Digital Product Engineering', N'Deployment Phase', 4),
    (N'Digital Product Engineering', N'UX', 5),
    (N'Network Monitoring', N'Core Activities', 1),
    (N'Network Monitoring', N'Event Management', 2),
    (N'Network Monitoring', N'Incident Management', 3),
    (N'Network Monitoring', N'Problem Management', 4),
    (N'Network Monitoring', N'Change Management', 5),
    (N'Network Monitoring', N'Request Fulfillment', 6),
    (N'Network Monitoring', N'Configuration Management', 7),
    (N'Network Monitoring', N'Release Management', 8),
    (N'Network Monitoring', N'Asset Management', 9),
    (N'Infrastructure Support', N'Core Activities', 1),
    (N'Infrastructure Support', N'Event Management', 2),
    (N'Infrastructure Support', N'Incident Management', 3),
    (N'Infrastructure Support', N'Problem Management', 4),
    (N'Infrastructure Support', N'Change Management', 5),
    (N'Infrastructure Support', N'Request Fulfillment', 6),
    (N'Infrastructure Support', N'Configuration Management', 7),
    (N'Infrastructure Support', N'Release Management', 8),
    (N'Infrastructure Support', N'Asset Management', 9),
    (N'Security', N'Core Activities', 1),
    (N'Security', N'Event Management', 2),
    (N'Security', N'Incident Management', 3),
    (N'Security', N'Problem Management', 4),
    (N'Security', N'Change Management', 5),
    (N'Security', N'Configuration Management', 6),
    (N'Security', N'Release Management', 7),
    (N'Security', N'Asset Management', 8),
    (N'End-user Computing & Service De', N'Core Activities', 1),
    (N'End-user Computing & Service De', N'Event Management', 2),
    (N'End-user Computing & Service De', N'Incident Management', 3),
    (N'End-user Computing & Service De', N'Problem Management', 4),
    (N'End-user Computing & Service De', N'Change Management', 5),
    (N'End-user Computing & Service De', N'Request Fulfillment', 6),
    (N'End-user Computing & Service De', N'Configuration Management', 7),
    (N'End-user Computing & Service De', N'Release Management', 8),
    (N'End-user Computing & Service De', N'Asset Management', 9),
    (N'Data & Analytics', N'Requirements & Discovery Phase', 1),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', 2),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', 3),
    (N'Data & Analytics', N'Testing & Documentations', 4),
    (N'Data & Analytics', N'Alerts & Notifications', 5),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', 6),
    (N'Data & Analytics', N'Governance, Risk & Compliance (GRC)', 7),
    (N'Semi', N'Requirements & Specifications', 1),
    (N'Semi', N'Design & Verification', 2),
    (N'Semi', N'Implementation Phase (DFT &PD)', 3),
    (N'Semi', N'FPGA and Emulation', 4),
    (N'Embedded & Digital SW', N'Requirements & Specifications', 1),
    (N'Embedded & Digital SW', N'Architecture & Design', 2),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', 3),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', 4),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', 5),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', 6),
    (N'Embedded & Digital SW', N'Validation & QA', 7),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', 8),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', 9)
) AS v(PRACTICE_NAME, PHASE_NAME, SORT_ORDER)
JOIN AIMI_PRACTICE p ON p.NAME = v.PRACTICE_NAME;

INSERT INTO AIMI_QUESTIONNAIRE_ACTIVITY (SDLC_PHASE_ID, ACTIVITY, SORT_ORDER)
SELECT sp.ID, v.ACTIVITY, v.SORT_ORDER
FROM (VALUES
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for Requirements Elicitation Analysis (eg., summarizing user stories, identifying gaps)', 1),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for Design Generation/ Validation (suggesting architecture patterns, UI/ UX elements)', 2),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for Data Modelling/ Database Design Assistance', 3),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI used for API Design/ Specification Generation', 4),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for predict feasibility or risks during requirement analysis', 5),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI used for user story creation from BRD', 6),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI used for BRD creation', 7),
    (N'Digital Product Engineering', N'Development', N'AI Used for Code Generation (eg., generating boilerplate, functions, classes)', 1),
    (N'Digital Product Engineering', N'Development', N'AI Used to generate Boilerplate code just by uploading Figma (UX) designs', 2),
    (N'Digital Product Engineering', N'Development', N'AI Used for Code Refactoring/ Optimization Suggestions', 3),
    (N'Digital Product Engineering', N'Development', N'AI Used for Static Code Analysis/ Bug Detection  (AI-powered tools)', 4),
    (N'Digital Product Engineering', N'Development', N'AI Used for Code Review Assistance (eg., identifying patterns, suggesting improvements)', 5),
    (N'Digital Product Engineering', N'Development', N'AI Used for Documentation Generation from Code (e.g., code docs, project reports, meeting notes)', 6),
    (N'Digital Product Engineering', N'Development', N'AI Used for Unit test case generation and code coverage', 7),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Test Case Generation (e.g., from requirements, code)', 1),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Automated Test Script Generation', 2),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Test Data Generation', 3),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Automated UI/ API Testing with AI-Powered tools', 4),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Performance Testing Analysis/ Optimization Suggestions', 5),
    (N'Digital Product Engineering', N'Testing & QA', N'AI used for performance load test data generation', 6),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Defect Prediction/ Root cause Analysis', 7),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Test Coverage Analysis Optimization', 8),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Automated Deployment Pipelines/ CI/ CD Enhancement', 1),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Infrastructure as Code (IaC) Generation/ Validation', 2),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Monitoring & Alerting (eg., anomoly detection, predictive maintenance)', 3),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Log Analysis/ Insights Generation', 4),
    (N'Digital Product Engineering', N'UX', N'AI used for user research phase', 1),
    (N'Digital Product Engineering', N'UX', N'AI used for visual design phase', 2),
    (N'Digital Product Engineering', N'UX', N'AI used for wireframing', 3),
    (N'Network Monitoring', N'Core Activities', N'Are bandwidth utilization patterns analyzed with AI for optimization?', 1),
    (N'Network Monitoring', N'Core Activities', N'Are AI/ML models used to detect traffic anomalies or unusual routing paths?', 2),
    (N'Network Monitoring', N'Core Activities', N'Are routing/switching loops or drops flagged by AI-based flow analysis?', 3),
    (N'Network Monitoring', N'Core Activities', N'Is AI used to detect rogue devices or unauthorized access patterns?', 4),
    (N'Network Monitoring', N'Core Activities', N'Is GenAI used to generate or validate firewall/ACL rules?', 5),
    (N'Network Monitoring', N'Core Activities', N'Are Wi-Fi heatmaps or signal issues predicted using AI analytics?', 6),
    (N'Network Monitoring', N'Core Activities', N'Are network topology diagrams auto generated or validated with GenAI?', 7),
    (N'Network Monitoring', N'Event Management', N'Are link failures or packet drops predicted using AI?', 1),
    (N'Network Monitoring', N'Incident Management', N'Are network incident alerts prioritized using AI scoring?', 1),
    (N'Network Monitoring', N'Incident Management', N'Is GenAI used to recommend router/switch config fixes?', 2),
    (N'Network Monitoring', N'Problem Management', N'Are high-churn network issues flagged by pattern detection?', 1),
    (N'Network Monitoring', N'Change Management', N'Are network config changes analyzed for conflict/risk using AI?', 1),
    (N'Network Monitoring', N'Request Fulfillment', N'Are port/VLAN/DNS changes routed and validated via AI?', 1),
    (N'Network Monitoring', N'Configuration Management', N'Are rogue config changes or drifts detected using AI?', 1),
    (N'Network Monitoring', N'Release Management', N'Are firmware updates evaluated post-deployment by AI tools?', 1),
    (N'Network Monitoring', N'Asset Management', N'Is device end-of-life projected by AI models?', 1),
    (N'Infrastructure Support', N'Core Activities', N'Are system logs analyzed using AI to predict performance degradation or failures?', 1),
    (N'Infrastructure Support', N'Core Activities', N'Does AI recommend VM/server resizing based on resource utilization trends?', 2),
    (N'Infrastructure Support', N'Core Activities', N'Is GenAI leveraged to generate automation scripts (e.g., PowerShell, Bash, SQL, Infrastructure as Code templates like Terraform/CloudFormation) for various operational tasks?', 3),
    (N'Infrastructure Support', N'Core Activities', N'Does AI enable autonomous actions such as automated patch deployment, configuration drift auto-remediation, or condition-based reboots/updates?', 4),
    (N'Infrastructure Support', N'Core Activities', N'Is thermal or power efficiency monitored and tuned using AI?', 5),
    (N'Infrastructure Support', N'Core Activities', N'Are long-running queries automatically detected and optimized using AI?', 6),
    (N'Infrastructure Support', N'Core Activities', N'Is AI used to suggest indexing strategies based on query patterns?', 7),
    (N'Infrastructure Support', N'Core Activities', N'Are DB growth and storage trends predicted using AI models?', 8),
    (N'Infrastructure Support', N'Core Activities', N'Are backup integrity tests for databases triggered using AI-defined risk zones?', 9),
    (N'Infrastructure Support', N'Core Activities', N'Are replication lag or sync issues auto-analyzed and resolved using AI?', 10),
    (N'Infrastructure Support', N'Core Activities', N'Is AI/ML extensively used for anomaly detection and predictive analytics across system, network, database, and storage performance metrics (e.g., CPU, memory, IOPS, latency, log patterns, sensor inputs)?', 11),
    (N'Infrastructure Support', N'Core Activities', N'Are alerts generated, correlated, and prioritized using AI (e.g., based on impact, risk scores, or dynamic baselines)?', 12),
    (N'Infrastructure Support', N'Core Activities', N'Is the incident triage process automated, including AI-assisted severity prediction and escalation decisions?', 13),
    (N'Infrastructure Support', N'Core Activities', N'Are hardware failures predicted using AI-based sensor inputs (CPU temp, PSU, fan)?', 14),
    (N'Infrastructure Support', N'Core Activities', N'Are AI recommendations reviewed by humans operators before action?', 15),
    (N'Infrastructure Support', N'Core Activities', N'Are AI-powered runbooks or autonomous systems used to resolve known issues with minimal or no human intervention?', 16),
    (N'Infrastructure Support', N'Core Activities', N'Is GenAI used to generate various operational documentation, including shift handover notes, RCA reports, backup configurations, release notes, or system documentation?', 17),
    (N'Infrastructure Support', N'Core Activities', N'Is AI assist used in root cause analysis of incidents?', 18),
    (N'Infrastructure Support', N'Core Activities', N'Are dashboards auto-built or refined using GenAI prompts?', 19),
    (N'Infrastructure Support', N'Core Activities', N'Are AI insights and feedback from past incidents used to continuously improve operational KPIs (e.g., MTTR, alert fatigue) and future outcomes?', 20),
    (N'Infrastructure Support', N'Core Activities', N'Are AI-driven reports and GenAI summaries used for compliance, trend analysis, threat intelligence, and capacity/resource utilization reporting?', 21),
    (N'Infrastructure Support', N'Core Activities', N'Is storage capacity forecasting done using AI-based growth models?', 22),
    (N'Infrastructure Support', N'Core Activities', N'Are hot/cold data movements or tiering decisions made by AI?', 23),
    (N'Infrastructure Support', N'Core Activities', N'Is disk health analyzed with predictive failure AI tools (e.g., SMART analysis)?', 24),
    (N'Infrastructure Support', N'Core Activities', N'Are deduplication or compression strategies enhanced by AI recommendations?', 25),
    (N'Infrastructure Support', N'Core Activities', N'Are abnormal IOPS or throughput patterns flagged and explained by GenAI?', 26),
    (N'Infrastructure Support', N'Core Activities', N'Is backup job success/failure pattern analyzed using AI?', 27),
    (N'Infrastructure Support', N'Core Activities', N'Are missed or partial backups auto-retried based on AI-defined logic?', 28),
    (N'Infrastructure Support', N'Core Activities', N'Are restore tests automatically scheduled based on AI scoring of critical assets?', 29),
    (N'Infrastructure Support', N'Core Activities', N'Is AI used to optimize backup schedules during off-peak windows?', 30),
    (N'Infrastructure Support', N'Core Activities', N'Are corrupted or failed media automatically flagged and isolated by AI?', 31),
    (N'Infrastructure Support', N'Core Activities', N'Does AI identify and recommend/auto-rightsize underutilized or redundant resources (compute, memory, storage, DB instances) for cost optimization?', 32),
    (N'Infrastructure Support', N'Core Activities', N'Are GenAI tools used to generate tagging and strategies and naming conventions?', 33),
    (N'Infrastructure Support', N'Core Activities', N'Are cost spikes detected using AI models that baseline normal usage?', 34),
    (N'Infrastructure Support', N'Core Activities', N'Are multi-cloud traffic patterns analyzed using ML for optimization?', 35),
    (N'Infrastructure Support', N'Event Management', N'Does AI perform real-time correlation and deduplication of alerts, logs, and events across various sources (e.g., servers, databases, networks, SIEM, NMS)?', 1),
    (N'Infrastructure Support', N'Event Management', N'Is GenAI used to summarize abnormal behavior or critical events (e.g., performance issues, cost spikes, downtimes) into concise alerts?', 2),
    (N'Infrastructure Support', N'Event Management', N'Does AI detect and auto-suppress repetitive alerts (e.g., for backup failures or other anomalies)?', 3),
    (N'Infrastructure Support', N'Incident Management', N'Are incidents (across server, DB, storage, cloud, backup) automatically categorized, classified, and triaged using AI?', 1),
    (N'Infrastructure Support', N'Incident Management', N'Does GenAI provide suggested resolution steps or remediation actions for various incident types (e.g., server errors, SQL tuning, storage issues, backup failures, cloud resource fixes)?', 2),
    (N'Infrastructure Support', N'Incident Management', N'Are repetitive incident patterns or recurring issues flagged using ML for deeper problem analysis?', 3),
    (N'Infrastructure Support', N'Incident Management', N'Is impact analysis of outages (across all domains) assisted by AI?', 4),
    (N'Infrastructure Support', N'Problem Management', N'Are RCA reports for server failures auto-drafted using GenAI?', 1),
    (N'Infrastructure Support', N'Problem Management', N'Does AI/ML detect, cluster, and flag chronic or repeating issues (e.g., hardware faults, OS-level problems, DB slowdowns, storage issues, backup errors, cross-region problems) for root cause analysis?', 2),
    (N'Infrastructure Support', N'Problem Management', N'Is a knowledge base (KB) for known errors and resolutions enhanced or curated using AI?', 3),
    (N'Infrastructure Support', N'Change Management', N'Is AI used to assess the impact and risk of proposed changes (e.g., patches, reboots, schema changes, configuration updates, storage modifications, backup policy changes, IaC deployments)?', 1),
    (N'Infrastructure Support', N'Change Management', N'Does GenAI assist with rollback planning and recommend test plans based on historical change outcomes?', 2),
    (N'Infrastructure Support', N'Change Management', N'Does AI detect unauthorized changes and validate proposed changes against historical incident data?', 3),
    (N'Infrastructure Support', N'Request Fulfillment', N'Are various service requests (e.g., access, configuration, provisioning, expansion, backup, restore) automatically routed and processed via AI workflows?', 1),
    (N'Infrastructure Support', N'Request Fulfillment', N'Is GenAI used to generate provisioning scripts?', 2),
    (N'Infrastructure Support', N'Request Fulfillment', N'Are approval processes for requests triggered or recommended based on AI policies, and are fulfillment/escalation workflows managed by AI?', 3),
    (N'Infrastructure Support', N'Request Fulfillment', N'Does GenAI generate scripts for provisioning test databases?', 4),
    (N'Infrastructure Support', N'Configuration Management', N'Does AI validate CMDB entries, detect missing/outdated configuration items, and identify inconsistencies or misconfigurations across servers, databases, storage, and cloud environments?', 1),
    (N'Infrastructure Support', N'Configuration Management', N'Does GenAI assist in visualizing dependencies and enriching CMDB mappings (e.g., for servers, storage infrastructure)?', 2),
    (N'Infrastructure Support', N'Configuration Management', N'Are DB version upgrades validated for compatibility using ML?', 3),
    (N'Infrastructure Support', N'Release Management', N'Are releases and deployments (e.g., servers, databases, firmware, backup agents) validated and benchmarked post-release using AI-based success metrics?', 1),
    (N'Infrastructure Support', N'Release Management', N'Are rollback triggers auto-detected using AI behavior analysis?', 2),
    (N'Infrastructure Support', N'Release Management', N'Is GenAI used to draft release plans (e.g., DB upgrades, patches) and generate documentation for CI/CD releases?', 3),
    (N'Infrastructure Support', N'Asset Management', N'Does AI predict hardware failures, manage asset lifecycle, and forecast replacement/depreciation needs?', 1),
    (N'Infrastructure Support', N'Asset Management', N'Does AI optimize resource utilization, identify unused resources, and suggest optimizations for licensing (e.g., DB) and cloud spend?', 2),
    (N'Infrastructure Support', N'Asset Management', N'Is backup media lifecycle predicted or optimized using AI?', 3),
    (N'Infrastructure Support', N'Asset Management', N'Is cloud spend optimized using AI-based usage analysis?', 4),
    (N'Security', N'Core Activities', N'Are threat behaviors (e.g., lateral movement, beaconing) detected using ML?', 1),
    (N'Security', N'Core Activities', N'Are false positives/negatives from alerts reviewed and auto-suppressed based on AI feedback?', 2),
    (N'Security', N'Core Activities', N'Is Gen-AI or ML-based tools are used to write or tune detection queries (e.g. for EDR, SIEM, firewall logs)?', 3),
    (N'Security', N'Core Activities', N'Is Gen-AI feature enabled in EDR, SIEM solutions?', 4),
    (N'Security', N'Core Activities', N'Are IOC enrichments and correlation handled using AI models/tools for clustering and analyzing security events or IOC patterns?', 5),
    (N'Security', N'Core Activities', N'Is AI used for threat detection (e.g. malware behaviour, phishing detection)?', 6),
    (N'Security', N'Core Activities', N'Are phishing or spam patterns clustered and blocked by AI?', 7),
    (N'Security', N'Core Activities', N'Is AI used for threat intelligence agreegatuon (Pull data from sources: CISA KEV, NVD, RSS feeds, Twitter (X), MISP) , summarize with LLM and update to respective stakholders to reduce zero day atatck?', 8),
    (N'Security', N'Event Management', N'Are threat events correlated using ML-based threat intelligence?', 1),
    (N'Security', N'Event Management', N'Are anomalies in security logs detected by AI?', 2),
    (N'Security', N'Event Management', N'Is AI used for removing the false positive events?', 3),
    (N'Security', N'Event Management', N'Is AI used to classify the alert, tag the priority and execute the response action after detection?', 4),
    (N'Security', N'Event Management', N'Is AI configured to react to suspicious login behavior (e.g., geo anomalies, impossible travel) by automatic locking the account or Open the ticket?', 5),
    (N'Security', N'Event Management', N'Is AI used to automatically execute response actions automatically after detection. e.g. Isolate host using EDR API (e.g., CrowdStrike, SentinelOne), Block IP via firewall API (e.g., Palo Alto, FortiGate), Create ticket + notify SOC analyst, Log event in SIEM or Google Sheets', 6),
    (N'Security', N'Event Management', N'Is AI used for Phishing Triage automation like, extract headers, links, attachments,  Analyze with VirusTotal + LLM to determine threat and also quarentine the same', 7),
    (N'Security', N'Incident Management', N'Does AI play a role in scoring the severity or likelihood of a threat?', 1),
    (N'Security', N'Incident Management', N'Are AI-generated threat scores used to prioritize SOC alerts?', 2),
    (N'Security', N'Incident Management', N'Are AI recommendations used to drive SOAR playbook or incident escalations?', 3),
    (N'Security', N'Incident Management', N'Are automated remediation actions triggered by AI (e.g., isolating endpoints)?', 4),
    (N'Security', N'Incident Management', N'Does human-in-the-loop validations exists before executing AI-based security actions?', 5),
    (N'Security', N'Incident Management', N'Are Automated validations done before executing AI-based security actions?', 6),
    (N'Security', N'Incident Management', N'Is GenAI used to create incident reports or analyst summaries?', 7),
    (N'Security', N'Problem Management', N'Are repeated threat types grouped by ML to detect underlying issues?', 1),
    (N'Security', N'Problem Management', N'How can AI help identify recurring incidents that may indicate an underlying problem?', 2),
    (N'Security', N'Problem Management', N'Does AI helps to generate threat intelligence reports or post-incident reviews (PIR)?', 3),
    (N'Security', N'Change Management', N'Are security policy changes analyzed for coverage impact via AI?', 1),
    (N'Security', N'Change Management', N'Is AI used to ensure compliance with regulatory requirements during change management?', 2),
    (N'Security', N'Change Management', N'Is AI used to discover shadow IT where associates access & download the applications without approval?', 3),
    (N'Security', N'Configuration Management', N'Are endpoint or SIEM config gaps flagged using AI?', 1),
    (N'Security', N'Configuration Management', N'Is AI used to detect anomalies in CI attributes (e.g., version mismatches, wrong configurations)?', 2),
    (N'Security', N'Configuration Management', N'Is AI used in managing the version compliance? identifying the outdated versions of Endpoint OS , Network infrastructure and notify to respective stakeholder?', 3),
    (N'Security', N'Configuration Management', N'Is AI used to detect non-compliance in configurations against defined baselines or policies?', 4),
    (N'Security', N'Configuration Management', N'Is AI used to identify the privillaged access provided on endpoints and auto removal post end date?', 5),
    (N'Security', N'Release Management', N'Are patching or AV updates validated using threat reduction metrics?', 1),
    (N'Security', N'Release Management', N'Is AI used in identifying the outdated patches and its reporting to respective stakeholders including top management?', 2),
    (N'Security', N'Asset Management', N'Are endpoint health and compliance evaluated by AI?', 1),
    (N'Security', N'Asset Management', N'Is AI used in automatic discovery of assets with required details such as Asset type, Software version, installed applications and identify the risk related to that?', 2),
    (N'Security', N'Asset Management', N'Is AI used to carry out discovery of all the AI tools and list the same?', 3),
    (N'End-user Computing & Service De', N'Core Activities', N'Are endpoint health metrics (CPU, RAM, disk) monitored with anomaly detection AI?', 1),
    (N'End-user Computing & Service De', N'Core Activities', N'Are patch deployment issues automatically flagged and resolved via AI workflows?', 2),
    (N'End-user Computing & Service De', N'Core Activities', N'Is AI used to detect software licensing violations or blacklisted apps?', 3),
    (N'End-user Computing & Service De', N'Core Activities', N'Is GenAI used to generate local device scripts (e.g., registry tweaks, policy settings)?', 4),
    (N'End-user Computing & Service De', N'Core Activities', N'Are driver or compatibility issues flagged using AI pattern matching?', 5),
    (N'End-user Computing & Service De', N'Core Activities', N'Are failed OS image deployments diagnosed with GenAI-generated logs?', 6),
    (N'End-user Computing & Service De', N'Core Activities', N'Are support tool (e.g., ITSM platform) configurations analyzed by AI for inefficiencies?', 7),
    (N'End-user Computing & Service De', N'Core Activities', N'Is AI used to identify unused or duplicate service catalog items?', 8),
    (N'End-user Computing & Service De', N'Core Activities', N'Is GenAI used to generate knowledge base articles from historical ticket data?', 9),
    (N'End-user Computing & Service De', N'Core Activities', N'Are SLA violations predicted using AI volume/priority models?', 10),
    (N'End-user Computing & Service De', N'Core Activities', N'Are escalation paths optimized using AI recommendations?', 11),
    (N'End-user Computing & Service De', N'Core Activities', N'Are Wi-Fi heatmaps or signal issues predicted using AI analytics?', 12),
    (N'End-user Computing & Service De', N'Core Activities', N'Are network topology diagrams auto-generated or validated with GenAI?', 13),
    (N'End-user Computing & Service De', N'Event Management', N'Are endpoint events filtered or clustered by AI?', 1),
    (N'End-user Computing & Service De', N'Event Management', N'Are AI bots summarizing repeated issues from event trends?', 2),
    (N'End-user Computing & Service De', N'Incident Management', N'Are end-user tickets triaged and assigned using AI?', 1),
    (N'End-user Computing & Service De', N'Incident Management', N'Is GenAI used in L1 virtual assistants (chatbots) to resolve issues?', 2),
    (N'End-user Computing & Service De', N'Incident Management', N'Are chatbots or GenAI used for incident resolution at L0/L1?', 3),
    (N'End-user Computing & Service De', N'Incident Management', N'Is sentiment analysis used to prioritize user-reported issues?', 4),
    (N'End-user Computing & Service De', N'Problem Management', N'Are high-volume user issues flagged by ML pattern detection?', 1),
    (N'End-user Computing & Service De', N'Problem Management', N'Are major recurring themes auto-detected from incidents?', 2),
    (N'End-user Computing & Service De', N'Change Management', N'Are changes to end-user policies assessed for impact using AI?', 1),
    (N'End-user Computing & Service De', N'Change Management', N'Are service desk changes to workflows assessed using AI?', 2),
    (N'End-user Computing & Service De', N'Request Fulfillment', N'Are software install or access requests fulfilled via AI workflows?', 1),
    (N'End-user Computing & Service De', N'Request Fulfillment', N'Are catalog requests fulfilled or auto-approved via AI?', 2),
    (N'End-user Computing & Service De', N'Configuration Management', N'Are endpoint configurations validated for compliance by AI?', 1),
    (N'End-user Computing & Service De', N'Configuration Management', N'Are CMDB updates suggested from service desk interactions?', 2),
    (N'End-user Computing & Service De', N'Release Management', N'Are OS/software updates assessed for success rates via AI?', 1),
    (N'End-user Computing & Service De', N'Release Management', N'Are release notes or knowledge base articles generated by GenAI?', 2),
    (N'End-user Computing & Service De', N'Asset Management', N'Is hardware refresh need predicted using AI?', 1),
    (N'End-user Computing & Service De', N'Asset Management', N'Are device health reports summarized by GenAI?', 2),
    (N'End-user Computing & Service De', N'Asset Management', N'Are lost/retired assets flagged by AI via service desk logs?', 3),
    (N'Data & Analytics', N'Requirements & Discovery Phase', N'AI used for Data Discovery , eg (existing excel File Summary , Databases , Transactional & legacy System DB , other Enterprises Application data availability )', 1),
    (N'Data & Analytics', N'Requirements & Discovery Phase', N'AI Used for Design Generation/ Validation, Major System integrations diagrams', 2),
    (N'Data & Analytics', N'Requirements & Discovery Phase', N'AI Used for Data Classifications, Schema Diagram, data Profiling,   Data Architecture  Solution , Schema drift (tools,  flow charts)', 3),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', N'Are AI-driven tools used for data Source Connection, Scheme evolvement / enrichments', 1),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', N'Is AI used for automated data labelling or annotation, Source & Target Data rules / schema validations', 2),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', N'AI Used for Data Quality Monitoring or Anomaly Detection in Datasets', 3),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for Code Generation or writing Flow or code notebooks / ETL packages (eg., generating boilerplate, functions, Notebooks, Scripts, ETL flow)', 1),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for Code Completion/ Suggestion/ Static Code Analysis / third party tool enforcement / Any external Code Generator or Refiner (beyond standard IDE features)', 2),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for Code Refactoring/ Optimization / Performance tuning features', 3),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI used for Creating reports , Visualization, Dashboard or any data modelling', 4),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for new data addition , Changes , Export data from Datasets tracking & audits log creations', 5),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'Any AI tool for Data Governance Policy setup / enforcements', 6),
    (N'Data & Analytics', N'Testing & Documentations', N'AI Used for Test Case Generation / Automation (e.g., from requirements, code)', 1),
    (N'Data & Analytics', N'Testing & Documentations', N'AI Used for Test Data Generation for flows, Scripts , notebooks, Packages', 2),
    (N'Data & Analytics', N'Testing & Documentations', N'AI Used for Performance & Data Quality  Testing Analysis', 3),
    (N'Data & Analytics', N'Testing & Documentations', N'AI used to create Data Dictionary document creations (Database , lake house object description & use) or AI Used for Documentation Generation from Code (e.g., code docs,)', 4),
    (N'Data & Analytics', N'Alerts & Notifications', N'Is Any AI Used for Alerts or Notification for Job runs / schedulers , Monitor Tools , Report Delivery , Job orchestration tools', 1),
    (N'Data & Analytics', N'Alerts & Notifications', N'Is any automation for cycle of data ingestions & quality check with Runbooks  with RCA  (for high level issue resolutions)', 2),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI Used for Automated Deployment Pipelines/ CI/ CD Enhancement', 1),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI Used for Infrastructure cost management / any tools for monitoring it / Cost Optimization tools', 2),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI used for Auto tuning of data pipeline, Jobs wrt execution of jobs /pipelines over the period of time', 3),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI Used for Log Analysis/ Log generations/ Insights Generation', 4),
    (N'Data & Analytics', N'Governance, Risk & Compliance (GRC)', N'Are AI tools used for compliance checks or automated governance audits  or access Policy (eg., security, data privacy)?', 1),
    (N'Semi', N'Requirements & Specifications', N'AI Used for Technical proposal generation', 1),
    (N'Semi', N'Requirements & Specifications', N'AI Used for Requirements specifications refinement', 2),
    (N'Semi', N'Requirements & Specifications', N'AI Used for Architecture specification document generation', 3),
    (N'Semi', N'Requirements & Specifications', N'AI Used for predict feasibility or risks during requirement analysis', 4),
    (N'Semi', N'Design & Verification', N'AI used for MircoArch specification document generation', 1),
    (N'Semi', N'Design & Verification', N'AI used for RTL generation', 2),
    (N'Semi', N'Design & Verification', N'AI used for RTL QC checks', 3),
    (N'Semi', N'Design & Verification', N'AI used for Constraints (SDC) generation', 4),
    (N'Semi', N'Design & Verification', N'AI used for Verfication plan document generation', 5),
    (N'Semi', N'Design & Verification', N'AI used for test plan document generation', 6),
    (N'Semi', N'Design & Verification', N'AI used for verification TestBench generation', 7),
    (N'Semi', N'Design & Verification', N'AI used for test case and assertions generation', 8),
    (N'Semi', N'Design & Verification', N'AI used for Coverage closure (functional, toggle, code, etc)', 9),
    (N'Semi', N'Design & Verification', N'AI used for functional test case regressions', 10),
    (N'Semi', N'Design & Verification', N'AI used for Formal verification', 11),
    (N'Semi', N'Design & Verification', N'AI used for Simulation debug', 12),
    (N'Semi', N'Design & Verification', N'AI used for GLS setup and GLS regressions', 13),
    (N'Semi', N'Design & Verification', N'AI used for FUSA analysis and fault injection simulations', 14),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT Microarchitecture specification generation', 1),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT script generation and flow setup', 2),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI used for DFT insertion in RTL/ netlist', 3),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT pattern simulations and debug', 4),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT Coverage analysis', 5),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT pattern optimization', 6),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for IO planning, floor planning and Power planning', 7),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for PD script generation and flow setup', 8),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for Synthesis and LEC closure', 9),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for PnR iterations and closure', 10),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for STA iterations and closure', 11),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for EMIR analysis and closure', 12),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for SV/DRC closure', 13),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for power analysis and power domain implementation', 14),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA requirements analysis and part selection', 1),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA implementation specifications', 2),
    (N'Semi', N'FPGA and Emulation', N'AI used for RTL code generation or RTL porting to FPGA', 3),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA simulations debug', 4),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA implementation and timing closure', 5),
    (N'Semi', N'FPGA and Emulation', N'AI used for design porting for emulation', 6),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA/emulation waveform debug', 7),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used for technical proposal generation (RFP responses, scope documents)', 1),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used for requirements elicitation, summarisation, gap analysis from SRS / BRD / user stories', 2),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used for requirements specification refinement and traceability baseline creation', 3),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used to predict feasibility or risks during requirement analysis', 4),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for embedded architecture option generation and HW/SW partitioning trade-off analysis', 1),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for interface / API / protocol specification generation (REST, DDS, SOME/IP, CAN, MQTT)', 2),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for BSP, Yocto/Buildroot, bootloader, device-tree and board bring-up planning', 3),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for safety / security pre-analysis (HARA, FMEA, FTA, TARA, threat model, compliance checks)', 4),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for UX journeys, wireframes, or product workflow design for digital companion applications', 5),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for AI/ML model selection, accelerator targeting, or graph-level optimisation planning (TVM, MLIR)', 6),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for Linux kernel, device driver, HAL, SDK, or firmware code generation / refactoring', 1),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for RTOS / bare-metal task, peripheral, interrupt, DMA, or protocol stack implementation', 2),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for AUTOSAR Configuration (BSW, RTE, MCAL config files)', 3),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for bootloader / U-Boot / secure-boot configuration generation', 4),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for middleware / connectivity implementation (AUTOSAR, DDS, SOME/IP, CAN/LIN/Ethernet)', 5),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for DSP / NPU / GPU / CDU optimisation, profiling insight, vectorisation, MCPS / memory optimisation', 6),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for AI model porting & quantisation (ONNX ↔ target accelerator, INT8 / FP16, TFLite / TensorRT / OpenVINO)', 7),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for custom operator / kernel implementation (DSP intrinsics, GPU kernels, NPU operators)', 8),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for static code analysis, bug detection, MISRA / CERT-C compliance fixes, secure coding review', 9),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for code review assistance (PR summarisation, anti-pattern detection)', 10),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for code documentation, API documentation, design notes, release notes, meeting summaries', 11),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for test plan generation from spec / SOW / SRS', 1),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for test case generation from RTL / specification / coverage gaps', 2),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for waveform / log analysis and failure clustering', 3),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for coverage gap identification and stimulus generation (UVM, SystemVerilog assertions)', 4),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for regression triage, defect clustering, and root-cause analysis', 5),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for FPGA / emulator setup automation and platform bring-up scripts', 6),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for frontend / backend scaffolding, API implementation, microservices, database design', 1),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for cloud infrastructure, containerisation, Kubernetes, Terraform, or DevOps configuration generation', 2),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for edge-to-cloud telemetry, data pipeline, OTA backend, or dashboard implementation', 3),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for mobile / web companion application testing, accessibility, or localisation support', 4),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used to embed GenAI / Agentic AI features into delivered customer products (LLM agents, copilots, RAG)', 5),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for computer vision / perception model selection, prototyping, or model evaluation', 1),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for synthetic data generation, annotation assistance, or dataset quality analysis', 2),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for model conversion, quantisation, pruning, ONNX/TFLite/TensorRT/OpenVINO deployment', 3),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for MLOps, model monitoring, experiment tracking, or deployment pipeline automation', 4),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for AI model accuracy / latency / power benchmarking on target hardware', 5),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for test case generation from requirements, architecture, code, or defect history', 1),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for unit-test generation, mocks/stubs, coverage improvement, or test data creation', 2),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for SIL / MIL / HIL test generation or automation framework enhancement', 3),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for ADAS / Perception scenario generation for SIL/HIL testing', 4),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for CANoe / CAPL, VectorCAST, GoogleTest, pytest, or hardware bench automation support', 5),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for safety-grade coverage validation (MC/DC, statement, branch) and gap closure', 6),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for fault injection / robustness test scenario generation', 7),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for fuzz testing / penetration testing automation', 8),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for defect prediction, defect triage, root-cause analysis, log/trace correlation', 9),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for performance, load, stress, power, memory, or latency analysis and optimisation', 10),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for ISO 26262 safety work products, ASIL traceability, safety case, audit evidence', 1),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for IEC 61508 / IEC 60730 / IEC 60601 (functional safety, household, medical) work products', 2),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for ISO 21434 / EU CRA cybersecurity work products, TARA, threat model, vulnerability assessment', 3),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for SBOM (Software Bill of Materials) generation and vulnerability scanning', 4),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for MISRA / CERT-C compliance reporting and traceability', 5),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for secure boot, OTA crypto / key-management, HSM, TLS, or secure communication review', 6),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for requirements-to-test traceability, compliance matrix, and review checklist automation', 7),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for CI/CD pipeline generation, build failure analysis, or deployment script / config generation', 1),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for OTA update package generation, rollout planning, rollback analysis, telemetry validation', 2),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for automated release notes, change impact analysis, delivery risk reporting', 3),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for production log analysis, anomaly detection, predictive maintenance, incident triage', 4),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for field telemetry analysis (vehicle / industrial / IoT fleet data)', 5)
) AS v(PRACTICE_NAME, PHASE_NAME, ACTIVITY, SORT_ORDER)
JOIN AIMI_PRACTICE p ON p.NAME = v.PRACTICE_NAME
JOIN AIMI_SDLC_PHASE sp ON sp.PRACTICE_ID = p.ID AND sp.NAME = v.PHASE_NAME;

END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_QUALITATIVE_BENEFIT - from activityTypes.ts QUALITATIVE_BENEFITS (alphabetical order,
-- matching the .sort() the client applies before rendering)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_QUALITATIVE_BENEFIT)
BEGIN
INSERT INTO AIMI_QUALITATIVE_BENEFIT (NAME, SORT_ORDER) VALUES
    (N'Better Compliance', 1),
    (N'Better Resource Utilization', 2),
    (N'Enhanced Customer Experience', 3),
    (N'Enhanced Scalability', 4),
    (N'Faster Delivery', 5),
    (N'Faster Time to Market', 6),
    (N'Improved Accuracy', 7),
    (N'Improved Collaboration', 8),
    (N'Improved Decision-Making', 9),
    (N'Improved Monitoring and Reporting', 10),
    (N'Improved Quality', 11),
    (N'Improved Risk Management', 12),
    (N'Increased Efficiency', 13),
    (N'Reduced Cost', 14),
    (N'Reduced Manual Effort', 15);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_ADOPTION_SCORE - from activityTypes.ts AI_ADOPTION_SCORES + scoreColorUtils.ts
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_AI_ADOPTION_SCORE)
BEGIN
INSERT INTO AIMI_AI_ADOPTION_SCORE (SCORE, LABEL, DESCRIPTION, COLOR_HEX) VALUES
    (0, N'No AI Adopted', N'No AI tools or techniques are being used. Traditional manual processes are in place.', '#dc3545'),
    (1, N'Basic Awareness', N'The team is aware of AI capabilities, but no implementation has occurred. Planning or research phase.', '#fd7e14'),
    (2, N'Initial Implementation', N'Basic AI tools are used occasionally. Limited integration with existing processes.', '#ffc107'),
    (3, N'Partial Adoption', N'AI tools are regularly used and integrated into some workflows. Clear benefits are observed.', '#20c997'),
    (4, N'Full Adoption', N'AI is deeply integrated into most processes. Significant efficiency gains and innovation.', '#198754'),
    (5, N'Optimized/Automated', N'Cutting-edge AI implementation. Industry-leading practices and maximum automation.', '#6f42c1');
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_APPLICABILITY - from activityTypes.ts APPLICABILITY_OPTIONS. 'NA' is included because
-- AddActivityModal.tsx sets applicability = 'NA' programmatically for phase-level NA activities,
-- even though it isn't one of the 4 options the dropdown itself offers.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_APPLICABILITY)
BEGIN
INSERT INTO AIMI_APPLICABILITY (CODE, LABEL, SORT_ORDER) VALUES
    (N'Yes', N'Yes', 1),
    (N'No', N'No', 2),
    (N'Activity NA', N'Activity NA', 3),
    (N'Customer NA', N'Customer NA', 4),
    (N'NA', N'NA', 5);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_BENEFIT_TO - from activityTypes.ts BENEFIT_TO_OPTIONS
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_BENEFIT_TO)
BEGIN
INSERT INTO AIMI_BENEFIT_TO (CODE, LABEL, SORT_ORDER) VALUES
    (N'Neurealm', N'Neurealm', 1),
    (N'Customer', N'Customer', 2),
    (N'Both', N'Both', 3);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_LICENSE_PROVIDER - from the inline 'Client'/'Neurealm' literals in
-- ProjectInfoSelection.tsx (no named constant exists client-side for this one today)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_LICENSE_PROVIDER)
BEGIN
INSERT INTO AIMI_LICENSE_PROVIDER (CODE, LABEL, SORT_ORDER) VALUES
    (N'Client', N'Client', 1),
    (N'Neurealm', N'Neurealm', 2);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_STATUS - from activityTypes.ts ActivityStatus union type. Only 'draft' and
-- 'submitted' are persisted today; no approved/rejected workflow exists yet.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_ACTIVITY_STATUS)
BEGIN
INSERT INTO AIMI_ACTIVITY_STATUS (CODE, LABEL, SORT_ORDER) VALUES
    (N'draft', N'Draft', 1),
    (N'submitted', N'Submitted', 2);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_TOOL - from activityTypes.ts COMMON_AI_TOOLS (127 unique entries, alphabetical to match
-- the client's .sort()). This is a generic "popular software tools" list carried over verbatim
-- from the source, not curated for AI-relevance - review/prune before relying on it for reporting.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_AI_TOOL)
BEGIN
INSERT INTO AIMI_AI_TOOL (NAME) VALUES
    (N'Ableton Live'),
    (N'Adobe Audition'),
    (N'Adobe Creative Suite'),
    (N'Airtable'),
    (N'Alteryx'),
    (N'Ansible'),
    (N'Anthropic Claude'),
    (N'Apache Airflow'),
    (N'Apache Kafka'),
    (N'Apache Spark'),
    (N'AppDynamics'),
    (N'Asana'),
    (N'Audacity'),
    (N'AWS Bedrock'),
    (N'AWS CodePipeline'),
    (N'Azure DevOps'),
    (N'Azure OpenAI'),
    (N'Bard'),
    (N'Beautiful.ai'),
    (N'Bitwig Studio'),
    (N'Burp Suite'),
    (N'Canva'),
    (N'ChatGPT'),
    (N'Checkmarx'),
    (N'CircleCI'),
    (N'Claude'),
    (N'ClickUp'),
    (N'Confluence'),
    (N'Copy.ai'),
    (N'Cubase'),
    (N'DALL-E'),
    (N'Datadog'),
    (N'DataRobot'),
    (N'Descript'),
    (N'Discord'),
    (N'Docker'),
    (N'Draw.io'),
    (N'Dynatrace'),
    (N'ELK Stack'),
    (N'Figma'),
    (N'FL Studio'),
    (N'Fortify'),
    (N'Gamma'),
    (N'GarageBand'),
    (N'GitHub Actions'),
    (N'GitHub Copilot'),
    (N'GitLab CI/CD'),
    (N'Google AI'),
    (N'Google Cloud Build'),
    (N'Google Colab'),
    (N'Google Docs'),
    (N'Google Meet'),
    (N'Google Sheets'),
    (N'Google Slides'),
    (N'Grafana'),
    (N'Grammarly'),
    (N'H2O.ai'),
    (N'Hugging Face'),
    (N'InVideo'),
    (N'Jasper'),
    (N'Jenkins'),
    (N'Jira'),
    (N'Jupyter'),
    (N'Kaggle'),
    (N'KNIME'),
    (N'Kubernetes'),
    (N'Logic Pro'),
    (N'Looker'),
    (N'Lucidchart'),
    (N'Lumen5'),
    (N'Matplotlib'),
    (N'Metabase'),
    (N'Microsoft Excel'),
    (N'Microsoft PowerPoint'),
    (N'Microsoft Teams'),
    (N'Microsoft Word'),
    (N'Midjourney'),
    (N'Miro'),
    (N'Monday.com'),
    (N'Nessus'),
    (N'New Relic'),
    (N'Notion'),
    (N'Notion AI'),
    (N'NumPy'),
    (N'OpenAI API'),
    (N'OpsGenie'),
    (N'Orange'),
    (N'OWASP ZAP'),
    (N'PagerDuty'),
    (N'Pandas'),
    (N'Pictory'),
    (N'Pitch'),
    (N'Plotly'),
    (N'Power BI'),
    (N'Prezi'),
    (N'Pro Tools'),
    (N'Prometheus'),
    (N'PyTorch'),
    (N'Qlik'),
    (N'Qualys'),
    (N'Rapid7'),
    (N'RapidMiner'),
    (N'Reaper'),
    (N'Reason'),
    (N'RunwayML'),
    (N'Scikit-learn'),
    (N'Seaborn'),
    (N'ServiceNow'),
    (N'Slack'),
    (N'Snyk'),
    (N'SonarQube'),
    (N'Splunk'),
    (N'Stable Diffusion'),
    (N'Studio One'),
    (N'Synthesia'),
    (N'Tableau'),
    (N'TensorFlow'),
    (N'Terraform'),
    (N'Tome'),
    (N'Travis CI'),
    (N'Trello'),
    (N'Veracode'),
    (N'VictorOps'),
    (N'Visio'),
    (N'Webex'),
    (N'Weka'),
    (N'Zoom');
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACCELERATOR - from activityTypes.ts COMMON_ACCELERATORS (137 unique entries, alphabetical).
-- Heavily overlaps with AIMI_AI_TOOL (both suggestion lists share most of their tail entries in
-- the source) - review/prune before relying on it for reporting.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_ACCELERATOR)
BEGIN
INSERT INTO AIMI_ACCELERATOR (NAME) VALUES
    (N'Ableton Live'),
    (N'Adobe Audition'),
    (N'Adobe Creative Suite'),
    (N'Airtable'),
    (N'AKS'),
    (N'Ansible'),
    (N'Apache'),
    (N'AppDynamics'),
    (N'ArgoCD'),
    (N'ARM Templates'),
    (N'Asana'),
    (N'Audacity'),
    (N'AWS CodePipeline'),
    (N'AWS KMS'),
    (N'AWS SAM'),
    (N'Azure DevOps'),
    (N'Azure Functions'),
    (N'Azure Key Vault'),
    (N'Bamboo'),
    (N'Beautiful.ai'),
    (N'Bitwig Studio'),
    (N'Burp Suite'),
    (N'Caddy'),
    (N'Canva'),
    (N'Certbot'),
    (N'Checkmarx'),
    (N'Chef'),
    (N'CircleCI'),
    (N'ClickUp'),
    (N'CloudFormation'),
    (N'Confluence'),
    (N'Consul'),
    (N'Cubase'),
    (N'Datadog'),
    (N'Descript'),
    (N'DigitalOcean App Platform'),
    (N'Discord'),
    (N'Docker'),
    (N'Dokku'),
    (N'Draw.io'),
    (N'Dynatrace'),
    (N'EKS'),
    (N'ELK Stack'),
    (N'Envoy'),
    (N'Figma'),
    (N'FL Studio'),
    (N'Flux'),
    (N'Fly.io'),
    (N'Fortify'),
    (N'Gamma'),
    (N'GarageBand'),
    (N'GitHub Actions'),
    (N'GitLab CI/CD'),
    (N'GKE'),
    (N'GoCD'),
    (N'Google Cloud Functions'),
    (N'Google Docs'),
    (N'Google Meet'),
    (N'Google Secret Manager'),
    (N'Google Sheets'),
    (N'Google Slides'),
    (N'Grafana'),
    (N'HAProxy'),
    (N'HashiCorp Vault'),
    (N'Heroku'),
    (N'InVideo'),
    (N'Istio'),
    (N'Jenkins'),
    (N'Jira'),
    (N'K3s'),
    (N'Kind'),
    (N'Kubernetes'),
    (N'Let''s Encrypt'),
    (N'Linkerd'),
    (N'Logic Pro'),
    (N'Lucidchart'),
    (N'Lumen5'),
    (N'MicroK8s'),
    (N'Microsoft Excel'),
    (N'Microsoft PowerPoint'),
    (N'Microsoft Teams'),
    (N'Microsoft Word'),
    (N'Minikube'),
    (N'Miro'),
    (N'Monday.com'),
    (N'Nessus'),
    (N'Netlify'),
    (N'New Relic'),
    (N'Nginx'),
    (N'Notion'),
    (N'OpenShift'),
    (N'OpsGenie'),
    (N'OWASP ZAP'),
    (N'Packer'),
    (N'PagerDuty'),
    (N'Pictory'),
    (N'Pitch'),
    (N'Platform.sh'),
    (N'Prezi'),
    (N'Pro Tools'),
    (N'Prometheus'),
    (N'Pulumi'),
    (N'Puppet'),
    (N'Qualys'),
    (N'Railway'),
    (N'Rancher'),
    (N'Rapid7'),
    (N'Reaper'),
    (N'Reason'),
    (N'Render'),
    (N'RunwayML'),
    (N'Salt'),
    (N'Secrets Manager'),
    (N'Serverless Framework'),
    (N'ServiceNow'),
    (N'Slack'),
    (N'Snyk'),
    (N'SonarQube'),
    (N'Spinnaker'),
    (N'Splunk'),
    (N'Studio One'),
    (N'Synthesia'),
    (N'TeamCity'),
    (N'Tekton'),
    (N'Terraform'),
    (N'Tome'),
    (N'Traefik'),
    (N'Travis CI'),
    (N'Trello'),
    (N'Vagrant'),
    (N'Vault'),
    (N'Veracode'),
    (N'Vercel'),
    (N'VictorOps'),
    (N'Visio'),
    (N'Webex'),
    (N'Zoom');
END
GO

----------------------------------------------------------------------------------------------------
-- Stored procedures that read the lookup tables above (source: 01 StoredProcedure\BAS\usp_AIMI_*.sql)
----------------------------------------------------------------------------------------------------

-- Reads the master Practice list (was hardcoded/derived client-side from
-- questionnaire.json's practices[] array). See AIMI_PRACTICE in
-- Release 2.6.3.sql.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetPractices' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetPractices]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetPractices]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ID, NAME, SORT_ORDER
    FROM AIMI_PRACTICE
    WHERE ISACTIVE = 1
    ORDER BY SORT_ORDER;
END
GO

-- Reads the master SDLC Phase list, scoped per practice (phase names are NOT
-- a global enum - each practice has its own phase vocabulary, see the note in
-- Release 2.6.3.sql). Was hardcoded/derived client-side from
-- questionnaire.json's practices[].sdlcPhases[] array.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetSdlcPhases' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetSdlcPhases]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetSdlcPhases]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sp.ID,
        sp.PRACTICE_ID,
        p.NAME AS PRACTICE_NAME,
        sp.NAME,
        sp.SORT_ORDER
    FROM AIMI_SDLC_PHASE sp
    JOIN AIMI_PRACTICE p ON p.ID = sp.PRACTICE_ID
    WHERE sp.ISACTIVE = 1 AND p.ISACTIVE = 1
    ORDER BY p.SORT_ORDER, sp.SORT_ORDER;
END
GO

-- Reads the master questionnaire Activity catalog per SDLC phase (was
-- hardcoded/derived client-side from questionnaire.json's
-- practices[].sdlcPhases[].activities[] array). Distinct from AIMI_ACTIVITY,
-- which stores the per-project activity log entries a user submits, not the
-- master catalog of possible activities the questionnaire presents.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetQuestionnaireActivities' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetQuestionnaireActivities]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetQuestionnaireActivities]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        qa.ID,
        qa.SDLC_PHASE_ID,
        p.NAME AS PRACTICE_NAME,
        sp.NAME AS SDLC_PHASE_NAME,
        qa.ACTIVITY,
        qa.SORT_ORDER
    FROM AIMI_QUESTIONNAIRE_ACTIVITY qa
    JOIN AIMI_SDLC_PHASE sp ON sp.ID = qa.SDLC_PHASE_ID
    JOIN AIMI_PRACTICE p ON p.ID = sp.PRACTICE_ID
    WHERE qa.ISACTIVE = 1 AND sp.ISACTIVE = 1 AND p.ISACTIVE = 1
    ORDER BY p.SORT_ORDER, sp.SORT_ORDER, qa.SORT_ORDER;
END
GO

-- Reads the master Qualitative Benefit suggestion list (was activityTypes.ts
-- QUALITATIVE_BENEFITS). Distinct from AIMI_ACTIVITY_QUALITATIVE_BENEFIT,
-- which stores which benefits were picked for a given logged activity.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetQualitativeBenefits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefits]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefits]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT NAME, SORT_ORDER
    FROM AIMI_QUALITATIVE_BENEFIT
    WHERE ISACTIVE = 1
    ORDER BY SORT_ORDER;
END
GO

-- Reads the AI Adoption Score scale 0-5 (was activityTypes.ts
-- AI_ADOPTION_SCORES). COLOR_HEX exists on the table for a future move of the
-- client's scoreColorUtils.ts color mapping into data too, but is not
-- currently consumed - display color stays client-side for now.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAiAdoptionScores' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAiAdoptionScores]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAiAdoptionScores]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT SCORE, LABEL, DESCRIPTION, COLOR_HEX
    FROM AIMI_AI_ADOPTION_SCORE
    ORDER BY SCORE;
END
GO

-- Reads the AI Tool autocomplete suggestion list (was activityTypes.ts
-- COMMON_AI_TOOLS). Distinct from AIMI_ACTIVITY_AI_TOOL, the per-activity
-- junction table (which also accepts free-text tools typed in that aren't in
-- this suggestion list).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAiTools' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAiTools]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAiTools]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT NAME
    FROM AIMI_AI_TOOL
    WHERE ISACTIVE = 1
    ORDER BY NAME;
END
GO

-- Reads the Accelerator autocomplete suggestion list (was activityTypes.ts
-- COMMON_ACCELERATORS). Distinct from AIMI_ACTIVITY_ACCELERATOR, the
-- per-activity junction table.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAccelerators' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAccelerators]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAccelerators]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT NAME
    FROM AIMI_ACCELERATOR
    WHERE ISACTIVE = 1
    ORDER BY NAME;
END
GO
