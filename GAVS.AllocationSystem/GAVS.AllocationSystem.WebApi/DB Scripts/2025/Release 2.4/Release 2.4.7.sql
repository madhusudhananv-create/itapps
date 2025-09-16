
----From 04/09/2025----
 if Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='css_batch_customers' and COLUMN_NAME='cust_id' and(DATA_TYPE <> 'varchar(50)'))
BEGIN
 alter table css_batch_customers alter column cust_id varchar(50) not null
END
if Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='css_batch_customers' and COLUMN_NAME='proj_id' and(DATA_TYPE <> 'varchar(50)'))
BEGIN
 alter table css_batch_customers alter column proj_id varchar(50)   null
END
if Exists(select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='customer_projects' and COLUMN_NAME='proj_id' and(DATA_TYPE <> 'varchar(50)'))
BEGIN
    alter table customer_projects alter column proj_id varchar(50) null
END

If  exists (select 1 from configuration_ext WHERE [KEY]='CSS_QUESTION_MODEL_HALFYEARLY_ACCOUNT')   
BEGIN
insert into configuration_ext values
('CSS_QUESTION_MODEL_HALFYEARLY_ACCOUNT', 12, -1, null, null, 0, 1, null, null, null, '102802', getdate(), '102802', getdate())
END

update task set STATUS = 'COMPLETED' where ID=4807
