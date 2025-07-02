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
END  AS STATUS_TYPE, A.ISACTIVE,A.ACTION_PLAN,A.ACTION_TYPE,

CASE WHEN CHARINDEX('Criteria:', A.DESCRIPTION) > 0 THEN LTRIM(RTRIM(REPLACE(REPLACE(SUBSTRING(A.DESCRIPTION, 
CHARINDEX('Criteria:', A.DESCRIPTION) + 9,CHARINDEX(' - [', A.DESCRIPTION) - CHARINDEX('Criteria:', A.DESCRIPTION) - 9), CHAR(13), ''),
CHAR(10), ''))) END AS CSS_REFERENCE,

CASE WHEN CHARINDEX(' - [', A.DESCRIPTION) > 0 THEN CAST(SUBSTRING(A.DESCRIPTION,CHARINDEX(' - [', A.DESCRIPTION) + 4,
CHARINDEX(']', A.DESCRIPTION) - CHARINDEX(' - [', A.DESCRIPTION) - 4) AS INT)  END AS SCORE,

 CASE WHEN CHARINDEX('Remarks:', A.DESCRIPTION) > 0 THEN LTRIM(RTRIM(
 CASE WHEN CHARINDEX('CAPA:', A.DESCRIPTION) > CHARINDEX('Remarks:', A.DESCRIPTION)
 THEN SUBSTRING(A.DESCRIPTION, CHARINDEX('Remarks:', A.DESCRIPTION) + 8,
   CHARINDEX('CAPA:', A.DESCRIPTION) - CHARINDEX('Remarks:', A.DESCRIPTION) - 8) END)) END AS CUSTOMER_REMARKS  
  
FROM PROJECT_ACTIONITEM A                                        
INNER JOIN PROJECT P ON a.PROJECT_ID = p.PROJ_ID AND P.PROJ_ID IN (SELECT * FROM [DBO].[FN_SPLITSTRING](@PROJIDS,',')) AND A.ISACTIVE = 1                 
LEFT OUTER JOIN PORTFOLIO_PROJECT PP ON PP.PROJ_ID =  A.PROJECT_ID                      
LEFT OUTER JOIN PORTFOLIO PF ON PF.ID = PP.PORTFOLIO_ID                      
ORDER BY A.IDENTIFIED_DATE desc  
      
END 
GO


--css related
alter table css_question_models add CATEGORY varchar(250)  
update css_question_models set category ='Project'
update css_question_models set category ='Pulse' where model_name = 'Half Yearly'


alter table CSS_BATCHES add CATEGORY varchar(250)  
update CSS_BATCHES set category ='Project'
update CSS_BATCHES set category ='Pulse' where Frequency = 'Halfyearly'
 

 insert into css_batches values
 ('Half-Yearly', 1, 2025, '2025-1-1', '2025-6-30', 'CREATED', '102802', getdate(), '102802', getdate(), 1, 'Project')

 update css_batches set frequency ='Half-Yearly' where id = 35

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
 alter table css_question_master add PERSPECTIVE varchar(250)
alter table css_question_master add SEQUENCE int null
update css_question_master set perspective = rating_param

alter table css_question_replies add PERSPECTIVE varchar(250)


 update css_question_master set perspective = 'Overall Experience' where question like 'How satisfied are you with your overall experience%'
update css_question_master set perspective = 'Timeline Adherence' where question like 'How satisfied are you on the adherence to agreed%'
update css_question_master set perspective = 'Quality of Delivery' where question like 'How satisfied are you on the quality of agreed project deliverables%'
update css_question_master set perspective = 'Risk Management & Responsiveness' where question like 'How satisfied are you with the risks & issues managed%'
update css_question_master set perspective = 'Resource Competency' where question like 'How satisfied are you with the competency of the resources%'
update css_question_master set perspective = 'Thought Leadership' where question like 'How satisfied are you with the innovations and thought%'
update css_question_master set perspective = 'Timely Resource Fulfillment' where question like 'How satisfied are you with the onboarding of the resources%'

 
update css_question_master set sequence = 1 where question like 'How satisfied are you with your overall experience%'
update css_question_master set sequence = 2  where question like 'How satisfied are you on the adherence to agreed%'
update css_question_master set sequence = 3 where question like 'How satisfied are you on the quality of agreed project deliverables%'
update css_question_master set sequence = 5   where question like 'How satisfied are you with the risks & issues managed%'
update css_question_master set sequence = 4   where question like 'How satisfied are you with the competency of the resources%'
update css_question_master set sequence = 6   where question like 'How satisfied are you with the innovations and thought%'
update css_question_master set sequence = 7   where question like 'How satisfied are you with the onboarding of the resources%'

 

 
update css_question_master set isactive = 0 where  model_id in 
(10,
9,
8)
and QUESTION_CATEGORY ='nps'

 

update css_question_master set question = 'How satisfied are you with your Overall Experience while working with Neurealm (Formerly GS Lab | GAVS)?' where question like 'How satisfied are you with your overall experience%'
update css_question_master set question = 'How satisfied are you with the Risks & Issues managed by the project team and responsiveness to the concerns raised?' where question like 'How satisfied are you with the risks & Issues managed by the project team and responsiveness to the concerns raised?'
update css_question_master set question = 'How satisfied are you on the Quality of agreed project deliverables/ services provided?' where question like 'How satisfied are you on the quality of agreed project deliverables/ services provided?'
update css_question_master set question = 'How satisfied are you on the adherence to agreed Timelines/ SLA for the deliverables / services provided?' where question like 'How satisfied are you on the adherence to agreed Timelines/ SLA for the deliverables / services provided?'
update css_question_master set question = 'How satisfied are you with the Competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?' where question like 'How satisfied are you with the competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?'

update css_question_master set question = 'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Neurealm (Formerly GS Lab | GAVS)?' where question like 'How satisfied are you with the Innovations and Thought Leadership themes brought to the table by Neurealm (Formerly GS Lab | GAVS)?'
update css_question_master set question = 'How satisfied are you with the Onboarding of the resources / talents as per the expected timeline?' where question like 'How satisfied are you with the competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?'
 
 

 -- for csat contact
 alter table css_batch_customers add SPOC varchar(500) null
 alter table Customer_Projects add SPOC varchar(500) null

 go

 -- customer details
 	
	create proc usp_getContactsForAccount
	(
		@custId varchar(200)
	)
	as
	BEGIN
		select CONTACT_EMAILID as EMAIL_ID, CONTACT_NAME as DISPLAY_NAME, 1 as IS_ACTIVE from contacts where customer_id =@custId
		union 
		select email_id, FRST_NM , case when pr.END_DATE < getdate() then 0 else 1 end from  emp_info e 
		inner join proj_resource pr on pr.emp_id = e.emp_id inner join project p on p.proj_id = pr.proj_id  where  p.cust_id = @custId
    END









