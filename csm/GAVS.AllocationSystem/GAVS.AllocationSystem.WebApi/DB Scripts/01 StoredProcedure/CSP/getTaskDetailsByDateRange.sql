USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTaskDetailsByDateRange' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getTaskDetailsByDateRange
END
GO
/*  
---------------------------------------------------  
--  [dbo].[getTaskDetailsByDateRange] 
-- Author        : UNknown     
-- Date      :  NA   
-- Purpose       : get Task Details By DateRange
---------------------------------------------------   
-- ver     user             date             change     
-- 1.1    Indhu          20-12-2022       Added DAY_ID,QUARTER_ID for Monthly & Quarterly view
#########################################################################  */  
CREATE PROCEDURE [dbo].[getTaskDetailsByDateRange]      
@START_DATE DATETIME,      
@END_DATE DATETIME  ,    
@EMP_ID varchar(20)    
AS      
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
 FROM [CSP].[dbo].[TASK] T   (NOLOCK) 
  INNER JOIN TASK_TYPE TT  (NOLOCK)  ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1    
  INNER JOIN TASK_CATEGORY TC  (NOLOCK)  ON TC.ID = T.TASK_CATEGORY_ID      
  LEFT JOIN AUDIT_SCHEDULE A   (NOLOCK) ON T.ID = A.TASK_ID    
  LEFT JOIN AUDIT_SCHEDULE_REF AE   (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'    
  LEFT JOIN BAS.DBO.CUSTOMER C   (NOLOCK) ON C.CUST_ID = T.CUST_ID      
  LEFT JOIN BAS.DBO.PROJECT P  (NOLOCK)  ON P.PROJ_ID = T.PROJ_ID      
      
 WHERE Due_Date is not null and ((  coalesce(T.SCHEDULED_START_DATE, t.due_date) >= @START_DATE and  coalesce(T.SCHEDULED_START_DATE, t.due_date) <= @END_DATE  ))    
 and (@EMP_ID ='-99' OR t.OWNER= @EMP_ID OR T.ASSIGNED_TO= @EMP_ID OR A.AUDITOR_EMP_ID = @EMP_ID OR AE.VALUE= @EMP_ID)    
     
END      
