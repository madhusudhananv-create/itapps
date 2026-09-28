----------------------------------------------------------------------------------------------------
-- AIMI (AI Maturity Index Platform) - Firebase to SQL migration - Phase 1
-- Creates the core tables + supporting table types for the AIMI domain
-- (previously stored in Firestore collections: activities, projectInfo, practiceInfo).
-- Safe to re-run: every object is created only if it does not already exist.
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- AIMI_PROJECT_INFO  (was Firestore collection: projectInfo - 1 doc per PROJECT_ID)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_PROJECT_INFO' AND type='U')
BEGIN
CREATE TABLE AIMI_PROJECT_INFO (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    PROJECT_ID VARCHAR(20) NOT NULL,

    PEOPLE_USING_AI INT NULL,
    IS_PROJECT_NA BIT NOT NULL DEFAULT(0),
    NA_COMMENTS NVARCHAR(MAX) NULL,
    LICENSE_COUNT INT NULL,
    LICENSE_PROVIDER VARCHAR(50) NULL,

    -- RunOps Adoption Metrics
    RUNOPS_AUTO_RESOLVED VARCHAR(100) NULL,
    RUNOPS_MTTR_REDUCTION VARCHAR(100) NULL,
    RUNOPS_AI_AGENTS VARCHAR(100) NULL,
    RUNOPS_AUTOMATED_WORKFLOWS VARCHAR(100) NULL,
    RUNOPS_MTTD VARCHAR(100) NULL,
    RUNOPS_MTTR VARCHAR(100) NULL,

    -- Engineering Adoption Metrics
    ENGINEER_AI_AGENTS VARCHAR(100) NULL,
    ENGINEER_DELIVERY_CYCLE_TIME VARCHAR(100) NULL,
    ENGINEER_CONTRACT_TEST_CASE_PASS_RATE VARCHAR(100) NULL,
    ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE VARCHAR(100) NULL,

    -- Common Adoption Metrics
    COMMON_ADOPTION_WORKFORCE_CERTIFICATION VARCHAR(100) NULL,
    COMMON_ADOPTION_EFFORTS_SAVED VARCHAR(100) NULL,
    COMMON_DEPLOYMENT_ENGINEER VARCHAR(100) NULL,

    PRESENTATION_DONE BIT NOT NULL DEFAULT(0),
    PROJECT_FY VARCHAR(10) NULL,
    ACCEPTED_SCORE DECIMAL(4,2) NULL,
    SCORE_REVIEWED BIT NOT NULL DEFAULT(0),
    ACCEPTED_SCORE_COMMENT NVARCHAR(MAX) NULL,

    CREATED_BY VARCHAR(10) NULL,
    CREATED_DATE DATETIME NULL,
    UPDATED_BY VARCHAR(10) NULL,
    UPDATED_DATE DATETIME NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

-- One active row per project (mirrors the query-then-upsert behaviour the Firestore
-- service enforced in application code only).
CREATE UNIQUE INDEX UQ_AIMI_PROJECT_INFO_PROJECT_ID
    ON AIMI_PROJECT_INFO (PROJECT_ID) WHERE ISACTIVE = 1;
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_PRACTICE_INFO  (was Firestore collection: practiceInfo - 1 doc per (PROJECT_ID, PRACTICE))
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_PRACTICE_INFO' AND type='U')
BEGIN
CREATE TABLE AIMI_PRACTICE_INFO (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    PROJECT_ID VARCHAR(20) NOT NULL,
    PRACTICE VARCHAR(100) NOT NULL,
    CURRENT_PHASE VARCHAR(200) NULL,

    CREATED_BY VARCHAR(10) NULL,
    CREATED_DATE DATETIME NULL,
    UPDATED_BY VARCHAR(10) NULL,
    UPDATED_DATE DATETIME NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_PRACTICE_INFO_PROJECT_PRACTICE
    ON AIMI_PRACTICE_INFO (PROJECT_ID, PRACTICE) WHERE ISACTIVE = 1;
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY  (was Firestore collection: activities)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,

    -- Project context snapshot (denormalized at write time, same as the Firestore doc did;
    -- PROJECT_ID/PROJECT/ACCOUNT/BUSINESS_UNIT are not FK'd to PROJECT here - the master
    -- project list is owned by the existing CSM API/PROJECT table, not this new domain).
    PROJECT_ID VARCHAR(20) NOT NULL,
    PROJECT NVARCHAR(200) NULL,
    ACCOUNT NVARCHAR(200) NULL,
    BUSINESS_UNIT VARCHAR(100) NULL,
    PRACTICE VARCHAR(100) NOT NULL,

    SDLC_PHASE VARCHAR(200) NOT NULL,
    ACTIVITY VARCHAR(500) NOT NULL,
    APPLICABILITY VARCHAR(20) NULL,          -- Yes | No | Activity NA | Customer NA
    AI_ADOPTION_SCORE TINYINT NULL,          -- 0-5 ; NULL = not applicable / not scored
    WORK_DONE_BY_AI TINYINT NULL,            -- 0-100
    HOURS_SAVED DECIMAL(10,2) NULL,
    REVENUE_GENERATED VARCHAR(5) NULL,       -- Yes | No
    BENEFIT_TO VARCHAR(20) NULL,             -- Neurealm | Customer | Both
    COMMENTS NVARCHAR(MAX) NULL,
    STATUS VARCHAR(20) NULL,                 -- draft | submitted

    CREATED_BY VARCHAR(10) NULL,
    CREATED_DATE DATETIME NULL,
    UPDATED_BY VARCHAR(10) NULL,
    UPDATED_DATE DATETIME NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE INDEX IX_AIMI_ACTIVITY_PROJECT_PRACTICE ON AIMI_ACTIVITY (PROJECT_ID, PRACTICE) WHERE ISACTIVE = 1;
CREATE INDEX IX_AIMI_ACTIVITY_BUSINESS_UNIT ON AIMI_ACTIVITY (BUSINESS_UNIT) WHERE ISACTIVE = 1;
CREATE INDEX IX_AIMI_ACTIVITY_ACCOUNT ON AIMI_ACTIVITY (ACCOUNT) WHERE ISACTIVE = 1;
CREATE INDEX IX_AIMI_ACTIVITY_PROJECT ON AIMI_ACTIVITY (PROJECT) WHERE ISACTIVE = 1;
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_AI_TOOL  (was the aiToolUsed[] array + aiToolDetails{} map on the activity doc)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_AI_TOOL' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_AI_TOOL (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    ACTIVITY_ID INT NOT NULL,
    TOOL_NAME VARCHAR(200) NOT NULL,
    ACCESS_TYPE VARCHAR(20) NULL,     -- Licensed | Not-Licensed
    LICENSE_COUNT INT NULL,
    NETWORK_TYPE VARCHAR(20) NULL,    -- Customer | Neurealm

    CONSTRAINT FK_AIMI_ACTIVITY_AI_TOOL_ACTIVITY
        FOREIGN KEY (ACTIVITY_ID) REFERENCES AIMI_ACTIVITY (ID) ON DELETE CASCADE
);

CREATE INDEX IX_AIMI_ACTIVITY_AI_TOOL_ACTIVITY_ID ON AIMI_ACTIVITY_AI_TOOL (ACTIVITY_ID);
CREATE INDEX IX_AIMI_ACTIVITY_AI_TOOL_TOOL_NAME ON AIMI_ACTIVITY_AI_TOOL (TOOL_NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_ACCELERATOR  (was the acceleratorsUsed[] array on the activity doc)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_ACCELERATOR' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_ACCELERATOR (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    ACTIVITY_ID INT NOT NULL,
    ACCELERATOR_NAME VARCHAR(200) NOT NULL,

    CONSTRAINT FK_AIMI_ACTIVITY_ACCELERATOR_ACTIVITY
        FOREIGN KEY (ACTIVITY_ID) REFERENCES AIMI_ACTIVITY (ID) ON DELETE CASCADE
);

CREATE INDEX IX_AIMI_ACTIVITY_ACCELERATOR_ACTIVITY_ID ON AIMI_ACTIVITY_ACCELERATOR (ACTIVITY_ID);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_QUALITATIVE_BENEFIT  (was the qualitativeBenefits[] array on the activity doc)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_QUALITATIVE_BENEFIT' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_QUALITATIVE_BENEFIT (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    ACTIVITY_ID INT NOT NULL,
    BENEFIT_NAME VARCHAR(200) NOT NULL,

    CONSTRAINT FK_AIMI_ACTIVITY_QUAL_BENEFIT_ACTIVITY
        FOREIGN KEY (ACTIVITY_ID) REFERENCES AIMI_ACTIVITY (ID) ON DELETE CASCADE
);

CREATE INDEX IX_AIMI_ACTIVITY_QUAL_BENEFIT_ACTIVITY_ID ON AIMI_ACTIVITY_QUALITATIVE_BENEFIT (ACTIVITY_ID);
CREATE INDEX IX_AIMI_ACTIVITY_QUAL_BENEFIT_NAME ON AIMI_ACTIVITY_QUALITATIVE_BENEFIT (BENEFIT_NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- Table types used by the AIMI_* stored procedures (DB Scripts/01 StoredProcedure/BAS)
-- CREATE TYPE must be the only statement in its batch, so it is wrapped in EXEC(...).
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.types WHERE name = 'AIMI_STRING_LIST_TABLE_TYPE' AND is_table_type = 1)
BEGIN
    EXEC('CREATE TYPE dbo.AIMI_STRING_LIST_TABLE_TYPE AS TABLE (VALUE_TEXT VARCHAR(200) NOT NULL)')
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.types WHERE name = 'AIMI_ID_LIST_TABLE_TYPE' AND is_table_type = 1)
BEGIN
    EXEC('CREATE TYPE dbo.AIMI_ID_LIST_TABLE_TYPE AS TABLE (ID INT NOT NULL)')
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.types WHERE name = 'AIMI_AI_TOOL_TABLE_TYPE' AND is_table_type = 1)
BEGIN
    EXEC('CREATE TYPE dbo.AIMI_AI_TOOL_TABLE_TYPE AS TABLE (
        TOOL_NAME VARCHAR(200) NOT NULL,
        ACCESS_TYPE VARCHAR(20) NULL,
        LICENSE_COUNT INT NULL,
        NETWORK_TYPE VARCHAR(20) NULL
    )')
END
GO

----------------------------------------------------------------------------------------------------
-- Permissions: AIMI already uses APP_ACCESS_CONTROLS resource id 833 client-side
-- (see csp-angular19/src/microapps/AIMI/src/shared/utils/accessControl.ts - AIMI_ADMIN_RESOURCE_ID)
-- for its admin role check. That resource id is already provisioned, so no new
-- APP_CONTROLS / APP_ACCESS_CONTROLS rows are needed here - the new AimiController
-- will call CheckAccessForFeature(833) for admin-gated actions (delete, bulk-delete,
-- review score) exactly the same way the client already gates its own UI.
----------------------------------------------------------------------------------------------------
