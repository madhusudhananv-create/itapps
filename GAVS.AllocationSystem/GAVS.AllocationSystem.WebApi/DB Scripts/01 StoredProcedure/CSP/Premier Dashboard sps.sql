GetKPIWiseDataForPeriod 212100001,'2022-10-01','2022-10-31',0                             
use csp
 

 ALTER PROC GetKPIWiseDataForPeriod  --212100001,'2022-07-01','2022-07-31',0                             
                  
@customerId varchar(50),                              
@startDate DateTime,                                            
@endDate DateTime ,           
@isCustomer bit = 0                   
                                    
AS                                    
BEGIN     

declare @unclassifiedId int = (select ID from CSP..PORTFOLIO where TITLE='Unclassified')

declare  @quarterStartDate Datetime                          
declare @quarterEndDate datetime                          
                          
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                          
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                          
                          
with cte as                              
(                                
 SELECT  k.ID ,pp.PORTFOLIO_ID ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT                           
 , k.KPI_NAME, k.PRODUCT_ID                                          
 ,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID                              
 ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=0)   as KPI_NUMERATOR                                 
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=0)   as KPI_DENOMINATOR 
 ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=1)   as EXCLUSION_KPI_NUMERATOR                                 
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and is_exclusion=1)   as EXCLUSION_KPI_DENOMINATOR                                 
 ,ft.id as FID ,ft.formula           
 , kd.ISFLAG ,KD.ISNODATA                          
 --,Tier_ID = (select TIER_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)                              
fROM csp..KPI K                                                
LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                         
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                        
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                           
                  inner join csp..PORTFOLIO_PRODUCTS pp on pp.ID = k.PRODUCT_ID and pp.ISACTIVE =1          
 INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                              
 INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                                    
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                              
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                              
 INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                                   
 where                                
 K.CUSTOMER_ID  = @customerId   and pp.PORTFOLIO_ID!=@unclassifiedId  --and  isnull(KD.ISFLAG,0)=0               
 and isnull(KD.ISDRAFT,0)=0              
 and k.ISACTIVE =1               
 and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )                      
           
)                              
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
  group by   KPI_NAME, cte.PORTFOLIO_ID--,cte.Tier_ID                              
  order by   3, 2,1                       
 END   
 go


 GetKPIWiseDetailDataForPeriod 212100001,'2022-10-01','2022-10-31',0  

 use csp

ALTER PROC  GetKPIWiseDetailDataForPeriod                            
@customerId int,                                        
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
  case when kd.sla_status in ('MET','NA','ND') then 1 else 0 end as SLA_Status                                  
 , case when isnull(kd.ISFLAG,0) = 1 then  1 else 0 end as Cnt                        
 , case when isnull(kd.ISNODATA,0) = 1 then  1 else 0 end as NDCnt ,                  
case when coalesce(nullif(kd.EXCLUSION_SLA_STATUS,''), SLA_STATUS) in ('MET') then 1 else 0 end as EXCLUSION_SLA_STATUS                  
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
 K.CUSTOMER_ID  = @customerId  and pp.PORTFOLIO_ID!=@unclassifiedId   and   isnull(KD.ISDRAFT,0)= 0                                      
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



getProductWiseKPICount  212100001,'2022-10-01','2022-10-31',0  

 ALTER PROC getProductWiseKPICount                                   
                
@customerId varchar(50),                                      
@startDate Datetime,                                                    
@endDate Datetime ,               
        @isCustomer bit = 0                              
AS                                      
BEGIN                                      
           
declare @unclassifiedId int = (Select ID from CSP..PORTFOLIO_PRODUCTS where PRODUCT_TITLE='SDC16 Managed Services')

Declare @quarterStartDate DateTime                        
Declare @quarterEndDate DateTime                        
                        
Set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0))                        
Set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1))                        
                        
select PRODUCT_ID,PRODUCT_TITLE,MODE_ID,                                    
count(kpi_id) as OVERALL_KPI_COUNT,sum(MET_KPIS) as SLA_STATUS,sum(SECONDARY_MET_KPIS) as SECONDARY_SLA_STATUS , sum(EXCLUSION_MET_KPIS) as EXCLUSION_SLA_STATUS,   sum(KEY_KPI) as KEY_KPI ,sum(CRITICAL_KPI) as CRITICAL_KPI,                                
    
sum(MET_KEY_KPI) as MET_KEY_KPI,sum(MET_CRITICAL_KPI) as MET_CRITICAL_KPI,                
sum(SECONDARY_MET_KEY_KPI) as SECONDARY_MET_KEY_KPI,sum(SECONDARY_MET_CRITICAL_KPI) as SECONDARY_MET_CRITICAL_KPI,    
    
sum(EXCLUSION_MET_KEY_KPI) as EXCLUSION_MET_KEY_KPI,sum(EXCLUSION_MET_CRITICAL_KPI) as EXCLUSION_MET_CRITICAL_KPI,                
sum(EXCLUSION_SECONDARY_MET_KEY_KPI) as EXCLUSION_SECONDARY_MET_KEY_KPI,sum(EXCLUSION_SECONDARY_MET_CRITICAL_KPI) as EXCLUSION_SECONDARY_MET_CRITICAL_KPI               
from                                      
(                                      
 SELECT PP.ID as PRODUCT_ID,PP.PRODUCT_TITLE,K.MODE_ID,                                    
K.ID as KPI_ID                                     
,CASE WHEN (KD.SLA_STATUS = 'MET' or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END AS MET_KPIS    
,CASE WHEN (KD.SECONDARY_SLA_STATUS = 'MET' or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END AS SECONDARY_MET_KPIS      
,CASE WHEN (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end   = 'MET' or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END AS EXCLUSION_MET_KPIS                                                  
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 then 1 END as KEY_KPI                                      
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_KEY_KPI                                      
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SECONDARY_SLA_STATUS = 'Met'  or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_KEY_KPI     
    
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_MET_KEY_KPI                                      
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (case when isnull(KD.EXCLUSION_SECONDARY_SLA_STATUS,'') !='' then kd.EXCLUSION_SECONDARY_SLA_STATUS else  KD.SECONDARY_SLA_STATUS end = 'Met'  or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_SECONDARY_MET_KEY_KPI     
                                     
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 then 1 END as CRITICAL_KPI                                      
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_CRITICAL_KPI                                                    
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SECONDARY_SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_CRITICAL_KPI     
    
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_MET_CRITICAL_KPI                                                    
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (case when isnull(KD.EXCLUSION_SECONDARY_SLA_STATUS,'') !='' then kd.EXCLUSION_SECONDARY_SLA_STATUS else  KD.SECONDARY_SLA_STATUS end = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_SECONDARY_MET_CRITICAL_KPI                                                    
FROM KPI K                                                   
                                            
inner JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and kd.isactive =1                                                              
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                  
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID   and PP.ISACTIVE =1                                   
where  K.CUSTOMER_ID = @customerId  and PP.ID!=@unclassifiedId  -- and isnull(KD.ISFLAG,0)= 0       
and isnull(KD.ISDRAFT,0)=0                                                   
and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 ) and                                    
((K.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                    
or(K.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))            
)a                                      
group by PRODUCT_ID,PRODUCT_TITLE,MODE_ID                                     
order by PRODUCT_TITLE                                    
END   
GO

use csp

getEngagementLevelKPI 212100001,'2022-10-01','2022-10-31',0  

    
      
ALTER PROC getEngagementLevelKPI                                                 
                          
@customerId varchar(50),                                                
@startDate Datetime,                                                              
@endDate Datetime,                 
@iscustomer bit =0                             
                                                
AS                                                                    
BEGIN                                                  
declare  @quarterStartDate Datetime                                      
declare @quarterEndDate datetime                                      
                                      
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                      
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                      
                                  
select KPI_NAME,                                 
count(Product_id) as PRODUCT_COUNT,                              
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,                                                  
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,              
SUM(ISNA) as ISNA               
, count(Met_product), sum(met_product)              
  
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')       
  and count(MET_PRODUCT) > 0       
  then cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,count(MET_PRODUCT)) *100 as decimal(18,3))       
  else IIF(sum(kpi_denominator) != 0,cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3)),0)        
  end as ACHIEVEMENT_VALUE   
        , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')       
  and count(EXCLUSION_MET_PRODUCT) > 0       
  then cast(convert(decimal,sum(EXCLUSION_MET_PRODUCT))/CONVERT(decimal,count(EXCLUSION_MET_PRODUCT)) *100 as decimal(18,3))       
  else IIF(sum(EXCLUSION_kpi_denominator) != 0,cast(sum(EXCLUSION_KPI_NUMERATOR) / sum(EXCLUSION_kpi_denominator) *100  as decimal(18,3)),0)        
  end as EXCLUSION_ACHIEVEMENT_VALUE                            
, sum(KPI_NUMERATOR) as KPI_NUMERATOR              
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR   
 , sum(EXCLUSION_KPI_NUMERATOR) as EXCLUSION_KPI_NUMERATOR              
 , sum(EXCLUSION_KPI_DENOMINATOR) as EXCLUSION_KPI_DENOMINATOR   
 ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE                
        , count(*) as cnt  ,    
  MAX(SERVICE_LEVEL) as SERVICE_LEVEL    
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT                        
from                                                      
(                                                      
select K.KPI_NAME as KPI_NAME,                              
 PP.ID as Product_id,                                                  
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,                  
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)             
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                        
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                    
  
        
          
 CASE WHEN KD.SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS MET_PRODUCT                                                                
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,                               
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT                                                                
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT  
,  case when case when isnull( KD.EXCLUSION_SLA_STATUS,'')!='' then  KD.SLA_STATUS else KD.EXCLUSION_SLA_STATUS end in ( 'Met','NA','ND')  then 1 ELSE 0 END AS EXCLUSION_MET_PRODUCT   
              
,CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA              
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(IS_EXCLUSION,0) =0)   as KPI_NUMERATOR                                     
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(IS_EXCLUSION,0) =0)   as KPI_DENOMINATOR     
 ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(IS_EXCLUSION,0) =1)   as EXCLUSION_KPI_NUMERATOR                                     
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(IS_EXCLUSION,0) =1)   as EXCLUSION_KPI_DENOMINATOR             
  ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM            
 ,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                          
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                 
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )   ,    
[SERVICE_LEVEL] = (select SLT.SERVICE_LEVEL from KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                    
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID     
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID where KPSL.KPI_ID = k.id)    
    
from KPI K                  
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                                  
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                               
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                                        
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )                             
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                          
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                           
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1                                                                    
              
where   K.CUSTOMER_ID = @customerId      and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)                             
and isnull(KD.ISDRAFT,0)=0             
)a                                                  
group by KPI_NAME  order by KPI_NAME              
END      
  go


  use csp
  usp_get_servicelevel_Metrics 70 ,4 ,'2022-10-1', '2022-10-31'
   ALTER proc usp_get_servicelevel_Metrics                                            
                              
@productId int,                                                                                          
@modeId int,                                                      
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
select K.ID as KPI_ID,                                          
CASE WHEN K.FREQUENCY='Quarterly' then (select  top 1 ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                      
@quarterStartDate and @quarterEndDate) ELSE KD.ID                                                                      
END AS DETAIL_ID,                                          
PP.ID as PRODUCT_ID,PSA.ID as SERVICE_AREA_ID,PSL.SERVICE_LEVEL_TYPE_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,                                    
CASE WHEN K.FREQUENCY='Quarterly' then                                     
(select  top 1 PERIOD  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                      
@quarterStartDate and @quarterEndDate) ELSE KD.PERIOD END AS PERIOD,                                    
PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,                                                                                
PSA.SERVICE_AREA_TYPE,                                                
SLT.SERVICE_LEVEL,SLA.SLA_CATEGORY,                          
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                                                                    
K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,                                        
CASE WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 1 Incident Resolution' then                                                                                     
PT.SEVERITY_LEVEL_1                                                                                    
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 2 Incident Resolution' then                          
PT.SEVERITY_LEVEL_2                         
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Severity Level 3 Incident Resolution' then                                                                                   
PT.SEVERITY_LEVEL_3                                                                                    
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Mean Time to Repair / Restore Service (MTTR)' then                     
PT.MTTR                                                           
                                 
WHEN isnull(KT.SPECIFICATION_LIMIT,'')='' and K.KPI_NAME = 'Problem Resolution Time' then                                              
PT.PROBLEM_RESOLUTION_TIME                                 
else KT.SPECIFICATION_LIMIT END AS SPECIFICATION_LIMIT,                                                                      
CASE WHEN K.FREQUENCY='Monthly' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23)         
and CONVERT(VARCHAR(20),@endDate,23))       
                    
WHEN K.FREQUENCY='Release' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))   
 
    
    
                   
WHEN K.FREQUENCY='Quarterly' then (select top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                      
@quarterStartDate and @quarterEndDate) END AS KPI_ACTUAL,                                                                 
K.FREQUENCY,                                            
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                                      
@quarterStartDate and @quarterEndDate ) ELSE KD.SLA_STATUS  END AS SLA_STATUS,                                        
CASE WHEN isnull(KD.ISFLAG,'')='' then isnull(ISFLAG,CAST(0 as BIT)) ELSE KD.ISFLAG END AS IS_NOT_APPLICABLE,                                        
CASE WHEN K.FREQUENCY='Quarterly' then                                    
(select top 1 HIGHLIGHTS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                      
@quarterStartDate and @quarterEndDate) ELSE  KD.HIGHLIGHTS END AS REMARKS,     
                                                                  
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SECONDARY_SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                            
  
@quarterStartDate and @quarterEndDate ) ELSE KD.SECONDARY_SLA_STATUS  END AS SECONDARY_SLA_STATUS,                        
  
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1  EXCLUSION_SLA_STATUS  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and period between                                                              
@quarterStartDate and @quarterEndDate ) ELSE  KD.EXCLUSION_SLA_STATUS   END AS EXCLUSION_SLA_STATUS,                        
  
 CASE WHEN K.FREQUENCY='Quarterly' then (select top 1   EXCLUSION_SECONDARY_SLA_STATUS  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and period between                                                              
@quarterStartDate and @quarterEndDate ) ELSE   KD.EXCLUSION_SECONDARY_SLA_STATUS  END AS EXCLUSION_SECONDARY_SLA_STATUS,   
  
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1   EXCLUSION_KPI_ACTUAL  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and period between                                                              
@quarterStartDate and @quarterEndDate ) ELSE  KD.EXCLUSION_KPI_ACTUAL  END AS EXCLUSION_KPI_ACTUAL,   
  
CASE WHEN K.FREQUENCY='Quarterly'   and KD.period between @quarterStartDate and @QuarterendDate then cast(1 as bit)                 
ELSE isnull(KD.ISDRAFT,1) END AS IS_DRAFT,                 
kd.isFlag as IS_FLAG  ,REFERENCE ,isnull(KD.ISNODATA,0) as IS_NO_DATA                                    
                            
from KPI K                                                                                    
                                             
join KPI_TARGETS KT on K.ID = KT.KPI_ID and (CONVERT(VARCHAR(20),@startDate,23) >= CONVERT(varchar(20),KT.start_date,23))                                                                      
and (CONVERT(VARCHAR(20),@endDate,23) <= CONVERT(varchar(20),KT.END_DATE,23))                    
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                                     
left join KPI_DETAILS KD on K.ID = KD.KPI_ID and KD.ISACTIVE = 1 and                                                       
((K.FREQUENCY='Monthly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))                                
or (K.FREQUENCY='Release' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))                                
 or K.FREQUENCY='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23))                                    
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                                  
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID          
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1         
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                                                                  
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                                
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                                                                              
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                                                                     
where  K.ISACTIVE = 1 and KT.ISACTIVE = 1                                                      
and PP.ISACTIVE = 1  and K.PRODUCT_ID = @productId and K.MODE_ID = @modeId                                                            
)                                                                   
                                                       
SELECT distinct *  from CTE order by SERVICE_AREA_TYPE,REFERENCE                                                                         
                                            
END
GO
  
Alter PROC getProductWiseCAPACount            
@customerId  varchar(50) = '212100001',                       
@startDate datetime,                                                                      
@endDate datetime,                      
@productId int = 0  ,        
@iscustomer bit = 0  
  
AS                    
BEGIN                      

declare @unclassifiedId int = (select ID from CSP..PORTFOLIO where TITLE='Unclassified')
                   
declare @quarterStartDate Datetime                                          
declare @quarterEndDate datetime                                          
                                      
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0));                                          
set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,1));                              
                      
                     
;with CTE AS        
 (                      
        
select PP.ID as ProductID,PP.PRODUCT_TITLE,KD.ID as KPI_DETAILS_ID,          
[SUBMITTED] = Count(CAPA.ID),          
[REVIEW] =  (select COUNT(R.ID) from CSP..AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1),          
[IMPLEMENTATION] = (select COUNT(IMP.ID) from CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1),         
[VERIFICATION] = (select COUNT(VER.ID)  from CSP..AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1),       
[CUSTOMER_APPROVAL] = (select COUNT(CUST_APPROVAL.ID) from CSP..CUSTOMER_CAPA_APPROVAL CUST_APPROVAL where  CUST_APPROVAL.CAPA_ID = MAX(CAPA.ID) and CUST_APPROVAL.ISACTIVE = 1),    
(select max(stage_ID) from CSP..AUDIT_FINDING_STAGES_MAPPING where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE        
        
from           
CSP..PORTFOLIO_PRODUCTS PP               
left join CSP..KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1                   
join CSP..KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1            
join CSP..AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1       
        
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0            
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and  PP.PORTFOLIO_ID!=@unclassifiedId  and                
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)                                      
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )          
        
 group by PP.ID ,PP.PRODUCT_TITLE,KD.ID          
 )        
 select ProductID,PRODUCT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET,        
 [SUBMITTED] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),        
 [REVIEW] = SUM(case when CAPA_STAGE = 2 then Review else 0 End),        
 [IMPLEMENTATION] = SUM(case when CAPA_STAGE = 3 then IMPLEMENTATION else 0 End),        
 [VERIFICATION] = SUM(case when CAPA_STAGE = 4 then VERIFICATION else 0 End),    
 [CUSTOMER_APPROVAL] = SUM(case when CAPA_STAGE = 5 then CUSTOMER_APPROVAL else 0 End)    
 from CTE        
 group by ProductID,PRODUCT_TITLE        
 order by PRODUCT_TITLE       
END   
Go
