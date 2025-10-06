
----ACSAT SCRIPTS----

DROP INDEX index3 ON css_batch_customers;
GO

 IF Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='css_batch_customers' and COLUMN_NAME='cust_id' and(DATA_TYPE <> 'varchar(50)'))
BEGIN
 alter table css_batch_customers alter column cust_id varchar(50) not null
END

GO

IF Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='css_batch_customers' and COLUMN_NAME='proj_id' and(DATA_TYPE <> 'varchar(50)'))
BEGIN
 alter table css_batch_customers alter column proj_id varchar(50)   null
END

GO

CREATE NONCLUSTERED INDEX index3 ON css_batch_customers (ISACTIVE, [STATUS]);

GO

IF Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='customer_projects' and COLUMN_NAME='proj_id' and(DATA_TYPE <> 'varchar(50)'))
BEGIN
    alter table customer_projects alter column proj_id varchar(50) null
END

GO

IF NOT exists (select 1 from configuration_ext WHERE [KEY]='CSS_QUESTION_MODEL_HALFYEARLY_ACCOUNT')   
BEGIN
insert into configuration_ext values
('CSS_QUESTION_MODEL_HALFYEARLY_ACCOUNT', 12, -1, null, null, 0, 1, null, null, null, '102802', getdate(), '102802', getdate())
END

GO

 IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MODELS WHERE MODEL_NAME ='ACSAT')   
 BEGIN

INSERT INTO CSS_QUESTION_MODELS VALUES ('ACSAT','CSAT Related questions','104744',getdate(),'104744',getdate(),1,'Account')

END

GO

DECLARE @MODELID INT

SET @MODELID = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME ='ACSAT')

 IF NOT EXISTS (SELECT 1 FROM CSS_QUESTION_MASTER WHERE MODEL_ID = @MODELID)   
 BEGIN

INSERT INTO CSS_QUESTION_MASTER( MODEL_ID
,QUESTION_CATEGORY
,QUESTION
,EFFECTIVE_FROM
,CREATED_BY
,CREATED_DATE
,UPDATED_BY
,UPDATED_DATE
,ISACTIVE
,QUESTION_DETAIL
,RATING_SCALE
,RATING_PARAM
,PARAM_CATEGORY
,TRIGGER_RCA
,[SEQUENCE]
,PERSPECTIVE)

VALUES (@MODELID, 'NPS'	,'How likely are you to recommend Neurealm (Formerly GS Lab | GAVS) to a friend or colleague, if asked for your advice?', GETDATE(),'104744',GETDATE(),'104744',GETDATE(),	1,NULL,2,'Net Promoter Score',NULL,1,1,'Net Promoter Score'),
(@MODELID, 'Criteria'	,'How satisfied are you with Neurealm in terms of meeting their commitment on agreed deliverables?',GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,2,'Delivery',NULL,1,2,'Meeting Delivery Commitments'),
(@MODELID, 'Criteria'	,'How satisfied are you with Neurealm Team''s engagement and relationship with you and your team?',	GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,2,'Customer Relationship',NULL,1,3,'Customer Engagement and Relationship'),
(@MODELID, 'Criteria'	,'How satisfied are you with Neurealm as a Partner adding value to your business?',	GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,2,'Partnership',NULL,1,4,'Partner adding value to Customer Business'),
(@MODELID, 'Others'	    ,'Please list your top expectations where Neurealm is doing well.', GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,3,NULL,NULL,1,5,NULL),
(@MODELID, 'Others'	    ,'Please list your top expectations where Neurealm can do better.',	GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,2,NULL,NULL,1,6,NULL)

END

GO
 IF NOT EXISTS (SELECT 1 FROM CSS_BATCHES WHERE CATEGORY ='Account')   
 BEGIN
INSERT INTO CSS_BATCHES(FREQUENCY
,SEQUENCE
,YEAR
,START_DATE
,END_DATE
,STATUS
,CREATED_BY
,CREATED_DATE
,UPDATED_BY
,UPDATED_DATE
,ISACTIVE
,CATEGORY) VALUES
('Annual',2,2025,'2025-04-01 00:00:00.000','2025-09-30 00:00:00.000','CREATED','102802',GETDATE(),'102802',GETDATE(),1,'Account')

END

GO

 IF EXISTS(Select 1 from sys.objects where name ='usp_insertHalfyearlyRespondedAccount' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[usp_insertHalfyearlyRespondedAccount] 
END
GO
 CREATE proc [dbo].[usp_insertHalfyearlyRespondedAccount]               
@customerName varchar(255),                
 
@respondentName varchar(255),                
@respondentEmail varchar(255),                
@respondentRole varchar(255)  ,              
 @spoc varchar(255)              
                 
 as                
 BEGIN                
                  
  declare @custId varchar(100) = ''                
  declare @contactId int                
                   
   select @custid = cust_id from customer where cust_nm =@customerName                
   if isnull( @custid  , '') = ''                  
   BEGIN                
   --RAISEERROR('invalid customer name'  );                
   --rollback;               
   --print 'here'              
   return;                
  END                
  --insert contact                
  if not exists (select 1 from contacts where contact_emailid = @respondentEmail and ISACTIVE =1)                
  BEGIN                
    insert into contacts                
   select @custid, @respondentName, @respondentRole,'CUSTOMER', @respondentEmail,'-', '102802', getdate(), 1, null, null, getdate(), '102802'                
                
   select @contactId = @@identity                
              
    print 'inserted contact'              
  END                
  ELSE                
  BEGIN                
   select @contactid = id from contacts where contact_emailid = @respondentEmail                 
    --print 'update'              
  END                
                
  declare @customerUserId int =0              
    --insert customer user                
  if not exists (select 1 from customer_users where EMAILID = @respondentEmail and ISACTIVE =1)                
  BEGIN                
    insert into customer_users                
   select @respondentEmail, @respondentName, null, null, 0, null, null, '102802', getdate(),'102802', getdate(),  1, 0, null               
                
   select @customerUserId = @@identity                
   print 'inserted customer_user'              
  END                
  ELSE                
  BEGIN                
 select @customerUserId = id from customer_users where EMAILID = @respondentEmail  and ISACTIVE =1                
 print 'updated Customer_user'              
 print @customerUserId            
  END              
              
  --customer projects              
              
   if not exists (select 1 from CUSTOMER_PROJECTS where CUSTOMER_USER_ID = @customerUserId AND PROJ_ID = null  and ISACTIVE =1 )                
  BEGIN                
  insert into CUSTOMER_PROJECTS                
    select @customerUserId, @custId, @customerName, null, @customerName, '102802', getdate(),'102802', getdate(),  1, 1, 'Annual',0, @spoc                
            
 print 'Inserted Customer_Project'              
                
  END                
  ELSE                
  BEGIN                
  update customer_projects set CSAT_FREQUENCY ='Annual', SPOC = @spoc, CSAT_SURVEY =1 where CUSTOMER_USER_ID = @customerUserId       and ISACTIVE =1      
  update css_batch_customers set SPOC = @spoc, is_verified =1 where EMAIL_ID = @respondentEmail  and  batch_id =36  and prod_id is null  and ISACTIVE =1 -- remove batchid check its temporary            
            
  print 'updated customer_project'              
  END              
                  
                  
 END

 GO

IF EXISTS(Select 1 from sys.objects where name ='reports_getCSSInitatedDetails' AND type='P')
BEGIN
       DROP PROCEDURE [dbo].[reports_getCSSInitatedDetails] 
END
GO
     
CREATE PROCEDURE [dbo].[reports_getCSSInitatedDetails]                      
                
@STARTDATE DATETIME,                      
@ENDDATE DATETIME ,
@CUSTOMER varchar(max)='0'
                
AS                      
BEGIN                      
                
SET @STARTDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@STARTDATE, 111 ) + ' 00:00:00', 111)                      
SET @ENDDATE = CONVERT(DATETIME, CONVERT(VARCHAR(11),@ENDDATE, 111 ) + ' 23:59:59', 111)                      
SELECT C.CUST_NM,          
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,        
p.Proj_nm , p.REVENUE_TYPE, CSS.STATUS,                      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,                      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,                     
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,                      
(select top 1 frst_nm from emp_info where emp_id = p.DP_ID) CSM,                      
(select top 1 email_id from emp_info where emp_id = p.DP_ID) CSM_MAIL,                      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,         
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD_MAIL,         
(select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,                      
(select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL, 
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP NAME],    
(select top 1 EMAIL_ID from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP MAIL],                       

CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,                      
[Year - Quarter] =  ( case when frequency='Annual' then  frequency  + ' - ' + Convert(varchar,  Year) else
(select Left( frequency,1) + Convert(varchar,sequence) + ' - ' + Convert(varchar,  Year) from  CSS_BATCHES where id= b.id ) end ),  
CASE When predicted_score is null then '-' else convert(varchar, convert(int,predicted_score)) end as PREDICTED_SCORE,
ACTUAL_SCORE = (case when MODEL_NAME ='ACSAT' then 
(select top 1 RATING from CSS_QUESTION_REPLIES where BATCH_CUSTOMER_ID = css.ID and QUESTION_CATEGORY = 'NPS'
and PERSPECTIVE = 'Net Promoter Score' )
else (select top 1 RATING from CSS_QUESTION_REPLIES where BATCH_CUSTOMER_ID = css.ID and QUESTION_CATEGORY = 'Criteria'
and PERSPECTIVE = 'Overall Experience' ) end ),
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
P.CUST_ID, P.PROJ_ID  , b.id, css.ID,
STUFF((select distinct ', ' + e.frst_nm from EMP_INFO e where ',' + spoc + ',' like '%,' + e.email_id + ',%' FOR XML PATH('')), 
    1, 1, '') AS [CSAT SPOC] 
FROM CSS_BATCH_CUSTOMERS CSS       
inner join CSS_QUESTION_MODELS cq on cq.id=css.QUESTION_MODEL_ID
INNER JOIN CSS_BATCHES B ON B.ID = CSS.BATCH_ID AND B.START_DATE >= @STARTDATE   AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
left JOIN PROJECT P on P.PROJ_ID = CSS.PROJ_ID                    
WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')    and css.ISACTIVE =1     
and  (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  ) 
                    
union                        
                    
SELECT C.CUST_NM,          
[Type of Account] =  dbo.fn_getTypeOfAccount (c.cust_id) ,            
coalesce( pp.product_title,P.PROJ_NM,'') as proj_nm, p.REVENUE_TYPE, CSS.STATUS,                      
CONVERT(VARCHAR(10), CSS.SURVEY_SENT_DATE, 110) AS CSS_SENT_DATE,                      
CONVERT(VARCHAR(10), CSS.SURVEY_RECEIVED_DATE, 110) AS CSS_RECEIVED_DATE, CSS.IS_VERIFIED,                     
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_PM_EMP_ID) PROJECT_MANAGER_MAIL,                      
(select top 1 frst_nm from emp_info where emp_id = p.DP_ID) CSM,                      
(select top 1 email_id from emp_info where emp_id = p.DP_ID) CSM_MAIL,                      
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_AM_EMP_ID) ACCOUNT_MANAGER_MAIL,           
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD,                      
(select top 1 email_id from emp_info where emp_id = p.PROJ_BUHEAD_EMP_ID) BU_HEAD_MAIL,        
(select top 1 frst_nm from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC,                      
(select top 1 email_id from emp_info where emp_id = p.QUALITY_SPOC) QUALITY_SPOC_MAIL,        
(select top 1 frst_nm from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP NAME],    
(select top 1 EMAIL_ID from emp_info where emp_id = p.PROJ_DM_EMP_ID) [DP MAIL],    
CSS.DISPLAY_NAME as CUSTOMER_NAME,CSS.EMAIL_ID as CUSTOMER_MAIL,                      
[Year - Quarter] =  (SELECT                      
CASE                      
                       
WHEN month BETWEEN 4 AND 6 THEN 'Q1 - '   + CONVERT(varchar, Year)                    
WHEN month BETWEEN 7 AND 9 THEN 'Q2 - '    + CONVERT(varchar, Year)                   
WHEN month BETWEEN 10 AND 12 THEN 'Q3 - '    + CONVERT(varchar, Year)                   
ELSE 'Q4 - ' + CONVERT(varchar, (Year-1))                       
END                      
FROM CSS_BATCH_MONTHLY where id= b.id ),    
'-',
ACTUAL_SCORE = (select top 1 RATING  from CSS_QUESTION_REPLIES where Batch_Customer_Monthly_id = css.ID and QUESTION_CATEGORY = 'Criteria' and PERSPECTIVE = 'Overall Experience' ),
p.PROJ_STATUS, p.BUSINESS_UNIT AS [BUSINESS UNIT], P.CONTRACTING_UNIT AS [CONTRACTING UNIT], P.METHODOLOGY AS [METHODOLOGY],                 
P.DEPARTMENT AS [DEPARTMENT], P.PROJECT_GROUP [PROJECT GROUP], p.REVENUE_TYPE as [PROJECT TYPE], P.COUNTRY [COUNTRY],                      
P.CUST_ID, P.PROJ_ID   , b.id, css.ID ,''                 
from CSS_BATCH_CUSTOMER_MONTHLY CSS                      
INNER JOIN CSS_BATCH_MONTHLY B ON B.ID = CSS.BATCH_MONTHLY_ID AND B.START_DATE >= @STARTDATE AND B.END_DATE <= @ENDDATE                      
INNER JOIN CUSTOMER C on C.CUST_ID = CSS.CUST_ID                      
                
left join portfolio_products pp on css.prod_id = pp.id           
left join PRODUCT_RESPONSIBLE pr on css.PROD_ID = pr.PRODUCT_ID and pr.MANAGEMENT_TYPE =7    and pr.ISACTIVE = 1    
LEFT JOIN PROJECT P on  P.PROJ_ID = coalesce(CSS.PROJ_ID , pr.project_id)            
WHERE CSS.STATUS   IN ('MAIL SENT', 'MAIL RE-SENT', 'COMPLETED')      and css.ISACTIVE =1    
and  (@CUSTOMER='0' or  C.CUST_ID in (SELECT * FROM [DBO].[FN_SPLITSTRING](@CUSTOMER,','))  ) 
order by C.CUST_NM, P.PROJ_ID                      
end 

GO