
IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'TASK' AND COLUMN_NAME='IS_DRAFT')
BEGIN
ALTER TABLE TASK ADD IS_DRAFT bit NULL
END
GO

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

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getListofEventsandTasks' AND TYPE='P')
BEGIN
       DROP PROCEDURE reports_getListofEventsandTasks
END
GO

CREATE PROCEDURE  [dbo].[reports_getListofEventsandTasks]                              

@startDate Datetime,                            
@endDate Datetime  ,    
@Customer varchar(50) ='0'                      
                      
AS                                      

BEGIN          
           
select c.CUST_NM ,P.PROJ_NM,TP.TITLE AS Type,TC.TITLE as Category,      
T.DESCRIPTION As [Audit / Assessment Title],     
[Appraiser Name  / Auditor Name]=(Select TOP 1 E.frst_nm from emp_info E (NOLOCK) WHERE e.EMP_ID=sc.AUDITOR_EMP_ID ),      
STUFF((select ',' + E.FRST_NM from emp_info E join      
AUDIT_SCHEDULE_REF auditee on E.EMP_ID = auditee.VALUE AND auditee.[KEY]='AUDITEE_EMP_ID'       
and auditee.ISACTIVE=1 and auditee.AUDIT_SCHEDULE_ID = sc.ID      
for xml path ('')),1,1,'')as [Appraisee Name(s) / Auditee Name (s)],      
T.STATUS,    
Format(T.SCHEDULED_START_DATE,'yyyy-MM-dd')SCHEDULED_START_DATE ,      
Format(T.DUE_DATE,'yyyy-MM-dd')DUE_DATE,      
Format(S.PLANNED_AUDIT_START_DATE,'yyyy-MM-dd')PLANNED_AUDIT_START_DATE,      
Format(S.PLANNED_AUDIT_END_DATE,'yyyy-MM-dd')PLANNED_AUDIT_END_DATE,
Format(S.ACTUAL_AUDIT_START_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_START_DATE,      
Format(S.ACTUAL_AUDIT_END_DATE,'yyyy-MM-dd')ACTUAL_AUDIT_END_DATE,S.AUDIT_PLANNED_HOURS     
     
from TASK T      
join CUSTOMER c on t.CUST_ID = c.CUST_ID                                
join PROJECT p on t.PROJ_ID = p.PROJ_ID        
join TASK_TYPE TP on t.TASK_TYPE_ID = Tp.ID and T.ISACTIVE=1 and tp.ISACTIVE=1      
join TASK_CATEGORY TC on t.TASK_CATEGORY_ID = TC.id and TC.ISACTIVE=1      
left join AUDIT_CHECKLIST_EXECUTION_SUMMARY S ON T.ID = S.ASSESSMENT_ID and s.ISACTIVE=1  
LEFT JOIN AUDIT_SCHEDULE sc ON sc.TASK_ID=T.ID  
where t.DUE_DATE between @startDate and @endDate and (@customer = '0' or t.CUST_ID = @customer) 
and isnull(T.IS_DRAFT, 0) = 0     
order by 1,2,t.Due_date desc  
        
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTasksEventsSummary' AND TYPE='P')
BEGIN
       DROP PROCEDURE getTasksEventsSummary
END
GO

CREATE PROCEDURE [dbo].[getTasksEventsSummary]          

@customerID varchar(50)   ,      
@empID  varchar(50)   

AS          
BEGIN          
   
Declare @dt date=getdate(),  
@nextMonthStart DATE,  
@nextMonthEnd DATE,  
@nextWeekStart DATE,  
@nextWeekEnd DATE,   
@thisMonthStart DATE,  
@thisWeekStart Date,  
@eventTypeID int,  
@taskTypeID int  
    
SELECT @nextMonthStart=DATEADD(month, DATEDIFF(month, 0, @dt)+1, 0)  
    ,@nextMonthEnd=DATEADD(month, DATEDIFF(month, 0, @dt)+2, 0) -- EOMONTH(@nextMonthStart)  
     
SELECT @nextWeekStart=DATEADD(week, DATEDIFF(week, 0, @dt) + 1, 0)   
    ,@nextWeekEnd=DATEADD(week, DATEDIFF(week, 0, @dt) + 2, 0)   
   
SELECT @thisMonthStart=DATEADD(month, DATEDIFF(month, 0,@dt), 0)  
    ,@thisWeekStart=DATEADD(week, DATEDIFF(week, 0, @dt), 0)   
  
SELECT TOP 1 @eventTypeID=ID FROM [dbo].[TASK_TYPE] (NOLOCK) WHERE TITLE='Event'   
SELECT TOP 1 @taskTypeID=ID FROM [dbo].[TASK_TYPE] (NOLOCK) WHERE TITLE='Task'  
    
    
SELECT p.pri AS PRIORITY,ISNULL(DueEvents,0) DueEvents,ISNULL(OverdueEvents,0) OverdueEvents,ISNULL(NextWeekEvents,0) NextWeekEvents,ISNULL(NextMonthEvents,0) NextMonthEvents  
,ISNULL(DueTasks,0) DueTasks,ISNULL(OverdueTasks,0) OverdueTasks,ISNULL(NextWeekTasks,0) NextWeekTasks,ISNULL(NextMonthTasks,0) NextMonthTasks,  
ISNULL(ThisWeekEvents,0) ThisWeekEvents,ISNULL(ThisMonthEvents,0) ThisMonthEvents,ISNULL(ThisWeekTasks,0) ThisWeekTasks,ISNULL(thisMonthTasks,0) ThisMonthTasks  
FROM (SELECT 'HIGH' AS pri UNION SELECT 'MEDIUM'  AS pri UNION SELECT 'LOW'  AS pri) AS P  
LEFT JOIN   
(SELECT  T.PRIORITY,  
SUM(CASE WHEN (t.due_date >= @dt)     
AND t.TASK_TYPE_ID=@eventTypeID THEN 1 ELSE 0 END)  AS DueEvents,      
  
SUM(CASE WHEN T.STATUS IN('IN PROGRESS','PLANNED') and (t.due_date < @dt)     
AND t.TASK_TYPE_ID=@eventTypeID THEN 1 ELSE 0 END)  AS OverdueEvents,   
    
SUM(CASE WHEN (t.due_date >= @thisWeekStart and   t.due_date < @nextWeekStart)   
AND t.TASK_TYPE_ID=@eventTypeID THEN 1 ELSE 0 END)   AS ThisWeekEvents,   
  
SUM(CASE WHEN (t.due_date >= @nextWeekStart and   t.due_date < @nextWeekEnd)   
AND t.TASK_TYPE_ID=@eventTypeID THEN 1 ELSE 0 END)   AS NextWeekEvents,   
    
SUM(CASE WHEN (t.due_date >= @thisMonthStart and t.due_date < @nextMonthStart)     
AND t.TASK_TYPE_ID=@eventTypeID THEN 1 ELSE 0 END)  AS ThisMonthEvents,   
  
SUM(CASE WHEN (t.due_date >= @nextMonthStart and t.due_date < @nextMonthEnd)     
AND t.TASK_TYPE_ID=@eventTypeID THEN 1 ELSE 0 END)  AS NextMonthEvents,   
  
SUM(CASE WHEN (t.due_date >= @dt)     
AND t.TASK_TYPE_ID=@taskTypeID THEN 1 ELSE 0 END) AS DueTasks,      
  
SUM(CASE WHEN T.STATUS IN('IN PROGRESS','PLANNED') and (t.due_date < @dt)     
AND t.TASK_TYPE_ID=@taskTypeID THEN 1 ELSE 0 END)  AS OverdueTasks,     
      
SUM(CASE WHEN (t.due_date >= @thisWeekStart and   t.due_date < @nextWeekStart)   
AND t.TASK_TYPE_ID=@taskTypeID THEN 1 ELSE 0 END)  AS ThisWeekTasks,   
  
SUM(CASE WHEN (t.due_date >= @nextWeekStart and   t.due_date < @nextWeekEnd)   
AND t.TASK_TYPE_ID=@taskTypeID THEN 1 ELSE 0 END)  AS NextWeekTasks,   
  
SUM(CASE WHEN (t.due_date >= @thisMonthStart and t.due_date < @nextMonthStart)  
AND t.TASK_TYPE_ID=@taskTypeID THEN 1 ELSE 0 END) AS thisMonthTasks,  
  
SUM(CASE WHEN (t.due_date >= @nextMonthStart and t.due_date < @nextMonthEnd)  
AND t.TASK_TYPE_ID=@taskTypeID THEN 1 ELSE 0 END) AS NextMonthTasks  
FROM [TASK] T (NOLOCK)  
WHERE Due_Date IS NOT NULL  AND T.ISACTIVE=1 AND ISNULL(T.IS_DRAFT, 0) = 0     
AND T.CUST_ID=@customerID AND (T.due_date < @nextMonthEnd)      
AND (@empID ='-99' OR T.OWNER= @empID OR T.ASSIGNED_TO= @empID)   
GROUP BY T.PRIORITY) AS Summary    
ON P.pri = Summary.PRIORITY  

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTasksEventsDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE getTasksEventsDetails
END
GO

ALTER PROCEDURE [dbo].[getTasksEventsDetails]          

@customerID  varchar(50)  =NULL ,      
@projectID varchar(20)=NULL,  
@empID  varchar(50) ='-99' ,  
@eventTypeID int=0,  
@period varchar(5)=''  

AS          
BEGIN           

Declare @dt date=getdate(),  
@nextMonthStart DATE,  
@nextMonthEnd DATE,  
@nextWeekStart DATE,  
@nextWeekEnd DATE,   
@thisMonthStart DATE,  
@thisWeekStart Date,   
@taskTypeID int,  
@startDate DATETIME  =NULL,   
@endDate DATETIME =NULL  
  
   
SELECT @nextMonthStart=DATEADD(month, DATEDIFF(month, 0, @dt)+1, 0)  
    ,@nextMonthEnd=DATEADD(month, DATEDIFF(month, 0, @dt)+2, 0) -- EOMONTH(@nextMonthStart)  
     
SELECT @nextWeekStart=DATEADD(week, DATEDIFF(week, 0, @dt) + 1, 0)   
    ,@nextWeekEnd=DATEADD(week, DATEDIFF(week, 0, @dt) + 2, 0)   
   
SELECT @thisMonthStart=DATEADD(month, DATEDIFF(month, 0,@dt), 0)  
    ,@thisWeekStart=DATEADD(week, DATEDIFF(week, 0, @dt), 0)   
   
IF @period='TW'   -- this week  
BEGIN   
SELECT @startDate=@thisWeekStart  ,@endDate=@nextWeekStart  
END   
ELSE IF @period='NW'   -- Next week  
BEGIN   
SELECT @startDate=@nextWeekStart  ,@endDate=@nextWeekEnd  
END   
ELSE IF @period='TM'   -- this month  
BEGIN   
SELECT @startDate=@thisMonthStart  ,@endDate=@nextMonthStart  
END  
ELSE IF @period='NM'   -- next month  
BEGIN   
SELECT @startDate=@nextMonthStart  ,@endDate=@nextMonthEnd  
END   
ELSE IF @period='OD'   -- overdue  
BEGIN   
SELECT @endDate=@dt  
END   
ELSE    
BEGIN   
SELECT @endDate=@nextMonthEnd  
END  
      
SELECT   T.ID, T.CUST_ID AS CustomerID, C.CUST_NM AS CustomerName, T.PROJ_ID AS ProjectID, P.PROJ_NM AS ProjectName, TT.TITLE AS TaskType,  
TC.TITLE AS TASKCATEGORY, T.DESCRIPTION, T.STATUS, T.SCHEDULED_START_DATE AS ScheduledStartDate,T.PRIORITY, 
T.SCHEDULED_DURATION AS SCHEDULEDDURATION, T.DUE_DATE AS dueDate, CAST( T.OWNER  as varchar(10))  AS owner, 
CAST(T.Assigned_to as varchar(10)) AS Assignedto, CAST(A.AUDITOR_EMP_ID as varchar(10)) AS AUDITOREMPID          

FROM [TASK] T  (NOLOCK)      
INNER JOIN TASK_TYPE TT (NOLOCK) ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1      
INNER JOIN TASK_CATEGORY TC (NOLOCK) ON TC.ID = T.TASK_CATEGORY_ID        
LEFT JOIN AUDIT_SCHEDULE A (NOLOCK) ON T.ID = A.TASK_ID      
LEFT JOIN AUDIT_SCHEDULE_REF AE (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'      
LEFT JOIN CUSTOMER C  (NOLOCK) ON C.CUST_ID = T.CUST_ID        
LEFT JOIN PROJECT P (NOLOCK) ON P.PROJ_ID = T.PROJ_ID              
WHERE Due_Date IS NOT NULL  AND T.ISACTIVE=1  AND ISNULL(T.IS_DRAFT, 0) = 0     
AND (ISNULL(@eventTypeID,0)=0 OR T.TASK_TYPE_ID=@eventTypeID)  
AND T.CUST_ID=@customerID AND (T.due_date >= @startDate OR @period NOT IN('TW','TM','NW','NM') ) AND T.due_date < @endDate   
AND (ISNULL(@period,'')!='OD' OR (@period='OD'  AND  T.STATUS IN('IN PROGRESS','PLANNED')))    
AND (@empID ='-99' OR T.OWNER= @empID OR T.ASSIGNED_TO= @empID)   
ORDER BY T.DUE_DATE DESC  

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallTaskDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallTaskDetails]
END
GO

CREATE PROCEDURE [dbo].[getOverallTaskDetails]  
  
@START_DATE DATETIME,  
@END_DATE DATETIME  ,  
@CUSTOMER_ID varchar(MAX) = '-1',  
@PROJECT_ID varchar(MAX) = '-1',  
@TASK_CATEGORY varchar(MAX) = '-1'  
  
AS  
  
BEGIN  
  
DECLARE @skipInternalAuditId INT = (SELECT ID FROM PROJECT_CONFIGURATION_SETTING WHERE SETTING_NAME = 'SKIP INTERNAL AUDIT' AND ISACTIVE = 1);                
      
WITH AUDITS AS (      
    SELECT      
        T.CUST_ID, T.PROJ_ID, T.ID,T.DESCRIPTION, T.STATUS, T.DUE_DATE, TR.FREQUENCY,ACT.actual_audit_end_date    
    FROM      
        TASK T       
        LEFT JOIN AUDIT_SCHEDULE ASCH ON ASCH.TITLE = T.DESCRIPTION AND ASCH.CUST_ID = T.CUST_ID AND ASCH.PROJ_ID = T.PROJ_ID       
            AND ASCH.ISACTIVE = 1 AND (T.PARENT_TASK_ID = ASCH.TASK_ID OR T.ID = ASCH.TASK_ID)     
  LEFT JOIN TASK_RECURRENCE TR ON T.ID = TR.TASK_ID AND TR.ISACTIVE = 1    
        LEFT JOIN AUDIT_SCHEDULE_REF ASREF ON ASREF.AUDIT_SCHEDULE_ID = ASCH.ID AND ASREF.ISACTIVE = 1      
        LEFT JOIN AUDIT_CHECKLIST_EXECUTION_SUMMARY ACT ON T.ID = ACT.ASSESSMENT_ID AND ACT.ISACTIVE = 1      
    WHERE      
        T.STATUS NOT IN ('CANCELLED') AND T.ISACTIVE = 1 AND T.DUE_DATE IS NOT NULL AND ISNULL(T.IS_DRAFT, 0) = 0 
  AND T.TASK_CATEGORY_ID in (select * from fn_getParameterTableOptionIds('AUDIT_CATEGORY'))       
        AND COALESCE(T.SCHEDULED_START_DATE, T.DUE_DATE) BETWEEN @START_DATE AND @END_DATE      
    GROUP BY      
        T.CUST_ID, T.PROJ_ID, T.ID,T.DESCRIPTION, T.STATUS, T.DUE_DATE, TR.FREQUENCY, ACT.actual_audit_end_date  
)      
      
SELECT         
    C.CUST_NM, P.PROJ_NM,       
    ISO_STANDARDS = STUFF((      
        SELECT ', ' + PIS.STANDARD_NAME      
        FROM PROJECT_ISO_STANDARD PIS       
        INNER JOIN PROJECT_ISO_STANDARD_MAPPING PIM ON PIS.ID = PIM.ISO_STANDARD_ID      
        WHERE PIM.PROJECT_ID = P.PROJ_ID AND PIS.ISACTIVE = 1      
        FOR XML PATH('')), 1, 2, ''),      
    CERTIFICATION_SCOPES = STUFF((      
        SELECT ', ' + PIS.STANDARD_NAME + ' - ' + PCS.SCOPE_NAME      
        FROM PROJECT_CERTIFICATION_SCOPE PCS       
        INNER JOIN PROJECT_CERTIFICATION_SCOPE_MAPPING PCM ON PCS.ID = PCM.CERTIFICATION_SCOPE_ID      
        INNER JOIN PROJECT_ISO_STANDARD PIS ON PIS.ID = PCS.ISO_STANDARD_ID      
        WHERE PCM.PROJECT_ID = P.PROJ_ID AND PCS.ISACTIVE = 1      
        FOR XML PATH('')), 1, 2, ''),      
    CONVERT(VARCHAR, P.START_DATE, 107) AS START_DATE,      
    CONVERT(VARCHAR, P.END_DATE, 107) AS END_DATE,      
    HEADCOUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE PR WHERE PR.PROJ_ID = P.PROJ_ID AND PR.BILL_FLG =1 AND PR.CURR_INDC ='Y' AND PR.END_DATE >= GETDATE()),      
    AUDIT_TITLE = A.DESCRIPTION,      
    AUDIT_STATUS = A.STATUS,      
    LAST_AUDITED_DATE = CONVERT(VARCHAR, A.actual_audit_end_date, 107),      
    FREQUENCY = A.FREQUENCY,      
    AUDITS_PLANNED = (SELECT COUNT(ID) FROM AUDITS WHERE STATUS NOT IN ('CANCELLED','COMPLETED') AND CUST_ID = C.CUST_ID AND PROJ_ID = P.PROJ_ID),      
    AUDITS_COMPLETED = (SELECT COUNT(ID) FROM AUDITS WHERE STATUS IN ('COMPLETED') AND CUST_ID = C.CUST_ID AND PROJ_ID = P.PROJ_ID),      
    P.PROJ_ID, C.CUST_ID      
FROM       
    PROJECT P       
INNER JOIN       
    CUSTOMER C ON P.CUST_ID = C.CUST_ID        
LEFT JOIN       
    AUDITS A ON A.PROJ_ID = P.PROJ_ID AND A.ID = (SELECT TOP 1 ID FROM AUDITS WHERE PROJ_ID = P.PROJ_ID ORDER BY ID DESC)      
LEFT JOIN       
    TASK T ON T.ID = A.ID AND T.ISACTIVE = 1 AND ISNULL(T.STATUS,'')!='CANCELLED' AND ISNULL(T.IS_DRAFT, 0) = 0      
    
WHERE       
 P.PROJ_ID NOT IN (SELECT PROJ_ID FROM PROJECT_CONFIGURATION_DATA WHERE ISACTIVE = 1 AND IS_APPROVED = 1 AND CONFIGURATION_SETTING_ID = @skipInternalAuditId  
 AND END_DATE IS NULL OR END_DATE > GETDATE())      
    AND COALESCE(T.SCHEDULED_START_DATE, T.DUE_DATE) BETWEEN @START_DATE AND @END_DATE      
    AND ((@CUSTOMER_ID = '-1' AND @PROJECT_ID = '-1')      
        OR (@CUSTOMER_ID <> '-1' AND @PROJECT_ID = '-1' AND C.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER_ID, ',')))      
        OR (@CUSTOMER_ID <> '-1' AND @PROJECT_ID <> '-1' AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJECT_ID, ','))))      
    AND (@TASK_CATEGORY = '-1' OR T.TASK_CATEGORY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@TASK_CATEGORY, ',')))      
GROUP BY      
    C.CUST_NM, P.PROJ_NM, P.START_DATE, P.END_DATE, P.PROJ_ID, C.CUST_ID, A.DESCRIPTION, A.STATUS, A.ID, A.DUE_DATE, A.FREQUENCY  ,A.actual_audit_end_date  
ORDER BY       
    P.PROJ_NM, C.CUST_NM      
      
END      
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTaskDetailsByDateRange' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getTaskDetailsByDateRange]
END
GO

CREATE PROCEDURE [dbo].[getTaskDetailsByDateRange]  

@START_DATE DATETIME,  
@END_DATE DATETIME  ,  
@EMP_ID varchar(20)   ,  
@CUSTOMER_ID varchar(MAX) = '-1',  
@PROJECT_ID varchar(MAX) = '-1',  
@TASK_CATEGORY varchar(MAX) = '-1',  
@Range varchar(1) ='Y'  

AS

BEGIN  

DECLARE @skipInternalAuditId INT = (SELECT ID FROM PROJECT_CONFIGURATION_SETTING WHERE SETTING_NAME = 'SKIP INTERNAL AUDIT' AND ISACTIVE = 1)  

IF @Range<>'A'  

BEGIN  

SELECT distinct  T.ID, DATEPART(M, coalesce(T.SCHEDULED_START_DATE, t.due_date)) MONTH_ID,  
DATEPART(Q, coalesce(T.SCHEDULED_START_DATE, t.due_date)) QUARTER_ID,  
DATEPART(WK, coalesce(T.SCHEDULED_START_DATE, t.due_date)) WEEK_ID,  
DATEPART(D, coalesce(T.SCHEDULED_START_DATE, t.due_date)) DAY_ID,  
DATENAME(dw,coalesce(T.SCHEDULED_START_DATE, t.due_date)) DATE_NAME,  
cast(DATEADD( DAY , 2 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10)) [Week_Start_Date],  
cast(DATEADD( DAY , 8 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10))  [Week_End_Date],  
T.CUST_ID, C.CUST_NM, T.PROJ_ID, P.PROJ_NM, TT.ID TASK_TYPE_ID, TT.TITLE TASK_TYPE,TC.ID TASK_CATEGORY_ID, TC.TITLE TASK_CATEGORY, T.DESCRIPTION, T.STATUS,  
T.SCHEDULED_START_DATE, T.SCHEDULED_DURATION, T.DUE_DATE, TC.COLOR_BG, TC.COLOR_MG, T.OWNER, T.Assigned_to, A.AUDITOR_EMP_ID  
,'' AS FREQUENCY  
FROM [TASK] T   (NOLOCK)  
INNER JOIN TASK_TYPE TT  (NOLOCK)  ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1  
INNER JOIN TASK_CATEGORY TC  (NOLOCK)  ON TC.ID = T.TASK_CATEGORY_ID  
LEFT JOIN AUDIT_SCHEDULE A   (NOLOCK) ON T.ID = A.TASK_ID  
LEFT JOIN AUDIT_SCHEDULE_REF AE   (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'  
LEFT JOIN CUSTOMER C   (NOLOCK) ON C.CUST_ID = T.CUST_ID  
LEFT JOIN PROJECT P  (NOLOCK)  ON P.PROJ_ID = T.PROJ_ID  
LEFT JOIN PROJ_RESOURCE PR on p.proj_id = pr.proj_id and pr.emp_id = @emp_id and pr.end_date > Getdate()  
WHERE  
P.PROJ_ID NOT IN (SELECT PROJ_ID FROM PROJECT_CONFIGURATION_DATA WHERE ISACTIVE = 1 AND IS_APPROVED = 1 AND CONFIGURATION_SETTING_ID = @skipInternalAuditId  
AND END_DATE IS NULL OR END_DATE > GETDATE())  
AND (T.TASK_CATEGORY_ID IN (SELECT * FROM fn_getParameterTableOptionIds('TASK_VIEW'))  
or (t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID)) AND 
(ISNULL(t.IS_DRAFT, 0) = 0 OR (t.IS_DRAFT = 1 AND t.OWNER = @EMP_ID))
AND Due_Date is not null and ((coalesce(T.SCHEDULED_START_DATE, t.due_date) >= @START_DATE and  coalesce(T.SCHEDULED_START_DATE, t.due_date) <= @END_DATE  ))  
AND (  
(@CUSTOMER_ID = '-1' AND @PROJECT_ID = '-1')  
OR  
(@CUSTOMER_ID <> '-1' AND @PROJECT_ID = '-1' AND C.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER_ID, ',')))  
OR  
(@CUSTOMER_ID <> '-1' AND @PROJECT_ID <> '-1' AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJECT_ID, ','))))  
AND ((@TASK_CATEGORY = '-1' OR T.TASK_CATEGORY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@TASK_CATEGORY, ',')))) 

END  

ELSE  

BEGIN  

SELECT distinct  T.ID, DATEPART(M, coalesce(T.SCHEDULED_START_DATE, t.due_date)) MONTH_ID,  
DATEPART(Q, coalesce(T.SCHEDULED_START_DATE, t.due_date)) QUARTER_ID,  
DATEPART(WK, coalesce(T.SCHEDULED_START_DATE, t.due_date)) WEEK_ID,  
DATEPART(D, coalesce(T.SCHEDULED_START_DATE, t.due_date)) DAY_ID,  
DATENAME(dw,coalesce(T.SCHEDULED_START_DATE, t.due_date)) DATE_NAME,  
cast(DATEADD( DAY , 2 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10)) [Week_Start_Date],  
cast(DATEADD( DAY , 8 - DATEPART(WEEKDAY, coalesce(T.SCHEDULED_START_DATE, t.due_date)), CAST (coalesce(T.SCHEDULED_START_DATE, t.due_date) AS DATE )) as varchar(10))  [Week_End_Date],  
T.CUST_ID, C.CUST_NM, T.PROJ_ID, P.PROJ_NM, TT.ID TASK_TYPE_ID, TT.TITLE TASK_TYPE,TC.ID TASK_CATEGORY_ID, TC.TITLE TASK_CATEGORY, T.DESCRIPTION, T.STATUS,  
T.SCHEDULED_START_DATE, T.SCHEDULED_DURATION, T.DUE_DATE, TC.COLOR_BG, TC.COLOR_MG, T.OWNER, T.Assigned_to, A.AUDITOR_EMP_ID     ,  
ISNULL(TR.FREQUENCY ,'On-Going') AS FREQUENCY  
FROM [TASK] T   (NOLOCK)  
INNER JOIN TASK_TYPE TT  (NOLOCK)  ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1  
INNER JOIN TASK_CATEGORY TC  (NOLOCK)  ON TC.ID = T.TASK_CATEGORY_ID  
LEFT JOIN AUDIT_SCHEDULE A   (NOLOCK) ON T.ID = A.TASK_ID  
LEFT JOIN AUDIT_SCHEDULE_REF AE   (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'  
LEFT JOIN CUSTOMER C   (NOLOCK) ON C.CUST_ID = T.CUST_ID  
LEFT JOIN PROJECT P  (NOLOCK)  ON P.PROJ_ID = T.PROJ_ID  
LEFT JOIN PROJ_RESOURCE PR on p.proj_id = pr.proj_id and pr.emp_id = @emp_id and pr.end_date > Getdate()  
LEFT JOIN TASK_RECURRENCE TR (NOLOCK) ON T.ID =TR.TASK_ID  
WHERE  
P.PROJ_ID NOT IN (SELECT PROJ_ID FROM PROJECT_CONFIGURATION_DATA WHERE ISACTIVE = 1 AND IS_APPROVED = 1 AND CONFIGURATION_SETTING_ID = @skipInternalAuditId  
AND END_DATE IS NULL OR END_DATE > GETDATE())  
AND (T.TASK_CATEGORY_ID IN (SELECT * FROM fn_getParameterTableOptionIds('TASK_VIEW'))  
or (t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID)) AND 
(ISNULL(t.IS_DRAFT, 0) = 0 OR (t.IS_DRAFT = 1 AND t.OWNER = @EMP_ID))
AND Due_Date is not null and ((  coalesce(T.SCHEDULED_START_DATE, t.due_date) >= @START_DATE and  
coalesce(T.SCHEDULED_START_DATE, t.due_date) <= @END_DATE  )) AND t.TASK_TYPE_ID=1  
AND (  
(@CUSTOMER_ID = '-1' AND @PROJECT_ID = '-1')  
OR  
(@CUSTOMER_ID <> '-1' AND @PROJECT_ID = '-1' AND C.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER_ID, ',')))  
OR  
(@CUSTOMER_ID <> '-1' AND @PROJECT_ID <> '-1' AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJECT_ID, ','))))  
AND ((@TASK_CATEGORY = '-1' OR T.TASK_CATEGORY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@TASK_CATEGORY, ',')))) 
END  

END  
GO

Declare @RESOURCEID int = 119
Declare @EMPID varchar(10) = '104859'
Declare @RescourceName varchar(250) = 'Dashboard > Action Items > CSM Approval'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


Declare @RESOURCEID int = 120
Declare @EMPID varchar(10) = '104859'
Declare @RescourceName varchar(250) = 'Dashboard > Action Items > Send Update to CSM by PM'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


--IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'PROJECT_INSCOPE_DETAILS' AND COLUMN_NAME='CUST_ID')
--BEGIN
--ALTER TABLE PROJECT_INSCOPE_DETAILS ADD CUST_ID varchar(50)
--END
--GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME='CSS_REFERENCE')
BEGIN
ALTER TABLE PROJECT_ACTIONITEM ADD CSS_REFERENCE VARCHAR(MAX) NULL
END
GO

IF  EXISTS(Select * from PROJECT_ACTIONITEM WHERE ISACTIVE=1 and BATCH_CUSTOMER_ID IS NOT NULL AND BATCH_CUSTOMER_MONTHLY_ID = 0 AND CSS_REFERENCE IS NULL)
BEGIN

UPDATE PA SET PA.CSS_REFERENCE = CONCAT('Question: ', QR.QUESTION, '    Rating: ', QR.RATING, '    Remarks: ', QR.RATING_DESCRIPTION),
PA.UPDATED_BY = '104859', PA.UPDATED_DATE = GETDATE() FROM PROJECT_ACTIONITEM PA
JOIN CSS_QUESTION_REPLIES QR ON QR.BATCH_CUSTOMER_ID = PA.BATCH_CUSTOMER_ID AND QR.ISACTIVE = 1          
WHERE PA.ISACTIVE = 1 AND PA.DESCRIPTION LIKE '%' + QR.QUESTION + '%'     
AND PA.CSS_REFERENCE IS NULL AND PA.BATCH_CUSTOMER_ID IS NOT NULL AND PA.BATCH_CUSTOMER_MONTHLY_ID = 0

END
GO

IF  EXISTS(Select * from PROJECT_ACTIONITEM WHERE ISACTIVE=1 and BATCH_CUSTOMER_ID = 0 AND BATCH_CUSTOMER_MONTHLY_ID IS NOT NULL AND CSS_REFERENCE IS NULL)
BEGIN

UPDATE PA SET PA.CSS_REFERENCE = CONCAT('Question: ', QR.QUESTION, '    Rating: ', QR.RATING, '    Remarks: ', QR.RATING_DESCRIPTION),
PA.UPDATED_BY = '104859', PA.UPDATED_DATE = GETDATE() FROM PROJECT_ACTIONITEM PA
JOIN CSS_QUESTION_REPLIES QR ON QR.BATCH_CUSTOMER_MONTHLY_ID = PA.BATCH_CUSTOMER_MONTHLY_ID AND QR.ISACTIVE = 1          
WHERE PA.ISACTIVE = 1 AND PA.DESCRIPTION LIKE '%' + QR.QUESTION + '%'
AND PA.CSS_REFERENCE IS NULL AND PA.BATCH_CUSTOMER_ID = 0 AND PA.BATCH_CUSTOMER_MONTHLY_ID IS NOT NULL 

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getActionItemsViewDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getActionItemsViewDetails]
END
GO

CREATE PROCEDURE [dbo].[getActionItemsViewDetails]                  
  
@PROJIDS VARCHAR(MAX)                  
    
AS 

BEGIN

SELECT DISTINCT P.CUST_ID AS CUST_ID, [PROJECT_ID] AS PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, PF.TITLE AS PORTFOLIO_NAME, A.ORIGINAL_DESCRIPTION,     
A.ID AS ACTION_ITEM_ID, A.RAG, A.DESCRIPTION, A.SOURCE, 
SOURCE_DESCRIPTION = CASE WHEN CHARINDEX(',', A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION) + 1) > 0 
            THEN LEFT(A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION) + 1) - 1)
            ELSE A.SOURCE_DESCRIPTION END, 
A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,  
A.PLANNED_TARGET_DATE, A.PLANNED_ACTUAL_DATE, A.BATCH_CUSTOMER_ID, A.BATCH_CUSTOMER_MONTHLY_ID, A.CSS_REFERENCE,
A.PRIORITY, A.COMPLETION_DATE, A.COMMENTS, A.CREATED_DATE, A.CREATED_BY, A.UPDATED_BY, A.UPDATED_DATE,                    
                    
CASE WHEN (A.TARGET_DATE < GETDATE() AND A.STATUS  IN ('Planned' , 'Started', 'Identified')) THEN 'PAST_DUE_DATE'              
WHEN  (A.TARGET_DATE >= GETDATE() AND A.STATUS  IN ('Planned' , 'Started',  'Identified')) THEN 'DUE_FOR_CLOSURE'                         
END  AS STATUS_TYPE, A.ISACTIVE  

FROM PROJECT_ACTIONITEM A                                      
INNER JOIN PROJECT P ON a.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,',')) AND A.ISACTIVE = 1               
LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJECT_ID                    
LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID                    
                
ORDER BY A.IDENTIFIED_DATE desc       
    
END    
GO

IF NOT EXISTS (select 1 from  CONFIGURATION_EXT where [KEY] = 'STRATEGIC_ACCOUNTS_PRESIDENT')
BEGIN
INSERT INTO CONFIGURATION_EXT
    ([KEY], [VALUE], CUST_ID, ISACTIVE, CREATED_BY, CREATED_DATE, UPDATED_DATE, UPDATED_BY)
VALUES
    ('STRATEGIC_ACCOUNTS_PRESIDENT', '212100001,202100007,202100104,202100122,201100081,CUST0258,201100074,CUST0007,CUST0283', -1,1, '105709', GETDATE(), GETDATE(), '105709');
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllAccounts' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllAccounts]
END
GO 
CREATE PROCEDURE  [dbo].[getAllAccounts]    
   
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
  select  '-7' as CUST_ID,'Strategic Accounts - President' as CUST_NM,7 as SORT_ORDER
  union        
  select  C.CUST_ID,C.CUST_NM , 8 as SORT_ORDER from CUSTOMER C   
  where c.CUST_ID in (select  distinct P.CUST_ID from PROJECT P where ISNULL(P.PROJ_STATUS,'') != 'Close')          
  order by SORT_ORDER,CUST_NM        
  
End  
GO











