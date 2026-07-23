
-------ADDED CUSTOMER PARAMETER IN REPORT SP's -----
IF EXISTS( SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'REPORTS_PARAMS' AND COLUMN_NAME = 'PARAM_VALUE' 
    AND NOT (DATA_TYPE = 'varchar' AND CHARACTER_MAXIMUM_LENGTH = -1))
BEGIN
    ALTER TABLE REPORTS_PARAMS ALTER COLUMN PARAM_VALUE VARCHAR(MAX)
END
GO

IF EXISTS(Select 1 from sys.objects where name ='reports_getAllAssessmentFindings' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getAllAssessmentFindings] 
END

GO

CREATE procedure [dbo].[reports_getAllAssessmentFindings]  
@startDate Datetime,  
@endDate Datetime,  
@customerid varchar(max)='0'  
AS  
BEGIN  
select DISTINCT c.CUST_NM , p.PROJ_NM,p.BUSINESS_UNIT as [Business Unit],  
AUDIT_TITLE [Assessment title], Convert(varchar,PLANNED_AUDIT_START_DATE ,107) [Planned Start Date],  
Convert(varchar,Actual_audit_start_date,107) [Actual Start Date],  
Convert(varchar,Actual_audit_end_date,107) [Actual End Date],  
dtls.SCORE, ((dtls.SCORE / dtls.MAX_SCORE)*100) as PERCENTAGE_SCORE, dtls.UPDATED_SCORE as CURRENT_SCORE,  
((dtls.UPDATED_SCORE / dtls.MAX_SCORE)*100) as CURRENT_PERCENTAGE_SCORE,  
Convert(varchar,find.created_date,107)    as created_date ,  
(select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,  
(select top 1 frst_nm from emp_info where emp_id = p.DP_ID) CSM,  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP NAME],  
(select top 1 EMAIL_ID from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP MAIL],  
MODEL.TITLE  [Process Model],  
(select title from process_service_area_new where id = finding.service_area_id) [Service Area],  
(select title from Process_area where id = finding.process_area_id) [Process Area],  
PR.TITLE [Process Title],PR.DESCRIPTION [Process Description],  
PR.CLAUSE_REFERENCE [ISO/Process Model Clause Reference], PR.CONTROL_REFERENCE [ISO/Process Model Control Reference],  
PCQ.TITLE as QUESTION_TITLE, finding.finding_type, finding.finding_description,  
(select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_ID from AUDIT_CHECKLIST_EXECUTION_SUMMARY WHERE assessment_ID = t.id and ISACTIVE = 1)) [Auditor],  
STUFF((select ', ' + frst_nm from EMP_INFO where EMP_ID IN (select value FROM AUDIT_SCHEDULE_ref   
where AUDIT_SCHEDULE_ID IN (select id FROM AUDIT_SCHEDULE WHERE TASK_ID = t.ID) AND [key] = 'AUDITEE_EMP_ID')  
FOR XML PATH('')), 1, 1, '') AS [Auditees],  
STUFF((select ', ' + EMAIL_ID from EMP_INFO where EMP_ID IN (select value FROM AUDIT_SCHEDULE_ref   
where AUDIT_SCHEDULE_ID IN (select id FROM AUDIT_SCHEDULE WHERE TASK_ID = t.ID) AND [key] = 'AUDITEE_EMP_ID')  
FOR XML PATH('')), 1, 1, '') AS [Auditees Email ID],  
t.DESCRIPTION, t.STATUS,    ACCEPT.status [FINDING_ACCEPTANCE_STATUS],  
(case when Stage.ISCOMPLETE=1 then 'Closed'  
when Stage.ISCOMPLETE=0 then 'Open'  
END) [FINDING_STATUS],  
(SELECT TOP 1 ROOT_CAUSE FROM AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],  
(SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN],  
c.CUST_ID , p.PROJ_ID, t.ID as ASSESSMENT_ID, finding.ID as FINDING_ID  
from TASK t  
inner join CUSTOMER c on t.CUST_ID = c.CUST_ID  
inner join PROJECT p on t.PROJ_ID = p.PROJ_ID  
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY find on t.id = find.assessment_ID and find.ISACTIVE = 1  and find.ISSUBMITTED =1  
inner join PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1  
inner join PM_CHECKLIST_QUESTIONS qus on find.CHECKLIST_ID=qus.CHECKLIST_ID and qus.ISACTIVE=1  
inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on find.ASSESSMENT_ID=dtls.ASSESSMENT_ID and qus.ID=dtls.PM_CHECKLIST_QUESTION_ID and dtls.ISACTIVE=1  
inner join AUDIT_CHECKLIST_PROJECT_FINDINGS finding on finding.AUDIT_ID = t.ID and finding.ISACTIVE =1 and  
finding.APPLICABLE_QUESTIONS = dtls.PM_CHECKLIST_QUESTION_ID and dtls.process_model_id = finding.process_model_id --and finding.ISSUBMITTED =1  
inner join PM_CHECKLIST_QUESTIONS PCQ on PCQ.ID = finding.APPLICABLE_QUESTIONS and PCQ.ISACTIVE=1  
LEFT join PROCESS_MODEL MODEL ON finding.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1  
LEFT join AUDITEE_ACCEPTANCE ACCEPT ON finding.ID = ACCEPT.finding_id  
LEFT join AUDIT_FINDING_STAGES_MAPPING Stage on finding.ID=Stage.FINDING_ID and Stage.STAGE_ID=4 and Stage.ISACTIVE=1  
LEFT JOIN Process PR ON PR.ID= finding.PROCESS_ID  
WHERE isnull(find.ACTUAL_AUDIT_START_DATE,t.DUE_DATE) between @startDate and @endDate and dtls.MAX_SCORE != 0 and dtls.MAX_SCORE IS NOT NULL and   
(@customerid='0' or  c.CUst_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))   )  and t.ISACTIVE=1  
ORDER by  c.CUST_NM, p.PROJ_NM, [Assessment title], finding.ID  
END

GO

IF EXISTS(Select 1 from sys.objects where name ='getAllIdeasreport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeasreport] 
END

GO
CREATE PROCEDURE [dbo].[getAllIdeasreport]              
     
@Startdate datetime,              
@Enddate datetime,              
@Customerid varchar(max)   
      
AS 

BEGIN              
                 
SELECT c.CUST_NM [CUSTOMER NAME], p.PROJ_NM [PROJECT NAME], port.title [PORTFOLIO NAME], I.DESCRIPTION,           
     
CASE WHEN IBS.BENEFICIARY_ID = 1 then 'For GAVS'    
WHEN IBS.BENEFICIARY_ID = 2 then 'For Customer' END AS BENEFICIARY,    
    
CASE WHEN IBS.BENEFIT_TYPE_ID =1 then 'Quantitative'    
WHEN IBS.BENEFIT_TYPE_ID=2 then 'Qualitative' END AS BENEFIT_TYPE,    
        
CASE WHEN IBS.TYPE_ID = 1 then 'Value'    
WHEN IBS.TYPE_ID =2 then 'Value_Add' END AS TYPE,    

CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'         
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'        
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'        
    WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'        
    WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets' END AS BENEFIT_PILLAR_CATEGORY,    
BDL.BENEFIT_TITLE AS BENEFIT_TITLE,    
BDQ.NET_BENEFITS_YEAR AS NET_BENEFITS,    
    
(U.TITLE +' '+U.DATATYPE) AS UNIT_OF_MEASUREMENT,    
IDS.TITLE AS STATUS,    
CONVERT(VARCHAR(10), I.IDENTIFIED_DATE, 110) as IDENTIFIED_DATE, 
(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [IDEA_TYPE],                        
STUFF((SELECT ', ' + E.FRST_NM from EMP_INFO E inner join IDEA_IDENTIFIER IID on IID.IDENTIFIED_BY = E.EMP_ID
where IID.IDEA_ID = I.ID and IID.ISACTIVE=1 FOR XML PATH('')), 1, 1, '')[Identified_By],
(select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [RESPONSIBLE],    
     
CONVERT(VARCHAR(10), IIP.ESTIMATED_TARGET_DATE, 110) AS TARGET_DATE ,               
CONVERT(VARCHAR(10), IIP.ACTUAL_START_DATE, 110) AS ACTUAL_START_DATE,    
CONVERT(VARCHAR(10), IIP.ACTUAL_END_DATE, 110) AS ACTUAL_END_DATE,     
PSA.TITLE AS SERVICE_AREA    
,I.COMMENTS ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.created_by) [CREATED_BY]          
,CONVERT(VARCHAR(10),I.created_date,110) AS CREATED_DATE,p.cust_id AS [CUSTOMER ID], [PROJECT_ID], pp.PORTFOLIO_ID [PORTFOLIO ID]

FROM [IDEA] I    
inner join IDEA_BENEFIT_SUMMARY IBS ON I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1   
left join BENEFIT_DETAILS_QUANTITATIVE BDQ ON IBS.ID = BDQ.BENEFIT_SUMMARY_ID and BDQ.ISACTIVE =1   
left join BENEFIT_DETAILS_QUALITATIVE BDL ON IBS.ID = BDL.BENEFIT_SUMMARY_ID  and BDL.ISACTIVE =1  
left join IDEA_IMPLEMENTATION_PLAN IIP ON I.ID = IIP.IDEA_ID    
inner join IDEA_STATUS IDS ON I.IDEA_STATUS_ID = IDS.ID        
LEFT join UOM U  ON BDQ.UOM_ID = U.ID    
LEFT join PROCESS_SERVICE_AREA_NEW PSA ON I.SERVICE_AREA_ID = PSA.ID    
inner join PROJECT p on p.proj_id =  I.PROJECT_ID           
inner join CUSTOMER c on c.CUST_ID = p.Cust_id               
LEFT OUTER JOIN PORTFOLIO_PROJECT pp on pp.proj_id =  I.PROJECT_ID             
LEFT OUTER JOIN PORTFOLIO port on pp.portfolio_id = port.id and port.isactive =1      
where I.ISACTIVE = 1 and I.IDENTIFIED_DATE >= @Startdate and I.IDENTIFIED_DATE <= @Enddate  
and I.IDEA_STATUS_ID in (2,3,4,8) and (@customerid='0' or C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))    
order by c.CUST_NM, p.PROJ_NM, IDENTIFIED_DATE desc              
     
END

Go

DECLARE 
    @SpName NVARCHAR(255) = 'reports_getCRISPScores',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO


IF EXISTS(Select 1 from sys.objects where name ='reports_getCRISPScores' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getCRISPScores] 
END

GO

CREATE  PROCEDURE [dbo].[reports_getCRISPScores]    
@STARTDATE DATETIME,    
@ENDDATE DATETIME,
@CUSTOMER varchar(max)='0'    
AS    
BEGIN    
SET @STARTDATE = CONVERT(DATETIME, CONVERT(varchar(11),@STARTDATE, 111 ) + ' 00:00:00', 111)    
SET @ENDDATE = CONVERT(DATETIME, CONVERT(varchar(11),@ENDDATE, 111 ) + ' 23:59:59', 111)    
SELECT (SELECT TOP 1 INFO.FRST_NM  from EMP_INFO INFO    
WHERE  EMP_ID =  p.PROJ_DM_EMP_ID ) CSM,    
C.CUST_NM [CUSTOMER NAME],  PO.TITLE AS [PORTFOLIO NAME],PROJ_NM [PROJECT NAME], FORMAT(PUBLISH_DATE, 'dd-MMM-yyy', 'EN-us') [PUBLISHED DATE],    
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
,c.cust_id, P.PROJ_ID [PROJECT ID]
  
,p.METHODOLOGY, p.BUSINESS_UNIT, p.CONTRACTING_UNIT, p.DEPARTMENT, p.PROJECT_GROUP, p.COUNTRY  
,p.START_DATE, p.END_DATE  
--Business Unit, Contracting Unit, Department, Project Group, Country, Methodology  
FROM [CRISP_SCORES_PROJECT] CSP    
INNER JOIN PROJECT P ON P.PROJ_ID = CSP.PROJECT_ID    
INNER JOIN CUSTOMER C ON C.CUST_ID = P.CUST_ID    
LEFT JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID = CSP.PROJECT_ID  AND PP.ISACTIVE=1    
LEFT JOIN PORTFOLIO PO ON PO.ID = pp.PORTFOLIO_ID AND PO.ISACTIVE=1    
WHERE  c.cust_id != '202100062' and c.cust_id != 'CUST0217' and 
(@CUSTOMER='0' or  c.CUst_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))) and
PUBLISH_DATE >= @STARTDATE AND PUBLISH_DATE <= @ENDDATE ORDER BY 1,2,PUBLISH_DATE    
--STATUS = 'PUBLISHED' AND    
END
GO

DECLARE 
    @SpName NVARCHAR(255) = 'dbo.reports_CSAT_RespondentList',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_RespondentList' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_RespondentList] 
END
GO
CREATE PROCEDURE [dbo].[reports_CSAT_RespondentList]                
  
@StartDate Date,                              
@EndDate Date,
@CUSTOMER varchar(max)='0'  


AS   

BEGIN                
            
WITH CSM AS (                                    
SELECT P.CUST_ID,E.FRST_NM  CSM_NAME FROM project p                                
INNER JOIN EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID) ,                         
            
AM AS (                                    
SELECT distinct P.CUST_ID,E.FRST_NM  CSM_NAME FROM project p                                
INNER JOIN EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID)                
                            
SELECT DISTINCT c.cust_nm [Customer Name], b.DISPLAY_NAME [Respondent Name],  B.EMAIL_ID  [Email_Id],
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT sent Date],
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT received Date],                                
FORMAT(bt.START_DATE,'MMM') +'-' + CAST(YEAR(bt.START_DATE) as varchar(10)) AS MONTH, B.STATUS, 
          
    
Customer_Success_Manager=(select top 1 CSM.CSM_NAME from CSM CSM                
join CSS_BATCH_CUSTOMER_MONTHLY bcc on CSM.CUST_ID = bcc.CUST_ID),

Account_Manager=(select top 1 AM.CSM_NAME from AM AM                
join CSS_BATCH_CUSTOMER_MONTHLY bcc on AM.CUST_ID = bcc.CUST_ID)                


FROM [CSS_BATCH_CUSTOMER_MONTHLY] b 
INNER JOIN CSS_BATCH_MONTHLY bt on   bt.id = b.BATCH_MONTHLY_ID                        
inner join customer c on c.cust_id = b.cust_id                                               
WHERE (( bt.start_date between @StartDate and @EndDate) OR ( bt.End_date between @StartDate and @EndDate))  
and  (@CUSTOMER='0' or  C.CUST_ID in( SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))
order by c.CUST_NM                           
                           
END

GO
DECLARE 
    @SpName NVARCHAR(255) = 'dbo.getCSATAccountSummaryReport',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO


IF EXISTS(Select 1 from sys.objects where name ='getCSATAccountSummaryReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSATAccountSummaryReport] 
END
GO
CREATE PROCEDURE [dbo].[getCSATAccountSummaryReport]            
           
@STARTDATE datetime,    
@ENDDATE datetime,
@CUSTOMER varchar(max)='0'  
                                                                                                                             
AS                                              
BEGIN  
 ;with cte as
(
select  p.BUSINESS_UNIT,c.cust_id,cust_nm,
case when status in ('Mail Sent','Mail Re-sent','completed') then 1 else 0 end as Sentt, case when status ='completed' then 1 else 0 end as Completed ,
isnull((select   avg(  isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) AVR, bc.id
,bc.predicted_score
from css_batch_customers bc 
inner join customer c on c.cust_id = bc.cust_id 
inner join project p on p.proj_id = bc.PROJ_ID
where   batch_id in (select id from css_batches where [START_DATE] = @STARTDATE and [END_DATE] = @ENDDATE) and bc.ISACTIVE=1
and (@CUSTOMER='0' or  c.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')) )
and bc.status in ('mail sent', 'mail re-sent', 'completed' ) 
)
select   BUSINESS_UNIT as BUSINESS_UNIT,cust_nm as [ACCOUNT] ,
convert(varchar, sum(sentt)) AS SURVEYS_SENT,Convert(varchar, sum(completed)) AS SURVEY_RECEIVED,
convert(varchar, case when sum(sentt) = 0 then  0  else  cast( cast(sum(completed) as decimal(10,2))*100/sum(sentt) as decimal(10,2)) end)+'%' AS [RESPONSE_RATE(%)] ,
convert(varchar, cast(  case when sum(completed) > 0 then cast(  sum(  avr) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))) AS AVERAGE_CSAT_SCORE
,convert(varchar, cast(avg(predicted_score) as decimal(10,2))) AS AVERAGE_PREDICTED_SCORE
from cte  group by cust_id, cust_nm,BUSINESS_UNIT   order by BUSINESS_UNIT,cust_nm

END

GO

DECLARE 
    @SpName NVARCHAR(255) = 'dbo.getCSSActionitem_All',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO


IF EXISTS(Select 1 from sys.objects where name ='getCSSActionitem_All' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSActionitem_All] 
END
GO
CREATE PROCEDURE [dbo].[getCSSActionitem_All]     
    
@STARTDATE datetime,    
@ENDDATE datetime,
@CUSTOMER varchar(max)='0'  

    
AS            
    
BEGIN         

select  p.BUSINESS_UNIT,C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,
E.FRST_NM as PROJECT_MANAGER,  
E.email_id as [PM_MAIL_ID],    
E1.frst_nm as CSM ,    
E1.email_id as [CSM_MAIL_ID],
E2.frst_nm as [DELIVERY_PARTNER],    
E2.email_id as [DP_MAIL_ID], 
e3.FRST_NM as [DEX SPOC],
SOURCE as SOURCE_CATEGORY,
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE    
,cq.PERSPECTIVE,--sa.CSS_REFERENCE,
sa.SCORE,sa.CUSTOMER_REMARKS,
PA.DESCRIPTION as  [DESCRIPTION / CORRECTIVE_ACTION_PLAN], PA.STATUS, PA.ROOT_CAUSE, PA.PREVENTIVE_ACTION_PLAN,   
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
[Year Quarter] = LEFT(cbt.frequency, 1) + CONVERT(varchar, cbt.sequence) + ' - ' + CONVERT(varchar, cbt.Year),                
PA.BATCH_CUSTOMER_ID,PA.PROJECT_ID,PA.CUSTOMER_ID     ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
     
from PROJECT_ACTIONITEM PA     
CROSS APPLY fn_splitActionItemCssReference(PA.CSS_REFERENCE) sa
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID    
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID       
inner join CSS_BATCH_CUSTOMERS CB on CB.ID = PA.BATCH_CUSTOMER_ID    
inner join CSS_QUESTION_REPLIES CQ on cq.BATCH_CUSTOMER_ID=cb.id and sa.CSS_REFERENCE=cq.QUESTION
inner join CSS_QUESTION_MASTER cm on cm.id=cq.QUESTION_ID
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID    
inner join EMP_INFO E1 on e1.emp_id  = p.PROJ_DM_EMP_ID                 
inner join EMP_INFO E2 on e2.EMP_ID = p.DP_ID 
INNER JOIN CSS_BATCHES cbt ON cbt.id = CB.Batch_ID and cbt.ISACTIVE = 1    
left join EMP_INFO E3 on e3.EMP_ID  = p.QUALITY_SPOC 

where  PA.ISACTIVE=1 and CB.ISACTIVE=1  --and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE
and cb.BATCH_ID in (select id from css_batches where [START_DATE] = @STARTDATE and [END_DATE] = @ENDDATE) 
and rating between 1 and 3 and cm.QUESTION_CATEGORY ='Criteria' and cm.ISACTIVE=1
and (@CUSTOMER='0' or  c.CUST_ID in	(SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  )
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc    
END    

GO

DECLARE 
    @SpName NVARCHAR(255) = 'dbo.getCSSActionitem',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='getCSSActionitem' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSActionitem] 
END
GO

CREATE PROCEDURE [dbo].[getCSSActionitem]     
    
@STARTDATE datetime,    
@ENDDATE datetime,     
@CUSTOMER varchar(MAX)='0'      
AS            
    
BEGIN         
    
select C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,E.FRST_NM as PROJECT_MANAGER,CB.EMAIL_ID as CUSTOMER_MAIL,    
SOURCE as SOURCE_CATEGORY, SOURCE_DESCRIPTION,   
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE,    
sa.CSS_REFERENCE,sa.SCORE,sa.CUSTOMER_REMARKS,
PA.DESCRIPTION as  [DESCRIPTION / CORRECTIVE_ACTION_PLAN], PA.STATUS, PA.ROOT_CAUSE,PA.PREVENTIVE_ACTION_PLAN,     
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
PA.BATCH_CUSTOMER_ID,PA.PROJECT_ID,PA.CUSTOMER_ID    
    
from PROJECT_ACTIONITEM PA     
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID    
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID    
--inner join CSS_BATCH_CUSTOMER_MONTHLY CB on CB.ID = PA.BATCH_CUSTOMER_MONTHLY_ID    
inner join CSS_BATCH_CUSTOMERS CB on CB.ID = PA.BATCH_CUSTOMER_ID    
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID    
CROSS APPLY fn_splitActionItemCssReference(PA.CSS_REFERENCE) sa    
where PA.CUSTOMER_ID = '212100001' and PA.ISACTIVE=1 and CB.ISACTIVE=1 and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE    
and  (@CUSTOMER='0' or  c.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')) )
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc    
    
END    

GO

DECLARE 
    @SpName NVARCHAR(255) = 'reports_CSAT_Consolidated',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Consolidated' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Consolidated] 
END
GO

CREATE PROCEDURE [dbo].[reports_CSAT_Consolidated]                       
                      
@StartDate date,                     
@EndDate date,
@CUSTOMER varchar(max)='0'     
                    
AS                      
                    
BEGIN                        
     with cte as            
  (            
SELECT                        
c.cust_nm AS [Customer Name],                        
p.proj_nm AS [Project],               
[CSS Sent - Acc Level] = (select  cast(count(*)  as decimal(12,2)) from CSS_BATCH_CUSTOMERS cbc where cbc.BATCH_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1 and SURVEY_SENT_DATE is not null ),            
[CSS Recd - Acc Level] = (select  cast(count(*)   as decimal(12,2)) from CSS_BATCH_CUSTOMERS cbc where cbc.BATCH_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and STATUS in ('Completed') ),            
display_name AS [Respondent],                        
B.EMAIL_ID AS [Email_Id],                        
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                        
[CSAT sent Date],                        
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],                      
[Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),                
b.STATUS,            
pp.TITLE AS [Portfolio],                        
     [Voice of Customer except NPS] =(select case when min(rating)< 3 then 'Red'            
            when min(rating) = 3 then 'Amber'            
            when min(rating) = 4 then 'Green'            
            when min(rating) =5 then 'Blue' end            
           from css_question_replies r where r.batch_customer_id = b.id and question_category ='criteria') ,            
[Voice of Customer - NPS]  = (select case when min(rating)< 9 then 'Red'            
           when   min(rating) >= 9 then 'Green'             
           else null end            
           from css_question_replies r where r.batch_customer_id = b.id and question_category ='NPS'),            
                       
                  
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.DP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [Customer Success Manager],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.DP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [CSM Mail],               
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [BU Head],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [BU Head Mail],     
--(SELECT                        
--E.FRST_NM                        
--FROM project                        
--INNER JOIN EMP_INFO E                        
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                        
--WHERE project.PROJ_ID = B.PROJ_ID)                        
--AS [ACCOUNT MANAGER],   
--(SELECT                        
--E.FRST_NM                        
--FROM EMP_INFO E                        
--where EMAIL_ID= SPOC)                        
--AS [CSS SPOC],  
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')),   
    1, 1, '') AS [CSAT SPOC],   
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [DP NAME], --DP NAME
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [DP MAIL], 
p.PROJ_STATUS,                       
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                        
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                        
--P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],               
p.REVENUE_TYPE as [PROJECT TYPE],            
--P.PROJECT_GROUP [PROJECT GROUP],                         
--P.COUNTRY [COUNTRY],              
                
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  ),            
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),            
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and pa.status  in ('In Progress')),            
--After target date, RAG code (Considering all action item completion ) --Green-100% --Amber-60-99% --Red-Less than 60% --Within due date of target date - Grey , minimum of one is completed - green           
Completed =   (select count(*) from PROJECT_ACTIONITEM PA          
  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and pa.status  in ('Completed')),             
            
[CSS - Improvement Plan submission Status] = (select             
                       
            case when max( PA.TARGET_DATE) is null then 'NA'            
             when   max(pa.COMPLETION_DATE) is not null and max(pa.status) in ('Completed') then 'green'            
             when  max(pa.STATUS)   in ('identified') and max(PA.TARGET_DATE) < getdate()   then 'red'            
              --when max(PA.TARGET_DATE) < getdate()+3 and max(pa.COMPLETION_DATE) is   null then 'amber'            
              when  max(pa.COMPLETION_DATE) is   null then 'grey'            
              else 'NA' end             
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1     ),            
                      
 [CSS - Improvement Plan Implementation Status] = (select             
            case when max( PA.PLANNED_TARGET_DATE) is null then 'NA'            
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.planned_actual_date) is not null and max(pa.status) in ('Completed') then 'green'            
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.status) not in ('Completed')  then 'red'    --and max(pa.planned_actual_date) is   null        
              --when max(PA.PLANNED_TARGET_DATE) < getdate()+7 and max(pa.planned_actual_date) is   null then 'amber'            
              when  max(pa.planned_actual_date) is   null then 'grey'            
              else 'NA' end            
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1     ),            
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,            
            
--CASE                    
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                    
--THEN 'Improvement Plan submission Overdue'                    
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                    
--THEN 'Improvement Plan Completion Overdue'                    
--ELSE pa.status                     
--END AS [Action Item Status],                    
                    
--PA.description as [Action Item Description],                      
ACTION_PLAN_SUBMISSION_TARGET_DATE = (select  FORMAT(Max(PA.TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                    
ACTION_PLAN_SUBMISSION_ACTUAL_DATE =  (select  FORMAT(Max(PA.COMPLETION_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                    
ACTION_PLAN_COMPLETION_TARGET_DATE = (select  FORMAT(Max(PA.PLANNED_TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                
ACTION_PLAN_COMPLETION_ACTUAL_DATE = (select FORMAT(Max(PA.PLANNED_ACTUAL_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                   
c.Cust_ID AS [Customer_ID]  ,  
p.PROJ_ID  
                  
                    
FROM [CSS_BATCH_CUSTOMERS] b                        
INNER JOIN project p                        
ON p.proj_id = b.proj_id                
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
LEFT JOIN portfolio_project PR                      ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                      
LEFT JOIN PORTFOLIO pp                        
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                      
INNER JOIN customer c                        
ON c.cust_id = b.cust_id                    INNER JOIN CSS_BATCHES bt                        
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1                       
 left join EMP_INFO e on e.EMP_ID = p.QUALITY_SPOC     ---SPOC Details                  
--LEFT JOIN PROJECT_ACTIONITEM PA                       
--ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                  
WHERE     b.ISACTIVE = 1                      
AND (bt.start_date BETWEEN @StartDate AND @EndDate                        
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                  
  AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))             
UNION               
            
SELECT                        
c.cust_nm AS [Customer Name],                        
coalesce( pps.product_title + ' (Product)' , p.proj_nm,'') AS [Project],                 
[CSS Sent - Acc Level] = (select  cast(count(*)    as decimal(12,2)) from CSS_BATCH_CUSTOMER_MONTHLY cbc where cbc.BATCH_MONTHLY_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and SURVEY_SENT_DATE is not null ),            
[CSS Recd - Acc Level] = (select  cast(count(*)  as decimal(12,2))  from CSS_BATCH_CUSTOMER_MONTHLY cbc where cbc.BATCH_MONTHLY_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and STATUS in ('completed') ),            
display_name AS [Respondent],                        
B.EMAIL_ID AS [Email_Id],                        
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                        
[CSAT sent Date],                        
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],                      
CASE                      
                       
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                    
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                   
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                   
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                       
END        as              
[Quarter_Year] ,             
b.STATUS,            
pp.TITLE AS [Portfolio],                        
     [Voice of Customer except NPS] =(select case when min(rating)< 3 then 'Red'            
            when min(rating) = 3 then 'Amber'            
            when min(rating) = 4 then 'Green'            
            when min(rating) =5 then 'Blue' end            
           from css_question_replies r where r.Batch_Customer_Monthly_id = b.id and question_category ='criteria') ,            
[Voice of Customer - NPS]  = (select case when min(rating)< 9 then 'Red'            
            when   min(rating) >= 9 then 'Green'             
           else null end            
           from css_question_replies r where r.Batch_Customer_Monthly_id = b.id and question_category ='NPS'),            
                       
                  
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [Customer Success Manager],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [CSM Mail],               
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [BU Head],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [BU Head Mail],  
--(SELECT                        
--E.FRST_NM                        
--FROM project                        
--INNER JOIN EMP_INFO E                        
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                        
--WHERE project.PROJ_ID = B.PROJ_ID)                        
--AS [ACCOUNT MANAGER],   
'',  
'',
'',
p.PROJ_STATUS,                       
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                        
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                        
--P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],                  
p.REVENUE_TYPE as [PROJECT TYPE],            
--P.PROJECT_GROUP [PROJECT GROUP],                        
--P.COUNTRY [COUNTRY],              
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  ),            
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),            
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and pa.status  in ('In Progress')),            
 Completed =   (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and pa.status  in ('Completed')),             
            
[CSS - Improvement Plan submission Status] = (select             
            case when max( PA.TARGET_DATE) is null then 'NA'            
             when   max(pa.COMPLETION_DATE) is not null and max(pa.status) in ('Completed') then 'green'            
            when  max(pa.STATUS)   in ('identified') and max(PA.TARGET_DATE) < getdate()   then 'red'            
              --when max(PA.TARGET_DATE) < getdate()+3 and max(pa.COMPLETION_DATE) is   null then 'amber'            
              when  max(pa.COMPLETION_DATE) is   null then 'grey'            
              else 'NA' end             
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1     ),            
                      
 [CSS - Improvement Plan Implementation Status] = (select             
            case when max( PA.PLANNED_TARGET_DATE) is null then 'NA'            
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.planned_actual_date) is not null and max(pa.status) in ('Completed') then 'green'            
         when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.status) not in ('Completed')  then 'red'    --and max(pa.planned_actual_date) is   null        
              --when max(PA.PLANNED_TARGET_DATE) < getdate()+7 and max(pa.planned_actual_date) is   null then 'amber'            
              when  max(pa.planned_actual_date) is   null then 'grey'            
              else 'NA' end            
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1     ),            
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,            
            
--CASE                    
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                    
--THEN 'Improvement Plan submission Overdue'                  
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                    
--THEN 'Improvement Plan Completion Overdue'                    
--ELSE pa.status                     
--END AS [Action Item Status],                    
                    
--PA.description as [Action Item Description],                      
ACTION_PLAN_SUBMISSION_TARGET_DATE = (select  FORMAT(Max(PA.TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                    
ACTION_PLAN_SUBMISSION_ACTUAL_DATE =  (select  FORMAT(Max(PA.COMPLETION_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                    
ACTION_PLAN_COMPLETION_TARGET_DATE = (select  FORMAT(Max(PA.PLANNED_TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                
ACTION_PLAN_COMPLETION_ACTUAL_DATE = (select  FORMAT(Max(PA.PLANNED_ACTUAL_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                  
c.Cust_ID AS [Customer_ID]      ,  
p.PROJ_ID                   
                  
                    
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                        
           
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
               
LEFT JOIN PORTFOLIO_PRODUCTS pps   on pps.ID = b.PROD_ID and pps.ISACTIVE  =1            
           
left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7      and  prs.isactive =1    
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)              
LEFT JOIN portfolio_project PR                        
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                      
LEFT JOIN PORTFOLIO pp                        
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1           
INNER JOIN customer c                    
ON c.cust_id = b.cust_id                        
INNER JOIN CSS_BATCH_MONTHLY bt                        
ON bt.id = b.BATCH_MONTHLY_ID and bt.ISACTIVE = 1                       
  left join EMP_INFO e on e.EMP_ID = p.QUALITY_SPOC      ---SPOC Details            
--LEFT JOIN PROJECT_ACTIONITEM PA                       
--ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                  
WHERE     b.ISACTIVE = 1                      
AND (bt.start_date BETWEEN @StartDate AND @EndDate                        
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)  
  AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))
)            
select [Customer Name],             
 [Type of Account] =  dbo.fn_getTypeOfAccount ([Customer_ID])  ,            
Project ,            
        
Respondent ,          
[CSS Response %] =  cast( [CSS Recd - Acc Level]/[CSS Sent - Acc Level] *100  as decimal(12,2)),            
Email_Id ,            
[CSAT sent Date],            
[CSAT received Date],             
           
[Voice of Customer except NPS] ,            
[Voice of Customer - NPS] ,          
   [No of Days Since Feedback Recd] = DATEDIFF(day, [CSAT received Date], getdate()),           
   [CSS - Improvement Plan submission Status] = case            
             when TotalActionItems =0 then 'NA'            
             when DATEDIFF(day, [CSAT received Date], getdate()) > 7             
             then              
              case when TotalActionItems = Planned + SubmissionCompleted then 'green'            
               --when cast(planned + SubmissionCompleted as decimal(12,2)) / cast(TotalActionItems as decimal(12,2)) > .6 then 'amber'            
               else 'red' end            
             else             
              case when Planned =0 then 'grey' else 'green' end            
              end,            
[CSS - Improvement Plan Implementation Status]   =  case            
             when TotalActionItems =0 then 'NA'            
             when DATEDIFF(day, [CSAT received Date], getdate()) > 28             
             then              
        case when TotalActionItems = Completed then 'green'            
              -- when cast(  Completed as decimal(12,2)) / cast(TotalActionItems as decimal(12,2)) > .6 then 'amber'            
               else 'red' end            
             else             
              case when Completed =0 then 'grey' else 'green' end            
              end,          
[Customer Success Manager] ,            
[CSM Mail],            
[BU Head],            
[BU Head Mail],    
[CSAT SPOC],  
[DP NAME],
[DP MAIL],
[CONTRACTING UNIT],          
 [BUSSINESS UNIT] as [BUSINESS UNIT],            
 Department,            
PROJ_STATUS ,            
   [Project Type],            
 Year_Quarter ,            
STATUS ,            
Portfolio,           
 [Voice of Customer url] ,            
[ACTION_PLAN_SUBMISSION_TARGET_DATE] ,            
[ACTION_PLAN_SUBMISSION_ACTUAL_DATE],            
[ACTION_PLAN_COMPLETION_TARGET_DATE],             
[ACTION_PLAN_COMPLETION_ACTUAL_DATE],             
[CSS Sent - Acc Level],            
[CSS Recd - Acc Level],            
            
Customer_ID  ,  
proj_id  
 from cte            
ORDER BY [Year_Quarter], [Customer Name];                           
END   

GO

IF EXISTS(Select 1 from sys.objects where name ='CSS_Readiness_Report' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[CSS_Readiness_Report] 
END
GO

CREATE PROCEDURE [dbo].[CSS_Readiness_Report]                          
                          
@StartDate datetime,                          
@EndDate datetime   ,                       
@CustomerID VARCHAR(max)='0'                      
                      
AS                                 
BEGIN                           
                          
SET @StartDate = CONVERT(DATETIME, CONVERT(VARCHAR(11),@StartDate, 111 ) + ' 00:00:00', 111)                            
SET @EndDate = CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)                                
                          
declare @skipCSAT int = (SELECT ID FROM PROJECT_CONFIGURATION_SETTING WHERE SETTING_KEY ='SKIP_CSAT' AND ISACTIVE=1)     --11                     
                    
;with cte as                    
(                    
  SELECT C.CUST_NM, P.PROJ_NM,                     
  HEAD_COUNT = (select count(*) from proj_resource pr where proj_id = p.proj_id and (pr.start_date between @startDate and  @EndDate  or pr.end_date between @startDate and  @EndDate or ( pr.START_DATE <= @startDate and pr.END_DATE >= @EndDate ))     
  and  CURR_INDC ='y'  and BILL_FLG =1 ),               
            
  CONVERT(VARCHAR,P.START_DATE,107) AS START_DATE,CONVERT(VARCHAR,P.END_DATE,107)AS END_DATE,                                    
  CSS_CONFIGURED = CASE WHEN CU.EMAILID IS NOT NULL THEN 'Yes' ELSE 'No' END,                          
  CUSTOMER_CONTACT_VERIFICATION = (SELECT CASE WHEN CSS.IS_VERIFIED = 1 THEN 'Yes' ELSE 'No' END),                         
  CSS.COMMENTS as VERIFICATION_COMMENTS,                        
  VERIFIED_BY = (SELECT CASE WHEN CSS.IS_VERIFIED=1 THEN E5.FRST_NM                         
   WHEN CSS.COMMENTS IS NOT NULL THEN E5.FRST_NM ELSE NULL END),                         
  CASE WHEN CSS.IS_VERIFIED=1 then CONVERT(VARCHAR,CSS.UPDATED_DATE,107) else null end AS APPROVAL_DATE ,                        
  CU.DISPLAY_NAME as RESPONDENT_NAME,                          
  CU.EMAILID as RESPONDENT_MAIL,                          
  CC.Contact_ROLE as [Role],                 
 '' RoleType,                
  P.PROJ_STATUS , P.PROJECT_TYPE, P.BUSINESS_UNIT, P.DEPARTMENT, P.PROJECT_GROUP, P.CONTRACTING_UNIT,                           
  P.REVENUE_TYPE, P.COUNTRY, P.METHODOLOGY,                        
   [Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,                       
  ACCOUNT_OWNER = CASE WHEN P.PROJ_ID LIKE 'proj%' THEN 'GSLab' ELSE 'GAVS' END,                                     
  E1.FRST_NM AS PM, E1.EMAIL_ID AS [PM MAIL ID], E2.FRST_NM AS CSM, E2.EMAIL_ID AS [CSM MAIL ID],                            
  E3.FRST_NM AS ACCOUNT_MANAGER, E3.EMAIL_ID AS [AM MAIL ID], E4.FRST_NM AS [BU HEAD], E4.EMAIL_ID AS [BU MAIL ID], E.FRST_NM AS QUALITY_SPOC, 
  E6.FRST_NM as [DP NAME], E6.EMAIL_ID as [DP MAIL ID],--DP
  STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC],
  (SELECT TOP 1 EMAIL_ID FROM EMP_INFO WHERE EMP_ID = E2.REVIEWER_EMP_ID) AS [CSM REVIEWER MAIL ID],                      
  SKIP_CSAT = (SELECT case when isnull(bit_value,0) =1 then 'Yes' else 'No' end  FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                        
  SKIP_CSAT_COMMENTS = (SELECT PDC.COMMENTS FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                                     
  P.PROJ_ID, C.CUST_ID   ,  p.proj_dm_Emp_id,  b.id as BATCH_ID, css.id BATCH_CUSTOMER_ID, 0 BATCH_MONTHLY_ID,0 BATCH_CUSTOMER_MONTHLY_ID                                        
                          
  FROM PROJECT P                         
  INNER JOIN CUSTOMER C ON P.CUST_ID = C.CUST_ID                                          
  LEFT JOIN EMP_INFO E ON E.EMP_ID  = P.QUALITY_SPOC                             
  INNER JOIN EMP_INFO E1 ON E1.EMP_ID  = P.PROJ_PM_EMP_ID                                
  INNER JOIN EMP_INFO E2 ON E2.EMP_ID  = P.DP_ID                                       
  INNER JOIN EMP_INFO E3 ON E3.EMP_ID  = P.PROJ_AM_EMP_ID                             
  INNER JOIN EMP_INFO E4 ON E4.EMP_ID = P.PROJ_BUHEAD_EMP_ID          
  Inner join EMP_INFO E6 on E6.EMP_ID = P.PROJ_DM_EMP_ID  --DP
                       
  LEFT JOIN CSS_BATCHES B ON  ((B.START_DATE BETWEEN @StartDate AND  @EndDate) and (B.END_DATE BETWEEN @StartDate AND  @EndDate)         )               
    LEFT JOIN CSS_BATCH_CUSTOMERS CSS on CSS.PROJ_ID = P.PROJ_ID and css.BATCH_ID = b.ID                 
  LEFT JOIN CUSTOMER_USERS CU on CU.EMAILID = CSS.EMAIL_ID                
  LEFT JOIN EMP_INFO E5 ON E5.EMP_ID = CSS.UPDATED_BY AND E5.DOR IS NULL                        
  LEFT JOIN CONTACTS CC on CC.CONTACT_EMAILID = CSS.EMAIL_ID    AND CC.ISACTIVE =1                  
                 
  WHERE  -- p.end_date > getdate()-90 AND                     
  P.CUST_ID != '212100001' AND                        
  (B.START_DATE IS NULL OR (B.START_DATE BETWEEN @StartDate AND @EndDate AND B.END_DATE BETWEEN @StartDate AND @EndDate))    AND                       
      (@CustomerID='0' or  c.cust_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))                      
                      
  UNION                        
                        
  SELECT C.CUST_NM, P.PROJ_NM,                      
  HEAD_COUNT = (select count(*) from proj_resource pr where proj_id = p.proj_id and (pr.start_date between @startDate and  @EndDate  or pr.end_date between @startDate and  @EndDate or ( pr.START_DATE <= @startDate and pr.END_DATE >= @EndDate )) and  CURR_INDC ='y'  and BILL_FLG =1 ),                    
  CONVERT(VARCHAR,P.START_DATE,107) AS START_DATE,CONVERT(VARCHAR,P.END_DATE,107)AS END_DATE,                                    
  CSS_CONFIGURED = CASE WHEN CU.EMAILID IS NOT NULL THEN 'Yes' ELSE 'No' END,                          
  CUSTOMER_CONTACT_VERIFICATION = (SELECT CASE WHEN CSS.IS_VERIFIED = 1 THEN 'Yes' ELSE 'No' END),                         
  CSS.COMMENTS as VERIFICATION_COMMENTS,                        
  VERIFIED_BY = (SELECT CASE WHEN CSS.IS_VERIFIED=1 THEN E5.FRST_NM                         
   WHEN CSS.COMMENTS IS NOT NULL THEN E5.FRST_NM ELSE NULL END),                         
    CASE WHEN CSS.IS_VERIFIED=1 then CONVERT(VARCHAR,CSS.UPDATED_DATE,107) else null end AS APPROVAL_DATE ,                      
  CU.DISPLAY_NAME as RESPONDENT_NAME,                          
  CU.EMAILID as RESPONDENT_MAIL,                          
  cc.CONTACT_ROLE AS [role],                  
  CR.ROLE_NAME RoleType,                
  P.PROJ_STATUS , P.PROJECT_TYPE, P.BUSINESS_UNIT, P.DEPARTMENT, P.PROJECT_GROUP, P.CONTRACTING_UNIT,                           
  P.REVENUE_TYPE, P.COUNTRY, P.METHODOLOGY,                          
   [Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,                        
  ACCOUNT_OWNER = CASE WHEN P.PROJ_ID LIKE 'proj%'  THEN 'GSLab' ELSE 'GAVS' END,                                     
  E1.FRST_NM AS PM, E1.EMAIL_ID AS [PM MAIL ID], E2.FRST_NM AS CSM, E2.EMAIL_ID AS [CSM MAIL ID],                            
  E3.FRST_NM AS ACCOUNT_MANAGER, E3.EMAIL_ID AS [AM MAIL ID], E4.FRST_NM AS [BU HEAD], E4.EMAIL_ID AS [BU MAIL ID], E.FRST_NM AS QUALITY_SPOC,   
  '','','',  --DP
  (SELECT TOP 1 EMAIL_ID FROM EMP_INFO WHERE EMP_ID = E2.REVIEWER_EMP_ID) AS [CSM REVIEWER MAIL ID],                              
  SKIP_CSAT = (SELECT case when isnull(bit_value,0) =1 then 'Yes' else 'No' end  FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                     
  SKIP_CSAT_COMMENTS_ = (SELECT PDC.COMMENTS FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                                     
  P.PROJ_ID, C.CUST_ID     ,  p.proj_dm_Emp_id, 0 as BATCH_ID, 0 BATCH_CUSTOMER_ID, b.id BATCH_MONTHLY_ID,css.id  BATCH_CUSTOMER_MONTHLY_ID                                      
                     
  FROM PROJECT P                         
  INNER JOIN CUSTOMER C ON P.CUST_ID = C.CUST_ID                                          
  LEFT JOIN EMP_INFO E ON E.EMP_ID  = P.QUALITY_SPOC                                  
  INNER JOIN EMP_INFO E1 ON E1.EMP_ID  = P.PROJ_PM_EMP_ID                                      
  INNER JOIN EMP_INFO E2 ON E2.EMP_ID  = P.DP_ID                                       
  INNER JOIN EMP_INFO E3 ON E3.EMP_ID  = P.PROJ_AM_EMP_ID                                 
  INNER JOIN EMP_INFO E4 ON E4.EMP_ID = P.PROJ_BUHEAD_EMP_ID                          
  Inner join EMP_INFO E6 on E6.EMP_ID = P.PROJ_DM_EMP_ID  --DP
                       
  LEFT JOIN CSS_BATCH_MONTHLY B ON  ((B.START_DATE BETWEEN @StartDate AND  @EndDate) and (B.END_DATE BETWEEN @StartDate AND  @EndDate)         )                 
    LEFT JOIN CSS_BATCH_CUSTOMER_MONTHLY CSS on CSS.PROJ_ID = P.PROJ_ID    and b.ID = css.BATCH_MONTHLY_ID              
  LEFT JOIN CUSTOMER_USERS CU on CU.EMAILID = CSS.EMAIL_ID                          
  LEFT JOIN EMP_INFO E5 ON E5.EMP_ID = CSS.UPDATED_BY AND E5.DOR IS NULL                        
  LEFT JOIN CONTACTS CC ON CC.CONTACT_EMAILID = CSS.EMAIL_ID    AND CC.ISACTIVE =1                  
   LEFT JOIN CONTACT_ROLES cr on cc.ROLE_ID = cr.ROLE_ID                
  WHERE --p.end_date > @EndDate-90  AND                     
  P.CUST_ID='212100001' AND                        
 (B.START_DATE IS NULL OR (B.START_DATE BETWEEN @StartDate AND @EndDate AND B.END_DATE BETWEEN @StartDate AND @EndDate))    AND                
        (@CustomerID='0' or  c.cust_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))   --and batch_monthly_id not in (99,-99)                 
)                    
                    
              
                    
select distinct CUST_NM, PROJ_NM,                      
  HEAD_COUNT  ,                    
  START_DATE,                    
   END_DATE,                     
   CSS_Eligible =                    
  ( case when  skip_csat is not null then 'No'                    
   when project_type != 'Internal' and head_count > 3 and start_date < @EndDate -75 and end_date > @EndDate -90 then 'Yes'                    
                  
  else 'No' end),                    
  [Reason] =( case  when project_type != 'Internal' and head_count > 3 and start_date < @EndDate -75 and end_date > @EndDate -90 then  'NA'                    
  when project_type = 'Internal' then 'Internal'                    
  when  skip_csat is not null then 'Skip CSAT'                    
    when head_count <= 3 then 'Head Count less than 4'                    
   when  start_date > (@EndDate -75) then 'Recently Started'                    
   When end_date < (@EndDate - 90) then 'Closed Long Back'                     
                      
  else 'NA' end                    
  ),                    
  CSS_CONFIGURED  ,                          
  CUSTOMER_CONTACT_VERIFICATION  ,                        
  VERIFIED_BY  ,            
  VERIFICATION_COMMENTS,        
   APPROVAL_DATE,                        
    RESPONDENT_NAME,                          
   RESPONDENT_MAIL,                          
   [Role],  RoleType as ROLE_TYPE,                 
  PROJ_STATUS , PROJECT_TYPE, BUSINESS_UNIT, DEPARTMENT, PROJECT_GROUP, CONTRACTING_UNIT,                           
  REVENUE_TYPE, COUNTRY, METHODOLOGY,                          
   [Type of Account] as TYPE_OF_ACCOUNT  ,                        
  ACCOUNT_OWNER  ,                                     
   PM, [PM MAIL ID] as PM_MAIL,   CSM,  [CSM MAIL ID] as CSM_MAIL,                            
    ACCOUNT_MANAGER,  [AM MAIL ID] as AM_MAIL,   [BU HEAD] as BU_HEAD,   [BU MAIL ID] as BU_MAIL, [DP NAME], [DP MAIL ID], QUALITY_SPOC, [CSAT SPOC],                          
    [CSM REVIEWER MAIL ID]  as REVIEWER_MAIL,                              
  SKIP_CSAT ,                     
  SKIP_CSAT_COMMENTS ,                                     
  PROJ_ID, CUST_ID    ,BATCH_ID,   BATCH_CUSTOMER_ID,  BATCH_MONTHLY_ID,  BATCH_CUSTOMER_MONTHLY_ID , proj_DM_EMP_ID as CSM_EMP_ID                      
 from cte                    
 where   (isnull(proj_status,'')!='close' or (proj_status = 'close' and end_date between @startdate and @enddate) ) and                     
 PROJECT_TYPE != 'internal' and cust_id !='202100091' and cust_nm not like '%gavs%'                    
ORDER BY CUST_NM, PROJ_NM                              
                                                 
                          
END

GO

DECLARE 
    @SpName NVARCHAR(255) = 'reports_CSATDUMP_withteamMEMBERS',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSATDUMP_withteamMEMBERS' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSATDUMP_withteamMEMBERS] 
END
GO

CREATE PROCEDURE [dbo].[reports_CSATDUMP_withteamMEMBERS]    
@StartDate Date,  
@EndDate Date ,
@CUSTOMER varchar(max)='0'
AS    
BEGIN     
  
  
        
WITH CSM AS (        
 

SELECT PR.PROJ_ID, p.proj_nm,   E.FRST_NM  CSM_NAME FROM PROJ_RESOURCE PR        
INNER JOIN EMP_INFO E ON E.EMP_ID = PR.EMP_ID and pr.CURR_INDC ='y' and E.CSM_TITLE_ID = 1  
inner join project p on p.proj_id = pr.proj_id
  
)     
  
SELECT  c.cust_nm [Customer Name], p.proj_nm [Project Name],CSM.CSM_NAME [Customer Success Manager], display_name [Respondent Name],  B.EMAIL_ID  [Email Id]      
, FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT sent Date]        
,FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT received Date]        
,[Year - Quarter]  =  Left( bt.frequency,1) + Convert(varchar,bt.sequence) + ' - ' + Convert(varchar, bt.Year)        
, CASE         
WHEN Convert(varchar,P.Cust_id) LIKE '202%' THEN 'US'          
 WHEN  Convert(varchar,P.Cust_id) LIKE '201%' THEN 'India'          
 WHEN  Convert(varchar,P.Cust_id) LIKE '207%' THEN 'Dubai'          
 WHEN  Convert(varchar,P.Cust_id) LIKE '206%' THEN 'Oman'          
 ELSE ''          
 END AS REGION    
 , (SELECT TOP 1 QUESTION FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)   [Q1 Question]      
 , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)   [Q1 Rating]        
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)  [Q1 Comments]        
, (SELECT TOP 1 QUESTION FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)  [Q2 Question]      
 , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)   [Q2 Rating]        
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)  [Q2 Comments]        
 , (SELECT TOP 1 QUESTION FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)  [Q3 Question]      
 , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)  [Q3 Rating]        
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)   [Q3 Comments]        
 , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 4)  [NPS Rating]        
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 4)   [NPS Comments ]       
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '')  FROM CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 5)   [Any Other Feedback]      
 , E.EMP_ID [EMP ID]  
 , E.FRST_NM + ' ' + ISNULL(E.LAST_NM,'') [EMP NAME]      
 , c.Cust_ID [Customer ID]
 , p.proj_id [Project ID]            

  FROM [CSS_BATCH_CUSTOMERS] b        
        
  inner join project p on p.proj_id = b.proj_id        
  inner join customer c on c.cust_id = b.cust_id        
  INNER JOIN CSM CSM ON CSM.PROJ_ID = B.PROJ_ID      
  INNER JOIN CSS_BATCHES bt on   bt.id = b.Batch_ID  
  INNER JOIN PROJ_RESOURCE PR ON PR.PROJ_ID = P.PROJ_ID  
  INNER JOIN EMP_INFO E ON PR.EMP_ID = E.EMP_ID  
  
  WHERE b.STATUS = 'COMPLETED'  and (( bt.start_date between @StartDate and @EndDate    ) OR ( bt.ENd_date between @StartDate and @EndDate))    
  and ( PR.ENd_date >= @EndDate)   
  AND E.EMP_ID NOT IN ('102802', '101566','101955','100174' ) AND E.CSM_TITLE_ID NOT IN (2,8,10) and   CURR_INDC ='y'  
    and  (@CUSTOMER='0' or  C.CUST_ID	in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))) 
  order by bt.id,[Customer Name]     
    
  END 

GO

---------------------------------------------------------------------------------------------------------------------------------------------------------------------







