-- Reads the master questionnaire Activity catalog per SDLC phase (was
-- hardcoded/derived client-side from questionnaire.json's
-- practices[].sdlcPhases[].activities[] array). Distinct from AIMI_ACTIVITY,
-- which stores the per-project activity log entries a user submits, not the
-- master catalog of possible activities the questionnaire presents.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetQuestionnaireActivities' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetQuestionnaireActivities]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetQuestionnaireActivities]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        qa.ID,
        qa.SDLC_PHASE_ID,
        p.NAME AS PRACTICE_NAME,
        sp.NAME AS SDLC_PHASE_NAME,
        qa.ACTIVITY,
        qa.SORT_ORDER
    FROM AIMI_QUESTIONNAIRE_ACTIVITY qa
    JOIN AIMI_SDLC_PHASE sp ON sp.ID = qa.SDLC_PHASE_ID
    JOIN AIMI_PRACTICE p ON p.ID = sp.PRACTICE_ID
    WHERE qa.ISACTIVE = 1 AND sp.ISACTIVE = 1 AND p.ISACTIVE = 1
    ORDER BY p.SORT_ORDER, sp.SORT_ORDER, qa.SORT_ORDER;
END
GO
