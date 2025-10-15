
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
insert into REPORTS_PARAMS values(@report_sp_id, 'StartDate', 'Date','2025-04-01')
insert into REPORTS_PARAMS values(@report_sp_id, 'EndDate', 'Date','2025-09-30')
insert into REPORTS_PARAMS values(@report_sp_id, 'Customer', 'CUSTOMERID','-1')
END


declare @report_sp_id2 int
set @report_sp_id2 = (select top 1 ID from REPORTS_SP_DETAILS where SP_NAME='dbo.getACSAT_AccountSummaryReport')

IF NOT exists (select 1 from REPORTS_PARAMS WHERE REPORT_SP_ID= @report_sp_id2)
BEGIN
insert into REPORTS_PARAMS values(@report_sp_id2, 'StartDate', 'Date','2025-04-01')
insert into REPORTS_PARAMS values(@report_sp_id2, 'EndDate', 'Date','2025-09-30')
insert into REPORTS_PARAMS values(@report_sp_id2, 'Customer', 'CUSTOMERID','-1')
END
