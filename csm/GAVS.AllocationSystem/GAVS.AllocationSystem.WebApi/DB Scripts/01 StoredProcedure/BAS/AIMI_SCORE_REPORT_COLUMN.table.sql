-- Which columns the AIMI Analytics "Download report" contains, per view, and what each is called.
-- usp_AIMI_GetScoreReport reads this table, so a column can be renamed, hidden or reordered with a
-- plain UPDATE, no code change or deployment. Examples:
--     UPDATE AIMI_SCORE_REPORT_COLUMN SET HEADER = 'Current Score' WHERE FIELD = 'OVERALL_SCORE';
--     UPDATE AIMI_SCORE_REPORT_COLUMN SET IS_ACTIVE = 0 WHERE FIELD = 'AS_OF_MONTH';
--
-- REPORT_LEVEL   BU | ACCOUNT | PROJECT | PRACTICE  (the view the report is downloaded from)
-- FIELD   what to show, one of: GROUP_NAME, BUSINESS_UNIT, ACCOUNT, PROJECT_ID, AS_OF_MONTH,
--         OVERALL_SCORE, ACCEPTED_SCORE, DIFFERENCE, AVERAGE_SCORE
-- HEADER  the column title in the file; {MONTHS} is replaced by the history range (6, 12, 24)
IF NOT EXISTS(SELECT 1 FROM sys.tables WHERE name ='AIMI_SCORE_REPORT_COLUMN' AND type='U')
BEGIN
CREATE TABLE AIMI_SCORE_REPORT_COLUMN (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    REPORT_LEVEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL,
    FIELD VARCHAR(50) NOT NULL,
    HEADER NVARCHAR(100) NOT NULL,
    IS_ACTIVE BIT NOT NULL DEFAULT(1),
    CONSTRAINT UQ_AIMI_SCORE_REPORT_COLUMN UNIQUE (REPORT_LEVEL, FIELD)
);

INSERT INTO AIMI_SCORE_REPORT_COLUMN (REPORT_LEVEL, SORT_ORDER, FIELD, HEADER) VALUES
-- Business Unit view
('BU', 1, 'GROUP_NAME',     'Business Unit'),
('BU', 2, 'AS_OF_MONTH',    'As of'),
('BU', 3, 'OVERALL_SCORE',  'Overall Score'),
('BU', 4, 'ACCEPTED_SCORE', 'Accepted Score'),
('BU', 5, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('BU', 6, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)'),
-- Account view
('ACCOUNT', 1, 'BUSINESS_UNIT',  'Business Unit'),
('ACCOUNT', 2, 'GROUP_NAME',     'Account'),
('ACCOUNT', 3, 'AS_OF_MONTH',    'As of'),
('ACCOUNT', 4, 'OVERALL_SCORE',  'Overall Score'),
('ACCOUNT', 5, 'ACCEPTED_SCORE', 'Accepted Score'),
('ACCOUNT', 6, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('ACCOUNT', 7, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)'),
-- Project view
('PROJECT', 1, 'BUSINESS_UNIT',  'Business Unit'),
('PROJECT', 2, 'ACCOUNT',        'Account'),
('PROJECT', 3, 'PROJECT_ID',     'Project ID'),
('PROJECT', 4, 'GROUP_NAME',     'Project'),
('PROJECT', 5, 'AS_OF_MONTH',    'As of'),
('PROJECT', 6, 'OVERALL_SCORE',  'Overall Score'),
('PROJECT', 7, 'ACCEPTED_SCORE', 'Accepted Score'),
('PROJECT', 8, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('PROJECT', 9, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)'),
-- Practice view
('PRACTICE', 1, 'GROUP_NAME',     'Practice'),
('PRACTICE', 2, 'AS_OF_MONTH',    'As of'),
('PRACTICE', 3, 'OVERALL_SCORE',  'Overall Score'),
('PRACTICE', 4, 'ACCEPTED_SCORE', 'Accepted Score'),
('PRACTICE', 5, 'DIFFERENCE',     'Difference (Accepted - Overall)'),
('PRACTICE', 6, 'AVERAGE_SCORE',  'Average Score (last {MONTHS} months)');
END
GO
