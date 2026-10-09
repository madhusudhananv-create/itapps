-- Monthly score snapshots for the AIMI Analytics dashboard. One row per project + practice per
-- month, written by usp_AIMI_CaptureScoreSnapshot, so trends are read from stored history
-- instead of being recalculated from the live activities (which only ever show "now").
IF NOT EXISTS(SELECT 1 FROM sys.tables WHERE name ='AIMI_SCORE_HISTORY' AND type='U')
BEGIN
CREATE TABLE AIMI_SCORE_HISTORY (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    SNAPSHOT_MONTH DATE NOT NULL,                 -- first day of the month
    PROJECT_ID VARCHAR(20) NOT NULL,
    PROJECT NVARCHAR(200) NOT NULL,
    ACCOUNT NVARCHAR(200) NOT NULL,
    BUSINESS_UNIT VARCHAR(100) NOT NULL,
    PRACTICE VARCHAR(100) NOT NULL,
    CURRENT_SCORE DECIMAL(4,2) NULL,              -- 0-5 ; NULL = nothing scored (all activities N/A)
    ACCEPTED_SCORE DECIMAL(4,2) NULL,             -- admin-reviewed score, NULL = not reviewed
    ACTIVITY_COUNT INT NOT NULL DEFAULT(0),
    SCORED_ACTIVITY_COUNT INT NOT NULL DEFAULT(0),
    CAPTURED_BY VARCHAR(10) NULL,
    CAPTURED_DATE DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT UQ_AIMI_SCORE_HISTORY UNIQUE (SNAPSHOT_MONTH, PROJECT_ID, PRACTICE)
);

CREATE INDEX IX_AIMI_SCORE_HISTORY_MONTH
    ON AIMI_SCORE_HISTORY (SNAPSHOT_MONTH)
    INCLUDE (BUSINESS_UNIT, ACCOUNT, PROJECT, PRACTICE, CURRENT_SCORE, ACCEPTED_SCORE);
END
GO
