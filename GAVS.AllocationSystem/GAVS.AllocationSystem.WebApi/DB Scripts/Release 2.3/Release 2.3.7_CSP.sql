USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllFindingsForCustomer' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsForCustomer]
END
GO



CREATE PROCEDURE getAllFindingsForCustomer        
  @custid int,        
  @startdate varchar(10),        
  @enddate varchar(10)        
  as          
  begin    
  
  if(@startdate = '' AND @enddate = '')
  BEGIN
  with cte1 as        
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE, exe.ASSESSMENT_ID,     
     
  CASE       
        
  WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)      
  then (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id      
  and ISCOMPLETE = 1 and ISACTIVE = 1      
  order by STAGE_ID desc)       
      
  else (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id AND ISACTIVE = 1      
  order by STAGE_ID asc)      
        
  END as 'STAGE_ID',      
      
  CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)      
  then (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id      
  and ISCOMPLETE = 1 and ISACTIVE = 1      
   order by STAGE_ID desc)       
      
   else (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)      
   END as 'STAGE_STATUS',  
     
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME   
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find      
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID   
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID   
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID  
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID        
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid   
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID  and isnull(P.PROJ_STATUS,'') != 'Close'   
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1          
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1  
         
   where find.issubmitted = 1 and find.ISACTIVE = 1  
  )      
      
 select *, stage.STAGE_DESCRIPTION from cte1      
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID      
 order by cte1.ID      
 END

 ELSE
 BEGIN

  with cte1 as        
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE,exe.ASSESSMENT_ID,        
     
  CASE       
        
  WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)      
  then (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id      
  and ISCOMPLETE = 1 and ISACTIVE = 1      
  order by STAGE_ID desc)       
      
  else (select top 1 stage_id from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id AND ISACTIVE = 1      
  order by STAGE_ID asc)      
        
  END as 'STAGE_ID',      
      
  CASE WHEN EXISTS(SELECT 1 FROM AUDIT_FINDING_STAGES_MAPPING WHERE FINDING_ID = find.ID and ISCOMPLETE = 1 and ISACTIVE = 1)      
  then (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id      
  and ISCOMPLETE = 1 and ISACTIVE = 1      
   order by STAGE_ID desc)       
      
   else (select top 1 STAGE_STATUS from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.id and ISACTIVE = 1 order by STAGE_ID)      
   END as 'STAGE_STATUS',  
     
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME   
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find      
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID   
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID   
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID  
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID        
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid   
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID and isnull(P.PROJ_STATUS,'') != 'Close'    
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1          
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1  
         
   where find.issubmitted = 1 and find.ISACTIVE = 1     
   and  Convert(varchar,find.CREATED_DATE,23) >= Convert(varchar,@startdate,23) and  Convert(varchar,find.CREATED_DATE,23) <= Convert(varchar,@enddate,23)    
  )      
      
 select *, stage.STAGE_DESCRIPTION from cte1      
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID      
 order by cte1.ID   
 END
 END
 GO

Declare @RESOURCEID int = 80
Declare @EMPID int = 104859
Declare @RescourceName varchar(250) = 'Idea Approve/Reject'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID) set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into csp..APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0)
end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY)
values  
(@RESOURCEID,'EDIT',null,@EMPID,@EMPID) 
end
GO