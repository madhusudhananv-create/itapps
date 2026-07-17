IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getAllAssessmentFindings' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getAllAssessmentFindings]
END
GO

CREATE procedure [dbo].[reports_getAllAssessmentFindings]  
@startDate Datetime,  
@endDate Datetime,  
@customerid varchar(50)='0'  

AS  
BEGIN  

select  c.CUST_NM , p.PROJ_NM,  
AUDIT_TITLE [Assessment title],      Convert(varchar,PLANNED_AUDIT_START_DATE ,107) [Planned Start Date],  
Convert(varchar,Actual_audit_start_date,107) [Actual Start Date],  
Convert(varchar,Actual_audit_end_date,107) [Actual End Date],  
dtls.SCORE, ((dtls.SCORE / dtls.MAX_SCORE)*100) as PERCENTAGE_SCORE, dtls.UPDATED_SCORE as CURRENT_SCORE, 
((dtls.UPDATED_SCORE / dtls.MAX_SCORE)*100) as CURRENT_PERCENTAGE_SCORE,
Convert(varchar,find.created_date,107)    as created_date ,  
(select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,  
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,  
MODEL.TITLE  [Process Model],  
(select title from process_service_area_new where id = finding.service_area_id) [Service Area],  
(select title from Process_area where id = finding.process_area_id) [Process Area],  
PR.TITLE [Process Title],PR.DESCRIPTION [Process Description],  
PR.CLAUSE_REFERENCE [ISO/Process Model Clause Reference], PR.CONTROL_REFERENCE [ISO/Process Model Control Reference],  
PCQ.TITLE as QUESTION_TITLE, finding.finding_type, finding.finding_description,  
(select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_ID from AUDIT_CHECKLIST_EXECUTION_SUMMARY WHERE assessment_ID = t.id and ISACTIVE = 1)) [Auditor],  
t.DESCRIPTION, t.STATUS,    ACCEPT.status [FINDING_ACCEPTANCE_STATUS],  
(case when Stage.ISCOMPLETE=1 then 'Closed'  
when Stage.ISCOMPLETE=0 then 'Open'  
END) [FINDING_STATUS],  
(SELECT TOP 1 ROOT_CAUSE FROM AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],  
(SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM AUDIT_FINDINGS_CAPA WHERE FINDING_ID = finding.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN],  
c.CUST_ID , p.PROJ_ID, t.ID as AssessmentID, finding.ID as [Finding_ID]  
from TASK t  
inner join CUSTOMER c on t.CUST_ID = c.CUST_ID  
inner join PROJECT p on t.PROJ_ID = p.PROJ_ID  
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY find on t.id = find.assessment_ID and find.ISACTIVE = 1  and find.ISSUBMITTED =1  
inner join PM_CHECKLIST CHK ON find.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1  
inner join PM_CHECKLIST_QUESTIONS qus on find.CHECKLIST_ID=qus.CHECKLIST_ID and qus.ISACTIVE=1    
inner join AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on find.ASSESSMENT_ID=dtls.ASSESSMENT_ID and qus.ID=dtls.PM_CHECKLIST_QUESTION_ID and dtls.ISACTIVE=1    
left join AUDIT_CHECKLIST_PROJECT_FINDINGS finding on finding.AUDIT_ID = t.ID and finding.ISACTIVE =1  and finding.ISSUBMITTED =1  
inner join PM_CHECKLIST_QUESTIONS PCQ on PCQ.ID = finding.APPLICABLE_QUESTIONS and PCQ.ISACTIVE=1  
LEFT join PROCESS_MODEL MODEL ON finding.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1  
LEFT join AUDITEE_ACCEPTANCE ACCEPT ON finding.ID = ACCEPT.finding_id  
LEFT join AUDIT_FINDING_STAGES_MAPPING Stage on finding.ID=Stage.FINDING_ID and Stage.STAGE_ID=4 and Stage.ISACTIVE=1  
LEFT JOIN Process PR ON PR.ID= finding.PROCESS_ID  
WHERE t.DUE_DATE between @startDate and @endDate and dtls.MAX_SCORE != 0 and dtls.MAX_SCORE IS NOT NULL and
(@customerid='0' or  c.CUst_id = @customerid)  and t.ISACTIVE=1  
ORDER by  c.CUST_NM, p.PROJ_NM,   [PLANNED_AUDIT_START_DATE], [Assessment title]  
END
GO

