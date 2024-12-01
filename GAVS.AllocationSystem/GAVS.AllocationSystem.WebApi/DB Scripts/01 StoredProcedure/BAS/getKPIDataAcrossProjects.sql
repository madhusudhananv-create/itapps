
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getKPIDataAcrossProjects' AND TYPE='P')
BEGIN
DROP PROCEDURE getKPIDataAcrossProjects          
END
GO  
  
CREATE PROCEDURE [dbo].[getKPIDataAcrossProjects]              
      
@Startdate Date,              
@Enddate Date,              
@GlobalKpis varchar(max),            
@Customerids varchar(max),            
@Projectids  varchar(max)            
  
AS            
BEGIN            
  SET @Enddate=DATEADD(d,1,@Enddate);
  Select DISTINCT per.ID as PERSPECTIVE_ID, per.SHORT_DESC  as KPI_CATEGORY, kpicat.ID AS GLOBAL_KPI_ID, kpicat.SHORT_DESC AS GLOBAL_KPI_NAME, k.customer_id AS CUST_ID, c.CUST_NM, k.project_id AS PROJ_ID,    
   p.PROJ_NM,e.FRST_NM as CSM_NAME, p.PROJ_DM_EMP_ID     
as CSM_EMP_ID,              
   k.goal_id, GOALS.DESCRIPTION AS GOAL_DESC, k.ID AS KPI_ID, k.KPI_NAME, details.PERIOD, details.PERIOD_TYPE, k.ABBREVIATION, k.SERVICE_AREA,     
       
     (SELECT top 1 SLA_TARGET_VERYHIGH_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_VERYHIGH_VALUE    
       ,(SELECT top 1 SLA_TARGET_VERYHIGH_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND   KPI_ID = details.KPI_ID)     as SLA_TARGET_VERYHIGH_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_VERYHIGH_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_VERYHIGH_DESCRIPTION            
  
    ,(SELECT top 1 SLA_TARGET_HIGH_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_HIGH_VALUE    
       ,(SELECT top 1 SLA_TARGET_HIGH_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_HIGH_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_HIGH_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_HIGH_DESCRIPTION            
  
    ,(SELECT top 1 SLA_TARGET_MEDIUM_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_MEDIUM_VALUE    
       ,(SELECT top 1 SLA_TARGET_MEDIUM_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND    KPI_ID = details.KPI_ID)     as SLA_TARGET_MEDIUM_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_MEDIUM_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND KPI_ID = details.KPI_ID)     as SLA_TARGET_MEDIUM_DESCRIPTION            
  
    ,(SELECT top 1 SLA_TARGET_LOW_VALUE FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_LOW_VALUE    
       ,(SELECT top 1 SLA_TARGET_LOW_OPERATOR FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_LOW_OPERATOR            
       ,(SELECT top 1 SLA_TARGET_LOW_DESCRIPTION FROM KPI_TARGETS (NOLOCK) WHERE details.PERIOD >= START_DATE AND details.PERIOD <= END_DATE AND  KPI_ID = details.KPI_ID)     as SLA_TARGET_LOW_DESCRIPTION            
    
       ,CASE WHEN details.PERIOD_TYPE = 'Week1' then     
                     CONVERT(CHAR(3),CONVERT(datetime,     
                                     SWITCHOFFSET(CONVERT(datetimeoffset,     
                                                                           details.PERIOD),     
                                                              DATENAME(TzOffset, SYSDATETIMEOFFSET()))) , 0)     
                                                    
       ELSE CONVERT(CHAR(3), details.[PERIOD], 0)  END AS MONTH_NM       
                    
   ,YEAR(details.[PERIOD]) AS YEAR  ,                       
    details.KPI_ACTUAL, k.SLA_TARGET_UNIT_OF_MEASUREMENT, k.PRIORITY, k.SUPPORT_WINDOW, k.IS_SOW_COMMITMENT, details.ISFLAG    
    from KPI_DETAILS details              
              
 inner join KPI K on k.ID = details.KPI_ID and details.ISACTIVE = 1  and (@GlobalKpis = '' or k.GLOBAL_KPI_CATEGORY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@GlobalKpis,',')) )          
 inner join KPI_TARGETS target on k.ID = target.KPI_ID and target.ISACTIVE = 1              
 inner join KPI_GOALS goals on k.GOAL_ID = goals.ID and goals.ISACTIVE = 1              
 inner join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING kpimap on k.GLOBAL_KPI_CATEGORY_ID = kpimap.GLOBAL_KPI_CATEGORY_ID and k.ISACTIVE = 1 and kpimap.ISACTIVE = 1              
 inner join GLOBAL_PERSPECTIVE per on per.ID = kpimap.GLOBAL_PERSPECTIVE_ID and per.ISACTIVE = 1              
 inner join GLOBAL_KPI_CATEGORY kpicat on kpimap.GLOBAL_KPI_CATEGORY_ID = kpicat.ID and kpicat.ISACTIVE = 1              
 inner join CUSTOMER c on c.CUST_ID = k.CUSTOMER_ID  and  (@Customerids = '' or k.CUSTOMER_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Customerids,',')))            
 inner join PROJECT p on p.PROJ_ID = k.PROJECT_ID   and (@Projectids = '' or p.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Projectids,','))  )           
 inner join EMP_INFO e on e.EMP_ID = p.PROJ_DM_EMP_ID              
           
 where details.PERIOD between @Startdate and @Enddate    
    
 order by k.CUSTOMER_ID, k.PROJECT_ID, k.ID, details.PERIOD        
           
 end    