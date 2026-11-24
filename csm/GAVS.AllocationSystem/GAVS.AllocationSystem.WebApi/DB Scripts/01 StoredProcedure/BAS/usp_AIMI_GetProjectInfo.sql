-- Reads one project's AI Adoption Metrics (@PROJECT_ID supplied), or all projects
-- when @PROJECT_ID is NULL (covers both getProjectInfo and getAllProjectInfo).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetProjectInfo' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetProjectInfo]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetProjectInfo]
    @PROJECT_ID VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM AIMI_PROJECT_INFO
    WHERE ISACTIVE = 1
      AND (@PROJECT_ID IS NULL OR PROJECT_ID = @PROJECT_ID);
END
GO
