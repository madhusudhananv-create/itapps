IF NOT EXISTS(Select 1 from sys.tables where name ='AUDIT_CHECKLIST_EXECUTION_SUMMARY' AND type='U')
BEGIN
 create table AUDIT_CHECKLIST_EXECUTION_SUMMARY
(
	ID INT not null identity(1, 1),
	ASSESSMENT_ID int not null,
	CUSTOMER_ID INT not null,
	PROJECT_ID VARCHAR(255) not null,
	CHECKLIST_ID INT not null,
	PLANNED_AUDIT_START_DATE DATETIME,
	PLANNED_AUDIT_END_DATE DATETIME,
	ACTUAL_AUDIT_START_DATE DATETIME,
	ACTUAL_AUDIT_END_DATE DATETIME,
	AUDIT_PLANNED_HOURS INT,
	AUDIT_ACTUAL_HOURS INT,
	AUDIT_TITLE VARCHAR(MAX) not null,
	SCORE DECIMAL(5,2),
	PERCENTAGE_SCORE DECIMAL(5, 2),
	AUDITOR_ID INT  null,
	VERSION_ID DECIMAL(5,2) null,
	MAIL_SENT BIT,
	MATURITY_LEVEL_ID INT null,
	CREATED_DATE DATETIME,
	CREATED_BY INT,
	UPDATED_DATE DATETIME,
	UPDATED_BY INT,
	ISACTIVE BIT,
	ISSUBMITTED BIT
)

END

GO


IF NOT EXISTS(Select 1 from sys.tables where name ='AUDIT_CHECKLIST_EXECUTION_DETAILS' AND type='U')
BEGIN
CREATE TABLE AUDIT_CHECKLIST_EXECUTION_DETAILS
(
	ID INT NOT NULL IDENTITY(1,1),
	ASSESSMENT_ID INT not null,
	PM_CHECKLIST_QUESTION_ID INT NOT NULL, 
	STATUS_VALUE_ID INT,
	NOTES VARCHAR(MAX),
	SERVICE_AREA_ID INT,
	PROCESS_MODEL_ID INT,
	PROCESS_AREA_ID INT,
	PROCESS_ID INT,
	STATUS_CATEGORY VARCHAR(200),
	SCORE DECIMAL(5,2),
	UPDATED_SCORE DECIMAL(5, 2),
	MAX_SCORE DECIMAL(5,2),
	ISSUBMITTED BIT,
	CREATED_DATE DATETIME,
	CREATED_BY INT,
	UPDATED_DATE DATETIME,
	UPDATED_BY INT,
	ISACTIVE BIT,
	STATUS VARCHAR(500) NULL
)
END

GO

  
IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsForCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsForCustomer]
END
GO
Create PROCEDURE getAllFindingsForCustomer        
  @custid int,        
  @startdate datetime,        
  @enddate datetime        
  as          
  begin        
  with cte1 as        
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE,      
     
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
   inner join BAS..CUSTOMER C ON C.CUST_ID = exe.CUSTOMER_ID and c.CUST_ID = @custid   
   INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID      
   left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1          
   left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1  
         
   where find.issubmitted = 1 and find.ISACTIVE = 1     
   and  find.CREATED_DATE >= @startdate and  find.CREATED_DATE <= @enddate    
  )      
      
 select *, stage.STAGE_DESCRIPTION from cte1      
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID      
 order by cte1.ID      
  end  
  GO


IF EXISTS(Select 1 from sys.procedures where name ='getCheckPointsforProjectNew' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCheckPointsforProjectNew]
END
GO
Create PROCEDURE getCheckPointsforProjectNew                                      
  @CUSTOMER_ID int,                                        
  @PROJECT_ID varchar(50),                                      
  @SERVICE_AREAS  varchar(max)                                        
  AS                                      
  BEGIN                                      
                                      
SELECT DISTINCT CONF.CUST_ID AS 'CUSTOMER_ID',CONF.PROJ_ID as 'PROJECT_ID',   
area.id as SERVICE_AREA_ID, AREA.TITLE AS SERVICE_AREA_NAME,             
model.ID as PROCESS_MODEL_ID, model.DESCRIPTION as PROCESS_MODEL_DESCRIPTION,             
PROCESS.id as process_id, PROCESS.TITLE AS PROCESS_DESCRIPTION,WEIGHT.ID as WEIGHTAGE_ID, weight.WEIGHTAGE_SCORE,            
 WEIGHT.WEIGHTAGE_TITLE,QUES.ID AS PM_CHECKLIST_QUESTION_ID ,CHK.VERSION AS VERSION_ID, QUES.TITLE AS 'LOOK_FOR',                                    
CHK.status_list_id AS 'STATUS_LIST_ID' ,chk.FINDINGSTYPE_ID,             
chk.TITLE as CHECKLIST_NAME,chk.ID as CHECKLIST_ID, chk.VERSION as VERSION_ID,             
chk.CORRECTIVE_ACTION_TRACKING as CORRECTIVE_ACTION_TRACKING,chk.IS_WEIGHTAGE_APPLICABLE ,chk.MATURITY_LEVEL,chk.process_model_id AS 'MAPPED_PROCESS_MODEL', MAPP.display_order, QUES.CHECKLIST_ID, PA.ID as PROCESS_AREA_ID,          
PA.TITLE as PROCESS_AREA_DESCRIPTION          
          
  FROM PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING CONF                                        
INNER JOIN PROCESS PROCESS on PROCESS.ID = CONF.PROCESS_ID AND PROCESS.ISACTIVE = 1                                      
INNER JOIN PROCESS_MODEL_PROCESS_MAPPING PRO on PRO.PROCESS_ID = process.ID  AND PRO.ISACTIVE = 1 AND CONF.ISACTIVE = 1                                      
INNER JOIN pm_process_questions_mapping MAPP on MAPP.PROCESS_ID = CONF.PROCESS_ID  and   MAPP.SERVICE_AREA_ID = CONF.SERVICE_AREA_ID AND MAPP.ISACTIVE = 1                                       
INNER JOIN PM_CHECKLIST_QUESTIONS QUES ON QUES.ID = MAPP.question_id AND QUES.ISACTIVE = 1                                      
INNER JOIN PM_CHECKLIST CHK ON CHK.ID = QUES.CHECKLIST_ID AND CHK.ISACTIVE = 1 and CHK.EFFECTIVE_FROM <= GETDATE()                                  
INNER JOIN PROCESS_SERVICE_AREA_NEW AREA on AREA.ID = CONF.SERVICE_AREA_ID  AND AREA.ISACTIVE = 1                               
AND (@SERVICE_AREAS = '' or (AREA.ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@SERVICE_AREAS,','))))                                     
INNER JOIN PROCESS_MODEL MODEL on MODEL.ID = CONF.PROCESS_MODEL_ID  AND MODEL.ISACTIVE =1          
INNER JOIN PROCESS_AREA PA on PA.ID = MAPP.PROCESS_AREA_ID and PA.ISACTIVE = 1                    
left JOIN AUDIT_CHECKLIST_WEIGHTAGE WEIGHT on WEIGHT.ID = QUES.WEIGHTAGE_ID                                       
where CONF.PROJ_ID = @PROJECT_ID and CONF.CUST_ID = @CUSTOMER_ID                                      
order by QUES.CHECKLIST_ID, AREA.ID, PROCESS.ID, MAPP.display_order asc                                    
                                   
END

GO

IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsByTypeforCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsByTypeforCustomer]
END
GO
CREATE procedure           
  getAllFindingsByTypeforCustomer          
  as           
  begin          
           
     select find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, SUMMARY.CUSTOMER_ID, SUMMARY.PROJECT_ID, find.created_date      
    from AUDIT_CHECKLIST_PROJECT_FINDINGS find          
  inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY SUMMARY on find.AUDIT_ID = SUMMARY.ASSESSMENT_ID  and find.ISACTIVE = 1 
  and find.issubmitted = 1 and SUMMARY.ISACTIVE = 1      
  where not exists (select top 1* from AUDIT_FINDING_STAGES_MAPPING where FINDING_ID = find.ID and ISACTIVE = 1 and ISCOMPLETE = 1 and  
  stage_id = (select top 1 id from AUDIT_FINDING_STAGES order by id desc))             
            
  end 
GO


IF EXISTS(Select 1 from sys.procedures where name ='getFindingsForAuditWithStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getFindingsForAuditWithStatus]
END
GO
CREATE procedure getFindingsForAuditWithStatus    
  @audit_id int,    
  @question_id int    
  as    
  begin    
   select find.*, exe.STATUS_CATEGORY, value.FINDINGTYPE_CATEGORY, accept.status ,     
   (select top 1 ISCOMPLETE from AUDIT_FINDING_STAGES_MAPPING where finding_id = find.ID and isactive  = 1 order by STAGE_ID desc) AS ISCOMPLETE    
   from AUDIT_CHECKLIST_PROJECT_FINDINGS find     
   inner join AUDIT_CHECKLIST_EXECUTION_DETAILS exe    
   on  find.AUDIT_ID = exe.ASSESSMENT_ID and find.SERVICE_AREA_ID = exe.SERVICE_AREA_ID  and find.APPLICABLE_QUESTIONS = exe.PM_CHECKLIST_QUESTION_ID    
   and find.PROCESS_AREA_ID = exe.PROCESS_AREA_ID and find.process_model_id = exe.process_model_id and find.PROCESS_ID = exe.PROCESS_ID    
   inner join FINDINGSTYPE_VALUES value on find.FINDING_TYPE = value.FINDINGTYPE_VALUE and value.isactive = 1    
  left join AUDITEE_ACCEPTANCE accept on find.ID = accept.finding_id and accept.isactive = 1 and accept.ISSUBMITTED = 1    
   where find.ISACTIVE = 1 and find.issubmitted = 1 and exe.ISACTIVE = 1 and exe.ISSUBMITTED = 1 and find.AUDIT_ID = @audit_id     
   and (@question_id = -1 or find.APPLICABLE_QUESTIONS = @question_id) and exe.STATUS_CATEGORY = 'NMET'     
  end 
  GO

  
IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsByTimeforCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsByTimeforCustomer]
END
GO
Create procedure       
  getAllFindingsByTimeforCustomer      
  As begin      
      
  with cte1 as      
  (      
  select accept.finding_id, findings.FINDING_TYPE, findings.FINDING_DESCRIPTION, accept.status, accept.remarks, mapp.STAGE_ID, stage.STAGE_DESCRIPTION, mapp.STAGE_STATUS,       
  accept.created_date, exe.customer_id, exe.project_id,      
  ROW_NUMBER() OVER (PARTITION BY mapp.finding_id order by mapp.stage_id) as rn1 from AUDITEE_ACCEPTANCE accept      
  inner join AUDIT_FINDING_STAGES_MAPPING mapp on accept.finding_id = mapp.FINDING_ID and mapp.ISCOMPLETE = 0 and mapp.ISACTIVE = 1      
        
  and  accept.isactive = 1 and Month(accept.created_date) = Month(GETDATE()) and YEAR(accept.created_date) = YEAR(GETDATE())      
  inner join AUDIT_CHECKLIST_PROJECT_FINDINGS findings on findings.ID = mapp.FINDING_ID and findings.ISACTIVE = 1      
  inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY exe on exe.ASSESSMENT_ID = findings.AUDIT_ID      
  inner join AUDIT_FINDING_STAGES stage on stage.ID = mapp.STAGE_ID and stage.ISACTIVE = 1    
  )      
      
  select *,      
  case when status = 'Reject' then 'Reject'      
    when DATEDIFF(week, created_date, GETDATE()) <= 1 then 'week1'      
    when DATEDIFF(week, created_date, GETDATE()) = 2 then 'week2'       
    when DATEDIFF(week, created_date, GETDATE()) = 3 then 'week3'      
    when DATEDIFF(week, created_date, GETDATE()) >= 4 then 'week4'      
 end as WeekStatus      
        
   from cte1 where rn1= 1      
  order by WeekStatus      
      
  end 
  GO


   
IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsForCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsForCustomer]
END
GO
Create PROCEDURE getAllFindingsForCustomer      
  @custid int,      
  @startdate datetime,      
  @enddate datetime      
  as        
  begin      
  with cte1 as      
  (SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE,    
   
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
	INNER JOIN BAS..PROJECT P ON P.PROJ_ID = exe.PROJECT_ID    
	left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1        
	left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1
	      
   where find.issubmitted = 1 and find.ISACTIVE = 1   
   and  find.CREATED_DATE >= @startdate and  find.CREATED_DATE <= @enddate  
  )    
    
 select *, stage.STAGE_DESCRIPTION from cte1    
 inner join AUDIT_FINDING_STAGES stage on cte1.STAGE_ID = stage.ID    
 order by cte1.ID    
  end 

GO

   
IF EXISTS(Select 1 from sys.procedures where name ='usp_getMandatoryAuditStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_getMandatoryAuditStatus]
END
GO

CREATE PROCEDURE [dbo].[usp_getMandatoryAuditStatus]              
@PROJECT_ID varchar(15),              
@START_DATE datetime,              
@END_DATE datetime              
AS              
BEGIN   
  
  select summ.CUSTOMER_ID, summ.PROJECT_ID, findings.id, findings.finding_description, value.findingtype_category, capa.CORRECTIVE_ACTION_PLAN, capa.CAP_TARGET_DATE, veri.updated_date as 'CAP_CLOSED_DATE'   into #openfindings   
  from audit_checklist_project_findings findings  
   inner join FINDINGSTYPE_VALUES value on findings.finding_type = value.findingtype_value and value.isactive = 1   and findings.isactive = 1 and findings.issubmitted = 1   
 
  inner join AUDIT_CHECKLIST_EXECUTION_DETAILS exe on findings.audit_id = exe.ASSESSMENT_ID and findings.applicable_questions = exe.PM_CHECKLIST_QUESTION_ID   
  and findings.process_id = exe.process_id and findings.service_area_id = exe.service_area_id and findings.process_model_id = exe.process_model_id   
  and findings.process_area_id = exe.process_area_id and exe.isactive = 1 and exe.issubmitted = 1
   inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY summ on summ.ASSESSMENT_ID = exe.ASSESSMENT_ID  
   left join audit_findings_capa capa on findings.id = capa.finding_id and 
  capa.isactive =1 and capa.issubmitted = 1   left join AUDIT_FINDING_CAPA_VERIFICATION veri on 
  capa.finding_id = veri.finding_id and veri.isverified = 1 and veri.isactive =1   where value.findingtype_category = 'MANDATORY' 
  and summ.Project_id = @PROJECT_ID   order by veri.updated_date    

declare @correctiveActionAvailable bit   declare @targetDateAvailable bit   declare @closedDateAvailable bit    if not exists(select * from #openfindings where CORRECTIVE_ACTION_PLAN is null)    set @correctiveActionAvailable = 1;    if not exists(select 1 from #openfindings where CAP_TARGET_DATE is null )    
set @targetDateAvailable =1;    if not exists(select 1 from #openfindings where CAP_TARGET_DATE <GETDATE() and CAP_CLOSED_DATE is null)   
 set @closedDateAvailable =1;  if(@correctiveActionAvailable =1 and @targetDateAvailable =1 and @closedDateAvailable =1)  Select 'GREEN' else if ( 1=2) --todo add condition for no audit conducted last 3 months  
select 'RED' else select 'AMBER' END
GO

IF not exists(SELECT 1 FROM AUDIT_CHECKLIST_EXECUTION_DETAILS )
BEGIN
INSERT INTO AUDIT_CHECKLIST_EXECUTION_DETAILS ([ASSESSMENT_ID],
	[PM_CHECKLIST_QUESTION_ID] ,
	[NOTES],
	[SERVICE_AREA_ID],
	[PROCESS_MODEL_ID] ,
	[PROCESS_AREA_ID] ,
	[PROCESS_ID],
	[STATUS_CATEGORY] ,
	[SCORE] ,
	[UPDATED_SCORE] ,
	[MAX_SCORE] ,
	[ISSUBMITTED] ,
	[CREATED_DATE],
	[CREATED_BY] ,
	[UPDATED_DATE],
	[UPDATED_BY],
	[ISACTIVE],
	[STATUS]) 
SELECT AUDIT_ID, APPLICABLE_QUESTIONS , NOTES, SERVICE_AREA_ID, process_model_id, PROCESS_AREA_ID, PROCESS_ID,
CURRENT_STATUS, SCORE, UPDATED_SCORE, MAX_SCORE, ISSUBMITTED, CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY, ISACTIVE, STATUS
FROM AUDIT_CHECKLIST_PROJECT_EXECUTION
END
GO

UPDATE AUDIT_CHECKLIST_EXECUTION_DETAILS
SET STATUS_VALUE_ID = (
	SELECT top 1 list.ID FROM AUDIT_CHECKLIST_STATUS_LIST_VALUES LIST
	INNER JOIN PM_CHECKLIST CHK ON LIST.STATUS_LIST_ID = CHK.STATUS_LIST_ID
	INNER JOIN PM_CHECKLIST_QUESTIONS QUES ON QUES.CHECKLIST_ID = CHK.ID
	INNER JOIN AUDIT_CHECKLIST_EXECUTION_DETAILS DETAILS ON DETAILS.PM_CHECKLIST_QUESTION_ID = QUES.ID
	WHERE DETAILS.PM_CHECKLIST_QUESTION_ID = AUDIT_CHECKLIST_EXECUTION_DETAILS.PM_CHECKLIST_QUESTION_ID AND LIST.STATUS_LIST_VALUE = AUDIT_CHECKLIST_EXECUTION_DETAILS.status
)
GO



IF not exists(SELECT 1 FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY )
BEGIN
INSERT INTO AUDIT_CHECKLIST_EXECUTION_SUMMARY (
       [ASSESSMENT_ID]
      ,[CUSTOMER_ID]
      ,[PROJECT_ID]
      ,[PLANNED_AUDIT_START_DATE]
      ,[PLANNED_AUDIT_END_DATE]
      ,[ACTUAL_AUDIT_START_DATE]
      ,[ACTUAL_AUDIT_END_DATE]
      ,[AUDIT_PLANNED_HOURS]
      ,[AUDIT_ACTUAL_HOURS]
      ,[AUDIT_TITLE]
      ,[AUDITOR_ID]
      ,[VERSION_ID]
      ,[CREATED_DATE]
      ,[CREATED_BY]
      ,[UPDATED_DATE]
      ,[UPDATED_BY]
      ,[ISACTIVE]
      ,[ISSUBMITTED]
      ,[CHECKLIST_ID])

SELECT AUDIT_ID, CUSTOMER_ID, PROJECT_ID, PLANNED_AUDIT_START_DATE, PLANNED_AUDIT_END_DATE, ACTUAL_AUDIT_START_DATE,
ACTUAL_AUDIT_END_DATE, AUDIT_PLANNED_HOURS, AUDIT_ACTUAL_HOURS, AUDIT_TITLE, AUDITOR_NAME, VERSIONID, CREATED_DATE, CREATED_BY,
UPDATED_DATE, UPDATED_BY, ISACTIVE, ISSUBMITTED, 1

 FROM AUDIT_CHECKLIST_PROJECT_EXECUTION
 END
GO

IF not exists(SELECT 1 FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY )
BEGIN
INSERT INTO AUDIT_CHECKLIST_EXECUTION_SUMMARY (
       [ASSESSMENT_ID]
      ,[CUSTOMER_ID]
      ,[PROJECT_ID]
      ,[PLANNED_AUDIT_START_DATE]
      ,[PLANNED_AUDIT_END_DATE]
      ,[ACTUAL_AUDIT_START_DATE]
      ,[ACTUAL_AUDIT_END_DATE]
      ,[AUDIT_PLANNED_HOURS]
      ,[AUDIT_ACTUAL_HOURS]
      ,[AUDIT_TITLE]
      ,[AUDITOR_ID]
      ,[VERSION_ID]
      ,[CREATED_DATE]
      ,[CREATED_BY]
      ,[UPDATED_DATE]
      ,[UPDATED_BY]
      ,[ISACTIVE]
      ,[ISSUBMITTED]
	  ,[CHECKLIST_ID]
	  )
SELECT EXE.AUDIT_ID, CUSTOMER_ID, PROJECT_ID, PLANNED_AUDIT_START_DATE, PLANNED_AUDIT_END_DATE,
ACTUAL_AUDIT_START_DATE, ACTUAL_AUDIT_END_DATE, AUDIT_PLANNED_HOURS, AUDIT_ACTUAL_HOURS, AUDIT_TITLE,
AUDITOR_NAME, VERSIONID, CREATED_DATE, CREATED_BY, UPDATED_DATE, UPDATED_BY,
ISACTIVE, ISSUBMITTED, 1
 FROM AUDIT_CHECKLIST_PROJECT_EXECUTION EXE
INNER JOIN
(
	SELECT AUDIT_ID, MAX(ID) AS 'MAX_ID' FROM AUDIT_CHECKLIST_PROJECT_EXECUTION
	GROUP BY AUDIT_ID
) AS TABLE1 ON EXE.ID = TABLE1.MAX_ID
 END
GO



UPDATE AUDIT_CHECKLIST_EXECUTION_SUMMARY
 SET CHECKLIST_ID = AUDIT.CHECKLIST_ID,
 MAIL_SENT = AUDIT.MAIL_SENT,
 SCORE = AUDIT.SCORE,
 PERCENTAGE_SCORE = AUDIT.PERCENTAGE_SCORE
 FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY SUMM
 INNER JOIN CHECKLIST_SCORES_BY_AUDIT AUDIT ON SUMM.ASSESSMENT_ID = AUDIT.AUDIT_ID
 GO

 update AUDIT_CHECKLIST_EXECUTION_DETAILS 
 set MAX_SCORE = 0
 where MAX_SCORE is null
GO

 update AUDIT_CHECKLIST_EXECUTION_DETAILS 
 set MAX_SCORE = 0
 where MAX_SCORE is null
 GO

  update AUDIT_CHECKLIST_EXECUTION_DETAILS 
 set STATUS_VALUE_ID = 0
 where STATUS_VALUE_ID is null

 GO

IF EXISTS(Select 1 from sys.procedures where name ='reports_getMaturityLevelForProjects' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMaturityLevelForProjects]
END
GO

CREATE PROCEDURE        
  reports_getMaturityLevelForProjects        
  AS        
  BEGIN        
 with cte  as        
 (        
  select c.CUST_ID , c.CUST_NM , p.PROJ_ID, p.PROJ_NM,         
  MODEL.ID  [Process Model Id], MODEL.TITLE  [Process Model], SCORE.SCORE, SCORE.PERCENTAGE_SCORE, score.created_date,         
  (select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],         
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,        
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,         
  t.id, t.DESCRIPTION, t.STATUS        
   from CSP..TASK t        
 inner join         
 (        
  select PROJ_ID , MAX(ID) as 'TASK_ID' from CSP..TASK        
  where TASK_CATEGORY_ID = 11 and  STATUS in ('IN PROGRESS','COMPLETED') and ISACTIVE = 1        
  group by PROJ_ID        
 ) AS TASK2 on t.ID = TASK2.TASK_ID        
 inner join CUSTOMER c on t.CUST_ID = c.CUST_ID        
 inner join PROJECT p on t.PROJ_ID = p.PROJ_ID        
 inner join CSP..CHECKLIST_SCORES_BY_AUDIT score on t.ID = score.AUDIT_ID and score.ISACTIVE = 1        
 inner join CSP..PM_CHECKLIST CHK ON SCORE.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1        
 inner join CSP..PROCESS_MODEL MODEL ON CHK.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1        
 group by c.CUST_ID, c.CUST_NM, p.PROJ_ID, p.PROJ_NM, MODEL.ID , MODEL.TITLE, score.SCORE, SCORE.PERCENTAGE_SCORE, score.CREATED_DATE,  
  p.Quality_Spoc, p.PROJ_PM_EMP_ID, p.PROJ_DM_EMP_ID,        
  t.id, t.DESCRIPTION, t.STATUS        
 )        
        
 select CUST_ID [Customer Id], CUST_NM [Customer Name], PROJ_ID [Project Id], PROJ_NM [Project Name], PM, CSM, [Process Model],   
 CONVERT(VARCHAR(10), CREATED_DATE, 111) [Submitted Date],    
 SCORE [Score],PERCENTAGE_SCORE [Percentage Score],        
    case  when [Process Model Id] = 11 then      
 (case     when PERCENTAGE_SCORE >= 0 and PERCENTAGE_SCORE <= 24  THEN 'Level0 - Impeded'        
              when PERCENTAGE_SCORE >= 25 and PERCENTAGE_SCORE <= 49 THEN 'Level1 - In Transition'        
              when PERCENTAGE_SCORE >= 50 and PERCENTAGE_SCORE <= 74 THEN 'Level2 - Sustainable'        
              when PERCENTAGE_SCORE >= 75 and PERCENTAGE_SCORE <= 94 THEN 'Level3 - Agile'        
              when PERCENTAGE_SCORE >= 95 and PERCENTAGE_SCORE <= 100 THEN 'Level4 - Ideal'end)        
    when [Process Model Id] = 12 THEN (case   when PERCENTAGE_SCORE >= 0 and PERCENTAGE_SCORE <= 10 THEN '0-Survival'        
              when PERCENTAGE_SCORE >= 11 and PERCENTAGE_SCORE <= 30 THEN '1-Awareness'        
              when PERCENTAGE_SCORE >= 31 and PERCENTAGE_SCORE <= 50 THEN '2-Committed'        
              when PERCENTAGE_SCORE >= 51 and PERCENTAGE_SCORE <= 70 THEN '3-Proactive'        
              when PERCENTAGE_SCORE >= 71 and PERCENTAGE_SCORE <= 90 THEN '4-Service Aligned'        
              else  '5-Business Partnership' end)        
    ELSE '' END AS 'Maturity Level', [Quality Spoc]  ,      
 --new      
 --[Audit Date] = (select ),      
 Strength = (select count(*) from CSP..AUDIT_CHECKLIST_PROJECT_FINDINGS 
				where FINDING_TYPE = 'Strength' and AUDIT_ID = cte.id AND ISACTIVE = 1 AND issubmitted = 1),       
 Weakness= (select COUNT(*)
		 from CSP..AUDIT_CHECKLIST_PROJECT_FINDINGS FIND 
		 where FINDING_TYPE = 'Weakness' and AUDIT_ID = CTE.ID AND ISACTIVE = 1 AND issubmitted = 1
		 AND NOT EXISTS(SELECT TOP 1 ID FROM CSP..AUDIT_FINDING_STAGES_MAPPING WHERE ISCOMPLETE = 1
		AND ISACTIVE = 1 AND FINDING_ID = FIND.ID AND STAGE_ID = 4)),      
      Opportunity = (select COUNT(*)
	   from CSP..AUDIT_CHECKLIST_PROJECT_FINDINGS FIND where FINDING_TYPE = 'Opportunity' and AUDIT_ID = CTE.ID AND ISACTIVE = 1 AND issubmitted = 1
	   AND NOT EXISTS(SELECT TOP 1 ID FROM CSP..AUDIT_FINDING_STAGES_MAPPING WHERE ISCOMPLETE = 1
		AND ISACTIVE = 1 AND FINDING_ID = FIND.ID AND STAGE_ID = 4) ),      
   Threat = (select COUNT(*)
		 from CSP..AUDIT_CHECKLIST_PROJECT_FINDINGS FIND where FINDING_TYPE = 'Threat' and AUDIT_ID = CTE.ID AND ISACTIVE = 1 AND issubmitted = 1
		 AND NOT EXISTS (SELECT TOP 1 ID FROM CSP..AUDIT_FINDING_STAGES_MAPPING WHERE ISCOMPLETE = 1
		AND ISACTIVE = 1 AND FINDING_ID = FIND.ID AND STAGE_ID = 4))      
         
 from cte        
  END

  GO

IF EXISTS(Select 1 from sys.procedures where name ='reports_getMaturityLevelAssessmentFindings' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMaturityLevelAssessmentFindings]
END

GO

CREATE PROCEDURE        
  reports_getMaturityLevelAssessmentFindings        
  AS        
  BEGIN        
 with cte  as        
 (        
  select c.CUST_ID , c.CUST_NM , p.PROJ_ID, p.PROJ_NM,         
  MODEL.ID  [Process Model Id], MODEL.TITLE  [Process Model], SCORE.SCORE, SCORE.PERCENTAGE_SCORE, score.created_date,         
  (select top 1 frst_nm from emp_info where emp_id = p.quality_spoc) [Quality Spoc],         
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PM,        
  (select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,   
  (select top 1 PLANNED_AUDIT_START_DATE from CSP..AUDIT_CHECKLIST_PROJECT_EXECUTION WHERE AUDIT_ID = t.id and ISACTIVE = 1) [PLANNED_AUDIT_START_DATE] ,   
  (select top 1 frst_nm from EMP_INFO where EMP_ID = (select top 1 AUDITOR_NAME from CSP..AUDIT_CHECKLIST_PROJECT_EXECUTION WHERE AUDIT_ID = t.id and ISACTIVE = 1)) [Auditor],
  t.id, t.DESCRIPTION, t.STATUS, find.FINDING_TYPE, find.FINDING_DESCRIPTION, ACCEPT.status [FINDING_ACCEPTANCE_STATUS]  ,
  (CASE WHEN EXISTS(SELECT TOP 1 ID FROM CSP..AUDIT_FINDING_STAGES_MAPPING  WHERE FINDING_ID = FIND.ID AND ISACTIVE = 1 AND STAGE_ID = 4 AND ISCOMPLETE = 1) THEN 'Closed'
		ELSE 'Open' END) [FINDING_STATUS],
  (SELECT TOP 1 ROOT_CAUSE FROM CSP..AUDIT_MANAGEMENT_ROOTCAUSES WHERE ID = (SELECT TOP 1 ROOT_CAUSE_ID FROM CSP..AUDIT_FINDINGS_CAPA WHERE FINDING_ID = FIND.ID AND ISROOTCAUSE = 1 AND ISACTIVE= 1))[ROOT_CAUSE],
  (SELECT TOP 1 CORRECTIVE_ACTION_PLAN FROM CSP..AUDIT_FINDINGS_CAPA WHERE FINDING_ID = FIND.ID AND ISACTIVE = 1 AND ISROOTCAUSE = 1 order by created_date desc) [CORRECTIVE_ACTION_PLAN]
   
   from CSP..TASK t        
 inner join         
 (        
  select PROJ_ID , MAX(ID) as 'TASK_ID' from CSP..TASK        
  where TASK_CATEGORY_ID = 11 and  STATUS in ('IN PROGRESS','COMPLETED') and ISACTIVE = 1        
  group by PROJ_ID        
 ) AS TASK2 on t.ID = TASK2.TASK_ID        
 inner join CUSTOMER c on t.CUST_ID = c.CUST_ID        
 inner join PROJECT p on t.PROJ_ID = p.PROJ_ID        
 inner join CSP..CHECKLIST_SCORES_BY_AUDIT score on t.ID = score.AUDIT_ID and score.ISACTIVE = 1        
 inner join CSP..PM_CHECKLIST CHK ON SCORE.CHECKLIST_ID = CHK.ID AND CHK.ISACTIVE = 1        
 inner join CSP..PROCESS_MODEL MODEL ON CHK.PROCESS_MODEL_ID = MODEL.ID AND MODEL.ISACTIVE = 1  
 inner join CSP..AUDIT_CHECKLIST_PROJECT_FINDINGS find on score.AUDIT_ID = find.AUDIT_ID and find.ISACTIVE = 1 
 LEFT join CSP..AUDITEE_ACCEPTANCE ACCEPT ON FIND.ID = ACCEPT.finding_id 
 group by c.CUST_ID, c.CUST_NM, p.PROJ_ID, p.PROJ_NM, MODEL.ID , MODEL.TITLE, score.SCORE, SCORE.PERCENTAGE_SCORE, score.CREATED_DATE,  
  p.Quality_Spoc, p.PROJ_PM_EMP_ID, p.PROJ_DM_EMP_ID,        
  t.id, t.DESCRIPTION, t.STATUS, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.ID , ACCEPT.status       
 )        
        
 select CUST_ID [Customer Id], CUST_NM [Customer Name], PROJ_ID [Project Id], PROJ_NM [Project Name], PM, CSM, [Process Model],   
 CONVERT(VARCHAR(10), CREATED_DATE, 111) [Submitted Date], [PLANNED_AUDIT_START_DATE],  [Auditor],  
 SCORE [Score],PERCENTAGE_SCORE [Percentage Score],   
    case  when [Process Model Id] = 11 then      
 (case     when PERCENTAGE_SCORE >= 0 and PERCENTAGE_SCORE <= 24  THEN 'Level0 - Impeded'        
              when PERCENTAGE_SCORE >= 25 and PERCENTAGE_SCORE <= 49 THEN 'Level1 - In Transition'        
              when PERCENTAGE_SCORE >= 50 and PERCENTAGE_SCORE <= 74 THEN 'Level2 - Sustainable'        
              when PERCENTAGE_SCORE >= 75 and PERCENTAGE_SCORE <= 94 THEN 'Level3 - Agile'        
              when PERCENTAGE_SCORE >= 95 and PERCENTAGE_SCORE <= 100 THEN 'Level4 - Ideal'end)        
    when [Process Model Id] = 12 THEN (case   when PERCENTAGE_SCORE >= 0 and PERCENTAGE_SCORE <= 10 THEN '0-Survival'        
              when PERCENTAGE_SCORE >= 11 and PERCENTAGE_SCORE <= 30 THEN '1-Awareness'        
              when PERCENTAGE_SCORE >= 31 and PERCENTAGE_SCORE <= 50 THEN '2-Committed'        
              when PERCENTAGE_SCORE >= 51 and PERCENTAGE_SCORE <= 70 THEN '3-Proactive'        
              when PERCENTAGE_SCORE >= 71 and PERCENTAGE_SCORE <= 90 THEN '4-Service Aligned'        
              else  '5-Business Partnership' end)        
    ELSE '' END AS 'Maturity Level' , FINDING_TYPE, FINDING_DESCRIPTION, FINDING_STATUS, FINDING_ACCEPTANCE_STATUS, ROOT_CAUSE, CORRECTIVE_ACTION_PLAN
         
 from cte        
  END

  GO