IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getListofPlannedAudits' AND TYPE='P')
BEGIN
       DROP PROCEDURE getListofPlannedAudits
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
and  T.STATUS not in ('CANCELLED') and t.ISACTIVE =1 and ISNULL(T.IS_DRAFT, 0) = 0                           
                               
order by t.id                             
Drop table #Paramtemp            
        
END       
GO
