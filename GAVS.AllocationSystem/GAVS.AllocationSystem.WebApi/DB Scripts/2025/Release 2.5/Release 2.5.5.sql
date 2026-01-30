----------------Ignitirium Employee details Script----------------------

----employee SP-----
IF EXISTS(Select 1 from sys.objects where name ='usp_insert_employee' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_insert_employee]
END
GO

create PROCEDURE [dbo].[usp_insert_employee]      
    
@EMP_ID varchar(100),   
@EMPL_TYPE varchar(30),    
@FRST_NM varchar(100),      
@DOJ datetime,  
@LEVEL varchar(10),    
@TITLE varchar(100),    
@CSM_TITLE varchar(100),    
@EMAIL_ID varchar(100)
     
AS      
BEGIN      
 -- SET NOCOUNT ON added to prevent extra result sets from      
 -- interfering with SELECT statements.      
 SET NOCOUNT ON;        

 DECLARE @CSM_TITLE_ID int;
 SET @CSM_TITLE_ID = CASE 
        WHEN @CSM_TITLE = 'Customer Success Manager' THEN 1
        WHEN @CSM_TITLE = 'Project Manager' THEN 2
        WHEN @CSM_TITLE = 'Quality' THEN 7
        ELSE 3 -- Default value
    END;
    -- Insert statements for procedure here     
-- Only proceed if the EMP_ID does NOT exist in the table
    IF NOT EXISTS (SELECT 1 FROM [EMP_INFO] WHERE [EMP_ID] = @EMP_ID)
    BEGIN
	INSERT INTO EMP_INFO ( [EMP_ID]    
      ,[BASE_CNTRY_ID]    
      ,[EMPL_TYPE]    
      ,[FRST_NM]    
      ,[DOJ]   
	  ,[DOR]
      ,[LEVEL]    
      ,[TITLE]    
      ,[CSM_TITLE_ID]    
      ,[EMAIL_ID]    
      ,[POTENTIAL_TO_BILL]    
      ,[CREATED_BY]    
      ,[CREATED_DATE]    
      ,[UPDATED_BY]    
      ,[UPDATED_DATE]    
      ,[SUPERADMIN]
	  )
    values(    
		@EMP_ID,    
		1,
		@EMPL_TYPE,    
		@FRST_NM ,    
		@DOJ, 
		NULL,
		@LEVEL,    
		@TITLE,    
		@CSM_TITLE_ID,    
		@EMAIL_ID ,  
		0,
		'1001260',    
		GETDATE(),    
		'1001260',     
		GETDATE() ,   
		0		)     
	END
      
END
GO


----Customer SP------
IF EXISTS(Select 1 from sys.objects where name ='usp_insert_customer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_insert_customer]
END
GO
CREATE PROCEDURE [dbo].[usp_insert_customer]  
@CUST_ID varchar(50), @CUST_NM varchar(100), @BUSINESS_UNIT varchar(max)
AS  
BEGIN  
	-- SET NOCOUNT ON added to prevent extra result sets from  
	-- interfering with SELECT statements.  
	SET NOCOUNT ON;    
    -- Insert statements for procedure here  
	-- Only proceed if the EMP_ID does NOT exist in the table
    IF NOT EXISTS (SELECT 1 FROM [CUSTOMER] WHERE [CUST_ID] = @CUST_ID)
	BEGIN
		INSERT INTO CUSTOMER ( CUST_ID, CUST_NM, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE, BUSINESS_UNIT) 
		VALUES ( @CUST_ID, @CUST_NM,'1001260', GETDATE(), '1001260', GETDATE(), @BUSINESS_UNIT ) 
	END
END
GO

-----Project SP------

IF EXISTS(Select 1 from sys.objects where name ='usp_insert_project' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_insert_project]
END
GO
CREATE PROCEDURE [dbo].[usp_insert_project]  
@PROJ_ID varchar(50), 
@PROJ_NM varchar(100),
@START_DATE datetime, 
@END_DATE datetime, 
@BILL_TYPE	bit,
@PROC_TYPE	varchar(50),
@PROJ_BUHEAD_EMP_ID varchar(50), 
@PROJ_DM_EMP_ID varchar(50), 
@PROJ_PM_EMP_ID varchar(50),
@PROJ_AM_EMP_ID varchar(50),
@CUST_ID varchar(50), 
@QUALITY_SPOC varchar(50), 
@PROJ_STATUS varchar(100), 
@BUSINESS_UNIT varchar(250), 
@PROJECT_TYPE varchar(250), 
@REVENUE_TYPE varchar(256), 
@PROJ_EP_ID varchar(200), 
@DP_ID varchar(200), 
@EXECUTION_TYPE varchar(1000), 
@ENGAGAMENT_TYPE varchar(1000),
@Parent_Proj_id varchar(50)

AS  
BEGIN  
	-- SET NOCOUNT ON added to prevent extra result sets from  
	-- interfering with SELECT statements.  
	SET NOCOUNT ON;    
    -- Insert statements for procedure here 
	    IF NOT EXISTS (SELECT 1 FROM [PROJECT] WHERE [PROJ_ID] = @PROJ_ID)
	BEGIN

		INSERT INTO Project (PROJ_ID,CUST_ADDR_ID, BILL_CRNCY_ID, PROJ_NM, START_DATE, END_DATE, BILL_TYPE, PROC_TYPE, PROJ_BUHEAD_EMP_ID, PROJ_DM_EMP_ID, PROJ_PM_EMP_ID, PROJ_AM_EMP_ID, CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE,
		CUST_ID, PARENT_PROJ_ID, QUALITY_SPOC, PROJ_STATUS, BUSINESS_UNIT, PROJECT_TYPE, REVENUE_TYPE, PROJ_EP_ID, DP_ID, EXECUTION_TYPE, ENGAGAMENT_TYPE)
		VALUES ( @PROJ_ID, 1,1
		, @PROJ_NM,
		@START_DATE, @END_DATE, @BILL_TYPE, @PROC_TYPE,
		@PROJ_BUHEAD_EMP_ID, @PROJ_DM_EMP_ID, @PROJ_PM_EMP_ID,@PROJ_AM_EMP_ID,
		'1001260', GETDATE(), '1001260', GETDATE(), @CUST_ID,@Parent_Proj_id, @QUALITY_SPOC,
		@PROJ_STATUS, @BUSINESS_UNIT, @PROJECT_TYPE,
		@REVENUE_TYPE, @PROJ_EP_ID, @DP_ID, @EXECUTION_TYPE, @ENGAGAMENT_TYPE) 
	END
END
GO


IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_CC_LIST_SEAD')
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
    'CSS_CC_LIST_SEAD',  
    'anaz.kabeer@neurealm.com, dhannya.raghunath@neurealm.com',     
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

IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Managed Services I')
BEGIN
INSERT INTO CSS_QUESTION_MODELS (MODEL_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
VALUES
('Managed Services I','CSAT Related questions','1001260',GETDATE(),'1001260',GETDATE(),1)
END


declare @modelId int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation H')

IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE MODEL_ID = @modelId)   
 BEGIN
INSERT INTO CSS_QUESTION_MASTER (MODEL_ID,QUESTION,CREATED_DATE,CREATED_BY, EFFECTIVE_FROM, UPDATED_BY,UPDATED_DATE,ISACTIVE,QUESTION_CATEGORY,
RATING_SCALE,RATING_PARAM,TRIGGER_RCA,SEQUENCE, PERSPECTIVE)
VALUES 

(@modelid,'How satisfied are you with the Overall Experience while working with Neurealm during this period?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
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

(@modelid2,'How satisfied are you with the Overall Experience while working with Neurealm?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
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

(@modelId3,'How satisfied are you with the Overall Experience while working with Neurealm?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
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



declare @modelId4 int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Managed Services I')
IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE MODEL_ID = @modelId4)   
 BEGIN
INSERT INTO CSS_QUESTION_MASTER (MODEL_ID,QUESTION,CREATED_DATE,CREATED_BY, EFFECTIVE_FROM, UPDATED_BY,UPDATED_DATE,ISACTIVE,QUESTION_CATEGORY,
RATING_SCALE,RATING_PARAM,TRIGGER_RCA, SEQUENCE, PERSPECTIVE)
VALUES 

(@modelId4,'How satisfied are you with the Overall Experience while working with Ignitarium (A Neurealm company)?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,'Overall  Experience',1,1,'Overall  Experience'),

(@modelId4,'How satisfied are you on the adherence to agreed Timelines/ SLA for deliverables / services provided?',GETDATE(),'1001260',GETDATE(),'1001260',
GETDATE(),1,'Criteria',2,'Timeline Adherence',1,2,'Timeline Adherence'),

(@modelId4,'How satisfied are you on the Quality of agreed project deliverables/ services provided?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,3,'Quality of deliverables'),

(@modelId4,'How satisfied are you with the Competency of the talents including understanding of business requirements and demonstrating technical expertise?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,4,'Timely Resource Fulfillment'),

(@modelId4,'How satisfied are you with the Risks and Issues managed by the project team and responsiveness to the concerns raised?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',2,NULL,1,5,'Risk Management & Responsiveness'),

(@modelId4,'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Ignitarium (A Neurealm company)?',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),
1,'Criteria',3,NULL,1,6,'Thought Leadership'),

(@modelId4,'Any other feedback / point that you would like to mention here which will help the Project team to serve you better in future? (Optional)',GETDATE(),'1001260',GETDATE(),'1001260',GETDATE(),1,'Others',3,NULL,1,7,'Qualitative feedback')
END


