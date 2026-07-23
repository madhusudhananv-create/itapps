

IF NOT EXISTS(Select 1 from sys.tables where name ='ACCESS_REQUEST' AND type='U')
BEGIN

CREATE TABLE ACCESS_REQUEST (
    ID INT NOT NULL IDENTITY(1,1),
    RESOURCE_ID varchar(100) NOT NULL,
	FEATURE varchar(1000),
	CUST_ID VARCHAR(20),
	PROJ_ID VARCHAR(20),
    ACCESS_LEVEL int,
    [STATUS] VARCHAR(20), 
    APPROVER_ID VARCHAR(50) null,
    APPROVAL_DATE DATETIME null,
    REJECT_REASON VARCHAR(500) null,
	REQUESTED_BY VARCHAR(50) not null,
    REQUESTED_DATE  DATETIME not null,
	CREATED_BY VARCHAR(10),
	CREATED_DATE  DATETIME,
	UPDATED_BY VARCHAR(10),
	UPDATED_DATE DATETIME,
	ISACTIVE bit 
)

END 
GO

IF NOT EXISTS (SELECT 1 FROM configuration_ext WHERE [KEY]='ACCESS_REQUEST_RESOURCE_TOMAIL')
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
    'ACCESS_REQUEST_RESOURCE_TOMAIL',  
    'PEX_Team@neurealm.com, csmplatformsupport@neurealm.com',     
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

IF NOT EXISTS (SELECT 1 FROM configuration_ext WHERE [KEY]='ACCESS_REQUEST_RESOURCE_APPROVERS')
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
    'ACCESS_REQUEST_RESOURCE_APPROVERS',  
    '105848,1004173,GS-2971,1004099',     
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
IF NOT EXISTS(Select 1 from sys.tables where name ='INTEGRATION_REQUEST_DATA' AND type='U')
BEGIN
CREATE TABLE INTEGRATION_REQUEST_DATA(
REQUEST_TYPE VARCHAR(250),
REQUEST_DATA VARCHAR(MAX),
PROJ_ID varchar(20),
IS_PROCESSED BIT,
PROCESSED_DATE DATETIME NOT NULL,
ERROR_INFO VARCHAR(max),
CREATED_BY VARCHAR(20),
CREATED_DATE DATETIME,
UPDATED_BY VARCHAR(20),
UPDATED_DATE DATETIME)
END 
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='PROJECT_SCOPE_VALUES' AND type='U')
BEGIN
CREATE TABLE [dbo].[PROJECT_SCOPE_VALUES](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [PROJ_ID] [varchar](20) NOT NULL,
    [FIELD_NAME] [varchar](255),
    [FIELD_VALUE] [varchar](max),
    [FIELD_TYPE] [varchar](255),
	IS_MANDATORY [bit],
    [ISACTIVE] [bit],
    [CREATED_BY] [varchar](10) NULL,
    [CREATED_DATE] [datetime] NOT NULL,
    [UPDATED_BY] [varchar](10) NULL,
    [UPDATED_DATE] [datetime] NOT NULL
)
END
GO




