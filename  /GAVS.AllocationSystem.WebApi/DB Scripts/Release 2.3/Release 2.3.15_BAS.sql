USE BAS


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='get_CSMList' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].get_CSMList
END
GO
  


/*    
---------------------------------------------------    
-- Author        : UNknown       
-- Date      :  NA     
-- Purpose       : [get_CSMList]    
---------------------------------------------------     
-- ver     user             date             change      
-- 1.1    Indhu          27-09-2022      Added empid   
#########################################################################  */    
CREATE PROCEDURE [dbo].[get_CSMList]        
        
AS        
BEGIN        
 -- SET NOCOUNT ON added to prevent extra result sets from        
 -- interfering with SELECT statements.        
 SET NOCOUNT ON;       
    
 Select cust_id,Proj_id, frst_nm as csm,emp_id as csm_Id from bas..project p (NOLOCK) inner join bas..emp_info e (NOLOCK) on e.emp_id = p.PROJ_DM_EMP_ID  
 and dor is null  
 GROUP BY  
 cust_id,Proj_id, Frst_nm, emp_id   
       
END  
  

GO







IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getListofEventsandTasks' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].reports_getListofEventsandTasks
END
GO

CREATE PROCEDURE                                    
  dbo.reports_getListofEventsandTasks                            
  @startDate Datetime,                          
  @endDate Datetime  ,  
  @Customer varchar(50) ='0'                    
                    
  AS                                    
  BEGIN        
      
    
  select c.CUST_NM ,P.PROJ_NM,TP.TITLE AS Type,TC.TITLE as Category,    
  T.DESCRIPTION As [Audit / Assessment Title],   
  [Appraiser Name  / Auditor Name]=(Select TOP 1 E.frst_nm from bas..emp_info E (NOLOCK) WHERE e.EMP_ID=sc.AUDITOR_EMP_ID ),    
  STUFF((select ',' + E.FRST_NM from bas..emp_info E join    
    csp..AUDIT_SCHEDULE_REF auditee on E.EMP_ID = auditee.VALUE AND auditee.[KEY]='AUDITEE_EMP_ID'     
    and auditee.ISACTIVE=1 and auditee.AUDIT_SCHEDULE_ID = sc.ID    
    for xml path ('')),1,1,''    
  )as [Appraisee Name(s) / Auditee Name (s)],    
   T.STATUS,  
 Format(T.SCHEDULED_START_DATE,'yyyy-MM-dd')SCHEDULED_START_DATE ,    
 Format(T.DUE_DATE,'yyyy-MM-dd')DUE_DATE,    
 Format(S.PLANNED_AUDIT_START_DATE,'yyyy-MM-dd')PLANNED_AUDIT_START_DATE,    
 Format(S.PLANNED_AUDIT_END_DATE,'yyyy-MM-dd')PLANNED_AUDIT_END_DATE    
 ,Format(S.ACTUAL_AUDIT_START_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_START_DATE,    
 Format(S.ACTUAL_AUDIT_END_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_END_DATE,S.AUDIT_PLANNED_HOURS   
   
 from csp..TASK T    
 join bas..CUSTOMER c on t.CUST_ID = c.CUST_ID                              
 join bas..PROJECT p on t.PROJ_ID = p.PROJ_ID      
 join     
 csp..TASK_TYPE TP on t.TASK_TYPE_ID = Tp.ID and T.ISACTIVE=1 and tp.ISACTIVE=1    
 join     
 csp..TASK_CATEGORY TC on t.TASK_CATEGORY_ID = TC.id and TC.ISACTIVE=1    
 left join     
 csp..AUDIT_CHECKLIST_EXECUTION_SUMMARY S ON T.ID = S.ASSESSMENT_ID and s.ISACTIVE=1
 LEFT JOIN CSP..AUDIT_SCHEDULE sc ON sc.TASK_ID=T.ID
 where t.DUE_DATE between @startDate and @endDate    and (@customer = '0' or t.CUST_ID = @customer  )  
  order by 1,2,t.Due_date desc --,T.DUE_DATE desc,T.ID desc,T.STATUS                
      
      
 END 