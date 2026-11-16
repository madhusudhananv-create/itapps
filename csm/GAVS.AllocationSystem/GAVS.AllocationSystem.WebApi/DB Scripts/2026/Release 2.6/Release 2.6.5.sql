-- AIMI per-activity Accepted Score review. Run once per environment after Release 2.6.4.sql. Safe to re-run.
--
-- The admin now reviews each activity (ACCEPTED_SCORE / SCORE_REVIEWED / ACCEPTED_SCORE_COMMENT on
-- AIMI_ACTIVITY). The project's accepted overall is no longer typed in: it is the same average as
-- the entered overall score, taken over each activity's accepted score (falling back to its entered
-- score where not reviewed) - see usp_AIMI_CaptureScoreSnapshot in Release 2.6.4.sql.
--
-- Existing rows hold the old project-level accepted value copied onto every activity. Those copies
-- are not per-activity reviews, so they are cleared here (run once; the guard below keeps a re-run
-- from wiping reviews saved afterwards).
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AIMI_ACTIVITY') AND name = 'ACCEPTED_SCORE_REVIEWED_BY')
BEGIN
    ALTER TABLE AIMI_ACTIVITY ADD ACCEPTED_SCORE_REVIEWED_BY VARCHAR(10) NULL;
    ALTER TABLE AIMI_ACTIVITY ADD ACCEPTED_SCORE_REVIEWED_DATE DATETIME NULL;

    EXEC('UPDATE AIMI_ACTIVITY SET ACCEPTED_SCORE = NULL, SCORE_REVIEWED = 0, ACCEPTED_SCORE_COMMENT = NULL
          WHERE ACCEPTED_SCORE IS NOT NULL OR SCORE_REVIEWED = 1 OR ACCEPTED_SCORE_COMMENT IS NOT NULL');
END
GO

-- One row per activity being reviewed.
IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'usp_AIMI_UpdateActivityAcceptedScores' AND type = 'P')
    DROP PROCEDURE [dbo].[usp_AIMI_UpdateActivityAcceptedScores]
GO
IF EXISTS (SELECT 1 FROM sys.types WHERE name = 'AIMI_ACTIVITY_ACCEPTED_SCORE_TYPE' AND is_table_type = 1)
    DROP TYPE [dbo].[AIMI_ACTIVITY_ACCEPTED_SCORE_TYPE]
GO
CREATE TYPE [dbo].[AIMI_ACTIVITY_ACCEPTED_SCORE_TYPE] AS TABLE
(
    ID INT NOT NULL,                              -- AIMI_ACTIVITY.ID
    ACCEPTED_SCORE DECIMAL(4,2) NULL,             -- NULL clears the review
    ACCEPTED_SCORE_COMMENT NVARCHAR(MAX) NULL
)
GO

-- Saves the admin review of several activities in one transaction. Touches only the review
-- columns. Rules (enforced here so no client can bypass them):
--   * ACCEPTED_SCORE must be a whole number from 0 to 5, or NULL (= not reviewed).
--   * A comment is required when the accepted score differs from the entered score.
-- Returns the number of activity rows updated. Any broken rule rolls the whole batch back.
CREATE PROCEDURE [dbo].[usp_AIMI_UpdateActivityAcceptedScores]
    @Table [dbo].[AIMI_ACTIVITY_ACCEPTED_SCORE_TYPE] READONLY,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (SELECT 1 FROM @Table WHERE ACCEPTED_SCORE IS NOT NULL
               AND (ACCEPTED_SCORE < 0 OR ACCEPTED_SCORE > 5 OR ACCEPTED_SCORE <> FLOOR(ACCEPTED_SCORE)))
        THROW 50001, 'Accepted score must be a whole number from 0 to 5.', 1;

    IF EXISTS (SELECT 1
               FROM @Table t
               JOIN AIMI_ACTIVITY a ON a.ID = t.ID AND a.ISACTIVE = 1
               WHERE t.ACCEPTED_SCORE IS NOT NULL
                 AND (a.AI_ADOPTION_SCORE IS NULL OR t.ACCEPTED_SCORE <> a.AI_ADOPTION_SCORE)
                 AND LTRIM(RTRIM(ISNULL(t.ACCEPTED_SCORE_COMMENT, ''))) = '')
        THROW 50002, 'A comment is required when the accepted score differs from the entered score.', 1;

    BEGIN TRAN;

    UPDATE a
       SET a.ACCEPTED_SCORE = t.ACCEPTED_SCORE,
           a.SCORE_REVIEWED = CASE WHEN t.ACCEPTED_SCORE IS NULL THEN 0 ELSE 1 END,
           a.ACCEPTED_SCORE_COMMENT = NULLIF(LTRIM(RTRIM(ISNULL(t.ACCEPTED_SCORE_COMMENT, ''))), ''),
           a.ACCEPTED_SCORE_REVIEWED_BY = CASE WHEN t.ACCEPTED_SCORE IS NULL THEN NULL ELSE @EMP_ID END,
           a.ACCEPTED_SCORE_REVIEWED_DATE = CASE WHEN t.ACCEPTED_SCORE IS NULL THEN NULL ELSE GETDATE() END
      FROM AIMI_ACTIVITY a
      JOIN @Table t ON t.ID = a.ID
     WHERE a.ISACTIVE = 1;

    DECLARE @UPDATED INT = @@ROWCOUNT;

    COMMIT TRAN;

    SELECT @UPDATED AS ID;
END
GO
