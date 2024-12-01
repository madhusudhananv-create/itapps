
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getKPIComplainaceStatus' AND TYPE='P')
BEGIN
       DROP PROCEDURE reports_getKPIComplainaceStatus
END
GO

 CREATE PROCEDURE [dbo].[reports_getKPIComplainaceStatus]                  
  @CustomerID varchar(50) = '0',       
  @date Datetime  ,           
  @productId int = -1              
  as                
  BEGIN    
  
  DECLARE @MonthDate DATETIME;  
SELECT @monthdate = CAST(DATEFROMPARTS(YEAR(@date), MONTH(@date), 1) AS DATE);  
  
DECLARE @quarterStartDate DATETIME;  
DECLARE @quarterEndDate DATETIME;  
SET @quarterStartDate = (SELECT dbo.Fn_GetQuarterDates(@date, 0));  
SET @quarterEndDate = (SELECT dbo.Fn_GetQuarterDates(@date, 1));  
  
SELECT  
 c.CUST_NM as customer_name,  
    product_title,  
    KPI_Count = (SELECT COUNT(*) FROM kpi WHERE PRODUCT_ID = pp.ID AND kpi.isactive = 1),  
    Entered_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                    WHERE kpi.product_id = pp.id   
                        AND kpi.isactive = 1   
                        AND KPI_DETAILS.ISACTIVE = 1   
                        AND ISNULL(isdraft, 0) = 0   
                        AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                            OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    NA_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                WHERE kpi.product_id = pp.id   
                    AND KPI_DETAILS.ISACTIVE = 1   
                    AND kpi.isactive = 1   
                    AND ISNULL(ISFLAG, 0) = 1   
                    AND ISNULL(isdraft, 0) = 0   
                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    Met_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                WHERE kpi.product_id = pp.id   
                    AND KPI_DETAILS.ISACTIVE = 1   
                    AND kpi.isactive = 1   
                    AND SLA_STATUS = 'Met'   
                    AND ISNULL(ISFLAG, 0) = 0   
                    AND ISNULL(isdraft, 0) = 0   
                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    NotMet_KPIs = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                    WHERE kpi.product_id = pp.id   
                        AND KPI_DETAILS.ISACTIVE = 1   
                        AND kpi.isactive = 1   
                        AND SLA_STATUS = 'Not met'   
                        AND ISNULL(isdraft, 0) = 0   
                        AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                            OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    No_of_exclusions_applied = (SELECT COUNT(*) FROM kpi_details INNER JOIN KPI ON kpi.id = Kpi_Id   
                                INNER JOIN KPI_BASE_MEASURE_VALUE KPI_BMV ON KPI_BMV.KPI_DETAILS_ID = kpi_details.ID   
                                WHERE kpi.product_id = pp.id   
                                    AND KPI_DETAILS.ISACTIVE = 1   
                                    AND kpi.isactive = 1   
                                    AND KPI_BMV.IS_EXCLUSION = 1   
                                    AND SLA_STATUS = 'Not met'   
                                    AND ISNULL(isdraft, 0) = 0   
                                    AND ((kpi.FREQUENCY IN ('Monthly', 'Release') AND CAST(period AS DATE) = @monthdate)   
                                        OR (kpi.FREQUENCY = 'Quarterly' AND CAST(period AS DATE) BETWEEN @quarterStartDate AND @quarterEndDate))),  
    Manager = (SELECT TOP 1 frst_nm   
                FROM emp_info   
                WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 1 AND ISACTIVE = 1)),  
    Lead = (SELECT TOP 1 frst_nm   
            FROM emp_info   
            WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 2 AND ISACTIVE = 1)),  
    CSM = (SELECT TOP 1 frst_nm   
            FROM emp_info   
            WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 3 AND ISACTIVE = 1)),  
    QualitySpoc = (SELECT TOP 1 frst_nm   
                    FROM emp_info   
                    WHERE emp_id = (SELECT TOP 1 EMP_ID FROM PRODUCT_RESPONSIBLE WHERE PRODUCT_ID = pp.ID AND Management_type = 4 AND ISACTIVE = 1))  
FROM   
    PORTFOLIO_PRODUCTS pp  
 inner join CUSTOMER c on c.CUST_ID = pp.CUST_ID  
WHERE   
    PP.ISACTIVE = 1   
    AND (@productId = -1 OR pp.ID = @productId)   
    AND (@CustomerID = '0' OR PP.CUST_ID = @CustomerID)   
ORDER BY   
    7,   
    1;  
  
END
GO
