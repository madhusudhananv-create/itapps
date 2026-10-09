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

    -- 2) Pick and title the columns from the config table. Only fields that really exist in #R
    --    are accepted, so the table can never inject anything into the generated query.
    DECLARE @COLS NVARCHAR(MAX);
    SELECT @COLS = STRING_AGG(CAST('R.' + QUOTENAME(c.FIELD) + ' AS '
                       + QUOTENAME(REPLACE(c.HEADER, '{MONTHS}', CAST(@MONTHS AS VARCHAR(5)))) AS NVARCHAR(MAX)), ', ')
                   WITHIN GROUP (ORDER BY c.SORT_ORDER)
    FROM AIMI_SCORE_REPORT_COLUMN c
    WHERE c.REPORT_LEVEL = @LEVEL
      AND c.IS_ACTIVE = 1
      AND EXISTS (SELECT 1 FROM tempdb.sys.columns tc
                  WHERE tc.object_id = OBJECT_ID('tempdb..#R') AND tc.name = c.FIELD);

    IF @COLS IS NULL SET @COLS = N'R.GROUP_NAME AS [Name]';   -- nothing configured: still return something

    -- 3) One JSON array, property names = the configured titles, in the configured order.
    DECLARE @SQL NVARCHAR(MAX) =
        N'SELECT ISNULL((SELECT ' + @COLS + N' FROM #R R ORDER BY R.GROUP_NAME FOR JSON PATH, INCLUDE_NULL_VALUES), N''[]'') AS REPORT_JSON;';
    EXEC (@SQL);
END
GO
