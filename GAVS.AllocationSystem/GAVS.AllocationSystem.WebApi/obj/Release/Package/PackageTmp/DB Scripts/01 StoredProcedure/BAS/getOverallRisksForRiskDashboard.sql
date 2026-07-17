
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallRisksForRiskDashboard' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallRisksForRiskDashboard]
END
GO

CREATE PROCEDURE [dbo].[getOverallRisksForRiskDashboard]                            
    
@startDate date = null,    
@endDate date = null,                  
@custIds varchar(max),    
@riskStatus varchar(max),    
@projIds varchar(max)=null,  
@businessUnits varchar(max)  
  
AS  
  
BEGIN        

Select C.CUST_NM,P.PROJ_NM,PR.DESCRIPTION,PR.IMPACT,PR.PROBABILITY_SCALE,PR.IMPACT_SCALE,    
CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate'     
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END AS RISK_LEVEL,    
PR.OWNER,PR.AREA,PR.IDENTIFIED_BY,PR.IDENTIFIED_DATE,PR.RISK_TREATMENT_STRATEGY,PR.TARGET_DATE,PR.STATUS,    
PR.ACTION_TAKEN,P.BUSINESS_UNIT,C.CUST_ID,P.PROJ_ID,PR.ID    
from       
PROJECT_RISK PR  (NOLOCK)          
inner join PROJECT p (NOLOCK) on PR.PROJECT_ID = P.PROJ_ID  and ISNULL(P.PROJ_STATUS ,'') != 'Close'    
inner join CUSTOMER c  (NOLOCK) on P.CUST_ID = C.CUST_ID    
      
WHERE 
    (@startdate IS NULL OR PR.IDENTIFIED_DATE > @startdate) AND (@enddate IS NULL OR PR.IDENTIFIED_DATE< @enddate)
AND PR.ISACTIVE=1 
AND (@custIds = '-1' OR C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))      
AND (@riskStatus = '-1' OR PR.STATUS in (SELECT * FROM [DBO].[FN_SPLITSTRING](@riskStatus,',')))      
AND (@businessUnits = '-1' OR P.BUSINESS_UNIT in (SELECT * FROM [DBO].[FN_SPLITSTRING](@businessUnits,',')))    
AND (ISNULL(@projIds,'-1') = '-1' OR P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,',')))      
order by C.CUST_NM,PR.IDENTIFIED_DATE DESC     

END    
GO