USE CSP
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='deleteKPIDetailsData' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[deleteKPIDetailsData]
END
GO

CREATE procedure deleteKPIDetailsData          
  
@productId int,  
@startDate Datetime,  
@endDate Datetime   
  
As  
Begin  
  
declare @quarterStartDate Datetime                                          
declare @quarterEndDate datetime                                          
                                      
set @quarterStartDate = (Select csp.dbo.Fn_GetQuarterDates ( @startDate,0 ) );                            
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates ( @startDate,1 ) );                                            
  
delete from  CSP..KPI_DETAILS  where (PRODUCT_ID=@productId or @productId = -1) and   
(PERIOD_TYPE in ('Monthly','Release') and PERIOD between @startDate and @endDate)   
or (PERIOD_TYPE in ('Quarterly') and PERIOD  between  @quarterStartDate and @quarterEndDate )      
  
End  
Go
