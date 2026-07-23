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