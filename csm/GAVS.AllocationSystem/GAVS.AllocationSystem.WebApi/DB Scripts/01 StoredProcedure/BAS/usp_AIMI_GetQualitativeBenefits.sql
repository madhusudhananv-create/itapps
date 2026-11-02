-- Reads the master Qualitative Benefit suggestion list (was activityTypes.ts
-- QUALITATIVE_BENEFITS). Distinct from AIMI_ACTIVITY_QUALITATIVE_BENEFIT,
-- which stores which benefits were picked for a given logged activity.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetQualitativeBenefits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefits]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefits]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT NAME, SORT_ORDER
    FROM AIMI_QUALITATIVE_BENEFIT
    WHERE ISACTIVE = 1
    ORDER BY SORT_ORDER;
END
GO
