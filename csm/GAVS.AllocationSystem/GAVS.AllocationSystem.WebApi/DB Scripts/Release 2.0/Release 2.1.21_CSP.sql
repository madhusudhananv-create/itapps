USE CSP

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA' AND type='U')
  BEGIN

  CREATE TABLE IDEA
(
	ID INT IDENTITY(1,1) PRIMARY KEY,
	PROJECT_ID VARCHAR(500),
	SERVICE_AREA_ID INT,
	IDEA_STATUS_ID INT,
	DESCRIPTION VARCHAR(MAX),
	POTENTIAL_SOLUTION_DESCRIPTION VARCHAR(MAX),
	POTENTIAL_SOLUTION_CATEGORY_ID INT,
	IDEA_IMPROVEMENT_TYPE_ID INT,
	IDENTIFIED_BY VARCHAR(500),
	IDENTIFIED_DATE DATETIME,
	PROCESS_AREA_ID INT null,
	PROCESS_ID INT null,
	VERSION_ID INT not null default 1,
	STAGE_ID INT not null default 1,
	COMMENTS VARCHAR(MAX),
	CREATED_BY VARCHAR(100),
	CREATED_DATE DATETIME,
	UPDATED_BY VARCHAR(100),
	UPDATED_DATE DATETIME,
	ISACTIVE BIT,
	ISSUBMITTED BIT,
	review_comments varchar(max)
)
  END

  GO

  IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_STATUS' AND type='U')
  BEGIN
  CREATE TABLE IDEA_STATUS
(
	ID INT IDENTITY(1,1) PRIMARY KEY,
	TITLE VARCHAR(500),
	ISACTIVE BIT
)

END

GO

 IF NOT EXISTS(Select 1 from sys.tables where name ='POTENTIAL_SOLUTION_CATEGORY' AND type='U')
  BEGIN

 CREATE TABLE POTENTIAL_SOLUTION_CATEGORY
(
	ID INT IDENTITY(1,1) PRIMARY KEY,
	TITLE VARCHAR(500),
	ISACTIVE BIT
)

END

GO

 IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_IMPROVEMENT_TYPE' AND type='U')
  BEGIN

  CREATE TABLE IDEA_IMPROVEMENT_TYPE
(
	ID INT IDENTITY(1,1) PRIMARY KEY,
	TYPE VARCHAR(500),
	ISACTIVE BIT
)

END

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_BENEFIT_SUMMARY' AND type='U')
  BEGIN
  CREATE TABLE IDEA_BENEFIT_SUMMARY
		  (
			ID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
			IDEA_ID INT NOT NULL,
			BENEFIT_PILLAR_ID INT, 
			TYPE_ID INT,
			BENEFICIARY_ID INT,
			BENEFIT_TYPE_ID INT,
			CATEGORY_ID INT,
			IS_ONETIME BIT,
			CREATED_BY VARCHAR(100),
			CREATED_DATE DATETIME,
			UPDATED_BY VARCHAR(100),
			UPDATED_DATE DATETIME,
			ISACTIVE BIT
		  )
  END

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='BENEFIT_DETAILS_QUANTITATIVE' AND type='U')
  BEGIN
  CREATE TABLE BENEFIT_DETAILS_QUANTITATIVE
		  (
			ID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
			BENEFIT_SUMMARY_ID INT,
			UOM_ID INT,
			CURRENT_STATE_MONTH DECIMAL(10, 2),
			CURRENT_STATE_YEAR DECIMAL(10, 2),
			FUTURE_STATE_MONTH DECIMAL(10, 2),
			FUTURE_STATE_YEAR DECIMAL(10, 2),
			NET_BENEFITS_MONTH DECIMAL(10, 2),
			NET_BENEFITS_YEAR DECIMAL(10, 2),
			CREATED_BY VARCHAR(100),
			CREATED_DATE DATETIME,
			UPDATED_BY VARCHAR(100),
			UPDATED_DATE DATETIME,
			ISACTIVE BIT
		  )
  END

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='UOM' AND type='U')
  BEGIN
  CREATE table UOM
		  (
			ID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
			TITLE VARCHAR(500),
			DATATYPE VARCHAR(200),
			TYPE VARCHAR(500),
			ISACTIVE BIT
		  )

  END

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_CATEGORY_UOM_MAPPING' AND type='U')
  BEGIN
  CREATE TABLE IDEA_CATEGORY_UOM_MAPPING
		  (
			ID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
			IDEA_CATEGORY_ID INT,
			UOM_ID INT,
			ISACTIVE BIT
		  )
  END

GO


IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_CATEGORY' AND type='U')
  BEGIN
  CREATE TABLE IDEA_CATEGORY
		  (
			ID INT IDENTITY(1,1) PRIMARY KEY,
			BENEFIT_PILLAR_ID INT NOT NULL,
			TITLE VARCHAR(500),
			ISACTIVE BIT
		  )
  END

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='BENEFIT_DETAILS_QUALITATIVE' AND type='U')
  BEGIN
  CREATE TABLE BENEFIT_DETAILS_QUALITATIVE
		  (
			ID INT IDENTITY(1,2) PRIMARY KEY,
			BENEFIT_SUMMARY_ID INT,
			BENEFIT_TITLE VARCHAR(500),
			BENEFIT_DESCRIPTION VARCHAR(MAX),
			TAG CHAR(100),
			CREATED_BY VARCHAR(100),
			CREATED_DATE DATETIME,
			UPDATED_BY VARCHAR(100),
			UPDATED_DATE DATETIME,
			ISACTIVE BIT
		  )

  END

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_IMPLEMENTATION_PLAN' AND type='U')
  BEGIN
  create table IDEA_IMPLEMENTATION_PLAN
		  (
			ID INT IDENTITY(1,1) PRIMARY KEY,
			IDEA_ID INT,
			ESTIMATED_EFFORTS DECIMAL(10,2),
			RESPONSIBLE VARCHAR(100),
			IDEA_STATUS_ID INT,
			ESTIMATED_START_DATE DATETIME,
			ESTIMATED_TARGET_DATE DATETIME,
			ACTUAL_START_DATE DATETIME,
			ACTUAL_END_DATE DATETIME,
			COMMENTS VARCHAR(MAX),
			CREATED_BY VARCHAR(100),
			CREATED_DATE DATETIME,
			UPDATED_BY VARCHAR(100),
			UPDATED_DATE DATETIME,
			ISACTIVE BIT
		  )
  END

  GO

  IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_STAGE_STATUS' AND type='U')
  BEGIN
  CREATE TABLE IDEA_STAGE_STATUS
(
	ID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	IDEA_ID INT NOT NULL,
	ACTION VARCHAR(500),
	COMMENTS  VARCHAR(MAX),
	UPDATED_BY VARCHAR(500),
	UPDATED_DATE DATETIME
)
  END

  GO

IF not exists(SELECT 1 FROM IDEA_STATUS where [TITLE] ='Submitted')
BEGIN
	insert into IDEA_STATUS values ('Submitted', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_STATUS where [TITLE] ='Reviewed')
BEGIN
	insert into IDEA_STATUS values ('Reviewed', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_STATUS where [TITLE] ='Approved')
BEGIN
	insert into IDEA_STATUS values ('Approved', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_STATUS where [TITLE] ='On-Hold')
BEGIN
	insert into IDEA_STATUS values ('On-Hold', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_STATUS where [TITLE] ='Draft')
BEGIN
	insert into IDEA_STATUS values ('Draft', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_STATUS where [TITLE] ='Rejected')
BEGIN
	insert into IDEA_STATUS values ('Rejected', 1)
END

GO

IF not exists(SELECT 1 FROM POTENTIAL_SOLUTION_CATEGORY where [TITLE] ='PCDA')
BEGIN
	insert into POTENTIAL_SOLUTION_CATEGORY values ('PCDA', 1)
END

GO

IF not exists(SELECT 1 FROM POTENTIAL_SOLUTION_CATEGORY where [TITLE] ='PDSA')
BEGIN
	insert into POTENTIAL_SOLUTION_CATEGORY values ('PDSA', 1)
END

GO

IF not exists(SELECT 1 FROM POTENTIAL_SOLUTION_CATEGORY where [TITLE] ='Just do it')
BEGIN
	insert into POTENTIAL_SOLUTION_CATEGORY values ('Just do it', 1)
END

GO

IF not exists(SELECT 1 FROM POTENTIAL_SOLUTION_CATEGORY where [TITLE] ='Lean')
BEGIN
	insert into POTENTIAL_SOLUTION_CATEGORY values ('Lean', 1)
END

GO

IF not exists(SELECT 1 FROM POTENTIAL_SOLUTION_CATEGORY where [TITLE] ='Six Sigma')
BEGIN
	insert into POTENTIAL_SOLUTION_CATEGORY values ('Six Sigma', 1)
END

GO


IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Idea')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Idea', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Continuous Improvement')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Continuous Improvement', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Release')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Release', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Service')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Service', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Service Improvement')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Service Improvement', 1)
END

GO
IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Innovation')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Innovation', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Automation')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Automation', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_IMPROVEMENT_TYPE where [TYPE] ='Process Improvement')
BEGIN
	insert into IDEA_IMPROVEMENT_TYPE values ('Process Improvement', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_CATEGORY_UOM_MAPPING where [ID] =1)
BEGIN
	insert into IDEA_CATEGORY_UOM_MAPPING values (1, 1, 1)
END

GO


IF not exists(SELECT 1 FROM IDEA_CATEGORY_UOM_MAPPING where [ID] =2)
BEGIN
	insert into IDEA_CATEGORY_UOM_MAPPING values (1, 2, 1)
END

GO

IF not exists(SELECT 1 FROM UOM where [TITLE] ='Cost')
BEGIN
	insert into UOM values('Cost', 'In USD', 'IDEA', 1)
END

GO

IF not exists(SELECT 1 FROM UOM where [TITLE] ='Person')
BEGIN
	insert into UOM values('Person', 'In No', 'IDEA', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_CATEGORY  where [TITLE] ='Reduction in FTE')
BEGIN
	insert into IDEA_CATEGORY values (1, 'Reduction in FTE', 1)
END

GO

IF EXISTS(Select 1 from sys.procedures where name ='getUoMForIdeaCategory' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getUoMForIdeaCategory]
END
GO

create procedure
getUoMForIdeaCategory
@category_id varchar(500)
as
begin
(
	select uom.ID as uom_id, uom.TITLE, uom.DATATYPE from IDEA_CATEGORY_UOM_MAPPING mapp
	inner join UOM uom on mapp.UOM_ID = uom.ID and uom.ISACTIVE = 1 and mapp.ISACTIVE = 1
	inner join IDEA_CATEGORY cat on cat.ID = mapp.IDEA_CATEGORY_ID and cat.ISACTIVE = 1 and mapp.ISACTIVE = 1
	where cat.ID in (select * from fn_SplitString(@category_id, ','))
)
end

GO

IF EXISTS(Select 1 from sys.procedures where name ='getServiceAreasForProject' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getServiceAreasForProject]
END
GO

CREATE PROCEDURE getServiceAreasForProject
@proj_id varchar(500)
as
begin
	select sa.ID, sa.TITLE from PROCESS_SERVICE_AREA_PROJECT_MAPPING mapp
	inner join PROCESS_SERVICE_AREA_NEW sa on mapp.SERVICE_AREA_ID = sa.ID and mapp.ISACTIVE = 1 and sa.ISACTIVE = 1
	where mapp.PROJ_ID = @proj_id
end

GO	

IF EXISTS(Select 1 from sys.procedures where name ='getAllIdeas' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeas]
END
GO

CREATE PROCEDURE
getAllIdeas
AS
BEGIN
	select I.ID, I.DESCRIPTION, I.IDENTIFIED_DATE
	,(select top 1 frst_nm from bas..EMP_INFO where EMP_ID = I.IDENTIFIED_BY) [Responsible]
	,(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type]
	,(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]
	,(select top 1 PROJ_NM from BAS..PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]
	 from IDEA I
	 where ISACTIVE = 1
	order by I.IDENTIFIED_DATE desc

END

GO

IF EXISTS(Select 1 from sys.procedures where name ='getIdeaStageStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getIdeaStageStatus]
END
GO

CREATE PROCEDURE
getIdeaStageStatus
@ideaId int
as
begin
	
	select (select top 1 FRST_NM from bas..EMP_INFO where EMP_ID = stg.UPDATED_BY) [UPDATED_PERSON],
	(CONVERT(varchar, stg.UPDATED_DATE, 113)) [UPDATED_FORMAT_DATE],
	* from IDEA_STAGE_STATUS stg
	WHERE STG.IDEA_ID = @ideaId
	ORDER BY STG.ID
end

GO

IF EXISTS(Select 1 from sys.procedures where name ='getIdeabyId' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getIdeabyId]
END
GO

create procedure
getIdeabyId
@id int
as
begin
select  (select top 1 cust_id from bas..PROJECT where PROJ_ID = I.PROJECT_ID) [cust_id],
* from IDEA I where ID = @id and ISACTIVE = 1
end

GO

IF not exists(select 1 from [CSP].[dbo].[APP_CONTROLS] where RESOURCE_ID=53) BEGIN 
     INSERT INTO [CSP].[dbo].[APP_CONTROLS] ([RESOURCE_ID],[RESOURCE_TYPE],[RESOURCE_NAME],[COMMENTS],[CREATED_BY],[CREATED_DATE],[UPDATED_BY],[UPDATED_DATE],[ISACTIVE]) VALUES(53, 'Control', 'Dashboard > BVD Entry', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO

 

     IF not exists(select 1 from [CSP].[dbo].[APP_CONTROL_FEATURES] where RESOURCE_ID=53 and FEATURE='VIEW') 
     BEGIN
     insert into csp.dbo.APP_CONTROL_FEATURES values (53,'VIEW', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO

 

     IF not exists(select 1 from [CSP].[dbo].[APP_ACCESS_CONTROLS] where RESOURCE_ID=53) 
     BEGIN
     insert into csp.dbo.APP_ACCESS_CONTROLS values 
     (53, 1, 1, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 2, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 3, '',null,'', 1,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 4, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 5, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 6, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 7, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 8, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 9, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 10, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (53, 1, 11, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1)
     END 
     GO


