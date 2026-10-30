-- Reads the Accelerator autocomplete suggestion list (was activityTypes.ts
-- COMMON_ACCELERATORS). Distinct from AIMI_ACTIVITY_ACCELERATOR, the
-- per-activity junction table.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAccelerators' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAccelerators]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAccelerators]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT NAME
    FROM AIMI_ACCELERATOR
    WHERE ISACTIVE = 1
    ORDER BY NAME;
END
GO
