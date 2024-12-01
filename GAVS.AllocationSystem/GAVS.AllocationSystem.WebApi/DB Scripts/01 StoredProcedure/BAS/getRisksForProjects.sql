USE BAS
GO
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getRisksForProjects' AND TYPE='P')
BEGIN
DROP PROCEDURE getRisksForProjects          
END
GO
  
CREATE PROCEDURE [dbo].[getRisksForProjects]        
@startDate Date,
@EndDate Date,
@PROJIDS VARCHAR(MAX)   
AS              
BEGIN              
  SELECT C.CUST_ID, CUST_NM, PORT.ID PORTFOLIO_ID, PORT.TITLE PORTFOLIO_NM, P.PROJ_NM, R.[ID]              
      ,[PROJECT_ID]              
      ,[RAG]              
      ,[DESCRIPTION]              
      ,[IMPACT]              
      ,[PROBABILITY_SCALE]              
      ,[IMPACT_SCALE]              
      ,[OWNER]              
      ,[AREA]              
      ,[IDENTIFIED_BY]              
      ,[IDENTIFIED_DATE]              
      ,[RISK_TREATMENT_STRATEGY]              
      ,[TARGET_DATE]              
      ,[ACTUAL_DATE]              
      ,[STATUS]              
      ,[ACTION_TAKEN]              
      ,R.[CREATED_BY]              
      ,R.[CREATED_DATE]              
      ,R.[UPDATED_BY]              
      ,R.[UPDATED_DATE]              
      ,R.[ISACTIVE]         
   , isnull(E.FRST_NM, [OWNER]) as OWNER_NAME         
   ,R.ACCEPT_TILL FROM PROJECT_RISK R   (NOLOCK)               
  INNER JOIN PROJECT P (NOLOCK) ON R.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,','))  and R.ISACTIVE = 1              
  INNER JOIN CUSTOMER C (NOLOCK) ON C.CUST_ID = P.CUST_ID              
  LEFT JOIN EMP_INFO e (NOLOCK)  on r.OWNER  =  convert(varchar,e.EMAIL_ID) or r.owner = convert(varchar, e.emp_id)       
  LEFT OUTER JOIN PORTFOLIO_PROJECT PP (NOLOCK) ON PP.PROJ_ID = P.PROJ_ID              
  LEFT OUTER JOIN PORTFOLIO PORT (NOLOCK) ON PORT.ID = PP.PORTFOLIO_ID
  WHERE R.IDENTIFIED_DATE BETWEEN @startDate AND @EndDate
  OR  R.CREATED_DATE BETWEEN @startDate AND @EndDate
  OR  R.ACTUAL_DATE BETWEEN @startDate AND @EndDate
  order by [IDENTIFIED_DATE] desc        
              
END   