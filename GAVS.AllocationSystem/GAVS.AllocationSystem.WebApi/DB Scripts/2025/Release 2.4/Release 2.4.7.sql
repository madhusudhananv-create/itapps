
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