IF EXISTS(Select 1 from sys.objects where name ='getCheckPointsforProjectNew' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCheckPointsforProjectNew]
END

GO

CREATE PROCEDURE getCheckPointsforProjectNew                                
  @CUSTOMER_ID int,                                  
  @PROJECT_ID varchar(50),                                
  @SERVICE_AREAS  varchar(max)                                  
  AS                                
  BEGIN                                
                                
SELECT DISTINCT 0 AS ID,CONF.CUST_ID,CONF.PROJ_ID, area.id as SERVICE_AREA_ID, AREA.TITLE AS SERVICE_AREA_NAME,       
model.ID as PROCESS_MODEL_ID, model.DESCRIPTION as PROCESS_MODEL_DESCRIPTION,       
PROCESS.id as process_id, PROCESS.TITLE AS PROCESS_DESCRIPTION,             
NULL AS PLANNED_AUDIT_START_DATE,                              
NULL AS PLANNED_AUDIT_END_DATE,NULL AS ACTUAL_AUDIT_START_DATE,                                  
NULL AS ACTUAL_AUDIT_END_DATE,NULL AS AUDIT_PLANNED_HOURS,NULL AS AUDIT_ACTUAL_HOURS,                                  
NULL AS AUDIT_TITLE,NULL AS AUDITOR_NAME,WEIGHT.ID as WEIGHTAGE_ID, weight.WEIGHTAGE_SCORE,      
 WEIGHT.WEIGHTAGE_TITLE,QUES.ID AS APPLICABLE_QUESTIONS,CHK.VERSION AS VERSIONID, QUES.TITLE AS LOOK_FOR,                              
CHK.status_list_id AS CHECKLIST_STATUS_LIST_ID,chk.FINDINGSTYPE_ID,       
chk.TITLE as CHECKLIST_NAME,chk.ID as CHECKLIST_ID, chk.VERSION as VERSIONID,       
chk.CORRECTIVE_ACTION_TRACKING as CORRECTIVE_ACTION_TRACKING,chk.IS_WEIGHTAGE_APPLICABLE ,        
NULL AS STATUS,                         
NULL AS NOTES,NULL AS FINDINGS_ID,NULL AS CREATED_DATE,NULL AS CREATED_BY,NULL AS  UPDATED_DATE,                                  
NULL AS UPDATED_BY,CAST(1 AS bit) AS ISACTIVE, MAPP.display_order, QUES.CHECKLIST_ID, PA.ID as PROCESS_AREA_ID,    
PA.TITLE as PROCESS_AREA_DESCRIPTION    
    
  FROM PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING CONF                                  
INNER JOIN PROCESS PROCESS on PROCESS.ID = CONF.PROCESS_ID AND PROCESS.ISACTIVE = 1                                
INNER JOIN PROCESS_MODEL_PROCESS_MAPPING PRO on PRO.PROCESS_ID = process.ID  AND PRO.ISACTIVE = 1 AND CONF.ISACTIVE = 1                                
INNER JOIN pm_process_questions_mapping MAPP on MAPP.PROCESS_ID = CONF.PROCESS_ID  and       
MAPP.SERVICE_AREA_ID = CONF.SERVICE_AREA_ID AND MAPP.ISACTIVE = 1                           
INNER JOIN PM_CHECKLIST_QUESTIONS QUES ON QUES.ID = MAPP.question_id AND QUES.ISACTIVE = 1                                
INNER JOIN PM_CHECKLIST CHK ON CHK.ID = QUES.CHECKLIST_ID AND CHK.ISACTIVE = 1                             
INNER JOIN PROCESS_SERVICE_AREA_NEW AREA on AREA.ID = CONF.SERVICE_AREA_ID  AND AREA.ISACTIVE = 1                         
AND (@SERVICE_AREAS = '' or (AREA.ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@SERVICE_AREAS,','))))                               
INNER JOIN PROCESS_MODEL MODEL on MODEL.ID = CONF.PROCESS_MODEL_ID  AND MODEL.ISACTIVE =1    
INNER JOIN PROCESS_AREA PA on PA.ID = MAPP.PROCESS_AREA_ID and PA.ISACTIVE = 1              
left JOIN AUDIT_CHECKLIST_WEIGHTAGE WEIGHT on WEIGHT.ID = QUES.WEIGHTAGE_ID                                 
where CONF.PROJ_ID = @PROJECT_ID and CONF.CUST_ID = @CUSTOMER_ID                                
order by QUES.CHECKLIST_ID, AREA.ID, PROCESS.ID, MAPP.display_order asc                              
                             
END 

GO

update AUDIT_CHECKLIST_PROJECT_EXECUTION
set process_area_id = mapp.PROCESS_AREA_ID
from AUDIT_CHECKLIST_PROJECT_EXECUTION exe
inner join pm_process_questions_mapping mapp 
on exe.APPLICABLE_QUESTIONS = mapp.question_id and exe.SERVICE_AREA_ID = mapp.SERVICE_AREA_ID
and exe.PROCESS_ID = mapp.process_id and exe.ISACTIVE = 1 and mapp.isactive = 1

GO

update audit_checklist_project_findings
set process_area_id = mapp.PROCESS_AREA_ID
from audit_checklist_project_findings exe
inner join pm_process_questions_mapping mapp 
on exe.APPLICABLE_QUESTIONS = mapp.question_id and exe.SERVICE_AREA_ID = mapp.SERVICE_AREA_ID
and exe.PROCESS_ID = mapp.process_id and exe.ISACTIVE = 1 and mapp.isactive = 1

GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'PROCESS_AREA_ID'
          AND Object_ID = Object_ID('AUDIT_CHECKLIST_PROJECT_EXECUTION'))
BEGIN
   alter table AUDIT_CHECKLIST_PROJECT_EXECUTION
   add PROCESS_AREA_ID int
END

GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'PROCESS_AREA_ID'
          AND Object_ID = Object_ID('audit_checklist_project_findings'))
BEGIN
   alter table audit_checklist_project_findings
   add PROCESS_AREA_ID int
END

GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'PROCESS_AREA_ID'
          AND Object_ID = Object_ID('AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED'))
BEGIN
   alter table AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED
   add PROCESS_AREA_ID int
END

GO