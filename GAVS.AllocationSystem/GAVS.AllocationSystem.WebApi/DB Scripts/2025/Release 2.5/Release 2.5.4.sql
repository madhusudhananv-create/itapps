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
