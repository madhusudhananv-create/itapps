-- Saves the admin review (Accepted Score / Score Reviewed / Comments) for a project's
-- activities. Touches ONLY these three columns, so unlike the old project-info upsert it
-- cannot overwrite any other data. Scoped to PROJECT_ID + PRACTICE because the Overall Score
-- it reviews is calculated from that practice's activities.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_UpdateAcceptedScore' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_UpdateAcceptedScore]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_UpdateAcceptedScore]
    @PROJECT_ID VARCHAR(20),
    @PRACTICE VARCHAR(100),
    @ACCEPTED_SCORE DECIMAL(4,2) = NULL,
    @SCORE_REVIEWED BIT = 0,
    @ACCEPTED_SCORE_COMMENT NVARCHAR(MAX) = NULL,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE AIMI_ACTIVITY
       SET ACCEPTED_SCORE = @ACCEPTED_SCORE,
           SCORE_REVIEWED = @SCORE_REVIEWED,
           ACCEPTED_SCORE_COMMENT = @ACCEPTED_SCORE_COMMENT,
           UPDATED_BY = @EMP_ID,
           UPDATED_DATE = GETDATE()
     WHERE PROJECT_ID = @PROJECT_ID
       AND PRACTICE = @PRACTICE
       AND ISACTIVE = 1;

    SELECT @@ROWCOUNT AS ID;
END
GO
