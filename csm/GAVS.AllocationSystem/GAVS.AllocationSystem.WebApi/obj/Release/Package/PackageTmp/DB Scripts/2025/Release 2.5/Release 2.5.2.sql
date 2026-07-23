
 IF NOT EXISTS(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='contacts' and COLUMN_NAME='Category' )
BEGIN
 alter table contacts add  CATEGORY varchar(10) null
END


IF EXISTS(Select 1 from sys.objects where name ='getCSSTableForPeriod1' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForPeriod1]
END
GO


CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]                
              
@startDate varchar(10),                                              
@endDate varchar(10),                                              
@custIds varchar(max)='-1',                  
@csmIds varchar(max)='-1',      
@frequency varchar(100) ='Both'      
              
AS                
BEGIN                                            
                                                     
;With NonPremierAccounts AS (                                                    
                                                    
select distinct CB.CUST_ID , P.PROJ_ID,isnull( P.PROJ_NM, c.CUST_NM) as proj_nm, isnull( CT.CONTACT_NAME, cb.DISPLAY_NAME) as CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                              
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20)) +'/'+P.PROJ_ID+'/true'  , r1.CREATED_DATE, r1.batch_customer_id,RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)           
  
    
,      
case when b.FREQUENCY ='Annual' then '(A)' when b.frequency ='Quarterly' then '(Q)' else '(H)' end as Frequency      
                      
FROM [CSS_BATCH_CUSTOMERS] CB  (NOLOCK)      
inner join customer  C on c.cust_id = cb.CUST_ID
                            
INNER JOIN CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1                                
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and PERSPECTIVE in( 'Overall Experience','Meeting Delivery Commitments') and R1.ISACTIVE = 1                                
LEFT JOIN CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                                
LEFT join CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1   
OUTER APPLY (
    SELECT TOP 1 PROJ_ID, PROJ_NM, PROJ_STATUS,PROJ_DM_EMP_ID
    FROM PROJECT
    WHERE ((PROJ_ID = CB.PROJ_ID AND B.FREQUENCY != 'Annual')  OR 
        (CUST_ID = CB.CUST_ID AND B.FREQUENCY = 'Annual'))
--left JOIN PROJECT P (NOLOCK) on  ( (p.proj_id = CB.proj_id  and b.frequency!= 'Annual')     or (cb.cust_id = p.cust_id and  b.frequency = 'Annual') ) and isnull(p.proj_status,'') != 'close' 
 AND ISNULL(PROJ_STATUS, '') != 'close'
) P
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                                
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                                         
AND (@csmIds ='-1' OR P.PROJ_DM_EMP_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))                            
AND (@frequency ='Both' or b.frequency = @frequency)      
),                                                 
                                                    
PremierAccount As (                                                    
select CB.CUST_ID , 'Premier' as CUST_NM, P.PROJ_ID, P.PROJ_NM, isnull( CT.CONTACT_NAME, cb.DISPLAY_NAME) as CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                      
  
    
      
        
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20))+'/0/true', r1.CREATED_DATE, r1.batch_customer_monthly_id,                                
RN = row_number() OVER(partition by CB.EMAIL_ID, cB.ID, r1.SURVEY_ID ORDER BY cb.id desc, r1.rating )  , pp.id as PROD_ID,                  
pp.PRODUCT_TITLE as PROD_NM  , ' (Q)' as Frequency                            
FROM [CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)                                 
INNER JOIN CSS_BATCH_monthly B (NOLOCK) ON B.ID = CB.BATCH_MONTHLY_ID and B.ISACTIVE = 1                                
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1                                
LEFT JOIN CONTACTS CT (NOLOCK)  on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                                
LEFT JOIN CSS_QUESTION_REPLIES R2 (NOLOCK) on R2.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and R2.ISACTIVE = 1                                
LEFT JOIN PROJECT P ON CB.PROJ_ID = P.PROJ_ID                      
LEFT JOIN PORTFOLIO_PRODUCTS pp on cb.PROD_ID = pp.ID                  
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                                 
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                                
AND (@csmIds ='-1' OR ( @csmIds !='-1' AND CB.cust_id in (select cust_id from PROJECT where  PROJ_DM_EMP_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))))                            
AND (@frequency ='both' or @frequency ='quarterly')      
),                                
                              
 ActionItem AS (                                
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from                                            
  PROJECT_ACTIONITEM PA (NOLOCK)                                           
  join                                       
  CSS_BATCH_CUSTOMERS BC  (NOLOCK)                                         
  on PA.BATCH_CUSTOMER_ID = BC.ID and (PA.SOURCE like  'CSS%' or PA.SOURCE like '%Customer Success Survey%'
  or PA.SOURCE like '%Account Customer Satisfaction Survey%'
  ) and PA.ISACTIVE = 1                                         
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID                           
  join                                         
  CSS_BATCHES B (NOLOCK) ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED'                              
  and ((B.START_DATE                                   
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))                                
  Where PA.Status not in ('Cancelled','Suspended')                   
  AND (@frequency ='both' or b.frequency = @frequency)      
)          ,            
PremierActionItem AS (                                
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from                                            
  PROJECT_ACTIONITEM PA (NOLOCK)                                           
  join                                       
  CSS_BATCH_CUSTOMER_MONTHLY BC  (NOLOCK)                                         
  on PA.BATCH_CUSTOMER_MONTHLY_ID = BC.ID and (PA.SOURCE like  'CSS%' or PA.SOURCE like '%Customer Success Survey%') and PA.ISACTIVE = 1                                         
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID                           
  join                                         
  CSS_BATCH_monthly B (NOLOCK) ON B.ID = BC.BATCH_MONTHLY_ID and BC.STATUS = 'COMPLETED'                              
  and ((B.START_DATE                                   
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))                                
  Where PA.Status not in ('Cancelled','Suspended')           
  AND (@frequency ='both' or @frequency ='quarterly')      
)                      
                              
 SELECT A.PROJ_ID [PROJECT_ID], A.CUST_ID [CUSTOMER_ID],                                                    
 A.CONTACT_NAME RESPONDENT_NAME,                                                         
  A.CONTACT_NAME + ' - ' + A.PROJ_NM + Frequency  as [DISPLAY_TEXT] , A.MIN_SCORE,A.NPS_SCORE,Null as CSS_SCORE,A.URL,    ActionplanURL,                                        
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),                                
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA                                 
  Where PA.Status in ('In Progress','Open') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                                   
  FROM                                 
  NonPremierAccounts A Where A.RN = 1               
                                  
  UNION                                       
                                  
  SELECT                       
   '0' [PROJECT_ID], A.CUST_ID [CUSTOMER_ID]                                               
  , A.CONTACT_NAME RESPONDENT_NAME                                
  , CASE                   
  WHEN A.PROJ_ID IS not null  THEN A.CONTACT_NAME +' - ' + A.PROJ_NM    + Frequency                  
  WHEN A.PROD_ID IS not null  THEN A.CONTACT_NAME +' - ' + A.PROD_NM     + Frequency                  
    ELSE A.CONTACT_NAME +' - ' + A.CUST_NM     + Frequency                     
 END as [DISPLAY_TEXT]                      
  , null MIN_SCORE ,A.NPS_SCORE,A.MIN_SCORE as CSS_SCORE,A.URL,   ActionplanURL,              
              
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from PremierActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),                                
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from PremierActionItem PA                                 
  Where PA.Status in ('In Progress','Open') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                       
              
  FROM                                         
  PremierAccount A Where A.RN = 1                                                     
  order by RESPONDENT_NAME                                  
                                  
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
    ,case when CB.STATUS  ='DRAFT' THEN 'MAIL SENT' else cb.STATUS END as [STATUS]              
    ,[SURVEY_SENT_DATE] [INITIATED_DATE]            
    ,[SURVEY_RECEIVED_DATE] [SUBMISSION_DATE],  
   
 case when b.frequency = 'quarterly' then 'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)    
 when b.frequency in('halfyearly','half-yearly') then 'H' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)  
  when b.frequency in('Annual') then 'Annual' +  ' - ' + CAST(B.YEAR AS VARCHAR) end YEAR_QUARTER          
  FROM [CSS_BATCH_CUSTOMERS] CB            
  --left JOIN PROJECT P ON  CB.PROJ_ID = P.PROJ_ID            
  INNER JOIN CSS_BATCHES B ON B.ID = CB.BATCH_ID            
  --WHERE ((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate))     
    OUTER APPLY (
    SELECT TOP 1 PROJ_ID, PROJ_NM, PROJ_STATUS,PROJ_DM_EMP_ID,PROJ_BUHEAD_EMP_ID
    FROM PROJECT
    WHERE ((PROJ_ID = CB.PROJ_ID AND B.FREQUENCY != 'Annual')  OR 
        (CUST_ID = CB.CUST_ID AND B.FREQUENCY = 'Annual'))
 AND ISNULL(PROJ_STATUS, '') != 'close'
) P
   WHERE  ( B.START_DATE between  @STARTDATE  and @ENDDATE or B.END_DATE between  @STARTDATE AND @ENDDATE    )                      
  AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))         
  AND CB.STATUS NOT IN ('CREATED') and CB.ISACTIVE =1     
          
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
	when b.frequency ='half-yearly' then 'H' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR) 
  when b.frequency in('Annual') then 'Annual' +  ' - ' + CAST(B.YEAR AS VARCHAR) end YEAR_QUARTER      
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
 -- LEFT JOIN PROJECT P on p.proj_id = CB.proj_id      
  INNER JOIN CUSTOMER C on c.cust_id = CB.cust_id      
  INNER JOIN CSS_BATCHES B ON B.ID = CB.BATCH_ID    and b.ISACTIVE =1  
  OUTER APPLY (
    SELECT TOP 1 PROJ_ID, PROJ_NM, PROJ_STATUS,PROJ_DM_EMP_ID,PROJ_BUHEAD_EMP_ID
    FROM PROJECT
    WHERE ((PROJ_ID = CB.PROJ_ID AND B.FREQUENCY != 'Annual')  OR 
        (CUST_ID = CB.CUST_ID AND B.FREQUENCY = 'Annual'))
 AND ISNULL(PROJ_STATUS, '') != 'close'
) P
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
        END as [ Year_QUARTER]     
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

IF EXISTS(Select 1 from sys.objects where name ='reports_getACSATCustomerSucessSurvey' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getACSATCustomerSucessSurvey] 
END
GO
CREATE PROCEDURE [dbo].[reports_getACSATCustomerSucessSurvey]                 
@STARTDATE DATETIME,                      
@ENDDATE DATETIME,
@CUSTOMER varchar(max)='0'
                
AS
BEGIN
                
SET @STARTDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@STARTDATE, 111 ) + ' 00:00:00', 111)                      
SET @ENDDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@ENDDATE, 111 ) + ' 23:59:59', 111)                      
SELECT C.CUST_NM,          
CSS.STATUS,    
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS [CSAT SENT DATE],                      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS [CSAT RECEIVED DATE], 

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.DP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [CSM NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.DP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [CSM MAIL],

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_AM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [ACCOUNT MANAGER NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_AM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [ACCOUNT MANAGER MAIL],

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [BU HEAD NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [BU HEAD MAIL],

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [DP NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [DP MAIL],

CSS.DISPLAY_NAME as [RESPONDENT NAME],
co.CONTACT_ROLE as  [RESPONDENT ROLE],
CSS.EMAIL_ID as [RESPONDENT MAIL],                      
[YEAR - QUARTER] =  ( case when frequency='Annual' then  frequency  + ' - ' + Convert(varchar,  Year) else
(select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ) end ),  
CASE When predicted_score is null then '-' else convert(varchar, convert(int,predicted_score)) end as [PREDICTED SCORE],
[ACTUAL SCORE] = (select top 1 RATING from CSS_QUESTION_REPLIES where BATCH_CUSTOMER_ID = css.ID and QUESTION_CATEGORY = 'NPS' and PERSPECTIVE = 'Net Promoter Score' ),
C.BUSINESS_UNIT AS [BUSINESS UNIT],
C.CUST_ID, 
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where ',' + spoc + ',' like '%,' + e.email_id + ',%' FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC] ,
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id

FROM CSS_BATCH_CUSTOMERS CSS       
inner join CSS_QUESTION_MODELS cq on cq.id=css.QUESTION_MODEL_ID
INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE   AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID   
INNER JOIN CSS_SURVEY_ITERATION i on css.SURVEY_ID = i.ID
left JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID  
left join EMP_INFO e on p.PROJ_DM_EMP_ID = e.EMP_ID
join CONTACTS co on co.CONTACT_EMAILID = css.EMAIL_ID and co.ISACTIVE = 1
WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')    and css.ISACTIVE =1     
and  (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  )   
and b.frequency ='Annual'
order by C.CUST_NM, P.PROJ_ID                    


END
GO

IF EXISTS(Select 1 from sys.objects where name ='fn_getTypeOfAccount' AND type='FN')
BEGIN
       DROP function [dbo].[fn_getTypeOfAccount] 
END
GO
CREATE function [dbo].[fn_getTypeOfAccount]  
(  
@cust_id varchar(200)  
)  
returns varchar(200)  
AS  
BEGIN  
 declare @result varchar(200)  
 set @result=  (case 
 when @cust_id in (
'202100003',
'202100007',
'202100011',
'202100065',
'202100104',
'202100121',
'202100122',
'202100131',
'212100001',
'212100004') then 'Top 10' end)  
  
 return @result  
END  
GO

IF EXISTS(Select 1 from sys.objects where name ='reports_getQualitySpocs' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQualitySpocs] 
END
GO
       
create PROCEDURE [dbo].[reports_getQualitySpocs]            
AS            
BEGIN            
select  c.cust_nm, p.proj_nm, 
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) , 
convert(varchar,p.start_date,107) as start_date,convert(varchar,p.end_date,107)as end_date,            
HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y' and pr.END_DATE >= GETDATE()),            
proj_status , p.project_type, p.PROC_TYPE as [Project_Category],
p.EXECUTION_TYPE,
p.ENGAGAMENT_TYPE, p.BUSINESS_UNIT, p.DEPARTMENT, p.PROJECT_GROUP, p.CONTRACTING_UNIT, p.REVENUE_TYPE, p.COUNTRY, p.METHODOLOGY,              
status=case when isnull(proj_status, '') != ''  then 'Active' else 'Inactive' end,             
Account_Owner = case when p.proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,           
e.frst_nm as [DEX SPOC],            
e1.frst_nm as PM,      
e1.email_id as [PM Mail ID],    
e3.FRST_NM as Account_Manager,    
e3.email_id as [AM Mail ID],    
e2.frst_nm as [Delivery Partner],    
e2.email_id as [DP Mail ID],    
e4.frst_nm as [BU Head],    
e4.email_id as [BU Mail ID], 
 e5.frst_nm as CSM ,    
e5.email_id as [CSM Mail ID],
(select TOP 1 email_id from emp_info where EMP_ID = e2.reviewer_emp_id) as [CSM Reviewer mail ID],         
(SELECT TOP 1 CONVERT(varchar, ACTUAL_AUDIT_END_DATE, 107)            
FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY aces              
WHERE aces.PROJECT_ID = p.PROJ_ID                   
ORDER BY ACTUAL_AUDIT_END_DATE DESC     ) AS [Last Audited On]  ,            
Project_Configuration = STUFF( (SELECT ', ' + pcs.Setting_Name from project p1              
inner join PROJECT_CONFIGURATION_DATA pdc on pdc.Proj_Id = p.PROJ_ID                   
inner join PROJECT_CONFIGURATION_SETTING pcs on pcs.Id= pdc.Configuration_Setting_Id             
where p1.PROJ_ID=p.PROJ_ID  and  (pdc.end_date is null or pdc.End_date > GETDATE()) order by 1 FOR XML PATH('')),1,1,'' )  ,            
ISO_STANDARDS  = STUFF((SELECT ', ' + PIS.STANDARD_NAME          
FROM PROJECT_ISO_STANDARD PIS INNER JOIN PROJECT_ISO_STANDARD_MAPPING PIM on PIS.ID = PIM.ISO_STANDARD_ID          
WHERE PROJECT_ID = p.PROJ_ID AND PIS.ISACTIVE = 1 and PIM.ISACTIVE=1          
FOR XML PATH('')), 1, 1, ''),          
CERTIFICATION_SCOPES  = STUFF((SELECT ', ' + PCS.SCOPE_NAME          
FROM PROJECT_CERTIFICATION_SCOPE PCS INNER JOIN PROJECT_CERTIFICATION_SCOPE_MAPPING PCM on PCS.ID = PCM.CERTIFICATION_SCOPE_ID          
WHERE PROJECT_ID = p.PROJ_ID AND PCS.ISACTIVE = 1 and PCM.ISACTIVE=1          
FOR XML PATH('')), 1, 1, ''),    
[Service Towers] = (SELECT        STRING_AGG(Title, ', ')   FROM ( select ps.title from       PROCESS_SERVICE_AREA_PROJECT_MAPPING pspm INNER JOIN      PROCESS_SERVICE_AREA_NEW ps ON pspm.SERVICE_AREA_ID = ps.id     where    pspm.proj_id =  p.proj_id and 
ps.isactive =1 and pspm.isactive =1 and ps.show_in_master = 1 )main  ),  
p.proj_id
from project p inner join customer c on p.cust_id = c.cust_id                  
left join emp_info e on e.emp_id  = p.quality_spoc            
inner join emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID               
inner join emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID               
left join emp_info e3 on e3.emp_id  = p.PROJ_AM_EMP_ID         
inner join emp_info e4 on e4.EMP_ID = p.PROJ_BUHEAD_EMP_ID    
left join emp_info e5 on e5.EMP_ID = p.DP_ID    
where isnull(proj_status, '') != 'close'                
order by c.cust_nm, p.proj_nm            
END 
GO

IF EXISTS(Select 1 from sys.objects where name ='getAllAccounts' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllAccounts] 
END
GO

CREATE PROCEDURE  [dbo].[getAllAccounts]    
   
AS                                      
BEGIN       
    
  select  '-1' as CUST_ID ,'All' as CUST_NM,''as BUSINESS_UNIT, 1 as SORT_ORDER        
  union        
  select  '-2' ,'My Accounts'  ,'' ,2  
  union  
  select  '-3' ,'Top 10 Accounts' ,'',3     
  union        
  select  '-4','All Accounts Except Top 10 Accounts','',4    
  union   
  select  '-5','All GS Lab Accounts','',5        
  union       
  select  '-6','GS Lab Key Accounts','',6  
  union
  select  '-7','Strategic Accounts - President','',7
  union        
  select  C.CUST_ID,C.CUST_NM ,c.BUSINESS_UNIT as BUSINESS_UNIT, 8 as SORT_ORDER from CUSTOMER C   
  where c.CUST_ID in (select  distinct P.CUST_ID from PROJECT P where ISNULL(P.PROJ_STATUS,'') != 'Close')    
  and c.BUSINESS_UNIT in('Health Care','India & UK','New Growth','Tech')
  order by SORT_ORDER,CUST_NM        
  
End  
GO




IF NOT exists (select 1 from REPORTS_SP_DETAILS WHERE SP_NAME='dbo.report_getACSATResponseDetails')   
BEGIN
insert into REPORTS_SP_DETAILS values('dbo.report_getACSATResponseDetails', 'ACSAT - Rating and Remarks Report', 'BAS')
END

GO

declare @report_sp_id int
set @report_sp_id = (select top 1 ID from REPORTS_SP_DETAILS where SP_NAME='dbo.report_getACSATResponseDetails')

IF NOT exists (select 1 from REPORTS_PARAMS WHERE REPORT_SP_ID= @report_sp_id)   
BEGIN
insert into REPORTS_PARAMS values(@report_sp_id, 'StartDate', 'DATE','2025-04-01')
insert into REPORTS_PARAMS values(@report_sp_id, 'EndDate', 'DATE','2025-09-30')
insert into REPORTS_PARAMS values(@report_sp_id, 'Customer', 'CUSTOMERID','-1')
END

GO

IF EXISTS(Select 1 from sys.objects where name ='report_getACSATResponseDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[report_getACSATResponseDetails] 
END
GO
CREATE PROCEDURE [dbo].[report_getACSATResponseDetails]            
             
@STARTDATE datetime,      
@ENDDATE datetime ,
@CUSTOMER varchar(max)='0'  
                                                                                                                               
AS                                                
BEGIN       

SELECT                          
c.cust_nm AS [CUSTOMER NAME],                          
'' AS [PROJECT NAME],            
[TYPE OF ACCOUNT] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,           
display_name AS [RESPONDENT NAME],   
co.CONTACT_ROLE AS [RESPONDENT ROLE], 
co.CATEGORY as [RESPONDENT CATEGORY],
B.EMAIL_ID AS [EMAIL_ID],                          
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                          
[CSAT SENT DATE],                          
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT RECEIVED DATE],  IS_VERIFIED,                        
[YEAR - QUARTER]  = case when frequency='Annual' then  frequency  + ' - ' + Convert(varchar,  Year) else 'H' + CASE     
        WHEN bt.sequence IN (1 ) THEN '1'    
        WHEN bt.sequence IN (2) THEN '2'    
    END + ' - ' + CONVERT(varchar, bt.Year) end,                     
max(case when PERSPECTIVE='Net Promoter Score' then  qr.RATING end) as [NPS Rating],   
max(case when PERSPECTIVE='Net Promoter Score' then  qr.RATING_DESCRIPTION end) as [NPS_RATING_DESCRIPTION],  
max(case when PERSPECTIVE='Meeting Delivery Commitments' then  qr.RATING end) as [Meeting Delivery Commitments _Rating],   
max(case when PERSPECTIVE='Meeting Delivery Commitments' then  qr.RATING_DESCRIPTION end) as [Meeting Delivery Commitments_Description],  
max(case when PERSPECTIVE='Customer Engagement and Relationship' then  qr.RATING end) as [Customer Engagement and Relationship_Rating],   
max(case when PERSPECTIVE='Customer Engagement and Relationship' then  qr.RATING_DESCRIPTION end) as [Customer Engagement and Relationship_Description],  
max(case when PERSPECTIVE='Partner adding value to Customer Business' then  qr.RATING end) as [Partner adding value to Customer Business_Rating],   
max(case when PERSPECTIVE='Partner adding value to Customer Business' then  qr.RATING_DESCRIPTION end) as [Partner adding value to Customer Business_Description],  
max(case when QUESTION like '%doing well%' then  qr.RATING_DESCRIPTION end) as [Top Expectations - Doing Well],   
max(case when QUESTION like '%can do better%' then  qr.RATING_DESCRIPTION end) as [Top Expectations - Can do Better],                            
(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [BU HEAD NAME],               
 STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC],                                         
c.BUSINESS_UNIT AS [BUSINESS UNIT]                                                                             
FROM [CSS_BATCH_CUSTOMERS] b                                   
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                                    
INNER JOIN customer c   ON c.cust_id = b.cust_id                          
INNER JOIN CSS_BATCHES bt  ON bt.id = b.Batch_ID and bt.ISACTIVE = 1                     
INNER JOIN CSS_QUESTION_REPLIES QR                          
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                        
join CONTACTS co on co.CONTACT_EMAILID = b.EMAIL_ID and co.ISACTIVE = 1
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1 and bt.FREQUENCY in('Annual')     
AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
and (@CUSTOMER='0' or  c.CUST_ID in	(SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  
GROUP BY 
    c.cust_nm,
    c.cust_id,
    display_name,
    co.CONTACT_ROLE,
    co.CATEGORY,
    B.EMAIL_ID,
    b.SURVEY_SENT_DATE,
    b.SURVEY_RECEIVED_DATE,
    IS_VERIFIED,
    bt.frequency,
    bt.Year,
    bt.sequence,
    c.BUSINESS_UNIT,
    spoc

	END
    GO

    
IF EXISTS(Select 1 from sys.objects where name ='getCSSActionitem_All' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSActionitem_All] 
END

GO

CREATE PROCEDURE [dbo].[getCSSActionitem_All]     
    
@STARTDATE datetime,    
@ENDDATE datetime,
@CUSTOMER varchar(max)='0'  

    
AS            
    
BEGIN         

select  p.BUSINESS_UNIT,C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,
E.FRST_NM as PROJECT_MANAGER,  
E.email_id as [PM_MAIL_ID],    
E1.frst_nm as CSM ,    
E1.email_id as [CSM_MAIL_ID],
E2.frst_nm as [DELIVERY_PARTNER],    
E2.email_id as [DP_MAIL_ID], 
e3.FRST_NM as [DEX SPOC],
SOURCE as SOURCE_CATEGORY,
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE    
,cq.PERSPECTIVE,--sa.CSS_REFERENCE,
sa.SCORE,sa.CUSTOMER_REMARKS,
PA.DESCRIPTION as  [DESCRIPTION / CORRECTIVE_ACTION_PLAN], PA.STATUS, PA.ROOT_CAUSE, PA.PREVENTIVE_ACTION_PLAN,   
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
[Year Quarter] = LEFT(cbt.frequency, 1) + CONVERT(varchar, cbt.sequence) + ' - ' + CONVERT(varchar, cbt.Year),                
PA.BATCH_CUSTOMER_ID,PA.PROJECT_ID,PA.CUSTOMER_ID     ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
     
from PROJECT_ACTIONITEM PA     
CROSS APPLY fn_splitActionItemCssReference(PA.CSS_REFERENCE) sa
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID    
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID       
inner join CSS_BATCH_CUSTOMERS CB on CB.ID = PA.BATCH_CUSTOMER_ID    
inner join CSS_QUESTION_REPLIES CQ on cq.BATCH_CUSTOMER_ID=cb.id and sa.CSS_REFERENCE=cq.QUESTION
inner join CSS_QUESTION_MASTER cm on cm.id=cq.QUESTION_ID
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID    
inner join EMP_INFO E1 on e1.emp_id  = p.PROJ_DM_EMP_ID                 
inner join EMP_INFO E2 on e2.EMP_ID = p.DP_ID 
INNER JOIN CSS_BATCHES cbt ON cbt.id = CB.Batch_ID and cbt.ISACTIVE = 1    
left join EMP_INFO E3 on e3.EMP_ID  = p.QUALITY_SPOC 

where  PA.ISACTIVE=1 and CB.ISACTIVE=1  --and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE
AND (cbt.START_DATE BETWEEN @StartDate AND @EndDate                          
OR cbt.END_DATE BETWEEN @StartDate AND @EndDate)    
and rating between 1 and 3 and cm.QUESTION_CATEGORY ='Criteria' and cm.ISACTIVE=1
and (@CUSTOMER='0' or  c.CUST_ID in	(SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  )
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc    
END    

GO

IF EXISTS(Select 1 from sys.objects where name ='getACSAT_AccountSummaryReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getACSAT_AccountSummaryReport] 
END

GO

CREATE PROCEDURE [dbo].[getACSAT_AccountSummaryReport]            
           
@STARTDATE datetime,    
@ENDDATE datetime,
@CUSTOMER varchar(max)='0'  
                                                                                                                             
AS                                              
BEGIN  
;with cte as
(
select    ISNULL(p.BUSINESS_UNIT, (SELECT TOP 1 BUSINESS_UNIT FROM project WHERE cust_id = c.cust_id AND PROJ_STATUS !='close')) AS BUSINESS_UNIT
,c.cust_id,cust_nm,
case when bc.status in ('Mail Sent','Mail Re-sent','completed') then 1 else 0 end as Sentt, 
case when bc.status ='completed' then 1 else 0 end as Completed ,

case when bc.PREDICTED_SCORE in(9,10) then 'Promoter' end as [NPS_Promotor],
case when  bc.PREDICTED_SCORE in(7,8) then 'Passive'  end as [NPS_Passive],
case when  bc.PREDICTED_SCORE >=0 and  bc.PREDICTED_SCORE <=6 then 'Detractor' end as [NPS_Detractor] ,

case when bc.PREDICTED_SCORE in(9,10) and bc.STATUS='Completed' then 'Promoter'  end as [NPS_R_Promotor],
case when  bc.PREDICTED_SCORE in(7,8) and bc.STATUS='Completed'then 'Passive'  end as [NPS_R_Passive],
case when  bc.PREDICTED_SCORE >=0 and  bc.PREDICTED_SCORE <=6 and bc.STATUS='Completed' then 'Detractor' end as [NPS_R_Detractor] ,

case when (select top 1 isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') in (9,10)
then 'NPS_Actual_Promotor' end as [NPS_Actual_Promotor],
case when (select top 1 isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') in (7,8)
then 'NPS_Actual_Passive' end  as [NPS_Actual_Passive],
case when (select top 1 isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') >= 0 
     and (select top 1 isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') <= 6
then 'NPS_Actual_Detractor' end  as [NPS_Actual_Detractor],
isnull((select   avg(isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'Criteria' and PERSPECTIVE ='Meeting Delivery Commitments' ),0) AVR_DC, 
isnull((select   avg(isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'Criteria' and PERSPECTIVE ='Customer Engagement and Relationship' ),0) AVR_CE, 
isnull((select   avg(isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'Criteria' and PERSPECTIVE ='Partner adding value to Customer Business' ),0) AVR_PC, 
bc.id,bc.predicted_score,bc.SPOC,

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [Delivery Partner],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [Delivery Partner Email Id]

from css_batch_customers bc 
inner join customer c on c.cust_id = bc.cust_id 
left join project p on p.proj_id = bc.PROJ_ID 
left join EMP_INFO e on p.PROJ_DM_EMP_ID = e.EMP_ID
join CSS_BATCHES b on b.ID = bc.BATCH_ID
where  (b.START_DATE BETWEEN @StartDate AND @EndDate                          
OR b.END_DATE BETWEEN @StartDate AND @EndDate)   and b.ISACTIVE=1 and bc.ISACTIVE=1
and (@CUSTOMER='0' or  c.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')) )
and bc.status in ('mail sent', 'mail re-sent', 'completed' ) 
),
SPOC_Aggregation AS
(
    SELECT 
        CUST_ID,cust_nm,
        STUFF((
            SELECT DISTINCT ', ' + e.frst_nm 
            FROM EMP_INFO e 
            WHERE e.email_id IN (SELECT SPOC FROM cte c2 WHERE c2.cust_id = cte.CUST_ID)
            FOR XML PATH('')
        ), 1, 2, '') AS [CSAT SPOC]
    FROM cte
    GROUP BY CUST_ID,CUST_NM
),
Score_Calculation as(
select    BUSINESS_UNIT as [BUSINESS UNIT],cust_nm as [ACCOUNT] ,
convert(varchar, sum(sentt)) AS [CSAT SENT],
case when sum(completed) > 0 then sum(completed) else 0 end AS [CSAT RECEIVED],
convert(varchar, case when sum(sentt) = 0 then  0  else  cast( cast(sum(completed) as decimal(10,2))*100/nullif(sum(sentt),0) as decimal(10,2)) end)+'%' AS [RESPONSE_RATE(%)] ,
cast((count(NPS_Promotor) * 100.0 / NULLIF(sum(sentt), 0)) as decimal(10,2)) - 
cast((count(NPS_Detractor) * 100.0 / NULLIF(sum(sentt), 0)) as decimal(10,2)) AS [Predicted NPS for All Respondents],

cast(case when sum(completed) > 0 then (count(NPS_R_Promotor)   * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) - 
cast(case when sum(completed) > 0 then (count(NPS_R_Detractor) * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) AS [Predicted NPS for Received Responses],

cast(case when sum(completed) > 0 then (count(NPS_Actual_Promotor) * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) - 
cast(case when sum(completed) > 0 then (count(NPS_Actual_Detractor) * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) AS [Actual NPS],

convert(varchar, cast(  case when sum(completed) > 0 then cast(  sum(AVR_DC) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))) AS [Average of Delivery Commitment],
convert(varchar, cast(  case when sum(completed) > 0 then cast(  sum(AVR_CE) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))) AS [Average of Customer Engagement and Relationship],
convert(varchar, cast(  case when sum(completed) > 0 then cast(  sum(AVR_PC) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))) AS [Average of Partner adding value to Customer Business]
, [Delivery Partner]
,[Delivery Partner Email Id]
   
from cte  
group by cust_id, cust_nm,BUSINESS_UNIT,[Delivery Partner],[Delivery Partner Email Id])


SELECT 
    a.*,
    s.[CSAT SPOC]
FROM Score_Calculation a
INNER JOIN SPOC_Aggregation s ON a.ACCOUNT = s.cust_nm
ORDER BY [BUSINESS UNIT], [ACCOUNT];
END

GO
