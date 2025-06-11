IF EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE QUESTION like '%GAVS%')
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

UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with your Overall experience while working with Neurealm (Formerly GS Lab | GAVS)?' where id in(31,39,44,48) 


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with the risks & Issues managed by the project team and responsiveness to the concerns raised?' where id in(29,37) 


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with the competency of the resources / talents including understanding of business requirements and demonstrating technical expertise?' where id in(28,36,42)


UPDATE CSS_QUESTION_MASTER SET QUESTION = 'How satisfied are you with the onboarding of the resources / talents as per the expected timeline?' where id=43


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

 exec usp_insertConfigData 'CSS_CC_LIST_INDIAUK', '', '-1', null, '102802', ''
 exec usp_insertConfigData 'CSS_CC_LIST_NEWGROWTH', '', '-1', null, '102802', ''
 exec usp_insertConfigData 'CSS_CC_LIST_TECH', '', '-1', null, '102802', ''
 exec usp_insertConfigData 'CSS_CC_LIST_HEALTHCARE', '', '-1', null, '102802', ''
 












