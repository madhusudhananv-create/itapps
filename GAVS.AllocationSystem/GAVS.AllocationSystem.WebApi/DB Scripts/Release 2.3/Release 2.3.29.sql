IF NOT EXISTS(Select 1 from sys.tables where name ='RISK_REPOSITORY' AND type='U')
BEGIN

CREATE TABLE RISK_REPOSITORY
(
    ID int IDENTITY(1,1) NOT NULL,
	RISK_DESCRIPTION varchar(max) NOT NULL,
	RISK_IMPACT varchar(max) NOT NULL,
	LIKELIHOOD int NOT NULL,
	CONSEQUENCES int NOT NULL,
	RISK_TREATMENT_STRATEGY varchar(50) NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]) ON [PRIMARY]

END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='RISK_REPOSITORY2SERVICE_TOWER' AND type='U')
BEGIN

CREATE TABLE RISK_REPOSITORY2SERVICE_TOWER
(
	ID int IDENTITY(1,1) NOT NULL,
	RISK_REPOSITORY_ID int NOT NULL,
	SERVICE_TOWER_ID int NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]) ON [PRIMARY]

END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_RISK' AND COLUMN_NAME='RISK_REPOSITORY_ID')
BEGIN
ALTER TABLE PROJECT_RISK ADD RISK_REPOSITORY_ID int NULL
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_RISK' AND COLUMN_NAME='IS_DRAFT')
BEGIN
ALTER TABLE PROJECT_RISK ADD IS_DRAFT bit NULL default (0)
END
GO

IF EXISTS (SELECT * from PROJECT_RISK WHERE ISACTIVE=1 and IS_DRAFT IS NULL)
BEGIN
UPDATE PROJECT_RISK SET IS_DRAFT=0,UPDATED_BY='104859',UPDATED_DATE=GETDATE() where ISACTIVE=1 and IS_DRAFT IS NULL
END
GO

IF NOT EXISTS (SELECT * from FILTER_PREFERENCE WHERE TABLE_NAME='RISK_REPOSITORY')
BEGIN

INSERT INTO FILTER_PREFERENCE VALUES('RISK_REPOSITORY','servicE_TOWER_TITLE','Service Tower','string',1,0,0,NULL,'104859',GETDATE(),'104859',GETDATE(),1)
INSERT INTO FILTER_PREFERENCE VALUES('RISK_REPOSITORY','risK_DESCRIPTION','Risk Description','string',1,0,0,NULL,'104859',GETDATE(),'104859',GETDATE(),1)
INSERT INTO FILTER_PREFERENCE VALUES('RISK_REPOSITORY','risK_IMPACT','Risk Impact','string',1,0,0,NULL,'104859',GETDATE(),'104859',GETDATE(),1)

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllRiskFromRepository' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllRiskFromRepository]
END
GO

CREATE PROCEDURE getAllRiskFromRepository

@customerId varchar(50),
@projectId varchar(50)

as
begin

SELECT ST.TITLE as SERVICE_TOWER_TITLE,RR.RISK_DESCRIPTION as DESCRIPTION,RR.RISK_IMPACT as IMPACT,RR.LIKELIHOOD as PROBABILITY_SCALE,
RR.CONSEQUENCES as IMPACT_SCALE,RR.RISK_TREATMENT_STRATEGY,RR.ID as RISK_REPOSITORY_ID,ST.ID as SERVICE_TOWER_ID
from RISK_REPOSITORY RR inner join RISK_REPOSITORY2SERVICE_TOWER RRS on RRS.RISK_REPOSITORY_ID = RR.ID
inner join PROCESS_SERVICE_AREA_PROJECT_MAPPING PSM on PSM.SERVICE_AREA_ID = RRS.SERVICE_TOWER_ID
inner join PROCESS_SERVICE_AREA_NEW ST on ST.ID = RRS.SERVICE_TOWER_ID

where PSM.CUST_ID = @customerId and PSM.PROJ_ID = @projectId and
ST.ISACTIVE=1 and RRS.ISACTIVE=1 and RR.ISACTIVE=1 and PSM.ISACTIVE=1
order by SERVICE_TOWER_TITLE, DESCRIPTION

end
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='get_RiskDetailsByCustomerId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[get_RiskDetailsByCustomerId]
END
GO

CREATE PROCEDURE [dbo].[get_RiskDetailsByCustomerId]                
              
@PROJIDS VARCHAR(MAX),              
@allproj bit    

AS                
BEGIN                
  SELECT distinct C.CUST_ID, CUST_NM, PORT.ID PORTFOLIO_ID, PORT.TITLE PORTFOLIO_NM, P.PROJ_NM, R.[ID]                
      ,R.[PROJECT_ID]                
      ,R.[RAG]                
      ,R.[DESCRIPTION]                
      ,[IMPACT]                
      ,[PROBABILITY_SCALE]                
      ,[IMPACT_SCALE]                
      ,R.[OWNER]                
      ,[AREA]                
      ,[IDENTIFIED_BY]                
      ,R.[IDENTIFIED_DATE]                
      ,[RISK_TREATMENT_STRATEGY]                
      ,R.[TARGET_DATE]                
      ,[ACTUAL_DATE]                
      ,R.[STATUS]                
      ,[ACTION_TAKEN]                
      ,R.[CREATED_BY]                
      ,R.[CREATED_DATE]                
      ,R.[UPDATED_BY]                
      ,R.[UPDATED_DATE]                
      ,R.[ISACTIVE] 
	  ,R.[RISK_REPOSITORY_ID]
	  ,R.[IS_DRAFT]
      , isnull(E.FRST_NM, R.[OWNER]) as OWNER_NAME           
      ,R.ACCEPT_TILL,  
   cast(CASE WHEN PA.RISK_ID is not null then 1 else 0 end as bit)  as IS_PLAN_EXISTS   
   FROM PROJECT_RISK R  (NOLOCK)         
  INNER JOIN PROJECT P  (NOLOCK) ON R.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))  and R.ISACTIVE = 1                
  INNER JOIN CUSTOMER C  (NOLOCK) ON C.CUST_ID = P.CUST_ID                
  LEFT JOIN EMP_INFO e  (NOLOCK) on r.OWNER  =  convert(varchar,e.EMAIL_ID) or r.owner = convert(varchar, e.emp_id)         
  LEFT OUTER JOIN PORTFOLIO_PROJECT PP  (NOLOCK) ON PP.PROJ_ID = P.PROJ_ID                
  LEFT OUTER JOIN PORTFOLIO PORT   (NOLOCK) ON PORT.ID = PP.PORTFOLIO_ID    
  LEFT JOIN PROJECT_ACTIONITEM PA  (NOLOCK) ON PA.RISK_ID = R.ID And pa.PROJECT_ID= r.PROJECT_ID  
  order by [IDENTIFIED_DATE] desc          
                
END     
GO

IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'reports_getCRISPScores'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].reports_getCRISPScores
END
GO

CREATE PROCEDURE [dbo].[reports_getCRISPScores]
@STARTDATE DATETIME,
@ENDDATE DATETIME
AS
BEGIN
SET @STARTDATE = CONVERT(DATETIME, CONVERT(varchar(11),@STARTDATE, 111 ) + ' 00:00:00', 111)
SET @ENDDATE = CONVERT(DATETIME, CONVERT(varchar(11),@ENDDATE, 111 ) + ' 23:59:59', 111)
SELECT (SELECT TOP 1 INFO.FRST_NM  from EMP_INFO INFO
WHERE  EMP_ID =  p.PROJ_DM_EMP_ID ) CSM,
C.CUST_NM [CUSTOMER NAME], c.cust_id, PO.TITLE AS [PORTFOLIO NAME],PROJ_NM [PROJECT NAME], FORMAT(PUBLISH_DATE, 'dd-MMM-yyy', 'EN-us') [PUBLISHED DATE],
CSP.STATUS,
(SELECT TOP 1 SCORE C FROM [CRISP_SCORES_CATEGORY] WHERE CRISP_SCORES_PROJECT_ID = CSP.ID AND CATEGORY_ID = 1)  C,
(SELECT TOP 1 SCORE C FROM [CRISP_SCORES_CATEGORY] WHERE CRISP_SCORES_PROJECT_ID = CSP.ID AND CATEGORY_ID = 2)  R,
(SELECT TOP 1 SCORE C FROM [CRISP_SCORES_CATEGORY] WHERE CRISP_SCORES_PROJECT_ID = CSP.ID AND CATEGORY_ID = 3)  I,
(SELECT TOP 1 SCORE C FROM [CRISP_SCORES_CATEGORY] WHERE CRISP_SCORES_PROJECT_ID = CSP.ID AND CATEGORY_ID = 4)  S,
(SELECT TOP 1 SCORE C FROM [CRISP_SCORES_CATEGORY] WHERE CRISP_SCORES_PROJECT_ID = CSP.ID AND CATEGORY_ID = 5)  P,
SCORE TOTAL,
CSP.COMMENTS [QA NEED FOCUS],
CSP.HR_NEED_FOCUS_COMMENTS [HR NEED FOCUS] ,
(select frst_nm from emp_info e where e.emp_id = p.quality_spoc) [QUALITY SPOC]
--,P.PROJ_ID [PROJECT ID]
FROM [CRISP_SCORES_PROJECT] CSP
INNER JOIN PROJECT P ON P.PROJ_ID = CSP.PROJECT_ID
INNER JOIN CUSTOMER C ON C.CUST_ID = P.CUST_ID
LEFT JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID = CSP.PROJECT_ID  AND PP.ISACTIVE=1
LEFT JOIN PORTFOLIO PO ON PO.ID = pp.PORTFOLIO_ID AND PO.ISACTIVE=1
WHERE  c.cust_id != '202100062' and  PUBLISH_DATE >= @STARTDATE AND PUBLISH_DATE <= @ENDDATE ORDER BY 1,2,PUBLISH_DATE
--STATUS = 'PUBLISHED' AND
END


GO



IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROCESS' AND COLUMN_NAME='CLAUSE_REFERENCE')
BEGIN
ALTER TABLE PROCESS ADD CLAUSE_REFERENCE varchar(1600) NULL  
END
GO



IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROCESS' AND COLUMN_NAME='CONTROL_REFERENCE')
BEGIN
ALTER TABLE PROCESS ADD CONTROL_REFERENCE varchar(1600) NULL  
END
GO



IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'reports_getAllAssessmentFindings'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].reports_getAllAssessmentFindings
END
GO
CREATE procedure [dbo].[reports_getAllAssessmentFindings]  
@startDate Datetime,  
@endDate Datetime,  
@customerid varchar(50)='0'  
AS  
BEGIN  
select c.CUST_ID , c.CUST_NM , p.PROJ_ID, p.PROJ_NM,t.ID as AssessmentID, finding.ID as [Finding_ID],  
MODEL.TITLE  [Process Model], find.SCORE, find.PERCENTAGE_SCORE, Convert(varchar,find.created_date,107)    as created_date ,  
(select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,  
AUDIT_TITLE [Assessment title],      Convert(varchar,PLANNED_AUDIT_START_DATE ,107) [Planned Start Date],  
Convert(varchar,Actual_audit_start_date,107) [Actual Start Date],  
Convert(varchar,Actual_audit_end_date,107) [Actual End Date],  
(select title from process_service_area_new where id = finding.service_area_id) [Service Area],  
(select title from Process_area where id = finding.process_area_id) [Process Area],  
--(select title from Process where id = finding.process_id) [Process],  
PR.TITLE [Process Title],PR.DESCRIPTION [Process Description],
PR.CLAUSE_REFERENCE [ISO/Process Model Clause Reference], PR.CONTROL_REFERENCE [ISO/Process Model Control Reference],
finding.finding_type, finding.finding_description,  
(select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_ID from AUDIT_CHECKLIST_EXECUTION_SUMMARY WHERE assessment_ID = t.id and ISACTIVE = 1)) [Auditor],  
t.DESCRIPTION, t.STATUS,    ACCEPT.status [FINDING_ACCEPTANCE_STATUS],  
(case when Stage.ISCOMPLETE=1 then 'Closed'  
when Stage.ISCOMPLETE=0 then 'Open'  
END) [FINDING_STATUS],  
(SELECT TOP 1 ROOT_CAUSE FROM AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],  
(SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN]  
from TASK t  
inner join CUSTOMER c on t.CUST_ID = c.CUST_ID  
inner join PROJECT p on t.PROJ_ID = p.PROJ_ID  
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY find on t.id = find.assessment_ID and find.ISACTIVE = 1  
inner join PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1  
left join AUDIT_CHECKLIST_PROJECT_FINDINGS finding on finding.AUDIT_ID = t.ID and finding.ISACTIVE =1  
LEFT join PROCESS_MODEL MODEL ON CHK.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1  
LEFT join AUDITEE_ACCEPTANCE ACCEPT ON finding.ID = ACCEPT.finding_id  
LEFT join AUDIT_FINDING_STAGES_MAPPING Stage on finding.ID=Stage.FINDING_ID and Stage.STAGE_ID=4 and Stage.ISACTIVE=1  
LEFT JOIN Process PR ON PR.ID= finding.PROCESS_ID
WHERE  t.DUE_DATE between @startDate and @endDate and (@customerid='0' or  c.CUst_id = @customerid)  and t.ISACTIVE=1  
ORDER by  c.CUST_NM, p.PROJ_NM,   [PLANNED_AUDIT_START_DATE], [Assessment title]  
END  
  

GO


IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_get_AllKPIBy_Mode'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].usp_get_AllKPIBy_Mode
END
GO

CREATE proc [dbo].[usp_get_AllKPIBy_Mode]      
@modeId int,                    
@servicelvlId int,                
@prodId int                
                
AS                    
BEGIN                    
            
;WITH CTE(ID,KPI_ID,SERVICE_AREA_ID,PRODUCT_ID,MODE_ID,SERVICE_LEVEL_METRICS,SERVICE_AREA_TYPE,                
SERVICE_LEVEL_ID,SERVICE_LEVEL,                
CATEGORY_ID,SLA_CATEGORY,REFERENCE_ID,REFERENCE,SUPPORT_WINDOW,PRIORITY,                    
EXPECTED_SERVICE_LEVEL,MINIMUM_SERVICE_LEVEL,EXPECTED_TARGET_OPERATOR,MINIMUM_TARGET_OPERATOR,FREQUENCY,SERVICE_LEVEL_METRIC_DESCRIPTION,SPECIFICATION_LIMIT,UNIT_OF_MEASUREMENT,START_DATE,END_DATE,TIER)                    
AS                    
(                    
select KT.ID,K.ID as KPI_ID,PSA.ID as SERVICE_AREA_ID,K.PRODUCT_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,PSA.SERVICE_AREA_TYPE,                
SLT.ID,SLT.SERVICE_LEVEL,                
SLA.ID,SLA.SLA_CATEGORY,                
PSL.REFERENCE_ID,                
RM.REFERENCE,                
K.SUPPORT_WINDOW,K.PRIORITY,                
--SLA.SLA_CATEGORY,                    
KT.EXPECTED_SERVICE_LEVEL,                                    
KT.MINIMUM_SERVICE_LEVEL,                  
KT.SLA_TARGET_HIGH_OPERATOR as EXPECTED_TARGET_OPERATOR,                  
KT.SLA_TARGET_VERYHIGH_OPERATOR as MINIMUM_TARGET_OPERATOR,                  
K.FREQUENCY,PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,                  
CASE WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 1 Incident Resolution' then                                               
PT.SEVERITY_LEVEL_1                                              
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 2 Incident Resolution' then                                               
PT.SEVERITY_LEVEL_2                                              
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 3 Incident Resolution' then                                               
PT.SEVERITY_LEVEL_3                                              
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Mean Time to Repair / Restore Service (MTTR)' then                                               
PT.MTTR                                              
                            
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Problem Resolution Time' then                                               
PT.PROBLEM_RESOLUTION_TIME                                              
else KT.SPECIFICATION_LIMIT END AS SPECIFICATION_LIMIT,                  
K.SLA_TARGET_UNIT_OF_MEASUREMENT,                  
CAST(KT.START_DATE AS DATE) as START_DATE,                  
CAST(KT.END_DATE AS DATE) as END_DATE, 'Tier' + Cast(PT.TIER_ID  as varchar(1)) AS TIER                
from KPI K                    
join KPI_TARGETS KT on K.ID = KT.KPI_ID   and kt.isactive = 1                 
inner join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING kpimap on k.GLOBAL_KPI_CATEGORY_ID = kpimap.GLOBAL_KPI_CATEGORY_ID and kpimap.ISACTIVE = 1                
inner join GLOBAL_PERSPECTIVE per on per.ID = kpimap.GLOBAL_PERSPECTIVE_ID and per.ISACTIVE = 1                              
join GLOBAL_KPI_CATEGORY GC on K.GLOBAL_KPI_CATEGORY_ID = GC.ID and GC.ISACTIVE = 1                
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                    
join KPI2PRODUCT_SERVICE_LEVEL_METRICS K2P on K.ID = K2P.KPI_ID              
join PRODUCT_SERVICE_LEVEL_METRICS PSL on K2P.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID and PSL.SERVICE_LEVEL_TYPE_ID = @servicelvlId                   
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1                
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                     
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                    
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                    
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                               
where K.MODE_ID = @modeId and PP.ID = @prodId  ANd K.ISACTIVE=1                   
                    
)                    
SELECT * INTO #TEMPCTE from CTE         
            
SELECT * FROM #TEMPCTE                           
                    
DROP TABLE #TEMPCTE                          
                    
END   
  

  GO

--Product Percent Testing Completed - SLA update
UPDATE KPI 
SET ISACTIVE=0,
UPDATED_BY='105683',
UPDATED_DATE=GETDATE()
WHERE ID IN ( 
select KPI_ID FROM KPI2PRODUCT_SERVICE_LEVEL_METRICS
WHERE PRODUCT_SERVICE_LEVEL_METRICS_ID =8
)    AND  MODE_ID =4 AND ISACTIVE<>0


GO

 

IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_update_ExistingBaseMeasureKPIdataMap'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].usp_update_ExistingBaseMeasureKPIdataMap
END
GO

-- =============================================
-- Author:  Indhu
-- Create date: 07/Jun/2023
-- Description: delete Existing Base Measure KPIdata Map
-- =============================================
CREATE PROCEDURE [dbo].usp_update_ExistingBaseMeasureKPIdataMap
    @extTable TT_BASE_MEASURE_EXTERNAL_KPI_DATA READONLY,
    @empId varchar(10) 
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;
    if EXISTS (SELECT 1 FROM @extTable)
    BEGIN

        --- delete missing Maps
        DELETE bmkd
        from BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
            left JOIN @extTable temp
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE temp.KPI_BASE_MEASURE_VALUE_ID is nULL --AND temp.KPI_DATA IS NOT NULL 

        --- update old Maps
        UPDATE bmkd
        SET bmkd.KPI_DATA_JSON = temp.KPI_DATA_JSON,
            bmkd.updated_BY = @empID,
            bmkd.UPDATED_DATE = getdate()
        FROM BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
            left JOIN @extTable temp
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE temp.KPI_BASE_MEASURE_VALUE_ID is NOT nULL --AND temp.KPI_DATA IS NOT NULL 

        --- Insert New Maps
        INSERT INTO BASE_MEASURE_EXTERNAL_KPI_DATA
        (
            KPI_BASE_MEASURE_VALUE_ID,
            EXTERNAL_KPI_DATA_ID,
            KPI_DATA_JSON,
            CREATED_BY,
            CREATED_DATE,
            UPDATED_BY,
            UPDATED_DATE,
            ISACTIVE,
            KPI_DATATYPE
        )
        SELECT temp.KPI_BASE_MEASURE_VALUE_ID,
               temp.EXTERNAL_KPI_DATA_ID,
               temp.KPI_DATA_JSON,
               @empId,
               getdate(),
               @empId,
               getdate(),
               1,
               temp.KPI_DATATYPE
        FROM @extTable temp
            left JOIN BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE bmkd.KPI_BASE_MEASURE_VALUE_ID is nULL --AND temp.KPI_DATA IS NOT NULL 


		--update rows as Processed (so that rows  won't be considered again
		UPdate ek
		SET IS_PROCESSED=1
		FROM @extTable temp
		INNER JOIN EXTERNAL_KPI_DATA ek
		ON ek.KPI_DATA=temp.KPI_DATA_JSON
		WHERE IS_PROCESSED=0


    END

END

GO

IF EXISTS (
  SELECT 
    1 
  FROM 
    sys.procedures 
  WHERE 
    name = 'usp_getAuditsNotCompleted' 
    AND TYPE = 'P'
) BEGIN 
DROP 
  PROCEDURE [dbo].usp_getAuditsNotCompleted 
  END 
  GO 
  
  -- =============================================
  -- Author:  Indhu
  -- Create date: 01/Nov/2023
  -- Description: get Audits Not Completed
  -- =============================================
  CREATE PROCEDURE usp_getAuditsNotCompleted AS BEGIN 
SELECT 
  DISTINCT T.ID, 
  T.CUST_ID, 
  C.CUST_NM, 
  T.PROJ_ID, 
  P.PROJ_NM, 
  TC.TITLE TASK_CATEGORY, 
  T.DESCRIPTION, 
  T.STATUS, 
  T.PRIORITY, 
  T.SCHEDULED_START_DATE, 
  T.DUE_DATE, 
  T.OWNER, 
  AU.MANAGER_EMP_ID,
  T.ASSIGNED_TO, 
  A.AUDITOR_EMP_ID, 
  ISNULL(TR.FREQUENCY, 'On-Going') AS FREQUENCY, 
  t.COMMENTS 
FROM 
  [TASK] T (NOLOCK) 
  INNER JOIN TASK_TYPE TT (NOLOCK) ON TT.ID = T.TASK_TYPE_ID 
  and T.ISACTIVE = 1 
  INNER JOIN TASK_CATEGORY TC (NOLOCK) ON TC.ID = T.TASK_CATEGORY_ID 
  LEFT JOIN AUDIT_SCHEDULE A (NOLOCK) ON T.ID = A.TASK_ID 
  LEFT JOIN CUSTOMER C (NOLOCK) ON C.CUST_ID = T.CUST_ID 
  LEFT JOIN PROJECT P (NOLOCK) ON P.PROJ_ID = T.PROJ_ID 
  LEFT JOIN TASK_RECURRENCE TR (NOLOCK) ON T.ID = TR.TASK_ID 
   LEFT JOIN EMP_INFO AU ON AU.EMP_ID=A.AUDITOR_EMP_ID
WHERE 
  Due_Date is not null 
  AND T.TASK_TYPE_ID = 2 
  AND DUE_DATE < GETDATE() 
  AND t.ISACTIVE = 1 
  AND ISNULL(T.STATUS, '') NOT IN ('COMPLETED', 'CANCELLED') END


GO


IF EXISTS (
  SELECT 
    1 
  FROM 
    sys.procedures 
  WHERE 
    name = 'usp_getAuditScoreNotSubmitted' 
    AND TYPE = 'P'
) BEGIN 
DROP 
  PROCEDURE [dbo].usp_getAuditScoreNotSubmitted 
  END 
  GO 
  
  -- =============================================
  -- Author:  Indhu
  -- Create date: 01/Nov/2023
  -- Description: get Audits Score Not Submitted
  -- =============================================
  CREATE PROCEDURE usp_getAuditScoreNotSubmitted AS BEGIN 
SELECT 
  DISTINCT T.ID, 
  T.CUST_ID, 
  C.CUST_NM, 
  T.PROJ_ID, 
  P.PROJ_NM, 
  TC.TITLE TASK_CATEGORY, 
  T.DESCRIPTION, 
  T.STATUS, 
  T.PRIORITY, 
  T.SCHEDULED_START_DATE, 
  T.DUE_DATE, 
  T.OWNER, 
  AU.MANAGER_EMP_ID ,
  T.ASSIGNED_TO, 
  A.AUDITOR_EMP_ID, 
  ISNULL(TR.FREQUENCY, 'On-Going') AS FREQUENCY, 
  t.COMMENTS 
FROM 
  [TASK] T (NOLOCK) 
  INNER JOIN TASK_TYPE TT (NOLOCK) ON TT.ID = T.TASK_TYPE_ID 
  and T.ISACTIVE = 1 
  INNER JOIN TASK_CATEGORY TC (NOLOCK) ON TC.ID = T.TASK_CATEGORY_ID 
  LEFT JOIN AUDIT_SCHEDULE A (NOLOCK) ON T.ID = A.TASK_ID 
  LEFT JOIN CUSTOMER C (NOLOCK) ON C.CUST_ID = T.CUST_ID 
  LEFT JOIN PROJECT P (NOLOCK) ON P.PROJ_ID = T.PROJ_ID 
  LEFT JOIN TASK_RECURRENCE TR (NOLOCK) ON T.ID = TR.TASK_ID 
  left join CHECKLIST_SCORES_BY_AUDIT score on t.ID = score.AUDIT_ID and score.ISACTIVE = 1  
  LEFT JOIN EMP_INFO AU ON AU.EMP_ID=A.AUDITOR_EMP_ID
WHERE 
  Due_Date is not null 
  AND T.TASK_TYPE_ID = 2 
  AND DATEADD(d,2,DUE_DATE) < GETDATE()  -- more than two days of duedate 
  AND ISNULL(T.STATUS,'') IN ('COMPLETED')  -- Completed 
  AND score.SCORE is null  -- score not submitted
  
  END
GO

IF EXISTS (SELECT 1 from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report Combined')
BEGIN

DECLARE @ReportSPID INT
SET @ReportSPID=(select id from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report Combined')
DELETE FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report Combined'
DELETE FROM REPORTS_PARAMS WHERE REPORT_SP_ID = @ReportSPID

END

go
---remove css
IF EXISTS (SELECT 1 from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report')
BEGIN

DECLARE @ReportSPID INT
SET @ReportSPID=(select id from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report')
DELETE FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report'
DELETE FROM REPORTS_PARAMS WHERE REPORT_SP_ID = @ReportSPID

END
GO
-----remove css monthly
IF EXISTS (SELECT 1 from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report Monthly')
BEGIN

DECLARE @ReportSPID INT
SET @ReportSPID=(select id from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report Monthly')
DELETE FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report Monthly'
DELETE FROM REPORTS_PARAMS WHERE REPORT_SP_ID = @ReportSPID

END
Go

IF NOT EXISTS (SELECT 1 from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='Customer Success Survey Report – All A/C')
BEGIN
INSERT INTO REPORTS_SP_DETAILS(SP_NAME,SP_DISPLAY_NAME,DB_NAME)  VALUES 
('dbo.reports_CSAT_Combined','Customer Success Survey Report – All A/C','BAS') 
END


DECLARE @ReportID INT SET @ReportID=(SELECT @@IDENTITY)


IF NOT EXISTS (SELECT * from REPORTS_PARAMS WHERE REPORT_SP_ID= @ReportID)
BEGIN

INSERT INTO REPORTS_PARAMS VALUES(@ReportID,'StartDate','DATE','2023-07-01')
INSERT INTO REPORTS_PARAMS VALUES(@ReportID,'EndDate','DATE','2023-08-31')

END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
END
GO



CREATE PROCEDURE [dbo].[reports_CSAT_Combined]  
@StartDate Date,                      
 @EndDate Date                      
AS         
    
BEGIN    
    SET NOCOUNT ON;    
    
    --DECLARE @StartDate Date = '2023-09-01';    
    --DECLARE @EndDate Date = '2023-09-30';    
    
    SELECT    
        c.cust_nm AS [Customer Name],    
        p.proj_nm AS [Project Name],    
        display_name AS [Respondent Name],    
        B.EMAIL_ID AS [Email_Id],    
        FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],    
        FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],    
        [Year_Quarter] = Left(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),    
  pp.TITLE As [Portfolio],  
        qr.QUESTION_CATEGORY,    
        qr.QUESTION,    
        qr.RATING,    
        qr.RATING_DESCRIPTION,    
        c.Cust_ID AS [Customer_ID],    
        (  
            SELECT E.FRST_NM  
            FROM project  
            INNER JOIN EMP_INFO E ON E.EMP_ID = project.PROJ_DM_EMP_ID  
            WHERE project.PROJ_ID = B.PROJ_ID  
        ) AS [Customer Success Manager],  
        (  
            SELECT E.FRST_NM  
            FROM project  
            INNER JOIN EMP_INFO E ON E.EMP_ID = project.PROJ_AM_EMP_ID  
            WHERE project.PROJ_ID = B.PROJ_ID  
        ) AS [ACCOUNT MANAGER],  
  p.BUSINESS_UNIT as [BUSSINESS UNIT],  
  P.CONTRACTING_UNIT AS [CONTRACTING UNIT],  
  P.METHODOLOGY AS [METHODOLOGY],  
  P.DEPARTMENT AS [DEPARTMENT],  
  P.PROJECT_GROUP [PROJECT GROUP],  
  P.COUNTRY [COUNTRY]    
    FROM [CSS_BATCH_CUSTOMERS] b    
    INNER JOIN project p ON p.proj_id = b.proj_id    
    LEFT JOIN portfolio_project PR ON PR.PROJ_ID = P.PROJ_ID  
    Left join PORTFOLIO pp on pr.PORTFOLIO_ID = pp.ID  
    INNER JOIN customer c ON c.cust_id = b.cust_id    
    INNER JOIN CSS_BATCHES bt ON bt.id = b.Batch_ID    
    INNER JOIN CSS_QUESTION_REPLIES QR ON QR.BATCH_CUSTOMER_ID = b.ID    
    WHERE b.STATUS = 'COMPLETED'    
    AND (bt.start_date BETWEEN @StartDate AND @EndDate OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
    
    UNION ALL    
    
    SELECT    
        c.cust_nm AS [Customer Name],    
        p.PROJ_NM AS [Project Name],    
        b.DISPLAY_NAME AS [Respondent Name],    
        B.EMAIL_ID AS [Email_Id],    
        FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],    
        FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],    
        CONCAT(  
              'Q',  
            CASE  
                WHEN MONTH(bt.START_DATE) BETWEEN 4 AND 6 THEN '1'  
                WHEN MONTH(bt.START_DATE) BETWEEN 7 AND 9 THEN '2'  
                WHEN MONTH(bt.START_DATE) BETWEEN 10 AND 12 THEN '3'  
                ELSE '4'  
            END,  
            ' - ',  
            YEAR(bt.START_DATE)  
        ) AS [Quarter_Year],  
  pp.TITLE [Portfolio],  
        qr.QUESTION_CATEGORY,    
        qr.QUESTION,    
        qr.RATING,    
        qr.RATING_DESCRIPTION,    
        c.Cust_ID AS [Customer_ID],   
        (  
            SELECT E.FRST_NM  
            FROM project  
            INNER JOIN EMP_INFO E ON E.EMP_ID = project.PROJ_DM_EMP_ID  
            WHERE project.PROJ_ID = cp.PROJ_ID  
        ) AS [Customer Success Manager],  
        (  
            SELECT E.FRST_NM  
            FROM project  
            INNER JOIN EMP_INFO E ON E.EMP_ID = project.PROJ_AM_EMP_ID  
            WHERE project.PROJ_ID = cp.PROJ_ID  
        ) AS [ACCOUNT MANAGER],  
     p.BUSINESS_UNIT as [BUSSINESS UNIT],  
  P.CONTRACTING_UNIT AS [CONTRACTING UNIT],  
  P.METHODOLOGY AS [METHODOLOGY],  
  P.DEPARTMENT AS [DEPARTMENT],  
  P.PROJECT_GROUP [PROJECT GROUP],  
  P.COUNTRY [COUNTRY]    
    FROM [CSS_BATCH_CUSTOMER_MONTHLY] b    
    INNER JOIN CSS_BATCH_MONTHLY bt ON bt.id = b.BATCH_MONTHLY_ID    
    INNER JOIN CSS_QUESTION_REPLIES QR ON QR.Batch_Customer_Monthly_id = b.ID    
    INNER JOIN customer c ON c.cust_id = b.cust_id    
    INNER join customer_users cu on cu.EMAILID = b.EMAIL_ID   
    INNER join CUSTOMER_PROJECTS cp on cp.CUSTOMER_USER_ID=cu.ID  
    INNER JOIN project p ON p.proj_id = cp.PROJ_ID    
    LEFT JOIN portfolio_project PR ON PR.PROJ_ID = P.PROJ_ID  
    Left join PORTFOLIO pp on pr.PORTFOLIO_ID = pp.ID  
  
    WHERE b.STATUS = 'COMPLETED'    
    AND (bt.start_date BETWEEN @StartDate AND @EndDate OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
    ORDER BY [Year_Quarter], [Customer Name];    
END  
  
GO


