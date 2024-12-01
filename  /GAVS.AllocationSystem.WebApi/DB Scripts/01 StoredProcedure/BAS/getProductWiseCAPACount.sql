IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductWiseCAPACount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProductWiseCAPACount
END
GO

CREATE PROCEDURE getProductWiseCAPACount

@customerId  varchar(50),          
@startDate datetime,          
@endDate datetime,          
@productId int = 0  ,          
@iscustomer bit = 0          
    
AS       
BEGIN          

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
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and          
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

