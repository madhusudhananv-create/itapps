
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
END
GO 

CREATE PROCEDURE [dbo].[reports_CSAT_Combined] 

@StartDate date, 
@EndDate date    

AS  

BEGIN    
  
  SELECT    
    c.cust_nm AS [Customer Name],    
    p.proj_nm AS [Project Name],    
    display_name AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS    
    [CSAT sent Date],    
    FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    [Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),    
    pp.TITLE AS [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
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
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,   
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
 PA.STATUS as [Action Item Status],  
 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]   
  FROM [CSS_BATCH_CUSTOMERS] b    
  INNER JOIN project p    
    ON p.proj_id = b.proj_id    
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
 ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  UNION    
  SELECT    
    c.cust_nm AS [Customer Name],    
    COALESCE(P.PROJ_NM, PFT.PRODUCT_TITLE) AS [Project Name],  
    b.DISPLAY_NAME AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],    
    FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    CONCAT(    
    'Q', CASE    
      WHEN MONTH(bt.START_DATE) BETWEEN 4 AND 6 THEN '1'    
      WHEN MONTH(bt.START_DATE) BETWEEN 7 AND 9 THEN '2'    
      WHEN MONTH(bt.START_DATE) BETWEEN 10 AND 12 THEN '3'    
      ELSE '4'    
    END, ' - ', YEAR(bt.START_DATE)) AS [Quarter_Year],    
    pp.TITLE [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
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
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,      
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
 PA.STATUS as [Action Item Status],  
 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]  
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] b    
  INNER JOIN CSS_BATCH_MONTHLY bt    
    ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1   
  INNER JOIN CSS_QUESTION_REPLIES QR    
    ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1  
  INNER JOIN customer c    
    ON c.cust_id = b.cust_id    
  LEFT JOIN project p    
    ON p.proj_id = b.PROJ_ID  
  LEFT JOIN portfolio_project PR    
    ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1  
  LEFT JOIN PORTFOLIO pp    
    ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1  
 LEFT JOIN PORTFOLIO_PRODUCTS PFT  
 ON PFT.ID = b.PROD_ID and PFT.ISACTIVE = 1  
   LEFT JOIN PROJECT_ACTIONITEM PA   
   ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1   
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  ORDER BY [Year_Quarter], [Customer Name];    
END    
GO
