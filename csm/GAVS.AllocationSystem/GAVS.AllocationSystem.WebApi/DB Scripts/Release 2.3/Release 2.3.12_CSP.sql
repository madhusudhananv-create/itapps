USE CSP
GO
--Ticket - 13000703 — Events & Tasks Widget and View details
IF NOT EXISTS (SELECT 1 from dbo.FILTER_PREFERENCE WHERE TABLE_NAME='EVENT_TASK_DETAILS' AND FIELD_NAME='description')
BEGIN
INSERT INTO dbo.FILTER_PREFERENCE(TABLE_NAME,FIELD_NAME,DISPLAY_NAME,DATA_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE)  VALUES
('EVENT_TASK_DETAILS','description','Description','string','105683',DATEADD(HOUR,-10,getdate()),'105683',DATEADD(HOUR,-10,getdate())) 
END

--Ticket - 13000703 — Events & Tasks Widget and View details
IF NOT EXISTS (SELECT 1 from dbo.FILTER_PREFERENCE WHERE TABLE_NAME='EVENT_TASK_DETAILS' AND FIELD_NAME='taskType')
BEGIN
INSERT INTO dbo.FILTER_PREFERENCE(TABLE_NAME,FIELD_NAME,DISPLAY_NAME,DATA_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE)  VALUES
('EVENT_TASK_DETAILS','taskType','Task Type','number','105683',DATEADD(HOUR,-10,getdate()),'105683',DATEADD(HOUR,-10,getdate())) 
END 


--Ticket - 13000703 — Events & Tasks Widget and View details
IF NOT EXISTS (SELECT 1 from dbo.FILTER_PREFERENCE WHERE TABLE_NAME='EVENT_TASK_DETAILS' AND FIELD_NAME='status')
BEGIN
INSERT INTO dbo.FILTER_PREFERENCE(TABLE_NAME,FIELD_NAME,DISPLAY_NAME,DATA_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE)  VALUES
('EVENT_TASK_DETAILS','status','Status','number','105683',DATEADD(HOUR,-10,getdate()),'105683',DATEADD(HOUR,-10,getdate())) 
END 


--Ticket - 13000703 — Events & Tasks Widget and View details
IF NOT EXISTS (SELECT 1 from dbo.FILTER_PREFERENCE WHERE TABLE_NAME='EVENT_TASK_DETAILS' AND FIELD_NAME='priority')
BEGIN
INSERT INTO dbo.FILTER_PREFERENCE(TABLE_NAME,FIELD_NAME,DISPLAY_NAME,DATA_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE)  VALUES
('EVENT_TASK_DETAILS','priority','Priority','number','105683',DATEADD(HOUR,-10,getdate()),'105683',DATEADD(HOUR,-10,getdate())) 
END 


--Ticket - 13000703 — Events & Tasks Widget and View details
IF NOT EXISTS (SELECT 1 from dbo.FILTER_PREFERENCE WHERE TABLE_NAME='EVENT_TASK_DETAILS' AND FIELD_NAME='taskCategory')
BEGIN
INSERT INTO dbo.FILTER_PREFERENCE(TABLE_NAME,FIELD_NAME,DISPLAY_NAME,DATA_TYPE,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE)  VALUES
('EVENT_TASK_DETAILS','taskCategory','Category','string','105683',DATEADD(HOUR,-10,getdate()),'105683',DATEADD(HOUR,-10,getdate())) 
END 
ELSE
BEGIN
 UPDATE dbo.FILTER_PREFERENCE
 SET DATA_TYPE='number'
  WHERE TABLE_NAME='EVENT_TASK_DETAILS' AND FIELD_NAME='taskCategory'
END

GO


/****** Object:  StoredProcedure [dbo].[getTasksEventsSummary]    Script Date: 04-07-2022 15:02:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTasksEventsSummary' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getTasksEventsSummary
END
GO

/*
---------------------------------------------------
-- Author        : Indhu   
-- Date      : 04-07-2022    
-- Purpose       : get Tasks & Events Summary 
--------------------------------------------------- 
-- ver     user             date             change  
-- 1.0    Indhu          08-07-2022       initial version
#########################################################################  */
CREATE procedure [dbo].[getTasksEventsSummary]        
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
  FROM [CSP].[dbo].[TASK] T (NOLOCK)
  WHERE Due_Date IS NOT NULL  AND T.ISACTIVE=1 
  AND T.CUST_ID=@customerID AND (T.due_date < @nextMonthEnd)    
  AND (@empID ='-99' OR T.OWNER= @empID OR T.ASSIGNED_TO= @empID) 
  GROUP BY T.PRIORITY) AS Summary  
  ON P.pri = Summary.PRIORITY
END 

GO
 

/****** Object:  StoredProcedure [dbo].[getTasksEventsDetails]    Script Date: 04-07-2022 15:02:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTasksEventsDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getTasksEventsDetails
END
GO

/*
---------------------------------------------------
-- Author        : Indhu   
-- Date      : 13-07-2022    
-- Purpose       : get Tasks & Events Details 
--------------------------------------------------- 
-- ver     user             date             change  
-- 1.0    Indhu          13-07-2022       initial version
#########################################################################  */
CREATE procedure [dbo].[getTasksEventsDetails]        
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
    
  
 SELECT   T.ID, T.CUST_ID AS CustomerID, C.CUST_NM AS CustomerName, T.PROJ_ID AS ProjectID, P.PROJ_NM AS ProjectName, TT.TITLE AS TaskType,  TC.TITLE AS TASKCATEGORY, T.DESCRIPTION, T.STATUS,   
 T.SCHEDULED_START_DATE AS ScheduledStartDate,T.PRIORITY, T.SCHEDULED_DURATION AS SCHEDULEDDURATION, T.DUE_DATE AS dueDate, CAST( T.OWNER  as varchar(10))  AS owner, CAST(T.Assigned_to as varchar(10)) AS Assignedto, CAST(A.AUDITOR_EMP_ID as varchar(10))  AS AUDITOREMPID        
 FROM [CSP].[dbo].[TASK] T  (NOLOCK)    
 INNER JOIN TASK_TYPE TT (NOLOCK) ON TT.ID =  T.TASK_TYPE_ID and T.ISACTIVE = 1    
 INNER JOIN TASK_CATEGORY TC (NOLOCK) ON TC.ID = T.TASK_CATEGORY_ID      
  LEFT JOIN AUDIT_SCHEDULE A (NOLOCK) ON T.ID = A.TASK_ID    
  LEFT JOIN AUDIT_SCHEDULE_REF AE (NOLOCK) on AE.AUDIT_SCHEDULE_ID = A.id and [key] = 'AUDITEE_EMP_ID'    
  LEFT JOIN BAS.DBO.CUSTOMER C  (NOLOCK) ON C.CUST_ID = T.CUST_ID      
  LEFT JOIN BAS.DBO.PROJECT P (NOLOCK) ON P.PROJ_ID = T.PROJ_ID            
  WHERE Due_Date IS NOT NULL  AND T.ISACTIVE=1 
  AND (ISNULL(@eventTypeID,0)=0 OR T.TASK_TYPE_ID=@eventTypeID)
  AND T.CUST_ID=@customerID AND (T.due_date >= @startDate OR @period NOT IN('TW','TM','NW','NM') ) AND T.due_date < @endDate 
  AND (ISNULL(@period,'')!='OD' OR (@period='OD'  AND  T.STATUS IN('IN PROGRESS','PLANNED')))  
  AND (@empID ='-99' OR T.OWNER= @empID OR T.ASSIGNED_TO= @empID) 
  ORDER BY T.DUE_DATE DESC
END 

GO
 


 
/****** Object:  StoredProcedure [dbo].[getCSSTableForPeriod1]    Script Date: 20-07-2022 15:02:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForPeriod1' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getCSSTableForPeriod1
END
GO


/*
---------------------------------------------------
-- Author        : UNknown   
-- Date      :  NA 
-- Purpose       : [get CSS Table For Period]
--------------------------------------------------- 
-- ver     user             date             change  
-- 1.1    Indhu          20-07-2022       Modified date & Action submitted logic
#########################################################################  */
CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]                            
@startDate varchar(10),                          
@endDate varchar(10),                          
@custIds varchar(max)                          
AS                            
BEGIN                
     
;With NonPremierAccounts AS (                      
                      
select CB.CUST_ID , P.PROJ_ID,P.PROJ_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='https://csm.gavstech.com/CustomerSuccessSurvey/'+ r1.SURVEY_ID,
ActionplanURL ='https://csm.gavstech.com/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20)) +'/'+P.PROJ_ID+'/true'  , r1.CREATED_DATE, r1.batch_customer_id,RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)  
  
FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] CB  (NOLOCK)
INNER JOIN BAS.DBO.PROJECT P (NOLOCK) on p.proj_id = CB.proj_id  
INNER JOIN CSP.DBO.CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1  
INNER JOIN CSP..CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1  
inner join csp..CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1  
  
INNER JOIN CSP..CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1  
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )  
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))           
),                   
                      
PremierAccount As (                      
select CB.CUST_ID , 'Premier' as CUST_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= 0, URL ='https://csm.gavstech.com/CustomerSuccessSurvey/'+ r1.SURVEY_ID,
ActionplanURL ='https://csm.gavstech.com/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20))+'/0/true', r1.CREATED_DATE, r1.batch_customer_monthly_id,  
RN = row_number() OVER(partition by ct.contact_name ORDER BY cb.id desc, r1.rating )  
FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)   
INNER JOIN CSP.DBO.CSS_BATCH_monthly B (NOLOCK) ON B.ID = CB.BATCH_MONTHLY_ID and B.ISACTIVE = 1  
INNER JOIN CSP..CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1  
INNER JOIN CSP..CONTACTS CT (NOLOCK)  on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1  
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )   
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))  
),  
  
 ActionItem AS (  
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from              
  CSP..PROJECT_ACTIONITEM PA (NOLOCK)             
  join            
  CSP..CSS_BATCH_CUSTOMERS BC  (NOLOCK)           
  on PA.BATCH_CUSTOMER_ID = BC.ID and PA.SOURCE = 'CSS' and PA.ISACTIVE = 1           
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID           
  join           
  CSP..CSS_BATCHES B (NOLOCK) ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED'
  and ((B.START_DATE           
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))  
  Where PA.Status not in ('Cancelled','Suspended')  
)             

 SELECT A.PROJ_ID [PROJECT_ID], A.CUST_ID [CUSTOMER_ID],                      
 A.CONTACT_NAME RESPONDENT_NAME,                           
  A.CONTACT_NAME + ' - ' + A.PROJ_NM as [DISPLAY_TEXT] , A.MIN_SCORE,A.NPS_SCORE,Null as CSS_SCORE,A.URL,    ActionplanURL,          
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),  
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA   
  Where PA.Status in ('Planned','Started') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)     
  FROM   
  NonPremierAccounts A Where A.RN = 1    
    
  UNION         
    
  SELECT                              
   '0' [PROJECT_ID], A.CUST_ID [CUSTOMER_ID]                 
  , A.CONTACT_NAME RESPONDENT_NAME  
  , A.CONTACT_NAME +' - ' + A.CUST_NM as [DISPLAY_TEXT], null MIN_SCORE ,A.NPS_SCORE,A.MIN_SCORE as CSS_SCORE,A.URL,   ActionplanURL,  
  null as [ACTION_PLAN_SUBMITTED],null as [ACTION_PLAN_NOT_SUBMITTED]  
  FROM           
  PremierAccount A Where A.RN = 1                       
  order by RESPONDENT_NAME    
    
END   

GO

Declare  @RESOURCEID int = 80

Declare @RESOURCENAME varchar(250) = 'Premier Dashboard > Service Improvement Plan(CAPA Stages)'

Declare @EmpId  varchar(50) = '104474'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RESOURCENAME)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (@RESOURCEID,'Control',@RESOURCENAME,null,@EmpId,@EmpId)

set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RESOURCENAME )

end


if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin
      insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	  EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	  values (@RESOURCEID,1,'','','',null,@EmpId,@EmpId,1,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,@EmpId,@EmpId,1,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,@EmpId,@EmpId,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,13,'','','',null,@EmpId,@EmpId,0,0,0,0,0)

end


if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,@EmpId,@EmpId)	

end
go

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='KPI_DETAILS' AND COLUMN_NAME='ISNODATA' )
  BEGIN

  ALTER TABLE KPI_DETAILS ADD  [ISNODATA] BIT NOT NULL DEFAULT 0 WITH VALUES 

  END

GO



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_servicelevel_Metrics' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].usp_get_servicelevel_Metrics
END
GO

CREATE proc usp_get_servicelevel_Metrics                                        
                          
@productId int,                                                                                      
@modeId int,                                                  
@startDate varchar(20),                                                                
@endDate varchar(20)                          
                                                                        
AS                                        
BEGIN                                                                                    
                              
declare @quarterStartDate Datetime                                    
declare @quarterEndDate datetime                                    
                                
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                        
                                          
;WITH CTE(KPI_ID,DETAIL_ID,PRODUCT_ID,SERVICE_AREA_ID,SERVICE_LEVEL_ID,MODE_ID,SERVICE_LEVEL_METRICS,PERIOD,SERVICE_LEVEL_METRIC_DESCRIPTION,SERVICE_AREA_TYPE,SERVICE_LEVEL,SLA_CATEGORY,EXPECTED_SERVICE_LEVEL,                                              
    
MINIMUM_SERVICE_LEVEL,UNIT_OF_MEASUREMENT,SPECIFICATION_LIMIT,KPI_ACTUAL,FREQUENCY,SLA_STATUS,IS_NOT_APPLICABLE,REMARKS,SECONDARY_SLA_STATUS,IS_DRAFT, IS_FLAG,REFERENCE,IS_NO_DATA)                                                              
AS                                                              
(                                                              
select K.ID as KPI_ID,                                      
CASE WHEN K.FREQUENCY='Quarterly' then (select  top 1 ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) ELSE KD.ID                                                                  
END AS DETAIL_ID,                                      
PP.ID as PRODUCT_ID,PSA.ID as SERVICE_AREA_ID,PSL.SERVICE_LEVEL_TYPE_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,                                
CASE WHEN K.FREQUENCY='Quarterly' then                                 
(select  top 1 PERIOD  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) ELSE KD.PERIOD END AS PERIOD,                                
PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,                                                                            
PSA.SERVICE_AREA_TYPE,                                            
SLT.SERVICE_LEVEL,SLA.SLA_CATEGORY,                      
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                            
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                                                                
K.SLA_TARGET_UNIT_OF_MEASUREMENT,                                    
CASE WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 1 Incident Resolution' then                                                                                 
PT.SEVERITY_LEVEL_1                                                                                
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 2 Incident Resolution' then                      
PT.SEVERITY_LEVEL_2                                             
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 3 Incident Resolution' then                                                                               
PT.SEVERITY_LEVEL_3                                                                                
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Mean Time to Repair / Restore Service (MTTR)' then                 
PT.MTTR                                                       
                             
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Problem Resolution Time' then                                          
PT.PROBLEM_RESOLUTION_TIME                             
else KT.SPECIFICATION_LIMIT END AS SPECIFICATION_LIMIT,                                                                  
CASE WHEN K.FREQUENCY='Monthly' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23)     
and CONVERT(VARCHAR(20),@endDate,23))   
                
WHEN K.FREQUENCY='Release' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))  
               
WHEN K.FREQUENCY='Quarterly' then (select top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) END AS KPI_ACTUAL,                                                             
K.FREQUENCY,                                        
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate ) ELSE KD.SLA_STATUS  END AS SLA_STATUS,                                    
CASE WHEN isnull(KD.ISFLAG,'')='' then isnull(ISFLAG,CAST(0 as BIT)) ELSE KD.ISFLAG END AS IS_NOT_APPLICABLE,                                    
CASE WHEN K.FREQUENCY='Quarterly' then                                
(select top 1 HIGHLIGHTS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) ELSE  KD.HIGHLIGHTS END AS REMARKS,                                                                 
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SECONDARY_SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                            
    
@quarterStartDate and @quarterEndDate ) ELSE KD.SECONDARY_SLA_STATUS  END AS SECONDARY_SLA_STATUS,                    
CASE WHEN K.FREQUENCY='Quarterly'   and KD.period between @quarterStartDate and @QuarterendDate then cast(1 as bit)             
ELSE isnull(KD.ISDRAFT,1) END AS IS_DRAFT,             
kd.isFlag as IS_FLAG  ,REFERENCE ,isnull(KD.ISNODATA,0) as IS_NO_DATA                                
                        
from KPI K                                                                                
                                         
join KPI_TARGETS KT on K.ID = KT.KPI_ID and (CONVERT(VARCHAR(20),@startDate,23) >= CONVERT(varchar(20),KT.start_date,23))                                                                  
and (CONVERT(VARCHAR(20),@endDate,23) <= CONVERT(varchar(20),KT.END_DATE,23))                
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                                 
left join KPI_DETAILS KD on K.ID = KD.KPI_ID and KD.ISACTIVE = 1 and                                                   
((K.FREQUENCY='Monthly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))                            
or (K.FREQUENCY='Release' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))                            
 or K.FREQUENCY='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23))                                
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                              
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID      
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1     
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                                                              
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                            
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                                                                          
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                                                                 
where  K.ISACTIVE = 1 and KT.ISACTIVE = 1                                                  
and PP.ISACTIVE = 1  and K.PRODUCT_ID = @productId and K.MODE_ID = @modeId                                                        
)                                                               
                                                   
SELECT distinct *  from CTE order by SERVICE_AREA_TYPE,REFERENCE                                                                     
                                        
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseKPICount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseKPICount
END
GO
CREATE PROC getProductWiseKPICount                             
          
@customerId  varchar(50),                                
@startDate Datetime,                                              
@endDate Datetime ,         
        @isCustomer bit = 0                        
AS                                
BEGIN                                
                  
Declare @quarterStartDate DateTime                  
Declare @quarterEndDate DateTime                  
                  
Set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0))                  
Set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1))                  
                  
select PRODUCT_ID,PRODUCT_TITLE,MODE_ID,                              
count(kpi_id) as OVERALL_KPI_COUNT,sum(MET_KPIS) as SLA_STATUS , sum(KEY_KPI) as KEY_KPI ,sum(CRITICAL_KPI) as CRITICAL_KPI,                              
sum(MET_KEY_KPI) as MET_KEY_KPI,sum(MET_CRITICAL_KPI) as MET_CRITICAL_KPI,          
sum(SECONDARY_MET_KEY_KPI) as SECONDARY_MET_KEY_KPI,sum(SECONDARY_MET_CRITICAL_KPI) as SECONDARY_MET_CRITICAL_KPI          
from                                
(                                
 SELECT PP.ID as PRODUCT_ID,PP.PRODUCT_TITLE,K.MODE_ID,                              
K.ID as KPI_ID                               
,CASE WHEN (KD.SLA_STATUS = 'MET' or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END AS MET_KPIS                                            
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 then 1 END as KEY_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_KEY_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SECONDARY_SLA_STATUS = 'Met'  or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_KEY_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 then 1 END as CRITICAL_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_CRITICAL_KPI                                              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SECONDARY_SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_CRITICAL_KPI                                              
FROM KPI K                                             
                                       
inner JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and kd.isactive =1                                                        
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                          
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                            
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID   and PP.ISACTIVE =1                             
where  K.CUSTOMER_ID = @customerId    -- and isnull(KD.ISFLAG,0)= 0 
and isnull(KD.ISDRAFT,0)=0                                             
and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 ) and                              
((K.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )              
or(K.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))      
)a                                
group by PRODUCT_ID,PRODUCT_TITLE,MODE_ID                               
order by PRODUCT_TITLE                              
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getEngagementLevelKPI
END
GO
CREATE PROC getEngagementLevelKPI                                              
                  
@customerId  varchar(50),                                        
@startDate Datetime,                                                      
@endDate Datetime,         
@iscustomer bit =0                     
                                        
AS                                                            
BEGIN                                          
declare  @quarterStartDate Datetime                              
declare @quarterEndDate datetime                              
                              
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                              
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                              
                          
select KPI_NAME,                         
count(Product_id) as PRODUCT_COUNT,                      
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,                                          
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,      
SUM(ISNA) as ISNA       
, count(Met_product), sum(met_product)      
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents','Issues detected post-go-live') and count(MET_PRODUCT) >0 then  cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,
 
 count(MET_PRODUCT)) *100 as decimal(18,3)) else cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3))end as ACHIEVEMENT_VALUE                          
, sum(KPI_NUMERATOR) as KPI_NUMERATOR      
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE        
        
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT                
from                                              
(                                              
select K.KPI_NAME as KPI_NAME,                      
 PP.ID as Product_id,                                          
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,          
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)     
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                    
  
 CASE WHEN KD.SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS MET_PRODUCT                                                        
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,                        
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT                                                        
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,                        
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA      
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                             
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR     
  ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM    
 ,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                  
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID         
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )    
from KPI K                                          
                 
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                          
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                       
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                                
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )                     
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                  
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                   
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1                                                            
      
where   K.CUSTOMER_ID = @customerId      and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)                     
and isnull(KD.ISDRAFT,0)=0     
)a                                          
group by KPI_NAME  order by KPI_NAME      
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetKPIWiseDetailDataForPeriod
END
GO

CREATE PROC GetKPIWiseDetailDataForPeriod   --212100001,'2022-07-01','2022-07-31',0        
@customerId  varchar(50),                    
@startDate DateTime,                                      
@endDate DateTime    ,            
@isCustomer bit =0                           
AS                              
BEGIN                     
declare  @quarterStartDate Datetime                    
declare @quarterEndDate datetime                    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                    
with cte as                        
(                          
 SELECT k.ID                       
 ,k.KPI_NAME,PORTFOLIO_ID, k.PRODUCT_ID,psl.SERVICE_LEVEL_METRIC_DESCRIPTION,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID,                
 PSA.SERVICE_AREA_TYPE ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                           
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR                
 ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,PSLT.SERVICE_LEVEL                
 ,ft.id as FID,ft.formula ,PP.TIER_ID ,RM.REFERENCE, case when kd.sla_status in ('MET','NA','ND') then 1 else 0 end as SLA_Status              
 , case when isnull(kd.ISFLAG,0) = 1 then  1 else 0 end as Cnt    
 , case when isnull(kd.ISNODATA,0) = 1 then  1 else 0 end as NDCnt
 FROM csp..KPI K                                          
 --INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                        
 INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1  and kd.ISACTIVE =1    and          
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                          
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                   
  INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                        
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID      
  INNER JOIN REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1          
  INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                              
  INNER JOIN PRODUCTS_SERVICE_LEVEL_TYPE PSLT on PSL.SERVICE_LEVEL_TYPE_ID = PSLT.ID                
  INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                              
 INNER JOIN PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                            
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                        
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                        
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                             
 where                          
 K.CUSTOMER_ID  = @customerId    and   isnull(KD.ISDRAFT,0)= 0                   
 and k.ISACTIVE =1     and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )                      
 )                 
  select                          
    KPI_NAME                        
  ,SERVICE_AREA_TYPE   , PORTFOLIO_ID      
 ,sum(SLA_Status)     , count(SLA_Status)      
 ,CATEGORY = (select SHORT_DESC from GLOBAL_KPI_CATEGORY GC join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING GKC on                
 GC.ID = GKC.GLOBAL_KPI_CATEGORY_ID join KPI k on K.GLOBAL_KPI_CATEGORY_ID=GKC.GLOBAL_KPI_CATEGORY_ID where K.ID = max(cte.ID))                
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                        
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')   
 and count(SLA_Status) >0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) *100   
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR         
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR        
 ,MINIMUM_SERVICE_LEVEL = (select CASE WHEN isnull(MINIMUM_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then         
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)        
 ELSE MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))        
 ,EXPECTED_SERVICE_LEVEL = (select CASE WHEN isnull(EXPECTED_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then         
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)        
 ELSE EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))        
 ,UNIT_OF_MEASUREMENT,SERVICE_LEVEL,max( FID) as FORMULA_ID                        
 ,max( formula) as FORMULA, max(REFERENCE) as REFERENCE                  
 , case when count(*) = sum(cnt) then convert(bit,1)  else convert(bit,0) end as ISNA 
, case when count(*) = sum(NDCnt) then convert(bit,1)  else convert(bit,0) end as ISNODATA
  from cte  --where PORTFOLIO_ID=2                
  group by   KPI_NAME, PORTFOLIO_ID, SERVICE_AREA_TYPE,UNIT_OF_MEASUREMENT,SERVICE_LEVEL           
  order by   SERVICE_AREA_TYPE,REFERENCE        
 END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

CREATE PROC getProductWiseCAPACount      
@customerId  varchar(50) = '212100001',                 
@startDate datetime,                                                                
@endDate datetime,                
@productId int = 0  ,  
@iscustomer bit = 0    
                
AS                
BEGIN                
                
declare @quarterStartDate Datetime                                    
declare @quarterEndDate datetime                                    
                                
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0));                                    
set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,1));                        
                
               
;with CTE AS  
 (                
  
select PP.ID as ProductID,PP.PRODUCT_TITLE,KD.ID as KPI_DETAILS_ID,    
[SUBMITTED] = Count(CAPA.ID),    
[REVIEW] =  (select COUNT(R.ID) from CSP..AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1),    
[IMPLEMENTATION] = (select COUNT(IMP.ID) from CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1),   
[VERIFICATION] = (select COUNT(VER.ID)  from CSP..AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1)  
,(select max(stage_ID) from CSP..AUDIT_FINDING_STAGES_MAPPING where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE  
  
from     
CSP..PORTFOLIO_PRODUCTS PP         
left join CSP..KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1             
join CSP..KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1      
join CSP..AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1 AND CAPA.ISROOTCAUSE = 1  
  
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0      
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and                
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)                                
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )    
  
 group by PP.ID ,PP.PRODUCT_TITLE,KD.ID    
 )  
 select ProductID,PRODUCT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET,  
 [SUBMITTED] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),  
 [REVIEW] = SUM(case when CAPA_STAGE = 2 then Review else 0 End),  
 [IMPLEMENTATION] = SUM(case when CAPA_STAGE = 3 then IMPLEMENTATION else 0 End),  
 [VERIFICATION] = SUM(case when CAPA_STAGE = 4 then VERIFICATION else 0 End)   
 from CTE  
 group by ProductID,PRODUCT_TITLE  
 order by PRODUCT_TITLE 
END 
GO


Declare  @RESOURCEID int = 80

Declare @RESOURCENAME varchar(250) = 'Premier Dashboard > Service Improvement Plan(CAPA Stages)'

Declare @EmpId  varchar(50) = '104474'

if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RESOURCENAME)
begin

insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY)
values (@RESOURCEID,'Control',@RESOURCENAME,null,@EmpId,@EmpId)

set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RESOURCENAME )

end


if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin
      insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	  EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	  values (@RESOURCEID,1,'','','',null,@EmpId,@EmpId,1,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,@EmpId,@EmpId,1,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,@EmpId,@EmpId,1,1,1,1,1),
	 (@RESOURCEID,8,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,@EmpId,@EmpId,0,0,0,0,0),
	 (@RESOURCEID,13,'','','',null,@EmpId,@EmpId,0,0,0,0,0)

end


if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,@EmpId,@EmpId)	

end
go

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='KPI_DETAILS' AND COLUMN_NAME='ISNODATA' )
  BEGIN

  ALTER TABLE KPI_DETAILS ADD  [ISNODATA] BIT NOT NULL DEFAULT 0 WITH VALUES 

  END

GO



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_servicelevel_Metrics' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].usp_get_servicelevel_Metrics
END
GO

CREATE proc usp_get_servicelevel_Metrics                                        
                          
@productId int,                                                                                      
@modeId int,                                                  
@startDate varchar(20),                                                                
@endDate varchar(20)                          
                                                                        
AS                                        
BEGIN                                                                                    
                              
declare @quarterStartDate Datetime                                    
declare @quarterEndDate datetime                                    
                                
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                        
                                          
;WITH CTE(KPI_ID,DETAIL_ID,PRODUCT_ID,SERVICE_AREA_ID,SERVICE_LEVEL_ID,MODE_ID,SERVICE_LEVEL_METRICS,PERIOD,SERVICE_LEVEL_METRIC_DESCRIPTION,SERVICE_AREA_TYPE,SERVICE_LEVEL,SLA_CATEGORY,EXPECTED_SERVICE_LEVEL,                                              
    
MINIMUM_SERVICE_LEVEL,UNIT_OF_MEASUREMENT,SPECIFICATION_LIMIT,KPI_ACTUAL,FREQUENCY,SLA_STATUS,IS_NOT_APPLICABLE,REMARKS,SECONDARY_SLA_STATUS,IS_DRAFT, IS_FLAG,REFERENCE,IS_NO_DATA)                                                              
AS                                                              
(                                                              
select K.ID as KPI_ID,                                      
CASE WHEN K.FREQUENCY='Quarterly' then (select  top 1 ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) ELSE KD.ID                                                                  
END AS DETAIL_ID,                                      
PP.ID as PRODUCT_ID,PSA.ID as SERVICE_AREA_ID,PSL.SERVICE_LEVEL_TYPE_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,                                
CASE WHEN K.FREQUENCY='Quarterly' then                                 
(select  top 1 PERIOD  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) ELSE KD.PERIOD END AS PERIOD,                                
PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,                                                                            
PSA.SERVICE_AREA_TYPE,                                            
SLT.SERVICE_LEVEL,SLA.SLA_CATEGORY,                      
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                            
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                                                                
K.SLA_TARGET_UNIT_OF_MEASUREMENT,                                    
CASE WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 1 Incident Resolution' then                                                                                 
PT.SEVERITY_LEVEL_1                                                                                
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 2 Incident Resolution' then                      
PT.SEVERITY_LEVEL_2                                             
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 3 Incident Resolution' then                                                                               
PT.SEVERITY_LEVEL_3                                                                                
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Mean Time to Repair / Restore Service (MTTR)' then                 
PT.MTTR                                                       
                             
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Problem Resolution Time' then                                          
PT.PROBLEM_RESOLUTION_TIME                             
else KT.SPECIFICATION_LIMIT END AS SPECIFICATION_LIMIT,                                                                  
CASE WHEN K.FREQUENCY='Monthly' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23)     
and CONVERT(VARCHAR(20),@endDate,23))   
                
WHEN K.FREQUENCY='Release' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))  
               
WHEN K.FREQUENCY='Quarterly' then (select top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) END AS KPI_ACTUAL,                                                             
K.FREQUENCY,                                        
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate ) ELSE KD.SLA_STATUS  END AS SLA_STATUS,                                    
CASE WHEN isnull(KD.ISFLAG,'')='' then isnull(ISFLAG,CAST(0 as BIT)) ELSE KD.ISFLAG END AS IS_NOT_APPLICABLE,                                    
CASE WHEN K.FREQUENCY='Quarterly' then                                
(select top 1 HIGHLIGHTS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                  
@quarterStartDate and @quarterEndDate) ELSE  KD.HIGHLIGHTS END AS REMARKS,                                                                 
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SECONDARY_SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                            
    
@quarterStartDate and @quarterEndDate ) ELSE KD.SECONDARY_SLA_STATUS  END AS SECONDARY_SLA_STATUS,                    
CASE WHEN K.FREQUENCY='Quarterly'   and KD.period between @quarterStartDate and @QuarterendDate then cast(1 as bit)             
ELSE isnull(KD.ISDRAFT,1) END AS IS_DRAFT,             
kd.isFlag as IS_FLAG  ,REFERENCE ,isnull(KD.ISNODATA,0) as IS_NO_DATA                                
                        
from KPI K                                                                                
                                         
join KPI_TARGETS KT on K.ID = KT.KPI_ID and (CONVERT(VARCHAR(20),@startDate,23) >= CONVERT(varchar(20),KT.start_date,23))                                                                  
and (CONVERT(VARCHAR(20),@endDate,23) <= CONVERT(varchar(20),KT.END_DATE,23))                
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                                 
left join KPI_DETAILS KD on K.ID = KD.KPI_ID and KD.ISACTIVE = 1 and                                                   
((K.FREQUENCY='Monthly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))                            
or (K.FREQUENCY='Release' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))                            
 or K.FREQUENCY='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23))                                
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                              
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID      
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1     
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                                                              
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                            
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                                                                          
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                                                                 
where  K.ISACTIVE = 1 and KT.ISACTIVE = 1                                                  
and PP.ISACTIVE = 1  and K.PRODUCT_ID = @productId and K.MODE_ID = @modeId                                                        
)                                                               
                                                   
SELECT distinct *  from CTE order by SERVICE_AREA_TYPE,REFERENCE                                                                     
                                        
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseKPICount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseKPICount
END
GO
CREATE PROC getProductWiseKPICount                             
          
@customerId  varchar(50),                                
@startDate Datetime,                                              
@endDate Datetime ,         
        @isCustomer bit = 0                        
AS                                
BEGIN                                
                  
Declare @quarterStartDate DateTime                  
Declare @quarterEndDate DateTime                  
                  
Set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0))                  
Set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1))                  
                  
select PRODUCT_ID,PRODUCT_TITLE,MODE_ID,                              
count(kpi_id) as OVERALL_KPI_COUNT,sum(MET_KPIS) as SLA_STATUS , sum(KEY_KPI) as KEY_KPI ,sum(CRITICAL_KPI) as CRITICAL_KPI,                              
sum(MET_KEY_KPI) as MET_KEY_KPI,sum(MET_CRITICAL_KPI) as MET_CRITICAL_KPI,          
sum(SECONDARY_MET_KEY_KPI) as SECONDARY_MET_KEY_KPI,sum(SECONDARY_MET_CRITICAL_KPI) as SECONDARY_MET_CRITICAL_KPI          
from                                
(                                
 SELECT PP.ID as PRODUCT_ID,PP.PRODUCT_TITLE,K.MODE_ID,                              
K.ID as KPI_ID                               
,CASE WHEN (KD.SLA_STATUS = 'MET' or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END AS MET_KPIS                                            
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 then 1 END as KEY_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_KEY_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SECONDARY_SLA_STATUS = 'Met'  or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_KEY_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 then 1 END as CRITICAL_KPI                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_CRITICAL_KPI                                              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SECONDARY_SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_CRITICAL_KPI                                              
FROM KPI K                                             
                                       
inner JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and kd.isactive =1                                                        
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                          
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                            
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID   and PP.ISACTIVE =1                             
where  K.CUSTOMER_ID = @customerId    -- and isnull(KD.ISFLAG,0)= 0 
and isnull(KD.ISDRAFT,0)=0                                             
and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 ) and                              
((K.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )              
or(K.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))      
)a                                
group by PRODUCT_ID,PRODUCT_TITLE,MODE_ID                               
order by PRODUCT_TITLE                              
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getEngagementLevelKPI
END
GO
CREATE PROC getEngagementLevelKPI                                              
                  
@customerId  varchar(50),                                        
@startDate Datetime,                                                      
@endDate Datetime,         
@iscustomer bit =0                     
                                        
AS                                                            
BEGIN                                          
declare  @quarterStartDate Datetime                              
declare @quarterEndDate datetime                              
                              
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                              
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                              
                          
select KPI_NAME,                         
count(Product_id) as PRODUCT_COUNT,                      
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,                                          
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,      
SUM(ISNA) as ISNA       
, count(Met_product), sum(met_product)      
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents','Issues detected post-go-live') and count(MET_PRODUCT) >0 then  cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,
 
 count(MET_PRODUCT)) *100 as decimal(18,3)) else cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3))end as ACHIEVEMENT_VALUE                          
, sum(KPI_NUMERATOR) as KPI_NUMERATOR      
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE        
        
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT                
from                                              
(                                              
select K.KPI_NAME as KPI_NAME,                      
 PP.ID as Product_id,                                          
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,          
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)     
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                    
  
 CASE WHEN KD.SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS MET_PRODUCT                                                        
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,                        
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT                                                        
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,                        
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA      
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                             
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR     
  ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM    
 ,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                  
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID         
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )    
from KPI K                                          
                 
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                          
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                       
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                                
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )                     
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                  
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                   
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1                                                            
      
where   K.CUSTOMER_ID = @customerId      and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)                     
and isnull(KD.ISDRAFT,0)=0     
)a                                          
group by KPI_NAME  order by KPI_NAME      
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

CREATE PROC getProductWiseCAPACount      
@customerId  varchar(50) = '212100001',                 
@startDate datetime,                                                                
@endDate datetime,                
@productId int = 0  ,  
@iscustomer bit = 0    
                
AS                
BEGIN                
                
declare @quarterStartDate Datetime                                    
declare @quarterEndDate datetime                                    
                                
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0));                                    
set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,1));                        
                
               
;with CTE AS  
 (                
  
select PP.ID as ProductID,PP.PRODUCT_TITLE,KD.ID as KPI_DETAILS_ID,    
[SUBMITTED] = Count(CAPA.ID),    
[REVIEW] =  (select COUNT(R.ID) from CSP..AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1),    
[IMPLEMENTATION] = (select COUNT(IMP.ID) from CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1),   
[VERIFICATION] = (select COUNT(VER.ID)  from CSP..AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1)  
,(select max(stage_ID) from CSP..AUDIT_FINDING_STAGES_MAPPING where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE  
  
from     
CSP..PORTFOLIO_PRODUCTS PP         
left join CSP..KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1             
join CSP..KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1      
join CSP..AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1 
  
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0      
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and                
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)                                
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )    
  
 group by PP.ID ,PP.PRODUCT_TITLE,KD.ID    
 )  
 select ProductID,PRODUCT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET,  
 [SUBMITTED] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),  
 [REVIEW] = SUM(case when CAPA_STAGE = 2 then Review else 0 End),  
 [IMPLEMENTATION] = SUM(case when CAPA_STAGE = 3 then IMPLEMENTATION else 0 End),  
 [VERIFICATION] = SUM(case when CAPA_STAGE = 4 then VERIFICATION else 0 End)   
 from CTE  
 group by ProductID,PRODUCT_TITLE  
 order by PRODUCT_TITLE 
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetOverallKPICountForPortfolio' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetOverallKPICountForPortfolio
END
GO
CREATE PROC GetOverallKPICountForPortfolio                
            
@Portfolio_ID int,            
@startDate DateTime,                                    
@endDate DateTime,       
@isCustomer bit = 0              
as                 
BEGIN                
declare  @quarterStartDate Datetime                  
declare @quarterEndDate datetime                  
                  
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                  
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                  
             
 select    count(distinct(m.id))  from                   
 csp..PRODUCT_SERVICE_LEVEL_METRICS m                   
 inner join   KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = m.ID                   
 inner join kpi on k2p.kpi_ID = kpi.ID and Kpi.ISACTIVE =1                 
 left  join KPI_DETAILS KD on KPI.ID = KD.KPI_ID and KD.ISACTIVE =1              
 and            
 ((KPI.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                    
or(KPI.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                    
 inner join csp..PORTFOLIO_PRODUCTS pp on pp.ID = kpi.PRODUCT_ID             
 where  pp.PORTFOLIO_ID = @Portfolio_ID  and pp.ISACTIVE = 1              
 and isnull(KD.ISDRAFT,0)= 0     
 and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )                 
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetKPIWiseDataForPeriod
END
GO
CREATE PROC GetKPIWiseDataForPeriod --212100001,'2022-07-01','2022-07-31',0                           
                
@customerId  varchar(50),                            
@startDate DateTime,                                          
@endDate DateTime ,         
@isCustomer bit = 0                 
                                  
AS                                  
BEGIN                         
declare  @quarterStartDate Datetime                        
declare @quarterEndDate datetime                        
                        
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                        
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                        
                        
with cte as                            
(                              
 SELECT  k.ID ,pp.PORTFOLIO_ID ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT                         
 , k.KPI_NAME, k.PRODUCT_ID                                        
 ,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID                            
 ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                               
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR                               
 ,ft.id as FID ,ft.formula         
 , kd.ISFLAG ,KD.ISNODATA                        
 --,Tier_ID = (select TIER_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)                            
fROM csp..KPI K                                              
LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                       
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                      
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                         
                  inner join csp..PORTFOLIO_PRODUCTS pp on pp.ID = k.PRODUCT_ID and pp.ISACTIVE =1        
 INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                            
 INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                                  
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                            
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                            
 INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                                 
 where                              
 K.CUSTOMER_ID  = @customerId    --and  isnull(KD.ISFLAG,0)=0             
 and isnull(KD.ISDRAFT,0)=0            
 and k.ISACTIVE =1             
 and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )                    
         
)                            
  select KPI_NAME                            
 ,cte.PORTFOLIO_ID                            
 ,'' as TITLE                            
 ,max( FID) as FORMULA_ID                            
 ,max( formula) as FORMULA                            
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                            
 , sum(KPI_NUMERATOR) as KPI_NUMERATOR                            
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                            
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))               
 , EXPECTED_SERVICE_LEVEL=(select EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))              
 ,cast( MAX(CASE WHEN ISFLAG=1 THEN 1 ELSE 0 END) as bit)as ISNA ,Max(UNIT_OF_MEASUREMENT) as UNIT_OF_MEASUREMENT  
 ,cast( MAX(CASE WHEN ISNODATA = 1 THEN 1 ELSE 0 END) as bit)as ISNODATA              
  from cte                 
  group by   KPI_NAME, cte.PORTFOLIO_ID--,cte.Tier_ID                            
  order by   3, 2,1                     
 END 
 GO

 IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetKPIWiseDetailDataForPeriod
END
GO

CREATE PROC GetKPIWiseDetailDataForPeriod   --212100001,'2022-07-01','2022-07-31',0        
@customerId  varchar(50),                    
@startDate DateTime,                                      
@endDate DateTime    ,            
@isCustomer bit =0                           
AS                              
BEGIN                     
declare  @quarterStartDate Datetime                    
declare @quarterEndDate datetime                    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                    
with cte as                        
(                          
 SELECT k.ID                       
 ,k.KPI_NAME,PORTFOLIO_ID, k.PRODUCT_ID,psl.SERVICE_LEVEL_METRIC_DESCRIPTION,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID,                
 PSA.SERVICE_AREA_TYPE ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                           
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR                
 ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,PSLT.SERVICE_LEVEL                
 ,ft.id as FID,ft.formula ,PP.TIER_ID ,RM.REFERENCE, case when kd.sla_status in ('MET','NA','ND') then 1 else 0 end as SLA_Status              
 , case when isnull(kd.ISFLAG,0) = 1 then  1 else 0 end as Cnt    
 , case when isnull(kd.ISNODATA,0) = 1 then  1 else 0 end as NDCnt
 FROM csp..KPI K                                          
 --INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                        
 INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1  and kd.ISACTIVE =1    and          
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                          
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                   
  INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                        
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID      
  INNER JOIN REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1          
  INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                              
  INNER JOIN PRODUCTS_SERVICE_LEVEL_TYPE PSLT on PSL.SERVICE_LEVEL_TYPE_ID = PSLT.ID                
  INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                              
 INNER JOIN PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                            
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                        
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                        
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                             
 where                          
 K.CUSTOMER_ID  = @customerId    and   isnull(KD.ISDRAFT,0)= 0                   
 and k.ISACTIVE =1     and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )                      
 )                 
  select                          
    KPI_NAME                        
  ,SERVICE_AREA_TYPE   , PORTFOLIO_ID      
 ,sum(SLA_Status)     , count(SLA_Status)      
 ,CATEGORY = (select SHORT_DESC from GLOBAL_KPI_CATEGORY GC join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING GKC on                
 GC.ID = GKC.GLOBAL_KPI_CATEGORY_ID join KPI k on K.GLOBAL_KPI_CATEGORY_ID=GKC.GLOBAL_KPI_CATEGORY_ID where K.ID = max(cte.ID))                
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                        
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')   
 and count(SLA_Status) >0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) *100   
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR         
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR        
 ,MINIMUM_SERVICE_LEVEL = (select CASE WHEN isnull(MINIMUM_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then         
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)        
 ELSE MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))        
 ,EXPECTED_SERVICE_LEVEL = (select CASE WHEN isnull(EXPECTED_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then         
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)        
 ELSE EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))        
 ,UNIT_OF_MEASUREMENT,SERVICE_LEVEL,max( FID) as FORMULA_ID                        
 ,max( formula) as FORMULA, max(REFERENCE) as REFERENCE                  
 , case when count(*) = sum(cnt) then convert(bit,1)  else convert(bit,0) end as ISNA 
, case when count(*) = sum(NDCnt) then convert(bit,1)  else convert(bit,0) end as ISNODATA
  from cte  --where PORTFOLIO_ID=2                
  group by   KPI_NAME, PORTFOLIO_ID, SERVICE_AREA_TYPE,UNIT_OF_MEASUREMENT,SERVICE_LEVEL           
  order by   SERVICE_AREA_TYPE,REFERENCE        
 END
GO


DECLARE @TABLE_NAME	varchar	(225) = 'KPI'
DECLARE @FIELD_NAME	varchar	(225) = 'frequency'
DECLARE @DISPLAY_NAME	varchar	(225) = 'Frequency'
DECLARE @DATA_TYPE	varchar	(100) = 'number'
DECLARE  @INCLUDE	bit	= 1
DECLARE @SORTING	bit	= 0
DECLARE @SORTING_DIRECTION	bit	= 0
DECLARE @PARAMETER_TABLE_NAME	varchar	(225) = null
DECLARE @CREATED_BY	varchar(50) = 104474
DECLARE @CREATED_DATE	datetime = getdate()
DECLARE @UPDATED_BY	varchar(50) = 104474
DECLARE @UPDATED_DATE	datetime = getdate()
DECLARE @ISACTIVE	bit	= 1

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='KPI' and [FIELD_NAME] = 'frequency')
BEGIN
INSERT INTO FILTER_PREFERENCE VALUES(@TABLE_NAME,@FIELD_NAME,@DISPLAY_NAME,@DATA_TYPE,@INCLUDE,@SORTING,@SORTING_DIRECTION
,@PARAMETER_TABLE_NAME,@CREATED_BY,@CREATED_DATE,@UPDATED_BY,@UPDATED_DATE,@ISACTIVE)
END
GO

DECLARE @TABLE_NAME	varchar	(225) = 'KPI_DETAILS'
DECLARE @FIELD_NAME	varchar	(225) = 'frequency'
DECLARE @DISPLAY_NAME	varchar	(225) = 'Frequency'
DECLARE @DATA_TYPE	varchar	(100) = 'number'
DECLARE  @INCLUDE	bit	= 1
DECLARE @SORTING	bit	= 0
DECLARE @SORTING_DIRECTION	bit	= 0
DECLARE @PARAMETER_TABLE_NAME	varchar	(225) = null
DECLARE @CREATED_BY	varchar(50) = 104474
DECLARE @CREATED_DATE	datetime = getdate()
DECLARE @UPDATED_BY	varchar(50) = 104474
DECLARE @UPDATED_DATE	datetime = getdate()
DECLARE @ISACTIVE	bit	= 1

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='KPI_DETAILS' and [FIELD_NAME] = 'frequency')
BEGIN
INSERT INTO FILTER_PREFERENCE VALUES(@TABLE_NAME,@FIELD_NAME,@DISPLAY_NAME,@DATA_TYPE,@INCLUDE,@SORTING,@SORTING_DIRECTION
,@PARAMETER_TABLE_NAME,@CREATED_BY,@CREATED_DATE,@UPDATED_BY,@UPDATED_DATE,@ISACTIVE)
END
GO

