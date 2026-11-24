-- Insert-or-update of a project's current-phase-per-practice record, keyed on
-- (PROJECT_ID, PRACTICE).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_UpsertPracticeInfo' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_UpsertPracticeInfo]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_UpsertPracticeInfo]
    @ID INT = NULL OUTPUT,
    @PROJECT_ID VARCHAR(20),
    @PRACTICE VARCHAR(100),
    @CURRENT_PHASE VARCHAR(200) = NULL,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @ID = ID FROM AIMI_PRACTICE_INFO
     WHERE PROJECT_ID = @PROJECT_ID AND PRACTICE = @PRACTICE AND ISACTIVE = 1;

    IF @ID IS NULL
    BEGIN
        INSERT INTO AIMI_PRACTICE_INFO
            (PROJECT_ID, PRACTICE, CURRENT_PHASE, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE, ISACTIVE)
        VALUES
            (@PROJECT_ID, @PRACTICE, @CURRENT_PHASE, @EMP_ID, GETDATE(), @EMP_ID, GETDATE(), 1);

        SET @ID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE AIMI_PRACTICE_INFO
           SET CURRENT_PHASE = @CURRENT_PHASE,
               UPDATED_BY = @EMP_ID,
               UPDATED_DATE = GETDATE()
         WHERE ID = @ID;
    END

    -- EF6's Database.SqlQuery<int> is unreliable when a proc only has an
    -- OUTPUT parameter and no result set (throws "data reader has more than
    -- one field"), so the id is also returned as a plain one-column result
    -- set instead of relying solely on @ID OUTPUT.
    SELECT @ID AS ID;
END
GO
