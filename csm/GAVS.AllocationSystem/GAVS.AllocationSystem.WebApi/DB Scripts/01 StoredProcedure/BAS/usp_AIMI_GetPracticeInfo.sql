-- Reads practice-info rows. Pass @PROJECT_ID/@PRACTICE to narrow; leave either or
-- both NULL for "all" (covers both getPracticeInfo and getAllPracticeInfo).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetPracticeInfo' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetPracticeInfo]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetPracticeInfo]
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM AIMI_PRACTICE_INFO
    WHERE ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR PRACTICE = @PRACTICE);
END
GO
