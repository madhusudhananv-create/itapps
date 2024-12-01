
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
