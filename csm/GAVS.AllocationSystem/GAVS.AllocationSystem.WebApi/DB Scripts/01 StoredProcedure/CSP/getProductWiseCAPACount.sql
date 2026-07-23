USE CSP
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
  
declare @unclassifiedId int = (select ID from CSP..PORTFOLIO where TITLE='Unclassified')  
                     
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
left join CSP..KPI_DETAILS KD  on  KD.PRODUCT_ID = PP.ID   and PP.ISACTIVE = 1  and ( @iscustomer =0 or ISNULL(PP.IS_SERVICE_COMMENCED ,0) = 1   )                     
join CSP..KPI K on KD.KPI_ID = K.ID and  K.ISACTIVE = 1              
join CSP..AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1         
          
where KD.SLA_STATUS = 'Not Met'  and isnull(kd.isdraft,0) = 0              
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and  PP.PORTFOLIO_ID!=@unclassifiedId  and                  
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
