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
    P.CUST_ID, P.PROJ_ID  , b.id, css.ID  ,
    (SELECT                      
    E.FRST_NM                      
    FROM EMP_INFO E                      
    where EMAIL_ID= SPOC)                      
    AS [CSS SPOC] 
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
    P.CUST_ID, P.PROJ_ID   , b.id, css.ID , ''              
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


IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined_Aggregate' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[reports_CSAT_Combined_Aggregate] 
END
Go
create procedure  [dbo].[reports_CSAT_Combined_Aggregate] 
@StartDate date,                     
@EndDate date                        
as

DECLARE @table table( 
[CUSTOMER NAME] varchar(4000),
[PROJECT NAME]	varchar(4000),
[TYPE OF ACCOUNT]	 varchar(4000),
[RESPONDENT NAME]	 varchar(4000),
EMAIL_ID	 varchar(4000),
[CSAT SENT DATE]	datetime ,
[CSAT RECEIVED DATE]	datetime null,
IS_VERIFIED	bit,
YEAR_QUARTER	 varchar(4000),
PORTFOLIO	varchar(4000),
QUESTION_CATEGORY	varchar(4000),
QUESTION	varchar(4000),
RATING	int ,
RATING_DESCRIPTION varchar(4000),
PROJECT_MANAGER	 varchar(4000),
[CUSTOMER SUCCESS MANAGER]	varchar(4000),
[ACCOUNT MANAGER]	varchar(4000),
[BU HEAD]	 varchar(4000),
PROJ_STATUS	 varchar(4000),
[BUSSINESS UNIT]	varchar(4000),
[CONTRACTING UNIT]	varchar(4000),
METHODOLOGY	varchar(4000),
DEPARTMENT	varchar(4000),
[PROJECT GROUP]	varchar(4000),
[PROJECT TYPE]	varchar(4000),
COUNTRY	varchar(4000),
[ACTION ITEM STATUS]	varchar(4000),
--[ACTION ITEM DESCRIPTION]	varchar(4000),
[ROOT CAUSE] varchar(4000),
[CORRECTIVE ACTION PLAN] varchar(4000),
[PREVENTIVE ACTION PLAN] varchar(4000),
[VOICE OF CUSTOMER URL]	varchar(4000),
ACTION_PLAN_SUBMISSION_TARGET_DATE	datetime null,
ACTION_PLAN_SUBMISSION_ACTUAL_DATE	datetime null,
ACTION_PLAN_COMPLETION_TARGET_DATE	datetime null,
ACTION_PLAN_COMPLETION_ACTUAL_DATE	datetime null,
PROJ_ID	varchar(4000),
CUSTOMER_ID varchar(4000) 
)

insert into @table 
exec  reports_CSAT_Combined @StartDate, @EndDate

select  [CUSTOMER NAME]  ,
 

[PROJECT NAME],
[TYPE OF ACCOUNT]	  ,

[CUSTOMER SUCCESS MANAGER], 
[ACCOUNT MANAGER]	 ,
[BU HEAD]	  ,
PROJ_STATUS	  ,
[BUSSINESS UNIT]	 ,
[CONTRACTING UNIT]	 ,
METHODOLOGY	 ,
DEPARTMENT	 ,
[PROJECT GROUP]	 ,
[PROJECT TYPE]	 ,
COUNTRY	 ,

YEAR_QUARTER, Criteria_AVG = (select avg(t1.rating) from @table t1 where t1.[PROJECT NAME] = t.[PROJECT NAME] and t1.YEAR_QUARTER = t.YEAR_QUARTER and t1.QUESTION_CATEGORY = 'criteria' ),
NPS_AVG = (select avg(t1.rating) from @table t1 where t1.[PROJECT NAME] = t.[PROJECT NAME] and t1.YEAR_QUARTER = t.YEAR_QUARTER and t1.QUESTION_CATEGORY = 'nps' ) from @table t
group by  [CUSTOMER NAME]  ,
 

[PROJECT NAME],
[TYPE OF ACCOUNT]	  ,
YEAR_QUARTER,
[CUSTOMER SUCCESS MANAGER], 
[ACCOUNT MANAGER]	 ,
[BU HEAD]	  ,
PROJ_STATUS	  ,
[BUSSINESS UNIT]	 ,
[CONTRACTING UNIT]	 ,
METHODOLOGY	 ,
DEPARTMENT	 ,
[PROJECT GROUP]	 ,
[PROJECT TYPE]	 ,
COUNTRY	 
 
GO


---as on 21-07-2025

--ACTUAL_DURATION 
if Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='Task' and COLUMN_NAME='ACTUAL_DURATION' and(DATA_TYPE <> 'decimal' or NUMERIC_PRECISION <> 10 or NUMERIC_SCALE <> 2 or IS_NULLABLE <> 'YES'))
BEGIN
    alter table task alter column actual_duration decimal(10,2) null
END


--vARCHARSIZE 
if Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='PROJECT_INSCOPE_DETAILS' and COLUMN_NAME='Tools' and(DATA_TYPE <> 'varchar(max)'))
BEGIN
alter table PROJECT_INSCOPE_DETAILS alter column Tools varchar(max)
end

if Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='PROJECT_INSCOPE_DETAILS' and COLUMN_NAME='TECHNOLOGY' and(DATA_TYPE <> 'varchar(max)'))
BEGIN
alter table PROJECT_INSCOPE_DETAILS alter column TECHNOLOGY varchar(max)
END


--as on 22_07_2025

update REPORTS_SP_DETAILS set SP_DISPLAY_NAME='Customer Success Survey Report All A/C– Pulse survey FY24-25' where id=64
update REPORTS_SP_DETAILS set SP_DISPLAY_NAME = 'Customer Success Survey Report All A/C– ACSAT' where id=64

/****** Object:  StoredProcedure [dbo].[reports_CSAT_Consolidated]    Script Date: 23-07-2025 12:20:12 ******/
--[reports_CSAT_Consolidated] '2024-4-1', '2024-6-30'              

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Consolidated' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[reports_CSAT_Consolidated] 
END
Go
create PROCEDURE [dbo].[reports_CSAT_Consolidated]                     
                    
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
(SELECT                      
E.FRST_NM                      
FROM EMP_INFO E                      
where EMAIL_ID= SPOC)                      
AS [CSS SPOC],
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
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,          
          
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
 left join EMP_INFO e on e.EMP_ID = p.QUALITY_SPOC     ---SPOC Details                
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
'',
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
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,          
          
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
  left join EMP_INFO e on e.EMP_ID = p.QUALITY_SPOC      ---SPOC Details          
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
[CSS SPOC],
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


/****** Object:  StoredProcedure [dbo].[reports_CSAT_Combined]    Script Date: 23-07-2025 16:38:02 ******/
IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[reports_CSAT_Combined] 
END
GO

create PROCEDURE [dbo].[reports_CSAT_Combined]                         
                        
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
[Year_Quarter] = case when FREQUENCY ='Quarterly' then  'Q' else 'H' end+ CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year)   ,    
pp.TITLE AS [Portfolio],                          
qr.QUESTION_CATEGORY,                          
qr.PERSPECTIVE as PERSPECTIVE,                          
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
(SELECT                      
E.FRST_NM                      
FROM EMP_INFO E                      
where EMAIL_ID= SPOC)                      
AS [CSAT SPOC],               
           
             
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
                      
                     
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,     
PA.ROOT_CAUSE AS ROOT_CAUSE,  
PA.description as CORRECTIVE_ACTION_PLAN,   
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,  
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
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1        and bt.FREQUENCY in ('Half-Yearly', 'Quarterly'             )
INNER JOIN CSS_QUESTION_REPLIES QR                          
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                        
LEFT JOIN PROJECT_ACTIONITEM PA                         
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    --and pa.description like '%' + qr.question +'%' 
left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC

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
 '',        
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
                 
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,          
PA.ROOT_CAUSE AS ROOT_CAUSE,  
PA.description as CORRECTIVE_ACTION_PLAN,   
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,  
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
left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC

WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                        
AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                          
ORDER BY [Year_Quarter], [Customer Name];                      
END     
  
GO


IF EXISTS(Select 1 from sys.objects where name ='CSS_Readiness_Report' AND type='P')
BEGIN
    DROP PROCEDURE [dbo].[CSS_Readiness_Report] 
END
GO

--CSS_Readiness_Report '2025-1-1' , '2025-6-30'
CREATE PROCEDURE [dbo].[CSS_Readiness_Report]                          
                          
@StartDate datetime,                          
@EndDate datetime   ,                       
  @CustomerID VARCHAR(50)='0'                      
                      
AS                                 
BEGIN                           
                          
SET @StartDate = CONVERT(DATETIME, CONVERT(VARCHAR(11),@StartDate, 111 ) + ' 00:00:00', 111)                            
SET @EndDate = CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)                                
                          
declare @skipCSAT int = (SELECT ID FROM PROJECT_CONFIGURATION_SETTING WHERE SETTING_KEY ='SKIP_CSAT' AND ISACTIVE=1)     --11                     
                    
;with cte as                    
(                    
  SELECT C.CUST_NM, P.PROJ_NM,                     
  HEAD_COUNT = (select count(*) from proj_resource pr where proj_id = p.proj_id and (pr.start_date between @startDate and  @EndDate  or pr.end_date between @startDate and  @EndDate or ( pr.START_DATE <= @startDate and pr.END_DATE >= @EndDate ))     
  and  CURR_INDC ='y'  and BILL_FLG =1 ),               
            
  CONVERT(VARCHAR,P.START_DATE,107) AS START_DATE,CONVERT(VARCHAR,P.END_DATE,107)AS END_DATE,                                    
  CSS_CONFIGURED = CASE WHEN CU.EMAILID IS NOT NULL THEN 'Yes' ELSE 'No' END,                          
  CUSTOMER_CONTACT_VERIFICATION = (SELECT CASE WHEN CSS.IS_VERIFIED = 1 THEN 'Yes' ELSE 'No' END),                         
  CSS.COMMENTS as VERIFICATION_COMMENTS,                        
  VERIFIED_BY = (SELECT CASE WHEN CSS.IS_VERIFIED=1 THEN E5.FRST_NM                         
   WHEN CSS.COMMENTS IS NOT NULL THEN E5.FRST_NM ELSE NULL END),                         
  CASE WHEN CSS.IS_VERIFIED=1 then CONVERT(VARCHAR,CSS.UPDATED_DATE,107) else null end AS APPROVAL_DATE ,                        
  CU.DISPLAY_NAME as RESPONDENT_NAME,                          
  CU.EMAILID as RESPONDENT_MAIL,                          
  CC.Contact_ROLE as [Role],                 
 '' RoleType,                
  P.PROJ_STATUS , P.PROJECT_TYPE, P.BUSINESS_UNIT, P.DEPARTMENT, P.PROJECT_GROUP, P.CONTRACTING_UNIT,                           
  P.REVENUE_TYPE, P.COUNTRY, P.METHODOLOGY,                        
   [Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,                       
  ACCOUNT_OWNER = CASE WHEN P.PROJ_ID LIKE 'proj%' THEN 'GSLab' ELSE 'GAVS' END,                                     
  E1.FRST_NM AS PM, E1.EMAIL_ID AS [PM MAIL ID], E2.FRST_NM AS CSM, E2.EMAIL_ID AS [CSM MAIL ID],                            
  E3.FRST_NM AS ACCOUNT_MANAGER, E3.EMAIL_ID AS [AM MAIL ID], E4.FRST_NM AS [BU HEAD], E4.EMAIL_ID AS [BU MAIL ID], E.FRST_NM AS QUALITY_SPOC,   
  [CSAT SPOC] = (select frst_nm from emp_info ee where ee.email_id = css.spoc),
  (SELECT TOP 1 EMAIL_ID FROM EMP_INFO WHERE EMP_ID = E2.REVIEWER_EMP_ID) AS [CSM REVIEWER MAIL ID],                      
  SKIP_CSAT = (SELECT case when isnull(bit_value,0) =1 then 'Yes' else 'No' end  FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                        
  SKIP_CSAT_COMMENTS = (SELECT PDC.COMMENTS FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                                     
  P.PROJ_ID, C.CUST_ID   ,  p.proj_dm_Emp_id,  b.id as BATCH_ID, css.id BATCH_CUSTOMER_ID, 0 BATCH_MONTHLY_ID,0 BATCH_CUSTOMER_MONTHLY_ID                                        
                          
  FROM PROJECT P                         
  INNER JOIN CUSTOMER C ON P.CUST_ID = C.CUST_ID                                          
  LEFT JOIN EMP_INFO E ON E.EMP_ID  = P.QUALITY_SPOC                             
  INNER JOIN EMP_INFO E1 ON E1.EMP_ID  = P.PROJ_PM_EMP_ID                                
  INNER JOIN EMP_INFO E2 ON E2.EMP_ID  = P.PROJ_DM_EMP_ID                                       
  INNER JOIN EMP_INFO E3 ON E3.EMP_ID  = P.PROJ_AM_EMP_ID                             
  INNER JOIN EMP_INFO E4 ON E4.EMP_ID = P.PROJ_BUHEAD_EMP_ID          
                         
  LEFT JOIN CSS_BATCHES B ON  ((B.START_DATE BETWEEN @StartDate AND  @EndDate) and (B.END_DATE BETWEEN @StartDate AND  @EndDate)         )               
    LEFT JOIN CSS_BATCH_CUSTOMERS CSS on CSS.PROJ_ID = P.PROJ_ID and css.BATCH_ID = b.ID                 
  LEFT JOIN CUSTOMER_USERS CU on CU.EMAILID = CSS.EMAIL_ID                
  LEFT JOIN EMP_INFO E5 ON E5.EMP_ID = CSS.UPDATED_BY AND E5.DOR IS NULL                        
  LEFT JOIN CONTACTS CC on CC.CONTACT_EMAILID = CSS.EMAIL_ID    AND CC.ISACTIVE =1                  
                 
  WHERE  -- p.end_date > getdate()-90 AND                     
  P.CUST_ID != '212100001' AND                        
  (B.START_DATE IS NULL OR (B.START_DATE BETWEEN @StartDate AND @EndDate AND B.END_DATE BETWEEN @StartDate AND @EndDate))    AND                       
      (@CustomerID='0' or  c.cust_id = @CustomerID)                      
                      
  UNION                        
                        
  SELECT C.CUST_NM, P.PROJ_NM,                      
  HEAD_COUNT = (select count(*) from proj_resource pr where proj_id = p.proj_id and (pr.start_date between @startDate and  @EndDate  or pr.end_date between @startDate and  @EndDate or ( pr.START_DATE <= @startDate and pr.END_DATE >= @EndDate )) and  CURR_INDC ='y'  and BILL_FLG =1 ),                    
  CONVERT(VARCHAR,P.START_DATE,107) AS START_DATE,CONVERT(VARCHAR,P.END_DATE,107)AS END_DATE,                                    
  CSS_CONFIGURED = CASE WHEN CU.EMAILID IS NOT NULL THEN 'Yes' ELSE 'No' END,                          
  CUSTOMER_CONTACT_VERIFICATION = (SELECT CASE WHEN CSS.IS_VERIFIED = 1 THEN 'Yes' ELSE 'No' END),                         
  CSS.COMMENTS as VERIFICATION_COMMENTS,                        
  VERIFIED_BY = (SELECT CASE WHEN CSS.IS_VERIFIED=1 THEN E5.FRST_NM                         
   WHEN CSS.COMMENTS IS NOT NULL THEN E5.FRST_NM ELSE NULL END),                         
    CASE WHEN CSS.IS_VERIFIED=1 then CONVERT(VARCHAR,CSS.UPDATED_DATE,107) else null end AS APPROVAL_DATE ,                      
  CU.DISPLAY_NAME as RESPONDENT_NAME,                          
  CU.EMAILID as RESPONDENT_MAIL,                          
  cc.CONTACT_ROLE AS [role],                  
  CR.ROLE_NAME RoleType,                
  P.PROJ_STATUS , P.PROJECT_TYPE, P.BUSINESS_UNIT, P.DEPARTMENT, P.PROJECT_GROUP, P.CONTRACTING_UNIT,                           
  P.REVENUE_TYPE, P.COUNTRY, P.METHODOLOGY,                          
   [Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,                        
  ACCOUNT_OWNER = CASE WHEN P.PROJ_ID LIKE 'proj%'  THEN 'GSLab' ELSE 'GAVS' END,                                     
  E1.FRST_NM AS PM, E1.EMAIL_ID AS [PM MAIL ID], E2.FRST_NM AS CSM, E2.EMAIL_ID AS [CSM MAIL ID],                            
  E3.FRST_NM AS ACCOUNT_MANAGER, E3.EMAIL_ID AS [AM MAIL ID], E4.FRST_NM AS [BU HEAD], E4.EMAIL_ID AS [BU MAIL ID], E.FRST_NM AS QUALITY_SPOC,   
  '',
  (SELECT TOP 1 EMAIL_ID FROM EMP_INFO WHERE EMP_ID = E2.REVIEWER_EMP_ID) AS [CSM REVIEWER MAIL ID],                              
  SKIP_CSAT = (SELECT case when isnull(bit_value,0) =1 then 'Yes' else 'No' end  FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                     
  SKIP_CSAT_COMMENTS_ = (SELECT PDC.COMMENTS FROM PROJECT_CONFIGURATION_DATA PDC WHERE PDC.PROJ_ID = P.PROJ_ID AND                          
  (PDC.END_DATE IS NULL OR PDC.END_DATE > @EndDate) AND IS_APPROVED=1 AND CONFIGURATION_SETTING_ID= @SKIPCSAT),                                     
  P.PROJ_ID, C.CUST_ID     ,  p.proj_dm_Emp_id, 0 as BATCH_ID, 0 BATCH_CUSTOMER_ID, b.id BATCH_MONTHLY_ID,css.id  BATCH_CUSTOMER_MONTHLY_ID                                      
                     
  FROM PROJECT P                         
  INNER JOIN CUSTOMER C ON P.CUST_ID = C.CUST_ID                                          
  LEFT JOIN EMP_INFO E ON E.EMP_ID  = P.QUALITY_SPOC                                  
  INNER JOIN EMP_INFO E1 ON E1.EMP_ID  = P.PROJ_PM_EMP_ID                                      
  INNER JOIN EMP_INFO E2 ON E2.EMP_ID  = P.PROJ_DM_EMP_ID                                       
  INNER JOIN EMP_INFO E3 ON E3.EMP_ID  = P.PROJ_AM_EMP_ID                                 
  INNER JOIN EMP_INFO E4 ON E4.EMP_ID = P.PROJ_BUHEAD_EMP_ID                          
                         
  LEFT JOIN CSS_BATCH_MONTHLY B ON  ((B.START_DATE BETWEEN @StartDate AND  @EndDate) and (B.END_DATE BETWEEN @StartDate AND  @EndDate)         )                 
    LEFT JOIN CSS_BATCH_CUSTOMER_MONTHLY CSS on CSS.PROJ_ID = P.PROJ_ID    and b.ID = css.BATCH_MONTHLY_ID              
  LEFT JOIN CUSTOMER_USERS CU on CU.EMAILID = CSS.EMAIL_ID                          
  LEFT JOIN EMP_INFO E5 ON E5.EMP_ID = CSS.UPDATED_BY AND E5.DOR IS NULL                        
  LEFT JOIN CONTACTS CC ON CC.CONTACT_EMAILID = CSS.EMAIL_ID    AND CC.ISACTIVE =1                  
   LEFT JOIN CONTACT_ROLES cr on cc.ROLE_ID = cr.ROLE_ID                
  WHERE --p.end_date > @EndDate-90  AND                     
  P.CUST_ID='212100001' AND                        
 (B.START_DATE IS NULL OR (B.START_DATE BETWEEN @StartDate AND @EndDate AND B.END_DATE BETWEEN @StartDate AND @EndDate))    AND                
        (@CustomerID='0' or  c.cust_id = @CustomerID)   --and batch_monthly_id not in (99,-99)                 
)                    
                    
              
                    
select distinct CUST_NM, PROJ_NM,                      
  HEAD_COUNT  ,                    
  START_DATE,                    
   END_DATE,                     
   CSS_Eligible =                    
  ( case when  skip_csat is not null then 'No'                    
   when project_type != 'Internal' and head_count > 3 and start_date < @EndDate -75 and end_date > @EndDate -90 then 'Yes'                    
                  
  else 'No' end),                    
  [Reason] =( case  when project_type != 'Internal' and head_count > 3 and start_date < @EndDate -75 and end_date > @EndDate -90 then  'NA'                    
  when project_type = 'Internal' then 'Internal'                    
  when  skip_csat is not null then 'Skip CSAT'                    
    when head_count <= 3 then 'Head Count less than 4'                    
   when  start_date > (@EndDate -75) then 'Recently Started'                    
   When end_date < (@EndDate - 90) then 'Closed Long Back'                     
                      
  else 'NA' end                    
  ),                    
  CSS_CONFIGURED  ,                          
  CUSTOMER_CONTACT_VERIFICATION  ,                        
  VERIFIED_BY  ,            
  VERIFICATION_COMMENTS,        
   APPROVAL_DATE,                        
    RESPONDENT_NAME,                          
   RESPONDENT_MAIL,                          
   [Role],  RoleType as ROLE_TYPE,                 
  PROJ_STATUS , PROJECT_TYPE, BUSINESS_UNIT, DEPARTMENT, PROJECT_GROUP, CONTRACTING_UNIT,                           
  REVENUE_TYPE, COUNTRY, METHODOLOGY,                          
   [Type of Account] as TYPE_OF_ACCOUNT  ,                        
  ACCOUNT_OWNER  ,                                     
   PM, [PM MAIL ID] as PM_MAIL,   CSM,  [CSM MAIL ID] as CSM_MAIL,                            
    ACCOUNT_MANAGER,  [AM MAIL ID] as AM_MAIL,   [BU HEAD] as BU_HEAD,   [BU MAIL ID] as BU_MAIL,   QUALITY_SPOC, [CSAT SPOC],                          
    [CSM REVIEWER MAIL ID]  as REVIEWER_MAIL,                              
  SKIP_CSAT ,                     
  SKIP_CSAT_COMMENTS ,                                     
  PROJ_ID, CUST_ID    ,BATCH_ID,   BATCH_CUSTOMER_ID,  BATCH_MONTHLY_ID,  BATCH_CUSTOMER_MONTHLY_ID , proj_DM_EMP_ID as CSM_EMP_ID                      
 from cte                    
 where   (isnull(proj_status,'')!='close' or (proj_status = 'close' and end_date between @startdate and @enddate) ) and                     
 PROJECT_TYPE != 'internal' and cust_id !='202100091' and cust_nm not like '%gavs%'                    
ORDER BY CUST_NM, PROJ_NM                              
                          
END
GO



