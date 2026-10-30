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
