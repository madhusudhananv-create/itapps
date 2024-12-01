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
