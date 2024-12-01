USE BAS
GO
/****** Object:  StoredProcedure [dbo].[getOverAllRisksReport]    Script Date: 04-07-2022 15:02:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverAllRisksReport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getOverAllRisksReport
END
GO

/*
---------------------------------------------------
-- Author        : Indhu   
-- Date      : 04-07-2022    
-- Purpose       : get OverAll project Risks Report  
--------------------------------------------------- 
-- ver     user             date             change  
-- 1.0    Indhu          04-07-2022       initial version
#########################################################################  */
CREATE procedure [dbo].[getOverAllRisksReport]        
AS        
BEGIN        
    
    
SELECT P.CUST_ID,C.CUST_NM, [PROJECT_ID] AS PROJ_ID,P.PROJ_NM ,pp.PORTFOLIO_ID, r.DESCRIPTION, r.IMPACT, r.OWNER,  FORMAT(IDENTIFIED_DATE, 'dd MMM yyyy') AS IDENTIFIED_DATE,  FORMAT(TARGET_DATE, 'dd MMM yyyy') AS TARGET_DATE ,  r.STATUS, iif(impact_scale <3, 'L',iif(impact_scale >3, 'H', 'M')) SEVERITY,          
CASE WHEN (convert(varchar,R.TARGET_DATE,112) < convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed' )) THEN 'RISKS_PAST_DUE_DATE'        
WHEN  (convert(varchar,R.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed')) THEN 'RISKS_DUE_FOR_CLOSURE'        
end as STATUS_TYPE  ,
case when isnull(proj_status, '') != ' ' then 'Active' else 'Inactive' end AS PROJECT_STATUS
FROM [CSP].[dbo].[PROJECT_RISK] r  (NOLOCK)       
inner join BAS.dbo.project p (NOLOCK)  on p.proj_id =  r.PROJECT_ID and r.ISACTIVE =1 AND r.STATUS != 'Closed'  and isnull(p.PROJ_STATUS,'') != 'Close'      
LEFT OUTER JOIN CSP.dbo.portfolio_project pp (NOLOCK) on pp.proj_id =  r.PROJECT_ID    
INNER JOIN BAS.dbo.CUSTOMER C (NOLOCK)  
ON C.CUST_ID=P.CUST_ID
ORDER BY C.CUST_NM,P.PROJ_NM,r.DESCRIPTION    

END 

GO

--13001436 — Open Risks for all the Projects in CSM
IF EXISTS (SELECT 1 from dbo.REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='Open Risks in all Projects')
BEGIN

UPDATE dbo.REPORTS_SP_DETAILS
SET SP_NAME='dbo.getOverAllRisksReport', 
DB_NAME= 'BAS'
WHERE SP_DISPLAY_NAME='Open Risks in all Projects'

END

GO 