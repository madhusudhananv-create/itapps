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
