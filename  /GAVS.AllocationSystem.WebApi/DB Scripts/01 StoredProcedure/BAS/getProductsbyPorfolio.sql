IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductsbyPorfolio' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProductsbyPorfolio]
END
GO

CREATE procedure getProductsbyPorfolio 
 
@portfolio integer ,
@custid varchar(25) 
  
as       
begin       
 
select pp.ID, PORTFOLIO_ID,p.TITLE as Portfolio,pp.CUST_ID,c.CUST_NM,PRODUCT_TITLE,pp.SERVICE_AREA_TYPE_ID,psa.SERVICE_AREA_TYPE,pp.TIER_ID,
pt.MTTR ,pmm.MODE_ID , pslm.MODE_TITLE,pslm.MODE_TYPE, IS_SERVICE_COMMENCED,
SERVICE_COMMENCEMENT_DATE = case when IS_SERVICE_COMMENCED= 0 then NULL else PP.SERVICE_COMMENCEMENT_DATE end,
pp.CREATED_BY,pp.UPDATED_BY,pp.CREATED_DATE,pp.UPDATED_DATE,pp.ISACTIVE 
from PORTFOLIO_PRODUCTS pp     (NOLOCK)   
inner join PORTFOLIO p  (NOLOCK) on p.ID=pp.PORTFOLIO_ID       
left  join CUSTOMER c   (NOLOCK) on c.CUST_ID=pp.CUST_ID       
left join PRODUCT_MODE_MAPPING pmm on pmm.PRODUCT_ID = pp.ID 
left join PRODUCT_TIER pt on pt.TIER_ID=pp.TIER_ID 
left join PRODUCTS_SERVICE_LEVEL_MODE pslm on pslm.ID=pmm.MODE_ID 
inner join PRODUCTS_SERVICE_AREA psa on psa.ID=pp.SERVICE_AREA_TYPE_ID 
where (@portfolio IS NULL OR PORTFOLIO_ID=@portfolio)  and pp.CUST_ID = @custid and pp.ISACTIVE=1 and p.ISACTIVE=1 order by PRODUCT_TITLE     

END
Go
