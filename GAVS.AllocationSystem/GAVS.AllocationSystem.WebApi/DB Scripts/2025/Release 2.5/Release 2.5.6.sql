---Engagement type added changes in PCSAT Repots ------------

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
p.Proj_nm , p.REVENUE_TYPE, p.ENGAGAMENT_TYPE, CSS.STATUS,                      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS [CSAT SENT DATE],                      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS [CSAT RECEIVED DATE], CSS.IS_VERIFIED,                     
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
CSS.DISPLAY_NAME as [RESPONDENT NAME],CSS.EMAIL_ID as [RESPONDENT MAIL],  case when co.CONTACT_ROLE is null then '' else co.CONTACT_ROLE end AS [RESPONDENT ROLE],                   
[Year - Quarter] =  (select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ),  
CASE When predicted_score is null then '-' else convert(varchar, convert(int,predicted_score)) end as [PREDICTED SCORE],
[ACTUAL SCORE] = (select top 1 RATING from CSS_QUESTION_REPLIES where BATCH_CUSTOMER_ID = css.ID and QUESTION_CATEGORY = 'Criteria' and PERSPECTIVE = 'Overall Experience' ),
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
P.CUST_ID, P.PROJ_ID  , b.id, css.ID,
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where ',' + spoc + ',' like '%,' + e.email_id + ',%' FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC] 
FROM CSS_BATCH_CUSTOMERS CSS                       
INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE   AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
INNER JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID
left join CONTACTS co on co.CONTACT_EMAILID = CSS.EMAIL_ID and css.CUST_ID = co.CUSTOMER_ID --and co.ISACTIVE = 1    
WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')    and css.ISACTIVE =1       
AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))          
                    
union                        
                    
SELECT C.CUST_NM,          
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,            
coalesce( pp.product_title,P.PROJ_NM,'') as proj_nm, p.REVENUE_TYPE,  p.ENGAGAMENT_TYPE, CSS.STATUS,                      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS [CSAT SENT DATE],                      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS [CSAT RECEIVED DATE], CSS.IS_VERIFIED,                     
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
CSS.DISPLAY_NAME as [RESPONDENT NAME],CSS.EMAIL_ID as [RESPONDENT MAIL],   
case when co.CONTACT_ROLE is null then '' else co.CONTACT_ROLE end AS [RESPONDENT ROLE], 
[Year - Quarter] =  (SELECT                      
CASE                      
                       
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                    
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                   
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                   
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                       
END                      
FROM CSS_BATCH_MONTHLY where id= b.id ),    
'-',
[ACTUAL SCORE] = (select top 1 RATING  from CSS_QUESTION_REPLIES where Batch_Customer_Monthly_id = css.ID and QUESTION_CATEGORY = 'Criteria' and PERSPECTIVE = 'Overall Experience' ),
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
P.CUST_ID, P.PROJ_ID   , b.id, css.ID ,''                 
from CSS_BATCH_CUSTOMER_MONTHLY CSS                      
INNER JOIN CSS_BATCH_MONTHLY B ON B.ID = CSS.BATCH_MONTHLY_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
                
left join portfolio_products pp on css.prod_id = pp.id           
left join PRODUCT_RESPONSIBLE pr on css.PROD_ID = pr.PRODUCT_ID and pr.MANAGEMENT_TYPE =7    and pr.ISACTIVE = 1    
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(CSS.PROJ_ID , pr.project_id)        
left join CONTACTS co on co.CONTACT_EMAILID = CSS.EMAIL_ID and css.CUST_ID = co.CUSTOMER_ID--and co.ISACTIVE = 1    
WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')      and css.ISACTIVE =1 
AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))          
order by C.CUST_NM, P.PROJ_ID                      
end 


GO


IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Consolidated' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Consolidated]
END
GO

CREATE PROCEDURE [dbo].[reports_CSAT_Consolidated]                       
                      
@StartDate date,                     
@EndDate date,
@CUSTOMER varchar(max)='0'     
                    
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
ON E.EMP_ID = project.DP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [Customer Success Manager],               
(SELECT                        
E.EMAIL_ID                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.DP_ID                        
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
--(SELECT                        
--E.FRST_NM                        
--FROM EMP_INFO E                        
--where EMAIL_ID= SPOC)                        
--AS [CSS SPOC],  
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')),   
    1, 1, '') AS [CSAT SPOC],   
(SELECT                        
E.FRST_NM                        
FROM project                        
INNER JOIN EMP_INFO E                        
ON E.EMP_ID = project.PROJ_DM_EMP_ID                        
WHERE project.PROJ_ID = B.PROJ_ID)                        
AS [DP NAME], --DP NAME
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
--P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],               
p.REVENUE_TYPE as [PROJECT TYPE],  
p.ENGAGAMENT_TYPE as [ENGAGAMENT TYPE], 
--P.PROJECT_GROUP [PROJECT GROUP],                         
--P.COUNTRY [COUNTRY],              
                
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  ),            
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),            
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  and pa.status  in ('In Progress')),            
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
ACTION_PLAN_COMPLETION_ACTUAL_DATE = (select FORMAT(Max(PA.PLANNED_ACTUAL_DATE),'yyyy-MM-dd')  from  PROJECT_ACTIONITEM pa where BATCH_CUSTOMER_ID = b.ID),                   
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
  AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))             
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
'',
'',
p.PROJ_STATUS,                       
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                        
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                        
--P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],                  
p.REVENUE_TYPE as [PROJECT TYPE], 
p.ENGAGAMENT_TYPE as [ENGAGAMENT TYPE], 
--P.PROJECT_GROUP [PROJECT GROUP],                        
--P.COUNTRY [COUNTRY],              
TotalActionItems = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  ),            
SubmissionCompleted = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and  completion_date is not null and completion_date <getdate()),            
Planned = (select count(*) from PROJECT_ACTIONITEM PA  where B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1  and pa.status  in ('In Progress')),            
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
  AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))
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
[CSAT SPOC],  
[DP NAME],
[DP MAIL],
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

IF EXISTS(Select 1 from sys.objects where name ='getCSSActionitem' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSActionitem]
END
GO
CREATE PROCEDURE [dbo].[getCSSActionitem]     
    
@STARTDATE datetime,    
@ENDDATE datetime,     
@CUSTOMER varchar(MAX)='0'      
AS            
    
BEGIN         
    
select C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,E.FRST_NM as PROJECT_MANAGER,CB.EMAIL_ID as CUSTOMER_MAIL,    
SOURCE as SOURCE_CATEGORY, SOURCE_DESCRIPTION,   
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE,    
sa.CSS_REFERENCE,sa.SCORE,sa.CUSTOMER_REMARKS,
PA.DESCRIPTION as  [DESCRIPTION / CORRECTIVE_ACTION_PLAN], PA.STATUS, PA.ROOT_CAUSE,PA.PREVENTIVE_ACTION_PLAN,     
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
p.ENGAGAMENT_TYPE,
PA.BATCH_CUSTOMER_ID,PA.PROJECT_ID,PA.CUSTOMER_ID    
    
from PROJECT_ACTIONITEM PA     
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID    
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID    
--inner join CSS_BATCH_CUSTOMER_MONTHLY CB on CB.ID = PA.BATCH_CUSTOMER_MONTHLY_ID    
inner join CSS_BATCH_CUSTOMERS CB on CB.ID = PA.BATCH_CUSTOMER_ID    
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID    
CROSS APPLY fn_splitActionItemCssReference(PA.CSS_REFERENCE) sa    
where PA.CUSTOMER_ID = '212100001' and PA.ISACTIVE=1 and CB.ISACTIVE=1 and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE    
and  (@CUSTOMER='0' or  p.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')) )
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc    
    
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
p.ENGAGAMENT_TYPE ,
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
co.CONTACT_ROLE AS [Respondent Role], 
B.EMAIL_ID AS [Email_Id],                              
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                              
[CSAT SENT DATE],                              
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT RECEIVED DATE],  IS_VERIFIED,                            
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
p.ENGAGAMENT_TYPE as [ENGAGAMENT TYPE], 
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
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1        and bt.FREQUENCY in ('Half-Yearly', 'Quarterly','Halfyearly')    
INNER JOIN CSS_QUESTION_REPLIES QR                              
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                            
LEFT JOIN PROJECT_ACTIONITEM PA                             
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.CSS_REFERENCE like '%' + qr.question +'%'     
left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC    
join CONTACTS co on co.CONTACT_EMAILID = b.EMAIL_ID and co.ISACTIVE = 1    
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
co.CONTACT_ROLE AS [Respondent Role], 
B.EMAIL_ID AS [Email_Id],                              
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT SENT DATE],                              
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT RECEIVED DATE],  IS_VERIFIED,                            
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
p.ENGAGAMENT_TYPE as [ENGAGAMENT TYPE], 
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
join CONTACTS co on co.CONTACT_EMAILID = b.EMAIL_ID and co.ISACTIVE = 1    
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                            
AND (bt.start_date BETWEEN @StartDate AND @EndDate                              
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                              
 AND (@CUSTOMER='0' or  C.CUST_ID	in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  )
ORDER BY [Year_Quarter], [Customer Name];                          
END 



GO

IF EXISTS(Select 1 from sys.objects where name ='CSS_Readiness_Report' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[CSS_Readiness_Report]
END
GO

CREATE PROCEDURE [dbo].[CSS_Readiness_Report]                          
                          
@StartDate datetime,                          
@EndDate datetime   ,                       
@CustomerID VARCHAR(max)='0'                      
                      
AS       

BEGIN  

SET @StartDate = CONVERT(DATETIME, CONVERT(VARCHAR(11),@StartDate, 111 ) + ' 00:00:00', 111)
SET @EndDate = CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)

DECLARE @skipCSAT int = (SELECT ID FROM PROJECT_CONFIGURATION_SETTING WHERE SETTING_KEY ='SKIP_CSAT' AND ISACTIVE=1)

;WITH cte AS (
    SELECT css.CUST_ID,p.PROJ_ID, b.ID AS BATCH_ID, css.ID AS BATCH_CUSTOMER_ID,B.FREQUENCY,B.YEAR,b.SEQUENCE,
           css.EMAIL_ID, css.IS_VERIFIED, css.UPDATED_DATE, css.COMMENTS, css.UPDATED_BY,css.SPOC
    FROM CSS_BATCH_CUSTOMERS css
    INNER JOIN CSS_BATCHES b ON css.BATCH_ID = b.ID
	inner join PROJECT P ON P.PROJ_ID=CSS.PROJ_ID
 --   OUTER APPLY (
   --     SELECT TOP 1 PROJ_ID, PROJ_NM, PROJ_STATUS, PROJ_DM_EMP_ID, END_DATE, PROJECT_TYPE
   --     FROM PROJECT
   --     WHERE ((PROJ_ID = Css.PROJ_ID AND B.FREQUENCY in ('Half-Yearly','Halfyearly'))
   --         OR (CUST_ID = Css.CUST_ID AND B.FREQUENCY = 'Annual')
			--) ) P
    WHERE ((b.START_DATE BETWEEN @StartDate AND @EndDate) OR (b.END_DATE BETWEEN @StartDate AND @EndDate))  AND
       css.ISACTIVE=1 
      AND css.IS_VERIFIED = 1 
      AND css.SURVEY_SENT_DATE IS NOT NULL
      AND B.FREQUENCY in('Half-Yearly','Halfyearly')
)

SELECT DISTINCT
    C.CUST_NM, 
    P.PROJ_NM ,

    --PERIODIC_PROJECT_HEAD_COUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE PR WHERE PROJ_ID = P.PROJ_ID 
    --                      AND (PR.START_DATE BETWEEN @StartDate AND @EndDate OR PR.END_DATE 
				--		  BETWEEN @StartDate AND @EndDate OR (PR.START_DATE <= @StartDate AND PR.END_DATE >= @EndDate))     
    --                      AND CURR_INDC ='y' AND BILL_FLG =1)  ,
    --PERIODIC_ACCOUNT_HEAD_COUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE PR 
    --                      INNER JOIN PROJECT P2 ON PR.PROJ_ID = P2.PROJ_ID 
    --                      WHERE P2.CUST_ID = C.CUST_ID 
    --                      AND (PR.START_DATE BETWEEN @StartDate AND @EndDate OR PR.END_DATE BETWEEN @StartDate AND @EndDate OR
				--		  (PR.START_DATE <= @StartDate AND PR.END_DATE >= @EndDate))
    --                      AND CURR_INDC ='y' AND BILL_FLG =1),
    
    CURRENT_PROJECT_HEAD_COUNT = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 
	and pr.CURR_INDC ='y' and pr.END_DATE >= GETDATE())   ,

    CURRENT_ACCOUNT_HEAD_COUNT = (select count(*) from PROJ_RESOURCE pr where pr.CUST_ID = p.CUST_ID and pr.BILL_FLG =1 
	and pr.CURR_INDC ='y' and pr.END_DATE >= GETDATE())  ,
    
    
    PROJECT_IN_PCSAT = CASE WHEN cd.FREQUENCY in('Half-Yearly','Halfyearly') THEN 'Yes' ELSE 'No' END,

	CASE WHEN EXISTS ( SELECT 1 FROM css_batch_customers cbc 
			join CSS_BATCHES b on b.id=cbc.BATCH_ID WHERE cbc.cust_id = C.cust_id 
            AND b.FREQUENCY = 'Annual' and cbc.ISACTIVE=1 and b.ISACTIVE= 1) THEN 'Yes' ELSE 'No' END AS ACCOUNT_IN_ACSAT,

    --[YEAR - QUARTER]= CASE 
    --    WHEN cd.frequency in('Half-Yearly','Halfyearly') THEN 'H' + CASE     
    --        WHEN cd.sequence IN (1 ) THEN '1'    
    --        WHEN cd.sequence IN (2) THEN '2' ELSE NULL END + ' - ' + CONVERT(varchar, cd.Year) 
    --END,  
      CONVERT(VARCHAR,P.START_DATE,107)  AS START_DATE,
     CONVERT(VARCHAR,P.END_DATE,107)  AS END_DATE,
    cd.FREQUENCY,
    --CSS_Eligible = (CASE 
    --    WHEN (SELECT TOP 1 ID FROM PROJECT_CONFIGURATION_DATA WHERE PROJ_ID=P.PROJ_ID AND CONFIGURATION_SETTING_ID=@skipCSAT) IS NOT NULL THEN 'No'
    --    WHEN P.PROJECT_TYPE != 'Internal' AND (SELECT COUNT(*) FROM PROJ_RESOURCE WHERE PROJ_ID=P.PROJ_ID AND CURR_INDC='y' AND BILL_FLG=1) > 3 
    --         AND P.START_DATE < @EndDate -75 AND P.END_DATE > @EndDate -90 THEN 'Yes'
    --    ELSE 'No' END),
    --[Reason] = 'NA', 
    --CSS_CONFIGURED = CASE WHEN cd.EMAIL_ID IS NOT NULL THEN 'Yes' ELSE 'No' END,
    --CUSTOMER_CONTACT_VERIFICATION = CASE WHEN cd.IS_VERIFIED = 1 THEN 'Yes' ELSE 'No' END,
   -- VERIFIED_BY = E5.FRST_NM,
    --VERIFICATION_COMMENTS = cd.COMMENTS,
    --APPROVAL_DATE = CASE WHEN cd.IS_VERIFIED=1 THEN CONVERT(VARCHAR,cd.UPDATED_DATE,107) ELSE NULL END,
    RESPONDENT_MAIL = cd.EMAIL_ID,
    --[Role] = CC.Contact_ROLE,
    --RoleType = '',

    P.PROJ_STATUS,  P.PROJECT_TYPE 
	, P.EXECUTION_TYPE, P.ENGAGAMENT_TYPE, P.BUSINESS_UNIT, P.DEPARTMENT,P.PROJECT_GROUP  as PROJECT_GROUP, P.CONTRACTING_UNIT,
    P.REVENUE_TYPE,p.ENGAGAMENT_TYPE, P.COUNTRY, P.METHODOLOGY,
    [Type of Account] = dbo.fn_getTypeOfAccount(C.CUST_ID),
    ACCOUNT_OWNER = CASE WHEN P.PROJ_ID LIKE 'proj%' THEN 'GSLab' ELSE 'GAVS' END,    
     E1.FRST_NM  AS PM,
     E1.EMAIL_ID  AS [PM_MAIL], 
    E2.FRST_NM AS CSM, E2.EMAIL_ID AS [CSM_MAIL],
    E3.FRST_NM AS ACCOUNT_MANAGER, E3.EMAIL_ID AS [AM_MAIL], 
    E4.FRST_NM AS [BU_HEAD], E4.EMAIL_ID AS [BU_MAIL], 
    E6.FRST_NM as [DP_NAME], E6.EMAIL_ID as [DP_MAIL],
    E.FRST_NM AS QUALITY_SPOC, 
      STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =cd.SPOC FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC]   
    --[REVIEWER_MAIL] = (SELECT TOP 1 EMAIL_ID FROM EMP_INFO WHERE EMP_ID = E2.REVIEWER_EMP_ID),

    --SKIP_CSAT = CASE WHEN (SELECT TOP 1 bit_value FROM PROJECT_CONFIGURATION_DATA WHERE PROJ_ID=P.PROJ_ID AND CONFIGURATION_SETTING_ID=@skipCSAT)=1 THEN 'Yes' ELSE 'No' END,
    --SKIP_CSAT_COMMENTS = (SELECT TOP 1 COMMENTS FROM PROJECT_CONFIGURATION_DATA WHERE PROJ_ID=P.PROJ_ID AND CONFIGURATION_SETTING_ID=@skipCSAT),

    --P.PROJ_ID, C.CUST_ID, 
    --BATCH_ID = cd.BATCH_ID,
    --BATCH_CUSTOMER_ID = cd.BATCH_CUSTOMER_ID,
    --0 AS BATCH_MONTHLY_ID, 
    --0 AS BATCH_CUSTOMER_MONTHLY_ID,
    --CSM_EMP_ID = CAST(P.proj_dm_Emp_id AS VARCHAR(100))

FROM PROJECT P
INNER JOIN CUSTOMER C ON P.CUST_ID = C.CUST_ID
LEFT JOIN cte cd ON P.PROJ_ID = cd.PROJ_ID
LEFT JOIN EMP_INFO E ON E.EMP_ID = P.QUALITY_SPOC and E.DOR IS NULL
LEFT JOIN EMP_INFO E1 ON E1.EMP_ID = P.PROJ_PM_EMP_ID and E1.DOR IS NULL
LEFT JOIN EMP_INFO E2 ON E2.EMP_ID = P.DP_ID and E2.DOR IS NULL
LEFT JOIN EMP_INFO E3 ON E3.EMP_ID = P.PROJ_AM_EMP_ID and E3.DOR IS NULL
LEFT JOIN EMP_INFO E4 ON E4.EMP_ID = P.PROJ_BUHEAD_EMP_ID and E4.DOR IS NULL
LEFT JOIN EMP_INFO E6 ON E6.EMP_ID = P.PROJ_DM_EMP_ID and E6.DOR IS NULL

WHERE (@CustomerID='0' or C.cust_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,',')))   
 AND C.CUST_NM NOT LIKE '%gavs%'
 AND C.CUST_ID != '202100091' 
 AND ((cd.FREQUENCY in ('Half-Yearly','Halfyearly')
   or ((P.proj_status in('close','Deliver','Plan','Complete','New') AND P.end_date >= DATEADD(MONTH, -8, GETDATE())))
    and P.PROJECT_TYPE != 'Internal'
 ))

ORDER BY CUST_NM, PROJ_NM
END


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
[ENGAGAMENT TYPE] varchar(4000),
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
[ENGAGAMENT TYPE],
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
[ENGAGAMENT TYPE],
COUNTRY	 
 

 GO

IF EXISTS(Select 1 from sys.objects where name ='report_getCSATResponseProjectWise' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[report_getCSATResponseProjectWise]
END
GO
 
CREATE PROCEDURE [dbo].[report_getCSATResponseProjectWise]            
             
@STARTDATE datetime,      
@ENDDATE datetime       
                                                                                                                               
AS                                                
BEGIN    
  
;with cte as  
(   
select  distinct p.BUSINESS_UNIT,cust_nm,  p.proj_nm, display_name, 
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16) then isnull((select sum(rating)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0)end as NON_STAFFING_OVERALL_EXP,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then  isnull((select sum(rating)          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Timeline Adherence'  and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0) end as NON_STAFFING_TIMELINE_ADHERENCE,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select sum(rating)          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE IN('Quality of Delivery','Quality of deliverables') and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0) end as NON_STAFFING_QUALITY_OF_DELIVERY,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select sum(rating)           
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0)end as  NON_STAFFING_TIMELY_RESOURCE_FULFILLMENT,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select sum(rating)          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Risk Management & Responsiveness' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0) end as NON_STAFFING_RISK_MANAGEMENT,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select sum(rating)            
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Thought Leadership'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0) end as NON_STAFFING_THOUGHT_LEADERSHIP,  
--comments
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16) then isnull((select RATING_DESCRIPTION 
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),'')end as NON_STAFFING_OVERALL_EXP_COMMENTS,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then  isnull((select RATING_DESCRIPTION         
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Timeline Adherence'  and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0) end as NON_STAFFING_TIMELINE_ADHERENCE_COMMENTS,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select RATING_DESCRIPTION     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE  IN ('Quality of Delivery','Quality of deliverables')  and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0) end as NON_STAFFING_QUALITY_OF_DELIVERY_COMMENTS,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select RATING_DESCRIPTION          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0)end as  NON_STAFFING_TIMELY_RESOURCE_FULFILLMENT_COMMENTS,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select RATING_DESCRIPTION          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Risk Management & Responsiveness' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0) end as NON_STAFFING_RISK_MANAGEMENT_COMMENTS,  
  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select RATING_DESCRIPTION           
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Thought Leadership'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0) end as NON_STAFFING_THOUGHT_LEADERSHIP_COMMENTS,  
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select RATING_DESCRIPTION        
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'others'   
and PERSPECTIVE ='Qualitative feedback' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0) end as NON_STAFFING_QUALITATIVE_FEEDBACK_COMMENTS,  
--staffing
  
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select sum(rating)           
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0)end as  STAFFING_OVERALL_EXP,  
  
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select sum(rating)            
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Resource Competency'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0)end as  STAFFING_RESOURCE_COMPETENCY,  
  
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select sum(rating)          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0) end as STAFFING_TIMELY_RESOURCE_FULFILLMENT,  

case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select RATING_DESCRIPTION          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID   
),0)end as  STAFFING_OVERALL_EXP_COMMENTS,  
  
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select RATING_DESCRIPTION          
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Resource Competency'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0)end as  STAFFING_RESOURCE_COMPETENCY_COMMENTS,  
  
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select RATING_DESCRIPTION        
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria'   
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0) end as STAFFING_TIMELY_RESOURCE_FULFILLMENT_COMMENTS,  
 
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select RATING_DESCRIPTION        
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'others'   
and PERSPECTIVE ='Qualitative feedback' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID  
),0) end as STAFFING_QUALITATIVE_FEEDBACK_COMMENTS,  

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select   avg(  isnull(rating,0))     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_NON_STAFFING,  
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select   avg(  isnull(rating,0))     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_STAFFING,  
   c.cust_id, PROJ_DM_EMP_ID,p.ENGAGAMENT_TYPE,p.proj_id,
QUESTION_MODEL_ID  
  
  
from css_batch_customers bc   
inner join customer c on c.cust_id = bc.cust_id   
inner join project p on p.proj_id = bc.PROJ_ID  
INNER JOIN CSS_QUESTION_MASTER cm on cm.MODEL_ID=bc.QUESTION_MODEL_ID 
join CSS_BATCHES b on b.ID = bc.BATCH_ID
where  (b.START_DATE BETWEEN @StartDate AND @EndDate                          
OR b.END_DATE BETWEEN @StartDate AND @EndDate)   and b.ISACTIVE=1
and bc.ISACTIVE = 1 and cm.ISACTIVE = 1   
and bc.status in ( 'completed' )  
)  
select  * from cte

--BUSINESS_UNIT as BUSINESS_UNIT,  
--cust_nm as [ACCOUNT], proj_nm,  
--convert(varchar, sum(sentt)) AS SURVEYS_SENT,  
--case when sum(NS_Completed) > 0 then sum(NS_Completed) else NULL end as [Non Staffing SURVEY_RECEIVED],  
--case when sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end) > 0   
--    then   cast((cast(sum(AVR_NS) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end),0)) as decimal(18,2))    
--    else NULL end AS [Non Staffing Average CSAT Score],  
--  sum(oe),
--case when sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end) > 0   
--    then  cast((cast(sum(OE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end),0)) as decimal(18,2))    
--    else NULL end AS [Non Staffing OverAll Experience],  
  
--case when sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(TA) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Non Staffing Timeline Adherence],  
  
--case when sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(QD) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Non Staffing Quality of Delivery],  
  
--case when sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(TR) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Non Staffing Timely Resource Fulfillment],  
  
--case when sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(RM) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Non Staffing Risk Management & Responsiveness],  
  
--case when sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(TL) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Non Staffing Thought Leadership],  
--case when sum(S_Completed) > 0 then sum(S_Completed) else NULL end as [Staffing SURVEY_RECEIVED],  
  
--case when sum(case when QUESTION_MODEL_ID in (10) then S_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(AVR_ST) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (10) then S_Completed else 0 end),0)) as decimal(18,2)))   
--    else NULL end AS [Staffing Average CSAT Score],  
--case when sum(case when QUESTION_MODEL_ID = 10 then S_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(SOE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID = 10 then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Staffing OverAll Experience],  
  
--case when sum(case when QUESTION_MODEL_ID = 10 then S_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(RC) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID = 10 then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Staffing Resource Competency],  
  
--case when sum(case when QUESTION_MODEL_ID = 10 then S_Completed else 0 end) > 0   
--    then convert(varchar, cast((cast(sum(TRF) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID = 10 then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%'   
--    else NULL end AS [Staffing Timely Resource Fulfillment]  
  
--from cte     
--group by  BUSINESS_UNIT, cust_nm,cust_id , PROJ_ID  , proj_nm
order by BUSINESS_UNIT,cust_nm,proj_nm 
  
END

GO

IF EXISTS(Select 1 from sys.objects where name ='report_getCSATResponseAccountWise' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[report_getCSATResponseAccountWise]
END
GO

CREATE PROCEDURE [dbo].[report_getCSATResponseAccountWise]          
           
@STARTDATE datetime,    
@ENDDATE datetime     
                                                                                                                             
AS                                              
BEGIN  

;with cte as
( 
select  distinct p.BUSINESS_UNIT,c.cust_id,cust_nm,  PROJ_DM_EMP_ID,p.proj_id,
case when BC.status in ('Mail Sent','Mail Re-sent','completed') then 1 else 0 end as Sentt,
case when bc.QUESTION_MODEL_ID in(8,9,14,15,16) and BC.status ='completed' then 1 else 0 end as NS_Completed ,
case when bc.QUESTION_MODEL_ID in(10,13) and BC.status ='completed' then 1 else 0 end as S_Completed ,
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16) then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as OE,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then  isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timeline Adherence'  and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as TA,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE IN ('Quality of Delivery','Quality of deliverables') and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0) end as QD,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as  TR,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Risk Management & Responsiveness' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as RM,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Thought Leadership'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as TL,

case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as  SOE,

case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Resource Competency'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0)end as  RC,

case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0) end as TRF,
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select   avg(  isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_NS,
case when bc.QUESTION_MODEL_ID in (10,13)  then isnull((select   avg(  isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_ST,
bc.id,
QUESTION_MODEL_ID

from css_batch_customers bc 
inner join customer c on c.cust_id = bc.cust_id 
inner join project p on p.proj_id = bc.PROJ_ID
INNER JOIN CSS_QUESTION_MASTER cm on cm.MODEL_ID=bc.QUESTION_MODEL_ID
join CSS_BATCHES b on b.ID = bc.BATCH_ID
where  (b.START_DATE BETWEEN @StartDate AND @EndDate                          
OR b.END_DATE BETWEEN @StartDate AND @EndDate)   
and bc.ISACTIVE = 1 and cm.ISACTIVE = 1 
and bc.status in ('mail sent', 'mail re-sent', 'completed' )
)
select   
BUSINESS_UNIT as BUSINESS_UNIT,
cust_nm as [ACCOUNT], 
convert(varchar, sum(sentt)) AS SURVEYS_SENT,
case when sum(NS_Completed) > 0 then sum(NS_Completed) else NULL end as [Non Staffing SURVEY_RECEIVED],
case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(AVR_NS) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) as decimal(18,2))) 
    else NULL end AS [Non Staffing Average CSAT Score],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(OE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing OverAll Experience],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TA) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Timeline Adherence],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(QD) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Quality of Delivery],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TR) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Timely Resource Fulfillment],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(RM) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Risk Management & Responsiveness],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TL) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Thought Leadership],
case when sum(S_Completed) > 0 then sum(S_Completed) else NULL end as [Staffing SURVEY_RECEIVED],

case when sum(case when QUESTION_MODEL_ID in (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(AVR_ST) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (10,13) then S_Completed else 0 end),0)) as decimal(18,2))) 
    else NULL end AS [Staffing Average CSAT Score],
case when sum(case when QUESTION_MODEL_ID in (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(SOE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (10,13)then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing OverAll Experience],

case when sum(case when QUESTION_MODEL_ID in (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(RC) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (10,13) then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing Resource Competency],

case when sum(case when QUESTION_MODEL_ID in (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TRF) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (10,13)then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing Timely Resource Fulfillment]

from cte   
group by  BUSINESS_UNIT, cust_nm,cust_id  
order by BUSINESS_UNIT,cust_nm,cust_id

END
  GO

IF EXISTS(Select 1 from sys.objects where name ='report_getCSATResponseBuWise' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[report_getCSATResponseBuWise]
END
GO

CREATE PROCEDURE [dbo].[report_getCSATResponseBuWise]          
           
@STARTDATE datetime,    
@ENDDATE datetime     
                                                                                                                             
AS                                              
BEGIN 
;with cte as
( 
select  distinct p.BUSINESS_UNIT,c.cust_id,cust_nm,  PROJ_DM_EMP_ID,p.proj_id,
case when BC.status in ('Mail Sent','Mail Re-sent','completed') then 1 else 0 end as Sentt,
case when bc.QUESTION_MODEL_ID in(8,9,14,15,16) and BC.status ='completed' then 1 else 0 end as NS_Completed ,
case when bc.QUESTION_MODEL_ID IN (10,13) and BC.status ='completed' then 1 else 0 end as S_Completed ,
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16) then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as OE,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then  isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timeline Adherence'  and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as TA,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE IN('Quality of Delivery','Quality of deliverables') and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0) end as QD,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as  TR,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Risk Management & Responsiveness' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as RM,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Thought Leadership'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as TL,

case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as  SOE,

case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Resource Competency'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0)end as  RC,

case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0) end as TRF,
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select   avg(  isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_NS,
case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select   avg(  isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_ST,
bc.id,
QUESTION_MODEL_ID

from css_batch_customers bc 
inner join customer c on c.cust_id = bc.cust_id 
inner join project p on p.proj_id = bc.PROJ_ID
INNER JOIN CSS_QUESTION_MASTER cm on cm.MODEL_ID=bc.QUESTION_MODEL_ID
join CSS_BATCHES b on b.ID = bc.BATCH_ID
where  (b.START_DATE BETWEEN @StartDate AND @EndDate                          
OR b.END_DATE BETWEEN @StartDate AND @EndDate)   and b.ISACTIVE=1 and bc.ISACTIVE = 1 and cm.ISACTIVE = 1
and bc.status in ('mail sent', 'mail re-sent', 'completed' )
),
cte2 as
( 
select  distinct c.cust_id,cust_nm,  PROJ_DM_EMP_ID,p.proj_id,
case when BC.status in ('Mail Sent','Mail Re-sent','completed') then 1 else 0 end as Sentt,
case when bc.QUESTION_MODEL_ID in(8,9,14,15,16) and BC.status ='completed' then 1 else 0 end as NS_Completed ,
case when bc.QUESTION_MODEL_ID IN (10,13) and BC.status ='completed' then 1 else 0 end as S_Completed ,
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16) then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as OE,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then  isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timeline Adherence'  and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as TA,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE IN('Quality of Delivery','Quality of deliverables') and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0) end as QD,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as  TR,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Risk Management & Responsiveness' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as RM,

case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Thought Leadership'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0) end as TL,

case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Overall Experience' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID 
and isnull(rating,0) >= 4),0)end as  SOE,

case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Resource Competency'and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0)end as  RC,

case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select count(*)     
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' 
and PERSPECTIVE ='Timely Resource Fulfillment' and QUESTION_MODEL_ID = bc.QUESTION_MODEL_ID
and isnull(rating,0) >= 4),0) end as TRF,
case when bc.QUESTION_MODEL_ID in (8,9,14,15,16)  then isnull((select   avg(  isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_NS,
case when bc.QUESTION_MODEL_ID IN (10,13)  then isnull((select   avg(  isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) end as AVR_ST,
bc.id,
QUESTION_MODEL_ID

from css_batch_customers bc 
inner join customer c on c.cust_id = bc.cust_id 
inner join project p on p.proj_id = bc.PROJ_ID
INNER JOIN CSS_QUESTION_MASTER cm on cm.MODEL_ID=bc.QUESTION_MODEL_ID 
join CSS_BATCHES b on b.ID = bc.BATCH_ID
where  (b.START_DATE BETWEEN @StartDate AND @EndDate                          
OR b.END_DATE BETWEEN @StartDate AND @EndDate)   and b.ISACTIVE=1 and bc.ISACTIVE = 1 and cm.ISACTIVE = 1
and bc.status in ('mail sent', 'mail re-sent', 'completed' )
)
select   cte.BUSINESS_UNIT as BUSINESS_UNIT ,convert(varchar, sum(sentt)) AS SURVEYS_SENT,
case when sum(NS_Completed) > 0 then sum(NS_Completed) else NULL end as [Non Staffing SURVEY_RECEIVED],
case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(AVR_NS) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) as decimal(18,2))) 
    else NULL end AS [Non Staffing Average CSAT Score],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(OE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing OverAll Experience],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TA) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Timeline Adherence],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(QD) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Quality of Delivery],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TR) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Timely Resource Fulfillment],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(RM) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Risk Management & Responsiveness],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TL) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Thought Leadership],
case when sum(S_Completed) > 0 then sum(S_Completed) else NULL end as [Staffing SURVEY_RECEIVED],

case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(AVR_ST) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) as decimal(18,2))) 
    else NULL end AS [Staffing Average CSAT Score],
case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(SOE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing OverAll Experience],

case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(RC) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing Resource Competency],

case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TRF) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing Timely Resource Fulfillment]
from cte group by BUSINESS_UNIT  
union  

select   'Total' , convert(varchar, sum(sentt)) AS SURVEYS_SENT,
case when sum(NS_Completed) > 0 then sum(NS_Completed) else NULL end as [Non Staffing SURVEY_RECEIVED],
case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(AVR_NS) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) as decimal(18,2))) 
    else NULL end AS [Non Staffing Average CSAT Score],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(OE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing OverAll Experience],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TA) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Timeline Adherence],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(QD) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Quality of Delivery],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TR) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Timely Resource Fulfillment],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(RM) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Risk Management & Responsiveness],

case when sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TL) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID in (8,9,14,15,16) then NS_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Non Staffing Thought Leadership],

case when sum(S_Completed) > 0 then sum(S_Completed) else NULL end as [Staffing SURVEY_RECEIVED],

case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(AVR_ST) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) as decimal(18,2))) 
    else NULL end AS [Staffing Average CSAT Score],
case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(SOE) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing OverAll Experience],

case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(RC) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing Resource Competency],

case when sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end) > 0 
    then convert(varchar, cast((cast(sum(TRF) as decimal(10,2)) / nullif(sum(case when QUESTION_MODEL_ID IN (10,13) then S_Completed else 0 end),0)) * 100 as decimal(18,2)))+'%' 
    else NULL end AS [Staffing Timely Resource Fulfillment]
from cte2   
END

GO


IF NOT exists (select 1 from REPORTS_SP_DETAILS WHERE SP_NAME='dbo.report_getPCSATAccountLevelReport')   
BEGIN
insert into REPORTS_SP_DETAILS values('dbo.report_getPCSATAccountLevelReport', 'PCSAT Survey - Account Level Summary Report', 'BAS')
END

GO

declare @report_sp_id int
set @report_sp_id = (select top 1 ID from REPORTS_SP_DETAILS where SP_NAME='dbo.report_getPCSATAccountLevelReport')

IF NOT exists (select 1 from REPORTS_PARAMS WHERE REPORT_SP_ID= @report_sp_id)   
BEGIN
insert into REPORTS_PARAMS values(@report_sp_id, 'StartDate', 'DATE','2025-07-01')
insert into REPORTS_PARAMS values(@report_sp_id, 'EndDate', 'DATE','2025-12-31')
insert into REPORTS_PARAMS values(@report_sp_id, 'Customer', 'CUSTOMERID','-1')
END

GO

IF EXISTS(Select 1 from sys.objects where name ='report_getPCSATAccountLevelReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[report_getPCSATAccountLevelReport]
END
GO

 CREATE PROCEDURE [dbo].[report_getPCSATAccountLevelReport]            
             
@STARTDATE datetime,      
@ENDDATE datetime ,
@CUSTOMER varchar(max)='0'
                                                                                                                               
AS                                                
BEGIN    
 
 
 ;with cte as
(
select  c.cust_id,cust_nm,  PROJ_DM_EMP_ID,  case when bc.status in ('Mail Sent','Mail Re-sent','completed') then 1 else 0 end as Sentt, case when bc.status ='completed' then 1 else 0 end as Completed ,
isnull((select   avg(  isnull(rating,0))      from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'criteria' and PERSPECTIVE ='Overall Experience' ),0) AVR, bc.id,
bc.PREDICTED_SCORE, case when PREDICTED_SCORE is null then 0 else 1 end PS_CNT,p.BUSINESS_UNIT 
from css_batch_customers bc 
inner join customer c on c.cust_id = bc.cust_id 
inner join project p on p.proj_id = bc.PROJ_ID
inner join CSS_BATCHES b on b.ID = bc.BATCH_ID
where  (b.START_DATE BETWEEN @StartDate AND @EndDate                          
OR b.END_DATE BETWEEN @StartDate AND @EndDate)
and b.ISACTIVE=1
and bc.ISACTIVE = 1   
and bc.status in ('mail sent', 'mail re-sent', 'completed' )
AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))  

)

select   BUSINESS_UNIT as [Business Unit],cust_nm as [Account],
sum(sentt) as [No. of Surveys Sent], sum(completed) as [No. of Surveys Received],
cast (case when sum(PS_CNT) > 0 then cast(sum(  predicted_score) as decimal(10,2))/ sum(PS_CNT) else 0 end   as decimal(18,2))  as [Avg. Prediction for Received Survey]
, cast (  case when sum(completed) > 0 then cast(  sum(  avr) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))  as [Avg. of Actual Score]
,convert(varchar, case when sum(sentt) = 0 then  0  else  cast( cast(sum(completed) as decimal(10,2))*100/sum(sentt) as decimal(10,2)) end) +'%' as [Response Rate]
from cte  group by cust_nm,BUSINESS_UNIT order by [Business Unit],[Account]

END

GO