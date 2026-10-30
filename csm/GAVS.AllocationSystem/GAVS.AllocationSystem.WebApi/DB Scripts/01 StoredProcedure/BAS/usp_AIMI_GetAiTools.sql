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
