USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_SQAReport' AND TYPE='P')
BEGIN
 DROP PROCEDURE usp_SQAReport          
END
GO


CREATE PROCEDURE usp_SQAReport                  
AS                  
BEGIN                 
            
 declare             
 @auditPlannedCurrent int,            
 @auditActualCurrent int,            
 @auditPlannedLastThree int,            
 @auditActualLastThree int,            
 @auditPlannedFinYear int,            
 @auditActualFinYear int,            
            
 @healthCheckPlannedCurrent int,            
 @healthCheckActualCurrent int,            
 @healthCheckPlannedLastThree int,            
 @healthCheckActualLastThree int,            
 @healthCheckPlannedFinYear int,            
 @healthCheckActualFinYear int,            
            
 @assessmentPlannedCurrent int,            
 @assessmentActualCurrent int,            
 @assessmentPlannedLastThree int,            
 @assessmentActualLastThree int,            
 @assessmentPlannedFinYear int,            
 @assessmentActualFinYear int,            
            
 @maturityLevelAssessmentPlannedCurrent int,            
 @maturityLevelAssessmentActualCurrent int,            
 @maturityLevelAssessmentPlannedLastThree int,            
 @maturityLevelAssessmentActualLastThree int,            
 @maturityLevelAssessmentPlannedFinYear int,            
 @maturityLevelAssessmentActualFinYear int,            
            
 @releaseAssessmentPlannedCurrent int,            
 @releaseAssessmentActualCurrent int,            
 @releaseAssessmentPlannedLastThree int,            
 @releaseAssessmentActualLastThree int,            
 @releaseAssessmentPlannedFinyear int,            
 @releaseAssessmentActualFinYear int,            
            
            
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
  [HEALTH CHECK PLANNED] int,            
  [HEALTH CHECK ACTUAL] int,            
  [ASSESSMENT PLANNED] int,            
  [ASSESSMENT ACTUAL] int,            
  [ML ASSESSMENT PLANNED] int,            
  [ML ASSESSMENT ACTUAL] int,            
  [RELEASE ASSESSMENT PLANNED] int,            
  [RELEASE ASSESSMENT ACTUAL] int,                      
  [AUDIT PLANNED (LAST THREE MONTHS)] int,            
  [AUDIT ACTUAL (LAST THREE MONTHS)] int,            
  [HEALTH CHECK PLANNED (LAST THREE MONTHS)] int,            
  [HEALTH CHECK ACTUAL (LAST THREE MONTHS)] int,            
  [ASSESSMENT PLANNED (LAST THREE MONTHS)] int,            
  [ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,            
  [ML ASSESSMENT PLANNED (LAST THREE MONTHS)] int,            
  [ML ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,            
  [RELEASE ASSESSMENT PLANNED (LAST THREE MONTHS)] int,            
  [RELEASE ASSESSMENT ACTUAL (LAST THREE MONTHS)] int,            
            
  [AUDIT PLANNED (Financial Year -Till Date)] int,            
  [AUDIT ACTUAL(Financial Year -Till Date)] int,            
  [HEALTH CHECK PLANNED (Financial Year -Till Date)] int,            
  [HEALTH CHECK ACTUAL (Financial Year -Till Date)] int,            
  [ASSESSMENT PLANNED (Financial Year -Till Date)] int,            
  [ASSESSMENT ACTUAL (Financial Year -Till Date)] int,            
  [ML ASSESSMENT PLANNED (Financial Year -Till Date)] int,            
  [ML ASSESSMENT ACTUAL (Financial Year -Till Date)] int,            
  [RELEASE ASSESSMENT PLANNED (Financial Year -Till Date)] int,            
  [RELEASE ASSESSMENT ACTUAL (Financial Year -Till Date)] int,            
              
  [ACCOUNTS NOT SUBMITTED] int,            
  [PROJECTS NOT SUBMITTED] int            
             
 );       
    
 select * into #tmpSpoc from (            
 select quality_spoc , ROW_NUMBER() over  (order by quality_spoc)row from (select distinct QUALITY_SPOC from BAS..project p inner join BAS..EMP_INFO e on e.emp_id=p.quality_spoc where p.QUALITY_SPOC is not null and e.dor is null and e.CSM_TITLE_ID=7) test
  
) a            
            
 declare @counter int=(select max(row) from #tmpSpoc)            
            
 while(@counter>0)            
 begin            
            
 select @assignedTo=quality_spoc from #tmpSpoc where row=@counter     
 set @counter=@counter-1;            
            
 select @assignedToName= FRST_NM from bas..emp_info where EMP_ID=@assignedTo and DOR is NULL         
              
 select  @email=email_id from bas..emp_info where EMP_ID=@assignedTo and DOR is NULL      
            
 --select @accounts=count(distinct CUST_ID) from csp..task where ASSIGNED_TO=@assignedTo and CUST_ID!=0            
 --select @projects=count(distinct PROJ_ID) from csp..task where ASSIGNED_TO=@assignedTo and PROJ_ID is not null            
            
 select @accounts= count( distinct CUST_ID) from  bas..project where quality_spoc=@assignedTo and CUST_ID!='0'            
             
 select @projects=count(proj_id) from bas..project where quality_spoc=@assignedTo and isnull(proj_status,'') != 'close'    
 --and            
 --proj_id not in            
 --(select proj_id from csp..Project_configuration_Data where Configuration_Setting_Id=3 and Bit_Value=1 and Is_Approved=1)            
            
            
 select @accountsNotSubmitted=count( distinct cust_id) from csp..task where status not in ('COMPLETED','IN PROGRESS','PLANNED') and assigned_to=@assignedTo            
 select @projectsNotSubmitted=count(distinct proj_id) from csp..task where status not in ('COMPLETED','IN PROGRESS','PLANNED') and assigned_to=@assignedTo            
             
 create table #tmpResultCurrent(Title varchar(100),Planned int,Actual int,Assigned_To varchar(100));            
 create table #tmpResultLastThree(Title varchar(100),Planned int,Actual int,Assigned_To varchar(100));            
 create table #tmpResultFinYear(Title varchar(100),Planned int,Actual int,Assigned_To varchar(100));            
 create table #tmpTitles(Title varchar(100));            
              
            
            
 with Auditors as             (            
 select distinct(quality_spoc) as emp_id from bas..project where QUALITY_SPOC is not null            
 ),            
 cte1 as(            
 select t.id as 'taskid', cnt = case when exists(select 1 from csp..audit_checklist_execution_summary where assessment_id = t.id and ISACTIVE =1) then 1 else 0 end,            
 a.emp_id, tc.ID as 'task_cat_id', tc.title, t.due_date            
 from csp..task t     
 inner join csp..TASK_CATEGORY tc on t.TASK_CATEGORY_ID = tc.ID            
            
  inner join bas..PROCESS_MODEL_AUDITOR a on a.emp_id = t.owner or t.assigned_to = a.emp_id or exists(select 1 from csp..AUDIT_SCHEDULE where AUDITOR_EMP_ID = a.emp_id and task_id = t.id )            
    inner join bas..project pj on pj.proj_id = t.proj_id            
 where t.TASK_CATEGORY_ID in (select options from csp..parameter_table where name ='AUDIT_CATEGORY') and t.status!='cancelled' and t.ISACTIVE=1            
 and (t.due_date between @CurrentMonthStart and CAST(eomonth(@revisedate) AS date)) and t.PROJ_ID not in             
 (select proj_id from csp..Project_configuration_Data where Configuration_Setting_Id=5 and Bit_Value=1 and Is_Approved=1) and isnull(pj.proj_status,'') != 'close'            
             
 )            
            
 insert #tmpResultCurrent            
 select title, count(taskid) as 'Planned', sum(cnt ) as 'Actual', emp_id from cte1             
 group by title, emp_id order by emp_id, TITLE;            
            
            
            
 with Auditors as            
 (            
 select distinct(quality_spoc) as emp_id from bas..project where QUALITY_SPOC is not null            
 ),            
 cte1 as(            
 select t.id as 'taskid', cnt = case when exists(select 1 from csp..audit_checklist_execution_summary where assessment_id = t.id and ISACTIVE =1) then 1 else 0 end,            
 a.emp_id, tc.ID as 'task_cat_id', tc.title, t.due_date            
 from csp..task t            
 inner join csp..TASK_CATEGORY tc on t.TASK_CATEGORY_ID = tc.ID            
            
  inner join BAS..PROCESS_MODEL_AUDITOR a on a.emp_id = t.owner or t.assigned_to = a.emp_id or exists(select 1 from csp..AUDIT_SCHEDULE where AUDITOR_EMP_ID = a.emp_id and task_id = t.id )            
    inner join bas..project pj on pj.proj_id = t.proj_id            
 where t.TASK_CATEGORY_ID in (select options from csp..parameter_table where name ='AUDIT_CATEGORY') and t.status!='cancelled' and t.ISACTIVE=1            
 and (t.due_date between @LastThreeMonthStart and @LastThreeMonthEnd) and t.PROJ_ID not in             
 (select proj_id from csp..Project_configuration_Data where Configuration_Setting_Id=5 and Bit_Value=1 and Is_Approved=1) and isnull(pj.proj_status,'') != 'close'            
             
             
  )            
            
 insert  #tmpResultLastThree            
 select title, count(taskid) as 'Planned', sum(cnt ) as 'Actual', emp_id from cte1             
 group by title, emp_id order by emp_id, TITLE;            
            
            
            
 with Auditors as            
 (            
 select distinct(quality_spoc) as emp_id from bas..project where QUALITY_SPOC is not null            
 ),            
 cte1 as(            
 select t.id as 'taskid', cnt = case when exists(select 1 from csp..audit_checklist_execution_summary where assessment_id = t.id and ISACTIVE =1) then 1 else 0 end,            
 a.emp_id, tc.ID as 'task_cat_id', tc.title, t.due_date            
 from csp..task t            
 inner join csp..TASK_CATEGORY tc on t.TASK_CATEGORY_ID = tc.ID            
            
  inner join BAS..PROCESS_MODEL_AUDITOR a on a.emp_id = t.owner or t.assigned_to = a.emp_id or exists(select 1 from csp..AUDIT_SCHEDULE where AUDITOR_EMP_ID = a.emp_id and task_id = t.id )            
    inner join bas..project pj on pj.proj_id = t.proj_id            
 where t.TASK_CATEGORY_ID in (select options from csp..parameter_table where name ='AUDIT_CATEGORY') and t.status!='cancelled' and t.ISACTIVE=1            
 and (t.due_date between @FinancialYearStart and cast(@revisedate as DATE))  and t.PROJ_ID not in             
 (select proj_id from csp..Project_configuration_Data where Configuration_Setting_Id=5 and Bit_Value=1 and Is_Approved=1) and isnull(pj.proj_status,'') != 'close'            
             
             
  )            
            
 insert  #tmpResultFinYear            
 select title, count(taskid) as 'Planned', sum(cnt ) as 'Actual', emp_id from cte1             
 group by title, emp_id order by emp_id, TITLE;           
            
 insert #tmpTitles            
 select title from csp..TASK_CATEGORY tc inner join csp..parameter_table pt on tc.ID=pt.OPTIONS where pt.NAME='AUDIT_CATEGORY'             
            
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
  Raiserror('PROCESS HEALTH CHECK Title in the #tmpFinal table is not available', 16, 1)        
 END        
 ELSE         
 BEGIN        
 select @healthCheckPlannedCurrent= Planned,@healthCheckActualCurrent=Actual from #tmpFinal where title='PROCESS HEALTH CHECK'         
 END        
        
 IF(select COUNT(*) from #tmpFinal where title='PROCESS ASSESSMENT') = 0        
 BEGIN        
  Raiserror('PROCESS ASSESSMENT Title in the #tmpFinal table is not available', 16, 1)        
 END        
 ELSE BEGIN        
 select @assessmentPlannedCurrent= Planned,@assessmentActualCurrent=Actual from #tmpFinal where title='PROCESS ASSESSMENT'         
 END        
        
 IF(select COUNT(*) from #tmpFinal where title='Maturity Level Assessment') = 0        
 BEGIN        
  Raiserror('Maturity Level Assessment Title in the #tmpFinal table is not available', 16, 1)        
 END        
 ELSE BEGIN        
 select @maturityLevelAssessmentPlannedCurrent= Planned,@maturityLevelAssessmentActualCurrent=Actual from #tmpFinal where title='Maturity Level Assessment'        
 END        
        
 IF(select COUNT(*) from #tmpFinal where title='Release Assessment') = 0        
 BEGIN        
  Raiserror('Release Assessment Title in the #tmpFinal table is not available', 16, 1)        
 END        
 ELSE BEGIN        
 select @releaseAssessmentPlannedCurrent= Planned,@releaseAssessmentActualCurrent=Actual from #tmpFinal where title='Release Assessment'          
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
        
 IF(select COUNT(*) from #tmpFinalLastThree where title='Maturity Level Assessment') = 0        
 BEGIN        
 Raiserror('Maturity Level Assessment Title in the #tmpFinalLastThree table is not available', 16, 1)        
 END        
 ELSE         
 BEGIN        
 select @maturityLevelAssessmentPlannedLastThree= Planned,@maturityLevelAssessmentActualLastThree=Actual from #tmpFinalLastThree where title='Maturity Level Assessment'        
 END        
        
 IF(select COUNT(*) from #tmpFinalLastThree where title='Release Assessment') = 0        
 BEGIN        
 Raiserror('Release Assessment Title in the #tmpFinalLastThree table is not available', 16, 1)        
 END        
 ELSE         
 BEGIN        
 select @releaseAssessmentPlannedLastThree= Planned,@releaseAssessmentActualLastThree=Actual from #tmpFinalLastThree where title='Release Assessment'            
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
        
 IF(select COUNT(*) from #tmpFinalFinYear where title='Maturity Level Assessment') = 0        
 BEGIN        
  Raiserror('Maturity Level Assessment Title in the #tmpFinalFinYear table is not available', 16, 1)        
 END        
 ELSE         
 BEGIN        
 select @maturityLevelAssessmentPlannedFinYear= Planned,@maturityLevelAssessmentActualFinYear=Actual from #tmpFinalFinYear where title='Maturity Level Assessment'            
 END        
        
 IF(select COUNT(*) from #tmpFinalFinYear where title='Release Assessment') = 0        
 BEGIN        
  Raiserror('Release Assessment Title in the #tmpFinalFinYear table is not available', 16, 1)        
 END        
 ELSE         
 BEGIN        
 select @releaseAssessmentPlannedFinyear= Planned,@releaseAssessmentActualFinYear=Actual from #tmpFinalFinYear where title='Release Assessment'            
 END            
             
            
 ----CurrentPercent            
            
   set @plannedTotalCurrent = @auditPlannedCurrent+@healthCheckPlannedCurrent+@assessmentPlannedCurrent+@maturityLevelAssessmentPlannedCurrent+@releaseAssessmentPlannedCurrent;            
         
   set @actualTotalCurrent = @auditActualCurrent+@healthCheckActualCurrent+@assessmentActualCurrent+@maturityLevelAssessmentActualCurrent+@releaseAssessmentActualCurrent;            
        
 if(@plannedTotalCurrent!=0)            
 begin            
  set @percentCurrent =(cast(@actualTotalCurrent as decimal)/cast(@plannedTotalCurrent as decimal))*100;            
 end            
            
 ----LastThreePercent            
            
 set @plannedTotalLastThree = @auditPlannedLastThree+@healthCheckPlannedLastThree+@assessmentPlannedLastThree+@maturityLevelAssessmentPlannedLastThree+@releaseAssessmentPlannedLastThree;            
            
 set @actualTotalLastThree = @auditActualLastThree+@healthCheckActualLastThree+@assessmentActualLastThree+@maturityLevelAssessmentActualLastThree+@releaseAssessmentActualLastThree;            
         
 if(@plannedTotalLastThree!=0)            
 begin            
  set @percentLastThree=(cast(@actualTotalLastThree as decimal)/cast(@plannedTotalLastThree as decimal))*100;            
 end            
            
 ----FinYearPercent            
            
 set @plannedTotalFinyear = @auditPlannedFinYear+@healthCheckPlannedFinYear+@assessmentPlannedFinYear+@maturityLevelAssessmentPlannedFinYear+@releaseAssessmentPlannedFinyear;            
             
 set @actualTotalFinyear = @auditActualFinYear+@healthCheckActualFinYear+@assessmentActualFinYear+@maturityLevelAssessmentActualFinYear+@releaseAssessmentActualFinYear;            
          
           
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
  @maturityLevelAssessmentPlannedCurrent ML_PLN_CURR,             
  @maturityLevelAssessmentActualCurrent ML_ACT_CURR,            
  @releaseAssessmentPlannedCurrent RA_PLN_CURR,             
  @releaseAssessmentActualCurrent RA_ACT_CURR,             
             
             
             
 @auditPlannedLastThree AUDIT_PLN_LASTTHREE,             
 @auditActualLastThree AUDIT_ACT_LASTTHREE,             
 @healthCheckPlannedLastThree HC_PLN_LASTTHREE,             
 @healthCheckActualLastThree HC_ACT_LASTTHREE,            
 @assessmentPlannedLastThree ASSESSMENT_PLN_LASTTHREE,              
  @assessmentActualLastThree ASSESSMENT_ACT_LASTTHREE,            
  @maturityLevelAssessmentPlannedLastThree ML_PLN_LASTTHREE,             
  @maturityLevelAssessmentActualLastThree ML_ACT_LASTTHREE,             
  @releaseAssessmentPlannedLastThree RA_PLN_LASTTHREE,             
 @releaseAssessmentActualLastThree RA_ACT_LASTTHREE,            
            
            
 @auditPlannedFinYear AUDIT_PLN_FinYEAR,             
 @auditActualFinYear AUDIT_ACT_FinYEAR,            
 @healthCheckPlannedFinYear HC_PLN_FinYEAR,             
 @healthCheckActualFinYear HC_ACT_FinYEAR,            
 @assessmentPlannedFinYear ASSESSMENT_PLN_FinYear,            
 @assessmentActualFinYear ASSESSMENT_ACT_FinYear,             
 @maturityLevelAssessmentPlannedFinYear ML_PLN_FinYear,             
 @maturityLevelAssessmentActualFinYear ML_ACT_FinYear,            
 @releaseAssessmentPlannedFinyear RA_PLN_FinYear,             
 @releaseAssessmentActualFinYear RA_ACT_FinYear,            
             
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
GO