USE BAS 
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
  