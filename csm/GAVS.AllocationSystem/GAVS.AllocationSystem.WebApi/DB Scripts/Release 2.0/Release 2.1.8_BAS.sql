USE BAS
GO

IF EXISTS(Select 1 from sys.procedures where name ='reports_CSATDUMP' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSATDUMP]
END
GO

CREATE PROCEDURE [dbo].[reports_CSATDUMP]              
@StartDate Date,            
 @EndDate Date            
AS              
BEGIN                    
              
WITH CSM AS (              
      
SELECT P.PROJ_ID, p.proj_nm,   E.FRST_NM  CSM_NAME FROM BAS.DBO.project p              
INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID        
          
) ,       
AM AS (              
      
SELECT P.PROJ_ID, p.proj_nm,   E.FRST_NM  CSM_NAME FROM BAS.DBO.project p              
INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID        
          
)               
              
SELECT  c.cust_nm [Customer Name], p.proj_nm [Project Name], CSM.CSM_NAME [Customer Success Manager], AM.CSM_NAME[ACCOUNT MANAGER], display_name [Respondent Name],  B.EMAIL_ID  [Email Id]            
, FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT sent Date]              
,FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT received Date]              
,[Year - Quarter]  =  Left( bt.frequency,1) + Convert(varchar,bt.sequence) + ' - ' + Convert(varchar, bt.Year)              
, CASE                      
 WHEN ((Convert(varchar,P.Cust_id) LIKE '202%') or (Convert(varchar,P.Cust_id) LIKE '212%')) THEN 'US'              
 WHEN  Convert(varchar,P.Cust_id) LIKE '201%' THEN 'India'              
 WHEN  Convert(varchar,P.Cust_id) LIKE '207%' THEN 'Dubai'              
 WHEN  Convert(varchar,P.Cust_id) LIKE '206%' THEN 'Oman'              
 ELSE ''              
 END AS REGION              
 , (SELECT TOP 1 QUESTION FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)   [Q1 Question]            
 , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)   [Q1 Rating]              
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 1)  [Q1 Comments]              
, (SELECT TOP 1 QUESTION FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)  [Q2 Question]            
 , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)   [Q2 Rating]              
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 2)  [Q2 Comments]              
 , (SELECT TOP 1 QUESTION FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)  [Q3 Question]            
 , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)  [Q3 Rating]              
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 3)   [Q3 Comments]              
 , (SELECT TOP 1 RATING FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 4)  [NPS Rating]              
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '') FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 4)   [NPS Comments ]             
 , (SELECT TOP 1 replace(replace([RATING_DESCRIPTION], char(10), ''), char(13), '')  FROM CSP.dbo.CSS_QUESTION_REPLIES R WHERE B.ID = R.BATCH_CUSTOMER_ID AND QUESTION_ID = 5)   [Any Other Feedback]            
 , c.Cust_ID [Customer ID]      
 , p.proj_id [Project ID]              
            
  FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] b              
              
  inner join bas.dbo.project p on p.proj_id = b.proj_id              
  inner join bas.dbo.customer c on c.cust_id = b.cust_id              
  INNER JOIN CSM CSM ON CSM.PROJ_ID = B.PROJ_ID      
   INNER JOIN AM AM ON AM.PROJ_ID = B.PROJ_ID            
  INNER JOIN CSP.DBO.CSS_BATCHES bt on   bt.id = b.Batch_ID        
              
  WHERE b.STATUS = 'COMPLETED'  and (( bt.start_date between @StartDate and @EndDate    ) OR ( bt.ENd_date between @StartDate and @EndDate    ))        
  order by bt.id,[Customer Name]            
              
END 
GO

IF EXISTS(Select 1 from sys.procedures where name ='reports_getQualitySpocs' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQualitySpocs]
END
GO

CREATE PROCEDURE [dbo].[reports_getQualitySpocs]
AS
BEGIN	

	select p.proj_id, p.proj_nm, p.start_date,p.end_date, c.cust_id, c.cust_nm, p.quality_spoc, e.frst_nm ,ps.scope,ps.description
    from bas.dbo.project p
    inner join bas.dbo.customer c on p.cust_id = c.cust_id
    left join emp_info e on e.emp_id  = p.quality_spoc
    left join csp.dbo.project_scope ps on p.proj_id=ps.project_id
    where p.end_date> getdate() and isnull(p.proj_status,'') != 'close'
    order by c.cust_nm, p.proj_nm

END 
GO