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
	STAGE_ID INT,
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
			BENEFIT_TYPE_ID INT,
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

IF not exists(SELECT 1 FROM IDEA_CATEGORY_UOM_MAPPING)
BEGIN
	insert into IDEA_CATEGORY_UOM_MAPPING values (1, 1, 1)
	insert into IDEA_CATEGORY_UOM_MAPPING values (1, 2, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (2, 3, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (3, 4, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (4, 4, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (5, 1, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (5, 5, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (5, 6, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (7, 1, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (8, 1, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (9, 1, 1)
	INSERT INTO IDEA_CATEGORY_UOM_MAPPING VALUES (10, 1, 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_STATUS)
BEGIN
	INSERT INTO IDEA_STATUS VALUES ('Draft', 1, 1);
	INSERT INTO IDEA_STATUS VALUES ('Submitted', 1, 1);
	INSERT INTO IDEA_STATUS VALUES ('Implemented', 1, 1);
	INSERT INTO IDEA_STATUS VALUES ('Approved', 4, 1);
	INSERT INTO IDEA_STATUS VALUES ('Rejected', 4, 1);
	INSERT INTO IDEA_STATUS VALUES ('On-Hold', 4, 1);
	INSERT INTO IDEA_STATUS VALUES ('Planned', 5, 1);
	INSERT INTO IDEA_STATUS VALUES ('Completed', 5, 1);
	INSERT INTO IDEA_STATUS VALUES ('On-Hold', 5, 1);
END

GO

IF not exists(SELECT 1 FROM UOM)
BEGIN
	INSERT INTO UOM VALUES ('Cost', 'In USD', 'IDEA', 1)
	INSERT INTO UOM VALUES ('Person', 'In No', 'IDEA', 1)
	INSERT INTO UOM VALUES ('Value', 'In %', 'IDEA', 1)
	INSERT INTO UOM VALUES ('Value', 'In Mins', 'IDEA', 1)
	INSERT INTO UOM VALUES ('FTE Spent','In No','IDEA', 1)
	INSERT INTO UOM VALUES ('Effort', 'In Person hour', 'IDEA', 1)
END

GO

IF not exists(SELECT 1 FROM IDEA_CATEGORY)
BEGIN
	INSERT INTO IDEA_CATEGORY VALUES (1, 1, 'Reduction in FTE', 1)
	INSERT INTO IDEA_CATEGORY VALUES (3, 1, 'Quality - Reduction of Errors', 1)
	INSERT INTO IDEA_CATEGORY VALUES (2, 1, 'Reduction in Cycle Time', 1)
	INSERT INTO IDEA_CATEGORY VALUES (2, 1, 'Reduction in Lead Time', 1)
	INSERT INTO IDEA_CATEGORY VALUES (1, 1, 'Effort Optimization', 1)
	INSERT INTO IDEA_CATEGORY VALUES (1, 2, 'Business value and outcomes', 1)
	INSERT INTO IDEA_CATEGORY VALUES (1, 1, 'Financial Revenue', 1)
	INSERT INTO IDEA_CATEGORY VALUES (1, 1, 'Financial Operating Cost', 1)
	INSERT INTO IDEA_CATEGORY VALUES (1, 1, 'Financial Profitability', 1)
	INSERT INTO IDEA_CATEGORY VALUES (1, 1, 'Customer Savings', 1)
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
  
 @customerid varchar(max),
 @startdate date,      
 @enddate date  
  
 AS      
 BEGIN      
     
    select I.ID, I.DESCRIPTION, I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE]  
   ,(select top 1 frst_nm from bas..EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By]  
  --,(select top 1 frst_nm from bas..EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [Responsible]      
 ,(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],      
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]      
 ,(select top 1 PROJ_NM from BAS..PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]      
  from IDEA I      
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID AND IIP.ISACTIVE = 1      
  join BAS..Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))        
  where I.ISACTIVE = 1 and I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate
  group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,I.IDEA_STATUS_ID,I.PROJECT_ID  
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

	 IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'MILESTONE'
          AND Object_ID = Object_ID('IDEA_IMPLEMENTATION_PLAN'))
	BEGIN
		ALTER TABLE IDEA_IMPLEMENTATION_PLAN
		ADD MILESTONE VARCHAR(500)
	END

	GO

	 IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'DESCRIPTION'
          AND Object_ID = Object_ID('IDEA_IMPLEMENTATION_PLAN'))
	BEGIN
		ALTER TABLE IDEA_IMPLEMENTATION_PLAN
		ADD DESCRIPTION VARCHAR(MAX)
	END

	GO

	

	IF EXISTS(Select 1 from sys.procedures where name ='usp_qualitative_benefits1' AND type='P')
	BEGIN
		   DROP PROCEDURE [dbo].[usp_qualitative_benefits1]
	END
	GO

CREATE PROCEDURE    
usp_qualitative_benefits1    
@beneficiaryid varchar(100),    
@customerid varchar(max),  
@projectid varchar(max),  
@identifiedby varchar(max),
@benefitpillarid varchar(200),      
@startdate date,      
@enddate date      
      
as      
begin      
      
select  BDS.Benefit_title, IBS.TYPE_ID  from BENEFIT_DETAILS_QUALITATIVE BDS        
        
join IDEA_BENEFIT_SUMMARY IBS on IBS.ID = BDS.BENEFIT_SUMMARY_ID AND IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))      
      
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))        
        
join Idea I on IBS.IDEA_ID = I.ID  and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))      
      
join BAS..PROJECT P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))   
  
AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))  
        
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1  and isnull(BDS.Benefit_title,'') <> ''    
      
end
GO

IF EXISTS(Select 1 from sys.procedures where name ='getIdeaStatusCountByImprovementType' AND type='P')
	BEGIN
		   DROP PROCEDURE [dbo].[getIdeaStatusCountByImprovementType]
	END
GO

CREATE PROCEDURE
	getIdeaStatusCountByImprovementType
 @customerid varchar(max),
 @projectid varchar(max),
 @identifiedby varchar(max),
 @startdate date,    
 @enddate date,  
 @beneficiaryid varchar(100),  
 @benefitpillarid varchar(200)  
 as  
 begin  
  SELECT 'Value' [Type], TYPE.TYPE [Improvement Type],  
  SUM(CASE WHEN I.IDEA_STATUS_ID = 2 THEN 1 ELSE 0 END) AS 'Submitted',  
  SUM(CASE WHEN I.IDEA_STATUS_ID = 4 THEN 1 ELSE 0 END) AS 'Execution',  
  SUM(CASE WHEN I.IDEA_STATUS_ID = 3 THEN 1 ELSE 0 END) AS 'Implemented'  
   FROM IDEA_IMPROVEMENT_TYPE TYPE  
  INNER JOIN IDEA I ON I.IDEA_IMPROVEMENT_TYPE_ID = TYPE.ID  AND IDEA_IMPROVEMENT_TYPE_ID IN (6, 7, 8) and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))       
  INNER JOIN BAS..PROJECT P ON I.PROJECT_ID = P.PROJ_ID AND P.END_DATE >= GETDATE()  
  AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))    
  AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))
  WHERE I.IDENTIFIED_DATE >= @startdate AND I.IDENTIFIED_DATE <= @enddate AND I.ISACTIVE = 1  
  AND EXISTS (SELECT 1 FROM IDEA_BENEFIT_SUMMARY WHERE IDEA_ID = I.ID AND ISACTIVE = 1 AND TYPE_ID = 1  
  AND BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))  
  AND BENEFICIARY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,',')))   
  GROUP BY TYPE.TYPE  
  UNION ALL  
  SELECT 'Value_Add' [Type], TYPE.TYPE [Improvement Type],  
  SUM(CASE WHEN I.IDEA_STATUS_ID = 2 THEN 1 ELSE 0 END) AS 'Submitted',  
  SUM(CASE WHEN I.IDEA_STATUS_ID = 4 THEN 1 ELSE 0 END) AS 'Execution',  
  SUM(CASE WHEN I.IDEA_STATUS_ID = 3 THEN 1 ELSE 0 END) AS 'Implemented'  
   FROM IDEA_IMPROVEMENT_TYPE TYPE  
  INNER JOIN IDEA I ON I.IDEA_IMPROVEMENT_TYPE_ID = TYPE.ID  AND IDEA_IMPROVEMENT_TYPE_ID IN (6, 7, 8)  and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))      
  INNER JOIN BAS..PROJECT P ON I.PROJECT_ID = P.PROJ_ID AND P.END_DATE >= GETDATE()  
  AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))    
  AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))
  WHERE I.IDENTIFIED_DATE >= @startdate AND I.IDENTIFIED_DATE <= @enddate AND I.ISACTIVE = 1  
  AND EXISTS (SELECT 1 FROM IDEA_BENEFIT_SUMMARY WHERE IDEA_ID = I.ID AND ISACTIVE = 1 AND TYPE_ID = 2  
  AND BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))  
  AND BENEFICIARY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,',')))   
  GROUP BY TYPE.TYPE  
 end

GO


IF EXISTS(Select 1 from sys.procedures where name ='usp_quantitative_benefits' AND type='P')
	BEGIN
		   DROP PROCEDURE [dbo].[usp_quantitative_benefits]
	END
	GO


CREATE PROCEDURE usp_quantitative_benefits

@beneficiaryid varchar(100),  
@customerid varchar(max),  
@projectid varchar(max),
@identifiedby varchar(max),
@benefitPillarid varchar(200),  
@startdate date,  
@enddate date,  
@uom int   
  
AS  
BEGIN  
  


select CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'   
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'  
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'  
WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'  
WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets'  
  
END Benefit_Pillar,isnull(SUM(BDQ.NET_BENEFITS_YEAR),0) Net_Benefits,IBS.TYPE_ID from BENEFIT_DETAILS_QUANTITATIVE BDQ  
  
join IDEA_BENEFIT_SUMMARY IBS on BDQ.BENEFIT_SUMMARY_ID = IBS.ID and IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))  
  
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))  
  
join Idea I on IBS.IDEA_ID = I.ID  and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))      
  
join UOM U on BDQ.UOM_ID = U.ID and BDQ.UOM_ID = @uom  
  
join BAS..Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))  

AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))
  
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1  and  isnull(BDQ.NET_BENEFITS_YEAR,0) <> 0
  
group by IBS.BENEFIT_PILLAR_ID,IBS.TYPE_ID  


END

GO


	IF EXISTS(Select 1 from sys.procedures where name ='usp_GetAllUOM' AND type='P')
	BEGIN
		   DROP PROCEDURE [dbo].[usp_GetAllUOM]
	END
	GO

CREATE PROCEDURE usp_GetAllUOM

 AS
  
  BEGIN
  
  select ID,Title + '(' + DATATYPE + ')' AS TITLE from UOM where ISACTIVE = 1
  
  END

  GO

IF EXISTS(Select 1 from sys.procedures where name ='usp_quantitative_benefit_monthly' AND type='P')
	BEGIN
		   DROP PROCEDURE [dbo].[usp_quantitative_benefit_monthly]
	END
	GO

CREATE PROCEDURE usp_quantitative_benefit_monthly

@beneficiaryid varchar(100), 
@customerid varchar(max), 
@projectid varchar(max),
@identifiedby varchar(max),
@benefitpillarid varchar(200), 
@startdate date, 
@enddate date, 
@uom int     

AS    
    
BEGIN    



    
select CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'     
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'    
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'    
WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'    
WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets'    
END Benefit_Pillar, FORMAT(I.IDENTIFIED_DATE,'MMM') Months,isnull(SUM(BDQ.NET_BENEFITS_YEAR),0) Net_Benefits,IBS.TYPE_ID    
    
from BENEFIT_DETAILS_QUANTITATIVE BDQ    
    
join IDEA_BENEFIT_SUMMARY IBS on BDQ.BENEFIT_SUMMARY_ID = IBS.ID and IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))    
    
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))     
    
join Idea I on IBS.IDEA_ID = I.ID    and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,','))) 
    
join UOM U on BDQ.UOM_ID = U.ID and BDQ.UOM_ID = @uom    
    
join BAS..Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))   

AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))
    
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1    and  isnull(BDQ.NET_BENEFITS_YEAR,0) <> 0
    
group by IBS.BENEFIT_PILLAR_ID,FORMAT(I.IDENTIFIED_DATE,'MMM'),MONTH(I.IDENTIFIED_DATE),IBS.TYPE_ID    
    
order by MONTH(I.IDENTIFIED_DATE)    
    
    
END 

GO

IF EXISTS(Select 1 from sys.procedures where name ='usp_qualitative_benefits_detail' AND type='P')
BEGIN
 DROP PROCEDURE [dbo].[usp_qualitative_benefits_detail]
END
GO

	    
CREATE PROCEDURE usp_qualitative_benefits_detail

@beneficiaryid varchar(100),        
@customerid varchar(max),          
@projectid varchar(max),
@identifiedby varchar(max),
@benefitpillarid varchar(200),          
@startdate date,          
@enddate date          
       
    
  AS          
    
    BEGIN  
        
select CONVERT(varchar(12),I.IDENTIFIED_DATE,100) AS [Identified_Date],BDS.Benefit_title AS [Benefit_Title],E.FRST_NM AS [Responsible],PSA.TITLE AS [Area],I.DESCRIPTION AS [Idea], IBS.TYPE_ID  from BENEFIT_DETAILS_QUALITATIVE BDS          
          
join IDEA_BENEFIT_SUMMARY IBS on IBS.ID = BDS.BENEFIT_SUMMARY_ID AND IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))        
        
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))          
          
join Idea I on IBS.IDEA_ID = I.ID  and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))              
  
join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  
  
join PROCESS_SERVICE_AREA_NEW PSA on I.SERVICE_AREA_ID = PSA.ID  
  
join BAS..EMP_INFO E on IIP.RESPONSIBLE = E.EMP_ID  
        
join BAS..PROJECT P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))

AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))
          
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1 and isnull(BDS.Benefit_title,'') <> ''       
        
  
  END

GO

IF EXISTS(Select 1 from sys.procedures where name ='usp_quantitative_benefits_detail' AND type='P')
BEGIN
 DROP PROCEDURE [dbo].[usp_quantitative_benefits_detail]
END
GO

CREATE PROCEDURE usp_quantitative_benefits_detail  
  
@beneficiaryid varchar(100),          
@customerid varchar(max),      
@projectid varchar(max),      
@identifiedby varchar(max),
@benefitpillarid varchar(200),            
@startdate date,            
@enddate date,  
@uom int     
            
as            
begin               
        
		
select CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'     
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'    
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'    
WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'    
WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets'    
    
END Benefit_Pillar, CONVERT(varchar(12),I.IDENTIFIED_DATE,100) AS [Identified_Date],SUM(BDQ.NET_BENEFITS_YEAR) AS [Net_Benefits],E.FRST_NM AS [Responsible],PSA.TITLE AS [Area],I.DESCRIPTION AS [Idea],   
  
IBS.TYPE_ID  from BENEFIT_DETAILS_QUANTITATIVE BDQ  
            
join IDEA_BENEFIT_SUMMARY IBS on IBS.ID = BDQ.BENEFIT_SUMMARY_ID AND IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))          
          
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))            
            
join Idea I on IBS.IDEA_ID = I.ID   and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))          
  
join UOM U on BDQ.UOM_ID = U.ID and BDQ.UOM_ID = @uom    
    
join BAS..PROJECT P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))          

AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))
  
join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID    
    
join PROCESS_SERVICE_AREA_NEW PSA on I.SERVICE_AREA_ID = PSA.ID    
    
join BAS..EMP_INFO E on IIP.RESPONSIBLE = E.EMP_ID    
          
  
            
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1          
  
group by IBS.BENEFIT_PILLAR_ID,CONVERT(varchar(12),I.IDENTIFIED_DATE,100),E.FRST_NM,PSA.TITLE,I.DESCRIPTION,IBS.TYPE_ID  
          
    
  END

  GO

  IF EXISTS(Select 1 from sys.procedures where name ='usp_updateIdeaStatus' AND type='P')
BEGIN
 DROP PROCEDURE [dbo].usp_updateIdeaStatus
END
GO

CREATE PROCEDURE usp_updateIdeaStatus

@Id varchar(max),
@Status varchar(50)
as

Begin

IF(@Status = 'Approve')

Begin

Update IDEA SET IDEA_STATUS_ID = 4 where ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Id,','))


End

ELSE IF(@Status = 'Reject')

Begin

Update IDEA SET IDEA_STATUS_ID = 5 where ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Id,','))



End
  select I.ID, I.DESCRIPTION, I.IDENTIFIED_DATE,IIP.ESTIMATED_TARGET_DATE [TARGET_DATE]  
   ,(select top 1 frst_nm from bas..EMP_INFO where EMP_ID = I.IDENTIFIED_BY)[Identified_By],  
  (select top 1 frst_nm from bas..EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [Responsible]      
 ,(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],      
  I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]      
 ,(select top 1 PROJ_NM from BAS..PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]      
  from IDEA I      
  left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID       
  --join BAS..Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))        
  where I.ISACTIVE = 1      
 order by I.IDENTIFIED_DATE desc        
 

End

GO

  IF EXISTS(Select 1 from sys.procedures where name ='getIdentifiedBy' AND type='P')
BEGIN
 DROP PROCEDURE [dbo].getIdentifiedBy
END
GO


 CREATE PROCEDURE getIdentifiedBy
 @customerid varchar(max)
 
 AS
 BEGIN

 
  Select E.FRST_NM, E.EMP_ID, C.CUST_NM, C.CUST_ID from IDEA I  
 join BAS..PROJECT P on P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))    
 join BAS..customer C on P.CUST_ID = C.CUST_ID  
 join BAS..emp_info E on I.IDENTIFIED_BY = e.emp_id  
 group by E.FRST_NM, E.EMP_ID, C.CUST_NM, C.CUST_ID
 order by E.FRST_NM 
 
 END
 GO

   IF EXISTS(Select 1 from sys.procedures where name ='getImplementedIdea' AND type='P')
BEGIN
 DROP PROCEDURE [dbo].getImplementedIdea
END
GO

CREATE PROC getImplementedIdea  
  
@Id int  
  
AS  
  
BEGIN  
  
select  P.CUST_ID,P.PROJ_ID AS PROJECT_ID,I.IDENTIFIED_DATE,PSA.TITLE AS PROCESS_AREA,I.DESCRIPTION,IIP.ACTUAL_START_DATE,IIP.ESTIMATED_START_DATE,IDS.TITLE AS STATUS,E.FRST_NM AS RESPONSIBLE    
from IDEA I  
inner join PROCESS_SERVICE_AREA_NEW PSA on PSA.ID = I.SERVICE_AREA_ID  
inner join BAS..PROJECT P on P.PROJ_ID = I.PROJECT_ID  
inner join IDEA_IMPLEMENTATION_PLAN IIP on IIP.IDEA_ID = I.ID  
inner join BAS..EMP_INFO E on IIP.RESPONSIBLE = E.EMP_ID  
inner join IDEA_STATUS IDS on IDS.ID = I.IDEA_STATUS_ID  
  
where I.ID = @Id and I.ISACTIVE = 1  
  
  
END

GO
 
 
    
IF not exists(select 1 from [CSP].[dbo].[APP_CONTROLS] where RESOURCE_ID=54) BEGIN
INSERT INTO [CSP].[dbo].[APP_CONTROLS] ([RESOURCE_ID],[RESOURCE_TYPE],[RESOURCE_NAME],[COMMENTS],[CREATED_BY],[CREATED_DATE],[UPDATED_BY],[UPDATED_DATE],[ISACTIVE])
VALUES(54, 'Control', 'Dashboard > CSM Dashboard', null, 103245, GETDATE(), 103245, GETDATE(),1)
END
GO

 select * from APP_CONTROLS order by RESOURCE_ID desc
 IF not exists(select 1 from [CSP].[dbo].[APP_CONTROL_FEATURES] where RESOURCE_ID=54 and FEATURE='VIEW')
BEGIN
insert into csp.dbo.APP_CONTROL_FEATURES values (54,'VIEW', null, 103245, GETDATE(), 103245, GETDATE(),1)
END
GO

 IF not exists(select 1 from [CSP].[dbo].[APP_ACCESS_CONTROLS] where RESOURCE_ID=54)
BEGIN
insert into csp.dbo.APP_ACCESS_CONTROLS values
(54, 1, 1, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 2, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 3, '',null,'', 1,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 4, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 5, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 6, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 7, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 8, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 9, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 10, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1),
(54, 1, 11, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='IDEA' and [FIELD_NAME] = 'description')
BEGIN
INSERT INTO FILTER_PREFERENCE VALUES('IDEA','description','Description','string',1,0,0,null,104211,GETDATE(),104211,GETDATE(),1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='IDEA' and [FIELD_NAME] = 'type')
BEGIN

INSERT INTO FILTER_PREFERENCE VALUES('IDEA','type','Type','number',1,0,0,null,104211,GETDATE(),104211,GETDATE(),1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='IDEA' and [FIELD_NAME] = 'projecT_NAME')
BEGIN
INSERT INTO FILTER_PREFERENCE VALUES('IDEA','projecT_NAME','Project','number',1,0,0,null,104211,GETDATE(),104211,GETDATE(),1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='IDEA' and [FIELD_NAME] = 'identified_By')
BEGIN
INSERT INTO FILTER_PREFERENCE VALUES('IDEA','identified_By','Identified By','number',1,0,0,null,104211,GETDATE(),104211,GETDATE(),1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='IDEA' and [FIELD_NAME] = 'responsible')
BEGIN
INSERT INTO FILTER_PREFERENCE VALUES('IDEA','responsible','Responsible','string',1,0,0,null,104211,GETDATE(),104211,GETDATE(),1)
END
GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='IDEA' and [FIELD_NAME] = 'status')
BEGIN
INSERT INTO FILTER_PREFERENCE VALUES('IDEA','status','Status','number',1,0,0,null,104211,GETDATE(),104211,GETDATE(),1)
END
GO