USE BAS
GO
 

 IF NOT EXISTS(SELECT 1 FROM bas..configuration_ext WHERE [KEY] = 'DISPLAY_MSG_CIL')
 BEGIN
 insert into bas..configuration_ext values ('DISPLAY_MSG_CIL', 'Please note the CI Leader Board will display records till 31st March 2021. CSM Platform Team is working on migrating the CI Leader Board Report to reflect the Ideas created from 1st April 2021 as the DB design/schema has been changed. Until then use BVD Dashboard to view the benefits', -1, null, null, 0,1)
 END

 GO

IF EXISTS(Select 1 from sys.procedures where name ='get_Premier_Portfolios' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[get_Premier_Portfolios]
END
GO


Create procedure [dbo].[get_Premier_Portfolios]    
as     
begin    
 SELECT PORT.TITLE, PORT.CONTACT_NAME, P.PROJ_ALIAS_NM, P.PROJ_NM, P.PROJ_ID, E.FRST_NM, 
 E.EMP_ID,Convert(varchar,E.DOJ,107) as [Date of Joining]  FROM PROJ_RESOURCE PR    
  INNER JOIN PROJECT P ON P.PROJ_ID = PR.PROJ_ID    
  INNER JOIN EMP_INFO E ON E.EMP_ID = PR.EMP_ID    
  INNER JOIN CSP.DBO.PORTFOLIO_PROJECT PP ON PP.PROJ_ID = PR.PROJ_ID    
  INNER JOIN CSP.DBO.PORTFOLIO PORT ON PORT.ID = PP.PORTFOLIO_ID    
  WHERE P.CUST_ID = 212100001 AND BILL_TYPE = 1 AND CURR_INDC = 'Y'    
  ORDER BY PORT.ID, PROJ_ALIAS_NM, FRST_NM    
end
go

if exists(select * from sys.procedures where name='reports_getQualitySpocs' and type='P')
begin
   drop procedure dbo.reports_getQualitySpocs
end
go
CREATE PROCEDURE [dbo].[reports_getQualitySpocs] 
AS             
BEGIN                                
select p.proj_id, p.proj_nm, convert(varchar, cast( p.start_date as date)) as Start_Date, convert(varchar,cast( p.end_date as date)) as End_date, 
c.cust_id, c.cust_nm,  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,  e.frst_nm as quality_spoc, ps.scope, ps.description  , 
p.proj_status  
,[SKIP IN SQAMANAGEMENT REPORT] = (select   case when bit_value = 1 then 'YES' else 'NO' end from   csp..PROJECT_CONFIGURATION_data d 
where d.Configuration_Setting_Id=5  and  d.proj_id = p.proj_id and is_approved = 1 and (end_date is null or end_date> getdate())),

[SKIP TO SHOW IN DASHBOARD] = (select   case when bit_value = 1 then 'YES' else 'NO' end from   csp..PROJECT_CONFIGURATION_data d 
where d.Configuration_Setting_Id=3  and  d.proj_id = p.proj_id and is_approved = 1 and (end_date is null or 
end_date > getdate()))  ,
[SKIP CRISP SCORE CALCULATION] = (select   case when bit_value = 1 then 'YES' else 'NO' end from   csp..PROJECT_CONFIGURATION_data d 
where d.Configuration_Setting_Id=2  and  d.proj_id = p.proj_id and is_approved = 1 and (end_date is null or end_date > getdate())),

[SKIP CSAT] = (select   case when bit_value = 1 then 'YES' else 'NO' end from   csp..PROJECT_CONFIGURATION_data d, CSP..PROJECT_CONFIGURATION_SETTING S
where d.Configuration_Setting_Id=s.Id and 
S.Setting_Key='SKIP_CSAT' and  d.proj_id = p.proj_id and is_approved = 1 and (end_date is null or end_date > getdate())),

[SKIP SUCCESS GOAL/ KPI TRACKING] = (select   case when bit_value = 1 then 'YES' else 'NO' end from   csp..PROJECT_CONFIGURATION_data d, CSP..PROJECT_CONFIGURATION_SETTING S
where d.Configuration_Setting_Id=s.Id  
 and S.Setting_Key='SKIP_SUCCESS_GOAL/ KPI_TRACKING' and  d.proj_id = p.proj_id and is_approved = 1 and (end_date is null or end_date > getdate())),

[SKIP ML ASSESSMENT] = (select   case when bit_value = 1 then 'YES' else 'NO' end from   csp..PROJECT_CONFIGURATION_data d, CSP..PROJECT_CONFIGURATION_SETTING S
where d.Configuration_Setting_Id=s.Id and S.Setting_Key='SKIP_ML_ASSESSMENT' and  d.proj_id = p.proj_id and is_approved = 1 and (end_date is null or end_date > getdate())),

[SKIP MONTHLY HEALTH CHECK] = (select   case when bit_value = 1 then 'YES' else 'NO' end from   csp..PROJECT_CONFIGURATION_data d, CSP..PROJECT_CONFIGURATION_SETTING S
where d.Configuration_Setting_Id=s.Id and S.Setting_Key='SKIP_MONTHLY_HEALTH_CHECK' and  d.proj_id = p.proj_id and is_approved = 1 and (end_date is null or end_date > getdate()))
--case when pd.Configuration_Setting_Id=3 then 'YES' else 'NO' END as [SKIP TO SHOW IN DASHBOARD], --  case when pd.Configuration_Setting_Id=2 then 'YES' else 'NO' END as [SKIP CRISP SCORE CALCULATION]     
from bas.dbo.project p               
inner join bas.dbo.customer c on p.cust_id = c.cust_id            
left join emp_info e on e.emp_id  = p.quality_spoc            
left join csp.dbo.project_scope ps on p.proj_id=ps.project_id            
where --p.end_date> getdate() and        
isnull(p.proj_status,'') != 'close'       
order by c.cust_nm, p.proj_nm                                      
END
go

if exists(select * from sys.procedures where name='reports_getAllAssessmentFindings' and type='P')
begin
   drop procedure dbo.reports_getAllAssessmentFindings
end
go
CREATE PROCEDURE              
  reports_getAllAssessmentFindings       
  @startDate Datetime,    
  @endDate Datetime,  
  @customerid int=0  
  AS              
  BEGIN              
              
   select c.CUST_ID , c.CUST_NM , p.PROJ_ID, p.PROJ_NM,                 
   MODEL.TITLE  [Process Model], find.SCORE, find.PERCENTAGE_SCORE, Convert(varchar,find.created_date,107)    as created_date ,               
  (select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],               
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,              
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,         
     AUDIT_TITLE [Assessment title],      Convert(varchar,PLANNED_AUDIT_START_DATE ,107) [Planned Start Date],  
   Convert(varchar,Actual_audit_start_date,107) [Actual Start Date],   
   Convert(varchar,Actual_audit_end_date,107) [Actual End Date],   
   (select title from csp..process_service_area_new where id = finding.service_area_id) [Service Area],  
   (select title from csp..Process_area where id = finding.process_area_id) [Process Area],  
   (select title from csp..Process where id = finding.process_id) [Process],  
       finding.finding_type, finding.finding_description,  
  (select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_NAME from CSP..AUDIT_CHECKLIST_PROJECT_EXECUTION WHERE AUDIT_ID = t.id and ISACTIVE = 1)) [Auditor],      
   t.DESCRIPTION, t.STATUS,    ACCEPT.status [FINDING_ACCEPTANCE_STATUS]  ,      
  (CASE WHEN EXISTS(SELECT TOP 1 ID FROM CSP..AUDIT_FINDING_STAGES_MAPPING  WHERE FINDING_ID = FIND.ID AND ISACTIVE = 1 AND STAGE_ID = 4 AND ISCOMPLETE = 1) THEN 'Closed'      
  ELSE 'Open' END) [FINDING_STATUS],      
  (SELECT TOP 1 ROOT_CAUSE FROM CSP..AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM CSP..AUDIT_FINDINGS_CAPA WHERE FINDING_ID = find.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],      
  (SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM CSP..AUDIT_FINDINGS_CAPA WHERE FINDING_ID = find.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN]      
         
   from CSP..TASK t              
           
 inner join CUSTOMER c on t.CUST_ID = c.CUST_ID              
 inner join PROJECT p on t.PROJ_ID = p.PROJ_ID              
             
   
 inner join CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY find on t.id = find.assessment_ID and find.ISACTIVE = 1       
 inner join CSP..PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1     
 left join csp..AUDIT_CHECKLIST_PROJECT_FINDINGS finding on finding.AUDIT_ID = t.ID and finding.ISACTIVE =1  
 LEFT join CSP..PROCESS_MODEL MODEL ON CHK.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1      
 LEFT join CSP..AUDITEE_ACCEPTANCE ACCEPT ON FIND.ID = ACCEPT.finding_id    
 WHERE  t.DUE_DATE between @startDate and @endDate and (@customerid=0 or  c.CUst_id = @customerid)  
    
 ORDER by  c.CUST_NM, p.PROJ_NM,   [PLANNED_AUDIT_START_DATE], [Assessment title]  
           
  END
  go

  --JUN -01-2021

 if exists(select * from sys.procedures where name='getAuditorDetails' and type='P')
begin
   drop procedure dbo.getAuditorDetails
end
go
create procedure dbo.getAuditorDetails  
as   
begin  
select EI.* from process_model_auditor audit  
inner join EMP_INFO ei on audit.emp_id = ei.EMP_ID and audit.active_status = 1 and audit.retired_on is null and audit.isactive =1  
  order by EI.FRST_NM
end  
go

