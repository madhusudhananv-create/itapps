-- Which columns the AIMI activity reports contain, what each is called and in what order. Read by
-- usp_AIMI_GetActivityReport, so a column can be renamed, hidden or reordered with a plain UPDATE,
-- no code change or deployment. Examples:
--     UPDATE AIMI_ACTIVITY_REPORT_COLUMN SET HEADER = 'Business Head Name' WHERE FIELD = 'BUSINESS_HEAD';
--     UPDATE AIMI_ACTIVITY_REPORT_COLUMN SET IS_ACTIVE = 0 WHERE REPORT_TYPE = 'MULTI' AND FIELD = 'COMMENTS';
--
-- REPORT_TYPE  PROJECT = Manage Activities > Generate Report (one project + practice)
--              MULTI   = Reports page > Generate Reports (several BUs / accounts / projects)
-- FIELD        one of the fields usp_AIMI_GetActivityReport computes (see the list in that proc)
-- HEADER       the column title in the file
IF NOT EXISTS(SELECT 1 FROM sys.tables WHERE name ='AIMI_ACTIVITY_REPORT_COLUMN' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_REPORT_COLUMN (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    REPORT_TYPE VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL,
    FIELD VARCHAR(60) NOT NULL,
    HEADER NVARCHAR(120) NOT NULL,   -- max 120 so it fits QUOTENAME; avoid dots (they nest the JSON)
    IS_ACTIVE BIT NOT NULL DEFAULT(1),
    CONSTRAINT UQ_AIMI_ACTIVITY_REPORT_COLUMN UNIQUE (REPORT_TYPE, FIELD)
);

-- The default column set (the same headings the reports have always had). 'Client Approved' is not
-- included: the old report printed that heading but never had a value for it, which pushed every
-- column after it one place to the right.
DECLARE @DEFAULTS TABLE (SORT_ORDER INT, FIELD VARCHAR(60), HEADER NVARCHAR(120));
INSERT INTO @DEFAULTS (SORT_ORDER, FIELD, HEADER) VALUES
(1,  'BUSINESS_UNIT',                              'Business Unit'),
(2,  'BUSINESS_HEAD',                              'Business Head'),
(3,  'ACCOUNT',                                    'Account'),
(4,  'ACCOUNT_MANAGER',                            'Account Manager'),
(5,  'PROJECT',                                    'Project'),
(6,  'PROJECT_ID',                                 'Project ID'),
(7,  'MANAGER',                                    'Manager'),
(8,  'HEADCOUNT',                                  'Head Count'),
(9,  'PRACTICE',                                   'Practice'),
(10, 'PEOPLE_USING_AI',                            '# of People Using AI'),
(11, 'LICENSE_COUNT',                              'License Count'),
(12, 'LICENSE_PROVIDER',                           'License Provider'),
(13, 'RUNOPS_AUTO_RESOLVED',                       '% Tickets Auto-Resolved by AI'),
(14, 'RUNOPS_MTTR_REDUCTION',                      'MTTR Reduction vs Traditional Model'),
(15, 'RUNOPS_AI_AGENTS',                           '# AI Agents in Production (Not Pilots)'),
(16, 'RUNOPS_AUTOMATED_WORKFLOWS',                 '# End-to-End Workflows Re-imagined and Automated'),
(17, 'RUNOPS_MTTD',                                '# MTTD (Mean Time to Detect)'),
(18, 'RUNOPS_MTTR',                                '# MTTR (Mean Time to Respond or Repair)'),
(19, 'ENGINEER_DELIVERY_CYCLE_TIME',               'Delivery cycle-time reduction attributable to AI'),
(20, 'ENGINEER_AI_AGENTS',                         '# AI agents in production (not pilots / POC)'),
(21, 'ENGINEER_CONTRACT_TEST_CASE_PASS_RATE',      'Contract Test case Pass Rate (%) (Passed Tests / Total Executed Tests) x 100'),
(22, 'ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE',   'Performance Defects Detected Pre-release (%)'),
(23, 'COMMON_ADOPTION_WORKFORCE_CERTIFICATION',    '% workforce with externally validated AI / GenAI / Agentic AI certification'),
(24, 'COMMON_ADOPTION_EFFORTS_SAVED',              'Efforts saved in hours'),
(25, 'COMMON_DEPLOYMENT_ENGINEER',                 '# FDE ( Forward Deployment Engineer) penetration as % of client-facing headcount'),
(26, 'OVERALL_SCORE',                              'Overall Score'),
(27, 'ACCEPTED_SCORE',                             'Accepted Score'),
(28, 'ACCEPTED_SCORE_COMMENT',                     'Accepted Comment'),
(29, 'SDLC_PHASE',                                 'SDLC Phase'),
(30, 'ACTIVITY',                                   'Activity'),
(31, 'APPLICABILITY',                              'Applicability'),
(32, 'AI_ADOPTION_SCORE',                          'AI Adoption Score'),
(33, 'AI_TOOLS_USED',                              'AI Tools Used'),
(34, 'ACCELERATORS_USED',                          'Accelerators Used'),
(35, 'WORK_DONE_BY_AI',                            'Work Done by AI (%)'),
(36, 'HOURS_SAVED',                                'Hours Saved'),
(37, 'REVENUE_GENERATED',                          'Revenue Generated'),
(38, 'BENEFIT_TO',                                 'Benefit To'),
(39, 'QUALITATIVE_BENEFITS',                       'Qualitative Benefits'),
(40, 'COMMENTS',                                   'Comments'),
(41, 'CREATED_DATE',                               'Created Date'),
(42, 'LAST_UPDATED_DATE',                          'Last Updated Date');

INSERT INTO AIMI_ACTIVITY_REPORT_COLUMN (REPORT_TYPE, SORT_ORDER, FIELD, HEADER)
SELECT t.REPORT_TYPE, d.SORT_ORDER, d.FIELD, d.HEADER
FROM @DEFAULTS d
CROSS JOIN (VALUES ('PROJECT'), ('MULTI')) t (REPORT_TYPE);
END
GO
