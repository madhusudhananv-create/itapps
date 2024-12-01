USE CSP
GO

IF EXISTS(Select 1 from sys.procedures where name ='usp_get_servicelevel_Metrics' AND type='P')
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
                                                
;WITH CTE    
AS                                                                    
(                                                                    
select K.ID as KPI_ID,                                            
CASE WHEN K.FREQUENCY='Quarterly' then (select  top 1 ID  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                        
@quarterStartDate and @quarterEndDate) ELSE KD.ID                                                                        
END AS DETAIL_ID,                                            
PP.ID as PRODUCT_ID,PSA.ID as SERVICE_AREA_ID,PSL.SERVICE_LEVEL_TYPE_ID,K.MODE_ID,K.KPI_NAME AS SERVICE_LEVEL_METRICS,                                      
CASE WHEN K.FREQUENCY='Quarterly' then                                       
(select  top 1 PERIOD  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                        
@quarterStartDate and @quarterEndDate) ELSE KD.PERIOD END AS PERIOD,                                      
PSL.SERVICE_LEVEL_METRIC_DESCRIPTION,                                                                                  
PSA.SERVICE_AREA_TYPE,                                                  
SLT.SERVICE_LEVEL,SLA.SLA_CATEGORY,                            
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                  
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                                                                      
K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,                                          
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
CASE WHEN K.FREQUENCY='Monthly' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23)           
and CONVERT(VARCHAR(20),@endDate,23))         
                      
WHEN K.FREQUENCY='Release' then (select  top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between CONVERT(VARCHAR(20),@startDate,23) and CONVERT(VARCHAR(20),@endDate,23))   
  
   
      
      
                     
WHEN K.FREQUENCY='Quarterly' then (select top 1 KPI_ACTUAL from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                        
@quarterStartDate and @quarterEndDate) END AS KPI_ACTUAL,                                                                   
K.FREQUENCY,                                              
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                                      
  
@quarterStartDate and @quarterEndDate ) ELSE KD.SLA_STATUS  END AS SLA_STATUS,                                          
CASE WHEN isnull(KD.ISFLAG,'')='' then isnull(ISFLAG,CAST(0 as BIT)) ELSE KD.ISFLAG END AS IS_NOT_APPLICABLE,                                          
CASE WHEN K.FREQUENCY='Quarterly' then                                      
(select top 1 HIGHLIGHTS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                        
@quarterStartDate and @quarterEndDate) ELSE  KD.HIGHLIGHTS END AS REMARKS,       
                                                                    
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1 SECONDARY_SLA_STATUS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and CONVERT(varchar(20),PERIOD,23) between                                                            
  
    
@quarterStartDate and @quarterEndDate ) ELSE KD.SECONDARY_SLA_STATUS  END AS SECONDARY_SLA_STATUS,                          
    
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1  EXCLUSION_SLA_STATUS  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and period between                                                                
@quarterStartDate and @quarterEndDate ) ELSE  KD.EXCLUSION_SLA_STATUS   END AS EXCLUSION_SLA_STATUS,                          
    
 CASE WHEN K.FREQUENCY='Quarterly' then (select top 1   EXCLUSION_SECONDARY_SLA_STATUS  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and period between                                                                
@quarterStartDate and @quarterEndDate ) ELSE   KD.EXCLUSION_SECONDARY_SLA_STATUS  END AS EXCLUSION_SECONDARY_SLA_STATUS,     
    
CASE WHEN K.FREQUENCY='Quarterly' then (select top 1   EXCLUSION_KPI_ACTUAL  from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and period between                                                                
@quarterStartDate and @quarterEndDate ) ELSE  KD.EXCLUSION_KPI_ACTUAL  END AS EXCLUSION_KPI_ACTUAL,     
    
CASE WHEN K.FREQUENCY='Quarterly'   and KD.period between @quarterStartDate and @QuarterendDate then cast(1 as bit)                   
ELSE isnull(KD.ISDRAFT,1) END AS IS_DRAFT,                   
kd.isFlag as IS_FLAG  ,REFERENCE ,isnull(KD.ISNODATA,0) as IS_NO_DATA ,isnull(KD.ISEXNODATA,0) as IS_EX_NO_DATA,
CASE WHEN K.FREQUENCY='Quarterly' then                                      
(select top 1 EX_HIGHLIGHTS from KPI_DETAILS where ISACTIVE =1 and KPI_ID = K.ID and PRODUCT_ID=@productId and  CONVERT(varchar(20),PERIOD,23) between                                                                        
@quarterStartDate and @quarterEndDate) ELSE  KD.EX_HIGHLIGHTS END AS EXREMARKS  
                              
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
join REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1           
join PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                                                                    
join PRODUCTS_SLA_CATEGORY SLA on PSL.SLA_CATEGORY_ID = SLA.ID                                  
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                                                                                
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                                                                                       
where  K.ISACTIVE = 1 and KT.ISACTIVE = 1                                                        
and PP.ISACTIVE = 1  and K.PRODUCT_ID = @productId and K.MODE_ID = @modeId                                                              
)                                                                     
                                                         
SELECT distinct *  from CTE order by SERVICE_AREA_TYPE,REFERENCE                                                                           
                                              
END  
GO