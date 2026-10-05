-- Inserts a new AIMI_ACTIVITY row, or updates an existing one when @ID is supplied,
-- and replaces its AI Tool / Accelerator / Qualitative Benefit junction rows in the
-- same call (equivalent to the old Firestore addDoc/updateDoc on the activities collection).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_UpsertActivity' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_UpsertActivity]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_UpsertActivity]
    @ID INT = NULL OUTPUT,
    @PROJECT_ID VARCHAR(20),
    @PROJECT NVARCHAR(200) = NULL,
    @ACCOUNT NVARCHAR(200) = NULL,
    @BUSINESS_UNIT VARCHAR(100) = NULL,
    @PRACTICE VARCHAR(100),
    @SDLC_PHASE VARCHAR(200),
    @ACTIVITY VARCHAR(500),
    @APPLICABILITY VARCHAR(20) = NULL,
    @AI_ADOPTION_SCORE TINYINT = NULL,
    @WORK_DONE_BY_AI TINYINT = NULL,
    @HOURS_SAVED DECIMAL(10,2) = NULL,
    @REVENUE_GENERATED VARCHAR(5) = NULL,
    @BENEFIT_TO VARCHAR(20) = NULL,
    @COMMENTS NVARCHAR(MAX) = NULL,
    @STATUS VARCHAR(20) = NULL,
    @AI_TOOLS dbo.AIMI_AI_TOOL_TABLE_TYPE READONLY,
    @ACCELERATORS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @QUALITATIVE_BENEFITS dbo.AIMI_STRING_LIST_TABLE_TYPE READONLY,
    @EMP_ID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        IF @ID IS NULL OR NOT EXISTS (SELECT 1 FROM AIMI_ACTIVITY WHERE ID = @ID)
        BEGIN
            -- A new activity inherits the practice's current review (Accepted Score etc.)
            -- so the reviewed score still shows once every activity row carries it.
            DECLARE @ACCEPTED_SCORE DECIMAL(4,2), @SCORE_REVIEWED BIT = 0, @ACCEPTED_SCORE_COMMENT NVARCHAR(MAX);
            SELECT TOP 1 @ACCEPTED_SCORE = ACCEPTED_SCORE, @SCORE_REVIEWED = SCORE_REVIEWED, @ACCEPTED_SCORE_COMMENT = ACCEPTED_SCORE_COMMENT
              FROM AIMI_ACTIVITY
             WHERE PROJECT_ID = @PROJECT_ID AND PRACTICE = @PRACTICE AND ISACTIVE = 1
               AND (ACCEPTED_SCORE IS NOT NULL OR SCORE_REVIEWED = 1 OR ACCEPTED_SCORE_COMMENT IS NOT NULL)
             ORDER BY UPDATED_DATE DESC;

            INSERT INTO AIMI_ACTIVITY
                (PROJECT_ID, PROJECT, ACCOUNT, BUSINESS_UNIT, PRACTICE, SDLC_PHASE, ACTIVITY,
                 APPLICABILITY, AI_ADOPTION_SCORE, WORK_DONE_BY_AI, HOURS_SAVED, REVENUE_GENERATED,
                 BENEFIT_TO, COMMENTS, STATUS, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE, ISACTIVE,
                 ACCEPTED_SCORE, SCORE_REVIEWED, ACCEPTED_SCORE_COMMENT)
            VALUES
                (@PROJECT_ID, @PROJECT, @ACCOUNT, @BUSINESS_UNIT, @PRACTICE, @SDLC_PHASE, @ACTIVITY,
                 @APPLICABILITY, @AI_ADOPTION_SCORE, @WORK_DONE_BY_AI, @HOURS_SAVED, @REVENUE_GENERATED,
                 @BENEFIT_TO, @COMMENTS, @STATUS, @EMP_ID, GETDATE(), @EMP_ID, GETDATE(), 1,
                 @ACCEPTED_SCORE, @SCORE_REVIEWED, @ACCEPTED_SCORE_COMMENT);

            SET @ID = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE AIMI_ACTIVITY
               SET PROJECT_ID = @PROJECT_ID,
                   PROJECT = @PROJECT,
                   ACCOUNT = @ACCOUNT,
                   BUSINESS_UNIT = @BUSINESS_UNIT,
                   PRACTICE = @PRACTICE,
                   SDLC_PHASE = @SDLC_PHASE,
                   ACTIVITY = @ACTIVITY,
                   APPLICABILITY = @APPLICABILITY,
                   AI_ADOPTION_SCORE = @AI_ADOPTION_SCORE,
                   WORK_DONE_BY_AI = @WORK_DONE_BY_AI,
                   HOURS_SAVED = @HOURS_SAVED,
                   REVENUE_GENERATED = @REVENUE_GENERATED,
                   BENEFIT_TO = @BENEFIT_TO,
                   COMMENTS = @COMMENTS,
                   STATUS = @STATUS,
                   UPDATED_BY = @EMP_ID,
                   UPDATED_DATE = GETDATE()
             WHERE ID = @ID;
        END

        -- Replace junction rows wholesale - simplest correct way to keep them in sync
        -- with whatever set of tools/accelerators/benefits the UI currently has selected.
        DELETE FROM AIMI_ACTIVITY_AI_TOOL WHERE ACTIVITY_ID = @ID;
        INSERT INTO AIMI_ACTIVITY_AI_TOOL (ACTIVITY_ID, TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE)
        SELECT @ID, TOOL_NAME, ACCESS_TYPE, LICENSE_COUNT, NETWORK_TYPE FROM @AI_TOOLS;

        DELETE FROM AIMI_ACTIVITY_ACCELERATOR WHERE ACTIVITY_ID = @ID;
        INSERT INTO AIMI_ACTIVITY_ACCELERATOR (ACTIVITY_ID, ACCELERATOR_NAME)
        SELECT @ID, VALUE_TEXT FROM @ACCELERATORS;

        DELETE FROM AIMI_ACTIVITY_QUALITATIVE_BENEFIT WHERE ACTIVITY_ID = @ID;
        INSERT INTO AIMI_ACTIVITY_QUALITATIVE_BENEFIT (ACTIVITY_ID, BENEFIT_NAME)
        SELECT @ID, VALUE_TEXT FROM @QUALITATIVE_BENEFITS;

        COMMIT TRANSACTION;

        -- EF6's Database.SqlQuery<int> is unreliable when a proc only has an
        -- OUTPUT parameter and no result set (throws "data reader has more
        -- than one field"), so the id is also returned as a plain one-column
        -- result set instead of relying solely on @ID OUTPUT.
        SELECT @ID AS ID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
