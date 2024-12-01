
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductResponsibleList' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductResponsibleList
END
GO

Create procedure getProductResponsibleList  

@productId int

As 
Begin  
  
select pr.ID, p.TITLE as Portfolio_Name , pp.PRODUCT_TITLE  ,  
iif (ei.FRST_NM is null , cu.DISPLAY_NAME ,ei.FRST_NM) As Name,  
pm.ID as MANAGEMENT_TYPE_ID,pm.MANAGEMENT_TYPE ,  
iif(ei.EMAIL_ID is null , cu.EMAILID ,ei.EMAIL_ID ) AS MAIL, PR.CREATED_DATE as EFFECTIVE_FROM, PR.CREATED_BY, PR.CREATED_DATE
from PORTFOLIO p inner join PORTFOLIO_PRODUCTS pp on pp.PORTFOLIO_ID=p.ID   
inner join PRODUCT_RESPONSIBLE pr on pr.PRODUCT_ID=pp.ID   
inner join PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE pm on pm.ID=pr.MANAGEMENT_TYPE   
left join EMP_INFO ei on ei.EMP_ID=pr.EMP_ID   
left join customer_users cu on cu.EMAILID=pr.EMP_ID  
where pr.PRODUCT_ID = @productId  and p.ISACTIVE=1 and pp.ISACTIVE=1 and pr.ISACTIVE=1 and pm.ISACTIVE=1  
order by CASE pm.ID
            WHEN 3 THEN 0 -- CSM
            WHEN 2 THEN 1 -- LEAD
            WHEN 1 THEN 2 -- MANAGER
            WHEN 4 THEN 3 -- QUALITYSPOC
            WHEN 5 THEN 4 -- CUSTOMER
            WHEN 6 THEN 5 -- CUSTOMER_CSAT
            ELSE 6        -- Others
        END
End
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEmployeeListfromCustomer' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getEmployeeListfromCustomer
END
GO

Create procedure getEmployeeListfromCustomer  

@customerId varchar(50)

As
begin

Select distinct E.EMP_ID as EMP_ID, e.frst_nm as Name, e.email_id as Mail
from
PROJ_RESOURCE PR inner join EMP_INFO E on PR.EMP_ID = E.EMP_ID
inner join PROJECT P on P.PROJ_ID = PR.PROJ_ID
where P.CUST_ID = @customerId and PR.CURR_INDC='Y' and PR.BILL_FLG=1 and E.DOR IS NULL and E.CSM_TITLE_ID in (1,2) and
pr.end_date > getdate() and isnull(p.proj_status,'') !='close'
order by E.FRST_NM
end
Go

Declare @RESOURCEID int = 94
Declare @EMPID varchar(10) = '104859'
Declare @RescourceName varchar(250) = 'Customer > Product Responsible'

if not exists(select 1 from APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) set @RESOURCEID = (select RESOURCE_ID from APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

if not exists(select 1 from APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,CREATED_DATE,UPDATED_DATE,ACCESS_LEVEL)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,GETDATE(),GETDATE(),1),
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




/****** Object:  Table [dbo].[EXTERNAL_KPI_FORMULAS]    Script Date: 07-06-2023 17:28:30 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
 --DROP TABLE EXTERNAL_KPI_FORMULAS
IF  NOT EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='EXTERNAL_KPI_FORMULAS' AND TYPE='U')
BEGIN 

CREATE TABLE [dbo].[EXTERNAL_KPI_FORMULAS](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[SLA_ID] [varchar](50) NULL,
	PRODUCT_ID int NULL,
	[Rule_Description] [varchar](500) NULL,
	[Formula_Numerator] [varchar](2000) NULL,
	[Formula_Denominator] [varchar](2000) NULL,
	CUSTOMER_ID [varchar](50) NULL,
	[CREATED_BY] [varchar](100) NOT NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[UPDATED_BY] [varchar](100) NOT NULL,
	[UPDATED_DATE] [datetime] NOT NULL,
	[ISACTIVE] [bit] NOT NULL,
 CONSTRAINT [PK_EXTERNAL_KPI_FORMULAS] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]


ALTER TABLE [dbo].[EXTERNAL_KPI_FORMULAS] ADD  CONSTRAINT [DF_EXTERNAL_KPI_FORMULAS_CREATED_DATE]  DEFAULT (getdate()) FOR [CREATED_DATE];


ALTER TABLE [dbo].[EXTERNAL_KPI_FORMULAS] ADD  CONSTRAINT [DF_EXTERNAL_KPI_FORMULAS_UPDATED_DATE]  DEFAULT (getdate()) FOR [UPDATED_DATE];

ALTER TABLE [dbo].[EXTERNAL_KPI_FORMULAS] ADD  CONSTRAINT [DF_EXTERNAL_KPI_FORMULAS_ISACTIVE]  DEFAULT ((1)) FOR [ISACTIVE];

END
 GO


 
IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='EXTERNAL_KPI_DATA' AND COLUMN_NAME='SOURCE' )
  BEGIN

  ALTER TABLE EXTERNAL_KPI_DATA ADD  SOURCE varchar(20) NULL  

  END

GO




/****** Object:  Table [dbo].[KPI_KEYWORDS]    Script Date: 13-06-2023 09:49:05 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF  NOT EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='KPI_KEYWORDS' AND TYPE='U')
BEGIN 
CREATE TABLE [dbo].[KPI_KEYWORDS](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[KPI_ID] [int] NULL,
	[KEYWORD] [varchar](100) NULL,
	[CREATED_BY] [varchar](50) NULL,
	[CREATED_DATE] [date] NULL,
	[UPDATED_BY] [varchar](50) NULL,
	[UPDATED_DATE] [date] NULL,
	[ISACTIVE] [bit] NULL,
 CONSTRAINT [PK_KPI_KEYWORDS] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[KPI_KEYWORDS] ADD  CONSTRAINT [DF_KPI_KEYWORDS_CREATED_DATE]  DEFAULT (getdate()) FOR [CREATED_DATE];

ALTER TABLE [dbo].[KPI_KEYWORDS] ADD  CONSTRAINT [DF_KPI_KEYWORDS_UPDATED_DATE]  DEFAULT (getdate()) FOR [UPDATED_DATE];

ALTER TABLE [dbo].[KPI_KEYWORDS] ADD  CONSTRAINT [DF_KPI_KEYWORDS_ISACTIVE]  DEFAULT ((1)) FOR [ISACTIVE];


END


GO 




IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_KPIReference_ByCustomer' AND TYPE='P')
BEGIN
DROP PROCEDURE usp_get_KPIReference_ByCustomer          
END
GO

CREATE proc [dbo].[usp_get_KPIReference_ByCustomer]                                                    
                                      
 @custId varchar(20),        
 @kpiSLAIds varchar(max)=null, 
 @startDate varchar(20),                                                                        
 @endDate varchar(20)                             
                                                                                    
AS                                                    
BEGIN                                                                                                
                                          
declare @quarterStartDate Datetime                                                
declare @quarterEndDate datetime                                                
                                            
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                                
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                                    
                                                      
;WITH CTE          
AS                                                                          
(                                                                          
select K.ID as KPI_ID, K.FREQUENCY, REFERENCE ,pp.PRODUCT_TITLE  ,K.PRODUCT_ID ,k.MODE_ID                                  
from KPI K                                       
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID  
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID   AND KPSL.ISACTIVE=1                                                                       
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID AND PSL.ISACTIVE=1         
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1                                                                               
where  K.ISACTIVE = 1   AND k.customer_ID=@custId AND (ISNULL(@kpiSLAIds,'')='' OR REFERENCE IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@kpiSLAIds,',')))                                                          
)                                                                      
                                                               
SELECT distinct *  from CTE order by REFERENCE                                                                                 
                                                    
END     
  

GO

 
--select * from APP_ACCESS_CONTROLS
--select * from APP_CONTROLS order by RESOURCE_ID --105683,106257
Declare  @RESOURCEID int = 95
Declare @EMPID varchar(10) = '105683'
Declare @RescourceName varchar(250) = 'Upload KPI Data'

if not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)

set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end 

if not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())
end

if not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
end

GO


if exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = 'Upload KPI Data')
begin  
UPdate APP_CONTROLS
SET RESOURCE_NAME ='Upload External KPIs'
Where RESOURCE_NAME='Upload KPI Data'
End
Go

--select * from APP_ACCESS_CONTROLS
--select * from APP_CONTROLS order by RESOURCE_ID --105683,106257
Declare  @RESOURCEID int = 96
Declare @EMPID varchar(10) = '105683'
Declare @RescourceName varchar(250) = 'Upload KPI Rules'

if not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)

set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end 

if not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())
end

if not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
end




GO



if exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = 'Upload KPI Rules')
begin  
UPdate APP_CONTROLS
SET RESOURCE_NAME ='Upload External Rules'
Where RESOURCE_NAME='Upload KPI Rules'
End
Go


--select * from APP_ACCESS_CONTROLS
--select * from APP_CONTROLS order by RESOURCE_ID --105683,106257
Declare  @RESOURCEID int = 98
Declare @EMPID varchar(10) = '105683'
Declare @RescourceName varchar(250) = 'Process External KPIs'

if not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)

set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end 

if not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())
end

if not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
end


GO 
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EXTERNAL_KPI_DATA_MASTER]') AND type in (N'U'))
BEGIN

CREATE TABLE [dbo].[EXTERNAL_KPI_DATA_MASTER](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[CUST_ID] [varchar](250) NOT NULL,  
	[SOURCE] [varchar](20) NULL,
	[FILE_NAME] varchar(200) NULL,
	[CREATED_BY] [varchar](100) NOT NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[UPDATED_BY] [varchar](100) NOT NULL,
	[UPDATED_DATE] [datetime] NOT NULL,
	[ISACTIVE] [bit] NOT NULL
) ON [PRIMARY] 

ALTER TABLE [dbo].[EXTERNAL_KPI_DATA_MASTER] ADD  DEFAULT (getdate()) FOR [CREATED_DATE]


ALTER TABLE [dbo].[EXTERNAL_KPI_DATA_MASTER] ADD  DEFAULT (getdate()) FOR [UPDATED_DATE]


END
GO


--IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='EXTERNAL_KPI_DATA_MASTER' AND COLUMN_NAME='FILE_NAME' )
--BEGIN
--ALTER TABLE EXTERNAL_KPI_DATA_MASTER ADD  [FILE_NAME] varchar(200)
--END



IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='EXTERNAL_KPI_DATA' AND COLUMN_NAME='MASTER_ID' )
BEGIN
ALTER TABLE EXTERNAL_KPI_DATA ADD  MASTER_ID INT NULL  
END

GO
IF EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='EXTERNAL_KPI_DATA' AND COLUMN_NAME='CUST_ID' )
BEGIN
ALTER TABLE EXTERNAL_KPI_DATA DROP COLUMN   CUST_ID 
END
GO

IF EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='EXTERNAL_KPI_DATA' AND COLUMN_NAME='SOURCE' )
BEGIN
ALTER TABLE EXTERNAL_KPI_DATA  DROP COLUMN  SOURCE 
END

GO

UPDATE  EXTERNAL_KPI_FORMULAS
SET ISACTIVE=0
where Formula_Denominator like '%:is not%'   OR  Formula_Denominator like '%16 Business Days%'
OR Formula_numerator like '%:is not%'   OR  Formula_numerator like '%16 Business Days%'

GO



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_ExternalKPIsToProcess' AND TYPE='P')
BEGIN
DROP PROCEDURE usp_get_ExternalKPIsToProcess          
END
GO
--usp_get_ExternalKPIsToProcess '202100121','freshworks'
CREATE proc [dbo].[usp_get_ExternalKPIsToProcess]    
 @custId varchar(20),                            
 @source varchar(20),
 @startDate smalldatetime,
 @endDate smalldatetime
AS                                                    
BEGIN                       

  SELECT kd.ID,kd.KPI_DATA,kd.INPUT_DATE,kd.IS_PROCESSED,kd.CREATED_BY,kd.CREATED_DATE,kd.UPDATED_BY,kd.UPDATED_DATE,kd.ISACTIVE,kd.MASTER_ID
  FROM EXTERNAL_KPI_DATA KD (NOLOCK)
  INNER JOIN EXTERNAL_KPI_DATA_MASTER KM  (NOLOCK)
  ON KD.MASTER_ID = KM.ID
  WHERE  KM.ISACTIVE =1 AND ((@SOURCE='freshworks' AND KD.IS_PROCESSED<>1) OR @SOURCE='zif') 
  AND KM.SOURCE = @source AND KM.CUST_ID = @custId
                                                    
END     
  
GO