
use BAS
GO

IF not exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health Index Summary')
BEGIN
	INSERT INTO bas..REPORTS_SP_DETAILS VALUES ('reports_getMonthlyOverallProcessCompliance', 'Monthly Process Health Index Summary', 'BAS');
END

GO

IF not exists(SELECT 1 FROM bas..REPORTS_PARAMS where [REPORT_SP_ID] = (SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health Index Summary'))
BEGIN

 DECLARE @ReportID INT SET @ReportID=(SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health Index Summary')

	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'StartDate', 'DATE', '2021-07-01');
     INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'EndDate', 'DATE', '2021-07-23');
	 
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getMonthlyOverallProcessCompliance' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyOverallProcessCompliance]
END
GO

CREATE PROCEDURE                              
  dbo.reports_getMonthlyOverallProcessCompliance                      
  @startDate Datetime,                    
  @endDate Datetime    
  AS                              
  BEGIN    

 select FORMAT(t.DUE_DATE,'MMMM - yyyy') AS [Auidt Period],--Year(t.DUE_DATE) as [Year],month(t.DUE_DATE) as [Month],
 count(distinct c.CUST_ID) as [No of Accounts],
 count(distinct p.PROJ_ID) as [No of Projects],
 sum(dtls.MAX_SCORE) as [Max Score], sum(dtls.UPDATED_SCORE) as [Achieved Score],
 cast(sum(dtls.UPDATED_SCORE) / nullif(sum(dtls.MAX_SCORE),0) * 100 as decimal(5,2))  as [Health Index ( % )]
 from CSP..TASK t                     
                    
  inner join bas..CUSTOMER c on t.CUST_ID = c.CUST_ID                       
  inner join bas..PROJECT p on t.PROJ_ID = p.PROJ_ID  
  inner join CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1 
  inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and dtls.ISACTIVE=1
   
 where t.DUE_DATE between @startDate and @endDate
 group by FORMAT(t.DUE_DATE,'yyyy - MM'),FORMAT(t.DUE_DATE,'MMMM - yyyy')
 order by FORMAT(t.DUE_DATE,'yyyy - MM')desc
 End
 go


IF not exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Quarterly Process Health Index Summary')
BEGIN
	INSERT INTO bas..REPORTS_SP_DETAILS VALUES ('reports_getQuarterlyProcessHealthIndexSummary', 'Quarterly Process Health Index Summary', 'BAS');
END

GO


IF not exists(SELECT 1 FROM bas..REPORTS_PARAMS where [REPORT_SP_ID] = (SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Quarterly Process Health Index Summary'))
BEGIN

 DECLARE @ReportID INT SET @ReportID=(SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Quarterly Process Health Index Summary')

	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'StartDate', 'DATE', '2021-01-01');
     INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'EndDate', 'DATE', '2021-07-23');	 
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getQuarterlyProcessHealthIndexSummary' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQuarterlyProcessHealthIndexSummary]
END
GO

CREATE PROCEDURE                              
  dbo.reports_getQuarterlyProcessHealthIndexSummary                    
  @startDate Datetime,                    
  @endDate Datetime    
  AS                              
  BEGIN    

 select Year(t.DUE_DATE) AS [Year], 
 case when Datepart(QUARTER,t.DUE_DATE)=1 then 'Q1'
 when Datepart(QUARTER,t.DUE_DATE)=2 then 'Q2'
 when Datepart(QUARTER,t.DUE_DATE)=3 then 'Q3'
 when Datepart(QUARTER,t.DUE_DATE)=4 then 'Q4' else '' End as [Audit Period] ,
 count(distinct c.CUST_ID) as [No of Accounts],
 count(distinct p.PROJ_ID) as [No of Projects],
 sum(dtls.MAX_SCORE) as [Max Score], sum(dtls.UPDATED_SCORE) as [Achieved Score],
 cast(sum(dtls.UPDATED_SCORE) / nullif(sum(dtls.MAX_SCORE),0) * 100 as decimal(5,2))  as [Health Index ( % )]
 from CSP..TASK t                     
                    
  inner join bas..CUSTOMER c on t.CUST_ID = c.CUST_ID                       
  inner join bas..PROJECT p on t.PROJ_ID = p.PROJ_ID  
  inner join CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1 
  inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and dtls.ISACTIVE=1
   
 where t.DUE_DATE between @startDate and @endDate
 group by Year(t.DUE_DATE),Datepart(QUARTER,t.DUE_DATE)
 order by Year(t.DUE_DATE) desc,Datepart(QUARTER,t.DUE_DATE) desc

 End
 go


 IF not exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health Index by Customer & Project')
BEGIN
	INSERT INTO bas..REPORTS_SP_DETAILS VALUES ('reports_getMonthlyProcessHealthIndexByCustomerandProject', 'Monthly Process Health Index By Customer & Project', 'BAS');
END

GO

IF not exists(SELECT 1 FROM bas..REPORTS_PARAMS where [REPORT_SP_ID] = (SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health Index By Customer & Project'))
BEGIN

 DECLARE @ReportID INT SET @ReportID=(SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Process Health Index By Customer & Project')

	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'StartDate', 'DATE', '2021-07-01');
     INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'EndDate', 'DATE', '2021-07-27');
	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'CustomerID', 'CUSTOMERID', '201100010');
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getMonthlyProcessHealthIndexByCustomerandProject' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getMonthlyProcessHealthIndexByCustomerandProject]
END
GO

CREATE PROCEDURE                                
  dbo.reports_getMonthlyProcessHealthIndexByCustomerandProject                       
  @startDate Datetime,                      
  @endDate Datetime,                    
  @customerid int=0                    
  AS                                
  BEGIN            
            
 select FORMAT(t.DUE_DATE,'MMMM - yyyy') AS [Auidt Period],
 c.CUST_NM,p.PROJ_NM,
 sum(dtls.MAX_SCORE) as [Max Score], sum(dtls.UPDATED_SCORE) as [Achieved Score],
 cast(sum(dtls.UPDATED_SCORE) / nullif(sum(dtls.MAX_SCORE),0) * 100 as decimal(5,2))  as [Health Index ( % )]
 from CSP..TASK t                     
                    
  inner join bas..CUSTOMER c on t.CUST_ID = c.CUST_ID                       
  inner join bas..PROJECT p on t.PROJ_ID = p.PROJ_ID  
  inner join CSP..AUDIT_CHECKLIST_EXECUTION_SUMMARY  summ on t.ID=summ.ASSESSMENT_ID and summ.ISACTIVE=1 
  inner join csp..AUDIT_CHECKLIST_EXECUTION_DETAILS dtls on summ.ASSESSMENT_ID=dtls.ASSESSMENT_ID and dtls.ISACTIVE=1
   
 where t.DUE_DATE between @startDate and @endDate and (@customerid=0 or  c.CUst_id = @customerid)  
 group by FORMAT(t.DUE_DATE,'yyyy - MM'),FORMAT(t.DUE_DATE,'MMMM - yyyy'),c.CUST_NM,p.PROJ_NM
 order by FORMAT(t.DUE_DATE,'yyyy - MM')desc 
  
 END   
 GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GetEmpIdsForCustomerAccount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[GetEmpIdsForCustomerAccount]
END
GO

CREATE  PROCEDURE        
dbo.GetEmpIdsForCustomerAccount       
@custId varchar(max)        
AS       
BEGIN       
        
SELECT EI.EMP_ID, EI.FRST_NM 
FROM bas..PROJ_RESOURCE PR         
INNER JOIN bas..PROJECT P ON PR.PROJ_ID = P.PROJ_ID AND PR.END_DATE >= GETDATE() AND PR.CURR_INDC = 'Y' AND PR.ID IS NOT NULL --AND PR.BILL_FLG = 1  
INNER JOIN bas..EMP_INFO EI ON PR.EMP_ID = EI.EMP_ID AND EI.DOR IS NULL        
WHERE P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@custId,','))       
ORDER BY EI.FRST_NM      
        
END    
go