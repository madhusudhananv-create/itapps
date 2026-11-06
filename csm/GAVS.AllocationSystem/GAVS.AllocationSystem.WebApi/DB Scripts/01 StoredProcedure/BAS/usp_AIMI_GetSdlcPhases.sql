-- Reads the master SDLC Phase list, scoped per practice (phase names are NOT
-- a global enum - each practice has its own phase vocabulary, see the note in
-- Release 2.6.3.sql). Was hardcoded/derived client-side from
-- questionnaire.json's practices[].sdlcPhases[] array.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetSdlcPhases' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetSdlcPhases]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetSdlcPhases]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sp.ID,
        sp.PRACTICE_ID,
        p.NAME AS PRACTICE_NAME,
        sp.NAME,
        sp.SORT_ORDER
    FROM AIMI_SDLC_PHASE sp
    JOIN AIMI_PRACTICE p ON p.ID = sp.PRACTICE_ID
    WHERE sp.ISACTIVE = 1 AND p.ISACTIVE = 1
    ORDER BY p.SORT_ORDER, sp.SORT_ORDER;
END
GO
