Begin Tran

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallKPIList' AND TYPE='P')
BEGIN
       DROP PROCEDURE getOverallKPIList
END
GO

CREATE PROCEDURE getOverallKPIList              

AS
BEGIN                    

Select KM.ID as KPI_ID, KM.KPI_NAME, KM.FREQUENCY, KM.SLA_TARGET_UNIT_OF_MEASUREMENT, KM.SERVICE_AREA, BM.ID as BASE_MEASURE_ID,
BM.NUMERATORDESCRIPTION, BM.DENOMINATORDESCRIPTION, BM.BASE_MEASURE_FORMULA_TYPE_ID, BMF.FORMULA_DESCRIPTION, BMF.FORMULA, BMF.SLA_FORMULA

from KPI_MASTER KM 
inner join KPI_MASTER2BASE_MEASURE_CONFIG KMB on KMB.KPI_MASTER_ID = KM.ID
inner join BASE_MEASURE BM on BM.ID = KMB.BASE_MEASURE_ID
inner join BASE_MEASURE_FORMULA_TYPE BMF on BMF.ID = BM.BASE_MEASURE_FORMULA_TYPE_ID
where KM.ISACTIVE=1 and KMB.ISACTIVE=1 and BM.ISACTIVE=1 and BMF.ISACTIVE=1
order by KM.KPI_NAME

END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
END
GO 		


CREATE PROCEDURE [dbo].[reports_CSAT_Combined] @StartDate date, @EndDate date  
AS  
BEGIN  

  
  SELECT  
    c.cust_nm AS [Customer Name],  
    p.proj_nm AS [Project Name],  
    display_name AS [Respondent Name],  
    B.EMAIL_ID AS [Email_Id],  
    FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS  
    [CSAT sent Date],  
    FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  
    [Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),  
    pp.TITLE AS [Portfolio],  
  
    qr.QUESTION_CATEGORY,  
    qr.QUESTION,  
    qr.RATING,  
    qr.RATING_DESCRIPTION,  
    c.Cust_ID AS [Customer_ID],  
    (SELECT  
      E.FRST_NM  
    FROM project  
    INNER JOIN EMP_INFO E  
      ON E.EMP_ID = project.PROJ_DM_EMP_ID  
    WHERE project.PROJ_ID = B.PROJ_ID)  
    AS [Customer Success Manager],  
    (SELECT  
      E.FRST_NM  
    FROM project  
    INNER JOIN EMP_INFO E  
      ON E.EMP_ID = project.PROJ_AM_EMP_ID  
    WHERE project.PROJ_ID = B.PROJ_ID)  
    AS [ACCOUNT MANAGER],  
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],  
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],  
    P.METHODOLOGY AS [METHODOLOGY],  
    P.DEPARTMENT AS [DE  
PARTMENT],  
    P.PROJECT_GROUP [PROJECT GROUP],  
    P.COUNTRY [COUNTRY],
	PA.STATUS as [Action Item Status],
	PA.description as [Action Item Description],
	FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]	
  FROM [CSS_BATCH_CUSTOMERS] b  
  INNER JOIN project p  
    ON p.proj_id = b.proj_id  
  LEFT JOIN portfolio_project PR  
    ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1
  LEFT JOIN PORTFOLIO pp  
    ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1
  INNER JOIN customer c  
    ON c.cust_id = b.cust_id  
  INNER JOIN CSS_BATCHES bt  
    ON bt.id = b.Batch_ID and bt.ISACTIVE = 1 
  INNER JOIN CSS_QUESTION_REPLIES QR  
    ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1
  LEFT JOIN PROJECT_ACTIONITEM PA 
	ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1
  AND (bt.start_date BETWEEN @StartDate AND @EndDate  
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)  
  UNION  
  SELECT  
    c.cust_nm AS [Customer Name],  
    COALESCE(P.PROJ_NM, PFT.PRODUCT_TITLE) AS [Project Name],
    b.DISPLAY_NAME AS [Respondent Name],  
    B.EMAIL_ID AS [Email_Id],  
    FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],  
    FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  
    CONCAT(  
    'Q', CASE  
      WHEN MONTH(bt.START_DATE) BETWEEN 4 AND 6 THEN '1'  
      WHEN MONTH(bt.START_DATE) BETWEEN 7 AND 9 THEN '2'  
      WHEN MONTH(bt.START_DATE) BETWEEN 10 AND 12 THEN '3'  
      ELSE '4'  
    END, ' - ', YEAR(bt.START_DATE)) AS [Quarter_Year],  
    pp.TITLE [Portfolio],  
    qr.QUESTION_CATEGORY,  
    qr.QUESTION,  
    qr.RATING,  
    qr.RATING_DESCRIPTION,  
    c.Cust_ID AS [Customer_ID],  
    (SELECT  
      E.FRST_NM  
    FROM project  
    INNER JOIN EMP_INFO E  
      ON E.EMP_ID = project.PROJ_DM_EMP_ID  
    WHERE project.PROJ_ID = p.PROJ_ID)  
    AS [Customer Success Manager],  
    (SELECT  
      E.FRST_NM  
    FROM project  
    INNER JOIN EMP_INFO E  
      ON E.EMP_ID = project.PROJ_AM_EMP_ID  
    WHERE project.PROJ_ID = p.PROJ_ID)  
    AS [ACCOUNT MANAGER],  
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],  
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],  
    P.METHODOLOGY AS [METHODOLOGY],  
    P.DEPARTMENT AS [DEPARTMENT],  
    P.PROJECT_GROUP [PROJECT GROUP],  
    P.COUNTRY [COUNTRY],
	PA.STATUS as [Action Item Status],
	PA.description as [Action Item Description],
	FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] b  
  INNER JOIN CSS_BATCH_MONTHLY bt  
    ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1 
  INNER JOIN CSS_QUESTION_REPLIES QR  
    ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1
  INNER JOIN customer c  
    ON c.cust_id = b.cust_id  
  LEFT JOIN project p  
    ON p.proj_id = b.PROJ_ID
  LEFT JOIN portfolio_project PR  
    ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1
  LEFT JOIN PORTFOLIO pp  
    ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1
	LEFT JOIN PORTFOLIO_PRODUCTS PFT
	ON PFT.ID = b.PROD_ID and PFT.ISACTIVE = 1
   LEFT JOIN PROJECT_ACTIONITEM PA 
   ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1 
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1
  AND (bt.start_date BETWEEN @StartDate AND @EndDate  
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)  
  ORDER BY [Year_Quarter], [Customer Name];  
END  
GO

IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_INSCOPE_DETAILS' AND COLUMN_NAME='TECHNOLOGY')
BEGIN
ALTER TABLE PROJECT_INSCOPE_DETAILS ADD TECHNOLOGY varchar(max) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='RAG')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD RAG varchar(10) NULL
END
GO

IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='SCOPE')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD SCOPE varchar(MAX) NULL
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjectWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectWiseCAPACount]
END
GO

CREATE PROCEDURE [dbo].[getProjectWiseCAPACount]
  
@customerId  varchar(50),            
@startDate datetime,            
@endDate datetime          
     
AS         
BEGIN            
  
declare @quarterStartDate Datetime            
declare @quarterEndDate datetime            
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));            
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));            
;with CTE AS            
(        
select PP.PROJ_ID as PROJECT_ID,PP.PROJ_NM as PROJECT_TITLE,KD.ID as KPI_DETAILS_ID,          
[RESUBMITTED] = (select Count(DISTINCT CAPA.KPI_DETAILS_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where AFSM.KPI_DETAILS_ID = KD.ID and AFSM.ISCOMPLETE=0 and AFSM.STAGE_STATUS='Corrective Action Plan Resubmit' and AFSM.ISACTIVE=1),        
[SUBMITTED] = (select Count(DISTINCT CAPA.KPI_DETAILS_ID) from AUDIT_FINDINGS_CAPA CAPA where CAPA.KPI_DETAILS_ID = KD.ID and CAPA.ISACTIVE=1 and CAPA.ISSUBMITTED=1 ),            
[REVIEW] =  (select COUNT(DISTINCT R.KPI_DETAILS_ID) from AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1 and R.ISAPPROVED=1),            
[IMPLEMENTATION] = (select COUNT(DISTINCT IMP.KPI_DETAILS_ID) from AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1 and IMP.ISIMPLEMENTED=1),            
[VERIFICATION] = (select COUNT(DISTINCT VER.KPI_DETAILS_ID)  from AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1 and VER.ISVERIFIED=1),            
[CUSTOMER_APPROVAL] = (select COUNT(DISTINCT CUST_APPROVAL.CAPA_ID) from CUSTOMER_CAPA_APPROVAL CUST_APPROVAL where  CUST_APPROVAL.CAPA_ID = MAX(CAPA.ID) and CUST_APPROVAL.ISACTIVE = 1 and CUST_APPROVAL.STATUS_ID=1) ,        
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE,         
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where AFSM.KPI_DETAILS_ID = KD.ID and AFSM.ISCOMPLETE=0 and AFSM.STAGE_STATUS='Corrective Action Plan Resubmit' and AFSM.ISACTIVE=1) as RESUBMISSION           
        
from            
PROJECT PP            
left join KPI K on pp.PROJ_ID = K.project_id and  K.ISACTIVE = 1        
inner join KPI_DETAILS KD  on  k.id = KD.KPI_ID  and kd.ISACTIVE = 1       
left join AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1            
     
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0  and k.CUSTOMER_ID = @customerId and    
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)            
or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )            
group by PP.PROJ_ID ,PP.PROJ_NM,KD.ID   
)            
select PROJECT_ID,PROJECT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET,         
[DUE_FOR_SUBMISSION] = SUM(case when RESUBMISSION = 1 then RESUBMITTED else 0 End),        
[DUE_FOR_REVIEW] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),            
[DUE_FOR_QA_APPROVAL] = SUM(case when CAPA_STAGE = 2 then REVIEW else 0 End),          
[DUE_FOR_IMPLEMENTATION] = SUM(case when CAPA_STAGE = 5 and IMPLEMENTATION = 0 and VERIFICATION = 0 then CUSTOMER_APPROVAL else 0 End),        
[DUE_FOR_VERIFICATION] = SUM(case when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 0 then IMPLEMENTATION else 0 End),            
[CLOSED] = SUM(case when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 1 then VERIFICATION else 0 End)     
from CTE            
group by PROJECT_ID,PROJECT_TITLE        
order by PROJECT_TITLE         
END  
GO  

IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='AUDIT_CHECKLIST_EXECUTION_SUMMARY' AND COLUMN_NAME='UPDATED_SCORE')
BEGIN

ALTER TABLE AUDIT_CHECKLIST_EXECUTION_SUMMARY ADD UPDATED_SCORE DECIMAL(10, 2)
ALTER TABLE AUDIT_CHECKLIST_EXECUTION_SUMMARY ADD UPDATED_PERCENTAGE_SCORE DECIMAL(10, 2)

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getAllAssessmentFindings' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getAllAssessmentFindings]
END
GO

CREATE procedure [dbo].[reports_getAllAssessmentFindings] 
 
@startDate Datetime,  
@endDate Datetime,  
@customerid varchar(50)='0'  

AS  
BEGIN  

select  c.CUST_NM , p.PROJ_NM,  
AUDIT_TITLE [Assessment title],      Convert(varchar,PLANNED_AUDIT_START_DATE ,107) [Planned Start Date],  
Convert(varchar,Actual_audit_start_date,107) [Actual Start Date],  
Convert(varchar,Actual_audit_end_date,107) [Actual End Date],  
dtls.SCORE, ((dtls.SCORE / dtls.MAX_SCORE)*100) as PERCENTAGE_SCORE, dtls.UPDATED_SCORE as CURRENT_SCORE, 
((dtls.UPDATED_SCORE / dtls.MAX_SCORE)*100) as CURRENT_PERCENTAGE_SCORE,
Convert(varchar,find.created_date,107)    as created_date ,  
(select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,  
MODEL.TITLE  [Process Model],  
(select title from process_service_area_new where id = finding.service_area_id) [Service Area],  
(select title from Process_area where id = finding.process_area_id) [Process Area],  
PR.TITLE [Process Title],PR.DESCRIPTION [Process Description],  
PR.CLAUSE_REFERENCE [ISO/Process Model Clause Reference], PR.CONTROL_REFERENCE [ISO/Process Model Control Reference],  
PCQ.TITLE as QUESTION_TITLE, finding.finding_type, finding.finding_description,  
(select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_ID from AUDIT_CHECKLIST_EXECUTION_SUMMARY WHERE assessment_ID = t.id and ISACTIVE = 1)) [Auditor],  
t.DESCRIPTION, t.STATUS,    ACCEPT.status [FINDING_ACCEPTANCE_STATUS],  
(case when Stage.ISCOMPLETE=1 then 'Closed'  
when Stage.ISCOMPLETE=0 then 'Open'  
END) [FINDING_STATUS],  
(SELECT TOP 1 ROOT_CAUSE FROM AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],  
(SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN],  
c.CUST_ID , p.PROJ_ID, t.ID as AssessmentID, finding.ID as [Finding_ID]  
from TASK t  
inner join CUSTOMER c on t.CUST_ID = c.CUST_ID  
inner join PROJECT p on t.PROJ_ID = p.PROJ_ID  
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY find on t.id = find.assessment_ID and find.ISACTIVE = 1  and find.ISSUBMITTED =1  
inner join PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1  
inner join PM_CHECKLIST_QUESTIONS qus on find.CHECKLIST_ID=qus.CHECKLIST_ID and qus.ISACTIVE=1    
inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on find.ASSESSMENT_ID=dtls.ASSESSMENT_ID and qus.ID=dtls.PM_CHECKLIST_QUESTION_ID and dtls.ISACTIVE=1    
left join AUDIT_CHECKLIST_PROJECT_FINDINGS finding on finding.AUDIT_ID = t.ID and finding.ISACTIVE =1  and finding.ISSUBMITTED =1  
inner join PM_CHECKLIST_QUESTIONS PCQ on PCQ.ID = finding.APPLICABLE_QUESTIONS and PCQ.ISACTIVE=1  
LEFT join PROCESS_MODEL MODEL ON finding.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1  
LEFT join AUDITEE_ACCEPTANCE ACCEPT ON finding.ID = ACCEPT.finding_id  
LEFT join AUDIT_FINDING_STAGES_MAPPING Stage on finding.ID=Stage.FINDING_ID and Stage.STAGE_ID=4 and Stage.ISACTIVE=1  
LEFT JOIN Process PR ON PR.ID= finding.PROCESS_ID  
WHERE t.DUE_DATE between @startDate and @endDate and dtls.MAX_SCORE != 0 and dtls.MAX_SCORE IS NOT NULL and
(@customerid='0' or  c.CUst_id = @customerid)  and t.ISACTIVE=1  
ORDER by  c.CUST_NM, p.PROJ_NM,   [PLANNED_AUDIT_START_DATE], [Assessment title]  
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getMonthlyProcessHealthbyAudits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyProcessHealthbyAudits]
END
GO

CREATE PROCEDURE [dbo].[reports_getMonthlyProcessHealthbyAudits]                          
  
@startDate Datetime,                        
@endDate Datetime,                      
@customerid varchar(50)='0'    

AS                                  
BEGIN              
              
select FORMAT(t.DUE_DATE,'MMMM - yyyy') AS [Auidt Period],summ.AUDIT_TITLE,    
c.CUST_NM,portfolio.TITLE as [Portfolio Name],p.PROJ_NM,chk.TITLE + '(' + cast(chk.VERSION as varchar) +' - ' + convert(varchar,chk.EFFECTIVE_FROM,23)+')' as [Checklist Used ],    
sum(dtls.MAX_SCORE) as [Max Score],summ.score as [Actual Score],summ.PERCENTAGE_SCORE as [Process  Compliance ( % )],
summ.UPDATED_SCORE as [CURRENT_SCORE],summ.UPDATED_PERCENTAGE_SCORE as [CURRENT_PROCESS_COMPLIANCE_PERCENTAGE ( % )]
from TASK t                          
                         
inner join CUSTOMER c on t.CUST_ID = c.CUST_ID                            
inner join PROJECT p on t.PROJ_ID = p.PROJ_ID       
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1     
inner join PM_CHECKLIST CHK ON summ.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1     
inner join PM_CHECKLIST_QUESTIONS qus on summ.CHECKLIST_ID=qus.CHECKLIST_ID and qus.ISACTIVE=1    
inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and qus.ID=dtls.PM_CHECKLIST_QUESTION_ID and dtls.ISACTIVE=1    
left join  portfolio_Project portproj on t.CUST_ID = portproj.CUST_ID and t.PROJ_ID=portproj.PROJ_ID and portproj.ISACTIVE=1        
left join  PORTFOLIO portfolio on portproj.PORTFOLIO_ID = portfolio.ID and portfolio.ISACTIVE=1          
where t.DUE_DATE between @startDate and @endDate and (@customerid='0' or  c.CUst_id = @customerid)     
group by FORMAT(t.DUE_DATE,'MMMM - yyyy'),summ.ASSESSMENT_ID,summ.AUDIT_TITLE,c.CUST_NM,p.PROJ_NM,summ.score,summ.PERCENTAGE_SCORE,
summ.UPDATED_SCORE,summ.UPDATED_PERCENTAGE_SCORE,chk.TITLE,t.DUE_DATE,chk.VERSION,chk.EFFECTIVE_FROM,portfolio.TITLE    
order by  year(t.DUE_DATE) desc, month(t.DUE_DATE) desc,summ.ASSESSMENT_ID desc,c.CUST_NM asc,p.PROJ_NM asc   
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getMaturityLevelForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMaturityLevelForProjects]
END
GO

CREATE PROCEDURE [dbo].[reports_getMaturityLevelForProjects]              
  
AS              
BEGIN   

with cte  as              
(              
select c.CUST_ID , c.CUST_NM , p.PROJ_ID, p.PROJ_NM,               
MODEL.ID  [Process Model Id], MODEL.TITLE  [Process Model], SCORE.SCORE, SCORE.PERCENTAGE_SCORE as  [PROCESS_COMPLIANCE_PERCENTAGE], 
SCORE.UPDATED_SCORE as [CURRENT_SCORE], SCORE.UPDATED_PERCENTAGE_SCORE as [CURRENT_PROCESS_COMPLIANCE_PERCENTAGE], score.created_date,               
(select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],               
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,              
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,         
(select top 1 PLANNED_AUDIT_START_DATE from audit_checklist_execution_summary WHERE assessment_id = t.id and ISACTIVE = 1) [PLANNED_AUDIT_START_DATE] ,         
(select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_ID from audit_checklist_execution_summary WHERE assessment_id = t.id and ISACTIVE = 1)) [Auditor],      
t.id, t.DESCRIPTION, t.STATUS, find.FINDING_TYPE, find.FINDING_DESCRIPTION, ACCEPT.status [FINDING_ACCEPTANCE_STATUS]  ,      
(CASE WHEN EXISTS(SELECT TOP 1 ID FROM AUDIT_FINDING_STAGES_MAPPING  WHERE FINDING_ID = FIND.ID AND ISACTIVE = 1 AND STAGE_ID = 4 AND ISCOMPLETE = 1) THEN 'Closed'      
ELSE 'Open' END) [FINDING_STATUS],      
(SELECT TOP 1 ROOT_CAUSE FROM AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = FIND.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],      
(SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = FIND.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN]      
         
from TASK t              
inner join               
(              
select PROJ_ID , MAX(ID) as 'TASK_ID' from TASK              
where TASK_CATEGORY_ID = 11 and  STATUS in ('IN PROGRESS','COMPLETED') and ISACTIVE = 1              
group by PROJ_ID              
) AS TASK2 on t.ID = TASK2.TASK_ID              
inner join CUSTOMER c on t.CUST_ID = c.CUST_ID              
inner join PROJECT p on t.PROJ_ID = p.PROJ_ID              
inner join audit_checklist_execution_summary score on t.ID = score.assessment_id and score.ISACTIVE = 1              
inner join PM_CHECKLIST CHK ON SCORE.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1              
left join PROCESS_MODEL MODEL ON CHK.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1        
left join AUDIT_CHECKLIST_PROJECT_FINDINGS find on t.id = find.AUDIT_ID and find.ISACTIVE = 1       
LEFT join AUDITEE_ACCEPTANCE ACCEPT ON FIND.ID = ACCEPT.finding_id       
group by c.CUST_ID, c.CUST_NM, p.PROJ_ID, p.PROJ_NM, MODEL.ID , MODEL.TITLE, score.SCORE, SCORE.PERCENTAGE_SCORE, 
SCORE.UPDATED_SCORE, SCORE.UPDATED_PERCENTAGE_SCORE, score.CREATED_DATE,        
p.Quality_Spoc, p.PROJ_PM_EMP_ID, p.PROJ_DM_EMP_ID,              
t.id, t.DESCRIPTION, t.STATUS, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.ID , ACCEPT.status             
)              
              
select CUST_ID [Customer Id], CUST_NM [Customer Name], PROJ_ID [Project Id], PROJ_NM [Project Name], PM, CSM, [Process Model],         
CONVERT(VARCHAR(10), CREATED_DATE, 111) [Submitted Date],  CONVERT(VARCHAR(10), [PLANNED_AUDIT_START_DATE], 111) [PLANNED_AUDIT_START_DATE] , 
[Auditor], SCORE [Score],PROCESS_COMPLIANCE_PERCENTAGE [PROCESS_COMPLIANCE_PERCENTAGE], CURRENT_SCORE [CURRENT_SCORE], 
CURRENT_PROCESS_COMPLIANCE_PERCENTAGE [CURRENT_PROCESS_COMPLIANCE_PERCENTAGE],         
case  when [Process Model Id] = 11 then            
(case     when PROCESS_COMPLIANCE_PERCENTAGE >= 0 and PROCESS_COMPLIANCE_PERCENTAGE <= 24  THEN 'Level0 - Impeded'              
            when PROCESS_COMPLIANCE_PERCENTAGE >= 25 and PROCESS_COMPLIANCE_PERCENTAGE <= 49 THEN 'Level1 - In Transition'              
            when PROCESS_COMPLIANCE_PERCENTAGE >= 50 and PROCESS_COMPLIANCE_PERCENTAGE <= 74 THEN 'Level2 - Sustainable'              
        when PROCESS_COMPLIANCE_PERCENTAGE >= 75 and PROCESS_COMPLIANCE_PERCENTAGE <= 94 THEN 'Level3 - Agile'              
            when PROCESS_COMPLIANCE_PERCENTAGE >= 95 and PROCESS_COMPLIANCE_PERCENTAGE <= 100 THEN 'Level4 - Ideal'end)              
when [Process Model Id] = 12 THEN (case   when PROCESS_COMPLIANCE_PERCENTAGE >= 0 and PROCESS_COMPLIANCE_PERCENTAGE <= 10 THEN '0-Survival'              
when PROCESS_COMPLIANCE_PERCENTAGE >= 11 and PROCESS_COMPLIANCE_PERCENTAGE <= 30 THEN '1-Awareness'              
            when PROCESS_COMPLIANCE_PERCENTAGE >= 31 and PROCESS_COMPLIANCE_PERCENTAGE <= 50 THEN '2-Committed'              
            when PROCESS_COMPLIANCE_PERCENTAGE >= 51 and PROCESS_COMPLIANCE_PERCENTAGE <= 70 THEN '3-Proactive'              
            when PROCESS_COMPLIANCE_PERCENTAGE >= 71 and PROCESS_COMPLIANCE_PERCENTAGE <= 90 THEN '4-Service Aligned'              
            else  '5-Business Partnership' end)              
ELSE '' END AS 'Maturity Level' , FINDING_TYPE, FINDING_DESCRIPTION, FINDING_STATUS, FINDING_ACCEPTANCE_STATUS, ROOT_CAUSE, CORRECTIVE_ACTION_PLAN      
               
from cte  order by [Customer name], [Project Name]      
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getListofPlannedAudits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getListofPlannedAudits]
END
GO

CREATE procedure [dbo].[getListofPlannedAudits]           
          
@custid varchar(50),                                
@projid nvarchar(500)     
  
AS                               
      	  
BEGIN                        
  
SELECT OPTIONS into #Paramtemp FROM PARAMETER_TABLE WHERE NAME = 'AUDIT_CATEGORY'      
      
select t.ID, description, priority, t.SCHEDULED_START_DATE, t.DUE_DATE, t.SCHEDULED_DURATION,                    
t.ACTUAL_DURATION, t.ACTUAL_START_DATE, t.ACTUAL_END_DATE, t.STATUS, t.CUST_ID, t.PROJ_ID, asch.AUDITOR_EMP_ID,                     
asref.[KEY], asref.[VALUE] ,act.ACTUAL_AUDIT_START_DATE, act.ACTUAL_AUDIT_END_DATE, 
act.PERCENTAGE_SCORE as PROCESS_COMPLIANCE_AS_ON_AUDIT_DATE, act.UPDATED_PERCENTAGE_SCORE as CURRENT_PROCESS_COMPLIANCE    

from task t                                
LEFT JOIN AUDIT_SCHEDULE asch on   asch.proj_id = t.PROJ_ID and asch.ISACTIVE =1 and (t.PARENT_TASK_ID = asch.TASK_ID OR T.ID = asch.TASK_ID)                         
LEFT JOIN AUDIT_SCHEDULE_REF asref on asref.AUDIT_SCHEDULE_ID = asch.ID and asref.ISACTIVE =1             
LEFT JOIN  AUDIT_CHECKLIST_EXECUTION_SUMMARY act on t.ID=act.ASSESSMENT_ID and act.ISACTIVE=1            
where   t.PROJ_ID = @projid and                    
t.TASK_CATEGORY_ID  IN (select options from #Paramtemp)      
and  T.STATUS not in ('CANCELLED')    and                      
t.ISACTIVE =1                          
                             
order by t.id                           
Drop table #Paramtemp          
      
END     
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTaskDetailsByDateRange' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getTaskDetailsByDateRange]
END
GO

CREATE PROCEDURE [dbo].[getTaskDetailsByDateRange]            

@START_DATE DATETIME,            
@END_DATE DATETIME  ,          
@EMP_ID varchar(20)   ,
@CUSTOMER_ID varchar(MAX) = '-1',      
@PROJECT_ID varchar(MAX) = '-1',      
@TASK_CATEGORY varchar(MAX) = '-1',      
@Range varchar(1) ='Y'    

AS

BEGIN
   
DECLARE @skipInternalAuditId INT = (SELECT ID FROM PROJECT_CONFIGURATION_SETTING WHERE SETTING_NAME = 'SKIP INTERNAL AUDIT' AND ISACTIVE = 1)            

IF @Range<>'A'      
BEGIN       
SELECT distinct  T.ID, DATEPART(M, coalesce(T.SCHEDULED_START_DATE, t.due_date)) MONTH_ID,      
DATEPART(Q, coalesce(T.SCHEDULED_START_DATE, t.due_date)) QUARTER_ID,      
DATEPART(WK, coalesce(T.SCHEDULED_START_DATE, t.due_date)) WEEK_ID,      
DATEPART(D, coalesce(T.SCHEDULED_START_DATE, t.due_date)) DAY_ID,       
DATENAME(dw,coalesce(T.SCHEDULED_START_DATE, t.due_date)) DATE_NAME,      
cast(DATEADD( DAY , 2 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10)) [Week_Start_Date],      
cast(DATEADD( DAY , 8 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10))  [Week_End_Date],      
T.CUST_ID, C.CUST_NM, T.PROJ_ID, P.PROJ_NM, TT.ID TASK_TYPE_ID, TT.TITLE TASK_TYPE,TC.ID TASK_CATEGORY_ID, TC.TITLE TASK_CATEGORY, T.DESCRIPTION, T.STATUS,         
T.SCHEDULED_START_DATE, T.SCHEDULED_DURATION, T.DUE_DATE, TC.COLOR_BG, TC.COLOR_MG, T.OWNER, T.Assigned_to, A.AUDITOR_EMP_ID           
,'' AS FREQUENCY       
FROM [TASK] T   (NOLOCK)       
INNER JOIN TASK_TYPE TT  (NOLOCK)  ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1       
INNER JOIN TASK_CATEGORY TC  (NOLOCK)  ON TC.ID = T.TASK_CATEGORY_ID            
LEFT JOIN AUDIT_SCHEDULE A   (NOLOCK) ON T.ID = A.TASK_ID          
LEFT JOIN AUDIT_SCHEDULE_REF AE   (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'          
LEFT JOIN CUSTOMER C   (NOLOCK) ON C.CUST_ID = T.CUST_ID            
LEFT JOIN PROJECT P  (NOLOCK)  ON P.PROJ_ID = T.PROJ_ID            
LEFT JOIN PROJ_RESOURCE PR on p.proj_id = pr.proj_id and pr.emp_id = @emp_id and pr.end_date > Getdate()     
WHERE 
P.PROJ_ID NOT IN (SELECT PROJ_ID FROM PROJECT_CONFIGURATION_DATA WHERE ISACTIVE = 1 AND IS_APPROVED = 1 AND CONFIGURATION_SETTING_ID = @skipInternalAuditId
				AND END_DATE IS NULL OR END_DATE > GETDATE()) 
AND (T.TASK_CATEGORY_ID IN (SELECT * FROM fn_getParameterTableOptionIds('TASK_VIEW')) 
	or (t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID))
AND Due_Date is not null and ((coalesce(T.SCHEDULED_START_DATE, t.due_date) >= @START_DATE and  coalesce(T.SCHEDULED_START_DATE, t.due_date) <= @END_DATE  ))          
AND (
    (@CUSTOMER_ID = '-1' AND @PROJECT_ID = '-1')
	OR
    (@CUSTOMER_ID <> '-1' AND @PROJECT_ID = '-1' AND C.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER_ID, ',')))
    OR
    (@CUSTOMER_ID <> '-1' AND @PROJECT_ID <> '-1' AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJECT_ID, ','))))
AND ((@TASK_CATEGORY = '-1' OR T.TASK_CATEGORY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@TASK_CATEGORY, ',')))
	or (t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID))

END

ELSE       
 
BEGIN       
       
SELECT distinct  T.ID, DATEPART(M, coalesce(T.SCHEDULED_START_DATE, t.due_date)) MONTH_ID,      
DATEPART(Q, coalesce(T.SCHEDULED_START_DATE, t.due_date)) QUARTER_ID,      
DATEPART(WK, coalesce(T.SCHEDULED_START_DATE, t.due_date)) WEEK_ID,      
DATEPART(D, coalesce(T.SCHEDULED_START_DATE, t.due_date)) DAY_ID,       
DATENAME(dw,coalesce(T.SCHEDULED_START_DATE, t.due_date)) DATE_NAME,      
cast(DATEADD( DAY , 2 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10)) [Week_Start_Date],      
cast(DATEADD( DAY , 8 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10))  [Week_End_Date],      
T.CUST_ID, C.CUST_NM, T.PROJ_ID, P.PROJ_NM, TT.ID TASK_TYPE_ID, TT.TITLE TASK_TYPE,TC.ID TASK_CATEGORY_ID, TC.TITLE TASK_CATEGORY, T.DESCRIPTION, T.STATUS,         
T.SCHEDULED_START_DATE, T.SCHEDULED_DURATION, T.DUE_DATE, TC.COLOR_BG, TC.COLOR_MG, T.OWNER, T.Assigned_to, A.AUDITOR_EMP_ID     ,      
ISNULL(TR.FREQUENCY ,'On-Going') AS FREQUENCY      
FROM [TASK] T   (NOLOCK)       
INNER JOIN TASK_TYPE TT  (NOLOCK)  ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1        
INNER JOIN TASK_CATEGORY TC  (NOLOCK)  ON TC.ID = T.TASK_CATEGORY_ID
LEFT JOIN AUDIT_SCHEDULE A   (NOLOCK) ON T.ID = A.TASK_ID         
LEFT JOIN AUDIT_SCHEDULE_REF AE   (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'          
LEFT JOIN CUSTOMER C   (NOLOCK) ON C.CUST_ID = T.CUST_ID            
LEFT JOIN PROJECT P  (NOLOCK)  ON P.PROJ_ID = T.PROJ_ID
LEFT JOIN PROJ_RESOURCE PR on p.proj_id = pr.proj_id and pr.emp_id = @emp_id and pr.end_date > Getdate()            
LEFT JOIN TASK_RECURRENCE TR (NOLOCK) ON T.ID =TR.TASK_ID      
 
WHERE 
P.PROJ_ID NOT IN (SELECT PROJ_ID FROM PROJECT_CONFIGURATION_DATA WHERE ISACTIVE = 1 AND IS_APPROVED = 1 AND CONFIGURATION_SETTING_ID = @skipInternalAuditId
				AND END_DATE IS NULL OR END_DATE > GETDATE())
AND (T.TASK_CATEGORY_ID IN (SELECT * FROM fn_getParameterTableOptionIds('TASK_VIEW')) 
	or (t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID))
AND Due_Date is not null and ((  coalesce(T.SCHEDULED_START_DATE, t.due_date) >= @START_DATE and       
coalesce(T.SCHEDULED_START_DATE, t.due_date) <= @END_DATE  )) AND t.TASK_TYPE_ID=1      
AND (
    (@CUSTOMER_ID = '-1' AND @PROJECT_ID = '-1')
	OR
    (@CUSTOMER_ID <> '-1' AND @PROJECT_ID = '-1' AND C.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER_ID, ',')))
    OR
    (@CUSTOMER_ID <> '-1' AND @PROJECT_ID <> '-1' AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJECT_ID, ','))))
AND ((@TASK_CATEGORY = '-1' OR T.TASK_CATEGORY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@TASK_CATEGORY, ',')))
	or (t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID))
END 
 
END  
GO  

IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_INSCOPE_DETAILS' AND COLUMN_NAME='TECHNOLOGY')
BEGIN
ALTER TABLE PROJECT_INSCOPE_DETAILS ADD TECHNOLOGY varchar(max) NULL
END
GO

IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='RAG')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD RAG varchar(10) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='SCOPE')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD SCOPE varchar(MAX) NULL
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForProjects]
END
GO 
CREATE PROCEDURE [dbo].[getCSSTableForProjects]     

@startDate date,      
@endDate date,      
@projIds varchar(max) = NULL      
AS 
BEGIN      
      
  SELECT      
    ID,      
    SURVEY_ID,      
    PROJECT_ID,      
    PROJECT_NAME,      
    CUSTOMER_ID,      
    CUSTOMER_Name,      
    CSM_EMP_ID,  [STATUS],    
    DELIVERY_HEAD_EMP_ID,      
    RESPONDENT_NAME,      
    CSAT_RECIEVED_DATE,      
    YEAR_QUARTER,      
    REGION,      
    RESPONSIVENESS,      
    NPS_SCORE,      
    COMMENTS,      
    Q1,      
    Q2,      
    Q3,      
    Q4,      
    Q5,      
    Q6,      
    Q7,      
    Q8,      
    Q9,      
    Q10,      
    Q11,      
    Q12,      
    Q13,      
    Q14,      
    Q15,      
    CASE      
      WHEN Q1 IS NULL THEN (CASE      
          WHEN Q8 IS NULL THEN (Q5 + Q6 + Q7) / 3      
          ELSE ((Q8 + Q9 + Q10 + Q11 + Q12) / 5)      
        END)      
      ELSE LEAST(Q1, Q2 , Q3)   
    END AS [MIN_SCORE]      
  FROM (SELECT      
    0 ID,      
    vw.SURVEY_ID,  CB.STATUS,    
    CB.PROJ_ID [PROJECT_ID],      
    p.PROJ_NM [PROJECT_NAME],      
    CB.CUST_ID [CUSTOMER_ID],      
    C.CUST_NM [CUSTOMER_Name],      
    P.PROJ_DM_EMP_ID [CSM_EMP_ID],      
    P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID],      
    CB.DISPLAY_NAME RESPONDENT_NAME,      
    SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],      
    'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' - ' + CAST(B.YEAR AS VARCHAR) YEAR_QUARTER,      
    CASE      
      WHEN P.PROJ_ID LIKE '201%' THEN 'India'      
      WHEN P.PROJ_ID LIKE '202%' THEN 'US'      
      WHEN P.PROJ_ID LIKE '206%' THEN 'Oman'      
      WHEN P.PROJ_ID LIKE '207%' THEN 'Dubai'      
      WHEN P.PROJ_ID LIKE '209%' THEN 'Saudi Arabia'      
      ELSE ''      
    END AS REGION,      
    NULL [RESPONSIVENESS],      
    Q4 AS [NPS_SCORE],      
    Q1,      
    Q2,      
    Q3,      
    Q4,      
    Q5,      
    Q6,      
    Q7,      
    Q8,      
    Q9,      
    Q10,      
    Q11,      
    Q12,      
    Q13,      
    Q14,      
    Q15,      
    CASE      
      WHEN Q1 IS NULL THEN (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.BATCH_CUSTOMER_ID      
        AND QUESTION_ID = 15)      
      ELSE (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.BATCH_CUSTOMER_ID      
        AND QUESTION_ID = 5)      
    END AS [COMMENTS]      
  FROM [CSS_BATCH_CUSTOMERS] CB (NOLOCK)      
  INNER JOIN PROJECT P (NOLOCK)      
    ON p.proj_id = CB.proj_id      
  INNER JOIN CUSTOMER C (NOLOCK)      
    ON c.cust_id = CB.cust_id      
  INNER JOIN CSS_BATCHES B (NOLOCK)      
    ON B.ID = CB.BATCH_ID      
  LEFT JOIN vwSurveyQRatings vw      
    ON vw.ID = CB.SURVEY_ID      
  WHERE CB.STATUS in('COMPLETED','MAIL SENT','MAIL RE-SENT') AND    
  (B.START_DATE BETWEEN @startDate AND @endDate      
  OR B.END_DATE BETWEEN @startDate AND @endDate)      
  AND (ISNULL(@projIds, '') = ''      
  OR CB.proj_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds, ',')))      
      
  UNION ALL      
      
  SELECT      
    0 ID,      
    vw.SURVEY_ID,  CB.STATUS,    
    p.proj_id [PROJECT_ID],      
    'Premier Healthcare Solutions' [PROJECT_NAME],      
    CB.CUST_ID [CUSTOMER_ID],      
    C.CUST_NM [CUSTOMER_Name],      
    '' [CSM_EMP_ID],      
    '' [DELIVERY_HEAD_EMP_ID],      
    CB.DISPLAY_NAME RESPONDENT_NAME,      
    SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],      
    LEFT(DATENAME(MONTH, DATEFROMPARTS(B.YEAR, B.MONTH, 1)), 3) + ' - ' + CAST(B.YEAR AS VARCHAR) AS YEAR_QUARTER,      
    '' AS REGION,      
    Q1,      
    Q2,      
    Q3,      
    Q4,      
    Q5,      
    Q6,      
    Q7,      
    Q8,      
    Q9,      
    Q10,      
    Q11,      
    Q12,      
    Q13,      
    Q14,      
    Q15,      
    NULL [RESPONSIVENESS],      
    (SELECT TOP 1      
      AVG(RATING)      
    FROM CSS_QUESTION_REPLIES R (NOLOCK)      
    WHERE CB.ID = R.Batch_Customer_Monthly_id      
    AND QUESTION_MODEL_ID = 4)      
    AS [NPS_SCORE],      
    CASE      
      WHEN Q1 IS NULL THEN (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.Batch_Customer_Monthly_id      
        AND QUESTION_ID = 15)          ELSE (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.Batch_Customer_Monthly_id      
        AND QUESTION_ID = 5)      
    END AS [COMMENTS]      
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)      
  INNER JOIN PROJECT P (NOLOCK)      
    ON p.proj_id IN ((SELECT TOP 1      
      PROJ_ID      
    FROM PROJECT      
    WHERE CUST_ID = '212100001'      
    AND (ISNULL(@projIds, '') = ''      
    OR proj_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds, ',')) )))      
  INNER JOIN CUSTOMER C (NOLOCK)      
    ON c.cust_id = CB.cust_id      
  INNER JOIN CSS_BATCH_monthly B (NOLOCK)      
    ON B.ID = CB.BATCH_MONTHLY_ID      
  LEFT JOIN vwSurveyQRatings vw      
    ON vw.ID = CB.SURVEY_ID      
  WHERE CB.STATUS in('COMPLETED','MAIL SENT','MAIL RE-SENT') AND   
  (B.START_DATE BETWEEN @startDate AND @endDate      
  OR B.END_DATE BETWEEN @startDate AND @endDate)) TBL      
      
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getKPIDataAcrossProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getKPIDataAcrossProjects]
END
GO
  
CREATE PROCEDURE [dbo].[getKPIDataAcrossProjects]              
      
@Startdate Date,              
@Enddate Date,              
@GlobalKpis varchar(max),            
@Customerids varchar(max),            
@Projectids  varchar(max),
@ServiceTowerIds varchar(max)  
AS            
BEGIN            
  SET @Enddate=DATEADD(d,1,@Enddate);
  Select DISTINCT per.ID as PERSPECTIVE_ID, per.SHORT_DESC  as KPI_CATEGORY, kpicat.ID AS GLOBAL_KPI_ID, kpicat.SHORT_DESC AS GLOBAL_KPI_NAME, k.customer_id AS CUST_ID, c.CUST_NM, k.project_id AS PROJ_ID,    
   p.PROJ_NM,e.FRST_NM as CSM_NAME, p.PROJ_DM_EMP_ID     
as CSM_EMP_ID,              
   k.goal_id, GOALS.DESCRIPTION AS GOAL_DESC, k.ID AS KPI_ID, k.KPI_NAME, details.PERIOD, details.PERIOD_TYPE, k.ABBREVIATION, k.SERVICE_AREA,     
       
     (SELECT top 1 SLA_TARGET_VERYHIGH_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_VERYHIGH_VALUE    
       ,(SELECT top 1 SLA_TARGET_VERYHIGH_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND   KPI_ID = details.KPI_ID)     as SLA_TARGET_VERYHIGH_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_VERYHIGH_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_VERYHIGH_DESCRIPTION            
  
    ,(SELECT top 1 SLA_TARGET_HIGH_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_HIGH_VALUE    
       ,(SELECT top 1 SLA_TARGET_HIGH_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_HIGH_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_HIGH_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_HIGH_DESCRIPTION            
  
    ,(SELECT top 1 SLA_TARGET_MEDIUM_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_MEDIUM_VALUE    
       ,(SELECT top 1 SLA_TARGET_MEDIUM_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND    KPI_ID = details.KPI_ID)     as SLA_TARGET_MEDIUM_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_MEDIUM_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_MEDIUM_DESCRIPTION            
  
    ,(SELECT top 1 SLA_TARGET_LOW_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_LOW_VALUE    
       ,(SELECT top 1 SLA_TARGET_LOW_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_LOW_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_LOW_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_LOW_DESCRIPTION            
    
       ,CASE WHEN details.PERIOD_TYPE = 'Week1' then     
                     CONVERT(CHAR(3),CONVERT(datetime,     
                                     SWITCHOFFSET(CONVERT(datetimeoffset,     
                                                                           details.PERIOD),     
                                                              DATENAME(TzOffset, SYSDATETIMEOFFSET()))) , 0)     
                                                    
       ELSE CONVERT(CHAR(3), details.[PERIOD], 0)  END AS MONTH_NM       
                    
   ,YEAR(details.[PERIOD]) AS YEAR  ,                       
    details.KPI_ACTUAL, k.SLA_TARGET_UNIT_OF_MEASUREMENT, k.PRIORITY, k.SUPPORT_WINDOW, k.IS_SOW_COMMITMENT, details.ISFLAG    
    from KPI_DETAILS details              
              
 inner join KPI K on k.ID = details.KPI_ID and details.ISACTIVE = 1  and (@GlobalKpis = '' or k.GLOBAL_KPI_CATEGORY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@GlobalKpis,',')) )          
 inner join KPI_TARGETS target on k.ID = target.KPI_ID and target.ISACTIVE = 1              
 inner join KPI_GOALS goals on k.GOAL_ID = goals.ID and goals.ISACTIVE = 1              
 inner join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING kpimap on k.GLOBAL_KPI_CATEGORY_ID = kpimap.GLOBAL_KPI_CATEGORY_ID and k.ISACTIVE = 1 and kpimap.ISACTIVE = 1              
 inner join GLOBAL_PERSPECTIVE per on per.ID = kpimap.GLOBAL_PERSPECTIVE_ID and per.ISACTIVE = 1              
 inner join GLOBAL_KPI_CATEGORY kpicat on kpimap.GLOBAL_KPI_CATEGORY_ID = kpicat.ID and kpicat.ISACTIVE = 1
 inner join CUSTOMER c on c.CUST_ID = k.CUSTOMER_ID  and  (@Customerids = '' or k.CUSTOMER_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Customerids,',')))            
 inner join PROJECT p on p.PROJ_ID = k.PROJECT_ID   and (@Projectids = '' or p.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Projectids,','))  )  
 left join process_service_area_project_mapping pspd on p.PROJ_ID = pspd.PROJ_ID and (@ServiceTowerIds = '' or Convert(int,PSPD.SERVICE_AREA_ID) in (SELECT * FROM [DBO].[FN_SPLITSTRING](@ServiceTowerIds,',')))   
 inner join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID              
           
 where details.PERIOD between @Startdate and @Enddate    
    
 order by k.CUSTOMER_ID, k.PROJECT_ID, k.ID, details.PERIOD        
           
 end    
GO


IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_INSCOPE_DETAILS' AND COLUMN_NAME='TECHNOLOGY')
BEGIN
ALTER TABLE PROJECT_INSCOPE_DETAILS ADD TECHNOLOGY varchar(max) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='RAG')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD RAG varchar(10) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='SCOPE')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD SCOPE varchar(MAX) NULL
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOpenFindingsForEachAudit' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOpenFindingsForEachAudit]
END
GO 

CREATE procedure [dbo].[getOpenFindingsForEachAudit] 
        
@auditIds varchar(max)

AS

BEGIN

SELECT 
    findings.AUDIT_ID, 
    COUNT(*) as TOTAL_FINDINGS,
    SUM(
        CASE 
            WHEN AFM.ISCOMPLETE = 1 THEN 1
            WHEN aa.status LIKE '%reject%' THEN 1 
            WHEN aa.status LIKE '%accept%' AND findings.FINDING_TYPE = 'Strength' THEN 1 
            ELSE 0 
        END
    ) AS CLOSED_FINDINGS,
    COUNT(*) - SUM(
        CASE 
            WHEN AFM.ISCOMPLETE = 1 THEN 1
            WHEN aa.status LIKE '%reject%' THEN 1 
            WHEN aa.status LIKE '%accept%' AND findings.FINDING_TYPE = 'Strength' THEN 1 
            ELSE 0 
        END
    ) AS OPEN_FINDINGS
FROM 
    AUDIT_CHECKLIST_PROJECT_FINDINGS findings  
LEFT JOIN 
    AUDIT_FINDING_STAGES_MAPPING AFM ON AFM.FINDING_ID = findings.ID  
                                       AND AFM.STAGE_ID = 4  
                                       AND AFM.ISACTIVE = 1 
LEFT JOIN 
    AUDITEE_ACCEPTANCE AA ON FINDINGS.ID = AA.FINDING_ID 
                          AND AA.ISACTIVE = 1
WHERE 
    findings.isactive = 1 
    AND findings.AUDIT_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@auditIds, ','))
GROUP BY 
    findings.AUDIT_ID
ORDER BY 
    findings.AUDIT_ID;


END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='Get_Process_Mapping_Report_All' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[Get_Process_Mapping_Report_All]
END
GO 		

CREATE PROC [dbo].[Get_Process_Mapping_Report_All]
		AS
BEGIN
	SELECT 

    pm.TITLE as [Process Model Title],
    psan.TITLE as [Service Tower Title],
    PA.TITLE as [Process Area Title] ,
    p.TITLE as [Process Title],	
	pr.proj_nm as [Project],
	c.cust_nm as [Customer]

FROM 
    process p 
inner JOIN 
    PROCESS_AREA pa ON pa.ID = p.PROCESS_AREA_ID AND pa.ISACTIVE = 1 AND pa.SHOW_IN_MASTER = 1
left JOIN 
    PROCESS_MODEL_PROCESS_MAPPING map ON map.PROCESS_ID = p.ID AND map.ISACTIVE = 1 
inner JOIN 
    PROCESS_MODEL pm ON map.PROCESS_MODEL_ID = pm.ID AND map.ISACTIVE = 1 
left JOIN 
    PROCESS_SERVICE_AREA_MAPPING psam ON  map.PROCESS_ID = psam.PROCESS_ID AND psam.ISACTIVE = 1 
inner JOIN 
    PROCESS_SERVICE_AREA_NEW psan ON psan.ID = psam.SERVICE_AREA_ID AND psan.ISACTIVE = 1 AND psan.SHOW_IN_MASTER = 1
left join 
   PROCESS_SERVICE_AREA_PROJECT_MAPPING PSAPM on PSAM.SERVICE_AREA_ID = PSAPM.SERVICE_AREA_ID AND PSAPM.ISACTIVE =1
INNER JOIN
   PROJECT PR ON PSAPM.PROJ_ID = PR.PROJ_ID 
inner join 
	customer c on psapm.cust_id = c.cust_id 
	where p.ISACTIVE =1 and p.SHOW_IN_MASTER =1
	order by p.TITLE;
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='Get_Process_Mapping_Report' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[Get_Process_Mapping_Report]
END
GO 		

CREATE PROC [dbo].[Get_Process_Mapping_Report]
		AS
BEGIN
	SELECT 
    pm.TITLE as [Process Model Title],
    psan.TITLE as [Service Tower Title],
    PA.TITLE as [Process Area Title] ,
    p.TITLE as [Process Title]	
FROM 
    process p 
inner JOIN 
    PROCESS_AREA pa ON pa.ID = p.PROCESS_AREA_ID AND pa.ISACTIVE = 1 AND pa.SHOW_IN_MASTER = 1
left JOIN 
    PROCESS_MODEL_PROCESS_MAPPING map ON map.PROCESS_ID = p.ID AND map.ISACTIVE = 1 
inner JOIN 
    PROCESS_MODEL pm ON map.PROCESS_MODEL_ID = pm.ID AND map.ISACTIVE = 1 
left JOIN 
    PROCESS_SERVICE_AREA_MAPPING psam ON  map.PROCESS_ID = psam.PROCESS_ID AND psam.ISACTIVE = 1 
inner JOIN 
    PROCESS_SERVICE_AREA_NEW psan ON psan.ID = psam.SERVICE_AREA_ID AND psan.ISACTIVE = 1 AND psan.SHOW_IN_MASTER = 1

	where p.ISACTIVE =1 and p.SHOW_IN_MASTER =1
	order by p.TITLE;
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_ListofAllAssessmentStatus' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_ListofAllAssessmentStatus]
END
GO 


IF NOT EXISTS (SELECT 1 from dbo.REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='List of All Assessment Status Report')
BEGIN

INSERT INTO dbo.REPORTS_SP_DETAILS(SP_NAME,SP_DISPLAY_NAME,DB_NAME)  VALUES
('dbo.reports_ListofAllAssessmentStatus','List of All Assessment Status Report'	,'BAS') 
END

GO

IF NOT EXISTS (SELECT 1 FROM dbo.REPORTS_PARAMS WHERE  PARAM_NAME='CustomerID' AND REPORT_SP_ID=@spID)
BEGIN

INSERT INTO dbo.REPORTS_PARAMS(REPORT_SP_ID,PARAM_NAME,PARAM_TYPE,PARAM_VALUE)  VALUES
(@spID,'CustomerID','CUSTOMERID','0') 
END
 GO

CREATE PROCEDURE [dbo].[reports_ListofAllAssessmentStatus]                            


@CustomerID VARCHAR(50)='0' 
as

begin
select PM.Title as [Checklist], PM.version as [Version], PM.effective_from as [Effective date], PQ.Title as[Checkpoint Question],
 PA.TITLE as [Process_Area],
 P.TITLE as Process,
  PS.TITLE as [Service Tower],
  pr.PROJ_NM as Project,
  CR.CUST_NM as Customer
from  
PM_CHECKLIST_QUESTIONS PQ 
inner join PM_CHECKLIST PM on PM.ID=PQ.CHECKLIST_ID
left join PM_PROCESS_QUESTIONS_MAPPING PQM on PQM.question_id=PQ.ID and PQM.checklist_id=PQ.CHECKLIST_ID  
inner join PROCESS_SERVICE_AREA_NEW PS on PS.ID=PQM.SERVICE_AREA_ID and ps.ISACTIVE = 1 and ps.SHOW_IN_MASTER =1
inner join PROCESS_AREA PA on PA.ID = PQM.PROCESS_AREA_ID and pa.ISACTIVE = 1and pa.SHOW_IN_MASTER =1
inner join PROCESS P on P.ID = PQM.process_id and p.ISACTIVE = 1and p.SHOW_IN_MASTER =1
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY ACES on PQ.CHECKLIST_ID = ACES.CHECKLIST_ID and aces.ISACTIVE=1 
inner join project pr on  aces.PROJECT_ID  = pr.PROJ_ID 
inner join customer cr on aces.CUSTOMER_ID = cr.CUST_ID 

where PQ.ISACTIVE=1 and PM.ISACTIVE=1 and PQM.isactive=1 AND  (@CustomerID='0' or  cr.cust_id = @CustomerID)  order by [Service Tower],[Process_Area],Process
end
go



--rollback
--commit
