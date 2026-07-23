
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE getEngagementLevelKPI
END
GO

CREATE procedure [dbo].[getEngagementLevelKPI] 

@customerId  varchar(50),    
@startDate Datetime,    
@endDate Datetime,    
@iscustomer bit =0    

AS 
BEGIN    

declare @remitraId int = (Select ID from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='Remitra')    
declare  @quarterStartDate Datetime    
declare @quarterEndDate datetime    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));    
select KPI_NAME,    
count(Product_id) as PRODUCT_COUNT,    
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,    
SUM(ISNA) as ISNA    
, count(Met_product) metCount, sum(met_product) metSum    
, count(exclusion_Met_product) exMetCount, sum(exclusion_Met_product) exMetSum    
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents or Problems that require a Code Change')    
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
,case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents or Problems that require a Code Change')    
and count(EXCLUSION_MET_PRODUCT) > 0    
then cast(convert(decimal,sum(EXCLUSION_MET_PRODUCT))/CONVERT(decimal,count(EXCLUSION_MET_PRODUCT)) *100 as decimal(18,3))    
when kpi_name in('Issues detected Post-Production release')    
and sum(EXCLUSION_MET_PRODUCT) > 0     then    cast(sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR))/sum(EXCLUSION_MET_PRODUCT)     as decimal(18,3))    
else IIF(sum(EXCLUSION_KPI_DENOMINATOR) != 0,cast(sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR)) / sum(isnull(EXCLUSION_KPI_DENOMINATOR,KPI_DENOMINATOR)) *100  as decimal(18,3)),0)    
end as EXCLUSION_ACHIEVEMENT_VALUE    
, sum(isnull(EXCLUSION_KPI_NUMERATOR,KPI_NUMERATOR)) as EXCLUSION_KPI_NUMERATOR    
, sum(isnull(EXCLUSION_KPI_DENOMINATOR,KPI_DENOMINATOR)) as EXCLUSION_KPI_DENOMINATOR    
from    
(    
select K.KPI_NAME as KPI_NAME,    
PP.ID as Product_id,    
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)    
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,    
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,    
CASE WHEN KD.SLA_STATUS in( 'Met','NA') then 1 ELSE 0 END AS MET_PRODUCT    
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,    
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT    
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,    
CASE WHEN isnull(nullif( KD.EXCLUSION_SLA_STATUS ,''), SLA_STATUS) in ( 'Met','NA') then 1 ELSE 0 END AS EXCLUSION_MET_PRODUCT    
,CASE WHEN KD.EXCLUSION_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_NOT_MET_PRODUCT,    
CASE WHEN isnull(nullif( KD.EXCLUSION_SECONDARY_SLA_STATUS ,''),  SECONDARY_SLA_STATUS)  in ( 'Met','NA') then 1 ELSE 0 END AS EXCLUSION_SECONDARY_MET_PRODUCT    
,CASE WHEN KD.EXCLUSION_SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_SECONDARY_NOT_MET_PRODUCT,    
CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA    
,(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id and   IS_EXCLUSION = 0)   as KPI_NUMERATOR    
,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id and   IS_EXCLUSION = 0)   as KPI_DENOMINATOR    
,( select   sum(numerator)  from kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION = 1)   as EXCLUSION_KPI_NUMERATOR    
,(select   sum(DENOMINATOR) from kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION =1)   as EXCLUSION_KPI_DENOMINATOR    
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
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1    
where   K.CUSTOMER_ID = @customerId and PP.ID != @remitraId and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)    
and isnull(KD.ISDRAFT,0)=0)a    
group by KPI_NAME  order by KPI_NAME    
END  
GO
