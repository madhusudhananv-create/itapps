
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllAccounts' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllAccounts]
END
GO

CREATE PROCEDURE  getAllAccounts  
 
AS                                    
BEGIN     
  
  select  '-1' as CUST_ID ,'All' as CUST_NM, 1 as SORT_ORDER      
  union      
  select  '-2' as CUST_ID,'My Accounts' as CUST_NM,2 as SORT_ORDER
  union
  select  '-3' as CUST_ID,'Top 10 Accounts' as CUST_NM,3 as SORT_ORDER      
  union      
  select  '-4' as CUST_ID,'All Accounts Except Top 10 Accounts' as CUST_NM,4 as SORT_ORDER      
  union 
  select  '-5' as CUST_ID,'All GS Lab Accounts' as CUST_NM,5 as SORT_ORDER      
  union      
  select  '-6' as CUST_ID,'GS Lab Key Accounts' as CUST_NM,6 as SORT_ORDER
  
  union      
  select  C.CUST_ID,C.CUST_NM , 7 as SORT_ORDER from CUSTOMER C 
  where c.CUST_ID in (select  distinct P.CUST_ID from PROJECT P where ISNULL(P.PROJ_STATUS,'') != 'Close')        
  order by SORT_ORDER,CUST_NM      

End
GO
