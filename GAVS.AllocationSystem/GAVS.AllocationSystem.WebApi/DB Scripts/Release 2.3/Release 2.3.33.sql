IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjectMembersByProject' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].getProjectMembersByProject
END
GO

CREATE PROCEDURE getProjectMembersByProject      

@projectId varchar(25)   

AS      

BEGIN 

SELECT 
    p.PROJ_BUHEAD_EMP_ID as BUHEAD,      
    buhead.FRST_NM AS BUHEAD_NAME,      
    p.PROJ_DM_EMP_ID as CSM,      
    dm.FRST_NM AS CSM_NAME,      
    p.PROJ_PM_EMP_ID as PM,      
    pm.FRST_NM AS PJT_MNGR_NAME,      
    p.PROJ_AM_EMP_ID AS AM,      
    am.FRST_NM AS ACNT_MNGR_NAME,      
    p.QUALITY_SPOC AS QA,      
    spoc.FRST_NM AS QSPOC_NAME,
    STUFF(
        (SELECT ',' + CONVERT(VARCHAR(10), CERTIFICATION_SCOPE_ID)
         FROM PROJECT_CERTIFICATION_SCOPE_MAPPING
         WHERE PROJECT_ID = @projectId AND ISACTIVE = 1
         FOR XML PATH('')), 1, 1, '') AS CERTIFICATION_SCOPES,
    STUFF(
        (SELECT ',' + CONVERT(VARCHAR(10), ISO_STANDARD_ID)
         FROM PROJECT_ISO_STANDARD_MAPPING
         WHERE PROJECT_ID = @projectId AND ISACTIVE = 1
         FOR XML PATH('')), 1, 1, '') AS ISO_STANDARDS,
    STUFF(
        (SELECT ', ' + PCS.SCOPE_NAME
         FROM PROJECT_CERTIFICATION_SCOPE PCS INNER JOIN PROJECT_CERTIFICATION_SCOPE_MAPPING PCM on PCS.ID = PCM.CERTIFICATION_SCOPE_ID
         WHERE PROJECT_ID = @projectId AND PCS.ISACTIVE = 1 and PCM.ISACTIVE=1
         FOR XML PATH('')), 1, 1, '') AS CERTIFICATION_SCOPES_NAME,
    STUFF(
        (SELECT ', ' + PIS.STANDARD_NAME
         FROM PROJECT_ISO_STANDARD PIS INNER JOIN PROJECT_ISO_STANDARD_MAPPING PIM on PIS.ID = PIM.ISO_STANDARD_ID
         WHERE PROJECT_ID = @projectId AND PIS.ISACTIVE = 1 and PIM.ISACTIVE=1
         FOR XML PATH('')), 1, 1, '') AS ISO_STANDARDS_NAME

FROM 
    PROJECT p  (NOLOCK)    
LEFT JOIN 
    EMP_INFO buhead  (NOLOCK) ON buhead.emp_id = p.PROJ_BUHEAD_EMP_ID      
LEFT JOIN 
    EMP_INFO dm (NOLOCK) ON dm.emp_id = p.PROJ_DM_EMP_ID      
LEFT JOIN 
    EMP_INFO pm (NOLOCK) ON pm.emp_id = p.PROJ_PM_EMP_ID      
LEFT JOIN 
    EMP_INFO am (NOLOCK) ON am.emp_id = p.PROJ_AM_EMP_ID        
LEFT JOIN 
    EMP_INFO spoc (NOLOCK) ON spoc.emp_id = p.QUALITY_SPOC      

WHERE p.PROJ_ID = @projectId AND  ISNULL(p.PROJ_STATUS,'') != 'Close' 

END 
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='PROJECT_CERTIFICATION_SCOPE' AND type='U')
BEGIN

CREATE TABLE PROJECT_CERTIFICATION_SCOPE
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	SCOPE_NAME varchar(250) NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO


IF NOT EXISTS(Select 1 from sys.tables where name ='PROJECT_CERTIFICATION_SCOPE_MAPPING' AND type='U')
BEGIN

CREATE TABLE PROJECT_CERTIFICATION_SCOPE_MAPPING
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	PROJECT_ID varchar(20) NOT NULL,
	CERTIFICATION_SCOPE_ID int NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='PROJECT_ISO_STANDARD' AND type='U')
BEGIN

CREATE TABLE PROJECT_ISO_STANDARD
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	STANDARD_NAME varchar(250) NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='PROJECT_ISO_STANDARD_MAPPING' AND type='U')
BEGIN

CREATE TABLE PROJECT_ISO_STANDARD_MAPPING
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	PROJECT_ID varchar(20) NOT NULL,
	ISO_STANDARD_ID int NOT NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='SLA_REJECTION_MAIL_FOR_PMO')
Begin
Insert into CONFIGURATION_EXT values('SLA_REJECTION_MAIL_FOR_PMO','premier_PMO@gavstech.com','212100001',null, null, 0,1,null,null,null,'104859',Getdate(),'104859',Getdate())
END
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='SLA_REVIEW_MAIL_FOR_PQA')
Begin
Insert into CONFIGURATION_EXT values('SLA_REVIEW_MAIL_FOR_PQA','PremierQualityTeam@gavstech.com','212100001',null, null, 0,1,null,null,null,'104859',Getdate(),'104859',Getdate())
END
GO

If not Exists(Select 1 from CONFIGURATION_EXT where [KEY] ='PROCESS_EXCELLENCE_TEAM_MAIL')
Begin
Insert into CONFIGURATION_EXT values('PROCESS_EXCELLENCE_TEAM_MAIL','PEX_Team@gavstech.com','-1',null, null, 0,1,null,null,null,'104859',Getdate(),'104859',Getdate())
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getProjectsByPM' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getProjectsByPM]
END
GO

CREATE Procedure getProjectsByPM  
  
@PmEmpId varchar(25)  
  
AS  
  
Begin  
  
select Top 1 STUFF((  
        SELECT ' ,' + PROJ_ID  
        FROM project  
        WHERE  
            BILL_TYPE = 1  
            AND ISNULL(PROJ_STATUS, '') != 'Close'  
            AND PROJ_ID NOT LIKE 'proj%'  
            AND ISNULL(PROJECT_TYPE, '') != 'Internal'  
            AND PROJ_PM_EMP_ID = @PmEmpId  
        FOR XML PATH('')), 1, 2, '') AS ProjectIds,  
 (e.FRST_NM) AS CSM,  
 (e.EMAIL_ID) AS CSM_MAIL_ID,  
    (e2.FRST_NM) AS PM,  
    (e2.EMAIL_ID) AS PM_Email_ID,  
 (e1.FRST_NM) AS QUALITY_PARTNER,  
    (e1.EMAIL_ID) AS QUALITY_PARTNER_MAIL_ID  
      
  FROM project p         
  inner join EMP_INFO e (NOLOCK) on e.EMP_ID=p.PROJ_DM_EMP_ID and e.DOR IS NULL  
  left join EMP_INFO e1 (NOLOCK) on e1.EMP_ID=p.QUALITY_SPOC and e1.DOR IS NULL      
  inner join EMP_INFO e2 (NOLOCK) on e2.EMP_ID=p.PROJ_PM_EMP_ID and e2.DOR IS NULL    
  inner join CUSTOMER c (NOLOCK) on c.CUST_ID=p.CUST_ID          
  WHERE p.BILL_TYPE=1 and ISNULL(P.PROJ_STATUS ,'') != 'Close'  
  and P.PROJ_ID not like 'proj%' and ISNULL(P.PROJECT_TYPE ,'') != 'Internal' and P.PROJ_PM_EMP_ID=@PmEmpId       
  
END  
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getOpenFindingsCount' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getOpenFindingsCount]
END
GO

CREATE Procedure getOpenFindingsCount  
  
@projectIds varchar(max)  
  
As  
Begin  
  
select C.CUST_NM, P.PROJ_NM, COUNT(*) AS OPEN_FINDINGS_COUNT, summ.CUSTOMER_ID, summ.PROJECT_ID  
from AUDIT_CHECKLIST_PROJECT_FINDINGS findings      
INNER JOIN FINDINGSTYPE_VALUES value on findings.finding_type = value.findingtype_value and value.isactive = 1     
and findings.isactive = 1 and findings.issubmitted = 1       
   
INNER JOIN AUDIT_CHECKLIST_EXECUTION_DETAILS exe on findings.audit_id = exe.ASSESSMENT_ID and   
findings.applicable_questions = exe.PM_CHECKLIST_QUESTION_ID and findings.process_id = exe.process_id and   
findings.service_area_id = exe.service_area_id and findings.process_model_id = exe.process_model_id       
and findings.process_area_id = exe.process_area_id and exe.isactive = 1 and exe.issubmitted = 1    
  
INNER JOIN AUDIT_CHECKLIST_EXECUTION_SUMMARY summ on summ.ASSESSMENT_ID = exe.ASSESSMENT_ID      
  
INNER JOIN AUDIT_FINDING_STAGES_MAPPING AFM on AFM.FINDING_ID = findings.ID and AFM.ISACTIVE=1   
  
LEFT JOIN AUDIT_FINDINGS_CAPA capa on findings.id = capa.finding_id and capa.isactive =1 and capa.issubmitted = 1     
  
INNER JOIN PROJECT P on P.PROJ_ID = summ.PROJECT_ID  
  
INNER JOIN CUSTOMER C on C.CUST_ID = summ.CUSTOMER_ID  
  
where summ.Project_id in (SELECT * FROM [DBO].[FN_SPLITSTRING](@projectIds,','))   
and capa.CORRECTIVE_ACTION_PLAN IS NULL and capa.CAP_TARGET_DATE IS NULL  
and AFM.STAGE_ID=1 and AFM.STAGE_STATUS NOT IN ('Auditee Rejected')  
  
GROUP BY C.CUST_NM, P.PROJ_NM,summ.CUSTOMER_ID, summ.PROJECT_ID order by 1       
    
END  
GO
