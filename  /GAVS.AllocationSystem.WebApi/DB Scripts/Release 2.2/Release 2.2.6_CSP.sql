USE CSP  
GO
 
IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'BATCH_CUSTOMER_MONTHLY_ID'
          AND Object_ID = Object_ID('css_survey_iteration'))
BEGIN
    ALTER TABLE csp..css_survey_iteration
	ADD BATCH_CUSTOMER_MONTHLY_ID int null
	
END

GO

 
 IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'BATCH_CUSTOMER_MONTHLY_ID'
          AND Object_ID = Object_ID('CSS_QUESTION_REPLIES'))
BEGIN
    ALTER TABLE csp..CSS_QUESTION_REPLIES
	ADD BATCH_CUSTOMER_MONTHLY_ID int null
END

GO
 
 IF NOT EXISTS (SELECT 1 FROM SYS.tables WHERE NAME = 'CSS_BATCH_MONTHLY' AND type='U')
 BEGIN

	CREATE TABLE [dbo].[CSS_BATCH_MONTHLY](
		[ID] [int] IDENTITY(1,1) NOT NULL,
		[MONTH] [int] NOT NULL,
		[YEAR] [int] NOT NULL,
		[START_DATE] [datetime] NOT NULL,
		[END_DATE] [datetime] NOT NULL,
		[STATUS] [varchar](50) NULL,
		[CREATED_BY] [varchar](50) NULL,
		[CREATED_DATE] [datetime] NOT NULL DEFAULT getdate(),
		[UPDATED_BY] [varchar](50) NULL,
		[UPDATED_DATE] [datetime] NOT NULL DEFAULT getdate(),
		[ISACTIVE] [bit] NOT NULL
	) ON [PRIMARY]
END
GO

 IF NOT EXISTS (SELECT 1 FROM SYS.tables WHERE NAME = 'CSS_BATCH_CUSTOMER_MONTHLY' AND type='U')
 BEGIN
 
	CREATE TABLE [dbo].[CSS_BATCH_CUSTOMER_MONTHLY](
		[ID] [int] IDENTITY(1,1) NOT NULL,
		[BATCH_MONTHLY_ID] [int] NOT NULL,
		[CUST_ID] [int] NOT NULL,
		[PROJ_ID] [varchar](225) NULL,
		[QUESTION_MODEL_ID] [int] NOT NULL,
		[EMAIL_ID] [varchar](225) NOT NULL,
		[DISPLAY_NAME] [varchar](225) NOT NULL,
		[PROCESS_STOP] [bit] NOT NULL DEFAULT 0,
		[PROCESS_ENABLED_BY] [varchar](50) NULL,
		[PROCESS_ENABLED_DATE] [datetime] NULL,
		[PROCESS_DISABLED_BY] [varchar](50) NULL,
		[PROCESS_DISABLED_DATE] [datetime] NULL,
		[SURVEY_ID] [int] NULL,
		[SURVEY_SENT_DATE] [datetime] NULL,
		[SURVEY_RECEIVED_DATE] [datetime] NULL,
		[STATUS] [varchar](50) NULL,
		[CREATED_BY] [varchar](50) NULL,
		[CREATED_DATE] [datetime] NOT NULL DEFAULT getdate(),
		[UPDATED_BY] [varchar](50) NULL,
		[UPDATED_DATE] [datetime] NOT NULL DEFAULT getdate(),
		[ISACTIVE] [bit] NOT NULL
	) ON [PRIMARY]
END
GO

 IF NOT EXISTS(SELECT 1 FROM BAS..CONFIGURATION_EXT WHERE [KEY] = 'MONTHLYCSS')
 BEGIN
 INSERT INTO bas..CONFIGURATION_EXT VALUES('MONTHLYCSS','212100001',-1,null,null, 0,1)
 END
 go

  
-- =============================================
-- Author:  <Author,,Name>
-- Create date: <Create Date,,>
-- Description: <Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[usp_update_CSSBatchCustomersMonthly]
 @ID int,  
 @SURVEY_ID int,  
 @SURVEY_SENT_DATE DateTime,  
 @SURVEY_RECEIVED_DATE DateTime null,
 @STATUS varchar(100)
AS
BEGIN
 -- SET NOCOUNT ON added to prevent extra result sets from
 -- interfering with SELECT statements.
 SET NOCOUNT ON;
 
    -- Insert statements for procedure here
 --DELETE FROM APP_ACCESS_CONTROLS where ID in (SELECT * FROM fn_SplitString(@Ids, @Delimiter))
 UPDATE CSS_BATCH_CUSTOMER_MONTHLY SET  
  SURVEY_ID = @SURVEY_ID,
  SURVEY_SENT_DATE = @SURVEY_SENT_DATE,
  SURVEY_RECEIVED_DATE = @SURVEY_RECEIVED_DATE,
  [STATUS] = @STATUS
    WHERE ID = @ID
 
 UPDATE CSS_SURVEY_ITERATION SET  
  [STATUS] = @STATUS
 WHERE ID = @SURVEY_ID
END
go

Declare  @RESOURCEID int = 57

Declare @RescourceName varchar(250) = 'Settings > CSAT Monthly'
 
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,104474,104474)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	 insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474)	

end
go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getSubmitedAssessmentsForCustomerandProject' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getSubmitedAssessmentsForCustomerandProject]
END
GO

  CREATE PROCEDURE                              
  dbo.getSubmitedAssessmentsForCustomerandProject
  @customerId int=0, 
  @projectId varchar(255),
  @serviceAreaId int=0
  
  AS                              
  BEGIN    

  select summ.ASSESSMENT_ID,dtls.SERVICE_AREA_ID,dtls.PROCESS_MODEL_ID,dtls.PROCESS_AREA_ID,dtls.PROCESS_ID
  from 
  CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ 
  inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and summ.ISACTIVE = 1 and summ.ISSUBMITTED = 1 
  and dtls.ISACTIVE = 1 and dtls.ISSUBMITTED = 1
  where summ.CUSTOMER_ID = @customerid and summ.PROJECT_ID = @projectid and (@serviceAreaId=0 or  dtls.SERVICE_AREA_ID = @serviceAreaId) 
 
 End
 go