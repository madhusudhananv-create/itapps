
USE CSP
GO

IF EXISTS(Select 1 from sys.procedures where name ='getOverAllIssuesData' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverAllIssuesData]
END
GO 

 CREATE PROCEDURE [dbo].[getOverAllIssuesData]      
  AS      
  BEGIN      
      
  select distinct p.cust_id AS CUST_ID, [PROJECT_ID] AS PROJ_ID, pp.PORTFOLIO_ID, A.DESCRIPTION, A.IDENTIFIED_DATE, A. STATUS, A.SEVERITY,      
      
 iif(convert(varchar,A.TARGET_DATE,112) >= convert(varchar,GETDATE(),112), 'ISSUES_DUE_FOR_CLOSURE', 'ISSUES_PAST_DUE_DATE') AS STATUS_TYPE      
  FROM [CSP].[dbo].[PROJECT_ISSUE] A      
      
  inner join BAS.dbo.project p  on p.proj_id =  A.PROJECT_ID  AND A.STATUS != 'Closed' and A.ISACTIVE = 1      
  LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  A.PROJECT_ID      
      
 where isnull(p.proj_status,'') !='close'  
  END 
  go


IF EXISTS(Select 1 from sys.procedures where name ='getOverAllRisksData' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverAllRisksData]
END
GO 
 CREATE procedure [dbo].[getOverAllRisksData]        
  AS        
  BEGIN        
        
  SELECT P.CUST_ID, [PROJECT_ID] AS PROJ_ID, pp.PORTFOLIO_ID, r.DESCRIPTION, r.IDENTIFIED_DATE, r.STATUS, iif(impact_scale <3, 'L',iif(impact_scale >3, 'H', 'M')) SEVERITY,        
 -- iif(r.TARGET_DATE >= GETDATE(), 'RISKS_DUE_FOR_CLOSURE', 'RISKS_PAST_DUE_DATE') AS STATUS_TYPE        
   CASE WHEN (convert(varchar,R.TARGET_DATE,112) < convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed' )) THEN 'RISKS_PAST_DUE_DATE'      
   WHEN  (convert(varchar,R.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed')) THEN 'RISKS_DUE_FOR_CLOSURE'      
   end as STATUS_TYPE      
  FROM [CSP].[dbo].[PROJECT_RISK] r        
  inner join BAS.dbo.project p on p.proj_id =  r.PROJECT_ID     AND r.STATUS != 'Closed'  and r.ISACTIVE =1  and isnull(p.PROJ_STATUS,'') != 'Close'    
  LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  r.PROJECT_ID          
  
  END 
  go

IF EXISTS(Select 1 from sys.procedures where name ='getActionItemsStatus' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getActionItemsStatus]
END
GO 

CREATE procedure [dbo].[getActionItemsStatus]                  
  AS                  
  BEGIN                  
                  
  select distinct p.cust_id AS CUST_ID, [PROJECT_ID] AS PROJ_ID, p.PROJ_NM, pp.PORTFOLIO_ID, pf.TITLE AS PORTFOLIO_NAME, A.ID As ACTION_ITEM_ID, A.RAG, A.DESCRIPTION, A.SOURCE, A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,                  
  case when A.PRIORITY = 'high' then 'High'        
  when A.Priority ='normal' then 'Medium'       
  else a.PRIORITY  end as PRIORITY, A.COMPLETION_DATE, A.COMMENTS, A.CREATED_DATE, A.CREATED_BY, A.UPDATED_BY, A.UPDATED_DATE,                  
               
   CASE WHEN (convert(varchar,A.TARGET_DATE,112) < Convert(varchar,GETDATE(),112) AND A.STATUS  IN ('Planned','Started')) THEN 'PAST_DUE_DATE'              
   WHEN  (convert(varchar,A.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND A.STATUS  IN ('Planned','Started')) THEN 'DUE_FOR_CLOSURE'              
              
   END AS STATUS_TYPE, A.ISACTIVE              
   FROM PROJECT_ACTIONITEM A                  
                  
  inner join BAS.dbo.project p  on p.proj_id =  A.PROJECT_ID  and A.STATUS != 'Closed' and A.ISACTIVE = 1  and isnull(p.PROJ_STATUS,'') !='Close'             
  LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  A.PROJECT_ID                  
  left outer join PORTFOLIO pf on pf.ID = pp.PORTFOLIO_ID
  order by CUST_ID,  PROJ_NM                  
                  
  END
  go
  

IF EXISTS(Select 1 from sys.procedures where name ='getCustomerProjectPortfolioList' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCustomerProjectPortfolioList]
END
GO 
  
 CREATE PROCEDURE [dbo].[getCustomerProjectPortfolioList] @startDate datetime            
AS            
BEGIN            
           
              
SELECT CUST_ID, CUST_NM, PROJ_ID, PROJ_NM, PORTFOLIO_ID, MAX(CUSTOMER_NM) CUSTOMER_NM  FROM             
(            
SELECT P.CUST_ID, C.CUST_NM, P.PROJ_ID, IIF(P.PROJ_ALIAS_NM IS NOT NULL, P.PROJ_ALIAS_NM, P.PROJ_NM) PROJ_NM, PORTFOLIO_ID, CU.DISPLAY_NAME CUSTOMER_NM, CP.REPORTING,           
 ROW_NUMBER () over (partition by IIF(P.PROJ_ALIAS_NM IS NOT NULL, P.PROJ_ALIAS_NM, P.PROJ_NM) order by   CONVERT( int,cp.reporting) desc, CU.DISPLAY_NAME desc)   rn          
FROM bas.dbo.PROJECT P            
INNER JOIN bas.dbo.CUSTOMER C ON C.CUST_ID = P.CUST_ID            
LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID = P.PROJ_ID            
LEFT OUTER JOIN CUSTOMER_PROJECTS CP ON CP.PROJ_ID = P.PROJ_ID  and cp.reporting =1  
LEFT OUTER JOIN CUSTOMER_USERS CU ON CU.ID = CP.CUSTOMER_USER_ID             
WHERE        
--P.START_DATE <= @startDate AND       
P.PROJ_ID = P.PARENT_PROJ_ID  and isnull(p.PROJ_STATUS,'') != 'Close' 
          
) TBL            
where   rn =1          
GROUP BY CUST_ID, CUST_NM, PROJ_ID, PROJ_NM, PORTFOLIO_ID  , reporting          
ORDER BY CUST_NM, PORTFOLIO_ID, PROJ_NM          
           
END
go

IF EXISTS(Select 1 from sys.procedures where name ='getKPIDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getKPIDetails]
END
GO 
  
CREATE PROCEDURE [dbo].[getKPIDetails]          
@START_DATE datetime,          
@END_DATE datetime           
AS          
BEGIN          
SELECT KD.[ID],KD.[KPI_ID],KD.[PERIOD], MONTH(KD.[PERIOD]) AS MONTH_VAL, CONVERT(CHAR(3), KD.[PERIOD], 0) AS MONTH_NM          
 ,YEAR(KD.[PERIOD]) AS YEAR          
 ,DATEFROMPARTS(YEAR(KD.[PERIOD]), MONTH(KD.[PERIOD]), 1) AS MONTH_YEAR          
 ,K.[KPI_NAME], K.[PRIORITY], K.[SUPPORT_WINDOW]          
 ,KD.[PERIOD_TYPE],KD.[KPI_ACTUAL],KD.[KPI_METRIC],KD.[HIGHLIGHTS],KD.[CREATED_BY],KD.[CREATED_DATE],KD.[UPDATED_BY],KD.[UPDATED_DATE],KD.[ISACTIVE],KD.[ISFLAG]          
 ,K.CUSTOMER_ID, C.CUST_NM CUSTOMER_NM, K.PROJECT_ID, P.PROJ_NM PROJECT_NM, K.GOAL_ID          
 ,K.GLOBAL_KPI_CATEGORY_ID          
 ,GKC.SHORT_DESC GLOBAL_KPI_CATEGORY_NM          
 ,(SELECT GLOBAL_PERSPECTIVE_ID FROM GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING WHERE GLOBAL_KPI_CATEGORY_ID = K.GLOBAL_KPI_CATEGORY_ID AND GLOBAL_PERSPECTIVE_ID IN (SELECT ID FROM GLOBAL_PERSPECTIVE WHERE GROUP_CODE = 'KPI')) as GLOBAL_KPI_PERSPECTIVE_ID   
  
    
      
        
          
 ,IS_SOW_COMMITMENT, K.SERVICE_AREA,          
 K.SLA_TARGET_UNIT_OF_MEASUREMENT          
,(SELECT top 1 SLA_TARGET_VERYHIGH_VALUE FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_VERYHIGH_VALUE             
,(SELECT top 1 SLA_TARGET_VERYHIGH_OPERATOR FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_VERYHIGH_OPERATOR          
,(SELECT top 1 SLA_TARGET_VERYHIGH_DESCRIPTION FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_VERYHIGH_DESCRIPTION             
,(SELECT top 1 SLA_TARGET_HIGH_VALUE FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_HIGH_VALUE            
,(SELECT top 1 SLA_TARGET_HIGH_OPERATOR FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_HIGH_OPERATOR          
,(SELECT top 1 SLA_TARGET_HIGH_DESCRIPTION FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_HIGH_DESCRIPTION          
,(SELECT top 1 SLA_TARGET_MEDIUM_VALUE FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_MEDIUM_VALUE             
,(SELECT top 1 SLA_TARGET_MEDIUM_OPERATOR FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_MEDIUM_OPERATOR          
,(SELECT top 1 SLA_TARGET_MEDIUM_DESCRIPTION FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_MEDIUM_DESCRIPTION          
,(SELECT top 1 SLA_TARGET_LOW_VALUE FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_LOW_VALUE             
,(SELECT top 1 SLA_TARGET_LOW_OPERATOR FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_LOW_OPERATOR          
,(SELECT top 1 SLA_TARGET_LOW_DESCRIPTION FROM KPI_TARGETS WHERE KD.PERIOD >= START_DATE AND KD.PERIOD <= END_DATE AND KPI_ID = KD.KPI_ID) as SLA_TARGET_LOW_DESCRIPTION          
          
FROM KPI_DETAILS KD          
          
INNER JOIN KPI K ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1  
INNER JOIN KPI_GOALS GOALS ON GOALS.ID = K.GOAL_ID AND GOALS.ISACTIVE = 1   
INNER JOIN BAS.DBO.PROJECT P ON P.PROJ_ID = K.PROJECT_ID           
INNER JOIN BAS.DBO.CUSTOMER C ON C.CUST_ID = K.CUSTOMER_ID           
INNER JOIN GLOBAL_KPI_CATEGORY GKC ON K.GLOBAL_KPI_CATEGORY_ID = GKC.ID          
WHERE PERIOD BETWEEN @START_DATE AND @END_DATE AND KD.ISFLAG=0  AND KD.ISACTIVE =1  and isnull(p.PROJ_STATUS,'') != 'Close'
ORDER BY C.CUST_NM, P.PROJ_NM  
END  
go

IF EXISTS(Select 1 from sys.procedures where name ='getIdeasAndInnovationsDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getIdeasAndInnovationsDetails]
END
GO 

CREATE PROCEDURE [dbo].[getIdeasAndInnovationsDetails]                   
  AS                    
  BEGIN        
  declare @startdate datetime      
  declare @enddate datetime      
      
  if(MONTH(GETDATE()) >= 4)      
   begin      
 set @startdate =  DATEFROMPARTS(year(getdate()), 4, 1);      
 set @enddate = DATEFROMPARTS(year(getdate()) + 1, 3 ,31);      
   end      
  else      
 begin      
  set @startdate =  DATEFROMPARTS(year(getdate())-1, 4, 1);      
  set @enddate = DATEFROMPARTS(year(getdate()), 3 ,31);          
 end          
               
    SELECT p.cust_id AS CUSTOMER_ID, [PROJECT_ID], pp.PORTFOLIO_ID, I.AUTOMATE AS AUTOMATIONS,       
 I.ISINNOVATION AS INNOVATIONS,             
  I.ISPROCESSIMPROVEMENT AS IMPROVMENTS,  I.CUSTOMER_PERSONHOUR_SAVINGS AS   EFFORTS_SAVED_PERSON_HOUR,          
  i.CUSTOMER_SAVINGS  AS DOLLARS ,  i.STATUS          
  FROM [CSP].[dbo].[PROJECT_INNOVATION] I                  
  inner join BAS.dbo.project p on p.proj_id =  I.PROJECT_ID    and i.STATUS != 'Closed' and I.ISACTIVE = 1               
  LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  I.PROJECT_ID            
  where p.end_date >= getdate()  and I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate  and isnull(p.PROJ_STATUS,'') != 'Close' 
                 
  END 
  go

IF EXISTS(Select 1 from sys.procedures where name ='getProjectStartAndEndDate' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectStartAndEndDate]
END
GO 
  
CREATE PROCEDURE [dbo].[getProjectStartAndEndDate]  
  AS  
  BEGIN  
  
  select p.cust_id AS CUST_ID, p.PROJ_ID AS PROJ_ID, pp.PORTFOLIO_ID, p.START_DATE, p.END_DATE,  
   CASE  
 WHEN START_DATE >= GETDATE() AND START_DATE <=DATEADD(month, 3, GETDATE()) THEN 'PROJECT_TO_START'  
 WHEN END_DATE >= GETDATE() AND END_DATE <= DATEADD(month, 3, GETDATE()) THEN 'PROJECT_TO_END'  
 ELSE 'Not Within 3 months'  
 END AS PROJECT_STATUS  
  
  from BAS.dbo.project p    
  LEFT OUTER JOIN portfolio_project pp on pp.proj_id =  p.PROJ_ID  and isnull(p.PROJ_STATUS,'') !='close'
  END  
  go

IF EXISTS(Select 1 from sys.procedures where name ='getCustomerProjectDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getCustomerProjectDetails]
END
GO 

CREATE PROCEDURE [dbo].[getCustomerProjectDetails]  
  AS  
  BEGIN  
  
  select p.cust_id As CUST_ID, p.PROJ_ID AS PROJ_ID, pp.PORTFOLIO_ID   
  from BAS.dbo.PROJECT p  
  LEFT OUTER JOIN CSP.dbo.portfolio_project pp  
  ON pp.PROJ_ID = p.PROJ_ID  
  Where p.cust_id != 0  and isnull(p.PROJ_STATUS,'') !='Close'
  
  END  
  go
  

    