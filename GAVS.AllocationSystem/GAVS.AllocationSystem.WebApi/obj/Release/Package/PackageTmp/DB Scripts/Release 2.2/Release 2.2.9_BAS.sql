USE BAS
GO

IF not exists(SELECT 1 FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Survey Initiated Details')
BEGIN
	INSERT INTO bas..REPORTS_SP_DETAILS VALUES ('reports_getCSSMonthlyInitatedDetails', 'Monthly Survey Initiated Details', 'BAS');
END

GO

IF not exists(SELECT 1 FROM bas..REPORTS_PARAMS where [REPORT_SP_ID] = (SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Survey Initiated Details'))
BEGIN

 DECLARE @ReportID INT SET @ReportID=(SELECT ID FROM bas..REPORTS_SP_DETAILS where [SP_DISPLAY_NAME] ='Monthly Survey Initiated Details')

	 INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'StartDate', 'DATE', '2021-08-01');
     INSERT INTO bas..REPORTS_PARAMS VALUES (@ReportID, 'EndDate', 'DATE', '2021-11-09');
	 
END

GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getCSSMonthlyInitatedDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getCSSMonthlyInitatedDetails]
END
GO


CREATE PROCEDURE [dbo].[reports_getCSSMonthlyInitatedDetails]
@STARTDATE DATETIME,        
@ENDDATE DATETIME         
AS        
BEGIN       


    WITH CSM AS (                                  
    SELECT P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                              
    INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_DM_EMP_ID) ,                       
              
    AM AS (                                  
    SELECT distinct P.CUST_ID,E.FRST_NM  CSM_NAME FROM BAS.DBO.project p                              
    INNER JOIN BAS.DBO.EMP_INFO E ON E.EMP_ID = P.PROJ_AM_EMP_ID                        
            )              
                              
    SELECT  c.cust_nm [Customer Name], b.DISPLAY_NAME [Respondent Name],  B.EMAIL_ID  [Email_Id],                            
    
    c.Cust_ID [Customer_ID],   b.STATUS,           
    STUFF((select distinct ',' + CSM.CSM_NAME from CSM CSM              
    join CSP..CSS_BATCH_CUSTOMER_MONTHLY bcc on CSm.CUST_ID = bcc.CUST_ID              
    for xml path ('')),1,1,'')as [Customer Success Manager],                
    STUFF((select distinct ',' + AM.CSM_NAME from AM AM              
    join CSP..CSS_BATCH_CUSTOMER_MONTHLY bcc on AM.CUST_ID = bcc.CUST_ID              
    for xml path ('')),1,1,'')as[ACCOUNT MANAGER]  ,DATENAME(MONTH,DATEADD(MONTH, bt.MONTH,-1))[Month],bt.YEAR          
               
    FROM [CSP].[dbo].[CSS_BATCH_CUSTOMER_MONTHLY] b                              
    INNER JOIN CSP.DBO.CSS_BATCH_MONTHLY bt on   bt.id = b.BATCH_MONTHLY_ID  
    inner join bas.dbo.customer c on c.cust_id = b.cust_id 
    WHERE    
    (( bt.start_date between @STARTDATE and @ENDDATE   ) OR ( bt.END_DATE between @STARTDATE and @ENDDATE))                        
    order by bt.id,[Customer Name]
   END 
   GO