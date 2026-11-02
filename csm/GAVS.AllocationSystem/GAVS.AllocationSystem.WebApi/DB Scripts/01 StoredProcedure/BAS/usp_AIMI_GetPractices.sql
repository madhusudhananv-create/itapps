-- Reads the master Practice list (was hardcoded/derived client-side from
-- questionnaire.json's practices[] array). See AIMI_PRACTICE in
-- Release 2.6.3.sql.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetPractices' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetPractices]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetPractices]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ID, NAME, SORT_ORDER
    FROM AIMI_PRACTICE
    WHERE ISACTIVE = 1
    ORDER BY SORT_ORDER;
END
GO
