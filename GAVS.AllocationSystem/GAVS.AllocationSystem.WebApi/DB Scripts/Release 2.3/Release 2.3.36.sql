
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallRisksForRiskDashboard' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallRisksForRiskDashboard]
END
GO

CREATE PROCEDURE [dbo].[getOverallRisksForRiskDashboard]                            
    
@startDate date = null,    
@endDate date = null,                  
@custIds varchar(max),    
@riskStatus varchar(max),    
@projIds varchar(max)=null,  
@businessUnits varchar(max)  
  
AS  
  
BEGIN        

Select C.CUST_NM,P.PROJ_NM,PR.DESCRIPTION,PR.IMPACT,PR.PROBABILITY_SCALE,PR.IMPACT_SCALE,    
CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate'     
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END AS RISK_LEVEL,    
PR.OWNER,PR.AREA,PR.IDENTIFIED_BY,PR.IDENTIFIED_DATE,PR.RISK_TREATMENT_STRATEGY,PR.TARGET_DATE,PR.STATUS,    
PR.ACTION_TAKEN,P.BUSINESS_UNIT,C.CUST_ID,P.PROJ_ID,PR.ID    
from       
PROJECT_RISK PR  (NOLOCK)          
inner join PROJECT p (NOLOCK) on PR.PROJECT_ID = P.PROJ_ID  and ISNULL(P.PROJ_STATUS ,'') != 'Close'    
inner join CUSTOMER c  (NOLOCK) on P.CUST_ID = C.CUST_ID    
      
WHERE 
    (@startdate IS NULL OR PR.IDENTIFIED_DATE > @startdate) AND (@enddate IS NULL OR PR.IDENTIFIED_DATE< @enddate)
AND PR.ISACTIVE=1 
AND (@custIds = '-1' OR C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))      
AND (@riskStatus = '-1' OR PR.STATUS in (SELECT * FROM [DBO].[FN_SPLITSTRING](@riskStatus,',')))      
AND (@businessUnits = '-1' OR P.BUSINESS_UNIT in (SELECT * FROM [DBO].[FN_SPLITSTRING](@businessUnits,',')))    
AND (ISNULL(@projIds,'-1') = '-1' OR P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,',')))      
order by C.CUST_NM,PR.IDENTIFIED_DATE DESC     

END    
GO

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

IF NOT EXISTS(SELECT 1 FROM CONFIGURATION_EXT WHERE [KEY] ='FINDINGS_CAP_APPROVERS')
BEGIN
INSERT INTO CONFIGURATION_EXT VALUES('FINDINGS_CAP_APPROVERS','101566,105848','-1',NULL, NULL, 0,1,NULL,NULL,NULL,'104859',GETDATE(),'104859',GETDATE())
END
GO

Declare @RESOURCEID int = 108
Declare @EMPID varchar(10) = '104849'
Declare @RescourceName varchar(250) = 'SQA Management > Findings'

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
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
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


Declare @RESOURCEID int = 109
Declare @EMPID varchar(10) = '104849'
Declare @RescourceName varchar(250) = 'SQA Management > Findings > CAP Submission'

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
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
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

Declare @RESOURCEID int = 110
Declare @EMPID varchar(10) = '104849'
Declare @RescourceName varchar(250) = 'SQA Management > Findings > CAP Approve/Reject'

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
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
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

Declare @RESOURCEID int = 111
Declare @EMPID varchar(10) = '104849'
Declare @RescourceName varchar(250) = 'SQA Management > Findings > CAP Implementation'

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
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
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


Declare @RESOURCEID int = 112
Declare @EMPID varchar(10) = '104849'
Declare @RescourceName varchar(250) = 'SQA Management > Findings > CAP Verification'

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
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
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

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT' AND COLUMN_NAME='REVENUE_TYPE')
BEGIN
ALTER TABLE PROJECT ADD REVENUE_TYPE VARCHAR(100) NULL
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverAllRisksReport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverAllRisksReport]
END
GO

CREATE procedure  getOverAllRisksReport  

@startDate Datetime,  
@endDate Datetime  

AS  
BEGIN  
  
SELECT C.CUST_NM as Customer, P.PROJ_NM as Project, por.TITLE as Portfolio , r.DESCRIPTION, r.IMPACT as [Business Impact] , 
r.OWNER,  FORMAT(r.IDENTIFIED_DATE, 'dd MMM yyyy') AS IDENTIFIED_DATE,  FORMAT(r.TARGET_DATE, 'dd MMM yyyy') AS TARGET_DATE , r.STATUS, 

CASE WHEN r.PROBABILITY_SCALE = 1 then 'Rare'  
WHEN r.PROBABILITY_SCALE = 2 then 'Remote'  
WHEN r.PROBABILITY_SCALE = 3 then 'Moderate'  
WHEN r.PROBABILITY_SCALE = 4 then 'Likely'  
WHEN r.PROBABILITY_SCALE = 5 then 'Frequent' END AS [LIKELIHOOD],  

CASE WHEN r.IMPACT_SCALE = 1 then 'Insignificant'  
WHEN r.IMPACT_SCALE = 2 then 'Minor'  
WHEN r.IMPACT_SCALE = 3 then 'Significant'  
WHEN r.IMPACT_SCALE = 4 then 'Major'  
WHEN r.IMPACT_SCALE = 5 then 'Critical' END AS [CONSEQUENCES] ,  

CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate'     
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END AS RISK_RATING,

CASE WHEN (convert(varchar,R.TARGET_DATE,112) < convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed' )) THEN 'RISKS_PAST_DUE_DATE'  
WHEN  (convert(varchar,R.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed')) THEN 'RISKS_DUE_FOR_CLOSURE'  
end as STATUS_TYPE  ,  
case when isnull(proj_status, '') != '' then 'Active' else 'Inactive' end AS PROJECT_STATUS  ,  
r.RISK_TREATMENT_STRATEGY ,a.DESCRIPTION as [Risk Treatment Plan / Action Plan],
FORMAT(a.IDENTIFIED_DATE, 'dd MMM yyyy') AS RISK_TREATMENT_PLAN_IDENTIFIED_DATE,  
FORMAT(a.TARGET_DATE, 'dd MMM yyyy') AS RISK_TREATMENT_PLAN_TARGET_DATE ,  
FORMAT(r.ACTUAL_DATE,'dd MMM yyyy') as [Date Occurred / Closed] ,
P.CUST_ID, r.[PROJECT_ID] AS PROJ_ID

FROM PROJECT_RISK r  (NOLOCK)  
inner join project p (NOLOCK)  on p.proj_id =  r.PROJECT_ID and r.ISACTIVE =1   and isnull(p.PROJ_STATUS,'') != 'Close'  
inner join PROJECT_ACTIONITEM a on a.RISK_ID = r.ID  
LEFT OUTER JOIN portfolio_project pp (NOLOCK) on pp.proj_id =  r.PROJECT_ID  
LEFT join portfolio por on por.id = pp.portfolio_id  
INNER JOIN CUSTOMER C (NOLOCK)  
ON C.CUST_ID=P.CUST_ID  
where r.identified_date between @startDate and @endDate  
ORDER BY C.CUST_NM,P.PROJ_NM, IDENTIFIED_DATE desc  

END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_ACTIONITEM' AND COLUMN_NAME='ORIGINAL_DESCRIPTION')
BEGIN
ALTER TABLE PROJECT_ACTIONITEM ADD ORIGINAL_DESCRIPTION VARCHAR(MAX) NULL
END
GO

IF EXISTS(Select 1 from PROJECT_ACTIONITEM where ISACTIVE=1 and DESCRIPTION='To be detailed by PM')
BEGIN
Update PROJECT_ACTIONITEM SET ORIGINAL_DESCRIPTION = 'To be detailed by PM' where ISACTIVE=1 and DESCRIPTION='To be detailed by PM'
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getActionItemsViewDetails' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[getActionItemsViewDetails]
END
GO

CREATE PROCEDURE [dbo].[getActionItemsViewDetails]                

@PROJIDS VARCHAR(MAX)                
  
AS                
BEGIN                
              
SELECT DISTINCT P.CUST_ID AS CUST_ID, [PROJECT_ID] AS PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, PF.TITLE AS PORTFOLIO_NAME, A.ORIGINAL_DESCRIPTION, 
A.ID AS ACTION_ITEM_ID, A.RAG, A.DESCRIPTION, A.SOURCE, A.source_description, A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,     
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
Go


IF NOT EXISTS(SELECT 1 FROM PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE WHERE [KEY] ='PRODUCT PROJECT MANAGER')
BEGIN
INSERT INTO PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE (MANAGEMENT_TYPE, CREATED_BY, CREATED_DATE, UPDATED_BY,UPDATED_DATE,ISACTIVE)
VALUES ('PRODUCT PROJECT MANAGER', 105709, GETDATE(),105709, GETDATE(),1);
END
GO

IF EXISTS(Select 1 from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where  ISACTIVE=1 and ID = 2)
BEGIN
Update PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE SET MANAGEMENT_TYPE = 'PORTFOLIO MANAGER' where  ISACTIVE=1 and ID = 2
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductManagerByProductId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProductManagerByProductId]
END
GO

CREATE PROCEDURE [dbo].[getProductManagerByProductId]                         
   @productId int
AS  
BEGIN  
 -- SET NOCOUNT ON added to prevent extra result sets from  
 -- interfering with SELECT statements.  
 SET NOCOUNT ON;  

 Select PM.PRODUCT_ID,PP.PRODUCT_TITLE ,E.FRST_NM as RESPONSIBLE_NAME, E.EMP_ID as RESPONSIBLE_EMP_ID
 from 
 PRODUCT_RESPONSIBLE PM 
 join 
 PORTFOLIO_PRODUCTS PP on PP.Id = PM.PRODUCT_ID and PP.ISACTIVE = 1 and PM.ISACTIVE = 1
 join 
 EMP_INFO E on E.EMP_ID = PM.EMP_ID
 where PM.PRODUCT_ID = @productId  and PM.MANAGEMENT_TYPE IN (1,8)

 SET NOCOUNT OFF;  
 END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjectContractStatusReport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectContractStatusReport]
END
GO

CREATE proc [dbo].[getProjectContractStatusReport]  
    @CustomerID varchar(25)
as         
begin         
  SELECT c.CUST_NM as Customer,p.PROJ_NM as Project,
  HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y'), 
  e2.FRST_NM +' '+ISNULL(e2.LAST_NM,'') AS Account_Manager,
  e.FRST_NM +' '+ISNULL(e.LAST_NM,'') AS CSM,
  e3.FRST_NM +' '+ISNULL(e3.LAST_NM,'')  as ProjectManager,
  p.START_DATE as StartDate, p.END_DATE as EndDate,
  p.CUST_ID as CustomerId,
  p.PROJ_ID as ProjectId
  FROM project p
  inner join EMP_INFO e (NOLOCK) on e.EMP_ID=p.PROJ_DM_EMP_ID   
  left join EMP_INFO e1 (NOLOCK) on e1.EMP_ID=p.QUALITY_SPOC      
  inner join EMP_INFO e2 (NOLOCK) on e2.EMP_ID=p.PROJ_AM_EMP_ID  
  inner join EMP_INFO e3 (NOLOCK) on e3.EMP_ID=p.PROJ_PM_EMP_ID  
  inner join CUSTOMER c (NOLOCK) on c.CUST_ID=p.CUST_ID     
  
  WHERE p.END_DATE BETWEEN GETDATE() AND DATEADD(month, 3, GETDATE()) and  p.BILL_TYPE=1  and ISNULL(P.PROJ_STATUS ,'') != 'Close' 
  and (@CustomerID='0' or p.CUST_ID = @CustomerID)  order by END_DATE  

END
GO

IF NOT EXISTS(SELECT 1 FROM CONFIGURATION_EXT WHERE [KEY] ='EXCLUSION_ENABLED_CUSTOMERS')
BEGIN
INSERT INTO CONFIGURATION_EXT VALUES('EXCLUSION_ENABLED_CUSTOMERS','212100001,202100121','-1',NULL, NULL, 0,1,NULL,NULL,NULL,'104859',GETDATE(),'104859',GETDATE())
END
GO

IF NOT EXISTS(SELECT 1 FROM CSS_QUESTION_MASTER WHERE QUESTION_CATEGORY = 'NPS' and MODEL_ID = 4)
BEGIN
INSERT INTO CSS_QUESTION_MASTER VALUES ( 4,'NPS','How likely is that you would recommend GAVS to your friend / acquaintance who wishes to avail IT services?',GETDATE(),'104859',GETDATE(),'104859',GETDATE(),1, NULL)
INSERT INTO CSS_QUESTION_MASTER VALUES ( 5,'NPS','How likely is that you would recommend GAVS to your friend / acquaintance who wishes to avail IT services?',GETDATE(),'104859',GETDATE(),'104859',GETDATE(),1, NULL)
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='LOCATION' AND type='U')
BEGIN

CREATE TABLE LOCATION
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	LOCATION_NAME varchar(200) NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='RISK_CATEGORY' AND type='U')
BEGIN

CREATE TABLE RISK_CATEGORY
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	CATEGORY varchar(200) NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_RISK' AND COLUMN_NAME='RISK_CATEGORY')
BEGIN

ALTER TABLE PROJECT_RISK ADD RISK_CATEGORY VARCHAR(100) NULL

ALTER TABLE PROJECT_RISK ADD LOCATION VARCHAR(100) NULL

ALTER TABLE PROJECT_RISK ADD RISK_RATING int NULL

ALTER TABLE PROJECT_RISK ADD RISK_LEVEL VARCHAR(100) NULL

ALTER TABLE PROJECT_RISK ADD NEW_CONSEQUENCES_SCALE int NULL

ALTER TABLE PROJECT_RISK ADD NEW_LIKELIHOOD_SCALE int NULL

ALTER TABLE PROJECT_RISK ADD NEW_RISK_RATING int NULL

ALTER TABLE PROJECT_RISK ADD NEW_RISK_LEVEL VARCHAR(100) NULL


END
GO


IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_ACTIONITEM' AND COLUMN_NAME='NEW_RISK_ASSESSMENT_DATE')
BEGIN

ALTER TABLE PROJECT_ACTIONITEM ADD NEW_RISK_ASSESSMENT_DATE DATETIME NULL

ALTER TABLE PROJECT_ACTIONITEM ADD RISK_TREATMENT_EFFECTIVENESS_STATUS VARCHAR(MAX) NULL

ALTER TABLE PROJECT_ACTIONITEM ADD RISK_TREATMENT_EFFECTIVENESS_VERIFIED_BY VARCHAR(100) NULL

ALTER TABLE PROJECT_ACTIONITEM ADD RISK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE DATETIME NULL

END
GO

IF EXISTS(Select * from PROJECT_RISK where PROBABILITY_SCALE IS NOT NULL AND IMPACT_SCALE IS NOT NULL AND ISACTIVE=1)
BEGIN

UPDATE PROJECT_RISK SET RISK_RATING = PROBABILITY_SCALE * IMPACT_SCALE where PROBABILITY_SCALE IS NOT NULL AND IMPACT_SCALE IS NOT NULL AND ISACTIVE=1

END
GO

IF EXISTS(Select * from PROJECT_RISK where PROBABILITY_SCALE IS NOT NULL AND IMPACT_SCALE IS NOT NULL AND ISACTIVE=1)
BEGIN

UPDATE PROJECT_RISK SET RISK_LEVEL = CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' 
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate'     
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END    

where PROBABILITY_SCALE IS NOT NULL AND IMPACT_SCALE IS NOT NULL AND ISACTIVE=1

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='get_RiskDetailsByCustomerId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[get_RiskDetailsByCustomerId]
END
GO

CREATE PROCEDURE [dbo].[get_RiskDetailsByCustomerId]                  
                
@PROJIDS VARCHAR(MAX),                
@allproj bit      
  
AS                  

BEGIN   

SELECT * FROM (
    SELECT R.[ID], C.CUST_ID, C.CUST_NM, R.[PROJECT_ID], PORT.ID PORTFOLIO_ID, PORT.TITLE PORTFOLIO_NM,
           P.PROJ_NM, R.[RAG], R.[DESCRIPTION], [IMPACT], [PROBABILITY_SCALE], [IMPACT_SCALE], R.[RISK_RATING], 
		   R.[RISK_CATEGORY], R.[LOCATION], R.[RISK_LEVEL], R.[NEW_CONSEQUENCES_SCALE], R.[NEW_LIKELIHOOD_SCALE],
		   R.[NEW_RISK_RATING], R.[NEW_RISK_LEVEL],
           R.[OWNER], [AREA], [IDENTIFIED_BY], R.[IDENTIFIED_DATE], [RISK_TREATMENT_STRATEGY],
           R.[TARGET_DATE], [ACTUAL_DATE], R.[STATUS], [ACTION_TAKEN], R.[CREATED_BY], R.[CREATED_DATE],
           R.[UPDATED_BY], R.[UPDATED_DATE], R.[ISACTIVE], R.[RISK_REPOSITORY_ID], R.[IS_DRAFT],
           ISNULL(E.FRST_NM, R.[OWNER]) AS OWNER_NAME, R.ACCEPT_TILL,
           CAST(CASE WHEN PA.RISK_ID IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IS_PLAN_EXISTS,
           PA.ID AS ACTION_ITEM_ID, PA.DESCRIPTION AS ACTION_ITEM_DESCRIPTION,
           PA.OWNER AS ACTION_ITEM_OWNER, PA.IDENTIFIED_DATE AS ACTION_ITEM_IDENTIFIED_DATE,
           PA.TARGET_DATE AS ACTION_ITEM_TARGET_DATE, PA.STATUS AS ACTION_ITEM_STATUS,
           PA.COMPLETION_DATE AS ACTION_ITEM_COMPLETION_DATE, PA.COMMENTS as ACTION_ITEM_COMMENTS,
		   PA.NEW_RISK_ASSESSMENT_DATE, PA.RISK_TREATMENT_EFFECTIVENESS_STATUS, PA.RISK_TREATMENT_EFFECTIVENESS_VERIFIED_BY,
		   PA.RISK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE,
           ROW_NUMBER() OVER (PARTITION BY R.[ID] ORDER BY R.IDENTIFIED_DATE DESC) AS RowNumber

    FROM PROJECT_RISK R (NOLOCK)
    INNER JOIN PROJECT P (NOLOCK) ON R.PROJECT_ID = P.PROJ_ID
        AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS, ','))
        AND R.ISACTIVE = 1
    INNER JOIN CUSTOMER C (NOLOCK) ON C.CUST_ID = P.CUST_ID
    LEFT JOIN EMP_INFO E (NOLOCK) ON R.OWNER = CONVERT(VARCHAR, E.EMAIL_ID)
        OR R.OWNER = CONVERT(VARCHAR, E.EMP_ID)
    LEFT OUTER JOIN PORTFOLIO_PROJECT PP (NOLOCK) ON PP.PROJ_ID = P.PROJ_ID
    LEFT OUTER JOIN PORTFOLIO PORT (NOLOCK) ON PORT.ID = PP.PORTFOLIO_ID
    LEFT JOIN PROJECT_ACTIONITEM PA (NOLOCK) ON PA.RISK_ID = R.ID AND PA.PROJECT_ID = R.PROJECT_ID
) AS Subquery
WHERE RowNumber = 1
ORDER BY IDENTIFIED_DATE DESC;
                  
END       
GO

IF NOT EXISTS(SELECT 1 FROM LOCATION WHERE LOCATION_NAME = 'Chennai')
BEGIN
INSERT INTO LOCATION VALUES 
('Chennai', '104859', GETDATE(), '104859', GETDATE(), 1),
('Pune', '104859', GETDATE(), '104859', GETDATE(), 1),
('Vadodara', '104859', GETDATE(), '104859', GETDATE(), 1),
('Princeton ', '104859', GETDATE(), '104859', GETDATE(), 1)
END
GO

IF NOT EXISTS(SELECT 1 FROM RISK_CATEGORY WHERE CATEGORY = 'Cybersecurity Risk')
BEGIN
INSERT INTO RISK_CATEGORY VALUES 
('Cybersecurity Risk', '104859', GETDATE(), '104859', GETDATE(), 1),
('Compliance Risk', '104859', GETDATE(), '104859', GETDATE(), 1),
('Financial Risk', '104859', GETDATE(), '104859', GETDATE(), 1),
('Hazard Risk', '104859', GETDATE(), '104859', GETDATE(), 1),
('Operational Risk', '104859', GETDATE(), '104859', GETDATE(), 1),
('Reputational Risk', '104859', GETDATE(), '104859', GETDATE(), 1),
('Strategic Risk', '104859', GETDATE(), '104859', GETDATE(), 1)
END
GO

IF EXISTS(Select * from PROJECT_RISK where ISACTIVE=1)
BEGIN
UPDATE PROJECT_RISK SET RISK_CATEGORY = 'Operational Risk', LOCATION='Chennai'  where ISACTIVE=1
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForPeriod1' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForPeriod1]
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
inner join CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1                
INNER JOIN CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1                
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
