
IF EXISTS(SELECT 1 FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME ='SDC 16 Service Level Metrics By Products')
BEGIN
	DELETE FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME ='SDC 16 Service Level Metrics By Products'
END
GO

IF EXISTS(SELECT 1 FROM REPORTS_SP_DETAILS WHERE SP_DISPLAY_NAME ='SDC 16 Service Level Metrics CAPA by Product')
BEGIN
	UPDATE REPORTS_SP_DETAILS SET SP_DISPLAY_NAME='SDC 16 Service Level Metrics By Products' WHERE SP_DISPLAY_NAME ='SDC 16 Service Level Metrics CAPA by Product'
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallProductWiseCAPAData' AND TYPE='P')
BEGIN
       DROP PROCEDURE getOverallProductWiseCAPAData
END
GO
  
CREATE PROCEDURE [dbo].[getOverallProductWiseCAPAData]                   
                      
@startDate varchar(20),                                                                      
@endDate varchar(20),                      
@productId int                      
                      
AS                      

BEGIN                      
                      
declare @quarterStartDate Datetime                                          
declare @quarterEndDate datetime                                          
                                      
set @quarterStartDate = (Select dbo.Fn_GetQuarterDates(@startDate,0));                                          
set @quarterEndDate = (Select dbo.Fn_GetQuarterDates(@startDate,1));                              
                      
;WITH CTE                    
AS                      
(                      
select P.TITLE as PORTFOLIO,PP.PRODUCT_TITLE as PRODUCT, K.KPI_NAME, SLT.SERVICE_LEVEL,                      
CONVERT(VARCHAR(20),KD.PERIOD,107) as PERIOD, KD.KPI_ACTUAL,                      
CASE WHEN isnull(KT.EXPECTED_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.EXPECTED_SERVICE_LEVEL END AS EXPECTED_SERVICE_LEVEL,                                                                                  
CASE WHEN isnull(KT.MINIMUM_SERVICE_LEVEL,0)=0 and K.KPI_NAME='SYSTEM UPTIME' then PT.SYSTEM_UPTIME ELSE KT.MINIMUM_SERVICE_LEVEL END AS MINIMUM_SERVICE_LEVEL,                                                                                      
KD.ISFLAG as NOT_APPLICABLE,KD.HIGHLIGHTS as REASON,KD.SLA_STATUS as EXPECTED_SERVICE_LEVEL_STATUS,KD.SECONDARY_SLA_STATUS as MINIMUM_SERVICE_LEVEL_STATUS ,                  
CAUSE.CAUSES,CAPA.CORRECTIVE_ACTION_PLAN ,                  
IIF((KD.SLA_STATUS = 'Not Met' OR KD.SECONDARY_SLA_STATUS = 'Not Met' ) ,    
(case when Stage.ISCOMPLETE=1 then 'Closed' else 'Open' END),null) [CAPA_STATUS],              
BaseMeasure_Numerator = STUFF(( select ',', isnull(NUMERATORDESCRIPTION,'') from base_measure b inner join kpi_base_measure_value m on b.id = m.base_measure_id where m.KPI_DETAILS_ID = kd.id order by m.BASE_MEASURE_ID FOR XML PATH('')), 1, 1, ''),              
Numerator_Values =  STUFF(( select ',', CONVERT(int, NUMERATOR) from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 0 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, '') ,              
BaseMeasure_Denominator =  STUFF(( select ',', isnull(DENOMINATORDESCRIPTION,'') from base_measure b inner join kpi_base_measure_value m on b.id = m.base_measure_id where m.KPI_DETAILS_ID = kd.id order by m.BASE_MEASURE_ID FOR XML PATH('')), 1,   1, ''),              
Denominator_Values = STUFF(( select ',', case when DENOMINATOR is null then '' else CONVERT(int, DENOMINATOR) end from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 0 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, ''),            
(select   sum(numerator) from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 0)   as KPI_NUMERATOR,                                      
(select   sum(DENOMINATOR)   from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 0)   as KPI_DENOMINATOR  ,        
(select   sum(numerator) from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 1)   as EXCLUSION_KPI_NUMERATOR,                                      
(select   sum(DENOMINATOR)   from kpi_base_measure_value where kpi_details_id = kd.id and isnull(is_Exclusion,0) = 1)   as EXCLUSION_KPI_DENOMINATOR  ,        
KD.EXCLUSION_KPI_ACTUAL, KD.EXCLUSION_COMMENT,       
EXCLUSION_NUMERATOR_VALUES =  STUFF(( select ',', CONVERT(int, NUMERATOR) from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 1 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, '') ,              
EXCLUSION_DENOMINATOR_VALUES = STUFF(( select ',', case when DENOMINATOR is null then '' else CONVERT(int, DENOMINATOR) end from KPI_BASE_MEASURE_VALUE where KPI_DETAILS_ID = kd.id and isnull(is_Exclusion,0) = 1 order by BASE_MEASURE_ID FOR XML PATH('')), 1, 1, ''),  
IS_SERVICE_COMMENCED, kd.id as KPI_DETAIL_ID,K.ID as KPI_ID, p.ID as PORTFOLIO_ID             
               
from KPI_DETAILS KD                      
join KPI K on KD.KPI_ID = K.ID                      
join KPI_TARGETS KT on KT.KPI_ID = K.ID                      
join KPI2PRODUCT_SERVICE_LEVEL_METRICS KPSL on K.ID = KPSL.KPI_ID                                                                    
join PRODUCT_SERVICE_LEVEL_METRICS PSL on PSL.ID = KPSL.PRODUCT_SERVICE_LEVEL_METRICS_ID                                                              
join PRODUCTS_SERVICE_LEVEL_TYPE SLT on PSL.SERVICE_LEVEL_TYPE_ID = SLT.ID                                                                                
join PORTFOLIO_PRODUCTS PP on K.PRODUCT_ID = PP.ID                      
join PORTFOLIO P on PP.PORTFOLIO_ID = P.ID                      
left join PRODUCT_TIER PT on PP.TIER_ID = PT.TIER_ID                  
left join AUDIT_FINDINGS_CAPA CAPA on CAPA.KPI_DETAILS_ID = KD.ID AND CAPA.ISACTIVE = 1 AND CAPA.ISROOTCAUSE = 1                   
left join AUDIT_MANAGEMENT_CAUSES CAUSE on CAUSE.ID = CAPA.CAUSE_ID and CAUSE.ISACTIVE = 1                  
LEFT join AUDIT_FINDING_STAGES_MAPPING Stage on Stage.KPI_DETAILS_ID = KD.ID and Stage.STAGE_ID=4 and Stage.ISACTIVE=1                 
               
where K.ISACTIVE = 1 and PP.ISACTIVE = 1           and isnull(kd.isdraft,0) = 0            
and (K.PRODUCT_ID = @productId or @productId =0 or @productId = -1) and                      
((K.FREQUENCY in ('Monthly','Release') and  KD.PERIOD  between CONVERT(datetime,@startDate ) and CONVERT(Datetime,@endDate ))                                      
 or K.FREQUENCY='Quarterly' and  KD.PERIOD  between   @quarterStartDate   and  @quarterEndDate ))                      
select * from CTE order by cte.KPI_NAME                      
END
GO

IF EXISTS (SELECT * FROM kpi where customer_id = '202100121' 
and product_id in(75,76,78,79,80,81,82) 
and id in(4994,4995,5017,5018,5039,5040,5065,5066,5088,5089,4930,4993,5016,5038,5064,5087) 
and KPI_NAME like '%Incident Management - Incident Response Time%')

update kpi set isactive = 0 ,updated_by = '105709' , updated_date = getDate() 
where customer_id = '202100121' 
and product_id in(75,76,78,79,80,81,82) 
and id in(4994,4995,5017,5018,5039,5040,5065,5066,5088,5089,4930,4993,5016,5038,5064,5087) 
and KPI_NAME like '%Incident Management - Incident Response Time%' and ISACTIVE =1

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOverallTaskDetails' AND TYPE='P')
BEGIN
       DROP PROCEDURE getOverallTaskDetails
END
GO

CREATE PROCEDURE [dbo].[getOverallTaskDetails]

@START_DATE DATETIME,
@END_DATE DATETIME  ,
@CUSTOMER_ID varchar(MAX) = '-1',
@PROJECT_ID varchar(MAX) = '-1',
@TASK_CATEGORY varchar(MAX) = '-1'

AS

BEGIN

DECLARE @skipInternalAuditId INT = (SELECT ID FROM PROJECT_CONFIGURATION_SETTING WHERE SETTING_NAME = 'SKIP INTERNAL AUDIT' AND ISACTIVE = 1);              
    
WITH AUDITS AS (    
    SELECT    
        T.CUST_ID, T.PROJ_ID, T.ID,T.DESCRIPTION, T.STATUS, T.DUE_DATE, TR.FREQUENCY,ACT.actual_audit_end_date  
    FROM    
        TASK T     
        LEFT JOIN AUDIT_SCHEDULE ASCH ON ASCH.TITLE = T.DESCRIPTION AND ASCH.CUST_ID = T.CUST_ID AND ASCH.PROJ_ID = T.PROJ_ID     
            AND ASCH.ISACTIVE = 1 AND (T.PARENT_TASK_ID = ASCH.TASK_ID OR T.ID = ASCH.TASK_ID)   
		LEFT JOIN TASK_RECURRENCE TR ON T.ID = TR.TASK_ID AND TR.ISACTIVE = 1  
        LEFT JOIN AUDIT_SCHEDULE_REF ASREF ON ASREF.AUDIT_SCHEDULE_ID = ASCH.ID AND ASREF.ISACTIVE = 1    
        LEFT JOIN AUDIT_CHECKLIST_EXECUTION_SUMMARY ACT ON T.ID = ACT.ASSESSMENT_ID AND ACT.ISACTIVE = 1    
    WHERE    
        T.STATUS NOT IN ('CANCELLED') AND T.ISACTIVE = 1 AND T.DUE_DATE IS NOT NULL 
		AND T.TASK_CATEGORY_ID in (select * from fn_getParameterTableOptionIds('AUDIT_CATEGORY'))     
        AND COALESCE(T.SCHEDULED_START_DATE, T.DUE_DATE) BETWEEN @START_DATE AND @END_DATE    
    GROUP BY    
        T.CUST_ID, T.PROJ_ID, T.ID,T.DESCRIPTION, T.STATUS, T.DUE_DATE, TR.FREQUENCY, ACT.actual_audit_end_date
)    
    
SELECT       
    C.CUST_NM, P.PROJ_NM,     
    ISO_STANDARDS = STUFF((    
        SELECT ', ' + PIS.STANDARD_NAME    
        FROM PROJECT_ISO_STANDARD PIS     
        INNER JOIN PROJECT_ISO_STANDARD_MAPPING PIM ON PIS.ID = PIM.ISO_STANDARD_ID    
        WHERE PIM.PROJECT_ID = P.PROJ_ID AND PIS.ISACTIVE = 1    
        FOR XML PATH('')), 1, 2, ''),    
    CERTIFICATION_SCOPES = STUFF((    
        SELECT ', ' + PIS.STANDARD_NAME + ' - ' + PCS.SCOPE_NAME    
        FROM PROJECT_CERTIFICATION_SCOPE PCS     
        INNER JOIN PROJECT_CERTIFICATION_SCOPE_MAPPING PCM ON PCS.ID = PCM.CERTIFICATION_SCOPE_ID    
        INNER JOIN PROJECT_ISO_STANDARD PIS ON PIS.ID = PCS.ISO_STANDARD_ID    
        WHERE PCM.PROJECT_ID = P.PROJ_ID AND PCS.ISACTIVE = 1    
        FOR XML PATH('')), 1, 2, ''),    
    CONVERT(VARCHAR, P.START_DATE, 107) AS START_DATE,    
    CONVERT(VARCHAR, P.END_DATE, 107) AS END_DATE,    
    HEADCOUNT = (SELECT COUNT(*) FROM PROJ_RESOURCE PR WHERE PR.PROJ_ID = P.PROJ_ID AND PR.BILL_FLG =1 AND PR.CURR_INDC ='Y' AND PR.END_DATE >= GETDATE()),    
    AUDIT_TITLE = A.DESCRIPTION,    
    AUDIT_STATUS = A.STATUS,    
    LAST_AUDITED_DATE = CONVERT(VARCHAR, A.actual_audit_end_date, 107),    
    FREQUENCY = A.FREQUENCY,    
    AUDITS_PLANNED = (SELECT COUNT(ID) FROM AUDITS WHERE STATUS NOT IN ('CANCELLED','COMPLETED') AND CUST_ID = C.CUST_ID AND PROJ_ID = P.PROJ_ID),    
    AUDITS_COMPLETED = (SELECT COUNT(ID) FROM AUDITS WHERE STATUS IN ('COMPLETED') AND CUST_ID = C.CUST_ID AND PROJ_ID = P.PROJ_ID),    
    P.PROJ_ID, C.CUST_ID    
FROM     
    PROJECT P     
INNER JOIN     
    CUSTOMER C ON P.CUST_ID = C.CUST_ID      
LEFT JOIN     
    AUDITS A ON A.PROJ_ID = P.PROJ_ID AND A.ID = (SELECT TOP 1 ID FROM AUDITS WHERE PROJ_ID = P.PROJ_ID ORDER BY ID DESC)    
LEFT JOIN     
    TASK T ON T.ID = A.ID AND T.ISACTIVE = 1 AND ISNULL(T.STATUS,'')!='CANCELLED'     
  
WHERE     
 P.PROJ_ID NOT IN (SELECT PROJ_ID FROM PROJECT_CONFIGURATION_DATA WHERE ISACTIVE = 1 AND IS_APPROVED = 1 AND CONFIGURATION_SETTING_ID = @skipInternalAuditId
 AND END_DATE IS NULL OR END_DATE > GETDATE())    
    AND COALESCE(T.SCHEDULED_START_DATE, T.DUE_DATE) BETWEEN @START_DATE AND @END_DATE    
    AND ((@CUSTOMER_ID = '-1' AND @PROJECT_ID = '-1')    
        OR (@CUSTOMER_ID <> '-1' AND @PROJECT_ID = '-1' AND C.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER_ID, ',')))    
        OR (@CUSTOMER_ID <> '-1' AND @PROJECT_ID <> '-1' AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJECT_ID, ','))))    
    AND (@TASK_CATEGORY = '-1' OR T.TASK_CATEGORY_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@TASK_CATEGORY, ',')))    
GROUP BY    
    C.CUST_NM, P.PROJ_NM, P.START_DATE, P.END_DATE, P.PROJ_ID, C.CUST_ID, A.DESCRIPTION, A.STATUS, A.ID, A.DUE_DATE, A.FREQUENCY  ,A.actual_audit_end_date
ORDER BY     
    P.PROJ_NM, C.CUST_NM    
    
END    
GO


IF NOT EXISTS(Select 1 from sys.tables where name ='RISK_ISO_STANDARD_MAPPING' AND type='U')
BEGIN

CREATE TABLE RISK_ISO_STANDARD_MAPPING (
    ID int IDENTITY(1,1) NOT NULL,
    RISK_ID INT NOT NULL,
    ISO_STANDARD_ID INT NOT NULL,    
    CREATED_BY VARCHAR(20) NOT NULL,
    CREATED_DATE DATETIME NOT NULL,
    UPDATED_BY VARCHAR(20) NOT NULL,
    UPDATED_DATE DATETIME NOT NULL,
    ISACTIVE BIT NOT NULL	
);



END
GO






