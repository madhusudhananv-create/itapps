
USE BAS 
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'START_DATE'
          AND Object_ID = Object_ID('CONFIGURATION_EXT'))
BEGIN
    
    ALTER TABLE bas..CONFIGURATION_EXT
	ADD START_DATE Datetime
	
END
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns 
          WHERE NAME = 'END_DATE'
          AND Object_ID = Object_ID('CONFIGURATION_EXT'))
BEGIN
    
    ALTER TABLE bas..CONFIGURATION_EXT
	ADD END_DATE Datetime
	
END
GO

if not exists (select 1 from BAS..CONFIGURATION_EXT where [KEY]='CSS_QUESTION_MODEL')
begin

insert into BAS..CONFIGURATION_EXT values ('CSS_QUESTION_MODEL',1,-1,null,null,0,1,null,null)

end

if not exists (select 1 from BAS..CONFIGURATION_EXT where [KEY]='CSS_QUESTION_MODEL_MONTHLY')
begin

  insert into BAS..CONFIGURATION_EXT values ('CSS_QUESTION_MODEL_MONTHLY',(select id from CSP..CSS_QUESTION_MODELS where MODEL_NAME = 'Monthly CSAT Model_1'),212100001,null,null,0,1,null,null)

end
go

if not exists (select 1 from BAS..CONFIGURATION_EXT where [KEY]='CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_1')
begin

  insert into BAS..CONFIGURATION_EXT values ('CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_1',(select id from CSP..CSS_QUESTION_MODELS where MODEL_NAME = 'Monthly CSAT Model_1'),212100001,null,null,0,1,'2021-10-01','2021-10-31')
  
end
go

if not exists (select 1 from BAS..CONFIGURATION_EXT where [KEY]='CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_2')
begin

  insert into BAS..CONFIGURATION_EXT values ('CSS_QUESTION_MODEL_MONTHLY_ROLE_ID_2',(select id from CSP..CSS_QUESTION_MODELS where MODEL_NAME = 'Monthly CSAT Model_2'),212100001,null,null,0,1,'2021-10-01','2021-10-31')

end
go