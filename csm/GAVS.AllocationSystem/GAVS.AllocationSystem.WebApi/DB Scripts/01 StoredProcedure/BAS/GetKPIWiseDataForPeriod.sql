
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE GetKPIWiseDataForPeriod
END
GO

CREATE PROCEDURE [dbo].[GetKPIWiseDataForPeriod]      
                      
@customerId varchar(50),                                  
@startDate DateTime,                                                
@endDate DateTime ,               
@isCustomer bit = 0   
  
AS           

BEGIN     
  
declare @unclassifiedId int = (select ID from PORTFOLIO where TITLE='Unclassified')  
  
declare  @quarterStartDate Datetime                              
declare @quarterEndDate datetime                              
                              
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                              
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                              
                              
with cte as                                  
(                                    
 SELECT  k.ID ,pp.PORTFOLIO_ID ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT                               
 , k.KPI_NAME, k.PRODUCT_ID                                              
 ,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID                                  
 ,(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=0)   as KPI_NUMERATOR                                     
 ,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=0)   as KPI_DENOMINATOR     
 ,(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=1)   as EXCLUSION_KPI_NUMERATOR                                     
 ,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=1)   as EXCLUSION_KPI_DENOMINATOR                                     
 ,ft.id as FID ,ft.formula               
 , kd.ISFLAG ,KD.ISNODATA                              

fROM KPI K                                                    
LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                             
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                            
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                               
 INNER JOIN PORTFOLIO_PRODUCTS pp on pp.ID = k.PRODUCT_ID and pp.ISACTIVE =1              
 INNER JOIN KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                                  
 INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                                        
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                                  
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                                  
 INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                                       
 where                                    
 K.CUSTOMER_ID  = @customerId  and pp.PORTFOLIO_ID!=@unclassifiedId                
 and isnull(KD.ISDRAFT,0)=0                  
 and k.ISACTIVE =1                   
 and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 ))                                  
  select KPI_NAME                                  
 ,cte.PORTFOLIO_ID                                  
 ,'' as TITLE                                  
 ,max( FID) as FORMULA_ID                                  
 ,max( formula) as FORMULA                                  
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                                  
 , sum(KPI_NUMERATOR) as KPI_NUMERATOR                              
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR       
 , sum(coalesce( EXCLUSION_KPI_NUMERATOR, KPI_NUMERATOR)) as EXCLUSION_KPI_NUMERATOR                                  
 , sum(coalesce(EXCLUSION_KPI_DENOMINATOR,KPI_DENOMINATOR) ) as EXCLUSION_KPI_DENOMINATOR                                  
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))                     
 , EXPECTED_SERVICE_LEVEL=(select EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))                    
 ,cast( MAX(CASE WHEN ISFLAG=1 THEN 1 ELSE 0 END) as bit)as ISNA ,Max(UNIT_OF_MEASUREMENT) as UNIT_OF_MEASUREMENT        
 ,cast( MAX(CASE WHEN ISNODATA = 1 THEN 1 ELSE 0 END) as bit)as ISNODATA                    
  from cte                       
  group by   KPI_NAME, cte.PORTFOLIO_ID                                
  order by   3, 2,1                           
 END
 GO
