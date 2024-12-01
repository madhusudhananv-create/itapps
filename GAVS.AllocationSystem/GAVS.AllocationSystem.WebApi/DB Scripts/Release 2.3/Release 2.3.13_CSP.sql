USE [CSP]
GO

CREATE TABLE [dbo].[CUSTOMER_CAPA_APPROVAL_STATUS](
	[ID] [int] IDENTITY(1,1) NOT NULL,		
	[STATUS] varchar(100) NOT NULL,	
	[ISACTIVE] [bit] NOT NULL
) 

CREATE TABLE [dbo].[CUSTOMER_CAPA_APPROVAL](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[CAPA_ID] [int] NOT NULL,	
	[STATUS_ID] [int]  NULL,
	[REMARKS] [varchar](2000) NULL,
	[CREATED_BY] varchar(100) NOT NULL,
	[CREATED_DATE] [datetime] NOT NULL,
	[UPDATED_BY] varchar(100) NOT NULL,
	[UPDATED_DATE] [datetime] NOT NULL,
	[ISACTIVE] [bit] NOT NULL
) 

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'CAPA_ID'
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_REVIEW'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDING_CAPA_REVIEW  ADD CAPA_ID int null
END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'CAPA_ID'
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_IMPLEMENTATION'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION  ADD CAPA_ID int null
END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'CAPA_ID'
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_VERIFICATION'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDING_CAPA_VERIFICATION  ADD CAPA_ID int null
END
GO

if not exists (select 1 from CUSTOMER_CAPA_APPROVAL_STATUS where STATUS = 'Approve' and ISACTIVE = 1 )
begin
insert into CUSTOMER_CAPA_APPROVAL_STATUS values ('Approve',1)
end
go

if not exists (Select 1 from CUSTOMER_CAPA_APPROVAL_STATUS where STATUS = 'Reject' and ISACTIVE = 1 )
begin
insert into CUSTOMER_CAPA_APPROVAL_STATUS values ('Reject',1)
end
go

if not exists (select 1 from AUDIT_FINDING_STAGES where STAGE_DESCRIPTION = 'APPROVE CAP BY CUSTOMER' and ISACTIVE = 1 )
begin
insert into CSP..AUDIT_FINDING_STAGES values ('APPROVE CAP BY CUSTOMER',1)
end
go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductKPIDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProductKPIDetails]
END
GO

CREATE PROC getProductKPIDetails 
      
@kpiDetailsId int           
                      
AS                      
BEGIN             
  
  select K.CUSTOMER_ID as CUST_ID, KD.KPI_ID , K.MODE_ID, KD.PRODUCT_ID,PP.PORTFOLIO_ID ,PP.PRODUCT_TITLE ,K.KPI_NAME,KD.PERIOD,KD.PERIOD_TYPE from CSP..KPI_DETAILS KD
  join
  csp..kpi K on K.ID = KD.KPI_ID and K.ISACTIVE = 1 and KD.ISACTIVE = 1 and KD.ID = @kpiDetailsId
  join
  CSP..PORTFOLIO_PRODUCTS PP on PP.ID = K.PRODUCT_ID
  --where KD.ID = @kpiDetailsId

 END
 GO

Declare  @RESOURCEID int = 81

Declare @RescourceName varchar(250) = 'Premier Dashboard > CAPA Approval By Customer'
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
	 (@RESOURCEID,4,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,1,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,13,'','','',null,104474,104474,0,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values 
	(@RESOURCEID,'EDIT',null,104474,104474)

end
GO

CREATE TABLE [dbo].[CUST_REQ_STATUS]
( 
ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
STATUS VARCHAR(50) NOT NULL,
CREATED_BY NVARCHAR(20) NOT NULL,
CREATED_DATE DATETIME NOT NULL,
UPDATED_BY NVARCHAR(20) NOT NULL,
UPDATED_DATE DATETIME NOT NULL,
ISACTIVE BIT NOT NULL,
)

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='Not Planned')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('Not Planned','104859',GETDATE(),'104859',GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='Planned')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('Planned',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='Implemented')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('Implemented',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='Not Implemented')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('Not Implemented',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='Partially Implemented')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('Partially Implemented',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='In-Progress')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('In-Progress',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='Cancelled')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('Cancelled',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='Deferred')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('Deferred',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.CUST_REQ_STATUS WHERE STATUS='On-hold')
BEGIN
INSERT INTO dbo.CUST_REQ_STATUS(STATUS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
('On-hold',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.REQ_LEVEL WHERE LEVEL='Country Level')
BEGIN
INSERT INTO dbo.REQ_LEVEL(ID,LEVEL,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
(8,'Country Level',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.REQ_LEVEL WHERE LEVEL='State Level')
BEGIN
INSERT INTO dbo.REQ_LEVEL(ID,LEVEL,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
(9,'State Level',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF NOT EXISTS (SELECT 1 from dbo.REQ_LEVEL WHERE LEVEL='Region Level')
BEGIN
INSERT INTO dbo.REQ_LEVEL(ID,LEVEL,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE) VALUES
(10,'Region Level',104859,GETDATE(),104859,GETDATE(),1)
END 
GO

IF EXISTS (SELECT * FROM dbo.REQ_LEVEL WHERE ID=2)
BEGIN
UPDATE dbo.REQ_LEVEL SET ISACTIVE=1 WHERE ID=2
END
GO

CREATE TABLE [dbo].[CUST_REQ_STAGE_STATUS]
( 
ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
REQ_ID INT NOT NULL,
STATUS VARCHAR (50) NOT NULL,
CREATED_BY NVARCHAR(20) NOT NULL,
CREATED_DATE DATETIME NOT NULL,
UPDATED_BY NVARCHAR(20) NOT NULL,
UPDATED_DATE DATETIME NOT NULL,
ISACTIVE BIT NOT NULL,
)

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getReqStageStatus' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getReqStageStatus]
END
GO

CREATE PROCEDURE  getReqStageStatus  
@ReqId int 
as  
begin  

 select (select top 1 FRST_NM from BAS..EMP_INFO where EMP_ID = stg.UPDATED_BY) [UPDATED_PERSON],  
 Cast( stg.UPDATED_DATE as datetime) [UPDATED_FORMAT_DATE],
 * from CUST_REQ_STAGE_STATUS stg  
 WHERE STG.Req_ID = @ReqId  
 ORDER BY STG.ID  
end  
GO

IF EXISTS (SELECT * FROM dbo.FILTER_PREFERENCE WHERE ID=73 )
BEGIN
update dbo.FILTER_PREFERENCE SET Display_Name='Requirement Reference' , UPDATED_BY=104859, UPDATED_DATE=GETDATE() where ID=73
END
GO

IF EXISTS (SELECT * FROM dbo.FILTER_PREFERENCE WHERE ID=74 )
BEGIN
update CSP..FILTER_PREFERENCE SET Display_Name='Document Title/Revision Number' , UPDATED_BY=104859, UPDATED_DATE=GETDATE() where ID=74
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='CUST_REQ_REF' AND COLUMN_NAME='STATUS' )
BEGIN
ALTER TABLE CUST_REQ_REF ADD  [STATUS] VARCHAR(100)  
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='CUST_REQ_REF' AND COLUMN_NAME='COMMENTS' )
BEGIN
ALTER TABLE CUST_REQ_REF ADD  [COMMENTS] VARCHAR(5000) 
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='CUST_REQ_REF' AND COLUMN_NAME='ISSUES' )
BEGIN
ALTER TABLE CUST_REQ_REF ADD  [ISSUES] VARCHAR(5000) 
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='CUST_REQ_REF' AND COLUMN_NAME='DOCUMENTTARGETDATE' )
BEGIN
ALTER TABLE CUST_REQ_REF ADD  [DOCUMENTTARGETDATE] DATETIME 
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='CUST_REQ_REF' AND COLUMN_NAME='RESPONSIBILITY' )
BEGIN
ALTER TABLE CUST_REQ_REF ADD  [RESPONSIBILITY] NVARCHAR(100) 
END
GO

Declare  @RESOURCEID int = 82

Declare @RescourceName varchar(250) = 'Premier Dashboard > Engagement Level Widget > View Details'
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
	 values (@RESOURCEID,1,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,13,'','','',null,104474,104474,1,0,0,0,0)


end

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values 
	(@RESOURCEID,'VIEW',null,104474,104474)

end
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getEngagementLevelKPI]
END
GO

CREATE PROC getEngagementLevelKPI                                             
                      
@customerId varchar(50),                                            
@startDate Datetime,                                                          
@endDate Datetime,             
@iscustomer bit =0                         
                                            
AS                                                                
BEGIN                                              
declare  @quarterStartDate Datetime                                  
declare @quarterEndDate datetime                                  
                                  
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                  
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                  
                              
select KPI_NAME,                             
count(Product_id) as PRODUCT_COUNT,                          
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,                                              
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,          
SUM(ISNA) as ISNA           
, count(Met_product), sum(met_product)          
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')   
  and count(MET_PRODUCT) > 0   
  then cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,count(MET_PRODUCT)) *100 as decimal(18,3))   
  else IIF(sum(kpi_denominator) != 0,cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3)),0)    
  end as ACHIEVEMENT_VALUE                              
, sum(KPI_NUMERATOR) as KPI_NUMERATOR          
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE            
        , count(*) as cnt  ,
		MAX(SERVICE_LEVEL) as SERVICE_LEVEL
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT                    
from                                                  
(                                                  
select K.KPI_NAME as KPI_NAME,                          
 PP.ID as Product_id,                                              
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,              
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)         
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                    
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                    
  
  
    
      
 CASE WHEN KD.SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS MET_PRODUCT                                                            
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,                            
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT                                                            
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,                            
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA          
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                                 
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR         
  ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM        
 ,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                      
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID             
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )   ,
[SERVICE_LEVEL] = (select SLT.SERVICE_LEVEL from KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID 
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID where KPSL.KPI_ID = k.id)

from KPI K              
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                              
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                           
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                                    
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )                         
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                      
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                       
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1                                                                
          
where   K.CUSTOMER_ID = @customerId      and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)                         
and isnull(KD.ISDRAFT,0)=0         
)a                                              
group by KPI_NAME  order by KPI_NAME          
END 
go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetTrendDataForPortfolio' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[GetTrendDataForPortfolio]
END
GO

CREATE PROC GetTrendDataForPortfolio                  
    
@customerId  varchar(50),            
@kpiName varchar(250),          
@portfolioId int ,
@startDate DateTime,                                        
@endDate DateTime                           
AS                        
BEGIN  

declare  @quarterStartDate Datetime                      
declare @quarterEndDate datetime                      
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                      
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));  
              
with cte as                  
(                    
 SELECT                    
   k.ID                  
   ,PORTFOLIO_ID = (select PORTFOLIO_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)        
   ,PORTFOLIO_NAME = (select TITLE from PORTFOLIO p where p.ID =  @portfolioId and ISACTIVE =1)        
   , k.KPI_NAME                  
   , k.PRODUCT_ID ,Kd.PERIOD  as Period                 
  ,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID                  
 ,  (select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                     
 ,   (select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR                     
 ,ft.id as FID                  
 ,ft.formula ,
 case when kd.sla_status in ('MET','NA','ND') then 1 else 0 end as SLA_Status
                   
                   
 FROM csp..KPI K                                    
          
JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 
and            
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                            
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))
INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                  
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                        
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                  
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                  
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                       
 where                    
 K.CUSTOMER_ID  = @customerId    and  isnull(KD.ISFLAG,0) = 0  and isnull(KD.ISDRAFT,0)=0               
 and k.ISACTIVE =1                  
           
  )                  
 select * into #temp from cte        
        
 IF(@kpiName = '')        
 BEGIN        
 select KPI_NAME,                  
  PORTFOLIO_ID,PORTFOLIO_NAME                  
    ,'' as TITLE,Period    
 ,max( FID) as FORMULA_ID                  
 ,max( formula) as FORMULA                  
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                  
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')     
 and count(SLA_Status) >0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) *100     
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR           
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                    
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(t.ID))                  
                    
  from #temp t where  PORTFOLIO_ID=@portfolioId      and Period <> ''    
  group by KPI_NAME,PORTFOLIO_ID,Period,PORTFOLIO_NAME                  
  order by   3, 2,1                  
 END        
 ELSE        
 BEGIN        
  select                   
    KPI_NAME                  
 , PORTFOLIO_ID,PORTFOLIO_NAME                  
    ,'' as TITLE,Period    
 ,max( FID) as FORMULA_ID                  
 ,max( formula) as FORMULA                  
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                  
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')     
 and count(SLA_Status) >0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) *100     
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR           
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                     
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(t.ID))                  
                    
  from #temp t where KPI_NAME=@kpiName and PORTFOLIO_ID=@portfolioId and Period <> ''         
  group by   KPI_NAME, PORTFOLIO_ID,Period,PORTFOLIO_NAME                  
  order by   3, 2,1                  
  END        
  DROP TABLE #temp        
 END   
 go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTrendDataForEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getTrendDataForEngagementLevelKPI]
END
GO

 CREATE PROC getTrendDataForEngagementLevelKPI  
@customerId  varchar(50),                                            
@startDate Datetime,                                                          
@endDate Datetime,
@kpiName varchar(250),
@iscustomer bit =0 
AS                                                                
BEGIN                                              
declare  @quarterStartDate Datetime                                  
declare @quarterEndDate datetime                                  
                                  
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                  
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                  
                              
select KPI_NAME,  [PERIOD],   
count(Product_id) as PRODUCT_COUNT,
Max(EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,                                              
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,          
SUM(ISNA) as ISNA           
, count(Met_product), sum(met_product)          
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')   
  and count(MET_PRODUCT) > 0   
  then cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,count(MET_PRODUCT)) *100 as decimal(18,3))   
  else IIF(sum(kpi_denominator) != 0,cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3)),0)    
  end as ACHIEVEMENT_VALUE                              
, sum(KPI_NUMERATOR) as KPI_NUMERATOR          
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE            
        , count(*) as cnt  ,
		MAX(SERVICE_LEVEL) as SERVICE_LEVEL
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT                    
from                                                  
(                                                  
select K.KPI_NAME as KPI_NAME,                          
 PP.ID as Product_id,  KD.period as PERIOD,                                            
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,              
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)         
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                    
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                    
  
  
    
      
 CASE WHEN KD.SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS MET_PRODUCT                                                            
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,                            
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT                                                            
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,                            
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA          
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                                 
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR         
  ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM        
 ,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                      
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID             
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )   ,
[SERVICE_LEVEL] = (select SLT.SERVICE_LEVEL from KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID 
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID where KPSL.KPI_ID = k.id)

from KPI K              
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                              
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                           
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                                    
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )                         
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                      
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                       
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1                                                                
          
where   K.CUSTOMER_ID = @customerId      and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)                         
and isnull(KD.ISDRAFT,0)=0 and KPI_NAME = @kpiName        
)a                                              
group by KPI_NAME ,[period] order by KPI_NAME ,[period]         
END 
go

