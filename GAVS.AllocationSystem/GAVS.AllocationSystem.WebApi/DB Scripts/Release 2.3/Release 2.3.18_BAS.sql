USE BAS
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='KPI_ServiceTower_Mapping' AND type='U')
  BEGIN

CREATE TABLE [dbo].KPI_ServiceTower_Mapping(
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[KPI_ID] [int] NULL,
	[SERVICE_TOWER_ID] [int] NULL,
	[CREATED_BY] [varchar](50) NULL,
	[CREATED_DATE] [datetime]  DEFAULT getdate(),
	[UPDATED_BY] [varchar](50) NULL,
	[UPDATED_DATE] [datetime]  DEFAULT getdate(),
	[ISACTIVE] [bit] NULL DEFAULT(1) ,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]


END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverAllRisksReport' AND TYPE='P')
BEGIN
 DROP PROCEDURE getOverallProductWiseKPIData          
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
-- 2.0    Madhu          22-12-2022       added all status and filter by date   
-- 3.0    Sujatha        12-01-2023       Added columns like PROBABILITY,IMPACT,RISK_TREATMENT_STRATEGY,Risk Treatment Plan / Action Plan,Date of Occurred / Closed
#########################################################################  */    
CREATE procedure  [getOverAllRisksReport]          
  @startDate Datetime,                                
  @endDate Datetime                          
AS                    
BEGIN                    
                              
SELECT C.CUST_NM as Customer, P.PROJ_NM as Project, por.TITLE as Portfolio , r.DESCRIPTION, r.IMPACT as [Business Impact] , r.OWNER,  FORMAT(IDENTIFIED_DATE, 'dd MMM yyyy') AS IDENTIFIED_DATE,  FORMAT(TARGET_DATE, 'dd MMM yyyy') AS TARGET_DATE ,          
  
r.STATUS, iif(impact_scale <3, 'L',iif(impact_scale >3, 'H', 'M')) SEVERITY,                      
CASE WHEN (convert(varchar,R.TARGET_DATE,112) < convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed' )) THEN 'RISKS_PAST_DUE_DATE'                    
WHEN  (convert(varchar,R.TARGET_DATE,112) >= convert(varchar,GETDATE(),112) AND R.STATUS NOT IN ('Occurred' , 'Closed')) THEN 'RISKS_DUE_FOR_CLOSURE'                    
end as STATUS_TYPE  ,            
case when isnull(proj_status, '') != ' ' then 'Active' else 'Inactive' end AS PROJECT_STATUS  ,          
P.CUST_ID,          
[PROJECT_ID] AS PROJ_ID ,r.RISK_TREATMENT_STRATEGY ,r.ACTION_TAKEN as [Risk Treatment Plan / Action Plan],        
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
FORMAT(r.ACTUAL_DATE,'dd MMM yyyy') as [Date Occurred / Closed]        
FROM [CSP]..[PROJECT_RISK] r  (NOLOCK)                   
inner join BAS..project p (NOLOCK)  on p.proj_id =  r.PROJECT_ID and r.ISACTIVE =1   and isnull(p.PROJ_STATUS,'') != 'Close'                  
LEFT OUTER JOIN CSP..portfolio_project pp (NOLOCK) on pp.proj_id =  r.PROJECT_ID             
LEFT join csp..portfolio por on por.id = pp.portfolio_id              
INNER JOIN BAS..CUSTOMER C (NOLOCK)              
ON C.CUST_ID=P.CUST_ID           
where identified_date between @startDate and @endDate           
ORDER BY C.CUST_NM,P.PROJ_NM, IDENTIFIED_DATE desc            
            
END 
GO


IF NOT EXISTS (SELECT 1 from dbo.REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='List of Assessment Checklist')
BEGIN

INSERT INTO dbo.REPORTS_SP_DETAILS(SP_NAME,SP_DISPLAY_NAME,DB_NAME)  VALUES
('dbo.reports_ListofAssessmentChecklist','List of Assessment Checklist','BAS') 
END
GO

Declare @REPORT_SP_ID int
set @REPORT_SP_ID = SCOPE_IDENTITY()

If not exists (Select * from BAS..REPORTS_PARAMS where PARAM_NAME='Checklist')
Begin

INSERT INTO BAS..REPORTS_PARAMS VALUES(@REPORT_SP_ID,'Checklist','CHECKLIST',null)

End  
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_ListofAssessmentChecklist' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].reports_ListofAssessmentChecklist
END
GO

CREATE PROCEDURE dbo.reports_ListofAssessmentChecklist                            

@checklist int
as

begin
select PS.TITLE as SERVICE_TOWER,PA.TITLE as PROCESS_AREA,P.TITLE as PROCESS,PQ.TITLE as QUESTION_NAME,
AW.WEIGHTAGE_TITLE as WEIGHTAGE,AW.WEIGHTAGE_SCORE,GP.SHORT_DESC as CATEGORY from  
CSP..PM_CHECKLIST_QUESTIONS PQ left join CSP..AUDIT_CHECKLIST_WEIGHTAGE AW on PQ.WEIGHTAGE_ID=AW.WEIGHTAGE_ID 
inner join CSP..GLOBAL_PERSPECTIVE GP on GP.ID=PQ.GLOBAL_PERSPECTIVE_ID
inner join CSP..PM_CHECKLIST PM on PM.ID=PQ.CHECKLIST_ID
inner join CSP..PM_PROCESS_QUESTIONS_MAPPING PQM on PQM.question_id=PQ.ID and PQM.checklist_id=PQ.CHECKLIST_ID
inner join CSP..PROCESS_SERVICE_AREA_NEW PS on PS.ID=PQM.SERVICE_AREA_ID
inner join CSP..PROCESS_AREA PA on PA.ID = PQM.PROCESS_AREA_ID
inner join CSP..PROCESS P on P.ID = PQM.process_id

where PQ.ISACTIVE=1 and PM.ISACTIVE=1 and PQM.isactive=1 and PM.ID=@checklist order by SERVICE_TOWER,PROCESS_AREA,PROCESS
end
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getSLA_Status' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].reports_getSLA_Status
END
GO

CREATE proc [dbo].[reports_getSLA_Status]                 
             
 @date Datetime,          
 @productId int  = -1          
                       
as       
BEGIN                  

declare @unclassifiedId int = (select ID from CSP..PORTFOLIO where TITLE='Unclassified')        
declare @remitraId int = (select ID from CSP..PORTFOLIO where TITLE='Remitra')  

declare @MonthDate Datetime              
               
select @monthdate = cast( DATEFROMPARTS(YEAR(@date),MONTH(@date),1) as date)              
              
Declare @quarterStartDate DateTime                  
Declare @quarterEndDate DateTime                  
                  
Set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@date,0))                  
Set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@date,1))                   
              
;with cte as      
(      
 select       
  --PORTFOLIO_NAME=(select Title from CSP..PORTFOLIO where ID=@portfolioId),      
  PORTFOLIO_NAME=(select Title from CSP..PORTFOLIO where ID=(select top 1 PORTFOLIO_ID from CSP..PORTFOLIO_PRODUCTS where PRODUCT_TITLE=pp.PRODUCT_TITLE)),      
  PRODUCT_TITLE,               
  KPI_Count = convert(varchar,(select count(*) from csp..kpi where PRODUCT_ID = pp.ID  and kpi.isactive=1 )),              
        
  No_of_KPIs_Entered = convert(varchar,(select count(*) from csp..kpi_details  inner join csp..KPI on kpi.id = Kpi_Id where kpi.product_id = pp.id and kpi.isactive=1 and KPI_DETAILS.ISACTIVE=1 and isnull(isdraft,0) = 0 and        
  (( kpi.FREQUENCY in ('Monthly','Release') and  cast(period as date) = @monthdate) or(kpi.FREQUENCY ='Quarterly' and cast(period as date) between @quarterStartDate and @quarterEndDate )))),              
        
  No_of_KPIs_not_Entered= (select count(*) from csp..kpi where PRODUCT_ID = pp.ID  and kpi.isactive=1 )-(select count(*) from csp..kpi_details  inner join csp..KPI on kpi.id = Kpi_Id where kpi.product_id = pp.id and kpi.isactive=1 and KPI_DETAILS.ISACTIVE=1 and isnull(isdraft,0) = 0 and        
  (( kpi.FREQUENCY in ('Monthly','Release') and  cast(period as date) = @monthdate) or(kpi.FREQUENCY ='Quarterly' and cast(period as date) between @quarterStartDate and @quarterEndDate ))),       
      
  No_of_KPIs_not_applicable =convert(varchar,(select count(*) from csp..kpi_details  inner join csp..KPI on kpi.id = Kpi_Id and kpi.isactive=1 where kpi.product_id = pp.id and KPI_DETAILS.ISACTIVE=1 and isnull(ISFLAG,0)=1  and isnull(isdraft,0) = 0 and ((
	kpi.FREQUENCY in ('Monthly','Release') and cast(period as date) = @monthdate) or(kpi.FREQUENCY ='Quarterly' and cast(period as date) between @quarterStartDate and @quarterEndDate )))),              
        
  Met_KPIs = convert(varchar,(select count(*) from csp..kpi_details  inner join csp..KPI on kpi.id = Kpi_Id  and kpi.isactive=1 where kpi.product_id = pp.id and KPI_DETAILS.ISACTIVE=1 and SLA_STATUS='met'  and isnull(ISFLAG,0)=0 and  isnull(isdraft,0) = 0
  and (( kpi.FREQUENCY in ('Monthly','Release') and  cast(period as date) = @monthdate) or(kpi.FREQUENCY ='Quarterly' and cast(period as date) between @quarterStartDate and @quarterEndDate )))),              
        
  NotMet_KPIs = convert(varchar,(select count(*) from csp..kpi_details  inner join csp..KPI on kpi.id = Kpi_Id and kpi.isactive=1 where kpi.product_id = pp.id and KPI_DETAILS.ISACTIVE=1 and SLA_STATUS='not met' and  isnull(isdraft,0) = 0 and       
  (( kpi.FREQUENCY in ('Monthly','Release') and  cast(period as date) = @monthdate) or(kpi.FREQUENCY ='Quarterly' and cast(period as date) between @quarterStartDate and @quarterEndDate )))),              
        
  Manager = (select frst_nm from bas..emp_info where emp_id = (select top 1 EMP_ID from csp..PRODUCT_RESPONSIBLE where PRODUCT_ID = pp.ID and Management_type =1 and ISACTIVE=1 )) ,            
        
  Lead = (select frst_nm from bas..emp_info where emp_id = (select top 1 EMP_ID from csp..PRODUCT_RESPONSIBLE where PRODUCT_ID = pp.ID and Management_type =2 and ISACTIVE=1)) ,            
        
  CSM = (select frst_nm from bas..emp_info where emp_id = (select top 1 EMP_ID from csp..PRODUCT_RESPONSIBLE where PRODUCT_ID = pp.ID and Management_type =3 and ISACTIVE=1)) ,             
        
  QualitySpoc= (select frst_nm from bas..emp_info where emp_id = (select top 1 EMP_ID from csp..PRODUCT_RESPONSIBLE where PRODUCT_ID = pp.ID and Management_type =4 and ISACTIVE=1))           
        
  from csp..PORTFOLIO_PRODUCTS pp where ISACTIVE=1  and (@productId =-1 or pp.ID = @productId) and PP.PORTFOLIO_ID not in (@unclassifiedId,@remitraId ))   
        
  select cte.PORTFOLIO_NAME,product_title,KPI_Count,No_of_KPIs_Entered,No_of_KPIs_not_Entered,No_of_KPIs_not_applicable,Met_KPIs,NotMet_KPIs,      
  Manager,Lead,CSM,QualitySpoc,status=case when No_of_KPIs_not_Entered=0 then 'Submitted' else 'Not Submitted' end,      
  Color=case when No_of_KPIs_not_Entered=0 then '#237f00' else '#f9a400' end from cte      
  order by No_of_KPIs_not_Entered DESC,PORTFOLIO_NAME ,Manager , PRODUCT_TITLE       
              
END       
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROCESS_SERVICE_AREA_NEW' AND COLUMN_NAME='SHOW_IN_MASTER')
BEGIN
ALTER TABLE PROCESS_SERVICE_AREA_NEW ADD SHOW_IN_MASTER bit NOT NULL default(0)
END
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='[getServiceAreasForProject]' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].[getServiceAreasForProject]
END
GO

Create PROCEDURE [dbo].[getServiceAreasForProject]  
@proj_id varchar(500)  
as  
begin  
 select sa.ID, sa.TITLE from PROCESS_SERVICE_AREA_PROJECT_MAPPING mapp  
 inner join PROCESS_SERVICE_AREA_NEW sa on mapp.SERVICE_AREA_ID = sa.ID and mapp.ISACTIVE = 1 and sa.ISACTIVE = 1 and sa.SHOW_IN_MASTER=1
 where mapp.PROJ_ID = @proj_id  
end  
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAppreciationDetails' AND TYPE='P')
BEGIN
 DROP PROCEDURE getAppreciationDetails          
END
GO


CREATE PROCEDURE [dbo].[getAppreciationDetails]     
@projIds VARCHAR(MAX)                  
  AS                  
  BEGIN                  
                
    SELECT DISTINCT A.ID,P.CUST_ID AS CUST_ID,     
    P.PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, PF.TITLE AS PORTFOLIO_NAME,     
    A.APPRECIATED_BY,A.COMMENTS,A.RECIPIENT,E.FRST_NM as RECIPIENT_NM,A.DESIGNATION,    
    A.RECEIVED_DATE,A.CREATED_BY,A.CREATED_DATE,A.UPDATED_BY,A.UPDATED_DATE,A.ISACTIVE    
    FROM [APPRECIATION] A     
    INNER JOIN BAS.DBO.PROJECT P  ON a.PROJ_ID = p.PROJ_ID     
 AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@projIds,','))  AND A.ISACTIVE = 1  
  LEFT OUTER join BAS..EMP_INFO E on E.EMP_ID = A.RECIPIENT           
    LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJ_ID                  
    LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID     
    ORDER BY A.RECEIVED_DATE desc, proj_nm             
 END  
GO

--from here

If not exists (select * from FILTER_PREFERENCE where FIELD_NAME='exclusioN_SLA_STATUS')
begin 
insert into FILTER_PREFERENCE values('KPI','exclusioN_SLA_STATUS','Service Level Status','number',1,0,0,NULL,'104859',GETDATE(),'104859',GETDATE(),1)
end
Go


If not exists (select * from FILTER_PREFERENCE where FIELD_NAME='slA_STATUS')
begin 
insert into FILTER_PREFERENCE values('KPI','slA_STATUS','Service Level Status','number',1,0,0,NULL,'104859',GETDATE(),'104859',GETDATE(),1)
end
Go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

 USE BAS
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

CREATE PROC [dbo].[getProductWiseCAPACount]    
@customerId  varchar(50),    
@startDate datetime,    
@endDate datetime,    
@productId int = 0  ,    
@iscustomer bit = 0    
AS  

BEGIN    
declare @unclassifiedId int = (select ID from PORTFOLIO where TITLE='Unclassified')    
declare @quarterStartDate Datetime    
declare @quarterEndDate datetime    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));    
;with CTE AS    
(
select PP.ID as Product_ID,PM.MODE_ID,PP.PRODUCT_TITLE,KD.ID as KPI_DETAILS_ID,  
[RESUBMITTED] = (select Count(DISTINCT CAPA.KPI_DETAILS_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where AFSM.KPI_DETAILS_ID = KD.ID and AFSM.ISCOMPLETE=0 and AFSM.STAGE_STATUS='Corrective Action Plan Resubmit' and AFSM.ISACTIVE=1),
[SUBMITTED] = (select Count(DISTINCT CAPA.KPI_DETAILS_ID) from AUDIT_FINDINGS_CAPA CAPA where CAPA.KPI_DETAILS_ID = KD.ID and CAPA.ISACTIVE=1 and CAPA.ISSUBMITTED=1 ),    
[REVIEW] =  (select COUNT(DISTINCT R.KPI_DETAILS_ID) from AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1 and R.ISAPPROVED=1),    
[IMPLEMENTATION] = (select COUNT(DISTINCT IMP.KPI_DETAILS_ID) from AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1 and IMP.ISIMPLEMENTED=1),    
[VERIFICATION] = (select COUNT(DISTINCT VER.KPI_DETAILS_ID)  from AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1 and VER.ISVERIFIED=1),    
[CUSTOMER_APPROVAL] = (select COUNT(DISTINCT CUST_APPROVAL.CAPA_ID) from CUSTOMER_CAPA_APPROVAL CUST_APPROVAL where  CUST_APPROVAL.CAPA_ID = MAX(CAPA.ID) and CUST_APPROVAL.ISACTIVE = 1 and CUST_APPROVAL.STATUS_ID=1) ,
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE, 
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where AFSM.KPI_DETAILS_ID = KD.ID and AFSM.ISCOMPLETE=0 and AFSM.STAGE_STATUS='Corrective Action Plan Resubmit' and AFSM.ISACTIVE=1) as RESUBMISSION   

from    
PORTFOLIO_PRODUCTS PP    
left join KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ( @iscustomer =0 or ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1   )    
join KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1    
join AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1    
join PRODUCT_MODE_MAPPING PM on PM.PRODUCT_ID = PP.ID and PM.ISACTIVE = 1
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0  and PP.CUST_ID = @customerId
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and  PP.PORTFOLIO_ID!=@unclassifiedId  and    
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)    
or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )    
group by PP.ID ,PP.PRODUCT_TITLE,KD.ID,PM.MODE_ID 
)    
select Product_ID,MODE_ID,PRODUCT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET, 
[DUE_FOR_SUBMISSION] = SUM(case when RESUBMISSION = 1 then RESUBMITTED else 0 End),
[DUE_FOR_REVIEW] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),    
[DUE_FOR_CUSTOMER_APPROVAL] = SUM(case when CAPA_STAGE = 2 then REVIEW else 0 End),  
[DUE_FOR_IMPLEMENTATION] = SUM(case when CAPA_STAGE = 5 and IMPLEMENTATION = 0 and VERIFICATION = 0 then CUSTOMER_APPROVAL else 0 End),
[DUE_FOR_VERIFICATION] = SUM(case when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 0 then IMPLEMENTATION else 0 End),    
[CLOSED] = SUM(case when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 1 then VERIFICATION else 0 End)  
from CTE    
group by Product_ID,MODE_ID,PRODUCT_TITLE    
order by PRODUCT_TITLE    
END  
GO
