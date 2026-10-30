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
