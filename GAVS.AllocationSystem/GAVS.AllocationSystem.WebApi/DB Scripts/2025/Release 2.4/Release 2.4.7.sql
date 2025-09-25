
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
(@MODELID, 'Criteria'	,'How satisfied are you with Neurealm in terms of meeting their commitment on agreed deliverables?',GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,2,'Delivery',NULL,1,2,'Delivery Commitment'),
(@MODELID, 'Criteria'	,'How satisfied are you with Neurealm Team''s engagement and relationship with you and your team?',	GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,2,'Customer Relationship',NULL,1,3,'Customer Relationship'),
(@MODELID, 'Criteria'	,'How satisfied are you with Neurealm as a Partner adding value to your business?',	GETDATE(),'104744',GETDATE(),'104744',GETDATE(),1,NULL,2,'Partnership',NULL,1,4,'Value to The Business'),
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
('Annual',2,2025,'2025-04-01 00:00:00.000','2025-09-30 00:00:00.000','SURVEY SENT','102802',GETDATE(),'102802',GETDATE(),1,'Account')

END

GO
