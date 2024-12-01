
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForProjects]
END
GO

CREATE PROCEDURE [dbo].[getCSSTableForProjects]     

@startDate date,      
@endDate date,      
@projIds varchar(max) = NULL      
AS      

BEGIN      
      
  SELECT      
    ID,      
    SURVEY_ID,      
    PROJECT_ID,      
    PROJECT_NAME,      
    CUSTOMER_ID,      
    CUSTOMER_Name,      
    CSM_EMP_ID,  [STATUS],    
    DELIVERY_HEAD_EMP_ID,      
    RESPONDENT_NAME,      
    CSAT_RECIEVED_DATE,      
    YEAR_QUARTER,      
    REGION,      
    RESPONSIVENESS,      
    NPS_SCORE,      
    COMMENTS,      
    Q1,      
    Q2,      
    Q3,      
    Q4,      
    Q5,      
    Q6,      
    Q7,      
    Q8,      
    Q9,      
    Q10,      
    Q11,      
    Q12,      
    Q13,      
    Q14,      
    Q15,      
    CASE      
      WHEN Q1 IS NULL THEN (CASE      
          WHEN Q8 IS NULL THEN (Q5 + Q6 + Q7) / 3      
          ELSE ((Q8 + Q9 + Q10 + Q11 + Q12) / 5)      
        END)      
      ELSE (Q1 + Q2 + Q3) / 3      
    END AS [MIN_SCORE]      
  FROM (SELECT      
    0 ID,      
    vw.SURVEY_ID,  CB.STATUS,    
    CB.PROJ_ID [PROJECT_ID],      
    p.PROJ_NM [PROJECT_NAME],      
    CB.CUST_ID [CUSTOMER_ID],      
    C.CUST_NM [CUSTOMER_Name],      
    P.PROJ_DM_EMP_ID [CSM_EMP_ID],      
    P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID],      
    CB.DISPLAY_NAME RESPONDENT_NAME,      
    SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],      
    'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' - ' + CAST(B.YEAR AS VARCHAR) YEAR_QUARTER,      
    CASE      
      WHEN P.PROJ_ID LIKE '201%' THEN 'India'      
      WHEN P.PROJ_ID LIKE '202%' THEN 'US'      
      WHEN P.PROJ_ID LIKE '206%' THEN 'Oman'      
      WHEN P.PROJ_ID LIKE '207%' THEN 'Dubai'      
      WHEN P.PROJ_ID LIKE '209%' THEN 'Saudi Arabia'      
      ELSE ''      
    END AS REGION,      
    NULL [RESPONSIVENESS],      
    Q4 AS [NPS_SCORE],      
    Q1,      
    Q2,      
    Q3,      
    Q4,      
    Q5,      
    Q6,      
    Q7,      
    Q8,      
    Q9,      
    Q10,      
    Q11,      
    Q12,      
    Q13,      
    Q14,      
    Q15,      
    CASE      
      WHEN Q1 IS NULL THEN (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.BATCH_CUSTOMER_ID      
        AND QUESTION_ID = 15)      
      ELSE (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.BATCH_CUSTOMER_ID      
        AND QUESTION_ID = 5)      
    END AS [COMMENTS]      
  FROM [CSS_BATCH_CUSTOMERS] CB (NOLOCK)      
  INNER JOIN PROJECT P (NOLOCK)      
    ON p.proj_id = CB.proj_id      
  INNER JOIN CUSTOMER C (NOLOCK)      
    ON c.cust_id = CB.cust_id      
  INNER JOIN CSS_BATCHES B (NOLOCK)      
    ON B.ID = CB.BATCH_ID      
  LEFT JOIN vwSurveyQRatings vw      
    ON vw.ID = CB.SURVEY_ID      
  WHERE CB.STATUS in('COMPLETED','MAIL SENT') AND    
  (B.START_DATE BETWEEN @startDate AND @endDate      
  OR B.END_DATE BETWEEN @startDate AND @endDate)      
  AND (ISNULL(@projIds, '') = ''      
  OR CB.proj_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds, ',')))      
      
  UNION ALL      
      
  SELECT      
    0 ID,      
    vw.SURVEY_ID,  CB.STATUS,    
    p.proj_id [PROJECT_ID],      
    'Premier Healthcare Solutions' [PROJECT_NAME],      
    CB.CUST_ID [CUSTOMER_ID],      
    C.CUST_NM [CUSTOMER_Name],      
    '' [CSM_EMP_ID],      
    '' [DELIVERY_HEAD_EMP_ID],      
    CB.DISPLAY_NAME RESPONDENT_NAME,      
    SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],      
    LEFT(DATENAME(MONTH, DATEFROMPARTS(B.YEAR, B.MONTH, 1)), 3) + ' - ' + CAST(B.YEAR AS VARCHAR) AS YEAR_QUARTER,      
    '' AS REGION,      
    Q1,      
    Q2,      
    Q3,      
    Q4,      
    Q5,      
    Q6,      
    Q7,      
    Q8,      
    Q9,      
    Q10,      
    Q11,      
    Q12,      
    Q13,      
    Q14,      
    Q15,      
    NULL [RESPONSIVENESS],      
    (SELECT TOP 1      
      AVG(RATING)      
    FROM CSS_QUESTION_REPLIES R (NOLOCK)      
    WHERE CB.ID = R.Batch_Customer_Monthly_id      
    AND QUESTION_MODEL_ID = 4)      
    AS [NPS_SCORE],      
    CASE      
      WHEN Q1 IS NULL THEN (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.Batch_Customer_Monthly_id      
        AND QUESTION_ID = 15)          ELSE (SELECT TOP 1      
          RATING_DESCRIPTION      
        FROM CSS_QUESTION_REPLIES R (NOLOCK)      
        WHERE CB.ID = R.Batch_Customer_Monthly_id      
        AND QUESTION_ID = 5)      
    END AS [COMMENTS]      
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)      
  INNER JOIN PROJECT P (NOLOCK)      
    ON p.proj_id IN ((SELECT TOP 1      
      PROJ_ID      
    FROM PROJECT      
    WHERE CUST_ID = '212100001'      
    AND (ISNULL(@projIds, '') = ''      
    OR proj_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds, ',')) )))      
  INNER JOIN CUSTOMER C (NOLOCK)      
    ON c.cust_id = CB.cust_id      
  INNER JOIN CSS_BATCH_monthly B (NOLOCK)      
    ON B.ID = CB.BATCH_MONTHLY_ID      
  LEFT JOIN vwSurveyQRatings vw      
    ON vw.ID = CB.SURVEY_ID      
  WHERE CB.STATUS in('COMPLETED','MAIL SENT') AND   
  (B.START_DATE BETWEEN @startDate AND @endDate      
  OR B.END_DATE BETWEEN @startDate AND @endDate)) TBL      
      
END
GO
