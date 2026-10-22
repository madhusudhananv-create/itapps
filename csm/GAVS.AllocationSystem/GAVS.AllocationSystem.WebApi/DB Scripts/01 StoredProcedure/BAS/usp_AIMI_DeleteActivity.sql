-- Soft-deletes one activity (@ID) and/or a batch of activities (@IDS), matching the
-- house convention of ISACTIVE=0 rather than a hard DELETE. Covers both the single
-- "Delete Activity" action and the admin "bulk delete selected in phase" action.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_DeleteActivity' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_DeleteActivity]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_DeleteActivity]
    @ID INT = NULL,
    @IDS dbo.AIMI_ID_LIST_TABLE_TYPE READONLY,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE AIMI_ACTIVITY
       SET ISACTIVE = 0,
           -- an activity added and deleted before any submit was never reported, so nothing to report
           CHANGE_TYPE = CASE WHEN CHANGE_TYPE = 'Added' THEN NULL ELSE 'Deleted' END,
           UPDATED_BY = @EMP_ID,
           UPDATED_DATE = GETDATE()
     WHERE ISACTIVE = 1
       AND (
             (@ID IS NOT NULL AND ID = @ID)
             OR ID IN (SELECT ID FROM @IDS)
           );
END
GO
