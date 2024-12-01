USE CSP
GO

IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsForCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsForCustomer]
END
GO

CREATE PROCEDURE [dbo].[getAllFindingsForCustomer]            
  @custid VARCHAR(50),            
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
         
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME ,  
 DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING]  
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find          
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID       
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID       
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID      
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID            
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid       
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID  and isnull(P.PROJ_STATUS,'') != 'Close'       
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1              
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1      
 left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1          
   where find.issubmitted = 1 and find.ISACTIVE = 1      
  )          
          
 select *,  
 case When cte1.AGE_OF_FINDING between 0 and 7 then '< 7 days'  
 when cte1.AGE_OF_FINDING between 7 and 14 then '> 7 days'  
 when cte1.AGE_OF_FINDING between 14 and 21 then '> 14 days'  
 when cte1.AGE_OF_FINDING between 21 and 30 then '> 21 days'  
 when cte1.AGE_OF_FINDING > 30 then '> 30 days' End AGE_OF_FINDING_IN_DAYS  
 from cte1          
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
         
    exe.CUSTOMER_ID, exe.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME ,   
 DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING]  
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find          
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID       
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID       
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID      
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID            
 inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid       
 INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID and isnull(P.PROJ_STATUS,'') != 'Close'        
 left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1              
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1      
 left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1            
   where find.issubmitted = 1 and find.ISACTIVE = 1         
   and  Convert(varchar,find.CREATED_DATE,23) >= Convert(varchar,@startdate,23) and  Convert(varchar,find.CREATED_DATE,23) <= Convert(varchar,@enddate,23)        
  )          
          
 select *, 
 case When cte1.AGE_OF_FINDING between 0 and 7 then '< 7 days'  
 when cte1.AGE_OF_FINDING between 7 and 14 then '> 7 days'  
 when cte1.AGE_OF_FINDING between 14 and 21 then '> 14 days'  
 when cte1.AGE_OF_FINDING between 21 and 30 then '> 21 days'  
 when cte1.AGE_OF_FINDING > 30 then '> 30 days' End AGE_OF_FINDING_IN_DAYS  
 from cte1          
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID          
 order by cte1.ID       
 END    
 END 
 GO