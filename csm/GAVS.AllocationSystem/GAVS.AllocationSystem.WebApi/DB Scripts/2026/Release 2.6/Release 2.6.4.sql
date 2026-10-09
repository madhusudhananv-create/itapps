-- AIMI Analytics and reports: monthly score history (AIMI_SCORE_HISTORY), the report column config tables,
-- the procs that write and read them, and the trigger that keeps the current month in step with
-- AIMI_ACTIVITY. Run once per environment after Release 2.6.3.sql. Safe to re-run.

-- Monthly score snapshots for the AIMI Analytics dashboard. One row per project + practice per
-- month, written by usp_AIMI_CaptureScoreSnapshot, so trends are read from stored history
-- instead of being recalculated from the live activities (which only ever show "now").
IF NOT EXISTS(SELECT 1 FROM sys.tables WHERE name ='AIMI_SCORE_HISTORY' AND type='U')
BEGIN
CREATE TABLE AIMI_SCORE_HISTORY (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    SNAPSHOT_MONTH DATE NOT NULL,                 -- first day of the month
    PROJECT_ID VARCHAR(20) NOT NULL,
    PROJECT NVARCHAR(200) NOT NULL,
    ACCOUNT NVARCHAR(200) NOT NULL,
    BUSINESS_UNIT VARCHAR(100) NOT NULL,
    PRACTICE VARCHAR(100) NOT NULL,
    CURRENT_SCORE DECIMAL(4,2) NULL,              -- 0-5 ; NULL = nothing scored (all activities N/A)
    ACCEPTED_SCORE DECIMAL(4,2) NULL,             -- admin-reviewed score, NULL = not reviewed
    ACTIVITY_COUNT INT NOT NULL DEFAULT(0),
    SCORED_ACTIVITY_COUNT INT NOT NULL DEFAULT(0),
    CAPTURED_BY VARCHAR(10) NULL,
    CAPTURED_DATE DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT UQ_AIMI_SCORE_HISTORY UNIQUE (SNAPSHOT_MONTH, PROJECT_ID, PRACTICE)
);

CREATE INDEX IX_AIMI_SCORE_HISTORY_MONTH
    ON AIMI_SCORE_HISTORY (SNAPSHOT_MONTH)
    INCLUDE (BUSINESS_UNIT, ACCOUNT, PROJECT, PRACTICE, CURRENT_SCORE, ACCEPTED_SCORE);
END
GO

-- Which columns the AIMI Analytics "Download report" contains, per view, and what each is called.
-- usp_AIMI_GetScoreReport reads this table, so a column can be renamed, hidden or reordered with a
-- plain UPDATE, no code change or deployment. Examples:
--     UPDATE AIMI_SCORE_REPORT_COLUMN SET HEADER = 'Current Score' WHERE FIELD = 'OVERALL_SCORE';
--     UPDATE AIMI_SCORE_REPORT_COLUMN SET IS_ACTIVE = 0 WHERE FIELD = 'AS_OF_MONTH';
--
-- REPORT_LEVEL   BU | ACCOUNT | PROJECT | PRACTICE  (the view the report is downloaded from)
-- FIELD   what to show, one of: GROUP_NAME, BUSINESS_UNIT, ACCOUNT, PROJECT_ID, AS_OF_MONTH,
--         OVERALL_SCORE, ACCEPTED_SCORE, DIFFERENCE, AVERAGE_SCORE
-- HEADER  the column title in the file; {MONTHS} is replaced by the history range (6, 12, 24)
IF NOT EXISTS(SELECT 1 FROM sys.tables WHERE name ='AIMI_SCORE_REPORT_COLUMN' AND type='U')
BEGIN
CREATE TABLE AIMI_SCORE_REPORT_COLUMN (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    REPORT_LEVEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL,
    FIELD VARCHAR(50) NOT NULL,
    HEADER NVARCHAR(100) NOT NULL,
    IS_ACTIVE BIT NOT NULL DEFAULT(1),
    CONSTRAINT UQ_AIMI_SCORE_REPORT_COLUMN UNIQUE (REPORT_LEVEL, FIELD)
);

INSERT INTO AIMI_SCORE_REPORT_COLUMN (REPORT_LEVEL, SORT_ORDER, FIELD, HEADER) VALUES
-- Business Unit view
('BU', 1, 'GROUP_NAME',     'Business Unit'),
('BU', 2, 'AS_OF_MONTH',    'As of'),
('BU', 3, 'OVERALL_SCORE',  'Overall Score'),
('BU', 4, 'ACCEPTED_SCORE', 'Accepted Score'),
('BU', 5, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('BU', 6, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)'),
-- Account view
('ACCOUNT', 1, 'BUSINESS_UNIT',  'Business Unit'),
('ACCOUNT', 2, 'GROUP_NAME',     'Account'),
('ACCOUNT', 3, 'AS_OF_MONTH',    'As of'),
('ACCOUNT', 4, 'OVERALL_SCORE',  'Overall Score'),
('ACCOUNT', 5, 'ACCEPTED_SCORE', 'Accepted Score'),
('ACCOUNT', 6, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('ACCOUNT', 7, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)'),
-- Project view
('PROJECT', 1, 'BUSINESS_UNIT',  'Business Unit'),
('PROJECT', 2, 'ACCOUNT',        'Account'),
('PROJECT', 3, 'PROJECT_ID',     'Project ID'),
('PROJECT', 4, 'GROUP_NAME',     'Project'),
('PROJECT', 5, 'AS_OF_MONTH',    'As of'),
('PROJECT', 6, 'OVERALL_SCORE',  'Overall Score'),
('PROJECT', 7, 'ACCEPTED_SCORE', 'Accepted Score'),
('PROJECT', 8, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('PROJECT', 9, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)'),
-- Practice view
('PRACTICE', 1, 'GROUP_NAME',     'Practice'),
('PRACTICE', 2, 'AS_OF_MONTH',    'As of'),
('PRACTICE', 3, 'OVERALL_SCORE',  'Overall Score'),
('PRACTICE', 4, 'ACCEPTED_SCORE', 'Accepted Score'),
('PRACTICE', 5, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('PRACTICE', 6, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)');
END
GO

-- Which columns the AIMI activity reports contain, what each is called and in what order. Read by
-- usp_AIMI_GetActivityReport, so a column can be renamed, hidden or reordered with a plain UPDATE,
-- no code change or deployment. Examples:
--     UPDATE AIMI_ACTIVITY_REPORT_COLUMN SET HEADER = 'Business Head Name' WHERE FIELD = 'BUSINESS_HEAD';
--     UPDATE AIMI_ACTIVITY_REPORT_COLUMN SET IS_ACTIVE = 0 WHERE REPORT_TYPE = 'MULTI' AND FIELD = 'COMMENTS';
--
-- REPORT_TYPE  PROJECT = Manage Activities > Generate Report (one project + practice)
--              MULTI   = Reports page > Generate Reports (several BUs / accounts / projects)
-- FIELD        one of the fields usp_AIMI_GetActivityReport computes (see the list in that proc)
-- HEADER       the column title in the file
IF NOT EXISTS(SELECT 1 FROM sys.tables WHERE name ='AIMI_ACTIVITY_REPORT_COLUMN' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_REPORT_COLUMN (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    REPORT_TYPE VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL,
    FIELD VARCHAR(60) NOT NULL,
    HEADER NVARCHAR(120) NOT NULL,   -- max 120 so it fits QUOTENAME; avoid dots (they nest the JSON)
    IS_ACTIVE BIT NOT NULL DEFAULT(1),
    CONSTRAINT UQ_AIMI_ACTIVITY_REPORT_COLUMN UNIQUE (REPORT_TYPE, FIELD)
);

-- The default column set (the same headings the reports have always had). 'Client Approved' is not
-- included: the old report printed that heading but never had a value for it, which pushed every
-- column after it one place to the right.
DECLARE @DEFAULTS TABLE (SORT_ORDER INT, FIELD VARCHAR(60), HEADER NVARCHAR(120));
INSERT INTO @DEFAULTS (SORT_ORDER, FIELD, HEADER) VALUES
(1,  'BUSINESS_UNIT',                              'Business Unit'),
(2,  'BUSINESS_HEAD',                              'Business Head'),
(3,  'ACCOUNT',                                    'Account'),
(4,  'ACCOUNT_MANAGER',                            'Account Manager'),
(5,  'PROJECT',                                    'Project'),
(6,  'PROJECT_ID',                                 'Project ID'),
(7,  'MANAGER',                                    'Manager'),
(8,  'HEADCOUNT',                                  'Head Count'),
(9,  'PRACTICE',                                   'Practice'),
(10, 'PEOPLE_USING_AI',                            '# of People Using AI'),
(11, 'LICENSE_COUNT',                              'License Count'),
(12, 'LICENSE_PROVIDER',                           'License Provider'),
(13, 'RUNOPS_AUTO_RESOLVED',                       '% Tickets Auto-Resolved by AI'),
(14, 'RUNOPS_MTTR_REDUCTION',                      'MTTR Reduction vs Traditional Model'),
(15, 'RUNOPS_AI_AGENTS',                           '# AI Agents in Production (Not Pilots)'),
(16, 'RUNOPS_AUTOMATED_WORKFLOWS',                 '# End-to-End Workflows Re-imagined and Automated'),
(17, 'RUNOPS_MTTD',                                '# MTTD (Mean Time to Detect)'),
(18, 'RUNOPS_MTTR',                                '# MTTR (Mean Time to Respond or Repair)'),
(19, 'ENGINEER_DELIVERY_CYCLE_TIME',               'Delivery cycle-time reduction attributable to AI'),
(20, 'ENGINEER_AI_AGENTS',                         '# AI agents in production (not pilots / POC)'),
(21, 'ENGINEER_CONTRACT_TEST_CASE_PASS_RATE',      'Contract Test case Pass Rate (%) (Passed Tests / Total Executed Tests) x 100'),
(22, 'ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE',   'Performance Defects Detected Pre-release (%)'),
(23, 'COMMON_ADOPTION_WORKFORCE_CERTIFICATION',    '% workforce with externally validated AI / GenAI / Agentic AI certification'),
(24, 'COMMON_ADOPTION_EFFORTS_SAVED',              'Efforts saved in hours'),
(25, 'COMMON_DEPLOYMENT_ENGINEER',                 '# FDE ( Forward Deployment Engineer) penetration as % of client-facing headcount'),
(26, 'OVERALL_SCORE',                              'Overall Score'),
(27, 'ACCEPTED_SCORE',                             'Accepted Score'),
(28, 'ACCEPTED_SCORE_COMMENT',                     'Accepted Comment'),
(29, 'SDLC_PHASE',                                 'SDLC Phase'),
(30, 'ACTIVITY',                                   'Activity'),
(31, 'APPLICABILITY',                              'Applicability'),
(32, 'AI_ADOPTION_SCORE',                          'AI Adoption Score'),
(33, 'AI_TOOLS_USED',                              'AI Tools Used'),
(34, 'ACCELERATORS_USED',                          'Accelerators Used'),
(35, 'WORK_DONE_BY_AI',                            'Work Done by AI (%)'),
(36, 'HOURS_SAVED',                                'Hours Saved'),
(37, 'REVENUE_GENERATED',                          'Revenue Generated'),
(38, 'BENEFIT_TO',                                 'Benefit To'),
(39, 'QUALITATIVE_BENEFITS',                       'Qualitative Benefits'),
(40, 'COMMENTS',                                   'Comments'),
(41, 'CREATED_DATE',                               'Created Date'),
(42, 'LAST_UPDATED_DATE',                          'Last Updated Date');

INSERT INTO AIMI_ACTIVITY_REPORT_COLUMN (REPORT_TYPE, SORT_ORDER, FIELD, HEADER)
SELECT t.REPORT_TYPE, d.SORT_ORDER, d.FIELD, d.HEADER
FROM @DEFAULTS d
CROSS JOIN (VALUES ('PROJECT'), ('MULTI')) t (REPORT_TYPE);
END
GO

-- Writes the monthly score snapshot (AIMI_SCORE_HISTORY) from the live AIMI_ACTIVITY rows.
-- One row per PROJECT_ID + PRACTICE per month. Safe to run any number of times: the row for
-- the month is created on first run and refreshed (or removed, if the project/practice no
-- longer has active activities) on later runs, so a month always ends with its last value.
--
--   * No parameters            -> every project/practice, current month (month-end job, lazy refresh)
--   * @PROJECT_ID / @PRACTICE  -> only that project/practice (called after an activity or an
--                                 accepted score is saved, so the current month stays up to date)
--   * @SNAPSHOT_MONTH          -> any day in the month to (re)capture; defaults to this month
--
-- CURRENT_SCORE uses the same rule as the client's calculateAverageAIAdoptionScore():
-- average AI_ADOPTION_SCORE of the practice's activities, skipping SDLC_PHASE 'NA' and
-- activities with no score. ACCEPTED_SCORE is the admin-reviewed score stored on those rows.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_CaptureScoreSnapshot' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_CaptureScoreSnapshot]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_CaptureScoreSnapshot]
    @SNAPSHOT_MONTH DATE = NULL,
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL,
    @EMP_ID VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BASE DATE = ISNULL(@SNAPSHOT_MONTH, CAST(GETDATE() AS DATE));
    DECLARE @MONTH DATE = DATEFROMPARTS(YEAR(@BASE), MONTH(@BASE), 1);

    ;WITH SRC AS (
        SELECT
            a.PROJECT_ID,
            a.PRACTICE,
            ISNULL(MAX(a.PROJECT), 'Unassigned') AS PROJECT,
            ISNULL(MAX(a.ACCOUNT), 'Unassigned') AS ACCOUNT,
            ISNULL(MAX(a.BUSINESS_UNIT), 'Unassigned') AS BUSINESS_UNIT,
            CAST(ROUND(AVG(CASE WHEN a.SDLC_PHASE <> 'NA' AND a.AI_ADOPTION_SCORE IS NOT NULL
                                THEN CAST(a.AI_ADOPTION_SCORE AS DECIMAL(9,4)) END), 2) AS DECIMAL(4,2)) AS CURRENT_SCORE,
            MAX(a.ACCEPTED_SCORE) AS ACCEPTED_SCORE,
            COUNT(*) AS ACTIVITY_COUNT,
            SUM(CASE WHEN a.SDLC_PHASE <> 'NA' AND a.AI_ADOPTION_SCORE IS NOT NULL THEN 1 ELSE 0 END) AS SCORED_ACTIVITY_COUNT
        FROM AIMI_ACTIVITY a
        WHERE a.ISACTIVE = 1
          AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
          AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
        GROUP BY a.PROJECT_ID, a.PRACTICE
    )
    MERGE AIMI_SCORE_HISTORY AS t
    USING SRC AS s
       ON t.SNAPSHOT_MONTH = @MONTH AND t.PROJECT_ID = s.PROJECT_ID AND t.PRACTICE = s.PRACTICE
    WHEN MATCHED THEN
        UPDATE SET t.PROJECT = s.PROJECT, t.ACCOUNT = s.ACCOUNT, t.BUSINESS_UNIT = s.BUSINESS_UNIT,
                   t.CURRENT_SCORE = s.CURRENT_SCORE, t.ACCEPTED_SCORE = s.ACCEPTED_SCORE,
                   t.ACTIVITY_COUNT = s.ACTIVITY_COUNT, t.SCORED_ACTIVITY_COUNT = s.SCORED_ACTIVITY_COUNT,
                   t.CAPTURED_BY = @EMP_ID, t.CAPTURED_DATE = GETDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (SNAPSHOT_MONTH, PROJECT_ID, PROJECT, ACCOUNT, BUSINESS_UNIT, PRACTICE,
                CURRENT_SCORE, ACCEPTED_SCORE, ACTIVITY_COUNT, SCORED_ACTIVITY_COUNT, CAPTURED_BY, CAPTURED_DATE)
        VALUES (@MONTH, s.PROJECT_ID, s.PROJECT, s.ACCOUNT, s.BUSINESS_UNIT, s.PRACTICE,
                s.CURRENT_SCORE, s.ACCEPTED_SCORE, s.ACTIVITY_COUNT, s.SCORED_ACTIVITY_COUNT, @EMP_ID, GETDATE())
    WHEN NOT MATCHED BY SOURCE
         AND t.SNAPSHOT_MONTH = @MONTH
         AND (@PROJECT_ID IS NULL OR t.PROJECT_ID = @PROJECT_ID)
         AND (@PRACTICE IS NULL OR t.PRACTICE = @PRACTICE) THEN
        DELETE;
END
GO

-- Values for the four multi-select filter popups on the AIMI Analytics dashboard, read from the
-- score history so every option has at least one snapshot behind it. Returns DIMENSION
-- (BU | ACCOUNT | PROJECT | PRACTICE) and VALUE_TEXT.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetScoreFilterOptions' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetScoreFilterOptions]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetScoreFilterOptions]
AS
BEGIN
    SET NOCOUNT ON;

    -- Always bring this month's snapshot up to date first, so the dashboard never shows a stale score.
    EXEC [dbo].[usp_AIMI_CaptureScoreSnapshot];

    SELECT DIMENSION, VALUE_TEXT
    FROM (
        SELECT DISTINCT 'BU' AS DIMENSION, BUSINESS_UNIT AS VALUE_TEXT FROM AIMI_SCORE_HISTORY
        UNION
        SELECT DISTINCT 'ACCOUNT', ACCOUNT FROM AIMI_SCORE_HISTORY
        UNION
        SELECT DISTINCT 'PROJECT', PROJECT FROM AIMI_SCORE_HISTORY
        UNION
        SELECT DISTINCT 'PRACTICE', PRACTICE FROM AIMI_SCORE_HISTORY
    ) o
    ORDER BY DIMENSION, VALUE_TEXT;
END
GO

-- Monthly score history for the AIMI Analytics dashboard, read from AIMI_SCORE_HISTORY.
--
-- @LEVEL   what each returned group is: BU | ACCOUNT | PROJECT | PRACTICE.
-- @MONTHS  how many months back, counting the current one (default 12).
-- The four TVPs narrow the data; an empty list means "no filter on that dimension". The
-- client implements drill-down by narrowing one of them to the clicked value and moving
-- @LEVEL one step down (BU -> ACCOUNT -> PROJECT -> PRACTICE).
--
-- Returns one row per group per month with the average Current and Accepted score of the
-- project/practice rows inside it, plus, for the same filters, one IS_TOTAL = 1 row per
-- month (GROUP_NAME NULL) that drives the summary tiles and the trend chart.
-- Months with no snapshot are simply absent.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetScoreAnalytics' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetScoreAnalytics]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetScoreAnalytics]
    @LEVEL VARCHAR(20),
    @MONTHS INT = 12,
    @BUSINESS_UNITS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @ACCOUNTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PROJECTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PRACTICES dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @THIS_MONTH DATE = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
    -- Always bring this month's snapshot up to date first, so the dashboard never shows a stale score.
    EXEC [dbo].[usp_AIMI_CaptureScoreSnapshot];

    IF @MONTHS IS NULL OR @MONTHS < 1 SET @MONTHS = 12;
    IF @MONTHS > 60 SET @MONTHS = 60;
    DECLARE @FROM DATE = DATEADD(MONTH, -(@MONTHS - 1), @THIS_MONTH);

    SELECT
        x.GROUP_NAME,
        CAST(GROUPING(x.GROUP_NAME) AS BIT) AS IS_TOTAL,
        h.SNAPSHOT_MONTH,
        CAST(AVG(h.CURRENT_SCORE) AS DECIMAL(5,2)) AS CURRENT_SCORE,
        CAST(AVG(h.ACCEPTED_SCORE) AS DECIMAL(5,2)) AS ACCEPTED_SCORE,
        COUNT(DISTINCT h.PROJECT_ID) AS PROJECT_COUNT
    FROM AIMI_SCORE_HISTORY h
    CROSS APPLY (SELECT CASE @LEVEL
                            WHEN 'BU' THEN h.BUSINESS_UNIT
                            WHEN 'ACCOUNT' THEN h.ACCOUNT
                            WHEN 'PROJECT' THEN h.PROJECT
                            ELSE h.PRACTICE
                        END AS GROUP_NAME) x
    WHERE h.SNAPSHOT_MONTH >= @FROM
      AND (NOT EXISTS (SELECT 1 FROM @BUSINESS_UNITS) OR h.BUSINESS_UNIT IN (SELECT VALUE_TEXT FROM @BUSINESS_UNITS))
      AND (NOT EXISTS (SELECT 1 FROM @ACCOUNTS)       OR h.ACCOUNT       IN (SELECT VALUE_TEXT FROM @ACCOUNTS))
      AND (NOT EXISTS (SELECT 1 FROM @PROJECTS)       OR h.PROJECT       IN (SELECT VALUE_TEXT FROM @PROJECTS))
      AND (NOT EXISTS (SELECT 1 FROM @PRACTICES)      OR h.PRACTICE      IN (SELECT VALUE_TEXT FROM @PRACTICES))
    GROUP BY GROUPING SETS ((x.GROUP_NAME, h.SNAPSHOT_MONTH), (h.SNAPSHOT_MONTH))
    ORDER BY IS_TOTAL DESC, x.GROUP_NAME, h.SNAPSHOT_MONTH;
END
GO

-- Score report behind "Download report" on the AIMI Analytics dashboard: one row per group at the
-- level the dashboard is showing (BU-wise, Account-wise, Project-wise or Practice-wise), read from
-- AIMI_SCORE_HISTORY.
--
-- The columns and their titles are NOT fixed here: they come from AIMI_SCORE_REPORT_COLUMN for the
-- requested level, so they can be renamed, hidden or reordered by updating that table. The proc
-- returns a single column, REPORT_JSON, holding a JSON array of row objects whose property names are
-- those titles (in order); the client just shows whatever it receives.
--
-- Available FIELDs:
--   GROUP_NAME      the group itself (the BU / account / project / practice name)
--   BUSINESS_UNIT, ACCOUNT, PROJECT_ID   parent context of the group
--   AS_OF_MONTH     month the overall / accepted scores belong to, e.g. 'Oct 2026'
--   OVERALL_SCORE   latest scored month in the range (the dashboard's "Current score")
--   ACCEPTED_SCORE  admin-reviewed score for that same month (NULL until reviewed)
--   DIFFERENCE      ACCEPTED_SCORE - OVERALL_SCORE (NULL if either is missing)
--   AVERAGE_SCORE   average of the monthly overall scores across the whole range
--
-- Group scores are the average of the project/practice rows inside the group, the same rule
-- as usp_AIMI_GetScoreAnalytics.
-- @LEVEL  BU | ACCOUNT | PROJECT | PRACTICE.   @MONTHS counts back from the current month.
-- The four TVPs narrow the data, an empty list means "no filter on that dimension", so the
-- report matches whatever the dashboard shows, including a drill-down.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetScoreReport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetScoreReport]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetScoreReport]
    @LEVEL VARCHAR(20),
    @MONTHS INT = 12,
    @BUSINESS_UNITS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @ACCOUNTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PROJECTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PRACTICES dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY
AS
BEGIN
    SET NOCOUNT ON;

    -- Bring this month's snapshot up to date first.
    EXEC [dbo].[usp_AIMI_CaptureScoreSnapshot];

    DECLARE @THIS_MONTH DATE = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
    IF @MONTHS IS NULL OR @MONTHS < 1 SET @MONTHS = 12;
    IF @MONTHS > 60 SET @MONTHS = 60;
    DECLARE @FROM DATE = DATEADD(MONTH, -(@MONTHS - 1), @THIS_MONTH);

    -- 1) Compute every available field, one row per group.
    CREATE TABLE #R (
        GROUP_NAME NVARCHAR(200),
        BUSINESS_UNIT NVARCHAR(100),
        ACCOUNT NVARCHAR(200),
        PROJECT_ID VARCHAR(20),
        AS_OF_MONTH VARCHAR(20),
        OVERALL_SCORE DECIMAL(5,2),
        ACCEPTED_SCORE DECIMAL(5,2),
        DIFFERENCE DECIMAL(5,2),
        AVERAGE_SCORE DECIMAL(5,2)
    );

    ;WITH F AS (
        SELECT h.*,
               CASE @LEVEL
                   WHEN 'BU' THEN h.BUSINESS_UNIT
                   WHEN 'ACCOUNT' THEN h.ACCOUNT
                   WHEN 'PROJECT' THEN h.PROJECT
                   ELSE h.PRACTICE
               END AS GROUP_NAME
        FROM AIMI_SCORE_HISTORY h
        WHERE h.SNAPSHOT_MONTH >= @FROM
          AND (NOT EXISTS (SELECT 1 FROM @BUSINESS_UNITS) OR h.BUSINESS_UNIT IN (SELECT VALUE_TEXT FROM @BUSINESS_UNITS))
          AND (NOT EXISTS (SELECT 1 FROM @ACCOUNTS)       OR h.ACCOUNT       IN (SELECT VALUE_TEXT FROM @ACCOUNTS))
          AND (NOT EXISTS (SELECT 1 FROM @PROJECTS)       OR h.PROJECT       IN (SELECT VALUE_TEXT FROM @PROJECTS))
          AND (NOT EXISTS (SELECT 1 FROM @PRACTICES)      OR h.PRACTICE      IN (SELECT VALUE_TEXT FROM @PRACTICES))
    ),
    M AS (   -- one value per group per month
        SELECT GROUP_NAME, SNAPSHOT_MONTH,
               AVG(CURRENT_SCORE) AS CUR,
               AVG(ACCEPTED_SCORE) AS ACC,
               MAX(BUSINESS_UNIT) AS BUSINESS_UNIT,
               MAX(ACCOUNT) AS ACCOUNT,
               MAX(PROJECT_ID) AS PROJECT_ID
        FROM F
        GROUP BY GROUP_NAME, SNAPSHOT_MONTH
    ),
    L AS (   -- latest scored month per group (latest month of all if nothing is scored)
        SELECT M.*,
               ROW_NUMBER() OVER (PARTITION BY GROUP_NAME
                                  ORDER BY CASE WHEN CUR IS NULL THEN 1 ELSE 0 END, SNAPSHOT_MONTH DESC) AS RN
        FROM M
    ),
    A AS (
        SELECT GROUP_NAME, AVG(CUR) AS AVG_CUR
        FROM M
        GROUP BY GROUP_NAME
    )
    INSERT INTO #R (GROUP_NAME, BUSINESS_UNIT, ACCOUNT, PROJECT_ID, AS_OF_MONTH,
                    OVERALL_SCORE, ACCEPTED_SCORE, DIFFERENCE, AVERAGE_SCORE)
    SELECT
        L.GROUP_NAME,
        L.BUSINESS_UNIT,
        L.ACCOUNT,
        L.PROJECT_ID,
        FORMAT(L.SNAPSHOT_MONTH, 'MMM yyyy', 'en-US'),
        CAST(L.CUR AS DECIMAL(5,2)),
        CAST(L.ACC AS DECIMAL(5,2)),
        CAST(L.ACC - L.CUR AS DECIMAL(5,2)),
        CAST(A.AVG_CUR AS DECIMAL(5,2))
    FROM L
    JOIN A ON A.GROUP_NAME = L.GROUP_NAME
    WHERE L.RN = 1;

    -- 2) Pick and title the columns from the config table. Only the fields listed below (the ones #R
    --    holds) are accepted, so the table can never inject anything into the generated query.
    DECLARE @COLS NVARCHAR(MAX);
    SELECT @COLS = STRING_AGG(CAST('R.' + QUOTENAME(c.FIELD) + ' AS '
                       + QUOTENAME(REPLACE(c.HEADER, '{MONTHS}', CAST(@MONTHS AS VARCHAR(5)))) AS NVARCHAR(MAX)), ', ')
                   WITHIN GROUP (ORDER BY c.SORT_ORDER)
    FROM AIMI_SCORE_REPORT_COLUMN c
    WHERE c.REPORT_LEVEL = @LEVEL
      AND c.IS_ACTIVE = 1
      AND c.FIELD IN ('GROUP_NAME', 'BUSINESS_UNIT', 'ACCOUNT', 'PROJECT_ID', 'AS_OF_MONTH',
                      'OVERALL_SCORE', 'ACCEPTED_SCORE', 'DIFFERENCE', 'AVERAGE_SCORE');

    IF @COLS IS NULL SET @COLS = N'R.GROUP_NAME AS [Name]';   -- nothing configured: still return something

    -- 3) One JSON array, property names = the configured titles, in the configured order.
    DECLARE @SQL NVARCHAR(MAX);
    SET @SQL = N'SELECT ISNULL((SELECT ' + @COLS;
    SET @SQL = @SQL + N' FROM #R R ORDER BY R.GROUP_NAME FOR JSON PATH, INCLUDE_NULL_VALUES), N''[]'') AS REPORT_JSON;';
    EXEC sys.sp_executesql @SQL;
END
GO

-- Activity reports: Manage Activities > "Generate Report" (REPORT_TYPE 'PROJECT') and the Reports page >
-- "Generate Reports" (REPORT_TYPE 'MULTI'). One row per activity.
--
-- The columns, their titles and their order are NOT fixed here: they come from
-- AIMI_ACTIVITY_REPORT_COLUMN for the requested report type, so they can be renamed, hidden or
-- reordered by updating that table. The proc returns a single column, REPORT_JSON, holding a JSON
-- array of row objects whose property names are those titles (in order); the client just shows what
-- it receives.
--
-- Everything the report shows is read here, nothing is added in the browser:
--   * activity, AI Adoption Metrics and accepted score: AIMI_ACTIVITY / AIMI_PROJECT_INFO
--   * Business Head, Account Manager, Manager and Head Count: the CSM project master
--     (PROJECT / EMP_INFO / PROJ_RESOURCE), the same source as GetProjectListTemp
--       BUSINESS_HEAD    = project's BU head          (PROJ_BUHEAD_EMP_ID)
--       ACCOUNT_MANAGER  = project's CSM              (DP_ID, what the app has always shown here)
--       MANAGER          = project manager            (PROJ_PM_EMP_ID)
--       HEADCOUNT        = billable current resources
--   * OVERALL_SCORE: the project + practice score shown on Manage Activities. 'N/A' when none of its
--     activities is applicable, otherwise the average AI Adoption Score (SDLC phase 'NA' and
--     unscored activities skipped), 2 decimals.
--
-- Fields available to the config table:
--   BUSINESS_UNIT, BUSINESS_HEAD, ACCOUNT, ACCOUNT_MANAGER, PROJECT, PROJECT_ID, MANAGER, HEADCOUNT,
--   PRACTICE, PEOPLE_USING_AI, LICENSE_COUNT, LICENSE_PROVIDER, RUNOPS_AUTO_RESOLVED,
--   RUNOPS_MTTR_REDUCTION, RUNOPS_AI_AGENTS, RUNOPS_AUTOMATED_WORKFLOWS, RUNOPS_MTTD, RUNOPS_MTTR,
--   ENGINEER_AI_AGENTS, ENGINEER_DELIVERY_CYCLE_TIME, ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
--   ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE, COMMON_ADOPTION_WORKFORCE_CERTIFICATION,
--   COMMON_ADOPTION_EFFORTS_SAVED, COMMON_DEPLOYMENT_ENGINEER, OVERALL_SCORE, ACCEPTED_SCORE,
--   ACCEPTED_SCORE_COMMENT, SDLC_PHASE, ACTIVITY, APPLICABILITY, AI_ADOPTION_SCORE, AI_TOOLS_USED,
--   ACCELERATORS_USED, WORK_DONE_BY_AI, HOURS_SAVED, REVENUE_GENERATED, BENEFIT_TO,
--   QUALITATIVE_BENEFITS, COMMENTS, CREATED_DATE, LAST_UPDATED_DATE
--
-- Filters are the same as usp_AIMI_GetReportData: @PROJECT_ID / @PRACTICE for one project, or any of
-- the four lists (an empty list means "no filter on that dimension").
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetActivityReport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetActivityReport]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetActivityReport]
    @REPORT_TYPE VARCHAR(20),
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL,
    @BUSINESS_UNITS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @ACCOUNTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PROJECTS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @PRACTICES dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY
AS
BEGIN
    SET NOCOUNT ON;

    -- 1) Compute every available field, one row per activity.
    CREATE TABLE #A (
        SORT_CREATED DATETIME,
        BUSINESS_UNIT VARCHAR(100),
        BUSINESS_HEAD NVARCHAR(200),
        ACCOUNT NVARCHAR(200),
        ACCOUNT_MANAGER NVARCHAR(200),
        PROJECT NVARCHAR(200),
        PROJECT_ID VARCHAR(20),
        MANAGER NVARCHAR(200),
        HEADCOUNT INT,
        PRACTICE VARCHAR(100),
        PEOPLE_USING_AI INT,
        LICENSE_COUNT INT,
        LICENSE_PROVIDER NVARCHAR(200),
        RUNOPS_AUTO_RESOLVED NVARCHAR(MAX),
        RUNOPS_MTTR_REDUCTION NVARCHAR(MAX),
        RUNOPS_AI_AGENTS NVARCHAR(MAX),
        RUNOPS_AUTOMATED_WORKFLOWS NVARCHAR(MAX),
        RUNOPS_MTTD NVARCHAR(MAX),
        RUNOPS_MTTR NVARCHAR(MAX),
        ENGINEER_AI_AGENTS NVARCHAR(MAX),
        ENGINEER_DELIVERY_CYCLE_TIME NVARCHAR(MAX),
        ENGINEER_CONTRACT_TEST_CASE_PASS_RATE NVARCHAR(MAX),
        ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE NVARCHAR(MAX),
        COMMON_ADOPTION_WORKFORCE_CERTIFICATION NVARCHAR(MAX),
        COMMON_ADOPTION_EFFORTS_SAVED NVARCHAR(MAX),
        COMMON_DEPLOYMENT_ENGINEER NVARCHAR(MAX),
        OVERALL_SCORE VARCHAR(10),
        ACCEPTED_SCORE DECIMAL(4,2),
        ACCEPTED_SCORE_COMMENT NVARCHAR(MAX),
        SDLC_PHASE VARCHAR(200),
        ACTIVITY VARCHAR(500),
        APPLICABILITY VARCHAR(20),
        AI_ADOPTION_SCORE TINYINT,
        AI_TOOLS_USED NVARCHAR(MAX),
        ACCELERATORS_USED NVARCHAR(MAX),
        WORK_DONE_BY_AI TINYINT,
        HOURS_SAVED DECIMAL(10,2),
        REVENUE_GENERATED VARCHAR(5),
        BENEFIT_TO VARCHAR(20),
        QUALITATIVE_BENEFITS NVARCHAR(MAX),
        COMMENTS NVARCHAR(MAX),
        CREATED_DATE VARCHAR(10),
        LAST_UPDATED_DATE VARCHAR(10)
    );

    INSERT INTO #A
    SELECT
        a.CREATED_DATE,
        a.BUSINESS_UNIT,
        bh.FRST_NM,
        a.ACCOUNT,
        csm.FRST_NM,
        a.PROJECT,
        a.PROJECT_ID,
        pm.FRST_NM,
        (SELECT COUNT(*) FROM PROJ_RESOURCE pr
          WHERE pr.PROJ_ID = a.PROJECT_ID AND pr.BILL_FLG = 1 AND pr.CURR_INDC = 'y' AND pr.END_DATE >= GETDATE()),
        a.PRACTICE,
        pi.PEOPLE_USING_AI,
        pi.LICENSE_COUNT,
        pi.LICENSE_PROVIDER,
        pi.RUNOPS_AUTO_RESOLVED,
        pi.RUNOPS_MTTR_REDUCTION,
        pi.RUNOPS_AI_AGENTS,
        pi.RUNOPS_AUTOMATED_WORKFLOWS,
        pi.RUNOPS_MTTD,
        pi.RUNOPS_MTTR,
        pi.ENGINEER_AI_AGENTS,
        pi.ENGINEER_DELIVERY_CYCLE_TIME,
        pi.ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
        pi.ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE,
        pi.COMMON_ADOPTION_WORKFORCE_CERTIFICATION,
        pi.COMMON_ADOPTION_EFFORTS_SAVED,
        pi.COMMON_DEPLOYMENT_ENGINEER,
        CASE
            WHEN SUM(CASE WHEN a.APPLICABILITY = 'Yes' THEN 1 ELSE 0 END)
                 OVER (PARTITION BY a.PROJECT_ID, a.PRACTICE) = 0 THEN 'N/A'
            ELSE CAST(CAST(ROUND(ISNULL(
                     AVG(CASE WHEN a.SDLC_PHASE <> 'NA' AND a.AI_ADOPTION_SCORE IS NOT NULL
                              THEN CAST(a.AI_ADOPTION_SCORE AS DECIMAL(9,4)) END)
                     OVER (PARTITION BY a.PROJECT_ID, a.PRACTICE), 0), 2) AS DECIMAL(4,2)) AS VARCHAR(10))
        END,
        a.ACCEPTED_SCORE,
        a.ACCEPTED_SCORE_COMMENT,
        a.SDLC_PHASE,
        a.ACTIVITY,
        a.APPLICABILITY,
        a.AI_ADOPTION_SCORE,
        (SELECT STRING_AGG(t.TOOL_NAME, ', ') FROM AIMI_ACTIVITY_AI_TOOL t WHERE t.ACTIVITY_ID = a.ID),
        (SELECT STRING_AGG(ac.ACCELERATOR_NAME, ', ') FROM AIMI_ACTIVITY_ACCELERATOR ac WHERE ac.ACTIVITY_ID = a.ID),
        a.WORK_DONE_BY_AI,
        a.HOURS_SAVED,
        a.REVENUE_GENERATED,
        a.BENEFIT_TO,
        (SELECT STRING_AGG(qb.BENEFIT_NAME, ', ') FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb WHERE qb.ACTIVITY_ID = a.ID),
        a.COMMENTS,
        CONVERT(VARCHAR(10), a.CREATED_DATE, 23),
        CONVERT(VARCHAR(10), a.UPDATED_DATE, 23)
    FROM AIMI_ACTIVITY a
    LEFT JOIN AIMI_PROJECT_INFO pi ON pi.PROJECT_ID = a.PROJECT_ID AND pi.ISACTIVE = 1
    LEFT JOIN PROJECT p ON p.PROJ_ID = a.PROJECT_ID
    LEFT JOIN EMP_INFO bh  ON bh.EMP_ID  = p.PROJ_BUHEAD_EMP_ID
    LEFT JOIN EMP_INFO pm  ON pm.EMP_ID  = p.PROJ_PM_EMP_ID
    LEFT JOIN EMP_INFO csm ON csm.EMP_ID = p.DP_ID
    WHERE a.ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
      AND (NOT EXISTS (SELECT 1 FROM @BUSINESS_UNITS) OR a.BUSINESS_UNIT IN (SELECT VALUE_TEXT FROM @BUSINESS_UNITS))
      AND (NOT EXISTS (SELECT 1 FROM @ACCOUNTS)       OR a.ACCOUNT       IN (SELECT VALUE_TEXT FROM @ACCOUNTS))
      AND (NOT EXISTS (SELECT 1 FROM @PROJECTS)       OR a.PROJECT       IN (SELECT VALUE_TEXT FROM @PROJECTS))
      AND (NOT EXISTS (SELECT 1 FROM @PRACTICES)      OR a.PRACTICE      IN (SELECT VALUE_TEXT FROM @PRACTICES));

    -- 2) Pick and title the columns from the config table. Only the fields listed below (the ones #A
    --    holds) are accepted, so the table can never inject anything into the generated query.
    DECLARE @COLS NVARCHAR(MAX);
    SELECT @COLS = STRING_AGG(CAST('A.' + QUOTENAME(c.FIELD) + ' AS ' + QUOTENAME(c.HEADER) AS NVARCHAR(MAX)), ', ')
                   WITHIN GROUP (ORDER BY c.SORT_ORDER)
    FROM AIMI_ACTIVITY_REPORT_COLUMN c
    WHERE c.REPORT_TYPE = @REPORT_TYPE
      AND c.IS_ACTIVE = 1
      AND c.FIELD IN ('BUSINESS_UNIT', 'BUSINESS_HEAD', 'ACCOUNT', 'ACCOUNT_MANAGER', 'PROJECT', 'PROJECT_ID',
                      'MANAGER', 'HEADCOUNT', 'PRACTICE', 'PEOPLE_USING_AI', 'LICENSE_COUNT', 'LICENSE_PROVIDER',
                      'RUNOPS_AUTO_RESOLVED', 'RUNOPS_MTTR_REDUCTION', 'RUNOPS_AI_AGENTS',
                      'RUNOPS_AUTOMATED_WORKFLOWS', 'RUNOPS_MTTD', 'RUNOPS_MTTR', 'ENGINEER_AI_AGENTS',
                      'ENGINEER_DELIVERY_CYCLE_TIME', 'ENGINEER_CONTRACT_TEST_CASE_PASS_RATE',
                      'ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE', 'COMMON_ADOPTION_WORKFORCE_CERTIFICATION',
                      'COMMON_ADOPTION_EFFORTS_SAVED', 'COMMON_DEPLOYMENT_ENGINEER', 'OVERALL_SCORE',
                      'ACCEPTED_SCORE', 'ACCEPTED_SCORE_COMMENT', 'SDLC_PHASE', 'ACTIVITY', 'APPLICABILITY',
                      'AI_ADOPTION_SCORE', 'AI_TOOLS_USED', 'ACCELERATORS_USED', 'WORK_DONE_BY_AI', 'HOURS_SAVED',
                      'REVENUE_GENERATED', 'BENEFIT_TO', 'QUALITATIVE_BENEFITS', 'COMMENTS', 'CREATED_DATE',
                      'LAST_UPDATED_DATE');

    IF @COLS IS NULL SET @COLS = N'A.PROJECT AS [Project], A.ACTIVITY AS [Activity]';   -- nothing configured

    -- 3) One JSON array, property names = the configured titles, in the configured order.
    DECLARE @SQL NVARCHAR(MAX);
    SET @SQL = N'SELECT ISNULL((SELECT ' + @COLS;
    SET @SQL = @SQL + N' FROM #A A ORDER BY A.BUSINESS_UNIT, A.ACCOUNT, A.PROJECT, A.PRACTICE, A.SDLC_PHASE, A.SORT_CREATED FOR JSON PATH, INCLUDE_NULL_VALUES), N''[]'') AS REPORT_JSON;';
    EXEC sys.sp_executesql @SQL;
END
GO

-- Keeps this month's AIMI_SCORE_HISTORY row in step with AIMI_ACTIVITY. Fires on any activity
-- insert, update (including the accepted score review) or delete, from whichever API or script
-- wrote it, so the stored history never depends on which build handled the save.
-- When the statement touched exactly one project + practice only that pair is refreshed,
-- otherwise the whole month is. A failure here is swallowed so it can never block a save.
IF EXISTS(SELECT 1 FROM sys.triggers WHERE name = 'TR_AIMI_ACTIVITY_ScoreSnapshot')
BEGIN
    DROP TRIGGER [dbo].[TR_AIMI_ACTIVITY_ScoreSnapshot]
END
GO

CREATE TRIGGER [dbo].[TR_AIMI_ACTIVITY_ScoreSnapshot]
ON [dbo].[AIMI_ACTIVITY]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @PAIRS TABLE (PROJECT_ID VARCHAR(20), PRACTICE VARCHAR(100));
        INSERT INTO @PAIRS SELECT DISTINCT PROJECT_ID, PRACTICE FROM inserted;
        INSERT INTO @PAIRS SELECT DISTINCT PROJECT_ID, PRACTICE FROM deleted;

        DECLARE @PROJECT_ID VARCHAR(20), @PRACTICE VARCHAR(100);
        SELECT @PROJECT_ID = MIN(PROJECT_ID), @PRACTICE = MIN(PRACTICE)
        FROM (SELECT DISTINCT PROJECT_ID, PRACTICE FROM @PAIRS) d;

        IF (SELECT COUNT(*) FROM (SELECT DISTINCT PROJECT_ID, PRACTICE FROM @PAIRS) d) = 1
            EXEC [dbo].[usp_AIMI_CaptureScoreSnapshot] @PROJECT_ID = @PROJECT_ID, @PRACTICE = @PRACTICE;
        ELSE
            EXEC [dbo].[usp_AIMI_CaptureScoreSnapshot];
    END TRY
    BEGIN CATCH
        -- never block the user's save
    END CATCH
END
GO

-- First snapshot (current month). From here the trigger refreshes it on every activity change and the
-- dashboard refreshes it on load. An optional SQL Agent job running EXEC dbo.usp_AIMI_CaptureScoreSnapshot
-- at month end avoids gaps in months where nothing changed.
EXEC [dbo].[usp_AIMI_CaptureScoreSnapshot];
GO
