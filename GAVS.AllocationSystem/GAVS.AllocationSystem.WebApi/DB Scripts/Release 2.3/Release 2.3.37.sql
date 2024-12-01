IF NOT EXISTS(SELECT 1 FROM CONFIGURATION_EXT WHERE [KEY] ='PORTFOLIO_ENABLED_CUSTOMERS')
BEGIN
INSERT INTO CONFIGURATION_EXT VALUES('PORTFOLIO_ENABLED_CUSTOMERS','212100001,202100007','-1',NULL, NULL, 0,1,NULL,NULL,NULL,'104859',GETDATE(),'104859',GETDATE())
END
GO

If not exists (select 1 from PORTFOLIO where TITLE='Commercial Technology Solutions')
begin 

Insert into PORTFOLIO values 
('Commercial Technology Solutions','','quality@gavstech.com','104859',GETDATE(),'104859',GETDATE(),1,'100985'),
('IOC (Infrastructure, Operations, Cloud)','','quality@gavstech.com','104859',GETDATE(),'104859',GETDATE(),1,'100985'),
('Data & Analytics','','quality@gavstech.com','104859',GETDATE(),'104859',GETDATE(),1,'100985'),
('O&ETS','','quality@gavstech.com','104859',GETDATE(),'104859',GETDATE(),1,'100985'),
('Cybersecurity','','quality@gavstech.com','104859',GETDATE(),'104859',GETDATE(),1,'100985')

END
Go

If exists (select 1 from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='CTS- Legacy Applications Support' and CUST_ID='202100007' and ISACTIVE=1)
Begin

declare @PID int = (select ID from PORTFOLIO where TITLE='Commercial Technology Solutions')
Update PORTFOLIO_PRODUCTS SET PORTFOLIO_ID=@PID, UPDATED_BY='104859', UPDATED_DATE = GETDATE() where 
PRODUCT_TITLE in ('CTS- Legacy Applications Support','CTS- New Commercial Program') and ISACTIVE=1

End
Go

If exists (select 1 from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='FA IOC- Technical Operation Centre' and CUST_ID='202100007' and ISACTIVE=1)
Begin

declare @PID int = (select ID from PORTFOLIO where TITLE='IOC (Infrastructure, Operations, Cloud)')
Update PORTFOLIO_PRODUCTS SET PORTFOLIO_ID=@PID, UPDATED_BY='104859', UPDATED_DATE = GETDATE() where 
PRODUCT_TITLE in ('FA IOC- Technical Operation Centre','FA IOC- System Engineering','FA IOC- Network Engineering',
'FA IOC - Deskside Engineering','FA IOC- IT Service Desk','FA IOC- Site Reliability Engineering') and ISACTIVE=1

End
Go

If exists (select 1 from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='FA- Data & Analytics' and CUST_ID='202100007' and ISACTIVE=1)
Begin

declare @PID int = (select ID from PORTFOLIO where TITLE='Data & Analytics')
Update PORTFOLIO_PRODUCTS SET PORTFOLIO_ID=@PID, UPDATED_BY='104859', UPDATED_DATE = GETDATE() where 
PRODUCT_TITLE in ('FA- Data & Analytics') and ISACTIVE=1

End
Go

If exists (select 1 from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='FA- Cybersecurity' and CUST_ID='202100007' and ISACTIVE=1)
Begin

declare @PID int = (select ID from PORTFOLIO where TITLE='Cybersecurity')
Update PORTFOLIO_PRODUCTS SET PORTFOLIO_ID=@PID, UPDATED_BY='104859', UPDATED_DATE = GETDATE() where 
PRODUCT_TITLE in ('FA- Cybersecurity') and ISACTIVE=1

End
Go

If exists (select 1 from PORTFOLIO_PRODUCTS where PRODUCT_TITLE='Operations & Enterprise Technology Solutions' and CUST_ID='202100007' and ISACTIVE=1)
Begin

declare @PID int = (select ID from PORTFOLIO where TITLE='O&ETS')
Update PORTFOLIO_PRODUCTS SET PORTFOLIO_ID=@PID, UPDATED_BY='104859', UPDATED_DATE = GETDATE() where 
PRODUCT_TITLE in ('Operations & Enterprise Technology Solutions') and ISACTIVE=1

End
Go


IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='GET_ISOCONTROLS_PROCESS_REPORT' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[GET_ISOCONTROLS_PROCESS_REPORT]
END
GO 

CREATE PROCEDURE [dbo].[GET_ISOCONTROLS_PROCESS_REPORT]
AS
BEGIN
SELECT 

    pm.TITLE as [Process Model Title],
    psan.TITLE as [Service Tower Title],
    PA.TITLE as [Process Area Title] ,
    p.TITLE as [Process Title],
   CONCAT_WS(' - ', pmr.SECTION_REFERENCE, pmr.CONTROL_REFERENCE) as [ISO - Std. Clause / Controls]

FROM 
    process p 
inner JOIN 
    PROCESS_AREA pa ON pa.ID = p.PROCESS_AREA_ID AND pa.ISACTIVE = 1 AND pa.SHOW_IN_MASTER = 1
left JOIN 
    PROCESS_MODEL_PROCESS_MAPPING map ON map.PROCESS_ID = p.ID AND map.ISACTIVE = 1 
inner JOIN 
    PROCESS_MODEL pm ON map.PROCESS_MODEL_ID = pm.ID AND map.ISACTIVE = 1 
left JOIN 
    PROCESS_SERVICE_AREA_MAPPING psam ON  map.PROCESS_ID = psam.PROCESS_ID AND psam.ISACTIVE = 1 
inner JOIN 
    PROCESS_SERVICE_AREA_NEW psan ON psan.ID = psam.SERVICE_AREA_ID AND psan.ISACTIVE = 1 AND psan.SHOW_IN_MASTER = 1
left JOIN 
    PROCESS_AREA_MODEL_REFERENCE pam ON  map.PROCESS_ID = pam.PROCESS_ID AND pam.ISACTIVE = 1 
left JOIN 
    PROCESS_MODEL_REFERENCE pmr ON pam.PROCESS_MODEL_REFERENCE_ID = pmr.ID AND pmr.ISACTIVE = 1
	where p.ISACTIVE =1 and p.SHOW_IN_MASTER =1
	order by p.TITLE;
END
GO

IF NOT EXISTS(Select 1 from sys.tables where name ='IDEA_IDENTIFIER' AND type='U')
BEGIN

CREATE TABLE IDEA_IDENTIFIER
(
	ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	IDEA_ID int NOT NULL,
	IDENTIFIED_BY varchar(20) NULL,
	CREATED_BY varchar(20) NOT NULL,
	CREATED_DATE Datetime NOT NULL,
	UPDATED_BY varchar(20) NOT NULL,
	UPDATED_DATE Datetime NOT NULL,
	ISACTIVE bit NOT NULL
)

END
GO

IF NOT EXISTS (SELECT 1 FROM IDEA_IDENTIFIER where ISACTIVE=1)
BEGIN 

INSERT INTO IDEA_IDENTIFIER (IDEA_ID, IDENTIFIED_BY, CREATED_BY, CREATED_DATE,UPDATED_BY, UPDATED_DATE, ISACTIVE)
SELECT ID AS IDEA_ID, IDENTIFIED_BY, CREATED_BY, CREATED_DATE,UPDATED_BY, UPDATED_DATE, ISACTIVE FROM IDEA where ISACTIVE=1

END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllIdeas' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeas]
END
GO 

CREATE PROCEDURE [dbo].[getAllIdeas]                
                
@customerid varchar(max),              
@startdate date,                    
@enddate date                
                
AS    

BEGIN                    
                   
select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,    
CASE WHEN IBS.BENEFIT_TYPE_ID = 1 then 'Quantitative'      
WHEN IBS.BENEFIT_TYPE_ID = 2 then 'Qualitative' END AS BENEFIT_TYPE,I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE],
STUFF((SELECT ', ' + E.FRST_NM from EMP_INFO E inner join IDEA_IDENTIFIER IID on IID.IDENTIFIED_BY = E.EMP_ID
where IID.IDEA_ID = I.ID and IID.ISACTIVE=1 FOR XML PATH('')), 1, 1, '')[Identified_By], 
(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],                    
I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status],
(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]                    
from IDEA I                    
left join IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1      
left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  and IIP.ISACTIVE = 1                                         
join Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))                      
where I.ISACTIVE = 1 and I.IDENTIFIED_DATE >= @startdate and I.IDENTIFIED_DATE <= @enddate         
group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,
I.IDEA_STATUS_ID,I.PROJECT_ID,IBS.BENEFIT_TYPE_ID          
order by I.IDENTIFIED_DATE desc                
                    
END  
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getSimilarIdeas' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getSimilarIdeas]
END
GO

CREATE PROCEDURE getSimilarIdeas                

@description varchar(max)             

AS

BEGIN                    
                   
select I.ID as IDEA_ID, I.DESCRIPTION, I.IDENTIFIED_DATE,
(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [STATUS],
STUFF((SELECT ', ' + E.FRST_NM from EMP_INFO E inner join IDEA_IDENTIFIER IID on IID.IDENTIFIED_BY = E.EMP_ID
where IID.IDEA_ID = I.ID and E.DOR IS NULL and IID.ISACTIVE=1 FOR XML PATH('')), 1, 1, '')[IDENTIFIED_BY]
from IDEA I                    

where I.ISACTIVE = 1 AND I.DESCRIPTION LIKE @description + '%' 
order by I.IDENTIFIED_DATE desc                
                    
END  
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllIdeasreport' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeasreport]
END
GO

CREATE PROCEDURE [dbo].[getAllIdeasreport]              
     
@Startdate datetime,              
@Enddate datetime,              
@Customerid varchar(50)   
      
AS 

BEGIN              
                 
SELECT c.CUST_NM [CUSTOMER NAME], p.PROJ_NM [PROJECT NAME], port.title [PORTFOLIO NAME], I.DESCRIPTION,           
     
CASE WHEN IBS.BENEFICIARY_ID = 1 then 'For GAVS'    
WHEN IBS.BENEFICIARY_ID = 2 then 'For Customer' END AS BENEFICIARY,    
    
CASE WHEN IBS.BENEFIT_TYPE_ID =1 then 'Quantitative'    
WHEN IBS.BENEFIT_TYPE_ID=2 then 'Qualitative' END AS BENEFIT_TYPE,    
        
CASE WHEN IBS.TYPE_ID = 1 then 'Value'    
WHEN IBS.TYPE_ID =2 then 'Value_Add' END AS TYPE,    

CASE WHEN IBS.BENEFIT_PILLAR_ID = 1 then 'People'         
WHEN IBS.BENEFIT_PILLAR_ID = 2 then 'Process'        
WHEN IBS.BENEFIT_PILLAR_ID = 3 then 'Technology'        
    WHEN IBS.BENEFIT_PILLAR_ID = 4 then 'Facilities'        
    WHEN IBS.BENEFIT_PILLAR_ID = 5 then 'Assets' END AS BENEFIT_PILLAR_CATEGORY,    
BDL.BENEFIT_TITLE AS BENEFIT_TITLE,    
BDQ.NET_BENEFITS_YEAR AS NET_BENEFITS,    
    
(U.TITLE +' '+U.DATATYPE) AS UNIT_OF_MEASUREMENT,    
IDS.TITLE AS STATUS,    
CONVERT(VARCHAR(10), I.IDENTIFIED_DATE, 110) as IDENTIFIED_DATE, 
(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [IDEA_TYPE],                        
STUFF((SELECT ', ' + E.FRST_NM from EMP_INFO E inner join IDEA_IDENTIFIER IID on IID.IDENTIFIED_BY = E.EMP_ID
where IID.IDEA_ID = I.ID and IID.ISACTIVE=1 FOR XML PATH('')), 1, 1, '')[Identified_By],
(select top 1 frst_nm from EMP_INFO where EMP_ID = IIP.RESPONSIBLE) [RESPONSIBLE],    
     
CONVERT(VARCHAR(10), IIP.ESTIMATED_TARGET_DATE, 110) AS TARGET_DATE ,               
CONVERT(VARCHAR(10), IIP.ACTUAL_START_DATE, 110) AS ACTUAL_START_DATE,    
CONVERT(VARCHAR(10), IIP.ACTUAL_END_DATE, 110) AS ACTUAL_END_DATE,     
PSA.TITLE AS SERVICE_AREA    
,I.COMMENTS ,(select top 1 frst_nm from EMP_INFO where EMP_ID = I.created_by) [CREATED_BY]          
,CONVERT(VARCHAR(10),I.created_date,110) AS CREATED_DATE,p.cust_id AS [CUSTOMER ID], [PROJECT_ID], pp.PORTFOLIO_ID [PORTFOLIO ID]

FROM [IDEA] I    
inner join IDEA_BENEFIT_SUMMARY IBS ON I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1   
left join BENEFIT_DETAILS_QUANTITATIVE BDQ ON IBS.ID = BDQ.BENEFIT_SUMMARY_ID and BDQ.ISACTIVE =1   
left join BENEFIT_DETAILS_QUALITATIVE BDL ON IBS.ID = BDL.BENEFIT_SUMMARY_ID  and BDL.ISACTIVE =1  
left join IDEA_IMPLEMENTATION_PLAN IIP ON I.ID = IIP.IDEA_ID    
inner join IDEA_STATUS IDS ON I.IDEA_STATUS_ID = IDS.ID        
LEFT join UOM U  ON BDQ.UOM_ID = U.ID    
LEFT join PROCESS_SERVICE_AREA_NEW PSA ON I.SERVICE_AREA_ID = PSA.ID    
inner join PROJECT p on p.proj_id =  I.PROJECT_ID           
inner join CUSTOMER c on c.CUST_ID = p.Cust_id               
LEFT OUTER JOIN PORTFOLIO_PROJECT pp on pp.proj_id =  I.PROJECT_ID             
LEFT OUTER JOIN PORTFOLIO port on pp.portfolio_id = port.id and port.isactive =1      
where I.ISACTIVE = 1 and I.IDENTIFIED_DATE >= @Startdate and I.IDENTIFIED_DATE <= @Enddate        
and I.IDEA_STATUS_ID in (2,3,4,8) and (@customerid='0' or C.CUST_ID = @Customerid)    
order by c.CUST_NM, p.PROJ_NM, IDENTIFIED_DATE desc              
     
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='getAllIdeasByCustomer' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[getAllIdeasByCustomer]
END
GO

CREATE PROCEDURE [dbo].[getAllIdeasByCustomer]              
                    
@customerid varchar(max)                  
                    
AS                        

BEGIN                        
                       
select I.ID, I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,  
CASE WHEN IBS.BENEFIT_TYPE_ID = 1 then 'Quantitative'        
WHEN IBS.BENEFIT_TYPE_ID = 2 then 'Qualitative' END AS BENEFIT_TYPE,    
I.IDENTIFIED_DATE,max(IIP.ESTIMATED_TARGET_DATE) [TARGET_DATE],
STUFF((SELECT ', ' + E.FRST_NM from EMP_INFO E inner join IDEA_IDENTIFIER IID on IID.IDENTIFIED_BY = E.EMP_ID
where IID.IDEA_ID = I.ID and IID.ISACTIVE=1 FOR XML PATH('')), 1, 1, '')[Identified_By],
(select top 1 type from IDEA_IMPROVEMENT_TYPE IMP where ID = I.IDEA_IMPROVEMENT_TYPE_ID) [Type],                        
I.IDEA_STATUS_ID [IDEA_STATUS_ID],(select top 1 title from IDEA_STATUS where ID = I.IDEA_STATUS_ID) [Status]                        
,(select top 1 PROJ_NM from PROJECT where PROJ_ID = I.PROJECT_ID) [Project_Name]                        
from IDEA I                        
left join IDEA_BENEFIT_SUMMARY IBS on I.ID = IBS.IDEA_ID and IBS.ISACTIVE = 1          
left join IDEA_IMPLEMENTATION_PLAN IIP on I.ID = IIP.IDEA_ID  and IIP.ISACTIVE = 1                                        
join Project P ON P.PROJ_ID = I.PROJECT_ID AND P.CUST_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@customerid,','))                          
where I.ISACTIVE = 1 and I.IDEA_STATUS_ID = 2      
group  by I.ID,I.IDENTIFIED_DATE,I.DESCRIPTION,I.POTENTIAL_SOLUTION_DESCRIPTION,I.IDENTIFIED_BY,I.IDEA_IMPROVEMENT_TYPE_ID,
I.IDEA_STATUS_ID,I.PROJECT_ID,IBS.BENEFIT_TYPE_ID              
order by I.IDENTIFIED_DATE desc       
  
END 
GO
IF NOT EXISTS(Select 1 from sys.tables where name ='PROJECT_INSCOPE_DETAILS' AND type='U')
BEGIN

CREATE TABLE PROJECT_INSCOPE_DETAILS(
        ID int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SERVICE_AREA_ID int NULL,
        TOOLS varchar(255) NULL,
        TECHNOLOGY varchar(255) NULL,
        PROJECT_ID varchar(100) NULL,
        CREATED_BY varchar(50) NULL,
        CREATED_DATE datetime NOT NULL,
        UPDATED_BY varchar(50) NULL,
        UPDATED_DATE datetime NOT NULL,
        ISACTIVE bit NOT NULL
)
END
GO

IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='OBJECTIVES')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD OBJECTIVES varchar(max) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='DELIVERABLES')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD DELIVERABLES varchar(max) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='INSCOPE_ID')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD INSCOPE_ID int NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='CONSTRAINTS')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD CONSTRAINTS varchar(max) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='ASSUMPTIONS')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD ASSUMPTIONS varchar(max) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='OUT_SCOPE')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD OUT_SCOPE varchar(max) NULL
END
GO
IF NOT EXISTS(Select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME ='PROJECT_SCOPE' AND COLUMN_NAME='TECHNOLOGY_USED')
BEGIN
ALTER TABLE PROJECT_SCOPE ADD TECHNOLOGY_USED varchar(max) NULL
END
GO

IF EXISTS(SELECT 1 FROM sys.procedures WHERE name ='reports_getProjectConfigurationData' AND TYPE='P')
BEGIN
       DROP PROCEDURE [dbo].[REPORTS_getProjectConfigurationData]
END
GO

CREATE PROCEDURE [dbo].[REPORTS_getProjectConfigurationData]
AS
BEGIN
DECLARE @mainUrl VARCHAR(1000) = 'https://csm.gavstech.com/layout/projectdataconfigurationApproval'

SELECT PC.ID
,P.PROJ_NM AS [PROJECT NAME]
,PCS.SETTING_NAME AS [SETTING NAME]
,PC.COMMENTS
,CONCAT_WS(' ', E.FRST_NM, E.MIDDLE_NM, E.LAST_NM) AS [APPROVER]
,PC.APPROVAL_COMMENTS AS [APPROVAL COMMENTS]
,Convert(VARCHAR, PC.END_DATE, 107) AS [END_DATE],
  CASE 
WHEN PC.IS_APPROVED = 1 THEN NULL
ELSE (@mainUrl + '/' + CAST(PC.Proj_Id AS VARCHAR(250)) + '/' + CAST(PC.Cust_Id AS VARCHAR(250)) + '/' + CAST(PC.Configuration_Setting_Id AS VARCHAR(250)) + '/1')
 END AS [Approval link],
 CASE 
WHEN PC.IS_APPROVED = 0 THEN NULL
ELSE (@mainUrl + '/' + CAST(PC.Proj_Id AS VARCHAR(250)) + '/' + CAST(PC.Cust_Id AS VARCHAR(250)) + '/' + CAST(PC.Configuration_Setting_Id AS VARCHAR(250)) + '/0')
 END AS [Reject link]
,PC.IS_APPROVED AS [APPROVED]
,PC.PROJ_ID AS [PROJECT ID]
,PC.CONFIGURATION_SETTING_ID AS [CONFIGURATION SETTING ID]
		
FROM PROJECT_CONFIGURATION_DATA PC
INNER JOIN PROJECT P ON PC.PROJ_ID = P.PROJ_ID
LEFT JOIN PROJECT_CONFIGURATION_SETTING PCS ON PC.CONFIGURATION_SETTING_ID = PCS.ID
	AND PCS.ISACTIVE = 1
LEFT JOIN EMP_INFO E ON PC.APPROVED_BY = E.EMP_ID
	AND PC.ISACTIVE = 1
ORDER BY PC.End_date;
END
GO
