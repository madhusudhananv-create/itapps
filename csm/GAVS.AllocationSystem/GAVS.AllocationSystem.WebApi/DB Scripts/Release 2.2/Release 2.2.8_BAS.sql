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
                    
SELECT  c.cust_nm [Customer Name], p.proj_nm [Project Name], CSM.CSM_NAME [Customer Success Manager], AM.CSM_NAME[ACCOUNT MANAGER], display_name [Respondent Name],  B.EMAIL_ID  [Email_Id]                  
, FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT sent Date]                    
,FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT received Date]                    
,[Year - Quarter]  =  Left( bt.frequency,1) + Convert(varchar,bt.sequence) + ' - ' + Convert(varchar, bt.Year)                    
, CASE                            
 WHEN Convert(varchar,P.Cust_id) LIKE '202%' THEN 'US'                    
 WHEN  Convert(varchar,P.Cust_id) LIKE '201%' THEN 'India'                    
 WHEN  Convert(varchar,P.Cust_id) LIKE '207%' THEN 'Dubai'                    
 WHEN  Convert(varchar,P.Cust_id) LIKE '206%' THEN 'Oman'                    
 ELSE ''                    
 END AS REGION,  
  qr.QUESTION_CATEGORY,qr.QUESTION,qr.RATING,qr.RATING_DESCRIPTION 
 , c.Cust_ID [Customer_ID]            
 , p.proj_id [Project_ID]                    
                  
  FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] b                    
                    
  inner join bas.dbo.project p on p.proj_id = b.proj_id                    
  inner join bas.dbo.customer c on c.cust_id = b.cust_id                    
  INNER JOIN CSM CSM ON CSM.PROJ_ID = B.PROJ_ID        
   INNER JOIN AM AM ON AM.PROJ_ID = B.PROJ_ID                  
  INNER JOIN CSP.DBO.CSS_BATCHES bt on   bt.id = b.Batch_ID       
  inner join csp..CSS_QUESTION_REPLIES QR on QR.BATCH_CUSTOMER_ID = b.ID   
                    
  WHERE b.STATUS = 'COMPLETED'  and (( bt.start_date between @StartDate and @EndDate    ) OR ( bt.ENd_date between @StartDate and @EndDate    ))              
  order by bt.id,[Customer Name]                  
                    
END 
go

IF EXISTS(Select 1 from sys.procedures where name ='reports_CSATDUMP_Monthly' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSATDUMP_Monthly]
END
GO 

CREATE PROCEDURE [dbo].[reports_CSATDUMP_Monthly]            
            
    @StartDate Date,                          
    @EndDate Date          
             
    AS            
    BEGIN            
            
    WITH CSM AS (                                
    SELECT P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                            
    INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID) ,                     
            
    AM AS (                                
    SELECT distinct P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                            
    INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID                      
            )            
                            
    SELECT  c.cust_nm [Customer Name], b.DISPLAY_NAME [Respondent Name],  B.EMAIL_ID  [Email_Id]                          
    , FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT sent Date]                            
    ,FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT received Date],                            
    FORMAT(SURVEY_SENT_DATE,'MMM') +'-' + CAST(YEAR(SURVEY_SENT_DATE) as varchar(10)) AS MONTH,     
    qr.QUESTION_CATEGORY,qr.QUESTION,qr.RATING,qr.RATING_DESCRIPTION ,   
    c.Cust_ID [Customer_ID],            
    STUFF((select distinct ',' + CSM.CSM_NAME from CSM CSM            
    join CSP..CSS_BATCH_CUSTOMER_MONTHLY bcc on CSm.CUST_ID = bcc.CUST_ID            
    for xml path ('')),1,1,'')as [Customer Success Manager],              
    STUFF((select distinct ',' + AM.CSM_NAME from AM AM            
    join CSP..CSS_BATCH_CUSTOMER_MONTHLY bcc on AM.CUST_ID = bcc.CUST_ID            
    for xml path ('')),1,1,'')as[ACCOUNT MANAGER]            
             
    FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] b                            
    INNER JOIN CSP.DBO.CSS_BATCH_MONTHLY bt on   bt.id = b.BATCH_MONTHLY_ID               
    inner join csp..CSS_QUESTION_REPLIES QR on QR.Batch_Customer_Monthly_id = b.ID        
    inner join bas.dbo.customer c on c.cust_id = b.cust_id                                           
    WHERE b.STATUS = 'COMPLETED'  and            
    (( bt.start_date between @StartDate and @EndDate    ) OR ( bt.ENd_date between @StartDate and @EndDate    ))                      
    order by bt.id,[Customer Name]                          
                           
    END 
go