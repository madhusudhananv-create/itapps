IF EXISTS
(
    SELECT 1
    FROM sys.procedures
    WHERE name = 'usp_get_AllKPIBy_Mode'
          AND TYPE = 'P'
)
BEGIN
    DROP PROCEDURE [dbo].usp_get_AllKPIBy_Mode
END
GO

CREATE proc [dbo].[usp_get_AllKPIBy_Mode]      
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
SLA.ID,SLA.SLA_CATEGORY,                
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
join KPI_TARGETS KT on K.ID = KT.KPI_ID   and kt.isactive = 1                 
inner join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING kpimap on k.GLOBAL_KPI_CATEGORY_ID = kpimap.GLOBAL_KPI_CATEGORY_ID and kpimap.ISACTIVE = 1                
inner join GLOBAL_PERSPECTIVE per on per.ID = kpimap.GLOBAL_PERSPECTIVE_ID and per.ISACTIVE = 1                              
join GLOBAL_KPI_CATEGORY GC on K.GLOBAL_KPI_CATEGORY_ID = GC.ID and GC.ISACTIVE = 1                
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                    
join KPI2PRODUCT_SERVICE_LEVEL_METRICS K2P on K.ID = K2P.KPI_ID              
join PRODUCT_SERVICE_LEVEL_METRICS PSL on K2P.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID and PSL.SERVICE_LEVEL_TYPE_ID = @servicelvlId                   
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1                
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                     
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                    
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                    
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                               
where K.MODE_ID = @modeId and PP.ID = @prodId  ANd K.ISACTIVE=1                   
                    
)                    
SELECT * INTO #TEMPCTE from CTE         
            
SELECT * FROM #TEMPCTE                           
                    
DROP TABLE #TEMPCTE                          
                    
END   
  