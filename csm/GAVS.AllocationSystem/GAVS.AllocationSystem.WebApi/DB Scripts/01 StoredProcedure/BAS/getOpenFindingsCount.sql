IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOpenFindingsCount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOpenFindingsCount]
END
GO

CREATE Procedure getOpenFindingsCount  
  
@projectIds varchar(max)  
  
As  
Begin  
  
select C.CUST_NM, P.PROJ_NM, COUNT(*) AS OPEN_FINDINGS_COUNT, summ.CUSTOMER_ID, summ.PROJECT_ID  
from AUDIT_CHECKLIST_PROJECT_FINDINGS findings      
INNER JOIN FINDINGSTYPE_VALUES value on findings.finding_type = value.findingtype_value and value.isactive = 1     
and findings.isactive = 1 and findings.issubmitted = 1       
   
INNER JOIN AUDIT_CHECKLIST_EXECUTION_DETAILS exe on findings.audit_id = exe.ASSESSMENT_ID and   
findings.applicable_questions = exe.PM_CHECKLIST_QUESTION_ID and findings.process_id = exe.process_id and   
findings.service_area_id = exe.service_area_id and findings.process_model_id = exe.process_model_id       
and findings.process_area_id = exe.process_area_id and exe.isactive = 1 and exe.issubmitted = 1    
  
INNER JOIN AUDIT_CHECKLIST_EXECUTION_SUMMARY summ on summ.ASSESSMENT_ID = exe.ASSESSMENT_ID      
  
INNER JOIN AUDIT_FINDING_STAGES_MAPPING AFM on AFM.FINDING_ID = findings.ID and AFM.ISACTIVE=1   
  
LEFT JOIN AUDIT_FINDINGS_CAPA capa on findings.id = capa.finding_id and capa.isactive =1 and capa.issubmitted = 1     
  
INNER JOIN PROJECT P on P.PROJ_ID = summ.PROJECT_ID  
  
INNER JOIN CUSTOMER C on C.CUST_ID = summ.CUSTOMER_ID  
  
where summ.Project_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectIds,','))   
and capa.CORRECTIVE_ACTION_PLAN IS NULL and capa.CAP_TARGET_DATE IS NULL  
and AFM.STAGE_ID=1 and AFM.STAGE_STATUS NOT IN ('Auditee Rejected')  
  
GROUP BY C.CUST_NM, P.PROJ_NM,summ.CUSTOMER_ID, summ.PROJECT_ID order by 1       
    
END  
GO
