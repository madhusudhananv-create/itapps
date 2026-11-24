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
