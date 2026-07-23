USE CSP
GO


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSSTableForPeriod1' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getCSSTableForPeriod1
END
GO

/*  
---------------------------------------------------  
--  [dbo].[getCSSTableForPeriod1] '04/1/2022' , '10/31/2022', '-1',105661
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
  
    
FROM [CSP].[dbo].[CSS_BATCH_CUSTOMERS] CB  (NOLOCK)  
INNER JOIN BAS.DBO.PROJECT P (NOLOCK) on p.proj_id = CB.proj_id    
INNER JOIN CSP.DBO.CSS_BATCHES B (NOLOCK) ON B.ID = CB.BATCH_ID and B.ISACTIVE = 1    
INNER JOIN CSP..CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1    
inner join csp..CSS_QUESTION_REPLIES r2 (NOLOCK) on r2.batch_customer_id = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r2.QUESTION_CATEGORY ='NPS' and r2.ISACTIVE = 1    
--inner join BAS..emp_info e on e.emp_id = p.PROJ_DM_EMP_ID  
INNER JOIN CSP..CONTACTS CT on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1    
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )    
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))             
AND (@csmIds ='-1' OR p.PROJ_DM_EMP_ID  in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))
),                     
                        
PremierAccount As (                        
select CB.CUST_ID , 'Premier' as CUST_NM, CT.CONTACT_NAME , R1.RATING as MIN_SCORE , [NPS_SCORE]= 0, URL ='https://csm.gavstech.com/CustomerSuccessSurvey/'+ r1.SURVEY_ID,  
ActionplanURL ='https://csm.gavstech.com/layout/actionitems/'+ cast(CB.CUST_ID as varchar(20))+'/0/true', r1.CREATED_DATE, r1.batch_customer_monthly_id,    
RN = row_number() OVER(partition by ct.contact_name ORDER BY cb.id desc, r1.rating )    
FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] CB (NOLOCK)     
INNER JOIN CSP.DBO.CSS_BATCH_monthly B (NOLOCK) ON B.ID = CB.BATCH_MONTHLY_ID and B.ISACTIVE = 1    
INNER JOIN CSP..CSS_QUESTION_REPLIES R1 (NOLOCK) on R1.BATCH_CUSTOMER_MONTHLY_ID = cb.ID and cb.ISACTIVE =1 and cb.STATUS ='COMPLETED' and r1.QUESTION_CATEGORY ='Criteria' and R1.ISACTIVE = 1    
INNER JOIN CSP..CONTACTS CT (NOLOCK)  on CT.CUSTOMER_ID = CB.CUST_ID and CT.CONTACT_EMAILID = CB.EMAIL_ID and CT.ISACTIVE = 1    
WHERE CB.STATUS = 'COMPLETED' and (( B.START_DATE BETWEEN @startDate AND @endDate) OR ( B.END_DATE BETWEEN @startDate AND @endDate) )     
AND (@custIds = '-1' OR CB.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@custIds,',')))    
AND (@csmIds ='-1' OR ( @csmIds !='-1' AND cust_id in (select cust_id from bas..PROJECT where  PROJ_DM_EMP_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@csmIds,',')))))

),    
    
 ActionItem AS (    
  select PA.PROJECT_ID,PA.Status,PA.TARGET_DATE from                
  CSP..PROJECT_ACTIONITEM PA (NOLOCK)               
  join              
  CSP..CSS_BATCH_CUSTOMERS BC  (NOLOCK)             
  on PA.BATCH_CUSTOMER_ID = BC.ID and PA.SOURCE = 'CSS' and PA.ISACTIVE = 1             
  and BC.ISACTIVE = 1 and PA.PROJECT_ID = BC.PROJ_ID             
  join             
  CSP..CSS_BATCHES B (NOLOCK) ON B.ID = BC.BATCH_ID and BC.STATUS = 'COMPLETED'  
  and ((B.START_DATE             
  BETWEEN @startDate AND @endDate) OR  (B.END_DATE BETWEEN @startDate AND @endDate))    
  Where PA.Status not in ('Cancelled','Suspended')    
)               
  
 SELECT A.PROJ_ID [PROJECT_ID], A.CUST_ID [CUSTOMER_ID],                        
 A.CONTACT_NAME RESPONDENT_NAME,                             
  A.CONTACT_NAME + ' - ' + A.PROJ_NM as [DISPLAY_TEXT] , A.MIN_SCORE,A.NPS_SCORE,Null as CSS_SCORE,A.URL,    ActionplanURL,            
  [ACTION_PLAN_SUBMITTED] = (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA Where PA.Status in ('Completed','Closed')  AND PA.PROJECT_ID=A.PROJ_ID),    
  [ACTION_PLAN_NOT_SUBMITTED] =  (select COUNT(distinct PA.PROJECT_ID) from ActionItem PA     
  Where PA.Status in ('Planned','Started') and PA.TARGET_DATE < GETDATE()  AND PA.PROJECT_ID=A.PROJ_ID)       
  FROM     
  NonPremierAccounts A Where A.RN = 1      
      
  UNION           
      
  SELECT                                
   '0' [PROJECT_ID], A.CUST_ID [CUSTOMER_ID]                   
  , A.CONTACT_NAME RESPONDENT_NAME    
  , A.CONTACT_NAME +' - ' + A.CUST_NM as [DISPLAY_TEXT], null MIN_SCORE ,A.NPS_SCORE,A.MIN_SCORE as CSS_SCORE,A.URL,   ActionplanURL,    
  null as [ACTION_PLAN_SUBMITTED],null as [ACTION_PLAN_NOT_SUBMITTED]    
  FROM             
  PremierAccount A Where A.RN = 1                         
  order by RESPONDENT_NAME      
      
END     
  


GO



IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Lack of functional understanding') 
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Lack of functional understanding',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Missed NFR’s')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Missed NFR’s',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Infrastructure Challenges')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Infrastructure Challenges',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Missed scenarios in Testing')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Missed scenarios in Testing',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Technical challenges')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Technical challenges',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Lack of bandwidth')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Lack of bandwidth',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Accountability')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Accountability',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Ownership')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Ownership',1);


GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

CREATE PROC getProductWiseCAPACount          
@customerId varchar(50) = '212100001',                     
@startDate datetime,                                                                    
@endDate datetime,                    
@productId int = 0  ,      
@iscustomer bit = 0                          

AS                  
BEGIN                    
                    
declare @quarterStartDate Datetime                                        
declare @quarterEndDate datetime                                        
                                    
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0));                                        
set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,1));                            
                    
                   
;with CTE AS      
 (                    
      
select PP.ID as ProductID,PP.PRODUCT_TITLE,KD.ID as KPI_DETAILS_ID,        
[SUBMITTED] = Count(CAPA.ID),        
[REVIEW] =  (select COUNT(R.ID) from CSP..AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1),        
[IMPLEMENTATION] = (select COUNT(IMP.ID) from CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1),       
[VERIFICATION] = (select COUNT(VER.ID)  from CSP..AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1),     
[CUSTOMER_APPROVAL] = (select COUNT(CUST_APPROVAL.ID) from CSP..CUSTOMER_CAPA_APPROVAL CUST_APPROVAL where  CUST_APPROVAL.CAPA_ID = MAX(CAPA.ID) and CUST_APPROVAL.ISACTIVE = 1),  
(select max(stage_ID) from CSP..AUDIT_FINDING_STAGES_MAPPING where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE      
      
from         
CSP..PORTFOLIO_PRODUCTS PP             
left join CSP..KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1                 
join CSP..KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1          
join CSP..AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1     
      
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0          
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and                    
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)                                    
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )        
      
 group by PP.ID ,PP.PRODUCT_TITLE,KD.ID        
 )      
 select ProductID,PRODUCT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET,      
 [SUBMITTED] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),      
 [REVIEW] = SUM(case when CAPA_STAGE = 2 then Review else 0 End),      
 [IMPLEMENTATION] = SUM(case when CAPA_STAGE = 3 then IMPLEMENTATION else 0 End),      
 [VERIFICATION] = SUM(case when CAPA_STAGE = 4 then VERIFICATION else 0 End),  
 [CUSTOMER_APPROVAL] = SUM(case when CAPA_STAGE = 5 then CUSTOMER_APPROVAL else 0 End)  
 from CTE      
 group by ProductID,PRODUCT_TITLE      
 order by PRODUCT_TITLE     
END 

   


GO



IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Lack of functional understanding') 
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Lack of functional understanding',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Missed NFR’s')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Missed NFR’s',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Infrastructure Challenges')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Infrastructure Challenges',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Missed scenarios in Testing')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Missed scenarios in Testing',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Technical challenges')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Technical challenges',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Lack of bandwidth')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Lack of bandwidth',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Accountability')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Accountability',1);
IF NOT EXISTs(SELECT  1 from AUDIT_MANAGEMENT_CAUSES WHERE CAUSES='Ownership')
INSERT INTO AUDIT_MANAGEMENT_CAUSES(CAUSES,ISACTIVE) VALUES ('Ownership',1);


GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

CREATE PROC getProductWiseCAPACount          
@customerId  varchar(50) = '212100001',                     
@startDate datetime,                                                                    
@endDate datetime,                    
@productId int = 0  ,      
@iscustomer bit = 0                          

AS                  
BEGIN                    
                    
declare @quarterStartDate Datetime                                        
declare @quarterEndDate datetime                                        
                                    
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,0));                                        
set @quarterEndDate = (Select csp.dbo.Fn_GetQuarterDates(@startDate,1));                            
                    
                   
;with CTE AS      
 (                    
      
select PP.ID as ProductID,PP.PRODUCT_TITLE,KD.ID as KPI_DETAILS_ID,        
[SUBMITTED] = Count(CAPA.ID),        
[REVIEW] =  (select COUNT(R.ID) from CSP..AUDIT_FINDING_CAPA_REVIEW R  where R.KPI_DETAILS_ID = KD.ID and R.ISACTIVE = 1),        
[IMPLEMENTATION] = (select COUNT(IMP.ID) from CSP..AUDIT_FINDING_CAPA_IMPLEMENTATION  IMP where IMP.KPI_DETAILS_ID = KD.ID and IMP.ISACTIVE = 1),       
[VERIFICATION] = (select COUNT(VER.ID)  from CSP..AUDIT_FINDING_CAPA_VERIFICATION VER Where VER.KPI_DETAILS_ID = KD.ID and VER.ISACTIVE = 1),     
[CUSTOMER_APPROVAL] = (select COUNT(CUST_APPROVAL.ID) from CSP..CUSTOMER_CAPA_APPROVAL CUST_APPROVAL where  CUST_APPROVAL.CAPA_ID = MAX(CAPA.ID) and CUST_APPROVAL.ISACTIVE = 1),  
(select max(stage_ID) from CSP..AUDIT_FINDING_STAGES_MAPPING where KPI_DETAILS_ID = KD.ID and ISCOMPLETE = 1 and isactive = 1) as CAPA_STAGE      
      
from         
CSP..PORTFOLIO_PRODUCTS PP             
left join CSP..KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1                 
join CSP..KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1          
join CSP..AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1     
      
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0          
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and                    
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between @startDate  and @endDate)                                    
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )        
      
 group by PP.ID ,PP.PRODUCT_TITLE,KD.ID        
 )      
 select ProductID,PRODUCT_TITLE,Count(KPI_DETAILS_ID) as NOT_MET,      
 [SUBMITTED] = SUM(case when CAPA_STAGE = 1 then SUBMITTED else 0 End),      
 [REVIEW] = SUM(case when CAPA_STAGE = 2 then Review else 0 End),      
 [IMPLEMENTATION] = SUM(case when CAPA_STAGE = 3 then IMPLEMENTATION else 0 End),      
 [VERIFICATION] = SUM(case when CAPA_STAGE = 4 then VERIFICATION else 0 End),  
 [CUSTOMER_APPROVAL] = SUM(case when CAPA_STAGE = 5 then CUSTOMER_APPROVAL else 0 End)  
 from CTE      
 group by ProductID,PRODUCT_TITLE      
 order by PRODUCT_TITLE     
END 
GO

if exists(select 1 from CSP..KPI where SLA_TARGET_UNIT_OF_MEASUREMENT = 'Number' and ISACTIVE = 1 and PRODUCT_ID is not null)
begin
update CSP..KPI set SLA_TARGET_UNIT_OF_MEASUREMENT = '' 
where SLA_TARGET_UNIT_OF_MEASUREMENT = 'Number' and ISACTIVE = 1 and PRODUCT_ID is not null
end
go

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetKPIWiseDetailDataForPeriod' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].GetKPIWiseDetailDataForPeriod
END
GO

CREATE PROC GetKPIWiseDetailDataForPeriod   --212100001,'2022-07-01','2022-07-31',0            
@customerId  varchar(50),                        
@startDate DateTime,                                          
@endDate DateTime    ,                
@isCustomer bit =0                               
AS                                  
BEGIN                         
declare  @quarterStartDate Datetime                        
declare @quarterEndDate datetime                        
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                        
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                        
with cte as                            
(                              
 SELECT k.ID                           
 ,k.KPI_NAME,PORTFOLIO_ID, k.PRODUCT_ID,psl.SERVICE_LEVEL_METRIC_DESCRIPTION,PSL.SERVICE_LEVEL_TYPE_ID SERVICE_LEVEL_TYPE_ID,                    
 PSA.SERVICE_AREA_TYPE ,
(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                               
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR 

,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 1)   as EXCLUSION_KPI_NUMERATOR                               
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id and IS_EXCLUSION = 1)   as EXCLUSION_KPI_DENOMINATOR    
 ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UNIT_OF_MEASUREMENT,PSLT.SERVICE_LEVEL                    
 ,ft.id as FID,ft.formula ,PP.TIER_ID ,RM.REFERENCE,   
  case when kd.sla_status in ('MET','NA','ND') then 1 else 0 end as SLA_Status                  
 , case when isnull(kd.ISFLAG,0) = 1 then  1 else 0 end as Cnt        
 , case when isnull(kd.ISNODATA,0) = 1 then  1 else 0 end as NDCnt ,  
case when kd.EXCLUSION_SLA_STATUS in ('MET') then 1 else 0 end as EXCLUSION_SLA_STATUS  
 FROM csp..KPI K                                              
 --INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                            
 INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1  and kd.ISACTIVE =1    and              
 ((k.FREQUENCY in ('Monthly', 'Release') and   KD.PERIOD  between CONVERT(datetime, @startDate ) and CONVERT(datetime, @endDate) )                              
or(k.FREQUENCY ='Quarterly' and  KD.PERIOD between CONVERT(datetime, @quarterStartDate ) and CONVERT(datetime, @quarterEndDate )))                       
  INNER JOIN  KPI2PRODUCT_SERVICE_LEVEL_METRICS k2p on k2p.Kpi_ID = k.ID                            
  INNER JOIN PRODUCT_SERVICE_LEVEL_METRICS PSL on K2p.PRODUCT_SERVICE_LEVEL_METRICS_ID = PSL.ID          
  INNER JOIN REFERENCE_MASTER RM on PSL.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1              
  INNER JOIN PRODUCTS_SERVICE_AREA PSA on PSL.SERVICE_AREA_TYPE_ID = PSA.ID                                  
  INNER JOIN PRODUCTS_SERVICE_LEVEL_TYPE PSLT on PSL.SERVICE_LEVEL_TYPE_ID = PSLT.ID                    
  INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                                  
 INNER JOIN PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                                
 INNER JOIN SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG s2b on s2b.kpi_id = k.id                            
 INNER JOIN BASE_MEASURE bm on bm.id = s2b.base_measure_id                            
  INNER JOIN BASE_MEASURE_FORMULA_TYPE FT on   bm.BASE_MEASURE_FORMULA_TYPE_ID = ft.id                                 
 where                              
 K.CUSTOMER_ID  = @customerId    and   isnull(KD.ISDRAFT,0)= 0                       
 and k.ISACTIVE =1     and (@iscustomer =0 or isnull(pp.IS_SERVICE_COMMENCED,0) = 1 )                          
 )                     
  select                              
    KPI_NAME                            
  ,SERVICE_AREA_TYPE   , PORTFOLIO_ID          
 ,sum(SLA_Status)     , count(SLA_Status)          
 ,CATEGORY = (select SHORT_DESC from GLOBAL_KPI_CATEGORY GC join GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING GKC on                    
 GC.ID = GKC.GLOBAL_KPI_CATEGORY_ID join KPI k on K.GLOBAL_KPI_CATEGORY_ID=GKC.GLOBAL_KPI_CATEGORY_ID where K.ID = max(cte.ID))                    
 , max(SERVICE_LEVEL_TYPE_ID) as SERVICE_LEVEL_TYPE_ID                            
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')       
 and count(SLA_Status) > 0 then convert(decimal,sum(SLA_Status))/CONVERT(decimal, count(SLA_Status)) * 100       
 else sum(KPI_NUMERATOR) end as KPI_NUMERATOR             
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR 
 , case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')       
 and count(EXCLUSION_SLA_STATUS) > 0 then convert(decimal,sum(EXCLUSION_SLA_STATUS))/CONVERT(decimal, count(EXCLUSION_SLA_STATUS)) * 100       
 else sum(EXCLUSION_KPI_NUMERATOR) end as EXCLUSION_KPI_NUMERATOR             
 , sum(EXCLUSION_KPI_DENOMINATOR) as EXCLUSION_KPI_DENOMINATOR      
, count(*) as cnt    
 ,MINIMUM_SERVICE_LEVEL = (select CASE WHEN isnull(MINIMUM_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then             
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)            
 ELSE MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))            
 ,EXPECTED_SERVICE_LEVEL = (select CASE WHEN isnull(EXPECTED_SERVICE_LEVEL,0)=0 and KPI_NAME='SYSTEM UPTIME' then             
 (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)            
 ELSE EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL from KPI_TARGETS kt where kt.KPI_ID =  max(cte.ID))            
 ,UNIT_OF_MEASUREMENT,SERVICE_LEVEL,max( FID) as FORMULA_ID                            
 ,max( formula) as FORMULA, max(REFERENCE) as REFERENCE                      
 , case when count(*) = sum(cnt) then convert(bit,1)  else convert(bit,0) end as ISNA     
, case when count(*) = sum(NDCnt) then convert(bit,1)  else convert(bit,0) end as ISNODATA    
  from cte  --where PORTFOLIO_ID=2                    
  group by   KPI_NAME, PORTFOLIO_ID, SERVICE_AREA_TYPE,UNIT_OF_MEASUREMENT,SERVICE_LEVEL               
  order by   SERVICE_AREA_TYPE,REFERENCE            
 END
 GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getEngagementLevelKPI' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getEngagementLevelKPI
END
GO

CREATE PROC getEngagementLevelKPI                                         
                        
@customerId  varchar(50),                                              
@startDate Datetime,                                                            
@endDate Datetime,               
@iscustomer bit =0                           
                                              
AS                                                                  
BEGIN                                                
declare  @quarterStartDate Datetime                                    
declare @quarterEndDate datetime                                    
                                    
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                    
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                                    
                                
select KPI_NAME,                               
count(Product_id) as PRODUCT_COUNT,                            
Max( EXPECTED_SERVICE_LEVEL) as EXPECTED_SERVICE_LEVEL, max( MINIMUM_SERVICE_LEVEL) as MINIMUM_SERVICE_LEVEL,                                                
--SUM(MET_PRODUCT) as MET_PRODUCT, SUM(NOT_MET_PRODUCT) as NOT_MET_PRODUCT,            
SUM(ISNA) as ISNA             
, count(Met_product), sum(met_product)            
, case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')     
  and count(MET_PRODUCT) > 0     
  then cast(convert(decimal,sum(MET_PRODUCT))/CONVERT(decimal,count(MET_PRODUCT)) *100 as decimal(18,3))     
  else IIF(sum(kpi_denominator) != 0,cast(sum(KPI_NUMERATOR) / sum(kpi_denominator) *100  as decimal(18,3)),0)      
  end as ACHIEVEMENT_VALUE                                
, sum(KPI_NUMERATOR) as KPI_NUMERATOR            
 , sum(KPI_DENOMINATOR) as KPI_DENOMINATOR ,max(UOM) as UOM ,max([REFERENCE]) as REFERENCE              
        , count(*) as cnt  ,  
  MAX(SERVICE_LEVEL) as SERVICE_LEVEL

  ,case when kpi_name in ('Adherence to Agile Methodology', 'Average Cycle Time for release','Process Efficiency', 'Volume of Incidents')     
  and count(EXCLUSION_MET_PRODUCT) > 0     
  then cast(convert(decimal,sum(EXCLUSION_MET_PRODUCT))/CONVERT(decimal,count(EXCLUSION_MET_PRODUCT)) *100 as decimal(18,3))     
  else IIF(sum(EXCLUSION_KPI_DENOMINATOR) != 0,cast(sum(EXCLUSION_KPI_NUMERATOR) / sum(EXCLUSION_KPI_DENOMINATOR) *100  as decimal(18,3)),0)      
  end as EXCLUSION_ACHIEVEMENT_VALUE                                
, sum(EXCLUSION_KPI_NUMERATOR) as EXCLUSION_KPI_NUMERATOR            
 , sum(EXCLUSION_KPI_DENOMINATOR) as EXCLUSION_KPI_DENOMINATOR 
--,SUM(SECONDARY_MET_PRODUCT) as SECONDARY_MET_PRODUCT, SUM(SECONDARY_NOT_MET_PRODUCT) as SECONDARY_NOT_MET_PRODUCT                      
from                                                    
(                                                    
select K.KPI_NAME as KPI_NAME,                            
 PP.ID as Product_id,                                                
--KT.EXPECTED_SERVICE_LEVEL,KT.MINIMUM_SERVICE_LEVEL,                
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID)           
ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                      
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then (select top 1 SYSTEM_UPTIME from PRODUCT_TIER PT where PT.TIER_ID = TIER_ID) ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                    

 CASE WHEN KD.SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS MET_PRODUCT                                                              
,CASE WHEN KD.SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS NOT_MET_PRODUCT,                              
CASE WHEN KD.SECONDARY_SLA_STATUS in( 'Met','NA','ND') then 1 ELSE 0 END AS SECONDARY_MET_PRODUCT                                                              
,CASE WHEN KD.SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS SECONDARY_NOT_MET_PRODUCT,      

 CASE WHEN KD.EXCLUSION_SLA_STATUS in('Met') then 1 ELSE 0 END AS EXCLUSION_MET_PRODUCT                                                              
,CASE WHEN KD.EXCLUSION_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_NOT_MET_PRODUCT,                              
 CASE WHEN KD.EXCLUSION_SECONDARY_SLA_STATUS in( 'Met') then 1 ELSE 0 END AS EXCLUSION_SECONDARY_MET_PRODUCT                                                              
,CASE WHEN KD.EXCLUSION_SECONDARY_SLA_STATUS = 'Not Met' then 1 ELSE 0 END AS EXCLUSION_SECONDARY_NOT_MET_PRODUCT,  


CASE WHEN KD.ISFLAG = 1 then 1 ELSE 0 END AS ISNA            
,(select   sum(numerator)  from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_NUMERATOR                                   
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value where kpi_details_id = kd.id)   as KPI_DENOMINATOR  
 ,(select   sum(numerator)  from csp..kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION = 1)   as EXCLUSION_KPI_NUMERATOR                                   
 ,(select   sum(DENOMINATOR) from csp..kpi_base_measure_value Exl where kpi_details_id = kd.id and Exl.IS_EXCLUSION =1)   as EXCLUSION_KPI_DENOMINATOR  
  ,K.SLA_TARGET_UNIT_OF_MEASUREMENT as UOM          
 ,[REFERENCE] = (select  RM.REFERENCE from  KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                        
join PRODUCT_SERVICE_LEVEL_METRICS PSL1 on PSL1.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID               
join REFERENCE_MASTER RM on PSL1.REFERENCE_ID = RM.ID and RM.ISACTIVE = 1 where KPSL.KPI_ID = k.id )   ,  
[SERVICE_LEVEL] = (select SLT.SERVICE_LEVEL from KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL                                                                  
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID   
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID where KPSL.KPI_ID = k.id)  
  
from KPI K                
INNER JOIN KPI_TARGETS KT on K.ID = KT.KPI_ID  and K.ISACTIVE = 1 and KT.ISACTIVE =1                                                                
INNER JOIN KPI_DETAILS KD ON K.ID = KD.KPI_ID AND K.ISACTIVE = 1 and                                             
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                                      
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate )                           
--join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                        
--join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                         
INNER JOIN PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID and PP.ISACTIVE =1                                                                  
            
where   K.CUSTOMER_ID = @customerId      and (@iscustomer = 0 or pp.IS_SERVICE_COMMENCED = 1)                           
and isnull(KD.ISDRAFT,0)=0           
)a                                                
group by KPI_NAME  order by KPI_NAME            
END   



