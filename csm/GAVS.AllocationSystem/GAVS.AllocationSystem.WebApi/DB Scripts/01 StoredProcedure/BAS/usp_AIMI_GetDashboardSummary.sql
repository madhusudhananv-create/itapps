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
