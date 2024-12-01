USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallProductWiseKPIData' AND TYPE='P')
BEGIN
 DROP PROCEDURE getOverallProductWiseKPIData          
END
GO

  
CREATE PROC getOverallProductWiseKPIData  
@startDate varchar(20),  
@endDate varchar(20),  
@productId int  
AS  
BEGIN  
declare @quarterStartDate Datetime  
declare @quarterEndDate datetime  
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0));  
set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,1));  
;WITH CTE  
AS  
(  
select P.TITLE,PP.PRODUCT_TITLE, p.ID as PORTFOLIO_ID, IS_SERVICE_COMMENCED, K.KPI_NAME as SERVICE_LEVEL_METRICS, K.KPI_NAME, SLT.SERVICE_LEVEL,  
CONVERT(VARCHAR(20),KD.PERIOD,107) as PERIOD, KD.KPI_ACTUAL,  
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,  
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,  
KD.ISFLAG as NOT_APPLICABLE,KD.HIGHLIGHTS as REASON,KD.SLA_STATUS as EXPECTED_SERVICE_LEVEL_STATUS,KD.SECONDARY_SLA_STATUS as MINIMUM_SERVICE_LEVEL_STATUS ,  
KD.EXCLUSION_SLA_STATUS as EXCLUSION_EXPECTED_SERVICE_LEVEL_STATUS,KD.EXCLUSION_SECONDARY_SLA_STATUS as EXCLUSION_MINIMUM_SERVICE_LEVEL_STATUS ,  
BaseMeasure_Numerator = STUFF(( select ',', isnull(NUMERATORDESCRIPTION,'') from csp..base_measure b inner join csp..kpi_base_measure_value m on b.id = m.base_measure_id where m.KPI_DETAILS_ID = kd.id order by m.BASE_MEASURE_ID FOR XML PATH('')), 1, 1, ''
)  ,  
Numerator_Values =  STUFF(( select ',', CONVERT(int, NUMERATOR) from csp..KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 0 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, '') ,  
BaseMeasure_Denominator =  STUFF(( select ',', isnull(DENOMINATORDESCRIPTION,'') from csp..base_measure b inner join csp..kpi_base_measure_value m on b.id = m.base_measure_id where m.KPI_DETAILS_ID = kd.id order by m.BASE_MEASURE_ID FOR XML PATH('')), 1, 
1, ''),  
Denominator_Values = STUFF(( select ',', CONVERT(int, DENOMINATOR) from csp..KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 0 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, ''),  
(select   sum(numerator) from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 0)   as KPI_NUMERATOR,  
(select   sum(DENOMINATOR)   from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 0)   as KPI_DENOMINATOR  ,  
(select   sum(numerator) from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 1)   as EXCLUSION_KPI_NUMERATOR,  
(select   sum(DENOMINATOR)   from csp..kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 1)   as EXCLUSION_KPI_DENOMINATOR  ,  
KD.EXCLUSION_KPI_ACTUAL,KD.EXCLUSION_COMMENT,  
EXCLUSION_NUMERATOR_VALUES =  STUFF(( select ',', CONVERT(int, NUMERATOR) from csp..KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 1 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, '') ,  
EXCLUSION_DENOMINATOR_VALUES = STUFF(( select ',',CONVERT(int, DENOMINATOR) from csp..KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 1 order by BASE_MEASURE_ID FOR XML PATH  
('')), 1, 1, ''),  
KD.ID  
from CSP..KPI_DETAILS KD  
join CSP..KPI K on KD.KPI_ID = K.ID  
join CSP..KPI_TARGETS KT on KT.KPI_ID = K.ID  
join CSP..KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID  
join CSP..PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID  
join CSP..PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID  
join CSP..PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID  
join CSP..PORTFOLIO P on PP.PORTFOLIO_ID = P.ID  
left join CSP..PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID  
where K.ISACTIVE = 1 and PP.ISACTIVE = 1  and isnull(kd.isdraft,0) = 0  
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and  
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))  
or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )  
)  
select * from CTE order by cte.SERVICE_LEVEL_METRICS  
END
GO
