IF NOT EXISTS(Select 1 from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE='PROJECT')
Begin
Insert into PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE values('PROJECT','104859',GETDATE(),'104859',GETDATE(),1)
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PRODUCT_RESPONSIBLE' AND COLUMN_NAME='PROJECT_ID')
BEGIN
ALTER TABLE PRODUCT_RESPONSIBLE ADD PROJECT_ID varchar(50) NULL  
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductResponsibleList' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductResponsibleList
END
GO

Create procedure getProductResponsibleList  

@productId int

As 
Begin  
  
select pr.ID, p.TITLE as Portfolio_Name , pp.PRODUCT_TITLE  ,  
IIF(PR.PROJECT_ID IS NOT NULL, PJ.PROJ_ALIAS_NM, 
        IIF(ei.FRST_NM IS NULL, cu.DISPLAY_NAME, ei.FRST_NM)) AS Name,
pm.ID as MANAGEMENT_TYPE_ID,pm.MANAGEMENT_TYPE ,  
IIF(ei.EMAIL_ID is null , cu.EMAILID ,ei.EMAIL_ID ) AS MAIL, PR.CREATED_DATE as EFFECTIVE_FROM, PR.CREATED_BY, PR.CREATED_DATE
from PORTFOLIO p inner join PORTFOLIO_PRODUCTS pp on pp.PORTFOLIO_ID=p.ID   
inner join PRODUCT_RESPONSIBLE pr on pr.PRODUCT_ID=pp.ID   
inner join PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE pm on pm.ID=pr.MANAGEMENT_TYPE 
left join EMP_INFO ei on ei.EMP_ID=pr.EMP_ID   
left join customer_users cu on cu.EMAILID=pr.EMP_ID  
left join PROJECT PJ on PJ.PROJ_ID = PR.PROJECT_ID   

where pr.PRODUCT_ID = @productId  and p.ISACTIVE=1 and pp.ISACTIVE=1 and pr.ISACTIVE=1 and pm.ISACTIVE=1  
order by CASE pm.ID
            WHEN 3 THEN 0 -- CSM
            WHEN 2 THEN 1 -- LEAD
            WHEN 1 THEN 2 -- MANAGER
            WHEN 4 THEN 3 -- QUALITYSPOC
            WHEN 5 THEN 4 -- CUSTOMER
            WHEN 6 THEN 5 -- CUSTOMER_CSAT
			WHEN 7 THEN 6 -- PROJECT
            ELSE 7        -- Others
        END
End
GO


If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='PROJECT_CLOSURE_NOTIFY_EMAILS')
Begin
Insert into CONFIGURATION_EXT values('PROJECT_CLOSURE_NOTIFY_EMAILS','marketing_gavs@gavstech.com,grc_team@gavstech.com','-1',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='PROJECT_CLOSURE_STATUS_LIST')
Begin
Insert into CONFIGURATION_EXT values('PROJECT_CLOSURE_STATUS_LIST','Close,Complete','-1',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='KPIDATA_REQUIREDFIELDS_FRESHWORKS')
Begin
Insert into CONFIGURATION_EXT values('KPIDATA_REQUIREDFIELDS_FRESHWORKS','Status,Agent Group Name,Priority,created date,closed date','202100121',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END 
ELSE
BEGIN
UPDATE  CONFIGURATION_EXT 
SET [VALUE]='Status,Agent Group Name,Priority,created date,closed date'
where [KEY] ='KPIDATA_REQUIREDFIELDS_FRESHWORKS' 
END

GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='GSLAB_QUALITY_HEAD_MAIL')
Begin
Insert into CONFIGURATION_EXT values('GSLAB_QUALITY_HEAD_MAIL','prachi.divekar@gslab.com','-1',null, null, 0,1,null,null,null,'105683',Getdate(),'105683',Getdate())
END
GO



IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='get_RiskDetailsByCustomerId' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].get_RiskDetailsByCustomerId
END
GO
--[dbo].[get_RiskDetailsByCustomerId]    '202P000370-01'   ,1
CREATE PROCEDURE [dbo].[get_RiskDetailsByCustomerId]              
            
@PROJIDS VARCHAR(MAX),            
@allproj bit              
AS              
BEGIN              
  SELECT distinct C.CUST_ID, CUST_NM, PORT.ID PORTFOLIO_ID, PORT.TITLE PORTFOLIO_NM, P.PROJ_NM, R.[ID]              
      ,R.[PROJECT_ID]              
      ,R.[RAG]              
      ,R.[DESCRIPTION]              
      ,[IMPACT]              
      ,[PROBABILITY_SCALE]              
      ,[IMPACT_SCALE]              
      ,R.[OWNER]              
      ,[AREA]              
      ,[IDENTIFIED_BY]              
      ,R.[IDENTIFIED_DATE]              
      ,[RISK_TREATMENT_STRATEGY]              
      ,R.[TARGET_DATE]              
      ,[ACTUAL_DATE]              
      ,R.[STATUS]              
      ,[ACTION_TAKEN]              
      ,R.[CREATED_BY]              
      ,R.[CREATED_DATE]              
      ,R.[UPDATED_BY]              
      ,R.[UPDATED_DATE]              
      ,R.[ISACTIVE]         
   , isnull(E.FRST_NM, R.[OWNER]) as OWNER_NAME         
   ,R.ACCEPT_TILL,
   cast(CASE WHEN PA.RISK_ID is not null then 1 else 0 end as bit)  as IS_PLAN_EXISTS 
   FROM PROJECT_RISK R  (NOLOCK)       
  INNER JOIN PROJECT P  (NOLOCK) ON R.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))  and R.ISACTIVE = 1              
  INNER JOIN CUSTOMER C  (NOLOCK) ON C.CUST_ID = P.CUST_ID              
  LEFT JOIN EMP_INFO e  (NOLOCK) on r.OWNER  =  convert(varchar,e.EMAIL_ID) or r.owner = convert(varchar, e.emp_id)       
  LEFT OUTER JOIN PORTFOLIO_PROJECT PP  (NOLOCK) ON PP.PROJ_ID = P.PROJ_ID              
  LEFT OUTER JOIN PORTFOLIO PORT   (NOLOCK) ON PORT.ID = PP.PORTFOLIO_ID  
  LEFT JOIN PROJECT_ACTIONITEM PA  (NOLOCK) ON PA.RISK_ID = R.ID And pa.PROJECT_ID= r.PROJECT_ID
  order by [IDENTIFIED_DATE] desc        
              
END   

 

GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getServiceTowersMappedForProjects' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].reports_getServiceTowersMappedForProjects
END
GO

CREATE PROCEDURE dbo.reports_getServiceTowersMappedForProjects    
AS     
BEGIN     
SELECT  
 t.CUST_NM AS CUSTOMER,t.PROJ_ID AS PROJECT_ID,t.PROJ_NM AS PROJECT,ACCOUNT_OWNER,t.MANAGER,t.CSM,QA_SPOC, CASE WHEN t.CSV IS NULL THEN 'NO' ELSE 'YES' END SERVICE_TOWER_MAPPED,    
t.CSV AS SERVICE_TOWERS , t.CSM_MAIL_ID ,t.MANAGER_MAIL_ID ,t.QUALITY_PARTNER_MAIL_ID, case when QADOR is null then 'YES' else 'NO' end IS_QA_ACTIVE FROM(    
select C.CUST_NM, P.PROJ_ID,    
PROJ_NM  ,ACCOUNT_OWNER = case when proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,     PM.FRST_NM +' '+ISNULL(PM.LAST_NM,'') AS MANAGER,   DM.FRST_NM +' '+ISNULL(DM.LAST_NM,'') AS CSM,PM.EMAIL_ID as MANAGER_MAIL_ID , DM.EMAIL_ID as CSM_MAIL_ID, qa.EMAIL_ID as QUALITY_PARTNER_MAIL_ID,  
QA.FRST_NM +' '+ISNULL(QA.LAST_NM,'') AS QA_SPOC,CSV= STUFF (( SELECT   ', ' +  TITLE  FROM    
 PROCESS_SERVICE_AREA_PROJECT_MAPPING PSMAP (NOLOCK)    
 INNER JOIN PROCESS_SERVICE_AREA_NEW S (NOLOCK)    
 ON PSMAP.SERVICE_AREA_ID =S.ID    
 WHERE p.PROJ_ID= PSMAP.PROJ_ID AND PSMAP.ISACTIVE=1 order by title    
  FOR XML PATH('')), 1, 2, ''), QA.DOR QADOR  
from PROJECT P (NOLOCK)      
INNER JOIN CUSTOMER C (NOLOCK) ON    
P.CUST_ID=C.CUST_ID    
INNER JOIN EMP_INFO PM (NOLOCK) ON    
P.PROJ_PM_EMP_ID =PM.EMP_ID    
INNER JOIN EMP_INFO DM (NOLOCK) ON    
P.PROJ_DM_EMP_ID =DM.EMP_ID    
INNER JOIN EMP_INFO QA (NOLOCK) ON    
P.QUALITY_SPOC =QA.EMP_ID   
WHERE ISNULL(P.PROJ_STATUS ,'') != 'Close'   
) as t    
ORDER BY CUST_NM,PROJ_NM    
    
 END  
 GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallRisksForRiskDashboard' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOverallRisksForRiskDashboard]
END
GO

CREATE PROCEDURE [dbo].[getOverallRisksForRiskDashboard]                        

@startDate date,
@endDate date,              
@custIds varchar(max),
@riskStatus varchar(max)

AS   
BEGIN    
  
Select C.CUST_NM,P.PROJ_NM,PR.DESCRIPTION,PR.IMPACT,PR.PROBABILITY_SCALE,PR.IMPACT_SCALE,
CASE WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 5 ) THEN 'Low' WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 10 ) THEN 'Moderate' 
WHEN (PROBABILITY_SCALE * IMPACT_SCALE < 20 ) THEN 'High' ELSE 'Catastrophic' END AS RISK_LEVEL,
PR.OWNER,PR.AREA,PR.IDENTIFIED_BY,PR.IDENTIFIED_DATE,PR.RISK_TREATMENT_STRATEGY,PR.TARGET_DATE,PR.STATUS,
PR.ACTION_TAKEN,C.CUST_ID,P.PROJ_ID,PR.ID
from   
PROJECT_RISK PR        
inner join PROJECT p on PR.PROJECT_ID = P.PROJ_ID  and ISNULL(P.PROJ_STATUS ,'') != 'Close'
inner join CUSTOMER c on P.CUST_ID = C.CUST_ID
  
where (PR.IDENTIFIED_DATE between @startDate and @endDate) AND PR.ISACTIVE=1
AND (@custIds = '-1' OR C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))
AND (@riskStatus = '-1' OR PR.STATUS in (SELECT * FROM [DBO].[FN_SPLITSTRING](@riskStatus,','))) order by C.CUST_NM,PR.IDENTIFIED_DATE DESC

END
GO


GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getServiceTowersMappedForProjects' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].reports_getServiceTowersMappedForProjects
END
GO

CREATE PROCEDURE dbo.reports_getServiceTowersMappedForProjects    
AS     
BEGIN     
SELECT  
 t.CUST_NM AS CUSTOMER,t.PROJ_ID AS PROJECT_ID,t.PROJ_NM AS PROJECT,ACCOUNT_OWNER,t.MANAGER,t.CSM,QA_SPOC, CASE WHEN t.CSV IS NULL THEN 'NO' ELSE 'YES' END SERVICE_TOWER_MAPPED,    
t.CSV AS SERVICE_TOWERS , t.CSM_MAIL_ID ,t.MANAGER_MAIL_ID ,t.QUALITY_PARTNER_MAIL_ID, case when QADOR is null then 'YES' else 'NO' end IS_QA_ACTIVE FROM(    
select C.CUST_NM, P.PROJ_ID,    
PROJ_NM  ,ACCOUNT_OWNER = case when proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,     PM.FRST_NM +' '+ISNULL(PM.LAST_NM,'') AS MANAGER,   DM.FRST_NM +' '+ISNULL(DM.LAST_NM,'') AS CSM,PM.EMAIL_ID as MANAGER_MAIL_ID , DM.EMAIL_ID as CSM_MAIL_ID, qa.EMAIL_ID as QUALITY_PARTNER_MAIL_ID,  
QA.FRST_NM +' '+ISNULL(QA.LAST_NM,'') AS QA_SPOC,CSV= STUFF (( SELECT   ', ' +  TITLE  FROM    
 PROCESS_SERVICE_AREA_PROJECT_MAPPING PSMAP (NOLOCK)    
 INNER JOIN PROCESS_SERVICE_AREA_NEW S (NOLOCK)    
 ON PSMAP.SERVICE_AREA_ID =S.ID    
 WHERE p.PROJ_ID= PSMAP.PROJ_ID AND PSMAP.ISACTIVE=1 order by title    
  FOR XML PATH('')), 1, 2, ''), QA.DOR QADOR  
from PROJECT P (NOLOCK)      
INNER JOIN CUSTOMER C (NOLOCK) ON    
P.CUST_ID=C.CUST_ID    
INNER JOIN EMP_INFO PM (NOLOCK) ON    
P.PROJ_PM_EMP_ID =PM.EMP_ID    
INNER JOIN EMP_INFO DM (NOLOCK) ON    
P.PROJ_DM_EMP_ID =DM.EMP_ID    
INNER JOIN EMP_INFO QA (NOLOCK) ON    
P.QUALITY_SPOC =QA.EMP_ID   
WHERE ISNULL(P.PROJ_STATUS ,'') != 'Close'   
) as t    
ORDER BY CUST_NM,PROJ_NM    
    
 END  
  GO

 IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjbyCSM' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].getProjbyCSM
END
GO


 CREATE proc getProjbyCSM    
    
 @csmEmpId varchar(25)    
as     
begin    
    
SELECT p.PROJ_NM,p.START_DATE, p.END_DATE,  
e.EMAIL_ID AS CSM_MAIL_ID, e.FRST_NM +' '+ISNULL(e.LAST_NM,'') AS CSM, e1.FRST_NM +' '+ISNULL(e1.LAST_NM,'') AS QUALITY_PARTNER , e1.EMAIL_ID as QUALITY_PARTNER_MAIL_ID ,  
c.CUST_NM as CUSTOMER,e2.FRST_NM +' '+ISNULL(e2.LAST_NM,'') AS Account_Manager,e2.EMAIL_ID as AM_Email_ID  
FROM project p  
inner join EMP_INFO e on e.EMP_ID=p.PROJ_DM_EMP_ID  
left join EMP_INFO e1 on e1.EMP_ID=p.QUALITY_SPOC  
inner join EMP_INFO e2 on e2.EMP_ID=p.PROJ_PM_EMP_ID  
inner join CUSTOMER c on c.CUST_ID=p.CUST_ID  
  
WHERE p.END_DATE BETWEEN GETDATE() AND DATEADD(month, 3, GETDATE()) and  p.BILL_TYPE=1  and ISNULL(P.PROJ_STATUS ,'') != 'Close'  and  p.PROJ_DM_EMP_ID=@csmEmpId  
  
order by END_DATE  
  
end 