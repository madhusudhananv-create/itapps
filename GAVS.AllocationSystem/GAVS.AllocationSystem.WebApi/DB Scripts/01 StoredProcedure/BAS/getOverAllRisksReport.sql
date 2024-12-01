
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverAllRisksReport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverAllRisksReport]
END
GO

CREATE procedure  getOverAllRisksReport  

@startDate Datetime,  
@endDate Datetime  

AS  
BEGIN  
  
SELECT C.CUST_NM as Customer, P.PROJ_NM as Project, por.TITLE as Portfolio , r.DESCRIPTION, r.IMPACT as [Business Impact] , 
r.OWNER,  FORMAT(r.IDENTIFIED_DATE, 'dd MMM yyyy') AS IDENTIFIED_DATE,  FORMAT(r.TARGET_DATE, 'dd MMM yyyy') AS TARGET_DATE , r.STATUS, 

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

CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate'     
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END AS RISK_RATING,

CASE WHEN (convert(varchar,R.TARGET_DATE,112) < convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed' )) THEN 'RISKS_PAST_DUE_DATE'  
WHEN  (convert(varchar,R.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed')) THEN 'RISKS_DUE_FOR_CLOSURE'  
end as STATUS_TYPE  ,  
case when isnull(proj_status, '') != '' then 'Active' else 'Inactive' end AS PROJECT_STATUS  ,  
r.RISK_TREATMENT_STRATEGY ,a.DESCRIPTION as [Risk Treatment Plan / Action Plan],
FORMAT(a.IDENTIFIED_DATE, 'dd MMM yyyy') AS RISK_TREATMENT_PLAN_IDENTIFIED_DATE,  
FORMAT(a.TARGET_DATE, 'dd MMM yyyy') AS RISK_TREATMENT_PLAN_TARGET_DATE ,  
FORMAT(r.ACTUAL_DATE,'dd MMM yyyy') as [Date Occurred / Closed] ,
P.CUST_ID, r.[PROJECT_ID] AS PROJ_ID

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
GO
