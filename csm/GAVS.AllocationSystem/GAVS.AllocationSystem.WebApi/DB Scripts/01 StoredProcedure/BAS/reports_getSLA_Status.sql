USE BAS
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
