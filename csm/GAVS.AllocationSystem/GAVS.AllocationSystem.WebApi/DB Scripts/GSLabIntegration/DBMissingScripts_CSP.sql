USE CSP
IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='KPI_DETAILS' AND COLUMN_NAME='ISNODATA' )
  BEGIN

  ALTER TABLE KPI_DETAILS ADD  [ISNODATA] BIT NOT NULL DEFAULT 0 WITH VALUES 

  END

GO


/****** Object:  StoredProcedure [dbo].[insert_tbl_DASHBOARD_DETAILS]    Script Date: 29-11-2022 09:58:04 ******/
DROP PROCEDURE [dbo].[insert_tbl_DASHBOARD_DETAILS]
GO

/****** Object:  StoredProcedure [dbo].[insert_tbl_DASHBOARD_DETAILS]    Script Date: 29-11-2022 09:58:04 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


/****** Object:  StoredProcedure [dbo].[delete_tbl_DASHBOARD_DETAILS]    Script Date: 29-11-2022 10:12:02 ******/
DROP PROCEDURE [dbo].[delete_tbl_DASHBOARD_DETAILS]
GO

/****** Object:  StoredProcedure [dbo].[delete_tbl_DASHBOARD_DETAILS]    Script Date: 29-11-2022 10:12:02 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


  

/****** Object:  UserDefinedTableType [dbo].[DASHBOARD_DETAILS_TYPE]    Script Date: 29-11-2022 09:55:37 ******/
DROP TYPE [dbo].[DASHBOARD_DETAILS_TYPE]
GO

/****** Object:  UserDefinedTableType [dbo].[DASHBOARD_DETAILS_TYPE]    Script Date: 29-11-2022 09:55:38 ******/
CREATE TYPE [dbo].[DASHBOARD_DETAILS_TYPE] AS TABLE(
	[ID] [int] NOT NULL,
	[TITLE] [varchar](max) NOT NULL,
	[CONTENT] [varchar](max) NOT NULL,
	[COLOR] [varchar](50) NULL,
	[COMMENTS] [varchar](max) NULL,
	[CUST_ID] [varchar](50) NULL,
	[PROJ_ID] [varchar](225) NULL,
	[PORTFOLIO_ID] [int] NULL,
	[CREATED_BY] [varchar](50) NOT NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[UPDATED_BY] [varchar](50) NOT NULL,
	[UPDATED_DATE] [datetime] NOT NULL,
	[ISACTIVE] [bit] NOT NULL
)
GO
  
  

  
    
-- =============================================  
-- Author:  <Author,,Name>  
-- Create date: <Create Date,,>  
-- Description: <Description,,>  
-- =============================================  
CREATE PROCEDURE [dbo].[delete_tbl_DASHBOARD_DETAILS]  
 @Table DASHBOARD_DETAILS_TYPE READONLY    
AS  
BEGIN  
 -- SET NOCOUNT ON added to prevent extra result sets from  
 -- interfering with SELECT statements.  
 SET NOCOUNT ON;  
  
    -- Insert statements for procedure here  
 --DELETE FROM APP_ACCESS_CONTROLS where ID in (SELECT * FROM fn_SplitString(@Ids, @Delimiter))  
 DELETE FROM DASHBOARD_DETAILS WHERE ID IN (SELECT ID FROM @Table)  
   
END  
  
  
  
GO


  
-- =============================================  
-- Author:  <Author,,Name>  
-- Create date: <Create Date,,>  
-- Description: <Description,,>  
-- =============================================  
CREATE PROCEDURE [dbo].[insert_tbl_DASHBOARD_DETAILS]  
 @Table dbo.DASHBOARD_DETAILS_TYPE READONLY    
AS  
BEGIN  
 -- SET NOCOUNT ON added to prevent extra result sets from  
 -- interfering with SELECT statements.  
 SET NOCOUNT ON;  
  
    -- Insert statements for procedure here  
 --DELETE FROM APP_ACCESS_CONTROLS where ID in (SELECT * FROM fn_SplitString(@Ids, @Delimiter))  
 INSERT INTO  DASHBOARD_DETAILS (   
    [TITLE]  
      ,[CONTENT]  
      ,[COLOR]  
      ,[COMMENTS]  
      ,[CUST_ID]  
      ,[PROJ_ID]  
      ,[PORTFOLIO_ID]  
      ,[CREATED_BY]  
      ,[CREATED_DATE]  
      ,[UPDATED_BY]  
      ,[UPDATED_DATE]  
      ,[ISACTIVE])  
 select   
    [TITLE]  
      ,[CONTENT]  
      ,[COLOR]  
      ,[COMMENTS]  
      ,[CUST_ID]  
      ,[PROJ_ID]  
      ,[PORTFOLIO_ID]  
      ,[CREATED_BY]  
      ,[CREATED_DATE]  
      ,[UPDATED_BY]  
      ,[UPDATED_DATE]  
      ,[ISACTIVE] from @Table  
   
END  
GO


