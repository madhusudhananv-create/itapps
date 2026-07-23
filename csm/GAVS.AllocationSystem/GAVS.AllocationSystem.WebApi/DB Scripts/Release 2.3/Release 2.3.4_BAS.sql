USE BAS
GO

declare @KEY nvarchar(500) = 'CSAT_INSIGHTS_RESPONSE_PERCENTAGE_LOWER_THRESHOLD'
declare @VALUE nvarchar(500) = 0
declare @CUST_ID int = -1
declare @PROJ_ID varchar(500) = null
declare @COMMENTS varchar(1000) = null
declare @ISENCRYPT bit = 0
declare @ISACTIVE bit = 1
declare @START_DATE datetime = null
declare @END_DATE datetime = null

if not exists (select 1 from BAS..CONFIGURATION_EXT where [KEY]=@KEY)
begin

insert into BAS..CONFIGURATION_EXT values (@KEY,@VALUE,@CUST_ID,@PROJ_ID,@COMMENTS,@ISENCRYPT,@ISACTIVE,@START_DATE,@END_DATE)

end
go

declare @KEY nvarchar(500) = 'CSAT_INSIGHTS_RESPONSE_PERCENTAGE_HIGHER_THRESHOLD'
declare @VALUE nvarchar(500) = 100
declare @CUST_ID int = -1
declare @PROJ_ID varchar(500) = null
declare @COMMENTS varchar(1000) = null
declare @ISENCRYPT bit = 0
declare @ISACTIVE bit = 1
declare @START_DATE datetime = null
declare @END_DATE datetime = null

if not exists (select 1 from BAS..CONFIGURATION_EXT where [KEY]=@KEY)
begin

insert into BAS..CONFIGURATION_EXT values (@KEY,@VALUE,@CUST_ID,@PROJ_ID,@COMMENTS,@ISENCRYPT,@ISACTIVE,@START_DATE,@END_DATE)

end
go
