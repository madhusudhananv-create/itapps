IF EXISTS(Select 1 from sys.procedures where name ='getListofPlannedAudits' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getListofPlannedAudits]
END
GO

USE CSP
GO

CREATE PROCEDURE getListofPlannedAudits          
  @custid int,          
  @projid nvarchar(500)          
  AS          
  BEGIN          
 select t.ID, description, priority, t.SCHEDULED_START_DATE, t.DUE_DATE, t.SCHEDULED_DURATION, t.ACTUAL_DURATION, t.ACTUAL_START_DATE, t.ACTUAL_END_DATE, t.STATUS, t.CUST_ID, t.PROJ_ID, asch.AUDITOR_EMP_ID, asref.[KEY], asref.VALUE from task t          
 LEFT join AUDIT_SCHEDULE asch on  asch.title = t.DESCRIPTION and asch.cust_id = t.CUST_ID and asch.proj_id = t.PROJ_ID and (t.PARENT_TASK_ID = asch.TASK_ID OR T.ID = asch.TASK_ID) and  asch.ISACTIVE =1 and t.ISACTIVE =1          
 LEFT join AUDIT_SCHEDULE_REF asref on asref.AUDIT_SCHEDULE_ID = asch.ID and asref.ISACTIVE =1          
 where t.CUST_ID = @custid and t.PROJ_ID = @projid and t.TASK_CATEGORY_ID  IN (SELECT OPTIONS FROM PARAMETER_TABLE WHERE NAME = 'AUDIT_CATEGORY')   
 and  T.STATUS != 'CANCELLED'
       
 order by t.id         
 END 

 GO

 USE CSP
 GO

IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsForCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsForCustomer]
END
GO

USE CSP
GO


CREATE PROCEDURE getAllFindingsForCustomer
  @custid int,
  @projids varchar(max)
  as
  begin
  with cte1 as
  (
   SELECT *,
         ROW_NUMBER() OVER (PARTITION BY finding_id ORDER BY stage_id DESC) AS rn1
   FROM AUDIT_FINDING_STAGES_MAPPING where ISCOMPLETE = 1 and ISACTIVE = 1
   ),
   cte2 as
   (
	select *, ROW_NUMBER() OVER (PARTITION BY audit_id ORDER BY created_date DESC) as rn2
	from AUDIT_CHECKLIST_PROJECT_EXECUTION exe where ISACTIVE = 1 and ISSUBMITTED = 1
   )

   SELECT find.ID, find.FINDING_TYPE, find.FINDING_DESCRIPTION, find.CREATED_DATE, find.UPDATED_DATE, stage.STAGE_DESCRIPTION, cte1.STAGE_STATUS, 
   cte2.CUSTOMER_ID, cte2.PROJECT_ID, c.CUST_NM, p.PROJ_NM, pp.PORTFOLIO_ID, port.TITLE as PORTFOLIO_NAME
	FROM cte1
	inner join AUDIT_CHECKLIST_PROJECT_FINDINGS find  on cte1.FINDING_ID = find.ID and find.ISACTIVE = 1 and issubmitted = 1
	inner join AUDIT_FINDING_STAGES stage on stage.id = cte1.STAGE_ID and stage.ISACTIVE = 1
	inner join cte2 on cte2.AUDIT_ID = 	find.AUDIT_ID
	inner join BAS..CUSTOMER c on c.CUST_ID = cte2.CUSTOMER_ID and c.CUST_ID = @custid
	inner join BAS..PROJECT p on p.PROJ_ID = cte2.PROJECT_ID and (@projids = '' or p.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projids,',')))
	left join PORTFOLIO_PROJECT pp on pp.PROJ_ID = p.proj_id and pp.ISACTIVE = 1
	left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1
	WHERE rn1 = 1 and rn2 = 1 
	order by find.ID
  end

  GO

  USE [CSP]
  GO

  IF NOT EXISTS(Select 1 from sys.tables where name ='CUST_REQ_REF' AND type='U')
  BEGIN

CREATE TABLE [dbo].[CUST_REQ_REF](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Applicability_Level] [int] NOT NULL,
	[Customer_Project_Name] [nvarchar](1000) NOT NULL,
	[Category_Id] [nvarchar](500) NOT NULL,
	[Doc_Req_Reference] [nvarchar](2000) NOT NULL,
	[Doc_Revision_No] [nvarchar](2000) NULL,
	[Doc_Revision_Date] [datetime] NULL,
	[Requirement_Title] [nvarchar](2000) NOT NULL,
	[Requirement_Desc] [nvarchar](max) NOT NULL,
	[Compliance_fulfilment] [nvarchar](max) NOT NULL,
	[Compliance_Evaluation_Criteria] [nvarchar](max) NOT NULL,
	[Documents_Evidence] [nvarchar](max) NOT NULL,
	[Owner] [nvarchar](50) NOT NULL,
	[Published_On] [datetime] NULL,
	[Amended_On] [datetime] NULL,
	[Concerned_Authority] [nvarchar](2000) NULL,
	[Created_By] [nvarchar](50) NULL,
	[Created_Date] [datetime] NOT NULL,
	[Updated_By] [nvarchar](50) NULL,
	[Updated_Date] [datetime] NOT NULL,
	[isActive] [bit] NOT NULL,
 CONSTRAINT [PK_CUST_REQ_REF] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

  END

  GO
  

  IF NOT EXISTS(Select 1 from sys.tables where name ='REQ_CAT_MAPPING' AND type='U')
  BEGIN

  CREATE TABLE [dbo].[REQ_CAT_MAPPING](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[REQ_REF_ID] [int] NOT NULL,
	[REQ_CAT_ID] [int] NOT NULL,
	[Created_By] [nvarchar](100) NULL,
	[Created_Date] [datetime] NOT NULL,
	[Updated_By] [nvarchar](100) NULL,
	[Updated_Date] [datetime] NOT NULL,
	[isActive] [bit] NOT NULL,
 CONSTRAINT [PK_REQ_CAT_MAPPING] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

  END

  GO
  USE CSP

  IF NOT EXISTS(Select 1 from sys.tables where name ='REQ_LEVEL_MAPPING' AND type='U')
  BEGIN

	  CREATE TABLE [dbo].[REQ_CAT_MAPPING](
		[ID] [int] IDENTITY(1,1) NOT NULL,
		[REQ_REF_ID] [int] NOT NULL,
		[REQ_CAT_ID] [int] NOT NULL,
		[Created_By] [nvarchar](100) NULL,
		[Created_Date] [datetime] NOT NULL,
		[Updated_By] [nvarchar](100) NULL,
		[Updated_Date] [datetime] NOT NULL,
		[isActive] [bit] NOT NULL,
	 CONSTRAINT [PK_REQ_CAT_MAPPING] PRIMARY KEY CLUSTERED 
	(
		[ID] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

  END

  GO

  IF NOT EXISTS(Select 1 from sys.tables where name ='REQ_CATEGORY' AND type='U')
  BEGIN

	  CREATE TABLE [dbo].[REQ_CATEGORY](
		[ID] [int] NOT NULL,
		[Category] [nvarchar](100) NOT NULL,
		[Created_By] [nvarchar](100) NULL,
		[Created_Date] [datetime] NOT NULL,
		[Updated_By] [nvarchar](100) NULL,
		[Updated_Date] [datetime] NOT NULL,
		[isActive] [bit] NOT NULL,
	 CONSTRAINT [PK_REQ_CATEGORY] PRIMARY KEY CLUSTERED 
	(
		[ID] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='REQ_LEVEL' AND type='U')
  BEGIN

	  CREATE TABLE [dbo].[REQ_LEVEL](
		[ID] [int] NOT NULL,
		[Level] [nvarchar](100) NOT NULL,
		[Created_By] [nvarchar](100) NULL,
		[Created_Date] [datetime] NOT NULL,
		[Updated_By] [nvarchar](100) NULL,
		[Updated_Date] [datetime] NOT NULL,
		[isActive] [bit] NOT NULL,
	 CONSTRAINT [PK_REQ_LEVEL] PRIMARY KEY CLUSTERED 
	(
		[ID] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
	) ON [PRIMARY]

END

GO
USE CSP
GO
IF not exists(SELECT 1 FROM REQ_CATEGORY where [Category] ='SoW')
BEGIN
	INSERT [dbo].[REQ_CATEGORY] ([ID], [Category], [Created_By], [Created_Date], [Updated_By], [Updated_Date], [isActive]) VALUES (1, N'SoW', N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), 1)
END

GO
USE CSP
GO

IF not exists(SELECT 1 FROM REQ_CATEGORY where [Category] ='MSA')
BEGIN
	INSERT [dbo].[REQ_CATEGORY] ([ID], [Category], [Created_By], [Created_Date], [Updated_By], [Updated_Date], [isActive]) VALUES (2, N'MSA', N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), 1)
END

GO
USE CSP
GO

IF not exists(SELECT 1 FROM REQ_CATEGORY where [Category] ='Security-Exhibit')
BEGIN
	INSERT [dbo].[REQ_CATEGORY] ([ID], [Category], [Created_By], [Created_Date], [Updated_By], [Updated_Date], [isActive]) VALUES (3, N'Security-Exhibit', N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), 1)
END

GO
USE CSP
GO

IF not exists(SELECT 1 FROM REQ_CATEGORY where [Category] ='Legal')
BEGIN
	INSERT [dbo].[REQ_CATEGORY] ([ID], [Category], [Created_By], [Created_Date], [Updated_By], [Updated_Date], [isActive]) VALUES (4, N'Legal', N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), 1)
END

GO
USE CSP
GO

IF not exists(SELECT 1 FROM REQ_CATEGORY where [Category] ='Statutory')
BEGIN
	INSERT [dbo].[REQ_CATEGORY] ([ID], [Category], [Created_By], [Created_Date], [Updated_By], [Updated_Date], [isActive]) VALUES (5, N'Statutory', N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), N'103724', CAST(N'2020-07-06T10:28:25.340' AS DateTime), 1)
END

GO

USE CSP
GO

IF not exists(SELECT 1 FROM REQ_LEVEL where [Level] ='Account Level')
BEGIN
	INSERT [dbo].[REQ_LEVEL] ([ID], [Level], [Created_By], [Created_Date], [Updated_By], [Updated_Date], [isActive]) VALUES (1, N'Account Level', N'103724', CAST(N'2020-07-06T10:28:41.997' AS DateTime), N'103724', CAST(N'2020-07-06T10:28:41.997' AS DateTime), 1)
END

GO

USE CSP

GO

IF not exists(SELECT 1 FROM REQ_LEVEL where [Level] ='Project Level')
BEGIN
	INSERT [dbo].[REQ_LEVEL] ([ID], [Level], [Created_By], [Created_Date], [Updated_By], [Updated_Date], [isActive]) VALUES (2, N'Project Level', N'103724', CAST(N'2020-07-06T10:28:41.997' AS DateTime), N'103724', CAST(N'2020-07-06T10:28:41.997' AS DateTime), 1)
END
GO

IF EXISTS(Select 1 from sys.procedures where name ='getAllFindingsByTimeforCustomer' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllFindingsByTimeforCustomer]
END
GO

USE CSP
GO

CREATE procedure     
  getAllFindingsByTimeforCustomer    
  As begin    
    
  with cte1 as    
  (    
  select accept.finding_id, findings.FINDING_TYPE, findings.FINDING_DESCRIPTION, accept.status, accept.remarks, mapp.STAGE_ID, stage.STAGE_DESCRIPTION, mapp.STAGE_STATUS,     
  accept.created_date, exe.customer_id, exe.project_id,    
  ROW_NUMBER() OVER (PARTITION BY mapp.finding_id order by mapp.stage_id) as rn1 from AUDITEE_ACCEPTANCE accept    
  inner join AUDIT_FINDING_STAGES_MAPPING mapp on accept.finding_id = mapp.FINDING_ID and mapp.ISCOMPLETE = 0 and mapp.ISACTIVE = 1    
      
  and  accept.isactive = 1 and Month(accept.created_date) = Month(GETDATE()) and YEAR(accept.created_date) = YEAR(GETDATE())    
  inner join AUDIT_CHECKLIST_PROJECT_FINDINGS findings on findings.ID = mapp.FINDING_ID and findings.ISACTIVE = 1    
  inner join AUDIT_CHECKLIST_PROJECT_EXECUTION exe on exe.AUDIT_ID = findings.AUDIT_ID    
  inner join AUDIT_FINDING_STAGES stage on stage.ID = mapp.STAGE_ID and stage.ISACTIVE = 1  
  )    
    
  select *,    
  case when status = 'Reject' then 'Reject'    
    when DATEDIFF(week, created_date, GETDATE()) <= 1 then 'week1'    
    when DATEDIFF(week, created_date, GETDATE()) = 2 then 'week2'     
    when DATEDIFF(week, created_date, GETDATE()) = 3 then 'week3'    
    when DATEDIFF(week, created_date, GETDATE()) >= 4 then 'week4'    
 end as WeekStatus    
      
   from cte1 where rn1= 1    
  order by WeekStatus    
    
  end

 GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='PROJECT_FINDINGS' and [FIELD_NAME] = 'findinG_TYPE')
BEGIN
	insert into FILTER_PREFERENCE values ('PROJECT_FINDINGS', 'findinG_TYPE', 'Finding Type', 'string', 1, 0, 0, null, 103242, getdate(), 103245, GETDATE(), 1)
END

GO

USE CSP

GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='PROJECT_FINDINGS' and [FIELD_NAME] = 'findinG_DESCRIPTION')
BEGIN
	insert into FILTER_PREFERENCE values ('PROJECT_FINDINGS', 'findinG_DESCRIPTION', 'Finding Description', 'string', 1, 0, 0, null, 103242, getdate(), 103245, GETDATE(), 1)
END
GO

USE CSP

GO

IF not exists(SELECT 1 FROM FILTER_PREFERENCE where [TABLE_NAME] ='PROJECT_FINDINGS' and [FIELD_NAME] = 'stagE_DESCRIPTION')
BEGIN
	insert into FILTER_PREFERENCE values ('PROJECT_FINDINGS', 'stagE_DESCRIPTION', 'Stage description', 'number', 1, 0, 0, null, 103242, getdate(), 103245, GETDATE(), 1)
END
GO


