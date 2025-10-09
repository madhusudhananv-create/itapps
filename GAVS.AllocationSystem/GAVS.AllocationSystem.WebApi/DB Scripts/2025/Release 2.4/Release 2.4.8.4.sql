


 DECLARE 
    @SpName NVARCHAR(255) = 'dbo.Get_Process_Mapping_Report_All',
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

 IF EXISTS(Select 1 from sys.objects where name ='Get_Process_Mapping_Report_All' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[Get_Process_Mapping_Report_All] 
END
GO
CREATE PROC [dbo].[Get_Process_Mapping_Report_All]  
 @CUSTOMER varchar(max)='0'    
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
left JOIN   
    PROCESS_MODEL pm ON map.PROCESS_MODEL_ID = pm.ID AND map.ISACTIVE = 1   
left JOIN   
    PROCESS_SERVICE_AREA_MAPPING psam ON  p.id = psam.PROCESS_ID AND psam.ISACTIVE = 1   
left JOIN   
    PROCESS_SERVICE_AREA_NEW psan ON psan.ID = psam.SERVICE_AREA_ID AND psan.ISACTIVE = 1 AND psan.SHOW_IN_MASTER = 1  
left join   
   PROCESS_SERVICE_AREA_PROJECT_MAPPING PSAPM on PSAM.SERVICE_AREA_ID = PSAPM.SERVICE_AREA_ID AND PSAPM.ISACTIVE =1  
left JOIN  
   PROJECT PR ON PSAPM.PROJ_ID = PR.PROJ_ID   
left join   
 customer c on psapm.cust_id = c.cust_id   
 where p.ISACTIVE =1 and p.SHOW_IN_MASTER =1  
  AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
 order by [Process Title],[Process Model Title],[Service Tower Title];  
END  

GO

DECLARE 
    @SpName NVARCHAR(255) = 'dbo.reports_ProductResponsibleList',
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
 IF EXISTS(Select 1 from sys.objects where name ='reports_ProductResponsibleList' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_ProductResponsibleList] 
END
GO

CREATE PROCEDURE [dbo].[reports_ProductResponsibleList]  
  @CUSTOMER varchar(max)='0'    
As  
Begin  
  
select p.TITLE as Portfolio_Name , pp.PRODUCT_TITLE  ,  
iif (ei.FRST_NM is null , cu.DISPLAY_NAME ,ei.FRST_NM) As Name,  
pm.MANAGEMENT_TYPE ,  
iif(ei.EMAIL_ID is null , cu.EMAILID ,ei.EMAIL_ID ) AS MailID,  
 pp.IS_SERVICE_COMMENCED , pp.SERVICE_COMMENCEMENT_DATE  from PORTFOLIO p inner join PORTFOLIO_PRODUCTS pp on pp.PORTFOLIO_ID=p.ID   
inner join PRODUCT_RESPONSIBLE pr on pr.PRODUCT_ID=pp.ID   
inner join PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE pm on pm.ID=pr.MANAGEMENT_TYPE   
left join EMP_INFO ei on ei.EMP_ID=pr.EMP_ID   
left join customer_users cu on cu.EMAILID=pr.EMP_ID  
where p.ISACTIVE=1 and pp.ISACTIVE=1 and pr.ISACTIVE=1 and pm.ISACTIVE=1  
and  (@CUSTOMER='0' or  pp.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
order by pp.PRODUCT_TITLE  , pm.ID  
  
End

GO

DECLARE 
    @SpName NVARCHAR(255) = 'dbo.reports_getProjectConfigurationData',
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

IF EXISTS(Select 1 from sys.objects where name ='reports_getProjectConfigurationData' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getProjectConfigurationData] 
END
GO

CREATE PROCEDURE [dbo].[REPORTS_getProjectConfigurationData]  
 @CUSTOMER varchar(max)='0'    
AS  
BEGIN  
 DECLARE @mainUrl VARCHAR(1000) = 'https://csm.neurealm.com/layout/projectdataconfigurationApproval'  
  
 SELECT PC.ID  
  ,P.PROJ_NM AS [PROJECT NAME]  
  ,PCS.SETTING_NAME AS [SETTING NAME]  
  ,PC.COMMENTS  
  ,CONCAT_WS(' ', E.FRST_NM, E.MIDDLE_NM, E.LAST_NM) AS [APPROVER]  
  ,PC.APPROVAL_COMMENTS AS [APPROVAL COMMENTS]  
  ,Convert(VARCHAR, PC.END_DATE, 107) AS [END_DATE],  
    CASE   
        WHEN PC.IS_APPROVED = 1 THEN NULL  
        ELSE    (@mainUrl + '/' + CAST(PC.Proj_Id AS VARCHAR(250)) + '/' + CAST(PC.Cust_Id AS VARCHAR(250)) + '/' + CAST(PC.Configuration_Setting_Id AS VARCHAR(250)) + '/1')     
   END AS [Approval link],  
    (@mainUrl + '/' + CAST(PC.Proj_Id AS VARCHAR(250)) + '/' + CAST(PC.Cust_Id AS VARCHAR(250)) + '/' + CAST(PC.Configuration_Setting_Id AS VARCHAR(250)) + '/0')  
     AS [Reject link]  
  ,PC.IS_APPROVED AS [APPROVED]  
  ,PC.PROJ_ID AS [PROJECT ID]  
  ,PC.CONFIGURATION_SETTING_ID AS [CONFIGURATION SETTING ID]  
    
 FROM PROJECT_CONFIGURATION_DATA PC  
 INNER JOIN PROJECT P ON PC.PROJ_ID = P.PROJ_ID  
 LEFT JOIN PROJECT_CONFIGURATION_SETTING PCS ON PC.CONFIGURATION_SETTING_ID = PCS.ID  
  AND PCS.ISACTIVE = 1  
 LEFT JOIN EMP_INFO E ON PC.APPROVED_BY = E.EMP_ID  
  AND PC.ISACTIVE = 1  
    where (@CUSTOMER='0' or  P.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
 ORDER BY PC.End_date;  
END  

GO

IF EXISTS(Select 1 from sys.objects where name ='getProjectContractStatusReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectContractStatusReport] 
END
GO

CREATE PROCEDURE [dbo].[getProjectContractStatusReport]    
    @CustomerID varchar(max)  
as           
begin           
  SELECT c.CUST_NM as Customer,p.PROJ_NM as Project,  
  HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y'),   
  e2.FRST_NM +' '+ISNULL(e2.LAST_NM,'') AS Account_Manager,  
  e.FRST_NM +' '+ISNULL(e.LAST_NM,'') AS CSM,  
  e3.FRST_NM +' '+ISNULL(e3.LAST_NM,'')  as ProjectManager,  
  p.START_DATE as StartDate, p.END_DATE as EndDate,  
  p.CUST_ID as CustomerId,  
  p.PROJ_ID as ProjectId  
  FROM project p  
  inner join EMP_INFO e (NOLOCK) on e.EMP_ID=p.PROJ_DM_EMP_ID     
  left join EMP_INFO e1 (NOLOCK) on e1.EMP_ID=p.QUALITY_SPOC        
  inner join EMP_INFO e2 (NOLOCK) on e2.EMP_ID=p.PROJ_AM_EMP_ID    
  inner join EMP_INFO e3 (NOLOCK) on e3.EMP_ID=p.PROJ_PM_EMP_ID    
  inner join CUSTOMER c (NOLOCK) on c.CUST_ID=p.CUST_ID       
    
  WHERE p.END_DATE BETWEEN GETDATE() AND DATEADD(month, 3, GETDATE()) and  p.BILL_TYPE=1  and ISNULL(P.PROJ_STATUS ,'') != 'Close'   
  and (@CustomerID='0' or p.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,',')))  order by END_DATE    
  
END  

GO

DECLARE 
    @SpName NVARCHAR(255) = 'reports_getMaturityLevelForProjects',
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

IF EXISTS(Select 1 from sys.objects where name ='reports_getMaturityLevelForProjects' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMaturityLevelForProjects] 
END
GO

CREATE PROCEDURE [dbo].[reports_getMaturityLevelForProjects]                
@CUSTOMER varchar(max)='0'    
    
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
                 
from cte WHERE  (@CUSTOMER='0' or  CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))) order by [Customer name], [Project Name]          
END  

GO

DECLARE 
    @SpName NVARCHAR(255) = 'sp_getProjectsWithNoCustomerContacts',
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

IF EXISTS(Select 1 from sys.objects where name ='sp_getProjectsWithNoCustomerContacts' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[sp_getProjectsWithNoCustomerContacts] 
END
GO

 CREATE PROCEDURE [dbo].[sp_getProjectsWithNoCustomerContacts]  
   @CUSTOMER varchar(max)='0'    
 as BEGIN  
 select c.CUST_NM as CustomerName, p.proj_nm as Project, p.proj_id as ProjectId, csm.frst_nm as CSM from project p inner join emp_info csm on csm.EMP_ID = p.PROJ_DM_EMP_ID  
inner join customer c on p.CUST_ID = c.CUST_ID  
where isnull(p.proj_status,'')!= 'close' and p.cust_id not in ('201100010', '202100062')   and p.proj_id  
not in (select cp.proj_id from customer_projects cp where cp.proj_id = p.proj_id and csat_survey =1) and end_date > getdate()  
 and  (@CUSTOMER='0' or  p.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
     
order by 1 , 2  
END

GO

DECLARE 
    @SpName NVARCHAR(255) = 'dbo.reports_getServiceTowersMappedForProjects',
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

IF EXISTS(Select 1 from sys.objects where name ='reports_getServiceTowersMappedForProjects' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getServiceTowersMappedForProjects] 
END
GO

CREATE PROCEDURE [dbo].[reports_getServiceTowersMappedForProjects] 
 @CUSTOMER varchar(max)='0'    
AS           
BEGIN           
SELECT        
t.CUST_NM AS CUSTOMER,t.PROJ_ID AS PROJECT_ID,t.PROJ_NM AS PROJECT,ACCOUNT_OWNER,t.MANAGER,t.CSM,QA_SPOC, CASE WHEN t.CSV IS NULL THEN 'NO' ELSE 'YES' END SERVICE_TOWER_MAPPED,          
t.CSV AS SERVICE_TOWERS , t.CSM_MAIL_ID ,t.MANAGER_MAIL_ID ,t.QUALITY_PARTNER_MAIL_ID, case when QADOR is null then 'YES' else 'NO' end IS_QA_ACTIVE FROM(          
select C.CUST_NM, P.PROJ_ID,          
PROJ_NM  ,ACCOUNT_OWNER = case when proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,     PM.FRST_NM +' '+ISNULL(PM.LAST_NM,'') AS MANAGER,   DM.FRST_NM +' '+ISNULL(DM.LAST_NM,'') AS CSM,PM.EMAIL_ID as MANAGER_MAIL_ID ,     
DM.EMAIL_ID as CSM_MAIL_ID, qa.EMAIL_ID as QUALITY_PARTNER_MAIL_ID,        
QA.FRST_NM +' '+ISNULL(QA.LAST_NM,'') AS QA_SPOC,CSV= STUFF (( SELECT   ', ' +  TITLE  FROM          
PROCESS_SERVICE_AREA_PROJECT_MAPPING PSMAP (NOLOCK)          
INNER JOIN PROCESS_SERVICE_AREA_NEW S (NOLOCK)          
ON PSMAP.SERVICE_AREA_ID =S.ID          
WHERE p.PROJ_ID= PSMAP.PROJ_ID AND PSMAP.ISACTIVE=1 order by title          
  FOR XML PATH('')), 1, 2, ''), QA.DOR QADOR        
from PROJECT P (NOLOCK)            
INNER JOIN CUSTOMER C (NOLOCK) ON          
P.CUST_ID=C.CUST_ID          
INNER JOIN EMP_INFO PM (NOLOCK) ON          
P.PROJ_PM_EMP_ID =PM.EMP_ID          
INNER JOIN EMP_INFO DM (NOLOCK) ON          
P.PROJ_DM_EMP_ID =DM.EMP_ID          
INNER JOIN EMP_INFO QA (NOLOCK) ON          
P.QUALITY_SPOC =QA.EMP_ID         
WHERE ISNULL(P.PROJ_STATUS ,'') != 'Close'   and p.proj_id not like 'proj%'    and PROJECT_TYPE not like 'Internal'  
AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
and proj_id not in (select proj_id from PROJECT_CONFIGURATION_DATA where Configuration_Setting_Id = 17 and isnull(Is_Approved,0) =1 and isnull(end_date,getdate()+1) > GETDATE() )    
) as t          
ORDER BY CUST_NM,PROJ_NM          
  
END

GO

DECLARE 
    @SpName NVARCHAR(255) = 'reports_getQuarterlyProcessHealthIndexSummary',
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

IF EXISTS(Select 1 from sys.objects where name ='reports_getQuarterlyProcessHealthIndexSummary' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQuarterlyProcessHealthIndexSummary] 
END
GO

CREATE PROCEDURE  [dbo].[reports_getQuarterlyProcessHealthIndexSummary]                      
  @startDate Datetime,                      
  @endDate Datetime,
  @CUSTOMER varchar(max)='0'   
  AS                                
  BEGIN      
  
 select Year(t.DUE_DATE) AS [Year],   
 case when Datepart(QUARTER,t.DUE_DATE)=1 then 'Q1'  
 when Datepart(QUARTER,t.DUE_DATE)=2 then 'Q2'  
 when Datepart(QUARTER,t.DUE_DATE)=3 then 'Q3'  
 when Datepart(QUARTER,t.DUE_DATE)=4 then 'Q4' else '' End as [Audit Period] ,  
 count(distinct c.CUST_ID) as [No of Accounts],  
 count(distinct p.PROJ_ID) as [No of Projects],  
 sum(dtls.MAX_SCORE) as [Max Score], sum(dtls.UPDATED_SCORE) as [Achieved Score],  
 cast(sum(dtls.UPDATED_SCORE) / nullif(sum(dtls.MAX_SCORE),0) * 100 as decimal(5,2))  as [Health Index ( % )]  
 from TASK t                       
                      
  inner join CUSTOMER c on t.CUST_ID = c.CUST_ID                         
  inner join PROJECT p on t.PROJ_ID = p.PROJ_ID    
  inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1   
  inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and dtls.ISACTIVE=1  
     
 where t.DUE_DATE between @startDate and @endDate    AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
 group by Year(t.DUE_DATE),Datepart(QUARTER,t.DUE_DATE)  
 order by Year(t.DUE_DATE) desc,Datepart(QUARTER,t.DUE_DATE) desc  
  
 End

 GO

 DECLARE 
    @SpName NVARCHAR(255) = 'dbo.GetEnagagementLevelReport',
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

IF EXISTS(Select 1 from sys.objects where name ='GetEnagagementLevelReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[GetEnagagementLevelReport] 
END
GO
CREATE PROCEDURE [dbo].[GetEnagagementLevelReport]  
  
@startDate Datetime  ,                                                         
@endDate Datetime ,
@CUSTOMER varchar(max)='0'   
  
As  
begin  
  
exec getEngagementLevelKPI @customerId=@CUSTOMER,@startDate=@startDate ,@endDate=@endDate   
  
end

GO

IF EXISTS(Select 1 from sys.objects where name ='getEngagementLevelKPI' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getEngagementLevelKPI] 
END
GO
CREATE procedure [dbo].[getEngagementLevelKPI]   
  
@customerId  varchar(max),      
@startDate Datetime,      
@endDate Datetime,      
@iscustomer bit =0      
  
AS   
BEGIN      
  
declare @remitraId int = (Select ID from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='Remitra')      
declare  @quarterStartDate Datetime      
declare @quarterEndDate datetime      
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));      
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));      
select KPI_NAME,      
count(Product_id) as PRODUCT_COUNT,      
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,      
SUM(ISNA) as ISNA      
, count(Met_product) metCount, sum(met_product) metSum      
, count(exclusion_Met_product) exMetCount, sum(exclusion_Met_product) exMetSum      
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents or Problems that require a Code Change')      
and count(MET_PRODUCT) > 0      
then cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,count(MET_PRODUCT)) *100 as decimal(18,3))      
when kpi_name in('Issues detected Post-Production release')      
and sum(MET_PRODUCT) > 0     then     sum(KPI_NUMERATOR)/sum(MET_PRODUCT)      
else IIF(sum(kpi_denominator) != 0,cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3)),0)      
end as ACHIEVEMENT_VALUE      
, sum(KPI_NUMERATOR) as KPI_NUMERATOR      
, sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE      
, count(*) as cnt  ,      
MAX(SERVICE_LEVEL) as SERVICE_LEVEL      
,case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents or Problems that require a Code Change')      
and count(EXCLUSION_MET_PRODUCT) > 0      
then cast(convert(decimal,sum(EXCLUSION_MET_PRODUCT))/CONVERT(decimal,count(EXCLUSION_MET_PRODUCT)) *100 as decimal(18,3))      
when kpi_name in('Issues detected Post-Production release')      
and sum(EXCLUSION_MET_PRODUCT) > 0     then    cast(sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR))/sum(EXCLUSION_MET_PRODUCT)     as decimal(18,3))      
else IIF(sum(EXCLUSION_KPI_DENOMINATOR) != 0,cast(sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR)) / sum(isnull(EXCLUSION_KPI_DENOMINATOR,KPI_DENOMINATOR)) *100  as decimal(18,3)),0)      
end as EXCLUSION_ACHIEVEMENT_VALUE      
, sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR)) as EXCLUSION_KPI_NUMERATOR      
, sum(isnull(EXCLUSION_KPI_DENOMINATOR,KPI_DENOMINATOR)) as EXCLUSION_KPI_DENOMINATOR      
from      
(      
select K.KPI_NAME as KPI_NAME,      
PP.ID as Product_id,      
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)      
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,      
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,      
CASE WHEN KD.SLA_STATUS in( 'Met','NA') then 1 ELSE 0 END AS MET_PRODUCT      
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,      
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT      
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,      
CASE WHEN isnull(nullif( KD.EXCLUSION_SLA_STATUS ,''), SLA_STATUS) in ( 'Met','NA') then 1 ELSE 0 END AS EXCLUSION_MET_PRODUCT      
,CASE WHEN KD.EXCLUSION_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_NOT_MET_PRODUCT,      
CASE WHEN isnull(nullif( KD.EXCLUSION_SECONDARY_SLA_STATUS ,''),  SECONDARY_SLA_STATUS)  in ( 'Met','NA') then 1 ELSE 0 END AS EXCLUSION_SECONDARY_MET_PRODUCT      
,CASE WHEN KD.EXCLUSION_SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_SECONDARY_NOT_MET_PRODUCT,      
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA      
,(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id and   IS_EXCLUSION = 0)   as KPI_NUMERATOR      
,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id and   IS_EXCLUSION = 0)   as KPI_DENOMINATOR      
,( select   sum(numerator)  from kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION = 1)   as EXCLUSION_KPI_NUMERATOR      
,(select   sum(DENOMINATOR) from kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION =1)   as EXCLUSION_KPI_DENOMINATOR      
,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM      
,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL      
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID      
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )   ,      
[SERVICE_LEVEL] = (select SLT.SERVICE_LEVEL from KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL      
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID      
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID where KPSL.KPI_ID = k.id)      
from KPI K      
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1      
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and      
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))      
or (K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate ))      
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1      
where   K.CUSTOMER_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))and PP.ID != @remitraId and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)      
and isnull(KD.ISDRAFT,0)=0)a      
group by KPI_NAME  order by KPI_NAME     
  
END

GO

 DECLARE 
    @SpName NVARCHAR(255) = 'getPortfolioWiseKPIData',
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

IF EXISTS(Select 1 from sys.objects where name ='getPortfolioWiseKPIData' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getPortfolioWiseKPIData] 
END
GO

CREATE PROCEDURE [dbo].[getPortfolioWiseKPIData]        
      
      
@startDate DateTime,                                    
@endDate DateTime,             
@portfolioId int,
@CUSTOMER varchar(max)='0'   
                            
AS                            
BEGIN                   
declare  @quarterStartDate Datetime                  
declare @quarterEndDate datetime                  
                  
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                  
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                  
                  
with cte as                      
(                        
 SELECT K.ID,PORTFOLIO_ID,K.FREQUENCY,PSLT.SERVICE_LEVEL         
 ,k.KPI_NAME,(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                         
 ,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR              
 ,CONVERT(VARCHAR(20),KD.PERIOD,107) as PERIOD              
 ,ft.id as FID ,ft.formula,PT.SYSTEM_UPTIME                                          
 FROM KPI_DETAILS KD                                        
         
 JOIN KPI K ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1              
and ((K.FREQUENCY ='Monthly' and  (CONVERT(varchar(20),KD.PERIOD,23)                     
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))              
 or              
 (K.FREQUENCY ='Release' and  (CONVERT(varchar(20),KD.PERIOD,23)                     
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))                 
or(K.FREQUENCY ='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23)))                  
                           
 INNER JOIN KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                      
 INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                            
 INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                            
 INNER JOIN PRODUCTS_SERVICE_LEVEL_TYPE PSLT on PSL.SERVICE_LEVEL_TYPE_ID = PSLT.ID              
 INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                            
 INNER JOIN PORTFOLIO P on PP.PORTFOLIO_ID = P.ID         
 left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                                                   
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                      
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                      
 INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                           
 where isnull(KD.ISDRAFT,0)= 0  and (@portfolioId =0 or P.ID = @portfolioId )         
  and  (@CUSTOMER='0' or  pP.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))))               
               
  select  PORTFFOLIO_NAME = (select TITLE from PORTFOLIO where ID = cte.PORTFOLIO_ID),                     
  KPI_NAME,cte.PERIOD,cte.SERVICE_LEVEL      
  , sum(KPI_NUMERATOR) as KPI_NUMERATOR                      
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                      
 --, MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))                      
 --,EXPECTED_SERVICE_LEVEL= (select EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))                 
 , MINIMUM_SERVICE_LEVEL= (select CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and cte.kpi_name ='SYSTEM UPTIME' then max(cte.SYSTEM_UPTIME)   
 ELSE KT.MINIMUM_SERVICE_LEVEL END from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))  
  
 , EXPECTED_SERVICE_LEVEL= (select CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and cte.kpi_name ='SYSTEM UPTIME' then max(cte.SYSTEM_UPTIME)   
 ELSE KT.EXPECTED_SERVICE_LEVEL END from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))  
,max( FID) as FORMULA_ID                          
 ,max( formula) as FORMULA                                  
 --,null as KPI_ACTUAL, null as SLA_STAUTS      
      
  from cte  --where KPI_NAME= 'Critical Security Threat Mitigation'        
  group by  cte.PORTFOLIO_ID,KPI_NAME, PERIOD,cte.SERVICE_LEVEL      
  order by KPI_NAME        
 END

 GO

 DECLARE 
    @SpName NVARCHAR(255) = 'dbo.getOverallProductWiseCAPAData',
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

IF EXISTS(Select 1 from sys.objects where name ='getOverallProductWiseCAPAData' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallProductWiseCAPAData] 
END
GO

CREATE PROCEDURE [dbo].[getOverallProductWiseCAPAData]  
@startDate varchar(20),  
@endDate varchar(20),  
@productId int ,
@CUSTOMER varchar(max)='0'    
  
AS  
BEGIN  
declare @quarterStartDate Datetime  
declare @quarterEndDate datetime  
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));  
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));  
;WITH CTE  
AS  
(  
select P.TITLE as PORTFOLIO,PP.PRODUCT_TITLE as PRODUCT, IS_SERVICE_COMMENCED, K.KPI_NAME, SLT.SERVICE_LEVEL,  
KD.PERIOD_TYPE, CONVERT(VARCHAR(20),KD.PERIOD,107) as PERIOD, KD.KPI_ACTUAL,  
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,  
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,  
KD.ISFLAG as NOT_APPLICABLE,KD.HIGHLIGHTS as REASON,KD.SLA_STATUS as EXPECTED_SERVICE_LEVEL_STATUS,KD.SECONDARY_SLA_STATUS as MINIMUM_SERVICE_LEVEL_STATUS ,  
KD.EXCLUSION_SLA_STATUS as EXCLUSION_EXPECTED_SERVICE_LEVEL_STATUS,KD.EXCLUSION_SECONDARY_SLA_STATUS as EXCLUSION_MINIMUM_SERVICE_LEVEL_STATUS ,  
BaseMeasure_Numerator = STUFF(( select ',', isnull(NUMERATORDESCRIPTION,'') from base_measure b inner join kpi_base_measure_value m on b.id = m.base_measure_id where m.KPI_DETAILS_ID = kd.id order by m.BASE_MEASURE_ID FOR XML PATH('')), 1, 1, ''),  
Numerator_Values =  STUFF(( select ',', CONVERT(int, NUMERATOR) from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 0 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, '') ,  
BaseMeasure_Denominator =  STUFF(( select ',', isnull(DENOMINATORDESCRIPTION,'') from base_measure b inner join kpi_base_measure_value m on b.id = m.base_measure_id where m.KPI_DETAILS_ID = kd.id order by m.BASE_MEASURE_ID FOR XML PATH('')), 1,   1, ''), 
 
Denominator_Values = STUFF(( select ',', case when DENOMINATOR is null then '' else CONVERT(int, DENOMINATOR) end from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 0 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, '')
,  
(select   sum(numerator) from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 0)   as KPI_NUMERATOR,  
(select   sum(DENOMINATOR)   from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 0)   as KPI_DENOMINATOR  ,  
(select   sum(numerator) from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 1)   as EXCLUSION_KPI_NUMERATOR,  
(select   sum(DENOMINATOR)   from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 1)   as EXCLUSION_KPI_DENOMINATOR  ,  
KD.EXCLUSION_KPI_ACTUAL, KD.EXCLUSION_COMMENT,  
EXCLUSION_NUMERATOR_VALUES =  STUFF(( select ',', CONVERT(int, NUMERATOR) from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 1 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, '') ,  
EXCLUSION_DENOMINATOR_VALUES = STUFF(( select ',', case when DENOMINATOR is null then '' else CONVERT(int, DENOMINATOR) end from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 1 order by BASE_MEASURE_ID FOR XML PATH('')),
 1, 1, ''),  
CAUSE.CAUSES,CAPA.CORRECTIVE_ACTION_PLAN ,  
IIF((KD.SLA_STATUS = 'Not Met' OR KD.SECONDARY_SLA_STATUS = 'Not Met' ) ,  
(case when Stage.ISCOMPLETE=1 then 'Closed' else 'Open' END),null) [CAPA_STATUS],  
kd.id as KPI_DETAIL_ID,K.ID as KPI_ID, p.ID as PORTFOLIO_ID  
from KPI_DETAILS KD  
join KPI K on KD.KPI_ID = K.ID  
join KPI_TARGETS KT on KT.KPI_ID = K.ID  
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID  
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID  
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID  
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID  
join PORTFOLIO P on PP.PORTFOLIO_ID = P.ID  
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID  
left join AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1 AND CAPA.ISROOTCAUSE = 1  
left join AUDIT_MANAGEMENT_CAUSES CAUSE on CAUSE.ID = CAPA.CAUSE_ID and CAUSE.ISACTIVE = 1  
LEFT join AUDIT_FINDING_STAGES_MAPPING Stage on Stage.KPI_DETAILS_ID = KD.ID and Stage.STAGE_ID=4 and Stage.ISACTIVE=1  
where K.ISACTIVE = 1 and PP.ISACTIVE = 1           and isnull(kd.isdraft,0) = 0  
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and  
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))  
or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate ) 
and  (@CUSTOMER='0' or  PP.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))))  
select * from CTE order by cte.KPI_NAME  
END  

GO

IF EXISTS(Select 1 from sys.objects where name ='complianceCourseReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[complianceCourseReport] 
END
GO
   CREATE Procedure [dbo].[complianceCourseReport]           
   @CustomerID varchar(max) = '0'                                
   as           
   begin           
           
   Select distinct e.frst_nm as Name, e.email_id as Mail, P.PROJ_NM as PROJECT_NAME,           
   InformationSecurity_CompletedOn = (Select  Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID         
   where LCm.course_ID=312 and (lcm.emp_id = e.email_id or lcm.emp_id = e.emp_id)) ,          
   GIHTHealthcareAspirant_CompletedOn = (Select   Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=106 and (lcm.emp_id = e.email_id or lcm.emp_id = e.emp_id)) ,          
   OHSASCompletedOn = (Select top 1 Format(LCC.COMPLETED_DATE,'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=329 and (lcm.emp_id = e.email_id or lcm.emp_id = e.emp_id)) ,           
   ContinuousImprovement_CompletedOn = (Select  Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=104 and (lcm.emp_id = e.email_id or lcm.emp_id = e.emp_id)) ,          
   PrinciplesofQuality_CompletedOn = (Select  Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=350 and (lcm.emp_id = e.email_id or lcm.emp_id = e.emp_id)) ,           
   FintechFoundation_CompletedOn = (Select  Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=195 and (lcm.emp_id = e.email_id or lcm.emp_id = e.emp_id)) ,           
   GDPRAwareness_CompletedOn = (Select   Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=351 and (lcm.emp_id = e.email_id 
  
    
or lcm.emp_id = e.emp_id))    ,    
 HIPAA_Privacy_Security_FY24 =   (Select   Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=105 and (lcm.emp_id = e.email_id     
or lcm.emp_id = e.emp_id))  ,    
 HIPAA_Privacy_Security_FY25 =  (Select   Format(max(LCC.COMPLETED_DATE),'yyyy-MM-dd') from LMS_COURSE_ENROLLMENT LCM     left join LMS_COURSE_COMPLETION LCC on LCC.ENROLLMENT_ID = LCM.LMS_ENROLLMENT_ID where LCm.course_ID=330 and (lcm.emp_id = e.email_id
     
or lcm.emp_id = e.emp_id))      
   from   VW_PROJ_RESOURCE_ACTIVE PR            
   inner join  VW_EMP_INFO_Active E   on PR.EMP_ID = E.EMP_ID           
   inner join VW_PROJECT_ACTIVE P on P.PROJ_ID = PR.PROJ_ID           
           
   where (@CustomerID ='0' or  P.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,',')) ) and PR.CURR_INDC='Y' and PR.BILL_FLG=1         
   --and E.DOR IS NULL         
   and pr.end_date > getdate()         
           
   --and isnull(p.proj_status,'') !='close'           
   order by E.FRST_NM            
   end 
GO

DECLARE 
    @SpName NVARCHAR(255) = 'reports_getWeeklyApprovalDetails',
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

IF EXISTS(Select 1 from sys.objects where name ='reports_getWeeklyApprovalDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getWeeklyApprovalDetails] 
END
GO

CREATE PROCEDURE [dbo].[reports_getWeeklyApprovalDetails] --'2019-09-01', '2019-09-29'  
(  
    @STARTDATE DATETIME, @ENDDATE DATETIME ,@CUSTOMER varchar(max)='0'        
)  
AS  
  
  SELECT E.EMP_ID,CLNDR_DATE, P.PROJ_ID, P.PROJ_NM, E.FRST_NM,EC.Display_name, sum(CLOCKED_MINS) as CLOCKED_MINS , T.UPDATED_BY, T.UPDATED_DATE, T.TIME_ENTRY_STATUS,po.Title  
  FROM [PROJ_RESRC_TIME_ENTRY] T  
  INNER JOIN DATE_DIM DD ON DD.DATE_ID = T.DATE_ID  
  INNER JOIN PROJECT P ON P.PROJ_ID = T.PROJ_ID  
  INNER JOIN EMP_INFO E ON E.EMP_ID = T.EMP_ID  
  INNER JOIN emp_info_for_customer EC ON EC.EMP_ID=E.EMP_ID  
  INNER JOIN PORTFOLIO_PROJECT PF ON PF.PROJ_ID= P.PROJ_ID   
  INNER JOIN PORTFOLIO PO ON PO.ID = PF.PORTFOLIO_ID  
 WHERE T.TIME_ENTRY_STATUS = 'APPROVED'  and  (@CUSTOMER='0' or  P.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
 AND CLNDR_DATE >=@STARTDATE  AND CLNDR_DATE <= @ENDDATE group by T.UPDATED_BY,E.EMP_ID,CLNDR_DATE, P.PROJ_ID, P.PROJ_NM, E.FRST_NM,EC.Display_name,T.UPDATED_DATE, T.TIME_ENTRY_STATUS,po.Title
GO