USE BAS
GO

--#13001627 — Pending KPI Update in CSM Portal
IF NOT EXISTS (SELECT 1 from dbo.REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='KPI Actuals Report')
BEGIN

INSERT INTO dbo.REPORTS_SP_DETAILS(SP_NAME,SP_DISPLAY_NAME,DB_NAME)  VALUES
('dbo.getKPIActualsReport','KPI Actuals Report'	,'BAS') 
END

GO
 

--#13001627 — Pending KPI Update in CSM Portal
DECLARE @spID int;
SELECT @spID=ID from dbo.REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME='KPI Actuals Report';

IF NOT EXISTS (SELECT 1 FROM dbo.REPORTS_PARAMS WHERE  PARAM_NAME='CustomerID' AND REPORT_SP_ID=@spID)
BEGIN

INSERT INTO dbo.REPORTS_PARAMS(REPORT_SP_ID,PARAM_NAME,PARAM_TYPE,PARAM_VALUE)  VALUES
(@spID,'CustomerID','CUSTOMERID','0') 
END 

IF NOT EXISTS (SELECT 1 FROM dbo.REPORTS_PARAMS WHERE  PARAM_NAME='StartDate' AND REPORT_SP_ID=@spID)
BEGIN

INSERT INTO dbo.REPORTS_PARAMS(REPORT_SP_ID,PARAM_NAME,PARAM_TYPE,PARAM_VALUE)  VALUES
(@spID,'StartDate','DATE','2022-07-01') 
END



IF NOT EXISTS (SELECT 1 FROM dbo.REPORTS_PARAMS WHERE  PARAM_NAME='EndDate' AND REPORT_SP_ID=@spID)
BEGIN

INSERT INTO dbo.REPORTS_PARAMS(REPORT_SP_ID,PARAM_NAME,PARAM_TYPE,PARAM_VALUE)  VALUES
(@spID,'EndDate','DATE','2022-07-31') 
END 

GO
 
 

 --#13001627 — Pending KPI Update in CSM Portal
/****** Object:  StoredProcedure [dbo].[getKPIActualsReport]    Script Date: 19-07-2022 15:02:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getKPIActualsReport' AND TYPE='P')
BEGIN
 DROP PROCEDURE [dbo].getKPIActualsReport
END
GO

/*
---------------------------------------------------
-- Author        : Indhu   
-- Date      : 19-07-2022    
-- Purpose       : get KPI Actuals Report
--------------------------------------------------- 
-- ver     user             date             change  
-- 1.0    Indhu          19-07-2022       initial version
#########################################################################  */
CREATE procedure [dbo].getKPIActualsReport     
@customerID	varchar(20),
@startDate	DATE,
@endDate	DATE
AS        
BEGIN        

SET @endDate=DATEADD(d,1,@endDate);

select  c.CUST_NM AS [Customer Name],p.PROJ_NM  AS [Project Name],K.KPI_NAME AS [KPI Name],convert(varchar,KD.PERIOD,23) AS Period,KD.KPI_ACTUAL [KPI Actual],
Case when KD.ISFLAG = 1 then 'Yes' else 'No' END AS [IS Not Applicable],KD.HIGHLIGHTS AS [Reason For Not Applicable],
CU.frst_NM AS [Created By], UU.frst_NM AS [Updated By],
convert(varchar,KD.CREATED_DATE,20) as [Created Date],
convert(varchar,KD.UPDATED_DATE,20) as [Updated Date],
c.CUST_ID AS [Customer ID],p.PROJ_ID AS [Project ID]
from
CSP..KPI_DETAILS KD (NOLOCK)
INNER Join
CSP..KPI  K  (NOLOCK) on K.ID = KD.KPI_ID and K.ISACTIVE =1 and KD.ISACTIVE = 1
INNER join
BAS..project p  (NOLOCK) on P.PROJ_ID = K.PROJECT_ID
INNER join
BAS..Customer c  (NOLOCK) on C.cust_id = P.CUST_ID
LEFT JOIN BAS..EMP_INFO CU
ON CU.EMP_ID = KD.CREATED_BY
LEFT JOIN BAS..EMP_INFO UU
ON UU.EMP_ID = KD.UPDATED_BY
where (@customerID=0 OR c.CUST_ID=@customerID) AND  -- in (201100036,202100071) and 
Kd.PERIOD BETWEEN @startDate AND @endDate order by Kd.UPDATED_DATE desc

END

GO 
