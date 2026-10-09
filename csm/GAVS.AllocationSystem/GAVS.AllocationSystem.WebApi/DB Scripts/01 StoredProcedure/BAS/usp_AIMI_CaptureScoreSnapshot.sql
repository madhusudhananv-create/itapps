-- Writes the monthly score snapshot (AIMI_SCORE_HISTORY) from the live AIMI_ACTIVITY rows.
-- One row per PROJECT_ID + PRACTICE per month. Safe to run any number of times: the row for
-- the month is created on first run and refreshed (or removed, if the project/practice no
-- longer has active activities) on later runs, so a month always ends with its last value.
--
--   * No parameters            -> every project/practice, current month (month-end job, lazy refresh)
--   * @PROJECT_ID / @PRACTICE  -> only that project/practice (called after an activity or an
--                                 accepted score is saved, so the current month stays up to date)
--   * @SNAPSHOT_MONTH          -> any day in the month to (re)capture; defaults to this month
--
-- CURRENT_SCORE uses the same rule as the client's calculateAverageAIAdoptionScore():
-- average AI_ADOPTION_SCORE of the practice's activities, skipping SDLC_PHASE 'NA' and
-- activities with no score. ACCEPTED_SCORE is the admin-reviewed score stored on those rows.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_CaptureScoreSnapshot' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_CaptureScoreSnapshot]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_CaptureScoreSnapshot]
    @SNAPSHOT_MONTH DATE = NULL,
    @PROJECT_ID VARCHAR(20) = NULL,
    @PRACTICE VARCHAR(100) = NULL,
    @EMP_ID VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BASE DATE = ISNULL(@SNAPSHOT_MONTH, CAST(GETDATE() AS DATE));
    DECLARE @MONTH DATE = DATEFROMPARTS(YEAR(@BASE), MONTH(@BASE), 1);

    ;WITH SRC AS (
        SELECT
            a.PROJECT_ID,
            a.PRACTICE,
            ISNULL(MAX(a.PROJECT), 'Unassigned') AS PROJECT,
            ISNULL(MAX(a.ACCOUNT), 'Unassigned') AS ACCOUNT,
            ISNULL(MAX(a.BUSINESS_UNIT), 'Unassigned') AS BUSINESS_UNIT,
            CAST(ROUND(AVG(CASE WHEN a.SDLC_PHASE <> 'NA' AND a.AI_ADOPTION_SCORE IS NOT NULL
                                THEN CAST(a.AI_ADOPTION_SCORE AS DECIMAL(9,4)) END), 2) AS DECIMAL(4,2)) AS CURRENT_SCORE,
            MAX(a.ACCEPTED_SCORE) AS ACCEPTED_SCORE,
            COUNT(*) AS ACTIVITY_COUNT,
            SUM(CASE WHEN a.SDLC_PHASE <> 'NA' AND a.AI_ADOPTION_SCORE IS NOT NULL THEN 1 ELSE 0 END) AS SCORED_ACTIVITY_COUNT
        FROM AIMI_ACTIVITY a
        WHERE a.ISACTIVE = 1
          AND (@PROJECT_ID IS NULL OR a.PROJECT_ID = @PROJECT_ID)
          AND (@PRACTICE IS NULL OR a.PRACTICE = @PRACTICE)
        GROUP BY a.PROJECT_ID, a.PRACTICE
    )
    MERGE AIMI_SCORE_HISTORY AS t
    USING SRC AS s
       ON t.SNAPSHOT_MONTH = @MONTH AND t.PROJECT_ID = s.PROJECT_ID AND t.PRACTICE = s.PRACTICE
    WHEN MATCHED THEN
        UPDATE SET t.PROJECT = s.PROJECT, t.ACCOUNT = s.ACCOUNT, t.BUSINESS_UNIT = s.BUSINESS_UNIT,
                   t.CURRENT_SCORE = s.CURRENT_SCORE, t.ACCEPTED_SCORE = s.ACCEPTED_SCORE,
                   t.ACTIVITY_COUNT = s.ACTIVITY_COUNT, t.SCORED_ACTIVITY_COUNT = s.SCORED_ACTIVITY_COUNT,
                   t.CAPTURED_BY = @EMP_ID, t.CAPTURED_DATE = GETDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (SNAPSHOT_MONTH, PROJECT_ID, PROJECT, ACCOUNT, BUSINESS_UNIT, PRACTICE,
                CURRENT_SCORE, ACCEPTED_SCORE, ACTIVITY_COUNT, SCORED_ACTIVITY_COUNT, CAPTURED_BY, CAPTURED_DATE)
        VALUES (@MONTH, s.PROJECT_ID, s.PROJECT, s.ACCOUNT, s.BUSINESS_UNIT, s.PRACTICE,
                s.CURRENT_SCORE, s.ACCEPTED_SCORE, s.ACTIVITY_COUNT, s.SCORED_ACTIVITY_COUNT, @EMP_ID, GETDATE())
    WHEN NOT MATCHED BY SOURCE
         AND t.SNAPSHOT_MONTH = @MONTH
         AND (@PROJECT_ID IS NULL OR t.PROJECT_ID = @PROJECT_ID)
         AND (@PRACTICE IS NULL OR t.PRACTICE = @PRACTICE) THEN
        DELETE;
END
GO
