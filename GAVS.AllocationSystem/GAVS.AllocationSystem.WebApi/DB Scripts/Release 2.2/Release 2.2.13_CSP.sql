
USE CSP
GO

--AUDIT_FINDING_STAGES_MAPPING

If  exists(select 1 from sys.columns where name = 'finding_id' AND Object_ID = Object_ID('AUDIT_FINDING_STAGES_MAPPING'))
begin
   
 alter table CSP..AUDIT_FINDING_STAGES_MAPPING alter column finding_id int null
	
end
go

If not exists(select 1 from sys.columns  where name = 'KPI_DETAILS_ID' AND Object_ID = Object_ID('AUDIT_FINDING_STAGES_MAPPING'))
begin
   
  alter table CSP..AUDIT_FINDING_STAGES_MAPPING add  KPI_DETAILS_ID int null
	
end
go


--AUDIT_FINDINGS_CAPA

If  exists(select 1 from sys.columns where name = 'finding_id' AND Object_ID = Object_ID('AUDIT_FINDINGS_CAPA'))
begin
   
 alter table CSP..AUDIT_FINDINGS_CAPA alter column finding_id int null
	
end
go

If not exists(select 1 from sys.columns where name = 'KPI_DETAILS_ID' AND Object_ID = Object_ID('AUDIT_FINDINGS_CAPA'))
begin
   
  alter table CSP..AUDIT_FINDINGS_CAPA add  KPI_DETAILS_ID int null
	
end
go

--AUDIT_FINDING_CAPA_REVIEW

If  exists(select 1 from sys.columns where name = 'finding_id' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_REVIEW'))
begin
   
 alter table CSP..AUDIT_FINDING_CAPA_REVIEW alter column finding_id int null
	
end
go

If not exists(select 1 from sys.columns where name = 'KPI_DETAILS_ID' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_REVIEW'))
begin
   
  alter table CSP..AUDIT_FINDING_CAPA_REVIEW add  KPI_DETAILS_ID int null
	
end
go

--AUDIT_FINDING_CAPA_IMPLEMENTATION
If  exists(select 1 from sys.columns where name = 'finding_id' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_IMPLEMENTATION'))
begin
   
 alter table CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION alter column finding_id int null
	
end
go

If not exists(select 1 from sys.columns where name = 'KPI_DETAILS_ID' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_IMPLEMENTATION'))
begin
   
  alter table CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION add  KPI_DETAILS_ID int null
	
end
go

--AUDIT_FINDING_CAPA_VERIFICATION

If  exists(select 1 from sys.columns where name = 'finding_id' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_VERIFICATION'))
begin
   
 alter table CSP..AUDIT_FINDING_CAPA_VERIFICATION alter column finding_id int null
	
end
go

If not exists(select 1 from sys.columns where name = 'KPI_DETAILS_ID' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_VERIFICATION'))
begin
   
  alter table CSP..AUDIT_FINDING_CAPA_VERIFICATION add  KPI_DETAILS_ID int null
	
end
go

--AUDIT_FINDING_CAPA_STATUS_HISTORY

If  exists(select 1 from sys.columns where name = 'finding_id' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_STATUS_HISTORY'))
begin
   
 alter table CSP..AUDIT_FINDING_CAPA_STATUS_HISTORY alter column finding_id int null
	
end
go

If not exists(select 1 from sys.columns where name = 'KPI_DETAILS_ID' AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_STATUS_HISTORY'))
begin
   
  alter table CSP..AUDIT_FINDING_CAPA_STATUS_HISTORY add  KPI_DETAILS_ID int null
	
end
go

If  not exists(Select 1 from sys.tables where name ='PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE' AND type='U')
BEGIN
CREATE TABLE PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE(
     [ID] [int] IDENTITY(1,1) NOT NULL	,
	 [MANAGEMENT_TYPE] varchar(250) NOT NULL,
	 [CREATED_BY] varchar(100) NOT NULL,
	 [CREATED_DATE] [datetime] NOT NULL default (getdate()),
	 [UPDATED_BY] varchar(100) NULL,
	 [UPDATED_DATE] [datetime] NULL,
	 [ISACTIVE] [bit] NOT NULL default (1)
)
END
GO

If  not exists (select 1 from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE = 'MANAGER' )
Begin
insert into PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE ([MANAGEMENT_TYPE],[CREATED_BY],[UPDATED_BY]) values ('MANAGER',104474,104474)
end

if not exists (select 1 from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE = 'LEAD' )
Begin
insert into PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE ([MANAGEMENT_TYPE],[CREATED_BY],[UPDATED_BY]) values ('LEAD',104474,104474)
end

if not exists (select 1 from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE = 'CSM' )
Begin
insert into PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE ([MANAGEMENT_TYPE],[CREATED_BY],[UPDATED_BY]) values ('CSM',104474,104474)
end

if not exists (select 1 from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE = 'QUALITYSPOC')
Begin
insert into PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE ([MANAGEMENT_TYPE],[CREATED_BY],[UPDATED_BY]) values ('QUALITYSPOC',104474,104474)
end



If  not exists(Select 1 from sys.tables where name ='PRODUCT_RESPONSIBLE' AND type='U')
BEGIN
CREATE TABLE [dbo].[PRODUCT_RESPONSIBLE](
	[ID] [int] IDENTITY(1,1) NOT NULL,	
	[PRODUCT_ID] [int]  NOT NULL,
	[EMP_ID] [int]  NOT NULL,
	[MANAGEMENT_TYPE] int NOT NULL,
	[CREATED_BY] varchar(100) NULL,
	[CREATED_DATE] [datetime] NOT NULL default (getdate()),
	[UPDATED_BY] varchar(100) NULL,
	[UPDATED_DATE] [datetime]  NULL,
	[ISACTIVE] [bit] NOT NULL default (1)
	) 
END
GO

IF EXISTS (SELECT name FROM sys.indexes  
            WHERE name = 'IX_PRODUCT_RESPONSIBLE_PRODUCT_ID')   
    DROP INDEX IX_PRODUCT_RESPONSIBLE_PRODUCT_ID ON csp..[PRODUCT_RESPONSIBLE];   
GO  

CREATE NONCLUSTERED INDEX [IX_PRODUCT_RESPONSIBLE_PRODUCT_ID]
ON [dbo].[PRODUCT_RESPONSIBLE] ([PRODUCT_ID])
GO
 
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductManagerByProductId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProductManagerByProductId]
END
GO

CREATE PROCEDURE [dbo].[getProductManagerByProductId]  
 @productId int
AS  
BEGIN  
 -- SET NOCOUNT ON added to prevent extra result sets from  
 -- interfering with SELECT statements.  
 SET NOCOUNT ON;  

 Select PM.PRODUCT_ID,PP.PRODUCT_TITLE ,E.FRST_NM as RESPONSIBLE_NAME, E.EMP_ID as RESPONSIBLE_EMP_ID
 from 
 CSP..PRODUCT_RESPONSIBLE PM 
 join 
 CSP..PORTFOLIO_PRODUCTS PP on PP.Id = PM.PRODUCT_ID and PP.ISACTIVE = 1 and PM.ISACTIVE = 1
 join 
 BAS..EMP_INFO E on E.EMP_ID = PM.EMP_ID
 where PM.PRODUCT_ID = @productId  and PM.MANAGEMENT_TYPE = 1

 SET NOCOUNT OFF;  
 END
 GO
 -- Temporary table insertion
If exists(Select 1 from sys.tables where name ='table1' AND type='U')
BEGIN
    drop  table table1
END 
GO

create table table1 (Product_Name  varchar(1000),PM_Name Varchar(500))
insert into table1 
select  'Budgeting and Financial Reporting','Sagayaraj Rayappan' union
select  'CognitiveRx','Vineet  Kumar' union
select  'CognitiveRx','Raguraman V' union
select  'ERP','Ruban Salamon' union
select  'ERP L2 Support','Priya MP' union -- Priya Vijayanand
select  'Learning and Certification Platform','Rajeshkanna Palanivelu' union --Rajeshkanna P
select  'PremierConnect Operations','S  Arunkumar' union -- Arun kumar srinivasan
select  'PremierConnect Operations L2 Support','Priya MP' union -- Priya MP
select  'Sourcing & Contract Management','Kiruthiga  .' union -- Kiruthiga  .
select  'Supply Chain Analytics','Puvvada Venugopal' union --Puvvada Venugopal
select  'Web-Based Budgeting and Financial Reporting','Srinivasa Rao GVV' union -- Srinivasa Rao
select  'PremierConnect Operations Migrations','Satish  Podapati' union
select  'PremierConnect Operations Migrations','Deepak Kumar  Y' union
select  'Clinician Performance Mgmt','Punnaivanam  .' union
select  'ImpaQt Gateway','Thyagaraj K' union -- Thyagaraj 
select  'ImpaQt Gateway','Balaji Marripati' union -- Balaji Maripati
select  'Learning and Certification SOW','Rajeshkanna Palanivelu' union -- Rajeshkanna P
select  'Legacy Data Acquisition for QADV and QMR','Vidya Priyadharshini  Karuppaiah' union -- Vidya Karuppaiah
select  'Pay for Performance and StarWatch','Kalaiselvan' union -- Kalaiselvan
select  'PCE Member Applications','Manju Vellaichamy' union -- Manju Vellaisamy
select  'QMR','Anand  Sitaram' union -- Anand
select  'QMR','Devi S' union --   Devi Sundaram
select  'QualityAdvisor','Manju Vellaichamy' union -- Manju Vellaichamy
select  'QualityAdvisor','M Uma Maheswari' union -- M Uma Maheswari
select  'TheraDoc','Priyadharshini  P N' union -- Priyadharshini  P N
select  'TheraDoc Long Term Care','Priyadharshini  P N' union -- Priyadharshini  P N
select  'Entity Management Application Suite','Vidya Priyadharshini  Karuppaiah' union -- -- Vidya  Karuppaiah
select  'PremierConnect Identity (IAM)','George Hamlet Raja P' union -- George Hamlet Raja P
select  'Pulse','Thenmozhi  S' union -- Thenmozhi
select  'Alston - DevSecOps','Aakash Selvaraj' union --Aakash Selvaraj
select  'Alston - DevSecOps','Venkatakrishnan A' union  --Venkatakrishnan A
select  'Bahnson - DBA','NithilRaj Tharammal Paramb' union -- Nithil
select  'Intervention Platform Support','Arun Prasath  K' union -- Arun Prasath  K  Arun Prasath Karnuakaran
select  'PAS Analytics Solution','Arun Prasath  K' union -- Arun Prasath  K
select  'PAS Data Acquisition Support','Arun Prasath  K' union -- Arun Prasath  K
select  'PHD Insights','Arun Prasath  K' union -- Arun Prasath  K
select  'Premier Research Database (PHD)','Arun Prasath  K' union -- Arun Prasath  K
select  'Contigo Analytics','Arun Prasath  K' union -- Arun Prasath  K
select  'Basic Exchange','Sathya Selvam S' union -- Sathya Selvam S
select  'Invoice Management','Sathya Selvam S' union -- Sathya Selvam S
select  'Insights','Dharmeswaran P' union 
select  'Insights','Ranjithkumar Kandasamy'
go

declare ProductManagerCursor cursor  
scroll for  
select Product_Name,PM_Name from table1

Declare @productId int  
Declare @ProductManagerId int
Declare @createdBy varchar(10)= '104474'
Declare @createdDate datetime = getdate()
Declare @productName varchar(1000)
Declare @productMangerName varchar(500)
declare @qualitySpoc int = 104296
declare @csmId int = 100985

open ProductManagerCursor  
  
fetch first from ProductManagerCursor into @productName,@productMangerName


set @productId = (select ID from CSP..PORTFOLIO_PRODUCTS where PRODUCT_TITLE  = @productName  and ISACTIVE = 1)

set @ProductManagerId = case when  @productMangerName = 'Vineet  Kumar' then 104382 when   @productMangerName = 'Arun Prasath  K' then 105024 else 
						(select emp_id from BAS..EMP_INFO where FRST_NM = @productMangerName)  end

-- Manager					

if not exists (select 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID = @productId  and EMP_ID = @ProductManagerId and MANAGEMENT_TYPE = 1 and ISACTIVE = 1 )
begin

 insert into CSP..PRODUCT_RESPONSIBLE  values 
 (@productId,@ProductManagerId,1,@createdBy,@createdDate,@createdBy,@createdDate,1)
end

-- CSM
 if not exists (select 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID = @productId  and EMP_ID = @csmId and MANAGEMENT_TYPE = 3 and ISACTIVE = 1 )
 begin
 insert into CSP..PRODUCT_RESPONSIBLE  values 
 (@productId,@csmId,3,@createdBy,@createdDate,@createdBy,@createdDate,1)
 end
 -- QualitySpoc
 if not exists (select 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID = @productId  and EMP_ID = @qualitySpoc and MANAGEMENT_TYPE = 4 and ISACTIVE = 1 )
 begin
 insert into CSP..PRODUCT_RESPONSIBLE  values 
 (@productId,@qualitySpoc,4,@createdBy,@createdDate,@createdBy,@createdDate,1)
 end
go

while @@FETCH_STATUS=0  
begin 

Declare @productId int  
Declare @ProductManagerId int
Declare @createdBy varchar(10)= '104474'
Declare @createdDate datetime = getdate()
Declare @productName varchar(1000)
Declare @productMangerName varchar(500)
declare @qualitySpoc int = 104296
declare @csmId int = 100985

fetch next from ProductManagerCursor into @productName,@productMangerName

 set @productId = (select ID from CSP..PORTFOLIO_PRODUCTS where PRODUCT_TITLE  = @productName  and ISACTIVE = 1)

 set @ProductManagerId = case when  @productMangerName = 'Vineet  Kumar' then 104382 when   @productMangerName = 'Arun Prasath  K' then 105024 else 
						(select emp_id from BAS..EMP_INFO where FRST_NM = @productMangerName)  end


-- Manager					

if not exists (select 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID = @productId  and EMP_ID = @ProductManagerId and MANAGEMENT_TYPE = 1 and ISACTIVE = 1 )
begin

 insert into CSP..PRODUCT_RESPONSIBLE  values 
 (@productId,@ProductManagerId,1,@createdBy,@createdDate,@createdBy,@createdDate,1)
end

-- CSM
 if not exists (select 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID = @productId  and EMP_ID = @csmId and MANAGEMENT_TYPE = 3 and ISACTIVE = 1 )
 begin
 insert into CSP..PRODUCT_RESPONSIBLE  values 
 (@productId,@csmId,3,@createdBy,@createdDate,@createdBy,@createdDate,1)
 end
 -- QualitySpoc
 if not exists (select 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID = @productId  and EMP_ID = @qualitySpoc and MANAGEMENT_TYPE = 4 and ISACTIVE = 1 )
 begin
 insert into CSP..PRODUCT_RESPONSIBLE  values 
 (@productId,@qualitySpoc,4,@createdBy,@createdDate,@createdBy,@createdDate,1)
 end

end

close ProductManagerCursor  
  
deallocate ProductManagerCursor  
go

If exists(Select 1 from sys.tables where name ='ProductLead' AND type='U')
BEGIN
    drop  table ProductLead
END 
GO

declare @portfolioName varchar(100) = 'Cost Management'
declare @PortfolioLeadEmailId varchar(100) = 'meenakshinathan.k@gavstech.com'
declare @portfolioId int = (select id from CSP..PORTFOLIO where  TITLE = @portfolioName)
declare @PortfolioLeadEmpId int = (select emp_id from BAS..EMP_INFO where EMAIL_ID = @PortfolioLeadEmailId)
declare @qualitySpoc int = 104296
declare @csmId int = 100985

create table ProductLead (productId int,EmpId int,MANAGEMENT_TYPE int, CREATED_BY varchar(10),CREATED_DATE datetime,UPDATED_BY varchar(10) ,UPDATED_DATE datetime,ISACTIVE bit)
insert into ProductLead
select distinct PRODUCT_ID,@PortfolioLeadEmpId,2,'104474',GETDATE(),'104474',GETDATE(), 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID in (select id from CSP..PORTFOLIO_PRODUCTS where PORTFOLIO_ID = @portfolioId) and MANAGEMENT_TYPE = 1


if( (select COUNT(0) from ProductLead) > 0)
Begin

Insert into CSP..PRODUCT_RESPONSIBLE
select * from ProductLead 


truncate table ProductLead

End

--declare @portfolioName varchar(100) 
--declare @PortfolioLeadEmailId varchar(100) 
--declare @portfolioId int 
--declare @PortfolioLeadEmpId int 
--declare @qualitySpoc int = 104296
--declare @csmId int = 100985

set @portfolioName  = 'Clinical Intelligence'
set @PortfolioLeadEmailId  = 'ramesh.jayachandar@gavstech.com'
set @portfolioId  = (select id from CSP..PORTFOLIO where  TITLE = @portfolioName)
set @PortfolioLeadEmpId  = (select emp_id from BAS..EMP_INFO where EMAIL_ID = @PortfolioLeadEmailId)

insert into ProductLead
select distinct PRODUCT_ID,@PortfolioLeadEmpId,2,'104474' , GETDATE(),'104474',GETDATE(), 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID in (select id from CSP..PORTFOLIO_PRODUCTS where PORTFOLIO_ID = @portfolioId)  and MANAGEMENT_TYPE = 1

if( (select COUNT(0) from ProductLead) > 0)
Begin

Insert into CSP..PRODUCT_RESPONSIBLE
select * from ProductLead

End

truncate table ProductLead



--declare @portfolioName varchar(100) 
--declare @PortfolioLeadEmailId varchar(100) 
--declare @portfolioId int 
--declare @PortfolioLeadEmpId int 
--declare @qualitySpoc int = 104296
--declare @csmId int = 100985

set @portfolioName  = 'Development Operations'
set @PortfolioLeadEmailId  = 'ramesh.jayachandar@gavstech.com'
set @portfolioId  = (select id from CSP..PORTFOLIO where  TITLE = @portfolioName)
set @PortfolioLeadEmpId  = (select emp_id from BAS..EMP_INFO where EMAIL_ID = @PortfolioLeadEmailId)

insert into ProductLead
select distinct PRODUCT_ID,@PortfolioLeadEmpId,2,'104474' , GETDATE(),'104474',GETDATE(), 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID in (select id from CSP..PORTFOLIO_PRODUCTS where PORTFOLIO_ID = @portfolioId) and MANAGEMENT_TYPE = 1
select * from productLead

if((select COUNT(0) from ProductLead) > 0)
Begin

Insert into CSP..PRODUCT_RESPONSIBLE
select * from ProductLead

End

truncate table ProductLead

--declare @portfolioName varchar(100) 
--declare @PortfolioLeadEmailId varchar(100) 
--declare @portfolioId int 
--declare @PortfolioLeadEmpId int 
--declare @qualitySpoc int = 104296
--declare @csmId int = 100985

set @portfolioName  = 'PAS' --Premier Applied Sciences
set @PortfolioLeadEmailId  = 'arunprasath.k@gavstech.com'
set @portfolioId  = (select id from CSP..PORTFOLIO where  TITLE = @portfolioName)
set @PortfolioLeadEmpId  = (select EMP_ID from BAS..EMP_INFO where EMAIL_ID = 'arunprasath.k@gavstech.com' and Title = 'Associate Vice President - Customer Success')


insert into ProductLead
select distinct PRODUCT_ID,@PortfolioLeadEmpId,2,'104474' , GETDATE(),'104474',GETDATE(), 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID in (select id from CSP..PORTFOLIO_PRODUCTS where PORTFOLIO_ID = @portfolioId) and MANAGEMENT_TYPE = 1

if((select COUNT(0) from ProductLead) > 0)
Begin

Insert into CSP..PRODUCT_RESPONSIBLE
select * from ProductLead

End

truncate table ProductLead


--declare @portfolioName varchar(100) 
--declare @PortfolioLeadEmailId varchar(100) 
--declare @portfolioId int 
--declare @PortfolioLeadEmpId int 
--declare @qualitySpoc int = 104296
--declare @csmId int = 100985

set @portfolioName  = 'Contigo'
set @PortfolioLeadEmailId  = 'arunprasath.k@gavstech.com'
set @portfolioId  = (select id from CSP..PORTFOLIO where  TITLE = @portfolioName)
set @PortfolioLeadEmpId  = (select EMP_ID from BAS..EMP_INFO where EMAIL_ID = 'arunprasath.k@gavstech.com' and Title = 'Associate Vice President - Customer Success')


insert into ProductLead
select distinct PRODUCT_ID,@PortfolioLeadEmpId,2,'104474' , GETDATE(),'104474',GETDATE(), 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID in (select id from CSP..PORTFOLIO_PRODUCTS where PORTFOLIO_ID = @portfolioId) and MANAGEMENT_TYPE = 1

if((select COUNT(0) from ProductLead) > 0)
Begin

Insert into CSP..PRODUCT_RESPONSIBLE
select * from ProductLead

End

truncate table ProductLead

--declare @portfolioName varchar(100) 
--declare @PortfolioLeadEmailId varchar(100) 
--declare @portfolioId int 
--declare @PortfolioLeadEmpId int 
--declare @qualitySpoc int = 104296
--declare @csmId int = 100985

set @portfolioName  = 'Remitra'
set @PortfolioLeadEmailId  = 'sathya.selvam@gavstech.com'
set @portfolioId  = (select id from CSP..PORTFOLIO where  TITLE = @portfolioName)
set @PortfolioLeadEmpId  = (select emp_id from BAS..EMP_INFO where EMAIL_ID = @PortfolioLeadEmailId)


insert into ProductLead
select distinct PRODUCT_ID,@PortfolioLeadEmpId,2,'104474' , GETDATE(),'104474',GETDATE(), 1 from CSP..PRODUCT_RESPONSIBLE where PRODUCT_ID in (select id from CSP..PORTFOLIO_PRODUCTS where PORTFOLIO_ID = @portfolioId) and MANAGEMENT_TYPE = 1

if((select COUNT(0) from ProductLead) > 0)
Begin

Insert into CSP..PRODUCT_RESPONSIBLE
select * from ProductLead

End
go 



if exists (select 1 from sys.tables where name = 'ProductLead')
begin
drop table ProductLead
end
go
if exists (select 1 from sys.tables where name = 'table1')
begin
drop table table1
end
go 

-- Temporary tables are dropped 

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_servicelevel_Metrics' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_get_servicelevel_Metrics]
END
GO

CREATE proc usp_get_servicelevel_Metrics  
@productId int,                                                
@modeId int,            
@startDate varchar(20),                          
@endDate varchar(20)  
                                  
AS  
BEGIN                                              
Declare @serviceArea int                        
SET @serviceArea = (Select SERVICE_AREA_TYPE_ID from PORTFOLIO_PRODUCTS where ID = @productId)                        
                  
;WITH CTE(KPI_ID,DETAIL_ID,PRODUCT_ID,SERVICE_AREA_ID,MODE_ID,SERVICE_LEVEL_METRICS,PERIOD,SERVICE_LEVEL_METRIC_DESCRIPTION,SERVICE_AREA_TYPE,SERVICE_LEVEL,SLA_CATEGORY,REFERENCE_ID,REFERENCE,EXPECTED_SERVICE_LEVEL,                        
MINIMUM_SERVICE_LEVEL,UNIT_OF_MEASUREMENT,RISK_POOL_ALLOCATION,SPECIFICATION_LIMIT,KPI_ACTUAL,FREQUENCY,SLA_STATUS)                        
AS                        
(                        
select K.ID as KPI_ID,
CASE WHEN K.FREQUENCY='Monthly' then (select ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))  
    
WHEN K.FREQUENCY='Release' then (select  ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))         
 
WHEN K.FREQUENCY='Quarterly' then (select  ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                            
                            
CASE WHEN MONTH(@startDate) between 01 and 03 then CAST(YEAR(@startDate) as varchar) +'-01' +'-01'                            
WHEN MONTH(@startDate) between 04 and 06 then CAST(YEAR(@startDate) as varchar) +'-'+ '04' + '-' +'01'                            
WHEN MONTH(@startDate) between 07 and 09 then CAST(YEAR(@startDate) as varchar) +'-'+ '07' + '-' +'01'                            
WHEN MONTH(@startDate) between 10 and 12 then CAST(YEAR(@startDate) as varchar) +'-'+ '10' + '-' +'01'              
END                            
and                             
CASE WHEN MONTH(@endDate) between 01 and 03 then CAST(YEAR(@endDate) as varchar) +'-03' + '-31'                            
WHEN MONTH(@endDate) between 04 and 06 then CAST(YEAR(@endDate) as varchar) +'-'+ '06' + '-' +'30'                            
WHEN MONTH(@endDate) between 07 and 09 then CAST(YEAR(@endDate) as varchar) +'-'+ '09' + '-' +'30'                            
WHEN MONTH(@endDate) between 10 and 12 then CAST(YEAR(@endDate) as varchar) +'-'+ '12' + '-' +'31'                             
END )                            
END AS DETAIL_ID,

PP.ID as PRODUCT_ID,PSA.ID as SERVICE_AREA_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,KD.PERIOD,PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,                                      
PSA.SERVICE_AREA_TYPE,                        
SLT.SERVICE_LEVEL,SLA.SLA_CATEGORY,PSL.REFERENCE_ID,RM.REFERENCE,                                      
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                      
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                          
K.SLA_TARGET_UNIT_OF_MEASUREMENT,PSL.RISK_POOL_ALLOCATION,                                  
CASE WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 1 Incident Resolution' then                                           
PT.SEVERITY_LEVEL_1                                          
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 2 Incident Resolution' then                                           
PT.SEVERITY_LEVEL_2                                          
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 3 Incident Resolution' then                                           
PT.SEVERITY_LEVEL_3                                          
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Mean Time to Repair / Restore Service (MTTR)' then                                           
PT.MTTR                                          
                        
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Problem Resolution Time' then                                           
PT.PROBLEM_RESOLUTION_TIME                                          
else KT.SPECIFICATION_LIMIT END AS SPECIFICATION_LIMIT,                            
CASE WHEN K.FREQUENCY='Monthly' then (select  KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))    
  
    
          
WHEN K.FREQUENCY='Release' then (select  KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))         
  
    
     
WHEN K.FREQUENCY='Quarterly' then (select KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                            
                            
CASE WHEN MONTH(@startDate) between 01 and 03 then CAST(YEAR(@startDate) as varchar) +'-01' +'-01'                            
WHEN MONTH(@startDate) between 04 and 06 then CAST(YEAR(@startDate) as varchar) +'-'+ '04' + '-' +'01'                            
WHEN MONTH(@startDate) between 07 and 09 then CAST(YEAR(@startDate) as varchar) +'-'+ '07' + '-' +'01'                            
WHEN MONTH(@startDate) between 10 and 12 then CAST(YEAR(@startDate) as varchar) +'-'+ '10' + '-' +'01'              
END                            
and                             
CASE WHEN MONTH(@endDate) between 01 and 03 then CAST(YEAR(@endDate) as varchar) +'-03' + '-31'                            
WHEN MONTH(@endDate) between 04 and 06 then CAST(YEAR(@endDate) as varchar) +'-'+ '06' + '-' +'30'                            
WHEN MONTH(@endDate) between 07 and 09 then CAST(YEAR(@endDate) as varchar) +'-'+ '09' + '-' +'30'                            
WHEN MONTH(@endDate) between 10 and 12 then CAST(YEAR(@endDate) as varchar) +'-'+ '12' + '-' +'31'                             
END )                            
END AS KPI_ACTUAL,                       
                            
K.FREQUENCY,  
CASE WHEN K.FREQUENCY='Quarterly' then (select SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                            
                            
CASE WHEN MONTH(@startDate) between 01 and 03 then CAST(YEAR(@startDate) as varchar) +'-01' +'-01'                            
WHEN MONTH(@startDate) between 04 and 06 then CAST(YEAR(@startDate) as varchar) +'-'+ '04' + '-' +'01'                            
WHEN MONTH(@startDate) between 07 and 09 then CAST(YEAR(@startDate) as varchar) +'-'+ '07' + '-' +'01'                            
WHEN MONTH(@startDate) between 10 and 12 then CAST(YEAR(@startDate) as varchar) +'-'+ '10' + '-' +'01'              
END                            
and                             
CASE WHEN MONTH(@endDate) between 01 and 03 then CAST(YEAR(@endDate) as varchar) +'-03' + '-31'                            
WHEN MONTH(@endDate) between 04 and 06 then CAST(YEAR(@endDate) as varchar) +'-'+ '06' + '-' +'30'                            
WHEN MONTH(@endDate) between 07 and 09 then CAST(YEAR(@endDate) as varchar) +'-'+ '09' + '-' +'30'                            
WHEN MONTH(@endDate) between 10 and 12 then CAST(YEAR(@endDate) as varchar) +'-'+ '12' + '-' +'31'                             
END ) ELSE KD.SLA_STATUS                            
END AS SLA_STATUS                                          
  
from KPI K                                          
                   
join KPI_TARGETS KT on K.ID = KT.KPI_ID and (CONVERT(VARCHAR(20),@startDate,23) >= CONVERT(varchar(20),KT.start_date,23))                            
and (CONVERT(VARCHAR(20),@endDate,23) <= CONVERT(varchar(20),KT.END_DATE,23))                            
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                   
left join KPI_DETAILS KD on K.ID = KD.KPI_ID and KD.ISACTIVE = 1                  
and (CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))                              
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                        
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                  
join REFERENCE_MATRIX RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1            
join PRODUCT_MODE_MAPPING PMP on K.MODE_ID = PMP.MODE_ID  and PMP.PRODUCT_ID=@productId                  
                        
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                        
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                                      
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                                      
                                
                        
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                           
where  K.ISACTIVE = 1 and KT.ISACTIVE = 1                         
and PP.ISACTIVE = 1 and PMP.ISACTIVE =1 and K.PRODUCT_ID = @productId and K.MODE_ID = @modeId                  
)                         
             
SELECT * INTO #TEMPCTE from CTE                        
                        
IF(@serviceArea = 3)                        
 Begin                        
  select * from #TEMPCTE where SERVICE_AREA_ID in(1,2) order by KPI_ID                        
 End                        
ELSE                        
 BEGIN                        
  select * from #TEMPCTE where SERVICE_AREA_ID = @serviceArea order by KPI_ID                      
 END                        
                        
DROP TABLE #TEMPCTE                        
                        
END 
GO

IF EXISTS(select * from sys.tables where name like '%PRODUCT_TIER%')
BEGIN
DROP TABLE PRODUCT_TIER
END
GO

IF NOT EXISTS(select * from sys.tables where name like '%PRODUCT_TIER%')
BEGIN
CREATE TABLE PRODUCT_TIER(ID int IDENTITY(1,1),TIER_ID int,SEVERITY_LEVEL_1 varchar(50)
,SEVERITY_LEVEL_2 varchar(50),SEVERITY_LEVEL_3 varchar(50),SYSTEM_UPTIME decimal(19,2),MTTR varchar(50),
PROBLEM_RESOLUTION_TIME varchar(50))

INSERT INTO PRODUCT_TIER VALUES(1,'1 Business Day','3 Business Days','15 Business days',99.9,'1 Business Day','15 Business days')
INSERT INTO PRODUCT_TIER VALUES(2,'2 Business Days','5 Business Days','20 Business Days',99.5,'2 Business Days','20 Business Days')
INSERT INTO PRODUCT_TIER VALUES(3,'2 Business Days','7 Business Days','30 Business Days',99.0,'2 Business Days','30 Business Days')
INSERT INTO PRODUCT_TIER VALUES(4,'2 Business Days','15 Business Days','45 Business Days',99.0,'2 Business Days','45 Business Days')
 
END
GO
IF EXISTS(select * from KPI where KPI_NAME='System uptime' and isactive = 1)
BEGIN
 UPDATE KPI SET KPI_NAME = 'System Uptime' where KPI_NAME = 'System uptime' and isactive = 1 
END
GO


IF  NOT EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='SUPPORT_VALUE_TYPE' AND TYPE='U')
BEGIN
    Create table SUPPORT_VALUE_TYPE
    (
    Id int not null identity(1,1),
    Value_Type varchar(200) not null,
    Created_date datetime not null,
    Created_by varchar(100) not null,
    Updated_date datetime  null,
    Updated_by varchar(100) null,
    IsActive bit not null
    )
END
GO

IF  NOT EXISTS(SELECT 1 FROM SYS.TABLES WHERE NAME ='SUPPORT_VALUE_REQUEST' AND TYPE='U')
BEGIN
    CREATE TABLE SUPPORT_VALUE_REQUEST
    (
    ID INT NOT NULL IDENTITY(1,1),
    SUPPORT_VALUE_TYPE_ID INT NOT NULL,
    SUPPORT_VALUE VARCHAR(500) NOT NULL, 
    REQUESTED_BY VARCHAR(100) NOT NULL, 
    STATUS INT NOT NULL,
    HANDLED_BY VARCHAR(200) NULL, 
    CREATED_DATE DATETIME NOT NULL,
    CREATED_BY VARCHAR(100) NOT NULL,
    UPDATED_DATE DATETIME  NULL,
    UPDATED_BY VARCHAR(100) NULL,
    ISACTIVE BIT NOT NULL
    )
END
GO



