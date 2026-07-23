
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getTrendDataForEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getTrendDataForEngagementLevelKPI]
END
GO

CREATE PROCEDURE [dbo].[getTrendDataForEngagementLevelKPI]      
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
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents or Problems that require a Code Change')      
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
,(select   sum(numerator)  from kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR      
,(select   sum(DENOMINATOR) from kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR      
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


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[GetKPIWiseDetailDataForPeriod]
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
  case when kd.sla_status in ('MET','NA','NT') then 1 else 0 end as SLA_Status                                            
 , case when isnull(kd.ISFLAG,0) = 1 then  1 else 0 end as Cnt                                  
 , case when isnull(kd.ISNODATA,0) = 1 then  1 else 0 end as NDCnt ,                            
case when coalesce(nullif(kd.EXCLUSION_SLA_STATUS,''), SLA_STATUS) in ('MET','NA','NT') then 1 else 0 end as EXCLUSION_SLA_STATUS                            
 FROM KPI K                                                                        
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


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getEngagementLevelKPI]
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
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,  
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
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID  
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID  
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1  
where   K.CUSTOMER_ID = @customerId and PP.ID != @remitraId and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)  
and isnull(KD.ISDRAFT,0)=0)a  
group by KPI_NAME  order by KPI_NAME  
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getListofPlannedAudits' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getListofPlannedAudits]
END
GO

CREATE procedure [dbo].[getListofPlannedAudits] 

  @custid varchar(50),                      
  @projid nvarchar(500)                      
  AS                     
  
  BEGIN                      
 select t.ID, description, priority, t.SCHEDULED_START_DATE, t.DUE_DATE, t.SCHEDULED_DURATION,          
  t.ACTUAL_DURATION, t.ACTUAL_START_DATE, t.ACTUAL_END_DATE, t.STATUS, t.CUST_ID, t.PROJ_ID, asch.AUDITOR_EMP_ID,           
  asref.[KEY], asref.[VALUE] ,act.ACTUAL_AUDIT_START_DATE, act.ACTUAL_AUDIT_END_DATE
  from task t                      
 LEFT join AUDIT_SCHEDULE asch on  asch.title = t.DESCRIPTION and asch.cust_id = t.CUST_ID           
 and asch.proj_id = t.PROJ_ID and asch.ISACTIVE =1 and (t.PARENT_TASK_ID = asch.TASK_ID OR T.ID = asch.TASK_ID)               
 LEFT join AUDIT_SCHEDULE_REF asref on asref.AUDIT_SCHEDULE_ID = asch.ID and asref.ISACTIVE =1   
 LEFT join  AUDIT_CHECKLIST_EXECUTION_SUMMARY act on t.ID=act.ASSESSMENT_ID and act.ISACTIVE=1  
 where t.CUST_ID = @custid and t.PROJ_ID = @projid and          
  t.TASK_CATEGORY_ID  IN (SELECT OPTIONS FROM PARAMETER_TABLE WHERE NAME = 'AUDIT_CATEGORY')               
 and  T.STATUS not in ('CANCELLED')    and            
  t.ISACTIVE =1                
                   
 order by t.id                     
 END
 GO

IF NOT EXISTS(Select 1 from sys.tables where name ='ASSESSMENT_STATUS_HISTORY' AND type='U')
BEGIN

CREATE TABLE ASSESSMENT_STATUS_HISTORY
(
ID int IDENTITY(1,1) NOT NULL,
ASSESSMENT_ID int NOT NULL,
REQUESTED_EMP_ID Varchar(50) NULL,
REQUEST_COMMENTS Varchar(max) NULL,
STATUS varchar(20) NULL,
APPROVER_EMP_ID Varchar(50) NULL,
APPROVE_REJECT_COMMENTS Varchar(max) NULL,
CREATED_BY varchar(50) NOT NULL,
CREATED_DATE datetime NOT NULL default (getdate()),
UPDATED_BY varchar(50) NOT NULL,
UPDATED_DATE datetime NOT NULL default (getdate()),
ISACTIVE bit NOT NULL default (1)
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

END
GO

IF NOT EXISTS(Select 1 from CONFIGURATION_EXT where [KEY]='ASSESSMENT_RESUBMIT_APPROVERS')
Begin
Insert into CONFIGURATION_EXT Values ('ASSESSMENT_RESUBMIT_APPROVERS','101566',-1,NULL,NULL,0,1,NULL,NULL,'','104859',GETDATE(),'104859',GETDATE())
END
GO
IF NOT EXISTS(Select 1 from TASK_CATEGORY where [TITLE]='Customer Success Achievement')
Begin
Insert into TASK_CATEGORY Values ('99','Customer Success Achievement','#cde6f7','#99c8e9','104859',GETDATE(),'104859',GETDATE(),1,23)
END
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getCSSTableForProjects]
END
GO

CREATE PROCEDURE [dbo].[getCSSTableForProjects]     
@startDate date,    
@endDate date,    
@projIds varchar(max) = NULL    
AS    
BEGIN    
    
  SELECT    
    ID,    
    SURVEY_ID,    
    PROJECT_ID,    
    PROJECT_NAME,    
    CUSTOMER_ID,    
    CUSTOMER_Name,    
    CSM_EMP_ID,  [STATUS],  
    DELIVERY_HEAD_EMP_ID,    
    RESPONDENT_NAME,    
    CSAT_RECIEVED_DATE,    
    YEAR_QUARTER,    
    REGION,    
    RESPONSIVENESS,    
    NPS_SCORE,    
    COMMENTS,    
    Q1,    
    Q2,    
    Q3,    
    Q4,    
    Q5,    
    Q6,    
    Q7,    
    Q8,    
    Q9,    
    Q10,    
    Q11,    
    Q12,    
    Q13,    
    Q14,    
    Q15,    
    CASE    
      WHEN Q1 IS NULL THEN (CASE    
          WHEN Q8 IS NULL THEN (Q5 + Q6 + Q7) / 3    
          ELSE ((Q8 + Q9 + Q10 + Q11 + Q12) / 5)    
        END)    
      ELSE (Q1 + Q2 + Q3) / 3    
    END AS [MIN_SCORE]    
  FROM (SELECT    
    0 ID,    
    vw.SURVEY_ID,  CB.STATUS,  
    CB.PROJ_ID [PROJECT_ID],    
    p.PROJ_NM [PROJECT_NAME],    
    CB.CUST_ID [CUSTOMER_ID],    
    C.CUST_NM [CUSTOMER_Name],    
    P.PROJ_DM_EMP_ID [CSM_EMP_ID],    
    P.PROJ_BUHEAD_EMP_ID [DELIVERY_HEAD_EMP_ID],    
    CB.DISPLAY_NAME RESPONDENT_NAME,    
    SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],    
    'Q' + CAST(B.SEQUENCE AS VARCHAR) + ' - ' + CAST(B.YEAR AS VARCHAR) YEAR_QUARTER,    
    CASE    
      WHEN P.PROJ_ID LIKE '201%' THEN 'India'    
      WHEN P.PROJ_ID LIKE '202%' THEN 'US'    
      WHEN P.PROJ_ID LIKE '206%' THEN 'Oman'    
      WHEN P.PROJ_ID LIKE '207%' THEN 'Dubai'    
      WHEN P.PROJ_ID LIKE '209%' THEN 'Saudi Arabia'    
      ELSE ''    
    END AS REGION,    
    NULL [RESPONSIVENESS],    
    Q4 AS [NPS_SCORE],    
    Q1,    
    Q2,    
    Q3,    
    Q4,    
    Q5,    
    Q6,    
    Q7,    
    Q8,    
    Q9,    
    Q10,    
    Q11,    
    Q12,    
    Q13,    
    Q14,    
    Q15,    
    CASE    
      WHEN Q1 IS NULL THEN (SELECT TOP 1    
          RATING_DESCRIPTION    
        FROM CSS_QUESTION_REPLIES R (NOLOCK)    
        WHERE CB.ID = R.BATCH_CUSTOMER_ID    
        AND QUESTION_ID = 15)    
      ELSE (SELECT TOP 1    
          RATING_DESCRIPTION    
        FROM CSS_QUESTION_REPLIES R (NOLOCK)    
        WHERE CB.ID = R.BATCH_CUSTOMER_ID    
        AND QUESTION_ID = 5)    
    END AS [COMMENTS]    
  FROM [CSS_BATCH_CUSTOMERS] CB (NOLOCK)    
  INNER JOIN PROJECT P (NOLOCK)    
    ON p.proj_id = CB.proj_id    
  INNER JOIN CUSTOMER C (NOLOCK)    
    ON c.cust_id = CB.cust_id    
  INNER JOIN CSS_BATCHES B (NOLOCK)    
    ON B.ID = CB.BATCH_ID    
  LEFT JOIN vwSurveyQRatings vw    
    ON vw.ID = CB.SURVEY_ID    
  WHERE --CB.STATUS = 'COMPLETED'   AND  
  (B.START_DATE BETWEEN @startDate AND @endDate    
  OR B.END_DATE BETWEEN @startDate AND @endDate)    
  AND (ISNULL(@projIds, '') = ''    
  OR CB.proj_id IN (SELECT    
    *    
  FROM [DBO].[FN_SPLITSTRING](@projIds, ','))    
  )    
    
  UNION ALL    
    
  SELECT    
    0 ID,    
    vw.SURVEY_ID,  CB.STATUS,  
    p.proj_id [PROJECT_ID],    
    'Premier Healthcare Solutions' [PROJECT_NAME],    
    CB.CUST_ID [CUSTOMER_ID],    
    C.CUST_NM [CUSTOMER_Name],    
    '' [CSM_EMP_ID],    
    '' [DELIVERY_HEAD_EMP_ID],    
    CB.DISPLAY_NAME RESPONDENT_NAME,    
    SURVEY_RECEIVED_DATE [CSAT_RECIEVED_DATE],    
    LEFT(DATENAME(MONTH, DATEFROMPARTS(B.YEAR, B.MONTH, 1)), 3) + ' - ' + CAST(B.YEAR AS VARCHAR) AS YEAR_QUARTER,    
    '' AS REGION,    
    Q1,    
    Q2,    
    Q3,    
    Q4,    
    Q5,    
    Q6,    
    Q7,    
    Q8,    
    Q9,    
    Q10,    
    Q11,    
    Q12,    
    Q13,    
    Q14,    
    Q15,    
    NULL [RESPONSIVENESS],    
    (SELECT TOP 1    
      AVG(RATING)    
    FROM CSS_QUESTION_REPLIES R (NOLOCK)    
    WHERE CB.ID = R.Batch_Customer_Monthly_id    
    AND QUESTION_MODEL_ID = 4)    
    AS [NPS_SCORE],    
    CASE    
      WHEN Q1 IS NULL THEN (SELECT TOP 1    
          RATING_DESCRIPTION    
        FROM CSS_QUESTION_REPLIES R (NOLOCK)    
        WHERE CB.ID = R.Batch_Customer_Monthly_id    
        AND QUESTION_ID = 15)          ELSE (SELECT TOP 1    
          RATING_DESCRIPTION    
        FROM CSS_QUESTION_REPLIES R (NOLOCK)    
        WHERE CB.ID = R.Batch_Customer_Monthly_id    
        AND QUESTION_ID = 5)    
    END AS [COMMENTS]    
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)    
  INNER JOIN PROJECT P (NOLOCK)    
    ON p.proj_id IN ((SELECT TOP 1    
      PROJ_ID    
    FROM PROJECT    
    WHERE CUST_ID = '212100001'    
    AND (ISNULL(@projIds, '') = ''    
    OR proj_id IN (SELECT    
      *    
    FROM [DBO].[FN_SPLITSTRING](@projIds, ','))    
    )))    
  INNER JOIN CUSTOMER C (NOLOCK)    
    ON c.cust_id = CB.cust_id    
  INNER JOIN CSS_BATCH_monthly B (NOLOCK)    
    ON B.ID = CB.BATCH_MONTHLY_ID    
  LEFT JOIN vwSurveyQRatings vw    
    ON vw.ID = CB.SURVEY_ID    
  WHERE -- CB.STATUS = 'COMPLETED'    AND   
  (B.START_DATE BETWEEN @startDate AND @endDate    
  OR B.END_DATE BETWEEN @startDate AND @endDate)) TBL    
    
END 
Go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallRisksForRiskDashboard' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallRisksForRiskDashboard]
END
GO

CREATE PROCEDURE [dbo].[getOverallRisksForRiskDashboard]                        

@startDate date,
@endDate date,              
@custIds varchar(max),
@riskStatus varchar(max),
@projIds varchar(max)=null

AS   
BEGIN    
  
Select C.CUST_NM,P.PROJ_NM,PR.DESCRIPTION,PR.IMPACT,PR.PROBABILITY_SCALE,PR.IMPACT_SCALE,
CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate' 
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END AS RISK_LEVEL,
PR.OWNER,PR.AREA,PR.IDENTIFIED_BY,PR.IDENTIFIED_DATE,PR.RISK_TREATMENT_STRATEGY,PR.TARGET_DATE,PR.STATUS,
PR.ACTION_TAKEN,C.CUST_ID,P.PROJ_ID,PR.ID
from   
PROJECT_RISK PR  (NOLOCK)      
inner join PROJECT p (NOLOCK) on PR.PROJECT_ID = P.PROJ_ID  and ISNULL(P.PROJ_STATUS ,'') != 'Close'
inner join CUSTOMER c  (NOLOCK) on P.CUST_ID = C.CUST_ID
  
where (PR.IDENTIFIED_DATE between @startDate and @endDate) AND PR.ISACTIVE=1
AND (@custIds = '-1' OR C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))
AND (@riskStatus = '-1' OR PR.STATUS in (SELECT * FROM [DBO].[FN_SPLITSTRING](@riskStatus,',')))
AND (ISNULL(@projIds,'-1') = '-1' OR P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,',')))
order by C.CUST_NM,PR.IDENTIFIED_DATE DESC

END
GO

  

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjbyCSM' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjbyCSM]
END
GO

CREATE proc getProjbyCSM  
@csmEmpId varchar(25)      
  as         
  begin         
  SELECT p.PROJ_NM,p.START_DATE, p.END_DATE,e.EMAIL_ID AS CSM_MAIL_ID, e.FRST_NM +' '+ISNULL(e.LAST_NM,'') AS CSM, e1.FRST_NM +' '+ISNULL(e1.LAST_NM,'') AS QUALITY_PARTNER , 
  e1.EMAIL_ID as QUALITY_PARTNER_MAIL_ID ,c.CUST_NM as CUSTOMER,e2.FRST_NM +' '+ISNULL(e2.LAST_NM,'') AS Account_Manager, e2.EMAIL_ID as AM_Email_ID 
  FROM project p     
  inner join EMP_INFO e (NOLOCK) on e.EMP_ID=p.PROJ_DM_EMP_ID   
  left join EMP_INFO e1 (NOLOCK) on e1.EMP_ID=p.QUALITY_SPOC      inner join EMP_INFO e2 (NOLOCK) on e2.EMP_ID=p.PROJ_PM_EMP_ID      inner join CUSTOMER c (NOLOCK) on c.CUST_ID=p.CUST_ID      
  WHERE p.END_DATE BETWEEN GETDATE() AND DATEADD(month, 3, GETDATE()) and  p.BILL_TYPE=1  and ISNULL(P.PROJ_STATUS ,'') != 'Close'   and  p.PROJ_DM_EMP_ID=@csmEmpId    and  ISNULL(P.PROJECT_TYPE ,'') != 'Internal'    order by END_DATE  
  end


         
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getServiceTowersMappedForProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getServiceTowersMappedForProjects]
END
GO
Create PROCEDURE dbo.reports_getServiceTowersMappedForProjects        
AS         
BEGIN         
SELECT      
t.CUST_NM AS CUSTOMER,t.PROJ_ID AS PROJECT_ID,t.PROJ_NM AS PROJECT,ACCOUNT_OWNER,t.MANAGER,t.CSM,QA_SPOC, CASE WHEN t.CSV IS NULL THEN 'NO' ELSE 'YES' END SERVICE_TOWER_MAPPED,        
t.CSV AS SERVICE_TOWERS , t.CSM_MAIL_ID ,t.MANAGER_MAIL_ID ,t.QUALITY_PARTNER_MAIL_ID, case when QADOR is null then 'YES' else 'NO' end IS_QA_ACTIVE FROM(        
select C.CUST_NM, P.PROJ_ID,        
PROJ_NM  ,ACCOUNT_OWNER = case when proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,     PM.FRST_NM +' '+ISNULL(PM.LAST_NM,'') AS MANAGER,   DM.FRST_NM +' '+ISNULL(DM.LAST_NM,'') AS CSM,PM.EMAIL_ID as MANAGER_MAIL_ID ,   
DM.EMAIL_ID as CSM_MAIL_ID, qa.EMAIL_ID as QUALITY_PARTNER_MAIL_ID,      
QA.FRST_NM +' '+ISNULL(QA.LAST_NM,'') AS QA_SPOC,CSV= STUFF (( SELECT   ', ' +  TITLE  FROM        
PROCESS_SERVICE_AREA_PROJECT_MAPPING PSMAP (NOLOCK)        
INNER JOIN PROCESS_SERVICE_AREA_NEW S (NOLOCK)        
ON PSMAP.SERVICE_AREA_ID =S.ID        
WHERE p.PROJ_ID= PSMAP.PROJ_ID AND PSMAP.ISACTIVE=1 order by title        
  FOR XML PATH('')), 1, 2, ''), QA.DOR QADOR      
from PROJECT P (NOLOCK)          
INNER JOIN CUSTOMER C (NOLOCK) ON        
P.CUST_ID=C.CUST_ID        
INNER JOIN EMP_INFO PM (NOLOCK) ON        
P.PROJ_PM_EMP_ID =PM.EMP_ID        
INNER JOIN EMP_INFO DM (NOLOCK) ON        
P.PROJ_DM_EMP_ID =DM.EMP_ID        
INNER JOIN EMP_INFO QA (NOLOCK) ON        
P.QUALITY_SPOC =QA.EMP_ID       
WHERE ISNULL(P.PROJ_STATUS ,'') != 'Close'   and p.proj_id not like 'proj%'    and PROJECT_TYPE not like 'Internal'
and proj_id not in (select proj_id from PROJECT_CONFIGURATION_DATA where Configuration_Setting_Id = 17 and isnull(Is_Approved,0) =1 and isnull(end_date,getdate()+1) > GETDATE() )  
) as t        
ORDER BY CUST_NM,PROJ_NM        

END



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverAllRisksReport' AND TYPE='P')
BEGIN
 DROP PROCEDURE getOverAllRisksReport          
END
GO

Create procedure  getOverAllRisksReport
@startDate Datetime,
@endDate Datetime
AS
BEGIN

--DECLARE @startDate DATE = DATEADD(DAY, -10, GETDATE());
--DECLARE @endDate DATE = GETDATE();
SELECT C.CUST_NM as Customer, P.PROJ_NM as Project, por.TITLE as Portfolio , r.DESCRIPTION, r.IMPACT as [Business Impact] , r.OWNER,  FORMAT(r.IDENTIFIED_DATE, 'dd MMM yyyy') AS IDENTIFIED_DATE,  FORMAT(r.TARGET_DATE, 'dd MMM yyyy') AS TARGET_DATE ,
r.STATUS, iif(impact_scale <3, 'L',iif(impact_scale >3, 'H', 'M')) SEVERITY,
CASE WHEN (convert(varchar,R.TARGET_DATE,112) < convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed' )) THEN 'RISKS_PAST_DUE_DATE'
WHEN  (convert(varchar,R.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed')) THEN 'RISKS_DUE_FOR_CLOSURE'
end as STATUS_TYPE  ,
case when isnull(proj_status, '') != ' ' then 'Active' else 'Inactive' end AS PROJECT_STATUS  ,
P.CUST_ID,
r.[PROJECT_ID] AS PROJ_ID ,r.RISK_TREATMENT_STRATEGY ,a.DESCRIPTION as [Risk Treatment Plan / Action Plan],FORMAT(a.IDENTIFIED_DATE, 'dd MMM yyyy') AS RISK_TREATMENT_PLAN_IDENTIFIED_DATE,  FORMAT(a.TARGET_DATE, 'dd MMM yyyy') AS RISK_TREATMENT_PLAN_TARGET_DATE ,
CASE WHEN r.PROBABILITY_SCALE = 1 then 'Rare'
WHEN r.PROBABILITY_SCALE = 2 then 'Remote'
WHEN r.PROBABILITY_SCALE = 3 then 'Moderate'
WHEN r.PROBABILITY_SCALE = 4 then 'Likely'
WHEN r.PROBABILITY_SCALE = 5 then 'Frequent' END AS [LIKELIHOOD],
CASE WHEN r.IMPACT_SCALE = 1 then 'Insignificant'
WHEN r.IMPACT_SCALE = 2 then 'Minor'
WHEN r.IMPACT_SCALE = 3 then 'Significant'
WHEN r.IMPACT_SCALE = 4 then 'Major'
WHEN r.IMPACT_SCALE = 5 then 'Critical' END AS [CONSEQUENCES] ,
FORMAT(r.ACTUAL_DATE,'dd MMM yyyy') as [Date Occurred / Closed]
FROM PROJECT_RISK r  (NOLOCK)
inner join project p (NOLOCK)  on p.proj_id =  r.PROJECT_ID and r.ISACTIVE =1   and isnull(p.PROJ_STATUS,'') != 'Close'
inner join PROJECT_ACTIONITEM a on a.RISK_ID = r.ID
LEFT OUTER JOIN portfolio_project pp (NOLOCK) on pp.proj_id =  r.PROJECT_ID
LEFT join portfolio por on por.id = pp.portfolio_id
INNER JOIN CUSTOMER C (NOLOCK)
ON C.CUST_ID=P.CUST_ID
where r.identified_date between @startDate and @endDate
ORDER BY C.CUST_NM,P.PROJ_NM, IDENTIFIED_DATE desc
END
