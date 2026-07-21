--------------------------------- QUALITATIVE_ANALYSIS--------------------------------------------------------

--IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
--               WHERE TABLE_NAME = 'CSS_QUESTION_REPLIES' AND COLUMN_NAME = 'QUALITATIVE_CATEGORY')
--BEGIN
--    ALTER TABLE CSS_QUESTION_REPLIES ADD QUALITATIVE_CATEGORY varchar(20) NULL;
--END

--GO

--IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
--               WHERE TABLE_NAME = 'CSS_QUESTION_REPLIES' AND COLUMN_NAME = 'QUALITATIVE_STATUS')
--BEGIN
--    ALTER TABLE CSS_QUESTION_REPLIES ADD QUALITATIVE_STATUS varchar(50) NULL;
--END

--GO

--IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
--               WHERE TABLE_NAME = 'CSS_QUESTION_REPLIES' AND COLUMN_NAME = 'QUALITATIVE_REMARKS')
--BEGIN
--    ALTER TABLE CSS_QUESTION_REPLIES ADD QUALITATIVE_REMARKS varchar(200)NULL;
--END

--GO

--IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
--               WHERE TABLE_NAME = 'CSS_QUESTION_REPLIES' AND COLUMN_NAME = 'QUALITATIVE_SUBMITTED')
--BEGIN
--     ALTER TABLE CSS_QUESTION_REPLIES ADD QUALITATIVE_SUBMITTED bit;
--END

--GO



--IF NOT EXISTS (SELECT 1 FROM DROPDOWN_OPTIONS WHERE DD_NAME= 'QUALITATIVE_ANALYSIS')   
-- BEGIN
--INSERT INTO DROPDOWN_OPTIONS (DD_NAME,DD_VALUE,DD_TEXT,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
--VALUES 

--('QUALITATIVE_ANALYSIS','QUALITY_OF_DELIVERY','Quality of Delivery','104744',getdate(),'104744',getdate(),1),

--('QUALITATIVE_ANALYSIS','RESOURCE_COMPETENCY','Resource Competency','104744',getdate(),'104744',getdate(),1),

--('QUALITATIVE_ANALYSIS','RISK_MGMT_RESPONSIVENESS','Risk Management & Responsiveness','104744',getdate(),'104744',getdate(),1),

--('QUALITATIVE_ANALYSIS','TEAM_COLLABORATION','Team Commitment & Collaboration','104744',getdate(),'104744',getdate(),1),

--('QUALITATIVE_ANALYSIS','THOUGHT_LEADERSHIP','Thought Leadership','104744',getdate(),'104744',getdate(),1),

--('QUALITATIVE_ANALYSIS','TIMELINE_ADHERENCE','Timeline Adherence','104744',getdate(),'104744',getdate(),1),

--('QUALITATIVE_ANALYSIS','RESOURCE_FULFILLMENT','Timely Resource Fulfillment','104744',getdate(),'104744',getdate(),1)


--END

--GO


--Declare @RESOURCEID int = 827
--Declare @EMPID varchar(10) = '104744'
--Declare @RescourceName varchar(250) = 'VOC > Qualitative Analysis'

--If not exists(select 1 from  APP_CONTROLS where RESOURCE_NAME = @RescourceName)
--begin 
--insert into APP_CONTROLS (RESOURCE_ID,RESOURCE_TYPE,RESOURCE_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
--values (@RESOURCEID,'Control',@RescourceName,null,@EMPID,GETDATE(),@EMPID,GETDATE(),1)
--set @RESOURCEID = (select RESOURCE_ID from  APP_CONTROLS where RESOURCE_NAME = @RescourceName )
--end

--If not exists(select 1 from  APP_ACCESS_CONTROLS where RESOURCE_ID = @RESOURCEID)
--begin 
--insert into  APP_ACCESS_CONTROLS
--(RESOURCE_ID,ROLE_ID,EMP_ID,CUST_ID,PROJ_ID,COMMENTS,CREATED_BY,UPDATED_BY,VIEW_ACCESS,CREATE_ACCESS,
--EDIT_ACCESS,DELETE_ACCESS,DEFAULT_ACCESS,ISACTIVE,ACCESS_LEVEL,CREATED_DATE,UPDATED_DATE)
--values 
--(@RESOURCEID,1,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,2,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,3,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,4,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,5,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,6,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
--(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

--End

--GO

--IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined' AND type='P')
--BEGIN
--       DROP PROCEDURE [dbo].[reports_CSAT_Combined]
--END
--GO

--CREATE PROCEDURE [dbo].[reports_CSAT_Combined]                             
                            
--@StartDate date,                           
--@EndDate date,
--@CUSTOMER varchar(max)='0'  
                          
--AS                            
                          
--BEGIN                              
                            
--SELECT    distinct                          
--c.cust_nm AS [Customer Name],                              
--p.proj_nm AS [Project Name],                
--[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,               
--display_name AS [Respondent Name],     
--co.CONTACT_ROLE AS [Respondent Role], 
--B.EMAIL_ID AS [Email_Id],                              
--FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                              
--[CSAT SENT DATE],                              
--FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT RECEIVED DATE],  IS_VERIFIED,                            
--[Year_Quarter] = case when FREQUENCY ='Quarterly' then  'Q' else 'H' end+ CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year)   ,        
--pp.TITLE AS [Portfolio],                              
--qr.QUESTION_CATEGORY,                              
--qr.PERSPECTIVE as PERSPECTIVE,                              
--case when qr.PERSPECTIVE ='Qualitative Feedback' then NULL else qr.RATING end as RATING,                              
--qr.RATING_DESCRIPTION,               
--qr.QUALITATIVE_CATEGORY as [SENTIMENT TYPE],
--qr.QUALITATIVE_STATUS as [SENTIMENT CATEGORY],
--qr.QUALITATIVE_REMARKS as [SENTIMENT REMARKS],
--(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                              
--(SELECT                              
--E.FRST_NM                              
--FROM project                              
--INNER JOIN EMP_INFO E                              
--ON E.EMP_ID = project.DP_ID                              
--WHERE project.PROJ_ID = B.PROJ_ID)                              
--AS [Customer Success Manager],                              
--(SELECT                              
--E.FRST_NM                              
--FROM project                              
--INNER JOIN EMP_INFO E                              
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                              
--WHERE project.PROJ_ID = B.PROJ_ID)                              
--AS [ACCOUNT MANAGER],                   
--(SELECT                                
--E.FRST_NM                                
--FROM project                                
--INNER JOIN EMP_INFO E                                
--ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                                
--WHERE project.PROJ_ID = B.PROJ_ID)                                
--AS [BU Head],    
--STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where email_id =spoc FOR XML PATH('')),     
--    1, 1, '') AS [CSAT SPOC],               
--(SELECT                                
--E.FRST_NM                                
--FROM project                                
--INNER JOIN EMP_INFO E                                
--ON E.EMP_ID = project.PROJ_DM_EMP_ID                                
--WHERE project.PROJ_ID = B.PROJ_ID)                                
--AS [DP NAME],               --DP NAME  
--(SELECT                                
--E.EMAIL_ID                                
--FROM project                                
--INNER JOIN EMP_INFO E                                
--ON E.EMP_ID = project.PROJ_DM_EMP_ID                                
--WHERE project.PROJ_ID = B.PROJ_ID)                                
--AS [DP MAIL],                  
--p.PROJ_STATUS,                             
--p.BUSINESS_UNIT AS [BUSINESS UNIT],                              
--P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                              
--P.METHODOLOGY AS [METHODOLOGY],                              
--P.DEPARTMENT AS [DEPARTMENT],                              
--P.PROJECT_GROUP [PROJECT GROUP],                      
--p.REVENUE_TYPE as [PROJECT TYPE], 
--p.ENGAGAMENT_TYPE as [ENGAGEMENT TYPE], 
--P.COUNTRY [COUNTRY],                            
----CASE                          
----WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')                          
----THEN 'Improvement Plan submission Overdue'                          
----WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                          
----THEN 'Improvement Plan Completion Overdue'                          
----ELSE pa.status END 
-- pa.status AS [Action Item Status],                                    
                          
                         
--[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,         
--PA.ROOT_CAUSE AS ROOT_CAUSE,      
--PA.description as CORRECTIVE_ACTION_PLAN,       
--PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,      
--FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,                          
--FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                        
--FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                        
--FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,             
--p.proj_id,        
--c.Cust_ID AS [Customer_ID]     
-- ,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                       
                          
--FROM [CSS_BATCH_CUSTOMERS] b                              
--INNER JOIN project p                              
--ON p.proj_id = b.proj_id                  
--inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                    
--LEFT JOIN portfolio_project PR                              
--ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                            
--LEFT JOIN PORTFOLIO pp                              
--ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                            
--INNER JOIN customer c                              
--ON c.cust_id = b.cust_id                              
--INNER JOIN CSS_BATCHES bt                             
--ON bt.id = b.Batch_ID and bt.ISACTIVE = 1        and bt.FREQUENCY in ('Half-Yearly', 'Quarterly','Halfyearly')    
--INNER JOIN CSS_QUESTION_REPLIES QR                              
--ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                            
--LEFT JOIN PROJECT_ACTIONITEM PA                             
--ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.CSS_REFERENCE like '%' + qr.question +'%'     
--left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC    
--join CONTACTS co on co.CONTACT_EMAILID = b.EMAIL_ID and co.ISACTIVE = 1    
--WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                            
--AND (bt.start_date BETWEEN @StartDate AND @EndDate                              
--OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                        
-- AND (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,',')))                      
--UNION        
                      
--SELECT                              
--c.cust_nm AS [Customer Name],                              
--COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],                  
--[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,               
--b.DISPLAY_NAME AS [Respondent Name],     
--co.CONTACT_ROLE AS [Respondent Role], 
--B.EMAIL_ID AS [Email_Id],                              
--FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT SENT DATE],                              
--FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT RECEIVED DATE],  IS_VERIFIED,                            
--CASE                            
                             
--WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                          
--WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                         
--WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                         
--ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                             
--END        as                    
--[Quarter_Year],                              
--pp.TITLE [Portfolio],                              
--qr.QUESTION_CATEGORY,                              
--qr.PERSPECTIVE as PERSPECTIVE,                                
--case when qr.PERSPECTIVE ='Qualitative Feedback' then NULL else qr.RATING end as RATING,                               
--qr.RATING_DESCRIPTION,       
--qr.QUALITATIVE_CATEGORY as [SENTIMENT TYPE],
--qr.QUALITATIVE_STATUS as [SENTIMENT CATEGORY],
--qr.QUALITATIVE_REMARKS as [SENTIMENT REMARKS],
--(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                              
--(SELECT                              
--E.FRST_NM                              
--FROM project                              
--INNER JOIN EMP_INFO E                              
--ON E.EMP_ID = project.PROJ_DM_EMP_ID                              
--WHERE project.PROJ_ID = p.PROJ_ID)                              
--AS [Customer Success Manager],                              
--(SELECT                              
--E.FRST_NM                              
--FROM project                              
--INNER JOIN EMP_INFO E                              
--ON E.EMP_ID = project.PROJ_AM_EMP_ID                              
--WHERE project.PROJ_ID = p.PROJ_ID)                              
--AS [ACCOUNT MANAGER],                  
--(SELECT                                
--E.FRST_NM                                
--FROM project                                
--INNER JOIN EMP_INFO E                                
--ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                                
--WHERE project.PROJ_ID = p.PROJ_ID)                                
--AS [BU Head],                
-- '',  
-- '',
-- '',
--p.PROJ_STATUS,                                
--p.BUSINESS_UNIT AS [BUSINESS UNIT],                              
--P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                              
--P.METHODOLOGY AS [METHODOLOGY],                              
--P.DEPARTMENT AS [DEPARTMENT],                              
--P.PROJECT_GROUP [PROJECT GROUP],                     
--p.REVENUE_TYPE as [PROJECT TYPE],
--p.ENGAGAMENT_TYPE as [ENGAGEMENT TYPE], 
--P.COUNTRY [COUNTRY],                            
----CASE                          
----WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Open')       
----THEN 'Improvement Plan submission Overdue'                          
----WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                          
----THEN 'Improvement Plan Completion Overdue'                          
----ELSE pa.status END 
-- pa.status AS [Action Item Status],     

--[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,              
--PA.ROOT_CAUSE AS ROOT_CAUSE,      
--PA.description as CORRECTIVE_ACTION_PLAN,       
--PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,      
--FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,            
--FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                        
--FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                        
--FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,                 
--p.proj_id,        
--c.Cust_ID AS [Customer_ID]    
--,FORMAT(PA.PLANNED_CUST_DATE,'yyyy-MM-dd') as [Planned Customer Communication Date], FORMAT(PA.CLOSURE_ACTUAL_CUST_DATE,'yyyy-MM-dd')  as [Actual Customer Communication Date]
                        
--FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                              
--INNER JOIN CSS_BATCH_MONTHLY bt                              
--ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1                     
--inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                    
--INNER JOIN CSS_QUESTION_REPLIES QR                              
--ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1                            
--INNER JOIN customer c                              
--ON c.cust_id = b.cust_id                              
                         
                          
                           
--left join portfolio_products pps on b.prod_id = pps.id               
--left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7    and prs.ISACTIVE =1        
--LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)               
--LEFT JOIN portfolio_project PR                              
--ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1             
--LEFT JOIN PORTFOLIO pp                              
--ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1             
--LEFT JOIN PROJECT_ACTIONITEM PA                             
--ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1        and pa.description like '%' + qr.question +'%'       
--left join EMP_INFO emp on emp.EMP_ID = p.QUALITY_SPOC    
--join CONTACTS co on co.CONTACT_EMAILID = b.EMAIL_ID and co.ISACTIVE = 1    
--WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                            
--AND (bt.start_date BETWEEN @StartDate AND @EndDate                              
--OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                              
-- AND (@CUSTOMER='0' or  C.CUST_ID	in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  )
--ORDER BY [Year_Quarter], [Customer Name];                          
--END 

GO

IF NOT EXISTS(Select 1 from sys.tables where name ='DROPDOWN_OPTIONS' AND type='U')
BEGIN
CREATE table DROPDOWN_OPTIONS(
ID INT NOT NULL IDENTITY(1,1),
DD_NAME VARCHAR(50),
DD_VALUE VARCHAR(50),
DD_TEXT VARCHAR(50),
CREATED_BY VARCHAR(10),
CREATED_DATE  DATETIME,
UPDATED_BY VARCHAR(10),
UPDATED_DATE DATETIME,
ISACTIVE bit )

END
GO

----------------------------------------------------SQA Management Scripts ----------------------------------------------

IF NOT EXISTS(Select 1 from sys.tables where name ='AUDIT_EVIDENCE_DATA' AND type='U')
BEGIN
CREATE TABLE AUDIT_EVIDENCE_DATA (
    ID INT NOT NULL IDENTITY(1,1),
    FINDING_ID INT NOT NULL,
	STAGE_ID INT NOT NULL,
    ROOTCAUSE_ID INT NOT NULL,
    FILE_DATA_ID INT NOT NULL,
    CREATED_BY VARCHAR(10),
    CREATED_DATE  DATETIME,
    UPDATED_BY VARCHAR(10),
    UPDATED_DATE DATETIME,
    ISACTIVE bit
);

END

GO

Declare @RESOURCEID int = 828
Declare @EMPID varchar(10) = '104744'
Declare @RescourceName varchar(250) = 'SQA Management > Dashboard'

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
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,1,1,1,1,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

GO



Declare @RESOURCEID int = 829
Declare @EMPID varchar(10) = '104744'
Declare @RescourceName varchar(250) = 'CSAT Analysis'

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
(@RESOURCEID,7,'','','',null,@EMPID,@EMPID,1,1,1,1,1,1,1,getdate(),getdate()),
(@RESOURCEID,8,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,9,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,10,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,11,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,12,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate()),
(@RESOURCEID,13,'','','',null,@EMPID,@EMPID,0,0,0,0,0,1,1,getdate(),getdate())

End

GO
