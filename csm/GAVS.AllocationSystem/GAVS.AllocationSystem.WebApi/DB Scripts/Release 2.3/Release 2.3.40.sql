
IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProductMappedCSATProjects' AND TYPE='P')
BEGIN
       DROP PROCEDURE getProductMappedCSATProjects
END
GO

CREATE PROCEDURE getProductMappedCSATProjects

AS  
BEGIN  

SELECT DISTINCT CU.ID AS CUSTOMER_USER_ID, C.CUST_ID, C.CUST_NM, PR2.PROJECT_ID AS PROJ_ID, P.PROJ_NM,
PR1.CREATED_BY, PR1.CREATED_DATE,PR1.UPDATED_BY, PR1.UPDATED_DATE, PR1.ISACTIVE

FROM PRODUCT_RESPONSIBLE PR1
INNER JOIN PORTFOLIO_PRODUCTS PP ON PP.ID = PR1.PRODUCT_ID
INNER JOIN (SELECT PRODUCT_ID, PROJECT_ID FROM PRODUCT_RESPONSIBLE WHERE MANAGEMENT_TYPE = 7 AND ISACTIVE = 1) PR2
ON PR1.PRODUCT_ID = PR2.PRODUCT_ID
INNER JOIN CUSTOMER_USERS CU ON CU.EMAILID = PR1.EMP_ID
INNER JOIN PROJECT P ON P.PROJ_ID = PR2.PROJECT_ID 
INNER JOIN CUSTOMER C ON C.CUST_ID = PP.CUST_ID
LEFT JOIN CUSTOMER_PROJECTS CP ON CP.PROJ_ID = PR2.PROJECT_ID AND CP.CUST_ID = PP.CUST_ID AND CP.CUSTOMER_USER_ID = CU.ID
WHERE PR1.ISACTIVE = 1 AND PR1.MANAGEMENT_TYPE = 6 AND PR2.PROJECT_ID IS NOT NULL 

END
GO


IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CUSTOMER' AND COLUMN_NAME='EP_ID')
BEGIN
ALTER TABLE CUSTOMER ADD EP_ID VARCHAR(200) NULL
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'PROJECT' AND COLUMN_NAME='PROJ_EP_ID')
BEGIN
ALTER TABLE PROJECT ADD PROJ_EP_ID VARCHAR(200) NULL
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMERS' AND COLUMN_NAME='COMMENTS')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMERS ADD COMMENTS varchar(max) NULL 
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMER_MONTHLY' AND COLUMN_NAME='COMMENTS')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMER_MONTHLY ADD COMMENTS varchar(max) NULL 
END
GO

IF NOT EXISTS(Select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME = 'CSS_BATCH_CUSTOMERS' AND COLUMN_NAME='PROD_ID')
BEGIN
ALTER TABLE CSS_BATCH_CUSTOMERS ADD PROD_ID int NULL 
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getQualitySpocs' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getQualitySpocs]
END
GO 		
		
CREATE PROCEDURE [dbo].[reports_getQualitySpocs]        
AS        
BEGIN        
select   p.proj_nm,        
convert(varchar,p.start_date,107) as start_date,convert(varchar,p.end_date,107)as end_date,        
HeadCount = (select count(*) from PROJ_RESOURCE pr where pr.PROJ_ID = p.PROJ_ID and pr.BILL_FLG =1 and pr.CURR_INDC ='y' and pr.END_DATE >= GETDATE()),        
c.cust_nm,proj_status , p.project_type, p.BUSINESS_UNIT, p.DEPARTMENT, p.PROJECT_GROUP, p.CONTRACTING_UNIT, p.REVENUE_TYPE, p.COUNTRY, p.METHODOLOGY,          
status=case when isnull(proj_status, '') != ''  then 'Active' else 'Inactive' end,         
Account_Owner = case when p.proj_id like 'proj%'  then 'GSLab' else 'GAVS' end,        
e.frst_nm as SPOC,        
e1.frst_nm as PM,  
e1.email_id as [PM Mail ID],
e3.FRST_NM as Account_Manager,
e3.email_id as [AM Mail ID],
e2.frst_nm as CSM,
e2.email_id as [CSM Mail ID],
e4.frst_nm as [BU Head],
e4.email_id as [BU Mail ID],
(select TOP 1 email_id from emp_info where EMP_ID = e2.reviewer_emp_id) as [CSM Reviewer mail ID],     
(SELECT TOP 1 CONVERT(varchar, ACTUAL_AUDIT_END_DATE, 107)        
FROM AUDIT_CHECKLIST_EXECUTION_SUMMARY aces          
WHERE aces.PROJECT_ID = p.PROJ_ID               
ORDER BY ACTUAL_AUDIT_END_DATE DESC     ) AS [Last Audited On]  ,        
Project_Configuration = STUFF( (SELECT ', ' + pcs.Setting_Name from project p1          
inner join PROJECT_CONFIGURATION_DATA pdc on pdc.Proj_Id = p.PROJ_ID               
inner join PROJECT_CONFIGURATION_SETTING pcs on pcs.Id= pdc.Configuration_Setting_Id         
where p1.PROJ_ID=p.PROJ_ID  and  (pdc.end_date is null or pdc.End_date > GETDATE()) order by 1 FOR XML PATH('')),1,1,'' )  ,        
ISO_STANDARDS  = STUFF((SELECT ', ' + PIS.STANDARD_NAME      
FROM PROJECT_ISO_STANDARD PIS INNER JOIN PROJECT_ISO_STANDARD_MAPPING PIM on PIS.ID = PIM.ISO_STANDARD_ID      
WHERE PROJECT_ID = p.PROJ_ID AND PIS.ISACTIVE = 1 and PIM.ISACTIVE=1      
FOR XML PATH('')), 1, 1, ''),      
CERTIFICATION_SCOPES  = STUFF((SELECT ', ' + PCS.SCOPE_NAME      
FROM PROJECT_CERTIFICATION_SCOPE PCS INNER JOIN PROJECT_CERTIFICATION_SCOPE_MAPPING PCM on PCS.ID = PCM.CERTIFICATION_SCOPE_ID      
WHERE PROJECT_ID = p.PROJ_ID AND PCS.ISACTIVE = 1 and PCM.ISACTIVE=1      
FOR XML PATH('')), 1, 1, ''),      
p.proj_id          
from project p inner join customer c on p.cust_id = c.cust_id              
left join emp_info e on e.emp_id  = p.quality_spoc        
inner join emp_info e1 on e1.emp_id  = p.PROJ_PM_EMP_ID           
inner join emp_info e2 on e2.emp_id  = p.PROJ_DM_EMP_ID           
left join emp_info e3 on e3.emp_id  = p.PROJ_AM_EMP_ID     
inner join emp_info e4 on e4.EMP_ID = p.PROJ_BUHEAD_EMP_ID
where isnull(proj_status, '') != 'close'            
order by c.cust_nm, p.proj_nm              
END 
GO



Declare @RESOURCEID int = 116
Declare @EMPID varchar(10) = '105709'
Declare @RescourceName varchar(250) = 'Project > Planner > Task Planner'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_CSAT_Combined' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
END
GO 
CREATE PROCEDURE [dbo].[reports_CSAT_Combined] 

@StartDate date, 
@EndDate date    

AS  

BEGIN    
  
  SELECT    
    c.cust_nm AS [Customer Name],    
    p.proj_nm AS [Project Name],    
    display_name AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS    
    [CSAT sent Date],    
    FORMAT(SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    [Year_Quarter] = LEFT(bt.frequency, 1) + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),    
    pp.TITLE AS [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_DM_EMP_ID    
    WHERE project.PROJ_ID = B.PROJ_ID)    
    AS [Customer Success Manager],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_AM_EMP_ID    
    WHERE project.PROJ_ID = B.PROJ_ID)    
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,   
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
	CASE
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')
        THEN 'Improvement Plan submission Overdue'
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')
        THEN 'Improvement Plan Completion Overdue'
    ELSE pa.status 
END AS [Action Item Status],

 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]   

  FROM [CSS_BATCH_CUSTOMERS] b    
  INNER JOIN project p    
    ON p.proj_id = b.proj_id    
  LEFT JOIN portfolio_project PR    
    ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1  
  LEFT JOIN PORTFOLIO pp    
    ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1  
  INNER JOIN customer c    
    ON c.cust_id = b.cust_id    
  INNER JOIN CSS_BATCHES bt    
    ON bt.id = b.Batch_ID and bt.ISACTIVE = 1   
  INNER JOIN CSS_QUESTION_REPLIES QR    
    ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1  
  LEFT JOIN PROJECT_ACTIONITEM PA   
 ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1  
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  UNION    
  SELECT    
    c.cust_nm AS [Customer Name],    
    COALESCE(P.PROJ_NM, PFT.PRODUCT_TITLE) AS [Project Name],  
    b.DISPLAY_NAME AS [Respondent Name],    
    B.EMAIL_ID AS [Email_Id],    
    FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],    
    FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,  
    CONCAT(    
    'Q', CASE    
      WHEN MONTH(bt.START_DATE) BETWEEN 4 AND 6 THEN '1'    
      WHEN MONTH(bt.START_DATE) BETWEEN 7 AND 9 THEN '2'    
      WHEN MONTH(bt.START_DATE) BETWEEN 10 AND 12 THEN '3'    
      ELSE '4'    
    END, ' - ', YEAR(bt.START_DATE)) AS [Quarter_Year],    
    pp.TITLE [Portfolio],    
    qr.QUESTION_CATEGORY,    
    qr.QUESTION,    
    qr.RATING,    
    qr.RATING_DESCRIPTION,    
    c.Cust_ID AS [Customer_ID],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_DM_EMP_ID    
    WHERE project.PROJ_ID = p.PROJ_ID)    
    AS [Customer Success Manager],    
    (SELECT    
      E.FRST_NM    
    FROM project    
    INNER JOIN EMP_INFO E    
      ON E.EMP_ID = project.PROJ_AM_EMP_ID    
    WHERE project.PROJ_ID = p.PROJ_ID)    
    AS [ACCOUNT MANAGER], p.PROJ_STATUS,      
    p.BUSINESS_UNIT AS [BUSSINESS UNIT],    
    P.CONTRACTING_UNIT AS [CONTRACTING UNIT],    
    P.METHODOLOGY AS [METHODOLOGY],    
    P.DEPARTMENT AS [DEPARTMENT],    
    P.PROJECT_GROUP [PROJECT GROUP],    
    P.COUNTRY [COUNTRY],  
CASE
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')
        THEN 'Improvement Plan submission Overdue'
    WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')
        THEN 'Improvement Plan Completion Overdue'
    ELSE pa.status 
END AS [Action Item Status],  
 PA.description as [Action Item Description],  
 FORMAT(PA.target_date, 'dd-MMM-yyy', 'EN-us') AS  [Target Date]
  FROM [CSS_BATCH_CUSTOMER_MONTHLY] b    
  INNER JOIN CSS_BATCH_MONTHLY bt    
    ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1   
  INNER JOIN CSS_QUESTION_REPLIES QR    
    ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1  
  INNER JOIN customer c    
    ON c.cust_id = b.cust_id    
  LEFT JOIN project p    
    ON p.proj_id = b.PROJ_ID  
  LEFT JOIN portfolio_project PR    
    ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1  
  LEFT JOIN PORTFOLIO pp    
    ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1  
 LEFT JOIN PORTFOLIO_PRODUCTS PFT  
 ON PFT.ID = b.PROD_ID and PFT.ISACTIVE = 1  
   LEFT JOIN PROJECT_ACTIONITEM PA   
   ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1   
  WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1  
  AND (bt.start_date BETWEEN @StartDate AND @EndDate    
  OR bt.ENd_date BETWEEN @StartDate AND @EndDate)    
  ORDER BY [Year_Quarter], [Customer Name];    
END    
GO



IF EXISTS (SELECT * FROM crisp_validations WHERE CRITERIA_ID=1 AND SCORE_PERCENTAGE=100)
update crisp_validations
SET validation_name = '1) All applicable customer success goals are met (includes all KPI required to capture customer''s business/IT success goals) - SOW Commitment
2) Project Progress Report should be reviewed and shared with customer on a regular basis
3) If OLA (be it affecting GAVS internal function or client''s Internal function) applicable, establish, monitor and control.
Note: Currently Point 2 is not considered in CSM platform'
WHERE CRITERIA_ID = 1
AND SCORE_PERCENTAGE = 100;

IF EXISTS (SELECT * FROM crisp_validations WHERE CRITERIA_ID=1 AND SCORE_PERCENTAGE=0)
update crisp_validations
SET validation_name = '1) Any success goals including any SoW SLA not met
2) Success goals met but report not submitted to customer

Note: Currently Point 2 is not considered in CSM platform'
WHERE CRITERIA_ID = 1
AND SCORE_PERCENTAGE = 0;

IF EXISTS (SELECT * FROM crisp_validations WHERE CRITERIA_ID=2 AND SCORE_PERCENTAGE=100)
update crisp_validations
SET validation_name = '1) All applicable customer success goals are met (includes all KPI required to capture customer success)
2) Report should be shared with customer on a regular basis

Note: Currently Point 2 is not considered in CSM platform'
WHERE CRITERIA_ID = 2
AND SCORE_PERCENTAGE = 100;

IF EXISTS (SELECT * FROM crisp_validations WHERE CRITERIA_ID=2 AND SCORE_PERCENTAGE=0)
update crisp_validations
SET validation_name = '1) Any Customer Success goals/KPI not met
2) Success goals met but report not shared with customer

Note: Currently Point 2 is not considered in CSM platform'
WHERE CRITERIA_ID = 2
AND SCORE_PERCENTAGE = 0;

IF EXISTS (SELECT * FROM crisp_validations WHERE CRITERIA_ID=4 AND SCORE_PERCENTAGE=50)
update crisp_validations
SET validation_name = 'There are issues within target date without corrective action plan'
WHERE CRITERIA_ID = 4
AND SCORE_PERCENTAGE = 50;

IF EXISTS (SELECT * FROM crisp_validations WHERE CRITERIA_ID=11 AND SCORE_PERCENTAGE=100)
update crisp_validations
SET validation_name = '1) CSM to have an executive connect once in a month with the project sponsor (at client end)
2) All team members should have completed & passed the Mandatory courses likes Quality, ISMS, OHSAS, & *HIPPA, PCI DSS, HITRUST as applicable for the project
3) Any release to customer should be communicated to respective Quality SPOC for Release Audit atleast two days in advance

Note: Currently Point 1 and 3 are not validated by the CSM platform'
WHERE CRITERIA_ID = 11
AND SCORE_PERCENTAGE = 100;

IF EXISTS (SELECT * FROM crisp_validations WHERE CRITERIA_ID=11 AND SCORE_PERCENTAGE=0)
update crisp_validations
SET validation_name = '1) No executive connect with project sponsor & CSM
2) Any one member in the team not completed any of the Mandatory courses
3) Any release to customer has been done without informing Quality SPOC

Note: Any ** findings classified as threats will lead to zero in Process Compliance score  even if the project earned process compliance as 90% in the internal audit
'
WHERE CRITERIA_ID = 11
AND SCORE_PERCENTAGE = 0;




--rollback
--commit

IF EXISTS (SELECT * FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Monthly CSAT Model_1' AND ISACTIVE=1)
BEGIN
UPDATE CSS_QUESTION_MODELS SET MODEL_NAME='Managed Services',COMMENTS='CSAT Related questions',UPDATED_BY='104859', UPDATED_DATE=GETDATE()
WHERE MODEL_NAME='Monthly CSAT Model_1' AND ISACTIVE=1
END
GO

IF EXISTS (SELECT * FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Monthly CSAT Model_2' AND ISACTIVE=1)
BEGIN
UPDATE CSS_QUESTION_MODELS SET MODEL_NAME='Time and Material',COMMENTS='CSAT Related questions',UPDATED_BY='104859', UPDATED_DATE=GETDATE() 
WHERE MODEL_NAME='Monthly CSAT Model_2' AND ISACTIVE=1
END
GO

IF EXISTS (SELECT * FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='ADM')
BEGIN
UPDATE CSS_QUESTION_MODELS SET MODEL_NAME='Default',COMMENTS='Common CSAT Related questions',ISACTIVE=1,
UPDATED_BY='104859', UPDATED_DATE=GETDATE() WHERE MODEL_NAME='ADM'
END
GO

IF NOT EXISTS (SELECT * FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation')
BEGIN
INSERT INTO CSS_QUESTION_MODELS values ('Staff Augmentation','CSAT Related questions','104859',GETDATE(),'104859',GETDATE(),1)
END
GO

IF NOT EXISTS (SELECT * FROM CSS_QUESTION_MASTER WHERE QUESTION='Competency of People/talents provided')
BEGIN
declare @modelId int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation')
INSERT INTO CSS_QUESTION_MASTER values 
(@modelId,'Criteria','Competency of People/talents provided','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL),
(@modelId,'Criteria','Onboarding People/talents as per expected timeline','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL),
(@modelId,'Criteria','Overall quality of engagement and services from GAVS','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL),
(@modelId,'NPS','How likely is that you would recommend GAVS to your friend / acquaintance who wishes to avail IT services?','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL),
(@modelId,'Others','Any other feedback / recommendation that you may like to mention:','2024-07-01','104859',GETDATE(),'104859',GETDATE(),1,NULL)
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getCSATQuestionModel' AND TYPE='P')
BEGIN
       DROP PROCEDURE getCSATQuestionModel
END
GO

CREATE PROCEDURE getCSATQuestionModel

@projectId varchar(50)

AS    

BEGIN

IF EXISTS(SELECT 1 FROM PROJECT where REVENUE_TYPE in ('Time and Material','Fixed Bid') and PROJ_ID = @projectId)  
BEGIN    
SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Time and Material'
END  

ELSE IF EXISTS(SELECT 1 FROM PROJECT where REVENUE_TYPE in ('Managed Services') and PROJ_ID = @projectId)
BEGIN    
SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Managed Services'
END  

ELSE IF EXISTS(SELECT 1 FROM PROJECT where REVENUE_TYPE in ('Fixed Monthly') and PROJ_ID = @projectId)
BEGIN    
SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Staff Augmentation'
END  

ELSE
BEGIN
SELECT ID as QUESTION_MODEL_ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Default'
END

END
GO

Declare @RESOURCEID int = 117
Declare @EMPID varchar(10) = '105709'
Declare @RescourceName varchar(250) = 'CSAT -> Send Survey Request Mails to customer'

If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
begin 
insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
end

If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_ACCESS_CONTROLS
(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
values 
(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

If not exists (select 1 from  APP_CONTROL_FEATURES where RESOURCE_ID = @RESOURCEID)
begin 
insert into  APP_CONTROL_FEATURES (RESOURCE_ID,FEATURE,COMMENTS,CREATED_BY,UPDATED_BY,ISACTIVE,CREATED_DATE,UPDATED_DATE)
values  
(@RESOURCEID,'VIEW',null,@EMPID,@EMPID,1,GETDATE(),GETDATE()) 
End
Go


IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_LINK_VALIDITY_DAYS')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_LINK_VALIDITY_DAYS',  
    '20',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO


IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]='CSS_REMINDER_VALIDITY_DAYS')
BEGIN
INSERT INTO configuration_ext (
    [KEY],
    [value],
    cust_id,
    proj_id,
    comments,
    isactive,
    created_by,
    created_date,
    updated_by,
    updated_date
) VALUES (
    'CSS_REMINDER_VALIDITY_DAYS',  
    '7',     
    -1,                 
    NULL,               
    '',  
    1,                  
    '105709',           
    GETDATE(),          
    '105709',           
    GETDATE()           
);
END
GO
