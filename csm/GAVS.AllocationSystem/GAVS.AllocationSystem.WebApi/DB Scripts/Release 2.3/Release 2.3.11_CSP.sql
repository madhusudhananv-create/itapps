

USE CSP
GO

Declare  @RESOURCEID int = 822
Declare @EMPID varchar(50) = '104474'

Declare @RescourceName varchar(250) = 'Settings > SQA Management > SQA Management'
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName) 
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,13,'','','',null,@EMPID,@EMPID,1,0,0,0,0)


END
 

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,@EMPID,@EMPID),
	(@RESOURCEID,'CREATE',null,@EMPID,@EMPID),
	(@RESOURCEID,'EDIT',null,@EMPID,@EMPID),
	(@RESOURCEID,'DELETE',null,@EMPID,@EMPID)
end
GO


Declare  @RESOURCEID int = 823
Declare @EMPID varchar(50) = '104474'

Declare @RescourceName varchar(250) = 'Settings > SQA Management > GRC'
if not exists(select 1 from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName) 
begin

	insert into csp..APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,@EMPID)

	set @RESOURCEID = (select RESOURCE_ID from csp..APP_CONTROLS where RESOURCE_NAME = @RescourceName )

end

if not exists(select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_ACCESS_CONTROLS 
	 (RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
	 EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS) 
	 values (@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,0,0,0,0),
	 (@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0),
	 (@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0)


END
 

if not exists (select 1 from csp..APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin

	insert into csp..APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY) 
	values (@RESOURCEID,'VIEW',null,@EMPID,@EMPID),
	(@RESOURCEID,'CREATE',null,@EMPID,@EMPID),
	(@RESOURCEID,'EDIT',null,@EMPID,@EMPID),
	(@RESOURCEID,'DELETE',null,@EMPID,@EMPID)
end
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetKPIWiseDetailDataForPeriod
END
GO


CREATE PROC GetKPIWiseDetailDataForPeriod    
        
@customerId varchar(50),              
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
 ,ft.id as FID,ft.formula ,PP.TIER_ID ,RM.REFERENCE        
                   
 FROM csp..KPI K                                    
 --INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                  
 LEFT JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1      and    
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                    
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))             
                       
  INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                  
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID
  INNER JOIN REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1    
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
 ,max( formula) as FORMULA,REFERENCE            
          
  from cte  --where PORTFOLIO_ID=2          
  group by   KPI_NAME, cte.PORTFOLIO_ID,SERVICE_AREA_TYPE,UNIT_OF_MEASUREMENT,SERVICE_LEVEL,REFERENCE       
  order by   3, 2,1   
 END  
 GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_AllKPIBy_Mode' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].usp_get_AllKPIBy_Mode
END
GO


CREATE proc usp_get_AllKPIBy_Mode              
          
          
@modeId int,              
@servicelvlId int,          
@prodId int          
          
AS              
BEGIN              
      
;WITH CTE(ID,KPI_ID,SERVICE_AREA_ID,PRODUCT_ID,MODE_ID,SERVICE_LEVEL_METRICS,SERVICE_AREA_TYPE,          
SERVICE_LEVEL_ID,SERVICE_LEVEL,          
CATEGORY_ID,SLA_CATEGORY,REFERENCE_ID,REFERENCE,SUPPORT_WINDOW,PRIORITY,              
EXPECTED_SERVICE_LEVEL,MINIMUM_SERVICE_LEVEL,EXPECTED_TARGET_OPERATOR,MINIMUM_TARGET_OPERATOR,FREQUENCY,SERVICE_LEVEL_METRIC_DESCRIPTION,SPECIFICATION_LIMIT,UNIT_OF_MEASUREMENT,START_DATE,END_DATE,TIER)              
AS              
(              
select KT.ID,K.ID as KPI_ID,PSA.ID as SERVICE_AREA_ID,K.PRODUCT_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,PSA.SERVICE_AREA_TYPE,          
SLT.ID,SLT.SERVICE_LEVEL,          
GC.ID,          
GC.LONG_DESC,          
PSL.REFERENCE_ID,          
RM.REFERENCE,          
K.SUPPORT_WINDOW,K.PRIORITY,          
--SLA.SLA_CATEGORY,              
KT.EXPECTED_SERVICE_LEVEL,                              
KT.MINIMUM_SERVICE_LEVEL,            
KT.SLA_TARGET_HIGH_OPERATOR as EXPECTED_TARGET_OPERATOR,            
KT.SLA_TARGET_VERYHIGH_OPERATOR as MINIMUM_TARGET_OPERATOR,            
K.FREQUENCY,PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,            
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
K.SLA_TARGET_UNIT_OF_MEASUREMENT,            
CAST(KT.START_DATE AS DATE) as START_DATE,            
CAST(KT.END_DATE AS DATE) as END_DATE, 'Tier' + Cast(PT.TIER_ID  as varchar(1)) AS TIER          
from KPI K              
join KPI_TARGETS KT on K.ID = KT.KPI_ID              
inner join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING kpimap on k.GLOBAL_KPI_CATEGORY_ID = kpimap.GLOBAL_KPI_CATEGORY_ID and kpimap.ISACTIVE = 1          
inner join GLOBAL_PERSPECTIVE per on per.ID = kpimap.GLOBAL_PERSPECTIVE_ID and per.ISACTIVE = 1                        
join GLOBAL_KPI_CATEGORY GC on K.GLOBAL_KPI_CATEGORY_ID = GC.ID and GC.ISACTIVE = 1          
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID              
join KPI2PRODUCT_SERVICE_LEVEL_METRICS K2P on K.ID = K2P.KPI_ID        
join PRODUCT_SERVICE_LEVEL_METRICS PSL on K2P.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID and PSL.SERVICE_LEVEL_TYPE_ID = @servicelvlId             
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1          
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID               
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID              
--join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID              
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                         
where K.MODE_ID = @modeId and PP.ID = @prodId              
              
)              
SELECT * INTO #TEMPCTE from CTE                    
      
SELECT * FROM #TEMPCTE                     
              
DROP TABLE #TEMPCTE                    
              
END   
GO



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetEngagementKPIDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetEngagementKPIDetails
END
GO


CREATE PROC GetEngagementKPIDetails          
       
@customerId varchar(50),          
@startDate Datetime,                                            
@endDate Datetime,          
@kpiName varchar(150),          
@status varchar(10),        
@viewBy varchar(100)            
      
AS          
BEGIN          
          
declare  @quarterStartDate Datetime              
declare @quarterEndDate datetime              
          
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));              
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));              
          
IF(@viewBy = 'By Expected Service Level')      
 BEGIN      
  select K.KPI_NAME,P.TITLE,PP.PRODUCT_TITLE,KD.PERIOD,BM.NUMERATORDESCRIPTION,BM.DENOMINATORDESCRIPTION,          
  KBM.NUMERATOR,KBM.DENOMINATOR,          
  KT.MINIMUM_SERVICE_LEVEL,KT.EXPECTED_SERVICE_LEVEL,KD.KPI_ACTUAL,KD.SLA_STATUS,KD.SECONDARY_SLA_STATUS          
  from KPI K           
  join KPI_TARGETS KT on K.ID = KT.KPI_ID and KT.ISACTIVE = 1       
  join KPI_DETAILS KD on K.ID = KD.KPI_ID and KD.SLA_STATUS = @status and KD.ISACTIVE = 1 and         
  ((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                            
  or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )           
  join service_level_measurement_2_base_measure_config slm on K.ID = slm.KPI_ID   and slm.ISACTIVE = 1       
  join BASE_MEASURE BM on slm.BASE_MEASURE_ID = BM.ID  and BM.ISACTIVE = 1        
  join KPI_BASE_MEASURE_VALUE KBM on BM.ID = KBM.BASE_MEASURE_ID and KD.ID = KBM.KPI_DETAILS_ID  and KBM.ISACTIVE = 1        
  join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1       
  join PORTFOLIO P on PP.PORTFOLIO_ID = P.ID   and P.ISACTIVE = 1       
  where K.CUSTOMER_ID = @customerId and K.KPI_NAME = @kpiName          
  and K.ISACTIVE = 1     order by PP.PRODUCT_TITLE     
 END      
ELSE      
 BEGIN      
   select K.KPI_NAME,P.TITLE,PP.PRODUCT_TITLE,KD.PERIOD,BM.NUMERATORDESCRIPTION,BM.DENOMINATORDESCRIPTION,          
   KBM.NUMERATOR,KBM.DENOMINATOR,          
   KT.MINIMUM_SERVICE_LEVEL,KT.EXPECTED_SERVICE_LEVEL,KD.KPI_ACTUAL,KD.SLA_STATUS,KD.SECONDARY_SLA_STATUS          
   from KPI K           
   join KPI_TARGETS KT on K.ID = KT.KPI_ID and KT.ISACTIVE = 1         
   join KPI_DETAILS KD on K.ID = KD.KPI_ID and KD.SECONDARY_SLA_STATUS = @status and KD.ISACTIVE = 1   and       
  ((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                            
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )      
   join service_level_measurement_2_base_measure_config slm on K.ID = slm.KPI_ID  and slm.ISACTIVE = 1        
   join BASE_MEASURE BM on slm.BASE_MEASURE_ID = BM.ID  and BM.ISACTIVE = 1        
   join KPI_BASE_MEASURE_VALUE KBM on BM.ID = KBM.BASE_MEASURE_ID and KD.ID = KBM.KPI_DETAILS_ID  and KBM.ISACTIVE = 1         
   join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE = 1         
   join PORTFOLIO P on PP.PORTFOLIO_ID = P.ID and P.ISACTIVE = 1          
   where K.CUSTOMER_ID = @customerId and K.KPI_NAME = @kpiName          
   and K.ISACTIVE = 1           
   order by PP.PRODUCT_TITLE    
 END      
END 
GO