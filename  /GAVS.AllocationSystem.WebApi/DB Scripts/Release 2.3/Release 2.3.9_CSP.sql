

USE CSP
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'CAUSE_ID'
          AND Object_ID = Object_ID('audit_findings_capa'))
BEGIN
    ALTER TABLE csp..audit_findings_capa 
    ADD CAUSE_ID INT 
END
GO


IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'ROOTCAUSE'
          AND Object_ID = Object_ID('audit_findings_capa'))
BEGIN
    ALTER TABLE csp..audit_findings_capa 
    ADD ROOTCAUSE VARCHAR(1000)
END
GO

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'ROOT_CAUSE_ID'
          AND Object_ID = Object_ID('AUDIT_FINDINGS_CAPA'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDINGS_CAPA ALTER COLUMN ROOT_CAUSE_ID int null
END
GO

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'ROOT_CAUSE_ID'
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_REVIEW'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDING_CAPA_REVIEW ALTER COLUMN ROOT_CAUSE_ID int null
END
GO


IF  EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'ROOT_CAUSE_ID'
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_IMPLEMENTATION'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION ALTER COLUMN ROOT_CAUSE_ID int null
END
GO

IF   EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'ROOT_CAUSE_ID'
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_VERIFICATION'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDING_CAPA_VERIFICATION ALTER COLUMN ROOT_CAUSE_ID int null
END
GO

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'ROOT_CAUSE_ID'
          AND Object_ID = Object_ID('AUDIT_FINDING_CAPA_STATUS_HISTORY'))
BEGIN
    ALTER TABLE  CSP..AUDIT_FINDING_CAPA_STATUS_HISTORY ALTER COLUMN ROOT_CAUSE_ID int null
END
GO

IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'cause_id'
          AND Object_ID = Object_ID('AUDIT_FINDINGS_CAPA'))
BEGIN
    UPDATE csp..AUDIT_FINDINGS_CAPA  SET cause_id = (SELECT cause_id FROM CSP..AUDIT_MANAGEMENT_ROOTCAUSES r WHERE r.ID = root_cause_id)
END
GO


IF EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'ROOT_CAUSE'
          AND Object_ID = Object_ID('AUDIT_FINDINGS_CAPA'))
BEGIN
    UPDATE csp..AUDIT_FINDINGS_CAPA  SET rootcause = (SELECT ROOT_CAUSE FROM CSP..AUDIT_MANAGEMENT_ROOTCAUSES r WHERE r.ID = root_cause_id)
END
GO

IF NOT EXISTS (select 1 from CSP..AUDIT_MANAGEMENT_CAUSES where causes = 'Maintenance')
Begin
insert into CSP..AUDIT_MANAGEMENT_CAUSES values ('Maintenance',1)
end
go

IF NOT EXISTS (select 1 from CSP..AUDIT_MANAGEMENT_CAUSES where causes = 'Management/Money Power')
Begin
insert into CSP..AUDIT_MANAGEMENT_CAUSES values ('Management/Money Power',1)
end
go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[GetKPIWiseDetailDataForPeriod]
END
GO

CREATE PROC GetKPIWiseDetailDataForPeriod  
      
@customerId int,            
@startDate DateTime,                              
@endDate DateTime    ,    
   @isCustomer bit =0                   
                      
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
 ,ft.id as FID,ft.formula ,PP.TIER_ID       
                 
 FROM csp..KPI K                                  
 --INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                
 LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1      and  
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                  
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))           
                     
 INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID                      
  INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                      
 INNER JOIN PRODUCTS_SERVICE_LEVEL_TYPE PSLT on PSL.SERVICE_LEVEL_TYPE_ID = PSLT.ID        
 INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                      
 --INNER JOIN PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                    
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                     
 where                  
 K.CUSTOMER_ID  = @customerId    and  isnull(KD.ISFLAG,0)= 0 and  isnull(KD.ISDRAFT,0)= 0           
 and k.ISACTIVE =1     and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )              
         
 )         
         
  select                  
    KPI_NAME                
 ,cte.PORTFOLIO_ID,SERVICE_AREA_TYPE        
 ,CATEGORY = (select SHORT_DESC from GLOBAL_KPI_CATEGORY GC join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING GKC on        
 GC.ID = GKC.GLOBAL_KPI_CATEGORY_ID join KPI k on K.GLOBAL_KPI_CATEGORY_ID=GKC.GLOBAL_KPI_CATEGORY_ID where K.ID = max(cte.ID))        
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                
 , sum(KPI_NUMERATOR) as KPI_NUMERATOR                
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR
 ,MINIMUM_SERVICE_LEVEL = (select CASE WHEN isnull(MINIMUM_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then 
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)
 ELSE MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))

 ,EXPECTED_SERVICE_LEVEL = (select CASE WHEN isnull(EXPECTED_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then 
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)
 ELSE EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))
 ,UNIT_OF_MEASUREMENT,SERVICE_LEVEL,max( FID) as FORMULA_ID                
 ,max( formula) as FORMULA          
        
  from cte  --where PORTFOLIO_ID=2        
  group by   KPI_NAME, cte.PORTFOLIO_ID,SERVICE_AREA_TYPE,UNIT_OF_MEASUREMENT,SERVICE_LEVEL      
  order by   3, 2,1 
 END
 GO

 if exists(select 1 from CSP..FILTER_PREFERENCE  where FIELD_NAME = 'servicE_AREA_TYPE')
 begin
   update CSP..FILTER_PREFERENCE set FIELD_NAME = 'servicE_AREA_ID' where FIELD_NAME = 'servicE_AREA_TYPE'
 end
 go

 if exists(select 1 from CSP..FILTER_PREFERENCE  where FIELD_NAME = 'servicE_LEVEL')
 begin
   update CSP..FILTER_PREFERENCE set FIELD_NAME = 'servicE_LEVEL_ID' where FIELD_NAME = 'servicE_LEVEL'
 end
 go

