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
