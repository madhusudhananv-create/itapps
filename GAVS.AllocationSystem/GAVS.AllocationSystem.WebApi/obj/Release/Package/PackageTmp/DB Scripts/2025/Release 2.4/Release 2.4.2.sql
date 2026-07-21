IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_CC_LIST_HITEC')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_CC_LIST_HITEC',  
    'rajaneesh.kini@gavstech.com,nitin.naveen@gavstech.com,niraj.nadkar@gslab.com',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO

IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_CC_LIST_DIVER')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_CC_LIST_DIVER',  
    'lakshminarasimhan.j@gavstech.com,rajaneesh.kini@gavstech.com',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO

IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_CC_LIST_HEAL')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_CC_LIST_HEAL',  
    'srinivasan.m@gavstech.com,rajaneesh.kini@gavstech.com',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO


IF EXISTS(Select 1 from sys.objects where name ='reports_getListofIssues' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getListofIssues]
END

GO
CREATE procedure [dbo].[reports_getListofIssues]                                
  @startDate Datetime,                              
  @endDate Datetime  ,      
  @CustomerID varchar(25)   = null                      
       
  AS                                        
  BEGIN            
          
  select 
  
 c.cust_nm as CUSTOMER,	p.proj_nm as PROJECT	,Business_unit as [BUSINESS UNIT],	p.department as SUBVERTICAL, reported_by as [Report Category], SEVERITY,  status as CURRENT_STATUS	,	 	 Identified_by as	[REPORTED BY],	LEVEL,
 
 	 Format(I.IDENTIFIED_DATE,'yyyy-MM-dd') REPORTED_DATE ,    issue_type as CATEGORY, TITLE,
			i.description as  [ISSUE DESCRIPTION], 		ISSUE_SOURCE,	ISSUE_SOURCE_OTHER	,
		  FINANCIAL_IMPACT	,FINANCIAL_IMPACT_DESCRIPTION, 
			IMPACT_SUMMARY	, BUSINESS_IMPACT,BUSINESS_IMPACT_DESC, 	SERVICE_IMPACT	,
			ROOTCAUSE	, Format(I.ACK_DATE,'yyyy-MM-dd') ACK_DATE ,	 ACTION_PLAN	,
			CASE WHEN i.assigned_to_empId IS NULL THEN I.ASSIGNED_TO 
            ELSE (select isnull(frst_nm, I.ASSIGNED_TO) from emp_info where emp_id = i.assigned_to_empId) END as SPOC,
			 Format(I.TARGET_DATE,'yyyy-MM-dd') TARGET_DATE	, Format(I.ISSUE_RESOLVED_DATE,'yyyy-MM-dd') ISSUE_RESOLVED_DATE   ,
			 	LOCATION_selection as [LOCATION],	GEO_LOCATION as LOCATION_OTHER,					COMMENTS,	 
	   Format(I.CREATED_DATE,'yyyy-MM-dd') CREATED_DATE,	  CREATED_BY = (SELECT frst_nm from emp_info where emp_id = i.created_by OR emp_id = i.CREATED_BY ), 	 Format(I.UPDATED_DATE,'yyyy-MM-dd') UPDATED_DATE,
	    UPDATED_BY = (SELECT frst_nm from emp_info where emp_id = i.UPDATED_by OR emp_id_NEW = i.UPDATED_by  ),  	c.CUST_ID 	   , i.project_id
 from PROJECT_ISSUE I    
 join PROJECT P on  P.PROJ_ID = I.PROJECT_ID          
 join CUSTOMER C on C.CUST_ID = P.CUST_ID                               
      where I.identified_date between @startDate and @endDate and (isnull( @CustomerID ,'0')='0'  or C.CUST_ID = @CustomerID) and I.ISACTIVE=1  
  order by C.CUST_NM,P.PROJ_NM,  case when severity = 'high' then 1
              when severity = 'Medimu' then 2
              when severity = 'Low' then 3
              else 4
         end asc, reported_date desc, ISSUE_RESOLVED_DATE     
 END   

 GO


IF EXISTS(Select 1 from sys.objects where name ='getCSSTableForPeriod' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForPeriod]
END

GO

CREATE PROCEDURE [dbo].[getCSSTableForPeriod]      
@startDate varchar(10),    
@endDate varchar(10),    
@custIds varchar(max)    
AS      
BEGIN      
--[dbo].[getCSSTable] 'Q4 2018-19'       
    
 SELECT *, IIF(OVERALL_QUALITY_OF_DELIVERABLE<ENABLING_SUCCESS,IIF (OVERALL_QUALITY_OF_DELIVERABLE < VALUE_ADDS,OVERALL_QUALITY_OF_DELIVERABLE, VALUE_ADDS),IIF (ENABLING_SUCCESS < VALUE_ADDS,ENABLING_SUCCESS, VALUE_ADDS)) [MIN_SCORE]      
 FROM       
 (      
 SELECT       
  0 ID, CB.PROJ_ID [PROJECT_ID], CB.CUST_ID [CUSTOMER_ID], P.PROJ_DM_EMP_ID [CSM_EMP_ID], P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID]      
  , CB.DISPLAY_NAME RESPONDENT_NAME, SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],
  	case when b.frequency = 'quarterly' then 'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)  
	when b.frequency ='halfyearly' then 'H' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)  end YEAR_QUARTER      
  , CASE WHEN P.PROJ_ID LIKE '201%' THEN 'India' WHEN P.PROJ_ID LIKE '202%' THEN 'US' WHEN P.PROJ_ID LIKE '206%' THEN 'Oman' WHEN P.PROJ_ID LIKE '207%' THEN 'Dubai' WHEN P.PROJ_ID LIKE '209%' THEN 'Saudi Arabia' ELSE '' END AS REGION      
  , '' [ACTION_PLAN_SCORE], '' [ACTION_PLAN_COMMENTS], '' [ACTION_ITEM_NPS], '' [ACTION_PLAN_REQUIRED], NULL [DUE_DATE], NULL [ACTION_PLAN_DISCUSSED_DATE], '' [PROGRESS_OF_CSAT_ACTION_PLAN], '' [NO_OF_DAYS_TO_PROVIDE_ACTION_PLAN]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in (1,6,14)) AS [OVERALL_QUALITY_OF_DELIVERABLE]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in (1,6,14)) AS [OVERALL_QUALITY_OF_DELIVERABLE_REMARKS]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in( 2,7)) AS [ENABLING_SUCCESS]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in( 2,7)) AS [ENABLING_SUCCESS_REMARKS]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in (3,8)) AS [VALUE_ADDS]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in (3,8)) AS [VALUE_ADDS_REMARKS]      
  , NULL [RESPONSIVENESS]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in (select id from CSS_QUESTION_MASTER where QUESTION_CATEGORY ='NPS')) AS [NPS_SCORE]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID in (4,16,17,21)) AS [NPS_REMARKS]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '')  FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 5) AS [FEEDBACK]      
  , '' [COMMENTS] ,'' [DISPLAY_TEXT] ,null as CSS_SCORE      
  FROM [CSS_BATCH_CUSTOMERS] CB      
  INNER JOIN PROJECT P on p.proj_id = CB.proj_id      
  INNER JOIN CUSTOMER C on c.cust_id = CB.cust_id      
  INNER JOIN CSS_BATCHES B ON B.ID = CB.BATCH_ID    and b.ISACTIVE =1  
  WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE  BETWEEN @startDate AND @endDate) OR  ( B.END_DATE  BETWEEN @startDate AND @endDate))     
  AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))   and cb.ISACTIVE =1  
   
  
  UNION  
  
      
 SELECT       
  0 ID, CB.PROJ_ID [PROJECT_ID], CB.CUST_ID [CUSTOMER_ID], P.PROJ_DM_EMP_ID [CSM_EMP_ID], P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID]      
  , CB.DISPLAY_NAME RESPONDENT_NAME, SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],   
CASE              
               
WHEN month BETWEEN 4 AND 6 THEN 'Q1 '   + CONVERT(varchar, b.Year)  +'-' +     CONVERT(varchar, b.Year -1999)      
WHEN month BETWEEN 7 AND 9 THEN 'Q2 '    + CONVERT(varchar, b.Year)    +'-' +     CONVERT(varchar, b.Year -1999)            
WHEN month BETWEEN 10 AND 12 THEN 'Q3 '    + CONVERT(varchar, b.Year)      +'-' +     CONVERT(varchar, b.Year -1999)          
ELSE 'Q4 ' + CONVERT(varchar, (b.Year-1) )   +'-' +     CONVERT(varchar, b.Year -1-1999)                 
END        as      
[ Year_QUARTER]   
    
  
  , CASE WHEN P.PROJ_ID LIKE '201%' THEN 'India' WHEN P.PROJ_ID LIKE '202%' THEN 'US' WHEN P.PROJ_ID LIKE '206%' THEN 'Oman' WHEN P.PROJ_ID LIKE '207%' THEN 'Dubai' WHEN P.PROJ_ID LIKE '209%' THEN 'Saudi Arabia' ELSE '' END AS REGION      
  , '' [ACTION_PLAN_SCORE], '' [ACTION_PLAN_COMMENTS], '' [ACTION_ITEM_NPS], '' [ACTION_PLAN_REQUIRED], NULL [DUE_DATE], NULL [ACTION_PLAN_DISCUSSED_DATE], '' [PROGRESS_OF_CSAT_ACTION_PLAN], '' [NO_OF_DAYS_TO_PROVIDE_ACTION_PLAN]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in (1,6,14)) AS [OVERALL_QUALITY_OF_DELIVERABLE]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in (1,6,14)) AS [OVERALL_QUALITY_OF_DELIVERABLE_REMARKS]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in( 2,7)) AS [ENABLING_SUCCESS]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in( 2,7)) AS [ENABLING_SUCCESS_REMARKS]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in (3,8)) AS [VALUE_ADDS]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in (3,8)) AS [VALUE_ADDS_REMARKS]      
  , NULL [RESPONSIVENESS]      
  , (SELECT TOP 1 RATING FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in (select id from CSS_QUESTION_MASTER where QUESTION_CATEGORY ='NPS')) AS [NPS_SCORE]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID in (4,16,17,21)) AS [NPS_REMARKS]      
  , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '')  FROM CSS_QUESTION_REPLIES R WHERE CB.ID = R.Batch_Customer_Monthly_id AND QUESTION_ID = 5) AS [FEEDBACK]      
  , '' [COMMENTS] ,'' [DISPLAY_TEXT] ,null as CSS_SCORE      
  FROM [CSS_BATCH_CUSTOMER_MONTHLY]  CB  
  INNER JOIN PROJECT P on p.proj_id = CB.proj_id      
  INNER JOIN CUSTOMER C on c.cust_id = CB.cust_id      
  INNER JOIN CSS_BATCH_monthly B ON B.ID = CB.BATCH_MONTHLY_ID    and b.ISACTIVE = 1  
  WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE  BETWEEN @startDate AND @endDate) OR  ( B.END_DATE  BETWEEN @startDate AND @endDate))     
  AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))   and cb.ISACTIVE =1  
  ) TBL1      
     
END  

GO


IF EXISTS(Select 1 from sys.objects where name ='getCSSResponseSummaryForPeriod' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSResponseSummaryForPeriod]
END

GO

CREATE PROCEDURE [dbo].[getCSSResponseSummaryForPeriod]          
    
@startDate varchar(10),        
@endDate varchar(10),        
@custIds varchar(max)        
AS          
    
BEGIN         
          
  SELECT           
     0 ID          
    ,P.[PROJ_ID]          
    ,[PROJ_NM]          
    ,B.FREQUENCY [CSAT_FREQUENCY]          
    ,CASE           
    WHEN B.SEQUENCE = 1 THEN 'June'           
    WHEN B.SEQUENCE = 2 THEN 'September'          
    WHEN B.SEQUENCE = 3 THEN 'December'           
    WHEN B.SEQUENCE = 4 THEN 'March'           
   END AS [CSAT_MONTH]          
    ,B.YEAR [CSAT_YEAR]          
    ,[EMAIL_ID] [CLIENT_EMAIL_ID]          
    ,[DISPLAY_NAME] [CLIENT_NAME]          
    ,CB.STATUS          
    ,[SURVEY_SENT_DATE] [INITIATED_DATE]          
    ,[SURVEY_RECEIVED_DATE] [SUBMISSION_DATE],
	
	case when b.frequency = 'quarterly' then 'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)  
	when b.frequency ='halfyearly' then 'H' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)  end
	
	YEAR_QUARTER        
  FROM [CSS_BATCH_CUSTOMERS] CB          
  INNER JOIN PROJECT P ON  CB.PROJ_ID = P.PROJ_ID          
  INNER JOIN CSS_BATCHES B ON B.ID = CB.BATCH_ID          
  --WHERE ((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate))         
   WHERE  ( B.START_DATE between  @STARTDATE  and @ENDDATE or B.END_DATE between  @STARTDATE AND @ENDDATE    )                    
  AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))       
  AND CB.STATUS NOT IN ('CREATED')    
        
END    

GO

IF EXISTS(Select 1 from sys.objects where name ='getTaskDetailsByDateRange' AND type='P')
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
,'' AS FREQUENCY ,IS_DRAFT 
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
ISNULL(TR.FREQUENCY ,'On-Going') AS FREQUENCY ,IS_DRAFT  
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

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME = 'ROOT_CAUSE')
BEGIN
    ALTER TABLE PROJECT_ACTIONITEM ADD ROOT_CAUSE VARCHAR(2000) null;
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME = 'ACTION_TYPE')
BEGIN
    ALTER TABLE PROJECT_ACTIONITEM ADD ACTION_TYPE VARCHAR(2000) null;
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME = 'ACTION_PLAN')
BEGIN
    ALTER TABLE PROJECT_ACTIONITEM ADD ACTION_PLAN VARCHAR(max) null;
END

/****** Object:  StoredProcedure [dbo].[reports_CSAT_Consolidated]    Script Date: 3/26/2025 12:54:09 PM ******/
DROP PROCEDURE IF EXISTS [dbo].[reports_CSAT_Consolidated]
GO
 
--[reports_CSAT_Consolidated] '2024-4-1', '2024-6-30'              
CREATE PROCEDURE [dbo].[reports_CSAT_Consolidated]                     
                    
@StartDate date,                   
@EndDate date                      
                  
AS                    
                  
BEGIN                      
     with cte as          
  (          
SELECT                      
c.cust_nm AS [Customer Name],                      
p.proj_nm AS [Project],             
[CSS Sent - Acc Level] = (select  cast(count(*)  as decimal(12,2)) from CSS_BATCH_CUSTOMERS cbc where cbc.BATCH_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1 and SURVEY_SENT_DATE is not null ),          
[CSS Recd - Acc Level] = (select  cast(count(*)   as decimal(12,2)) from CSS_BATCH_CUSTOMERS cbc where cbc.BATCH_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and STATUS in ('Completed') ),          
display_name AS [Respondent],                      
B.EMAIL_ID AS [Email_Id],                      
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                      
[CSAT sent Date],                      
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],                    
[Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),              
b.STATUS,          
pp.TITLE AS [Portfolio],                      
     [Voice of Customer except NPS] =(select case when min(rating)< 3 then 'Red'          
            when min(rating) = 3 then 'Amber'          
            when min(rating) = 4 then 'Green'          
            when min(rating) =5 then 'Blue' end          
           from css_question_replies r where r.batch_customer_id = b.id and question_category ='criteria') ,          
[Voice of Customer - NPS]  = (select case when min(rating)< 9 then 'Red'          
           when   min(rating) >= 9 then 'Green'           
           else null end          
           from css_question_replies r where r.batch_customer_id = b.id and question_category ='NPS'),          
                     
                
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [Customer Success Manager],             
(SELECT                      
E.EMAIL_ID                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [CSM Mail],             
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [BU Head],             
(SELECT                      
E.EMAIL_ID                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [BU Head Mail],             
--(SELECT                      
--E.FRST_NM                      
--FROM project                      
--INNER JOIN EMP_INFO E                      
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                      
--WHERE project.PROJ_ID = B.PROJ_ID)                      
--AS [ACCOUNT MANAGER],          
p.PROJ_STATUS,                     
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                      
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                      
--P.METHODOLOGY AS [METHODOLOGY],                      
P.DEPARTMENT AS [DEPARTMENT],             
p.REVENUE_TYPE as [PROJECT TYPE],          
--P.PROJECT_GROUP [PROJECT GROUP],                       
--P.COUNTRY [COUNTRY],            
              
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  ),          
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),          
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and pa.status  in ('planned')),          
--After target date, RAG code (Considering all action item completion ) --Green-100% --Amber-60-99% --Red-Less than 60% --Within due date of target date - Grey , minimum of one is completed - green         
Completed =   (select count(*) from PROJECT_ACTIONITEM PA        
  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and pa.status  in ('Completed')),           
          
[CSS - Improvement Plan submission Status] = (select           
                     
            case when max( PA.TARGET_DATE) is null then 'NA'          
             when   max(pa.COMPLETION_DATE) is not null and max(pa.status) in ('Completed') then 'green'          
             when  max(pa.STATUS)   in ('identified') and max(PA.TARGET_DATE) < getdate()   then 'red'          
              --when max(PA.TARGET_DATE) < getdate()+3 and max(pa.COMPLETION_DATE) is   null then 'amber'          
              when  max(pa.COMPLETION_DATE) is   null then 'grey'          
              else 'NA' end           
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1     ),          
                    
 [CSS - Improvement Plan Implementation Status] = (select           
            case when max( PA.PLANNED_TARGET_DATE) is null then 'NA'          
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.planned_actual_date) is not null and max(pa.status) in ('Completed') then 'green'          
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.status) not in ('Completed')  then 'red'    --and max(pa.planned_actual_date) is   null      
              --when max(PA.PLANNED_TARGET_DATE) < getdate()+7 and max(pa.planned_actual_date) is   null then 'amber'          
              when  max(pa.planned_actual_date) is   null then 'grey'          
              else 'NA' end          
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1     ),          
[Voice of Customer url] ='https://csm.gavstech.com/CustomerSuccessSurvey/' + i.survey_Id,          
          
--CASE                  
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                  
--THEN 'Improvement Plan submission Overdue'                  
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                  
--THEN 'Improvement Plan Completion Overdue'                  
--ELSE pa.status                   
--END AS [Action Item Status],                  
                  
--PA.description as [Action Item Description],                    
ACTION_PLAN_SUBMISSION_TARGET_DATE = (select  FORMAT(Max(PA.TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                  
ACTION_PLAN_SUBMISSION_ACTUAL_DATE =  (select  FORMAT(Max(PA.COMPLETION_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                  
ACTION_PLAN_COMPLETION_TARGET_DATE = (select  FORMAT(Max(PA.PLANNED_TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),              
ACTION_PLAN_COMPLETION_ACTUAL_DATE = (select  FORMAT(Max(PA.PLANNED_ACTUAL_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                 
c.Cust_ID AS [Customer_ID]  ,
p.PROJ_ID
                
                  
FROM [CSS_BATCH_CUSTOMERS] b                      
INNER JOIN project p                      
ON p.proj_id = b.proj_id              
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID          
LEFT JOIN portfolio_project PR                      ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                    
LEFT JOIN PORTFOLIO pp                      
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                    
INNER JOIN customer c                      
ON c.cust_id = b.cust_id                    INNER JOIN CSS_BATCHES bt                      
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1                     
                    
--LEFT JOIN PROJECT_ACTIONITEM PA                     
--ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                
WHERE     b.ISACTIVE = 1                    
AND (bt.start_date BETWEEN @StartDate AND @EndDate                      
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                
              
UNION             
          
SELECT                      
c.cust_nm AS [Customer Name],                      
coalesce( pps.product_title + ' (Product)' , p.proj_nm,'') AS [Project],               
[CSS Sent - Acc Level] = (select  cast(count(*)    as decimal(12,2)) from CSS_BATCH_CUSTOMER_MONTHLY cbc where cbc.BATCH_MONTHLY_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and SURVEY_SENT_DATE is not null ),          
[CSS Recd - Acc Level] = (select  cast(count(*)  as decimal(12,2))  from CSS_BATCH_CUSTOMER_MONTHLY cbc where cbc.BATCH_MONTHLY_ID = bt.ID and cbc.CUST_ID = b.CUST_ID and IS_VERIFIED =1  and STATUS in ('completed') ),          
display_name AS [Respondent],                      
B.EMAIL_ID AS [Email_Id],                      
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                      
[CSAT sent Date],                      
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],                    
CASE                    
                     
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                  
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                 
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                 
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                     
END        as            
[Quarter_Year] ,           
b.STATUS,          
pp.TITLE AS [Portfolio],                      
     [Voice of Customer except NPS] =(select case when min(rating)< 3 then 'Red'          
            when min(rating) = 3 then 'Amber'          
            when min(rating) = 4 then 'Green'          
            when min(rating) =5 then 'Blue' end          
           from css_question_replies r where r.Batch_Customer_Monthly_id = b.id and question_category ='criteria') ,          
[Voice of Customer - NPS]  = (select case when min(rating)< 9 then 'Red'          
            when   min(rating) >= 9 then 'Green'           
           else null end          
           from css_question_replies r where r.Batch_Customer_Monthly_id = b.id and question_category ='NPS'),          
                     
                
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [Customer Success Manager],             
(SELECT                      
E.EMAIL_ID                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [CSM Mail],             
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [BU Head],             
(SELECT                      
E.EMAIL_ID                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [BU Head Mail],            
--(SELECT                      
--E.FRST_NM                      
--FROM project                      
--INNER JOIN EMP_INFO E                      
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                      
--WHERE project.PROJ_ID = B.PROJ_ID)                      
--AS [ACCOUNT MANAGER],          
p.PROJ_STATUS,                     
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                      
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                      
--P.METHODOLOGY AS [METHODOLOGY],                      
P.DEPARTMENT AS [DEPARTMENT],                
p.REVENUE_TYPE as [PROJECT TYPE],          
--P.PROJECT_GROUP [PROJECT GROUP],                      
--P.COUNTRY [COUNTRY],            
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  ),          
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),          
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and pa.status  in ('planned')),          
 Completed =   (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and pa.status  in ('Completed')),           
          
[CSS - Improvement Plan submission Status] = (select           
            case when max( PA.TARGET_DATE) is null then 'NA'          
             when   max(pa.COMPLETION_DATE) is not null and max(pa.status) in ('Completed') then 'green'          
            when  max(pa.STATUS)   in ('identified') and max(PA.TARGET_DATE) < getdate()   then 'red'          
              --when max(PA.TARGET_DATE) < getdate()+3 and max(pa.COMPLETION_DATE) is   null then 'amber'          
              when  max(pa.COMPLETION_DATE) is   null then 'grey'          
              else 'NA' end           
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1     ),          
                    
 [CSS - Improvement Plan Implementation Status] = (select           
            case when max( PA.PLANNED_TARGET_DATE) is null then 'NA'          
             when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.planned_actual_date) is not null and max(pa.status) in ('Completed') then 'green'          
         when max(PA.PLANNED_TARGET_DATE) < getdate() and max(pa.status) not in ('Completed')  then 'red'    --and max(pa.planned_actual_date) is   null      
              --when max(PA.PLANNED_TARGET_DATE) < getdate()+7 and max(pa.planned_actual_date) is   null then 'amber'          
              when  max(pa.planned_actual_date) is   null then 'grey'          
              else 'NA' end          
            from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1     ),          
[Voice of Customer url] ='https://csm.gavstech.com/CustomerSuccessSurvey/' + i.survey_Id,          
          
--CASE                  
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                  
--THEN 'Improvement Plan submission Overdue'                  
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                  
--THEN 'Improvement Plan Completion Overdue'                  
--ELSE pa.status                   
--END AS [Action Item Status],                  
                  
--PA.description as [Action Item Description],                    
ACTION_PLAN_SUBMISSION_TARGET_DATE = (select  FORMAT(Max(PA.TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                  
ACTION_PLAN_SUBMISSION_ACTUAL_DATE =  (select  FORMAT(Max(PA.COMPLETION_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                  
ACTION_PLAN_COMPLETION_TARGET_DATE = (select  FORMAT(Max(PA.PLANNED_TARGET_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),              
ACTION_PLAN_COMPLETION_ACTUAL_DATE = (select  FORMAT(Max(PA.PLANNED_ACTUAL_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_MONTHLY_ID = b.ID),                
c.Cust_ID AS [Customer_ID]      ,
p.PROJ_ID                
                
                  
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                      
         
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID          
             
LEFT JOIN PORTFOLIO_PRODUCTS pps   on pps.ID = b.PROD_ID and pps.ISACTIVE  =1          
         
left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7      and  prs.isactive =1  
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)            
LEFT JOIN portfolio_project PR                      
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                    
LEFT JOIN PORTFOLIO pp                      
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1         
INNER JOIN customer c                  
ON c.cust_id = b.cust_id                      
INNER JOIN CSS_BATCH_MONTHLY bt                      
ON bt.id = b.BATCH_MONTHLY_ID and bt.ISACTIVE = 1                     
                    
--LEFT JOIN PROJECT_ACTIONITEM PA                     
--ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                
WHERE     b.ISACTIVE = 1                    
AND (bt.start_date BETWEEN @StartDate AND @EndDate                      
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                        
)          
select [Customer Name],           
 [Type of Account] =  dbo.fn_getTypeOfAccount ([Customer_ID])  ,          
Project ,          
      
Respondent ,        
[CSS Response %] =  cast( [CSS Recd - Acc Level]/[CSS Sent - Acc Level] *100  as decimal(12,2)),          
Email_Id ,          
[CSAT sent Date],          
[CSAT received Date],           
         
[Voice of Customer except NPS] ,          
[Voice of Customer - NPS] ,        
   [No of Days Since Feedback Recd] = DATEDIFF(day, [CSAT received Date], getdate()),         
   [CSS - Improvement Plan submission Status] = case          
             when TotalActionItems =0 then 'NA'          
             when DATEDIFF(day, [CSAT received Date], getdate()) > 7           
             then            
              case when TotalActionItems = Planned + SubmissionCompleted then 'green'          
               --when cast(planned + SubmissionCompleted as decimal(12,2)) / cast(TotalActionItems as decimal(12,2)) > .6 then 'amber'          
               else 'red' end          
             else           
              case when Planned =0 then 'grey' else 'green' end          
              end,          
[CSS - Improvement Plan Implementation Status]   =  case          
             when TotalActionItems =0 then 'NA'          
             when DATEDIFF(day, [CSAT received Date], getdate()) > 28           
             then            
              case when TotalActionItems = Completed then 'green'          
              -- when cast(  Completed as decimal(12,2)) / cast(TotalActionItems as decimal(12,2)) > .6 then 'amber'          
               else 'red' end          
             else           
              case when Completed =0 then 'grey' else 'green' end          
              end,        
[Customer Success Manager] ,          
[CSM Mail],          
[BU Head],          
[BU Head Mail],       
[CONTRACTING UNIT],        
 [BUSSINESS UNIT] as [BUSINESS UNIT],          
 Department,          
PROJ_STATUS ,          
   [Project Type],          
 Year_Quarter ,          
STATUS ,          
Portfolio,         
 [Voice of Customer url] ,          
[ACTION_PLAN_SUBMISSION_TARGET_DATE] ,          
[ACTION_PLAN_SUBMISSION_ACTUAL_DATE],          
[ACTION_PLAN_COMPLETION_TARGET_DATE],           
[ACTION_PLAN_COMPLETION_ACTUAL_DATE],           
[CSS Sent - Acc Level],          
[CSS Recd - Acc Level],          
          
Customer_ID  ,
proj_id
 from cte          
ORDER BY [Year_Quarter], [Customer Name];                      
END 
GO


alter table css_survey_iteration add VALIDITY_DAYS int null


Declare @RESOURCEID int = 122
Declare @EMPID varchar(10) = '104859'
Declare @RescourceName varchar(250) = 'Customer > Voice of Customer'

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
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
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


IF NOT EXISTS (SELECT * FROM AUDIT_MANAGEMENT_CAUSES  WHERE  CAUSES ='Other')
BEGIN
INSERT INTO AUDIT_MANAGEMENT_CAUSES (
  CAUSES,
  ISACTIVE
) VALUES (
    'Other',
	 1
);
END
GO

IF NOT EXISTS (SELECT * FROM AUDIT_MANAGEMENT_ROOTCAUSES  WHERE  ROOT_CAUSE ='Other')
BEGIN
INSERT INTO AUDIT_MANAGEMENT_ROOTCAUSES (
  CAUSE_ID,
  ROOT_CAUSE,
  ISACTIVE
) VALUES (
     (SELECT ID FROM AUDIT_MANAGEMENT_CAUSES WHERE CAUSES ='Other'),
    'Other',
	 1
);
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'AUDIT_FINDINGS_CAPA' AND COLUMN_NAME='ROOTCAUSE_OTHER')
BEGIN
ALTER TABLE AUDIT_FINDINGS_CAPA add ROOTCAUSE_OTHER VARCHAR(1000) NULL;
END
GO

IF NOT EXISTS ( SELECT 1 FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME = 'Customer Success Survey Report – Half yearly' AND SP_NAME = 'reports_CSAT_Halfyearly' AND DB_NAME = 'BAS')
BEGIN INSERT INTO REPORTS_SP_DETAILS (SP_DISPLAY_NAME, SP_NAME, DB_NAME) 
    VALUES ('Customer Success Survey Report – Half yearly', 'reports_CSAT_Halfyearly', 'BAS');
END

IF EXISTS (SELECT 1 FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME = 'Customer Success Survey Report – All A/C' AND SP_NAME = 'dbo.reports_CSAT_Combined')
BEGIN
    UPDATE REPORTS_SP_DETAILS SET SP_DISPLAY_NAME = 'Customer Success Survey Report – Quarterly' WHERE SP_DISPLAY_NAME = 'Customer Success Survey Report – All A/C' AND 
	SP_NAME = 'dbo.reports_CSAT_Combined';
END

IF NOT EXISTS (SELECT 1 FROM REPORTS_PARAMS WHERE REPORT_SP_ID = 62 AND PARAM_NAME = 'StartDate' AND PARAM_TYPE = 'DATE' AND PARAM_VALUE = '2024-10-01')
BEGIN INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE) 
    VALUES (62, 'StartDate', 'DATE', '2024-10-01');
END

IF NOT EXISTS (SELECT 1 FROM REPORTS_PARAMS WHERE REPORT_SP_ID = 62 AND PARAM_NAME = 'EndDate' AND PARAM_TYPE = 'DATE' AND PARAM_VALUE = '2025-02-14')
BEGIN INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE) 
    VALUES (62, 'EndDate', 'DATE', '2025-02-14');
END

DROP PROCEDURE IF EXISTS [dbo].[reports_CSAT_Halfyearly]
GO

DROP PROCEDURE IF EXISTS [dbo].[reports_CSAT_Combined]
GO

--[reports_CSAT_Combined] '2024-4-1', '2024-6-30'                 
CREATE PROCEDURE [dbo].[reports_CSAT_Combined]                     
                    
@StartDate date,                   
@EndDate date                      
                  
AS                    
                  
BEGIN                      
                    
SELECT                      
c.cust_nm AS [Customer Name],                      
p.proj_nm AS [Project Name],        
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,       
display_name AS [Respondent Name],                      
B.EMAIL_ID AS [Email_Id],                      
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                      
[CSAT sent Date],                      
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                    
[Year_Quarter] = 'Q' + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),
pp.TITLE AS [Portfolio],                      
qr.QUESTION_CATEGORY,                      
qr.QUESTION,                      
qr.RATING,                      
qr.RATING_DESCRIPTION,          
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [Customer Success Manager],                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_AM_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [ACCOUNT MANAGER],           
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [BU Head],            
       
         
p.PROJ_STATUS,                     
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                      
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                      
P.METHODOLOGY AS [METHODOLOGY],                      
P.DEPARTMENT AS [DEPARTMENT],                      
P.PROJECT_GROUP [PROJECT GROUP],              
p.REVENUE_TYPE as [PROJECT TYPE],          
P.COUNTRY [COUNTRY],                    
CASE                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                  
THEN 'Improvement Plan submission Overdue'                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                  
THEN 'Improvement Plan Completion Overdue'                  
ELSE pa.status                   
END AS [Action Item Status],                  
                  
PA.description as [Action Item Description],                  
[Voice of Customer url] ='https://csm.gavstech.com/CustomerSuccessSurvey/' + i.survey_Id,            
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,                  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,     
p.proj_id,
c.Cust_ID AS [Customer_ID]                     
                
                  
FROM [CSS_BATCH_CUSTOMERS] b                      
INNER JOIN project p                      
ON p.proj_id = b.proj_id          
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
LEFT JOIN portfolio_project PR                      
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                    
LEFT JOIN PORTFOLIO pp                      
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                    
INNER JOIN customer c                      
ON c.cust_id = b.cust_id                      
INNER JOIN CSS_BATCHES bt                     
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1                 
INNER JOIN CSS_QUESTION_REPLIES QR                      
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                    
LEFT JOIN PROJECT_ACTIONITEM PA                     
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                    
AND (bt.start_date BETWEEN @StartDate AND @EndDate                      
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                
              
UNION
              
SELECT                      
c.cust_nm AS [Customer Name],                      
COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],          
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,       
b.DISPLAY_NAME AS [Respondent Name],                      
B.EMAIL_ID AS [Email_Id],                      
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],                      
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                    
CASE                    
                     
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                  
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                 
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                 
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                     
END        as            
[Quarter_Year],                      
pp.TITLE [Portfolio],                      
qr.QUESTION_CATEGORY,                      
qr.QUESTION,                      
qr.RATING,                      
qr.RATING_DESCRIPTION,          
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [Customer Success Manager],                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_AM_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [ACCOUNT MANAGER],          
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [BU Head],        
         
p.PROJ_STATUS,                        
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                      
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                      
P.METHODOLOGY AS [METHODOLOGY],                      
P.DEPARTMENT AS [DEPARTMENT],                      
P.PROJECT_GROUP [PROJECT GROUP],             
p.REVENUE_TYPE as [PROJECT TYPE],          
P.COUNTRY [COUNTRY],                    
CASE                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                  
THEN 'Improvement Plan submission Overdue'                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                  
THEN 'Improvement Plan Completion Overdue'                  
ELSE pa.status                   
END AS [Action Item Status],                    
PA.description as [Action Item Description],              
[Voice of Customer url] ='https://csm.gavstech.com/CustomerSuccessSurvey/' + i.survey_Id,            
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,    
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,         
p.proj_id,
c.Cust_ID AS [Customer_ID]                
                
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                      
INNER JOIN CSS_BATCH_MONTHLY bt                      
ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1             
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
INNER JOIN CSS_QUESTION_REPLIES QR                      
ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1                    
INNER JOIN customer c                      
ON c.cust_id = b.cust_id                      
                 
                  
                   
left join portfolio_products pps on b.prod_id = pps.id       
left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7    and prs.ISACTIVE =1
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)       
LEFT JOIN portfolio_project PR                      
ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1     
LEFT JOIN PORTFOLIO pp                      
ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1     
LEFT JOIN PROJECT_ACTIONITEM PA                     
ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1        and pa.description like '%' + qr.question +'%'                
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                    
AND (bt.start_date BETWEEN @StartDate AND @EndDate                      
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                      
ORDER BY [Year_Quarter], [Customer Name];                  
END 
GO

--[reports_CSAT_Combined] '2024-4-1', '2024-6-30'                 
CREATE PROCEDURE [dbo].[reports_CSAT_Halfyearly]                     
                    
@StartDate date,                   
@EndDate date                      
                  
AS                    
                  
BEGIN                      
                    
SELECT                      
c.cust_nm AS [Customer Name],                      
p.proj_nm AS [Project Name],        
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,       
display_name AS [Respondent Name],                      
B.EMAIL_ID AS [Email_Id],                      
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                      
[CSAT sent Date],                      
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                    
[Half_Year] = 'H' + CASE 
        WHEN bt.sequence IN (1,2) THEN '1'
        WHEN bt.sequence IN (3,4) THEN '2'
    END + ' - ' + CONVERT(varchar, bt.Year),               
pp.TITLE AS [Portfolio],                      
qr.QUESTION_CATEGORY,                      
qr.QUESTION,                      
qr.RATING,                      
qr.RATING_DESCRIPTION,          
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [Customer Success Manager],                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_AM_EMP_ID                      
WHERE project.PROJ_ID = B.PROJ_ID)                      
AS [ACCOUNT MANAGER],           
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [BU Head],            
       
         
p.PROJ_STATUS,                     
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                      
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                      
P.METHODOLOGY AS [METHODOLOGY],                      
P.DEPARTMENT AS [DEPARTMENT],                      
P.PROJECT_GROUP [PROJECT GROUP],              
p.REVENUE_TYPE as [PROJECT TYPE],          
P.COUNTRY [COUNTRY],                    
CASE                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                  
THEN 'Improvement Plan submission Overdue'                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                  
THEN 'Improvement Plan Completion Overdue'                  
ELSE pa.status                   
END AS [Action Item Status],                  
                  
PA.description as [Action Item Description],                  
[Voice of Customer url] ='https://csm.gavstech.com/CustomerSuccessSurvey/' + i.survey_Id,            
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,                  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,     
p.proj_id,
c.Cust_ID AS [Customer_ID]                     
                
                  
FROM [CSS_BATCH_CUSTOMERS] b                      
INNER JOIN project p                      
ON p.proj_id = b.proj_id          
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
LEFT JOIN portfolio_project PR                      
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                    
LEFT JOIN PORTFOLIO pp                      
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                    
INNER JOIN customer c                      
ON c.cust_id = b.cust_id                      
INNER JOIN CSS_BATCHES bt                     
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1                 
INNER JOIN CSS_QUESTION_REPLIES QR                      
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                    
LEFT JOIN PROJECT_ACTIONITEM PA                     
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                    
AND (bt.start_date BETWEEN @StartDate AND @EndDate                      
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                
              
UNION
              
SELECT                      
c.cust_nm AS [Customer Name],                      
COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],          
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,       
b.DISPLAY_NAME AS [Respondent Name],                      
B.EMAIL_ID AS [Email_Id],                      
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],                      
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                    
CASE                    
    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 1 AND 6 THEN 'H1 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                  
    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 7 AND 12 THEN 'H2 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                                 
END AS [HALF_Year],                      
pp.TITLE [Portfolio],                      
qr.QUESTION_CATEGORY,                      
qr.QUESTION,                      
qr.RATING,                      
qr.RATING_DESCRIPTION,          
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_DM_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [Customer Success Manager],                      
(SELECT                      
E.FRST_NM                      
FROM project                      
INNER JOIN EMP_INFO E                      
ON E.EMP_ID = project.PROJ_AM_EMP_ID                      
WHERE project.PROJ_ID = p.PROJ_ID)                      
AS [ACCOUNT MANAGER],          
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                        
WHERE project.PROJ_ID = p.PROJ_ID)                        
AS [BU Head],        
         
p.PROJ_STATUS,                        
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                      
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                      
P.METHODOLOGY AS [METHODOLOGY],                      
P.DEPARTMENT AS [DEPARTMENT],                      
P.PROJECT_GROUP [PROJECT GROUP],             
p.REVENUE_TYPE as [PROJECT TYPE],          
P.COUNTRY [COUNTRY],                    
CASE                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                  
THEN 'Improvement Plan submission Overdue'                  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                  
THEN 'Improvement Plan Completion Overdue'                  
ELSE pa.status                   
END AS [Action Item Status],                    
PA.description as [Action Item Description],              
[Voice of Customer url] ='https://csm.gavstech.com/CustomerSuccessSurvey/' + i.survey_Id,            
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,    
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,         
p.proj_id,
c.Cust_ID AS [Customer_ID]                
                
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                      
INNER JOIN CSS_BATCH_MONTHLY bt                      
ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1             
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID            
INNER JOIN CSS_QUESTION_REPLIES QR                      
ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1                    
INNER JOIN customer c                      
ON c.cust_id = b.cust_id                      
                 
                  
                   
left join portfolio_products pps on b.prod_id = pps.id       
left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7    and prs.ISACTIVE =1
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)       
LEFT JOIN portfolio_project PR                      
ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1     
LEFT JOIN PORTFOLIO pp                      
ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1     
LEFT JOIN PROJECT_ACTIONITEM PA                     
ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1        and pa.description like '%' + qr.question +'%'                
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                    
AND (bt.start_date BETWEEN @StartDate AND @EndDate                      
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                      
ORDER BY [Half_Year], [Customer Name];                      


                    
END 
GO
