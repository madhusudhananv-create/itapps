IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getMaturityLevelForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMaturityLevelForProjects]
END
GO

CREATE PROCEDURE [dbo].[reports_getMaturityLevelForProjects]              
  
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
               
from cte  order by [Customer name], [Project Name]      
END
GO

