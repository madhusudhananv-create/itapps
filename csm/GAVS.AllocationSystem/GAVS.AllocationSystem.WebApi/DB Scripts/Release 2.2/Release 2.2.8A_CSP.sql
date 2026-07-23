USE CSP

GO

IF EXISTS(Select 1 from sys.procedures where name ='usp_quantitative_benefits' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_quantitative_benefits]
END
GO 

        
CREATE PROCEDURE usp_quantitative_benefits        
        
@beneficiaryid varchar(100),          
@customerid varchar(max),          
@projectid varchar(max),        
@identifiedby varchar(max),        
@benefitPillarid varchar(200),        
@statusid varchar(20),      
@startdate date,          
@enddate date,          
@uom int           
          
AS          
BEGIN          
        
select CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'           
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'          
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'          
WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'          
WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets'          
          
END Benefit_Pillar,CAST(isnull(SUM(BDQ.NET_BENEFITS_YEAR),0) as INT) Net_Benefits,IBS.TYPE_ID from BENEFIT_DETAILS_QUANTITATIVE BDQ          
          
join IDEA_BENEFIT_SUMMARY IBS on BDQ.BENEFIT_SUMMARY_ID = IBS.ID and IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))          
          
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))          
          
join Idea I on IBS.IDEA_ID = I.ID  and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))        
      
and (@statusid = '' or I.IDEA_STATUS_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@statusid,',')))      
          
join UOM U on BDQ.UOM_ID = U.ID and BDQ.UOM_ID = @uom          
          
join BAS..Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))          
        
AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))        
          
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1  and  isnull(BDQ.NET_BENEFITS_YEAR,0) <> 0        
          
group by IBS.BENEFIT_PILLAR_ID,IBS.TYPE_ID          
        
        
END        

GO


IF EXISTS(Select 1 from sys.procedures where name ='usp_quantitative_benefit_monthly' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_quantitative_benefit_monthly]
END
GO 
   
        
CREATE PROCEDURE usp_quantitative_benefit_monthly        
        
@beneficiaryid varchar(100),         
@customerid varchar(max),         
@projectid varchar(max),        
@identifiedby varchar(max),        
@benefitpillarid varchar(200),         
@statusid varchar(20),      
@startdate date,         
@enddate date,         
@uom int             
        
AS            
            
BEGIN            
            
select CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'             
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'            
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'            
WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'            
WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets'            
END Benefit_Pillar, FORMAT(I.IDENTIFIED_DATE,'MMM-yy') Months,cast(isnull(SUM(BDQ.NET_BENEFITS_YEAR),0) as int) Net_Benefits,IBS.TYPE_ID            
            
from BENEFIT_DETAILS_QUANTITATIVE BDQ            
            
join IDEA_BENEFIT_SUMMARY IBS on BDQ.BENEFIT_SUMMARY_ID = IBS.ID and IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))            
            
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))             
            
join Idea I on IBS.IDEA_ID = I.ID    and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))         
      
and (@statusid = '' or I.IDEA_STATUS_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@statusid,',')))      
            
join UOM U on BDQ.UOM_ID = U.ID and BDQ.UOM_ID = @uom            
            
join BAS..Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))           
        
AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))        
            
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1    and  isnull(BDQ.NET_BENEFITS_YEAR,0) <> 0        
            
group by IBS.BENEFIT_PILLAR_ID,FORMAT(I.IDENTIFIED_DATE,'MMM-yy'),YEAR(I.IDENTIFIED_DATE),MONTH(I.IDENTIFIED_DATE),IBS.TYPE_ID            
            
order by YEAR(I.IDENTIFIED_DATE),MONTH(I.IDENTIFIED_DATE)            
            
            
END         

GO

IF EXISTS(Select 1 from sys.procedures where name ='usp_quantitative_benefits_detail' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_quantitative_benefits_detail]
END
GO 
      
          
CREATE PROCEDURE usp_quantitative_benefits_detail            
            
@beneficiaryid varchar(100),                    
@customerid varchar(max),                
@projectid varchar(max),                
@identifiedby varchar(max),          
@benefitpillarid varchar(200),              
@statusid varchar(20),        
@startdate date,                      
@enddate date,            
@uom int               
                      
as                      
begin                         
                  
            
select CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'               
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'              
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'              
WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'              
WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets'              
              
END Benefit_Pillar, CONVERT(varchar(12),I.IDENTIFIED_DATE,100) AS [Identified_Date],cast(isnull(SUM(BDQ.NET_BENEFITS_YEAR),0) as int) AS [Net_Benefits],E.FRST_NM AS [Responsible],PSA.TITLE AS [Area],I.DESCRIPTION AS [Idea],             
            
IBS.TYPE_ID  from BENEFIT_DETAILS_QUANTITATIVE BDQ            
                      
join IDEA_BENEFIT_SUMMARY IBS on IBS.ID = BDQ.BENEFIT_SUMMARY_ID AND IBS.BENEFIT_PILLAR_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@benefitpillarid,','))                    
                    
and IBS.BENEFICIARY_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@beneficiaryid,','))                      
                      
join Idea I on IBS.IDEA_ID = I.ID   and (@identifiedby = '' or I.IDENTIFIED_BY in (SELECT * FROM [DBO].[FN_SPLITSTRING](@identifiedby,',')))         
        
and (@statusid = '' or I.IDEA_STATUS_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@statusid,',')))        
            
join UOM U on BDQ.UOM_ID = U.ID and BDQ.UOM_ID = @uom              
              
join BAS..PROJECT P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))                    
          
AND (@projectid = '' or P.PROJ_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectid,',')))          
            
join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID AND IIP.ISACTIVE = 1                        
              
join PROCESS_SERVICE_AREA_NEW PSA on I.SERVICE_AREA_ID = PSA.ID              
              
join BAS..EMP_INFO E on IIP.RESPONSIBLE = E.EMP_ID              
                                                    
where I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate and I.isactive = 1                    
            
group by IBS.BENEFIT_PILLAR_ID,CONVERT(varchar(12),I.IDENTIFIED_DATE,100),E.FRST_NM,PSA.TITLE,I.DESCRIPTION,IBS.TYPE_ID            
                                  
END 

GO