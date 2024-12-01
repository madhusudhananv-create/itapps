
USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllAccounts' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllAccounts]
END
GO

CREATE PROCEDURE                              
  dbo.getAllAccounts 
  AS                              
  BEGIN    
  select  -1 as CUST_ID ,'All' as CUST_NM, 1 as SORT_ORDER
  union
  select  -2 as CUST_ID,'Top 15 Accounts' as CUST_NM,2 as SORT_ORDER
  union
  select  C.CUST_ID,C.CUST_NM , 3 as SORT_ORDER from BAS..CUSTOMER C where c.CUST_ID in (select  distinct P.CUST_ID from BAS..PROJECT P where ISNULL(P.PROJ_STATUS,'') <> 'Close')  
  order by SORT_ORDER,CUST_NM
 End
 go

declare @top15Accounts nvarchar(max) =  STUFF((select  ',' + cast(CUST_ID as varchar) from BAS..CUSTOMER where CUST_NM in (
'HDFC Limited',
'Bronx-Lebanon Hospital Center',
'S C Johnson & Son, INC.',
'SCO Family of Services',
'Nationstar Mortgage LLC - Mr.cooper',
'Premier Healthcare Solutions Inc (L80)',
'Frontier Airlines INC',
'Gerber Scientific International Inc',
'Jewish Board of Family and Childrens Services JBFCS',
'Zoll Data Systems',
'Ashley Furniture Industries',
'Hachette Book Group',
'Healthfirst',
'AgFirst Farm Credit Bank')
    for xml path ('')),1,1,'')

declare @KEY nvarchar(500) = 'CSAT_DASHBOARD_TOP_15_ACCOUNTS'
declare @VALUE nvarchar(500) = @top15Accounts
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