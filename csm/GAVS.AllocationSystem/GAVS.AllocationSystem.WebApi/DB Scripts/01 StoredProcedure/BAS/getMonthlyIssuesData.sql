USE BAS
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getMonthlyIssuesData' AND TYPE='P')
BEGIN
DROP PROCEDURE getMonthlyIssuesData          
END
GO
  
CREATE procedure [dbo].[getMonthlyIssuesData]          
@ProjIds VARCHAR(MAX)   
AS          
BEGIN          
DECLARE @fromDate date= Dateadd(Month, Datediff(Month, 0, DATEADD(m, -6, current_timestamp)), 0); 
SELECT DATENAME(MM,I.ISSUE_RESOLVED_DATE) AS MONTH_NAME,COUNT(I.STATUS) AS STATUS                
FROM [PROJECT_ISSUE] I   (NOLOCK)         
inner join project p (NOLOCK) on p.proj_id =  I.PROJECT_ID       
and P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@ProjIds,','))  
AND I.STATUS = 'Identified'  and I.ISACTIVE =1        
LEFT OUTER JOIN portfolio_project pp  (NOLOCK) on pp.proj_id =  I.PROJECT_ID            
LEFT OUTER JOIN PORTFOLIO PF  (NOLOCK) ON PF.ID = PP.PORTFOLIO_ID   
WHERE ISSUE_RESOLVED_DATE BETWEEN @fromDate AND GETDATE()
group by DATENAME(MM,I.ISSUE_RESOLVED_DATE)  
ORDER BY DATENAME(MM,I.ISSUE_RESOLVED_DATE)  
    
END   
  






