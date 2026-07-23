
USE BAS
GO

declare @KEY nvarchar(500) = 'QAGOVERNANCE_DASHBOARD_ASSESSMENT_FINDING_AGE'
declare @VALUE nvarchar(500) = 30
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
