
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getCSSInitatedDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getCSSInitatedDetails]
END
GO 

CREATE PROCEDURE [dbo].[reports_getCSSInitatedDetails]      

@STARTDATE DATETIME,      
@ENDDATE DATETIME      

AS      
BEGIN      

SET @STARTDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@STARTDATE, 111 ) + ' 00:00:00', 111)      
SET @ENDDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@ENDDATE, 111 ) + ' 23:59:59', 111)      
SELECT C.CUST_NM,P.PROJ_NM,CSS.STATUS,      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,     
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,      
(select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL,      
CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,      
[Year - Quarter] =  (select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ),      
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY], 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], P.COUNTRY [COUNTRY],      
P.CUST_ID, P.PROJ_ID      
FROM CSS_BATCH_CUSTOMERS CSS       
INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID      
INNER JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID    
WHERE CSS.STATUS NOT IN ('CREATED')    
    
union all      
    
SELECT C.CUST_NM,P.PROJ_NM,CSS.STATUS,      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,     
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,      
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
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY], 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], P.COUNTRY [COUNTRY],      
P.CUST_ID, P.PROJ_ID      
from CSS_BATCH_CUSTOMER_MONTHLY CSS      
INNER JOIN CSS_BATCH_MONTHLY B ON B.ID = CSS.BATCH_MONTHLY_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID      
LEFT JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID      
WHERE CSS.STATUS NOT IN ('CREATED')    
order by C.CUST_NM, P.PROJ_ID      
end
Go
