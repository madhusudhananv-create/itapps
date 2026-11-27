-- Records one AIMI user action (login, page view, submit, delete, report, ...) in
-- AIMI_USER_ACTIVITY_LOG. The caller only knows the CSM employee id (the empId request
-- header), so the e-mail and display name are resolved here from EMP_INFO. If the
-- employee is not found the EMP_ID itself is stored so the row is never lost.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_InsertUserActivityLog' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_InsertUserActivityLog]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_InsertUserActivityLog]
    @EMP_ID VARCHAR(10),
    @MODULE VARCHAR(50),
    @ACTION VARCHAR(100),
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL,
    @REQUEST_URL VARCHAR(500) = NULL,
    @IP_ADDRESS VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EMAIL_ID VARCHAR(100), @USER_NAME VARCHAR(100);

    SELECT @EMAIL_ID = NULLIF(LTRIM(RTRIM(EMAIL_ID)), ''),
           @USER_NAME = NULLIF(LTRIM(RTRIM(ISNULL(FRST_NM, '') + ' ' + ISNULL(LAST_NM, ''))), '')
      FROM EMP_INFO
     WHERE EMP_ID = @EMP_ID;

    INSERT INTO AIMI_USER_ACTIVITY_LOG
        (EMAIL_ID, USER_NAME, MODULE, ACTION, PROJECT_ID, PRACTICE, REQUEST_URL, IP_ADDRESS, CREATED_DATE)
    VALUES
        (ISNULL(@EMAIL_ID, @EMP_ID), @USER_NAME, @MODULE, @ACTION, @PROJECT_ID, @PRACTICE, @REQUEST_URL, @IP_ADDRESS, GETDATE());
END
GO
