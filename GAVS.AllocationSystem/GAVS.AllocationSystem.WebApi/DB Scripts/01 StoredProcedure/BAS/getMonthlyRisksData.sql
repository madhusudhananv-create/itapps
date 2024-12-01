USE BAS
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getMonthlyRisksData' AND TYPE='P')
BEGIN
DROP PROCEDURE getMonthlyRisksData          
END
GO
  
CREATE procedure [dbo].[getMonthlyRisksData]          
@ProjIds VARCHAR(MAX)   
AS          
BEGIN          
DECLARE @fromDate date= Dateadd(Month, Datediff(Month, 0, DATEADD(m, -6, current_timestamp)), 0);     
SELECT DATENAME(MM,r.IDENTIFIED_DATE) AS MONTH_NAME,COUNT(r.STATUS) AS STATUS                
FROM [PROJECT_RISK] r (NOLOCK) 
inner join project p  (NOLOCK) on p.proj_id =  r.PROJECT_ID       
and P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@ProjIds,','))  
AND r.STATUS = 'Identified'  and r.ISACTIVE =1        
LEFT OUTER JOIN portfolio_project pp  (NOLOCK) on pp.proj_id =  r.PROJECT_ID            
LEFT OUTER JOIN PORTFOLIO PF  (NOLOCK) ON PF.ID = PP.PORTFOLIO_ID    
WHERE r.IDENTIFIED_DATE BETWEEN @fromDate AND GETDATE()
group by DATENAME(MM,r.IDENTIFIED_DATE)  
ORDER BY DATENAME(MM,r.IDENTIFIED_DATE)  
    
END   
  