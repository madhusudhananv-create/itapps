
IF NOT EXISTS (SELECT * FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Qualitative Feedback')
BEGIN
INSERT INTO CSS_QUESTION_MODELS values ('Qualitative Feedback','CSAT Related questions','104859',GETDATE(),'104859',GETDATE(),1)
END
GO

IF NOT EXISTS (SELECT * FROM CSS_QUESTION_MASTER WHERE QUESTION='Overall experience from service delivery provided')
BEGIN
declare @modelId int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Qualitative Feedback')
INSERT INTO CSS_QUESTION_MASTER values 
(@modelId,'Criteria','Overall experience from service delivery provided','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL),
(@modelId,'Others','What do you see as the strength?','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL),
(@modelId,'Others','Your recommendations on areas that we should improve or change','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL)
END
GO

Declare @RESOURCEID int = 118
Declare @EMPID varchar(10) = '104859'
Declare @RescourceName varchar(250) = 'View CSAT -> CSAT Qualitative Feedback'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForPeriod1' AND TYPE='P')
BEGIN
       DROP PROCEDURE getCSSTableForPeriod1
END
GO

CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]  

@startDate varchar(10),                                
@endDate varchar(10),                                
@custIds varchar(max)='-1',    
@csmIds varchar(max)='-1'  

AS  
BEGIN                              
                                       
;With NonPremierAccounts AS (                                      
                                      
select CB.CUST_ID , P.PROJ_ID,P.PROJ_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20)) +'/'+P.PROJ_ID+'/true'  , r1.CREATED_DATE, r1.batch_customer_id,RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)        
        
        
FROM [CSS_BATCH_CUSTOMERS] CB  (NOLOCK)                
INNER JOIN PROJECT P (NOLOCK) on p.proj_id = CB.proj_id                  
INNER JOIN CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1                  
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1                  
INNER JOIN CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                  
LEFT join CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1                  
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                  
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                           
AND (@csmIds ='-1' OR p.PROJ_DM_EMP_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))              
),                                   
                                      
PremierAccount As (                                      
select CB.CUST_ID , 'Premier' as CUST_NM, P.PROJ_ID, P.PROJ_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='{SUBSTITUE_URL}/CustomerSuccessSurvey/'+ r1.SURVEY_ID,                
ActionplanURL ='{SUBSTITUE_URL}/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20))+'/0/true', r1.CREATED_DATE, r1.batch_customer_monthly_id,                  
RN = row_number() OVER(partition by CB.EMAIL_ID, cB.ID, r1.SURVEY_ID ORDER BY cb.id desc, r1.rating )  , pp.id as PROD_ID,    
pp.PRODUCT_TITLE as PROD_NM                
FROM [CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)                   
INNER JOIN CSS_BATCH_monthly B (NOLOCK) ON B.ID = CB.BATCH_MONTHLY_ID and B.ISACTIVE = 1                  
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1                  
INNER JOIN CONTACTS CT (NOLOCK)  on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                  
LEFT JOIN CSS_QUESTION_REPLIES R2 (NOLOCK) on R2.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and R2.ISACTIVE = 1                  
LEFT JOIN PROJECT P ON CB.PROJ_ID = P.PROJ_ID        
LEFT JOIN PORTFOLIO_PRODUCTS pp on cb.PROD_ID = pp.ID    
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )                   
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))                  
AND (@csmIds ='-1' OR ( @csmIds !='-1' AND CB.cust_id in (select cust_id from PROJECT where  PROJ_DM_EMP_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))))              
),                  
                  
 ActionItem AS (                  
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from                              
  PROJECT_ACTIONITEM PA (NOLOCK)                             
  join                         
  CSS_BATCH_CUSTOMERS BC  (NOLOCK)                           
  on PA.BATCH_CUSTOMER_ID = BC.ID and PA.SOURCE = 'CSS' and PA.ISACTIVE = 1                           
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID             
  join                           
  CSS_BATCHES B (NOLOCK) ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED'                
  and ((B.START_DATE                     
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))                  
  Where PA.Status not in ('Cancelled','Suspended')                  
)                             
                
 SELECT A.PROJ_ID [PROJECT_ID], A.CUST_ID [CUSTOMER_ID],                                      
 A.CONTACT_NAME RESPONDENT_NAME,                                           
  A.CONTACT_NAME + ' - ' + A.PROJ_NM as [DISPLAY_TEXT] , A.MIN_SCORE,A.NPS_SCORE,Null as CSS_SCORE,A.URL,    ActionplanURL,                          
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),                  
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA                   
  Where PA.Status in ('Planned','Started') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)                     
  FROM                   
  NonPremierAccounts A Where A.RN = 1                    
                    
  UNION                         
                    
  SELECT                                              
   '0' [PROJECT_ID], A.CUST_ID [CUSTOMER_ID]                                 
  , A.CONTACT_NAME RESPONDENT_NAME                  
  , CASE     
  WHEN A.PROJ_ID IS not null  THEN A.CONTACT_NAME +' - ' + A.PROJ_NM       
  WHEN A.PROD_ID IS not null  THEN A.CONTACT_NAME +' - ' + A.PROD_NM        
    ELSE A.CONTACT_NAME +' - ' + A.CUST_NM           
 END as [DISPLAY_TEXT]        
  , null MIN_SCORE ,A.NPS_SCORE,A.MIN_SCORE as CSS_SCORE,A.URL,   ActionplanURL,                  
  null as [ACTION_PLAN_SUBMITTED],null as [ACTION_PLAN_NOT_SUBMITTED]                  
  FROM                           
  PremierAccount A Where A.RN = 1                                       
  order by RESPONDENT_NAME                    
                    
END 
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMERS' AND COLUMN_NAME='ENTERED_BY')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMERS ADD ENTERED_BY varchar(50) NULL
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMER_MONTHLY' AND COLUMN_NAME='ENTERED_BY')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMER_MONTHLY ADD ENTERED_BY varchar(50) NULL
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_update_CSSBatchCustomers' AND TYPE='P')
BEGIN
       DROP PROCEDURE usp_update_CSSBatchCustomers
END
GO

CREATE PROCEDURE [dbo].[usp_update_CSSBatchCustomers] 

@ID int,   
@SURVEY_ID int,   
@SURVEY_SENT_DATE DateTime,   
@SURVEY_RECEIVED_DATE DateTime = NULL,  
@STATUS varchar(100),
@EMP_ID varchar(100) = NULL,
@MEETING_DATE DateTime = NULL,
@IS_CSM_NOTIFIED bit = NULL

AS  
BEGIN  
SET NOCOUNT ON;  

UPDATE CSS_BATCH_CUSTOMERS SET   
SURVEY_ID = @SURVEY_ID,  
SURVEY_SENT_DATE = @SURVEY_SENT_DATE,  
SURVEY_RECEIVED_DATE = @SURVEY_RECEIVED_DATE,  
[STATUS] = @STATUS,
[ENTERED_BY] = @EMP_ID,
[MEETING_DATE] = @MEETING_DATE,
[CSM_NOTIFIED] = @IS_CSM_NOTIFIED
WHERE ID = @ID  
  
UPDATE CSS_SURVEY_ITERATION SET   
[STATUS] = @STATUS  
WHERE ID = @SURVEY_ID 

END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_update_CSSBatchCustomersMonthly' AND TYPE='P')
BEGIN
       DROP PROCEDURE usp_update_CSSBatchCustomersMonthly
END
GO

CREATE PROCEDURE [dbo].[usp_update_CSSBatchCustomersMonthly]  

@ID int,    
@SURVEY_ID int,    
@SURVEY_SENT_DATE DateTime,    
@SURVEY_RECEIVED_DATE DateTime null,  
@STATUS varchar(100),  
@EMP_ID varchar(100) = NULL,
@MEETING_DATE DateTime = NULL,
@IS_CSM_NOTIFIED bit = NULL

AS  
BEGIN  

SET NOCOUNT ON;  
   
UPDATE CSS_BATCH_CUSTOMER_MONTHLY SET    
SURVEY_ID = @SURVEY_ID,  
SURVEY_SENT_DATE = @SURVEY_SENT_DATE,  
SURVEY_RECEIVED_DATE = @SURVEY_RECEIVED_DATE,  
[STATUS] = @STATUS,
[ENTERED_BY] = @EMP_ID,
[MEETING_DATE] = @MEETING_DATE,
[CSM_NOTIFIED] = @IS_CSM_NOTIFIED

WHERE ID = @ID  
   
UPDATE CSS_SURVEY_ITERATION SET    
[STATUS] = @STATUS  
WHERE ID = @SURVEY_ID  

END
GO

Declare @RESOURCEID int = 116
Declare @EMPID varchar(10) = '105709'
Declare @RescourceName varchar(250) = 'Project > Planner > Task Planner'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


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
	CASE
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')
        THEN 'Improvement Plan submission Overdue'
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')
        THEN 'Improvement Plan Completion Overdue'
    ELSE pa.status 
END AS [Action Item Status],

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
CASE
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')
        THEN 'Improvement Plan submission Overdue'
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')
        THEN 'Improvement Plan Completion Overdue'
    ELSE pa.status 
END AS [Action Item Status],  
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



Declare @RESOURCEID int = 117
Declare @EMPID varchar(10) = '105709'
Declare @RescourceName varchar(250) = 'CSAT -> Send Survey Request Mails to customer'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_LINK_VALIDITY_DAYS')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_LINK_VALIDITY_DAYS',  
    '20',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO


IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_REMINDER_VALIDITY_DAYS')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_REMINDER_VALIDITY_DAYS',  
    '7',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO


IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMERS' AND COLUMN_NAME='MEETING_DATE')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMERS ADD MEETING_DATE DATETIME NULL
ALTER TABLE CSS_BATCH_CUSTOMERS ADD CSM_NOTIFIED bit NULL
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMER_MONTHLY' AND COLUMN_NAME='MEETING_DATE')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMER_MONTHLY ADD MEETING_DATE DATETIME NULL
ALTER TABLE CSS_BATCH_CUSTOMER_MONTHLY ADD CSM_NOTIFIED bit NULL
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME='PLANNED_ACTUAL_DATE')
BEGIN
ALTER TABLE PROJECT_ACTIONITEM ADD PLANNED_TARGET_DATE DATETIME NULL
ALTER TABLE PROJECT_ACTIONITEM ADD PLANNED_ACTUAL_DATE DATETIME NULL
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getActionItemsViewDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE getActionItemsViewDetails
END
GO

CREATE PROCEDURE [dbo].[getActionItemsViewDetails]                  
  
@PROJIDS VARCHAR(MAX)                  
    
AS                  
BEGIN                  
                
SELECT DISTINCT P.CUST_ID AS CUST_ID, [PROJECT_ID] AS PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, PF.TITLE AS PORTFOLIO_NAME, A.ORIGINAL_DESCRIPTION,   
A.ID AS ACTION_ITEM_ID, A.RAG, A.DESCRIPTION, A.SOURCE, A.source_description, A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,
A.PLANNED_TARGET_DATE, A.PLANNED_ACTUAL_DATE,
A.PRIORITY, A.COMPLETION_DATE, A.COMMENTS, A.CREATED_DATE, A.CREATED_BY, A.UPDATED_BY, A.UPDATED_DATE,                  
                  
CASE WHEN (A.TARGET_DATE < GETDATE() AND A.STATUS  IN ('Planned' , 'Started', 'Identified')) THEN 'PAST_DUE_DATE'            
WHEN  (A.TARGET_DATE >= GETDATE() AND A.STATUS  IN ('Planned' , 'Started',  'Identified')) THEN 'DUE_FOR_CLOSURE'            
            
END  AS STATUS_TYPE, A.ISACTIVE                  
FROM [PROJECT_ACTIONITEM] A                  
                  
INNER JOIN PROJECT P ON a.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,',')) AND A.ISACTIVE = 1             
LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJECT_ID                  
LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID                  
              
ORDER BY A.IDENTIFIED_DATE desc     
  
END  
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE reports_CSAT_Combined
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
CASE  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')  
THEN 'Improvement Plan submission Overdue'  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')  
THEN 'Improvement Plan Completion Overdue'  
ELSE pa.status   
END AS [Action Item Status],  
  
PA.description as [Action Item Description],    
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
c.Cust_ID AS [Customer_ID]     

  
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
CASE  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')  
THEN 'Improvement Plan submission Overdue'  
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')  
THEN 'Improvement Plan Completion Overdue'  
ELSE pa.status   
END AS [Action Item Status],    
PA.description as [Action Item Description],    
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
c.Cust_ID AS [Customer_ID]    

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

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSActionitem' AND TYPE='P')
BEGIN
       DROP PROCEDURE getCSSActionitem
END
GO

CREATE PROCEDURE getCSSActionitem     
    
@STARTDATE datetime,    
@ENDDATE datetime     
    
AS            
    
BEGIN         
    
select C.CUST_NM as ACCOUNT,P.PROJ_NM as PROJECT,CB.DISPLAY_NAME as CUSTOMER,E.FRST_NM as PROJECT_MANAGER,CB.EMAIL_ID as CUSTOMER_MAIL,    
SOURCE as SOURCE_CATEGORY, SOURCE_DESCRIPTION,   
FORMAT(CB.SURVEY_SENT_DATE,'yyyy-MM-dd') as SURVEY_SENT_DATE,FORMAT(CB.SURVEY_RECEIVED_DATE,'yyyy-MM-dd') as SURVEY_RECEIVED_DATE,    
PA.DESCRIPTION as ACTION_PLAN_DESCRIPTION, PA.STATUS,    
FORMAT(PA.IDENTIFIED_DATE,'yyyy-MM-dd') as IDENTIFIED_DATE,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,  
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,
PA.BATCH_CUSTOMER_MONTHLY_ID,PA.PROJECT_ID,PA.CUSTOMER_ID    
    
from PROJECT_ACTIONITEM PA     
inner join PROJECT P on P.PROJ_ID = PA.PROJECT_ID    
inner join CUSTOMER C on C.CUST_ID = PA.CUSTOMER_ID    
inner join CSS_BATCH_CUSTOMER_MONTHLY CB on CB.ID = PA.BATCH_CUSTOMER_MONTHLY_ID    
inner join EMP_INFO E on E.EMP_ID = P.PROJ_PM_EMP_ID    
    
where PA.CUSTOMER_ID = '212100001' and PA.ISACTIVE=1 and CB.ISACTIVE=1 and PA.IDENTIFIED_DATE between @STARTDATE and @ENDDATE    
order by PA.IDENTIFIED_DATE,PROJECT,CUSTOMER desc    
    
END    
GO
