IF EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE QUESTION like '%GAVS%') AND not exists(SELECT 1 FROM CSS_QUESTION_MASTER WHERE QUESTION like '%Neurealm%')
BEGIN
    UPDATE CSS_QUESTION_MASTER set QUESTION = REPLACE(question,'GS Lab | GAVS','Neurealm (Formerly GS Lab | GAVS)') from CSS_QUESTION_MASTER 
where QUESTION like '%GAVS%'
END

IF EXISTS (SELECT 1 FROM CONTACTS where CONTACT_TYPE ='GAVS')
BEGIN
UPDATE CONTACTS SET CONTACT_TYPE = 'Neurealm' where CONTACT_TYPE ='GAVS'
END

GO

IF EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER)
BEGIN

UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with your Overall Experience while working with Neurealm (Formerly GS Lab | GAVS)?' where id in(31,39,44,48) 


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with the Risks & Issues managed by the project team and responsiveness to the concerns raised?' where id in(29,37) 


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with the Competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?' where id in(28,36,42)


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with the Onboarding of the Resources / Talents as per the expected timeline?' where id=43


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with Neurealm (Formerly GS Lab | GAVS) in terms of the ability to understand and deliver to your project/ business needs?' where id=50


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Neurealm (Formerly GS Lab | GAVS)?' where id in(30,38,51)


END

GO

IF EXISTS(Select 1 from sys.objects where name ='getActionItemsViewDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[getActionItemsViewDetails] 
END

GO
CREATE PROCEDURE [dbo].[getActionItemsViewDetails]                    
    
@PROJIDS VARCHAR(MAX)                    
      
AS   
  
BEGIN  
  
SELECT DISTINCT P.CUST_ID AS CUST_ID, [PROJECT_ID] AS PROJ_ID, P.PROJ_NM, PP.PORTFOLIO_ID, isnull(A.PORTFOLIO, '') AS PORTFOLIO_NAME, A.ORIGINAL_DESCRIPTION,      
A.ID AS ACTION_ITEM_ID, A.RAG, A.DESCRIPTION, A.SOURCE,   
SOURCE_DESCRIPTION = CASE WHEN CHARINDEX(',', A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION) + 1) > 0   
            THEN LEFT(A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION, CHARINDEX(',', A.SOURCE_DESCRIPTION) + 1) - 1)  
            ELSE A.SOURCE_DESCRIPTION END,   
A.OWNER, A.IDENTIFIED_DATE, A.TARGET_DATE, A.STATUS,    
A.PLANNED_TARGET_DATE, A.PLANNED_ACTUAL_DATE, A.BATCH_CUSTOMER_ID, A.BATCH_CUSTOMER_MONTHLY_ID,A.ROOT_CAUSE,  
A.PRIORITY, A.COMPLETION_DATE, A.COMMENTS, A.CREATED_DATE, A.CREATED_BY, A.UPDATED_BY, A.UPDATED_DATE,                      
                      
CASE WHEN (A.TARGET_DATE < GETDATE() AND A.STATUS  IN ('Planned' , 'Started', 'Identified')) THEN 'PAST_DUE_DATE'                
WHEN  (A.TARGET_DATE >= GETDATE() AND A.STATUS  IN ('Planned' , 'Started',  'Identified')) THEN 'DUE_FOR_CLOSURE'                           
END  AS STATUS_TYPE, A.ISACTIVE,A.PREVENTIVE_ACTION_PLAN,

CASE WHEN CSS_REFERENCE like'Question:%' and CHARINDEX('Question:', A.CSS_REFERENCE) > 0 THEN LTRIM(RTRIM(REPLACE(REPLACE(SUBSTRING(A.CSS_REFERENCE, 
CHARINDEX('Question:', A.CSS_REFERENCE) + 9,CHARINDEX('Rating', A.CSS_REFERENCE) - CHARINDEX('Question:', A.CSS_REFERENCE) - 9), CHAR(13), ''),
CHAR(10), '')))  else NULL END AS CSS_REFERENCE,

CASE WHEN CSS_REFERENCE like'Question:%' and CHARINDEX('Rating:', A.CSS_REFERENCE) > 0 THEN cast(LTRIM(RTRIM(REPLACE(REPLACE(SUBSTRING(A.CSS_REFERENCE, 
CHARINDEX('Rating:', A.CSS_REFERENCE) + 7,CHARINDEX('Remarks', A.CSS_REFERENCE) - CHARINDEX('Rating:', A.CSS_REFERENCE) - 7), CHAR(13), ''),
CHAR(10), ''))) as int) else NULL END AS SCORE,


CASE WHEN CSS_REFERENCE like'Question:%' and CHARINDEX('Remarks:', A.CSS_REFERENCE) > 0 THEN LTRIM(RTRIM(SUBSTRING(A.CSS_REFERENCE, 
CHARINDEX('Remarks:', A.CSS_REFERENCE) +len('Remarks:'),len(a.CSS_REFERENCE)))) else NULL END AS CUSTOMER_REMARKS 
  
FROM PROJECT_ACTIONITEM A                                        
INNER JOIN PROJECT P ON a.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,',')) AND A.ISACTIVE = 1                 
LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJECT_ID                      
LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID                      
ORDER BY A.IDENTIFIED_DATE desc 
      
END 
GO


--css related
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'css_question_models' AND COLUMN_NAME='CATEGORY') 
BEGIN
    alter table css_question_models add CATEGORY varchar(250) 
END

If  exists (select 1 from css_question_models)  --doubt
BEGIN
    update css_question_models set category ='Project'
END

If  exists (select 1 from css_question_models where model_name = 'Half Yearly')
BEGIN
    update css_question_models set category ='Pulse' where model_name = 'Half Yearly'
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'CSS_BATCHES' AND COLUMN_NAME='CATEGORY') 
BEGIN
    alter table CSS_BATCHES add CATEGORY varchar(250)  
END 

If  exists (select 1 from CSS_BATCHES)  --doubt
BEGIN
    update CSS_BATCHES set category ='Project'
END

If exists (select 1 from css_question_models where Frequency = 'Halfyearly')
BEGIN
    update CSS_BATCHES set category ='Pulse' where Frequency = 'Halfyearly'
END

 If  exists (select 1 from css_batches where Frequency = 'Half-Yearly' and sequence=1)   --doubt
 BEGIN
    insert into css_batches values('Half-Yearly', 1, 2025, '2025-1-1', '2025-6-30', 'CREATED', '102802', getdate(), '102802', getdate(), 1, 'Project')
 END

 If exists (select 1 from css_batches where id=35)
 BEGIN
    update css_batches set frequency ='Half-Yearly' where id = 35
 END
 go

  CREATE proc usp_insertConfigData
  (
     @key varchar(2000),
     @value varchar(max),
     @custid  varchar(2000),
     @projid  varchar(2000),	
     @createdby   varchar(2000),
     @comments  varchar(2000)
 )
 as
 BEGIN 

      IF NOT EXISTS (SELECT * FROM configuration_ext WHERE [KEY]=@key)
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
      @key,  
        @value,     
                    
        @custid,               
        @projid,  
	    @comments,
        1,                  
        @createdby    ,  
        GETDATE(),          
       @createdby,        
        GETDATE()           
    );
    END
END
GO

 exec usp_insertConfigData 'CSS_CC_LIST_INDIAUK', 'mandeep.singh@neurealm.com,rajaneesh.k@gavstech.com', '-1', null, '102802', ''
 exec usp_insertConfigData 'CSS_CC_LIST_NEWGROWTH', 'sriram.radhakrishnan@neurealm.com,rajaneesh.k@gavstech.com', '-1', null, '102802', ''
 exec usp_insertConfigData 'CSS_CC_LIST_TECH', 'niraj.nadkar@neurealm.com,rajaneesh.k@gavstech.com', '-1', null, '102802', ''
 exec usp_insertConfigData 'CSS_CC_LIST_HEALTHCARE', 'srinivasan.m@neurealm.com,rajaneesh.k@gavstech.com', '-1', null, '102802', ''
 

 GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'css_question_master' AND COLUMN_NAME='PERSPECTIVE') 
BEGIN
    alter table css_question_master add PERSPECTIVE varchar(250)
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'css_question_master' AND COLUMN_NAME='SEQUENCE') 
BEGIN
    alter table css_question_master add SEQUENCE int null
END


If exists (select 1 from css_question_master)  --doubt
BEGIN
    update css_question_master set perspective = rating_param
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'css_question_replies' AND COLUMN_NAME='PERSPECTIVE') 
BEGIN
    alter table css_question_replies add PERSPECTIVE varchar(250)
END


If exists ( select 1 from css_question_master)  --doubt
BEGIN
    update css_question_master set perspective = 'Overall Experience' where question like 'How satisfied are you with your overall experience%'
    update css_question_master set perspective = 'Timeline Adherence' where question like 'How satisfied are you on the adherence to agreed%'
    update css_question_master set perspective = 'Quality of Delivery' where question like 'How satisfied are you on the quality of agreed project deliverables%'
    update css_question_master set perspective = 'Risk Management & Responsiveness' where question like 'How satisfied are you with the risks & issues managed%'
    update css_question_master set perspective = 'Resource Competency' where question like 'How satisfied are you with the competency of the resources%'
    update css_question_master set perspective = 'Thought Leadership' where question like 'How satisfied are you with the innovations and thought%'
    update css_question_master set perspective = 'Timely Resource Fulfillment' where question like 'How satisfied are you with the onboarding of the resources%'
END
 
If exists ( select 1 from css_question_master)
BEGIN
    update css_question_master set sequence = 1 where question like 'How satisfied are you with your overall experience%'
    update css_question_master set sequence = 2  where question like 'How satisfied are you on the adherence to agreed%'
    update css_question_master set sequence = 3 where question like 'How satisfied are you on the quality of agreed project deliverables%'
    update css_question_master set sequence = 5   where question like 'How satisfied are you with the risks & issues managed%'
    update css_question_master set sequence = 4   where question like 'How satisfied are you with the competency of the resources%'
    update css_question_master set sequence = 6   where question like 'How satisfied are you with the innovations and thought%'
    update css_question_master set sequence = 7   where question like 'How satisfied are you with the onboarding of the resources%'
END
 



If exists (select 1 from css_question_master where model_id in (10,9,8)and QUESTION_CATEGORY ='nps')
BEGIN
    update css_question_master set isactive = 0 where  model_id in 
    (10,
    9,
    8)
    and QUESTION_CATEGORY ='nps'
END

 
If exists ( select 1 from css_question_master where question like 'How satisfied are you%')
BEGIN
    update css_question_master set question = 'How satisfied are you with your Overall Experience while working with Neurealm (Formerly GS Lab | GAVS)?' where question like 'How satisfied are you with your overall experience%'
    update css_question_master set question = 'How satisfied are you with the Risks & Issues managed by the project team and responsiveness to the concerns raised?' where question like 'How satisfied are you with the risks & Issues managed by the project team and responsiveness to the concerns raised?'
    update css_question_master set question = 'How satisfied are you on the Quality of agreed project deliverables/ services provided?' where question like 'How satisfied are you on the quality of agreed project deliverables/ services provided?'
    update css_question_master set question = 'How satisfied are you on the adherence to agreed Timelines/ SLA for the deliverables / services provided?' where question like 'How satisfied are you on the adherence to agreed Timelines/ SLA for the deliverables / services provided?'
    update css_question_master set question = 'How satisfied are you with the Competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?' where question like 'How satisfied are you with the competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?'
    update css_question_master set question = 'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Neurealm (Formerly GS Lab | GAVS)?' where question like 'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Neurealm (Formerly GS Lab | GAVS)?'
    update css_question_master set question = 'How satisfied are you with the Onboarding of the resources / talents as per the expected timeline?' where question like 'How satisfied are you with the competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?'
END

 -- for csat contact
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'css_batch_customers' AND COLUMN_NAME='SPOC') 
Begin
 alter table css_batch_customers add SPOC varchar(500) null
end
 IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Customer_Projects' AND COLUMN_NAME='SPOC') 
Begin
 alter table Customer_Projects add SPOC varchar(500) null
end

 go

 -- customer details
 	
	
	Create proc usp_getContactsForAccount
	(
		@custId varchar(200)
	)
	as
	BEGIN
		select CONTACT_EMAILID as EMAIL_ID, CONTACT_NAME as DISPLAY_NAME, convert(bit, 1) as IS_ACTIVE from contacts where customer_id =@custId
		union 
		select email_id, FRST_NM , case when ( pr.END_DATE < getdate()) then convert(bit,0) else convert(bit, 1) end from  emp_info e 
		inner join proj_resource pr on pr.emp_id = e.emp_id inner join project p on p.proj_id = pr.proj_id  where  p.cust_id = @custId   and dor is null 
   end

 --CSAT Action Item


IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME='ACTION_TYPE') 
BEGIN
ALTER TABLE PROJECT_ACTIONITEM DROP COLUMN ACTION_TYPE;
END

GO
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME='ACTION_PLAN') 
BEGIN
ALTER TABLE PROJECT_ACTIONITEM DROP COLUMN ACTION_PLAN;
END
GO
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ACTIONITEM' AND COLUMN_NAME='PREVENTIVE_ACTION_PLAN') 
BEGIN
ALTER TABLE PROJECT_ACTIONITEM ADD PREVENTIVE_ACTION_PLAN varchar(max);
END
GO

IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Halfyearly' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_CSAT_Halfyearly] 
END

GO
CREATE PROCEDURE [dbo].[reports_CSAT_Halfyearly]                         
                        
@StartDate date,                       
@EndDate date                          
                      
AS                        
                      
BEGIN                          
                        
SELECT                          
c.cust_nm AS [Customer Name],                          
p.proj_nm AS [Project Name],            
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,           
display_name AS [Respondent Name],                          
B.EMAIL_ID AS [Email_Id],                          
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                          
[CSAT sent Date],                          
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                        
[Half_Year] = 'H' + CASE     
        WHEN bt.sequence IN (1 ) THEN '1'    
        WHEN bt.sequence IN (2) THEN '2'    
    END + ' - ' + CONVERT(varchar, bt.Year),                   
pp.TITLE AS [Portfolio],                          
qr.QUESTION_CATEGORY,                          
qr.QUESTION,                          
qr.RATING,                          
qr.RATING_DESCRIPTION,              
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                          
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
AS [ACCOUNT MANAGER],               
(SELECT                            
E.FRST_NM                            
FROM project                            
INNER JOIN EMP_INFO E                            
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                            
WHERE project.PROJ_ID = B.PROJ_ID)                            
AS [BU Head],                
           
             
p.PROJ_STATUS,                         
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                          
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                          
P.METHODOLOGY AS [METHODOLOGY],                          
P.DEPARTMENT AS [DEPARTMENT],                          
P.PROJECT_GROUP [PROJECT GROUP],                  
p.REVENUE_TYPE as [PROJECT TYPE],              
P.COUNTRY [COUNTRY],                        
CASE                      
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                      
THEN 'Improvement Plan submission Overdue'                      
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                      
THEN 'Improvement Plan Completion Overdue'                      
ELSE pa.status                       
END AS [Action Item Status],                      
                      
                     
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,  
PA.ROOT_CAUSE AS ROOT_CAUSE,
PA.description as CORRECTIVE_ACTION_PLAN, 
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,                      
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                    
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                    
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,         
p.proj_id,    
c.Cust_ID AS [Customer_ID]                         
                    
                      
FROM [CSS_BATCH_CUSTOMERS] b                          
INNER JOIN project p                          
ON p.proj_id = b.proj_id              
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID                
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
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                    
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1 and bt.FREQUENCY ='halfyearly'                       
AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                    
                  
--UNION    
                  
--SELECT                          
--c.cust_nm AS [Customer Name],                          
--COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],              
--[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,           
--b.DISPLAY_NAME AS [Respondent Name],                          
--B.EMAIL_ID AS [Email_Id],                          
--FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],                          
--FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                        
--CASE                        
--    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 1 AND 6 THEN 'H1 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                      
--    WHEN MONTH(b.SURVEY_SENT_DATE) BETWEEN 7 AND 12 THEN 'H2 - ' + CONVERT(varchar, YEAR(b.SURVEY_SENT_DATE))                                     
--END AS [HALF_Year],                          
--pp.TITLE [Portfolio],                          
--qr.QUESTION_CATEGORY,                          
--qr.QUESTION,                          
--qr.RATING,                          
--qr.RATING_DESCRIPTION,              
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
             
--p.PROJ_STATUS,                            
--p.BUSINESS_UNIT AS [BUSSINESS UNIT],                          
--P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                          
--P.METHODOLOGY AS [METHODOLOGY],                          
--P.DEPARTMENT AS [DEPARTMENT],                          
--P.PROJECT_GROUP [PROJECT GROUP],                 
--p.REVENUE_TYPE as [PROJECT TYPE],              
--P.COUNTRY [COUNTRY],                        
--CASE                      
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                      
--THEN 'Improvement Plan submission Overdue'                      
--WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                      
--THEN 'Improvement Plan Completion Overdue'                      
--ELSE pa.status                       
--END AS [Action Item Status],                        
--PA.description as [Action Item Description],                  
--[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,                
--FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,        
--FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                    
--FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                    
--FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,             
--p.proj_id,    
--c.Cust_ID AS [Customer_ID]                    
                    
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
--WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                        
--AND (bt.start_date BETWEEN @StartDate AND @EndDate                          
--OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                          
ORDER BY [Half_Year], [Customer Name];                          
    
    
                        
END 
GO
IF EXISTS(Select 1 from sys.objects where name ='reports_CSAT_Combined' AND type='P')
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
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id)  ,         
display_name AS [Respondent Name],                        
B.EMAIL_ID AS [Email_Id],                        
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS                        
[CSAT sent Date],                        
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                      
[Year_Quarter] = 'Q' + CONVERT(varchar, bt.sequence) + ' - ' + CONVERT(varchar, bt.Year),  
pp.TITLE AS [Portfolio],                        
qr.QUESTION_CATEGORY,                        
qr.QUESTION,                        
qr.RATING,                        
qr.RATING_DESCRIPTION,            
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                        
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
AS [ACCOUNT MANAGER],             
(SELECT                          
E.FRST_NM                          
FROM project                          
INNER JOIN EMP_INFO E                          
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                          
WHERE project.PROJ_ID = B.PROJ_ID)                          
AS [BU Head],              
         
           
p.PROJ_STATUS,                       
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                        
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                        
P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],                        
P.PROJECT_GROUP [PROJECT GROUP],                
p.REVENUE_TYPE as [PROJECT TYPE],            
P.COUNTRY [COUNTRY],                      
CASE                    
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                    
THEN 'Improvement Plan submission Overdue'                    
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                    
THEN 'Improvement Plan Completion Overdue'                    
ELSE pa.status                     
END AS [Action Item Status],                    
                    
                   
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,   
PA.ROOT_CAUSE AS ROOT_CAUSE,
PA.description as CORRECTIVE_ACTION_PLAN, 
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,                    
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                  
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                  
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,       
p.proj_id,  
c.Cust_ID AS [Customer_ID]                       
                  
                    
FROM [CSS_BATCH_CUSTOMERS] b                        
INNER JOIN project p                        
ON p.proj_id = b.proj_id            
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID              
LEFT JOIN portfolio_project PR                        
ON PR.PROJ_ID = P.PROJ_ID and PR.ISACTIVE = 1                      
LEFT JOIN PORTFOLIO pp                        
ON pr.PORTFOLIO_ID = pp.ID and pp.ISACTIVE = 1                      
INNER JOIN customer c                        
ON c.cust_id = b.cust_id                        
INNER JOIN CSS_BATCHES bt                       
ON bt.id = b.Batch_ID and bt.ISACTIVE = 1        and bt.FREQUENCY = 'Quarterly'           
INNER JOIN CSS_QUESTION_REPLIES QR                        
ON QR.BATCH_CUSTOMER_ID = b.ID and QR.ISACTIVE = 1                      
LEFT JOIN PROJECT_ACTIONITEM PA                       
ON B.ID  = PA.BATCH_CUSTOMER_ID AND PA.ISACTIVE =1    and pa.description like '%' + qr.question +'%'                  
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                      
AND (bt.start_date BETWEEN @StartDate AND @EndDate                        
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                  
                
UNION  
                
SELECT                        
c.cust_nm AS [Customer Name],                        
COALESCE( pps.PRODUCT_TITLE,P.PROJ_NM,'') AS [Project Name],            
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,         
b.DISPLAY_NAME AS [Respondent Name],                        
B.EMAIL_ID AS [Email_Id],                        
FORMAT(b.SURVEY_SENT_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT sent Date],                        
FORMAT(b.SURVEY_RECEIVED_DATE, 'dd-MMM-yyy', 'EN-us') AS [CSAT received Date],  IS_VERIFIED,                      
CASE                      
                       
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                    
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                   
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                   
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                       
END        as              
[Quarter_Year],                        
pp.TITLE [Portfolio],                        
qr.QUESTION_CATEGORY,                        
qr.QUESTION,                        
qr.RATING,                        
qr.RATING_DESCRIPTION,            
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                        
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
AS [ACCOUNT MANAGER],            
(SELECT                          
E.FRST_NM                          
FROM project                          
INNER JOIN EMP_INFO E                          
ON E.EMP_ID = project.PROJ_BUHEAD_EMP_ID                          
WHERE project.PROJ_ID = p.PROJ_ID)                          
AS [BU Head],          
           
p.PROJ_STATUS,                          
p.BUSINESS_UNIT AS [BUSSINESS UNIT],                        
P.CONTRACTING_UNIT AS [CONTRACTING UNIT],                        
P.METHODOLOGY AS [METHODOLOGY],                        
P.DEPARTMENT AS [DEPARTMENT],                        
P.PROJECT_GROUP [PROJECT GROUP],               
p.REVENUE_TYPE as [PROJECT TYPE],            
P.COUNTRY [COUNTRY],                      
CASE                    
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(day, -7, GETDATE()) AND pa.status IN ('Identified')                    
THEN 'Improvement Plan submission Overdue'                    
WHEN b.SURVEY_RECEIVED_DATE <= DATEADD(week, -4, GETDATE()) AND pa.status NOT IN ('Completed')                    
THEN 'Improvement Plan Completion Overdue'                    
ELSE pa.status                     
END AS [Action Item Status],                      
               
[Voice of Customer url] ='https://csm.neurealm.com/CustomerSuccessSurvey/' + i.survey_Id,        
PA.ROOT_CAUSE AS ROOT_CAUSE,
PA.description as CORRECTIVE_ACTION_PLAN, 
PREVENTIVE_ACTION_PLAN AS PREVENTIVE_ACTION_PLAN,
FORMAT(PA.TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_TARGET_DATE,      
FORMAT(PA.COMPLETION_DATE,'yyyy-MM-dd') as ACTION_PLAN_SUBMISSION_ACTUAL_DATE,                  
FORMAT(PA.PLANNED_TARGET_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_TARGET_DATE,                  
FORMAT(PA.PLANNED_ACTUAL_DATE,'yyyy-MM-dd') as ACTION_PLAN_COMPLETION_ACTUAL_DATE,           
p.proj_id,  
c.Cust_ID AS [Customer_ID]                  
                  
FROM [CSS_BATCH_CUSTOMER_MONTHLY] b                        
INNER JOIN CSS_BATCH_MONTHLY bt                        
ON bt.id = b.BATCH_MONTHLY_ID  and bt.ISACTIVE = 1               
inner join CSS_SURVEY_ITERATION i on b.SURVEY_ID = i.ID              
INNER JOIN CSS_QUESTION_REPLIES QR                        
ON QR.Batch_Customer_Monthly_id = b.ID and QR.ISACTIVE = 1                      
INNER JOIN customer c                        
ON c.cust_id = b.cust_id                        
                   
                    
                     
left join portfolio_products pps on b.prod_id = pps.id         
left join PRODUCT_RESPONSIBLE prs on b.PROD_ID = prs.PRODUCT_ID and prs.MANAGEMENT_TYPE =7    and prs.ISACTIVE =1  
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(b.PROJ_ID , prs.project_id)         
LEFT JOIN portfolio_project PR                        
ON PR.PROJ_ID = P.PROJ_ID  and PR.ISACTIVE = 1       
LEFT JOIN PORTFOLIO pp                        
ON pr.PORTFOLIO_ID = pp.ID  and pp.ISACTIVE = 1       
LEFT JOIN PROJECT_ACTIONITEM PA                       
ON B.ID  = PA.BATCH_CUSTOMER_MONTHLY_ID AND PA.ISACTIVE =1        and pa.description like '%' + qr.question +'%'                  
WHERE b.STATUS = 'COMPLETED' and b.ISACTIVE = 1                      
AND (bt.start_date BETWEEN @StartDate AND @EndDate                        
OR bt.ENd_date BETWEEN @StartDate AND @EndDate)                        
ORDER BY [Year_Quarter], [Customer Name];                    
END   

 GO
