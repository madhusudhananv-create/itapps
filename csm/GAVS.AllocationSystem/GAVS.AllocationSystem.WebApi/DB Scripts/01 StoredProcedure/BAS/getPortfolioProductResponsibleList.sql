USE BAS
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getPortfolioProductResponsibleList' AND TYPE='P')
BEGIN
DROP PROCEDURE getPortfolioProductResponsibleList          
END
GO
 
--[dbo].[getPortfolioProductResponsibleList] '-1',6
CREATE procedure [dbo].[getPortfolioProductResponsibleList]   
@custId varchar(50)='-1' ,
@managementType int=0
As  
Begin  
  
select pp.ID AS PRODUCT_ID,ppr.CUST_ID,   
p.TITLE as Portfolio_Name ,  pp.PRODUCT_TITLE  ,  
iif (ei.FRST_NM is null , cu.DISPLAY_NAME ,ei.FRST_NM) As RESPONSIBLE_NAME,  
iif(ei.EMAIL_ID is null , cu.EMAILID ,ei.EMAIL_ID ) AS MailID    from PORTFOLIO p   
inner join PORTFOLIO_PRODUCTS pp on pp.PORTFOLIO_ID=p.ID   
inner join [PORTFOLIO_PROJECT] PPr on   
PPr.PORTFOLIO_ID=pp.PORTFOLIO_ID  
inner join PRODUCT_RESPONSIBLE pr on pr.PRODUCT_ID=pp.ID   
inner join PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE pm on pm.ID=pr.MANAGEMENT_TYPE   
left join EMP_INFO ei on ei.EMP_ID=pr.EMP_ID   
left join customer_users cu on cu.EMAILID=pr.EMP_ID  
where p.ISACTIVE=1 and pp.ISACTIVE=1 and pr.ISACTIVE=1 and pm.ISACTIVE=1  
AND (ISNULL(@custId,'-1')='-1' OR @custId= ppr.CUST_ID)  
AND (ISNULL(@managementType,0)=0 OR @managementType= pr.MANAGEMENT_TYPE)  
GROUP BY  pp.ID ,ppr.CUST_ID,   
p.TITLE,  pp.PRODUCT_TITLE  ,ei.FRST_NM , cu.DISPLAY_NAME ,ei.EMAIL_ID,cu.EMAILID 
  
END  
  
  
  




 