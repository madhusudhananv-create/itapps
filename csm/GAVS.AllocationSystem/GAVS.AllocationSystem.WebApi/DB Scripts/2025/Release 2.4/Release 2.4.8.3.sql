IF EXISTS(Select 1 from sys.objects where name ='reports_getListofEventsandTasks' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getListofEventsandTasks] 
END
GO

CREATE PROCEDURE  [dbo].[reports_getListofEventsandTasks]                              

@startDate Datetime,                            
@endDate Datetime  ,    
@Customer varchar(max) ='0'                      
                      
AS                                      

BEGIN          
           
select c.CUST_NM ,P.PROJ_NM,TP.TITLE AS Type,TC.TITLE as Category,      
T.DESCRIPTION As [Audit / Assessment Title],     
[Appraiser Name  / Auditor Name]=(Select TOP 1 E.frst_nm from emp_info E (NOLOCK) WHERE e.EMP_ID=sc.AUDITOR_EMP_ID ),      
STUFF((select ',' + E.FRST_NM from emp_info E join      
AUDIT_SCHEDULE_REF auditee on E.EMP_ID = auditee.VALUE AND auditee.[KEY]='AUDITEE_EMP_ID'       
and auditee.ISACTIVE=1 and auditee.AUDIT_SCHEDULE_ID = sc.ID      
for xml path ('')),1,1,'')as [Appraisee Name(s) / Auditee Name (s)],      
T.STATUS,    
Format(T.SCHEDULED_START_DATE,'yyyy-MM-dd')SCHEDULED_START_DATE ,      
Format(T.DUE_DATE,'yyyy-MM-dd')DUE_DATE,      
Format(S.PLANNED_AUDIT_START_DATE,'yyyy-MM-dd')PLANNED_AUDIT_START_DATE,      
Format(S.PLANNED_AUDIT_END_DATE,'yyyy-MM-dd')PLANNED_AUDIT_END_DATE,
Format(S.ACTUAL_AUDIT_START_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_START_DATE,      
Format(S.ACTUAL_AUDIT_END_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_END_DATE,S.AUDIT_PLANNED_HOURS     
     
from TASK T      
join CUSTOMER c on t.CUST_ID = c.CUST_ID                                
join PROJECT p on t.PROJ_ID = p.PROJ_ID        
join TASK_TYPE TP on t.TASK_TYPE_ID = Tp.ID and T.ISACTIVE=1 and tp.ISACTIVE=1      
join TASK_CATEGORY TC on t.TASK_CATEGORY_ID = TC.id and TC.ISACTIVE=1      
left join AUDIT_CHECKLIST_EXECUTION_SUMMARY S ON T.ID = S.ASSESSMENT_ID and s.ISACTIVE=1  
LEFT JOIN AUDIT_SCHEDULE sc ON sc.TASK_ID=T.ID  
where t.DUE_DATE between @startDate and @endDate and (@customer = '0' or t.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))) 
and isnull(T.IS_DRAFT, 0) = 0     
order by 1,2,t.Due_date desc  
        
END

GO


IF EXISTS(Select 1 from sys.objects where name ='getHalfyearlyCSATCustomerList' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getHalfyearlyCSATCustomerList] 
END
GO

CREATE procedure [dbo].[getHalfyearlyCSATCustomerList]  
(  
@customerid varchar(max) = null  
)  
as  
select cu.cust_nm, pp.product_title,  pmt.MANAGEMENT_TYPE, pr.emp_id as Contact_Email  
, c.contact_name, c.contact_role  ,   
(replace(replace(  
stuff((  
 select ', ', proj_nm as a from product_responsible pr  
 inner join project p on p.proj_id = project_id   
 where project_id is not null and pr.product_id = pp.id  FOR XML PATH ('')) , 1, 1, '' ),'</a>',''),'<a>','' ) ) as projects   
,  
CONFIGURED_IN_QUARTERLY = (select  case when count(*) >0 then 'yes' else 'no' end from CSS_BATCH_CUSTOMERS where   batch_id = (select max(id) from css_batches)  and EMAIL_ID = pr.emp_id   ),  
pp.cust_id  
from portfolio_products pp  
inner join product_responsible pr on pr.product_id = pp.id and pr.management_type = 8 and pr.isactive =1  
inner join product_responsible_management_type pmt on pr.management_type = pmt.id  
inner join contacts c on c.CONTACT_EMAILID = pr.emp_id and c.isactive =1  
inner join customer cu on cu.cust_id = pp.cust_id  
where pp.isactive =1 and (isnull( @CustomerID ,'0')='0'  or  pp.CUST_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,',')))  

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_getListofOpenCustomerIssues' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getListofOpenCustomerIssues] 
END
GO

 CREATE procedure [dbo].[reports_getListofOpenCustomerIssues]                                  
  @startDate Datetime,                                
  @endDate Datetime  ,        
  @CustomerID varchar(max)   = null                        
         
  AS                                          
  BEGIN              
   select   
   CUSTOMER, PROJECT ,[BUSINESS UNIT], SUBVERTICAL, SEVERITY, CURRENT_STATUS , [REPORTED BY], LEVEL, REPORTED_DATE, CATEGORY , TITLE,  
   [ISSUE DESCRIPTION],  ISSUE_SOURCE, ISSUE_SOURCE_OTHER , FINANCIAL_IMPACT ,FINANCIAL_IMPACT_DESCRIPTION,   
   IMPACT_SUMMARY , BUSINESS_IMPACT, BUSINESS_IMPACT_DESC,  SERVICE_IMPACT ,  
   ROOTCAUSE ,ACK_DATE ,ACTION_PLAN ,SPOC ,TARGET_DATE , ISSUE_RESOLVED_DATE,  
    LOCATION, LOCATION_OTHER, COMMENTS,    CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY, CUST_ID , PROJECT_ID   
   FROM VW_OPEN_ISSUES_ACTIVE i                         
   where I.reported_date between @startDate and @endDate and (isnull( @CustomerID ,'0')='0'  or  CUST_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,',')))  --and CURRENT_status not in ('closed', 'Hold')  
   and reported_by_option !='reportedbyGAVS'  
    order by CUSTOMER, PROJECT, case when severity = 'high' then 1  
              when severity = 'Medimu' then 2  
              when severity = 'Low' then 3  
              else 4  
         end asc, reported_date desc, ISSUE_RESOLVED_DATE     
  END  

  GO

  IF EXISTS(Select 1 from sys.objects where name ='reports_getListofOpenGAVSIssues' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getListofOpenGAVSIssues] 
END
GO

CREATE procedure [dbo].[reports_getListofOpenGAVSIssues]                                  
  @startDate Datetime,                                
  @endDate Datetime  ,        
  @CustomerID varchar(max)   = null                        
         
  AS                                          
  BEGIN              
            
  select   CUSTOMER, PROJECT ,[BUSINESS UNIT], SUBVERTICAL, SEVERITY,CURRENT_STATUS ,  [REPORTED BY], LEVEL, REPORTED_DATE, CATEGORY , TITLE,  
   [ISSUE DESCRIPTION],  ISSUE_SOURCE, ISSUE_SOURCE_OTHER , FINANCIAL_IMPACT ,FINANCIAL_IMPACT_DESCRIPTION,   
   IMPACT_SUMMARY , BUSINESS_IMPACT, BUSINESS_IMPACT_DESC, SERVICE_IMPACT ,  
   ROOTCAUSE ,ACK_DATE ,ACTION_PLAN ,SPOC ,TARGET_DATE , ISSUE_RESOLVED_DATE,  
    LOCATION, LOCATION_OTHER, COMMENTS,    CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY, CUST_ID , PROJECT_ID    
   FROM VW_OPEN_ISSUES_ACTIVE i                         
       
 where I.reported_date between @startDate and @endDate and (isnull( @CustomerID ,'0')='0'  or  CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,',')))  --and CURRENT_status not in ('closed', 'Hold')  
 and reported_by_option ='reportedbyGAVS'  
  order by CUSTOMER, PROJECT,  case when severity = 'high' then 1  
              when severity = 'Medimu' then 2  
              when severity = 'Low' then 3  
              else 4  
         end asc , reported_date desc, ISSUE_RESOLVED_DATE       
 END     

 GO

   IF EXISTS(Select 1 from sys.objects where name ='reports_getMaturityLevelAssessmentFindings' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMaturityLevelAssessmentFindings] 
END
GO


 CREATE PROCEDURE  [dbo].[reports_getMaturityLevelAssessmentFindings]      
  @startDate Datetime,    
  @endDate Datetime,  
  @customerid varchar(max)='0'         
  AS            
  BEGIN            
 with cte  as            
 (            
  select c.CUST_ID , c.CUST_NM , p.PROJ_ID, p.PROJ_NM,             
  MODEL.ID  [Process Model Id], MODEL.TITLE  [Process Model], find.SCORE, find.PERCENTAGE_SCORE, find.created_date,             
  (select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],             
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,            
  (select top 1 frst_nm from emp_info where emp_id = p.DP_ID) CSM,   
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP NAME],  
    (select top 1 EMAIL_ID from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP MAIL],       
  (select top 1 PLANNED_AUDIT_START_DATE from AUDIT_CHECKLIST_PROJECT_EXECUTION WHERE AUDIT_ID = t.id and ISACTIVE = 1) [PLANNED_AUDIT_START_DATE] ,       
  (select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_NAME from AUDIT_CHECKLIST_PROJECT_EXECUTION WHERE AUDIT_ID = t.id and ISACTIVE = 1)) [Auditor],    
  t.id, t.DESCRIPTION, t.STATUS, find.AUDIT_TITLE,find.Id as findingid,   ACCEPT.status [FINDING_ACCEPTANCE_STATUS]  ,    
  (CASE WHEN EXISTS(SELECT TOP 1 ID FROM AUDIT_FINDING_STAGES_MAPPING  WHERE FINDING_ID = FIND.ID AND ISACTIVE = 1 AND STAGE_ID = 4 AND ISCOMPLETE = 1) THEN 'Closed'    
  ELSE 'Open' END) [FINDING_STATUS],    
  (SELECT TOP 1 ROOT_CAUSE FROM AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = FIND.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],    
  (SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = FIND.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN]    
       
   from TASK t            
           
 inner join CUSTOMER c on t.CUST_ID = c.CUST_ID            
 inner join PROJECT p on t.PROJ_ID = p.PROJ_ID            
    
 inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY  find on t.id = find.ASSESSMENT_ID and find.ISACTIVE = 1   
  inner join PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1       
  inner join PROCESS_MODEL MODEL ON CHK.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1     
 LEFT join AUDITEE_ACCEPTANCE ACCEPT ON FIND.ID = ACCEPT.finding_id     
   where  t.DUE_DATE between @startDate and @endDate and (@customerid='0' or  c.CUst_id  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))  and  
   TASK_CATEGORY_ID = 11 and  t.STATUS in ('IN PROGRESS','COMPLETED') and t.ISACTIVE = 1      
  
 )            
            
 select CUST_ID [Customer Id], CUST_NM [Customer Name], PROJ_ID [Project Id], PROJ_NM [Project Name], PM, CSM, [DP NAME],[DP MAIL], [Process Model],       
  Convert(varchar,CREATED_DATE ,107) [Submitted Date],   Convert(varchar,PLANNED_AUDIT_START_DATE ,107) [PLANNED_AUDIT_START_DATE],  [Auditor],      
 SCORE [Score],PERCENTAGE_SCORE [Percentage Score],       
    case  when [Process Model Id] = 11 then           
 (case     when PERCENTAGE_SCORE >= 0 and PERCENTAGE_SCORE <= 24  THEN 'Level0 - Impeded'            
              when PERCENTAGE_SCORE >= 25 and PERCENTAGE_SCORE <= 49 THEN 'Level1 - In Transition'            
              when PERCENTAGE_SCORE >= 50 and PERCENTAGE_SCORE <= 74 THEN 'Level2 - Sustainable'            
              when PERCENTAGE_SCORE >= 75 and PERCENTAGE_SCORE <= 94 THEN 'Level3 - Agile'            
              when PERCENTAGE_SCORE >= 95 and PERCENTAGE_SCORE <= 100 THEN 'Level4 - Ideal'end)            
    when [Process Model Id] = 12 THEN (case   when PERCENTAGE_SCORE >= 0 and PERCENTAGE_SCORE <= 10 THEN '0-Survival'            
              when PERCENTAGE_SCORE >= 11 and PERCENTAGE_SCORE <= 30 THEN '1-Awareness'            
    when PERCENTAGE_SCORE >= 31 and PERCENTAGE_SCORE <= 50 THEN '2-Committed'        
              when PERCENTAGE_SCORE >= 51 and PERCENTAGE_SCORE <= 70 THEN '3-Proactive'            
              when PERCENTAGE_SCORE >= 71 and PERCENTAGE_SCORE <= 90 THEN '4-Service Aligned'          
              else  '5-Business Partnership' end)            
    ELSE '' END AS 'Maturity Level' ,  FINDING_STATUS, FINDING_ACCEPTANCE_STATUS, ROOT_CAUSE, CORRECTIVE_ACTION_PLAN    
             
 from cte   order  by 2, 4,  [Submitted Date] desc,    [PLANNED_AUDIT_START_DATE]     
  END


  GO

  DECLARE 
    @SpName NVARCHAR(255) = 'dbo.reports_getMaturityLevelforEachProject',
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

  IF EXISTS(Select 1 from sys.objects where name ='reports_getMaturityLevelforEachProject' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMaturityLevelforEachProject] 
END
GO

CREATE PROCEDURE  [dbo].[reports_getMaturityLevelforEachProject]   
 @CUSTOMER varchar(max)='0'   
AS                
BEGIN  
    
WITH CTE  AS                
(                
  SELECT C.CUST_ID , C.CUST_NM , P.PROJ_ID, P.PROJ_NM,S.SCORE, S.PERCENTAGE_SCORE, PM.level_title as MATURITY_LEVEL,  
  T.ID as TASK_ID, MODEL.ID  [Process Model Id], MODEL.TITLE  [Process Model],               
  (SELECT TOP 1 FRST_NM FROM EMP_INFO WHERE EMP_ID = P.PROJ_PM_EMP_ID) PM,                
  (SELECT TOP 1 FRST_NM FROM EMP_INFO WHERE EMP_ID = P.PROJ_DM_EMP_ID) CSM,  
  (SELECT TOP 1 FRST_NM FROM EMP_INFO WHERE EMP_ID = P.QUALITY_SPOC) QUALITY_SPOC,  
  (SELECT TOP 1 ACTUAL_AUDIT_END_DATE FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY WHERE ASSESSMENT_ID = T.ID AND ISACTIVE = 1) ACTUAL_AUDIT_END_DATE ,           
  (SELECT FRST_NM FROM EMP_INFO WHERE EMP_ID = (SELECT TOP 1 AUDITOR_ID FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY WHERE ASSESSMENT_ID = T.ID AND ISACTIVE = 1)) [AUDITOR],  
  ROW_NUMBER() OVER (PARTITION BY P.PROJ_ID ORDER BY T.ID DESC) AS RowNum  
FROM TASK T INNER JOIN    
TASK_CATEGORY TC on T.TASK_CATEGORY_ID = TC.ID  
INNER JOIN CUSTOMER C ON T.CUST_ID = C.CUST_ID                
INNER JOIN PROJECT P ON T.PROJ_ID = P.PROJ_ID                
INNER JOIN AUDIT_CHECKLIST_EXECUTION_SUMMARY S ON T.ID = S.ASSESSMENT_ID AND S.ISACTIVE = 1                
INNER JOIN PM_CHECKLIST CHK ON S.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1           
INNER join PROCESS_MODEL MODEL ON CHK.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1   
Inner join PM_MATURITYLEVEL_MAPPING PM on PM.process_model_id = CHK.PROCESS_MODEL_ID and S.MATURITY_LEVEL_ID = PM.maturity_level_id  
where T.STATUS in ('COMPLETED') and T.TASK_CATEGORY_ID=11 and isnull(p.proj_status,'') !='close'  
AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))) 
)  
  
select CUST_NM as Customer_Name, PROJ_NM as Project_Name, PM, CSM, QUALITY_SPOC,           
CONVERT(VARCHAR(10), ACTUAL_AUDIT_END_DATE, 105) ACTUAL_AUDIT_END_DATE ,Auditor,          
SCORE,PERCENTAGE_SCORE,MATURITY_LEVEL,           
CUST_ID as Customer_Id, PROJ_ID as Project_Id,TASK_ID  
from cte WHERE RowNum = 1  
order by Customer_Name, Project_Name        
   
END

GO

  IF EXISTS(Select 1 from sys.objects where name ='reports_getMonthlyProcessHealthbyAudits' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyProcessHealthbyAudits] 
END
GO

CREATE PROCEDURE [dbo].[reports_getMonthlyProcessHealthbyAudits]                            
    
@startDate Datetime,                          
@endDate Datetime,                        
@customerid varchar(max)='0'      
  
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
where t.DUE_DATE between @startDate and @endDate and (@customerid='0' or  c.CUst_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))       
group by FORMAT(t.DUE_DATE,'MMMM - yyyy'),summ.ASSESSMENT_ID,summ.AUDIT_TITLE,c.CUST_NM,p.PROJ_NM,summ.score,summ.PERCENTAGE_SCORE,  
summ.UPDATED_SCORE,summ.UPDATED_PERCENTAGE_SCORE,chk.TITLE,t.DUE_DATE,chk.VERSION,chk.EFFECTIVE_FROM,portfolio.TITLE      
order by  year(t.DUE_DATE) desc, month(t.DUE_DATE) desc,summ.ASSESSMENT_ID desc,c.CUST_NM asc,p.PROJ_NM asc     
END  

GO

  IF EXISTS(Select 1 from sys.objects where name ='reports_getMonthlyProcessHealthIndexByCustomerandProject' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyProcessHealthIndexByCustomerandProject] 
END
GO

CREATE PROCEDURE [dbo].[reports_getMonthlyProcessHealthIndexByCustomerandProject]                         
  @startDate Datetime,                        
  @endDate Datetime,                      
  @customerid varchar(max)='0'                      
  AS                                  
  BEGIN              
              
 select FORMAT(t.DUE_DATE,'MMMM - yyyy') AS [Auidt Period],  
 c.CUST_NM,p.PROJ_NM,  
 sum(dtls.MAX_SCORE) as [Max Score], sum(dtls.UPDATED_SCORE) as [Achieved Score],  
 cast(sum(dtls.UPDATED_SCORE) / nullif(sum(dtls.MAX_SCORE),0) * 100 as decimal(5,2))  as [Health Index ( % )]  
 from TASK t                       
                      
  inner join CUSTOMER c on t.CUST_ID = c.CUST_ID                         
  inner join PROJECT p on t.PROJ_ID = p.PROJ_ID    
  inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1   
  inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and dtls.ISACTIVE=1  
     
 where t.DUE_DATE between @startDate and @endDate and (@customerid='0' or  c.CUst_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))    
 group by FORMAT(t.DUE_DATE,'yyyy - MM'),FORMAT(t.DUE_DATE,'MMMM - yyyy'),c.CUST_NM,p.PROJ_NM  
 order by FORMAT(t.DUE_DATE,'yyyy - MM')desc   
    
 END


GO


  DECLARE 
    @SpName NVARCHAR(255) = 'reports_getMonthlyOverallProcessCompliance',
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

 IF EXISTS(Select 1 from sys.objects where name ='reports_getMonthlyOverallProcessCompliance' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyOverallProcessCompliance] 
END
GO

CREATE PROCEDURE [dbo].[reports_getMonthlyOverallProcessCompliance]                        
  @startDate Datetime,                      
  @endDate Datetime ,  
    @CUSTOMER varchar(max)='0'     
  AS                                
  BEGIN      
  
 select FORMAT(t.DUE_DATE,'MMMM - yyyy') AS [Auidt Period],--Year(t.DUE_DATE) as [Year],month(t.DUE_DATE) as [Month],  
 count(distinct c.CUST_ID) as [No of Accounts],  
 count(distinct p.PROJ_ID) as [No of Projects],  
 sum(dtls.MAX_SCORE) as [Max Score], sum(dtls.UPDATED_SCORE) as [Achieved Score],  
 cast(sum(dtls.UPDATED_SCORE) / nullif(sum(dtls.MAX_SCORE),0) * 100 as decimal(5,2))  as [Health Index ( % )]  
 from TASK t                       
                      
  inner join CUSTOMER c on t.CUST_ID = c.CUST_ID                         
  inner join PROJECT p on t.PROJ_ID = p.PROJ_ID    
  inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1   
  inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and dtls.ISACTIVE=1  
     
 where t.DUE_DATE between @startDate and @endDate   AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
 group by FORMAT(t.DUE_DATE,'yyyy - MM'),FORMAT(t.DUE_DATE,'MMMM - yyyy')  
 order by FORMAT(t.DUE_DATE,'yyyy - MM')desc  
 End

 GO

 
   DECLARE 
    @SpName NVARCHAR(255) = 'reports_getCSSMonthlyInitatedDetails',
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

 IF EXISTS(Select 1 from sys.objects where name ='reports_getCSSMonthlyInitatedDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getCSSMonthlyInitatedDetails] 
END
GO

CREATE PROCEDURE [dbo].[reports_getCSSMonthlyInitatedDetails]  
@STARTDATE DATETIME,          
@ENDDATE DATETIME ,
@CUSTOMER varchar(max)='0'    
AS          
BEGIN         
  
  
    WITH CSM AS (                                    
    SELECT P.CUST_ID,E.FRST_NM  CSM_NAME FROM project p                                
    INNER JOIN EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID) ,                         
                
    AM AS (                                    
    SELECT distinct P.CUST_ID,E.FRST_NM  CSM_NAME FROM project p                                
    INNER JOIN EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID                          
            )                
                                
    SELECT  c.cust_nm [Customer Name], b.DISPLAY_NAME [Respondent Name],  B.EMAIL_ID  [Email_Id],                              
      
    c.Cust_ID [Customer_ID],   b.STATUS,             
    STUFF((select distinct ',' + CSM.CSM_NAME from CSM CSM                
    join CSS_BATCH_CUSTOMER_MONTHLY bcc on CSm.CUST_ID = bcc.CUST_ID                
    for xml path ('')),1,1,'')as [Customer Success Manager],                  
    STUFF((select distinct ',' + AM.CSM_NAME from AM AM                
    join CSS_BATCH_CUSTOMER_MONTHLY bcc on AM.CUST_ID = bcc.CUST_ID                
    for xml path ('')),1,1,'')as[ACCOUNT MANAGER]  ,DATENAME(MONTH,DATEADD(MONTH, bt.MONTH,-1))[Month],bt.YEAR            
                 
    FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                                
    INNER JOIN CSS_BATCH_MONTHLY bt on   bt.id = b.BATCH_MONTHLY_ID    
    inner join customer c on c.cust_id = b.cust_id   
    WHERE      
    (( bt.start_date between @STARTDATE and @ENDDATE   ) OR ( bt.END_DATE between @STARTDATE and @ENDDATE))   
	  AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
    order by bt.id,[Customer Name]  
   END

   GO

 IF EXISTS(Select 1 from sys.objects where name ='getProductKPIDataForCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getProductKPIDataForCustomer] 
END
GO


CREATE PROCEDURE [dbo].[getProductKPIDataForCustomer]   
  
@CustomerID varchar(max)  
  
AS   
  
BEGIN  
  
SELECT C.CUST_NM as CUSTOMER, P.TITLE as PORTFOLIO,PP.PRODUCT_TITLE as PRODUCT, K.KPI_NAME as SERVICE_LEVEL_METRICS,   
BM.NUMERATORDESCRIPTION, BM.DENOMINATORDESCRIPTION,SLT.SERVICE_LEVEL, K.FREQUENCY, KT.EXPECTED_SERVICE_LEVEL,   
KT.MINIMUM_SERVICE_LEVEL, K.SLA_TARGET_UNIT_OF_MEASUREMENT, KT.SPECIFICATION_LIMIT, K.IS_SOW_COMMITMENT, PP.IS_SERVICE_COMMENCED,   
PP.PORTFOLIO_ID as PORTFOLIO_ID, PP.ID as PRODUCT_ID, K.ID as KPI_ID, PP.CUST_ID  
  
from KPI K    
join KPI_TARGETS KT on KT.KPI_ID = K.ID                        
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                                      
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                                                
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID    
join SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG SLM on SLM.KPI_ID = K.ID  
join BASE_MEASURE BM on BM.ID = SLM.BASE_MEASURE_ID  
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                        
join PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                        
join CUSTOMER C on C.CUST_ID = PP.CUST_ID  
  
where K.ISACTIVE = 1 and PP.ISACTIVE = 1 and KT.ISACTIVE=1   
and (@CustomerID='0' or C.CUST_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,',')))      
Order by C.CUST_NM, P.TITLE, PP.PRODUCT_TITLE, K.KPI_NAME  
  
END  


GO


 IF EXISTS(Select 1 from sys.objects where name ='reports_getAllAssessmentProcessModelComplianceScore' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getAllAssessmentProcessModelComplianceScore] 
END
GO


CREATE PROCEDURE [dbo].[reports_getAllAssessmentProcessModelComplianceScore]                        
  @startDate Datetime,                      
  @endDate Datetime,                    
  @customerid varchar(max)='0'                    
  AS                                
  BEGIN            
            
   select  c.CUST_NM ,portfolio.TITLE as [Portfolio Name],  p.PROJ_NM,                
   AUDIT_TITLE [Assessment title],                 
   Convert(varchar,Actual_audit_end_date,107) [Assessment End Date], chk.TITLE + '(' + cast(chk.VERSION as varchar) +' - ' + Convert(varchar,chk.EFFECTIVE_FROM,23)+')' as [Checklist Used ],     
   [Agile Scrum Compliance Score]=(select  top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=11 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1) group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
   [Agile Scrum Compliance Score Percentage ( % ) ]=          
   cast(((select  top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=11 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1) group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=11 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 )as decimal(5,2)),          
          
   [BMS - Integrated Standards Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
       and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=14  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
    in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
   [BMS - Integrated Standards Compliance Score Percentage ( % )]=          
   cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=14  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=14 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100) as decimal(5,2)),          
          
   [HIPAA Compliance Score]=          
   (select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=5  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),                 
             
   [HIPAA Compliance Score Percentage ( % )]=          
   cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=5  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=5 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100) as decimal(5,2)),          
             
             
   [ITIL4 Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=12  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
          
   [ITIL4 Compliance Score Percentage ( % )]=          
   cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=12  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in     
       (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=12 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in     
       (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),          
             
          
          
   [ITSM Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=4  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
          
   [ITSM Compliance Score Percentage ( % )]=          
   cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=4  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=4 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100) as decimal(5,2)),          
             
          
   [ISMS Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=3  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
          
   [ISMS Compliance Score Percentage ( % )]=          
   cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=3  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=3 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),          
             
          
   [OHSAS Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=6  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
          
   [OHSAS Compliance Score Percentage ( % )]=          
   cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=6  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=6 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),          
             
          
   [PCI-DSS Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=7  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
          
   [PCI-DSS Compliance Score Percentage ( % )]=          
   cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=7  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=7 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),          
          
          
   [PMI-PMBOK Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=9  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
        
  [PMI-PMBOK Compliance Score Percentage ( % )]=          
  cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=9  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=9 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)),          
          
          
          
   [QMS Compliance Score]=(select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=2  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),          
          
   [QMS Compliance Score Percentage ( % )]=cast(((select top 1 sum(score) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=2  and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc) /           
       nullif((select  top 1 sum(dtls.MAX_SCORE) from AUDIT_CHECKLIST_EXECUTION_DETAILS dtls where ASSESSMENT_ID=find.assessment_ID           
                   and ISACTIVE=1 and dtls.PROCESS_MODEL_ID=2 and find.CHECKLIST_ID = chk.ID and dtls.PM_CHECKLIST_QUESTION_ID     
       in (select id from PM_CHECKLIST_QUESTIONS where CHECKLIST_ID = chk.ID and ISACTIVE=1)    
       group by dtls.PROCESS_MODEL_ID order by find.assessment_ID desc),0) * 100 ) as decimal(5,2)) ,    
     c.CUST_ID ,  p.PROJ_ID    
             
   from TASK t                              
                           
  inner join CUSTOMER c on t.CUST_ID = c.CUST_ID                              
  inner join PROJECT p on t.PROJ_ID = p.PROJ_ID                    
  inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY find on t.id = find.assessment_ID and find.ISACTIVE = 1       
  inner join PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1     
       
  left join  portfolio_Project portproj on t.CUST_ID = portproj.CUST_ID and t.PROJ_ID=portproj.PROJ_ID and portproj.ISACTIVE=1      
  left join  PORTFOLIO portfolio on portproj.PORTFOLIO_ID = portfolio.ID and portfolio.ISACTIVE=1      
                
 WHERE  t.DUE_DATE between @startDate and @endDate and (@customerid='0' or  c.CUst_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))        
                    
 ORDER by  c.CUST_NM, p.PROJ_NM,   [PLANNED_AUDIT_START_DATE] desc, [Assessment title] ,find.assessment_ID desc           
                           
 END

