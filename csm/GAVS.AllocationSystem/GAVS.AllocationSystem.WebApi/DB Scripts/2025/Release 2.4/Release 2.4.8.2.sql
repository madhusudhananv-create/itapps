

DECLARE 
    @SpName NVARCHAR(255) = 'reports_CSAT_Combined_Aggregate',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined_Aggregate' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined_Aggregate] 
END
GO

CREATE procedure  [dbo].[reports_CSAT_Combined_Aggregate] 
@StartDate date,                     
@EndDate date,
@CUSTOMER varchar(max)='0'  

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
PERSPECTIVE	varchar(4000),
RATING	int ,
RATING_DESCRIPTION varchar(4000),
PROJECT_MANAGER	 varchar(4000),
[CUSTOMER SUCCESS MANAGER]	varchar(4000),
[ACCOUNT MANAGER]	varchar(4000),
[BU HEAD]	 varchar(4000),
[CSAT SPOC]	 varchar(4000),
[DP NAME] varchar(4000),  --DP NAME
[DP MAIL] varchar(4000),
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
CUSTOMER_ID varchar(4000) ,
[Planned Customer Communication Date] datetime null,
[Actual Customer Communication Date] datetime null
)

insert into @table 
exec  reports_CSAT_Combined @StartDate, @EndDate

select  [CUSTOMER NAME]  ,
 

[PROJECT NAME],
[TYPE OF ACCOUNT]	  ,

[CUSTOMER SUCCESS MANAGER], 
[ACCOUNT MANAGER]	 ,
[BU HEAD]	  ,
[DP NAME],  --DP NAME
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
where 	 (@CUSTOMER='0' or  t.CUSTOMER_ID	in	(SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))
group by  [CUSTOMER NAME]  ,
 

[PROJECT NAME],
[TYPE OF ACCOUNT]	  ,
YEAR_QUARTER,
[CUSTOMER SUCCESS MANAGER], 
[ACCOUNT MANAGER]	 ,
[BU HEAD]	  ,
[DP NAME],  --DP NAME
PROJ_STATUS	  ,
[BUSSINESS UNIT]	 ,
[CONTRACTING UNIT]	 ,
METHODOLOGY	 ,
DEPARTMENT	 ,
[PROJECT GROUP]	 ,
[PROJECT TYPE]	 ,
COUNTRY	 
 
 GO

 
DECLARE 
    @SpName NVARCHAR(255) = 'reports_CSAT_Halfyearly',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Halfyearly' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Halfyearly] 
END
GO

CREATE PROCEDURE [dbo].[reports_CSAT_Halfyearly]                         
                        
@StartDate date,                       
@EndDate date,
@CUSTOMER varchar(max)='0'  

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
        WHEN bt.sequence IN (1 ) THEN '1'    
        WHEN bt.sequence IN (2) THEN '2'    
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
ON E.EMP_ID = project.DP_ID                          
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
 STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC],            
(SELECT                            
E.FRST_NM                            
FROM project                            
INNER JOIN EMP_INFO E                            
ON E.EMP_ID = project.PROJ_DM_EMP_ID                            
WHERE project.PROJ_ID = B.PROJ_ID)                            
AS [DP NAME], 
(SELECT                            
E.EMAIL_ID                            
FROM project                            
INNER JOIN EMP_INFO E                            
ON E.EMP_ID = project.PROJ_DM_EMP_ID                            
WHERE project.PROJ_ID = B.PROJ_ID)                            
AS [DP MAIL],            
p.PROJ_STATUS,                         
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                          
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                          
P.METHODOLOGY AS [METHODOLOGY],                          
P.DEPARTMENT AS [DEPARTMENT],                          
P.PROJECT_GROUP [PROJECT GROUP],                  
p.REVENUE_TYPE as [PROJECT TYPE],              
P.COUNTRY [COUNTRY],                        
CASE                      
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')                      
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
   ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                    
                      
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
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1 and bt.FREQUENCY ='halfyearly'                       
AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
and (@CUSTOMER='0' or  p.CUST_ID in	(SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))
                  
--UNION    
                  
--SELECT                          
--c.cust_nm AS [Customer Name],                          
--COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],              
--[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,           
--b.DISPLAY_NAME AS [Respondent Name],                          
--B.EMAIL_ID AS [Email_Id],                          
--FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],                          
--FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                        
--CASE                        
--    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 1 AND 6 THEN 'H1 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                      
--    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 7 AND 12 THEN 'H2 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                                     
--END AS [HALF_Year],                          
--pp.TITLE [Portfolio],                          
--qr.QUESTION_CATEGORY,                          
--qr.QUESTION,                          
--qr.RATING,                          
--qr.RATING_DESCRIPTION,              
--(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                          
--(SELECT                          
--E.FRST_NM                          
--FROM project                          
--INNER JOIN EMP_INFO E                          
--ON E.EMP_ID = project.PROJ_DM_EMP_ID                          
--WHERE project.PROJ_ID = p.PROJ_ID)                          
--AS [Customer Success Manager],                          
--(SELECT                          
--E.FRST_NM                          
--FROM project                          
--INNER JOIN EMP_INFO E                          
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                          
--WHERE project.PROJ_ID = p.PROJ_ID)                          
--AS [ACCOUNT MANAGER],              
--(SELECT                            
--E.FRST_NM                            
--FROM project                            
--INNER JOIN EMP_INFO E                            
--ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                            
--WHERE project.PROJ_ID = p.PROJ_ID)                            
--AS [BU Head],            
             
--p.PROJ_STATUS,                            
--p.BUSINESS_UNIT AS [BUSSINESS UNIT],                          
--P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                          
--P.METHODOLOGY AS [METHODOLOGY],                          
--P.DEPARTMENT AS [DEPARTMENT],                          
--P.PROJECT_GROUP [PROJECT GROUP],                 
--p.REVENUE_TYPE as [PROJECT TYPE],              
--P.COUNTRY [COUNTRY],                        
--CASE                      
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                      
--THEN 'Improvement Plan submission Overdue'                      
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                      
--THEN 'Improvement Plan Completion Overdue'                      
--ELSE pa.status                       
--END AS [Action Item Status],                        
--PA.description as [Action Item Description],                  
--[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,                
--FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,        
--FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                    
--FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                    
--FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,             
--p.proj_id,    
--c.Cust_ID AS [Customer_ID]                    
                    
--FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                          
--INNER JOIN CSS_BATCH_MONTHLY bt                          
--ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1                 
--inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                
--INNER JOIN CSS_QUESTION_REPLIES QR                          
--ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1                        
--INNER JOIN customer c                          
--ON c.cust_id = b.cust_id                          
                     
                      
                       
--left join portfolio_products pps on b.prod_id = pps.id           
--left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7    and prs.ISACTIVE =1    
--LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)           
--LEFT JOIN portfolio_project PR                          
--ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1         
--LEFT JOIN PORTFOLIO pp                          
--ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1         
--LEFT JOIN PROJECT_ACTIONITEM PA                         
--ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1        and pa.description like '%' + qr.question +'%'                    
--WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                        
--AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
--OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                          
ORDER BY [Half_Year], [Customer Name];                          
    
    
                        
END 

GO

DECLARE 
    @SpName NVARCHAR(255) = 'dbo.reports_CSAT_Combined',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined] 
END
GO

CREATE PROCEDURE [dbo].[reports_CSAT_Combined]                             
                            
@StartDate date,                           
@EndDate date,
@CUSTOMER varchar(max)='0'  
                          
AS                            
                          
BEGIN                              
                            
SELECT    distinct                          
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
ON E.EMP_ID = project.DP_ID                              
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
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')),     
    1, 1, '') AS [CSAT SPOC],               
(SELECT                                
E.FRST_NM                                
FROM project                                
INNER JOIN EMP_INFO E                                
ON E.EMP_ID = project.PROJ_DM_EMP_ID                                
WHERE project.PROJ_ID = B.PROJ_ID)                                
AS [DP NAME],               --DP NAME  
(SELECT                                
E.EMAIL_ID                                
FROM project                                
INNER JOIN EMP_INFO E                                
ON E.EMP_ID = project.PROJ_DM_EMP_ID                                
WHERE project.PROJ_ID = B.PROJ_ID)                                
AS [DP MAIL],                  
p.PROJ_STATUS,                             
p.BUSINESS_UNIT AS [BUSINESS UNIT],                              
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                              
P.METHODOLOGY AS [METHODOLOGY],                              
P.DEPARTMENT AS [DEPARTMENT],                              
P.PROJECT_GROUP [PROJECT GROUP],                      
p.REVENUE_TYPE as [PROJECT TYPE],                  
P.COUNTRY [COUNTRY],                            
--CASE                          
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')                          
--THEN 'Improvement Plan submission Overdue'                          
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                          
--THEN 'Improvement Plan Completion Overdue'                          
--ELSE pa.status END 
 pa.status AS [Action Item Status],                                    
                          
                         
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
 ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                       
                          
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
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.CSS_REFERENCE like '%' + qr.question +'%'     
left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC    
    
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                            
AND (bt.start_date BETWEEN @StartDate AND @EndDate                              
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                        
 AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))                      
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
qr.PERSPECTIVE as PERSPECTIVE,                                
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
 '',
 '',
p.PROJ_STATUS,                                
p.BUSINESS_UNIT AS [BUSINESS UNIT],                              
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                              
P.METHODOLOGY AS [METHODOLOGY],                              
P.DEPARTMENT AS [DEPARTMENT],                              
P.PROJECT_GROUP [PROJECT GROUP],                     
p.REVENUE_TYPE as [PROJECT TYPE],                  
P.COUNTRY [COUNTRY],                            
--CASE                          
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')       
--THEN 'Improvement Plan submission Overdue'                          
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                          
--THEN 'Improvement Plan Completion Overdue'                          
--ELSE pa.status END 
 pa.status AS [Action Item Status],     

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
,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                        
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
 AND (@CUSTOMER='0' or  C.CUST_ID	in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  )
ORDER BY [Year_Quarter], [Customer Name];                          
END 

GO

DECLARE 
    @SpName NVARCHAR(255) = 'reports_getCSSInitatedDetails',
    @ParamName NVARCHAR(255) = 'Customer',
    @ParamType NVARCHAR(255) = 'CUSTOMERID',
    @ParamValue NVARCHAR(255) = '-1';

INSERT INTO REPORTS_PARAMS (REPORT_SP_ID, PARAM_NAME, PARAM_TYPE, PARAM_VALUE)
SELECT DISTINCT d.ID, @ParamName, @ParamType, @ParamValue
FROM REPORTS_SP_DETAILS d
WHERE d.sp_name = @SpName
  AND NOT EXISTS (
      SELECT 1 FROM REPORTS_PARAMS p 
      WHERE p.REPORT_SP_ID = d.ID AND p.PARAM_NAME = @ParamName
  );

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_getCSSInitatedDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getCSSInitatedDetails] 
END
GO

CREATE PROCEDURE [dbo].[reports_getCSSInitatedDetails]                      
                
@STARTDATE DATETIME,                      
@ENDDATE DATETIME ,
@CUSTOMER varchar(max)='0'
                
AS                      
BEGIN                      
                
SET @STARTDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@STARTDATE, 111 ) + ' 00:00:00', 111)                      
SET @ENDDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@ENDDATE, 111 ) + ' 23:59:59', 111)                      
SELECT C.CUST_NM,          
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,        
p.Proj_nm , p.REVENUE_TYPE, CSS.STATUS,                      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,                      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,                     
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,                      
(select top 1 frst_nm from emp_info where emp_id = p.DP_ID) CSM,                      
(select top 1 email_id from emp_info where emp_id = p.DP_ID) CSM_MAIL,                      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,         
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD_MAIL,         
(select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,                      
(select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL, 
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP NAME],    
(select top 1 EMAIL_ID from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP MAIL],                      

CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,                      
[Year - Quarter] =  (select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ),  
CASE When predicted_score is null then '-' else convert(varchar, convert(int,predicted_score)) end as PREDICTED_SCORE,
ACTUAL_SCORE = (select RATING from CSS_QUESTION_REPLIES where BATCH_CUSTOMER_ID = css.ID and QUESTION_CATEGORY = 'Criteria' and PERSPECTIVE = 'Overall Experience' ),
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
P.CUST_ID, P.PROJ_ID  , b.id, css.ID,
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where ',' + spoc + ',' like '%,' + e.email_id + ',%' FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC] 
FROM CSS_BATCH_CUSTOMERS CSS                       
INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE   AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
INNER JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID                    
WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')    and css.ISACTIVE =1     
and  (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  ) 
                    
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
'',  
'',
CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,                      
[Year - Quarter] =  (SELECT                      
CASE                      
                       
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                    
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                   
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                   
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                       
END                      
FROM CSS_BATCH_MONTHLY where id= b.id ),    
--'-',
ACTUAL_SCORE = (select RATING  from CSS_QUESTION_REPLIES where Batch_Customer_Monthly_id = css.ID and QUESTION_CATEGORY = 'Criteria' and PERSPECTIVE = 'Overall Experience' ),
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
P.CUST_ID, P.PROJ_ID   , b.id, css.ID ,''                 
from CSS_BATCH_CUSTOMER_MONTHLY CSS                      
INNER JOIN CSS_BATCH_MONTHLY B ON B.ID = CSS.BATCH_MONTHLY_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
                
left join portfolio_products pp on css.prod_id = pp.id           
left join PRODUCT_RESPONSIBLE pr on css.PROD_ID = pr.PRODUCT_ID and pr.MANAGEMENT_TYPE =7    and pr.ISACTIVE = 1    
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(CSS.PROJ_ID , pr.project_id)            
WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')      and css.ISACTIVE =1    
and  (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  ) 
order by C.CUST_NM, P.PROJ_ID                      
end 

GO

IF EXISTS(Select 1 from sys.objects where name ='reports_getDeliveryLeaderboardReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getDeliveryLeaderboardReport] 
END
GO

CREATE PROCEDURE [dbo].[reports_getDeliveryLeaderBoardReport]                      
  @startDate Datetime,                      
  @endDate Datetime,                    
  @customerid varchar(max) = '0' ---999                    
  AS                                
  BEGIN  


IF OBJECT_ID('tempdb..#DeliveryLeaderBoard') is not null
drop table #DeliveryLeaderBoard

create table #DeliveryLeaderBoard ( 
cust_Id varchar(50),
cust_Nm varchar(500),
proj_Id varchar(255),
Portfolio_Nm varchar(500),
proj_Nm varchar(500),
Status varchar(25),
project_Manager_Name varchar(255),
project_Team_Size int,
kpi_Identified int,
kpi_Actual_Entered int,
kpi_Beyond_Target_Date  int,
risk_Identified int,
risk_Treating_Plan int,
risk_Recently_Monitored int,
risk_Beyond_Target_Date  int,
actionItem_Identified int,
actionItem_InOpen_Status int,
actionItem_Beyond_Target_Date int,
issues_Identified int,
issues_InOpen_Status int,
issues_Beyond_Target_Date int,
ideas_Identified int,
ideas_Inprogress int,
ideas_ImplementedClosed int, 
ideas_Beyond_Target_Date int,
css_No_of_Survey_Initiated int, 
css_No_of_Survey_feedback_received int, 
css_No_of_Feedback_requires_action int, 
[css_No_of_feedback_with_rating_>=4] int, 
[css_No_of_feedback_with_rating_<=3] int, 
[css_Beyond_Target_Date] int, 
findings_No_of_Open_Findings int,
[findings_< 30 Days] int,
[findings_> 30 Days] int,
[findings_Beyond_Target_date] int,
training_No_of_Training_Planned int,
training_InOpen_Status  int,
training_Beyond_Target_Date int
)




Declare @Projects table(customerId varchar(50),projectId varchar(255),projectName varchar(500))

insert into @Projects  
select CUST_ID,PROJ_ID,PROJ_NM from  PROJECT where (@customerid = '0' or CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')) ) and END_DATE > @endDate


declare projcursor cursor
scroll for
select * from @Projects

Declare @custId varchar(50) 
Declare @proj_Id varchar(255)
Declare @portfolio_Nm varchar(500)
Declare @proj_Nm varchar(500)
Declare @cust_Nm varchar(500) --set @cust_Nm = (select cust_nm from CUSTOMER where CUST_ID = @custId)
Declare @Status varchar(25) = ''
Declare @project_Manager_Name varchar(255) = ''
Declare @project_Team_Size int = 0
Declare @kpi_Identified int = 0
Declare @kpi_Actual_Entered int = 0
Declare @kpi_Beyond_Target_Date  int = 0
Declare @risk_Identified int = 0
Declare @risk_Treating_Plan int = 0
Declare @risk_Recently_Monitored int = 0
Declare @risk_Beyond_Target_Date  int = 0
Declare @actionItem_Identified int = 0
Declare @actionItem_InOpen_Status int = 0
Declare @actionItem_Beyond_Target_Date int = 0
Declare @issues_Identified int = 0
Declare @issues_InOpen_Status int = 0
Declare @issues_Beyond_Target_Date int = 0
Declare @ideas_Identified int = 0
Declare @ideas_Inprogress int = 0
Declare @ideas_ImplementedClosed int = 0
Declare @ideas_Beyond_Target_Date int = 0
Declare @css_No_of_Survey_Initiated int = 0 
Declare @css_No_of_Survey_feedback_received int = 0
Declare @css_No_of_Feedback_requires_action int = 0
Declare @css_No_of_feedback_with_rating_greaterthanorequalto4 int = 0
Declare @css_No_of_feedback_with_rating_lessthanorequalto3 int = 0
Declare @css_Beyond_Target_Date int = 0
Declare @findings_No_of_Open_Findings int = 0
Declare @findings_lessthanorequalto30_Days int = 0
Declare @findings_greaterthan30_Days int = 0
Declare @findings_Beyond_Target_date int = 0
Declare @training_No_of_Training_Planned int = 0
Declare @training_InOpen_Status  int = 0
Declare @training_Beyond_Target_Date int = 0



open projcursor

fetch first from projcursor into @custId,@proj_Id,@proj_Nm

set @cust_Nm = (select cust_nm from  CUSTOMER where CUST_ID = @custId)
set @portfolio_Nm = (select F.TITLE from PORTFOLIO_PROJECT as P,PORTFOLIO as F where P.PROJ_ID = @proj_Id and P.ISACTIVE=1 and P.PORTFOLIO_ID = F.ID and F.ISACTIVE = 1)
set @project_Manager_Name = (select E.FRST_NM from  emp_info E where  E.EMP_ID in (select p.PROJ_PM_EMP_ID from  project p where p.PROJ_ID = @proj_Id and p.END_DATE > @startDate))
set @project_Team_Size = (select count(R.EMP_ID) from  emp_info E, PROJ_RESOURCE R where  E.EMP_ID = R.EMP_ID and E.DOR is null and r.PROJ_ID = @proj_Id and r.END_DATE > @startDate)

set @kpi_Identified = (select kpi_Identified from  fn_getKPIForProject(@startDate,@endDate,@proj_Id))
set @kpi_Actual_Entered = (select kpi_Actual from  fn_getKPIForProject(@startDate,@endDate,@proj_Id))
set @kpi_Beyond_Target_Date = (select kpi_Beyond_Target_Date from fn_getKPIForProject(@startDate,@endDate,@proj_Id))

set @risk_Identified = (select risk_Identified from fn_getRisksForProject(@startDate,@endDate,@proj_Id))
set @risk_Recently_Monitored = (select risk_Recently_Monitored from fn_getRisksForProject(@startDate,@endDate,@proj_Id)) -- date need to be changed		
set @risk_Treating_Plan = (select risk_Treating_Plan from fn_getRisksForProject(@startDate,@endDate,@proj_Id))
set @risk_Beyond_Target_Date = (select risk_Beyond_Target_Date from fn_getRisksForProject(@startDate,@endDate,@proj_Id))

set @actionItem_Identified = (select actionItem_Identified from fn_getActionItemsForProject(@startDate,@endDate,@proj_Id))
set @actionItem_InOpen_Status = (select actionItem_InOpen_Status from fn_getActionItemsForProject(@startDate,@endDate,@proj_Id))
set @actionItem_Beyond_Target_Date = (select actionItem_Beyond_Target_Date from fn_getActionItemsForProject(@startDate,@endDate,@proj_Id))-- Need to change Enddate

set @issues_Identified = (select issues_Identified from fn_getIssuesForProject(@startDate,@endDate,@proj_Id))
set @issues_InOpen_Status = (select issues_InOpen_Status from fn_getIssuesForProject(@startDate,@endDate,@proj_Id))
set @issues_Beyond_Target_Date = (select issues_Beyond_Target_Date from fn_getIssuesForProject(@startDate,@endDate,@proj_Id))-- Need to change Enddate

Set @ideas_Identified = (select ideas_Identified from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))
Set @ideas_Inprogress = (select ideas_Inprogress from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))
set @ideas_ImplementedClosed = (select ideas_ImplementedClosed from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))
set @ideas_Beyond_Target_Date = (select ideas_Beyond_Target_Date from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))

set @findings_No_of_Open_Findings = (select isnull(FindingCount,'0') from fn_getFindingForProject(@startDate,@endDate,@proj_Id))
set @findings_lessthanorequalto30_Days = (select isnull([<= 30 days],'0') from fn_getFindingForProject(@startDate,@endDate,@proj_Id))
set @findings_greaterthan30_Days = (select isnull([> 30 days],'0') from fn_getFindingForProject(@startDate,@endDate,@proj_Id))
set @findings_Beyond_Target_date = (select isnull([Beyond_Target_Date],'0') from fn_getFindingForProject(@startDate,@endDate,@proj_Id))

set @css_No_of_Survey_Initiated = (select isnull([No of Survey Identified],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_Survey_feedback_received = (select isnull([No of Survey feedback received],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_Feedback_requires_action = (select isnull([No of Feedback requires action],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_feedback_with_rating_greaterthanorequalto4 = (select isnull([No of feedback with rating >= 4],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_feedback_with_rating_lessthanorequalto3 = (select isnull([No of feedback with rating <= 3],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))

set @training_No_of_Training_Planned = (select isnull([No of training Planned],'0') from fn_getMandatoryTraningForProject(@startDate,@endDate,@proj_Id))
set @training_InOpen_Status = (select isnull([In Open Status],'0') from fn_getMandatoryTraningForProject(@startDate,@endDate,@proj_Id))
set @training_Beyond_Target_Date = (select isnull([Beyond Target Date],'0') from fn_getMandatoryTraningForProject(@startDate,@endDate,@proj_Id))

set @Status = (select OverAllStatus from fn_getStatusForProject(@kpi_Beyond_Target_Date,@risk_Beyond_Target_Date ,	  @actionItem_Beyond_Target_Date ,
	  @issues_Beyond_Target_Date ,	  @ideas_Beyond_Target_Date ,	  @css_Beyond_Target_Date ,	  @findings_Beyond_Target_date ,
	  @training_Beyond_Target_Date))

insert into #DeliveryLeaderBoard values(@custId,@cust_Nm,@proj_Id,@portfolio_Nm,@proj_Nm,@Status,@project_Manager_Name,@project_Team_Size,
@kpi_Identified,@kpi_Actual_Entered,@kpi_Beyond_Target_Date,@risk_Identified ,@risk_Treating_Plan ,@risk_Recently_Monitored ,@risk_Beyond_Target_Date  ,
@actionItem_Identified ,@actionItem_InOpen_Status ,@actionItem_Beyond_Target_Date ,@issues_Identified ,@issues_InOpen_Status ,
@issues_Beyond_Target_Date ,@ideas_Identified ,@ideas_Inprogress ,@ideas_ImplementedClosed ,@ideas_Beyond_Target_Date ,
@css_No_of_Survey_Initiated , @css_No_of_Survey_feedback_received ,@css_No_of_Feedback_requires_action ,
@css_No_of_feedback_with_rating_greaterthanorequalto4 , @css_No_of_feedback_with_rating_lessthanorequalto3 ,
@css_Beyond_Target_Date ,@findings_No_of_Open_Findings ,@findings_lessthanorequalto30_Days ,@findings_greaterthan30_Days ,
@findings_Beyond_Target_date ,@training_No_of_Training_Planned ,@training_InOpen_Status,@training_Beyond_Target_Date 
)
while @@FETCH_STATUS=0
begin

fetch next from projcursor into @custId,@proj_Id,@proj_Nm

set @cust_Nm = (select cust_nm from CUSTOMER where CUST_ID = @custId)
set @portfolio_Nm = (select F.TITLE from PORTFOLIO_PROJECT as P,PORTFOLIO as F where P.PROJ_ID = @proj_Id and P.ISACTIVE=1 and P.PORTFOLIO_ID = F.ID and F.ISACTIVE = 1)
set @project_Manager_Name = (select E.FRST_NM from emp_info E where  E.EMP_ID in (select p.PROJ_PM_EMP_ID from project p where p.PROJ_ID = @proj_Id and p.END_DATE > @startDate) and E.DOR is null)
set @project_Team_Size = (select count(distinct R.EMP_ID) from emp_info E,PROJ_RESOURCE R where  E.EMP_ID = R.EMP_ID and E.DOR is null and r.PROJ_ID = @proj_Id and r.END_DATE > @startDate)

set @kpi_Identified = (select kpi_Identified from fn_getKPIForProject(@startDate,@endDate,@proj_Id))
set @kpi_Actual_Entered = (select kpi_Actual from fn_getKPIForProject(@startDate,@endDate,@proj_Id))
set @kpi_Beyond_Target_Date = (select kpi_Beyond_Target_Date from fn_getKPIForProject(@startDate,@endDate,@proj_Id))


set @risk_Identified = (select risk_Identified from fn_getRisksForProject(@startDate,@endDate,@proj_Id))
set @risk_Recently_Monitored = (select risk_Recently_Monitored from fn_getRisksForProject(@startDate,@endDate,@proj_Id)) -- date need to be changed		
set @risk_Treating_Plan = (select risk_Treating_Plan from fn_getRisksForProject(@startDate,@endDate,@proj_Id))
set @risk_Beyond_Target_Date = (select risk_Beyond_Target_Date from fn_getRisksForProject(@startDate,@endDate,@proj_Id))

set @actionItem_Identified = (select actionItem_Identified from fn_getActionItemsForProject(@startDate,@endDate,@proj_Id))
set @actionItem_InOpen_Status = (select actionItem_InOpen_Status from fn_getActionItemsForProject(@startDate,@endDate,@proj_Id))
set @actionItem_Beyond_Target_Date = (select actionItem_Beyond_Target_Date from fn_getActionItemsForProject(@startDate,@endDate,@proj_Id))-- Need to change Enddate

set @issues_Identified = (select issues_Identified from fn_getIssuesForProject(@startDate,@endDate,@proj_Id))
set @issues_InOpen_Status = (select issues_InOpen_Status from fn_getIssuesForProject(@startDate,@endDate,@proj_Id))
set @issues_Beyond_Target_Date = (select issues_Beyond_Target_Date from fn_getIssuesForProject(@startDate,@endDate,@proj_Id))-- Need to change Enddate

Set @ideas_Identified = (select ideas_Identified from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))
Set @ideas_Inprogress = (select ideas_Inprogress from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))
set @ideas_ImplementedClosed = (select ideas_ImplementedClosed from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))
set @ideas_Beyond_Target_Date = (select ideas_Beyond_Target_Date from fn_getIdeasForProject(@startDate,@endDate,@proj_Id))

 set @findings_No_of_Open_Findings = (select FindingCount from fn_getFindingForProject(@startDate,@endDate,@proj_Id))
set @findings_lessthanorequalto30_Days = (select [<= 30 days] from fn_getFindingForProject(@startDate,@endDate,@proj_Id))
set @findings_greaterthan30_Days = (select [> 30 days] from fn_getFindingForProject(@startDate,@endDate,@proj_Id))
set @findings_Beyond_Target_date = (select [Beyond_Target_Date] from fn_getFindingForProject(@startDate,@endDate,@proj_Id))

set @css_No_of_Survey_Initiated = (select isnull([No of Survey Identified],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_Survey_feedback_received = (select isnull([No of Survey feedback received],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_Feedback_requires_action = (select isnull([No of Feedback requires action],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_feedback_with_rating_greaterthanorequalto4 = (select isnull([No of feedback with rating >= 4],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))
set @css_No_of_feedback_with_rating_lessthanorequalto3 = (select isnull([No of feedback with rating <= 3],'0') from fn_getCSSForProject(@startDate,@endDate,@proj_Id))

set @training_No_of_Training_Planned = (select isnull([No of training Planned],'0') from fn_getMandatoryTraningForProject(@startDate,@endDate,@proj_Id))
set @training_InOpen_Status = (select isnull([In Open Status],'0') from fn_getMandatoryTraningForProject(@startDate,@endDate,@proj_Id))
set @training_Beyond_Target_Date = (select isnull([Beyond Target Date],'0') from fn_getMandatoryTraningForProject(@startDate,@endDate,@proj_Id))

set @Status = (select OverAllStatus from fn_getStatusForProject(@kpi_Beyond_Target_Date,@risk_Beyond_Target_Date ,	  @actionItem_Beyond_Target_Date ,
	  @issues_Beyond_Target_Date ,	  @ideas_Beyond_Target_Date ,	  @css_Beyond_Target_Date ,	  @findings_Beyond_Target_date ,
	  @training_Beyond_Target_Date))

insert into #DeliveryLeaderBoard values(@custId,@cust_Nm,@proj_Id,@portfolio_Nm,@proj_Nm,@Status,@project_Manager_Name,@project_Team_Size,
@kpi_Identified,@kpi_Actual_Entered,@kpi_Beyond_Target_Date,@risk_Identified ,@risk_Treating_Plan ,@risk_Recently_Monitored ,@risk_Beyond_Target_Date  ,
@actionItem_Identified ,@actionItem_InOpen_Status ,@actionItem_Beyond_Target_Date ,@issues_Identified ,@issues_InOpen_Status ,
@issues_Beyond_Target_Date ,@ideas_Identified ,@ideas_Inprogress ,@ideas_ImplementedClosed ,@ideas_Beyond_Target_Date ,
@css_No_of_Survey_Initiated , @css_No_of_Survey_feedback_received ,@css_No_of_Feedback_requires_action ,
@css_No_of_feedback_with_rating_greaterthanorequalto4 , @css_No_of_feedback_with_rating_lessthanorequalto3 ,
@css_Beyond_Target_Date ,@findings_No_of_Open_Findings ,@findings_lessthanorequalto30_Days ,@findings_greaterthan30_Days ,
@findings_Beyond_Target_date ,@training_No_of_Training_Planned ,@training_InOpen_Status,@training_Beyond_Target_Date 
)

end

close projcursor

deallocate projcursor

select * from #DeliveryLeaderBoard order by cust_Nm,proj_Nm

End

GO


IF EXISTS(Select 1 from sys.objects where name ='reports_getKPIAchievementDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getKPIAchievementDetails] 
END
GO

CREATE PROCEDURE [dbo].[reports_getKPIAchievementDetails]                      
  @startDate Datetime,                      
  @endDate Datetime,                    
  @customerid varchar(max)='0'                    
  AS                                
  BEGIN            
            
 select distinct C.CUST_ID,C.CUST_NM,portfolio.TITLE as [Portfolio Name],P.PROJ_ID,P.PROJ_NM ,E.FRST_NM as [PROJECT_MANAGER_NAME],
 PROJECT_TEAM_SIZE = (select top 1 count(R.EMP_ID) from PROJ_RESOURCE R,Emp_info E where R.EMP_ID = E.EMP_ID and E.DOR is null and R.ID is not null  and R.PROJ_ID = P.PROJ_ID and R.END_DATE > @startDate),
 per.SHORT_DESC  as KPI_CATEGORY, kpicat.SHORT_DESC AS GLOBAL_KPI_NAME,GOALS.DESCRIPTION AS GOAL_DESC,k.KPI_NAME, convert(varchar,details.PERIOD ,107) as [Period], details.PERIOD_TYPE as Frequency,
 k.SERVICE_AREA,   
  (SELECT top 1 SLA_TARGET_VERYHIGH_VALUE FROM KPI_TARGETS WHERE KPI_ID = details.KPI_ID) as SLA_TARGET_VERYHIGH_VALUE             
 ,(SELECT top 1 SLA_TARGET_VERYHIGH_OPERATOR FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_VERYHIGH_OPERATOR          
 ,(SELECT top 1 SLA_TARGET_VERYHIGH_DESCRIPTION FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_VERYHIGH_DESCRIPTION                 
 ,(SELECT top 1 SLA_TARGET_HIGH_VALUE FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID)     as SLA_TARGET_HIGH_VALUE  
 ,(SELECT top 1 SLA_TARGET_HIGH_OPERATOR FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_HIGH_OPERATOR          
 ,(SELECT top 1 SLA_TARGET_HIGH_DESCRIPTION FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_HIGH_DESCRIPTION          
 ,(SELECT top 1 SLA_TARGET_MEDIUM_VALUE FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_MEDIUM_VALUE             
 ,(SELECT top 1 SLA_TARGET_MEDIUM_OPERATOR FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_MEDIUM_OPERATOR          
 ,(SELECT top 1 SLA_TARGET_MEDIUM_DESCRIPTION FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_MEDIUM_DESCRIPTION          
 ,(SELECT top 1 SLA_TARGET_LOW_VALUE FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID)as SLA_TARGET_LOW_VALUE         
 ,(SELECT top 1 SLA_TARGET_LOW_OPERATOR FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_LOW_OPERATOR          
 ,(SELECT top 1 SLA_TARGET_LOW_DESCRIPTION FROM KPI_TARGETS WHERE  KPI_ID = details.KPI_ID) as SLA_TARGET_LOW_DESCRIPTION  ,            
 CASE WHEN details.PERIOD_TYPE = 'Week1' then   
   CONVERT(CHAR(3),CONVERT(datetime,   
        SWITCHOFFSET(CONVERT(datetimeoffset,   
           details.PERIOD),   
         DATENAME(TzOffset, SYSDATETIMEOFFSET()))) , 0)   
         
 ELSE CONVERT(CHAR(3), details.[PERIOD], 0)  END AS [KPI MONTHS]   
                  
   ,YEAR(details.[PERIOD]) AS [FINANICAL YEAR]  ,                     
    details.KPI_ACTUAL as [KPI ACTUALS] , k.SLA_TARGET_UNIT_OF_MEASUREMENT, k.PRIORITY
from CUSTOMER C
join PROJECT P on  P.CUST_ID = C.CUST_ID
join Emp_info E on E.EMP_ID = P.PROJ_PM_EMP_ID
inner join KPI K on K.CUSTOMER_ID = C.CUST_ID and K.PROJECT_ID = P.PROJ_ID and K.ISACTIVE = 1   
inner join KPI_TARGETS target on k.ID = target.KPI_ID and target.ISACTIVE = 1            
inner join KPI_GOALS goals on k.GOAL_ID = goals.ID and goals.ISACTIVE = 1            
inner join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING kpimap on k.GLOBAL_KPI_CATEGORY_ID = kpimap.GLOBAL_KPI_CATEGORY_ID and k.ISACTIVE = 1 and kpimap.ISACTIVE = 1            
inner join GLOBAL_PERSPECTIVE per on per.ID = kpimap.GLOBAL_PERSPECTIVE_ID and per.ISACTIVE = 1            
inner join GLOBAL_KPI_CATEGORY kpicat on kpimap.GLOBAL_KPI_CATEGORY_ID = kpicat.ID and kpicat.ISACTIVE = 1   
inner join KPI_DETAILS details on details.KPI_ID = K.ID and details.ISACTIVE = 1
left join  portfolio_Project portproj on  portproj.CUST_ID = C.CUST_ID and portproj.PROJ_ID = P.PROJ_ID and portproj.ISACTIVE=1      
left join  PORTFOLIO portfolio on portproj.PORTFOLIO_ID = portfolio.ID and portfolio.ISACTIVE=1  
where details.PERIOD between @startDate and @endDate and (@customerid='0' or  c.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))
order by C.CUST_ID,P.PROJ_ID,[Period] desc
  
 END

 GO


 IF EXISTS(Select 1 from sys.objects where name ='getKPIActualsReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getKPIActualsReport] 
END
GO

CREATE PROCEDURE [dbo].[getKPIActualsReport]     
@customerID	varchar(max),
@startDate	DATE,
@endDate	DATE
AS        
BEGIN        

SET @endDate=DATEADD(d,1,@endDate);

select  c.CUST_NM AS [Customer Name],p.PROJ_NM  AS [Project Name],K.KPI_NAME AS [KPI Name],convert(varchar,KD.PERIOD,23) AS Period,KD.KPI_ACTUAL [KPI Actual],
Case when KD.ISFLAG = 1 then 'Yes' else 'No' END AS [IS Not Applicable],KD.HIGHLIGHTS AS [Reason For Not Applicable],
CU.frst_NM AS [Created By], UU.frst_NM AS [Updated By],
convert(varchar,KD.CREATED_DATE,20) as [Created Date],
convert(varchar,KD.UPDATED_DATE,20) as [Updated Date],
c.CUST_ID AS [Customer ID],p.PROJ_ID AS [Project ID]
from
KPI_DETAILS KD (NOLOCK)
INNER Join
KPI  K  (NOLOCK) on K.ID = KD.KPI_ID and K.ISACTIVE =1 and KD.ISACTIVE = 1
INNER join
project p  (NOLOCK) on P.PROJ_ID = K.PROJECT_ID
INNER join
Customer c  (NOLOCK) on C.cust_id = P.CUST_ID
LEFT JOIN EMP_INFO CU
ON CU.EMP_ID = KD.CREATED_BY
LEFT JOIN EMP_INFO UU
ON UU.EMP_ID = KD.UPDATED_BY
where (@customerID=0 OR c.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))) AND  -- in (201100036,202100071) and 
Kd.PERIOD BETWEEN @startDate AND @endDate order by Kd.UPDATED_DATE desc

END

GO


 IF EXISTS(Select 1 from sys.objects where name ='reports_getKPIComplainaceStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getKPIComplainaceStatus] 
END
GO

 CREATE PROCEDURE [dbo].[reports_getKPIComplainaceStatus]                  
  @CustomerID varchar(max) = '0',       
  @date Datetime  ,           
  @productId int = -1              
  as                
  BEGIN    
  
  DECLARE @MonthDate DATETIME;  
SELECT @monthdate = CAST(DATEFROMPARTS(YEAR(@date), MONTH(@date), 1) AS DATE);  
  
DECLARE @quarterStartDate DATETIME;  
DECLARE @quarterEndDate DATETIME;  
SET @quarterStartDate = (SELECT dbo.Fn_GetQuarterDates(@date, 0));  
SET @quarterEndDate = (SELECT dbo.Fn_GetQuarterDates(@date, 1));  
  
SELECT  
 c.CUST_NM as customer_name,  
    product_title,  
    KPI_Count = (SELECT COUNT(*) FROM kpi WHERE PRODUCT_ID = pp.ID AND kpi.isactive = 1),  
    Entered_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                    WHERE kpi.product_id = pp.id   
                        AND kpi.isactive = 1   
                        AND KPI_DETAILS.ISACTIVE = 1   
                        AND ISNULL(isdraft, 0) = 0   
                        AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                            OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    NA_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                WHERE kpi.product_id = pp.id   
                    AND KPI_DETAILS.ISACTIVE = 1   
                    AND kpi.isactive = 1   
                    AND ISNULL(ISFLAG, 0) = 1   
                    AND ISNULL(isdraft, 0) = 0   
                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    Met_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                WHERE kpi.product_id = pp.id   
                    AND KPI_DETAILS.ISACTIVE = 1   
                    AND kpi.isactive = 1   
                    AND SLA_STATUS = 'Met'   
                    AND ISNULL(ISFLAG, 0) = 0   
                    AND ISNULL(isdraft, 0) = 0   
                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    NotMet_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                    WHERE kpi.product_id = pp.id   
                        AND KPI_DETAILS.ISACTIVE = 1   
                        AND kpi.isactive = 1   
                        AND SLA_STATUS = 'Not met'   
                        AND ISNULL(isdraft, 0) = 0   
                        AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                            OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    No_of_exclusions_applied = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                                INNER JOIN KPI_BASE_MEASURE_VALUE KPI_BMV ON KPI_BMV.KPI_DETAILS_ID = kpi_details.ID   
                                WHERE kpi.product_id = pp.id   
                                    AND KPI_DETAILS.ISACTIVE = 1   
                                    AND kpi.isactive = 1   
                                    AND KPI_BMV.IS_EXCLUSION = 1   
                                    AND SLA_STATUS = 'Not met'   
                                    AND ISNULL(isdraft, 0) = 0   
                                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    Manager = (SELECT TOP 1 frst_nm   
                FROM emp_info   
                WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 1 AND ISACTIVE = 1)),  
    Lead = (SELECT TOP 1 frst_nm   
            FROM emp_info   
            WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 2 AND ISACTIVE = 1)),  
    CSM = (SELECT TOP 1 frst_nm   
            FROM emp_info   
            WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 3 AND ISACTIVE = 1)),  
    QualitySpoc = (SELECT TOP 1 frst_nm   
                    FROM emp_info   
                    WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 4 AND ISACTIVE = 1))  
FROM   
    PORTFOLIO_PRODUCTS pp  
 inner join CUSTOMER c on c.CUST_ID = pp.CUST_ID  
WHERE   
    PP.ISACTIVE = 1   
    AND (@productId = -1 OR pp.ID = @productId)   
    AND (@customerid='0' or  pp.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))   
ORDER BY   
    7,   
    1;  
  
END

GO

 IF EXISTS(Select 1 from sys.objects where name ='reports_ListofAllAssessmentStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_ListofAllAssessmentStatus] 
END
GO

CREATE PROCEDURE [dbo].[reports_ListofAllAssessmentStatus]                            

@CustomerID VARCHAR(max)='0' 
as

begin
select PM.Title as [Checklist], 
PM.version as [Version], 
Convert(VARCHAR,PQ.effective_from, 107)  as [Effective date],
PQ.Title as[Checkpoint Question],
  CASE 
        WHEN ACS.status_category = 'NMET' THEN 'NOT MET'
        ELSE ACS.status_category
    END AS [Implementation status],
PA.TITLE as [Process_Area],
P.TITLE as Process,
PS.TITLE as [Service Tower],
pr.PROJ_NM as Project,
CR.CUST_NM as Customer,
(select FRST_NM from EMP_INFO where EMP_ID=pr.PROJ_DM_EMP_ID) as [DP NAME],
(select EMAIL_ID from EMP_INFO where EMP_ID=pr.PROJ_DM_EMP_ID) as [DP MAIL],
Convert(VARCHAR,ACES.ACTUAL_AUDIT_eND_DATE, 107)  AS [Last assessment date]
from  
PM_CHECKLIST_QUESTIONS PQ 
left join PM_CHECKLIST PM on PM.ID=PQ.CHECKLIST_ID
left join PM_PROCESS_QUESTIONS_MAPPING PQM on PQM.question_id=PQ.ID and PQM.checklist_id=PQ.CHECKLIST_ID  
LEFT join AUDIT_CHECKLIST_STATUS_LIST_VALUES ACS on PQ.CHECKLIST_ID = ACS.ID and acs.isactive =1
inner join PROCESS_SERVICE_AREA_NEW PS on PS.ID=PQM.SERVICE_AREA_ID and ps.ISACTIVE = 1 and ps.SHOW_IN_MASTER =1
inner join PROCESS_AREA PA on PA.ID = PQM.PROCESS_AREA_ID and pa.ISACTIVE = 1and pa.SHOW_IN_MASTER =1
inner join PROCESS P on P.ID = PQM.process_id and p.ISACTIVE = 1and p.SHOW_IN_MASTER =1
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY ACES on PQ.CHECKLIST_ID = ACES.CHECKLIST_ID and aces.ISACTIVE=1 
inner join project pr on  aces.PROJECT_ID  = pr.PROJ_ID 
inner join customer cr on aces.CUSTOMER_ID = cr.CUST_ID 

where PQ.ISACTIVE=1 and PM.ISACTIVE=1 and PQM.isactive=1 AND  (@CustomerID='0' or  cr.cust_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,',')))  order by [Service Tower],[Process_Area],Process
end

GO

 IF EXISTS(Select 1 from sys.objects where name ='reports_getListofIssues' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getListofIssues] 
END
GO
CREATE procedure [dbo].[reports_getListofIssues]                                
  @startDate Datetime,                              
  @endDate Datetime  ,      
  @CustomerID varchar(max)   = null                      
       
  AS                                        
  BEGIN            
          
  select 
  
 c.cust_nm as CUSTOMER,	p.proj_nm as PROJECT	,p.Business_unit as [BUSINESS UNIT],	p.department as SUBVERTICAL, reported_by as [Report Category], SEVERITY,  status as CURRENT_STATUS	,	 	 Identified_by as	[REPORTED BY],	LEVEL,
 
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
      where I.identified_date between @startDate and @endDate and (isnull( @CustomerID ,'0')='0'  or C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CustomerID,','))) and I.ISACTIVE=1  
  order by C.CUST_NM,P.PROJ_NM,  case when severity = 'high' then 1
              when severity = 'Medimu' then 2
              when severity = 'Low' then 3
              else 4
         end asc, reported_date desc, ISSUE_RESOLVED_DATE     
 END   

 GO