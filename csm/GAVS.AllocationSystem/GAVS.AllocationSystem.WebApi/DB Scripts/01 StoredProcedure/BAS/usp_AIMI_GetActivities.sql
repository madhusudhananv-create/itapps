-- Flexible read covering the three single-project Firestore queries AIMI used to run:
-- getActivityById, getActivitiesByProjectIdAndPractice, getActivitiesByProjectId.
-- Pass whichever combination of @ID / @PROJECT_ID / @PRACTICE the caller has; any
-- left NULL is not filtered on. Tool/accelerator/benefit junction rows are folded
-- back into each activity row as JSON arrays so the API layer gets one row per
-- activity, matching the shape the React service layer already expects.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetActivities' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetActivities]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetActivities]
    @ID INT = NULL,
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.ID, a.PROJECT_ID, a.PROJECT, a.ACCOUNT, a.BUSINESS_UNIT, a.PRACTICE,
        a.SDLC_PHASE, a.ACTIVITY, a.APPLICABILITY, a.AI_ADOPTION_SCORE, a.WORK_DONE_BY_AI,
        a.HOURS_SAVED, a.REVENUE_GENERATED, a.BENEFIT_TO, a.COMMENTS, a.STATUS,
        a.ACCEPTED_SCORE, a.SCORE_REVIEWED, a.ACCEPTED_SCORE_COMMENT,
        a.CREATED_BY, a.CREATED_DATE, a.UPDATED_BY, a.UPDATED_DATE,
        (SELECT TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE
           FROM AIMI_ACTIVITY_AI_TOOL t WHERE t.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS AI_TOOLS_JSON,
        (SELECT ACCELERATOR_NAME
           FROM AIMI_ACTIVITY_ACCELERATOR ac WHERE ac.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS ACCELERATORS_JSON,
        (SELECT BENEFIT_NAME
           FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT qb WHERE qb.ACTIVITY_ID = a.ID
           FOR JSON PATH) AS QUALITATIVE_BENEFITS_JSON
    FROM AIMI_ACTIVITY a
    WHERE a.ISACTIVE = 1
      AND (@ID IS NULL OR a.ID = @ID)
      AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
      AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
    ORDER BY a.CREATED_DATE DESC;
END
GO
