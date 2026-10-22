-- Activities of one project + practice that were added, changed or deleted since the last "Submit
-- Activities" mail (AIMI_ACTIVITY.CHANGE_TYPE: Added | Updated | Deleted). Deleted rows are soft-deleted
-- (ISACTIVE = 0), so they are included on purpose. Read by the submit mail; usp_AIMI_ClearActivityChanges
-- clears the flags once the mail has gone out.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetPendingActivityChanges' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetPendingActivityChanges]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetPendingActivityChanges]
    @PROJECT_ID VARCHAR(20),
    @PRACTICE VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ID, PROJECT_ID, PROJECT, ACCOUNT, BUSINESS_UNIT, PRACTICE, SDLC_PHASE, ACTIVITY,
           APPLICABILITY, AI_ADOPTION_SCORE, CHANGE_TYPE
      FROM AIMI_ACTIVITY
     WHERE PROJECT_ID = @PROJECT_ID
       AND PRACTICE = @PRACTICE
       AND CHANGE_TYPE IS NOT NULL
     ORDER BY SDLC_PHASE, ACTIVITY;
END
GO
