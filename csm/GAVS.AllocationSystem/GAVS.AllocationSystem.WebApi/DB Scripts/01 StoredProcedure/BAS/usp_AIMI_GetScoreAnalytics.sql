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
