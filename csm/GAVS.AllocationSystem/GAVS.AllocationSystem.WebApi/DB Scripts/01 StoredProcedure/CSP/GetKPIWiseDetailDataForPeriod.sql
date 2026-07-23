USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetKPIWiseDetailDataForPeriod
END
GO

CREATE PROC  GetKPIWiseDetailDataForPeriod                                    
@customerId VARCHAR(50),                                                
@startDate DateTime,                                                                  
@endDate DateTime    ,                                        
@isCustomer bit = 0       
      
AS                      
                                
BEGIN                          
      
declare @unclassifiedId int = (select ID from CSP..PORTFOLIO where TITLE='Unclassified')      
                   
                                          
declare  @quarterStartDate Datetime                                                
declare @quarterEndDate datetime                                                
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                                
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                                
with cte as                                                    
(                                                      
 SELECT k.ID                                                   
 ,k.KPI_NAME,PORTFOLIO_ID, k.PRODUCT_ID,psl.SERVICE_LEVEL_METRIC_DESCRIPTION,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID,                                            
 PSA.SERVICE_AREA_TYPE ,                        
(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 0)   as KPI_NUMERATOR                                                       
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 0)   as KPI_DENOMINATOR                         
                        
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 1)   as EXCLUSION_KPI_NUMERATOR                                                       
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 1)   as EXCLUSION_KPI_DENOMINATOR                            
 ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,PSLT.SERVICE_LEVEL                                            
 ,ft.id as FID,ft.formula ,PP.TIER_ID ,RM.REFERENCE,                           
  case when kd.sla_status in ('MET','NA','NT') then 1 else 0 end as SLA_Status                                          
 , case when isnull(kd.ISFLAG,0) = 1 then  1 else 0 end as Cnt                                
 , case when isnull(kd.ISNODATA,0) = 1 then  1 else 0 end as NDCnt ,                          
case when coalesce(nullif(kd.EXCLUSION_SLA_STATUS,''), SLA_STATUS) in ('MET','NA','NT') then 1 else 0 end as EXCLUSION_SLA_STATUS                          
 FROM csp..KPI K                                                                      
 --INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                                    
 INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1  and kd.ISACTIVE = 1    and                                    
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                                                      
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                                               
  INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                                                    
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                                  
  INNER JOIN REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1                                      
  INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                                                          
  INNER JOIN PRODUCTS_SERVICE_LEVEL_TYPE PSLT on PSL.SERVICE_LEVEL_TYPE_ID = PSLT.ID                                            
  INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1                                                       
 INNER JOIN PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                                                        
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                                                    
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                                                    
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                                                         
 where                                                      
 K.CUSTOMER_ID  = @customerId  and pp.PORTFOLIO_ID!=@unclassifiedId   and   isnull(KD.ISDRAFT,0)= 0                                              
 and k.ISACTIVE =1     and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )                                                  
 )                                             
  select                                                      
    KPI_NAME                                                    
  ,SERVICE_AREA_TYPE   , PORTFOLIO_ID                                  
 ,sum(SLA_Status)     , count(SLA_Status)                                  
 ,CATEGORY = (select SHORT_DESC from GLOBAL_KPI_CATEGORY GC join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING GKC on                                            
 GC.ID = GKC.GLOBAL_KPI_CATEGORY_ID join KPI k on K.GLOBAL_KPI_CATEGORY_ID=GKC.GLOBAL_KPI_CATEGORY_ID where K.ID = max(cte.ID))                                            
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                                                    
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')                               
 and count(SLA_Status) > 0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) * 100                               
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR                                     
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                         
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')                               
 and count(EXCLUSION_SLA_STATUS) > 0 then convert(decimal,sum(EXCLUSION_SLA_STATUS))/CONVERT(decimal, count(EXCLUSION_SLA_STATUS)) * 100                               
 else sum(case when isnull( EXCLUSION_KPI_NUMERATOR,0)!=0 then EXCLUSION_KPI_NUMERATOR else  KPI_NUMERATOR end ) end as EXCLUSION_KPI_NUMERATOR                                     
 , sum(coalesce (EXCLUSION_KPI_DENOMINATOR, KPI_DENOMINATOR)) as EXCLUSION_KPI_DENOMINATOR                              
, count(*) as cnt                            
 ,MINIMUM_SERVICE_LEVEL = (select CASE WHEN isnull(MINIMUM_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then                                     
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)                                    
 ELSE MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))                                    
 ,EXPECTED_SERVICE_LEVEL = (select CASE WHEN isnull(EXPECTED_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then                                     
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)                                    
 ELSE EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))                                    
 ,UNIT_OF_MEASUREMENT,SERVICE_LEVEL,max( FID) as FORMULA_ID                                                    
 ,max( formula) as FORMULA, max(REFERENCE) as REFERENCE                         
 , case when count(*) = sum(cnt) then convert(bit,1)  else convert(bit,0) end as ISNA                             
, case when count(*) = sum(cnt) + sum(NDCnt) and sum(NDCnt) > 0 then convert(bit,1)  else convert(bit,0) end as ISNODATA                            
  from cte  --where PORTFOLIO_ID=2                                     
  group by   KPI_NAME, PORTFOLIO_ID, SERVICE_AREA_TYPE,UNIT_OF_MEASUREMENT,SERVICE_LEVEL                                       
  order by   SERVICE_AREA_TYPE,REFERENCE                                    
 END 
 GO