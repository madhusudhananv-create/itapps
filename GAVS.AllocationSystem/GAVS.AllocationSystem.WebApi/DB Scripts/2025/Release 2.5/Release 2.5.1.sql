
IF EXISTS(Select 1 from sys.objects where name ='reports_getACSATCustomerSucessSurvey' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getACSATCustomerSucessSurvey] 
END
GO
--[reports_getACSATCustomerSucessSurvey] '2025-4-1', '2025-9-30'        
CREATE PROCEDURE [dbo].[reports_getACSATCustomerSucessSurvey]                 
@STARTDATE DATETIME,                      
@ENDDATE DATETIME,
@CUSTOMER varchar(max)='0'
                
AS
BEGIN
                
SET @STARTDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@STARTDATE, 111 ) + ' 00:00:00', 111)                      
SET @ENDDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@ENDDATE, 111 ) + ' 23:59:59', 111)                      
SELECT C.CUST_NM,          
CSS.STATUS,                      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS [CSS SENT DATE],                      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS [CSS RECEIVED DATE], 

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.DP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [CSM NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.DP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [CSM MAIL],

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_AM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [ACCOUNT MANAGER NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_AM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [ACCOUNT MANAGER MAIL],

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [BU HEAD NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [BU HEAD MAIL],

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [DP NAME],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [DP MAIL],

CSS.DISPLAY_NAME as [CUSTOMER NAME],
CSS.EMAIL_ID as [CUSTOMER MAIL],                      
[YEAR - QUARTER] =  ( case when frequency='Annual' then  frequency  + ' - ' + Convert(varchar,  Year) else
(select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ) end ),  
CASE When predicted_score is null then '-' else convert(varchar, convert(int,predicted_score)) end as [PREDICTED SCORE],
[ACTUAL SCORE] = (select top 1 RATING from CSS_QUESTION_REPLIES where BATCH_CUSTOMER_ID = css.ID and QUESTION_CATEGORY = 'NPS' and PERSPECTIVE = 'Net Promoter Score' ),
C.BUSINESS_UNIT AS [BUSINESS UNIT],
C.CUST_ID, 
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where ',' + spoc + ',' like '%,' + e.email_id + ',%' FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC] 
FROM CSS_BATCH_CUSTOMERS CSS       
inner join CSS_QUESTION_MODELS cq on cq.id=css.QUESTION_MODEL_ID
INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE   AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
left JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID  
left join EMP_INFO e on p.PROJ_DM_EMP_ID = e.EMP_ID

WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')    and css.ISACTIVE =1     
and  (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  )                    
order by C.CUST_NM, P.PROJ_ID                      


END
GO



IF EXISTS(Select 1 from sys.objects where name ='getACSAT_AccountSummaryReport' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getACSAT_AccountSummaryReport] 
END
GO
CREATE PROCEDURE [dbo].[getACSAT_AccountSummaryReport]            
           
@STARTDATE datetime,    
@ENDDATE datetime,
@CUSTOMER varchar(max)='0'  
                                                                                                                             
AS                                              
BEGIN  
;with cte as
(
select    ISNULL(p.BUSINESS_UNIT, (SELECT TOP 1 BUSINESS_UNIT FROM project WHERE cust_id = c.cust_id AND PROJ_STATUS !='close')) AS BUSINESS_UNIT
,c.cust_id,cust_nm,
case when status in ('Mail Sent','Mail Re-sent','completed') then 1 else 0 end as Sentt, 
case when status ='completed' then 1 else 0 end as Completed ,

case when bc.PREDICTED_SCORE in(9,10) then 'Promoter' end as [NPS_Promotor],
case when  bc.PREDICTED_SCORE in(7,8) then 'Passive'  end as [NPS_Passive],
case when  bc.PREDICTED_SCORE >=0 and  bc.PREDICTED_SCORE <=6 then 'Detractor' end as [NPS_Detractor] ,

case when bc.PREDICTED_SCORE in(9,10) and bc.STATUS='Completed' then 'Promoter'  end as [NPS_R_Promotor],
case when  bc.PREDICTED_SCORE in(7,8) and bc.STATUS='Completed'then 'Passive'  end as [NPS_R_Passive],
case when  bc.PREDICTED_SCORE >=0 and  bc.PREDICTED_SCORE <=6 and bc.STATUS='Completed' then 'Detractor' end as [NPS_R_Detractor] ,

case when (select isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') in (9,10)
then 'NPS_Actual_Promotor' end as [NPS_Actual_Promotor],
case when (select isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') in (7,8)
then 'NPS_Actual_Passive' end  as [NPS_Actual_Passive],
case when (select isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') >= 0 
     and (select isnull(rating,0) from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'NPS' and PERSPECTIVE ='Net Promoter Score') <= 6
then 'NPS_Actual_Detractor' end  as [NPS_Actual_Detractor],
isnull((select   avg(isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'Criteria' and PERSPECTIVE ='Meeting Delivery Commitments' ),0) AVR_DC, 
isnull((select   avg(isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'Criteria' and PERSPECTIVE ='Customer Engagement and Relationship' ),0) AVR_CE, 
isnull((select   avg(isnull(rating,0))   
from CSS_QUESTION_REPLIES where batch_customer_id =bc.id and question_category = 'Criteria' and PERSPECTIVE ='Partner adding value to Customer Business' ),0) AVR_PC, 
bc.id,bc.predicted_score,bc.SPOC,

(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [Delivery Partner],

(SELECT TOP 1 e.EMAIL_ID FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY EMAIL_ID ORDER BY COUNT(EMAIL_ID) DESC) as [Delivery Partner Email Id]

from css_batch_customers bc 
inner join customer c on c.cust_id = bc.cust_id 
left join project p on p.proj_id = bc.PROJ_ID 
left join EMP_INFO e on p.PROJ_DM_EMP_ID = e.EMP_ID
where   batch_id in (select id from css_batches where [START_DATE] = @STARTDATE and [END_DATE] = @ENDDATE) and bc.ISACTIVE=1
and (@CUSTOMER='0' or  c.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')) )
and bc.status in ('mail sent', 'mail re-sent', 'completed' ) 
),
SPOC_Aggregation AS
(
    SELECT 
        CUST_ID,cust_nm,
        STUFF((
            SELECT DISTINCT ', ' + e.frst_nm 
            FROM EMP_INFO e 
            WHERE e.email_id IN (SELECT SPOC FROM cte c2 WHERE c2.cust_id = cte.CUST_ID)
            FOR XML PATH('')
        ), 1, 2, '') AS [CSAT SPOC]
    FROM cte
    GROUP BY CUST_ID,CUST_NM
),
Score_Calculation as(
select    BUSINESS_UNIT,cust_nm as [ACCOUNT] ,
convert(varchar, sum(sentt)) AS SURVEYS_SENT,
case when sum(completed) > 0 then sum(completed) else 0 end AS SURVEY_RECEIVED,
convert(varchar, case when sum(sentt) = 0 then  0  else  cast( cast(sum(completed) as decimal(10,2))*100/nullif(sum(sentt),0) as decimal(10,2)) end)+'%' AS [RESPONSE_RATE(%)] ,
cast((count(NPS_Promotor) * 100.0 / NULLIF(sum(sentt), 0)) as decimal(10,2)) - 
cast((count(NPS_Detractor) * 100.0 / NULLIF(sum(sentt), 0)) as decimal(10,2)) AS [Predicted NPS for All Respondents],

cast(case when sum(completed) > 0 then (count(NPS_R_Promotor)   * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) - 
cast(case when sum(completed) > 0 then (count(NPS_R_Detractor) * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) AS [Predicted NPS for Received Responses],

cast(case when sum(completed) > 0 then (count(NPS_Actual_Promotor) * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) - 
cast(case when sum(completed) > 0 then (count(NPS_Actual_Detractor) * 100.0 / nullif(sum(completed),0)) else 0 end as decimal(10,2)) AS [Actual NPS],

convert(varchar, cast(  case when sum(completed) > 0 then cast(  sum(AVR_DC) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))) AS [Average of Delivery Commitment],
convert(varchar, cast(  case when sum(completed) > 0 then cast(  sum(AVR_CE) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))) AS [Average of Customer Engagement and Relationship],
convert(varchar, cast(  case when sum(completed) > 0 then cast(  sum(AVR_PC) as decimal(10,2))/ sum(completed) else 0 end   as decimal(18,2))) AS [Average of Partner adding value to Customer Business]
, [Delivery Partner]
,[Delivery Partner Email Id]
   
from cte  
group by cust_id, cust_nm,BUSINESS_UNIT,[Delivery Partner],[Delivery Partner Email Id])


SELECT 
    a.*,
    s.[CSAT SPOC]
FROM Score_Calculation a
INNER JOIN SPOC_Aggregation s ON a.ACCOUNT = s.cust_nm
ORDER BY BUSINESS_UNIT, [ACCOUNT];
END

GO


IF NOT exists (select 1 from REPORTS_SP_DETAILS WHERE SP_NAME='dbo.reports_getACSATCustomerSucessSurvey')   
BEGIN
insert into REPORTS_SP_DETAILS values('dbo.reports_getACSATCustomerSucessSurvey', 'ACSAT Survey Status Report', 'BAS')
END

IF NOT exists (select 1 from REPORTS_SP_DETAILS WHERE SP_NAME='dbo.getACSAT_AccountSummaryReport')   
BEGIN
insert into REPORTS_SP_DETAILS values('dbo.getACSAT_AccountSummaryReport', 'ACSAT Account Level Summary Report', 'BAS')
END

declare @report_sp_id int
set @report_sp_id = (select top 1 ID from REPORTS_SP_DETAILS where SP_NAME='dbo.reports_getACSATCustomerSucessSurvey')

IF NOT exists (select 1 from REPORTS_PARAMS WHERE REPORT_SP_ID= @report_sp_id)   
BEGIN
insert into REPORTS_PARAMS values(@report_sp_id, 'StartDate', 'DATE','2025-04-01')
insert into REPORTS_PARAMS values(@report_sp_id, 'EndDate', 'DATE','2025-09-30')
insert into REPORTS_PARAMS values(@report_sp_id, 'Customer', 'CUSTOMERID','-1')
END


declare @report_sp_id2 int
set @report_sp_id2 = (select top 1 ID from REPORTS_SP_DETAILS where SP_NAME='dbo.getACSAT_AccountSummaryReport')

IF NOT exists (select 1 from REPORTS_PARAMS WHERE REPORT_SP_ID= @report_sp_id2)
BEGIN
insert into REPORTS_PARAMS values(@report_sp_id2, 'StartDate', 'DATE','2025-04-01')
insert into REPORTS_PARAMS values(@report_sp_id2, 'EndDate', 'DATE','2025-09-30')
insert into REPORTS_PARAMS values(@report_sp_id2, 'Customer', 'CUSTOMERID','-1')
END


IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Halfyearly' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Halfyearly]
END
GO

/****** Object:  StoredProcedure [dbo].[reports_CSAT_Halfyearly]    Script Date: 15-10-2025 15:04:52 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
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
[YEAR - QUARTER]  = case when frequency='Annual' then  frequency  + ' - ' + Convert(varchar,  Year) else 'H' + CASE     
        WHEN bt.sequence IN (1 ) THEN '1'    
        WHEN bt.sequence IN (2) THEN '2'    
    END + ' - ' + CONVERT(varchar, bt.Year) end,                     
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
(SELECT TOP 1 e.FRST_NM FROM project p 
join EMP_INFO e on e.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where p.cust_id =c.CUST_ID and isnull(proj_status,'') != 'Close' GROUP BY FRST_NM ORDER BY COUNT(FRST_NM) DESC) as [BU HEAD NAME],               
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
c.BUSINESS_UNIT AS [BUSSINESS UNIT],                          
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
left JOIN project p                          
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
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1 and bt.FREQUENCY in('Half-Yearly','Annual')                     
AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
and (@CUSTOMER='0' or  c.CUST_ID in	(SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))
                  
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
ORDER BY [YEAR - QUARTER], [Customer Name];                          
    
    
                        
END 

GO


IF EXISTS(Select 1 from sys.objects where name ='getCSSTableForPeriod1' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForPeriod1]
END
GO


CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]                
              
@startDate varchar(10),                                              
@endDate varchar(10),                                              
@custIds varchar(max)='-1',                  
@csmIds varchar(max)='-1',      
@frequency varchar(100) ='Both'      
              
AS                
BEGIN                                            
                                                     
;With NonPremierAccounts AS (                                                    
                                                    
select distinct CB.CUST_ID , P.PROJ_ID,isnull( P.PROJ_NM, c.CUST_NM) as proj_nm, isnull( CT.CONTACT_NAME, cb.DISPLAY_NAME) as CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                              
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20)) +'/'+P.PROJ_ID+'/true'  , r1.CREATED_DATE, r1.batch_customer_id,RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)           
  
    
,      
case when b.FREQUENCY ='Annual' then '(A)' when b.frequency ='Quarterly' then '(Q)' else '(H)' end as Frequency      
                      
FROM [CSS_BATCH_CUSTOMERS] CB  (NOLOCK)      
inner join customer  C on c.cust_id = cb.CUST_ID
                            
INNER JOIN CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1                                
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and PERSPECTIVE in( 'Overall Experience','Meeting Delivery Commitments') and R1.ISACTIVE = 1                                
LEFT JOIN CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                                
LEFT join CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1   
OUTER APPLY (
    SELECT TOP 1 PROJ_ID, PROJ_NM, PROJ_STATUS,PROJ_DM_EMP_ID
    FROM PROJECT
    WHERE ((PROJ_ID = CB.PROJ_ID AND B.FREQUENCY != 'Annual')  OR 
        (CUST_ID = CB.CUST_ID AND B.FREQUENCY = 'Annual'))
--left JOIN PROJECT P (NOLOCK) on  ( (p.proj_id = CB.proj_id  and b.frequency!= 'Annual')     or (cb.cust_id = p.cust_id and  b.frequency = 'Annual') ) and isnull(p.proj_status,'') != 'close' 
 AND ISNULL(PROJ_STATUS, '') != 'close'
) P
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                                
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                                         
AND (@csmIds ='-1' OR P.PROJ_DM_EMP_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))                            
AND (@frequency ='Both' or b.frequency = @frequency)      
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
  on PA.BATCH_CUSTOMER_ID = BC.ID and (PA.SOURCE like  'CSS%' or PA.SOURCE like '%Customer Success Survey%'
  or PA.SOURCE like '%Account Customer Satisfaction Survey%'
  ) and PA.ISACTIVE = 1                                         
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
  Where PA.Status in ('In Progress','Open') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                                   
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
  Where PA.Status in ('In Progress','Open') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                       
              
  FROM                                         
  PremierAccount A Where A.RN = 1                                                     
  order by RESPONDENT_NAME                                  
                                  
END     


