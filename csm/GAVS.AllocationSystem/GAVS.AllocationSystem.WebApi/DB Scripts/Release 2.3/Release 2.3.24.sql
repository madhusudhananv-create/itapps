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
    CSM_EMP_ID,  
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
    vw.SURVEY_ID,  
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
  INNER JOIN vwSurveyQRatings vw  
    ON vw.ID = CB.SURVEY_ID  
  WHERE CB.STATUS = 'COMPLETED'  
  AND (B.START_DATE BETWEEN @startDate AND @endDate  
  OR B.END_DATE BETWEEN @startDate AND @endDate)  
  AND (ISNULL(@projIds, '') = ''  
  OR CB.proj_id IN (SELECT  
    *  
  FROM [DBO].[FN_SPLITSTRING](@projIds, ','))  
  )  
  
  UNION ALL  
  
  SELECT  
    0 ID,  
    vw.SURVEY_ID,  
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
        AND QUESTION_ID = 15)  
      ELSE (SELECT TOP 1  
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
    OR proj_id IN (SELECT  
      *  
    FROM [DBO].[FN_SPLITSTRING](@projIds, ','))  
    )))  
  INNER JOIN CUSTOMER C (NOLOCK)  
    ON c.cust_id = CB.cust_id  
  INNER JOIN CSS_BATCH_monthly B (NOLOCK)  
    ON B.ID = CB.BATCH_MONTHLY_ID  
  INNER JOIN vwSurveyQRatings vw  
    ON vw.ID = CB.SURVEY_ID  
  WHERE CB.STATUS = 'COMPLETED'  
  AND (B.START_DATE BETWEEN @startDate AND @endDate  
  OR B.END_DATE BETWEEN @startDate AND @endDate)) TBL  
  
END 
Go

IF  NOT EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='BASE_MEASURE_EXTERNAL_KPI_DATA' AND TYPE='U')
BEGIN 

CREATE TABLE [dbo].[BASE_MEASURE_EXTERNAL_KPI_DATA](

  [ID] [int] IDENTITY(1,1) NOT NULL,

  [BASE_MEASURE_ID] INT NOT NULL,

   EXTERNAL_KPI_DATA_ID INT NULL,

  KPI_DATA_JSON [varchar](MAX) NULL,

  [CREATED_BY] [varchar](100) NOT NULL,

  [CREATED_DATE] [datetime] NOT NULL,

  [UPDATED_BY] [varchar](100) NOT NULL,

  [UPDATED_DATE] [datetime] NOT NULL,

  [ISACTIVE] [bit] NOT NULL,

CONSTRAINT [PK_BASE_MEASURE_EXTERNAL_KPI_DATA] PRIMARY KEY CLUSTERED 

(
  [ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

) ON [PRIMARY]

ALTER TABLE [dbo].[BASE_MEASURE_EXTERNAL_KPI_DATA] ADD  CONSTRAINT [DF_BASE_MEASURE_EXTERNAL_KPI_DATA_CREATED_DATE]  DEFAULT (getdate()) FOR [CREATED_DATE];

ALTER TABLE [dbo].[BASE_MEASURE_EXTERNAL_KPI_DATA] ADD  CONSTRAINT [DF_BASE_MEASURE_EXTERNAL_KPI_DATA_UPDATED_DATE]  DEFAULT (getdate()) FOR [UPDATED_DATE];

ALTER TABLE [dbo].[BASE_MEASURE_EXTERNAL_KPI_DATA] ADD  CONSTRAINT [DF_BASE_MEASURE_EXTERNAL_KPI_DATA_ISACTIVE]  DEFAULT ((1)) FOR [ISACTIVE];

END
GO

If not Exists(Select 1 from BAS..CONFIGURATION_EXT where [KEY] ='KPIDATA_REQUIREDFIELDS_FRESHWORKS')
Begin
Insert into BAS..CONFIGURATION_EXT values('KPIDATA_REQUIREDFIELDS_FRESHWORKS','Type,Status,Agent Group Name,Priority,Resolution Status,created date,closed date,First Response Status,Survey Score,Reopen Count','202100121',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END
GO

IF EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='PROJMGT_RELEASE' AND TYPE='U')
BEGIN 
DROP TABLE PROJMGT_RELEASE
END
GO

IF EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='PROJMGT_ITERATION' AND TYPE='U')
BEGIN 
DROP TABLE PROJMGT_ITERATION
END
GO

IF EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='PROJMGT_USERSTORY' AND TYPE='U')
BEGIN 
DROP TABLE PROJMGT_USERSTORY
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallRisksForRiskDashboard' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallRisksForRiskDashboard]
END
GO

CREATE PROCEDURE [dbo].[getOverallRisksForRiskDashboard]                        

@startDate date,
@endDate date,              
@custIds varchar(max) 

AS   
BEGIN    
  
 select C.CUST_NM,P.PROJ_NM,PR.DESCRIPTION,PR.IMPACT,PR.PROBABILITY_SCALE,PR.IMPACT_SCALE,PR.OWNER,PR.AREA,PR.IDENTIFIED_BY,
 PR.IDENTIFIED_DATE,PR.RISK_TREATMENT_STRATEGY,PR.TARGET_DATE,PR.STATUS,PR.ACTION_TAKEN,C.CUST_ID,P.PROJ_ID,PR.ID
 from   
 PROJECT_RISK PR        
 inner join PROJECT p on PR.PROJECT_ID = P.PROJ_ID  and ISNULL(p.PROJ_STATUS ,'') != 'Close'
 inner join CUSTOMER c on P.CUST_ID = C.CUST_ID
  
 where (PR.IDENTIFIED_DATE between @startDate and @endDate) AND PR.ISACTIVE=1 AND PR.STATUS != 'Closed'
 AND (@custIds = '-1' OR C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,','))) order by C.CUST_NM,PR.IDENTIFIED_DATE DESC
END
GO


Declare @RESOURCEID int = 99
Declare @EMPID varchar(10) = '104859'
Declare @RescourceName varchar(250) = 'Dashboard > Risk Dashboard'

if not exists(select 1 from APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) set @RESOURCEID = (select RESOURCE_ID from APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

if not exists(select 1 from APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,CREATED_DATE,UPDATED_DATE,ACCESS_LEVEL)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1)
end

if not exists (select 1 from APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
end
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='get_RiskDetailsByCustomerId' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].get_RiskDetailsByCustomerId
END
GO
CREATE PROCEDURE [dbo].[get_RiskDetailsByCustomerId]              
            
@PROJIDS VARCHAR(MAX),            
@allproj bit              
AS              
BEGIN              
  SELECT distinct C.CUST_ID, CUST_NM, PORT.ID PORTFOLIO_ID, PORT.TITLE PORTFOLIO_NM, P.PROJ_NM, R.[ID]              
      ,R.[PROJECT_ID]              
      ,R.[RAG]              
      ,R.[DESCRIPTION]              
      ,[IMPACT]              
      ,[PROBABILITY_SCALE]              
      ,[IMPACT_SCALE]              
      ,R.[OWNER]              
      ,[AREA]              
      ,[IDENTIFIED_BY]              
      ,R.[IDENTIFIED_DATE]              
      ,[RISK_TREATMENT_STRATEGY]              
      ,R.[TARGET_DATE]              
      ,[ACTUAL_DATE]              
      ,R.[STATUS]              
      ,[ACTION_TAKEN]              
      ,R.[CREATED_BY]              
      ,R.[CREATED_DATE]              
      ,R.[UPDATED_BY]              
      ,R.[UPDATED_DATE]              
      ,R.[ISACTIVE]         
   , isnull(E.FRST_NM, R.[OWNER]) as OWNER_NAME         
   ,R.ACCEPT_TILL,
   cast(CASE WHEN PA.RISK_ID is not null then 1 else 0 end as bit)  as IS_PLAN_EXISTS 
   FROM PROJECT_RISK R  (NOLOCK)       
  INNER JOIN PROJECT P  (NOLOCK) ON R.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))  and R.ISACTIVE = 1              
  INNER JOIN CUSTOMER C  (NOLOCK) ON C.CUST_ID = P.CUST_ID              
  LEFT JOIN EMP_INFO e  (NOLOCK) on r.OWNER  =  convert(varchar,e.EMAIL_ID) or r.owner = convert(varchar, e.emp_id)       
  LEFT OUTER JOIN PORTFOLIO_PROJECT PP  (NOLOCK) ON PP.PROJ_ID = P.PROJ_ID              
  LEFT OUTER JOIN PORTFOLIO PORT   (NOLOCK) ON PORT.ID = PP.PORTFOLIO_ID  
  LEFT JOIN PROJECT_ACTIONITEM PA  (NOLOCK) ON PA.RISK_ID = R.ID And pa.PROJECT_ID= r.PROJECT_ID
  order by [IDENTIFIED_DATE] desc        
              
END   

GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getServiceTowersMappedForProjects' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].reports_getServiceTowersMappedForProjects
END
GO

CREATE PROCEDURE dbo.reports_getServiceTowersMappedForProjects    
AS     
BEGIN     
SELECT  
 t.CUST_NM AS CUSTOMER,t.PROJ_ID AS PROJECT_ID,t.PROJ_NM AS PROJECT,ACCOUNT_OWNER,t.MANAGER,t.CSM,QA_SPOC, CASE WHEN t.CSV IS NULL THEN 'NO' ELSE 'YES' END SERVICE_TOWER_MAPPED,    
t.CSV AS SERVICE_TOWERS , t.CSM_MAIL_ID ,t.MANAGER_MAIL_ID ,t.QUALITY_PARTNER_MAIL_ID, case when QADOR is null then 'YES' else 'NO' end IS_QA_ACTIVE FROM(    
select C.CUST_NM, P.PROJ_ID,    
PROJ_NM  ,ACCOUNT_OWNER = case when proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,     PM.FRST_NM +' '+ISNULL(PM.LAST_NM,'') AS MANAGER,   DM.FRST_NM +' '+ISNULL(DM.LAST_NM,'') AS CSM,PM.EMAIL_ID as MANAGER_MAIL_ID , DM.EMAIL_ID as CSM_MAIL_ID, qa.EMAIL_ID as QUALITY_PARTNER_MAIL_ID,  
QA.FRST_NM +' '+ISNULL(QA.LAST_NM,'') AS QA_SPOC,CSV= STUFF (( SELECT   ', ' +  TITLE  FROM    
 PROCESS_SERVICE_AREA_PROJECT_MAPPING PSMAP (NOLOCK)    
 INNER JOIN PROCESS_SERVICE_AREA_NEW S (NOLOCK)    
 ON PSMAP.SERVICE_AREA_ID =S.ID    
 WHERE p.PROJ_ID= PSMAP.PROJ_ID AND PSMAP.ISACTIVE=1 order by title    
  FOR XML PATH('')), 1, 2, ''), QA.DOR QADOR  
from PROJECT P (NOLOCK)      
INNER JOIN CUSTOMER C (NOLOCK) ON    
P.CUST_ID=C.CUST_ID    
INNER JOIN EMP_INFO PM (NOLOCK) ON    
P.PROJ_PM_EMP_ID =PM.EMP_ID    
INNER JOIN EMP_INFO DM (NOLOCK) ON    
P.PROJ_DM_EMP_ID =DM.EMP_ID    
INNER JOIN EMP_INFO QA (NOLOCK) ON    
P.QUALITY_SPOC =QA.EMP_ID   
WHERE ISNULL(P.PROJ_STATUS ,'') != 'Close'   
) as t    
ORDER BY CUST_NM,PROJ_NM    
    
 END  

 GO


If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='PROJECT_CLOSURE_NOTIFY_EMAILS')
Begin
Insert into CONFIGURATION_EXT values('PROJECT_CLOSURE_NOTIFY_EMAILS','marketing_gavs@gavstech.com,grc_team@gavstech.com','-1',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='KPIDATA_REQUIREDFIELDS_FRESHWORKS')
Begin
Insert into CONFIGURATION_EXT values('KPIDATA_REQUIREDFIELDS_FRESHWORKS','Status,Agent Group Name,Priority,created date,closed date','202100121',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END 
ELSE
BEGIN
UPDATE  CONFIGURATION_EXT 
SET [VALUE]='Status,Agent Group Name,Priority,created date,closed date'
where [KEY] ='KPIDATA_REQUIREDFIELDS_FRESHWORKS' 
END

GO