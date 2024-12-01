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