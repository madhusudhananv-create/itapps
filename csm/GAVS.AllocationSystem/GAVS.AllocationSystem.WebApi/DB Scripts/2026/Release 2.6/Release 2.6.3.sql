----------------------------------------------------------------------------------------------------
-- AIMI (AI Maturity Index Platform) - Firebase to SQL migration - Phase 2
-- Lookup/reference tables for values that are currently hardcoded in the React source
-- (src/microapps/AIMI/src) instead of being driven by data:
--   - questionnaire.json                 -> AIMI_PRACTICE / AIMI_SDLC_PHASE / AIMI_QUESTIONNAIRE_ACTIVITY
--   - activityTypes.ts (QUALITATIVE_BENEFITS)      -> AIMI_QUALITATIVE_BENEFIT
--   - activityTypes.ts (AI_ADOPTION_SCORES)        -> AIMI_AI_ADOPTION_SCORE
--   - activityTypes.ts (COMMON_AI_TOOLS)           -> AIMI_AI_TOOL
--   - activityTypes.ts (COMMON_ACCELERATORS)       -> AIMI_ACCELERATOR
--   - activityTypes.ts (APPLICABILITY_OPTIONS)     -> AIMI_APPLICABILITY
--   - activityTypes.ts (BENEFIT_TO_OPTIONS)        -> AIMI_BENEFIT_TO
--   - ProjectInfoSelection.tsx (inline 'Client'/'Neurealm' literals) -> AIMI_LICENSE_PROVIDER
--   - activityTypes.ts (ActivityStatus union type)  -> AIMI_ACTIVITY_STATUS
--
-- Plain Yes/No and two-value flags (REVENUE_GENERATED_OPTIONS, CLIENT_APPROVED_OPTIONS, the
-- AI-tool ACCESS_TYPE/NETWORK_TYPE options) are intentionally NOT modeled as lookup tables here -
-- a binary flag doesn't need a FK'd reference table, a CHECK-constrained column is enough.
--
-- These are pure reference/lookup tables, seeded from the values that exist in the client today.
-- None of the existing AIMI_* transactional tables (AIMI_ACTIVITY, AIMI_PROJECT_INFO, ...) are
-- altered here - wiring FK columns into them is a follow-up once the client reads these lists
-- from an API instead of from hardcoded arrays.
--
-- Safe to re-run: every table is created only if it does not already exist, and each table is
-- seeded only the first time (guarded by "IF NOT EXISTS (SELECT 1 FROM <table>)").
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- AIMI_PRACTICE  (was the flat list derived from questionnaire.json practices[])
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_PRACTICE' AND type='U')
BEGIN
CREATE TABLE AIMI_PRACTICE (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_PRACTICE_NAME ON AIMI_PRACTICE (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_SDLC_PHASE  (was questionnaire.json practices[].sdlcPhases[] - phase names are NOT a
-- global enum, each practice has its own phase vocabulary, so this is scoped per practice)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_SDLC_PHASE' AND type='U')
BEGIN
CREATE TABLE AIMI_SDLC_PHASE (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    PRACTICE_ID INT NOT NULL,
    NAME VARCHAR(200) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1),

    CONSTRAINT FK_AIMI_SDLC_PHASE_PRACTICE
        FOREIGN KEY (PRACTICE_ID) REFERENCES AIMI_PRACTICE (ID)
);

CREATE UNIQUE INDEX UQ_AIMI_SDLC_PHASE_PRACTICE_NAME ON AIMI_SDLC_PHASE (PRACTICE_ID, NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_QUESTIONNAIRE_ACTIVITY  (was questionnaire.json ...sdlcPhases[].activities[] - the catalog
-- of activities the questionnaire/manage-activities screen presents per phase. Distinct from the
-- existing AIMI_ACTIVITY table, which stores the per-project activity log entries a user submits,
-- not the master catalog of possible activities.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_QUESTIONNAIRE_ACTIVITY' AND type='U')
BEGIN
CREATE TABLE AIMI_QUESTIONNAIRE_ACTIVITY (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    SDLC_PHASE_ID INT NOT NULL,
    ACTIVITY NVARCHAR(1000) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1),

    CONSTRAINT FK_AIMI_QUESTIONNAIRE_ACTIVITY_PHASE
        FOREIGN KEY (SDLC_PHASE_ID) REFERENCES AIMI_SDLC_PHASE (ID)
);

CREATE INDEX IX_AIMI_QUESTIONNAIRE_ACTIVITY_PHASE_ID ON AIMI_QUESTIONNAIRE_ACTIVITY (SDLC_PHASE_ID);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_QUALITATIVE_BENEFIT  (was activityTypes.ts QUALITATIVE_BENEFITS - the master suggestion
-- list. Distinct from AIMI_ACTIVITY_QUALITATIVE_BENEFIT, which stores which benefits were picked
-- for a given logged activity.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_QUALITATIVE_BENEFIT' AND type='U')
BEGIN
CREATE TABLE AIMI_QUALITATIVE_BENEFIT (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(200) NOT NULL,
    SORT_ORDER INT NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_QUALITATIVE_BENEFIT_NAME ON AIMI_QUALITATIVE_BENEFIT (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_ADOPTION_SCORE  (was activityTypes.ts AI_ADOPTION_SCORES + scoreColorUtils.ts
-- getScoreColor - the 0-5 maturity scale used on AIMI_ACTIVITY.AI_ADOPTION_SCORE)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_AI_ADOPTION_SCORE' AND type='U')
BEGIN
CREATE TABLE AIMI_AI_ADOPTION_SCORE (
    SCORE TINYINT NOT NULL PRIMARY KEY,   -- 0-5, matches AIMI_ACTIVITY.AI_ADOPTION_SCORE
    LABEL VARCHAR(50) NOT NULL,
    DESCRIPTION NVARCHAR(300) NOT NULL,
    COLOR_HEX VARCHAR(7) NOT NULL
);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_TOOL  (was activityTypes.ts COMMON_AI_TOOLS - free-text autocomplete suggestion list.
-- Distinct from AIMI_ACTIVITY_AI_TOOL, which stores which tools were picked for a given logged
-- activity, including tools typed in that aren't in this suggestion list.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_AI_TOOL' AND type='U')
BEGIN
CREATE TABLE AIMI_AI_TOOL (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(200) NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_AI_TOOL_NAME ON AIMI_AI_TOOL (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACCELERATOR  (was activityTypes.ts COMMON_ACCELERATORS - free-text autocomplete suggestion
-- list. Distinct from AIMI_ACTIVITY_ACCELERATOR, the per-activity junction table.)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACCELERATOR' AND type='U')
BEGIN
CREATE TABLE AIMI_ACCELERATOR (
    ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    NAME VARCHAR(200) NOT NULL,
    ISACTIVE BIT NOT NULL DEFAULT(1)
);

CREATE UNIQUE INDEX UQ_AIMI_ACCELERATOR_NAME ON AIMI_ACCELERATOR (NAME);
END
GO

----------------------------------------------------------------------------------------------------
-- Simple CODE/LABEL option lookups - one table per hardcoded dropdown in activityTypes.ts /
-- ProjectInfoSelection.tsx that has more than two values (a plain Yes/No or other two-value flag
-- doesn't get a table - see the note near the top of this script). CODE is the exact string value
-- the client already persists today (e.g. AIMI_ACTIVITY.APPLICABILITY, .BENEFIT_TO, .STATUS,
-- AIMI_PROJECT_INFO.LICENSE_PROVIDER), so existing data keeps matching once these columns are
-- FK'd to these tables.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_APPLICABILITY' AND type='U')
BEGIN
CREATE TABLE AIMI_APPLICABILITY (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_BENEFIT_TO' AND type='U')
BEGIN
CREATE TABLE AIMI_BENEFIT_TO (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_LICENSE_PROVIDER' AND type='U')
BEGIN
CREATE TABLE AIMI_LICENSE_PROVIDER (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='AIMI_ACTIVITY_STATUS' AND type='U')
BEGIN
CREATE TABLE AIMI_ACTIVITY_STATUS (
    CODE VARCHAR(20) NOT NULL PRIMARY KEY,
    LABEL VARCHAR(20) NOT NULL,
    SORT_ORDER INT NOT NULL
);
END
GO

----------------------------------------------------------------------------------------------------
-- Seed data - each block only inserts the first time (table starts empty), so this script
-- stays safe to re-run alongside the CREATE TABLE guards above.
----------------------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------------------
-- AIMI_PRACTICE / AIMI_SDLC_PHASE / AIMI_QUESTIONNAIRE_ACTIVITY
-- Generated from src/microapps/AIMI/src/shared/assets/questionnaire.json (8 practices,
-- 60 phases, 298 activities as of this migration).
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_PRACTICE)
BEGIN

INSERT INTO AIMI_PRACTICE (NAME, SORT_ORDER) VALUES
    (N'Digital Product Engineering', 1),
    (N'Network Monitoring', 2),
    (N'Infrastructure Support', 3),
    (N'Security', 4),
    (N'End-user Computing & Service De', 5),
    (N'Data & Analytics', 6),
    (N'Semi', 7),
    (N'Embedded & Digital SW', 8);

INSERT INTO AIMI_SDLC_PHASE (PRACTICE_ID, NAME, SORT_ORDER)
SELECT p.ID, v.PHASE_NAME, v.SORT_ORDER
FROM (VALUES
    (N'Digital Product Engineering', N'Requirements & Design Phase', 1),
    (N'Digital Product Engineering', N'Development', 2),
    (N'Digital Product Engineering', N'Testing & QA', 3),
    (N'Digital Product Engineering', N'Deployment Phase', 4),
    (N'Digital Product Engineering', N'UX', 5),
    (N'Network Monitoring', N'Core Activities', 1),
    (N'Network Monitoring', N'Event Management', 2),
    (N'Network Monitoring', N'Incident Management', 3),
    (N'Network Monitoring', N'Problem Management', 4),
    (N'Network Monitoring', N'Change Management', 5),
    (N'Network Monitoring', N'Request Fulfillment', 6),
    (N'Network Monitoring', N'Configuration Management', 7),
    (N'Network Monitoring', N'Release Management', 8),
    (N'Network Monitoring', N'Asset Management', 9),
    (N'Infrastructure Support', N'Core Activities', 1),
    (N'Infrastructure Support', N'Event Management', 2),
    (N'Infrastructure Support', N'Incident Management', 3),
    (N'Infrastructure Support', N'Problem Management', 4),
    (N'Infrastructure Support', N'Change Management', 5),
    (N'Infrastructure Support', N'Request Fulfillment', 6),
    (N'Infrastructure Support', N'Configuration Management', 7),
    (N'Infrastructure Support', N'Release Management', 8),
    (N'Infrastructure Support', N'Asset Management', 9),
    (N'Security', N'Core Activities', 1),
    (N'Security', N'Event Management', 2),
    (N'Security', N'Incident Management', 3),
    (N'Security', N'Problem Management', 4),
    (N'Security', N'Change Management', 5),
    (N'Security', N'Configuration Management', 6),
    (N'Security', N'Release Management', 7),
    (N'Security', N'Asset Management', 8),
    (N'End-user Computing & Service De', N'Core Activities', 1),
    (N'End-user Computing & Service De', N'Event Management', 2),
    (N'End-user Computing & Service De', N'Incident Management', 3),
    (N'End-user Computing & Service De', N'Problem Management', 4),
    (N'End-user Computing & Service De', N'Change Management', 5),
    (N'End-user Computing & Service De', N'Request Fulfillment', 6),
    (N'End-user Computing & Service De', N'Configuration Management', 7),
    (N'End-user Computing & Service De', N'Release Management', 8),
    (N'End-user Computing & Service De', N'Asset Management', 9),
    (N'Data & Analytics', N'Requirements & Discovery Phase', 1),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', 2),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', 3),
    (N'Data & Analytics', N'Testing & Documentations', 4),
    (N'Data & Analytics', N'Alerts & Notifications', 5),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', 6),
    (N'Data & Analytics', N'Governance, Risk & Compliance (GRC)', 7),
    (N'Semi', N'Requirements & Specifications', 1),
    (N'Semi', N'Design & Verification', 2),
    (N'Semi', N'Implementation Phase (DFT &PD)', 3),
    (N'Semi', N'FPGA and Emulation', 4),
    (N'Embedded & Digital SW', N'Requirements & Specifications', 1),
    (N'Embedded & Digital SW', N'Architecture & Design', 2),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', 3),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', 4),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', 5),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', 6),
    (N'Embedded & Digital SW', N'Validation & QA', 7),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', 8),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', 9)
) AS v(PRACTICE_NAME, PHASE_NAME, SORT_ORDER)
JOIN AIMI_PRACTICE p ON p.NAME = v.PRACTICE_NAME;

INSERT INTO AIMI_QUESTIONNAIRE_ACTIVITY (SDLC_PHASE_ID, ACTIVITY, SORT_ORDER)
SELECT sp.ID, v.ACTIVITY, v.SORT_ORDER
FROM (VALUES
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for Requirements Elicitation Analysis (eg., summarizing user stories, identifying gaps)', 1),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for Design Generation/ Validation (suggesting architecture patterns, UI/ UX elements)', 2),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for Data Modelling/ Database Design Assistance', 3),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI used for API Design/ Specification Generation', 4),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI Used for predict feasibility or risks during requirement analysis', 5),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI used for user story creation from BRD', 6),
    (N'Digital Product Engineering', N'Requirements & Design Phase', N'AI used for BRD creation', 7),
    (N'Digital Product Engineering', N'Development', N'AI Used for Code Generation (eg., generating boilerplate, functions, classes)', 1),
    (N'Digital Product Engineering', N'Development', N'AI Used to generate Boilerplate code just by uploading Figma (UX) designs', 2),
    (N'Digital Product Engineering', N'Development', N'AI Used for Code Refactoring/ Optimization Suggestions', 3),
    (N'Digital Product Engineering', N'Development', N'AI Used for Static Code Analysis/ Bug Detection  (AI-powered tools)', 4),
    (N'Digital Product Engineering', N'Development', N'AI Used for Code Review Assistance (eg., identifying patterns, suggesting improvements)', 5),
    (N'Digital Product Engineering', N'Development', N'AI Used for Documentation Generation from Code (e.g., code docs, project reports, meeting notes)', 6),
    (N'Digital Product Engineering', N'Development', N'AI Used for Unit test case generation and code coverage', 7),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Test Case Generation (e.g., from requirements, code)', 1),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Automated Test Script Generation', 2),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Test Data Generation', 3),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Automated UI/ API Testing with AI-Powered tools', 4),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Performance Testing Analysis/ Optimization Suggestions', 5),
    (N'Digital Product Engineering', N'Testing & QA', N'AI used for performance load test data generation', 6),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Defect Prediction/ Root cause Analysis', 7),
    (N'Digital Product Engineering', N'Testing & QA', N'AI Used for Test Coverage Analysis Optimization', 8),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Automated Deployment Pipelines/ CI/ CD Enhancement', 1),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Infrastructure as Code (IaC) Generation/ Validation', 2),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Monitoring & Alerting (eg., anomoly detection, predictive maintenance)', 3),
    (N'Digital Product Engineering', N'Deployment Phase', N'AI Used for Log Analysis/ Insights Generation', 4),
    (N'Digital Product Engineering', N'UX', N'AI used for user research phase', 1),
    (N'Digital Product Engineering', N'UX', N'AI used for visual design phase', 2),
    (N'Digital Product Engineering', N'UX', N'AI used for wireframing', 3),
    (N'Network Monitoring', N'Core Activities', N'Are bandwidth utilization patterns analyzed with AI for optimization?', 1),
    (N'Network Monitoring', N'Core Activities', N'Are AI/ML models used to detect traffic anomalies or unusual routing paths?', 2),
    (N'Network Monitoring', N'Core Activities', N'Are routing/switching loops or drops flagged by AI-based flow analysis?', 3),
    (N'Network Monitoring', N'Core Activities', N'Is AI used to detect rogue devices or unauthorized access patterns?', 4),
    (N'Network Monitoring', N'Core Activities', N'Is GenAI used to generate or validate firewall/ACL rules?', 5),
    (N'Network Monitoring', N'Core Activities', N'Are Wi-Fi heatmaps or signal issues predicted using AI analytics?', 6),
    (N'Network Monitoring', N'Core Activities', N'Are network topology diagrams auto generated or validated with GenAI?', 7),
    (N'Network Monitoring', N'Event Management', N'Are link failures or packet drops predicted using AI?', 1),
    (N'Network Monitoring', N'Incident Management', N'Are network incident alerts prioritized using AI scoring?', 1),
    (N'Network Monitoring', N'Incident Management', N'Is GenAI used to recommend router/switch config fixes?', 2),
    (N'Network Monitoring', N'Problem Management', N'Are high-churn network issues flagged by pattern detection?', 1),
    (N'Network Monitoring', N'Change Management', N'Are network config changes analyzed for conflict/risk using AI?', 1),
    (N'Network Monitoring', N'Request Fulfillment', N'Are port/VLAN/DNS changes routed and validated via AI?', 1),
    (N'Network Monitoring', N'Configuration Management', N'Are rogue config changes or drifts detected using AI?', 1),
    (N'Network Monitoring', N'Release Management', N'Are firmware updates evaluated post-deployment by AI tools?', 1),
    (N'Network Monitoring', N'Asset Management', N'Is device end-of-life projected by AI models?', 1),
    (N'Infrastructure Support', N'Core Activities', N'Are system logs analyzed using AI to predict performance degradation or failures?', 1),
    (N'Infrastructure Support', N'Core Activities', N'Does AI recommend VM/server resizing based on resource utilization trends?', 2),
    (N'Infrastructure Support', N'Core Activities', N'Is GenAI leveraged to generate automation scripts (e.g., PowerShell, Bash, SQL, Infrastructure as Code templates like Terraform/CloudFormation) for various operational tasks?', 3),
    (N'Infrastructure Support', N'Core Activities', N'Does AI enable autonomous actions such as automated patch deployment, configuration drift auto-remediation, or condition-based reboots/updates?', 4),
    (N'Infrastructure Support', N'Core Activities', N'Is thermal or power efficiency monitored and tuned using AI?', 5),
    (N'Infrastructure Support', N'Core Activities', N'Are long-running queries automatically detected and optimized using AI?', 6),
    (N'Infrastructure Support', N'Core Activities', N'Is AI used to suggest indexing strategies based on query patterns?', 7),
    (N'Infrastructure Support', N'Core Activities', N'Are DB growth and storage trends predicted using AI models?', 8),
    (N'Infrastructure Support', N'Core Activities', N'Are backup integrity tests for databases triggered using AI-defined risk zones?', 9),
    (N'Infrastructure Support', N'Core Activities', N'Are replication lag or sync issues auto-analyzed and resolved using AI?', 10),
    (N'Infrastructure Support', N'Core Activities', N'Is AI/ML extensively used for anomaly detection and predictive analytics across system, network, database, and storage performance metrics (e.g., CPU, memory, IOPS, latency, log patterns, sensor inputs)?', 11),
    (N'Infrastructure Support', N'Core Activities', N'Are alerts generated, correlated, and prioritized using AI (e.g., based on impact, risk scores, or dynamic baselines)?', 12),
    (N'Infrastructure Support', N'Core Activities', N'Is the incident triage process automated, including AI-assisted severity prediction and escalation decisions?', 13),
    (N'Infrastructure Support', N'Core Activities', N'Are hardware failures predicted using AI-based sensor inputs (CPU temp, PSU, fan)?', 14),
    (N'Infrastructure Support', N'Core Activities', N'Are AI recommendations reviewed by humans operators before action?', 15),
    (N'Infrastructure Support', N'Core Activities', N'Are AI-powered runbooks or autonomous systems used to resolve known issues with minimal or no human intervention?', 16),
    (N'Infrastructure Support', N'Core Activities', N'Is GenAI used to generate various operational documentation, including shift handover notes, RCA reports, backup configurations, release notes, or system documentation?', 17),
    (N'Infrastructure Support', N'Core Activities', N'Is AI assist used in root cause analysis of incidents?', 18),
    (N'Infrastructure Support', N'Core Activities', N'Are dashboards auto-built or refined using GenAI prompts?', 19),
    (N'Infrastructure Support', N'Core Activities', N'Are AI insights and feedback from past incidents used to continuously improve operational KPIs (e.g., MTTR, alert fatigue) and future outcomes?', 20),
    (N'Infrastructure Support', N'Core Activities', N'Are AI-driven reports and GenAI summaries used for compliance, trend analysis, threat intelligence, and capacity/resource utilization reporting?', 21),
    (N'Infrastructure Support', N'Core Activities', N'Is storage capacity forecasting done using AI-based growth models?', 22),
    (N'Infrastructure Support', N'Core Activities', N'Are hot/cold data movements or tiering decisions made by AI?', 23),
    (N'Infrastructure Support', N'Core Activities', N'Is disk health analyzed with predictive failure AI tools (e.g., SMART analysis)?', 24),
    (N'Infrastructure Support', N'Core Activities', N'Are deduplication or compression strategies enhanced by AI recommendations?', 25),
    (N'Infrastructure Support', N'Core Activities', N'Are abnormal IOPS or throughput patterns flagged and explained by GenAI?', 26),
    (N'Infrastructure Support', N'Core Activities', N'Is backup job success/failure pattern analyzed using AI?', 27),
    (N'Infrastructure Support', N'Core Activities', N'Are missed or partial backups auto-retried based on AI-defined logic?', 28),
    (N'Infrastructure Support', N'Core Activities', N'Are restore tests automatically scheduled based on AI scoring of critical assets?', 29),
    (N'Infrastructure Support', N'Core Activities', N'Is AI used to optimize backup schedules during off-peak windows?', 30),
    (N'Infrastructure Support', N'Core Activities', N'Are corrupted or failed media automatically flagged and isolated by AI?', 31),
    (N'Infrastructure Support', N'Core Activities', N'Does AI identify and recommend/auto-rightsize underutilized or redundant resources (compute, memory, storage, DB instances) for cost optimization?', 32),
    (N'Infrastructure Support', N'Core Activities', N'Are GenAI tools used to generate tagging and strategies and naming conventions?', 33),
    (N'Infrastructure Support', N'Core Activities', N'Are cost spikes detected using AI models that baseline normal usage?', 34),
    (N'Infrastructure Support', N'Core Activities', N'Are multi-cloud traffic patterns analyzed using ML for optimization?', 35),
    (N'Infrastructure Support', N'Event Management', N'Does AI perform real-time correlation and deduplication of alerts, logs, and events across various sources (e.g., servers, databases, networks, SIEM, NMS)?', 1),
    (N'Infrastructure Support', N'Event Management', N'Is GenAI used to summarize abnormal behavior or critical events (e.g., performance issues, cost spikes, downtimes) into concise alerts?', 2),
    (N'Infrastructure Support', N'Event Management', N'Does AI detect and auto-suppress repetitive alerts (e.g., for backup failures or other anomalies)?', 3),
    (N'Infrastructure Support', N'Incident Management', N'Are incidents (across server, DB, storage, cloud, backup) automatically categorized, classified, and triaged using AI?', 1),
    (N'Infrastructure Support', N'Incident Management', N'Does GenAI provide suggested resolution steps or remediation actions for various incident types (e.g., server errors, SQL tuning, storage issues, backup failures, cloud resource fixes)?', 2),
    (N'Infrastructure Support', N'Incident Management', N'Are repetitive incident patterns or recurring issues flagged using ML for deeper problem analysis?', 3),
    (N'Infrastructure Support', N'Incident Management', N'Is impact analysis of outages (across all domains) assisted by AI?', 4),
    (N'Infrastructure Support', N'Problem Management', N'Are RCA reports for server failures auto-drafted using GenAI?', 1),
    (N'Infrastructure Support', N'Problem Management', N'Does AI/ML detect, cluster, and flag chronic or repeating issues (e.g., hardware faults, OS-level problems, DB slowdowns, storage issues, backup errors, cross-region problems) for root cause analysis?', 2),
    (N'Infrastructure Support', N'Problem Management', N'Is a knowledge base (KB) for known errors and resolutions enhanced or curated using AI?', 3),
    (N'Infrastructure Support', N'Change Management', N'Is AI used to assess the impact and risk of proposed changes (e.g., patches, reboots, schema changes, configuration updates, storage modifications, backup policy changes, IaC deployments)?', 1),
    (N'Infrastructure Support', N'Change Management', N'Does GenAI assist with rollback planning and recommend test plans based on historical change outcomes?', 2),
    (N'Infrastructure Support', N'Change Management', N'Does AI detect unauthorized changes and validate proposed changes against historical incident data?', 3),
    (N'Infrastructure Support', N'Request Fulfillment', N'Are various service requests (e.g., access, configuration, provisioning, expansion, backup, restore) automatically routed and processed via AI workflows?', 1),
    (N'Infrastructure Support', N'Request Fulfillment', N'Is GenAI used to generate provisioning scripts?', 2),
    (N'Infrastructure Support', N'Request Fulfillment', N'Are approval processes for requests triggered or recommended based on AI policies, and are fulfillment/escalation workflows managed by AI?', 3),
    (N'Infrastructure Support', N'Request Fulfillment', N'Does GenAI generate scripts for provisioning test databases?', 4),
    (N'Infrastructure Support', N'Configuration Management', N'Does AI validate CMDB entries, detect missing/outdated configuration items, and identify inconsistencies or misconfigurations across servers, databases, storage, and cloud environments?', 1),
    (N'Infrastructure Support', N'Configuration Management', N'Does GenAI assist in visualizing dependencies and enriching CMDB mappings (e.g., for servers, storage infrastructure)?', 2),
    (N'Infrastructure Support', N'Configuration Management', N'Are DB version upgrades validated for compatibility using ML?', 3),
    (N'Infrastructure Support', N'Release Management', N'Are releases and deployments (e.g., servers, databases, firmware, backup agents) validated and benchmarked post-release using AI-based success metrics?', 1),
    (N'Infrastructure Support', N'Release Management', N'Are rollback triggers auto-detected using AI behavior analysis?', 2),
    (N'Infrastructure Support', N'Release Management', N'Is GenAI used to draft release plans (e.g., DB upgrades, patches) and generate documentation for CI/CD releases?', 3),
    (N'Infrastructure Support', N'Asset Management', N'Does AI predict hardware failures, manage asset lifecycle, and forecast replacement/depreciation needs?', 1),
    (N'Infrastructure Support', N'Asset Management', N'Does AI optimize resource utilization, identify unused resources, and suggest optimizations for licensing (e.g., DB) and cloud spend?', 2),
    (N'Infrastructure Support', N'Asset Management', N'Is backup media lifecycle predicted or optimized using AI?', 3),
    (N'Infrastructure Support', N'Asset Management', N'Is cloud spend optimized using AI-based usage analysis?', 4),
    (N'Security', N'Core Activities', N'Are threat behaviors (e.g., lateral movement, beaconing) detected using ML?', 1),
    (N'Security', N'Core Activities', N'Are false positives/negatives from alerts reviewed and auto-suppressed based on AI feedback?', 2),
    (N'Security', N'Core Activities', N'Is Gen-AI or ML-based tools are used to write or tune detection queries (e.g. for EDR, SIEM, firewall logs)?', 3),
    (N'Security', N'Core Activities', N'Is Gen-AI feature enabled in EDR, SIEM solutions?', 4),
    (N'Security', N'Core Activities', N'Are IOC enrichments and correlation handled using AI models/tools for clustering and analyzing security events or IOC patterns?', 5),
    (N'Security', N'Core Activities', N'Is AI used for threat detection (e.g. malware behaviour, phishing detection)?', 6),
    (N'Security', N'Core Activities', N'Are phishing or spam patterns clustered and blocked by AI?', 7),
    (N'Security', N'Core Activities', N'Is AI used for threat intelligence agreegatuon (Pull data from sources: CISA KEV, NVD, RSS feeds, Twitter (X), MISP) , summarize with LLM and update to respective stakholders to reduce zero day atatck?', 8),
    (N'Security', N'Event Management', N'Are threat events correlated using ML-based threat intelligence?', 1),
    (N'Security', N'Event Management', N'Are anomalies in security logs detected by AI?', 2),
    (N'Security', N'Event Management', N'Is AI used for removing the false positive events?', 3),
    (N'Security', N'Event Management', N'Is AI used to classify the alert, tag the priority and execute the response action after detection?', 4),
    (N'Security', N'Event Management', N'Is AI configured to react to suspicious login behavior (e.g., geo anomalies, impossible travel) by automatic locking the account or Open the ticket?', 5),
    (N'Security', N'Event Management', N'Is AI used to automatically execute response actions automatically after detection. e.g. Isolate host using EDR API (e.g., CrowdStrike, SentinelOne), Block IP via firewall API (e.g., Palo Alto, FortiGate), Create ticket + notify SOC analyst, Log event in SIEM or Google Sheets', 6),
    (N'Security', N'Event Management', N'Is AI used for Phishing Triage automation like, extract headers, links, attachments,  Analyze with VirusTotal + LLM to determine threat and also quarentine the same', 7),
    (N'Security', N'Incident Management', N'Does AI play a role in scoring the severity or likelihood of a threat?', 1),
    (N'Security', N'Incident Management', N'Are AI-generated threat scores used to prioritize SOC alerts?', 2),
    (N'Security', N'Incident Management', N'Are AI recommendations used to drive SOAR playbook or incident escalations?', 3),
    (N'Security', N'Incident Management', N'Are automated remediation actions triggered by AI (e.g., isolating endpoints)?', 4),
    (N'Security', N'Incident Management', N'Does human-in-the-loop validations exists before executing AI-based security actions?', 5),
    (N'Security', N'Incident Management', N'Are Automated validations done before executing AI-based security actions?', 6),
    (N'Security', N'Incident Management', N'Is GenAI used to create incident reports or analyst summaries?', 7),
    (N'Security', N'Problem Management', N'Are repeated threat types grouped by ML to detect underlying issues?', 1),
    (N'Security', N'Problem Management', N'How can AI help identify recurring incidents that may indicate an underlying problem?', 2),
    (N'Security', N'Problem Management', N'Does AI helps to generate threat intelligence reports or post-incident reviews (PIR)?', 3),
    (N'Security', N'Change Management', N'Are security policy changes analyzed for coverage impact via AI?', 1),
    (N'Security', N'Change Management', N'Is AI used to ensure compliance with regulatory requirements during change management?', 2),
    (N'Security', N'Change Management', N'Is AI used to discover shadow IT where associates access & download the applications without approval?', 3),
    (N'Security', N'Configuration Management', N'Are endpoint or SIEM config gaps flagged using AI?', 1),
    (N'Security', N'Configuration Management', N'Is AI used to detect anomalies in CI attributes (e.g., version mismatches, wrong configurations)?', 2),
    (N'Security', N'Configuration Management', N'Is AI used in managing the version compliance? identifying the outdated versions of Endpoint OS , Network infrastructure and notify to respective stakeholder?', 3),
    (N'Security', N'Configuration Management', N'Is AI used to detect non-compliance in configurations against defined baselines or policies?', 4),
    (N'Security', N'Configuration Management', N'Is AI used to identify the privillaged access provided on endpoints and auto removal post end date?', 5),
    (N'Security', N'Release Management', N'Are patching or AV updates validated using threat reduction metrics?', 1),
    (N'Security', N'Release Management', N'Is AI used in identifying the outdated patches and its reporting to respective stakeholders including top management?', 2),
    (N'Security', N'Asset Management', N'Are endpoint health and compliance evaluated by AI?', 1),
    (N'Security', N'Asset Management', N'Is AI used in automatic discovery of assets with required details such as Asset type, Software version, installed applications and identify the risk related to that?', 2),
    (N'Security', N'Asset Management', N'Is AI used to carry out discovery of all the AI tools and list the same?', 3),
    (N'End-user Computing & Service De', N'Core Activities', N'Are endpoint health metrics (CPU, RAM, disk) monitored with anomaly detection AI?', 1),
    (N'End-user Computing & Service De', N'Core Activities', N'Are patch deployment issues automatically flagged and resolved via AI workflows?', 2),
    (N'End-user Computing & Service De', N'Core Activities', N'Is AI used to detect software licensing violations or blacklisted apps?', 3),
    (N'End-user Computing & Service De', N'Core Activities', N'Is GenAI used to generate local device scripts (e.g., registry tweaks, policy settings)?', 4),
    (N'End-user Computing & Service De', N'Core Activities', N'Are driver or compatibility issues flagged using AI pattern matching?', 5),
    (N'End-user Computing & Service De', N'Core Activities', N'Are failed OS image deployments diagnosed with GenAI-generated logs?', 6),
    (N'End-user Computing & Service De', N'Core Activities', N'Are support tool (e.g., ITSM platform) configurations analyzed by AI for inefficiencies?', 7),
    (N'End-user Computing & Service De', N'Core Activities', N'Is AI used to identify unused or duplicate service catalog items?', 8),
    (N'End-user Computing & Service De', N'Core Activities', N'Is GenAI used to generate knowledge base articles from historical ticket data?', 9),
    (N'End-user Computing & Service De', N'Core Activities', N'Are SLA violations predicted using AI volume/priority models?', 10),
    (N'End-user Computing & Service De', N'Core Activities', N'Are escalation paths optimized using AI recommendations?', 11),
    (N'End-user Computing & Service De', N'Core Activities', N'Are Wi-Fi heatmaps or signal issues predicted using AI analytics?', 12),
    (N'End-user Computing & Service De', N'Core Activities', N'Are network topology diagrams auto-generated or validated with GenAI?', 13),
    (N'End-user Computing & Service De', N'Event Management', N'Are endpoint events filtered or clustered by AI?', 1),
    (N'End-user Computing & Service De', N'Event Management', N'Are AI bots summarizing repeated issues from event trends?', 2),
    (N'End-user Computing & Service De', N'Incident Management', N'Are end-user tickets triaged and assigned using AI?', 1),
    (N'End-user Computing & Service De', N'Incident Management', N'Is GenAI used in L1 virtual assistants (chatbots) to resolve issues?', 2),
    (N'End-user Computing & Service De', N'Incident Management', N'Are chatbots or GenAI used for incident resolution at L0/L1?', 3),
    (N'End-user Computing & Service De', N'Incident Management', N'Is sentiment analysis used to prioritize user-reported issues?', 4),
    (N'End-user Computing & Service De', N'Problem Management', N'Are high-volume user issues flagged by ML pattern detection?', 1),
    (N'End-user Computing & Service De', N'Problem Management', N'Are major recurring themes auto-detected from incidents?', 2),
    (N'End-user Computing & Service De', N'Change Management', N'Are changes to end-user policies assessed for impact using AI?', 1),
    (N'End-user Computing & Service De', N'Change Management', N'Are service desk changes to workflows assessed using AI?', 2),
    (N'End-user Computing & Service De', N'Request Fulfillment', N'Are software install or access requests fulfilled via AI workflows?', 1),
    (N'End-user Computing & Service De', N'Request Fulfillment', N'Are catalog requests fulfilled or auto-approved via AI?', 2),
    (N'End-user Computing & Service De', N'Configuration Management', N'Are endpoint configurations validated for compliance by AI?', 1),
    (N'End-user Computing & Service De', N'Configuration Management', N'Are CMDB updates suggested from service desk interactions?', 2),
    (N'End-user Computing & Service De', N'Release Management', N'Are OS/software updates assessed for success rates via AI?', 1),
    (N'End-user Computing & Service De', N'Release Management', N'Are release notes or knowledge base articles generated by GenAI?', 2),
    (N'End-user Computing & Service De', N'Asset Management', N'Is hardware refresh need predicted using AI?', 1),
    (N'End-user Computing & Service De', N'Asset Management', N'Are device health reports summarized by GenAI?', 2),
    (N'End-user Computing & Service De', N'Asset Management', N'Are lost/retired assets flagged by AI via service desk logs?', 3),
    (N'Data & Analytics', N'Requirements & Discovery Phase', N'AI used for Data Discovery , eg (existing excel File Summary , Databases , Transactional & legacy System DB , other Enterprises Application data availability )', 1),
    (N'Data & Analytics', N'Requirements & Discovery Phase', N'AI Used for Design Generation/ Validation, Major System integrations diagrams', 2),
    (N'Data & Analytics', N'Requirements & Discovery Phase', N'AI Used for Data Classifications, Schema Diagram, data Profiling,   Data Architecture  Solution , Schema drift (tools,  flow charts)', 3),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', N'Are AI-driven tools used for data Source Connection, Scheme evolvement / enrichments', 1),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', N'Is AI used for automated data labelling or annotation, Source & Target Data rules / schema validations', 2),
    (N'Data & Analytics', N'Data Preparation,  Migrations , Source & target Data Identifications', N'AI Used for Data Quality Monitoring or Anomaly Detection in Datasets', 3),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for Code Generation or writing Flow or code notebooks / ETL packages (eg., generating boilerplate, functions, Notebooks, Scripts, ETL flow)', 1),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for Code Completion/ Suggestion/ Static Code Analysis / third party tool enforcement / Any external Code Generator or Refiner (beyond standard IDE features)', 2),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for Code Refactoring/ Optimization / Performance tuning features', 3),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI used for Creating reports , Visualization, Dashboard or any data modelling', 4),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'AI Used for new data addition , Changes , Export data from Datasets tracking & audits log creations', 5),
    (N'Data & Analytics', N'Development Data Pipeline, Migrations & Visualization / Reporting', N'Any AI tool for Data Governance Policy setup / enforcements', 6),
    (N'Data & Analytics', N'Testing & Documentations', N'AI Used for Test Case Generation / Automation (e.g., from requirements, code)', 1),
    (N'Data & Analytics', N'Testing & Documentations', N'AI Used for Test Data Generation for flows, Scripts , notebooks, Packages', 2),
    (N'Data & Analytics', N'Testing & Documentations', N'AI Used for Performance & Data Quality  Testing Analysis', 3),
    (N'Data & Analytics', N'Testing & Documentations', N'AI used to create Data Dictionary document creations (Database , lake house object description & use) or AI Used for Documentation Generation from Code (e.g., code docs,)', 4),
    (N'Data & Analytics', N'Alerts & Notifications', N'Is Any AI Used for Alerts or Notification for Job runs / schedulers , Monitor Tools , Report Delivery , Job orchestration tools', 1),
    (N'Data & Analytics', N'Alerts & Notifications', N'Is any automation for cycle of data ingestions & quality check with Runbooks  with RCA  (for high level issue resolutions)', 2),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI Used for Automated Deployment Pipelines/ CI/ CD Enhancement', 1),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI Used for Infrastructure cost management / any tools for monitoring it / Cost Optimization tools', 2),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI used for Auto tuning of data pipeline, Jobs wrt execution of jobs /pipelines over the period of time', 3),
    (N'Data & Analytics', N'Deployment,  Job Maintenance,  Support Phase', N'AI Used for Log Analysis/ Log generations/ Insights Generation', 4),
    (N'Data & Analytics', N'Governance, Risk & Compliance (GRC)', N'Are AI tools used for compliance checks or automated governance audits  or access Policy (eg., security, data privacy)?', 1),
    (N'Semi', N'Requirements & Specifications', N'AI Used for Technical proposal generation', 1),
    (N'Semi', N'Requirements & Specifications', N'AI Used for Requirements specifications refinement', 2),
    (N'Semi', N'Requirements & Specifications', N'AI Used for Architecture specification document generation', 3),
    (N'Semi', N'Requirements & Specifications', N'AI Used for predict feasibility or risks during requirement analysis', 4),
    (N'Semi', N'Design & Verification', N'AI used for MircoArch specification document generation', 1),
    (N'Semi', N'Design & Verification', N'AI used for RTL generation', 2),
    (N'Semi', N'Design & Verification', N'AI used for RTL QC checks', 3),
    (N'Semi', N'Design & Verification', N'AI used for Constraints (SDC) generation', 4),
    (N'Semi', N'Design & Verification', N'AI used for Verfication plan document generation', 5),
    (N'Semi', N'Design & Verification', N'AI used for test plan document generation', 6),
    (N'Semi', N'Design & Verification', N'AI used for verification TestBench generation', 7),
    (N'Semi', N'Design & Verification', N'AI used for test case and assertions generation', 8),
    (N'Semi', N'Design & Verification', N'AI used for Coverage closure (functional, toggle, code, etc)', 9),
    (N'Semi', N'Design & Verification', N'AI used for functional test case regressions', 10),
    (N'Semi', N'Design & Verification', N'AI used for Formal verification', 11),
    (N'Semi', N'Design & Verification', N'AI used for Simulation debug', 12),
    (N'Semi', N'Design & Verification', N'AI used for GLS setup and GLS regressions', 13),
    (N'Semi', N'Design & Verification', N'AI used for FUSA analysis and fault injection simulations', 14),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT Microarchitecture specification generation', 1),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT script generation and flow setup', 2),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI used for DFT insertion in RTL/ netlist', 3),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT pattern simulations and debug', 4),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT Coverage analysis', 5),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for DFT pattern optimization', 6),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for IO planning, floor planning and Power planning', 7),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for PD script generation and flow setup', 8),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI Used for Synthesis and LEC closure', 9),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for PnR iterations and closure', 10),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for STA iterations and closure', 11),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for EMIR analysis and closure', 12),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for SV/DRC closure', 13),
    (N'Semi', N'Implementation Phase (DFT &PD)', N'AI capabilities in EDA tools used for power analysis and power domain implementation', 14),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA requirements analysis and part selection', 1),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA implementation specifications', 2),
    (N'Semi', N'FPGA and Emulation', N'AI used for RTL code generation or RTL porting to FPGA', 3),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA simulations debug', 4),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA implementation and timing closure', 5),
    (N'Semi', N'FPGA and Emulation', N'AI used for design porting for emulation', 6),
    (N'Semi', N'FPGA and Emulation', N'AI used for FPGA/emulation waveform debug', 7),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used for technical proposal generation (RFP responses, scope documents)', 1),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used for requirements elicitation, summarisation, gap analysis from SRS / BRD / user stories', 2),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used for requirements specification refinement and traceability baseline creation', 3),
    (N'Embedded & Digital SW', N'Requirements & Specifications', N'AI used to predict feasibility or risks during requirement analysis', 4),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for embedded architecture option generation and HW/SW partitioning trade-off analysis', 1),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for interface / API / protocol specification generation (REST, DDS, SOME/IP, CAN, MQTT)', 2),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for BSP, Yocto/Buildroot, bootloader, device-tree and board bring-up planning', 3),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for safety / security pre-analysis (HARA, FMEA, FTA, TARA, threat model, compliance checks)', 4),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for UX journeys, wireframes, or product workflow design for digital companion applications', 5),
    (N'Embedded & Digital SW', N'Architecture & Design', N'AI used for AI/ML model selection, accelerator targeting, or graph-level optimisation planning (TVM, MLIR)', 6),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for Linux kernel, device driver, HAL, SDK, or firmware code generation / refactoring', 1),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for RTOS / bare-metal task, peripheral, interrupt, DMA, or protocol stack implementation', 2),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for AUTOSAR Configuration (BSW, RTE, MCAL config files)', 3),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for bootloader / U-Boot / secure-boot configuration generation', 4),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for middleware / connectivity implementation (AUTOSAR, DDS, SOME/IP, CAN/LIN/Ethernet)', 5),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for DSP / NPU / GPU / CDU optimisation, profiling insight, vectorisation, MCPS / memory optimisation', 6),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for AI model porting & quantisation (ONNX ↔ target accelerator, INT8 / FP16, TFLite / TensorRT / OpenVINO)', 7),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for custom operator / kernel implementation (DSP intrinsics, GPU kernels, NPU operators)', 8),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for static code analysis, bug detection, MISRA / CERT-C compliance fixes, secure coding review', 9),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for code review assistance (PR summarisation, anti-pattern detection)', 10),
    (N'Embedded & Digital SW', N'Platform / Firmware Development', N'AI used for code documentation, API documentation, design notes, release notes, meeting summaries', 11),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for test plan generation from spec / SOW / SRS', 1),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for test case generation from RTL / specification / coverage gaps', 2),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for waveform / log analysis and failure clustering', 3),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for coverage gap identification and stimulus generation (UVM, SystemVerilog assertions)', 4),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for regression triage, defect clustering, and root-cause analysis', 5),
    (N'Embedded & Digital SW', N'Pre/Post-Silicon Validation', N'AI used for FPGA / emulator setup automation and platform bring-up scripts', 6),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for frontend / backend scaffolding, API implementation, microservices, database design', 1),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for cloud infrastructure, containerisation, Kubernetes, Terraform, or DevOps configuration generation', 2),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for edge-to-cloud telemetry, data pipeline, OTA backend, or dashboard implementation', 3),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used for mobile / web companion application testing, accessibility, or localisation support', 4),
    (N'Embedded & Digital SW', N'Digital / Product & Cloud Engineering', N'AI used to embed GenAI / Agentic AI features into delivered customer products (LLM agents, copilots, RAG)', 5),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for computer vision / perception model selection, prototyping, or model evaluation', 1),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for synthetic data generation, annotation assistance, or dataset quality analysis', 2),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for model conversion, quantisation, pruning, ONNX/TFLite/TensorRT/OpenVINO deployment', 3),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for MLOps, model monitoring, experiment tracking, or deployment pipeline automation', 4),
    (N'Embedded & Digital SW', N'AI/ML & Edge Intelligence', N'AI used for AI model accuracy / latency / power benchmarking on target hardware', 5),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for test case generation from requirements, architecture, code, or defect history', 1),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for unit-test generation, mocks/stubs, coverage improvement, or test data creation', 2),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for SIL / MIL / HIL test generation or automation framework enhancement', 3),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for ADAS / Perception scenario generation for SIL/HIL testing', 4),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for CANoe / CAPL, VectorCAST, GoogleTest, pytest, or hardware bench automation support', 5),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for safety-grade coverage validation (MC/DC, statement, branch) and gap closure', 6),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for fault injection / robustness test scenario generation', 7),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for fuzz testing / penetration testing automation', 8),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for defect prediction, defect triage, root-cause analysis, log/trace correlation', 9),
    (N'Embedded & Digital SW', N'Validation & QA', N'AI used for performance, load, stress, power, memory, or latency analysis and optimisation', 10),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for ISO 26262 safety work products, ASIL traceability, safety case, audit evidence', 1),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for IEC 61508 / IEC 60730 / IEC 60601 (functional safety, household, medical) work products', 2),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for ISO 21434 / EU CRA cybersecurity work products, TARA, threat model, vulnerability assessment', 3),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for SBOM (Software Bill of Materials) generation and vulnerability scanning', 4),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for MISRA / CERT-C compliance reporting and traceability', 5),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for secure boot, OTA crypto / key-management, HSM, TLS, or secure communication review', 6),
    (N'Embedded & Digital SW', N'Safety, Security & Compliance', N'AI used for requirements-to-test traceability, compliance matrix, and review checklist automation', 7),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for CI/CD pipeline generation, build failure analysis, or deployment script / config generation', 1),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for OTA update package generation, rollout planning, rollback analysis, telemetry validation', 2),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for automated release notes, change impact analysis, delivery risk reporting', 3),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for production log analysis, anomaly detection, predictive maintenance, incident triage', 4),
    (N'Embedded & Digital SW', N'CI/CD, Release & Operations', N'AI used for field telemetry analysis (vehicle / industrial / IoT fleet data)', 5)
) AS v(PRACTICE_NAME, PHASE_NAME, ACTIVITY, SORT_ORDER)
JOIN AIMI_PRACTICE p ON p.NAME = v.PRACTICE_NAME
JOIN AIMI_SDLC_PHASE sp ON sp.PRACTICE_ID = p.ID AND sp.NAME = v.PHASE_NAME;

END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_QUALITATIVE_BENEFIT - from activityTypes.ts QUALITATIVE_BENEFITS (alphabetical order,
-- matching the .sort() the client applies before rendering)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_QUALITATIVE_BENEFIT)
BEGIN
INSERT INTO AIMI_QUALITATIVE_BENEFIT (NAME, SORT_ORDER) VALUES
    (N'Better Compliance', 1),
    (N'Better Resource Utilization', 2),
    (N'Enhanced Customer Experience', 3),
    (N'Enhanced Scalability', 4),
    (N'Faster Delivery', 5),
    (N'Faster Time to Market', 6),
    (N'Improved Accuracy', 7),
    (N'Improved Collaboration', 8),
    (N'Improved Decision-Making', 9),
    (N'Improved Monitoring and Reporting', 10),
    (N'Improved Quality', 11),
    (N'Improved Risk Management', 12),
    (N'Increased Efficiency', 13),
    (N'Reduced Cost', 14),
    (N'Reduced Manual Effort', 15);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_ADOPTION_SCORE - from activityTypes.ts AI_ADOPTION_SCORES + scoreColorUtils.ts
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_AI_ADOPTION_SCORE)
BEGIN
INSERT INTO AIMI_AI_ADOPTION_SCORE (SCORE, LABEL, DESCRIPTION, COLOR_HEX) VALUES
    (0, N'No AI Adopted', N'No AI tools or techniques are being used. Traditional manual processes are in place.', '#dc3545'),
    (1, N'Basic Awareness', N'The team is aware of AI capabilities, but no implementation has occurred. Planning or research phase.', '#fd7e14'),
    (2, N'Initial Implementation', N'Basic AI tools are used occasionally. Limited integration with existing processes.', '#ffc107'),
    (3, N'Partial Adoption', N'AI tools are regularly used and integrated into some workflows. Clear benefits are observed.', '#20c997'),
    (4, N'Full Adoption', N'AI is deeply integrated into most processes. Significant efficiency gains and innovation.', '#198754'),
    (5, N'Optimized/Automated', N'Cutting-edge AI implementation. Industry-leading practices and maximum automation.', '#6f42c1');
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_APPLICABILITY - from activityTypes.ts APPLICABILITY_OPTIONS. 'NA' is included because
-- AddActivityModal.tsx sets applicability = 'NA' programmatically for phase-level NA activities,
-- even though it isn't one of the 4 options the dropdown itself offers.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_APPLICABILITY)
BEGIN
INSERT INTO AIMI_APPLICABILITY (CODE, LABEL, SORT_ORDER) VALUES
    (N'Yes', N'Yes', 1),
    (N'No', N'No', 2),
    (N'Activity NA', N'Activity NA', 3),
    (N'Customer NA', N'Customer NA', 4),
    (N'NA', N'NA', 5);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_BENEFIT_TO - from activityTypes.ts BENEFIT_TO_OPTIONS
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_BENEFIT_TO)
BEGIN
INSERT INTO AIMI_BENEFIT_TO (CODE, LABEL, SORT_ORDER) VALUES
    (N'Neurealm', N'Neurealm', 1),
    (N'Customer', N'Customer', 2),
    (N'Both', N'Both', 3);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_LICENSE_PROVIDER - from the inline 'Client'/'Neurealm' literals in
-- ProjectInfoSelection.tsx (no named constant exists client-side for this one today)
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_LICENSE_PROVIDER)
BEGIN
INSERT INTO AIMI_LICENSE_PROVIDER (CODE, LABEL, SORT_ORDER) VALUES
    (N'Client', N'Client', 1),
    (N'Neurealm', N'Neurealm', 2);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACTIVITY_STATUS - from activityTypes.ts ActivityStatus union type. Only 'draft' and
-- 'submitted' are persisted today; no approved/rejected workflow exists yet.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_ACTIVITY_STATUS)
BEGIN
INSERT INTO AIMI_ACTIVITY_STATUS (CODE, LABEL, SORT_ORDER) VALUES
    (N'draft', N'Draft', 1),
    (N'submitted', N'Submitted', 2);
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_AI_TOOL - from activityTypes.ts COMMON_AI_TOOLS (127 unique entries, alphabetical to match
-- the client's .sort()). This is a generic "popular software tools" list carried over verbatim
-- from the source, not curated for AI-relevance - review/prune before relying on it for reporting.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_AI_TOOL)
BEGIN
INSERT INTO AIMI_AI_TOOL (NAME) VALUES
    (N'Ableton Live'),
    (N'Adobe Audition'),
    (N'Adobe Creative Suite'),
    (N'Airtable'),
    (N'Alteryx'),
    (N'Ansible'),
    (N'Anthropic Claude'),
    (N'Apache Airflow'),
    (N'Apache Kafka'),
    (N'Apache Spark'),
    (N'AppDynamics'),
    (N'Asana'),
    (N'Audacity'),
    (N'AWS Bedrock'),
    (N'AWS CodePipeline'),
    (N'Azure DevOps'),
    (N'Azure OpenAI'),
    (N'Bard'),
    (N'Beautiful.ai'),
    (N'Bitwig Studio'),
    (N'Burp Suite'),
    (N'Canva'),
    (N'ChatGPT'),
    (N'Checkmarx'),
    (N'CircleCI'),
    (N'Claude'),
    (N'ClickUp'),
    (N'Confluence'),
    (N'Copy.ai'),
    (N'Cubase'),
    (N'DALL-E'),
    (N'Datadog'),
    (N'DataRobot'),
    (N'Descript'),
    (N'Discord'),
    (N'Docker'),
    (N'Draw.io'),
    (N'Dynatrace'),
    (N'ELK Stack'),
    (N'Figma'),
    (N'FL Studio'),
    (N'Fortify'),
    (N'Gamma'),
    (N'GarageBand'),
    (N'GitHub Actions'),
    (N'GitHub Copilot'),
    (N'GitLab CI/CD'),
    (N'Google AI'),
    (N'Google Cloud Build'),
    (N'Google Colab'),
    (N'Google Docs'),
    (N'Google Meet'),
    (N'Google Sheets'),
    (N'Google Slides'),
    (N'Grafana'),
    (N'Grammarly'),
    (N'H2O.ai'),
    (N'Hugging Face'),
    (N'InVideo'),
    (N'Jasper'),
    (N'Jenkins'),
    (N'Jira'),
    (N'Jupyter'),
    (N'Kaggle'),
    (N'KNIME'),
    (N'Kubernetes'),
    (N'Logic Pro'),
    (N'Looker'),
    (N'Lucidchart'),
    (N'Lumen5'),
    (N'Matplotlib'),
    (N'Metabase'),
    (N'Microsoft Excel'),
    (N'Microsoft PowerPoint'),
    (N'Microsoft Teams'),
    (N'Microsoft Word'),
    (N'Midjourney'),
    (N'Miro'),
    (N'Monday.com'),
    (N'Nessus'),
    (N'New Relic'),
    (N'Notion'),
    (N'Notion AI'),
    (N'NumPy'),
    (N'OpenAI API'),
    (N'OpsGenie'),
    (N'Orange'),
    (N'OWASP ZAP'),
    (N'PagerDuty'),
    (N'Pandas'),
    (N'Pictory'),
    (N'Pitch'),
    (N'Plotly'),
    (N'Power BI'),
    (N'Prezi'),
    (N'Pro Tools'),
    (N'Prometheus'),
    (N'PyTorch'),
    (N'Qlik'),
    (N'Qualys'),
    (N'Rapid7'),
    (N'RapidMiner'),
    (N'Reaper'),
    (N'Reason'),
    (N'RunwayML'),
    (N'Scikit-learn'),
    (N'Seaborn'),
    (N'ServiceNow'),
    (N'Slack'),
    (N'Snyk'),
    (N'SonarQube'),
    (N'Splunk'),
    (N'Stable Diffusion'),
    (N'Studio One'),
    (N'Synthesia'),
    (N'Tableau'),
    (N'TensorFlow'),
    (N'Terraform'),
    (N'Tome'),
    (N'Travis CI'),
    (N'Trello'),
    (N'Veracode'),
    (N'VictorOps'),
    (N'Visio'),
    (N'Webex'),
    (N'Weka'),
    (N'Zoom');
END
GO

----------------------------------------------------------------------------------------------------
-- AIMI_ACCELERATOR - from activityTypes.ts COMMON_ACCELERATORS (137 unique entries, alphabetical).
-- Heavily overlaps with AIMI_AI_TOOL (both suggestion lists share most of their tail entries in
-- the source) - review/prune before relying on it for reporting.
----------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM AIMI_ACCELERATOR)
BEGIN
INSERT INTO AIMI_ACCELERATOR (NAME) VALUES
    (N'Ableton Live'),
    (N'Adobe Audition'),
    (N'Adobe Creative Suite'),
    (N'Airtable'),
    (N'AKS'),
    (N'Ansible'),
    (N'Apache'),
    (N'AppDynamics'),
    (N'ArgoCD'),
    (N'ARM Templates'),
    (N'Asana'),
    (N'Audacity'),
    (N'AWS CodePipeline'),
    (N'AWS KMS'),
    (N'AWS SAM'),
    (N'Azure DevOps'),
    (N'Azure Functions'),
    (N'Azure Key Vault'),
    (N'Bamboo'),
    (N'Beautiful.ai'),
    (N'Bitwig Studio'),
    (N'Burp Suite'),
    (N'Caddy'),
    (N'Canva'),
    (N'Certbot'),
    (N'Checkmarx'),
    (N'Chef'),
    (N'CircleCI'),
    (N'ClickUp'),
    (N'CloudFormation'),
    (N'Confluence'),
    (N'Consul'),
    (N'Cubase'),
    (N'Datadog'),
    (N'Descript'),
    (N'DigitalOcean App Platform'),
    (N'Discord'),
    (N'Docker'),
    (N'Dokku'),
    (N'Draw.io'),
    (N'Dynatrace'),
    (N'EKS'),
    (N'ELK Stack'),
    (N'Envoy'),
    (N'Figma'),
    (N'FL Studio'),
    (N'Flux'),
    (N'Fly.io'),
    (N'Fortify'),
    (N'Gamma'),
    (N'GarageBand'),
    (N'GitHub Actions'),
    (N'GitLab CI/CD'),
    (N'GKE'),
    (N'GoCD'),
    (N'Google Cloud Functions'),
    (N'Google Docs'),
    (N'Google Meet'),
    (N'Google Secret Manager'),
    (N'Google Sheets'),
    (N'Google Slides'),
    (N'Grafana'),
    (N'HAProxy'),
    (N'HashiCorp Vault'),
    (N'Heroku'),
    (N'InVideo'),
    (N'Istio'),
    (N'Jenkins'),
    (N'Jira'),
    (N'K3s'),
    (N'Kind'),
    (N'Kubernetes'),
    (N'Let''s Encrypt'),
    (N'Linkerd'),
    (N'Logic Pro'),
    (N'Lucidchart'),
    (N'Lumen5'),
    (N'MicroK8s'),
    (N'Microsoft Excel'),
    (N'Microsoft PowerPoint'),
    (N'Microsoft Teams'),
    (N'Microsoft Word'),
    (N'Minikube'),
    (N'Miro'),
    (N'Monday.com'),
    (N'Nessus'),
    (N'Netlify'),
    (N'New Relic'),
    (N'Nginx'),
    (N'Notion'),
    (N'OpenShift'),
    (N'OpsGenie'),
    (N'OWASP ZAP'),
    (N'Packer'),
    (N'PagerDuty'),
    (N'Pictory'),
    (N'Pitch'),
    (N'Platform.sh'),
    (N'Prezi'),
    (N'Pro Tools'),
    (N'Prometheus'),
    (N'Pulumi'),
    (N'Puppet'),
    (N'Qualys'),
    (N'Railway'),
    (N'Rancher'),
    (N'Rapid7'),
    (N'Reaper'),
    (N'Reason'),
    (N'Render'),
    (N'RunwayML'),
    (N'Salt'),
    (N'Secrets Manager'),
    (N'Serverless Framework'),
    (N'ServiceNow'),
    (N'Slack'),
    (N'Snyk'),
    (N'SonarQube'),
    (N'Spinnaker'),
    (N'Splunk'),
    (N'Studio One'),
    (N'Synthesia'),
    (N'TeamCity'),
    (N'Tekton'),
    (N'Terraform'),
    (N'Tome'),
    (N'Traefik'),
    (N'Travis CI'),
    (N'Trello'),
    (N'Vagrant'),
    (N'Vault'),
    (N'Veracode'),
    (N'Vercel'),
    (N'VictorOps'),
    (N'Visio'),
    (N'Webex'),
    (N'Zoom');
END
GO

----------------------------------------------------------------------------------------------------
-- Stored procedures that read the lookup tables above (source: 01 StoredProcedure\BAS\usp_AIMI_*.sql)
----------------------------------------------------------------------------------------------------

-- Reads the master Practice list (was hardcoded/derived client-side from
-- questionnaire.json's practices[] array). See AIMI_PRACTICE in
-- Release 2.6.3.sql.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetPractices' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetPractices]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetPractices]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ID, NAME, SORT_ORDER
    FROM AIMI_PRACTICE
    WHERE ISACTIVE = 1
    ORDER BY SORT_ORDER;
END
GO

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

-- Reads the master Qualitative Benefit suggestion list (was activityTypes.ts
-- QUALITATIVE_BENEFITS). Distinct from AIMI_ACTIVITY_QUALITATIVE_BENEFIT,
-- which stores which benefits were picked for a given logged activity.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetQualitativeBenefits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefits]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetQualitativeBenefits]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT NAME, SORT_ORDER
    FROM AIMI_QUALITATIVE_BENEFIT
    WHERE ISACTIVE = 1
    ORDER BY SORT_ORDER;
END
GO

-- Reads the AI Adoption Score scale 0-5 (was activityTypes.ts
-- AI_ADOPTION_SCORES). COLOR_HEX exists on the table for a future move of the
-- client's scoreColorUtils.ts color mapping into data too, but is not
-- currently consumed - display color stays client-side for now.
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAiAdoptionScores' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAiAdoptionScores]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAiAdoptionScores]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT SCORE, LABEL, DESCRIPTION, COLOR_HEX
    FROM AIMI_AI_ADOPTION_SCORE
    ORDER BY SCORE;
END
GO

-- Reads the AI Tool autocomplete suggestion list (was activityTypes.ts
-- COMMON_AI_TOOLS). Distinct from AIMI_ACTIVITY_AI_TOOL, the per-activity
-- junction table (which also accepts free-text tools typed in that aren't in
-- this suggestion list).
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_AIMI_GetAiTools' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_AIMI_GetAiTools]
END
GO

CREATE PROCEDURE [dbo].[usp_AIMI_GetAiTools]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT NAME
    FROM AIMI_AI_TOOL
    WHERE ISACTIVE = 1
    ORDER BY NAME;
END
GO

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
