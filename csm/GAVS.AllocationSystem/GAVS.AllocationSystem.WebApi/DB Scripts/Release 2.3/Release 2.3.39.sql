Begin Tran

IF EXISTS (select * from KPI_DETAILS where ISACTIVE=1 and SLA_STATUS in ('NT'))
BEGIN 

Update KPI_DETAILS SET SLA_STATUS='NA',SECONDARY_SLA_STATUS='NA',ISFLAG=1,ISNODATA=0,
UPDATED_BY='104859',UPDATED_DATE=GETDATE() where ISACTIVE=1 and SLA_STATUS in ('NT')

END
GO

IF EXISTS (select * from KPI_DETAILS where ISACTIVE=1 and SLA_STATUS in ('NA') and ISNODATA=1)
BEGIN 

Update KPI_DETAILS SET ISFLAG=1,ISNODATA=0,UPDATED_BY='104859',UPDATED_DATE=GETDATE() where ISACTIVE=1 and SLA_STATUS in ('NA') and ISNODATA=1

END
GO

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

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE GetKPIWiseDetailDataForPeriod
END
GO

CREATE procedure  [dbo].[GetKPIWiseDetailDataForPeriod]                                        
@customerId VARCHAR(50),                                                    
@startDate DateTime,                                                                      
@endDate DateTime    ,                                            
@isCustomer bit = 0           
          
AS                          

BEGIN                              
          
declare @unclassifiedId int = (select ID from PORTFOLIO where TITLE='Unclassified')          
                                              
declare  @quarterStartDate Datetime                                                    
declare @quarterEndDate datetime                                                    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                                    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                                    
with cte as                                                        
(                                                          
 SELECT k.ID                                                       
 ,k.KPI_NAME,PORTFOLIO_ID, k.PRODUCT_ID,psl.SERVICE_LEVEL_METRIC_DESCRIPTION,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID,                                                
 PSA.SERVICE_AREA_TYPE ,                            
(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 0)   as KPI_NUMERATOR                                                           
 ,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 0)   as KPI_DENOMINATOR                             
                            
,(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 1)   as EXCLUSION_KPI_NUMERATOR                                                           
 ,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 1)   as EXCLUSION_KPI_DENOMINATOR                                
 ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,PSLT.SERVICE_LEVEL                                                
 ,ft.id as FID,ft.formula ,PP.TIER_ID ,RM.REFERENCE,                               
  case when kd.sla_status in ('MET','NA') then 1 else 0 end as SLA_Status                                              
 , case when isnull(kd.ISFLAG,0) = 1 then  1 else 0 end as Cnt                                    
 , case when isnull(kd.ISNODATA,0) = 1 then  1 else 0 end as NDCnt ,                              
case when coalesce(nullif(kd.EXCLUSION_SLA_STATUS,''), SLA_STATUS) in ('MET','NA') then 1 else 0 end as EXCLUSION_SLA_STATUS                              
 FROM KPI K                                                                          
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
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents or Problems that require a Code Change')                                   
 and count(SLA_Status) > 0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) * 100                                   
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR                                         
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                             
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents or Problems that require a Code Change')                                   
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

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseKPICount' AND TYPE='P')
BEGIN
       DROP PROCEDURE getProductWiseKPICount
END
GO

CREATE PROCEDURE [dbo].[getProductWiseKPICount]                                             
                          
@customerId varchar(50),                                                
@startDate Datetime,                                                              
@endDate Datetime ,                         
@isCustomer bit = 0          
        
AS  

begin

declare @unclassifiedId int = (Select ID from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='SDC16 Managed Services')        
        
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
,CASE WHEN (KD.SLA_STATUS = 'MET' or isnull(kd.isflag,0) =1) then 1 ELSE 0 END AS MET_KPIS              
,CASE WHEN (KD.SECONDARY_SLA_STATUS = 'MET' or isnull(kd.isflag,0) =1) then 1 ELSE 0 END AS SECONDARY_MET_KPIS                
,CASE WHEN (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end in ('Met','NA') or isnull(kd.isflag,0) =1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE 0 END AS EXCLUSION_MET_KPIS                                         
        
                         
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 then 1 END as KEY_KPI                                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1) then 1 ELSE 0 END as MET_KEY_KPI                                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (KD.SECONDARY_SLA_STATUS = 'Met'  or isnull(kd.isflag,0) =1) then 1 ELSE 0 END as SECONDARY_MET_KEY_KPI               
              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end in ('Met','NA') or isnull(kd.isflag,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_MET_KEY_KPI                                                
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and (case when isnull(KD.EXCLUSION_SECONDARY_SLA_STATUS,'') !='' then kd.EXCLUSION_SECONDARY_SLA_STATUS else  KD.SECONDARY_SLA_STATUS end in ('Met','NA')  or isnull(kd.isflag,0) =1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE      
        
 0 END as EXCLUSION_SECONDARY_MET_KEY_KPI               
                  
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 then 1 END as CRITICAL_KPI                                      
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1) then 1 ELSE 0 END as MET_CRITICAL_KPI                                                              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (KD.SECONDARY_SLA_STATUS = 'Met' or isnull(kd.isflag,0) = 1) then 1 ELSE 0 END as SECONDARY_MET_CRITICAL_KPI               
              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (case when isnull(KD.EXCLUSION_SLA_STATUS,'') !='' then kd.EXCLUSION_SLA_STATUS else  KD.SLA_STATUS end in ('Met','NA') or isnull(kd.isflag,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_MET_CRITICAL_KPI                                                              
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and (case when isnull(KD.EXCLUSION_SECONDARY_SLA_STATUS,'') !='' then kd.EXCLUSION_SECONDARY_SLA_STATUS else  KD.SECONDARY_SLA_STATUS end in ('Met','NA') or isnull(kd.isflag,0) = 1 or isnull(kd.ISEXNODATA,0) = 1) then 1 ELSE 0 END as EXCLUSION_SECONDARY_MET_CRITICAL_KPI                                                              
FROM KPI K                                                             
                                                      
inner JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and kd.isactive =1                                                                        
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                          
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                            
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID   and PP.ISACTIVE =1                                             
where  K.CUSTOMER_ID = @customerId  and PP.ID!=@unclassifiedId               
and isnull(KD.ISDRAFT,0)=0                                                             
and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 ) and                                              
((K.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                              
or(K.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                      
)a                                                
group by PRODUCT_ID,PRODUCT_TITLE,MODE_ID                                               
order by PRODUCT_TITLE       

END
GO

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

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getKPIComplainaceStatus' AND TYPE='P')
BEGIN
       DROP PROCEDURE reports_getKPIComplainaceStatus
END
GO

 CREATE PROCEDURE [dbo].[reports_getKPIComplainaceStatus]                  
  @CustomerID varchar(50) = '0',       
  @date Datetime  ,           
  @productId int = -1              
  as                
  BEGIN    
  
  DECLARE @MonthDate DATETIME;  
SELECT @monthdate = CAST(DATEFROMPARTS(YEAR(@date), MONTH(@date), 1) AS DATE);  
  
DECLARE @quarterStartDate DATETIME;  
DECLARE @quarterEndDate DATETIME;  
SET @quarterStartDate = (SELECT dbo.Fn_GetQuarterDates(@date, 0));  
SET @quarterEndDate = (SELECT dbo.Fn_GetQuarterDates(@date, 1));  
  
SELECT  
 c.CUST_NM as customer_name,  
    product_title,  
    KPI_Count = (SELECT COUNT(*) FROM kpi WHERE PRODUCT_ID = pp.ID AND kpi.isactive = 1),  
    Entered_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                    WHERE kpi.product_id = pp.id   
                        AND kpi.isactive = 1   
                        AND KPI_DETAILS.ISACTIVE = 1   
                        AND ISNULL(isdraft, 0) = 0   
                        AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                            OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    NA_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                WHERE kpi.product_id = pp.id   
                    AND KPI_DETAILS.ISACTIVE = 1   
                    AND kpi.isactive = 1   
                    AND ISNULL(ISFLAG, 0) = 1   
                    AND ISNULL(isdraft, 0) = 0   
                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    Met_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                WHERE kpi.product_id = pp.id   
                    AND KPI_DETAILS.ISACTIVE = 1   
                    AND kpi.isactive = 1   
                    AND SLA_STATUS = 'Met'   
                    AND ISNULL(ISFLAG, 0) = 0   
                    AND ISNULL(isdraft, 0) = 0   
                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    NotMet_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                    WHERE kpi.product_id = pp.id   
                        AND KPI_DETAILS.ISACTIVE = 1   
                        AND kpi.isactive = 1   
                        AND SLA_STATUS = 'Not met'   
                        AND ISNULL(isdraft, 0) = 0   
                        AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                            OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    No_of_exclusions_applied = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                                INNER JOIN KPI_BASE_MEASURE_VALUE KPI_BMV ON KPI_BMV.KPI_DETAILS_ID = kpi_details.ID   
                                WHERE kpi.product_id = pp.id   
                                    AND KPI_DETAILS.ISACTIVE = 1   
                                    AND kpi.isactive = 1   
                                    AND KPI_BMV.IS_EXCLUSION = 1   
                                    AND SLA_STATUS = 'Not met'   
                                    AND ISNULL(isdraft, 0) = 0   
                                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    Manager = (SELECT TOP 1 frst_nm   
                FROM emp_info   
                WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 1 AND ISACTIVE = 1)),  
    Lead = (SELECT TOP 1 frst_nm   
            FROM emp_info   
            WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 2 AND ISACTIVE = 1)),  
    CSM = (SELECT TOP 1 frst_nm   
            FROM emp_info   
            WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 3 AND ISACTIVE = 1)),  
    QualitySpoc = (SELECT TOP 1 frst_nm   
                    FROM emp_info   
                    WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 4 AND ISACTIVE = 1))  
FROM   
    PORTFOLIO_PRODUCTS pp  
 inner join CUSTOMER c on c.CUST_ID = pp.CUST_ID  
WHERE   
    PP.ISACTIVE = 1   
    AND (@productId = -1 OR pp.ID = @productId)   
    AND (@CustomerID = '0' OR PP.CUST_ID = @CustomerID)   
ORDER BY   
    7,   
    1;  
  
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOpenFindingsForEachAudit' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOpenFindingsForEachAudit]
END
GO 

CREATE procedure [dbo].[getOpenFindingsForEachAudit] 
        
@auditIds varchar(max)

AS

BEGIN

SELECT 
    findings.AUDIT_ID, 
    COUNT(*) as TOTAL_FINDINGS,
    SUM(
        CASE 
            WHEN AFM.ISCOMPLETE = 1 THEN 1
            WHEN aa.status LIKE '%reject%' THEN 1 
            WHEN aa.status LIKE '%accept%' AND findings.FINDING_TYPE = 'Strength' THEN 1 
            ELSE 0 
        END
    ) AS CLOSED_FINDINGS,
    COUNT(*) - SUM(
        CASE 
            WHEN AFM.ISCOMPLETE = 1 THEN 1
            WHEN aa.status LIKE '%reject%' THEN 1 
            WHEN aa.status LIKE '%accept%' AND findings.FINDING_TYPE = 'Strength' THEN 1 
            ELSE 0 
        END
    ) AS OPEN_FINDINGS
FROM 
    AUDIT_CHECKLIST_PROJECT_FINDINGS findings  
LEFT JOIN 
    AUDIT_FINDING_STAGES_MAPPING AFM ON AFM.FINDING_ID = findings.ID  
                                       AND AFM.STAGE_ID = 4  
                                       AND AFM.ISACTIVE = 1 
LEFT JOIN 
    AUDITEE_ACCEPTANCE AA ON FINDINGS.ID = AA.FINDING_ID 
                          AND AA.ISACTIVE = 1
WHERE 
    findings.isactive = 1 and findings.issubmitted = 1
    AND findings.AUDIT_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@auditIds, ','))
GROUP BY 
    findings.AUDIT_ID
ORDER BY 
    findings.AUDIT_ID;

END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='Get_Process_Mapping_Report_All' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[Get_Process_Mapping_Report_All]
END
GO 		

CREATE PROC [dbo].[Get_Process_Mapping_Report_All]
		AS
BEGIN
	SELECT 

    pm.TITLE as [Process Model Title],
    psan.TITLE as [Service Tower Title],
    PA.TITLE as [Process Area Title] ,
    p.TITLE as [Process Title],	
	pr.proj_nm as [Project],
	c.cust_nm as [Customer]

FROM 
    process p 
inner JOIN 
    PROCESS_AREA pa ON pa.ID = p.PROCESS_AREA_ID AND pa.ISACTIVE = 1 AND pa.SHOW_IN_MASTER = 1
left JOIN 
    PROCESS_MODEL_PROCESS_MAPPING map ON map.PROCESS_ID = p.ID AND map.ISACTIVE = 1 
left JOIN 
    PROCESS_MODEL pm ON map.PROCESS_MODEL_ID = pm.ID AND map.ISACTIVE = 1 
left JOIN 
    PROCESS_SERVICE_AREA_MAPPING psam ON  p.id = psam.PROCESS_ID AND psam.ISACTIVE = 1 
left JOIN 
    PROCESS_SERVICE_AREA_NEW psan ON psan.ID = psam.SERVICE_AREA_ID AND psan.ISACTIVE = 1 AND psan.SHOW_IN_MASTER = 1
left join 
   PROCESS_SERVICE_AREA_PROJECT_MAPPING PSAPM on PSAM.SERVICE_AREA_ID = PSAPM.SERVICE_AREA_ID AND PSAPM.ISACTIVE =1
left JOIN
   PROJECT PR ON PSAPM.PROJ_ID = PR.PROJ_ID 
left join 
	customer c on psapm.cust_id = c.cust_id 
	where p.ISACTIVE =1 and p.SHOW_IN_MASTER =1
	order by [Process Title],[Process Model Title],[Service Tower Title];
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='Get_Process_Mapping_Report' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[Get_Process_Mapping_Report]
END
GO 		

CREATE PROC [dbo].[Get_Process_Mapping_Report]
		AS
BEGIN
SELECT 
    pm.TITLE as [Process Model Title],
    psan.TITLE as [Service Tower Title],
    PA.TITLE as [Process Area Title] ,
    p.TITLE as [Process Title]	
FROM 
 process p 
inner JOIN 
    PROCESS_AREA pa ON pa.ID = p.PROCESS_AREA_ID AND pa.ISACTIVE = 1 AND pa.SHOW_IN_MASTER = 1
left JOIN 
    PROCESS_MODEL_PROCESS_MAPPING map ON map.PROCESS_ID = p.ID AND map.ISACTIVE = 1 
left JOIN 
    PROCESS_MODEL pm ON map.PROCESS_MODEL_ID = pm.ID AND map.ISACTIVE = 1 
left JOIN 
    PROCESS_SERVICE_AREA_MAPPING psam ON  p.ID = psam.PROCESS_ID AND psam.ISACTIVE = 1 
left JOIN 
    PROCESS_SERVICE_AREA_NEW psan ON psan.ID = psam.SERVICE_AREA_ID AND psan.ISACTIVE = 1 AND psan.SHOW_IN_MASTER = 1
	where p.ISACTIVE =1 and p.SHOW_IN_MASTER =1
	order by [Process Title],[Process Model Title],[Service Tower Title];
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_ListofAllAssessmentStatus' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_ListofAllAssessmentStatus]
END
GO 

IF NOT EXISTS (SELECT 1 from dbo.REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='List of All Assessment Status Report')
BEGIN

INSERT INTO dbo.REPORTS_SP_DETAILS(SP_NAME,SP_DISPLAY_NAME,DB_NAME)  VALUES
('dbo.reports_ListofAllAssessmentStatus','List of All Assessment Status Report'	,'BAS') 
END
GO

DECLARE @spID int;

IF NOT EXISTS (SELECT 1 FROM dbo.REPORTS_PARAMS WHERE  PARAM_NAME='CustomerID' AND REPORT_SP_ID=@spID)
BEGIN

INSERT INTO dbo.REPORTS_PARAMS(REPORT_SP_ID,PARAM_NAME,PARAM_TYPE,PARAM_VALUE)  VALUES
(@spID,'CustomerID','CUSTOMERID','0') 
END
GO


CREATE PROCEDURE [dbo].[reports_ListofAllAssessmentStatus]                            

@CustomerID VARCHAR(50)='0' 
as

begin
select PM.Title as [Checklist], 
PM.version as [Version], 
Convert(VARCHAR,PQ.effective_from, 107)  as [Effective date],
PQ.Title as[Checkpoint Question],
  CASE 
        WHEN ACS.status_category = 'NMET' THEN 'NOT MET'
        ELSE ACS.status_category
    END AS [Implementation status],
PA.TITLE as [Process_Area],
P.TITLE as Process,
PS.TITLE as [Service Tower],
pr.PROJ_NM as Project,
CR.CUST_NM as Customer,
Convert(VARCHAR,ACES.ACTUAL_AUDIT_eND_DATE, 107)  AS [Last assessment date]
from  
PM_CHECKLIST_QUESTIONS PQ 
left join PM_CHECKLIST PM on PM.ID=PQ.CHECKLIST_ID
left join PM_PROCESS_QUESTIONS_MAPPING PQM on PQM.question_id=PQ.ID and PQM.checklist_id=PQ.CHECKLIST_ID  
LEFT join AUDIT_CHECKLIST_STATUS_LIST_VALUES ACS on PQ.CHECKLIST_ID = ACS.ID and acs.isactive =1
inner join PROCESS_SERVICE_AREA_NEW PS on PS.ID=PQM.SERVICE_AREA_ID and ps.ISACTIVE = 1 and ps.SHOW_IN_MASTER =1
inner join PROCESS_AREA PA on PA.ID = PQM.PROCESS_AREA_ID and pa.ISACTIVE = 1and pa.SHOW_IN_MASTER =1
inner join PROCESS P on P.ID = PQM.process_id and p.ISACTIVE = 1and p.SHOW_IN_MASTER =1
inner join AUDIT_CHECKLIST_EXECUTION_SUMMARY ACES on PQ.CHECKLIST_ID = ACES.CHECKLIST_ID and aces.ISACTIVE=1 
inner join project pr on  aces.PROJECT_ID  = pr.PROJ_ID 
inner join customer cr on aces.CUSTOMER_ID = cr.CUST_ID 

where PQ.ISACTIVE=1 and PM.ISACTIVE=1 and PQM.isactive=1 AND  (@CustomerID='0' or  cr.cust_id = @CustomerID)  order by [Service Tower],[Process_Area],Process
end
go

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMERS' AND COLUMN_NAME='IS_VERIFIED')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMERS ADD IS_VERIFIED bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMER_MONTHLY' AND COLUMN_NAME='IS_VERIFIED')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMER_MONTHLY ADD IS_VERIFIED bit NOT NULL DEFAULT 0
END
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
END
GO 

CREATE PROCEDURE [dbo].[reports_CSAT_Combined] 

@StartDate date, 
@EndDate date    

AS  

BEGIN    
  
  SELECT    
    c.cust_nm AS [Customer Name],    
    p.proj_nm AS [Project Name],    
    display_name AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS    
    [CSAT sent Date],    
    FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    [Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),    
    pp.TITLE AS [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_DM_EMP_ID    
    WHERE project.PROJ_ID = B.PROJ_ID)    
    AS [Customer Success Manager],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_AM_EMP_ID    
    WHERE project.PROJ_ID = B.PROJ_ID)    
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,   
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
 PA.STATUS as [Action Item Status],  
 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]   
  FROM [CSS_BATCH_CUSTOMERS] b    
  INNER JOIN project p    
    ON p.proj_id = b.proj_id    
  LEFT JOIN portfolio_project PR    
    ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1  
  LEFT JOIN PORTFOLIO pp    
    ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1  
  INNER JOIN customer c    
    ON c.cust_id = b.cust_id    
  INNER JOIN CSS_BATCHES bt    
    ON bt.id = b.Batch_ID and bt.ISACTIVE = 1   
  INNER JOIN CSS_QUESTION_REPLIES QR    
    ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1  
  LEFT JOIN PROJECT_ACTIONITEM PA   
 ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  UNION    
  SELECT    
    c.cust_nm AS [Customer Name],    
    COALESCE(P.PROJ_NM, PFT.PRODUCT_TITLE) AS [Project Name],  
    b.DISPLAY_NAME AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],    
    FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    CONCAT(    
    'Q', CASE    
      WHEN MONTH(bt.START_DATE) BETWEEN 4 AND 6 THEN '1'    
      WHEN MONTH(bt.START_DATE) BETWEEN 7 AND 9 THEN '2'    
      WHEN MONTH(bt.START_DATE) BETWEEN 10 AND 12 THEN '3'    
      ELSE '4'    
    END, ' - ', YEAR(bt.START_DATE)) AS [Quarter_Year],    
    pp.TITLE [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_DM_EMP_ID    
    WHERE project.PROJ_ID = p.PROJ_ID)    
    AS [Customer Success Manager],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_AM_EMP_ID    
    WHERE project.PROJ_ID = p.PROJ_ID)    
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,      
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
 PA.STATUS as [Action Item Status],  
 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]  
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] b    
  INNER JOIN CSS_BATCH_MONTHLY bt    
    ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1   
  INNER JOIN CSS_QUESTION_REPLIES QR    
    ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1  
  INNER JOIN customer c    
    ON c.cust_id = b.cust_id    
  LEFT JOIN project p    
    ON p.proj_id = b.PROJ_ID  
  LEFT JOIN portfolio_project PR    
    ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1  
  LEFT JOIN PORTFOLIO pp    
    ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1  
 LEFT JOIN PORTFOLIO_PRODUCTS PFT  
 ON PFT.ID = b.PROD_ID and PFT.ISACTIVE = 1  
   LEFT JOIN PROJECT_ACTIONITEM PA   
   ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1   
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  ORDER BY [Year_Quarter], [Customer Name];    
END    
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getCSSInitatedDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getCSSInitatedDetails]
END
GO 

CREATE PROCEDURE [dbo].[reports_getCSSInitatedDetails]      

@STARTDATE DATETIME,      
@ENDDATE DATETIME      

AS      
BEGIN      

SET @STARTDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@STARTDATE, 111 ) + ' 00:00:00', 111)      
SET @ENDDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@ENDDATE, 111 ) + ' 23:59:59', 111)      
SELECT C.CUST_NM,P.PROJ_NM,CSS.STATUS,      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,     
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,      
(select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL,      
CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,      
[Year - Quarter] =  (select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ),      
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY], 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], P.COUNTRY [COUNTRY],      
P.CUST_ID, P.PROJ_ID      
FROM CSS_BATCH_CUSTOMERS CSS       
INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID      
INNER JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID    
WHERE CSS.STATUS NOT IN ('CREATED')    
    
union all      
    
SELECT C.CUST_NM,P.PROJ_NM,CSS.STATUS,      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,     
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_DM_EMP_ID) CSM_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,      
(select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,      
(select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,      
(select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL,      
CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,      
[Year - Quarter] =  (SELECT      
CASE      
       
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)    
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)   
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)   
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))       
END      
FROM CSS_BATCH_MONTHLY where id= b.id ),      
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY], 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], P.COUNTRY [COUNTRY],      
P.CUST_ID, P.PROJ_ID      
from CSS_BATCH_CUSTOMER_MONTHLY CSS      
INNER JOIN CSS_BATCH_MONTHLY B ON B.ID = CSS.BATCH_MONTHLY_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID      
LEFT JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID      
WHERE CSS.STATUS NOT IN ('CREATED')    
order by C.CUST_NM, P.PROJ_ID      
end
Go



Declare @RESOURCEID int = 114
Declare @EMPID varchar(10) = '104849'
Declare @RescourceName varchar(250) = 'Settings > Customer Success Survey Verification'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


Declare @RESOURCEID int = 115
Declare @EMPID varchar(10) = '104849'
Declare @RescourceName varchar(250) = 'Settings > Customer Success Survey Verification for Monthly'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getQualitySpocs' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQualitySpocs]
END
GO 		
		
CREATE PROCEDURE [dbo].[reports_getQualitySpocs]        
AS        
BEGIN        
select   p.proj_nm,        
convert(varchar,p.start_date,107) as start_date,convert(varchar,p.end_date,107)as end_date,        
HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y' and pr.END_DATE >= GETDATE()),        
c.cust_nm,proj_status , p.project_type, p.BUSINESS_UNIT, p.DEPARTMENT, p.PROJECT_GROUP, p.CONTRACTING_UNIT, p.REVENUE_TYPE, p.COUNTRY, p.METHODOLOGY,          
status=case when isnull(proj_status, '') != ''  then 'Active' else 'Inactive' end,         
Account_Owner = case when p.proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,        
e.frst_nm as SPOC,        
e1.frst_nm as PM,  
e1.email_id as [PM Mail ID],
e3.FRST_NM as Account_Manager,
e3.email_id as [AM Mail ID],
e2.frst_nm as CSM,
e2.email_id as [CSM Mail ID],
e4.frst_nm as [BU Head],
e4.email_id as [BU Mail ID],
(select TOP 1 email_id from emp_info where EMP_ID = e2.reviewer_emp_id) as [CSM Reviewer mail ID],     
(SELECT TOP 1 CONVERT(varchar, ACTUAL_AUDIT_END_DATE, 107)        
FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY aces          
WHERE aces.PROJECT_ID = p.PROJ_ID               
ORDER BY ACTUAL_AUDIT_END_DATE DESC     ) AS [Last Audited On]  ,        
Project_Configuration = STUFF( (SELECT ', ' + pcs.Setting_Name from project p1          
inner join PROJECT_CONFIGURATION_DATA pdc on pdc.Proj_Id = p.PROJ_ID               
inner join PROJECT_CONFIGURATION_SETTING pcs on pcs.Id= pdc.Configuration_Setting_Id         
where p1.PROJ_ID=p.PROJ_ID  and  (pdc.end_date is null or pdc.End_date > GETDATE()) order by 1 FOR XML PATH('')),1,1,'' )  ,        
ISO_STANDARDS  = STUFF((SELECT ', ' + PIS.STANDARD_NAME      
FROM PROJECT_ISO_STANDARD PIS INNER JOIN PROJECT_ISO_STANDARD_MAPPING PIM on PIS.ID = PIM.ISO_STANDARD_ID      
WHERE PROJECT_ID = p.PROJ_ID AND PIS.ISACTIVE = 1 and PIM.ISACTIVE=1      
FOR XML PATH('')), 1, 1, ''),      
CERTIFICATION_SCOPES  = STUFF((SELECT ', ' + PCS.SCOPE_NAME      
FROM PROJECT_CERTIFICATION_SCOPE PCS INNER JOIN PROJECT_CERTIFICATION_SCOPE_MAPPING PCM on PCS.ID = PCM.CERTIFICATION_SCOPE_ID      
WHERE PROJECT_ID = p.PROJ_ID AND PCS.ISACTIVE = 1 and PCM.ISACTIVE=1      
FOR XML PATH('')), 1, 1, ''),      
p.proj_id          
from project p inner join customer c on p.cust_id = c.cust_id              
left join emp_info e on e.emp_id  = p.quality_spoc        
inner join emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID           
inner join emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID           
left join emp_info e3 on e3.emp_id  = p.PROJ_AM_EMP_ID     
inner join emp_info e4 on e4.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where isnull(proj_status, '') != 'close'            
order by c.cust_nm, p.proj_nm              
END 
GO



Declare @RESOURCEID int = 116
Declare @EMPID varchar(10) = '105709'
Declare @RescourceName varchar(250) = 'Project > Planner > Task Planner'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
END
GO 
CREATE PROCEDURE [dbo].[reports_CSAT_Combined] 

@StartDate date, 
@EndDate date    

AS  

BEGIN    
  
  SELECT    
    c.cust_nm AS [Customer Name],    
    p.proj_nm AS [Project Name],    
    display_name AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS    
    [CSAT sent Date],    
    FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    [Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),    
    pp.TITLE AS [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_DM_EMP_ID    
    WHERE project.PROJ_ID = B.PROJ_ID)    
    AS [Customer Success Manager],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_AM_EMP_ID    
    WHERE project.PROJ_ID = B.PROJ_ID)    
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,   
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
	CASE
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')
        THEN 'Improvement Plan submission Overdue'
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')
        THEN 'Improvement Plan Completion Overdue'
    ELSE pa.status 
END AS [Action Item Status],

 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]   

  FROM [CSS_BATCH_CUSTOMERS] b    
  INNER JOIN project p    
    ON p.proj_id = b.proj_id    
  LEFT JOIN portfolio_project PR    
    ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1  
  LEFT JOIN PORTFOLIO pp    
    ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1  
  INNER JOIN customer c    
    ON c.cust_id = b.cust_id    
  INNER JOIN CSS_BATCHES bt    
    ON bt.id = b.Batch_ID and bt.ISACTIVE = 1   
  INNER JOIN CSS_QUESTION_REPLIES QR    
    ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1  
  LEFT JOIN PROJECT_ACTIONITEM PA   
 ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  UNION    
  SELECT    
    c.cust_nm AS [Customer Name],    
    COALESCE(P.PROJ_NM, PFT.PRODUCT_TITLE) AS [Project Name],  
    b.DISPLAY_NAME AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],    
    FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    CONCAT(    
    'Q', CASE    
      WHEN MONTH(bt.START_DATE) BETWEEN 4 AND 6 THEN '1'    
      WHEN MONTH(bt.START_DATE) BETWEEN 7 AND 9 THEN '2'    
      WHEN MONTH(bt.START_DATE) BETWEEN 10 AND 12 THEN '3'    
      ELSE '4'    
    END, ' - ', YEAR(bt.START_DATE)) AS [Quarter_Year],    
    pp.TITLE [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_DM_EMP_ID    
    WHERE project.PROJ_ID = p.PROJ_ID)    
    AS [Customer Success Manager],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_AM_EMP_ID    
    WHERE project.PROJ_ID = p.PROJ_ID)    
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,      
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
CASE
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')
        THEN 'Improvement Plan submission Overdue'
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')
        THEN 'Improvement Plan Completion Overdue'
    ELSE pa.status 
END AS [Action Item Status],  
 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] b    
  INNER JOIN CSS_BATCH_MONTHLY bt    
    ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1   
  INNER JOIN CSS_QUESTION_REPLIES QR    
    ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1  
  INNER JOIN customer c    
    ON c.cust_id = b.cust_id    
  LEFT JOIN project p    
    ON p.proj_id = b.PROJ_ID  
  LEFT JOIN portfolio_project PR    
    ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1  
  LEFT JOIN PORTFOLIO pp    
    ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1  
 LEFT JOIN PORTFOLIO_PRODUCTS PFT  
 ON PFT.ID = b.PROD_ID and PFT.ISACTIVE = 1  
   LEFT JOIN PROJECT_ACTIONITEM PA   
   ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1   
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  ORDER BY [Year_Quarter], [Customer Name];    
END    
GO




--rollback
--commit

