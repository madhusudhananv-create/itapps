USE CSP 
Go

if exists (select 1 from CSP.. APP_ACCESS_CONTROLS where RESOURCE_ID = 39 and ROLE_ID = 4)
begin

update CSP.. APP_ACCESS_CONTROLS set VIEW_ACCESS = 1,CREATE_ACCESS = 1,EDIT_ACCESS = 0,DELETE_ACCESS = 0,DEFAULT_ACCESS = 0 where RESOURCE_ID = 39 and ROLE_ID = 4
	
end
go

if exists (select 1 from CSP.. APP_ACCESS_CONTROLS where RESOURCE_ID = 39 and ROLE_ID = 7)
begin

update CSP.. APP_ACCESS_CONTROLS set VIEW_ACCESS = 1 where RESOURCE_ID = 39 and ROLE_ID = 7

end
go

if exists (select 1 from csp..APP_ACCESS_CONTROLS where RESOURCE_ID = 805 and ROLE_ID = 4)
begin

update csp..APP_ACCESS_CONTROLS set VIEW_ACCESS = 1,CREATE_ACCESS = 1,EDIT_ACCESS = 1,DELETE_ACCESS =1,DEFAULT_ACCESS = 1 where RESOURCE_ID = 805 and ROLE_ID = 4

end
go

if not exists (select 1 from CSP..CSS_QUESTION_MODELS where MODEL_NAME = 'Monthly CSAT Model_1')
begin

insert into CSP..CSS_QUESTION_MODELS values ('Monthly CSAT Model_1','Monthly CSAT Related questions',104474,GETDATE(),104474,GETDATE(),1)

end
go

Declare @modelId int = (select id from CSP..CSS_QUESTION_MODELS where MODEL_NAME = 'Monthly CSAT Model_1')

if not exists (select 1 from CSP..CSS_QUESTION_MASTER where MODEL_ID = @modelId)
begin

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Overall quality of deliverables / services',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Enabling your success',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Value-adds / Initiatives directly impacting your success',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Others','Any other feedback / recommendation that you may like to mention:',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)


end
go

If not exists(Select 1 from sys.tables where name ='CONTACT_ROLES' AND type='U')
begin
create table CONTACT_ROLES
(
   ROLE_ID int identity,
   ROLE_NAME varchar(100),
   CREATED_BY int,
   CREATED_DATE datetime default getdate(),
   UPDATED_BY int,
   UPDATED_DATE datetime default getdate(),
   ISACTIVE bit default 1
)
end
go

if not exists (select 1 from csp..CONTACT_ROLES where ROLE_NAME in ('Leader','Manager'))
begin

insert into csp..CONTACT_ROLES  (ROLE_NAME,CREATED_BY,UPDATED_BY) values ('Leader',104474,104474),('Manager',104474,104474)

end
go

If not exists(select 1 from sys.columns 
          where name = 'ROLE_ID'
          AND Object_ID = Object_ID('contacts'))
begin
   
    alter table csp..contacts
	add ROLE_ID int  
	
end
go

if exists (select 1 from CSP..CONTACTS where CONTACT_NAME  in ('Sanchez Priscila','Todd Wilkes','Saima Khan',
	'Saji Rajasekharan',
	'Chris Ickert',
	'Ben Schwering',
	'Vinita Chauhan') and CUSTOMER_ID = 212100001)
begin
   
	update csp..contacts  set ROLE_ID = (select ROLE_ID from csp..CONTACT_ROLES where ROLE_NAME = 'Leader')  where CONTACT_NAME  in 
	('Sanchez Priscila','Todd Wilkes','Saima Khan',
	'Saji Rajasekharan','Chris Ickert',	'Ben Schwering',
	'Vinita Chauhan') and CUSTOMER_ID = 212100001

	update csp..contacts  set ROLE_ID = (select ROLE_ID from csp..CONTACT_ROLES where ROLE_NAME = 'Manager')  
	where CONTACT_NAME  not in ('Sanchez Priscila','Todd Wilkes','Saima Khan',
	'Saji Rajasekharan','Chris Ickert',	'Ben Schwering','Vinita Chauhan') and CUSTOMER_ID = 212100001

end
go

if not exists (select 1 from CSP..CSS_QUESTION_MODELS where MODEL_NAME = 'Monthly CSAT Model_2')
begin

insert into CSP..CSS_QUESTION_MODELS values ('Monthly CSAT Model_2','Monthly CSAT Related questions',104474,GETDATE(),104474,GETDATE(),1)

end
go

declare @modelId int = (select id from CSP..CSS_QUESTION_MODELS where MODEL_NAME = 'Monthly CSAT Model_2')

if not exists (select 1 from CSP..CSS_QUESTION_MASTER where MODEL_ID = @modelId)
begin

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Knowledge/Understanding of Customer Business requirements',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Meeting agreed deadlines / SLA for deliverables / services',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Demonstrating expertise in required technical area',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Team participation in solving issues / problems in an expected time line',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Criteria','Overall Quality of deliverables / Services ',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

insert into CSP..CSS_QUESTION_MASTER values (@modelId,'Others','Any other feedback / recommendation that you may like to mention:',GETDATE(),104474,GETDATE(),104474,GETDATE(),1,null)

end
go