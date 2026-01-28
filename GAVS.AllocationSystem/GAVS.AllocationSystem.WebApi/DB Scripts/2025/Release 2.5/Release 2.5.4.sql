-- PCSAT Configuration Scripts ----


Declare @RESOURCEID int = 826
Declare @EMPID varchar(10) = '104744'
Declare @RescourceName varchar(250) = 'Settings > CSAT Configuration'

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
GO


-- Add PREDICTION_REASON
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'css_batch_customers' 
               AND COLUMN_NAME = 'PREDICTED_REASON')
BEGIN
    ALTER TABLE css_batch_customers ADD PREDICTED_REASON varchar(250);
END

GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'css_batch_customers' 
               AND COLUMN_NAME = 'REMARKS')
BEGIN
    ALTER TABLE css_batch_customers ADD REMARKS varchar(250);
END

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='CSS_BATCH_PROJECTS' AND type='U')
BEGIN
CREATE table CSS_BATCH_PROJECTS(
ID INT NOT NULL IDENTITY(1,1),
CUST_ID VARCHAR(20),
PROJ_ID VARCHAR(20),
REASON VARCHAR(1000),
DP_ID VARCHAR(10),
PROJ_PM_EMP_ID VARCHAR(10),
QUALITY_SPOC VARCHAR(10),
IS_SELECTED BIT,
BATCH_ID INT,
CREATED_BY VARCHAR(10),
CREATED_DATE  DATETIME,
UPDATED_BY VARCHAR(10),
UPDATED_DATE DATETIME,
ISACTIVE bit 
)

END
GO


 IF NOT EXISTS (SELECT 1 FROM CSS_BATCHES WHERE CATEGORY ='Project' and FREQUENCY='Half-Yearly' and SEQUENCE= 2)   
 BEGIN
INSERT INTO CSS_BATCHES(FREQUENCY
,SEQUENCE
,YEAR
,START_DATE
,END_DATE
,STATUS
,CREATED_BY
,CREATED_DATE
,UPDATED_BY
,UPDATED_DATE
,ISACTIVE
,CATEGORY
,CSS_VALIDITY_ENDDATE) VALUES
('Half-Yearly',2,2025,'2025-07-01 00:00:00.000','2025-12-31 00:00:00.000','CREATED','104744',GETDATE(),'104744',GETDATE(),1,'Project','2026-02-27 00:00:00.000')

END

GO

IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='LAST_PCSAT_BATCH_ID')
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
    'LAST_PCSAT_BATCH_ID',  
    '35',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '1001260',           
    GETDATE(),          
    '1001260',           
    GETDATE()           
);
END
GO

IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='LAST_ACSAT_BATCH_ID')
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
    'LAST_ACSAT_BATCH_ID',  
    '36',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '1001260',           
    GETDATE(),          
    '1001260',           
    GETDATE()           
);
END
GO

IF EXISTS(Select 1 from sys.objects where name ='getAccountProjectSelectionCSAT' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAccountProjectSelectionCSAT]
END
GO

CREATE PROCEDURE [dbo].[getAccountProjectSelectionCSAT] 

@STARTDATE datetime,                                                 
@ENDDATE datetime,                       
@DPID VARCHAR(max)='0',
@Customer varchar(max) ='0'

AS
BEGIN 

DECLARE @TargetIDs TABLE (ID VARCHAR(MAX));
    INSERT INTO @TargetIDs SELECT * FROM [DBO].[FN_SPLITSTRING](@DPID,',');

    --DECLARE @RolePriority INT = 0;

    --SELECT @RolePriority = ISNULL(MIN(
    --   CASE 
    --        WHEN P.PROJ_DM_EMP_ID IS NOT NULL AND P.PROJ_DM_EMP_ID = T.ID THEN 1
    --        WHEN P.PROJ_PM_EMP_ID IS NOT NULL AND P.PROJ_PM_EMP_ID = T.ID THEN 2
    --        WHEN P.QUALITY_SPOC   IS NOT NULL AND P.QUALITY_SPOC   = T.ID THEN 3
    --    END),0)

    --           FROM PROJECT P
			 --  join customer c on c.CUST_ID=p.CUST_ID 
			 --  INNER JOIN @TargetIDs T ON T.ID IN (P.PROJ_DM_EMP_ID, P.PROJ_PM_EMP_ID, P.QUALITY_SPOC)
    --           WHERE p.PROJECT_TYPE != 'Internal'
    --           AND p.PROJ_STATUS IN ('New','Close','Deliver','Plan','Complete')
			 --   AND C.CUST_NM NOT LIKE '%gavs%'
    --            AND C.CUST_ID != '202100091'
			 --  AND p.end_date >= DATEADD(MONTH, -6, @ENDDATE)

      SELECT DISTINCT
        C.CUST_NM,
        C.CUST_ID,
        P.PROJ_NM, 
        P.PROJ_ID,
        HC.PROJECT_HEAD_COUNT,
        HC.ACCOUNT_HEAD_COUNT,
	CAST(
    COALESCE(
        cb.IS_SELECTED,
        CASE WHEN LatestSurvey.FREQUENCY IN ('Half-Yearly','Halfyearly') THEN 1 ELSE 0 END
    ) AS BIT
) AS IS_SELECTED,
       
        --CAST(CASE  
        --    WHEN LatestSurvey.FREQUENCY IN ('Half-Yearly','Halfyearly') THEN 1 
        --    ELSE 0 
        --END AS BIT) AS IS_SELECTED,

        @STARTDATE AS START_DATE,
        @ENDDATE AS END_DATE,
        --LatestSurvey.FREQUENCY,
        --LatestSurvey.EMAIL_ID AS RESPONDENT_MAIL,
        
        P.PROJ_STATUS,  
        P.EXECUTION_TYPE, 
        P.ENGAGAMENT_TYPE, 
        P.BUSINESS_UNIT,
        CB.REASON,
        --E6.EMAIL_ID AS [DP_MAIL],
         E5.EMP_ID AS PROJ_PM_EMP_ID,
		 E6.EMP_ID as DP_ID,
        E7.EMP_ID AS QUALITY_SPOC


    FROM PROJECT P
    INNER JOIN CUSTOMER C ON P.CUST_ID = C.CUST_ID
	LEFT JOIN EMP_INFO E5 ON E5.EMP_ID = P.PROJ_PM_EMP_ID and E5.DOR IS NULL
    LEFT JOIN EMP_INFO E6 ON E6.EMP_ID = P.PROJ_DM_EMP_ID and E6.DOR IS NULL
	LEFT JOIN EMP_INFO E7 ON E7.EMP_ID = P.QUALITY_SPOC and E7.DOR IS NULL
	LEFT JOIN CSS_BATCH_PROJECTS CB ON CB.PROJ_ID = P.PROJ_ID and ISACTIVE=1
    OUTER APPLY (
        SELECT TOP 1 
            B.FREQUENCY, 
            css.EMAIL_ID, 
            css.SURVEY_SENT_DATE
        FROM CSS_BATCH_CUSTOMERS css
        INNER JOIN CSS_BATCHES b ON css.BATCH_ID = b.ID
        WHERE css.PROJ_ID = P.PROJ_ID -- Link to Project
          AND css.ISACTIVE = 1 
          AND css.IS_VERIFIED = 1 
          AND css.SURVEY_SENT_DATE IS NOT NULL
          AND B.FREQUENCY IN ('Half-Yearly','Halfyearly','Annual')
          AND B.YEAR = CASE WHEN MONTH(@STARTDATE) >= 7 THEN YEAR(@STARTDATE) ELSE YEAR(@STARTDATE) - 1 END
        ORDER BY css.SURVEY_SENT_DATE DESC
    ) LatestSurvey

    OUTER APPLY (
        SELECT 
            PROJECT_HEAD_COUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE pr WHERE pr.PROJ_ID = p.PROJ_ID AND pr.BILL_FLG = 1 AND pr.CURR_INDC = 'y' AND pr.END_DATE >= GETDATE()),
            ACCOUNT_HEAD_COUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE pr WHERE pr.CUST_ID = p.CUST_ID AND pr.BILL_FLG = 1 AND pr.CURR_INDC = 'y' AND pr.END_DATE >= GETDATE())
    ) HC

    WHERE 
        (@Customer = '0' OR C.cust_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@Customer,',')))         
        AND (
            @DPID = '0' 
            OR P.PROJ_DM_EMP_ID IN (SELECT ID FROM @TargetIDs)
            OR P.PROJ_PM_EMP_ID IN (SELECT ID FROM @TargetIDs)
            OR P.QUALITY_SPOC   IN (SELECT ID FROM @TargetIDs)
        )
    AND C.CUST_NM NOT LIKE '%gavs%'
    AND C.CUST_ID != '202100091'  AND P.PROJECT_TYPE != 'Internal'
    AND ((P.proj_status in('New','Close','Deliver','Plan','Complete') AND P.end_date >= DATEADD(MONTH, -6, @ENDDATE)))
    ORDER BY C.CUST_NM, P.PROJ_NM
	END
    GO

    IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_BCC')
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
    'CSS_BCC',  
    'thamaraiselvi.s@neurealm.com,dhiviya.ks@neurealm.com,shivi.srivastava@neurealm.com',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '104744',           
    GETDATE(),          
    '104744',           
    GETDATE()           
);
END

GO


IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='PCSAT_ACK_MAIL_VALIDITY')
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
    'PCSAT_ACK_MAIL_VALIDITY',  
    '21st Jan 2026',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '104744',           
    GETDATE(),          
    '104744',           
    GETDATE()           
);
END
GO

-------Pre survey connect and Questionarrie changes ----------------



IF NOT EXISTS(Select 1 from sys.tables where name ='CSS_PRECONNECT' AND type='U')
BEGIN
CREATE table CSS_PRECONNECT(
ID INT NOT NULL IDENTITY(1,1),
PLANNED_DATE DATETIME NULL,
ACTUAL_DATE DATETIME NULL,
REMARKS VARCHAR(MAX),
STATUS  VARCHAR(20),
CSS_BATCH_CUSTOMER_ID INT ,
CREATED_BY VARCHAR(10),
CREATED_DATE  DATETIME,
UPDATED_BY VARCHAR(10),
UPDATED_DATE DATETIME,
ISACTIVE bit )

END
GO

----report SP for Account Project CSAT Configuration-----


IF EXISTS(Select 1 from sys.objects where name ='reports_Account_Project_CSATConfiguration' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_Account_Project_CSATConfiguration]
END
GO


CREATE PROCEDURE [dbo].[reports_Account_Project_CSATConfiguration]                             
                            
@StartDate date,                           
@EndDate date,
@CUSTOMER varchar(max)='0'  
                          
 AS                           
                          
BEGIN       

SELECT DISTINCT  
   [PCSAT Cycle] =  (select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.ID ),    
  P.BUSINESS_UNIT as [Business Unit],  
        C.CUST_NM as [Account],  
  [Account HeadCount] = (SELECT COUNT(*) FROM PROJ_RESOURCE pr WHERE pr.CUST_ID = p.CUST_ID AND pr.BILL_FLG = 1 AND pr.CURR_INDC = 'y' AND pr.END_DATE >= GETDATE()),  
        --C.CUST_ID,  
        P.PROJ_NM as [Project],   
        --P.PROJ_ID,  
  [Project HeadCount] = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y' and pr.END_DATE >= GETDATE()),              
        --HC.PROJECT_HEAD_COUNT,  
  P.PROJ_STATUS as [Project Status],  
  convert(varchar,p.start_date,107) as [Project Start Date],  
  convert(varchar,p.end_date,107)as [Project End Date],    
        e5.FRST_NM as [Project Manager],  
  e5.EMAIL_ID as [Project Manager MAIL],  
  e6.FRST_NM as [Delivery Partner],  
        E6.EMAIL_ID AS [Delivery Partner MAIL],  
  e8.FRST_NM as [GDH],  
  e8.EMAIL_ID as [GDH MAIL],  
        E7.FRST_NM AS [DEV Ex partner],  
  P.EXECUTION_TYPE as [Execution Type],   
        P.ENGAGAMENT_TYPE as [Engagement Type],   
 case when cb.IS_SELECTED = 1 and cbc.id IS NOT NULL then 'Yes'
   else 'No' end as [Chosen for PCSAT],  
  cb.REASON  as [Reason (If No)],  
        LatestSurvey.DISPLAY_NAME as [Last Cycle PCSAT Respondant],  
        cbc.DISPLAY_NAME as [Respondent],  
  co.CONTACT_ROLE as [Role],  
  cbc.EMAIL_ID as [Email Id],  
  cbc.PREDICTED_SCORE as [Predicted Score],  
  cbc.PREDICTED_REASON as [Predicted Reason],  
  isnull(e.FRST_NM, cbc.SPOC) as [CSAT Spoc],  
    cbc.SPOC  [CSAT MAIL],  
	  E4.FRST_NM as [Respondent Last Updated By],  
  convert(varchar,cbc.UPDATED_DATE,107) as [Respondent Last Updated Date],  
  cp.status as [Pre Survey Connect],  
        convert(varchar,cp.planned_date,107)  as [Planned Date],  
        convert(varchar,cp.actual_date,107)  as [Actual Date],  
       cp.remarks as [Remarks],  
	   	E9.FRST_NM as [Presurvey connect Last Updated By],  
  convert(varchar,cp.UPDATED_DATE,107) as [Presurvey connect Last Updated Date],  

  NULL as [Columns Updated]  
  
  
    FROM PROJECT P  
    INNER JOIN CUSTOMER C ON P.CUST_ID = C.CUST_ID  
 LEFT JOIN EMP_INFO E5 ON E5.EMP_ID = P.PROJ_PM_EMP_ID and E5.DOR IS NULL  
    LEFT JOIN EMP_INFO E6 ON E6.EMP_ID = P.PROJ_DM_EMP_ID and E6.DOR IS NULL  
 LEFT JOIN EMP_INFO E7 ON E7.EMP_ID = P.QUALITY_SPOC and E7.DOR IS NULL  
 LEFT JOIN EMP_INFO E8 ON E8.EMP_ID = P.PROJ_BUHEAD_EMP_ID and E8.DOR IS NULL  
 LEFT JOIN CSS_BATCH_PROJECTS CB ON CB.PROJ_ID = P.PROJ_ID and cb.ISACTIVE=1  and cb.IS_SELECTED = 1
 left join CSS_BATCH_CUSTOMERS cbc on cbc.BATCH_ID=cb.BATCH_ID and cbc.PROJ_ID=p.PROJ_ID and cbc.ISACTIVE=1 and cbc.BATCH_ID=37  
 LEFT JOIN EMP_INFO E ON E.EMAIL_ID = cbc.SPOC and E.DOR IS NULL  
 LEFT JOIN EMP_INFO E4 ON E4.EMP_ID = cbc.UPDATED_BY and E4.DOR IS NULL  
 left join CONTACTS co on co.CONTACT_EMAILID = cbc.EMAIL_ID and co.ISACTIVE = 1   and co.CUSTOMER_ID=cbc.CUST_ID  
 left JOIN CSS_BATCHES B ON B.ID = cb.BATCH_ID  
 left join CSS_PRECONNECT cp on cp.css_batch_customer_id = cbc.ID and cp.isActive=1  
  LEFT JOIN EMP_INFO E9 ON E9.EMP_ID = cp.UPDATED_BY and E9.DOR IS NULL
    OUTER APPLY (  
    SELECT  STRING_AGG(css.DISPLAY_NAME, ', ') AS DISPLAY_NAME --css.DISPLAY_NAME  
        FROM CSS_BATCH_CUSTOMERS css  
        INNER JOIN CSS_BATCHES b ON css.BATCH_ID = b.ID  
        WHERE css.PROJ_ID = P.PROJ_ID   
          AND css.ISACTIVE = 1   
          AND css.IS_VERIFIED = 1   
    AND css.SURVEY_SENT_DATE IS NOT NULL  
          AND B.FREQUENCY IN ('Half-Yearly','Halfyearly','Annual')  
          AND B.YEAR = CASE WHEN MONTH(@STARTDATE) >= 7 THEN YEAR(@STARTDATE) ELSE YEAR(@STARTDATE) - 1 END  
) LatestSurvey  
  
    OUTER APPLY (  
        SELECT   
            PROJECT_HEAD_COUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE pr WHERE pr.PROJ_ID = p.PROJ_ID AND pr.BILL_FLG = 1 AND pr.CURR_INDC = 'y' AND pr.END_DATE >= GETDATE()),  
            ACCOUNT_HEAD_COUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE pr WHERE pr.CUST_ID = p.CUST_ID AND pr.BILL_FLG = 1 AND pr.CURR_INDC = 'y' AND pr.END_DATE >= GETDATE())  
    ) HC  
  
   WHERE   
  (@Customer = '0' OR C.cust_id IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@Customer,',')))    
       
    AND C.CUST_NM NOT LIKE '%gavs%'  
    AND C.CUST_ID != '202100091'  AND P.PROJECT_TYPE != 'Internal'  
    AND ((P.proj_status in('New','Close','Deliver','Plan','Complete') AND P.end_date >= DATEADD(MONTH, -6, @ENDDATE)))  
    ORDER BY C.CUST_NM, P.PROJ_NM  

END 


GO

IF NOT exists (select 1 from REPORTS_SP_DETAILS WHERE SP_NAME='reports_Account_Project_CSATConfiguration')   
BEGIN
insert into REPORTS_SP_DETAILS values('reports_Account_Project_CSATConfiguration', 'PCSAT Configuration Report', 'BAS')
END

declare @report_sp_id int
set @report_sp_id = (select top 1 ID from REPORTS_SP_DETAILS where SP_NAME='reports_Account_Project_CSATConfiguration')

IF NOT exists (select 1 from REPORTS_PARAMS WHERE REPORT_SP_ID= @report_sp_id)   
BEGIN
insert into REPORTS_PARAMS values(@report_sp_id, 'StartDate', 'DATE','2025-07-01')
insert into REPORTS_PARAMS values(@report_sp_id, 'EndDate', 'DATE','2025-12-31')
insert into REPORTS_PARAMS values(@report_sp_id, 'Customer', 'CUSTOMERID','-1')
END

----SP for question model update in CSS_BATCH_CUSTOMERS table
IF EXISTS(Select 1 from sys.objects where name ='usp_update_CSSBatchCustomers' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_update_CSSBatchCustomers]
END
GO
create PROCEDURE [dbo].[usp_update_CSSBatchCustomers]   
  
@ID int,     
@SURVEY_ID int,     
@SURVEY_SENT_DATE DateTime,     
@SURVEY_RECEIVED_DATE DateTime = NULL,    
@STATUS varchar(100),  
@EMP_ID varchar(100) = NULL,  
@MEETING_DATE DateTime = NULL,  
@IS_CSM_NOTIFIED bit = NULL,
@QUESTION_MODEL_ID INT =0
  
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

if(@question_model_id !=0)
BEGIN
    UPDATE CSS_BATCH_CUSTOMERS SET     
    question_model_id = @question_model_id 
WHERE ID = @ID    
END
    
UPDATE CSS_SURVEY_ITERATION SET     
[STATUS] = @STATUS    
WHERE ID = @SURVEY_ID   
  
END  
Go

IF EXISTS(Select 1 from sys.objects where name ='getCSATQuestionModel' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSATQuestionModel]
END
GO

create PROCEDURE getCSATQuestionModel      
      
@projectId varchar(50)  ,    
@batchId int = 0,    
@emailid varchar(200)= ''    
      
AS          
      
BEGIN  
    declare @engagementType varchar(250) =''  
  
    select @engagementType = ENGAGAMENT_TYPE from project where PROJ_ID = @projectId;  
  
    if(@engagementType in ('Managed Services', 'Fully Managed')  )
    BEGIN  
      
     SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Managed Services H'       
  
    END  
    ELSE if(@engagementType ='Co-Managed')  
    BEGIN  
         SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Co-Managed H'       
    END  
    ELSE if(@engagementType ='Staff Augmentation')  
    BEGIN  
         SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation H'       
    END  
    ELSE   
    BEGIN  
          IF @BATCHiD =99 AND @emailid ='xxx'    
          BEGIN    
           SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Qualitative Feedback'       
          END    
      
          IF EXISTS(SELECT 1 FROM PROJECT where REVENUE_TYPE in ('Time and Material','Fixed Bid') and PROJ_ID = @projectId)        
          BEGIN          
           SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Time and Material New'      
          END        
      
          ELSE IF EXISTS(SELECT 1 FROM PROJECT where REVENUE_TYPE in ('Managed Services'  ) and PROJ_ID = @projectId)      
          BEGIN          
           SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Managed Services New'      
          END        
      
          ELSE IF EXISTS(SELECT 1 FROM PROJECT where REVENUE_TYPE in ('Fixed Monthly') and PROJ_ID = @projectId)      
          BEGIN          
           SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation New'      
          END        
      
          ELSE      
          BEGIN      
           SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Default'      
          END      
    END  
 END
 GO

 -- script for engagement type based question model addition-----
 IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation H')
 BEGIN
 INSERT INTO CSS_QUESTION_MODELS (MODEL_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
VALUES
('Staff Augmentation H','CSAT Related questions','1001260',GETDATE(),'1001260',GETDATE(),1)
END
IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Managed Services H')
BEGIN
INSERT INTO CSS_QUESTION_MODELS (MODEL_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
VALUES
('Managed Services H','CSAT Related questions','1001260',GETDATE(),'1001260',GETDATE(),1)
END

IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Co-Managed H')
BEGIN
INSERT INTO CSS_QUESTION_MODELS (MODEL_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
VALUES
('Co-Managed H','CSAT Related questions','1001260',GETDATE(),'1001260',GETDATE(),1)
END


declare @modelId int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation H')

IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE MODEL_ID = @modelId)   
 BEGIN
INSERT INTO CSS_QUESTION_MASTER (MODEL_ID,QUESTION,CREATED_DATE,CREATED_BY, EFFECTIVE_FROM, UPDATED_BY,UPDATED_DATE,ISACTIVE,QUESTION_CATEGORY,
RATING_SCALE,RATING_PARAM,TRIGGER_RCA,SEQUENCE, PERSPECTIVE)
VALUES 

(@modelid,'How satisfied are you with the Overall Experience while working with Neurealm during this period?*',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,1,'Overall  Experience'),

(@modelid,'How satisfied are you with the Competency of the talents including understanding of business requirements and demonstrating technical expertise?',GETDATE(),'1001260',GETDATE(),'1001260',
GETDATE(),1,'Criteria',2,NULL,1,2,'Resource Competency'),

(@modelid,'How satisfied are you with the Onboarding of the resources / talents as per the expected timeline?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,3,'Timely Resource Fulfillment'),

(@modelid,'Any other feedback / point that you would like to mention here which will help the Project team to serve you better in future? (Optional)',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),1,'Others',3,NULL,1,4,'Qualitative feedback')
END

declare @modelId2 int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Managed Services H')
IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE MODEL_ID = @modelId2)   
 BEGIN
INSERT INTO CSS_QUESTION_MASTER (MODEL_ID,QUESTION,CREATED_DATE,CREATED_BY, EFFECTIVE_FROM, UPDATED_BY,UPDATED_DATE,ISACTIVE,QUESTION_CATEGORY,
RATING_SCALE,RATING_PARAM,TRIGGER_RCA, SEQUENCE, PERSPECTIVE)
VALUES 

(@modelid2,'How satisfied are you with the Overall Experience while working with Neurealm?*',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,'Overall  Experience',1,1,'Overall  Experience'),

(@modelId2,'How satisfied are you on the adherence to agreed Timelines/ SLA for deliverables / services provided?',GETDATE(),'1001260',GETDATE(),'1001260',
GETDATE(),1,'Criteria',2,'Timeline Adherence',1,2,'Timeline Adherence'),

(@modelId2,'How satisfied are you on the Quality of agreed project deliverables/ services provided?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,3,'Quality of deliverables'),

(@modelId2,'How satisfied are you with the Competency of the talents including understanding of business requirements and demonstrating technical expertise?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,4,'Timely Resource Fulfillment'),

(@modelId2,'How satisfied are you with the Risks and Issues managed by the project team and responsiveness to the concerns raised?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,5,'Risk Management & Responsiveness'),

(@modelId2,'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Neurealm?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',3,NULL,1,6,'Thought Leadership'),

(@modelId2,'Any other feedback / point that you would like to mention here which will help the Project team to serve you better in future? (Optional)',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),1,'Others',3,NULL,1,7,'Qualitative feedback')
END

declare @modelId3 int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Co-Managed H')

IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE MODEL_ID = @modelId3)   
 BEGIN
INSERT INTO CSS_QUESTION_MASTER (MODEL_ID,QUESTION,CREATED_DATE,CREATED_BY, EFFECTIVE_FROM, UPDATED_BY,UPDATED_DATE,ISACTIVE,QUESTION_CATEGORY,
RATING_SCALE,RATING_PARAM,TRIGGER_RCA, SEQUENCE, PERSPECTIVE)
VALUES 

(@modelId3,'How satisfied are you with the Overall Experience while working with Neurealm?*',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,'Overall  Experience',1,1,'Overall  Experience'),

(@modelId3,'How satisfied are you on the adherence to agreed Timelines/ SLA for deliverables / services provided?',GETDATE(),'1001260',GETDATE(),'1001260',
GETDATE(),1,'Criteria',2,'Timeline Adherence',1,2,'Timeline Adherence'),

(@modelId3,'How satisfied are you on the Quality of agreed project deliverables/ services provided?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,3,'Quality of deliverables'),

(@modelId3,'How satisfied are you with the Competency of the talents including understanding of business requirements and demonstrating technical expertise?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,4,'Timely Resource Fulfillment'),

(@modelId3,'How satisfied are you with the Risks and Issues managed by the project team and responsiveness to the concerns raised?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,5,'Risk Management & Responsiveness'),

(@modelId3,'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Neurealm?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',3,NULL,1,6,'Thought Leadership'),

(@modelId3,'Any other feedback / point that you would like to mention here which will help the Project team to serve you better in future? (Optional)',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),1,'Others',3,NULL,1,7,'Qualitative feedback')
END
GO
