USE BAS
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getConfigExtDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getConfigExtDetails
END
GO


CREATE proc getConfigExtDetails  
as    
 begin    
 select ID,[KEY], [VALUE] , [DESCRIPTION], case when c.CUST_NM is null then 'All' else c.CUST_NM end   as CUSTOMER_NAME , ce.CUST_ID, ce.PROJ_ID, p.PROJ_NM as PROJECT_NAME ,COMMENTS ,     
ISENCRYPT,ISACTIVE,ce.START_DATE, ce.END_DATE from CONFIGURATION_EXT ce   left join CUSTOMER c on c.CUST_ID = ce.CUST_ID    
left join PROJECT p on p.PROJ_ID = ce.PROJ_ID  
where ce.ISACTIVE=1  order by [key]  
end 
 
go
