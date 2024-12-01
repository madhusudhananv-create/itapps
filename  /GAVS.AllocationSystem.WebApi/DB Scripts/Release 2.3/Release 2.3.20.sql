use BAS
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
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0  and PP.CUST_ID = @customerId and (KD.EXCLUSION_SLA_STATUS!='Met' or KD.EXCLUSION_SLA_STATUS IS NULL)  
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and  PP.PORTFOLIO_ID!=@unclassifiedId  and        
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)        
or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )        
group by PP.ID ,PP.PRODUCT_TITLE,KD.ID,PM.MODE_ID,KD.EXCLUSION_SLA_STATUS  
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

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='csp_get_ProjectResourceByProjId' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].csp_get_ProjectResourceByProjId
END
GO

CREATE proc [dbo].[csp_get_ProjectResourceByProjId]  
 @ProjId varchar(20)  
AS  
BEGIN  

 SET NOCOUNT ON;  
  
 select e.FRST_NM, e.EMP_ID, c.CUST_NM, c.CUST_ID, p.PROJ_NM, p.PROJ_ID, pr.BILL_FLG, pr.CURR_INDC, 
 pr.START_DATE, pr.END_DATE from PROJ_RESOURCE pr    
 inner join project p on pr.proj_id = p.proj_id    
 inner join customer c on p.cust_id = c.cust_id    
 inner join emp_info e on pr.emp_id = e.emp_id    
 where pr.PROJ_ID = @ProjId and PR.CURR_INDC='Y' and PR.END_DATE>=GETDATE()
 order by FRST_NM,cust_nm, proj_nm, CURR_INDC desc, BILL_FLG desc   
  
END  
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCAPAStageID' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getCAPAStageID
END
GO

CREATE Procedure getCAPAStageID

@detailIds varchar(max)

as
begin

;with cte
AS
(
select KD.ID as DETAIL_ID,
[IMPLEMENTATION] = (select COUNT(DISTINCT IMP.KPI_DETAILS_ID) from AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1 and IMP.ISIMPLEMENTED=1),      
[VERIFICATION] = (select COUNT(DISTINCT VER.KPI_DETAILS_ID)  from AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1 and VER.ISVERIFIED=1),      
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE,   
(select max(stage_ID) from AUDIT_FINDING_STAGES_MAPPING AFSM where AFSM.KPI_DETAILS_ID = KD.ID and AFSM.ISCOMPLETE=0 and AFSM.STAGE_STATUS='Corrective Action Plan Resubmit' and AFSM.ISACTIVE=1) as RESUBMISSION

from KPI_DETAILS KD where KD.ISACTIVE=1 and KD.ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@detailIds,','))
)
SELECT DETAIL_ID,CAPA_STAGE_ID=(case when RESUBMISSION = 1 then 0 
when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 0 then 3  
when CAPA_STAGE = 5 and IMPLEMENTATION = 1 and VERIFICATION = 1 then 4 else CAPA_STAGE End)
from CTE                                                                           
end
Go


IF NOT EXISTS(Select 1 from sys.tables where name ='EXTERNAL_KPI_DATA' AND type='U')
BEGIN

CREATE TABLE [dbo].EXTERNAL_KPI_DATA(
	[ID] [int] IDENTITY(1,1) NOT NULL,
    [CUST_ID] varchar(250) NOT NULL,    
    [KPI_DATA] [varchar](MAX) NULL,
    [INPUT_DATE] [datetime] NOT NULL,
    [IS_PROCESSED] bit not null,
    [CREATED_BY] varchar(100) NOT NULL,
    [CREATED_DATE] [datetime] NOT NULL default getdate(),
    [UPDATED_BY] varchar(100) NOT NULL,
    [UPDATED_DATE] [datetime] NOT NULL default getdate(),
    [ISACTIVE] [bit] NOT NULL
)
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='KPI' AND COLUMN_NAME='KEYWORDS')
BEGIN
ALTER TABLE KPI ADD KEYWORDS VARCHAR(2000) NULL
END
GO

 
IF EXISTS(SELECT 1 FROM sys.columns WHERE OBJECT_NAME(object_id) ='CSS_SURVEY_ITERATION' AND name='PROJ_ID') 
BEGIN
ALTER TABLE CSS_SURVEY_ITERATION  
DROP COLUMN PROJ_ID 
END

GO

IF EXISTS(SELECT 1 FROM sys.columns WHERE OBJECT_NAME(object_id) ='CSS_SURVEY_ITERATION' AND name='PROD_ID') 
BEGIN
ALTER TABLE CSS_SURVEY_ITERATION  
DROP COLUMN PROD_ID 
END 

GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE OBJECT_NAME(object_id) ='customer_users' AND name='SPECIFIC_SURVEY_OPTED') 
BEGIN
ALTER TABLE customer_users  
ADD SPECIFIC_SURVEY_OPTED BIT default(0);
END 


GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE OBJECT_NAME(object_id) ='css_batch_customer_Monthly' AND name='PROJ_ID') 
BEGIN
ALTER TABLE css_batch_customer_Monthly  
ADD  PROJ_ID varchar(50) NULL;
END 



GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE OBJECT_NAME(object_id) ='css_batch_customer_Monthly' AND name='PROD_ID') 
BEGIN
ALTER TABLE css_batch_customer_Monthly  
ADD PROD_ID INT  NULL;
END 

GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCustomerUsersList' AND TYPE='P')
BEGIN
DROP PROCEDURE getCustomerUsersList         
END
GO
 
CREATE procedure [dbo].getCustomerUsersList 
@custId varchar(50)='-1'
As
Begin 

select  CUSTOMER_USER_ID,CP.CUST_ID, 
P.PROJ_ID,p.PROJ_NM,EMAILID, DISPLAY_NAME 
from customer_projects CP (NOLOCK)
INNER JOIN customer_users CU (NOLOCK)
ON  CP.CUSTOMER_USER_ID=CU.ID   
INNER JOIN PROJECT P (NOLOCK)
ON P.PROJ_ID =CP.PROJ_ID AND ISNULL(P.PROJ_STATUS,'')!='Close' 
where cp.ISACTIVE=1 AND (ISNULL(@custId,'-1')='-1' OR @custId= CP.CUST_ID) AND
ISNULL(CSAT_SURVEY,0)=1
GROUP BY CUSTOMER_USER_ID,CP.CUST_ID, 
P.PROJ_ID,p.PROJ_NM,EMAILID, DISPLAY_NAME 

END



GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getPortfolioProductResponsibleList' AND TYPE='P')
BEGIN
DROP PROCEDURE getPortfolioProductResponsibleList          
END
GO
 
--[dbo].[getPortfolioProductResponsibleList] '-1',6
CREATE procedure [dbo].[getPortfolioProductResponsibleList]   
@custId varchar(50)='-1' ,
@managementType int=0
As  
Begin  
  
select pp.ID AS PRODUCT_ID,ppr.CUST_ID,   
p.TITLE as Portfolio_Name ,  pp.PRODUCT_TITLE  ,  
iif (ei.FRST_NM is null , cu.DISPLAY_NAME ,ei.FRST_NM) As RESPONSIBLE_NAME,  
iif(ei.EMAIL_ID is null , cu.EMAILID ,ei.EMAIL_ID ) AS MailID    from PORTFOLIO p   
inner join PORTFOLIO_PRODUCTS pp on pp.PORTFOLIO_ID=p.ID   
inner join [PORTFOLIO_PROJECT] PPr on   
PPr.PORTFOLIO_ID=pp.PORTFOLIO_ID  
inner join PRODUCT_RESPONSIBLE pr on pr.PRODUCT_ID=pp.ID   
inner join PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE pm on pm.ID=pr.MANAGEMENT_TYPE   
left join EMP_INFO ei on ei.EMP_ID=pr.EMP_ID   
left join customer_users cu on cu.EMAILID=pr.EMP_ID  
where p.ISACTIVE=1 and pp.ISACTIVE=1 and pr.ISACTIVE=1 and pm.ISACTIVE=1  
AND (ISNULL(@custId,'-1')='-1' OR @custId= ppr.CUST_ID)  
AND (ISNULL(@managementType,0)=0 OR @managementType= pr.MANAGEMENT_TYPE)  
GROUP BY  pp.ID ,ppr.CUST_ID,   
p.TITLE,  pp.PRODUCT_TITLE  ,ei.FRST_NM , cu.DISPLAY_NAME ,ei.EMAIL_ID,cu.EMAILID 
  
END  
  
  
  
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForPeriod1' AND TYPE='P')
BEGIN
DROP PROCEDURE getCSSTableForPeriod1          
END
GO
/****** Object:  StoredProcedure [dbo].[getCSSTableForPeriod1]    Script Date: 23-05-2023 14:26:01 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*  
---------------------------------------------------  
--  [dbo].[getCSSTableForPeriod1] '04/1/2022' , '10/31/2023', '-1','-1'
-- Author        : UNknown     
-- Date      :  NA   
-- Purpose       : [get CSS Table For Period]  
---------------------------------------------------   
-- ver     user             date             change    
-- 1.1    Indhu          20-07-2022       Modified date & Action submitted logic  
-- 1.2    Indhu          27-09-2022       Filter by CSM  
-- 1.3    Indhu          27-09-2022       CSM Multi select 
#########################################################################  */  
CREATE PROCEDURE [dbo].[getCSSTableForPeriod1]                              
@startDate varchar(10),                            
@endDate varchar(10),                            
@custIds varchar(max)='-1',
@csmIds varchar(max)='-1'
AS                              
BEGIN                  
       
;With NonPremierAccounts AS (                        
                        
select CB.CUST_ID , P.PROJ_ID,P.PROJ_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= r2.rating, URL ='https://csm.gavstech.com/CustomerSuccessSurvey/'+ r1.SURVEY_ID,  
ActionplanURL ='https://csm.gavstech.com/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20)) +'/'+P.PROJ_ID+'/true'  , r1.CREATED_DATE, r1.batch_customer_id,RN = row_number() OVER(partition by ct.contact_name, p.proj_id ORDER BY cb.id desc, r1.rating)  
  
    
FROM [CSS_BATCH_CUSTOMERS] CB  (NOLOCK)  
INNER JOIN BAS.DBO.PROJECT P (NOLOCK) on p.proj_id = CB.proj_id    
INNER JOIN CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1    
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1    
inner join CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1    
--inner join BAS..emp_info e on e.emp_id = p.PROJ_DM_EMP_ID  
INNER JOIN CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1    
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )    
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))             
AND (@csmIds ='-1' OR p.PROJ_DM_EMP_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))
),                     
                        
PremierAccount As (                        
select CB.CUST_ID , 'Premier' as CUST_NM, CB.PROJ_ID,CB.prod_ID ,CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= 0, URL ='https://csm.gavstech.com/CustomerSuccessSurvey/'+ r1.SURVEY_ID,  
ActionplanURL ='https://csm.gavstech.com/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20))+'/0/true', r1.CREATED_DATE, r1.batch_customer_monthly_id,    
RN = row_number() OVER(partition by ct.contact_name,CB.prod_ID,CB.proJ_ID ORDER BY cb.id desc, r1.rating )    
FROM [CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)     
INNER JOIN CSS_BATCH_monthly B (NOLOCK) ON B.ID = CB.BATCH_MONTHLY_ID and B.ISACTIVE = 1    
INNER JOIN CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1    
INNER JOIN CONTACTS CT (NOLOCK)  on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1    
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )     
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))    
AND (@csmIds ='-1' OR ( @csmIds !='-1' AND cust_id in (select cust_id from bas..PROJECT where  PROJ_DM_EMP_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))))

),    
    
 ActionItem AS (    
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from                
  PROJECT_ACTIONITEM PA (NOLOCK)               
  join              
  CSS_BATCH_CUSTOMERS BC  (NOLOCK)             
  on PA.BATCH_CUSTOMER_ID = BC.ID and PA.SOURCE = 'CSS' and PA.ISACTIVE = 1             
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID             
  join             
  CSS_BATCHES B (NOLOCK) ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED'  
  and ((B.START_DATE             
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))    
  Where PA.Status not in ('Cancelled','Suspended')    
)               
  
 SELECT A.PROJ_ID [PROJECT_ID], 0 PROD_ID,'' PROD_NM ,A.PROJ_NM,A.CUST_ID [CUSTOMER_ID],                        
 A.CONTACT_NAME RESPONDENT_NAME,                             
  A.CONTACT_NAME + ' - ' + A.PROJ_NM as [DISPLAY_TEXT] , A.MIN_SCORE,A.NPS_SCORE,Null as CSS_SCORE,A.URL,    ActionplanURL,            
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),    
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA     
  Where PA.Status in ('Planned','Started') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)       
  FROM     
  NonPremierAccounts A Where A.RN = 1      
      
  UNION           
      
  SELECT                                
    A.PROJ_ID AS [PROJECT_ID],  A.PROD_ID,PR.PRODUCT_TITLE ,CP.PROJ_NM, A.CUST_ID [CUSTOMER_ID]                   
  , A.CONTACT_NAME RESPONDENT_NAME    
  , A.CONTACT_NAME +' - ' + A.CUST_NM +(CASE WHEN ISNULL(CP.PROJ_NM,'')<>'' THEN '('+CP.PROJ_NM+')'  WHEN ISNULL(PR.PRODUCT_TITLE,'')<>'' THEN  '('+PR.PRODUCT_TITLE+')'   ELSE '' END)  as [DISPLAY_TEXT], null MIN_SCORE ,A.NPS_SCORE,A.MIN_SCORE as CSS_SCORE,A.URL,   ActionplanURL,    
  null as [ACTION_PLAN_SUBMITTED],null as [ACTION_PLAN_NOT_SUBMITTED]    
  FROM             
  PremierAccount A
  LEFT JOIN CUSTOMER_PROJECTS CP (NOLOCK)
  ON A.PROJ_ID=CP.PROJ_ID 
  LEFT JOIN PORTFOLIO_PRODUCTS PR (NOLOCK)
  ON A.PROD_ID=PR.ID
   Where A.RN = 1                         
  order by RESPONDENT_NAME      
      
END     
  


GO




IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSATDUMP_Monthly' AND TYPE='P')
BEGIN
DROP PROCEDURE reports_CSATDUMP_Monthly          
END
GO

/****** Object:  StoredProcedure [dbo].[reports_CSATDUMP_Monthly]    Script Date: 24-05-2023 09:13:08 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


CREATE procedure [dbo].[reports_CSATDUMP_Monthly]              

@StartDate Date,                            
@EndDate Date            
           
AS             
BEGIN              
          
WITH CSM AS (                                  
SELECT P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                              
INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID) ,                       
          
AM AS (                                  
SELECT distinct P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                              
INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID)              
                          
SELECT  c.cust_nm [Customer Name], b.DISPLAY_NAME [Respondent Name],  B.EMAIL_ID  [Email_Id]                            
,FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT sent Date]                              
,FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us')  [CSAT received Date],                              
FORMAT(bt.START_DATE,'MMM') +'-' + CAST(YEAR(bt.START_DATE) as varchar(10)) AS MONTH,       
qr.QUESTION_CATEGORY,qr.QUESTION,qr.RATING,qr.RATING_DESCRIPTION ,     
c.Cust_ID [Customer_ID],              
STUFF((select distinct ',' + CSM.CSM_NAME from CSM CSM              
join CSS_BATCH_CUSTOMER_MONTHLY bcc on CSm.CUST_ID = bcc.CUST_ID              
for xml path ('')),1,1,'')as [Customer Success Manager],                
STUFF((select distinct ',' + AM.CSM_NAME from AM AM              
join CSS_BATCH_CUSTOMER_MONTHLY bcc on AM.CUST_ID = bcc.CUST_ID              
for xml path ('')),1,1,'')as[ACCOUNT MANAGER]     ,
CASE WHEN ISNULL(CP.PROJ_NM,'')<>'' THEN CP.PROJ_NM  WHEN ISNULL(PR.PRODUCT_TITLE,'')<>'' THEN  PR.PRODUCT_TITLE   ELSE '---' END AS  [Project]
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                              
INNER JOIN CSS_BATCH_MONTHLY bt on   bt.id = b.BATCH_MONTHLY_ID                 
inner join CSS_QUESTION_REPLIES QR on QR.Batch_Customer_Monthly_id = b.ID          
inner join bas.dbo.customer c on c.cust_id = b.cust_id           
LEFT JOIN CUSTOMER_PROJECTS CP (NOLOCK)
ON b.PROJ_ID=CP.PROJ_ID 
LEFT JOIN PORTFOLIO_PRODUCTS PR (NOLOCK)
ON b.PROD_ID=PR.ID
WHERE b.STATUS = 'COMPLETED'  and              
(( bt.start_date between @StartDate and @EndDate    ) OR ( bt.ENd_date between @StartDate and @EndDate    ))                        
order by bt.id,[Customer Name]                            
                         
END   

GO