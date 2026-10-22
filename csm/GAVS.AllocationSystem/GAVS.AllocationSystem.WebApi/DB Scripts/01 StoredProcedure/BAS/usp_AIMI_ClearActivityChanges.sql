-- Clears AIMI_ACTIVITY.CHANGE_TYPE for one project + practice after the "Submit Activities" mail has been
-- sent, so the next submit only reports what changed after this one.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_ClearActivityChanges' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_ClearActivityChanges]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_ClearActivityChanges]
    @PROJECT_ID VARCHAR(20),
    @PRACTICE VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE AIMI_ACTIVITY
       SET CHANGE_TYPE = NULL
     WHERE PROJECT_ID = @PROJECT_ID
       AND PRACTICE = @PRACTICE
       AND CHANGE_TYPE IS NOT NULL;
END
GO
