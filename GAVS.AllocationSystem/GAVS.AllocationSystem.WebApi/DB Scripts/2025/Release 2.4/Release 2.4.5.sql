/****** Object:  StoredProcedure [dbo].[getCSSResponseSummaryForPeriod]    Script Date: 14-07-2025 10:34:02 ******/

IF EXISTS(Select 1 from sys.objects where name ='getCSSResponseSummaryForPeriod' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[getCSSResponseSummaryForPeriod] 
END

GO
Create PROCEDURE [dbo].[getCSSResponseSummaryForPeriod]            
      
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
        ,[SURVEY_RECEIVED_DATE] [SUBMISSION_DATE]
        ,case when b.frequency = 'quarterly' then 'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)    
        when b.frequency in('halfyearly','half-yearly') then 'H' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)  end  YEAR_QUARTER          
    FROM [CSS_BATCH_CUSTOMERS] CB            
    INNER JOIN PROJECT P ON  CB.PROJ_ID = P.PROJ_ID            
    INNER JOIN CSS_BATCHES B ON B.ID = CB.BATCH_ID            
    --WHERE ((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate))           
    WHERE  ( B.START_DATE between  @STARTDATE  and @ENDDATE or B.END_DATE between  @STARTDATE AND @ENDDATE    )                      
    AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))         
    AND CB.STATUS NOT IN ('CREATED')      
          
END
GO


/****** Object:  StoredProcedure [dbo].[getCSSTableForPeriod]    Script Date: 14-07-2025 10:33:09 ******/


IF EXISTS(Select 1 from sys.objects where name ='getCSSTableForPeriod' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[getCSSTableForPeriod] 
END

GO
Create PROCEDURE [dbo].[getCSSTableForPeriod]        
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
        case 
            when b.frequency = 'quarterly' then 'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)    
            when b.frequency in('halfyearly','half-yearly') then 'H' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR)  
        end YEAR_QUARTER        
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

--[reports_getCSSInitatedDetails] '2024-4-1', '2024-6-30' 
IF EXISTS(Select 1 from sys.objects where name ='reports_getCSSInitatedDetails' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[reports_getCSSInitatedDetails] 
END

GO       
Create PROCEDURE [dbo].[reports_getCSSInitatedDetails]                      
                
@STARTDATE DATETIME,                      
@ENDDATE DATETIME                      
                
AS                      
BEGIN                      
    SET @STARTDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@STARTDATE, 111 ) + ' 00:00:00', 111)                      
    SET @ENDDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@ENDDATE, 111 ) + ' 23:59:59', 111)                      
    SELECT 
    C.CUST_NM,          
    [Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,        
    p.Proj_nm , 
    p.REVENUE_TYPE, 
    CSS.STATUS,                      
    CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,                      
    CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,                     
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,                      
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM_MAIL,                      
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,         
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD_MAIL,         
    (select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,                      
    (select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL,                      
    CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,                      
    [Year - Quarter] =  (select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ),  
    CASE When predicted_score is null then '-' else convert(varchar, convert(int,predicted_score)) end as PREDICTED_SCORE,
    p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
    P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
    P.CUST_ID, P.PROJ_ID  , b.id, css.ID                        
    FROM CSS_BATCH_CUSTOMERS CSS                       
    INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE   AND B.END_DATE <= @ENDDATE                      
    INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
    INNER JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID                    
    WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')    and css.ISACTIVE =1                 
                    
    union                        
                    
    SELECT C.CUST_NM,          
    [Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,            
    coalesce( pp.product_title,P.PROJ_NM,'') as proj_nm, p.REVENUE_TYPE, CSS.STATUS,                      
    CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,                      
    CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,                     
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,                      
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM_MAIL,                      
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,           
    (select top 1 frst_nm from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD,                      
    (select top 1 email_id from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD_MAIL,        
    (select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,                      
    (select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL,        
      
    CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,                      
    [Year - Quarter] =  (SELECT                      
    CASE                      
        WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                    
        WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                   
        WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                   
        ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                       
    END                      
    FROM CSS_BATCH_MONTHLY where id= b.id ),    
    '-',
    p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
    P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
    P.CUST_ID, P.PROJ_ID   , b.id, css.ID                  
    from CSS_BATCH_CUSTOMER_MONTHLY CSS                      
    INNER JOIN CSS_BATCH_MONTHLY B ON B.ID = CSS.BATCH_MONTHLY_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE                      
    INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
                
    left join portfolio_products pp on css.prod_id = pp.id           
    left join PRODUCT_RESPONSIBLE pr on css.PROD_ID = pr.PRODUCT_ID and pr.MANAGEMENT_TYPE =7    and pr.ISACTIVE = 1    
    LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(CSS.PROJ_ID , pr.project_id)            
    WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')      and css.ISACTIVE =1              
    order by C.CUST_NM, P.PROJ_ID                      
end 
GO

/****** Object:  StoredProcedure [dbo].[getCSSTableForPeriod1]    Script Date: 14-07-2025 13:08:13 ******/

--[getCSSTableForPeriod1] '2025-4-1', '2025-12-30'  , '-1', '-1', 'half-yearly'  
IF EXISTS(Select 1 from sys.objects where name ='getCSSTableForPeriod1' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[getCSSTableForPeriod1] 
END

GO    
Create PROCEDURE [dbo].[getCSSTableForPeriod1]            
          
@startDate varchar(10),                                          
@endDate varchar(10),                                          
@custIds varchar(max)='-1',              
@csmIds varchar(max)='-1',  
@frequency varchar(100) ='both'  
          
AS            
BEGIN                                        
                                                 
;With NonPremierAccounts AS (                                                
                                                
select CB.CUST_ID , P.PROJ_ID,P.PROJ_NM, isnull( CT.CONTACT_NAME, cb.DISPLAY_NAME) as CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                          
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20)) +'/'+P.PROJ_ID+'/true'  , r1.CREATED_DATE, r1.batch_customer_id,RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)           
,  
case when b.frequency ='Quarterly' then ' (Q)' else ' (H)' end as Frequency  
                  
FROM [CSS_BATCH_CUSTOMERS] CB  (NOLOCK)                          
INNER JOIN PROJECT P (NOLOCK) on p.proj_id = CB.proj_id                            
INNER JOIN CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1                            
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and PERSPECTIVE = 'Overall Experience' and R1.ISACTIVE = 1                            
LEFT JOIN CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                            
LEFT join CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1                            
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                            
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                                     
AND (@csmIds ='-1' OR p.PROJ_DM_EMP_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))                        
AND (@frequency ='both' or b.frequency = @frequency)  
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
  on PA.BATCH_CUSTOMER_ID = BC.ID and (PA.SOURCE like  'CSS%' or PA.SOURCE like '%Customer Success Survey%') and PA.ISACTIVE = 1                                     
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
  Where PA.Status in ('Planned','Started','Identified') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                               
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
  Where PA.Status in ('Planned','Started','Identified') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                   
          
  FROM                                     
  PremierAccount A Where A.RN = 1                                                 
  order by RESPONDENT_NAME                              
                              
END 
GO

IF EXISTS(Select 1 from sys.objects where name ='reports_getQualitySpocs' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[reports_getQualitySpocs] 
END

GO   
CREATE PROCEDURE [dbo].[reports_getQualitySpocs]          
AS          
BEGIN          
    select  c.cust_nm, p.proj_nm,          
    convert(varchar,p.start_date,107) as start_date,
    convert(varchar,p.end_date,107)as end_date,          
    HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y' and pr.END_DATE >= GETDATE()),          
    proj_status , 
    p.project_type, 
    p.BUSINESS_UNIT, 
    p.DEPARTMENT, p.PROJECT_GROUP, p.CONTRACTING_UNIT, p.REVENUE_TYPE, p.COUNTRY, p.METHODOLOGY,            
    status=case when isnull(proj_status, '') != ''  then 'Active' else 'Inactive' end,           
    Account_Owner = case when p.proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,          
    e.frst_nm as SPOC,          
    e1.frst_nm as PM,    
    e1.email_id as [PM Mail ID],  
    e3.FRST_NM as Account_Manager,  
    e3.email_id as [AM Mail ID],  
    e2.frst_nm as CSM,  
    e2.email_id as [CSM Mail ID],  
    e4.frst_nm as [BU Head],  
    e4.email_id as [BU Mail ID],  
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
    [Service Towers] = (SELECT 
          STRING_AGG(Title, ', ')  
    FROM ( select ps.title from 
         PROCESS_SERVICE_AREA_PROJECT_MAPPING pspm
    INNER JOIN 
        PROCESS_SERVICE_AREA_NEW ps ON pspm.SERVICE_AREA_ID = ps.id
        where    pspm.proj_id =  p.proj_id and ps.isactive =1 and pspm.isactive =1 and ps.show_in_master = 1 )main

    ),
    p.proj_id            
    from project p inner join customer c on p.cust_id = c.cust_id                
    left join emp_info e on e.emp_id  = p.quality_spoc          
    inner join emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID             
    inner join emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID             
    left join emp_info e3 on e3.emp_id  = p.PROJ_AM_EMP_ID       
    inner join emp_info e4 on e4.EMP_ID = p.PROJ_BUHEAD_EMP_ID  
    where isnull(proj_status, '') != 'close'              
    order by c.cust_nm, p.proj_nm                
END  
GO

