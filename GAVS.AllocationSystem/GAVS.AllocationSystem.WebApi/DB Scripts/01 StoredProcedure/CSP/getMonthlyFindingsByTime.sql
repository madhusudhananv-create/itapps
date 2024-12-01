

USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getMonthlyFindingsByTime' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getMonthlyFindingsByTime
END
GO

CREATE procedure [dbo].[getMonthlyFindingsByTime]       
    @custId varchar(MAX),    
    @projIds varchar(MAX) = '-1'     
   AS            
   BEGIN       
   with cte1 as              
  (SELECT find.id,find.FINDING_TYPE,find.FINDING_DESCRIPTION,accept.created_date as accepted,find.CREATED_DATE,    
    DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) as [AGE_OF_FINDING] ,    
  case when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 0 and 7 then '< 7 days'      
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 7 and 14 then '> 7 days'     
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 14 and 21 then '> 14 days'      
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) between 21 and 30 then '> 21 days'      
  when DATEDIFF(d,isnull(accept.created_date,find.CREATED_DATE),GETDATE()) > 30 then '> 30 days' else '' end as AgeByDays    
   from csp..AUDIT_CHECKLIST_PROJECT_FINDINGS find            
   inner join csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on find.AUDIT_ID = exe.ASSESSMENT_ID         
   inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS det on det.ASSESSMENT_ID = find.AUDIT_ID and det.PM_CHECKLIST_QUESTION_ID = find.APPLICABLE_QUESTIONS and det.SERVICE_AREA_ID = find.SERVICE_AREA_ID         
   and det.PROCESS_AREA_ID = find.PROCESS_AREA_ID        
   and det.PROCESS_MODEL_ID = find.process_model_id and det.PROCESS_ID = find.PROCESS_ID     
   Inner join CSP..AUDIT_FINDING_STAGES_MAPPING map on find.ID = map.FINDING_ID and map.ISACTIVE =1 and map.STAGE_ID = 4 and map.ISCOMPLETE = 0    
   left join csp..AUDITEE_ACCEPTANCE  accept on find.ID = accept.finding_id and accept.isactive = 1    
   where find.issubmitted = 1 and find.ISACTIVE = 1  and exe.CUSTOMER_ID = @custId     
   AND (@projIds = '-1' OR exe.PROJECT_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,','))) 
      
  )     
      
     
 SELECT  cte1.AgeByDays,FINDING_TYPE    
     
 FROM cte1    
    GROUP BY FINDING_TYPE,cte1.AgeByDays     
END 
GO