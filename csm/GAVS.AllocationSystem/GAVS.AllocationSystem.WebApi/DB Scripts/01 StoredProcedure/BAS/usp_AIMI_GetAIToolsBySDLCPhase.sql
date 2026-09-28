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
