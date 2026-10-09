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
