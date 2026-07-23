
USE CSP
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = 'ISDRAFT' AND Object_ID = Object_ID('KPI_DETAILS'))
BEGIN
   ALTER TABLE KPI_DETAILS ADD ISDRAFT bit DEFAULT(0) NOT NULL
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDataForPeriod' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[GetKPIWiseDataForPeriod]
END
GO
      
CREATE PROC GetKPIWiseDataForPeriod                  
      
@customerId int,                  
@startDate DateTime,                                
@endDate DateTime        
                        
AS                        
BEGIN               
declare  @quarterStartDate Datetime              
declare @quarterEndDate datetime              
              
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));              
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));              
              
with cte as                  
(                    
 SELECT  k.ID ,PORTFOLIO_ID = (select PORTFOLIO_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)                  
 , k.KPI_NAME, k.PRODUCT_ID                              
 ,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID                  
 ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                     
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR                     
 ,ft.id as FID ,ft.formula                  
 --,Tier_ID = (select TIER_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)                  
fROM csp..KPI K                                    
LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                             
((K.FREQUENCY ='Monthly' and  (CONVERT(varchar(20),KD.PERIOD,23)                 
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))          
 or          
 (K.FREQUENCY ='Release' and  (CONVERT(varchar(20),KD.PERIOD,23)                 
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))             
or(K.FREQUENCY ='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23)))              
                
 INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                  
 INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                        
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                  
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                  
 INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                       
 where                    
 K.CUSTOMER_ID  = @customerId    and  isnull(KD.ISFLAG,0)=0   
 and isnull(KD.ISDRAFT,0)=0  
 and k.ISACTIVE =1      
)                  
  select KPI_NAME                  
 ,cte.PORTFOLIO_ID                  
 ,'' as TITLE                  
 ,max( FID) as FORMULA_ID                  
 ,max( formula) as FORMULA                  
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                  
 , sum(KPI_NUMERATOR) as KPI_NUMERATOR                  
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                  
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))     
 , EXPECTED_SERVICE_LEVEL=(select EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))    
 --, MINIMUM_SERVICE_LEVEL= ( CASE WHEN cte.KPI_NAME='System Uptime' then       
 --(Select System_Uptime from PRODUCT_TIER where ID = cte.Tier_ID) ELSE       
 --(select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID)) END)                  
 --, EXPECTED_SERVICE_LEVEL= ( CASE WHEN cte.KPI_NAME='System Uptime' then       
 --(Select System_Uptime from PRODUCT_TIER where ID = cte.Tier_ID) ELSE       
 --(select EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID)) END)                  
  from cte       
  group by   KPI_NAME, cte.PORTFOLIO_ID--,cte.Tier_ID                  
  order by   3, 2,1                  
 END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_servicelevel_Metrics' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[usp_get_servicelevel_Metrics]
END
GO

  
CREATE proc usp_get_servicelevel_Metrics                        
          
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
                          
;WITH CTE(KPI_ID,DETAIL_ID,PRODUCT_ID,SERVICE_AREA_ID,SERVICE_LEVEL_ID,MODE_ID,SERVICE_LEVEL_METRICS,PERIOD,SERVICE_LEVEL_METRIC_DESCRIPTION,SERVICE_AREA_TYPE,SERVICE_LEVEL,SLA_CATEGORY,EXPECTED_SERVICE_LEVEL,                                          
MINIMUM_SERVICE_LEVEL,UNIT_OF_MEASUREMENT,SPECIFICATION_LIMIT,KPI_ACTUAL,FREQUENCY,SLA_STATUS,IS_NOT_APPLICABLE,REMARKS,SECONDARY_SLA_STATUS,IS_DRAFT)                                              
AS                                              
(                                              
select K.ID as KPI_ID,                      
CASE WHEN K.FREQUENCY='Quarterly' then (select  ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                  
@quarterStartDate and @quarterEndDate) ELSE KD.ID                                                  
END AS DETAIL_ID,                      
PP.ID as PRODUCT_ID,PSA.ID as SERVICE_AREA_ID,PSL.SERVICE_LEVEL_TYPE_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,                
CASE WHEN K.FREQUENCY='Quarterly' then                 
(select  PERIOD  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                  
@quarterStartDate and @quarterEndDate) ELSE KD.PERIOD END AS PERIOD,                
PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,                                                            
PSA.SERVICE_AREA_TYPE,                            
SLT.SERVICE_LEVEL,SLA.SLA_CATEGORY,      
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                            
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                                                
K.SLA_TARGET_UNIT_OF_MEASUREMENT,                    
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
CASE WHEN K.FREQUENCY='Monthly' then (select  KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))    
WHEN K.FREQUENCY='Release' then (select  KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))         
WHEN K.FREQUENCY='Quarterly' then (select KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                  
@quarterStartDate and @quarterEndDate) END AS KPI_ACTUAL,                                             
K.FREQUENCY,                        
CASE WHEN K.FREQUENCY='Quarterly' then (select SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                  
@quarterStartDate and @quarterEndDate ) ELSE KD.SLA_STATUS  END AS SLA_STATUS,                    
CASE WHEN isnull(KD.ISFLAG,'')='' then isnull(ISFLAG,CAST(0 as BIT)) ELSE KD.ISFLAG END AS IS_NOT_APPLICABLE,                    
CASE WHEN K.FREQUENCY='Quarterly' then                
(select HIGHLIGHTS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                  
@quarterStartDate and @quarterEndDate) ELSE  KD.HIGHLIGHTS END AS REMARKS,                                                 
CASE WHEN K.FREQUENCY='Quarterly' then (select SECONDARY_SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                  
@quarterStartDate and @quarterEndDate ) ELSE KD.SECONDARY_SLA_STATUS  END AS SECONDARY_SLA_STATUS,    
CASE WHEN isnull(KD.ISDRAFT,'')='' then isnull(KD.ISDRAFT,CAST(1 as BIT)) ELSE KD.ISDRAFT END AS IS_DRAFT                    
        
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
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                                              
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                                                            
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                                                          
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                                                 
where  K.ISACTIVE = 1 and KT.ISACTIVE = 1                                  
and PP.ISACTIVE = 1  and K.PRODUCT_ID = @productId and K.MODE_ID = @modeId                                        
)                                               
                                   
SELECT *  from CTE order by KPI_ID                                                       
                        
END 

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetOverallKPICountForPortfolio' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[GetOverallKPICountForPortfolio]
END
GO
    
CREATE PROC GetOverallKPICountForPortfolio        
    
@Portfolio_ID int,    
@startDate DateTime,                            
@endDate DateTime     
as         
BEGIN        
declare  @quarterStartDate Datetime          
declare @quarterEndDate datetime          
          
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));          
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));          
     
 select    count(distinct(m.id))  from           
 csp..PRODUCT_SERVICE_LEVEL_METRICS m           
 inner join   KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = m.ID           
 inner join kpi on k2p.kpi_ID = kpi.ID and Kpi.ISACTIVE =1         
 left  join KPI_DETAILS KD on KPI.ID = KD.KPI_ID and KD.ISACTIVE =1      
 and    
 ((Kpi.FREQUENCY ='Monthly' and  (CONVERT(varchar(20),KD.PERIOD,23)             
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))      
 or      
 (Kpi.FREQUENCY ='Release' and  (CONVERT(varchar(20),KD.PERIOD,23)             
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))         
or(Kpi.FREQUENCY ='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23)))          
 inner join csp..PORTFOLIO_PRODUCTS pp on pp.ID = kpi.PRODUCT_ID     
 where  pp.PORTFOLIO_ID = @Portfolio_ID  and pp.ISACTIVE = 1      
 and  isnull(KD.ISFLAG,0)=0 and isnull(KD.ISDRAFT,0)=0          
END     

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseKPICount' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[getProductWiseKPICount]
END
GO
CREATE PROC getProductWiseKPICount                          
      
@customerId int,                            
@startDate Datetime,                                          
@endDate Datetime      
                            
AS                            
BEGIN                            
              
Declare @quarterStartDate DateTime              
Declare @quarterEndDate DateTime              
              
Set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0))              
Set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1))              
              
select PRODUCT_ID,PRODUCT_TITLE,MODE_ID,                          
sum(kpi_id) as OVERALL_KPI_COUNT,sum(MET_KPIS) as SLA_STATUS , sum(KEY_KPI) as KEY_KPI ,sum(CRITICAL_KPI) as CRITICAL_KPI,                          
sum(MET_KEY_KPI) as MET_KEY_KPI,sum(MET_CRITICAL_KPI) as MET_CRITICAL_KPI,      
sum(SECONDARY_MET_KEY_KPI) as SECONDARY_MET_KEY_KPI,sum(SECONDARY_MET_CRITICAL_KPI) as SECONDARY_MET_CRITICAL_KPI      
from                            
(                            
 SELECT PP.ID as PRODUCT_ID,PP.PRODUCT_TITLE,K.MODE_ID,                          
 COUNT(K.ID) as KPI_ID                           
,CASE WHEN KD.SLA_STATUS = 'MET' then COUNT(KD.ID) ELSE 0 END AS MET_KPIS                                      
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 then COUNT(K.ID) END as KEY_KPI                          
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and KD.SLA_STATUS = 'Met' then COUNT(K.ID) ELSE 0 END as MET_KEY_KPI                          
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 1 and KD.SECONDARY_SLA_STATUS = 'Met' then COUNT(K.ID) ELSE 0 END as SECONDARY_MET_KEY_KPI                          
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 then COUNT(K.ID) END as CRITICAL_KPI                          
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and KD.SLA_STATUS = 'Met' then COUNT(K.ID) ELSE 0 END as MET_CRITICAL_KPI                                        
,CASE WHEN PSL.SERVICE_LEVEL_TYPE_ID = 2 and KD.SECONDARY_SLA_STATUS = 'Met' then COUNT(K.ID) ELSE 0 END as SECONDARY_MET_CRITICAL_KPI                                        
FROM KPI K                                        
--INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                      
LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                           
((K.FREQUENCY ='Monthly' and  (CONVERT(varchar(20),KD.PERIOD,23)                 
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))          
 or          
 (K.FREQUENCY ='Release' and  (CONVERT(varchar(20),KD.PERIOD,23)                 
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))             
or(K.FREQUENCY ='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23)))                                                       
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                      
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                        
--INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                            
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID   and PP.ISACTIVE =1                         
where  K.CUSTOMER_ID = @customerId     and isnull(KD.ISFLAG,0)= 0 and isnull(KD.ISDRAFT,0)=0                                         
group by PP.ID,PP.PRODUCT_TITLE,K.MODE_ID,PSL.SERVICE_LEVEL_TYPE_ID,kd.SLA_STATUS,kd.PERIOD,KD.SECONDARY_SLA_STATUS                          
)a                            
group by PRODUCT_ID,PRODUCT_TITLE,MODE_ID                           
order by PRODUCT_TITLE                          
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[getEngagementLevelKPI]
END
GO
        
CREATE PROC getEngagementLevelKPI                                     
        
@customerId int,                              
@startDate Datetime,                                            
@endDate Datetime              
                              
AS                                                  
BEGIN                                
declare  @quarterStartDate Datetime                    
declare @quarterEndDate datetime                    
                    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                    
                
select KPI_NAME,               
SUM(PRODUCT_COUNT) as PRODUCT_COUNT,            
EXPECTED_SERVICE_LEVEL,MINIMUM_SERVICE_LEVEL,                                
SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,SUM(ISNA) as ISNA,      
SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT      
from                                    
(                                    
select K.KPI_NAME as KPI_NAME,            
0 as PRODUCT_COUNT,                                
KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,                                
 CASE WHEN KD.SLA_STATUS = 'Met' then COUNT(KD.ID) ELSE 0 END AS MET_PRODUCT                                              
,CASE WHEN KD.SLA_STATUS = 'Not Met' then COUNT(KD.ID) ELSE 0 END AS NOT_MET_PRODUCT,              
CASE WHEN KD.SECONDARY_SLA_STATUS = 'Met' then COUNT(KD.ID) ELSE 0 END AS SECONDARY_MET_PRODUCT                                              
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then COUNT(KD.ID) ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,              
CASE WHEN KD.ISFLAG = 1 then COUNT(KD.ID) ELSE 0 END AS ISNA               
from KPI K                                
                                
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                
LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                             
((K.FREQUENCY ='Monthly' and  (CONVERT(varchar(20),KD.PERIOD,23)                 
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))             
 or (K.FREQUENCY ='Release' and  (CONVERT(varchar(20),KD.PERIOD,23)                 
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))             
or(K.FREQUENCY ='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23)))              
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                        
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                         
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1                                                  
where K.IS_ENGAGEMENT_LEVEL = 1 and K.CUSTOMER_ID = @customerId -- and ( KD.ISFLAG is null or KD.ISFLAG = 0   )     
and isnull(KD.ISDRAFT,0)=0  
group by K.KPI_NAME,EXPECTED_SERVICE_LEVEL,PSL.SERVICE_LEVEL_TYPE_ID,kd.SLA_STATUS,kd.PERIOD,KD.ISFLAG,KT.MINIMUM_SERVICE_LEVEL,KD.SECONDARY_SLA_STATUS                                  
            
UNION             
            
select K.KPI_NAME as KPI_NAME,COUNT(PP.ID) as PRODUCT_COUNT,KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,0,0,0,0,0 from KPI K             
JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                
JOIN PORTFOLIO_PRODUCTS PP             
on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1  and K.ISACTIVE=1                               
where K.IS_ENGAGEMENT_LEVEL = 1 and K.CUSTOMER_ID = @customerId            
group by K.KPI_NAME,KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL            
              
)a                                
group by KPI_NAME,EXPECTED_SERVICE_LEVEL,MINIMUM_SERVICE_LEVEL        
END 
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[GetKPIWiseDetailDataForPeriod]
END
GO
  
CREATE PROC GetKPIWiseDetailDataForPeriod    
  
@customerId int,        
@startDate DateTime,                          
@endDate DateTime    
                    
                  
AS                  
BEGIN         
declare  @quarterStartDate Datetime        
declare @quarterEndDate datetime        
        
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));        
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));        
        
with cte as            
(              
 SELECT k.ID,PORTFOLIO_ID = (select PORTFOLIO_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)            
 ,k.KPI_NAME, k.PRODUCT_ID,psl.SERVICE_LEVEL_METRIC_DESCRIPTION,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID,    
 PSA.SERVICE_AREA_TYPE ,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR               
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR    
 ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,PSLT.SERVICE_LEVEL    
 ,ft.id as FID,ft.formula    
             
 FROM csp..KPI K                              
 --INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                            
 LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1    
and ((K.FREQUENCY ='Monthly' and  (CONVERT(varchar(20),KD.PERIOD,23)           
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))    
 or    
 (K.FREQUENCY ='Release' and  (CONVERT(varchar(20),KD.PERIOD,23)           
 between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23) ))       
or(K.FREQUENCY ='Quarterly' and CONVERT(varchar(20),KD.PERIOD,23) between CONVERT(VARCHAR(20),@quarterStartDate,23) and CONVERT(VARCHAR(20),@quarterEndDate,23)))        
                 
 INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID            
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                  
  INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                  
 INNER JOIN PRODUCTS_SERVICE_LEVEL_TYPE PSLT on PSL.SERVICE_LEVEL_TYPE_ID = PSLT.ID    
 --INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                  
 --INNER JOIN PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id            
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id            
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                 
 where              
 K.CUSTOMER_ID  = @customerId    and  isnull(KD.ISFLAG,0)= 0 and  isnull(KD.ISDRAFT,0)= 0       
 and k.ISACTIVE =1            
     
 )     
     
  select             
    KPI_NAME            
 ,cte.PORTFOLIO_ID,SERVICE_AREA_TYPE    
 ,CATEGORY = (select SHORT_DESC from GLOBAL_KPI_CATEGORY GC join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING GKC on    
 GC.ID = GKC.GLOBAL_KPI_CATEGORY_ID join KPI k on K.GLOBAL_KPI_CATEGORY_ID=GKC.GLOBAL_KPI_CATEGORY_ID where K.ID = max(cte.ID))    
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID            
 , sum(KPI_NUMERATOR) as KPI_NUMERATOR            
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR            
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))            
 ,EXPECTED_SERVICE_LEVEL= (select EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))       
 ,UNIT_OF_MEASUREMENT,SERVICE_LEVEL,max( FID) as FORMULA_ID            
 ,max( formula) as FORMULA            
    
  from cte  --where PORTFOLIO_ID=2    
  group by   KPI_NAME, cte.PORTFOLIO_ID,SERVICE_AREA_TYPE,UNIT_OF_MEASUREMENT,SERVICE_LEVEL    
  order by   3, 2,1            
 END     
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetTrendDataForPortfolio' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[GetTrendDataForPortfolio]
END
GO
        
CREATE PROC GetTrendDataForPortfolio                
  
@customerId int,          
@kpiName varchar(250),        
@portfolioId int  
                      
AS                      
BEGIN             
            
with cte as                
(                  
 SELECT                  
   k.ID                
   ,PORTFOLIO_ID = (select PORTFOLIO_ID from PORTFOLIO_PRODUCTS pp where pp.ID =  k.PRODUCT_ID and ISACTIVE =1)      
   ,PORTFOLIO_NAME = (select TITLE from PORTFOLIO p where p.ID =  @portfolioId and ISACTIVE =1)      
   , k.KPI_NAME                
   , k.PRODUCT_ID ,Kd.PERIOD  as Period               
  ,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID                
 ,  (select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                   
 ,   (select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR                   
 ,ft.id as FID                
 ,ft.formula                
                 
                 
 FROM csp..KPI K                                  
        
LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1       
INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                      
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                     
 where                  
 K.CUSTOMER_ID  = @customerId    and  isnull(KD.ISFLAG,0) = 0  and isnull(KD.ISDRAFT,0)=0             
 and k.ISACTIVE =1                
         
  )                
 select * into #temp from cte      
      
 IF(@kpiName = '')      
 BEGIN      
 select KPI_NAME,                
  PORTFOLIO_ID,PORTFOLIO_NAME                
    ,'' as TITLE,Period  
 ,max( FID) as FORMULA_ID                
 ,max( formula) as FORMULA                
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                
 , sum(KPI_NUMERATOR) as KPI_NUMERATOR                
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(t.ID))                
                  
  from #temp t where  PORTFOLIO_ID=@portfolioId      and Period <> ''  
  group by KPI_NAME,PORTFOLIO_ID,Period,PORTFOLIO_NAME                
  order by   3, 2,1                
 END      
 ELSE      
 BEGIN      
  select                 
    KPI_NAME                
 , PORTFOLIO_ID,PORTFOLIO_NAME                
    ,'' as TITLE,Period  
 ,max( FID) as FORMULA_ID                
 ,max( formula) as FORMULA                
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                
 , sum(KPI_NUMERATOR) as KPI_NUMERATOR                
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR                
 , MINIMUM_SERVICE_LEVEL= (select MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(t.ID))                
                  
  from #temp t where KPI_NAME=@kpiName and PORTFOLIO_ID=@portfolioId and Period <> ''       
  group by   KPI_NAME, PORTFOLIO_ID,Period,PORTFOLIO_NAME                
  order by   3, 2,1                
  END      
  DROP TABLE #temp      
 END 
GO    

Declare  @RESOURCEID int = 78

Declare @RescourceName varchar(250) = 'Dashboard > QA Governance'
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName) 
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,104474,104474)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0)


END
 

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,104474,104474),
	(@RESOURCEID,'CREATE',null,104474,104474),
	(@RESOURCEID,'EDIT',null,104474,104474),
	(@RESOURCEID,'DELETE',null,104474,104474)
end
GO
--
Declare  @RESOURCEID int = 79

Declare @RescourceName varchar(250) = 'Dashboard > KPI > Revert KPI'
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName) 
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,104474,104474)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,104474,104474,1,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,104474,104474,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,104474,104474,0,0,0,0,0),
      (@RESOURCEID,13,'','','',null,104474,104474,0,0,0,0,0)


END
 

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values  (@RESOURCEID,'EDIT',null,104474,104474) 
end
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAssessmentFindingsForQAGovernanceDashboard' AND TYPE='P')
BEGIN
    DROP PROCEDURE [dbo].[getAssessmentFindingsForQAGovernanceDashboard]
END
GO

CREATE PROCEDURE [dbo].[getAssessmentFindingsForQAGovernanceDashboard]                      
@startDate varchar(10),                    
@endDate varchar(10),                    
@custIds varchar(max)
AS                      
BEGIN  

 select S.CUSTOMER_ID as CUST_ID,C.CUST_NM,P.PROJ_ID,P.PROJ_NM,finding.FINDING_TYPE,
 FINDING_STATUS =  (case when Stage.ISCOMPLETE = 1 then 'Close' Else 'Open' End),
 [FINDING_AGE] = datediff(d,finding.CREATED_DATE,@endDate), E.EMP_ID AS CSM_ID,E.FRST_NM AS CSM_NM
 from 
 CSP..TASK t            
 inner join BAS..CUSTOMER c on t.CUST_ID = c.CUST_ID                    
 inner join BAS..PROJECT p on t.PROJ_ID = p.PROJ_ID   and ISNULL(p.PROJ_STATUS ,'') != 'Close'
 inner join CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY s on t.id = s.ASSESSMENT_ID and  S.ISSUBMITTED = 1      
 inner join csp..AUDIT_CHECKLIST_PROJECT_FINDINGS finding on finding.AUDIT_ID = s.ASSESSMENT_ID and finding.ISACTIVE =1 
 inner join CSP..AUDIT_FINDING_STAGES_MAPPING Stage on finding.ID=Stage.FINDING_ID and Stage.STAGE_ID=4 and Stage.ISACTIVE=1      
 inner join  BAS..EMP_INFO E on E.EMP_ID = P.PROJ_DM_EMP_ID and E.DOR is null

 where convert(varchar,t.DUE_DATE,23) between convert(varchar,@startDate,23) and convert(varchar,@endDate,23)
 AND (@custIds = '-1' OR t.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))
END
GO    
     
     