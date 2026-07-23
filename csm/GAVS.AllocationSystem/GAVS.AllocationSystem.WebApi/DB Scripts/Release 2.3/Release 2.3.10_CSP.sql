USE CSP
GO
/****** Object:  StoredProcedure [dbo].[getOverAllRisksData]    Script Date: 27-06-2022 15:02:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverAllRisksData' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getOverAllRisksData
END
GO

/*
---------------------------------------------------
-- Author        : Indhu   
-- Date      : 27-06-2022    
-- Purpose       : get OverAll project Risks Data  
--------------------------------------------------- 
-- ver     user             date             change  
-- 1.0    Indhu         27-06-2022       Added Customer name, project name & order by  
#########################################################################  */
CREATE procedure [dbo].[getOverAllRisksData]        
AS        
BEGIN        
    
SELECT P.CUST_ID,C.CUST_NM, [PROJECT_ID] AS PROJ_ID,P.PROJ_NM ,pp.PORTFOLIO_ID, r.DESCRIPTION, r.IDENTIFIED_DATE, r.STATUS, iif(impact_scale <3, 'L',iif(impact_scale >3, 'H', 'M')) SEVERITY,          
CASE WHEN (convert(varchar,R.TARGET_DATE,112) < convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed' )) THEN 'RISKS_PAST_DUE_DATE'        
WHEN  (convert(varchar,R.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed')) THEN 'RISKS_DUE_FOR_CLOSURE'        
end as STATUS_TYPE  ,
case when isnull(proj_status, '') != ' ' then 'Active' else 'Inactive' end AS PROJECT_STATUS
FROM [CSP].[dbo].[PROJECT_RISK] r  (NOLOCK)       
inner join BAS.dbo.project p (NOLOCK)  on p.proj_id =  r.PROJECT_ID     AND r.STATUS != 'Closed'  and r.ISACTIVE =1  and isnull(p.PROJ_STATUS,'') != 'Close'      
LEFT OUTER JOIN portfolio_project pp (NOLOCK) on pp.proj_id =  r.PROJECT_ID    
INNER JOIN BAS.dbo.CUSTOMER C (NOLOCK)  
ON C.CUST_ID=P.CUST_ID
ORDER BY C.CUST_NM,P.PROJ_NM,r.DESCRIPTION    

END 

GO

IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'REFERENCE_MASTER') 
Begin
drop table REFERENCE_MASTER
End
GO

IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'REFERENCE_MATRIX') 
Begin

EXEC sp_rename 'REFERENCE_MATRIX', 'REFERENCE_MASTER'

End
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='usp_get_AllKPIBy_Mode' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_get_AllKPIBy_Mode]
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
EXPECTED_SERVICE_LEVEL,MINIMUM_SERVICE_LEVEL,EXPECTED_TARGET_OPERATOR,MINIMUM_TARGET_OPERATOR,FREQUENCY,SERVICE_LEVEL_METRIC_DESCRIPTION,SPECIFICATION_LIMIT,UNIT_OF_MEASUREMENT,START_DATE,END_DATE)            
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
CAST(KT.END_DATE AS DATE) as END_DATE          
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
     
MINIMUM_SERVICE_LEVEL,UNIT_OF_MEASUREMENT,SPECIFICATION_LIMIT,KPI_ACTUAL,FREQUENCY,SLA_STATUS,IS_NOT_APPLICABLE,REMARKS,SECONDARY_SLA_STATUS,IS_DRAFT, IS_FLAG,REFERENCE)                                                            
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
CASE WHEN K.FREQUENCY='Quarterly'   and KD.period between @quarterStartDate and @QuarterendDate then cast(1 as bit)           
ELSE isnull(KD.ISDRAFT,1) END AS IS_DRAFT,           
kd.isFlag as IS_FLAG  ,REFERENCE                              
                      
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
                                                 
SELECT distinct *  from CTE order by SERVICE_AREA_TYPE,SLA_CATEGORY                                                                     
                                      
END 
GO

