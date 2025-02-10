
--Note for guna - Make it rerunnable
alter table task alter column SCHEDULED_DURATION decimal(11,2) null


IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PROJECT_ISSUE' 
AND COLUMN_NAME = 'ISSUE_TITLE')
BEGIN
    ALTER TABLE PROJECT_ISSUE ADD ISSUE_TITLE VARCHAR(255) null;
END


 if not exists(select * from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE = 'CUSTOMER CSAT HALFYEARLY')
 BEGIN
	insert into PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE values ('CUSTOMER CSAT HALFYEARLY', '102802', GETDATE(), '102802', GETDATE(), 1)
 END

 if   exists(select * from PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE where MANAGEMENT_TYPE = 'CUSTOMER_CSAT')
 BEGIN
	update PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE  set MANAGEMENT_TYPE ='CUSTOMER CSAT QUARTERLY' where MANAGEMENT_TYPE ='CUSTOMER_CSAT'
 END

 -- script for css verification
 INSERT INTO CSS_QUESTION_MODELS (MODEL_NAME,COMMENTS,CREATED_BY,CREATED_DATE,UPDATED_BY,UPDATED_DATE,ISACTIVE)
VALUES
('Half Yearly','CSAT Related questions','106797',GETDATE(),'106797',GETDATE(),1)

declare @modelId int = (SELECT ID FROM CSS_QUESTION_MODELS WHERE MODEL_NAME='Half Yearly')
INSERT INTO CSS_QUESTION_MASTER (MODEL_ID,QUESTION,CREATED_DATE,CREATED_BY, EFFECTIVE_FROM, UPDATED_BY,UPDATED_DATE,ISACTIVE,QUESTION_CATEGORY,
RATING_SCALE,RATING_PARAM,TRIGGER_RCA)
VALUES 

(@modelid,'How satisfied are you with your Overall experience while working with GS Lab | GAVS?',GETDATE(),'106797',GETDATE(),'106797',GETDATE(),
1,'Criteria',2,'Overall  Experience',1),
(@modelid,'How satisfied are you with GS Lab | GAVS in terms of meeting their commitment on deliverables?',GETDATE(),'106797',GETDATE(),'106797',
GETDATE(),1,'Criteria',2,'Delivery',1),
(@modelid,'GS Lab | GAVS has the ability to understand and deliver to your project/ business needs',GETDATE(),'106797',GETDATE(),'106797',GETDATE(),
1,'Criteria',3,'Capability',1),
(@modelid,'GS Lab | GAVS is able to add value to your business by proactively coming up with actions, suggestions or sharing information that has a
positive impact on your business.',GETDATE(),'106797',GETDATE(),'106797',GETDATE(),1,'Criteria',3,'Value add',1),
(@modelid,'How satisfied are you with GS Lab | GAVS in terms of their efforts to build, nurture and manage the relationship with your team 
successfully?',GETDATE(),'106797',GETDATE(),'106797',GETDATE(),1,'Criteria',2,'Relationship',1),
(@modelid,'How likely are you to recommend GS Lab | GAVS to a friend or colleague, if asked for your advice?',GETDATE(),'106797',GETDATE(),'106797',
GETDATE(),1,'NPS',2,'NPS',1) 

alter table CSS_QUESTION_REPLIES add RATING_SCALE int null

go
create procedure getHalfyearlyCSATCustomerList
(
@customerid varchar(100) = null
)
as
select cu.cust_nm, pp.product_title,  pmt.MANAGEMENT_TYPE, pr.emp_id as Contact_Email
, c.contact_name, c.contact_role  , 
(replace(replace(
stuff((
 select ', ', proj_nm as a from product_responsible pr
 inner join project p on p.proj_id = project_id 
 where project_id is not null and pr.product_id = pp.id  FOR XML PATH ('')) , 1, 1, '' ),'</a>',''),'<a>','' ) ) as projects 
,
CONFIGURED_IN_QUARTERLY = (select  case when count(*) >0 then 'yes' else 'no' end from CSS_BATCH_CUSTOMERS where   batch_id = (select max(id) from css_batches)  and EMAIL_ID = pr.emp_id   ),
pp.cust_id
from portfolio_products pp
inner join product_responsible pr on pr.product_id = pp.id and pr.management_type = 8 and pr.isactive =1
inner join product_responsible_management_type pmt on pr.management_type = pmt.id
inner join contacts c on c.CONTACT_EMAILID = pr.emp_id and c.isactive =1
inner join customer cu on cu.cust_id = pp.cust_id
where pp.isactive =1 and (isnull( @CustomerID ,'0')='0'  or  pp.CUST_ID = @CustomerID)
go


insert into reports_sp_details values
('getHalfyearlyCSATCustomerList', 'List of Half Yearly CSAT Customers', 'BAS')
 
 
 insert into REPORTS_PARAMS
 select @@IDENTITY,  'CustomerID','CUSTOMERID', 0  

 alter table project_issue add TITLE varchar(200) null