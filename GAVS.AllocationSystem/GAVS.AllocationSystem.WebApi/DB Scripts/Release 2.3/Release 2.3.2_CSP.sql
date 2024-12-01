

USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForPeriod1' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForPeriod1]
END
GO

CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]                  
@startDate varchar(10),                
@endDate varchar(10),                
@custIds varchar(max)                
AS                  
BEGIN                  
--[dbo].[getCSSTable] 'Q4 2018-19'                   
            
            
;With NonPremierAccounts AS (            
            
select   CB.CUST_ID , P.PROJ_ID,CT.CONTACT_NAME ,MIN(R.RATING) as MIN_SCORE , [NPS_SCORE]= (SELECT  MIN(RATING) FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE        
R.BATCH_CUSTOMER_ID IN ( select BC.ID from CSP..CSS_BATCH_CUSTOMERS BC  join CSS_BATCHES B       
on BC.BATCH_ID = B.ID  and         
((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate)))  AND QUESTION_ID = 4)        
--, YEAR_QUARTER  = (select 'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR) YEAR_QUARTER  from CSS_BATCHES B where         
--((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate)))        
        
  FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] CB                  
  INNER JOIN BAS.DBO.PROJECT P on p.proj_id = CB.proj_id                  
  INNER JOIN BAS.DBO.CUSTOMER C on c.cust_id = CB.cust_id                  
  INNER JOIN CSP.DBO.CSS_BATCHES B ON B.ID = CB.BATCH_ID               
  INNER JOIN CSP..CSS_QUESTION_REPLIES R on R.BATCH_CUSTOMER_ID = CB.ID  and R.ISACTIVE = 1 and R.QUESTION_CATEGORY = 'Criteria'            
  INNER JOIN CSP..CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1            
  WHERE CB.STATUS = 'COMPLETED' and ((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate))                 
  AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))              
            
Group by CB.CUST_ID , P.PROJ_ID,CT.CONTACT_NAME        
),            
         
            
 PremierAccount As (            
SELECT  CBM.EMAIL_ID ,CBM.CUST_ID ,C.CONTACT_NAME , MIN(R.RATING) as CSS_SCORE            
FROM CSP.dbo.CSS_BATCH_CUSTOMER_MONTHLY  CBM            
INNER JOIN CSP.DBO.CSS_BATCH_MONTHLY BM ON BM.ID = CBM.BATCH_MONTHLY_ID and BM.ISACTIVE = 1 and CBM.ISACTIVE = 1            
INNER JOIN CSP..CSS_QUESTION_REPLIES R on R.Batch_Customer_Monthly_id = CBM.ID and R.ISACTIVE = 1 and R.QUESTION_CATEGORY = 'Criteria'            
INNER JOIN CSP..CONTACTS C on C.CUSTOMER_ID = CBM.CUST_ID and C.CONTACT_EMAILID = CBM.EMAIL_ID and C.ISACTIVE = 1            
WHERE CBM.STATUS = 'COMPLETED' and ((convert(varchar,BM.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,BM.END_DATE,23) BETWEEN @startDate AND @endDate))                 
  AND (@custIds = '-1' OR CBM.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))  --and EMAIL_ID = 'Jeremy_Will@premierinc.com'            
            
Group by CBM.EMAIL_ID ,C.CONTACT_NAME,CBM.CUST_ID             
)         
            
SELECT                    
  0 ID, P.PROJ_ID [PROJECT_ID], C.CUST_ID [CUSTOMER_ID], P.PROJ_DM_EMP_ID [CSM_EMP_ID], P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID],C.CUST_NM ,P.PROJ_NM                
  , A.CONTACT_NAME RESPONDENT_NAME, null [CSAT_RECIEVED_DATE], '' YEAR_QUARTER              
  , '' [ACTION_PLAN_SCORE], '' [ACTION_PLAN_COMMENTS], '' [ACTION_ITEM_NPS], '' [ACTION_PLAN_REQUIRED], NULL [DUE_DATE], NULL [ACTION_PLAN_DISCUSSED_DATE], '' [PROGRESS_OF_CSAT_ACTION_PLAN], '' [NO_OF_DAYS_TO_PROVIDE_ACTION_PLAN]                  
  , null AS [OVERALL_QUALITY_OF_DELIVERABLE]                  
  , '' AS [OVERALL_QUALITY_OF_DELIVERABLE_REMARKS]                  
  , null AS [ENABLING_SUCCESS]                  
  , '' AS [ENABLING_SUCCESS_REMARKS]                  
  , null AS [VALUE_ADDS]                  
  , '' AS [VALUE_ADDS_REMARKS]                  
  , NULL [RESPONSIVENESS]        
  , A.NPS_SCORE AS [NPS_SCORE]                  
  , '' AS [NPS_REMARKS]          
  , '' AS [FEEDBACK]                  
  , '' [COMMENTS] , A.CONTACT_NAME + ' - ' + P.PROJ_NM as [DISPLAY_TEXT] ,Null as CSS_SCORE ,A.MIN_SCORE ,     
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from    
	 CSP..PROJECT_ACTIONITEM PA   
	 join  
	 CSP..CSS_BATCH_CUSTOMERS BC  
	 on PA.BATCH_CUSTOMER_ID = BC.ID and PA.SOURCE = 'CSS' and PA.ISACTIVE = 1 and PA.Status in ('Completed','Closed') 
	 and BC.ISACTIVE = 1 and PA.PROJECT_ID = A.PROJ_ID 
	 join 
	 CSP..CSS_BATCHES B ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED' and ((convert(varchar,B.START_DATE,23) 
	 BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate)) 
),    
  
  [ACTION_PLAN_NOT_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from   
 CSP..PROJECT_ACTIONITEM PA   
 join  
 CSP..CSS_BATCH_CUSTOMERS BC  
 on PA.BATCH_CUSTOMER_ID = BC.ID and PA.SOURCE = 'CSS' and PA.ISACTIVE = 1 and PA.Status in ('Planned','Started') and Convert(varchar,PA.TARGET_DATE,23) < GETDATE()  and BC.ISACTIVE = 1 and PA.PROJECT_ID = A.PROJ_ID
 join 
 CSP..CSS_BATCHES B ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED' and ((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate)) 
)  
  FROM            
  BAS.DBO.CUSTOMER C         
  INNER JOIN BAS.DBO.PROJECT P on P.CUST_ID  = C.CUST_ID                
  INNER JOIN NonPremierAccounts A on A.PROJ_ID = p.proj_id          
  --LEFT JOIN CSP..PROJECT_ACTIONITEM PA on PA.PROJECT_ID = P.PROJ_ID and SOURCE = 'CSS' and PA.ISACTIVE = 1 and PA.IDENTIFIED_DATE between @startDate and @endDate      
       
  UNION            
            
  SELECT                    
  0 ID, '0' [PROJECT_ID], C.CUST_ID [CUSTOMER_ID], null [CSM_EMP_ID], null [DELIVERY_HEAD_EMP_ID], C.CUST_NM ,'' as PROJ_NM              
  , A.CONTACT_NAME RESPONDENT_NAME, null [CSAT_RECIEVED_DATE],             
  '' YEAR_QUARTER  , '' [ACTION_PLAN_SCORE], '' [ACTION_PLAN_COMMENTS], '' [ACTION_ITEM_NPS], '' [ACTION_PLAN_REQUIRED], NULL [DUE_DATE], NULL [ACTION_PLAN_DISCUSSED_DATE], '' [PROGRESS_OF_CSAT_ACTION_PLAN], '' [NO_OF_DAYS_TO_PROVIDE_ACTION_PLAN]        
 
  , 0 AS [OVERALL_QUALITY_OF_DELIVERABLE]                  
  , '' AS [OVERALL_QUALITY_OF_DELIVERABLE_REMARKS]                  
  , 0 AS [ENABLING_SUCCESS]                  
  , '' AS [ENABLING_SUCCESS_REMARKS]                  
  , 0 AS [VALUE_ADDS]                  
  , '' AS [VALUE_ADDS_REMARKS]                  
  , NULL [RESPONSIVENESS]                  
  , 0 AS [NPS_SCORE]                  
  , '' AS [NPS_REMARKS]                  
  , '' AS [FEEDBACK]                  
  , '' [COMMENTS]            
  , A.CONTACT_NAME +' - ' +substring( C.CUST_NM ,1,7) as [DISPLAY_TEXT], A.CSS_SCORE ,null as MIN_SCORE,null as [ACTION_PLAN_SUBMITTED],null as [ACTION_PLAN_NOT_SUBMITTED]    
      
  FROM             
  BAS.DBO.CUSTOMER C             
  join             
  PremierAccount A on A.CUST_ID = C.CUST_ID               
  order by CUST_NM          
END 
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'BATCH_CUSTOMER_ID'
          AND Object_ID = Object_ID('PROJECT_ACTIONITEM'))
BEGIN
   ALTER TABLE csp..PROJECT_ACTIONITEM
   ADD BATCH_CUSTOMER_ID int null
END

GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'BATCH_CUSTOMER_MONTHLY_ID'
          AND Object_ID = Object_ID('PROJECT_ACTIONITEM'))
BEGIN
   ALTER TABLE csp..PROJECT_ACTIONITEM
   ADD BATCH_CUSTOMER_MONTHLY_ID int null
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getViewCssDetailsForCSATInsights' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getViewCssDetailsForCSATInsights]
END
GO
    
CREATE PROCEDURE [dbo].[getViewCssDetailsForCSATInsights]          
@startDate varchar(10),        
@endDate varchar(10),        
@custIds varchar(max)        
AS          
BEGIN 
       SELECT CB.CUST_ID [CUSTOMER_ID], C.CUST_NM,CB.PROJ_ID [PROJECT_ID]  ,P.PROJ_NM ,    
       CB.DISPLAY_NAME RESPONDENT_NAME,  'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' ' + CAST(B.YEAR AS VARCHAR) + '-' + CAST(B.YEAR - 1999 AS VARCHAR) YEAR_QUARTER ,    
       QR.QUESTION,QR.RATING ,CB.STATUS,QR.QUESTION_ID   
	   FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] CB          
	   INNER JOIN BAS.DBO.PROJECT P on p.proj_id = CB.proj_id          
	   INNER JOIN BAS.DBO.CUSTOMER C on c.cust_id = CB.cust_id          
	   INNER JOIN CSP.DBO.CSS_BATCHES B ON B.ID = CB.BATCH_ID     
	   LEFT JOIN CSP..CSS_QUESTION_REPLIES QR on QR.BATCH_CUSTOMER_ID = CB.ID and QUESTION_CATEGORY = 'Criteria'    
	   WHERE ((convert(varchar,B.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate))         
	   AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))     
    
       Union  
  
       SELECT BCM.CUST_ID [CUSTOMER_ID], C.CUST_NM,'' [PROJECT_ID] ,'' PROJ_NM ,     
       BCM.DISPLAY_NAME RESPONDENT_NAME,  CASE WHEN BM.MONTH between 4 and 6 THEN 'Q1 ' + CAST(BM.YEAR AS VARCHAR) + '-' + CAST(BM.YEAR - 1999 AS VARCHAR)      
	   WHEN BM.MONTH Between 7 and 9 THEN 'Q2 ' + CAST(BM.YEAR AS VARCHAR) + '-' + CAST(BM.YEAR - 1999 AS VARCHAR)      
	   WHEN BM.MONTH Between 10 and 12 THEN 'Q3 ' + CAST(BM.YEAR AS VARCHAR) + '-' + CAST(BM.YEAR - 1999 AS VARCHAR)      
	   WHEN BM.MONTH Between 1 and 3 THEN 'Q4 ' + CAST(BM.YEAR AS VARCHAR) + '-' + CAST(BM.YEAR - 1999 AS VARCHAR)       
	   END AS [YEAR_QUARTER] ,   
       QR.QUESTION,QR.RATING ,BCM.STATUS,QR.QUESTION_ID    
	   FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] BCM    
	   INNER JOIN BAS.DBO.CUSTOMER C on c.cust_id = BCM.cust_id          
	   INNER JOIN CSP.DBO.CSS_BATCH_MONTHLY BM ON BM.ID = BCM.BATCH_MONTHLY_ID     
	   LEFT JOIN CSP..CSS_QUESTION_REPLIES QR on QR.Batch_Customer_Monthly_id = BCM.ID and QR.QUESTION_CATEGORY = 'Criteria'  and QR.ISACTIVE = 1  
	   WHERE ((convert(varchar,BM.START_DATE,23) BETWEEN @startDate AND @endDate) OR  (convert(varchar,BM.END_DATE,23) BETWEEN @startDate AND @endDate))         
	   AND (@custIds = '-1' OR BCM.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))     
	   order by CUSTOMER_ID,PROJECT_ID,QUESTION_ID  
END   
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForPeriod1' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForPeriod1]
END
GO

CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]                          
@startDate varchar(10),                        
@endDate varchar(10),                        
@custIds varchar(max)                        
AS                          
BEGIN              
                    
;With NonPremierAccounts AS (                    
                    
select CB.CUST_ID , P.PROJ_ID,P.PROJ_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='https://csm.gavstech.com/CustomerSuccessSurvey/'+ r1.SURVEY_ID, r1.CREATED_DATE, r1.batch_customer_id,

RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)

FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] CB
INNER JOIN BAS.DBO.PROJECT P on p.proj_id = CB.proj_id
INNER JOIN CSP.DBO.CSS_BATCHES B ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1
INNER JOIN CSP..CSS_QUESTION_REPLIES R1 on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1
inner join csp..CSS_QUESTION_REPLIES r2 on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1

INNER JOIN CSP..CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))         
),                 
                    
PremierAccount As (                    
select CB.CUST_ID , 'Premier' as CUST_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= 0, URL ='https://csm.gavstech.com/CustomerSuccessSurvey/'+ r1.SURVEY_ID, r1.CREATED_DATE, r1.batch_customer_monthly_id,
RN = row_number() OVER(partition by ct.contact_name ORDER BY cb.id desc, r1.rating )
FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] CB
INNER JOIN CSP.DBO.CSS_BATCH_monthly B ON B.ID = CB.BATCH_MONTHLY_ID and B.ISACTIVE = 1
INNER JOIN CSP..CSS_QUESTION_REPLIES R1 on R1.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1
INNER JOIN CSP..CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) ) 
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))
),

 ActionItem AS (
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from            
  CSP..PROJECT_ACTIONITEM PA           
  join          
  CSP..CSS_BATCH_CUSTOMERS BC          
  on PA.BATCH_CUSTOMER_ID = BC.ID and PA.SOURCE = 'CSS' and PA.ISACTIVE = 1         
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID         
  join         
  CSP..CSS_BATCHES B ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED' and ((convert(varchar,B.START_DATE,23)         
  BETWEEN @startDate AND @endDate) OR  (convert(varchar,B.END_DATE,23) BETWEEN @startDate AND @endDate))
  Where PA.Status not in ('Cancelled','Suspended')
)           


   SELECT A.PROJ_ID [PROJECT_ID], A.CUST_ID [CUSTOMER_ID],                    
   A.CONTACT_NAME RESPONDENT_NAME,                         
   A.CONTACT_NAME + ' - ' + A.PROJ_NM as [DISPLAY_TEXT] , A.MIN_SCORE,A.NPS_SCORE,Null as CSS_SCORE,A.URL,            
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA Where PA.Status in ('Completed','Closed')),
  [ACTION_PLAN_NOT_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA 
  Where PA.Status in ('Planned','Started') and Convert(varchar,PA.TARGET_DATE,23) < GETDATE())      
  FROM 
  NonPremierAccounts A Where A.RN = 1  
  
  UNION       
  
  SELECT                            
   '0' [PROJECT_ID], A.CUST_ID [CUSTOMER_ID]               
  , A.CONTACT_NAME RESPONDENT_NAME
  , A.CONTACT_NAME +' - ' + A.CUST_NM as [DISPLAY_TEXT], null MIN_SCORE ,A.NPS_SCORE,A.MIN_SCORE as CSS_SCORE,A.URL,   
  null as [ACTION_PLAN_SUBMITTED],null as [ACTION_PLAN_NOT_SUBMITTED]
  FROM         
  PremierAccount A Where A.RN = 1                     
  order by RESPONDENT_NAME  
  
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetOverallKPICountForPortfolio' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[GetOverallKPICountForPortfolio]
END
GO

CREATE PROC GetOverallKPICountForPortfolio    

@Portfolio_ID int,
@startDate DateTime,                        
@endDate DateTime 
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
 ((Kpi.FREQUENCY ='Monthly' and  (CONVERT(varchar(20),KD.PERIOD,23)         
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))  
 or  
 (Kpi.FREQUENCY ='Release' and  (CONVERT(varchar(20),KD.PERIOD,23)         
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))     
or(Kpi.FREQUENCY ='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23)))      
 inner join csp..PORTFOLIO_PRODUCTS pp on pp.ID = kpi.PRODUCT_ID 
 where  pp.PORTFOLIO_ID = @Portfolio_ID  and pp.ISACTIVE = 1  
 and ( KD.ISFLAG is null or KD.ISFLAG = 0   )       
END 

GO