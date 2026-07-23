USE CSP
GO

IF EXISTS(SELECT 1 FROM csp..APP_CONTROLS
where REsource_name like '%service area/Tower%')
BEGIN
update  csp..APP_CONTROLS
set REsource_name = REPLACE(REsource_name,'service area/Tower', 'Service Tower')
where REsource_name like '%service area/Tower%'
END


GO
 
 
IF EXISTS(select 1 FROM CSP.dbo.FILTER_PREFERENCE WHERE DISPLAY_NAME like '%Service Area%')
BEGIN

update  csp..FILTER_PREFERENCE
set DISPLAY_NAME = REPLACE(DISPLAY_NAME,'service area', 'Service Tower')
where DISPLAY_NAME like '%Service Area%'

END

GO


USE CSP 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getEngagementLevelKPI
END
GO
  
CREATE PROC getEngagementLevelKPI        
@customerId  varchar(50),        
@startDate Datetime,        
@endDate Datetime,        
@iscustomer bit =0        
AS        
BEGIN        
      
declare @remitraId int = (Select ID from CSP..PORTFOLIO_PRODUCTS where PRODUCT_TITLE='Remitra')      
      
declare  @quarterStartDate Datetime        
declare @quarterEndDate datetime        
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));        
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));        
select KPI_NAME,        
count(Product_id) as PRODUCT_COUNT,        
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,        
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,        
SUM(ISNA) as ISNA        
, count(Met_product) metCount, sum(met_product) metSum        
, count(exclusion_Met_product) exMetCount, sum(exclusion_Met_product) exMetSum        
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')        
and count(MET_PRODUCT) > 0        
then cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,count(MET_PRODUCT)) *100 as decimal(18,3))        
when kpi_name in('Issues detected Post-Production release')        
and sum(MET_PRODUCT) > 0     then     sum(KPI_NUMERATOR)/sum(MET_PRODUCT)        
else IIF(sum(kpi_denominator) != 0,cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3)),0)        
end as ACHIEVEMENT_VALUE        
, sum(KPI_NUMERATOR) as KPI_NUMERATOR        
, sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE        
, count(*) as cnt  ,        
MAX(SERVICE_LEVEL) as SERVICE_LEVEL        
,case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')        
and count(EXCLUSION_MET_PRODUCT) > 0        
then cast(convert(decimal,sum(EXCLUSION_MET_PRODUCT))/CONVERT(decimal,count(EXCLUSION_MET_PRODUCT)) *100 as decimal(18,3))        
when kpi_name in('Issues detected Post-Production release')        
and sum(EXCLUSION_MET_PRODUCT) > 0     then    cast(sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR))/sum(EXCLUSION_MET_PRODUCT)     as decimal(18,3))        
else IIF(sum(EXCLUSION_KPI_DENOMINATOR) != 0,cast(sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR)) / sum(isnull(EXCLUSION_KPI_DENOMINATOR,KPI_DENOMINATOR)) *100  as decimal(18,3)),0)        
end as EXCLUSION_ACHIEVEMENT_VALUE        
, sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR)) as EXCLUSION_KPI_NUMERATOR        
, sum(isnull(EXCLUSION_KPI_DENOMINATOR,KPI_DENOMINATOR)) as EXCLUSION_KPI_DENOMINATOR        
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT        
from        
(        
select K.KPI_NAME as KPI_NAME,        
PP.ID as Product_id,        
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,        
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)        
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,        
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,        
CASE WHEN KD.SLA_STATUS in( 'Met','NA','NT') then 1 ELSE 0 END AS MET_PRODUCT        
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,        
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','NT') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT        
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,        
CASE WHEN isnull(nullif( KD.EXCLUSION_SLA_STATUS ,''), SLA_STATUS) in ( 'Met','NA','NT') then 1 ELSE 0 END AS EXCLUSION_MET_PRODUCT        
,CASE WHEN KD.EXCLUSION_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_NOT_MET_PRODUCT,        
CASE WHEN isnull(nullif( KD.EXCLUSION_SECONDARY_SLA_STATUS ,''),  SECONDARY_SLA_STATUS)  in ( 'Met','NA','NT') then 1 ELSE 0 END AS EXCLUSION_SECONDARY_MET_PRODUCT        
,CASE WHEN KD.EXCLUSION_SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_SECONDARY_NOT_MET_PRODUCT,        
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA        
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and   IS_EXCLUSION = 0)   as KPI_NUMERATOR        
,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and   IS_EXCLUSION = 0)   as KPI_DENOMINATOR        
,( select   sum(numerator)  from csp..kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION = 1)   as EXCLUSION_KPI_NUMERATOR        
,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION =1)   as EXCLUSION_KPI_DENOMINATOR        
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
or (K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate ))        
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID        
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID        
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1        
where   K.CUSTOMER_ID = @customerId and PP.ID != @remitraId and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)        
and isnull(KD.ISDRAFT,0)=0)a        
group by KPI_NAME  order by KPI_NAME        
END      
GO
      
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

 USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTrendDataForEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getTrendDataForEngagementLevelKPI
END
GO

    
CREATE PROC getTrendDataForEngagementLevelKPI    
@customerId varchar(50),    
@startDate Datetime,    
@endDate Datetime,    
@kpiName varchar(250),    
@iscustomer bit =0    
AS    
BEGIN    
declare  @quarterStartDate Datetime    
declare @quarterEndDate datetime    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@endDate,1));    
select KPI_NAME,  [PERIOD],    
count(Product_id) as PRODUCT_COUNT,    
Max(EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,    
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,    
SUM(ISNA) as ISNA    
, count(Met_product), sum(met_product)    
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')    
and count(MET_PRODUCT) > 0    
then cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,count(MET_PRODUCT)) *100 as decimal(18,3))    
else IIF(sum(kpi_denominator) != 0,cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3)),0)    
end as ACHIEVEMENT_VALUE    
, sum(KPI_NUMERATOR) as KPI_NUMERATOR    
, sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE    
, count(*) as cnt  ,    
MAX(SERVICE_LEVEL) as SERVICE_LEVEL ,MAX(SLA_STATUS)    
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT    
from    
(    
select K.KPI_NAME as KPI_NAME,    
PP.ID as Product_id,  KD.period as PERIOD,    
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,    
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)    
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,    
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,    
CASE WHEN KD.SLA_STATUS in( 'Met','NA','NT') then 1 ELSE 0 END AS MET_PRODUCT    
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,    
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','NT') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT    
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,    
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA    
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR    
,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR    
,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM    
,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL    
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID    
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )   ,    
[SERVICE_LEVEL] = (select SLT.SERVICE_LEVEL from KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL    
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID    
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID where KPSL.KPI_ID = k.id)  ,    
KD.SLA_STATUS    
from KPI K    
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE = 1    
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and  KD.ISACTIVE = 1   and    
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))    
or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )    
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID    
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID    
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1    
where   K.CUSTOMER_ID = @customerId      and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)    
and isnull(KD.ISDRAFT,0)= 0 and KPI_NAME = @kpiName    
)a    
group by KPI_NAME ,[period] order by KPI_NAME ,[period]    
END 
GO

USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseKPICount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseKPICount
END
GO


CREATE PROC getProductWiseKPICount                                           
                        
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
,CASE WHEN (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end   in ('Met','NT') or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE 0 END AS EXCLUSION_MET_KPIS                                       
      
                       
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 then 1 END as KEY_KPI                                              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_KEY_KPI                                              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SECONDARY_SLA_STATUS = 'Met'  or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_KEY_KPI             
            
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end in ('Met','NT') or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_MET_KEY_KPI                                              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (case when isnull(KD.EXCLUSION_SECONDARY_SLA_STATUS,'') !='' then kd.EXCLUSION_SECONDARY_SLA_STATUS else  KD.SECONDARY_SLA_STATUS end in ('Met','NT')  or isnull(kd.isflag,0) =1 or isnull(kd.ISNODATA,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE    
      
 0 END as EXCLUSION_SECONDARY_MET_KEY_KPI             
                                             
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 then 1 END as CRITICAL_KPI                                    
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as MET_CRITICAL_KPI                                                            
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SECONDARY_SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_CRITICAL_KPI             
            
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end in ('Met','NT') or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_MET_CRITICAL_KPI                                                            
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (case when isnull(KD.EXCLUSION_SECONDARY_SLA_STATUS,'') !='' then kd.EXCLUSION_SECONDARY_SLA_STATUS else  KD.SECONDARY_SLA_STATUS end in ('Met','NT') or isnull(kd.isflag,0) = 1 or isnull(kd.ISNODATA,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE    
      
 0 END as EXCLUSION_SECONDARY_MET_CRITICAL_KPI                                                            
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

--SLA_STATUS
If exists (select top 1 ID from CSP..KPI_DETAILS WHERE SLA_STATUS='ND')
Begin

UPDATE  CSP..KPI_DETAILS
SET  SLA_STATUS='NT'
WHERE SLA_STATUS='ND'

End

GO

--SECONDARY_SLA_STATUS
If exists (select top 1 ID from CSP..KPI_DETAILS WHERE SECONDARY_SLA_STATUS='ND')
begin

UPDATE  CSP..KPI_DETAILS
SET  SECONDARY_SLA_STATUS='NT'
WHERE SECONDARY_SLA_STATUS='ND'

end

GO

--EXCLUSION_SLA_STATUS
If exists (select top 1 ID  from CSP..KPI_DETAILS WHERE EXCLUSION_SLA_STATUS='ND')
begin

UPDATE  CSP..KPI_DETAILS
SET  EXCLUSION_SLA_STATUS='NT'
WHERE EXCLUSION_SLA_STATUS='ND'
end

GO

--EXCLUSION_SECONDARY_SLA_STATUS
If exists (select top 1 ID  from CSP..KPI_DETAILS WHERE EXCLUSION_SECONDARY_SLA_STATUS='ND')
begin

UPDATE  CSP..KPI_DETAILS
SET  EXCLUSION_SECONDARY_SLA_STATUS='NT'
WHERE EXCLUSION_SECONDARY_SLA_STATUS='ND'

end

GO



