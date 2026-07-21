USE CSP

GO

IF EXISTS(Select 1 from sys.procedures where name ='usp_get_CIL_data' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_get_CIL_data]
END

GO

CREATE PROC usp_get_CIL_data
@CUSTID int,
@PROJIDS VARCHAR(MAX),   
@STARTDATE DATETIME,                
@ENDDATE DATETIME, 
@ImprovementType VARCHAR(50),
@Status VARCHAR(50),
@beneficiary int,
@Uom int,
@ALL bit

AS
BEGIN

if(@ALL = 1)   
Begin
SELECT C.CUST_ID, C.CUST_NM,COUNT(I.ID) AS TotalIdeas, 
SUM(BDS.NET_BENEFITS_YEAR) AS Net_Benefits,
pp.PORTFOLIO_ID, port.TITLE AS 'PORTFOLIO_NM', P.PROJ_ID, P.PROJ_NM
from IDEA I
 INNER JOIN IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID AND IBS.ISACTIVE = 1
 INNER JOIN BENEFIT_DETAILS_QUANTITATIVE BDS on IBS.ID = BDS.BENEFIT_SUMMARY_ID and BDS.ISACTIVE = 1
 INNER JOIN IDEA_STATUS IDS on I.IDEA_STATUS_ID = IDS.ID
 INNER JOIN UOM U on BDS.UOM_ID = U.ID
 INNER JOIN IDEA_IMPROVEMENT_TYPE IT on I.IDEA_IMPROVEMENT_TYPE_ID = IT.ID
 INNER JOIN [BAS].DBO.PROJECT P ON I.PROJECT_ID = P.PROJ_ID                 
 INNER JOIN [BAS].DBO.CUSTOMER C ON C.CUST_ID = P.CUST_ID                
 LEFT JOIN  PORTFOLIO_PROJECT PP on PP.PROJ_ID = p.PROJ_ID and pp.ISACTIVE = 1                
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1    
 
 where I.IDEA_STATUS_ID in (2,3,4,8) 
 AND (@CUSTID = -1 OR C.CUST_ID = @CUSTID)                 
 and I.IDEA_IMPROVEMENT_TYPE_ID IN (6,7,8)
  and (@PROJIDS = '' OR I.PROJECT_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))) and
  I.IDENTIFIED_DATE >= @STARTDATE and I.IDENTIFIED_DATE <= @ENDDATE and BDS.UOM_ID = @Uom and IBS.BENEFICIARY_ID = @beneficiary and I.ISACTIVE = 1
 GROUP BY C.CUST_ID, C.CUST_NM, pp.PORTFOLIO_ID, port.TITLE, P.PROJ_ID, P.PROJ_NM --,BDS.UOM_ID     
End
Else
Begin
SELECT C.CUST_ID, C.CUST_NM,COUNT(I.ID) AS TotalIdeas, 
SUM(BDS.NET_BENEFITS_YEAR) AS Net_Benefits,
pp.PORTFOLIO_ID, port.TITLE AS 'PORTFOLIO_NM', P.PROJ_ID, P.PROJ_NM
from IDEA I
 INNER JOIN IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID AND IBS.ISACTIVE = 1
 INNER JOIN BENEFIT_DETAILS_QUANTITATIVE BDS on IBS.ID = BDS.BENEFIT_SUMMARY_ID and BDS.ISACTIVE = 1
 INNER JOIN IDEA_STATUS IDS on I.IDEA_STATUS_ID = IDS.ID
 INNER JOIN UOM U on BDS.UOM_ID = U.ID
 INNER JOIN IDEA_IMPROVEMENT_TYPE IT on I.IDEA_IMPROVEMENT_TYPE_ID = IT.ID
 INNER JOIN [BAS].DBO.PROJECT P ON I.PROJECT_ID = P.PROJ_ID                 
 INNER JOIN [BAS].DBO.CUSTOMER C ON C.CUST_ID = P.CUST_ID                
 LEFT JOIN  PORTFOLIO_PROJECT PP on PP.PROJ_ID = p.PROJ_ID and pp.ISACTIVE = 1                
 left join PORTFOLIO port on port.ID = pp.PORTFOLIO_ID and port.ISACTIVE = 1    
 
 where I.IDEA_STATUS_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@Status,',')) and C.CUST_ID = @CUSTID 
 and I.IDEA_IMPROVEMENT_TYPE_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING]( @ImprovementType ,','))
  and (@PROJIDS = '' OR I.PROJECT_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))) and
  I.IDENTIFIED_DATE >= @STARTDATE and I.IDENTIFIED_DATE <= @ENDDATE and BDS.UOM_ID = @Uom and IBS.BENEFICIARY_ID = @beneficiary and I.ISACTIVE = 1
 GROUP BY C.CUST_ID, C.CUST_NM, pp.PORTFOLIO_ID, port.TITLE, P.PROJ_ID, P.PROJ_NM --,BDS.UOM_ID     
 End
END     
go

if exists(select * from sys.procedures where name='getCheckPointsforProjectNew' and type='P')

begin
   drop procedure dbo.getCheckPointsforProjectNew
end
go

Create PROCEDURE getCheckPointsforProjectNew                                        
  @CUSTOMER_ID int,                                          
  @PROJECT_ID varchar(50),                                        
  @SERVICE_AREAS  varchar(max)                                          
  AS                                        
  BEGIN                                        
                                        
SELECT DISTINCT CONF.CUST_ID AS 'CUSTOMER_ID',CONF.PROJ_ID as 'PROJECT_ID',     
area.id as SERVICE_AREA_ID, AREA.TITLE AS SERVICE_AREA_NAME,               
model.ID as PROCESS_MODEL_ID, model.DESCRIPTION as PROCESS_MODEL_DESCRIPTION,               
PROCESS.id as process_id, PROCESS.TITLE AS PROCESS_DESCRIPTION,WEIGHT.ID as WEIGHTAGE_ID, weight.WEIGHTAGE_SCORE,              
 WEIGHT.WEIGHTAGE_TITLE,QUES.ID AS PM_CHECKLIST_QUESTION_ID ,CHK.VERSION AS VERSION_ID, QUES.TITLE AS 'LOOK_FOR',                                      
CHK.status_list_id AS 'STATUS_LIST_ID' ,chk.FINDINGSTYPE_ID,               
chk.TITLE as CHECKLIST_NAME,chk.ID as CHECKLIST_ID, chk.VERSION as VERSION_ID,               
chk.CORRECTIVE_ACTION_TRACKING as CORRECTIVE_ACTION_TRACKING,chk.IS_WEIGHTAGE_APPLICABLE ,chk.MATURITY_LEVEL,chk.process_model_id AS 'MAPPED_PROCESS_MODEL', MAPP.display_order, QUES.CHECKLIST_ID, PA.ID as PROCESS_AREA_ID,            
PA.TITLE as PROCESS_AREA_DESCRIPTION,chk.EFFECTIVE_FROM as CHECKLIST_EFFECTIVE_FROM            
            
  FROM PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING CONF                                          
INNER JOIN PROCESS PROCESS on PROCESS.ID = CONF.PROCESS_ID AND PROCESS.ISACTIVE = 1                                        
INNER JOIN PROCESS_MODEL_PROCESS_MAPPING PRO on PRO.PROCESS_ID = process.ID  AND PRO.ISACTIVE = 1 AND CONF.ISACTIVE = 1                                        
INNER JOIN pm_process_questions_mapping MAPP on MAPP.PROCESS_ID = CONF.PROCESS_ID  and   MAPP.SERVICE_AREA_ID = CONF.SERVICE_AREA_ID AND MAPP.ISACTIVE = 1                                         
INNER JOIN PM_CHECKLIST_QUESTIONS QUES ON QUES.ID = MAPP.question_id AND QUES.ISACTIVE = 1                                        
INNER JOIN PM_CHECKLIST CHK ON CHK.ID = QUES.CHECKLIST_ID AND CHK.ISACTIVE = 1 and CHK.EFFECTIVE_FROM <= GETDATE()                                    
INNER JOIN PROCESS_SERVICE_AREA_NEW AREA on AREA.ID = CONF.SERVICE_AREA_ID  AND AREA.ISACTIVE = 1                                 
AND (@SERVICE_AREAS = '' or (AREA.ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@SERVICE_AREAS,','))))                                       
INNER JOIN PROCESS_MODEL MODEL on MODEL.ID = CONF.PROCESS_MODEL_ID  AND MODEL.ISACTIVE =1            
INNER JOIN PROCESS_AREA PA on PA.ID = MAPP.PROCESS_AREA_ID and PA.ISACTIVE = 1                      
left JOIN AUDIT_CHECKLIST_WEIGHTAGE WEIGHT on WEIGHT.ID = QUES.WEIGHTAGE_ID                                         
where CONF.PROJ_ID = @PROJECT_ID and CONF.CUST_ID = @CUSTOMER_ID                                        
order by QUES.CHECKLIST_ID, AREA.ID, PROCESS.ID, MAPP.display_order asc                                      
                                     
END  
GO  