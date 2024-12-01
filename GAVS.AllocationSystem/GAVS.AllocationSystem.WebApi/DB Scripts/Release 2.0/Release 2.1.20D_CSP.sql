IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'STATUS'
          AND Object_ID = Object_ID('Failure_Mode_Master'))
	BEGIN
		ALTER TABLE Failure_Mode_Master
        ADD STATUS VARCHAR(200)
	END

	GO


IF NOT EXISTS(Select 1 from sys.tables where name ='PROJECT_FAILURES_MAPPING' AND type='U')
BEGIN

CREATE TABLE PROJECT_FAILURES_MAPPING
(
	[ID] [int] IDENTITY(1,1) NOT NULL,
	FAILURE_MODE_ID INT NOT NULL,
	PROJECT_ID VARCHAR(500) NOT NULL,
	[RF_OCCURRENCE_ID] [int] NULL,
	[RF_SEVERITY_ID] [int] NULL,
	[RF_DETECTION_ID] [int] NULL,
	[RPN] [decimal](10, 2) NULL,
	[CURRENT_DETECTION_CONTROL] [nvarchar](max) NULL,
	[CURRENT_PREVENTIVE_CONTROL] [nvarchar](max) NULL,
	[RECOMMENDED_DETECTIVE_CONTROL] [nvarchar](max) NULL,
	[RECOMMENDED_PREVENTIVE_CONTROL] [nvarchar](max) NULL,
	[RESPONSIBLE] [int] NULL,
	POTENTIAL_CAUSE_FACTOR VARCHAR(500),
	POTENTIAL_EFFECT_OF_FAILURE VARCHAR(500),
	POTENTIAL_CAUSE VARCHAR(500),
	CREATED_DATE DATETIME NULL,
	CREATED_BY VARCHAR(100) NULL,
	UPDATED_DATE DATETIME NULL,
	UPDATED_BY VARCHAR(100) NULL,
	ISACTIVE BIT,
	ISAPPLICABLE BIT,
	ISAPPROVED BIT
)
END

GO

IF EXISTS(Select 1 from sys.procedures where name ='getProjectSpecificFailures' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectSpecificFailures]
END
GO

CREATE PROCEDURE
getProjectSpecificFailures
@ProjectId varchar(500),
@ServiceAreaId int,
@ProcessId int,
@ServiceLevel int,
@Taskid int
as
begin

SELECT  repo.*, mapp.id [MAPPING_ID], mapp.FAILURE_MODE_ID, mapp.PROJECT_ID, mapp.RF_OCCURRENCE_ID, mapp.RF_SEVERITY_ID,
mapp.RF_DETECTION_ID, mapp.RPN, mapp.CURRENT_DETECTION_CONTROL, mapp.CURRENT_PREVENTIVE_CONTROL, mapp.RECOMMENDED_DETECTIVE_CONTROL,
mapp.RECOMMENDED_PREVENTIVE_CONTROL, mapp.RESPONSIBLE,
(SELECT TOP 1 RATING_DEFINITION FROM FMEA_RATING_FACTORS WHERE RATING_FACTORS_CATEGORY = 'SEVERITY' AND RATING_FACTORS_RATING = MAPP.RF_SEVERITY_ID) [SEVERITY_RATING],
(SELECT TOP 1 RATING_DEFINITION FROM FMEA_RATING_FACTORS WHERE RATING_FACTORS_CATEGORY = 'OCCURRENCE' AND RATING_FACTORS_RATING = MAPP.RF_OCCURRENCE_ID) [OCCURENCE_RATING],
(SELECT TOP 1 RATING_DEFINITION FROM FMEA_RATING_FACTORS WHERE RATING_FACTORS_CATEGORY = 'DETECTION' AND RATING_FACTORS_RATING = MAPP.RF_DETECTION_ID) [DETECTION_RATING],
MAPP.ISAPPLICABLE, MAPP.ISAPPROVED, MAPP.ISAPPROVED AS 'APPROVED'
				  FROM Failure_Mode_Master repo
LEFT JOIN PROJECT_FAILURES_MAPPING mapp on repo.ID = mapp.failure_mode_id and mapp.project_id = @ProjectId and mapp.isactive = 1
WHERE REPO.ISACTIVE = 1 AND (@ServiceAreaId = 0 or repo.SERVICE_AREA_ID = @ServiceAreaId) 
and (@ProcessId = 0 or repo.PROCESS_ID = @ProcessId) and (@ServiceLevel = 0 or repo.SERVICE_LEVEL_IDENTIFIER_ID = @ServiceLevel)
and (@Taskid = 0 or repo.TASK_ID = @Taskid)  and repo.STATUS = 'Approved'

end

GO

IF not exists(SELECT 1 FROM FMEA_RATING_FACTORS where RATING_FACTORS_CATEGORY ='SEVERITY')
BEGIN

INSERT INTO FMEA_RATING_FACTORS VALUES 
('Customer will not notice the adverse effect or it is insignificant or No effect', 1, 'SEVERITY', 'None'),
('Customer will probably experience slight annoyance or System/Service operable with minimal interference', 2, 'SEVERITY', 'Very Minor'),
('Customer will experience annoyance or system/Service operable with minimal interference', 3, 'SEVERITY', 'Minor'),
('Customer dissatisfaction due to reduced performance or system/Service operable with significant degradation of performance', 4, 'SEVERITY', 'Very Low'),
('Customer is made uncomfortable or their productivity is reduced by the continued degradation of the effect or system/Service inoperable without business impact', 5, 'SEVERITY', 'Low'),
('Warranty repair or significant manufacturing or assembly complaint or system/Service inoperable with minimal business imapct', 6, 'SEVERITY', 'Moderate'),
('High degree of customer dissatisfaction due to component failure without complete loss of function.  Productivity impacted by high scrap or rework levels or  system/Service inoperable with some  business critical functions impacted', 7, 'SEVERITY', 'High'),
('Very high degree of dissatisfaction due to the loss of function without a negative impact on safety or governmental regulations or  system/Service inoperable with multiple  business critical functions impacted', 8, 'SEVERITY', 'Very High'),
('Customer endangered due to the adverse effect on safe system performance with warning before failure or violation of governmental regulations or or system/Service inoperable with all business critical functions impacted', 9, 'SEVERITY', 'Severe'),
('Customer endangered due to the adverse effect on safe system performance without warning before failure or violation of governmental regulations or system/Service inoperable with all business operations halted', 10, 'SEVERITY', 'Critical')

END

IF not exists(SELECT 1 FROM FMEA_RATING_FACTORS where RATING_FACTORS_CATEGORY ='OCCURRENCE')
BEGIN

INSERT INTO FMEA_RATING_FACTORS VALUES
('Likelihood of occurrence is remote', 1, 'OCCURRENCE', 'Remote - Failure is unlikely'),
('Low failure rate with supporting documentation', 2, 'OCCURRENCE', 'Remote - Failure is unlikely'),
('Low failure rate without supporting documentation', 3, 'OCCURRENCE', 'Low- Relatively few failures'),
('Occasional failures', 4, 'OCCURRENCE', 'Moderate - Occasional failures'),
('Relatively moderate failure rate with supporting documentation', 5, 'OCCURRENCE', 'Moderate - Occasional failures'),
('Moderate failure rate without supporting documentation', 6, 'OCCURRENCE', 'Moderate - Occasional failures'),
('Relatively high failure rate with supporting documentation', 7, 'OCCURRENCE', 'High :Repeated failures'),
('High failure rate without supporting documentation', 8, 'OCCURRENCE', 'High :Repeated failures'),
('Failure is almost certain based on warranty data or significant Design Verification testing', 
9, 'OCCURRENCE', 'Very High : Failure is almost inevitable'),
('Assured of failure based on warranty data or significant Design Verification* testing', 10, 'OCCURRENCE', 'Very High : Failure is almost inevitable')
END

GO

IF not exists(SELECT 1 FROM FMEA_RATING_FACTORS where RATING_FACTORS_CATEGORY ='DETECTION')
BEGIN

INSERT INTO FMEA_RATING_FACTORS VALUES
('Sure that the potential failure will be found or prevented before reaching the next customer. Proactive detection with automated self healing',
1, 'DETECTION', 'Before failure occurs'),
('Almost certain that the potential failure will be found or prevented before reaching the next customer. Proactive detection with specific warning prior to failure',
2, 'DETECTION', 'Before failure occurs'),
('Low likelihood that the potential failure will reach the next customer undetected',
3, 'DETECTION', 'Before failure occurs'),
('Controls may detect or prevent the potential failure from reaching the next customer. Automated detection that a failure has occurred with automated or manual alerting',
4, 'DETECTION', 'During a failure'),
('Moderate likelihood that the potential failure will reach the next customer',
5, 'DETECTION', 'During a failure'),
('Controls are unlikely to detect or prevent the potential failure from reaching the next customer',
6, 'DETECTION', 'During a failure'),
('Poor likelihood that the potential failure will be detected or prevented before reaching the next customer. After a Failure is discovered internally or is reported by the customer',
7, 'DETECTION', 'After a failure'),
('Very poor likelihood that the potential failure will be detected or prevented before reaching the next customer',
8, 'DETECTION', 'After a failure'),
('Current controls probably will not even detect the potential failure',
9, 'DETECTION', 'After a failure'),
('Absolute certainty that the current controls will not detect the potential failure. No known detection capability',
10, 'DETECTION', 'Cannot detect')
END
GO

IF not exists(select 1 from [CSP].[dbo].[APP_CONTROLS] where RESOURCE_ID=54) BEGIN 
     INSERT INTO [CSP].[dbo].[APP_CONTROLS] ([RESOURCE_ID],[RESOURCE_TYPE],[RESOURCE_NAME],[COMMENTS],[CREATED_BY],[CREATED_DATE],[UPDATED_BY],[UPDATED_DATE],[ISACTIVE]) VALUES(54, 'Control', 'Dashboard > FMEA Project Setup', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO


     IF not exists(select 1 from [CSP].[dbo].[APP_CONTROL_FEATURES] where RESOURCE_ID=54 and FEATURE='VIEW') 
     BEGIN
     insert into csp.dbo.APP_CONTROL_FEATURES values (54,'VIEW', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO

 

     IF not exists(select 1 from [CSP].[dbo].[APP_ACCESS_CONTROLS] where RESOURCE_ID=54) 
     BEGIN
     insert into csp.dbo.APP_ACCESS_CONTROLS values 
     (54, 1, 1, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 2, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 3, '',null,'', 1,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 4, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 5, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 6, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 7, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 8, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 9, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 10, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (54, 1, 11, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1)

     END 
     GO

     IF not exists(select 1 from [CSP].[dbo].[APP_CONTROLS] where RESOURCE_ID=55) BEGIN 
     INSERT INTO [CSP].[dbo].[APP_CONTROLS] ([RESOURCE_ID],[RESOURCE_TYPE],[RESOURCE_NAME],[COMMENTS],[CREATED_BY],[CREATED_DATE],[UPDATED_BY],[UPDATED_DATE],[ISACTIVE]) VALUES(55, 'Control', 'FMEA Project Setup > Applicable', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO

     IF not exists(select 1 from [CSP].[dbo].[APP_CONTROL_FEATURES] where RESOURCE_ID=55 and FEATURE='VIEW') 
     BEGIN
     insert into csp.dbo.APP_CONTROL_FEATURES values (55,'VIEW', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO

     IF not exists(select 1 from [CSP].[dbo].[APP_ACCESS_CONTROLS] where RESOURCE_ID=55) 
     BEGIN
     insert into csp.dbo.APP_ACCESS_CONTROLS values 
     (55, 1, 1, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 2, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 3, '',null,'', 1,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 4, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 5, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 6, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 7, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 8, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 9, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 10, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (55, 1, 11, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1)
     END 
     GO

     IF not exists(select 1 from [CSP].[dbo].[APP_CONTROLS] where RESOURCE_ID=56) BEGIN 
     INSERT INTO [CSP].[dbo].[APP_CONTROLS] ([RESOURCE_ID],[RESOURCE_TYPE],[RESOURCE_NAME],[COMMENTS],[CREATED_BY],[CREATED_DATE],[UPDATED_BY],[UPDATED_DATE],[ISACTIVE]) VALUES(56, 'Control', 'FMEA Project Setup > Approve', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO

 
     IF not exists(select 1 from [CSP].[dbo].[APP_CONTROL_FEATURES] where RESOURCE_ID=56 and FEATURE='VIEW') 
     BEGIN
     insert into csp.dbo.APP_CONTROL_FEATURES values (56,'VIEW', null, 103245, GETDATE(), 103245, GETDATE(),1) 
     END 
     GO

 

     IF not exists(select 1 from [CSP].[dbo].[APP_ACCESS_CONTROLS] where RESOURCE_ID=56) 
     BEGIN
     insert into csp.dbo.APP_ACCESS_CONTROLS values 
     (56, 1, 1, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 2, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 3, '',null,'', 1,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 4, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 5, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 6, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 7, '',null,'', 1,1,1,1,1,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 8, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 9, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 10, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1), 
     (56, 1, 11, '',null,'', 0,0,0,0,0,null , 103245, GETDATE(), 103245, GETDATE(),1)
     END 
     GO

     IF not exists(select 1 from [CSP].[dbo].[FILTER_PREFERENCE] where TABLE_NAME='FMEA_PROJECT') 
     BEGIN
        INSERT INTO FILTER_PREFERENCE VALUES ('FMEA_PROJECT', 'isapplicable', 'Applicability', 'number', 1, 0, 0, null, 103245, getdate(), 103245, getdate(), 1)
        INSERT INTO FILTER_PREFERENCE VALUES ('FMEA_PROJECT', 'isapproved', 'Status', 'number', 1, 0, 0, null, 103245, getdate(), 103245, getdate(), 1)
        INSERT INTO FILTER_PREFERENCE VALUES ('FMEA_PROJECT', 'rF_SEVERITY_ID', 'Severity', 'number', 1, 0, 0, null, 103245, getdate(), 103245, getdate(), 1)

        INSERT INTO FILTER_PREFERENCE VALUES ('FMEA_PROJECT', 'rF_OCCURRENCE_ID', 'Occurrence', 'number', 1, 0, 0, null, 103245, getdate(), 103245, getdate(), 1)
        INSERT INTO FILTER_PREFERENCE VALUES ('FMEA_PROJECT', 'rF_DETECTION_ID', 'Detection', 'number', 1, 0, 0, null, 103245, getdate(), 103245, getdate(), 1)
     END

     GO

     IF EXISTS(Select 1 from sys.procedures where name ='USP_GET_FMEA_DATA' AND type='P')
    BEGIN
            DROP PROCEDURE [dbo].[USP_GET_FMEA_DATA]
    END
    GO

 CREATE PROCEDURE [dbo].[USP_GET_FMEA_DATA]      
(      
@FMEA_TYPE_ID INT,      
@SERVICE_AREA_ID INT,      
@PROCESS_ID INT,      
@SERVICE_LEVEL_IDENTIFIER_ID INT,      
@TASK_ID INT      
)      
AS      
BEGIN      
SELECT FD.[ID], FD.[FMEA_TYPE_ID], FD.[SERVICE_AREA_ID], PS.[TITLE] AS 'SERVICE_TOWER',FD.[PROCESS_ID], PA.TITLE AS 'PROCESS',       
FD.[SERVICE_LEVEL_IDENTIFIER_ID], SLI.SERVICE_LEVEL_IDENTIFIER AS 'SERVICE_LEVEL',       
FD.[TASK_ID], FT.TASK_TITLE AS 'TASK',(SELECT OPTIONS FROM PARAMETER_TABLE WHERE ID=FT.TASK_CATEGORY_ID) AS 'TASK_CATEGORY',      
FD.[FUNCTION_ACTIVITIES],FD.[POTENTIAL_FAILURE_MODE],FD.[POTENTIAL_FAILURE_EFFECT],FD.[POTENTIAL_CAUSE_FACTOR],      
PT.[OPTIONS] AS 'POTENTIAL_CAUSE_FACTOR_OPTIONS',      
FD.[POTENTIAL_CAUSE],FD.[RECOMMENDED_DETECTIVE_CONTROL],FD.[RECOMMENDED_PREVENTIVE_CONTROL],      
FD.[FMEA_STATUS],    FD.STATUS,  
FD.[CREATED_BY],FD.[CREATED_DATE],FD.[UPDATED_BY],FD.[UPDATED_DATE]      
FROM Failure_mode_master FD JOIN FMEA_TASKS FT ON FD.TASK_ID = FT.ID 
JOIN  PROCESS_SERVICE_AREA_NEW PS ON PS.ID = FD.SERVICE_AREA_ID 
JOIN PROCESS PA ON PA.ID = FD.PROCESS_ID 
JOIN SERVICE_LEVEL_IDENTIFIER SLI ON SLI.ID = FD.SERVICE_LEVEL_IDENTIFIER_ID 
JOIN PARAMETER_TABLE PT ON FD.[POTENTIAL_CAUSE_FACTOR] = PT.ID 
JOIN PARAMETER_TABLE PT1 ON FD.FMEA_TYPE_ID = PT1.ID       
WHERE FD.FMEA_TYPE_ID = @FMEA_TYPE_ID AND FD.SERVICE_AREA_ID = @SERVICE_AREA_ID AND FD.PROCESS_ID = @PROCESS_ID AND       
FD.SERVICE_LEVEL_IDENTIFIER_ID = @SERVICE_LEVEL_IDENTIFIER_ID AND FD.TASK_ID = @TASK_ID   
AND FD.ISACTIVE = 1      
END


IF NOT EXISTS(Select 1 from sys.tables where name ='FAILURE_ASSESSMENT' AND type='U')
BEGIN

CREATE TABLE FAILURE_ASSESSMENT
(
	[ID] [int] IDENTITY(1,1) NOT NULL,
	PROJECT_FAILURES_MAPPING_ID INT NOT NULL,
	[FUTURE_RF_OCCURRENCE_ID] [int] NULL,
	[FUTURE_RF_SEVERITY_ID] [int] NULL,
	[FUTURE_RF_DETECTION_ID] [int] NULL,
	[FUTURE_RPN] [decimal](10, 2) NULL,
	[TARGET_DATE] [datetime] NULL,
	ACTION_TAKEN VARCHAR(MAX),
	ACTION_TAKEN_BY VARCHAR(100),
	ACTION_TAKEN_ON DATETIME,
	[CREATED_DATE] [datetime] NULL,
	[CREATED_BY] [varchar](100) NULL,
	[UPDATED_DATE] [datetime] NULL,
	[UPDATED_BY] [varchar](100) NULL,
	[ISACTIVE] [bit] NULL,
)

END

GO

IF not exists(SELECT 1 FROM SERVICE_LEVEL_IDENTIFIER  where SERVICE_LEVEL_IDENTIFIER ='L1')
BEGIN
    INSERT INTO SERVICE_LEVEL_IDENTIFIER  VALUES('L1', 'L1', 86, 103245, GETDATE(), 103245, GETDATE(), 1)
END

GO

IF not exists(SELECT 1 FROM FMEA_TASKS  where SERVICE_LEVEL_ID = 86)
BEGIN

INSERT INTO FMEA_TASKS VALUES (86, 134, 3, 'Call Handling', null, 1)
INSERT INTO FMEA_TASKS VALUES (86, 134, 3, 'Email Handling', null, 1)
INSERT INTO FMEA_TASKS VALUES (86, 134, 3, 'Incident Handling', null, 1)
INSERT INTO FMEA_TASKS VALUES (86, 134, 3, 'Incident flow process', null, 1)
INSERT INTO FMEA_TASKS VALUES (86, 134, 3, 'Status Reporting', null, 1)


INSERT INTO FMEA_TASKS VALUES (86, 405, 3, 'Call Handling', null, 1) 
INSERT INTO FMEA_TASKS VALUES (86, 405, 3, 'Email Handling', null, 1)
INSERT INTO FMEA_TASKS VALUES (86, 405, 3, 'Request Handling', null, 1)
INSERT INTO FMEA_TASKS VALUES (86, 405, 3, 'Request Flow process', null, 1)
INSERT INTO FMEA_TASKS VALUES (86, 405, 3, 'Status Reporting', null, 1)

END

GO