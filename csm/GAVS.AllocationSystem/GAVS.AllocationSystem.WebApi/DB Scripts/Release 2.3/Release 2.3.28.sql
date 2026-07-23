
IF NOT EXISTS (SELECT 1 from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Action Items for Premier')
BEGIN

INSERT INTO REPORTS_SP_DETAILS(SP_NAME,SP_DISPLAY_NAME,DB_NAME)  VALUES
('dbo.getCSSActionitem','CSS Action Items for Premier','BAS') 

END
GO

DECLARE @ReportID INT SET @ReportID=(SELECT @@IDENTITY)

IF NOT EXISTS (SELECT * from REPORTS_PARAMS WHERE REPORT_SP_ID= @ReportID)
BEGIN

INSERT INTO REPORTS_PARAMS VALUES(@ReportID,'StartDate','DATE','2023-07-01')
INSERT INTO REPORTS_PARAMS VALUES(@ReportID,'EndDate','DATE','2023-08-31')

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSActionitem' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSActionitem]
END
GO

CREATE PROCEDURE getCSSActionitem 

@STARTDATE datetime,
@ENDDATE datetime 

AS        

BEGIN     

select C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,E.FRST_NM as PROJECT_MANAGER,CB.EMAIL_ID as CUSTOMER_MAIL,
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE,
PA.DESCRIPTION as ACTION_PLAN_DESCRIPTION,STATUS = (CASE WHEN PA.STATUS = 'Completed' THEN 'Submitted' ELSE 'Not Submitted' END),
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as TARGET_DATE,
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as COMPLETION_DATE,PA.BATCH_CUSTOMER_MONTHLY_ID,PA.PROJECT_ID,PA.CUSTOMER_ID

from PROJECT_ACTIONITEM PA 
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID
inner join CSS_BATCH_CUSTOMER_MONTHLY CB on CB.ID = PA.BATCH_CUSTOMER_MONTHLY_ID
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID

where PA.CUSTOMER_ID = '212100001' and PA.ISACTIVE=1 and CB.ISACTIVE=1 and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc

END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallRisksForRiskDashboard' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallRisksForRiskDashboard]
END
GO

CREATE PROCEDURE [dbo].[getOverallRisksForRiskDashboard]                          
  
@startDate date,  
@endDate date,                
@custIds varchar(max),  
@riskStatus varchar(max),  
@projIds varchar(max)=null,
@businessUnits varchar(max)

AS
BEGIN      
    
Select C.CUST_NM,P.PROJ_NM,PR.DESCRIPTION,PR.IMPACT,PR.PROBABILITY_SCALE,PR.IMPACT_SCALE,  
CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate'   
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END AS RISK_LEVEL,  
PR.OWNER,PR.AREA,PR.IDENTIFIED_BY,PR.IDENTIFIED_DATE,PR.RISK_TREATMENT_STRATEGY,PR.TARGET_DATE,PR.STATUS,  
PR.ACTION_TAKEN,P.BUSINESS_UNIT,C.CUST_ID,P.PROJ_ID,PR.ID  
from     
PROJECT_RISK PR  (NOLOCK)        
inner join PROJECT p (NOLOCK) on PR.PROJECT_ID = P.PROJ_ID  and ISNULL(P.PROJ_STATUS ,'') != 'Close'  
inner join CUSTOMER c  (NOLOCK) on P.CUST_ID = C.CUST_ID  
    
where (PR.IDENTIFIED_DATE between @startDate and @endDate) AND PR.ISACTIVE=1  
AND (@custIds = '-1' OR C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))  
AND (@riskStatus = '-1' OR PR.STATUS in (SELECT * FROM [DBO].[FN_SPLITSTRING](@riskStatus,',')))  
AND (@businessUnits = '-1' OR P.BUSINESS_UNIT in (SELECT * FROM [DBO].[FN_SPLITSTRING](@businessUnits,',')))
AND (ISNULL(@projIds,'-1') = '-1' OR P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,',')))  
order by C.CUST_NM,PR.IDENTIFIED_DATE DESC  
  
END  
Go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllAccounts' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllAccounts]
END
GO

CREATE PROCEDURE  getAllAccounts  
 
AS                                    
BEGIN     
  
  select  '-1' as CUST_ID ,'All' as CUST_NM, 1 as SORT_ORDER      
  union      
  select  '-2' as CUST_ID,'My Accounts' as CUST_NM,2 as SORT_ORDER
  union
  select  '-3' as CUST_ID,'Top 10 Accounts' as CUST_NM,3 as SORT_ORDER      
  union      
  select  '-4' as CUST_ID,'All Accounts Except Top 10 Accounts' as CUST_NM,4 as SORT_ORDER      
  union 
  select  '-5' as CUST_ID,'All GS Lab Accounts' as CUST_NM,5 as SORT_ORDER      
  union      
  select  '-6' as CUST_ID,'GS Lab Key Accounts' as CUST_NM,6 as SORT_ORDER
  
  union      
  select  C.CUST_ID,C.CUST_NM , 7 as SORT_ORDER from CUSTOMER C 
  where c.CUST_ID in (select  distinct P.CUST_ID from PROJECT P where ISNULL(P.PROJ_STATUS,'') != 'Close')        
  order by SORT_ORDER,CUST_NM      

End
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='GSLAB_KEY_ACCOUNTS')
Begin
Insert into CONFIGURATION_EXT values('GSLAB_KEY_ACCOUNTS','CUST0137,CUST0007,CUST0011,CUST0147,CUST0189,CUST0296,CUST0046,CUST0291,CUST0109,CUST0107,CUST0103,
CUST0342,CUST0251,CUST0049,CUST0035,CUST0289','-1',null, null, 0,1,null,null,null,'104859',Getdate(),'104859',Getdate())
END
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='DEVEX_CC_LIST')
Begin
Insert into CONFIGURATION_EXT values('DEVEX_CC_LIST','prachi.divekar@gslab.com,radhika.joshi@gslab.com,geeta.khedekar@gslab.com,vijayraj.chingunde@gslab.com,
Harinamdas.gharami@gavstech.com','-1',null, null, 0,1,null,null,null,'104859',Getdate(),'104859',Getdate())
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='KPI_DETAILS_COMMENT' AND type='U')
BEGIN

CREATE TABLE KPI_DETAILS_COMMENT
(
    ID int IDENTITY(1,1) NOT NULL,
	KPI_DETAILS_ID int NOT NULL,
	COMMENT varchar(max) NOT NULL,
	COMMENT_BY varchar(20) NOT NULL,
	COMMENT_TIMESTAMP Datetime NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]) ON [PRIMARY]

END
GO

Declare  @RESOURCEID int = 102
Declare @EMPID varchar(10) = '104859'
Declare @RescourceName varchar(250) = 'Premier > Send Quality Review Comments'
 
If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end
 
if not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

end

if not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
end
GO



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_SQAReport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_SQAReport]
END
GO

   
Create procedure usp_SQAReport                    
AS                    
BEGIN                   
              
 declare               
 @auditPlannedCurrent int,              
 @auditActualCurrent int,              
 @auditPlannedLastThree int,              
 @auditActualLastThree int,              
 @auditPlannedFinYear int,              
 @auditActualFinYear int,              
              
 @healthCheckPlannedCurrent int,          --Sprint execution / Health Check     
 @healthCheckActualCurrent int,              
 @healthCheckPlannedLastThree int,              
 @healthCheckActualLastThree int,              
 @healthCheckPlannedFinYear int,              
 @healthCheckActualFinYear int,              
              
 @assessmentPlannedCurrent int,         --Sprint Launch     
 @assessmentActualCurrent int,              
 @assessmentPlannedLastThree int,              
 @assessmentActualLastThree int,              
 @assessmentPlannedFinYear int,              
 @assessmentActualFinYear int,              
                          
              
 @releaseAssessmentPlannedCurrent int,           --Sprint release assessment    
 @releaseAssessmentActualCurrent int,              
 @releaseAssessmentPlannedLastThree int,              
 @releaseAssessmentActualLastThree int,              
 @releaseAssessmentPlannedFinyear int,              
 @releaseAssessmentActualFinYear int,              
              

 @transitionAssessmentPlannedCurrent int,       -- Transition Assessment     
 @transitionAssessmentActualCurrent int,              
 @transitionAssessmentPlannedLastThree int,              
 @transitionAssessmentActualLastThree int,              
 @transitionAssessmentPlannedFinYear int,              
 @transitionAssessmentActualFinYear int,              

 @projectClosureAssessmentPlannedCurrent int,      
 @projectClosureAssessmentActualCurrent int,       ----Project Closure Assessment
 @projectClosureAssessmentPlannedLastThree int,    
 @projectClosureAssessmentActualLastThree int,     
 @projectClosureAssessmentPlannedFinYear int,      
 @projectClosureAssessmentActualFinYear int,       
                                                    

 @startupAuditPlannedCurrent int,               --Startup Audit
 @startupAuditPlannedLastThree int,
 @startupAuditPlannedFinYear int,
 @startupAuditActualCurrent int, 
 @startupAuditActualLastThree int, 
 @startupAuditActualFinYear int, 
              
 @assignedToName varchar(100),              
 @CurrentMonthStart DATE,              
 @CurrentMonthEnd DATE,              
 @LastThreeMonthStart DATE,              
 @LastThreeMonthEnd DATE,              
 @FinancialYearStart DATE,              
              
 @accounts varchar(100),              
 @projects varchar(100),              
 @accountsNotSubmitted int,              
 @projectsNotSubmitted int,              
 @assignedTo varchar(100),              
              
 @plannedTotalCurrent int,              
 @actualTotalCurrent int,              
 @plannedTotalLastThree int,              
 @actualTotalLastThree int,              
 @plannedTotalFinyear int,              
 @actualTotalFinyear int,              
              
 @percentCurrent decimal,              
 @percentLastThree decimal,              
 @percentFinYear decimal,              
              
 @email varchar(75),  
 @revisedate DATE  
   
 set @revisedate = IIF(day(getdate()) between 1 and 6, cast(DATEADD(m,-1,DATEADD(mm, DATEDIFF(m,0,getdate()), 0)) as date), getdate())  
                
               
               
 set @percentCurrent=0;              
 set @percentLastThree=0;              
 set @percentFinYear=0;              
              
              
              
 set @CurrentMonthStart = cast(dateadd(dd,-day(@revisedate)+1,@revisedate) as DATE)               
 set @CurrentMonthEnd = cast(dateadd(dd,-day(dateadd(mm,1,@revisedate)),dateadd(mm,1,@revisedate)) as DATE)               
 set @LastThreeMonthStart =cast(DATEADD(MONTH, DATEDIFF(MONTH, 0, @revisedate)-3, 0) as DATE)              
 set @LastThreeMonthEnd =cast(DATEADD(MONTH, DATEDIFF(MONTH, -1, @revisedate)-1, -1) as DATE)              
              
  
  
 --select DATEFROMPARTS(Yr, 4, 1) [start], DATEFROMPARTS(Yr + 1, 3, 31) [end] from               
 --(select case when DATEPART(month, @revisedate) < 4 then DATEPART(year, @revisedate) - 1 else DATEPART(year, @revisedate) end Yr) a              
              
 select @FinancialYearStart=DATEFROMPARTS(Yr, 4, 1) from               
 (select case when DATEPART(month, @revisedate) < 4 then DATEPART(year, @revisedate) - 1 else DATEPART(year, @revisedate) end Yr) a              
 create table #tmpReport              
 (              
  [QUALITY SPOC] varchar(100),              
  [EMAIL] varchar(75),              
              
  ACCOUNTS int,             
  PROJECTS int,              
              
  [Percent Current] decimal(5,2),              
  [Percent LastThree] decimal(5,2),              
  [Percent FinYear] decimal(5,2),              
              
  [AUDIT PLANNED] int,              
  [AUDIT ACTUAL] int,              
  [HEALTH CHECK PLANNED] int,      --Sprint execution / Health Check         
  [HEALTH CHECK ACTUAL] int,              
  [ASSESSMENT PLANNED] int,          --Sprint Launch     
  [ASSESSMENT ACTUAL] int,              
  --[ML ASSESSMENT PLANNED] int,              
  --[ML ASSESSMENT ACTUAL] int,              
  [RELEASE ASSESSMENT PLANNED] int,       --Sprint release assessment        
  [RELEASE ASSESSMENT ACTUAL] int,
  [TRANSITION ASSESSMENT PLANNED] int,       --Transition Assessment        
  [TRANSITION ASSESSMENT ACTUAL] int,      
  [STARTUP ASSESSMENT PLANNED] int,         -- --STARTUP ASSESSMENT
  [STARTUP ASSESSMENT ACTUAL] int,  
  [PROJECT CLOSURE ASSESSMENT PLANNED] int,   --Project Closure ASSESSMENT
  [PROJECT CLOSURE ASSESSMENT ACTUAL] int,   
  
  
                          
  [AUDIT PLANNED (LAST THREE MONTHS)] int,              
  [AUDIT ACTUAL (LAST THREE MONTHS)] int,              
  [HEALTH CHECK PLANNED (LAST THREE MONTHS)] int,              
  [HEALTH CHECK ACTUAL (LAST THREE MONTHS)] int,              
  [ASSESSMENT PLANNED (LAST THREE MONTHS)] int,              
  [ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,              
  --[ML ASSESSMENT PLANNED (LAST THREE MONTHS)] int,              
  --[ML ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,              
  [RELEASE ASSESSMENT PLANNED (LAST THREE MONTHS)] int,              
  [RELEASE ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,     
   [TRANSITION ASSESSMENT PLANNED (LAST THREE MONTHS)] int,              
  [TRANSITION ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,  
   [STARTUP ASSESSMENT PLANNED (LAST THREE MONTHS)] int,              
  [STARTUP ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,  
  [PROJECT CLOSURE ASSESSMENT PLANNED (LAST THREE MONTHS)] int,              
  [PROJECT CLOSURE ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,
           
              
  [AUDIT PLANNED (Financial Year -Till Date)] int,              
  [AUDIT ACTUAL(Financial Year -Till Date)] int,              
  [HEALTH CHECK PLANNED (Financial Year -Till Date)] int,              
  [HEALTH CHECK ACTUAL (Financial Year -Till Date)] int,              
  [ASSESSMENT PLANNED (Financial Year -Till Date)] int,              
  [ASSESSMENT ACTUAL (Financial Year -Till Date)] int,              
  --[ML ASSESSMENT PLANNED (Financial Year -Till Date)] int,              
  --[ML ASSESSMENT ACTUAL (Financial Year -Till Date)] int,              
  [RELEASE ASSESSMENT PLANNED (Financial Year -Till Date)] int,              
  [RELEASE ASSESSMENT ACTUAL (Financial Year -Till Date)] int,  
   [TRANSITION ASSESSMENT PLANNED (Financial Year -Till Date)] int,              
  [TRANSITION ASSESSMENT ACTUAL (Financial Year -Till Date)] int,  
     [STARTUP ASSESSMENT PLANNED (Financial Year -Till Date)] int,              
  [STARTUP ASSESSMENT ACTUAL (Financial Year -Till Date)] int, 
      [PROJECT CLOSURE ASSESSMENT PLANNED (Financial Year -Till Date)] int,              
  [PROJECT CLOSURE ASSESSMENT ACTUAL (Financial Year -Till Date)] int, 
             
                
  [ACCOUNTS NOT SUBMITTED] int,              
  [PROJECTS NOT SUBMITTED] int              
               
 );         
      
 select * into #tmpSpoc from (              
 select quality_spoc , ROW_NUMBER() over  (order by quality_spoc)row from (select distinct QUALITY_SPOC from project p inner join EMP_INFO e on e.emp_id=p.quality_spoc where p.QUALITY_SPOC is not null and e.dor is null and e.CSM_TITLE_ID=7)  test
  
    
) a       
   
              
 declare @counter int=(select max(row) from #tmpSpoc)              
              
 while(@counter>0)              
 begin              
              
 select @assignedTo=quality_spoc from #tmpSpoc where row=@counter       
 set @counter=@counter-1;              
              
 select @assignedToName= FRST_NM from emp_info where EMP_ID=@assignedTo and DOR is NULL           
                
 select  @email=email_id from emp_info where EMP_ID=@assignedTo and DOR is NULL        
              
 --select @accounts=count(distinct CUST_ID) from task where ASSIGNED_TO=@assignedTo and CUST_ID!=0              
 --select @projects=count(distinct PROJ_ID) from task where ASSIGNED_TO=@assignedTo and PROJ_ID is not null              
              
 select @accounts= count( distinct CUST_ID) from  project where quality_spoc=@assignedTo and CUST_ID!='0'              
               
 select @projects=count(proj_id) from project where quality_spoc=@assignedTo and isnull(proj_status,'') != 'close'      
 --and              
 --proj_id not in              
 --(select proj_id from Project_configuration_Data where Configuration_Setting_Id=3 and Bit_Value=1 and Is_Approved=1)              
              
              
 select @accountsNotSubmitted=count( distinct cust_id) from task where status not in ('COMPLETED','IN PROGRESS','PLANNED') and assigned_to=@assignedTo              
 select @projectsNotSubmitted=count(distinct proj_id) from task where status not in ('COMPLETED','IN PROGRESS','PLANNED') and assigned_to=@assignedTo              
               
 create table #tmpResultCurrent(Title varchar(100),Planned int,Actual int,Assigned_To varchar(100));              
 create table #tmpResultLastThree(Title varchar(100),Planned int,Actual int,Assigned_To varchar(100));              
 create table #tmpResultFinYear(Title varchar(100),Planned int,Actual int,Assigned_To varchar(100));              
 create table #tmpTitles(Title varchar(100));              
                
              
              
 with Auditors as             (              
 select distinct(quality_spoc) as emp_id from project where QUALITY_SPOC is not null              
 ),              
 cte1 as(              
 select t.id as 'taskid', cnt = case when exists(select 1 from audit_checklist_execution_summary where assessment_id = t.id and ISACTIVE =1) then 1 else 0 end,              
 a.emp_id, tc.ID as 'task_cat_id', tc.title, t.due_date              
 from task t       
 inner join TASK_CATEGORY tc on t.TASK_CATEGORY_ID = tc.ID              
              
  inner join PROCESS_MODEL_AUDITOR a on a.emp_id = t.owner or t.assigned_to = a.emp_id or exists(select 1 from AUDIT_SCHEDULE where AUDITOR_EMP_ID = a.emp_id and task_id = t.id )              
    inner join project pj on pj.proj_id = t.proj_id              
 where t.TASK_CATEGORY_ID in (select options from parameter_table where name ='AUDIT_CATEGORY') and t.status!='cancelled' and t.ISACTIVE=1              
 and (t.due_date between @CurrentMonthStart and CAST(eomonth(@revisedate) AS date)) and t.PROJ_ID not in               
 (select proj_id from Project_configuration_Data where Configuration_Setting_Id=5 and Bit_Value=1 and Is_Approved=1) and isnull(pj.proj_status,'') != 'close'              
               
 )              
              
 insert #tmpResultCurrent              
 select title, count(taskid) as 'Planned', sum(cnt ) as 'Actual', emp_id from cte1               
 group by title, emp_id order by emp_id, TITLE;              
              
              
              
 with Auditors as              
 (              
 select distinct(quality_spoc) as emp_id from project where QUALITY_SPOC is not null              
 ),              
 cte1 as(              
 select t.id as 'taskid', cnt = case when exists(select 1 from audit_checklist_execution_summary where assessment_id = t.id and ISACTIVE =1) then 1 else 0 end,              
 a.emp_id, tc.ID as 'task_cat_id', tc.title, t.due_date              
 from task t              
 inner join TASK_CATEGORY tc on t.TASK_CATEGORY_ID = tc.ID              
              
  inner join PROCESS_MODEL_AUDITOR a on a.emp_id = t.owner or t.assigned_to = a.emp_id or exists(select 1 from AUDIT_SCHEDULE where AUDITOR_EMP_ID = a.emp_id and task_id = t.id )              
    inner join project pj on pj.proj_id = t.proj_id              
 where t.TASK_CATEGORY_ID in (select options from parameter_table where name ='AUDIT_CATEGORY') and t.status!='cancelled' and t.ISACTIVE=1              
 and (t.due_date between @LastThreeMonthStart and @LastThreeMonthEnd) and t.PROJ_ID not in               
 (select proj_id from Project_configuration_Data where Configuration_Setting_Id=5 and Bit_Value=1 and Is_Approved=1) and isnull(pj.proj_status,'') != 'close'              
               
               
  )              
              
 insert  #tmpResultLastThree              
 select title, count(taskid) as 'Planned', sum(cnt ) as 'Actual', emp_id from cte1               
 group by title, emp_id order by emp_id, TITLE;              
              
              
              
 with Auditors as              
 (              
 select distinct(quality_spoc) as emp_id from project where QUALITY_SPOC is not null              
 ),              
 cte1 as(              
 select t.id as 'taskid', cnt = case when exists(select 1 from audit_checklist_execution_summary where assessment_id = t.id and ISACTIVE =1) then 1 else 0 end,              
 a.emp_id, tc.ID as 'task_cat_id', tc.title, t.due_date              
 from task t              
 inner join TASK_CATEGORY tc on t.TASK_CATEGORY_ID = tc.ID              
              
  inner join PROCESS_MODEL_AUDITOR a on a.emp_id = t.owner or t.assigned_to = a.emp_id or exists(select 1 from AUDIT_SCHEDULE where AUDITOR_EMP_ID = a.emp_id and task_id = t.id )              
    inner join project pj on pj.proj_id = t.proj_id              
 where t.TASK_CATEGORY_ID in (select options from parameter_table where name ='AUDIT_CATEGORY') and t.status!='cancelled' and t.ISACTIVE=1              
 and (t.due_date between @FinancialYearStart and cast(@revisedate as DATE))  and t.PROJ_ID not in               
 (select proj_id from Project_configuration_Data where Configuration_Setting_Id=5 and Bit_Value=1 and Is_Approved=1) and isnull(pj.proj_status,'') != 'close'              
               
               
  )              
              
 insert  #tmpResultFinYear              
 select title, count(taskid) as 'Planned', sum(cnt ) as 'Actual', emp_id from cte1               
 group by title, emp_id order by emp_id, TITLE;             
              
 insert #tmpTitles              
 select title from TASK_CATEGORY tc inner join parameter_table pt on tc.ID=pt.OPTIONS where pt.NAME='AUDIT_CATEGORY'               
              
 select * into #tmpFinal               
 from(              
 select  b.Title as Title,              
 ISNULL(a.Planned,0) Planned,              
 ISNULL(a.Actual,0) Actual,              
 ISNULL(a.assigned_To,0) assigned_To              
 from (select * from #tmpResultCurrent tmp where tmp.Assigned_To=@assignedTo) a              
 right join               
 #tmpTitles b on a.Title=b.Title) tmp;              
              
 select * into #tmpFinalLastThree               
 from(              
 select  b.Title as Title,              
 ISNULL(a.Planned,0) Planned,              
 ISNULL(a.Actual,0) Actual,              
 ISNULL(a.assigned_To,0) assigned_To              
 from (select * from #tmpResultLastThree tmp where tmp.Assigned_To=@assignedTo) a              
 right join               
 #tmpTitles b on a.Title=b.Title) tmp;              
              
 select * into #tmpFinalFinYear              
 from(              
 select  b.Title as Title,              
 ISNULL(a.Planned,0) Planned,              
 ISNULL(a.Actual,0) Actual,              
 ISNULL(a.assigned_To,0) assigned_To              
 from (select * from #tmpResultFinYear tmp where tmp.Assigned_To=@assignedTo) a              
 right join               
 #tmpTitles b on a.Title=b.Title) tmp;              
              
               
 drop table #tmpResultCurrent              
 drop table #tmpResultLastThree              
 drop table #tmpResultFinYear              
 drop table #tmpTitles              
              
 --select * from #tmpFinal;               
              
 ----Current period           
 IF(select COUNT(*) from #tmpFinal where title='AUDIT') = 0          
 BEGIN          
  Raiserror('AUDIT Title in the #tmpFinal table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @auditPlannedCurrent = Planned,@auditActualCurrent=Actual from #tmpFinal where title='AUDIT'           
 END          
          
 IF(select COUNT(*) from #tmpFinal where title='PROCESS HEALTH CHECK') = 0          
 BEGIN          
  Raiserror('PROCESS HEALTH CHECK Title in the #tmpFinal table is not available', 16, 1)       --Sprint execution / Health Check    
 END          
 ELSE           
 BEGIN          
 select @healthCheckPlannedCurrent= Planned,@healthCheckActualCurrent=Actual from #tmpFinal where title='PROCESS HEALTH CHECK'           
 END          
          
 IF(select COUNT(*) from #tmpFinal where title='PROCESS ASSESSMENT') = 0          --Sprint Launch 
 BEGIN          
  Raiserror('PROCESS ASSESSMENT Title in the #tmpFinal table is not available', 16, 1)      --Sprint Launch     
 END          
 ELSE BEGIN          
 select @assessmentPlannedCurrent= Planned,@assessmentActualCurrent=Actual from #tmpFinal where title='PROCESS ASSESSMENT'           
 END          
 
  IF(select COUNT(*) from #tmpFinal where title='Release Assessment') = 0          --Sprint release
 BEGIN          
  Raiserror('Release Assessment Title in the #tmpFinal table is not available', 16, 1)       --Sprint release   
 END          
 ELSE BEGIN          
 select @releaseAssessmentPlannedCurrent= Planned,@releaseAssessmentActualCurrent=Actual from #tmpFinal where title='Release Assessment'            
 END     
                  

  IF(select COUNT(*) from #tmpFinal where title='On-boarding - New Customer - Assessment' OR title='On-boarding -  New Project - Assessment') = 0       --Startup audit    
 BEGIN          
  Raiserror('Startup Audit Title in the #tmpFinal table is not available', 16, 1)          ----Startup audit
 END          
 ELSE BEGIN          
 select @startupAuditPlannedCurrent= Planned,@startupAuditActualCurrent=Actual from #tmpFinal where title='On-boarding - New Customer - Assessment' OR title='On-boarding -  New Project - Assessment'           
 END
          
 IF(select COUNT(*) from #tmpFinal where title='Transition Assessment') = 0          --Transition Assessment
 BEGIN          
  Raiserror('Transition Assessment Title in the #tmpFinal table is not available', 16, 1)       --Transition Assessment  
 END          
 ELSE BEGIN          
 select @transitionAssessmentPlannedCurrent= Planned,@transitionAssessmentActualCurrent=Actual from #tmpFinal where title='Transition Assessment'            
 END

 IF(select COUNT(*) from #tmpFinal where title='Off-boarding Customer – Assessment' OR title='Off-boarding Project - Assessment') = 0  --Project Closure Assessment   
 BEGIN          
  Raiserror('Project Closure Assessment Title in the #tmpFinal table is not available', 16, 1)  --Project Closure Assessment 
 END          
 ELSE BEGIN          
 select @projectClosureAssessmentPlannedCurrent= Planned,@projectClosureAssessmentActualCurrent=Actual from #tmpFinal where title='Off-boarding Customer – Assessment' OR title='Off-boarding Project - Assessment'           
 END
      
          
 ----Last three Months              
 IF(select COUNT(*) from #tmpFinalLastThree where title='AUDIT') = 0          
 BEGIN          
  Raiserror('AUDIT Title in the #tmpFinal table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @auditPlannedLastThree= Planned,@auditActualLastThree=Actual from #tmpFinalLastThree where title='AUDIT'             
 END          
 IF(select COUNT(*) from #tmpFinalLastThree where title='PROCESS HEALTH CHECK') = 0          
 BEGIN          
  Raiserror('PROCESS HEALTH CHECK Title in the #tmpFinalLastThree table is not available', 16, 1)          
 END          
 ELSE BEGIN          
 select @healthCheckPlannedLastThree= Planned,@healthCheckActualLastThree=Actual from #tmpFinalLastThree where title='PROCESS HEALTH CHECK'            
 END          
          
 IF(select COUNT(*) from #tmpFinalLastThree where title='PROCESS ASSESSMENT') = 0          
 BEGIN          
 Raiserror('PROCESS ASSESSMENT Title in the #tmpFinalLastThree table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @assessmentPlannedLastThree= Planned,@assessmentActualLastThree=Actual from #tmpFinalLastThree where title='PROCESS ASSESSMENT'              
 END          
               
          
 IF(select COUNT(*) from #tmpFinalLastThree where title='Release Assessment') = 0          
 BEGIN          
 Raiserror('Release Assessment Title in the #tmpFinalLastThree table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @releaseAssessmentPlannedLastThree= Planned,@releaseAssessmentActualLastThree=Actual from #tmpFinalLastThree where title='Release Assessment'              
 END           
 
 --transition
 IF(select COUNT(*) from #tmpFinalLastThree where title='Transition Assessment') = 0          
 BEGIN          
 Raiserror('Transition Assessment Title in the #tmpFinalLastThree table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @transitionAssessmentPlannedLastThree= Planned,@transitionAssessmentActualLastThree=Actual from #tmpFinalLastThree where title='Transition Assessment'              
 END 

 --startup
 IF(select COUNT(*) from #tmpFinalLastThree where title='On-boarding - New Customer - Assessment' OR title='On-boarding -  New Project - Assessment') = 0          
 BEGIN          
 Raiserror('Startup Assessment Title in the #tmpFinalLastThree table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @startupAuditPlannedLastThree= Planned,@startupAuditActualLastThree=Actual from #tmpFinalLastThree where title='On-boarding - New Customer - Assessment' OR title='On-boarding -  New Project - Assessment'              
 END 

 --closure
 IF(select COUNT(*) from #tmpFinalLastThree where title='Off-boarding Customer – Assessment' OR title='Off-boarding Project - Assessment') = 0          
 BEGIN          
 Raiserror('Project Closure Title in the #tmpFinalLastThree table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @projectClosureAssessmentPlannedLastThree= Planned,@projectClosureAssessmentActualLastThree=Actual from #tmpFinalLastThree where title='Off-boarding Customer – Assessment' OR title='Off-boarding Project - Assessment'              
 END 
 
 
 
   
 ----Financial Year (Apr 1 to till date)             
 IF(select COUNT(*) from #tmpFinalFinYear where title='AUDIT') = 0          
 BEGIN          
  Raiserror('AUDIT Title in the #tmpFinalFinYear table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @auditPlannedFinYear= Planned,@auditActualFinYear=Actual from #tmpFinalFinYear where title='AUDIT'            
 END          
          
 IF(select COUNT(*) from #tmpFinalFinYear where title='PROCESS HEALTH CHECK') = 0          
 BEGIN          
  Raiserror('PROCESS HEALTH CHECK Title in the #tmpFinalFinYear table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @healthCheckPlannedFinYear= Planned,@healthCheckActualFinYear=Actual from #tmpFinalFinYear where title='PROCESS HEALTH CHECK'              
END          
          
 IF(select COUNT(*) from #tmpFinalFinYear where title='PROCESS ASSESSMENT') = 0          
 BEGIN          
  Raiserror('PROCESS ASSESSMENT Title in the #tmpFinalFinYear table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @assessmentPlannedFinYear= Planned,@assessmentActualFinYear=Actual from #tmpFinalFinYear where title='PROCESS ASSESSMENT'              
 END          
          

 IF(select COUNT(*) from #tmpFinalFinYear where title='Release Assessment') = 0          
 BEGIN          
  Raiserror('Release Assessment Title in the #tmpFinalFinYear table is not available', 16, 1)          
 END          
 ELSE           
 BEGIN          
 select @releaseAssessmentPlannedFinyear= Planned,@releaseAssessmentActualFinYear=Actual from #tmpFinalFinYear where title='Release Assessment'              
 END              
            
 --transition
 IF(select COUNT(*) from #tmpFinalLastThree where title='Transition Assessment') = 0          
 BEGIN          
 Raiserror('Transition Assessment Title in the #tmpFinalFinYear table is not available', 16, 1)                 
 END          
 ELSE           
 BEGIN          
 select @transitionAssessmentPlannedFinYear= Planned,@transitionAssessmentActualFinYear=Actual from #tmpFinalLastThree where title='Transition Assessment'              
 END 

 --startup
 IF(select COUNT(*) from #tmpFinalLastThree where title='On-boarding - New Customer - Assessment' OR title='On-boarding -  New Project - Assessment') = 0          
 BEGIN          
 Raiserror('Startup Assessment TTitle in the #tmpFinalFinYear table is not available', 16, 1)             
 END          
 ELSE           
 BEGIN          
 select @startupAuditPlannedFinYear= Planned,@startupAuditActualFinYear=Actual from #tmpFinalLastThree where title='On-boarding - New Customer - Assessment' OR title='On-boarding -  New Project - Assessment'              
 END 

 --closure
 IF(select COUNT(*) from #tmpFinalLastThree where title='Off-boarding Customer – Assessment' OR title='Off-boarding Project - Assessment') = 0          
 BEGIN          
 Raiserror('Project Closure Title in the #tmpFinalFinYear table is not available', 16, 1)        
 END          
 ELSE           
 BEGIN          
 select @projectClosureAssessmentPlannedFinYear= Planned,@projectClosureAssessmentActualFinYear=Actual from #tmpFinalLastThree where title='Off-boarding Customer – Assessment' OR title='Off-boarding Project - Assessment'              
 END 			
			   
              
 ----CurrentPercent              
              
   set @plannedTotalCurrent = @auditPlannedCurrent+@healthCheckPlannedCurrent+@assessmentPlannedCurrent+@releaseAssessmentPlannedCurrent+@startupAuditPlannedCurrent+@transitionAssessmentPlannedCurrent+@projectClosureAssessmentPlannedCurrent;              
           
   set @actualTotalCurrent = @auditActualCurrent+@healthCheckActualCurrent+@assessmentActualCurrent+@releaseAssessmentActualCurrent+@startupAuditActualCurrent+@transitionAssessmentActualCurrent+@projectClosureAssessmentActualCurrent;                        
          
 if(@plannedTotalCurrent!=0)              
 begin              
  set @percentCurrent =(cast(@actualTotalCurrent as decimal)/cast(@plannedTotalCurrent as decimal))*100;              
 end              
              
 ----LastThreePercent              
              
 set @plannedTotalLastThree = @auditPlannedLastThree+@healthCheckPlannedLastThree+@assessmentPlannedLastThree+@releaseAssessmentPlannedLastThree+@transitionAssessmentPlannedLastThree+@startupAuditPlannedLastThree+@projectClosureAssessmentPlannedLastThree;              
              
 set @actualTotalLastThree = @auditActualLastThree+@healthCheckActualLastThree+@assessmentActualLastThree+@releaseAssessmentActualLastThree+@transitionAssessmentActualLastThree+@startupAuditActualLastThree+@projectClosureAssessmentActualLastThree;              
           
 if(@plannedTotalLastThree!=0)              
 begin              
  set @percentLastThree=(cast(@actualTotalLastThree as decimal)/cast(@plannedTotalLastThree as decimal))*100;              
 end              
              
 ----FinYearPercent              
              
 set @plannedTotalFinyear = @auditPlannedFinYear+@healthCheckPlannedFinYear+@assessmentPlannedFinYear+@releaseAssessmentPlannedFinyear+@transitionAssessmentPlannedFinYear+@startupAuditPlannedFinYear+@projectClosureAssessmentPlannedFinYear;              
               
 set @actualTotalFinyear = @auditActualFinYear+@healthCheckActualFinYear+@assessmentActualFinYear+@releaseAssessmentActualFinYear+@transitionAssessmentActualFinYear+@startupAuditActualFinYear+@projectClosureAssessmentActualFinYear;              
            
             
 if(@plannedTotalFinyear!=0)              
 begin              
  set @percentFinYear=(cast(@actualTotalFinyear as decimal)/cast(@plannedTotalFinyear as decimal))*100;              
 end              
               
              
 insert #tmpReport              
 select @assignedToName [QUALITY SPOC],              
 @email,              
              
 @accounts Accounts,              
 @projects Projects,              
              
 @percentCurrent,              
 @percentLastThree,              
 @percentFinYear,              
              
 @auditPlannedCurrent AUDIT_PLN_CURR,               
 @auditActualCurrent AUDIT_ACT_CURR,               
 @healthCheckPlannedCurrent HC_PLN_CURR,              
 @healthCheckActualCurrent HC_ACT_CURR,              
 @assessmentPlannedCurrent ASSESSMENT_PLN_CURR,              
 @assessmentActualCurrent ASSESSMENT_ACT_CURR,              
 --@maturityLevelAssessmentPlannedCurrent ML_PLN_CURR,               
 --@maturityLevelAssessmentActualCurrent ML_ACT_CURR,              
 @releaseAssessmentPlannedCurrent RA_PLN_CURR,               
 @releaseAssessmentActualCurrent RA_ACT_CURR,  
 @transitionAssessmentPlannedCurrent TA_PLN_CURR,
 @transitionAssessmentActualCurrent TA_ACT_CURR,  
 @startupAuditPlannedCurrent SA_PLN_CURR,
 @startupAuditActualCurrent SA_ACT_CURR, 
 @projectClosureAssessmentPlannedCurrent PCA_PLN_CURR,
 @projectClosureAssessmentActualCurrent PCA_ACT_CURR,          
           
            
              
               
               
               
 @auditPlannedLastThree AUDIT_PLN_LASTTHREE,               
 @auditActualLastThree AUDIT_ACT_LASTTHREE,               
 @healthCheckPlannedLastThree HC_PLN_LASTTHREE,               
 @healthCheckActualLastThree HC_ACT_LASTTHREE,              
 @assessmentPlannedLastThree ASSESSMENT_PLN_LASTTHREE,                
 @assessmentActualLastThree ASSESSMENT_ACT_LASTTHREE,              
 --@maturityLevelAssessmentPlannedLastThree ML_PLN_LASTTHREE,               
 --@maturityLevelAssessmentActualLastThree ML_ACT_LASTTHREE,               
 @releaseAssessmentPlannedLastThree RA_PLN_LASTTHREE,               
 @releaseAssessmentActualLastThree RA_ACT_LASTTHREE, 
 @transitionAssessmentPlannedLastThree TA_PLN_LASTTHREE,
 @transitionAssessmentActualLastThree TA_ACT_LASTTHREE,  
 @startupAuditPlannedLastThree SA_PLN_LASTTHREE,
 @startupAuditActualLastThree SA_ACT_LASTTHREE, 
 @projectClosureAssessmentPlannedLastThree PCA_PLN_LASTTHREE,
 @projectClosureAssessmentActualLastThree PCA_ACT_LASTTHREE,                
              
              
 @auditPlannedFinYear AUDIT_PLN_FinYEAR,               
 @auditActualFinYear AUDIT_ACT_FinYEAR,              
 @healthCheckPlannedFinYear HC_PLN_FinYEAR,               
 @healthCheckActualFinYear HC_ACT_FinYEAR,              
 @assessmentPlannedFinYear ASSESSMENT_PLN_FinYear,              
 @assessmentActualFinYear ASSESSMENT_ACT_FinYear,               
 --@maturityLevelAssessmentPlannedFinYear ML_PLN_FinYear,               
 --@maturityLevelAssessmentActualFinYear ML_ACT_FinYear,              
 @releaseAssessmentPlannedFinyear RA_PLN_FinYear,               
 @releaseAssessmentActualFinYear RA_ACT_FinYear,
  @transitionAssessmentPlannedFinYear TA_PLN_FinYear,
 @transitionAssessmentActualFinYear TA_ACT_FinYear,
 @startupAuditPlannedFinYear SA_PLN_FinYear,
 @startupAuditActualFinYear SA_ACT_FinYear,
 @projectClosureAssessmentPlannedFinYear PCA_PLN_FinYear,
 @projectClosureAssessmentActualFinYear PCA_ACT_FinYear,             
               
 @accountsNotSubmitted AccountsNotSubmitted,@projectsNotSubmitted ProjectsNotSubmitted;              
              
 --select * from #tmpReport;              
              
 set @percentCurrent=0;              
 set @percentLastThree=0;              
 set @percentFinYear=0;              
              
 drop table #tmpFinal;              
 drop table #tmpFinalLastThree;              
 drop table #tmpFinalFinYear;              
               
              
              
               
end              
              
select DENSE_RANK() over(order by [Percent Current] desc ) as RankCurrent ,              
DENSE_RANK() over(order by [Percent LastThree] desc ) as RankLASTTHREE ,              
DENSE_RANK() over(order by [Percent FinYear] desc ) as RankFinYear ,* from #tmpReport;            
              
              
drop table #tmpReport;              
drop table #tmpSpoc              
              
               
                  
END   


Go
  





  
IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='BASE_MEASURE_EXTERNAL_KPI_DATA' AND COLUMN_NAME='KPI_BASE_MEASURE_VALUE_ID' )
  BEGIN

  ALTER TABLE BASE_MEASURE_EXTERNAL_KPI_DATA ADD  KPI_BASE_MEASURE_VALUE_ID int NULL  

  END

GO

IF  EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='BASE_MEASURE_EXTERNAL_KPI_DATA' AND COLUMN_NAME='BASE_MEASURE_ID' )
  BEGIN

  ALTER TABLE BASE_MEASURE_EXTERNAL_KPI_DATA DROP COLUMN   BASE_MEASURE_ID  

  END

GO

IF EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='BASE_MEASURE_EXTERNAL_KPI_DATA' AND COLUMN_NAME='KPI_DETAILS_ID' )
  BEGIN

  ALTER TABLE BASE_MEASURE_EXTERNAL_KPI_DATA DROP COLUMN  KPI_DETAILS_ID 

  END

GO







  
IF EXISTS (SELECT 1 FROM systypes st WHERE st.name = 'TT_EXTERNAL_KPI_DATA')
BEGIN
   EXEC sp_droptype 'TT_EXTERNAL_KPI_DATA';
END

/****** Object:  UserDefinedTableType [dbo].[TT_EXTERNAL_KPI_DATA]    Script Date: 07-06-2023 20:03:47 ******/
CREATE TYPE [dbo].[TT_EXTERNAL_KPI_DATA] AS TABLE(
	[KPI_DATA] [varchar](MAX) NULL
)
GO  

IF EXISTS (SELECT 1 FROM systypes st WHERE st.name = 'TT_BASE_MEASURE_EXTERNAL_KPI_DATA')
BEGIN
   EXEC sp_droptype 'TT_BASE_MEASURE_EXTERNAL_KPI_DATA';
END

/****** Object:  UserDefinedTableType [dbo].[TT_BASE_MEASURE_EXTERNAL_KPI_DATA]    Script Date: 07-06-2023 20:03:47 ******/
CREATE TYPE [dbo].TT_BASE_MEASURE_EXTERNAL_KPI_DATA AS TABLE(
	 KPI_BASE_MEASURE_VALUE_ID int, 
	 EXTERNAL_KPI_DATA_ID int,
	 KPI_DATATYPE int, 
	 KPI_DATA_JSON [varchar](MAX) NULL
)
GO  

 
If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='ENABLE_KPI_DATA_PROCESS')
Begin
Insert into CONFIGURATION_EXT values('ENABLE_KPI_DATA_PROCESS','202100121','-1',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END   

GO






IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_update_ExistingBaseMeasureKPIdataMap'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].usp_update_ExistingBaseMeasureKPIdataMap
END
GO

-- =============================================
-- Author:  Indhu
-- Create date: 07/Jun/2023
-- Description: delete Existing Base Measure KPIdata Map
-- =============================================
CREATE PROCEDURE [dbo].usp_update_ExistingBaseMeasureKPIdataMap
    @extTable TT_BASE_MEASURE_EXTERNAL_KPI_DATA READONLY,
    @empId varchar(10) 
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;
    if EXISTS (SELECT 1 FROM @extTable)
    BEGIN

        --- delete missing Maps
        DELETE bmkd
        from BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
            left JOIN @extTable temp
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE temp.KPI_BASE_MEASURE_VALUE_ID is nULL --AND temp.KPI_DATA IS NOT NULL 

        --- update old Maps
        UPDATE bmkd
        SET bmkd.KPI_DATA_JSON = temp.KPI_DATA_JSON,
            bmkd.updated_BY = @empID,
            bmkd.UPDATED_DATE = getdate()
        FROM BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
            left JOIN @extTable temp
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE temp.KPI_BASE_MEASURE_VALUE_ID is NOT nULL --AND temp.KPI_DATA IS NOT NULL 

        --- Insert New Maps
        INSERT INTO BASE_MEASURE_EXTERNAL_KPI_DATA
        (
            KPI_BASE_MEASURE_VALUE_ID,
            EXTERNAL_KPI_DATA_ID,
            KPI_DATA_JSON,
            CREATED_BY,
            CREATED_DATE,
            UPDATED_BY,
            UPDATED_DATE,
            ISACTIVE,
            KPI_DATATYPE
        )
        SELECT temp.KPI_BASE_MEASURE_VALUE_ID,
               temp.EXTERNAL_KPI_DATA_ID,
               temp.KPI_DATA_JSON,
               @empId,
               getdate(),
               @empId,
               getdate(),
               1,
               temp.KPI_DATATYPE
        FROM @extTable temp
            left JOIN BASE_MEASURE_EXTERNAL_KPI_DATA bmkd
                ON bmkd.KPI_BASE_MEASURE_VALUE_ID = temp.KPI_BASE_MEASURE_VALUE_ID
                   AND temp.EXTERNAL_KPI_DATA_ID = bmkd.EXTERNAL_KPI_DATA_ID
                   AND bmkd.KPI_DATATYPE = temp.KPI_DATATYPE
                   AND bmkd.ISACTIVE = 1
        WHERE temp.KPI_BASE_MEASURE_VALUE_ID is NOT nULL --AND temp.KPI_DATA IS NOT NULL 


		--update rows as Processed (so that rows  won't be considered again
		UPdate ek
		SET IS_PROCESSED=1
		FROM @extTable temp
		INNER JOIN EXTERNAL_KPI_DATA ek
		ON ek.KPI_DATA=temp.KPI_DATA_JSON
		WHERE IS_PROCESSED=0


    END

END





GO


IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_insert_ExternalKPIData'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].usp_insert_ExternalKPIData
END
GO

-- =============================================
-- Author:  Indhu
-- Create date: 07/Jun/2023
-- Description: insert OR Update EXTERNAL_KPI_DATA
-- =============================================
CREATE PROCEDURE [dbo].usp_insert_ExternalKPIData
    @extTable TT_EXTERNAL_KPI_DATA READONLY,
    @empId varchar(10),
    @custId varchar(20),
    @ipDate Date,
    @source varchar(20),
    @fileName varchar(200)
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON;
    DECLARE @masterId int = 0;

    if EXISTS (SELECT 1 FROM @extTable)
    BEGIN
        --Make previous records inactive to ignore them in process KPI
        UPDATE EXTERNAL_KPI_DATA_MASTER
        SET ISACTIVE = 0

        INSERT INTO EXTERNAL_KPI_DATA_MASTER
        (
            CUST_ID,
            SOURCE,
            CREATED_BY,
            CREATED_DATE,
            UPDATED_BY,
            UPDATED_DATE,
            ISACTIVE,
            [FILE_NAME]
        )
        Values
        (@custId, @source, @empId, getdate(), @empId, getdate(), 1, @fileName)

        SET @masterId = SCOPE_IDENTITY();


        -- Insert New records
        INSERT INTO EXTERNAL_KPI_DATA
        (
            KPI_DATA,
            INPUT_DATE,
            IS_PROCESSED,
            CREATED_BY,
            CREATED_DATE,
            UPDATED_BY,
            UPDATED_DATE,
            ISACTIVE,
            MASTER_ID
        )
        select temp.KPI_DATA,
               @ipDate,
               0,
               @empId,
               getdate(),
               @empId,
               getdate(),
               1,
               @masterId
        from @extTable temp
            LEFT JOIN EXTERNAL_KPI_DATA kf (NOLOCK)
                ON temp.KPI_DATA = kf.KPI_DATA
                   AND kf.IS_PROCESSED = 0
                   AND kf.ISACTIVE = 1
        WHERE kf.ID is nULL
              AND temp.KPI_DATA IS NOT NULL

        -- Update old records which are not processed
        UPDATE EXTERNAL_KPI_DATA
        SET MASTER_ID = @masterId
        from @extTable temp
            LEFT JOIN EXTERNAL_KPI_DATA kf (NOLOCK)
                ON temp.KPI_DATA = kf.KPI_DATA
                   AND kf.IS_PROCESSED = 0
                   AND kf.ISACTIVE = 1
        WHERE kf.ID is NOT nULL
              AND temp.KPI_DATA IS NOT NULL


    END

END


IF NOT EXISTS (SELECT 1 from REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='CSS Report Combined')
BEGIN
INSERT INTO REPORTS_SP_DETAILS(SP_NAME,SP_DISPLAY_NAME,DB_NAME)  VALUES 
('dbo.reports_CSAT_Combined','CSS Report Combined','BAS') 
END


DECLARE @ReportID INT SET @ReportID=(SELECT @@IDENTITY)


IF NOT EXISTS (SELECT * from REPORTS_PARAMS WHERE REPORT_SP_ID= @ReportID)
BEGIN

INSERT INTO REPORTS_PARAMS VALUES(@ReportID,'StartDate','DATE','2023-07-01')
INSERT INTO REPORTS_PARAMS VALUES(@ReportID,'EndDate','DATE','2023-08-31')

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
END
GO


CREATE PROCEDURE [dbo].[reports_CSAT_Combined]
@StartDate Date,                    
 @EndDate Date                    
AS     


BEGIN
    SET NOCOUNT ON;

    --DECLARE @StartDate Date = '2023-09-01';
    --DECLARE @EndDate Date = '2023-09-30';

    WITH CSM AS (
        SELECT P.CUST_ID, E.FRST_NM CSM_NAME,p.PROJ_ID
		 FROM project p
        INNER JOIN EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID
    ),
    AM AS (
        SELECT DISTINCT P.CUST_ID, E.FRST_NM CSM_NAME , p.PROJ_ID FROM project p
        INNER JOIN EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID
    )

    SELECT
        c.cust_nm AS [Customer Name],
        p.proj_nm AS [Project Name],
        display_name AS [Respondent Name],
        B.EMAIL_ID AS [Email_Id],
        FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],
        FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],
        [Year_Quarter] = Left(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),
        qr.QUESTION_CATEGORY,
        qr.QUESTION,
        qr.RATING,
        qr.RATING_DESCRIPTION,
        c.Cust_ID AS [Customer_ID],
        CSM.CSM_NAME AS [Customer Success Manager],
        AM.CSM_NAME AS [ACCOUNT MANAGER]
    FROM [CSS_BATCH_CUSTOMERS] b
    INNER JOIN project p ON p.proj_id = b.proj_id
    INNER JOIN customer c ON c.cust_id = b.cust_id
    INNER JOIN CSM CSM ON CSM.PROJ_ID = B.PROJ_ID
    INNER JOIN AM AM ON AM.PROJ_ID = B.PROJ_ID
    INNER JOIN CSS_BATCHES bt ON bt.id = b.Batch_ID
    INNER JOIN CSS_QUESTION_REPLIES QR ON QR.BATCH_CUSTOMER_ID = b.ID
    WHERE b.STATUS = 'COMPLETED'
    AND (bt.start_date BETWEEN @StartDate AND @EndDate OR bt.ENd_date BETWEEN @StartDate AND @EndDate)

    UNION ALL

    SELECT
        c.cust_nm AS [Customer Name],
        '' AS [Project Name],
        b.DISPLAY_NAME AS [Respondent Name],
        B.EMAIL_ID AS [Email_Id],
        FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],
        FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],
        FORMAT(bt.START_DATE, 'MMM') + '-' + CAST(YEAR(bt.START_DATE) AS varchar(10)) AS [Year_Quarter],
        qr.QUESTION_CATEGORY,
        qr.QUESTION,
        qr.RATING,
        qr.RATING_DESCRIPTION,
        c.Cust_ID AS [Customer_ID],
        STUFF((SELECT DISTINCT ',' + CSM.CSM_NAME FROM CSM CSM
               JOIN CSS_BATCH_CUSTOMER_MONTHLY bcc ON CSm.CUST_ID = bcc.CUST_ID
               FOR XML PATH('')), 1, 1, '') AS [Customer Success Manager],
        STUFF((SELECT DISTINCT ',' + AM.CSM_NAME FROM AM AM
               JOIN CSS_BATCH_CUSTOMER_MONTHLY bcc ON AM.CUST_ID = bcc.CUST_ID
               FOR XML PATH('')), 1, 1, '') AS [ACCOUNT MANAGER]
    FROM [CSS_BATCH_CUSTOMER_MONTHLY] b
    INNER JOIN CSS_BATCH_MONTHLY bt ON bt.id = b.BATCH_MONTHLY_ID
    INNER JOIN CSS_QUESTION_REPLIES QR ON QR.Batch_Customer_Monthly_id = b.ID
    INNER JOIN customer c ON c.cust_id = b.cust_id
    WHERE b.STATUS = 'COMPLETED'
    AND (bt.start_date BETWEEN @StartDate AND @EndDate OR bt.ENd_date BETWEEN @StartDate AND @EndDate)
    ORDER BY [Year_Quarter], [Customer Name];
END
